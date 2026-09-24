/* eslint-disable i18next/no-literal-string -- English-only promotional campaign, matching src/app/[locale]/offers */
"use client";

import { useEffect, useRef, useState } from "react";
import { getAttribution } from "@/lib/attribution";
import { readGeoCountryCookie } from "@/lib/country-codes";
import { Link, usePathname } from "@/navigation";
import { X, Mail, Phone, ArrowRight, Lock, CheckCircle2 } from "lucide-react";
import { apiUrl } from "@/lib/api";
import { trackLead } from "@/lib/gtag";
import { useHoneypot } from "@/components/Honeypot";

/**
 * Campaign pop-up for the Danube 20:70 payment-plan offer (10% waiver),
 * confirmed live at /offers/danube-20-70-payment-plan-10-waiver.
 *
 * Trigger, frequency-capping and lead plumbing mirror SobhaOfferPopup — same
 * apex-scoped cookie pattern, same honeypot, same /api/inquiries payload —
 * so leads land in the existing pipeline untouched.
 *
 * Geo-gated: shown only to visitors the middleware's BINAYAH_GEO cookie
 * (Vercel's x-vercel-ip-country) marks as India or an African country. A
 * missing cookie (dev, or Vercel geo not populated) suppresses rather than
 * shows — this is a targeted campaign, not a fallback-to-everyone one.
 *
 * Like Sobha's, this promotes a dated offer and stops showing itself once
 * OFFER_ENDS passes.
 */
const COOKIE_KEY = "binayah_danube_2070_popup";
const H = 60 * 60;
const MAXAGE = { seen: 24 * H, dismissed: 48 * H, done: 365 * 24 * H } as const;

/** Hard stop: the offer's own deadline (Gulf time), matching the live offer
 *  page's `deadline` field exactly. Exported so CampaignPopup's switch uses
 *  the same instant. */
export const OFFER_ENDS = new Date("2026-09-27T23:59:59+04:00");
const DEADLINE_LABEL = "27 September";

const AFRICA_ISO = new Set([
  "DZ", "AO", "BJ", "BW", "BF", "BI", "CV", "CM", "CF", "TD", "KM", "CG", "CD", "CI", "DJ", "EG",
  "GQ", "ER", "SZ", "ET", "GA", "GM", "GH", "GN", "GW", "KE", "LS", "LR", "LY", "MG", "MW", "ML",
  "MR", "MU", "YT", "MA", "MZ", "NA", "NE", "NG", "RE", "RW", "SH", "ST", "SN", "SC", "SL", "SO",
  "ZA", "SS", "SD", "TZ", "TG", "TN", "UG", "EH", "ZM", "ZW",
]);
/** Target geos for this campaign: India plus the African continent. Exported
 *  so CampaignPopup can decide whether to route to this pop-up at all. */
export function isTargetGeo(iso: string): boolean {
  return iso === "IN" || AFRICA_ISO.has(iso);
}

const PANEL_IMAGE =
  "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/danube-20-70-payment-plan-10-waiver/hero.webp";
const OFFER_URL = "/offers/danube-20-70-payment-plan-10-waiver";
const OFFER_NAME = "Danube 20:70 Payment Plan";

const SHOW_AFTER_MS = 8000;
const SCROLL_TRIGGER = 0.35;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** Loose E.164 sanity check: enough digits to dial, no more than the standard allows. */
const phoneValid = (v: string) => {
  const digits = v.replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 15;
};

/** Campaign palette: Danube's teal/navy, distinct from Sobha's gold so the
 *  two campaigns never look interchangeable if they ever overlap. */
const TEAL = "#0E7C7B";
const TEAL_DEEP = "#0A5958";
const INK = "#16211f";
const MUTED = "#5f6b69";
const LINE = "#e1e8e7";
const CREAM = "#f4faf9";

function normalizePhone(input: string): string {
  const digits = input.replace(/\D/g, "");
  return digits ? `+${digits}` : "";
}

