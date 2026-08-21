/* eslint-disable i18next/no-literal-string -- English-only promotional campaign, matching src/app/[locale]/offers */
"use client";

import { useEffect, useRef, useState } from "react";
import { Link, usePathname } from "@/navigation";
import { X, Mail, Phone, ArrowRight, Lock, CheckCircle2 } from "lucide-react";
import { apiUrl } from "@/lib/api";
import { trackLead } from "@/lib/gtag";
import { useHoneypot } from "@/components/Honeypot";

/**
 * Campaign pop-up for the Sobha 20/80 payment plan.
 *
 * Trigger, frequency-capping and lead plumbing deliberately mirror
 * GuideDownloadPopup — same apex-scoped cookie pattern, same honeypot, same
 * /api/inquiries payload — so leads land in the existing pipeline untouched.
 * What differs is the styling: this follows the campaign email's palette
 * (gold gradient, Georgia figures, charcoal and cream) rather than the guide
 * pop-up's green, so the two are visibly the same offer.
 *
 * Unlike the guide, this promotes a dated offer, so it stops showing itself
 * once OFFER_ENDS passes — a pop-up advertising a closed offer is worse than
 * no pop-up.
 */
const COOKIE_KEY = "binayah_sobha_2080_popup";
const H = 60 * 60;
const MAXAGE = { seen: 24 * H, dismissed: 48 * H, done: 365 * 24 * H } as const;

/** Hard stop: the offer's own deadline (Gulf time). Exported so the campaign
 *  switch in CampaignPopup uses exactly the same instant. */
export const OFFER_ENDS = new Date("2026-08-24T00:00:00+04:00");
const DEADLINE_LABEL = "23 August";

const PANEL_IMAGE =
  "https://binayah-media-456051253184-us-east-1-an.s3.amazonaws.com/campaigns/sobha-20-80/popup-panel-2d8997b4.jpg";
const OFFER_URL = "/offers/sobha-20-80-payment-plan";
const OFFER_NAME = "Sobha 20/80 Payment Plan";

const SHOW_AFTER_MS = 8000;
const SCROLL_TRIGGER = 0.35;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** Loose E.164 sanity check: enough digits to dial, no more than the standard allows. */
const phoneValid = (v: string) => {
  const digits = v.replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 15;
};

/** Campaign palette, lifted from the campaign email so the two match. */
const GOLD = "#c9a769";
const GOLD_DEEP = "#8e6d27";
const INK = "#1c1a17";
const MUTED = "#747169";
const LINE = "#e3ded2";
const CREAM = "#faf8f3";
const SERIF = "Georgia, 'Times New Roman', serif";

function normalizePhone(input: string): string {
  const digits = input.replace(/\D/g, "");
  return digits ? `+${digits}` : "";
}

// Same exclusions as the guide pop-up, plus the offer page this points at —
// showing it there would overlay the very form it is trying to reach.
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

