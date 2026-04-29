"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { X, Mail, Send, Check, Loader2 } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CalcSnapshot {
  community: string;
  budget: number;
  propType: string;
  purpose: string;
  financing: string;
  downPaymentPct: number;
  grossYield: number;
  netYield: number;
  annualRental: number;
  value5yr: number;
  roi5yr: number;
}

interface Props {
  calcSnapshot: CalcSnapshot;
  onClose: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function CalculatorEmailModal({ calcSnapshot, onClose }: Props) {
  const t = useTranslations("pulseCalculator");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const AED = (n: number) => {
    if (n >= 1_000_000) return `AED ${(n / 1_000_000).toFixed(2)}M`;
    if (n >= 1_000) return `AED ${(n / 1_000).toFixed(0)}K`;
    return `AED ${n.toLocaleString()}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/calculator/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, calc: calcSnapshot }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { message?: string }).message ?? t("emailErrorGeneric"));
      }

      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : t("emailErrorGeneric"));
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t("emailModalTitle")}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div className="bg-card border border-border/60 rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
          {/* Close */}
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-muted/60 transition-colors"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>

          {status === "success" ? (
            <div className="text-center py-6">
              <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-4">
                <Check className="h-7 w-7 text-emerald-600" />
              </div>
              <h3 className="font-bold text-foreground mb-1">{t("emailSuccessTitle")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("emailSuccessSub").replace("{email}", email)}
              </p>
              <button
                onClick={onClose}
                className="mt-5 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
                style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
              >
                {t("emailSuccessClose")}
              </button>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-base">{t("emailModalTitle")}</h3>
                  <p className="text-xs text-muted-foreground">{t("emailModalSub")}</p>
                </div>
              </div>

              {/* Snapshot summary */}
              <div className="bg-muted/30 rounded-xl p-3 mb-4 text-xs text-muted-foreground space-y-1">
                <p>
                  <span className="font-semibold text-foreground">{calcSnapshot.community}</span>
                  {" · "}
                  {AED(calcSnapshot.budget)}
                </p>
                <p>
                  {t("grossYield")}
                  {": "}
                  <span className="font-semibold text-foreground">{calcSnapshot.grossYield.toFixed(1)}{"% · "}</span>
                  {t("year5")}
                  {": "}
                  <span className="font-semibold text-foreground">{AED(calcSnapshot.value5yr)}</span>
                </p>
              </div>

              {/* Error */}
              {status === "error" && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-700">
                  {errorMsg}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    {t("emailFieldName")} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t("emailFieldNamePlaceholder")}
                    className="w-full px-3 py-2.5 rounded-xl bg-background border border-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    {t("emailFieldEmail")} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("emailFieldEmailPlaceholder")}
                    className="w-full px-3 py-2.5 rounded-xl bg-background border border-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    {t("emailFieldPhone")}
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t("emailFieldPhonePlaceholder")}
                    className="w-full px-3 py-2.5 rounded-xl bg-background border border-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-60 mt-2"
                  style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
                >
                  {status === "loading" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t("emailSending")}
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      {t("emailSendButton")}
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
}
