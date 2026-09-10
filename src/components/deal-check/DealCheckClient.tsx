"use client";

import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { Loader2, RotateCcw, X, Lock } from "lucide-react";
import DealCheckForm, { type DealCheckSubmission } from "./DealCheckForm";
import DealCheckReportView, { type Teaser, type Unlocked } from "./DealCheckReport";
import RentCheckReport, { type RentTeaser } from "./RentCheckReport";
import { useHoneypot } from "@/components/Honeypot";
import { trackLead } from "@/lib/gtag";
import type { DealQuestion } from "@/lib/deal-check/types";

type Step = "form" | "running" | "result";
type Mode = "purchase" | "rent";

const STAGE_KEYS = ["started", "parsing", "comparing", "costing"] as const;

interface FinalPayload {
  mode: Mode;
  reportId: string;
  teaser: Teaser | RentTeaser;
  marketingClaims?: string[];
}

export default function DealCheckClient() {
  const t = useTranslations("dealCheck");
  const [step, setStep] = useState<Step>("form");
  const [stage, setStage] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FinalPayload | null>(null);
  const [unlocked, setUnlocked] = useState<Unlocked | null>(null);
  const [rentQuestions, setRentQuestions] = useState<DealQuestion[] | null>(null);
  const [showGate, setShowGate] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const stages = [t("stage0"), t("stage1"), t("stage2"), t("stage3")];

  const run = useCallback(
    async (submission: DealCheckSubmission) => {
      setStep("running");
      setStage(0);
      setError(null);
      setResult(null);
      setUnlocked(null);
      setRentQuestions(null);

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
          setError(j.error ?? t("errRateLimit"));
          setStep("form");
          return;
        }
        if (!res.ok || !res.body) {
          setError(t("errGeneric"));
          setStep("form");
          return;
        }

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

            const idx = STAGE_KEYS.indexOf(evt.event as (typeof STAGE_KEYS)[number]);
            if (idx >= 0) setStage(idx);

            if (evt.event === "error") {
              setError(evt.error ?? t("errGeneric"));
              setStep("form");
              return;
            }

            if (evt.event === "final") {
              setResult(evt.data as FinalPayload);
              setStep("result");
              requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
              return;
            }
          }
        }

        setError(t("errIncomplete"));
        setStep("form");
      } catch (e) {
        if ((e as Error)?.name === "AbortError") return;
        setError(t("errGeneric"));
        setStep("form");
      } finally {
        abortRef.current = null;
      }
    },
    [t],
  );

  const reset = () => {
    abortRef.current?.abort();
    setStep("form");
    setResult(null);
    setUnlocked(null);
    setRentQuestions(null);
    setError(null);
  };

  const onUnlocked = (locked: unknown) => {
    if (!locked || !result) return;
    if (result.mode === "rent") {
      setRentQuestions((locked as { questions: DealQuestion[] }).questions ?? []);
    } else {
      setUnlocked(locked as Unlocked);
    }
    setShowGate(false);
  };

  return (
    <div className="space-y-5 sm:space-y-6">
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
        <div className="rounded-2xl border border-border/50 bg-card p-5 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-5 sm:mb-6">
            <Loader2 className="w-5 h-5 animate-spin text-accent" aria-hidden />
            <p className="text-sm font-medium text-foreground">{t("runningTitle")}</p>
          </div>
          <ul className="space-y-3" aria-live="polite">
            {stages.map((label, i) => (
              <li key={i} className="flex items-center gap-3">
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${i <= stage ? "bg-accent" : "bg-border"}`} />
                <span className={`text-sm ${i <= stage ? "text-foreground" : "text-muted-foreground/50"}`}>{label}</span>
              </li>
            ))}
          </ul>
          <p className="mt-5 sm:mt-6 text-xs text-muted-foreground">{t("runningHint")}</p>
        </div>
      )}

      {step === "result" && result && (
        <>
          <div className="flex justify-end">
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors py-1"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden />
              {t("checkAnother")}
            </button>
          </div>

          {result.mode === "rent" ? (
            <RentCheckReport
              teaser={result.teaser as RentTeaser}
              questions={rentQuestions}
              onUnlock={() => setShowGate(true)}
            />
          ) : (
            <DealCheckReportView
              teaser={result.teaser as Teaser}
              unlocked={unlocked}
              marketingClaims={result.marketingClaims ?? []}
              onUnlock={() => setShowGate(true)}
            />
          )}
        </>
      )}

      <AnimatePresence>
        {showGate && result && (
          <UnlockGate
            reportId={result.reportId}
            teaser={result.teaser}
            mode={result.mode}
            onClose={() => setShowGate(false)}
            onUnlocked={onUnlocked}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * The gate. Name and phone only — every extra field costs completions, and the
 * sales team follows up by phone. On success the server returns the locked half
 * of the report, which is the whole point: the visitor gets what they came for
 * immediately, not a promise of a callback.
 */
function UnlockGate({
  reportId,
  teaser,
  mode,
  onClose,
  onUnlocked,
}: {
  reportId: string;
  teaser: Teaser | RentTeaser;
  mode: Mode;
  onClose: () => void;
  onUnlocked: (locked: unknown) => void;
}) {
  const t = useTranslations("dealCheck");
  const { value: hp, field: hpField } = useHoneypot();
  const [form, setForm] = useState({ name: "", phone: "" });
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const input = teaser.input;
  const summary =
    mode === "rent"
      ? {
          community: input.community,
          bedrooms: input.bedrooms,
          areaSqft: input.areaSqft,
          propertyKind: input.propertyKind,
          purchaseType: "rent",
          sourceUrl: input.sourceUrl,
        }
      : {
          price: input.price,
          community: input.community,
          bedrooms: input.bedrooms,
          areaSqft: input.areaSqft,
          propertyKind: input.propertyKind,
          purchaseType: input.purchaseType,
          sourceUrl: input.sourceUrl,
          priceVerdict: (teaser as Teaser).price?.verdict,
          deltaPct: (teaser as Teaser).price?.deltaPct,
        };

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
          reportId,
          pageUrl: typeof window !== "undefined" ? window.location.href : undefined,
          deal: summary,
        }),
      });

      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(j.error ?? t("errGeneric"));
        return;
      }
      if (!j.locked) {
        setErr(t("unlockFailed"));
        return;
      }

      trackLead({ source: "deal-check" });
      onUnlocked(j.locked);
    } catch {
      setErr(t("errGeneric"));
    } finally {
      setSending(false);
    }
  };

  const inputCls =
    "w-full bg-background border border-border/80 rounded-xl px-4 py-3 text-base sm:text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/40 transition-all";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={t("unlockTitle")}
    >
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 1 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl bg-card border border-border/50 shadow-xl p-5 sm:p-7 max-h-[92vh] overflow-y-auto"
      >
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4 text-accent" aria-hidden />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-foreground">{t("unlockTitle")}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-1 -m-1 rounded shrink-0"
            aria-label={t("leadClose")}
          >
            <X className="w-4 h-4" aria-hidden />
          </button>
        </div>

        <p className="text-sm text-muted-foreground mb-5">{t("unlockIntro")}</p>

        <form onSubmit={submit} className="space-y-3">
          {hpField}
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder={t("leadName")}
            className={inputCls}
            autoComplete="name"
          />
          <input
            required
            type="tel"
            inputMode="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder={t("leadPhone")}
            className={inputCls}
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
            className="w-full flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold text-white disabled:opacity-60"
            style={{ background: "linear-gradient(to bottom, #D4A847, #B8922F)" }}
          >
            {sending && <Loader2 className="w-4 h-4 animate-spin" aria-hidden />}
            {sending ? t("leadSending") : t("unlockButton")}
          </button>
          <p className="text-xs text-center text-muted-foreground">{t("unlockNote")}</p>
        </form>
      </motion.div>
    </motion.div>
  );
}
