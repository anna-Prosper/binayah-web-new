"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { ExternalLink, Share2, Copy, CheckCheck } from "lucide-react";
import { useState } from "react";

export interface InsightArticle {
  title: string;
  url: string;
  source: string;
  summary: string;
  imageUrl: string;
  publishedAt: string;
}

interface Props {
  article: InsightArticle | null;
  /** OG share URL params for unfurl */
  ogParams?: { metric?: string; value?: string; trend?: string };
}

export default function FeaturedInsightPanel({ article, ogParams }: Props) {
  const t = useTranslations("featuredInsight");
  const [copied, setCopied] = useState(false);

  if (!article) {
    return (
      <div className="bg-card border border-border/50 rounded-2xl p-8 text-center">
        <p className="text-sm text-muted-foreground">{t("empty")}</p>
      </div>
    );
  }

  const publishedDate = new Date(article.publishedAt).toLocaleDateString("en-AE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Build share URL with OG params + UTM
  const buildShareUrl = (utmSource: string) => {
    const base = typeof window !== "undefined" ? window.location.origin : "https://staging.binayahhub.com";
    const params = new URLSearchParams({
      utm_source: utmSource,
      utm_medium: "share",
      utm_campaign: "pulse-2026-04",
      ...(ogParams?.metric ? { metric: ogParams.metric } : {}),
      ...(ogParams?.value ? { value: ogParams.value } : {}),
      ...(ogParams?.trend ? { trend: ogParams.trend } : {}),
    });
    return `${article.url}?${params.toString()}`;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(buildShareUrl("clipboard"));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback silently
    }
  };

  const handleWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(`${article.title} — ${buildShareUrl("whatsapp")}`)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleX = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(buildShareUrl("twitter"))}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const excerpt = article.summary.slice(0, 180) + (article.summary.length > 180 ? "…" : "");

  return (
    <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
      {/* 60/40 layout on desktop — image left, content right */}
      <div className="flex flex-col lg:flex-row">
        {/* Image — 60% on desktop */}
        <div className="relative lg:w-[60%] aspect-[16/9] lg:aspect-auto lg:min-h-[280px] flex-shrink-0 overflow-hidden bg-muted">
          {article.imageUrl ? (
            <Image
              src={article.imageUrl}
              alt={article.title}
              fill
              className="object-cover transition-transform duration-600 hover:scale-[1.02]"
              sizes="(max-width: 1024px) 100vw, 60vw"
              unoptimized
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <Share2 className="h-10 w-10 text-muted-foreground/20" />
            </div>
          )}
          {/* Source badge overlaid on image */}
          <div className="absolute top-3 left-3">
            <span
              className="text-[10px] font-bold tracking-[0.15em] uppercase px-2 py-1 rounded-sm"
              style={{
                color: "hsl(43, 55%, 55%)",
                background: "rgba(0,0,0,0.55)",
                backdropFilter: "blur(4px)",
              }}
            >
              {article.source}
            </span>
          </div>
        </div>

        {/* Content — 40% on desktop */}
        <div className="flex flex-col justify-between p-5 lg:p-6 lg:w-[40%]">
          <div>
            {/* Eyebrow */}
            <p
              className="text-[10px] font-bold tracking-[0.3em] uppercase mb-2"
              style={{ color: "hsl(43, 55%, 55%)" }}
            >
              {t("eyebrow")}
            </p>

            {/* Headline */}
            <h3 className="text-base font-bold text-foreground leading-snug mb-2 line-clamp-3">
              {article.title}
            </h3>

            {/* 2-line excerpt */}
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-3">
              {excerpt}
            </p>

            {/* Date */}
            <p className="text-[10px] text-muted-foreground/60">{publishedDate}</p>
          </div>

          {/* Share row */}
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border/30 flex-wrap">
            <span className="text-[10px] font-medium text-muted-foreground mr-1">{t("shareLabel")}</span>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border/50 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:border-accent/40 transition-all"
              aria-label={t("copyLink")}
            >
              {copied ? <CheckCheck className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
              {copied ? t("copied") : t("copyLink")}
            </button>

            <button
              onClick={handleWhatsApp}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border/50 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:border-accent/40 transition-all"
              aria-label={t("shareWhatsApp")}
            >
              <Share2 className="h-3 w-3" />
              {t("shareWhatsApp")}
            </button>

            <button
              onClick={handleX}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border/50 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:border-accent/40 transition-all"
              aria-label={t("shareX")}
            >
              <Share2 className="h-3 w-3" />
              {t("shareX")}
            </button>

            <a
              href={buildShareUrl("direct")}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto flex items-center gap-1 text-[11px] font-semibold hover:text-accent transition-colors"
              style={{ color: "hsl(43, 55%, 55%)" }}
            >
              {t("readMore")}
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
