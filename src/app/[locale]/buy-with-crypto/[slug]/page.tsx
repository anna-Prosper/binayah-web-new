/* eslint-disable i18next/no-literal-string -- multilingual SEO landing page, content stored inline per locale via crypto-pages data */
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { FAQJsonLd, BreadcrumbJsonLd } from "@/components/JsonLd";
import { canonical, altLangs, AE_URL } from "@/lib/site";
import {
  CRYPTO_PAGES,
  CRYPTO_LABELS,
  OG_LOCALE,
  getCryptoPage,
  type CryptoLocale,
} from "@/lib/crypto-pages";

export const revalidate = 86400;

const LOCALES: CryptoLocale[] = ["en", "ru", "ar", "zh", "vi"];

export function generateStaticParams() {
  return LOCALES.flatMap((locale) =>
    CRYPTO_PAGES.map((p) => ({ locale, slug: p.slug })),
  );
}

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const page = getCryptoPage(slug);
  if (!page || !LOCALES.includes(locale as CryptoLocale)) return {};
  const c = page.locales[locale as CryptoLocale];
  const path = `/buy-with-crypto/${slug}`;
  const url = canonical(locale, path);
  return {
    title: c.metaTitle,
    description: c.metaDesc,
    alternates: { canonical: url, languages: altLangs(path) },
    openGraph: {
      title: c.metaTitle,
      description: c.metaDesc,
      url,
      type: "website",
      locale: OG_LOCALE[locale as CryptoLocale],
      siteName: "Binayah Properties",
      images: [{ url: `${AE_URL}/assets/crypto-banner.webp`, width: 1200, height: 630, alt: c.h1a }],
    },
    twitter: {
      card: "summary_large_image",
      title: c.metaTitle,
      description: c.metaDesc,
      images: [`${AE_URL}/assets/crypto-banner.webp`],
    },
    keywords: c.keywords,
  };
}

