"use client";

import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { motion } from "framer-motion";
import { Clock, Eye, ArrowLeft, ArrowRight, MapPin, ExternalLink } from "lucide-react";
import Link from "next/link";
import { PulseGuide } from "@/lib/pulse-guides";

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

    // Heading
    if (line.startsWith("## ")) {
      nodes.push(
        <h3 key={i} className="text-lg font-bold text-foreground mt-7 mb-3">
          {line.slice(3)}
        </h3>
      );
      i++;
      continue;
    }
    if (line.startsWith("# ")) {
      nodes.push(
        <h2 key={i} className="text-xl font-bold text-foreground mt-8 mb-3">
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

export default function GuideDetailClient({ guide }: { guide: PulseGuide }) {
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
