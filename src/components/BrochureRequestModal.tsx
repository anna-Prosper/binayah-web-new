"use client";

import { useEffect, useState } from "react";
import { X, FileText, Send, CheckCircle2 } from "lucide-react";
import { apiUrl } from "@/lib/api";
import { useTranslations } from "next-intl";
import CountryCodeSelect from "@/components/CountryCodeSelect";
import { dialFromIso, readGeoCountryCookie } from "@/lib/country-codes";
import { trackLead } from "@/lib/gtag";
import { useHoneypot } from "@/components/Honeypot";

interface Props {
  open: boolean;
  onClose: () => void;
  projectName: string;
  projectSlug: string;
  /** When provided, the brochure is emailed directly to the lead after form submission. */
  brochureUrl?: string;
}

export default function BrochureRequestModal({ open, onClose, projectName, projectSlug, brochureUrl }: Props) {
  const t = useTranslations("brochureRequest");
  const tc = useTranslations("common");
  const [form, setForm] = useState({ name: "", email: "", phone: "", countryCode: "+971" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(false);
  const { value: hp, field: honeypotField } = useHoneypot();

  const hasBrochure = !!brochureUrl;

  useEffect(() => {
    const dial = dialFromIso(readGeoCountryCookie());
    if (dial && dial !== "+971") {
      setForm((f) => (f.phone ? f : { ...f, countryCode: dial }));
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    // reset state on re-open
    setSent(false);
    setError(false);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError(false);
    try {
      const res = await fetch(apiUrl("/api/inquiries"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hp,
          name: form.name,
          email: form.email,
          phone: `${form.countryCode} ${form.phone}`,
          type: "brochure-request",
          message: t("autoMessage", { name: projectName }),
          source: `brochure-request:${projectSlug}`,
          ...(brochureUrl ? { brochureUrl, projectName } : {}),
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setSent(true);
      trackLead({ source: "brochure-request", project: projectSlug });
    } catch {
      setError(true);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl bg-card shadow-2xl border border-border/60 overflow-hidden">
        <button
          aria-label={t("closeAria")}
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-muted/50 hover:bg-muted text-foreground/60 hover:text-foreground flex items-center justify-center transition-colors z-10"
        >
          <X className="h-4 w-4" />
        </button>

        {sent ? (
          <div className="p-8 text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-7 w-7 text-emerald-600" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">{t("successTitle")}</h3>
            <p className="text-sm text-muted-foreground">
              {hasBrochure ? t("successBody", { name: projectName }) : t("successBodyNoFile", { name: projectName })}
            </p>
            <button
              onClick={onClose}
              className="mt-6 px-6 py-2.5 rounded-full text-sm font-semibold text-white"
              style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
            >
              {t("closeButton")}
            </button>
          </div>
        ) : (
          <>
            <div
              className="p-5 sm:p-6 text-white"
              style={{ background: "linear-gradient(135deg, #D4A847, #B8922F)" }}
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-white/15 flex items-center justify-center">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] font-semibold opacity-80">
                    {t("eyebrow")}
                  </p>
                  <h3 className="text-lg sm:text-xl font-bold leading-tight">
                    {t("title", { name: projectName })}
                  </h3>
                </div>
              </div>
              <p className="mt-3 text-xs sm:text-sm text-white/80">
                {hasBrochure ? t("subtitle") : t("subtitleNoFile")}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-3">
              {honeypotField}
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full h-11 rounded-xl bg-muted/30 border border-border/50 px-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all"
                placeholder={t("namePlaceholder")}
              />
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="w-full h-11 rounded-xl bg-muted/30 border border-border/50 px-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all"
                placeholder={t("emailPlaceholder")}
              />
              <div className="flex gap-2">
                <CountryCodeSelect
                  ariaLabel={t("countryCodeAria")}
                  value={form.countryCode}
                  onChange={(dial) => setForm((f) => ({ ...f, countryCode: dial }))}
                  className="h-11 rounded-xl bg-muted/30 border border-border/50 px-3 text-sm text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all max-w-[160px]"
                />
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  className="flex-1 h-11 rounded-xl bg-muted/30 border border-border/50 px-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all"
                  placeholder={t("phonePlaceholder")}
                />
              </div>

              {error && (
                <p className="text-sm text-red-600 text-center" role="alert">{tc("somethingWentWrong")}</p>
              )}
              <button
                type="submit"
                disabled={sending}
                className="w-full h-11 rounded-full text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-[0.98] transition-all disabled:opacity-70"
                style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
              >
                {sending ? (
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    {t("submitButton")}
                  </>
                )}
              </button>

              <p className="text-[10px] text-muted-foreground text-center leading-snug">
                {t("disclaimer")}
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
