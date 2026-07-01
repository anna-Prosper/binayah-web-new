"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { X, Download, CheckCircle2, BookOpen } from "lucide-react";
import { apiUrl } from "@/lib/api";
import { useTranslations } from "next-intl";
import { trackLead } from "@/lib/gtag";

/**
 * Site-wide lead-magnet pop-up: offers a free downloadable PDF guide in exchange
 * for an email. Deliberately un-annoying — armed by a short dwell timer OR an early
 * scroll, capped to once per day, backs off 48h after a dismiss, and never returns
 * once the visitor converts.
 *
 * Frequency is stored in a single apex-scoped cookie (shared across www ⇄ apex and
 * subdomains, mirroring CookieConsent) so the state follows the user across the site.
 */
const COOKIE_KEY = "binayah_guide_popup";
const H = 60 * 60; // one hour in seconds
const MAXAGE = { seen: 24 * H, dismissed: 48 * H, done: 365 * 24 * H } as const;

/** The lead magnet. Drop the designed PDF at public/assets/guides/…; same-origin URL. */
const GUIDE_URL = "/assets/guides/dubai-investment-guide-2026.pdf";
const GUIDE_NAME = "2026 Dubai Investment Guide";

const SHOW_AFTER_MS = 8000; // dwell trigger
const SCROLL_TRIGGER = 0.35; // or scroll past 35% of the page

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Paths where a promo pop-up would be intrusive or redundant.
const SUPPRESS = [/\/admin(\/|$)/, /\/privacy/, /\/terms/, /\/cookie/, /\/legal/, /\/list-your-property/, /\/contact/];

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

function triggerDownload() {
  const a = document.createElement("a");
  a.href = GUIDE_URL;
  a.download = "";
  a.target = "_blank";
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export default function GuideDownloadPopup() {
  const t = useTranslations("guidePopup");
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(false);
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
      setError(true);
      return;
    }
    setSending(true);
    setError(false);
    try {
      const res = await fetch(apiUrl("/api/inquiries"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || "Guide download",
          email: email.trim(),
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
      triggerDownload();
    } catch {
      setError(true);
    } finally {
      setSending(false);
    }
  };

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={dismiss}
      role="dialog"
      aria-modal="true"
      aria-label={t("title")}
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-card shadow-2xl border border-border/60 overflow-hidden animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          aria-label={t("closeAria")}
          onClick={dismiss}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/10 hover:bg-black/20 text-white/80 hover:text-white flex items-center justify-center transition-colors z-10"
        >
          <X className="h-4 w-4" />
        </button>

        {sent ? (
          <div className="p-8 text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-7 w-7 text-emerald-600" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">{t("successTitle")}</h3>
            <p className="text-sm text-muted-foreground">{t("successBody")}</p>
            <button
              onClick={triggerDownload}
              className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold text-white"
              style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
            >
              <Download className="h-4 w-4" />
              {t("downloadNow")}
            </button>
          </div>
        ) : (
          <>
            <div className="p-5 sm:p-6 text-white" style={{ background: "linear-gradient(135deg, #D4A847, #B8922F)" }}>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-white/15 flex items-center justify-center">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] font-semibold opacity-80">{t("eyebrow")}</p>
                  <h3 className="text-lg sm:text-xl font-bold leading-tight">{t("title")}</h3>
                </div>
              </div>
              <p className="mt-3 text-xs sm:text-sm text-white/80">{t("subtitle")}</p>
            </div>

            <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-3">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-11 rounded-xl bg-muted/30 border border-border/50 px-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all"
                placeholder={t("namePlaceholder")}
              />
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 rounded-xl bg-muted/30 border border-border/50 px-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all"
                placeholder={t("emailPlaceholder")}
              />

              {error && (
                <p className="text-sm text-red-600 text-center" role="alert">
                  {t("error")}
                </p>
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
                    <Download className="h-4 w-4" />
                    {t("submit")}
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={dismiss}
                className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {t("dismiss")}
              </button>

              <p className="text-[10px] text-muted-foreground text-center leading-snug">{t("disclaimer")}</p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
