/* eslint-disable i18next/no-literal-string -- section chrome; offer copy is
   translated per-locale in the document's `translations` map, not via messages */
/* eslint-disable @next/next/no-img-element -- verified real-estate CDN images */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Link } from "@/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BreadcrumbJsonLd, FAQJsonLd, OfferJsonLd } from "@/components/JsonLd";
import OfferCountdown from "@/components/offers/OfferCountdown";
import OfferLeadForm from "@/components/offers/OfferLeadForm";
import OfferGallery from "@/components/offers/OfferGallery";
import StickyOfferBar from "@/components/offers/StickyOfferBar";
import Reveal from "@/components/offers/Reveal";
import { isExpired, hasDeadline, computeEyebrow, DEFAULT_WINDOW_LABEL, DEFAULT_MASTERPLAN_HEADING } from "@/lib/offers";
import { loadOffer } from "@/lib/offers-data";
import { applyTranslation } from "@/lib/applyTranslation";
import { canonical as makeCanonical, altLangs, OG_LOCALE } from "@/lib/site";
import { getTranslations } from "next-intl/server";
import { getNonce } from "@/lib/nonce";
import { waHref } from "@/lib/whatsapp";
import {
  Clock, ShieldCheck, CheckCircle2, Phone, ArrowRight, Building2, Sparkles,
  Trees, TreePalm, Bike, Waves, Droplets, Flower2, Sun, Laptop, Users, PawPrint,
  ShoppingBasket, Store, Wallet, CalendarClock, BadgePercent, FileSignature,
  Repeat2, Ban, KeyRound, TrendingUp, Coins, Leaf,
} from "lucide-react";

// Offers are time-sensitive: revalidate hourly so an expiry flips over promptly
// without waiting for a redeploy.
export const revalidate = 3600;

type Props = { params: Promise<{ locale: string; slug: string }> };

// Same shape as the project route: prerender nothing at build, but returning []
// still opts the route into ISR rather than leaving it fully dynamic. An offer
// added to Mongo therefore gets its page on first request — no redeploy — and is
// then cached for the `revalidate` window above.
export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const offer = applyTranslation(await loadOffer(slug), locale);
  if (!offer) return { title: "Not Found" };
  const path = `/offers/${slug}`;
  return {
    title: offer.metaTitle,
    description: offer.metaDescription,
    keywords: offer.keywords,
    alternates: { canonical: makeCanonical(locale, path), languages: altLangs(path) },
    openGraph: {
      title: offer.metaTitle,
      description: offer.metaDescription,
      type: "article",
      url: makeCanonical(locale, path),
      locale: OG_LOCALE[locale] ?? "en_AE",
      images: [{ url: offer.heroImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: offer.metaTitle,
      description: offer.metaDescription,
      images: [offer.heroImage],
    },
  };
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

/** Icon names an offer can reference, resolved by name so the data stays plain
 *  JSON. Unknown names fall back to a check mark. */
const ICONS: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Trees, TreePalm, Bike, Waves, Droplets, Flower2, Sun, Laptop, Users, PawPrint,
  ShoppingBasket, Store, Wallet, CalendarClock, BadgePercent, FileSignature,
  Repeat2, Ban, KeyRound, Building2, Sparkles, CheckCircle2, TrendingUp, Coins, ShieldCheck, Leaf,
};

const GOLD = "#D4A847";
const GOLD_LT = "#EAC873";
const GOLD_DEEP = "#B8922F";
const GREEN = "#0B3D2E";
/** The one dark ground the homepage uses for every dark section (ServicesSection,
 *  WhatWeOffer). The offer page had three different bespoke gradients, which is
 *  what made its sections read as unrelated slabs. */
const DARK_SECTION = "linear-gradient(135deg, #0B3D2E, #1A7A5A)";
const GREEN_DK = "#072A20";

// Matches "AED 1.8 million", "AED 360,000", "20%", "5 million dirham", "20:80" —
// the standalone figures a reader's eye should catch first in a paragraph of
// offer copy. Offer text is authored in our own CMS, not user input, so
// bolding via split/rejoin is safe without a sanitizer.
const STAT_RE = /(AED\s[\d,.]+(?:\s?(?:million|billion))?|\d+(?:\.\d+)?%|\d+\s(?:million|billion)(?:\sdirham)?|20:80)/g;
function emphasizeStats(text: string): React.ReactNode {
  const parts = text.split(STAT_RE);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-bold text-foreground">
        {part}
      </strong>
    ) : (
      part
    ),
  );
}

/** Small gold-ruled eyebrow used to open every section. */
function Eyebrow({ children, onDark = false }: { children: React.ReactNode; onDark?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className="h-px w-8"
        style={{ background: `linear-gradient(90deg, ${onDark ? GOLD : GOLD_DEEP}, transparent)` }}
      />
      <span
        className="text-[11px] font-bold uppercase tracking-[0.22em]"
        style={{ color: onDark ? GOLD : GOLD_DEEP }}
      >
        {children}
      </span>
    </div>
  );
}

