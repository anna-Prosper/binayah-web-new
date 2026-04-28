"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { BookOpen, Clock, Eye, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { PULSE_GUIDES } from "@/lib/pulse-guides";

export default function GuidesClient() {
  const t = useTranslations("pulseGuides");
  const locale = useLocale();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-10"
      >
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="h-5 w-5 text-accent" />
          <p className="text-accent font-semibold tracking-[0.3em] uppercase text-xs">{t("label")}</p>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
          {t("title")} <span className="italic font-light">{t("titleItalic")}</span>
        </h1>
        <p className="text-muted-foreground max-w-2xl">{t("subtitle")}</p>
      </motion.div>

      {/* ── Grid ─────────────────────────────────────────────────── */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {PULSE_GUIDES.map((guide, i) => (
          <motion.div
            key={guide.slug}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
          >
            <GuideCard guide={guide} locale={locale} t={t} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function GuideCard({
  guide,
  locale,
  t,
}: {
  guide: typeof PULSE_GUIDES[0];
  locale: string;
  t: ReturnType<typeof useTranslations<"pulseGuides">>;
}) {
  const href = `/${locale}/pulse/guides/${guide.slug}`;

  return (
    <Link
      href={href}
      className="group flex flex-col h-full bg-card border border-border/50 rounded-2xl p-5 hover:border-accent/40 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-150"
    >
      {/* Category pill */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] font-bold uppercase tracking-wider text-accent bg-accent/10 px-2.5 py-1 rounded-full">
          {t(`category_${guide.category.replace(/\s/g, "")}` as keyof ReturnType<typeof useTranslations<"pulseGuides">>)}
        </span>
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {guide.readTime}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {guide.views.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Title */}
      <h2 className="text-base font-bold text-foreground leading-snug mb-2 group-hover:text-accent transition-colors">
        {t(guide.titleKey as keyof ReturnType<typeof useTranslations<"pulseGuides">>)}
      </h2>

      {/* Description */}
      <p className="text-sm text-muted-foreground line-clamp-2 flex-1 mb-4">
        {t(guide.descriptionKey as keyof ReturnType<typeof useTranslations<"pulseGuides">>)}
      </p>

      {/* CTA */}
      <div className="flex items-center gap-1.5 text-sm font-semibold text-accent group-hover:gap-2.5 transition-all mt-auto">
        {t("readMore")}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
}
