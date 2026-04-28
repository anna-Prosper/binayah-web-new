import { NextRequest, NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import { serverApiUrl } from "@/lib/api";
import * as fs from "fs";
import * as path from "path";

export const runtime = "nodejs";

/**
 * Pre-register all PDFKit standard fonts from the real node_modules path.
 * Next.js webpack rewrites __dirname to "/ROOT" which breaks pdfkit's internal
 * font resolution. Reading the .afm files directly from process.cwd() sidesteps
 * that entirely. Vercel ships node_modules so this works in prod.
 */
function registerStandardFonts(doc: InstanceType<typeof PDFDocument>) {
  const dataDir = path.join(process.cwd(), "node_modules", "pdfkit", "js", "data");
  const fonts: Record<string, string> = {
    Helvetica: "Helvetica.afm",
    "Helvetica-Bold": "Helvetica-Bold.afm",
    "Helvetica-Oblique": "Helvetica-Oblique.afm",
    "Helvetica-BoldOblique": "Helvetica-BoldOblique.afm",
  };
  for (const [name, file] of Object.entries(fonts)) {
    try {
      const afmPath = path.join(dataDir, file);
      if (fs.existsSync(afmPath)) {
        doc.registerFont(name, afmPath);
      }
    } catch {
      // If registration fails, pdfkit falls back to its own resolution — non-fatal
    }
  }
}

interface MarketStats {
  transactionsYtd?: number;
  avgPpsf?: number;
  yoyChange?: number;
  offPlanShare?: number;
  rentalYield?: number;
}

interface CommunityRow {
  name: string;
  avgPpsf?: number;
  totalSales?: number;
  yoyChange?: number;
}

async function fetchSafe<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) return null;
    return res.json() as Promise<T>;
  } catch {
    return null;
  }
}

// Brand colors
const GREEN = "#0B3D2E";
const GOLD = "#D4A847";
const GOLD_DARK = "#B8922F";
const TEXT = "#1a2e25";
const MUTED = "#6b7c75";
const BG_LIGHT = "#f9f6f0";

