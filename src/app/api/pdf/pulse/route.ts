import { NextResponse } from "next/server";
import React from "react";
import { renderToBuffer, Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import { serverApiUrl, serverFetch } from "@/lib/api";

export const runtime = "nodejs";

// ── Styles ────────────────────────────────────────────────────────────────────

const BRAND_GREEN = "#0B3D2E";
const BRAND_GREEN_LIGHT = "#1A7A5A";
const GOLD = "#C9A84C";
const LIGHT_BG = "#F8F9FA";
const TEXT = "#1A1A2E";
const TEXT_MUTED = "#6B7280";
const BORDER = "#E5E7EB";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    backgroundColor: LIGHT_BG,
    paddingBottom: 60,
  },
  // Header band
  headerBand: {
    backgroundColor: BRAND_GREEN,
    paddingVertical: 28,
    paddingHorizontal: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {},
  brandWordmark: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: "#FFFFFF",
    letterSpacing: 1,
  },
  brandSub: {
    fontSize: 9,
    color: "#FFFFFF",
    opacity: 0.7,
    marginTop: 2,
    letterSpacing: 2,
  },
  goldAccentLine: {
    height: 3,
    backgroundColor: GOLD,
    width: 40,
    marginTop: 8,
  },
  headerRight: {
    alignItems: "flex-end",
  },
  headerDate: {
    fontSize: 10,
    color: "#FFFFFF",
    opacity: 0.8,
  },
  headerReport: {
    fontSize: 8,
    color: GOLD,
    marginTop: 3,
    letterSpacing: 1.5,
    textTransform: "uppercase" as const,
  },
  // Body
  body: {
    paddingHorizontal: 40,
    paddingTop: 32,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: BRAND_GREEN,
    letterSpacing: 1.5,
    textTransform: "uppercase" as const,
    marginBottom: 12,
  },
  goldRule: {
    height: 2,
    backgroundColor: GOLD,
    width: 32,
    marginBottom: 16,
  },
  // KPI block
  kpiGrid: {
    flexDirection: "row",
    flexWrap: "wrap" as const,
    gap: 8,
    marginBottom: 28,
  },
  kpiCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 6,
    padding: 12,
    width: "22%",
    borderLeftWidth: 3,
    borderLeftColor: GOLD,
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  kpiLabel: {
    fontSize: 7,
    color: TEXT_MUTED,
    letterSpacing: 0.8,
    textTransform: "uppercase" as const,
    marginBottom: 4,
  },
  kpiValue: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: TEXT,
  },
  kpiSub: {
    fontSize: 7,
    color: TEXT_MUTED,
    marginTop: 2,
  },
  // Table
  table: {
    marginBottom: 24,
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: BRAND_GREEN,
    borderRadius: 4,
    paddingVertical: 7,
    paddingHorizontal: 10,
    marginBottom: 2,
  },
  tableHeaderCell: {
    color: "#FFFFFF",
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  tableRowAlt: {
    backgroundColor: "#F9FAFB",
  },
  tableCell: {
    fontSize: 9,
    color: TEXT,
  },
  tableCellMuted: {
    fontSize: 9,
    color: TEXT_MUTED,
  },
  // Columns
  colRank: { width: "8%" },
  colCommunity: { width: "40%" },
  colYield: { width: "18%" },
  colPpsf: { width: "18%" },
  colVol: { width: "16%" },
  // Footer
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 44,
    backgroundColor: BRAND_GREEN,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  footerText: {
    fontSize: 8,
    color: "#FFFFFF",
    opacity: 0.75,
  },
  footerBrand: {
    fontSize: 8,
    color: GOLD,
    fontFamily: "Helvetica-Bold",
  },
  // Page 2 methodology
  methodologyTitle: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: TEXT,
    marginBottom: 12,
  },
  methodologyBody: {
    fontSize: 9,
    color: TEXT_MUTED,
    lineHeight: 1.6,
    marginBottom: 10,
  },
  methodologyBullet: {
    fontSize: 9,
    color: TEXT_MUTED,
    lineHeight: 1.5,
    marginBottom: 5,
    paddingLeft: 12,
  },
  disclaimerBox: {
    backgroundColor: "#FFF9EC",
    borderRadius: 6,
    padding: 12,
    marginTop: 20,
    borderLeftWidth: 3,
    borderLeftColor: GOLD,
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  disclaimerTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: BRAND_GREEN,
    marginBottom: 4,
  },
  disclaimerText: {
    fontSize: 8,
    color: TEXT_MUTED,
    lineHeight: 1.5,
  },
});

