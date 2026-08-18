"use client";

/* eslint-disable i18next/no-literal-string -- English-only offer pages */

import { useState } from "react";
import { CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import { useHoneypot } from "@/components/Honeypot";
import { apiUrl } from "@/lib/api";
import { trackLead } from "@/lib/gtag";

interface Props {
  /** Offer slug — lands in the inquiry `source` so leads are attributable. */
  offerSlug: string;
  offerName: string;
  /** Post-deadline copy shifts from "claim this" to "tell me about the next one". */
  expired?: boolean;
  heading?: string;
  subheading?: string;
}

const BUDGETS = [
  "AED 5M – 7M",
  "AED 7M – 10M",
  "AED 10M – 15M",
  "AED 15M+",
  "Not sure yet",
];

export default function OfferLeadForm({ offerSlug, offerName, expired = false, heading, subheading }: Props) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", countryCode: "+971", budget: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(false);
  const { value: hp, field: honeypotField } = useHoneypot();

  const source = expired ? `offer:${offerSlug}:waitlist` : `offer:${offerSlug}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError(false);
    try {
      const res = await fetch(apiUrl("/api/inquiries"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: `${form.countryCode} ${form.phone}`,
          type: "Off Plan",
          message: [
            expired ? `Waitlist — ${offerName}` : `Offer enquiry — ${offerName}`,
            form.budget ? `Budget: ${form.budget}` : "",
          ]
            .filter(Boolean)
            .join(" | "),
          hp,
          source,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setSent(true);
      trackLead({ source });
      setForm({ name: "", email: "", phone: "", countryCode: "+971", budget: "" });
    } catch {
      setError(true);
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="rounded-2xl border border-border/60 bg-card p-8 text-center">
        <CheckCircle2 className="mx-auto h-11 w-11" style={{ color: "#1A7A5A" }} />
        <h3 className="mt-4 text-xl font-bold text-foreground">
          {expired ? "You're on the list" : "Request received"}
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          {expired
            ? "We'll be in touch as soon as the next release opens."
            : "One of our advisors will confirm the qualifying units and send the full terms shortly."}
        </p>
      </div>
    );
  }

  const inputClass =
    "w-full rounded-xl border border-border/60 bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary/50";

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-border/60 bg-card p-6 sm:p-8 shadow-sm"
    >
      <h3 className="text-xl font-bold text-foreground">
        {heading ?? (expired ? "Get early access to the next offer" : "Check which units qualify")}
      </h3>
      <p className="mt-1.5 text-sm text-muted-foreground">
        {subheading ??
          (expired
            ? "Promotions like this move fast. We'll notify you before the next one goes live."
            : "Tell us your budget and we'll come back with the eligible homes and full written terms.")}
      </p>

      <div className="mt-5 space-y-3">
        <input
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Full name"
          autoComplete="name"
          className={inputClass}
        />
        <input
          required
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="Email address"
          autoComplete="email"
          className={inputClass}
        />
        <div className="flex gap-2">
          <input
            value={form.countryCode}
            onChange={(e) => setForm({ ...form, countryCode: e.target.value })}
            aria-label="Country code"
            // Fixed basis + no grow/shrink; the phone field takes the rest. Without
            // min-w-0 on the sibling, its default min-content width collapses the
            // input to ~34px inside this flex row.
            className={`${inputClass} w-[86px] shrink-0 grow-0`}
          />
          <input
            required
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="Phone number"
            autoComplete="tel"
            className={`${inputClass} min-w-0 flex-1`}
          />
        </div>
        <select
          value={form.budget}
          onChange={(e) => setForm({ ...form, budget: e.target.value })}
          aria-label="Budget"
          className={`${inputClass} ${form.budget ? "" : "text-muted-foreground/70"}`}
        >
          <option value="">Budget range (optional)</option>
          {BUDGETS.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
        {honeypotField}
      </div>

      <button
        type="submit"
        disabled={sending}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold text-white transition-transform hover:scale-[1.01] disabled:opacity-70"
        style={{ background: "linear-gradient(135deg, #D4A847, #B8922F)", color: "#0B3D2E" }}
      >
        {sending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Sending…
          </>
        ) : (
          <>
            {expired ? "Notify me" : "Request eligible units"} <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>

      {error && (
        <p className="mt-3 text-center text-sm" style={{ color: "#E53E3E" }}>
          Something went wrong. Please try again, or call us on +971 54 998 8811.
        </p>
      )}

      <p className="mt-3 text-center text-[11px] leading-relaxed text-muted-foreground">
        We&apos;ll only use your details to respond to this enquiry.
      </p>
    </form>
  );
}
