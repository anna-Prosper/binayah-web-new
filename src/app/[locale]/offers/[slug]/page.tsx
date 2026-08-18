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
import { OFFERS, getOffer, isExpired } from "@/lib/offers";
import { canonical as makeCanonical, altLangs, OG_LOCALE } from "@/lib/site";
import { getNonce } from "@/lib/nonce";
import { Clock, ShieldCheck, CheckCircle2, Phone, ArrowRight, AlertCircle, Building2 } from "lucide-react";

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
const GOLD_DEEP = "#B8922F";
const GREEN = "#0B3D2E";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: GOLD_DEEP }}>
      {children}
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
      <BreadcrumbJsonLd items={breadcrumbs} nonce={nonce} />
      <FAQJsonLd faqs={offer.faqs} nonce={nonce} />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[86vh] flex items-end overflow-hidden">
        <img
          src={offer.heroImage}
          alt={`${offer.developer} — ${offer.shortName} offer`}
          className="absolute inset-0 h-full w-full object-cover"
          fetchPriority="high"
        />
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to bottom, rgba(11,61,46,0.20) 0%, rgba(11,61,46,0.45) 40%, rgba(11,61,46,0.86) 72%, ${GREEN} 100%)`,
          }}
        />

        <div className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 pb-14 pt-28">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em]"
                style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_DEEP})`, color: GREEN }}
              >
                <Clock className="h-3.5 w-3.5" />
                {expired ? "Offer closed" : offer.eyebrow}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 px-3.5 py-1.5 text-[11px] font-semibold text-white/90">
                <Building2 className="h-3.5 w-3.5" />
                {offer.developer}
              </span>
            </div>

            <h1 className="mt-5 text-4xl sm:text-5xl lg:text-[3.4rem] font-extrabold leading-[1.08] tracking-tight text-white">
              {offer.h1}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/85">{offer.subtitle}</p>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
              <div>
                <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-white/60">
                  {expired ? "This promotion has ended" : offer.windowLabel}
                </div>
                <OfferCountdown deadline={offer.deadline} tone="light" />
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#enquire"
                className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold transition-transform hover:scale-[1.02]"
                style={{
                  background: `linear-gradient(135deg, ${GOLD}, ${GOLD_DEEP})`,
                  color: GREEN,
                  boxShadow: "0 4px 22px rgba(212,168,71,0.4)",
                }}
              >
                {expired ? "Join the waitlist" : "Check eligible units"} <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="tel:+971549988811"
                className="inline-flex items-center gap-2 rounded-full border border-white/30 px-7 py-3.5 text-sm font-bold text-white transition-colors hover:bg-white/10"
              >
                <Phone className="h-4 w-4" /> +971 54 998 8811
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── HIGHLIGHT BAND ───────────────────────────────────────────────── */}
      <section style={{ background: `linear-gradient(135deg, ${GREEN} 0%, #1A5C44 100%)` }}>
        <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-px px-4 sm:px-6">
          {offer.highlights.map((h) => (
            <div key={h.label} className="px-3 py-7 text-center">
              <div className="text-3xl sm:text-4xl font-extrabold tracking-tight" style={{ color: GOLD }}>
                {h.value}
              </div>
              <div className="mt-1.5 text-sm font-bold text-white">{h.label}</div>
              {h.detail && <div className="mt-1 text-xs leading-snug text-white/60">{h.detail}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* ── EXPIRED NOTICE ───────────────────────────────────────────────── */}
      {expired && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10">
          <div
            className="flex items-start gap-3 rounded-2xl px-5 py-4"
            style={{ background: "rgba(212,168,71,0.12)", border: "1px solid rgba(212,168,71,0.35)" }}
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
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <SectionLabel>How the plan works</SectionLabel>
        <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Your money, staged
        </h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          A conventional off-plan plan spreads payments across construction milestones. This one front-loads a single
          commitment and defers the rest.
        </p>

        <div className="mt-9 grid gap-4 md:grid-cols-3">
          {offer.timeline.map((step, i) => (
            <div key={step.stage} className="relative rounded-2xl border border-border/60 bg-card p-6">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-lg text-sm font-extrabold text-white"
                style={{ background: `linear-gradient(135deg, ${GREEN}, #1A7A5A)` }}
              >
                {i + 1}
              </div>
              <div className="mt-4 text-4xl font-extrabold tracking-tight" style={{ color: GOLD_DEEP }}>
                {step.share}
              </div>
              <div className="mt-1 text-base font-bold text-foreground">{step.stage}</div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── WORKED EXAMPLE + ELIGIBILITY ─────────────────────────────────── */}
      <section style={{ background: "rgba(11,61,46,0.035)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20 grid gap-10 lg:grid-cols-2">
          {offer.worked && (
            <div>
              <SectionLabel>The maths</SectionLabel>
              <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                {offer.worked.heading}
              </h2>
              <div className="mt-6 overflow-hidden rounded-2xl border border-border/60 bg-card">
                {offer.worked.rows.map(([label, value], i) => (
                  <div
                    key={label}
                    className="flex items-center justify-between gap-4 px-5 py-3.5"
                    style={{ borderTop: i === 0 ? "none" : "1px solid rgba(11,61,46,0.08)" }}
                  >
                    <span className="text-sm text-muted-foreground">{label}</span>
                    <span className="text-sm font-bold tabular-nums text-foreground">{value}</span>
                  </div>
                ))}
              </div>
              {offer.worked.footnote && (
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{offer.worked.footnote}</p>
              )}
            </div>
          )}

          <div>
            <SectionLabel>The offer in detail</SectionLabel>
            <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              What qualifies
            </h2>
            <div className="mt-6 space-y-3">
              {offer.eligibility.map((e) => (
                <div key={e.label} className="flex items-start gap-3 rounded-xl border border-border/60 bg-card px-5 py-4">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" style={{ color: "#1A7A5A" }} />
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                      {e.label}
                    </div>
                    <div className="mt-0.5 text-sm font-semibold text-foreground">{e.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY IT MATTERS ───────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <SectionLabel>Why it matters</SectionLabel>
        <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          What actually changes for a buyer
        </h2>
        <div className="mt-9 grid gap-4 md:grid-cols-3">
          {offer.valueProps.map(([heading, body]) => (
            <div key={heading} className="rounded-2xl border border-border/60 bg-card p-6">
              <h3 className="text-lg font-bold leading-snug text-foreground">{heading}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── LONG-FORM + FORM ─────────────────────────────────────────────── */}
      <section id="enquire" className="scroll-mt-20" style={{ background: "rgba(11,61,46,0.035)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20 grid gap-10 lg:grid-cols-[1.15fr_1fr]">
          <div>
            <SectionLabel>The detail</SectionLabel>
            <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Understanding the {offer.shortName} structure
            </h2>
            <div className="mt-6 space-y-4">
              {offer.bodyParagraphs.map((p, i) => (
                <p key={i} className="text-[15px] leading-relaxed text-muted-foreground">
                  {p}
                </p>
              ))}
            </div>
            {offer.projectHref && (
              <Link
                href={offer.projectHref}
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold hover:underline"
                style={{ color: GOLD_DEEP }}
              >
                View the project <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start">
            <OfferLeadForm offerSlug={offer.slug} offerName={offer.shortName} expired={expired} />
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <SectionLabel>Questions</SectionLabel>
        <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Frequently asked
        </h2>
        <div className="mt-8 space-y-3">
          {offer.faqs.map((f) => (
            <details key={f.question} className="group rounded-2xl border border-border/60 bg-card px-5 py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-bold text-foreground">
                {f.question}
                <span
                  className="shrink-0 text-xl leading-none transition-transform group-open:rotate-45"
                  style={{ color: GOLD_DEEP }}
                >
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.answer}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ── CLOSING CTA ──────────────────────────────────────────────────── */}
      <section style={{ background: `linear-gradient(145deg, #0A3529 0%, ${GREEN} 45%, #0F4A36 100%)` }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            {expired ? "Be first to hear about the next one" : "Find out which homes qualify"}
          </h2>
          <p className="mt-4 text-white/75">
            {expired
              ? "Developer promotions open and close within days. We'll tell you before the next release goes live."
              : "Eligible inventory is limited and moves quickly. Speak to an advisor and get the written terms today."}
          </p>

          {!expired && (
            <div className="mt-8 flex justify-center">
              <OfferCountdown deadline={offer.deadline} tone="light" />
            </div>
          )}

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href="#enquire"
              className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold transition-transform hover:scale-[1.02]"
              style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_DEEP})`, color: GREEN }}
            >
              {expired ? "Join the waitlist" : "Request eligible units"} <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="tel:+971549988811"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 px-7 py-3.5 text-sm font-bold text-white transition-colors hover:bg-white/10"
            >
              <Phone className="h-4 w-4" /> Call an advisor
            </a>
          </div>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-white/55">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4" /> RERA-licensed brokerage
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Building2 className="h-4 w-4" /> Official {offer.developer} partner
            </span>
          </div>

          <p className="mx-auto mt-8 max-w-2xl text-[11px] leading-relaxed text-white/40">{offer.disclaimer}</p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
