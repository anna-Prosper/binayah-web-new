"use client";

import { useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { motion } from "framer-motion";
import { BookOpen, Clock, Eye, ArrowRight, Search, Activity, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { PULSE_GUIDES, type PulseGuide } from "@/lib/pulse-guides";

// Curated filter order — most useful clusters first; only categories that
// actually exist in the data are shown.
const CATEGORY_ORDER = [
  "Investment",
  "Deep Dive",
  "Financing",
  "How To",
  "Comparison",
  "Renting",
  "Legal & Process",
  "Market Analysis",
];

type Tx = ReturnType<typeof useTranslations<"pulseGuides">>;

export default function GuidesClient() {
  const t = useTranslations("pulseGuides");
  const locale = useLocale();
  const [active, setActive] = useState<string>("all");
  const [query, setQuery] = useState("");

  // Resolve translated title/description once so we can search and render.
  const guides = useMemo(
    () =>
      PULSE_GUIDES.map((g) => ({
        guide: g,
        title: t(g.titleKey as Parameters<Tx>[0]),
        description: t(g.descriptionKey as Parameters<Tx>[0]),
      })),
    [t]
  );

  const categories = useMemo(() => {
    const present = new Set(PULSE_GUIDES.map((g) => g.category));
    const ordered = CATEGORY_ORDER.filter((c) => present.has(c));
    // append any category not in the curated list, just in case
    for (const c of present) if (!ordered.includes(c)) ordered.push(c);
    return ordered.map((c) => ({
      key: c,
      label: t(`category_${c.replace(/\s/g, "")}` as Parameters<Tx>[0]),
      count: PULSE_GUIDES.filter((g) => g.category === c).length,
    }));
  }, [t]);

  const q = query.trim().toLowerCase();
  const filtered = useMemo(
    () =>
      guides.filter(({ guide, title, description }) => {
        if (active !== "all" && guide.category !== active) return false;
        if (q && !`${title} ${description}`.toLowerCase().includes(q)) return false;
        return true;
      }),
    [guides, active, q]
  );

  const liveCount = PULSE_GUIDES.filter((g) => g.area).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="h-5 w-5 text-accent" />
          <p className="text-accent font-semibold tracking-[0.3em] uppercase text-xs">{t("label")}</p>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold text-foreground mb-3 tracking-tight">
          {t("title")} <span className="font-light">{t("titleItalic")}</span>
        </h1>
        <p className="text-muted-foreground max-w-2xl text-base sm:text-lg">{t("subtitle")}</p>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-4 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{PULSE_GUIDES.length} {t("guidesWord")}</span>
          {liveCount > 0 && (
            <>
              <span className="text-border">·</span>
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 text-accent font-semibold">
                  <Activity className="h-3.5 w-3.5" /> {liveCount}
                </span>
                {t("guidesWithLiveData")}
              </span>
            </>
          )}
        </div>
      </motion.div>

      {/* ── Controls: search + category filter ───────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="mb-8 space-y-4"
      >
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="w-full rounded-full border border-border/60 bg-card pl-10 pr-10 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none focus:border-accent/60 focus:ring-2 focus:ring-accent/15 transition-all"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <FilterPill label={t("allGuides")} count={PULSE_GUIDES.length} active={active === "all"} onClick={() => setActive("all")} />
          {categories.map((c) => (
            <FilterPill key={c.key} label={c.label} count={c.count} active={active === c.key} onClick={() => setActive(c.key)} />
          ))}
        </div>
      </motion.div>

      {/* ── Grid ─────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground">{t("noResults")}</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {filtered.map(({ guide, title, description }) => (
            <GuideCard key={guide.slug} guide={guide} title={title} description={description} locale={locale} t={t} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterPill({ label, count, active, onClick }: { label: string; count: number; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold border transition-all ${
        active
          ? "bg-accent text-accent-foreground border-accent shadow-sm"
          : "bg-card text-muted-foreground border-border/60 hover:border-accent/40 hover:text-foreground"
      }`}
    >
      {label}
      <span className={`text-[10px] font-bold ${active ? "text-accent-foreground/70" : "text-muted-foreground/60"}`}>{count}</span>
    </button>
  );
}

function GuideCard({
  guide,
  title,
  description,
  locale,
  t,
}: {
  guide: PulseGuide;
  title: string;
  description: string;
  locale: string;
  t: Tx;
}) {
  const href = `/${locale}/pulse/guides/${guide.slug}`;
  const category = t(`category_${guide.category.replace(/\s/g, "")}` as Parameters<Tx>[0]);

  return (
    <Link
      href={href}
      className="group flex flex-col h-full bg-card border border-border/50 rounded-2xl overflow-hidden hover:border-accent/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
    >
      {/* Cover image */}
      <div className="relative w-full aspect-[16/10] overflow-hidden bg-muted">
        {guide.heroImage && (
          <Image
            src={guide.heroImage.url}
            alt={guide.heroImage.alt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-black/10" />
        <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider text-white bg-black/35 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/15">
          {category}
        </span>
        {guide.area && (
          <span className="absolute top-3 right-3 inline-flex items-center gap-1 text-[10px] font-bold text-accent-foreground bg-accent/95 px-2 py-1 rounded-full shadow-sm">
            <Activity className="h-3 w-3" />
            {t("liveData")}
          </span>
        )}
      </div>

      <div className="flex flex-col flex-1 p-5">
        <h2 className="text-base font-bold text-foreground leading-snug mb-2 group-hover:text-accent transition-colors">
          {title}
        </h2>
        <p className="text-sm text-muted-foreground line-clamp-2 flex-1">{description}</p>

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/40">
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {guide.readTime}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {guide.views.toLocaleString()}
            </span>
          </div>
          <span className="flex items-center gap-1 text-xs font-semibold text-accent group-hover:gap-2 transition-all">
            {t("readMore")}
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
