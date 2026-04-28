import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import PulseSubNav from "@/components/PulseSubNav";
import CompareClient from "./CompareClient";
import { serverApiUrl, serverFetch } from "@/lib/api";

export const revalidate = 300;

export const metadata = {
  title: "Community Compare | Dubai Pulse | Binayah Properties",
  description: "Compare Dubai communities and developers side-by-side on price, yield, volume and more.",
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

export default async function ComparePage() {
  const [marketStats, marketData, communities, developers] = await Promise.all([
    fetchJson("/api/market-stats"),
    fetchJson("/api/market-data"),
    fetchJson("/api/communities"),
    fetchJson("/api/developers"),
  ]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <PulseSubNav />
      <CompareClient
        marketStats={marketStats}
        marketData={marketData}
        communities={communities}
        developers={developers}
      />
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
