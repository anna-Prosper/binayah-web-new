"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { motion } from "framer-motion";
import { Clock, Eye, ArrowLeft, ArrowRight, MapPin, ExternalLink, Building2, TrendingUp, List, BookOpen, Calendar, Phone } from "lucide-react";
// Locale-aware Link (next-intl): plain next/link emits bare hrefs, which
// localePrefix "as-needed" resolves to the DEFAULT locale — dropping non-English
// readers back into English. This variant prefixes hrefs with the active locale.
import { Link } from "@/navigation";
import Image from "next/image";
import type { PulseGuide } from "@/lib/pulse-guides";
import type { AreaStats } from "@/lib/area-stats";
import NewsletterStrip from "@/components/NewsletterStrip";

// ── Static curated related areas (Dubai focus) ─────────────────────────────
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

// Inline i18n for the few new UI labels (matches the STATS_LABELS/FAQ_TITLE
// pattern — keeps the 7 message files untouched).
const UI: Record<string, { onThisPage: string; relatedGuides: string; guideLabel: string }> = {
  en: { onThisPage: "On this page", relatedGuides: "Related guides", guideLabel: "Guide" },
  ru: { onThisPage: "На этой странице", relatedGuides: "Похожие руководства", guideLabel: "Руководство" },
  ar: { onThisPage: "في هذه الصفحة", relatedGuides: "أدلة ذات صلة", guideLabel: "دليل" },
  zh: { onThisPage: "本页内容", relatedGuides: "相关指南", guideLabel: "指南" },
  vi: { onThisPage: "Trong trang này", relatedGuides: "Hướng dẫn liên quan", guideLabel: "Hướng dẫn" },
  he: { onThisPage: "בעמוד זה", relatedGuides: "מדריכים קשורים", guideLabel: "מדריך" },
  fr: { onThisPage: "Sur cette page", relatedGuides: "Guides connexes", guideLabel: "Guide" },
};

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);
}

