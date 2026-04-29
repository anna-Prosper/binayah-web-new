import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import PulseEmirateNav from "@/components/PulseEmirateNav";
import DubaiEmirateClient from "./DubaiEmirateClient";
import { serverApiUrl, serverFetch } from "@/lib/api";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Dubai Market Report | Binayah Properties",
  description:
    "Live Dubai real estate analytics — transactions YTD, average PPSF, rental yield, community leaders, developer rankings, and investment highlights.",
  openGraph: {
    title: "Dubai Market Report | Binayah Pulse",
    description: "Live Dubai real estate analytics — transactions, yield, community highlights.",
    images: ["/api/og/pulse?metric=Avg+PPSF&trend=up"],
  },
};

async function fetchJson(path: string, ms = 12_000) {
  try {
    const res = await serverFetch(serverApiUrl(path), ms);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function DubaiEmiratePage() {
  const t = await getTranslations("dubaiEmirate");

  const [marketStats, marketData, areasData, projectsData] = await Promise.all([
    fetchJson("/api/market-stats"),
    fetchJson("/api/market-data"),
    fetchJson("/api/dld/areas?sort=totalSales&limit=50"),
    fetchJson("/api/projects?status=active&limit=100"),
  ]);

  return (
    <div className="min-h-screen" style={{ background: "hsl(var(--pulse-bg))" }}>
      <Navbar />
      <PulseEmirateNav />

      {/* Hero — pulse-surface with thin border-bottom; no brand-green gradient */}
      <section
        className="relative pt-32 pb-16 overflow-hidden"
        style={{
          background: "hsl(var(--pulse-surface))",
          borderBottom: "1px solid hsl(var(--pulse-border))",
        }}
      >
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, hsl(var(--pulse-gold)) 1px, transparent 0)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
          {/* Eyebrow */}
          <p
            className="text-[10px] font-bold tracking-[0.4em] uppercase mb-3"
            style={{ color: "hsl(var(--pulse-gold))" }}
          >
            {t("eyebrow")}
          </p>

          {/* Emirate name */}
          <div className="flex flex-wrap items-center gap-4 mb-3">
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-bold"
              style={{ color: "hsl(var(--pulse-text))" }}
            >
              {t("title")} <span className="italic font-light">{t("titleItalic")}</span>
            </h1>
          </div>

          <p className="max-w-2xl text-base sm:text-lg mb-6" style={{ color: "hsl(var(--pulse-text-muted))" }}>
            {t("lede")}
          </p>

          {/* Status row */}
          <div className="flex flex-wrap items-center gap-3 text-xs" style={{ color: "hsl(var(--pulse-text-dim))" }}>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {t("liveData")}
            </div>
            <span style={{ color: "hsl(var(--pulse-border))" }}>·</span>
            <span>{t("dldSource")}</span>
          </div>
        </div>
      </section>

      <DubaiEmirateClient
        marketStats={marketStats}
        marketData={marketData}
        areasData={areasData}
        projectsData={projectsData}
      />

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
