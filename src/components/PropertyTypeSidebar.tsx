import React from "react";
import Link from "next/link";
import { TrendingUp } from "lucide-react";
import ImageWithFallback from "@/components/ImageWithFallback";
import type { PropertyTypeLocale } from "@/lib/property-type-pages";
import PropertyTypeSidebarNewsletter from "@/components/PropertyTypeSidebarNewsletter";

const FALLBACK_IMAGE = "/assets/dubai-hero.webp";

export interface MarketStatsData {
  avgYield?: number;
  transactions?: number;
  transactionsYear?: number;
  transactionsCoverageMonths?: number;
  offPlanShare?: number;
  avgPricePerSqft?: number;
}

export interface GuideItem {
  _id: string;
  slug: string;
  title: string;
  featuredImage?: string;
  publishedAt?: string;
}

export interface PropertyTypeSidebarMessages {
  consultTitle: string;
  consultDesc: string;
  consultCta: string;
  marketSnapshot: string;
  avgYield: string;
  transactions: string;
  offPlanShare: string;
  pricePerSqft: string;
  guidesLabel: string;
  priceGuideLabel: string;
  newsletterTitle: string;
  newsletterDesc: string;
  newsletterEmail: string;
  newsletterCta: string;
  subscribedSuccess: string;
  subscribeError: string;
}

interface PropertyTypeSidebarProps {
  locale: string;
  slug: string;
  searchType: string;
  c: PropertyTypeLocale;
  marketStats: MarketStatsData | null;
  guides: GuideItem[];
  messages: PropertyTypeSidebarMessages;
  apiUrl: string;
}

function formatShortDate(dateStr?: string): string {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return dateStr;
  }
}

export default function PropertyTypeSidebar({
  locale,
  slug,
  searchType: _searchType,
  c: _c,
  marketStats,
  guides,
  messages,
  apiUrl,
}: PropertyTypeSidebarProps) {
  const lp = locale === "en" ? "" : `/${locale}`;

  // ── Market snapshot rows (hide nulls, hide card if all null) ──
  const s = marketStats ?? {};
  const formatK = (n: number): string => {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M+";
    if (n >= 1_000) return Math.round(n / 1_000) + "K+";
    return String(n);
  };
  const yield_ = typeof s.avgYield === "number" ? s.avgYield : null;
  const txns = typeof s.transactions === "number" ? s.transactions : null;
  const txnsYear = typeof s.transactionsYear === "number" ? s.transactionsYear : null;
  const coverageMo = typeof s.transactionsCoverageMonths === "number" ? s.transactionsCoverageMonths : null;
  const offPlan = typeof s.offPlanShare === "number" ? s.offPlanShare : null;
  const pricePerSqft = typeof s.avgPricePerSqft === "number" ? s.avgPricePerSqft : null;

  const txnsLabel =
    coverageMo != null && coverageMo < 12
      ? `${messages.transactions} (last ${coverageMo}mo)`
      : txnsYear
      ? `${messages.transactions} (${txnsYear})`
      : messages.transactions;

  const snapshotRows = (
    [
      yield_ != null && { dt: messages.avgYield, dd: yield_.toFixed(1) + "%" },
      txns != null && { dt: txnsLabel, dd: formatK(txns) },
      offPlan != null && { dt: messages.offPlanShare, dd: offPlan.toFixed(0) + "%" },
      pricePerSqft != null && { dt: messages.pricePerSqft, dd: `AED ${Math.round(pricePerSqft).toLocaleString()}` },
    ].filter(Boolean) as { dt: string; dd: string }[]
  );

  return (
    <div className="space-y-5">
      {/* 1 — Consultation CTA */}
      <div className="rounded-2xl p-6 text-primary-foreground" style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}>
        <div className="w-10 h-10 rounded-xl bg-accent/90 flex items-center justify-center mb-4">
          <TrendingUp className="h-5 w-5 text-accent-foreground" />
        </div>
        <h3 className="text-lg font-bold mb-1.5">{messages.consultTitle}</h3>
        <p className="text-sm text-primary-foreground/75 leading-relaxed mb-4">{messages.consultDesc}</p>
        <Link
          href={`${lp}/contact`}
          className="block w-full text-center px-4 py-2.5 rounded-xl bg-accent text-accent-foreground text-sm font-semibold hover:bg-accent/90 transition-colors"
        >
          {messages.consultCta}
        </Link>
      </div>

      {/* 2 — Market Snapshot */}
      {snapshotRows.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-foreground mb-4">{messages.marketSnapshot}</p>
          <dl className="space-y-3 text-sm">
            {snapshotRows.map((r) => (
              <div key={r.dt} className="flex items-center justify-between gap-3">
                <dt className="text-muted-foreground">{r.dt}</dt>
                <dd className="font-bold text-foreground text-right">{r.dd}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {/* 3 — Related Guides */}
      {guides.length > 0 && (
        <div>
          <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-foreground mb-4">{messages.guidesLabel}</p>
          <div className="space-y-4">
            {guides.map((g) => (
              <Link key={g._id} href={`${lp}/news/${g.slug}`} className="group flex items-start gap-3">
                <div className="relative w-20 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  <ImageWithFallback
                    src={g.featuredImage || FALLBACK_IMAGE}
                    alt={g.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  {g.publishedAt && <p className="text-[11px] text-muted-foreground mb-1">{formatShortDate(g.publishedAt)}</p>}
                  <p className="text-sm font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                    {g.title}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Newsletter */}
      <PropertyTypeSidebarNewsletter
        slug={slug}
        apiUrl={apiUrl}
        messages={{
          newsletterTitle: messages.newsletterTitle,
          newsletterDesc: messages.newsletterDesc,
          newsletterEmail: messages.newsletterEmail,
          newsletterCta: messages.newsletterCta,
          subscribedSuccess: messages.subscribedSuccess,
          subscribeError: messages.subscribeError,
        }}
      />
    </div>
  );
}
