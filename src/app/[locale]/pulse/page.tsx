import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import PulsePageClient from "@/app/pulse/PulsePageClient";
import { serverApiUrl, serverFetch } from "@/lib/api";
import { Activity } from "lucide-react";

export const revalidate = 300;

export const metadata = {
  title: "Dubai Market Pulse | Binayah Properties",
  description: "Live Dubai real estate analytics — price per sqft, rental yields, investment scores, and community comparisons across top areas.",
};

async function getMarketData() {
  try {
    const res = await serverFetch(serverApiUrl("/api/market-stats"), 10_000);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function PulsePage() {
  const data = await getMarketData();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section
        className="relative pt-32 pb-14 text-white overflow-hidden"
        style={{ background: "linear-gradient(160deg, #0B3D2E 0%, #145C3F 40%, #1A7A5A 100%)" }}
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
            <p className="text-accent font-semibold tracking-[0.4em] uppercase text-xs">Market Intelligence</p>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
            Dubai Market <span className="italic font-light">Pulse</span>
          </h1>
          <p className="text-primary-foreground/70 max-w-2xl text-base sm:text-lg">
            Live analytics across Dubai&apos;s top communities — price per sqft, rental yields,
            investment scores, and supply breakdown. Updated every 5 minutes.
          </p>
          <div className="flex items-center gap-2 mt-5">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-primary-foreground/60">Live data · refreshes every 5 min</span>
          </div>
        </div>
      </section>

      {!data && (
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <Activity className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">Market data is temporarily unavailable. Please try again shortly.</p>
        </div>
      )}

      <PulsePageClient data={data} />

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
