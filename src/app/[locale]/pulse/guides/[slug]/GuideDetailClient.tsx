"use client";

import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { motion } from "framer-motion";
import { Clock, Eye, ArrowLeft, ArrowRight, MapPin, ExternalLink, Building2, TrendingUp } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { PulseGuide } from "@/lib/pulse-guides";
import type { AreaStats } from "@/lib/area-stats";

// ── Static curated related areas (Dubai focus) ─────────────────────────────
// TODO: Replace with dynamic DLD data from /api/dld/areas?limit=3 when embedded
// stats blocks are added in a future iteration (deferred per diff-cap constraint).
const CURATED_AREAS = [
  { name: "Dubai Marina", slug: "dubai-marina" },
  { name: "Downtown Dubai", slug: "downtown-dubai" },
  { name: "Jumeirah Village Circle", slug: "jvc" },
];

const FAQ_TITLE: Record<string, string> = {
  en: "Frequently Asked Questions",
  ar: "الأسئلة الشائعة",
  zh: "常见问题",
  ru: "Частые вопросы",
  vi: "Câu hỏi thường gặp",
  he: "שאלות נפוצות",
  fr: "Questions fréquentes",
};

// ── Simple markdown-lite renderer ─────────────────────────────────────────
// Only supports: **bold**, paragraphs, # headings (lines starting with #),
// table rows (| col | col |), and bullet lists (- item).