// Same exclusions as the other campaign pop-ups, plus the offer page this
// points at — showing it there would overlay the very form it is trying to reach.
const SUPPRESS = [
  /\/admin(\/|$)/,
  /\/privacy/,
  /\/terms/,
  /\/cookie/,
  /\/legal/,
  /\/list-your-property/,
  /\/contact/,
  /\/offers(\/|$)/,
];

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

/** `forceOpen` renders it immediately, bypassing cookie + timing + geo, and
 *  `panelImage` swaps the left-hand visual. Both are preview-harness only. */
export default function DanubeOfferPopup({
  forceOpen = false,
  panelImage = PANEL_IMAGE,
}: {
  forceOpen?: boolean;
  panelImage?: string;
}) {
  const pathname = usePathname();
  const [visible, setVisible] = useState(forceOpen);
  const [inGeo, setInGeo] = useState(forceOpen);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<null | "email" | "phone" | "send">(null);
  const { value: hp, field: honeypotField } = useHoneypot();
  const armedRef = useRef(false);
  // Synchronous re-entrancy guard for handleSubmit — see SobhaOfferPopup for
  // why `sending` state alone lets duplicate requestSubmit() calls through.
  const submittingRef = useRef(false);

  const expired = Date.now() > OFFER_ENDS.getTime();
  const suppressed = expired || SUPPRESS.some((re) => re.test(pathname || ""));

  useEffect(() => {
    if (forceOpen) return;
    setInGeo(isTargetGeo(readGeoCountryCookie()));
  }, [forceOpen]);

  useEffect(() => {
    if (forceOpen || suppressed || !inGeo || armedRef.current) return;
    if (readCookie()) return;

    const show = () => {
      if (armedRef.current) return;
      armedRef.current = true;
      writeCookie("seen");
      setVisible(true);
      window.removeEventListener("scroll", onScroll);
    };
    const onScroll = () => {
      const scrolled =
        window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      if (scrolled >= SCROLL_TRIGGER) show();
    };

    // Warm the panel image while the dwell timer runs — see SobhaOfferPopup
    // for why this needs to fire before the pop-up mounts.
    const warm = new Image();
    warm.src = panelImage;

    const timer = setTimeout(show, SHOW_AFTER_MS);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, [suppressed, inGeo, forceOpen, panelImage]);

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
    if (!sent) writeCookie("dismissed");
    setVisible(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingRef.current) return;
    submittingRef.current = true;
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
          ...getAttribution(),
          hp,
          pageTitle: typeof document !== "undefined" ? document.title : "",
          pageUrl: typeof window !== "undefined" ? window.location.href : "",
          name: "Danube 20:70 enquiry",
          email: email.trim(),
          phone: phone.trim(),
          type: "offer-inquiry",
          source: "danube-2070-popup",
          message: `Requested eligible units for the ${OFFER_NAME} via the site pop-up.`,
          projectName: OFFER_NAME,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      writeCookie("done");
      setSent(true);
      trackLead({ source: "danube-2070-popup" });
    } catch {
      setError("send");
    } finally {
      setSending(false);
      submittingRef.current = false;
    }
  };

  if (!visible) return null;

  const inputClass =
    "w-full rounded-[3px] border bg-white py-3 pl-10 pr-3.5 text-[14px] outline-none transition-all";
  const inputStyle = { borderColor: LINE, color: INK } as const;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300"
      style={{ background: "rgba(22,33,31,0.52)", backdropFilter: "blur(3px)" }}
      onClick={dismiss}
      role="dialog"
      aria-modal="true"
      aria-labelledby="danube-popup-title"
    >
      <div
        className="relative grid w-full max-w-[660px] grid-cols-1 overflow-hidden rounded-[4px] bg-white shadow-2xl animate-in slide-in-from-bottom-4 md:zoom-in-95 duration-300 md:grid-cols-[1fr_1.2fr]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          aria-label="Close"
          onClick={dismiss}
          className="absolute right-3.5 top-3.5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/[0.08] transition-colors hover:bg-black/[0.16]"
          style={{ color: INK }}
        >
          <X className="h-[15px] w-[15px]" strokeWidth={2.2} />
        </button>

        {/* Left: the offer, stated over the hero image */}
        <div
          className="relative hidden flex-col justify-end overflow-hidden p-5 pb-6 md:flex"
          style={{
            backgroundColor: "#123634",
            backgroundImage: `url("${panelImage}")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0.34) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0.42) 62%, rgba(0,0,0,0.78) 100%)",
            }}
          />
          <span
            className="relative z-[1] self-start rounded-full px-2.5 py-[5px] text-[10px] font-bold uppercase tracking-[0.16em] text-white"
            style={{ background: "rgba(14,124,123,0.32)", border: "1px solid rgba(255,255,255,0.42)" }}
          >
            Danube Properties
          </span>
          {/* The deferral is the hook, so 70% leads and the booking figure
              plays support. "Nothing in between" is the line that makes the
              structure land — it reads as the offer, not as a footnote. */}
          <div className="relative z-[1] mt-auto">
            <div className="flex items-baseline gap-1.5 text-white">
              <span style={{ fontSize: 44, lineHeight: 1, fontWeight: 800, letterSpacing: "-0.02em" }}>
                70%
              </span>
              <span className="text-[13px] font-bold uppercase tracking-[0.1em] text-white/90">
                on handover
              </span>
            </div>
            <div className="mt-2.5 text-[12px] font-bold uppercase leading-[1.5] tracking-[0.11em] text-white/90">
              20% booking
            </div>
            <div
              className="mt-1 text-[12px] font-bold uppercase leading-[1.5] tracking-[0.11em]"
              style={{ color: "#7fd4d2" }}
            >
              Nothing in between
            </div>
          </div>
        </div>

        {/* Right: capture */}
        <div className="flex flex-col px-7 py-7 md:px-8">
          {sent ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div
                className="mb-4 flex h-14 w-14 items-center justify-center rounded-full"
                style={{ background: "rgba(14,124,123,0.14)" }}
              >
                <CheckCircle2 className="h-7 w-7" style={{ color: TEAL_DEEP }} />
              </div>
              <h2 className="text-[21px] font-bold leading-tight" style={{ color: INK }}>
                We&rsquo;ll be in touch shortly.
              </h2>
              <p className="mt-2 text-[13px] leading-relaxed" style={{ color: MUTED }}>
                An advisor will send you the eligible Danube units and confirm the payment terms.
              </p>
              <button
                onClick={() => setVisible(false)}
                className="mt-6 inline-flex items-center gap-2 rounded-full px-8 py-3 text-[12px] font-bold uppercase tracking-[0.18em] text-white"
                style={{ background: `linear-gradient(135deg, ${TEAL} 0%, ${TEAL_DEEP} 100%)` }}
              >
                Done
              </button>
            </div>
          ) : (
            <>
              <div className="text-[10px] font-bold uppercase tracking-[0.26em]" style={{ color: MUTED }}>
                Danube 20:70 Payment Plan
              </div>
              <div className="mt-2.5 h-[2px] w-[30px]" style={{ background: TEAL }} />

              <h2
                id="danube-popup-title"
                className="mt-3.5 text-[22px] font-bold leading-[1.2]"
                style={{ color: INK }}
              >
                Pay <span style={{ color: TEAL_DEEP }}>70%</span> only when you get the keys
              </h2>
              <p className="mt-2 text-[13px] leading-[1.55]" style={{ color: MUTED }}>
                10% now, 10% within 60 days, nothing during construction, and 70% due only on
                handover.
              </p>
              <p className="mt-1.5 text-[13px] font-bold leading-[1.55]" style={{ color: TEAL_DEEP }}>
                Plus a 10% waiver!
              </p>

              {/* the offer's own terms, matching the live offer page exactly */}
              <div
                className="mt-4 grid grid-cols-4 rounded-[3px] px-2 py-3"
                style={{ background: CREAM, border: `1px solid ${LINE}` }}
              >
                {[
                  ["To book", "20%"],
                  ["Build", "0%"],
                  ["Handover", "70%"],
                  ["Waiver", "10%"],
                ].map(([k, v], i) => (
                  <div
                    key={k}
                    className={i > 0 ? "pl-1.5 pr-0.5" : "pr-1"}
                    style={i > 0 ? { borderLeft: `1px solid ${LINE}` } : undefined}
                  >
                    <div
                      className="text-[8.5px] font-bold uppercase leading-[1.3] tracking-[0.05em]"
                      style={{ color: MUTED, minHeight: "22px" }}
                    >
                      {k}
                    </div>
                    <div className="mt-0.5 whitespace-nowrap text-[13px] font-bold leading-tight" style={{ color: INK }}>
                      {v}
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="mt-4">
                {honeypotField}
                <div className="relative">
                  <Mail
                    className="pointer-events-none absolute left-[13px] top-1/2 h-4 w-4 -translate-y-1/2"
                    style={{ color: MUTED }}
                    strokeWidth={2}
                  />
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    aria-label="Email address"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(null); }}
                    placeholder="Your email address"
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>

                <div className="relative mt-2.5">
                  <Phone
                    className="pointer-events-none absolute left-[13px] top-1/2 h-4 w-4 -translate-y-1/2"
                    style={{ color: MUTED }}
                    strokeWidth={2}
                  />
                  <input
                    type="tel"
                    required
                    inputMode="tel"
                    autoComplete="tel"
                    aria-label="Phone number"
                    value={phone}
                    onChange={(e) => { setPhone(normalizePhone(e.target.value)); setError(null); }}
                    placeholder="Phone number"
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>

                {error && (
                  <p className="mt-2 text-[12px] font-medium text-[#E53E3E]" role="alert">
                    {error === "phone"
                      ? "Please enter a valid phone number."
                      : error === "email"
                        ? "Please enter a valid email address."
                        : "Something went wrong. Please try again."}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={sending}
                  className="mt-3.5 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-[14px] text-[12px] font-bold uppercase tracking-[0.2em] text-white transition-all hover:brightness-[1.05] disabled:opacity-70"
                  style={{
                    background: `linear-gradient(135deg, ${TEAL} 0%, ${TEAL_DEEP} 100%)`,
                    boxShadow: "0 4px 14px rgba(14,124,123,0.34)",
                  }}
                >
                  {sending ? (
                    <span
                      className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"
                      style={{ borderColor: "#fff transparent #fff #fff" }}
                    />
                  ) : (
                    <>
                      Check Eligible Units
                      <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
                    </>
                  )}
                </button>

                <p
                  className="mt-2.5 text-center text-[10px] font-bold uppercase tracking-[0.16em]"
                  style={{ color: TEAL_DEEP }}
                >
                  Offer valid until {DEADLINE_LABEL}
                </p>

                <p
                  className="mt-3 flex items-start gap-[7px] text-[11px] leading-[1.5]"
                  style={{ color: MUTED }}
                >
                  <Lock className="mt-px h-[13px] w-[13px] flex-none" style={{ color: TEAL_DEEP }} strokeWidth={2} />
                  <span>
                    Selected units only, subject to availability. We never share your details. Read our{" "}
                    <Link
                      href="/privacy"
                      className="font-semibold no-underline hover:underline"
                      style={{ color: TEAL_DEEP }}
                    >
                      privacy policy
                    </Link>
                    , or{" "}
                    <Link href={OFFER_URL} className="font-semibold no-underline hover:underline" style={{ color: TEAL_DEEP }}>
                      see the full offer
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
