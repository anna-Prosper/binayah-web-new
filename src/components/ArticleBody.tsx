"use client";

import { motion } from "framer-motion";
import {
  CheckCircle2, TrendingUp, BarChart3, AlertCircle, Quote,
  Info, Star, MapPin, Building2, DollarSign, Home, FileText,
} from "lucide-react";
import { useRef, useState } from "react";
import { useInView } from "framer-motion";
import Image from "next/image";

/* ─── HELPERS ─── */
const slugify = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

/* ─── ICON MAP (used by section_title blocks) ─── */
const ICONS: Record<string, React.ElementType> = {
  CheckCircle2, TrendingUp, BarChart3, AlertCircle, Info,
  Quote, Star, MapPin, Building2, DollarSign, Home, FileText,
};

/* ─── BLOCK TYPE DEFINITIONS ─── */
export type ArticleBlock =
  | { type: "paragraph"; text: string }
  | { type: "intro"; text: string }
  | { type: "section_title"; style: "icon" | "numbered"; icon?: string; number?: number; text: string }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "image"; src: string; alt: string; caption?: string }
  | { type: "chart"; title?: string; bars: { label: string; pct: number }[]; caption: string }
  | { type: "stats"; title: string; stats: { label: string; value: string; change: string }[] }
  | { type: "quote"; text: string; author: string }
  | { type: "callout"; title: string; text: string }
  | { type: "numbered_list"; items: string[] }
  | { type: "bullet_list"; items: string[] }
  | { type: "faq"; items: { q: string; a: string }[] };

/* ─── BLOCK COMPONENTS ─── */

function Paragraph({ text }: { text: string }) {
  return (
    <p className="text-base text-foreground/80 leading-[1.85] mb-4">{text}</p>
  );
}

function IntroBlock({ text }: { text: string }) {
  if (!text) return null;
  return (
    <p className="text-lg font-medium text-foreground/90 leading-[1.7] mb-4 border-l-4 border-primary pl-4">
      {text}
    </p>
  );
}

function SectionTitle({ block }: { block: Extract<ArticleBlock, { type: "section_title" }> }) {
  if (block.style === "numbered") {
    return (
      <div className="flex items-center gap-3 mb-4 mt-10">
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shadow-md flex-shrink-0" style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}>
          <span className="text-white text-xs sm:text-sm font-bold">{block.number ?? ""}</span>
        </div>
        <h2 id={slugify(block.text)} className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">{block.text}</h2>
      </div>
    );
  }
  const Icon = (block.icon && ICONS[block.icon]) ? ICONS[block.icon] : CheckCircle2;
  return (
    <div className="flex items-center gap-3 mb-4 mt-10">
      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shadow-md flex-shrink-0" style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}>
        <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
      </div>
      <h2 id={slugify(block.text)} className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">{block.text}</h2>
    </div>
  );
}