export async function GET(req: NextRequest) {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10);
  const displayDate = date.toLocaleDateString("en-AE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Fetch data (best-effort — PDF renders even if API is down)
  const [marketStats, areas] = await Promise.all([
    fetchSafe<MarketStats>(serverApiUrl("/api/market-stats")),
    fetchSafe<{ results: CommunityRow[] }>(serverApiUrl("/api/dld/areas?limit=5&sortBy=sales")),
  ]);

  // Build PDF in a streaming buffer
  const chunks: Buffer[] = [];

  await new Promise<void>((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 60, bottom: 60, left: 56, right: 56 },
      // Suppress pdfkit's own font-path resolution so our registerFont calls take precedence
      font: "Helvetica",
    });

    // Register fonts before any drawing
    registerStandardFonts(doc);

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", resolve);
    doc.on("error", reject);

    const W = doc.page.width - 56 * 2; // content width

    // ── Page 1: Header + KPI strip ───────────────────────────────────────────

    // Green header bar
    doc.rect(0, 0, doc.page.width, 90).fill(GREEN);

    // Gold accent line
    doc.rect(0, 90, doc.page.width, 3).fill(GOLD);

    // Brand label
    doc
      .fillColor(GOLD)
      .fontSize(8)
      .font("Helvetica-Bold")
      .text("BINAYAH PROPERTIES", 56, 28, { characterSpacing: 3 });

    // Report title
    doc
      .fillColor("#ffffff")
      .fontSize(22)
      .font("Helvetica-Bold")
      .text("Dubai Property Market Pulse", 56, 48);

    doc.moveDown(2.5);

    // Date line
    doc
      .fillColor(MUTED)
      .fontSize(10)
      .font("Helvetica")
      .text(`Compiled ${displayDate}`, { align: "left" });

    doc.moveDown(1.5);

    // KPI section header
    doc
      .fillColor(GOLD)
      .fontSize(8)
      .font("Helvetica-Bold")
      .text("KEY INDICATORS — YEAR TO DATE", { characterSpacing: 2 });

    doc.moveDown(0.8);

    // KPI grid — 2 columns
    const kpis = [
      {
        label: "Transactions YTD",
        value: marketStats?.transactionsYtd
          ? marketStats.transactionsYtd.toLocaleString()
          : "—",
      },
      {
        label: "Avg Price/sqft",
        value: marketStats?.avgPpsf
          ? `AED ${Math.round(marketStats.avgPpsf).toLocaleString()}`
          : "—",
      },
      {
        label: "YoY Change",
        value: marketStats?.yoyChange
          ? `${marketStats.yoyChange > 0 ? "+" : ""}${marketStats.yoyChange.toFixed(1)}%`
          : "—",
      },
      {
        label: "Rental Yield",
        value: marketStats?.rentalYield
          ? `${marketStats.rentalYield.toFixed(1)}%`
          : "—",
      },
      {
        label: "Off-plan Share",
        value: marketStats?.offPlanShare
          ? `${Math.round(marketStats.offPlanShare)}%`
          : "—",
      },
    ];

    const kpiCols = 2;
    const kpiW = W / kpiCols;
    const kpiStartY = doc.y;

    kpis.forEach((kpi, i) => {
      const col = i % kpiCols;
      const row = Math.floor(i / kpiCols);
      const x = 56 + col * kpiW;
      const y = kpiStartY + row * 56;

      // KPI card background
      doc.roundedRect(x + 2, y, kpiW - 8, 48, 4).fill(BG_LIGHT);

      doc
        .fillColor(MUTED)
        .fontSize(7.5)
        .font("Helvetica")
        .text(kpi.label.toUpperCase(), x + 10, y + 8, { characterSpacing: 0.5 });

      doc
        .fillColor(GREEN)
        .fontSize(18)
        .font("Helvetica-Bold")
        .text(kpi.value, x + 10, y + 22);
    });

    const kpiRowCount = Math.ceil(kpis.length / kpiCols);
    doc.y = kpiStartY + kpiRowCount * 56 + 12;

    doc.moveDown(1.5);

    // ── Top communities table ─────────────────────────────────────────────────

    doc
      .fillColor(GOLD)
      .fontSize(8)
      .font("Helvetica-Bold")
      .text("TOP 5 COMMUNITIES BY SALES VOLUME", { characterSpacing: 2 });

    doc.moveDown(0.6);

    // Table header
    const tableTop = doc.y;
    const cols = { name: 0, ppsf: 200, sales: 310, yoy: 400 };

    doc.rect(56, tableTop, W, 22).fill(GREEN);
    doc
      .fillColor("#ffffff")
      .fontSize(8)
      .font("Helvetica-Bold")
      .text("COMMUNITY", 56 + cols.name + 8, tableTop + 7);
    doc.text("AVG PRICE/SQFT", 56 + cols.ppsf, tableTop + 7);
    doc.text("SALES", 56 + cols.sales, tableTop + 7);
    doc.text("YoY %", 56 + cols.yoy, tableTop + 7);

    const communityRows = areas?.results?.slice(0, 5) || [];
    communityRows.forEach((row, i) => {
      const rowY = tableTop + 22 + i * 26;
      if (i % 2 === 0) {
        doc.rect(56, rowY, W, 26).fill(BG_LIGHT);
      }
      doc
        .fillColor(TEXT)
        .fontSize(9)
        .font("Helvetica-Bold")
        .text(row.name || "—", 56 + cols.name + 8, rowY + 8, { width: 185, ellipsis: true });
      doc
        .font("Helvetica")
        .fillColor(GREEN)
        .text(
          row.avgPpsf ? `AED ${Math.round(row.avgPpsf).toLocaleString()}` : "—",
          56 + cols.ppsf,
          rowY + 8
        );
      doc
        .fillColor(TEXT)
        .text(row.totalSales?.toLocaleString() || "—", 56 + cols.sales, rowY + 8);
      const yoy = row.yoyChange;
      doc
        .fillColor(yoy === undefined ? MUTED : yoy >= 0 ? "#2e7d32" : "#c62828")
        .text(
          yoy !== undefined
            ? `${yoy >= 0 ? "+" : ""}${yoy.toFixed(1)}%`
            : "—",
          56 + cols.yoy,
          rowY + 8
        );
    });

    if (communityRows.length === 0) {
      doc
        .fillColor(MUTED)
        .fontSize(10)
        .font("Helvetica")
        .text("Data unavailable — API unreachable from sandbox", 56, tableTop + 30);
    }

    // ── Footer ────────────────────────────────────────────────────────────────
    doc.on("pageAdded", () => {
      const footerY = doc.page.height - 50;
      doc
        .fillColor(MUTED)
        .fontSize(8)
        .font("Helvetica")
        .text(`Binayah Properties · staging.binayahhub.com/pulse · ${displayDate}`, 56, footerY, {
          align: "left",
        });
      doc.rect(56, footerY - 8, W, 0.5).fill(GOLD);
    });

    // First-page footer
    const footerY = doc.page.height - 50;
    doc.rect(56, footerY - 8, W, 0.5).fill(GOLD);
    doc
      .fillColor(MUTED)
      .fontSize(8)
      .font("Helvetica")
      .text(`Binayah Properties · staging.binayahhub.com/pulse · ${displayDate}`, 56, footerY, {
        align: "left",
      });

    doc.end();
  });

  const pdfBuffer = Buffer.concat(chunks);

  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="binayah-pulse-${dateStr}.pdf"`,
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