/** `forceOpen` renders it immediately, bypassing cookie + timing. Preview only. */
export default function SobhaOfferPopup({ forceOpen = false }: { forceOpen?: boolean }) {
  const pathname = usePathname();
  const [visible, setVisible] = useState(forceOpen);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<null | "email" | "phone" | "send">(null);
  const { value: hp, field: honeypotField } = useHoneypot();
  const armedRef = useRef(false);

  const expired = Date.now() > OFFER_ENDS.getTime();
  const suppressed = expired || SUPPRESS.some((re) => re.test(pathname || ""));

  useEffect(() => {
    if (forceOpen || suppressed || armedRef.current) return;
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

    // Warm the panel image while the dwell timer runs. It is a CSS
    // background-image on an element that does not exist until the pop-up
    // mounts, so without this the fetch only starts once the pop-up is already
    // on screen — measured at ~800ms of empty panel on production. Costs
    // nothing when the pop-up never opens: the request is only issued here,
    // after the suppression and cookie checks have passed.
    const warm = new Image();
    warm.src = PANEL_IMAGE;

    const timer = setTimeout(show, SHOW_AFTER_MS);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, [suppressed, forceOpen]);

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
          pageTitle: typeof document !== "undefined" ? document.title : "",
          pageUrl: typeof window !== "undefined" ? window.location.href : "",
          name: "Sobha 20/80 enquiry",
          email: email.trim(),
          phone: phone.trim(),
          type: "offer-inquiry",
          source: "sobha-2080-popup",
          message: `Requested eligible units for the ${OFFER_NAME} via the site pop-up.`,
          projectName: OFFER_NAME,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      writeCookie("done");
      setSent(true);
      trackLead({ source: "sobha-2080-popup" });
    } catch {
      setError("send");
    } finally {
      setSending(false);
    }
  };

  if (!visible) return null;

  const inputClass =
    "w-full rounded-[3px] border bg-white py-3 pl-10 pr-3.5 text-[14px] outline-none transition-all";
  const inputStyle = { borderColor: LINE, color: INK } as const;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300"
      style={{ background: "rgba(28,26,23,0.52)", backdropFilter: "blur(3px)" }}
      onClick={dismiss}
      role="dialog"
      aria-modal="true"
      aria-labelledby="sobha-popup-title"
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

        {/* Left: the project, with the offer stated over it */}
        <div
          className="relative hidden flex-col justify-end overflow-hidden p-5 md:flex"
          style={{
            backgroundColor: "#2b2a26",
            backgroundImage: `url("${PANEL_IMAGE}")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0.34) 0%, rgba(0,0,0,0) 34%, rgba(0,0,0,0.55) 100%)",
            }}
          />
          <span
            className="relative z-[1] self-start rounded-full px-2.5 py-[5px] text-[10px] font-bold uppercase tracking-[0.16em] text-white"
            style={{ background: "rgba(201,167,105,0.28)", border: "1px solid rgba(255,255,255,0.42)" }}
          >
            Sobha Realty
          </span>
          <div className="relative z-[1] mt-auto">
            <div
              className="text-white"
              style={{ fontFamily: SERIF, fontSize: 40, lineHeight: 1, letterSpacing: "0.04em" }}
            >
              20 / 80
            </div>
            <div className="mt-2 text-[11px] font-bold uppercase leading-[1.4] tracking-[0.13em] text-white/90">
              Pay 20% now
              <br />
              80% on handover
            </div>
          </div>
        </div>

        {/* Right: capture */}
        <div className="flex flex-col px-7 py-7 md:px-8">
          {sent ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div
                className="mb-4 flex h-14 w-14 items-center justify-center rounded-full"
                style={{ background: "rgba(201,167,105,0.16)" }}
              >
                <CheckCircle2 className="h-7 w-7" style={{ color: GOLD_DEEP }} />
              </div>
              <h2 style={{ fontFamily: SERIF, color: INK }} className="text-[21px] leading-tight">
                We&rsquo;ll be in touch shortly.
              </h2>
              <p className="mt-2 text-[13px] leading-relaxed" style={{ color: MUTED }}>
                An advisor will send you the eligible Sobha units and confirm the payment terms.
              </p>
              <button
                onClick={() => setVisible(false)}
                className="mt-6 inline-flex items-center gap-2 rounded-full px-8 py-3 text-[12px] font-bold uppercase tracking-[0.18em]"
                style={{
                  background: `linear-gradient(135deg, #f7e6b8 0%, #e2c584 50%, ${GOLD} 100%)`,
                  color: INK,
                }}
              >
                Done
              </button>
            </div>
          ) : (
            <>
              <div
                className="text-[10px] font-bold uppercase tracking-[0.26em]"
                style={{ color: MUTED }}
              >
                Sobha Payment Plan
              </div>
              <div className="mt-2.5 h-[2px] w-[30px]" style={{ background: GOLD }} />

              <h2
                id="sobha-popup-title"
                className="mt-3.5 text-[22px] leading-[1.2]"
                style={{ fontFamily: SERIF, color: INK }}
              >
                Reserve a Sobha home from{" "}
                <span style={{ color: GOLD_DEEP, fontWeight: 700 }}>AED&nbsp;36,000</span>
              </h2>
              <p className="mt-2 text-[13px] leading-[1.55]" style={{ color: MUTED }}>
                Two per cent today secures it. The balance of the 20% follows over three months, and
                the remaining 80% is only due on handover.
              </p>

              {/* the offer's own terms, as in the email */}
              {/* fixed 3-up: flex-wrap dropped the third item to its own line
                  once a label ran long */}
              <div
                className="mt-4 grid grid-cols-3 rounded-[3px] px-3 py-3"
                style={{ background: CREAM, border: `1px solid ${LINE}` }}
              >
                {[
                  ["From", "AED 1.8M"],
                  ["Before handover", "20%"],
                  ["DLD fee", "Waived"],
                ].map(([k, v], i) => (
                  <div
                    key={k}
                    className={i > 0 ? "pl-2 pr-0.5" : "pr-1.5"}
                    style={i > 0 ? { borderLeft: `1px solid ${LINE}` } : undefined}
                  >
                    {/* two lines reserved so a wrapping label cannot knock its
                        value off the baseline the other two sit on */}
                    <div
                      className="text-[9px] font-bold uppercase leading-[1.3] tracking-[0.07em]"
                      style={{ color: MUTED, minHeight: "24px" }}
                    >
                      {k}
                    </div>
                    <div className="mt-0.5 whitespace-nowrap text-[13px] leading-tight" style={{ fontFamily: SERIF, color: INK }}>
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
                  className="mt-3.5 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-[14px] text-[12px] font-bold uppercase tracking-[0.2em] transition-all hover:brightness-[1.03] disabled:opacity-70"
                  style={{
                    background: `linear-gradient(135deg, #f7e6b8 0%, #e2c584 50%, ${GOLD} 100%)`,
                    color: INK,
                    boxShadow: "0 4px 14px rgba(201,167,105,0.34)",
                  }}
                >
                  {sending ? (
                    <span
                      className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"
                      style={{ borderColor: `${INK} transparent ${INK} ${INK}` }}
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
                  style={{ color: GOLD_DEEP }}
                >
                  Offer valid until {DEADLINE_LABEL}
                </p>

                <p
                  className="mt-3 flex items-start gap-[7px] text-[11px] leading-[1.5]"
                  style={{ color: MUTED }}
                >
                  <Lock className="mt-px h-[13px] w-[13px] flex-none" style={{ color: GOLD_DEEP }} strokeWidth={2} />
                  <span>
                    Selected units only, subject to availability. We never share your details. Read our{" "}
                    <Link
                      href="/privacy"
                      className="font-semibold no-underline hover:underline"
                      style={{ color: GOLD_DEEP }}
                    >
                      privacy policy
                    </Link>
                    , or{" "}
                    <Link href={OFFER_URL} className="font-semibold no-underline hover:underline" style={{ color: GOLD_DEEP }}>
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
