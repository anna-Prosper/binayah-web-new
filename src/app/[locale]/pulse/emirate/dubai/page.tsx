import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import PulseEmirateNav from "@/components/PulseEmirateNav";
import DubaiEmirateClient from "./DubaiEmirateClient";
import { serverApiUrl, serverFetch } from "@/lib/api";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
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

  const txSummary = marketData?.transactions?.summary;

  return (
    <div className="min-h-screen" style={{ background: "hsl(var(--pulse-bg))" }}>
      <Navbar />
      <PulseEmirateNav />

      {/* Hero — Dubai skyline image at low opacity beneath brand-green gradient
          keeps premium editorial feel while anchoring to real place identity. */}
      <section className="relative pt-36 pb-28 overflow-hidden text-white">
        {/* Base: Dubai skyline at low opacity */}
        <div className="absolute inset-0">
          <Image
            src="/assets/dubai-hero.webp"
            alt=""
            fill
            className="object-cover object-center"
            priority
            unoptimized
          />
        </div>
        {/* Brand-green gradient — strong at left, eases at right so image breathes through */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(135deg, rgba(11,61,46,0.94) 0%, rgba(26,122,90,0.82) 60%, rgba(11,61,46,0.75) 100%)",
          }}
        />
        {/* Gold accent rule along the top */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, #D4A847 30%, #D4A847 70%, transparent 100%)",
          }}
        />
        {/* Subtle gold dot grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, #D4A847 1px, transparent 0)",
            backgroundSize: "48px 48px",
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
          <p
            className="text-[10px] font-bold tracking-[0.4em] uppercase mb-3"
            style={{ color: "#D4A847" }}
          >
            {t("eyebrow")}
          </p>

          <div className="flex flex-wrap items-center gap-4 mb-3">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white">
              {t("title")} <span className="italic font-light">{t("titleItalic")}</span>
            </h1>
          </div>

          <p className="max-w-2xl text-base sm:text-lg mb-8 text-white/75">
            {t("lede")}
          </p>

          {/* Live indicator + quick stat strip */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-white/60">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
              {t("liveData")}
            </div>
            <span className="text-white/30 hidden sm:block">·</span>
            <span>{t("dldSource")}</span>
            {txSummary?.totalTransactions && (
              <>
                <span className="text-white/30 hidden sm:block">·</span>
                <span className="text-white/80 font-medium">
                  {txSummary.totalTransactions.toLocaleString()} {t("heroTxYtd")}
                </span>
              </>
            )}
            {txSummary?.avgPpsf && (
              <>
                <span className="text-white/30 hidden sm:block">·</span>
                <span className="text-white/80 font-medium">
                  AED {txSummary.avgPpsf.toLocaleString()} {t("heroAvgPpsf")}
                </span>
              </>
            )}
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
