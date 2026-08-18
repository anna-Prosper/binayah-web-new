/* eslint-disable i18next/no-literal-string -- English-only promotional landing pages */
/* eslint-disable @next/next/no-img-element -- verified real-estate CDN images */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Link } from "@/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BreadcrumbJsonLd, FAQJsonLd } from "@/components/JsonLd";
import OfferCountdown from "@/components/offers/OfferCountdown";
import OfferLeadForm from "@/components/offers/OfferLeadForm";
import StickyOfferBar from "@/components/offers/StickyOfferBar";
import Reveal from "@/components/offers/Reveal";
import { OFFERS, getOffer, isExpired } from "@/lib/offers";
import { canonical as makeCanonical, altLangs, OG_LOCALE } from "@/lib/site";
import { getNonce } from "@/lib/nonce";
import { Clock, ShieldCheck, CheckCircle2, Phone, ArrowRight, AlertCircle, Building2, Sparkles } from "lucide-react";

// Offers are time-sensitive: revalidate hourly so an expiry flips over promptly
// without waiting for a redeploy.
export const revalidate = 3600;

type Props = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  const locales = ["en", "ru", "ar", "zh", "vi", "he", "fr"];
  return locales.flatMap((locale) => OFFERS.map((o) => ({ locale, slug: o.slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const offer = getOffer(slug);
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

const GOLD = "#D4A847";
const GOLD_LT = "#EAC873";
const GOLD_DEEP = "#B8922F";
const GREEN = "#0B3D2E";
const GREEN_DK = "#072A20";

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
  const offer = getOffer(slug);
  if (!offer) notFound();

  const nonce = await getNonce();
  const expired = isExpired(offer);
  const lp = locale === "en" ? "" : `/${locale}`;

  const breadcrumbs = [
    { name: "Home", href: `${lp}/` },
    { name: "Offers", href: `${lp}/offers` },
    { name: offer.shortName, href: `${lp}/offers/${offer.slug}` },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <StickyOfferBar title={offer.h1} deadline={offer.deadline} expired={expired} />
      <BreadcrumbJsonLd items={breadcrumbs} nonce={nonce} />
      <FAQJsonLd faqs={offer.faqs} nonce={nonce} />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative flex min-h-[92vh] items-end overflow-hidden">
        <img
          src={offer.heroImage}
          alt={`${offer.developer} — ${offer.shortName} offer`}
          className="ofr-kenburns absolute inset-0 h-full w-full object-cover"
          fetchPriority="high"
        />
        {/* Vertical wash to seat the copy, plus a warm side-light from the left
            so the headline edge doesn't sit flat against the photograph. */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to bottom, rgba(7,42,32,0.30) 0%, rgba(7,42,32,0.52) 38%, rgba(7,42,32,0.88) 74%, ${GREEN_DK} 100%)`,
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
                <span
                  className={`relative inline-flex items-center gap-1.5 overflow-hidden rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] ${expired ? "" : "ofr-sheen"}`}
                  style={{ background: `linear-gradient(135deg, ${GOLD_LT}, ${GOLD_DEEP})`, color: GREEN }}
                >
                  <Clock className="h-3.5 w-3.5" />
                  {expired ? "Offer closed" : offer.eyebrow}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-[11px] font-semibold text-white/90 backdrop-blur-sm">
                  <Building2 className="h-3.5 w-3.5" />
                  {offer.developer}
                </span>
              </div>

              <h1
                className="hero-rise mt-6 text-[2.6rem] font-extrabold leading-[1.04] tracking-[-0.02em] text-white sm:text-[3.4rem] lg:text-[4.1rem]"
                style={{ textShadow: "0 2px 40px rgba(0,0,0,0.35)" }}
              >
                {offer.h1}
              </h1>

              <p className="hero-rise mt-6 max-w-2xl text-lg leading-relaxed text-white/80 sm:text-xl">
                {offer.subtitle}
              </p>

              <div className="hero-rise mt-9">
                <div className="mb-2.5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white/55">
                  {!expired && <Sparkles className="h-3.5 w-3.5" style={{ color: GOLD }} />}
                  {expired ? "This promotion has ended" : offer.windowLabel}
                </div>
                <OfferCountdown deadline={offer.deadline} tone="light" />
              </div>

              <div className="hero-rise mt-9 flex flex-wrap gap-3">
                <a
                  href="#enquire"
                  className="group inline-flex items-center gap-2 rounded-full px-8 py-4 text-sm font-bold transition-transform hover:scale-[1.03]"
                  style={{
                    background: `linear-gradient(135deg, ${GOLD_LT}, ${GOLD_DEEP})`,
                    color: GREEN,
                    boxShadow: "0 8px 34px rgba(212,168,71,0.38)",
                  }}
                >
                  {expired ? "Join the waitlist" : "Check eligible units"}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
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

          {/* ── HIGHLIGHT BAND — flush to the hero, gold-ruled ───────────── */}
          <div style={{ borderTop: "1px solid rgba(212,168,71,0.22)", background: "rgba(7,42,32,0.55)", backdropFilter: "blur(8px)" }}>
            <div className="mx-auto grid max-w-6xl grid-cols-2 px-4 sm:px-6 lg:grid-cols-4">
              {offer.highlights.map((h, i) => (
                <div
                  key={h.label}
                  className="px-3 py-7 text-center"
                  style={{
                    borderLeft: i === 0 ? "none" : "1px solid rgba(255,255,255,0.08)",
                    borderTop: i > 1 ? "1px solid rgba(255,255,255,0.08)" : "none",
                  }}
                >
                  <div
                    className="text-[2.1rem] font-extrabold leading-none tracking-tight sm:text-[2.6rem]"
                    style={{
                      background: `linear-gradient(135deg, ${GOLD_LT}, ${GOLD_DEEP})`,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    {h.value}
                  </div>
                  <div className="mt-2 text-sm font-bold text-white">{h.label}</div>
                  {h.detail && <div className="mt-1 text-xs leading-snug text-white/50">{h.detail}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── EXPIRED NOTICE ───────────────────────────────────────────────── */}
      {expired && (
        <div className="mx-auto max-w-6xl px-4 pt-10 sm:px-6">
          <div
            className="flex items-start gap-3 rounded-2xl px-5 py-4"
            style={{ background: "rgba(212,168,71,0.10)", border: "1px solid rgba(212,168,71,0.32)" }}
          >
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" style={{ color: GOLD_DEEP }} />
            <div>
              <p className="text-sm font-bold text-foreground">This promotion has closed.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                The terms below are kept for reference. Register your interest and we&apos;ll contact you before the
                next release opens.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── PAYMENT TIMELINE ─────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <Reveal>
          <Eyebrow>How the plan works</Eyebrow>
          <h2 className="mt-4 max-w-2xl text-3xl font-extrabold tracking-[-0.02em] text-foreground sm:text-[2.7rem] sm:leading-[1.1]">
            Your money, staged
          </h2>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            A conventional off-plan plan spreads payments across construction milestones. This one front-loads a
            single commitment and defers the rest.
          </p>
        </Reveal>

        <Reveal delay={80} className="relative mt-14">
          {/* Rail behind the cards — draws itself as the section reveals. */}
          <div className="pointer-events-none absolute inset-x-0 top-[52px] hidden md:block">
            <div
              className="ofr-rail h-[3px] rounded-full"
              style={{ background: `linear-gradient(90deg, ${GREEN} 0%, ${GOLD} 55%, ${GOLD_DEEP} 100%)`, opacity: 0.30 }}
            />
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {offer.timeline.map((step, i) => (
              <div key={step.stage} className="relative">
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

                <div className="group h-full rounded-2xl border border-border/60 bg-card p-7 transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-xl">
                  <div
                    className="text-[3.2rem] font-extrabold leading-none tracking-[-0.03em]"
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
      </section>

      {/* ── WORKED EXAMPLE + ELIGIBILITY (dark) ──────────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{ background: `linear-gradient(155deg, ${GREEN_DK} 0%, ${GREEN} 48%, #0F4A36 100%)` }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(90% 70% at 85% 0%, rgba(212,168,71,0.14) 0%, transparent 60%)" }}
        />
        <div className="relative mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-2">
          {offer.worked && (
            <Reveal>
              <Eyebrow onDark>The maths</Eyebrow>
              <h2 className="mt-4 text-2xl font-extrabold tracking-[-0.02em] text-white sm:text-[2.1rem] sm:leading-[1.15]">
                {offer.worked.heading}
              </h2>

              <div
                className="mt-7 overflow-hidden rounded-2xl"
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
              {offer.worked.footnote && (
                <p className="mt-3.5 text-xs leading-relaxed text-white/40">{offer.worked.footnote}</p>
              )}
            </Reveal>
          )}

          <Reveal delay={100}>
            <Eyebrow onDark>The offer in detail</Eyebrow>
            <h2 className="mt-4 text-2xl font-extrabold tracking-[-0.02em] text-white sm:text-[2.1rem] sm:leading-[1.15]">
              What qualifies
            </h2>
            <div className="mt-7 space-y-2.5">
              {offer.eligibility.map((e) => (
                <div
                  key={e.label}
                  className="flex items-start gap-3.5 rounded-xl px-5 py-4 transition-colors"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)" }}
                >
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" style={{ color: GOLD }} />
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/45">{e.label}</div>
                    <div className="mt-1 text-sm font-semibold text-white">{e.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── WHY IT MATTERS ───────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <Reveal>
          <Eyebrow>Why it matters</Eyebrow>
          <h2 className="mt-4 max-w-2xl text-3xl font-extrabold tracking-[-0.02em] text-foreground sm:text-[2.7rem] sm:leading-[1.1]">
            What actually changes for a buyer
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {offer.valueProps.map(([heading, body], i) => (
            <Reveal key={heading} delay={i * 90}>
              <div className="group relative h-full overflow-hidden rounded-2xl border border-border/60 bg-card p-7 transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-xl">
                <span
                  className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100"
                  style={{ background: `linear-gradient(90deg, ${GOLD}, ${GOLD_DEEP})` }}
                />
                <div className="text-[11px] font-extrabold tabular-nums" style={{ color: GOLD_DEEP }}>
                  0{i + 1}
                </div>
                <h3 className="mt-3 text-lg font-bold leading-snug text-foreground">{heading}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── LONG-FORM + FORM ─────────────────────────────────────────────── */}
      <section id="enquire" className="scroll-mt-24" style={{ background: "rgba(11,61,46,0.04)" }}>
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-[1.1fr_1fr]">
          <Reveal>
            <Eyebrow>The detail</Eyebrow>
            <h2 className="mt-4 text-2xl font-extrabold tracking-[-0.02em] text-foreground sm:text-[2.1rem] sm:leading-[1.15]">
              Understanding the {offer.shortName} structure
            </h2>
            <div className="mt-7 space-y-5">
              {offer.bodyParagraphs.map((p, i) => (
                <p
                  key={i}
                  className={
                    i === 0
                      ? "text-lg leading-relaxed text-foreground/85"
                      : "text-[15px] leading-relaxed text-muted-foreground"
                  }
                >
                  {p}
                </p>
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

          <Reveal delay={100} className="lg:sticky lg:top-28 lg:self-start">
            <OfferLeadForm offerSlug={offer.slug} offerName={offer.shortName} expired={expired} />
          </Reveal>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6 sm:py-28">
        <Reveal>
          <Eyebrow>Questions</Eyebrow>
          <h2 className="mt-4 text-3xl font-extrabold tracking-[-0.02em] text-foreground sm:text-[2.7rem] sm:leading-[1.1]">
            Frequently asked
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
      </section>

      {/* ── CLOSING CTA ──────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{ background: `linear-gradient(160deg, ${GREEN_DK} 0%, ${GREEN} 50%, #0F4A36 100%)` }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(70% 90% at 50% 110%, rgba(212,168,71,0.22) 0%, transparent 62%)" }}
        />
        <div className="relative mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 sm:py-28">
          <Reveal>
            <h2 className="text-3xl font-extrabold tracking-[-0.02em] text-white sm:text-[2.9rem] sm:leading-[1.08]">
              {expired ? "Be first to hear about the next one" : "Find out which homes qualify"}
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-lg text-white/70">
              {expired
                ? "Developer promotions open and close within days. We'll tell you before the next release goes live."
                : "Eligible inventory is limited and moves quickly. Speak to an advisor and get the written terms today."}
            </p>

            {!expired && (
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
                {expired ? "Join the waitlist" : "Request eligible units"}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </a>
              <a
                href="tel:+971549988811"
                className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/5 px-8 py-4 text-sm font-bold text-white backdrop-blur-sm transition-colors hover:bg-white/12"
              >
                <Phone className="h-4 w-4" /> Call an advisor
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