export default async function OfferPage({ params }: Props) {
  const { locale, slug } = await params;
  const offer = applyTranslation(await loadOffer(slug), locale);
  if (!offer) notFound();

  const nonce = await getNonce();
  const expired = isExpired(offer);
  // No published end date → show the label, but never a ticking clock.
  const showCountdown = !offer.hideDeadline && hasDeadline(offer);

  // CTA labels live on the offer so they translate; the template's own strings
  // would stay English on every localised page.
  const ctaLabel = offer.ctaLabel ?? "Check eligible units";
  const waLabel = offer.whatsappLabel ?? "Chat on WhatsApp";
  const waLink = waHref(
    offer.whatsappMessage ?? `Hi Binayah! 👋 I'd like to know more about the ${offer.shortName}.`,
    makeCanonical(locale, `/offers/${offer.slug}`),
  );
  const lp = locale === "en" ? "" : `/${locale}`;

  // Breadcrumb labels are chrome, not offer content, so they come from the
  // message catalogue rather than the Mongo document. Left in English they
  // showed as "Home / Offers" in every locale's rich result.
  const [tCrumb, tNav] = await Promise.all([
    getTranslations({ locale, namespace: "breadcrumbs" }),
    getTranslations({ locale, namespace: "nav" }),
  ]);
  const breadcrumbs = [
    { name: tCrumb("home"), href: `${lp}/` },
    { name: tNav("offers"), href: `${lp}/offers` },
    { name: offer.shortName, href: `${lp}/offers/${offer.slug}` },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <StickyOfferBar
        title={offer.h1}
        deadline={offer.deadline}
        expired={expired}
        hideDeadline={offer.hideDeadline}
        showCountdown={showCountdown}
      />
      <BreadcrumbJsonLd items={breadcrumbs} nonce={nonce} />
      <FAQJsonLd faqs={offer.faqs} nonce={nonce} inLanguage={locale} />
      <OfferJsonLd
        name={offer.h1}
        description={offer.metaDescription}
        url={`/offers/${offer.slug}`}
        image={offer.heroImage}
        seller={offer.developer}
        validThrough={offer.deadline}
        category="Real Estate Payment Plan"
        inLanguage={locale}
        nonce={nonce}
      />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative flex min-h-[92vh] items-end overflow-hidden">
        <img
          src={offer.heroImage}
          alt={`${offer.developer} ${offer.shortName} offer`}
          className="ofr-kenburns absolute inset-0 h-full w-full object-cover"
          fetchPriority="high"
        />
        {/* Vertical wash to seat the copy, plus a warm side-light from the left
            so the headline edge doesn't sit flat against the photograph. */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to bottom, rgba(7,42,32,0.12) 0%, rgba(7,42,32,0.30) 38%, rgba(7,42,32,0.68) 74%, rgba(7,42,32,0.92) 100%)`,
          }}
        />
        <div
          className="absolute inset-0"
          style={{ background: `radial-gradient(120% 90% at 0% 100%, rgba(212,168,71,0.16) 0%, transparent 55%)` }}
        />

        <div className="relative w-full">
          <div className="mx-auto max-w-6xl px-4 pb-16 pt-32 sm:px-6">
            <div className="max-w-3xl">
              <div className="hero-fade-up flex flex-wrap items-center gap-2.5">
                {!expired && (
                  <span
                    className="ofr-sheen relative inline-flex items-center gap-1.5 overflow-hidden rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em]"
                    style={{ background: `linear-gradient(135deg, ${GOLD_LT}, ${GOLD_DEEP})`, color: GREEN }}
                  >
                    <Clock className="h-3.5 w-3.5" />
                    {computeEyebrow(offer)}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-[11px] font-semibold text-white/90 backdrop-blur-sm">
                  <Building2 className="h-3.5 w-3.5" />
                  {offer.developer}
                </span>
              </div>

              {/* Mobile size dropped from 2.6rem: at that size a headline this
                  long (offer.h1 is data-driven, so length varies) ran to 4-5
                  lines and pushed the countdown/CTAs down into the global fixed
                  WhatsApp bar at the very bottom of the first mobile viewport.
                  sm:/lg: unchanged — desktop had room and looked right. */}
              <h1
                className="hero-rise mt-5 text-[1.9rem] font-extrabold leading-[1.12] tracking-[-0.01em] text-white sm:mt-6 sm:text-[3.4rem] sm:leading-[1.04] sm:tracking-[-0.02em] lg:text-[4.1rem]"
                style={{ textShadow: "0 2px 40px rgba(0,0,0,0.35)" }}
              >
                {offer.h1}
              </h1>

              <p className="hero-rise mt-4 max-w-2xl text-[15px] leading-relaxed text-white/80 sm:mt-6 sm:text-lg lg:text-xl">
                {offer.subtitle}
              </p>

              {!expired && !offer.hideDeadline && (
                <div className="hero-rise mt-6 sm:mt-9">
                  {showCountdown ? (
                    // Caption above the digits — deliberately quiet so it doesn't
                    // compete with the countdown it introduces.
                    <>
                      <div className="mb-2.5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white/55">
                        <Sparkles className="h-3.5 w-3.5" style={{ color: GOLD }} />
                        {offer.windowLabel || DEFAULT_WINDOW_LABEL}
                      </div>
                      <OfferCountdown deadline={offer.deadline} tone="light" />
                    </>
                  ) : (
                    // Nothing beneath it, so the label has to hold the slot on its
                    // own: a gold-ruled pill with a live dot rather than a stray
                    // line of muted caption text.
                    <span
                      className="inline-flex items-center gap-3 rounded-full py-2.5 pl-4 pr-5 backdrop-blur-sm"
                      style={{
                        border: "1px solid rgba(212,168,71,0.36)",
                        background:
                          "linear-gradient(135deg, rgba(212,168,71,0.18) 0%, rgba(212,168,71,0.05) 100%)",
                        boxShadow: "0 8px 28px rgba(0,0,0,0.20)",
                      }}
                    >
                      <span className="ofr-live-dot shrink-0" />
                      <span
                        className="text-[11.5px] font-bold uppercase tracking-[0.16em]"
                        style={{ color: "#F2E0B5" }}
                      >
                        {offer.windowLabel || DEFAULT_WINDOW_LABEL}
                      </span>
                    </span>
                  )}
                </div>
              )}

              <div className="hero-rise mt-6 flex flex-wrap gap-3 sm:mt-9">
                <a
                  href="#enquire"
                  className="group inline-flex items-center gap-2 rounded-full px-8 py-4 text-sm font-bold transition-transform hover:scale-[1.03]"
                  style={{
                    background: `linear-gradient(135deg, ${GOLD_LT}, ${GOLD_DEEP})`,
                    color: GREEN,
                    boxShadow: "0 8px 34px rgba(212,168,71,0.38)",
                  }}
                >
                  {ctaLabel}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </a>
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 rounded-full px-8 py-4 text-sm font-bold text-white transition-transform hover:scale-[1.03]"
                  style={{ background: "#25D366", boxShadow: "0 8px 30px rgba(37,211,102,0.34)" }}
                >
                  <WhatsAppIcon className="h-[18px] w-[18px]" />
                  {waLabel}
                </a>
                <a
                  href="tel:+971549988811"
                  className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/5 px-8 py-4 text-sm font-bold text-white backdrop-blur-sm transition-colors hover:bg-white/12"
                >
                  <Phone className="h-4 w-4" /> +971 54 998 8811
                </a>
              </div>
            </div>
          </div>

          {/* ── HIGHLIGHT BAND — flush to the hero, gold-ruled ─────────────
              Opaque light ground. It reads as its own band between the hero
              photograph and the dark sections below, and it is what gives the
              page its dark / light / dark rhythm. */}
          <div className="relative bg-card">
            {/* Gold hairline, brightest mid-span and fading out at both ends —
                an edge-to-edge rule reads like a table border. */}
            <span
              className="pointer-events-none absolute inset-x-0 top-0 h-px"
              style={{
                background:
                  "linear-gradient(90deg, transparent 0%, rgba(212,168,71,0.42) 20%, rgba(234,200,115,0.85) 50%, rgba(212,168,71,0.42) 80%, transparent 100%)",
              }}
            />
            {/* Warm wash spilling down from the hairline — far lighter than the
                dark version needed, or it turns muddy against the light ground. */}
            <span
              className="pointer-events-none absolute inset-0"
              style={{ background: "radial-gradient(68% 130% at 50% 0%, rgba(212,168,71,0.10) 0%, transparent 60%)" }}
            />

            <div className="relative mx-auto grid max-w-6xl grid-cols-2 px-4 sm:px-6 lg:grid-cols-4">
              {offer.highlights.map((h, i) => (
                <div key={h.label} className="relative px-4 py-8 text-center sm:py-9">
                  {/* Separators taper away at their ends instead of ruling the
                      full cell. Two columns on mobile, four from lg — so cell 2
                      only takes a left rule once the row goes 4-up. */}
                  {i !== 0 && (
                    <span
                      className={`pointer-events-none absolute inset-y-5 left-0 w-px ${i % 2 === 0 ? "hidden lg:block" : ""}`}
                      style={{
                        background:
                          "linear-gradient(to bottom, transparent, rgba(11,61,46,0.16) 50%, transparent)",
                      }}
                    />
                  )}
                  {i > 1 && (
                    <span
                      className="pointer-events-none absolute inset-x-6 top-0 h-px lg:hidden"
                      style={{
                        background:
                          "linear-gradient(90deg, transparent, rgba(11,61,46,0.14) 50%, transparent)",
                      }}
                    />
                  )}

                  <div
                    className="text-[1.9rem] font-extrabold leading-none tracking-[-0.03em] sm:text-[2.9rem]"
                    style={{
                      background: `linear-gradient(140deg, ${GOLD} 0%, ${GOLD_DEEP} 58%, #96751D 100%)`,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    {h.value}
                  </div>
                  <div className="mt-3 text-[11px] font-bold uppercase tracking-[0.13em] text-foreground sm:text-xs">
                    {h.label}
                  </div>
                  {h.detail && (
                    <div className="mx-auto mt-2 max-w-[30ch] text-[12px] leading-relaxed text-muted-foreground">
                      {h.detail}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── EXPLAINER — the first prose a reader hits, right after the numbers
             and before the lifestyle/community sections. Answers "what is this
             and why is it good" before anything else does. A distinct ground
             (not bg-card, not bg-background) keeps it from reading as a
             continuation of the highlight band above: a warm cream base, a
             faint gold diamond-lattice motif (the same geometric language as
             the developer's own marketing), and two soft corner glows. All
             CSS/SVG, no bitmap, so it stays crisp at any zoom and costs
             nothing to load. ─────────────────────────────────────────────── */}
      {!!offer.explainer?.body?.length && (
      <section className="relative overflow-hidden py-14 sm:py-20" style={{ background: "#FBF8F1" }}>
        <span
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Cpath d='M32 0L64 32L32 64L0 32Z' fill='none' stroke='%23D4A847' stroke-opacity='0.16' stroke-width='1'/%3E%3C/svg%3E")`,
            backgroundSize: "64px 64px",
          }}
        />
        <span
          className="pointer-events-none absolute -left-32 -top-32 h-[420px] w-[420px] rounded-full opacity-70"
          style={{ background: "radial-gradient(circle, rgba(212,168,71,0.20) 0%, transparent 70%)" }}
        />
        <span
          className="pointer-events-none absolute -bottom-40 -right-24 h-[380px] w-[380px] rounded-full opacity-60"
          style={{ background: "radial-gradient(circle, rgba(11,61,46,0.10) 0%, transparent 70%)" }}
        />
        <span
          className="pointer-events-none absolute inset-x-0 top-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(212,168,71,0.5) 50%, transparent 100%)",
          }}
        />
        <div className="relative mx-auto max-w-3xl px-4 sm:px-6">
          <Reveal>
            <h2 className="text-xl font-extrabold tracking-[-0.01em] text-foreground sm:text-2xl">
              {offer.explainer.heading}
            </h2>

            {offer.explainer.highlight && (
              <div
                className="mt-5 flex items-start gap-3 rounded-2xl px-5 py-4"
                style={{
                  background: "linear-gradient(135deg, rgba(212,168,71,0.14), rgba(212,168,71,0.05))",
                  border: `1px solid rgba(212,168,71,0.35)`,
                }}
              >
                <Sparkles className="mt-0.5 h-5 w-5 shrink-0" style={{ color: GOLD_DEEP }} />
                <p className="text-sm font-semibold leading-relaxed text-foreground sm:text-[15px]">
                  {emphasizeStats(offer.explainer.highlight)}
                </p>
              </div>
            )}

            <div className="mt-6 space-y-5">
              {offer.explainer.body.map((p, i) => (
                <p key={i} className="text-[15px] leading-relaxed text-muted-foreground sm:text-base">
                  {emphasizeStats(p)}
                </p>
              ))}
            </div>

            {!!offer.explainer.waivers?.length && (
              <div className="mt-6 rounded-2xl border border-border/50 bg-background/60 p-5 sm:p-6">
                {offer.explainer.waiversIntro && (
                  <p className="text-[15px] font-semibold text-foreground sm:text-base">
                    {offer.explainer.waiversIntro}
                  </p>
                )}
                <ul className="mt-3 grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
                  {offer.explainer.waivers.map((w) => (
                    <li key={w} className="flex items-start gap-2.5 text-[14px] leading-snug text-foreground">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" style={{ color: GOLD_DEEP }} />
                      <span>{emphasizeStats(w)}</span>
                    </li>
                  ))}
                </ul>
                {offer.explainer.waiversNote && (
                  <p className="mt-4 text-[13px] leading-relaxed text-muted-foreground">
                    {offer.explainer.waiversNote}
                  </p>
                )}
              </div>
            )}
          </Reveal>
        </div>
      </section>
      )}

      {/* ── ELIGIBILITY — moved up from below the payment mechanics: a reader
             deciding whether to read on wants the terms and the community list
             right after the explainer, not two-thirds down the page. bg-background
             steps off the EXPLAINER tint above it. ──────────────────────────── */}
      <section className="bg-background py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <Eyebrow>The offer in detail</Eyebrow>
            <h2 className="mt-4 text-2xl font-extrabold tracking-[-0.02em] text-foreground sm:text-[2.1rem] sm:leading-[1.15]">
              The terms in full
            </h2>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
              One structure, five communities. The DLD, service charge and furniture terms below vary by project, see each one further down.
            </p>
            {/* Full width now, so the rows run two-up instead of a narrow stack. */}
            <div className="mt-8 grid gap-2.5 sm:grid-cols-2">
              {offer.eligibility.map((e, i) => (
                <div
                  key={e.label}
                  className="flex items-start gap-3.5 rounded-xl border border-border/60 bg-card px-5 py-4 transition-colors"
                >
                  {(() => {
                    const T = [Building2, Wallet, CalendarClock, BadgePercent, FileSignature, KeyRound, Repeat2, ShieldCheck];
                    const Icon = T[i] ?? CheckCircle2;
                    return <Icon className="mt-0.5 h-5 w-5 shrink-0" style={{ color: GOLD_DEEP }} />;
                  })()}
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                      {e.label}
                    </div>
                    <div className="mt-1 text-sm font-semibold text-foreground">{e.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── PARTICIPATING PROJECTS — moved up alongside the terms above, right
             after the explainer. Cards are smaller than before (3-up on desktop,
             tighter padding and type) since this now reads as a quick reference
             rather than the page's visual centrepiece. bg-card steps off the
             bg-background section above it. ─────────────────────────────────── */}
      {!!offer.projects?.length && (
      <section id="projects" className="scroll-mt-24 bg-card py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <Eyebrow>Where it applies</Eyebrow>
            <h2 className="mt-4 max-w-2xl text-[1.6rem] font-extrabold leading-[1.18] tracking-[-0.01em] text-foreground sm:text-[2.7rem] sm:leading-[1.1] sm:tracking-[-0.02em]">
              Choose your community
            </h2>
          </Reveal>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {offer.projects.map((pr, i) => (
              <Reveal key={pr.name} delay={i * 60}>
                <div className="group h-full overflow-hidden rounded-xl border border-border/60 bg-background transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-lg">
                  {pr.image && (
                    <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                      <img
                        src={pr.image}
                        alt={pr.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="p-5">
                  <div className="flex items-start gap-2.5">
                    <Building2 className="mt-0.5 h-4 w-4 shrink-0" style={{ color: GOLD_DEEP }} />
                    <div className="min-w-0">
                      <h3 className="text-[15px] font-bold leading-snug text-foreground">{pr.name}</h3>
                      <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{pr.terms}</p>
                    </div>
                  </div>

                  {pr.links?.length ? (
                    <div className="mt-4 flex flex-wrap gap-1.5 pl-[26px]">
                      {pr.links.map((l) => (
                        <Link
                          key={l.href}
                          href={l.href}
                          className="inline-flex items-center gap-1 min-h-[36px] rounded-full border border-border/60 px-3 py-2 text-[11px] font-semibold sm:min-h-0 sm:py-1 text-foreground transition-colors hover:border-primary/30 hover:text-primary"
                        >
                          {l.label}
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-4 pl-[26px] text-[11px] font-semibold text-muted-foreground">
                      Message us for this release
                    </p>
                  )}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* ── COMMUNITY — moved up from after the gallery: the lifestyle case now
             lands right after the hero/stat band, before the payment mechanics,
             instead of two-thirds down the page. Two parts: a highlighted stat
             band (offer.amenities.stats), then a divider and a plain icon-grid
             for the rest (offer.amenities.items). bg-background so it steps off
             the bg-card highlight band above it. ─────────────────────────────── */}
      {!!(offer.amenities?.stats?.length || offer.amenities?.items?.length) && (
      <section className="relative bg-background py-14 sm:py-24">
        {/* Green hairline — same fade-in/peak/fade-out shape as the gold one atop
            the highlight band, but green so the seam reads as "back to the
            brand" rather than another gold rule stacked on the one above it. */}
        <span
          className="pointer-events-none absolute inset-x-0 top-0 h-px"
          style={{
            background:
              `linear-gradient(90deg, transparent 0%, rgba(11,61,46,0.15) 20%, ${GREEN} 50%, rgba(11,61,46,0.15) 80%, transparent 100%)`,
          }}
        />
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <div className="text-center">
              <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-muted-foreground">
                The community
              </div>
              <span
                className="mx-auto mt-4 block h-px w-14"
                style={{ background: `linear-gradient(90deg, transparent, ${GOLD_DEEP}, transparent)` }}
              />
              <h2 className="mt-6 text-2xl font-extrabold tracking-[-0.02em] text-foreground sm:text-[2.1rem] sm:leading-[1.2]">
                {offer.amenities!.heading}
              </h2>
            </div>
          </Reveal>

          {/* Photo band — the four sections that follow this heading (stats,
              masterplan, timeline, worked example, terms) are all type and
              icons, so the middle of the page ran imageless. Three evenly
              spaced picks from the gallery, skipping index 0 because that is
              already the page hero. */}
          {(() => {
            const pool = (offer.gallery ?? []).slice(1);
            if (pool.length < 3) return null;
            const band = [0, 1, 2].map((k) => pool[Math.round((k * (pool.length - 1)) / 2)]);
            return (
              <Reveal delay={50}>
                <div className="mt-10 grid grid-cols-3 gap-2 sm:mt-12 sm:gap-4">
                  {band.map((img, i) => (
                    <div
                      key={img.src}
                      className={`relative overflow-hidden rounded-xl bg-muted sm:rounded-2xl ${
                        i === 1 ? "aspect-[3/4] sm:aspect-[4/5]" : "aspect-[3/4] sm:aspect-[4/5] sm:mt-8"
                      }`}
                    >
                      <img
                        src={img.src}
                        alt={img.alt}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                      <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </div>
                  ))}
                </div>
              </Reveal>
            );
          })()}

          {!!offer.amenities?.stats?.length && (
            <Reveal delay={70}>
              <div
                className={`mt-12 grid gap-4 ${
                  offer.amenities.stats.length === 2
                    ? "sm:grid-cols-2"
                    : offer.amenities.stats.length >= 4
                      ? "sm:grid-cols-4"
                      : "sm:grid-cols-3"
                }`}
              >
                {offer.amenities.stats.map((stat) => {
                  const Icon = ICONS[stat.icon ?? ""] ?? CheckCircle2;
                  return (
                    <div
                      key={stat.label}
                      className="flex flex-col items-center gap-2 rounded-2xl border border-border/60 px-5 py-6 text-center sm:gap-2.5 sm:px-6 sm:py-8"
                    >
                      <Icon className="h-7 w-7" style={{ color: GOLD_DEEP }} />
                      <div className="text-[1.75rem] font-extrabold tracking-[-0.02em] sm:text-3xl" style={{ color: GOLD_DEEP }}>
                        {stat.value}
                      </div>
                      <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-foreground">
                        {stat.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Reveal>
          )}

          {!!offer.amenities?.items?.length && (
            <>
              <Reveal delay={110}>
                <div className="mt-14 flex items-center justify-center gap-4 sm:gap-6">
                  <span
                    className="h-px flex-1 max-w-24"
                    style={{ background: `linear-gradient(90deg, transparent, rgba(212,168,71,0.5))` }}
                  />
                  <span className="shrink-0 text-lg font-bold text-foreground sm:text-xl">
                    {offer.amenities.masterplanHeading ?? DEFAULT_MASTERPLAN_HEADING}
                  </span>
                  <span
                    className="h-px flex-1 max-w-24"
                    style={{ background: `linear-gradient(90deg, rgba(212,168,71,0.5), transparent)` }}
                  />
                </div>
              </Reveal>
              <Reveal delay={140}>
                <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {offer.amenities.items.map((it, i) => {
                    const Icon = ICONS[offer.amenities?.icons?.[i] ?? ""] ?? CheckCircle2;
                    return (
                      <div
                        key={it}
                        className="flex flex-col items-center justify-center gap-2.5 rounded-2xl border border-border/60 px-3 py-5 text-center sm:gap-3 sm:px-5 sm:py-7"
                      >
                        <Icon className="h-6 w-6" style={{ color: GOLD_DEEP }} />
                        <span className="text-[13px] font-bold uppercase leading-snug tracking-[0.04em] text-foreground">
                          {it}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </Reveal>
            </>
          )}
        </div>
      </section>
      )}

      {/* ── SEAM ORNAMENT — the community section (bg-background) and the
             timeline section right after it (bg-card) are both light, so their
             join was a bare horizontal line. A small badge straddling the
             boundary (negative margin pulls it up onto the seam, positive
             z-index keeps it above both) turns that into a deliberate beat
             instead of an accidental one, and doubles as "lifestyle → money"
             visual shorthand: sparkle (the offer) becomes a key (the deal). ── */}
      {!!offer.timeline?.length && (
      <div className="relative z-10 -mb-6 flex justify-center">
        <span
          className="flex h-12 w-12 items-center justify-center rounded-full border-4"
          style={{
            background: `linear-gradient(135deg, ${GOLD_LT}, ${GOLD_DEEP})`,
            borderColor: "var(--background, #fff)",
            boxShadow: "0 6px 20px rgba(212,168,71,0.35)",
          }}
        >
          <KeyRound className="h-5 w-5" style={{ color: GREEN }} />
        </span>
      </div>
      )}

      {/* ── PAYMENT TIMELINE — a standing section: every offer should carry a
             timeline. The guard is a safety net for a document missing one, not
             an invitation to omit it. bg-card now (was bg-background) because
             the community band directly above it took bg-background — moved up
             from later in the page, see below. ───────────────────────────────── */}
      {!!offer.timeline?.length && (
      <section className="bg-card py-14 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <Eyebrow>How the plan works</Eyebrow>
          <h2 className="mt-4 max-w-2xl text-[1.6rem] font-extrabold leading-[1.18] tracking-[-0.01em] text-foreground sm:text-[2.7rem] sm:leading-[1.1] sm:tracking-[-0.02em]">
            Your money, staged
          </h2>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            {offer.timelineIntro ??
              "A conventional off-plan plan spreads payments across construction milestones. This one front-loads a single commitment and defers the rest."}
          </p>
        </Reveal>

        <Reveal delay={80} className="relative mt-14">
          <div
            className={`grid gap-5 ${
              offer.timeline.length === 2
                ? "md:grid-cols-2"
                : offer.timeline.length >= 4
                  ? "md:grid-cols-4"
                  : "md:grid-cols-3"
            }`}
          >
            {offer.timeline.map((step, i) => (
              <div key={step.stage} className="relative flex flex-col">
                {/* Connector to the NEXT node — node centre to node centre, so
                    the run terminates at the last step instead of trailing off
                    to the edge of the row. 26px = half a 52px node; 46px = that
                    plus the 20px grid gap. */}
                {i < offer.timeline!.length - 1 && (
                  <span
                    className="ofr-rail pointer-events-none absolute hidden h-[3px] rounded-full md:block"
                    style={{
                      left: "26px",
                      right: "-46px",
                      top: "25px",
                      background: `linear-gradient(90deg, ${GREEN} 0%, ${GOLD} 55%, ${GOLD_DEEP} 100%)`,
                      opacity: 0.30,
                    }}
                  />
                )}
                {/* Node sits on the rail */}
                <div className="relative z-10 mb-6 flex justify-center md:justify-start">
                  <div
                    className="flex h-[52px] w-[52px] items-center justify-center rounded-2xl text-lg font-extrabold text-white"
                    style={{
                      background: `linear-gradient(135deg, ${GREEN}, #1A7A5A)`,
                      boxShadow: "0 8px 24px rgba(11,61,46,0.22)",
                      border: "3px solid var(--background, #fff)",
                    }}
                  >
                    {i + 1}
                  </div>
                </div>

                <div className="group flex-1 rounded-2xl border border-border/60 bg-card p-7 transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-xl">
                  <div
                    className="text-[2.4rem] font-extrabold leading-none tracking-[-0.03em] sm:text-[3.2rem]"
                    style={{
                      background:
                        step.share === "0%"
                          ? "linear-gradient(135deg, #8FA39B, #6B7F77)"
                          : `linear-gradient(135deg, ${GOLD}, ${GOLD_DEEP})`,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    {step.share}
                  </div>
                  <div className="mt-2 text-base font-bold text-foreground">{step.stage}</div>
                  <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
        </div>
      </section>
      )}

      {/* ── WORKED EXAMPLE + ELIGIBILITY (dark) ──────────────────────────── */}
      <section
        className="relative overflow-hidden text-white"
        style={{ background: DARK_SECTION }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(90% 70% at 85% 20%, rgba(212,168,71,0.14) 0%, transparent 60%)" }}
        />
        <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-24">
          {offer.worked && (
            <Reveal className="grid gap-10 lg:grid-cols-2 lg:items-start lg:gap-14">
              <div>
                <Eyebrow onDark>The maths</Eyebrow>
                <h2 className="mt-4 text-2xl font-extrabold tracking-[-0.02em] text-white sm:text-[2.1rem] sm:leading-[1.15]">
                  {offer.worked.heading}
                </h2>
                {offer.worked.footnote && (
                  <p className="mt-5 max-w-md text-xs leading-relaxed text-white/40">{offer.worked.footnote}</p>
                )}
              </div>

              <div
                className="overflow-hidden rounded-2xl"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)" }}
              >
                {offer.worked.rows.map(([label, value], i) => {
                  const waived = value.toLowerCase().includes("waived");
                  const last = i === offer.worked!.rows.length - 1;
                  return (
                    <div
                      key={label}
                      className="flex items-center justify-between gap-4 px-6 py-4"
                      style={{
                        borderTop: i === 0 ? "none" : "1px solid rgba(255,255,255,0.08)",
                        background: last ? "rgba(212,168,71,0.12)" : undefined,
                      }}
                    >
                      <span className={`text-sm ${last ? "font-bold text-white" : "text-white/60"}`}>{label}</span>
                      <span
                        className="text-sm font-bold tabular-nums"
                        style={{ color: waived ? GOLD : last ? GOLD_LT : "#FFFFFF" }}
                      >
                        {value}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Reveal>
          )}
        </div>
      </section>

      {/* ── GALLERY — visual proof, right after the reader meets the specific
             projects and before the lifestyle checklist. bg-card so it steps
             off the bg-background projects section above it. ───────────────── */}
      {!!offer.gallery?.length && (
      <section className="bg-card py-14 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <Eyebrow>See it for yourself</Eyebrow>
            <h2 className="mt-4 max-w-2xl text-[1.6rem] font-extrabold leading-[1.18] tracking-[-0.01em] text-foreground sm:text-[2.7rem] sm:leading-[1.1] sm:tracking-[-0.02em]">
              Inside the communities
            </h2>
          </Reveal>
          <Reveal delay={80} className="mt-10">
            <OfferGallery images={offer.gallery} title={offer.shortName} />
          </Reveal>
        </div>
      </section>
      )}

      {/* ── WHY IT MATTERS — the charcoal treatment from ValuationCTA on the
             homepage: same ground, teal + gold corner glows, faint grid, and
             white/[0.03] tiles. ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-14 sm:py-24">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "linear-gradient(135deg, #1A1F2E 0%, #0F1218 50%, #0D1015 100%)" }}
        />
        <div
          className="pointer-events-none absolute -left-40 top-0 h-[520px] w-[520px] opacity-[0.22]"
          style={{ background: "radial-gradient(circle, hsl(168 100% 20%) 0%, transparent 70%)" }}
        />
        <div
          className="pointer-events-none absolute -right-40 bottom-0 h-[520px] w-[520px] opacity-[0.18]"
          style={{ background: "radial-gradient(circle, hsl(43 60% 40%) 0%, transparent 70%)" }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <Eyebrow onDark>Why it matters</Eyebrow>
            <h2 className="mt-4 max-w-2xl text-[1.6rem] font-extrabold leading-[1.18] tracking-[-0.01em] text-white sm:text-[2.7rem] sm:leading-[1.1] sm:tracking-[-0.02em]">
              What actually changes for a{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: `linear-gradient(90deg, ${GOLD}, ${GOLD_DEEP})` }}
              >
                buyer
              </span>
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            {offer.valueProps.map(([heading, body], i) => (
              <Reveal key={heading} delay={i * 90}>
                <div className="group relative h-full overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] p-7 transition-all duration-300 hover:-translate-y-1 hover:border-white/[0.16] hover:bg-white/[0.05]">
                  <span
                    className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100"
                    style={{ background: `linear-gradient(90deg, ${GOLD}, ${GOLD_DEEP})` }}
                  />
                  <div className="text-[11px] font-extrabold tabular-nums" style={{ color: GOLD }}>
                    0{i + 1}
                  </div>
                  <h3 className="mt-3 text-lg font-bold leading-snug text-white">{heading}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/55">{body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── INVESTMENT CASE — centred stripe, lighter in weight than the value
             props above it so the two don't compete. ────────────────────────── */}
      {!!offer.investment?.items?.length && (
      <section className="bg-background py-14 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <Reveal>
            <div className="text-center">
              <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-muted-foreground">
                Why this one
              </div>
              <span
                className="mx-auto mt-4 block h-px w-14"
                style={{ background: `linear-gradient(90deg, transparent, ${GOLD_DEEP}, transparent)` }}
              />
              <h2 className="mt-6 text-2xl font-extrabold tracking-[-0.02em] text-foreground sm:text-[2.1rem] sm:leading-[1.2]">
                {offer.investment.heading}
              </h2>
            </div>
          </Reveal>

          <div className="mt-12 grid gap-x-10 gap-y-9 sm:grid-cols-2">
            {offer.investment.items.map((it, i) => {
              const Icon = ICONS[offer.investment?.icons?.[i] ?? ""] ?? CheckCircle2;
              return (
                <Reveal key={it.title} delay={i * 70}>
                  <div className="flex items-start gap-4">
                    <Icon className="mt-0.5 h-7 w-7 shrink-0" style={{ color: GOLD_DEEP }} />
                    <div>
                      <h3 className="text-[13px] font-extrabold uppercase tracking-[0.1em] text-foreground">
                        {it.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{it.text}</p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>
      )}

      {/* ── LONG-FORM + FORM ─────────────────────────────────────────────── */}
      <section id="enquire" className="scroll-mt-24 bg-card py-14 sm:py-24">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-[1.1fr_1fr]">
          <Reveal>
            <Eyebrow>The detail</Eyebrow>
            <h2 className="mt-4 text-2xl font-extrabold tracking-[-0.02em] text-foreground sm:text-[2.1rem] sm:leading-[1.15]">
              What this means for you
            </h2>
            <div className="mt-7 space-y-5">
              {offer.bodyParagraphs.map((p, i) => (
                <div key={i} className={i === 0 ? "space-y-5" : undefined}>
                  <p
                    className={
                      i === 0
                        ? "text-lg leading-relaxed text-foreground/85"
                        : "text-[15px] leading-relaxed text-muted-foreground"
                    }
                  >
                    {p}
                  </p>
                  {/* A supporting photo breaks up the long-form copy roughly a third
                      of the way down, rather than leaving the reader on unbroken
                      text for six paragraphs. */}
                  {i === 0 && (offer.gallery?.at(-1) ?? offer.heroImage) && (
                    <div className="overflow-hidden rounded-2xl">
                      <img
                        src={offer.gallery?.at(-1)?.src ?? offer.heroImage}
                        alt={offer.gallery?.at(-1)?.alt ?? offer.shortName}
                        loading="lazy"
                        className="aspect-[16/10] w-full object-cover"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
            {offer.projectHref && (
              <Link
                href={offer.projectHref}
                className="mt-7 inline-flex items-center gap-1.5 text-sm font-bold hover:underline"
                style={{ color: GOLD_DEEP }}
              >
                View the project <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </Reveal>

          {/* Was lg:sticky lg:top-28 lg:self-start — the text column grew (a
              second paragraph split by an inline photo) while the form stayed
              short, so "self-start" pinned it to the top and left a tall dead
              gap underneath. Centering it in the row removes that gap; the
              form still sits beside the text, it just no longer chases the
              scroll position. */}
          <Reveal delay={100} className="lg:self-center">
            <OfferLeadForm offerSlug={offer.slug} offerName={offer.shortName} expired={expired} />
          </Reveal>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="bg-background py-14 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <Reveal>
          <Eyebrow>Before you commit</Eyebrow>
          <h2 className="mt-4 text-[1.6rem] font-extrabold leading-[1.18] tracking-[-0.01em] text-foreground sm:text-[2.7rem] sm:leading-[1.1] sm:tracking-[-0.02em]">
            Frequently asked questions
          </h2>
        </Reveal>

        <div className="mt-10 space-y-3">
          {offer.faqs.map((f, i) => (
            <Reveal key={f.question} delay={i * 55}>
              <details className="group overflow-hidden rounded-2xl border border-border/60 bg-card transition-colors hover:border-primary/25 open:border-primary/25 open:shadow-sm">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 text-base font-bold text-foreground">
                  {f.question}
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-lg leading-none transition-transform duration-300 group-open:rotate-45"
                    style={{ background: "rgba(212,168,71,0.14)", color: GOLD_DEEP }}
                  >
                    +
                  </span>
                </summary>
                <p className="px-6 pb-5 text-[15px] leading-relaxed text-muted-foreground">{f.answer}</p>
              </details>
            </Reveal>
          ))}
        </div>
        </div>
      </section>

      {/* ── CLOSING CTA ──────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{ background: DARK_SECTION }}
      >
        {/* Photograph under the green ground rather than a flat gradient slab —
            heavily dimmed so the white headline keeps its contrast. */}
        {(offer.gallery?.[1]?.src ?? offer.heroImage) && (
          <img
            src={offer.gallery?.[1]?.src ?? offer.heroImage}
            alt=""
            aria-hidden
            loading="lazy"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.18]"
          />
        )}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "linear-gradient(180deg, rgba(11,61,46,0.55) 0%, rgba(11,61,46,0.35) 50%, rgba(11,61,46,0.6) 100%)" }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(70% 90% at 50% 110%, rgba(212,168,71,0.22) 0%, transparent 62%)" }}
        />
        <div className="relative mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 sm:py-28">
          <Reveal>
            <h2 className="text-[1.6rem] font-extrabold leading-[1.18] tracking-[-0.01em] text-white sm:text-[2.9rem] sm:leading-[1.08] sm:tracking-[-0.02em]">
              Find out which homes qualify
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-lg text-white/70">
              Eligible inventory is limited and moves quickly. Speak to an advisor and get the written terms today.
            </p>

            {!expired && showCountdown && (
              <div className="mt-9 flex justify-center">
                <OfferCountdown deadline={offer.deadline} tone="light" />
              </div>
            )}

            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <a
                href="#enquire"
                className="group inline-flex items-center gap-2 rounded-full px-8 py-4 text-sm font-bold transition-transform hover:scale-[1.03]"
                style={{
                  background: `linear-gradient(135deg, ${GOLD_LT}, ${GOLD_DEEP})`,
                  color: GREEN,
                  boxShadow: "0 8px 34px rgba(212,168,71,0.36)",
                }}
              >
                {ctaLabel}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </a>
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 rounded-full px-8 py-4 text-sm font-bold text-white transition-transform hover:scale-[1.03]"
                style={{ background: "#25D366", boxShadow: "0 8px 30px rgba(37,211,102,0.34)" }}
              >
                <WhatsAppIcon className="h-[18px] w-[18px]" />
                {waLabel}
              </a>
              <a
                href="tel:+971549988811"
                className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/5 px-8 py-4 text-sm font-bold text-white backdrop-blur-sm transition-colors hover:bg-white/12"
              >
                <Phone className="h-4 w-4" /> +971 54 998 8811
              </a>
            </div>

            <div className="mt-11 flex flex-wrap items-center justify-center gap-x-7 gap-y-2 text-xs text-white/50">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4" style={{ color: GOLD }} /> RERA-licensed brokerage
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Building2 className="h-4 w-4" style={{ color: GOLD }} /> Official {offer.developer} partner
              </span>
            </div>

            <p className="mx-auto mt-9 max-w-2xl text-[11px] leading-relaxed text-white/35">{offer.disclaimer}</p>
          </Reveal>
        </div>
      </section>

      <Footer />
    </div>
  );
}
