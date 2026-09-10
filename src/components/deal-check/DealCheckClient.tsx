/* eslint-disable i18next/no-literal-string -- English-only tool copy, matching the valuation page pattern */
"use client";

import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, RotateCcw, X } from "lucide-react";
import DealCheckForm, { type DealCheckSubmission } from "./DealCheckForm";
import DealCheckReportView from "./DealCheckReport";
import { useHoneypot } from "@/components/Honeypot";
import { trackLead } from "@/lib/gtag";
import type { DealCheckReport } from "@/lib/deal-check/types";

type Step = "form" | "running" | "result";

const STAGES = [
  { key: "started", label: "Reading what you sent" },
  { key: "parsing", label: "Pulling out the details" },
  { key: "comparing", label: "Finding comparable sales" },
  { key: "costing", label: "Working out the numbers" },
];

interface FinalPayload {
  report: DealCheckReport;
  marketingClaims: string[];
}

export default function DealCheckClient() {
  const [step, setStep] = useState<Step>("form");
  const [stage, setStage] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FinalPayload | null>(null);
  const [showLead, setShowLead] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const run = useCallback(async (submission: DealCheckSubmission) => {
    setStep("running");
    setStage(0);
    setError(null);
    setResult(null);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/deal-check/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submission),
        signal: controller.signal,
      });

      if (res.status === 429) {
        const j = await res.json().catch(() => ({}));
        setError(j.error ?? "Too many checks in a row. Try again in a few minutes.");
        setStep("form");
        return;
      }

      if (!res.ok || !res.body) {
        setError("Something went wrong running the check. Please try again.");
        setStep("form");
        return;
      }

      // NDJSON: one JSON object per line, with a partial line retained in the
      // buffer between reads.
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          let evt: { event: string; data?: unknown; error?: string };
          try {
            evt = JSON.parse(trimmed);
          } catch {
            continue;
          }

          const idx = STAGES.findIndex((s) => s.key === evt.event);
          if (idx >= 0) setStage(idx);

          if (evt.event === "error") {
            setError(evt.error ?? "Something went wrong.");
            setStep("form");
            return;
          }

          if (evt.event === "final") {
            const payload = evt.data as FinalPayload;
            setResult(payload);
            setStep("result");
            requestAnimationFrame(() =>
              window.scrollTo({ top: 0, behavior: "smooth" }),
            );
            return;
          }
        }
      }

      // Stream ended without a final event.
      setError("The check didn't finish. Please try again.");
      setStep("form");
    } catch (e) {
      if ((e as Error)?.name === "AbortError") return;
      setError("We couldn't complete the check. Please try again.");
      setStep("form");
    } finally {
      abortRef.current = null;
    }
  }, []);

  const reset = () => {
    abortRef.current?.abort();
    setStep("form");
    setResult(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      {step === "form" && (
        <>
          {error && (
            <div role="alert" className="rounded-xl bg-red-50 border border-red-200 px-4 py-3">
              <p className="text-sm text-[#b42318]">{error}</p>
            </div>
          )}
          <DealCheckForm onSubmit={run} busy={false} />
        </>
      )}

      {step === "running" && (
        <div className="rounded-2xl border border-border/50 bg-card p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Loader2 className="w-5 h-5 animate-spin text-accent" aria-hidden />
            <p className="text-sm font-medium text-foreground">Checking the deal…</p>
          </div>
          <ul className="space-y-3" aria-live="polite">
            {STAGES.map((s, i) => (
              <li key={s.key} className="flex items-center gap-3">
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    i <= stage ? "bg-accent" : "bg-border"
                  }`}
                />
                <span
                  className={`text-sm ${i <= stage ? "text-foreground" : "text-muted-foreground/50"}`}
                >
                  {s.label}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-xs text-muted-foreground">
            This usually takes 15–30 seconds. We&apos;re reading your source, then matching it against
            sales registered with the Dubai Land Department.
          </p>
        </div>
      )}

      {step === "result" && result && (
        <>
          <div className="flex justify-end">
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden />
              Check another property
            </button>
          </div>
          <DealCheckReportView
            report={result.report}
            marketingClaims={result.marketingClaims ?? []}
            onRequestReview={() => setShowLead(true)}
          />
        </>
      )}

      <AnimatePresence>
        {showLead && result && (
          <LeadModal report={result.report} onClose={() => setShowLead(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Second-opinion request. Deliberately post-report and optional — the analysis
 * is never gated behind this.
 */
function LeadModal({ report, onClose }: { report: DealCheckReport; onClose: () => void }) {
  const { value: hp, field: hpField } = useHoneypot();
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setErr(null);

    try {
      const res = await fetch("/api/deal-check/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          hp,
          pageUrl: typeof window !== "undefined" ? window.location.href : undefined,
          deal: {
            price: report.input.price,
            community: report.input.community,
            bedrooms: report.input.bedrooms,
            areaSqft: report.input.areaSqft,
            propertyKind: report.input.propertyKind,
            purchaseType: report.input.purchaseType,
            sourceUrl: report.input.sourceUrl,
            priceVerdict: report.price.verdict,
            deltaPct: report.price.deltaPct,
            netYieldPct: report.rental.netYieldPct,
          },
        }),
      });

      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(j.error ?? "Something went wrong. Please try again.");
        return;
      }

      trackLead({ source: "deal-check" });
      setSent(true);
    } catch {
      setErr("Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const input =
    "w-full bg-background border border-border/80 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/40 transition-all";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Request a second opinion"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl bg-card border border-border/50 shadow-xl p-6 sm:p-7"
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <h3 className="text-lg font-semibold text-foreground">
            {sent ? "We'll be in touch" : "Ask for a second opinion"}
          </h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-1 -m-1 rounded"
            aria-label="Close"
          >
            <X className="w-4 h-4" aria-hidden />
          </button>
        </div>

        {sent ? (
          <>
            <p className="text-sm text-muted-foreground mb-5">
              One of our agents will call you to go through the assessment — including the parts we
              flagged as unverified. Your report is still on screen behind this.
            </p>
            <button
              onClick={onClose}
              className="w-full rounded-xl px-6 py-3 text-sm font-semibold text-white"
              style={{ background: "linear-gradient(to bottom, #D4A847, #B8922F)" }}
            >
              Back to the report
            </button>
          </>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <p className="text-sm text-muted-foreground mb-4">
              We&apos;ll go through the numbers with you and tell you what we&apos;d ask the seller.
            </p>
            {hpField}
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Your name"
              className={input}
              autoComplete="name"
            />
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="Email"
              className={input}
              autoComplete="email"
            />
            <input
              required
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="Phone"
              className={input}
              autoComplete="tel"
            />

            {err && (
              <p role="alert" className="text-sm text-[#b42318]">
                {err}
              </p>
            )}

            <button
              type="submit"
              disabled={sending}
              className="w-full flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white disabled:opacity-60"
              style={{ background: "linear-gradient(to bottom, #D4A847, #B8922F)" }}
            >
              {sending && <Loader2 className="w-4 h-4 animate-spin" aria-hidden />}
              {sending ? "Sending…" : "Request a call back"}
            </button>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
}
