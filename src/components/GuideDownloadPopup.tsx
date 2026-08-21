"use client";

import { useEffect, useRef, useState } from "react";
import { Link, usePathname } from "@/navigation";
import { X, Check, Mail, Phone, ArrowRight, Lock, CheckCircle2 } from "lucide-react";
import { apiUrl } from "@/lib/api";
import { useTranslations } from "next-intl";
import { trackLead } from "@/lib/gtag";
import { useHoneypot } from "@/components/Honeypot";

/**
 * Site-wide lead-magnet pop-up: offers the free Dubai Property Investment Guide PDF
 * in exchange for an email. Deliberately un-annoying — armed by a short dwell OR an
 * early scroll, capped to once per day, backs off 48h after a dismiss, and never
 * returns once the visitor converts.
 *
 * Layout mirrors the approved design mockup (Binayah Email Capture Modal): a two-column
 * modal with a book-render visual on the left and the capture form on the right.
 * Frequency lives in a single apex-scoped cookie (shared across www ⇄ apex, like
 * CookieConsent) so the state follows the user across the site.
 */
const COOKIE_KEY = "binayah_guide_popup";
const H = 60 * 60; // one hour in seconds
const MAXAGE = { seen: 24 * H, dismissed: 48 * H, done: 365 * 24 * H } as const;

/** The lead magnet + its cover render. Same-origin under /public. */
const GUIDE_URL = "/assets/guides/dubai-investment-guide-2026.pdf";
const GUIDE_COVER = "/assets/guides/guide-cover.webp";
const GUIDE_NAME = "2026 Dubai Investment Guide";

const SHOW_AFTER_MS = 8000; // dwell trigger
const SCROLL_TRIGGER = 0.35; // or scroll past 35% of the page

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** Loose E.164 sanity check: enough digits to dial, no more than the standard allows. */
const phoneValid = (v: string) => {
  const digits = v.replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 15;
};

/** Normalise to E.164-ish: strip everything but digits and keep a single leading "+". */
function normalizePhone(input: string): string {
  const digits = input.replace(/\D/g, "");
  return digits ? `+${digits}` : "";
}

// Paths where a promo pop-up would be intrusive or redundant.
// /offers pages carry their own lead form and a countdown; a second overlay
// competes with that conversion and hides the form behind it.
const SUPPRESS = [/\/admin(\/|$)/, /\/privacy/, /\/terms/, /\/cookie/, /\/legal/, /\/list-your-property/, /\/contact/, /\/offers(\/|$)/];

