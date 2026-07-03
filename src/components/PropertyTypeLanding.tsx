/* eslint-disable i18next/no-literal-string -- content from data file */
import React from "react";
import Link from "next/link";
import type { PropertyTypeLocale } from "@/lib/property-type-pages";
import { FAQJsonLd, BreadcrumbJsonLd } from "@/components/JsonLd";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PropertyTypeSidebar from "@/components/PropertyTypeSidebar";
import { findPropertyTypePage } from "@/lib/property-type-pages";

interface Props {
  locale: string;
  slug: string;
  icon: string;
  searchType: string;
  c: PropertyTypeLocale;
  searchSlot?: React.ReactNode;
}

export default function PropertyTypeLanding({ locale, slug, icon, searchType, c, searchSlot }: Props) {
  const isRtl = locale === "ar" || locale === "he";
  const lp = locale === "en" ? "" : `/${locale}`;
  const searchUrl = `${lp}/search?type=${encodeURIComponent(searchType)}`;

  // The search API matches community names in English (as stored in the DB),
  // but c.areas are localized for display. The per-locale areas arrays are
  // positionally aligned with the English ones, so map each localized label
  // back to its English value for the `locations=` filter — otherwise a
  // localized name (e.g. "Дубай Марина") is sent and matches nothing.
  const enAreas = findPropertyTypePage(slug)?.en.areas ?? c.areas;
  const areaValue = (i: number) => enAreas[i] ?? c.areas[i];

  const breadcrumbs = [
    { name: locale === "ru" ? "Главная" : locale === "ar" ? "الرئيسية" : locale === "zh" ? "首页" : locale === "vi" ? "Trang chủ" : "Home", href: `${lp}/` },
    { name: c.h1, href: `${lp}/${slug}` },
  ];

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? "rtl" : "ltr"}>
      <FAQJsonLd faqs={c.faqs} />
      <BreadcrumbJsonLd items={breadcrumbs} />
      <Navbar />

      {/* Hero + Stats */}
      <section
        className="relative overflow-hidden pt-20 sm:pt-28 pb-8 sm:pb-12 text-white"
        style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
      >
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)", backgroundSize: "48px 48px" }} />
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid sm:grid-cols-2 gap-6 sm:gap-10 items-center">
            {/* Left: identity */}
            <div>
              <p className="text-3xl mb-2">{icon}</p>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight mb-1">{c.h1}</h1>
              <p className="text-sm sm:text-base font-light text-primary-foreground/70 mb-5">{c.h1sub}</p>
              <Link
                href={searchUrl}
                className="inline-flex items-center gap-2 font-bold px-5 py-2.5 rounded-xl text-sm hover:opacity-90 transition-all"
                style={{ background: "linear-gradient(135deg, #D4A847, #B8922F)", color: "#fff" }}
              >
                {c.ctaSearch} →
              </Link>
            </div>
            {/* Right: stats 2×2 — transparent cells, white divider lines */}
            <div className="grid grid-cols-2 gap-[1px] bg-white/15 rounded-2xl overflow-hidden">
              {c.stats.map((s) => (
                <div key={s.label} className="px-3 py-4 sm:py-5 text-center">
                  <p className="text-base sm:text-xl font-black mb-0.5 leading-tight break-words">{s.n}</p>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-primary-foreground/55 leading-tight">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Bottom curve into white */}
        <div className="absolute bottom-0 left-0 right-0 leading-none">
          <svg viewBox="0 0 1440 28" className="w-full" style={{ display: "block" }} preserveAspectRatio="none">
            <path d="M0,28 C480,0 960,0 1440,28 L1440,28 L0,28 Z" fill="hsl(var(--background))" />
          </svg>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-5 sm:pb-6 space-y-5 sm:space-y-6">

        {/* Highlights — inline text columns, no heavy cards */}
        <section className="grid sm:grid-cols-3 gap-4 sm:gap-6">
          {c.highlights.map((h) => (
            <div key={h.title} className="flex gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
              <div>
                <h3 className="text-sm font-bold text-foreground mb-0.5">{h.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{h.body}</p>
              </div>
            </div>
          ))}
        </section>

        {/* Areas — top 6 only */}
        <section className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-accent mr-1">
            {locale === "ru" ? "Районы" : locale === "ar" ? "المناطق" : locale === "zh" ? "地区" : locale === "vi" ? "Khu vực" : "Areas"}
          </span>
          {c.areas.slice(0, 6).map((area, i) => (
            <Link
              key={area}
              href={`${searchUrl}&locations=${encodeURIComponent(areaValue(i))}`}
              className="bg-card border border-border/50 rounded-full px-3.5 py-1.5 text-xs font-semibold text-foreground hover:border-primary/30 hover:text-primary transition-all"
            >
              {area}
            </Link>
          ))}
          {c.areas.length > 6 && (
            <Link href={searchUrl} className="text-xs text-muted-foreground hover:text-primary transition-colors">
              +{c.areas.length - 6}
            </Link>
          )}
        </section>

      </div>

      {/* ── Embedded search: full-width filter bar on top, then results beside the
            guide sidebar (sidebar injected into the search client so it sits next
            to the listings instead of being buried far below them) ── */}
      {searchSlot && (
        <div className="border-t border-border/30 bg-muted/20">
          {React.isValidElement(searchSlot)
            ? React.cloneElement(searchSlot as React.ReactElement<{ sidebarSlot?: React.ReactNode }>, {
                sidebarSlot: <PropertyTypeSidebar locale={locale} slug={slug} />,
              })
            : searchSlot}
        </div>
      )}

      {/* ── FAQ + CTA, full-width below the search ── */}
      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-10 sm:py-16">

        {/* Main column: FAQ + CTA */}
        <div className="min-w-0 space-y-12 sm:space-y-16">

            {/* FAQ */}
            <section>
          <div className="text-center mb-8 sm:mb-10">
            <p className="text-accent font-bold tracking-[0.35em] uppercase text-xs mb-3">FAQ</p>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              {locale === "ru" ? "Частые вопросы" : locale === "ar" ? "الأسئلة الشائعة" : locale === "zh" ? "常见问题" : locale === "vi" ? "Câu hỏi thường gặp" : "Frequently Asked Questions"}
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
                {locale === "ru" ? "Консультация" : locale === "ar" ? "استشارة" : locale === "zh" ? "咨询" : locale === "vi" ? "Nhận tư vấn chuyên gia" : "Get Expert Advice"}
              </Link>
            </div>
          </div>
        </section>

        </div>

      </div>

      <Footer />
    </div>
  );
}
