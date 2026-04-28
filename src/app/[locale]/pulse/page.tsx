import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import PulseEmirateNav from "@/components/PulseEmirateNav";
import PulsePageClient from "@/app/pulse/PulsePageClient";
import { serverApiUrl, serverFetch } from "@/lib/api";
import { Activity } from "lucide-react";
import { getTranslations } from "next-intl/server";

export const revalidate = 300;

export const metadata = {
  title: "Dubai Market Pulse | Binayah Properties",
  description: "Live Dubai real estate analytics — price per sqft, rental yields, investment scores, transaction trends, exchange rates, and economic indicators.",
};

async function fetchJson(path: string) {
  try {
    const res = await serverFetch(serverApiUrl(path), 12_000);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function PulsePage() {
  const t = await getTranslations("pulse");
  const [marketStats, marketData] = await Promise.all([
    fetchJson("/api/market-stats"),
    fetchJson("/api/market-data"),
  ]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <PulseEmirateNav />

      {/* Hero */}
      <section
        className="relative pt-32 pb-14 text-white overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
      >
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="h-5 w-5 text-accent" />
            <p className="text-accent font-semibold tracking-[0.4em] uppercase text-xs">{t("heroLabel")}</p>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
            {t("heroTitle")} <span className="italic font-light">{t("heroTitleItalic")}</span>
          </h1>
          <p className="text-primary-foreground/70 max-w-2xl text-base sm:text-lg">
            {t("heroSubtitle")}
          </p>
          <div className="flex flex-wrap items-center gap-4 mt-5 text-xs text-primary-foreground/60">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {t("liveListings")}
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              {t("dldTransactions")}
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              {t("exchangeRates")}
            </div>
          </div>
        </div>
      </section>

      <PulsePageClient marketStats={marketStats} marketData={marketData} />

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