export default async function CryptoSpokePage({ params }: Props) {
  const { locale, slug } = await params;
  const page = getCryptoPage(slug);
  if (!page || !LOCALES.includes(locale as CryptoLocale)) return notFound();

  const loc = locale as CryptoLocale;
  const c = page.locales[loc];
  const t = CRYPTO_LABELS[loc];
  const isRtl = locale === "ar";
  const lp = locale === "en" ? "" : `/${locale}`;

  const breadcrumbs = [
    { name: t.home, href: `${lp}/` },
    { name: t.hub, href: `${lp}/buy-with-crypto` },
    { name: c.breadcrumb, href: `${lp}/buy-with-crypto/${slug}` },
  ];

  // Cross-links to the other spokes + the hub.
  const related = CRYPTO_PAGES.filter((p) => p.slug !== slug).map((p) => ({
    href: `${lp}/buy-with-crypto/${p.slug}`,
    label: p.locales[loc].breadcrumb,
  }));

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? "rtl" : "ltr"}>
      <FAQJsonLd faqs={c.faqs.map((f) => ({ question: f.q, answer: f.a }))} />
      <BreadcrumbJsonLd items={breadcrumbs} />
      <Navbar />

      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden min-h-[360px] sm:min-h-[480px] flex items-center">
        <Image
          src="/assets/crypto-banner.webp"
          alt={c.h1a}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/55" />
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-24 md:py-32">
          {/* Breadcrumb trail */}
          <nav className="mb-5 text-xs text-white/60 flex flex-wrap gap-1.5" aria-label="Breadcrumb">
            <Link href={`${lp}/buy-with-crypto`} className="hover:text-white transition-colors">{t.hub}</Link>
            <span aria-hidden="true">/</span>
            <span className="text-white/90">{c.breadcrumb}</span>
          </nav>
          <p className="text-accent font-bold tracking-[0.4em] uppercase text-xs mb-5">{c.heroLabel}</p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-2">{c.h1a}</h1>
          <p className="text-3xl sm:text-4xl lg:text-5xl font-light text-primary-foreground/70 mb-7">{c.h1b}</p>
          <p className="text-primary-foreground/80 text-lg leading-relaxed max-w-2xl mb-10">{c.heroDesc}</p>
          <div className="flex flex-wrap gap-4">
            <Link
              href={`${lp}/contact`}
              className="inline-flex items-center gap-2 font-bold px-8 py-4 rounded-xl text-base transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg, #D4A847, #B8922F)", color: "#fff" }}
            >
              {t.heroCta} <span aria-hidden="true">{isRtl ? "←" : "→"}</span>
            </Link>
            <Link
              href={`${lp}/search`}
              className="inline-flex items-center gap-2 border-2 border-white/30 text-white font-semibold px-8 py-4 rounded-xl text-base hover:border-white/60 hover:bg-white/5 transition-all"
            >
              {t.browseCta}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats strip ─────────────────────────────────────────── */}
      <section className="border-b border-border/50 bg-card">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-border/40">
            {t.stats.map((s) => (
              <div key={s.label} className="py-6 px-4 sm:px-8 text-center">
                <p className="text-3xl font-black text-primary mb-1">{s.n}</p>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Accepted coins ──────────────────────────────────────── */}
      <section className="bg-muted/30 border-b border-border/40 py-5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap items-center gap-3 justify-center sm:justify-start">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] shrink-0">{t.coinsLabel}:</span>
            {t.coins.map((coin) => (
              <span
                key={coin}
                className="text-xs font-bold px-3 py-1.5 rounded-full border"
                style={{ background: "rgba(212,168,71,0.08)", borderColor: "rgba(212,168,71,0.3)", color: "#B8922F" }}
              >
                {coin}
              </span>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-14 sm:space-y-20">

        {/* ── Intro / overview (page-specific) ────────────────────── */}
        <section>
          <p className="text-accent font-bold tracking-[0.35em] uppercase text-xs mb-3">{t.overviewEyebrow}</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">{c.introHeading}</h2>
          <div className="space-y-4 max-w-3xl">
            {c.introBody.map((para, i) => (
              <p key={i} className="text-base text-muted-foreground leading-relaxed">{para}</p>
            ))}
          </div>
        </section>

        {/* ── How it works (shared) ───────────────────────────────── */}
        <section>
          <div className="text-center mb-12">
            <p className="text-accent font-bold tracking-[0.35em] uppercase text-xs mb-3">{t.processEyebrow}</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">{t.howTitle}</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            {t.steps.map((step) => (
              <div key={step.n} className="group bg-card border border-border/50 rounded-2xl p-5 sm:p-7 hover:border-primary/30 hover:shadow-sm transition-all">
                <div className="text-4xl font-black mb-4 leading-none" style={{ color: "rgba(26,122,90,0.2)" }}>{step.n}</div>
                <h3 className="text-base font-bold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Why (page-specific) ─────────────────────────────────── */}
        <section>
          <div className="text-center mb-12">
            <p className="text-accent font-bold tracking-[0.35em] uppercase text-xs mb-3">{t.benefitsEyebrow}</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">{c.whyTitle}</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            {c.whyPoints.map((pt) => (
              <div key={pt.title} className="bg-card border border-border/50 rounded-2xl p-6 hover:border-primary/20 transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground">{pt.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{pt.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── FAQ (page-specific) ─────────────────────────────────── */}
        <section>
          <div className="text-center mb-12">
            <p className="text-accent font-bold tracking-[0.35em] uppercase text-xs mb-3">{t.faqEyebrow}</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">{c.faqTitle}</h2>
          </div>
          <div className="space-y-3">
            {c.faqs.map((faq, i) => (
              <details key={i} className="group bg-card border border-border/50 rounded-2xl overflow-hidden hover:border-primary/20 transition-colors">
                <summary className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 sm:py-5 cursor-pointer list-none font-semibold text-foreground hover:text-primary transition-colors text-sm">
                  <span>{faq.q}</span>
                  <span className="text-accent text-xl font-light flex-shrink-0 transition-transform duration-200 group-open:rotate-45" aria-hidden="true">+</span>
                </summary>
                <div className="px-4 sm:px-6 pb-4 sm:pb-6 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/30 pt-3 sm:pt-4">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* ── Related crypto pages (internal links) ───────────────── */}
        <section>
          <h2 className="text-lg font-bold text-foreground mb-4">{t.relatedTitle}</h2>
          <div className="flex flex-wrap gap-2.5">
            <Link
              href={`${lp}/buy-with-crypto`}
              className="text-sm font-semibold px-4 py-2 rounded-full border border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 transition-colors"
            >
              {t.hub}
            </Link>
            {related.map((r) => (
              <Link
                key={r.href}
                href={r.href}
                className="text-sm font-medium px-4 py-2 rounded-full border border-border/60 text-foreground hover:border-primary/40 hover:text-primary transition-colors"
              >
                {r.label}
              </Link>
            ))}
          </div>
        </section>

        {/* ── CTA ─────────────────────────────────────────────────── */}
        <section
          className="rounded-2xl sm:rounded-3xl p-6 sm:p-10 lg:p-14 text-center text-white relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
        >
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)", backgroundSize: "32px 32px" }} />
          <div className="relative z-10">
            <p className="text-accent font-bold tracking-[0.4em] uppercase text-xs mb-4">Binayah Properties</p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">{c.ctaTitle}</h2>
            <p className="text-primary-foreground/75 text-lg mb-10 max-w-xl mx-auto">{c.ctaDesc}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`${lp}/contact`}
                className="font-bold px-6 py-3 sm:px-8 sm:py-4 rounded-xl text-sm sm:text-base hover:opacity-90 transition-all"
                style={{ background: "linear-gradient(135deg, #D4A847, #B8922F)", color: "#fff" }}
              >
                {t.ctaBtn}
              </Link>
              <a
                href="https://wa.me/971549988811"
                target="_blank"
                rel="noopener noreferrer"
                className="border-2 border-white/30 text-white font-bold px-6 py-3 sm:px-8 sm:py-4 rounded-xl text-sm sm:text-base hover:bg-white/10 hover:border-white/50 transition-all"
              >
                {t.ctaWhatsApp}
              </a>
            </div>
          </div>
        </section>
      </div>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