function renderBody(text: string): React.ReactNode[] {
  const lines = text.split("\n");
  const nodes: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Blank line
    if (line.trim() === "") {
      i++;
      continue;
    }

    // Heading — h1 > h2 > h3 hierarchy: explicit size overrides
    if (line.startsWith("### ")) {
      nodes.push(
        <h3 key={i} className="text-base font-bold text-foreground mt-6 mb-2">
          {line.slice(4)}
        </h3>
      );
      i++;
      continue;
    }
    if (line.startsWith("## ")) {
      nodes.push(
        <h2 key={i} className="text-xl font-bold text-foreground mt-8 mb-3 leading-snug">
          {line.slice(3)}
        </h2>
      );
      i++;
      continue;
    }
    if (line.startsWith("# ")) {
      nodes.push(
        <h2 key={i} className="text-2xl sm:text-3xl font-bold text-foreground mt-10 mb-4 leading-tight">
          {line.slice(2)}
        </h2>
      );
      i++;
      continue;
    }

    // Table (lines starting with |)
    if (line.startsWith("|")) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].startsWith("|")) {
        if (!lines[i].includes("---")) tableLines.push(lines[i]);
        i++;
      }
      if (tableLines.length > 0) {
        const parseRow = (row: string) =>
          row.split("|").map((c) => c.trim()).filter(Boolean);
        const [header, ...body] = tableLines;
        nodes.push(
          <div key={`table-${i}`} className="overflow-x-auto my-5">
            <table className="w-full text-sm border border-border/50 rounded-xl overflow-hidden">
              <thead>
                <tr className="bg-muted/50">
                  {parseRow(header).map((cell, ci) => (
                    <th key={ci} className="px-4 py-2.5 text-left text-xs font-bold text-foreground">{cell}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {body.map((row, ri) => (
                  <tr key={ri} className="border-t border-border/30">
                    {parseRow(row).map((cell, ci) => (
                      <td key={ci} className="px-4 py-2.5 text-xs text-muted-foreground">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      continue;
    }

    // Bullet list
    if (line.startsWith("- ")) {
      const items: string[] = [];
      while (i < lines.length && lines[i].startsWith("- ")) {
        items.push(lines[i].slice(2));
        i++;
      }
      nodes.push(
        <ul key={`ul-${i}`} className="my-3 space-y-1.5 pl-4">
          {items.map((item, ii) => (
            <li key={ii} className="text-muted-foreground text-sm flex gap-2 before:content-['·'] before:text-accent before:font-bold">
              {renderInline(item)}
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Numbered list
    if (/^\d+\.\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s/, ""));
        i++;
      }
      nodes.push(
        <ol key={`ol-${i}`} className="my-3 space-y-1.5 pl-4 list-decimal list-inside">
          {items.map((item, ii) => (
            <li key={ii} className="text-muted-foreground text-sm">
              {renderInline(item)}
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // Paragraph
    nodes.push(
      <p key={i} className="text-muted-foreground leading-relaxed mb-4">
        {renderInline(line)}
      </p>
    );
    i++;
  }

  return nodes;
}

function renderInline(text: string): React.ReactNode {
  // Handle **bold**
  const parts = text.split(/\*\*([^*]+)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i} className="font-semibold text-foreground">{part}</strong> : part
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

const AED = (n: number) => {
  if (n >= 1_000_000) return `AED ${(n / 1_000_000).toFixed(n >= 10_000_000 ? 1 : 2)}M`;
  if (n >= 1000) return `AED ${Math.round(n).toLocaleString("en-AE")}`;
  return `AED ${n}`;
};

const STATS_LABELS: Record<string, { title: string; ppsf: string; avg: string; yield: string; txns: string; bldgs: string; note: string }> = {
  en: { title: "Live market snapshot", ppsf: "Avg price / sqft", avg: "Avg transaction price", yield: "Gross rental yield", txns: "Recent transactions", bldgs: "Buildings tracked", note: "Live Dubai Land Department transaction data. Average transaction price spans all unit types, so use price per sqft for like-for-like comparison." },
  ru: { title: "Актуальные данные рынка", ppsf: "Цена за кв. фут", avg: "Средняя цена сделки", yield: "Валовая доходность", txns: "Недавние сделки", bldgs: "Зданий в базе", note: "Данные о сделках Земельного департамента Дубая. Средняя цена сделки включает все типы юнитов — для сравнения используйте цену за кв. фут." },
  ar: { title: "لمحة سوقية حية", ppsf: "متوسط السعر / قدم²", avg: "متوسط سعر الصفقة", yield: "العائد الإيجاري الإجمالي", txns: "الصفقات الأخيرة", bldgs: "المباني المتتبعة", note: "بيانات صفقات دائرة الأراضي والأملاك بدبي. متوسط سعر الصفقة يشمل كل أنواع الوحدات، لذا استخدم السعر لكل قدم² للمقارنة." },
  zh: { title: "实时市场快照", ppsf: "每平方英尺均价", avg: "平均成交价", yield: "毛租金收益率", txns: "近期成交", bldgs: "覆盖楼盘", note: "迪拜土地局实时成交数据。平均成交价涵盖所有户型，比较请以每平方英尺价格为准。" },
  vi: { title: "Ảnh chụp thị trường trực tiếp", ppsf: "Giá TB / foot²", avg: "Giá giao dịch TB", yield: "Lợi suất cho thuê gộp", txns: "Giao dịch gần đây", bldgs: "Toà nhà theo dõi", note: "Dữ liệu giao dịch từ Sở Đất đai Dubai. Giá giao dịch trung bình gồm mọi loại căn, hãy dùng giá mỗi foot² để so sánh." },
  he: { title: "תמונת שוק חיה", ppsf: "מחיר ממוצע / רגל²", avg: "מחיר עסקה ממוצע", yield: "תשואת שכירות ברוטו", txns: "עסקאות אחרונות", bldgs: "בניינים במעקב", note: "נתוני עסקאות מרשות המקרקעין של דובאי. מחיר העסקה הממוצע כולל כל סוגי היחידות — להשוואה השתמשו במחיר לרגל²." },
  fr: { title: "Aperçu du marché en direct", ppsf: "Prix moyen / pied²", avg: "Prix de transaction moyen", yield: "Rendement locatif brut", txns: "Transactions récentes", bldgs: "Immeubles suivis", note: "Données de transactions du Dubai Land Department. Le prix moyen couvre tous les types de biens ; utilisez le prix au pied² pour comparer." },
};

function LiveAreaStats({ stats, locale }: { stats: AreaStats; locale: string }) {
  const l = STATS_LABELS[locale] ?? STATS_LABELS.en;
  const tiles: { label: string; value: string }[] = [];
  if (stats.pricePerSqft) tiles.push({ label: l.ppsf, value: `AED ${stats.pricePerSqft.toLocaleString("en-AE")}` });
  if (stats.grossYield) tiles.push({ label: l.yield, value: `${stats.grossYield}%` });
  if (stats.avgPrice) tiles.push({ label: l.avg, value: AED(stats.avgPrice) });
  if (stats.transactions) tiles.push({ label: l.txns, value: stats.transactions.toLocaleString("en-AE") });
  if (stats.buildings) tiles.push({ label: l.bldgs, value: stats.buildings.toLocaleString("en-AE") });
  if (tiles.length === 0) return null;
  const updated = stats.updatedAt ? new Date(stats.updatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.12 }}
      className="mb-8 rounded-2xl border border-border/50 bg-card p-5 sm:p-6"
    >
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-accent" />
          {l.title}{stats.area ? ` — ${stats.area}` : ""}
        </h2>
        {updated && <span className="text-[11px] text-muted-foreground whitespace-nowrap">{updated}</span>}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {tiles.map((tile) => (
          <div key={tile.label} className="rounded-xl bg-muted/40 border border-border/40 px-3 py-3">
            <div className="text-lg sm:text-xl font-bold text-foreground leading-tight">{tile.value}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{tile.label}</div>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-muted-foreground/80 mt-3 leading-relaxed">{l.note}</p>
    </motion.div>
  );
}

export default function GuideDetailClient({ guide, areaStats }: { guide: PulseGuide; areaStats?: AreaStats | null }) {
  const t = useTranslations("pulseGuides");
  const locale = useLocale();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      {/* ── Back link ────────────────────────────────────────── */}
      <Link
        href={`/${locale}/pulse/guides`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("backToGuides")}
      </Link>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <div className="flex items-center flex-wrap gap-3 mb-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-accent bg-accent/10 px-2.5 py-1 rounded-full">
            {t(`category_${guide.category.replace(/\s/g, "")}` as Parameters<typeof t>[0])}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            {guide.readTime}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Eye className="h-3.5 w-3.5" />
            {guide.views.toLocaleString()} {t("views")}
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-foreground leading-tight mb-3">
          {t(guide.titleKey as Parameters<typeof t>[0])}
        </h1>
        <p className="text-lg text-muted-foreground">
          {t(guide.descriptionKey as Parameters<typeof t>[0])}
        </p>
      </motion.div>

      {/* ── Hero image ───────────────────────────────────────── */}
      {guide.heroImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden mb-8 border border-border/40"
        >
          <Image
            src={guide.heroImage.url}
            alt={guide.heroImage.alt}
            fill
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
            priority
          />
        </motion.div>
      )}

      {/* ── Live area stats (area guides only) ───────────────── */}
      {areaStats && <LiveAreaStats stats={areaStats} locale={locale} />}

      {/* ── Divider ──────────────────────────────────────────── */}
      <div
        className="h-[2px] w-16 rounded-full mb-8"
        style={{ background: "hsl(43, 60%, 55%)" }}
      />

      {/* ── Body ─────────────────────────────────────────────── */}
      <motion.article
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="prose-sm max-w-none"
      >
        {renderBody(guide.body)}
      </motion.article>

      {/* ── FAQ ──────────────────────────────────────────────── */}
      {guide.faq && guide.faq.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 pt-8 border-t border-border/40"
        >
          <h2 className="text-xl font-bold text-foreground mb-5">{FAQ_TITLE[locale] ?? FAQ_TITLE.en}</h2>
          <div className="space-y-2">
            {guide.faq.map((item, i) => (
              <details key={i} className="group bg-card border border-border/50 rounded-2xl overflow-hidden hover:border-accent/30 transition-colors">
                <summary className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5 cursor-pointer list-none font-semibold text-sm text-foreground hover:text-accent transition-colors">
                  <span>{item.question}</span>
                  <span className="text-accent text-lg font-light flex-shrink-0 transition-transform duration-200 group-open:rotate-45">+</span>
                </summary>
                <div className="px-4 sm:px-5 pb-4 pt-1 text-sm text-muted-foreground leading-relaxed border-t border-border/30">{item.answer}</div>
              </details>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Related Communities ───────────────────────────────── */}
      {guide.relatedCommunities.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 pt-8 border-t border-border/40"
        >
          <h2 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-accent" />
            {t("relatedCommunities")}
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {guide.relatedCommunities.map((community) => (
              <Link
                key={community}
                href={`/${locale}/communities`}
                className="group flex flex-col items-center justify-center bg-card border border-border/50 rounded-xl p-3 hover:border-accent/40 hover:shadow-sm transition-all text-center"
              >
                <p className="text-xs font-semibold text-foreground group-hover:text-accent transition-colors leading-snug">{community}</p>
                <ExternalLink className="h-3 w-3 text-muted-foreground/40 mt-1.5 group-hover:text-accent transition-colors" />
              </Link>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Related Areas footer ─────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-12 pt-8 border-t border-border/40"
      >
        <h2 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
          <Building2 className="h-4 w-4 text-accent" />
          {t("relatedAreas")}
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {CURATED_AREAS.map((area) => (
            <Link
              key={area.slug}
              href={`/${locale}/communities/${area.slug}`}
              className="group flex flex-col items-center justify-center bg-card border border-border/50 rounded-xl p-3 hover:border-accent/40 hover:shadow-sm transition-all text-center"
            >
              <p className="text-xs font-semibold text-foreground group-hover:text-accent transition-colors leading-snug">{area.name}</p>
              <ExternalLink className="h-3 w-3 text-muted-foreground/40 mt-1.5 group-hover:text-accent transition-colors" />
            </Link>
          ))}
        </div>
      </motion.div>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-10 bg-muted/30 border border-border/40 rounded-2xl p-6 text-center"
      >
        <h3 className="font-bold text-foreground mb-2">{t("ctaTitle")}</h3>
        <p className="text-sm text-muted-foreground mb-4">{t("ctaSub")}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href={`/${locale}/contact`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm hover:shadow-md transition-all"
            style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
          >
            {t("ctaContact")}
          </Link>
          <Link
            href={`/${locale}/pulse/calculator`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border border-border/60 bg-card hover:border-accent/40 transition-all"
          >
            {t("ctaCalculator")}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