// ── Data types ────────────────────────────────────────────────────────────────

interface MarketStats {
  summary?: {
    avgPricePerSqft?: number;
    totalListings?: number;
    avgYield?: number;
    offPlanShare?: number;
    offPlanCount?: number;
    secondaryCount?: number;
  };
  yieldByArea?: { area: string; yield: number }[];
  priceByArea?: { area: string; price: number; count: number }[];
}

interface AreaResult {
  area: string;
  totalSales?: number;
  avgPpsf?: number;
  rentalYield?: number;
  yieldValue?: number;
}

interface DldAreasResponse {
  results?: AreaResult[];
}

interface TransactionsData {
  transactions?: {
    summary?: {
      totalTransactions?: number;
      avgPpsf?: number;
    };
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const AED = (n: number) => {
  if (n >= 1_000_000) return `AED ${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `AED ${(n / 1_000).toFixed(0)}K`;
  return `AED ${n.toLocaleString()}`;
};

const pct = (n: number) => `${n.toFixed(1)}%`;
const fmtDate = (d: Date) =>
  d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

// ── PDF Document ──────────────────────────────────────────────────────────────

function PulseDocument({
  date,
  avgPpsf,
  txYtd,
  avgYield,
  offPlanShare,
  topAreas,
}: {
  date: string;
  avgPpsf: number;
  txYtd: number;
  avgYield: number;
  offPlanShare: number;
  topAreas: { rank: number; name: string; yield: number; ppsf: number; vol: number }[];
}) {
  return React.createElement(
    Document,
    {
      title: `Binayah Pulse — Dubai Market Report ${date}`,
      author: "Binayah Properties",
      subject: "Dubai Real Estate Market Report",
    },
    // ── Page 1 ────────────────────────────────────────────────────────────
    React.createElement(
      Page,
      { size: "A4", style: styles.page },
      // Header
      React.createElement(
        View,
        { style: styles.headerBand },
        React.createElement(
          View,
          { style: styles.headerLeft },
          React.createElement(Text, { style: styles.brandWordmark }, "BINAYAH"),
          React.createElement(Text, { style: styles.brandSub }, "PULSE · DUBAI MARKET REPORT"),
          React.createElement(View, { style: styles.goldAccentLine })
        ),
        React.createElement(
          View,
          { style: styles.headerRight },
          React.createElement(Text, { style: styles.headerDate }, date),
          React.createElement(Text, { style: styles.headerReport }, "Quarterly Intelligence")
        )
      ),
      // Body
      React.createElement(
        View,
        { style: styles.body },
        // KPI section
        React.createElement(Text, { style: styles.sectionTitle }, "Market KPIs"),
        React.createElement(View, { style: styles.goldRule }),
        React.createElement(
          View,
          { style: styles.kpiGrid },
          kpiCard("Avg Price/sqft", avgPpsf > 0 ? `AED ${avgPpsf.toLocaleString()}` : "—", "Dubai avg"),
          kpiCard("Transactions YTD", txYtd > 0 ? txYtd.toLocaleString() : "—", "Year to date"),
          kpiCard("Avg Rental Yield", avgYield > 0 ? pct(avgYield) : "—", "Gross, community avg"),
          kpiCard("Off-Plan Share", offPlanShare > 0 ? pct(offPlanShare) : "—", "% of total listings")
        ),
        // Communities table
        React.createElement(Text, { style: styles.sectionTitle }, "Top Communities"),
        React.createElement(View, { style: styles.goldRule }),
        React.createElement(
          View,
          { style: styles.table },
          // Header
          React.createElement(
            View,
            { style: styles.tableHeaderRow },
            React.createElement(Text, { style: [styles.tableHeaderCell, styles.colRank] }, "#"),
            React.createElement(Text, { style: [styles.tableHeaderCell, styles.colCommunity] }, "Community"),
            React.createElement(Text, { style: [styles.tableHeaderCell, styles.colYield] }, "Yield"),
            React.createElement(Text, { style: [styles.tableHeaderCell, styles.colPpsf] }, "Avg PPSF"),
            React.createElement(Text, { style: [styles.tableHeaderCell, styles.colVol] }, "Volume")
          ),
          // Rows
          ...topAreas.map((area, i) =>
            React.createElement(
              View,
              { key: area.name, style: [styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}] },
              React.createElement(Text, { style: [styles.tableCellMuted, styles.colRank] }, String(area.rank)),
              React.createElement(Text, { style: [styles.tableCell, styles.colCommunity] }, area.name),
              React.createElement(Text, { style: [styles.tableCell, styles.colYield] }, area.yield > 0 ? pct(area.yield) : "—"),
              React.createElement(Text, { style: [styles.tableCell, styles.colPpsf] }, area.ppsf > 0 ? AED(area.ppsf) : "—"),
              React.createElement(Text, { style: [styles.tableCellMuted, styles.colVol] }, area.vol > 0 ? area.vol.toLocaleString() : "—")
            )
          )
        )
      ),
      // Footer
      React.createElement(
        View,
        { style: styles.footer },
        React.createElement(Text, { style: styles.footerText }, `binayah.com/pulse · ${date}`),
        React.createElement(Text, { style: styles.footerBrand }, "BINAYAH PROPERTIES")
      )
    ),
    // ── Page 2 ────────────────────────────────────────────────────────────
    React.createElement(
      Page,
      { size: "A4", style: styles.page },
      // Header (same brand band)
      React.createElement(
        View,
        { style: styles.headerBand },
        React.createElement(
          View,
          { style: styles.headerLeft },
          React.createElement(Text, { style: styles.brandWordmark }, "BINAYAH"),
          React.createElement(Text, { style: styles.brandSub }, "PULSE · METHODOLOGY & NOTES"),
          React.createElement(View, { style: styles.goldAccentLine })
        ),
        React.createElement(
          View,
          { style: styles.headerRight },
          React.createElement(Text, { style: styles.headerDate }, date),
          React.createElement(Text, { style: styles.headerReport }, "Page 2 of 2")
        )
      ),
      React.createElement(
        View,
        { style: styles.body },
        React.createElement(Text, { style: styles.methodologyTitle }, "Methodology"),
        React.createElement(
          Text,
          { style: styles.methodologyBody },
          "This report is generated from Binayah's proprietary DLD transaction database, updated daily. Data covers residential property transactions in Dubai."
        ),
        React.createElement(Text, { style: styles.methodologyBullet }, "• Avg Price/sqft: Mean of all residential sale transactions in the current calendar year."),
        React.createElement(Text, { style: styles.methodologyBullet }, "• Rental Yield: Annual gross yield = avg annual rent / avg sale price, per community."),
        React.createElement(Text, { style: styles.methodologyBullet }, "• Off-Plan Share: Percentage of total active listings classified as off-plan."),
        React.createElement(Text, { style: styles.methodologyBullet }, "• Community rankings: By total sales volume in the trailing 12 months."),
        React.createElement(Text, { style: styles.methodologyBullet }, "• Figures marked '—' indicate insufficient data (fewer than 10 transactions)."),
        React.createElement(
          View,
          { style: styles.disclaimerBox },
          React.createElement(Text, { style: styles.disclaimerTitle }, "Important Disclaimer"),
          React.createElement(
            Text,
            { style: styles.disclaimerText },
            "This report is for informational purposes only and does not constitute financial, investment or legal advice. Past performance is not indicative of future results. All figures are illustrative estimates based on available data at the time of generation. Binayah Properties accepts no liability for decisions made in reliance on this report.\n\nFor full terms, visit: binayahhub.com/terms"
          )
        )
      ),
      // Footer
      React.createElement(
        View,
        { style: styles.footer },
        React.createElement(Text, { style: styles.footerText }, `binayah.com/pulse · ${date}`),
        React.createElement(Text, { style: styles.footerBrand }, "BINAYAH PROPERTIES")
      )
    )
  );
}

function kpiCard(label: string, value: string, sub: string) {
  return React.createElement(
    View,
    { style: styles.kpiCard },
    React.createElement(Text, { style: styles.kpiLabel }, label),
    React.createElement(Text, { style: styles.kpiValue }, value),
    React.createElement(Text, { style: styles.kpiSub }, sub)
  );
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function GET() {
  const today = new Date();
  const dateStr = fmtDate(today);
  const fileDate = today.toISOString().slice(0, 10);

  // Fetch market data with a short timeout — fall back to defaults on failure
  let avgPpsf = 0;
  let txYtd = 0;
  let avgYield = 0;
  let offPlanShare = 0;
  let topAreas: { rank: number; name: string; yield: number; ppsf: number; vol: number }[] = [];

  try {
    const [statsRes, areasRes] = await Promise.allSettled([
      serverFetch(serverApiUrl("/api/market-stats"), 5000),
      serverFetch(serverApiUrl("/api/dld/areas?limit=5"), 5000),
    ]);

    if (statsRes.status === "fulfilled" && statsRes.value.ok) {
      const stats: MarketStats = await statsRes.value.json();
      avgPpsf = stats?.summary?.avgPricePerSqft ?? 0;
      avgYield = stats?.summary?.avgYield ?? 0;
      offPlanShare = (stats?.summary?.offPlanShare ?? 0) * 100;
    }

    if (areasRes.status === "fulfilled" && areasRes.value.ok) {
      const areas: DldAreasResponse = await areasRes.value.json();
      const results = areas?.results ?? [];
      topAreas = results.slice(0, 5).map((a, i) => ({
        rank: i + 1,
        name: a.area ?? "—",
        yield: typeof a.rentalYield === "number" ? a.rentalYield : (typeof a.yieldValue === "number" ? a.yieldValue : 0),
        ppsf: a.avgPpsf ?? 0,
        vol: a.totalSales ?? 0,
      }));
    }
  } catch {
    // Use defaults — PDF still renders with empty fields
  }

  // Also try transactions endpoint for YTD count
  try {
    const txRes = await serverFetch(serverApiUrl("/api/market-stats/transactions?period=ytd"), 4000);
    if (txRes.ok) {
      const tx: TransactionsData = await txRes.json();
      txYtd = tx?.transactions?.summary?.totalTransactions ?? 0;
      if (avgPpsf === 0) avgPpsf = tx?.transactions?.summary?.avgPpsf ?? 0;
    }
  } catch {
    // fine — leave txYtd as 0
  }

  // Build PDF
  const doc = React.createElement(PulseDocument, {
    date: dateStr,
    avgPpsf,
    txYtd,
    avgYield,
    offPlanShare,
    topAreas,
  });

  const nodeBuffer = await renderToBuffer(doc as React.ReactElement);
  // Slice produces a plain ArrayBuffer which satisfies the BodyInit type
  const buffer: ArrayBuffer = nodeBuffer.buffer.slice(
    nodeBuffer.byteOffset,
    nodeBuffer.byteOffset + nodeBuffer.byteLength
  ) as ArrayBuffer;

  return new Response(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="binayah-pulse-${fileDate}.pdf"`,
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