// ── Simple markdown-lite renderer ─────────────────────────────────────────
// Supports: **bold**, paragraphs, # / ## / ### headings, | tables |, - bullets,
// numbered lists. h1/h2 get slug ids + scroll-margin so the sidebar TOC can
// deep-link to them beneath the sticky navbar.
function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Auto-link community names in guide prose to their community page. Only the
// FIRST mention of each community is linked (via the shared `seen` set) so the
// copy isn't peppered with repeated links. The name set is the guide's own
// relatedCommunities, so matches are intentional (no stray word linking).
function linkCommunities(
  text: string,
  communities: string[],
  locale: string,
  seen: Set<string>,
): React.ReactNode {
  if (!communities?.length || !text) return text;
  const names = [...new Set(communities.map((c) => c.trim()).filter(Boolean))]
    .sort((a, b) => b.length - a.length); // longest first: "Dubai Marina" before "Dubai"
  const rx = new RegExp(`\\b(${names.map(escapeRe).join("|")})\\b`, "gi");
  const out: React.ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = rx.exec(text)) !== null) {
    const matched = m[0];
    const canonical = names.find((n) => n.toLowerCase() === matched.toLowerCase()) || matched;
    const key = canonical.toLowerCase();
    if (seen.has(key)) continue; // already linked earlier — leave as plain text
    seen.add(key);
    if (m.index > last) out.push(text.slice(last, m.index));
    out.push(
      <Link
        key={`c-${key}-${k++}`}
        href={`/${locale}/communities/${slugify(canonical)}`}
        className="font-medium text-primary underline decoration-primary/30 underline-offset-2 hover:decoration-primary"
      >
        {matched}
      </Link>,
    );
    last = m.index + matched.length;
  }
  if (out.length === 0) return text;
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function renderBody(text: string, communities: string[], locale: string): React.ReactNode[] {
  const lines = text.split("\n");
  const nodes: React.ReactNode[] = [];
  const seen = new Set<string>();
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === "") {
      i++;
      continue;
    }

    if (line.startsWith("### ")) {
      nodes.push(
        <h3 key={i} className="text-lg font-bold text-foreground mt-7 mb-2">
          {linkCommunities(line.slice(4), communities, locale, new Set())}
        </h3>
      );
      i++;
      continue;
    }
    if (line.startsWith("## ")) {
      const txt = line.slice(3);
      nodes.push(
        <h2 key={i} id={slugify(txt)} className="scroll-mt-24 text-xl sm:text-2xl font-bold text-foreground mt-10 mb-3 leading-snug">
          {linkCommunities(txt, communities, locale, new Set())}
        </h2>
      );
      i++;
      continue;
    }
    if (line.startsWith("# ")) {
      const txt = line.slice(2);
      nodes.push(
        <h2 key={i} id={slugify(txt)} className="scroll-mt-24 text-2xl sm:text-3xl font-bold text-foreground mt-12 mb-4 leading-tight">
          {linkCommunities(txt, communities, locale, new Set())}
        </h2>
      );
      i++;
      continue;
    }

    if (line.startsWith("|")) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].startsWith("|")) {
        if (!lines[i].includes("---")) tableLines.push(lines[i]);
        i++;
      }
      if (tableLines.length > 0) {
        const parseRow = (row: string) => row.split("|").map((c) => c.trim()).filter(Boolean);
        const [header, ...body] = tableLines;
        nodes.push(
          <div key={`table-${i}`} className="overflow-x-auto my-6">
            <table className="w-full text-sm border border-border/50 rounded-xl overflow-hidden">
              <thead>
                <tr className="bg-muted/50">
                  {parseRow(header).map((cell, ci) => (
                    <th key={ci} className="px-4 py-2.5 text-left text-xs font-bold text-foreground">{renderInline(cell, communities, locale, seen)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {body.map((row, ri) => (
                  <tr key={ri} className="border-t border-border/30">
                    {parseRow(row).map((cell, ci) => (
                      <td key={ci} className="px-4 py-2.5 text-[13px] text-muted-foreground">{renderInline(cell, communities, locale, seen)}</td>
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

    if (line.startsWith("- ")) {
      const items: string[] = [];
      while (i < lines.length && lines[i].startsWith("- ")) {
        items.push(lines[i].slice(2));
        i++;
      }
      nodes.push(
        <ul key={`ul-${i}`} className="my-4 space-y-2 pl-1">
          {items.map((item, ii) => (
            <li key={ii} className="text-[15px] sm:text-base text-muted-foreground leading-relaxed flex gap-2.5 before:content-['·'] before:text-accent before:font-bold before:text-lg before:leading-none before:mt-0.5">
              <span>{renderInline(item, communities, locale, seen)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    if (/^\d+\.\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s/, ""));
        i++;
      }
      nodes.push(
        <ol key={`ol-${i}`} className="my-4 space-y-2 pl-5 list-decimal marker:text-accent marker:font-bold">
          {items.map((item, ii) => (
            <li key={ii} className="text-[15px] sm:text-base text-muted-foreground leading-relaxed pl-1">
              {renderInline(item, communities, locale, seen)}
            </li>
          ))}
        </ol>
      );
      continue;
    }

    nodes.push(
      <p key={i} className="text-[15px] sm:text-base text-muted-foreground leading-relaxed mb-4">
        {renderInline(line, communities, locale, seen)}
      </p>
    );
    i++;
  }

  return nodes;
}

function renderInline(text: string, communities: string[], locale: string, seen: Set<string>): React.ReactNode {
  const parts = text.split(/\*\*([^*]+)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1
      ? <strong key={i} className="font-semibold text-foreground">{linkCommunities(part, communities, locale, seen)}</strong>
      : <React.Fragment key={i}>{linkCommunities(part, communities, locale, seen)}</React.Fragment>
  );
}

// Extract h1/h2 headings for the sidebar table of contents.
function extracttoc(text: string): { id: string; title: string }[] {
  return text
    .split("\n")
    .filter((l) => l.startsWith("# ") || l.startsWith("## "))
    .map((l) => l.replace(/^#{1,2}\s/, ""))
    .map((title) => ({ id: slugify(title), title }));
}

// ── Live area stats ────────────────────────────────────────────────────────
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
    <div className="mb-8 rounded-2xl border border-border/50 bg-card p-5 sm:p-6">
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
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function GuideDetailClient({
  guide,
  areaStats,
  published,
  relatedGuides,
}: {
  guide: PulseGuide;
  areaStats?: AreaStats | null;
  published?: string;
  relatedGuides: PulseGuide[];
}) {
  const t = useTranslations("pulseGuides");
  const locale = useLocale();
  const ui = UI[locale] ?? UI.en;

  const title = t(guide.titleKey as Parameters<typeof t>[0]);
  const description = t(guide.descriptionKey as Parameters<typeof t>[0]);
  const category = t(`category_${guide.category.replace(/\s/g, "")}` as Parameters<typeof t>[0]);
  const toc = extracttoc(guide.body);
  const publishedLabel = published
    ? new Date(published).toLocaleDateString(locale === "en" ? "en-GB" : locale, { day: "numeric", month: "short", year: "numeric" })
    : null;

  return (
    <div className="bg-background">
      {/* ── Hero band ────────────────────────────────────────── */}
      <section className="relative w-full h-[340px] sm:h-[400px] md:h-[460px] overflow-hidden flex items-end">
        <div className="absolute inset-0">
          {guide.heroImage ? (
            <Image src={guide.heroImage.url} alt={guide.heroImage.alt} fill sizes="100vw" className="object-cover" priority />
          ) : (
            <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }} />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/20" />
        </div>

        {/* Title block */}
        <div className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 pb-8 sm:pb-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="flex items-center flex-wrap gap-x-4 gap-y-2 mb-4">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-accent text-accent-foreground px-3 py-1 rounded-lg">
                {category}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-white/70"><Clock className="h-3.5 w-3.5" /> {guide.readTime}</span>
              {publishedLabel && <span className="flex items-center gap-1.5 text-xs text-white/70"><Calendar className="h-3.5 w-3.5" /> {publishedLabel}</span>}
              <span className="flex items-center gap-1.5 text-xs text-white/70"><Eye className="h-3.5 w-3.5" /> {guide.views.toLocaleString()} {t("views")}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight max-w-3xl">{title}</h1>
            <p className="text-base sm:text-lg text-white/80 mt-3 max-w-2xl leading-relaxed">{description}</p>
          </motion.div>
        </div>
      </section>

      {/* ── Content + sidebar ────────────────────────────────── */}
      <section className="py-8 sm:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-10 lg:gap-14">
            {/* Main */}
            <div className="min-w-0">
              {areaStats && <LiveAreaStats stats={areaStats} locale={locale} />}

              <div className="h-[2px] w-16 rounded-full mb-8" style={{ background: "hsl(43, 60%, 55%)" }} />

              <motion.article
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="max-w-none"
              >
                {renderBody(guide.body, guide.relatedCommunities, locale)}
              </motion.article>

              {/* FAQ */}
              {guide.faq && guide.faq.length > 0 && (
                <div className="mt-12 pt-8 border-t border-border/40">
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-5">{FAQ_TITLE[locale] ?? FAQ_TITLE.en}</h2>
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
                </div>
              )}

              {/* Related communities */}
              {guide.relatedCommunities.length > 0 && (
                <div className="mt-12 pt-8 border-t border-border/40">
                  <h2 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-accent" />
                    {t("relatedCommunities")}
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {guide.relatedCommunities.map((community) => (
                      <Link
                        key={community}
                        href={`/${locale}/communities/${slugify(community)}`}
                        className="group flex flex-col items-center justify-center bg-card border border-border/50 rounded-xl p-3 hover:border-accent/40 hover:shadow-sm transition-all text-center"
                      >
                        <p className="text-xs font-semibold text-foreground group-hover:text-accent transition-colors leading-snug">{community}</p>
                        <ExternalLink className="h-3 w-3 text-muted-foreground/40 mt-1.5 group-hover:text-accent transition-colors" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Back link */}
              <div className="mt-12">
                <Link href={`/${locale}/pulse/guides`} className="inline-flex items-center gap-2 text-primary font-semibold hover:underline">
                  <ArrowLeft className="h-4 w-4" /> {t("backToGuides")}
                </Link>
              </div>
            </div>

            {/* Sidebar */}
            <aside className="lg:sticky lg:top-24 self-start space-y-5">
              {/* Advisor CTA */}
              <div className="rounded-2xl p-6 text-primary-foreground" style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}>
                <div className="w-10 h-10 rounded-xl bg-accent/90 flex items-center justify-center mb-4">
                  <Phone className="h-5 w-5 text-accent-foreground" />
                </div>
                <h3 className="font-bold text-white mb-1.5">{t("ctaTitle")}</h3>
                <p className="text-sm text-white/70 mb-4 leading-relaxed">{t("ctaSub")}</p>
                <div className="space-y-2.5">
                  <Link href={`/${locale}/contact`} className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-semibold bg-accent text-accent-foreground hover:opacity-90 transition-opacity">
                    {t("ctaContact")}
                  </Link>
                  <Link href={`/${locale}/pulse/calculator`} className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-semibold bg-white/10 text-white hover:bg-white/15 transition-colors">
                    {t("ctaCalculator")} <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>

              {/* Table of contents */}
              {toc.length > 1 && (
                <div className="rounded-2xl border border-border/50 bg-card p-5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                    <List className="h-3.5 w-3.5 text-accent" />
                    {ui.onThisPage}
                  </h3>
                  <nav className="space-y-1.5">
                    {toc.map((h) => (
                      <a key={h.id} href={`#${h.id}`} className="block text-sm text-muted-foreground hover:text-accent transition-colors leading-snug py-0.5 border-l-2 border-border/50 hover:border-accent pl-3">
                        {h.title}
                      </a>
                    ))}
                  </nav>
                </div>
              )}

              {/* Related guides */}
              {relatedGuides.length > 0 && (
                <div className="rounded-2xl border border-border/50 bg-card p-5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                    <BookOpen className="h-3.5 w-3.5 text-accent" />
                    {ui.relatedGuides}
                  </h3>
                  <div className="space-y-3">
                    {relatedGuides.map((g) => (
                      <Link key={g.slug} href={`/${locale}/pulse/guides/${g.slug}`} className="group block">
                        <p className="text-sm font-semibold text-foreground group-hover:text-accent transition-colors leading-snug">
                          {t(g.titleKey as Parameters<typeof t>[0])}
                        </p>
                        <span className="flex items-center gap-1 text-[11px] text-muted-foreground mt-1">
                          <Clock className="h-3 w-3" /> {g.readTime}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular areas */}
              <div className="rounded-2xl border border-border/50 bg-card p-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                  <Building2 className="h-3.5 w-3.5 text-accent" />
                  {t("relatedAreas")}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {CURATED_AREAS.map((area) => (
                    <Link
                      key={area.slug}
                      href={`/${locale}/communities/${area.slug}`}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-muted/50 text-foreground hover:bg-accent/10 hover:text-accent transition-colors"
                    >
                      {area.name}
                    </Link>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Capture readers at the end of the guide (attributed to guide-footer) */}
      <NewsletterStrip source="guide-footer" />
    </div>
  );
}
