import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import PulseEmirateNav from "@/components/PulseEmirateNav";
import TrendingClient from "./TrendingClient";
import { serverApiUrl, serverFetch } from "@/lib/api";

export const revalidate = 300;

export const metadata = {
  title: "Trending | Dubai Pulse | Binayah Properties",
  description: "Biggest movers, new launches, and the latest insights from the Dubai real estate market.",
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

export default async function TrendingPage() {
  const [marketData, projects] = await Promise.all([
    fetchJson("/api/market-data"),
    fetchJson("/api/projects?status=Off-Plan&limit=20"),
  ]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <PulseEmirateNav />
      <TrendingClient marketData={marketData} projects={projects} />
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
