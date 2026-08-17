import React from "react";
// Locale-aware Link prefixes the active locale itself — hrefs stay bare.
import { Link } from "@/navigation";
import { TrendingUp } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { serverApiUrl, serverFetch } from "@/lib/api";
import PropertyTypeSidebarNewsletter from "@/components/PropertyTypeSidebarNewsletter";
import { PULSE_GUIDES } from "@/lib/pulse-guides";



interface MarketStatsData {
  avgYield?: number;
  transactions?: number;
  transactionsYear?: number;
  transactionsCoverageMonths?: number;
  offPlanShare?: number;
  avgPricePerSqft?: number;
}

interface GuideItem {
  slug: string;
  title: string;
  readTime: string;
}

interface PropertyTypeSidebarProps {
  locale: string;
  /** Unique key per page (apartments, villas, buy, rent, off-plan…) — used as the newsletter source. */
  slug: string;
}


function formatK(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M+";
  if (n >= 1_000) return Math.round(n / 1_000) + "K+";
  return String(n);
}

/**
 * Self-fetching sidebar shared by every search-landing page (property-type pages
 * + buy/rent/off-plan). Fetches its own market stats + guides and resolves its own
 * copy, so a host page only needs to pass `locale` and a `slug`.
 */
export default async function PropertyTypeSidebar({ locale, slug }: PropertyTypeSidebarProps) {
  // ── Market stats + related guides (each degrades gracefully) ──
  let marketStats: MarketStatsData | null = null;
  try {
    const res = await serverFetch(serverApiUrl("/api/market-stats"));
    if (res.ok) {
      const data = await res.json();
      marketStats = (data?.summary as MarketStatsData) ?? null;
    }
  } catch {
    marketStats = null;
  }

  // Real property-investment guides (static, localized) — not the news feed.
  // The previous /api/news?category=guides call had no matching category and
  // returned generic/lifestyle articles under a "Guides" heading.
  const tGuides = await getTranslations({ locale, namespace: "pulseGuides" });
  const guides: GuideItem[] = PULSE_GUIDES.slice(0, 4).map((g) => ({
    slug: g.slug,
    title: tGuides(g.titleKey as never),
    readTime: g.readTime,
  }));

  const t = await getTranslations({ locale, namespace: "common.sidebar" });
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";

  // ── Market snapshot rows (yield omitted — the hero already owns it as a range;
  //    the snapshot shows only complementary data: transactions, off-plan share, price/sqft) ──
  const s = marketStats ?? {};
  const txns = typeof s.transactions === "number" ? s.transactions : null;
  const offPlan = typeof s.offPlanShare === "number" ? s.offPlanShare : null;
  const pricePerSqft = typeof s.avgPricePerSqft === "number" ? s.avgPricePerSqft : null;

  // Transactions label incl. its coverage window — resolved via next-intl ICU per locale.
  const covMo = s.transactionsCoverageMonths;
  const txnYear = s.transactionsYear;
  const txnsLabel =
    typeof covMo === "number" && covMo < 12
      ? t("transactionsCoverage", { n: covMo })
      : typeof txnYear === "number"
      ? `${t("transactions")} (${txnYear})`
      : t("transactions");

  const snapshotRows = (
    [
      txns != null && { dt: txnsLabel, dd: formatK(txns) },
      offPlan != null && { dt: t("offPlanShare"), dd: offPlan.toFixed(0) + "%" },
      pricePerSqft != null && { dt: t("pricePerSqft"), dd: `AED ${Math.round(pricePerSqft).toLocaleString()}` },
    ].filter(Boolean) as { dt: string; dd: string }[]
  );

  return (
    <div className="space-y-5">
      {/* 1 — Consultation CTA */}
      <div className="rounded-2xl p-6 text-primary-foreground" style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}>
        <div className="w-10 h-10 rounded-xl bg-accent/90 flex items-center justify-center mb-4">
          <TrendingUp className="h-5 w-5 text-accent-foreground" />
        </div>
        <h3 className="text-lg font-bold mb-1.5">{t("consultTitle")}</h3>
        <p className="text-sm text-primary-foreground/75 leading-relaxed mb-4">{t("consultDesc")}</p>
        <Link
          href={`/contact`}
          className="block w-full text-center px-4 py-2.5 rounded-xl bg-accent text-accent-foreground text-sm font-semibold hover:bg-accent/90 transition-colors"
        >
          {t("consultCta")}
        </Link>
      </div>

      {/* 2 — Market Snapshot */}
      {snapshotRows.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-foreground mb-4">{t("marketSnapshot")}</p>
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
          <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-foreground mb-4">{t("guidesLabel")}</p>
          <div className="space-y-2.5">
            {guides.map((g) => (
              <Link key={g.slug} href={`/pulse/guides/${g.slug}`} className="group flex items-start gap-3 rounded-xl border border-border/50 p-3 hover:border-primary/30 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <TrendingUp className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                    {g.title}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">{g.readTime}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 4 — Newsletter */}
      <PropertyTypeSidebarNewsletter
        slug={slug}
        apiUrl={apiUrl}
        messages={{
          newsletterTitle: t("newsletterTitle"),
          newsletterDesc: t("newsletterDesc"),
          newsletterEmail: t("newsletterEmail"),
          newsletterCta: t("newsletterCta"),
          subscribedSuccess: t("subscribedSuccess"),
          subscribeError: t("subscribeError"),
        }}
      />
    </div>
  );
}