function TableBlock({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="rounded-2xl border border-border overflow-hidden my-5 sm:my-6">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[500px] text-left">
          <thead>
            <tr className="bg-muted/50">
              {headers.map((h, i) => (
                <th key={i} className="px-4 py-3 font-bold text-foreground text-xs sm:text-sm whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-t border-border">
                {row.map((cell, j) => (
                  <td key={j} className={`px-4 py-3 text-xs sm:text-sm whitespace-nowrap ${j === 0 ? "font-medium text-foreground" : j >= 2 ? "text-primary font-semibold" : "text-muted-foreground"}`}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ImageBlock({ src, alt, caption }: { src: string; alt: string; caption?: string }) {
  return (
    <figure className="my-5 sm:my-6">
      <div className="rounded-2xl overflow-hidden aspect-[16/9] bg-muted relative">
        <Image src={src} alt={alt} fill sizes="(max-width: 768px) 100vw, 720px" className="object-cover" loading="lazy" />
      </div>
      {caption && <figcaption className="text-xs text-muted-foreground mt-2 italic text-center">{caption}</figcaption>}
    </figure>
  );
}

const CHART_MAX_PX = 160;
const CHART_MIN_PX = 3;

function ChartBlock({ title, bars, caption }: { title?: string; bars: { label: string; pct: number }[]; caption: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "0px 0px -40px 0px" });
  return (
    <div ref={ref} className="rounded-2xl border border-border bg-muted/30 p-4 sm:p-6 md:p-8 my-5 sm:my-6">
      {title && <p className="text-xs sm:text-sm font-semibold text-foreground mb-3 sm:mb-4">{title}</p>}
      <div className="w-full max-w-lg mx-auto">
        {/* Bars row — fixed height, labels kept out so they can't compress bars */}
        <div className="flex items-end justify-between gap-1.5 sm:gap-3" style={{ height: CHART_MAX_PX }}>
          {bars.map((bar, i) => {
            const targetPx = Math.max(Math.round((bar.pct / 100) * CHART_MAX_PX), CHART_MIN_PX);
            return (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: isInView ? targetPx : 0 }}
                transition={{ delay: i * 0.1, duration: 0.6, ease: "easeOut" }}
                className="flex-1 rounded-t-lg"
                style={{
                  background: i === bars.length - 1
                    ? "linear-gradient(180deg, hsl(var(--accent)), hsl(var(--accent)/.75))"
                    : "linear-gradient(180deg, hsl(var(--primary)), hsl(var(--primary)/.6))",
                }}
              />
            );
          })}
        </div>
        {/* Labels row — separate so multi-line labels never affect bar heights */}
        <div className="flex justify-between gap-1.5 sm:gap-3 mt-2">
          {bars.map((bar, i) => (
            <div key={i} className="flex-1 text-center">
              <span className="text-[9px] sm:text-[11px] text-muted-foreground font-medium leading-tight break-words">{bar.label}</span>
            </div>
          ))}
        </div>
        <p className="text-[10px] sm:text-xs text-muted-foreground text-center mt-3 sm:mt-4 italic">{caption}</p>
      </div>
    </div>
  );
}

const STATS_GRID: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
};

// A "numeric-ish" value is short (≤8 chars) and starts with a digit, $, sign, etc.
// Long text values (e.g. "Check developer disclosure") get smaller/lighter
// styling so they don't fight the clean numbers next to them.
function isNumericish(v: string): boolean {
  const s = (v || "").trim();
  if (s.length === 0 || s.length > 10) return false;
  return /^[+\-$£€]?\s*\d/.test(s);
}

function StatsBlock({ title, stats }: { title: string; stats: { label: string; value: string; change: string }[] }) {
  const gridClass = STATS_GRID[stats.length] ?? "grid-cols-2 md:grid-cols-4";
  return (
    <div className="rounded-2xl border border-primary/15 overflow-hidden my-5 sm:my-6">
      <div className="px-4 py-2.5 sm:px-6 sm:py-4" style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}>
        <h3 className="text-xs sm:text-base font-bold text-white flex items-center gap-2">
          <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> {title}
        </h3>
      </div>
      <div className={`grid ${gridClass} gap-px bg-border items-stretch`}>
        {stats.map((stat, i) => {
          const numeric = isNumericish(stat.value);
          return (
            <div key={i} className="bg-card p-3 sm:p-5 text-center flex flex-col items-center justify-center min-h-[80px] sm:min-h-[96px]">
              <p className="text-[10px] sm:text-[11px] text-muted-foreground mb-1 sm:mb-1.5 leading-tight">{stat.label}</p>
              {numeric ? (
                <p className="text-sm sm:text-base font-semibold text-foreground leading-tight tracking-tight">{stat.value}</p>
              ) : (
                <p className="text-[11px] sm:text-[12px] font-medium text-foreground/80 leading-snug max-w-[160px] mx-auto">{stat.value}</p>
              )}
              {stat.change && (
                <span className="text-[10px] sm:text-[11px] font-medium text-primary mt-1">{stat.change}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function QuoteBlock({ text, author }: { text: string; author: string }) {
  return (
    <div className="relative my-5 sm:my-6 rounded-2xl overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.04] via-card to-[hsl(var(--accent))]/[0.04]" />
      <div className="relative flex gap-3 sm:gap-4 p-4 sm:p-6 border border-primary/15 rounded-2xl">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[hsl(var(--accent))] to-[hsl(var(--accent)/.75)] flex items-center justify-center shadow-lg shadow-[hsl(var(--accent))]/20">
            <Quote className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          </div>
        </div>
        <div>
          <p className="text-sm sm:text-base text-foreground font-semibold leading-relaxed italic">"{text}"</p>
          <p className="text-xs text-muted-foreground mt-2">— {author}</p>
        </div>
      </div>
    </div>
  );
}

function CalloutBlock({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-[hsl(var(--accent))]/30 bg-gradient-to-br from-[hsl(var(--accent))]/[0.06] to-[hsl(var(--accent)/.75)]/[0.03] p-5 sm:p-6 my-5 sm:my-6">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[hsl(var(--accent))] to-[hsl(var(--accent)/.75)] flex items-center justify-center shadow-lg shadow-[hsl(var(--accent))]/20 flex-shrink-0">
          <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
        </div>
        <div>
          <h3 className="text-sm sm:text-base font-bold text-foreground mb-1.5">{title}</h3>
          <p className="text-sm text-foreground/80 leading-relaxed">{text}</p>
        </div>
      </div>
    </div>
  );
}

function NumberedList({ items }: { items: string[] }) {
  return (
    <ol className="space-y-3 my-5 sm:my-6 pl-1">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3 text-foreground/80 text-sm leading-relaxed">
          <span className="mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm" style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}>
            {i + 1}
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ol>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 sm:space-y-2.5 my-5 sm:my-6 pl-1">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3 text-foreground/80 text-sm leading-relaxed">
          <div className="mt-1.5 w-2 h-2 rounded-full bg-gradient-to-br from-[hsl(var(--accent))] to-[hsl(var(--accent)/.75)] flex-shrink-0 shadow-sm shadow-[hsl(var(--accent))]/30" />
          {item}
        </li>
      ))}
    </ul>
  );
}

function FAQBlock({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="space-y-2 mt-4">
      {items.map((faq, i) => (
        <div key={i} className="border border-border rounded-xl overflow-hidden">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full text-left px-4 py-4 text-sm sm:text-base font-semibold text-foreground hover:text-primary flex items-center justify-between gap-3 transition-colors"
          >
            {faq.q}
            <span className="text-muted-foreground flex-shrink-0 text-lg leading-none">{open === i ? "−" : "+"}</span>
          </button>
          {open === i && (
            <div className="px-4 pb-4 text-sm text-foreground/80 leading-relaxed border-t border-border pt-3">
              {faq.a}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ─── MAIN RENDERER ─── */

function renderBlock(block: ArticleBlock, i: number) {
  switch (block.type) {
    case "intro":          return <motion.div key={i} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><IntroBlock text={block.text} /></motion.div>;
    case "paragraph":      return <motion.div key={i} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><Paragraph text={block.text} /></motion.div>;
    case "section_title":  return <motion.div key={i} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><SectionTitle block={block} /></motion.div>;
    case "table":          return <motion.div key={i} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><TableBlock headers={block.headers} rows={block.rows} /></motion.div>;
    case "image":          return <motion.div key={i} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><ImageBlock src={block.src} alt={block.alt} caption={block.caption} /></motion.div>;
    case "chart":          return <motion.div key={i} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><ChartBlock title={block.title} bars={block.bars} caption={block.caption} /></motion.div>;
    case "stats":          return <motion.div key={i} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><StatsBlock title={block.title} stats={block.stats} /></motion.div>;
    case "quote":          return <motion.div key={i} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><QuoteBlock text={block.text} author={block.author} /></motion.div>;
    case "callout":        return <motion.div key={i} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><CalloutBlock title={block.title} text={block.text} /></motion.div>;
    case "numbered_list":  return <motion.div key={i} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><NumberedList items={block.items} /></motion.div>;
    case "bullet_list":    return <motion.div key={i} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><BulletList items={block.items} /></motion.div>;
    case "faq":            return <motion.div key={i} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><FAQBlock items={block.items} /></motion.div>;
    default:               return null;
  }
}

export default function ArticleBody({ body }: { body: ArticleBlock[] }) {
  return (
    <div className="space-y-1">
      {body.map((block, i) => renderBlock(block, i))}
    </div>
  );
}

export function extractTOC(body: ArticleBlock[]): { id: string; text: string }[] {
  return body
    .filter((b) => b.type === 'section_title')
    .map((b) => ({ id: slugify((b as any).text), text: (b as any).text }));
}