function readCookie(): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp(`(?:^|;\\s*)${COOKIE_KEY}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : null;
}

function writeCookie(value: keyof typeof MAXAGE) {
  if (typeof document === "undefined") return;
  const host = window.location.hostname;
  const apex = host.match(/(?:^|\.)([^.]+\.[a-z]{2,})$/i);
  const isLocal = host === "localhost" || /^127\./.test(host) || host.endsWith(".local");
  const domainAttr = !isLocal && apex ? `; Domain=.${apex[1]}` : "";
  document.cookie =
    `${COOKIE_KEY}=${value};` +
    ` Max-Age=${MAXAGE[value]};` +
    ` Path=/;` +
    ` SameSite=Lax${domainAttr}${window.location.protocol === "https:" ? "; Secure" : ""}`;
}

export default function GuideDownloadPopup() {
  const t = useTranslations("guidePopup");
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<null | "email" | "phone" | "send">(null);
  const { value: hp, field: honeypotField } = useHoneypot();
  const armedRef = useRef(false); // in-memory guard for cookie-less browsers / this page load

  const suppressed = SUPPRESS.some((re) => re.test(pathname || ""));

  // Arm the trigger (dwell timer OR early scroll), unless already seen/dismissed/done.
  useEffect(() => {
    if (suppressed || armedRef.current) return;
    if (readCookie()) return; // seen (24h) / dismissed (48h) / done (1y) all suppress

    const show = () => {
      if (armedRef.current) return;
      armedRef.current = true;
      writeCookie("seen"); // cap to once per 24h even if ignored + navigated
      setVisible(true);
      window.removeEventListener("scroll", onScroll);
    };
    const onScroll = () => {
      const scrolled = window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      if (scrolled >= SCROLL_TRIGGER) show();
    };

    const timer = setTimeout(show, SHOW_AFTER_MS);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, [suppressed]);

  // Escape to close + lock body scroll while open.
  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const dismiss = () => {
    if (!sent) writeCookie("dismissed"); // 48h back-off; a converted user already has "done"
    setVisible(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!EMAIL_RE.test(email)) {
      setError("email");
      return;
    }
    if (!phoneValid(phone)) {
      setError("phone");
      return;
    }
    setSending(true);
    setError(null);
    try {
      const res = await fetch(apiUrl("/api/inquiries"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hp,
          name: "Guide download",
          email: email.trim(),
          phone: phone.trim(),
          type: "guide-download",
          source: "guide-popup",
          message: `Requested the free ${GUIDE_NAME} via the site pop-up.`,
          brochureUrl: GUIDE_URL.startsWith("http") ? GUIDE_URL : `${window.location.origin}${GUIDE_URL}`,
          projectName: GUIDE_NAME,
          assetLabel: "Guide",
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      writeCookie("done"); // never show again
      setSent(true);
      trackLead({ source: "guide-popup" });
    } catch {
      setError("send");
    } finally {
      setSending(false);
    }
  };

  if (!visible) return null;

  const perks = [t("perk1"), t("perk2"), t("perk3")];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300"
      style={{ background: "rgba(11,61,46,0.40)", backdropFilter: "blur(3px)" }}
      onClick={dismiss}
      role="dialog"
      aria-modal="true"
      aria-labelledby="ecm-title"
    >
      <div
        className="relative w-full max-w-[640px] overflow-hidden rounded-[14px] bg-white shadow-2xl grid grid-cols-1 md:grid-cols-[1fr_1.15fr] animate-in slide-in-from-bottom-4 md:zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          aria-label={t("closeAria")}
          onClick={dismiss}
          className="absolute top-3.5 right-3.5 z-[10] flex h-8 w-8 items-center justify-center rounded-full bg-black/[0.06] text-[#0E1C22]/55 transition-colors hover:bg-black/[0.12] hover:text-[#0E1C22]"
        >
          <X className="h-[15px] w-[15px]" strokeWidth={2.2} />
        </button>

        {/* Left: guide book render */}
        <div
          className="relative hidden flex-col justify-end overflow-hidden p-[22px] md:flex"
          style={{
            backgroundColor: "#0d2519",
            backgroundImage: `url("${GUIDE_COVER}")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <span
            className="relative z-[1] self-start rounded-full px-2.5 py-[5px] text-[10px] uppercase tracking-[0.14em]"
            style={{
              fontFamily: "var(--font-mono, ui-monospace, monospace)",
              color: "#E8D38A",
              background: "rgba(212,168,71,0.14)",
              border: "1px solid rgba(212,168,71,0.3)",
            }}
          >
            {t("tag")}
          </span>
        </div>

        {/* Right: form panel (or success) */}
        <div className="flex flex-col px-8 py-7">
          {sent ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle2 className="h-7 w-7 text-emerald-600" />
              </div>
              <h2 className="text-[20px] font-extrabold tracking-[-0.02em] text-[#0E1C22]">{t("successTitle")}</h2>
              <p className="mt-2 text-[13px] leading-relaxed text-[#6B7782]">{t("successBody")}</p>
              <button
                onClick={() => setVisible(false)}
                className="mt-6 inline-flex items-center gap-2 rounded-lg px-8 py-3 text-sm font-bold text-white shadow-lg"
                style={{ background: "linear-gradient(to right, #D4A847, #B8922F)" }}
              >
                {t("done")}
              </button>
            </div>
          ) : (
            <>
              <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#B8922F]">{t("eyebrow")}</div>
              <h2 id="ecm-title" className="mt-2 text-[23px] font-extrabold leading-[1.12] tracking-[-0.02em] text-[#0E1C22]">
                {t("title")}
              </h2>
              <p className="mt-2 text-[13px] leading-[1.5] text-[#6B7782]">{t("subtitle")}</p>

              <ul className="my-4 flex flex-col gap-[7px]">
                {perks.map((perk) => (
                  <li key={perk} className="flex items-center gap-[9px] text-[13px] font-medium text-[#0E1C22]">
                    <span
                      className="flex h-[18px] w-[18px] flex-none items-center justify-center rounded-full"
                      style={{ background: "rgba(26,122,90,0.12)", color: "#1A7A5A" }}
                    >
                      <Check className="h-[11px] w-[11px]" strokeWidth={3} />
                    </span>
                    {perk}
                  </li>
                ))}
              </ul>

              <form onSubmit={handleSubmit}>
                {honeypotField}
                <div>
                  <label htmlFor="ecm-email" className="mb-1.5 block text-[12px] font-semibold text-[#0E1C22]">
                    {t("emailLabel")}
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-[13px] top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7782]" strokeWidth={2} />
                    <input
                      id="ecm-email"
                      type="email"
                      required
                      autoFocus
                      autoComplete="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(null); }}
                      placeholder={t("emailPlaceholder")}
                      className="w-full rounded-lg border border-[#E4DFDA] bg-white py-3 pl-10 pr-3.5 text-[14px] text-[#0E1C22] outline-none transition-all placeholder:text-[#6B7782] focus:border-[#1A7A5A] focus:ring-[3px] focus:ring-[#1A7A5A]/[0.12]"
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <label htmlFor="ecm-phone" className="mb-1.5 block text-[12px] font-semibold text-[#0E1C22]">
                    {t("phoneLabel")}
                  </label>
                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-[13px] top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7782]" strokeWidth={2} />
                    <input
                      id="ecm-phone"
                      type="tel"
                      required
                      inputMode="tel"
                      autoComplete="tel"
                      value={phone}
                      onChange={(e) => { setPhone(normalizePhone(e.target.value)); setError(null); }}
                      placeholder={t("phonePlaceholder")}
                      className="w-full rounded-lg border border-[#E4DFDA] bg-white py-3 pl-10 pr-3.5 text-[14px] text-[#0E1C22] outline-none transition-all placeholder:text-[#6B7782] focus:border-[#1A7A5A] focus:ring-[3px] focus:ring-[#1A7A5A]/[0.12]"
                    />
                  </div>
                </div>

                {error && (
                  <p className="mt-2 text-[12px] font-medium text-[#E53E3E]" role="alert">
                    {t(error === "phone" ? "errorPhone" : "error")}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={sending}
                  className="mt-3.5 inline-flex w-full items-center justify-center gap-2 rounded-lg px-5 py-[13px] text-[15px] font-bold text-white transition-all hover:brightness-105 disabled:opacity-70"
                  style={{ background: "linear-gradient(to right, #D4A847, #B8922F)", boxShadow: "0 4px 15px rgba(212,168,71,0.3)" }}
                >
                  {sending ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : (
                    <>
                      {t("submit")}
                      <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
                    </>
                  )}
                </button>

                <p className="mt-3.5 flex items-start gap-[7px] text-[11px] leading-[1.5] text-[#6B7782]">
                  <Lock className="mt-px h-[13px] w-[13px] flex-none text-[#1A7A5A]" strokeWidth={2} />
                  <span>
                    {t("fineprint")}{" "}
                    <Link href="/privacy" className="font-semibold text-[#1A7A5A] no-underline hover:underline">
                      {t("privacy")}
                    </Link>
                    .
                  </span>
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
