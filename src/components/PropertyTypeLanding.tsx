/* eslint-disable i18next/no-literal-string -- content from data file */
import Link from "next/link";
import type { PropertyTypeLocale } from "@/lib/property-type-pages";
import { FAQJsonLd, BreadcrumbJsonLd } from "@/components/JsonLd";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

interface Props {
  locale: string;
  slug: string;
  icon: string;
  searchType: string;
  c: PropertyTypeLocale;
}

export default function PropertyTypeLanding({ locale, slug, icon, searchType, c }: Props) {
  const isRtl = locale === "ar";
  const lp = locale === "en" ? "" : `/${locale}`;
  const searchUrl = `${lp}/search?type=${encodeURIComponent(searchType)}`;

  const breadcrumbs = [
    { name: locale === "ru" ? "Главная" : locale === "ar" ? "الرئيسية" : locale === "zh" ? "首页" : "Home", href: `${lp}/` },
    { name: c.h1, href: `${lp}/${slug}` },
  ];

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? "rtl" : "ltr"}>
      <FAQJsonLd faqs={c.faqs} />
      <BreadcrumbJsonLd items={breadcrumbs} />
      <Navbar />

      {/* Hero */}
      <section
        className="relative overflow-hidden pt-20 sm:pt-32 pb-10 sm:pb-16 text-white"
        style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
      >
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)", backgroundSize: "48px 48px" }} />
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6">
          <p className="text-4xl sm:text-5xl mb-3 sm:mb-4">{icon}</p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-2">{c.h1}</h1>
          <p className="text-lg sm:text-2xl font-light text-primary-foreground/70 mb-4 sm:mb-6">{c.h1sub}</p>
          <p className="text-primary-foreground/80 text-sm sm:text-base leading-relaxed max-w-2xl mb-7 sm:mb-10">{c.heroDesc}</p>
          <Link
            href={searchUrl}
            className="inline-flex items-center gap-2 font-bold px-6 py-3 sm:px-8 sm:py-4 rounded-xl text-sm sm:text-base hover:opacity-90 transition-all"
            style={{ background: "linear-gradient(135deg, #D4A847, #B8922F)", color: "#fff" }}
          >
            {c.ctaSearch} →
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-border/50 bg-card">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-border/40">
            {c.stats.map((s) => (
              <div key={s.label} className="py-4 sm:py-6 px-3 sm:px-8 text-center">
                <p className="text-xl sm:text-2xl font-black text-primary mb-1">{s.n}</p>
                <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider leading-tight">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-12 sm:space-y-16">

        {/* Highlights */}
        <section>
          <div className="grid sm:grid-cols-3 gap-4 sm:gap-5">
            {c.highlights.map((h) => (
              <div key={h.title} className="bg-card border border-border/50 rounded-2xl p-4 sm:p-6 hover:border-primary/20 transition-all">
                <div className="flex items-center gap-3 mb-2 sm:mb-3">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-primary" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground">{h.title}</h3>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{h.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Areas */}
        <section>
          <div className="text-center mb-6 sm:mb-8">
            <p className="text-accent font-bold tracking-[0.35em] uppercase text-xs mb-2 sm:mb-3">
              {locale === "ru" ? "Районы" : locale === "ar" ? "المناطق" : locale === "zh" ? "地区" : "Top Areas"}
            </p>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              {locale === "ru" ? `Лучшие районы для ${c.h1.toLowerCase()}` : locale === "ar" ? `أفضل مناطق ${c.h1}` : locale === "zh" ? `${c.h1}最佳地区` : `Top Areas for ${c.h1}`}
            </h2>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
            {c.areas.map((area) => (
              <Link
                key={area}
                href={`${searchUrl}&locations=${encodeURIComponent(area)}`}
                className="bg-card border border-border/50 rounded-full px-4 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-semibold text-foreground hover:border-primary/30 hover:text-primary transition-all"
              >
                {area}
              </Link>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section>
          <div className="text-center mb-8 sm:mb-10">
            <p className="text-accent font-bold tracking-[0.35em] uppercase text-xs mb-3">FAQ</p>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              {locale === "ru" ? "Частые вопросы" : locale === "ar" ? "الأسئلة الشائعة" : locale === "zh" ? "常见问题" : "Frequently Asked Questions"}
            </h2>
          </div>
          <div className="space-y-2 sm:space-y-3">
            {c.faqs.map((faq, i) => (
              <details key={i} className="group bg-card border border-border/50 rounded-2xl overflow-hidden hover:border-primary/20 transition-colors">
                <summary className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 sm:py-5 cursor-pointer list-none font-semibold text-foreground hover:text-primary transition-colors text-sm">
                  <span>{faq.question}</span>
                  <span className="text-accent text-lg font-light flex-shrink-0 transition-transform duration-200 group-open:rotate-45" aria-hidden="true">+</span>
                </summary>
                <div className="px-4 sm:px-6 pb-4 sm:pb-6 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/30 pt-3 sm:pt-4">{faq.answer}</div>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section
          className="rounded-2xl sm:rounded-3xl p-6 sm:p-10 lg:p-14 text-center text-white relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
        >
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)", backgroundSize: "32px 32px" }} />
          <div className="relative z-10">
            <p className="text-4xl sm:text-5xl mb-3 sm:mb-4">{icon}</p>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">{c.h1}</h2>
            <p className="text-primary-foreground/75 text-sm sm:text-base mb-7 sm:mb-10 max-w-lg mx-auto">{c.heroDesc}</p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Link
                href={searchUrl}
                className="font-bold px-6 py-3 sm:px-8 sm:py-4 rounded-xl text-sm sm:text-base hover:opacity-90 transition-all"
                style={{ background: "linear-gradient(135deg, #D4A847, #B8922F)", color: "#fff" }}
              >
                {c.ctaSearch}
              </Link>
              <Link
                href={`${lp}/contact`}
                className="border-2 border-white/30 text-white font-bold px-6 py-3 sm:px-8 sm:py-4 rounded-xl text-sm sm:text-base hover:bg-white/10 transition-all"
              >
                {locale === "ru" ? "Консультация" : locale === "ar" ? "استشارة" : locale === "zh" ? "咨询" : "Get Expert Advice"}
              </Link>
            </div>
          </div>
        </section>

      </div>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
