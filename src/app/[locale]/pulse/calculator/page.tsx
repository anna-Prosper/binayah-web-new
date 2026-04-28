import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import PulseEmirateNav from "@/components/PulseEmirateNav";
import CalculatorClient from "./CalculatorClient";
import { serverApiUrl, serverFetch } from "@/lib/api";

export const revalidate = 300;

export const metadata = {
  title: "Investment Calculator | Dubai Pulse | Binayah Properties",
  description: "Calculate potential returns, rental yield and projected value for Dubai real estate investment.",
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

export default async function CalculatorPage() {
  const [marketStats, marketData] = await Promise.all([
    fetchJson("/api/market-stats"),
    fetchJson("/api/market-data"),
  ]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <PulseEmirateNav />
      <CalculatorClient marketStats={marketStats} marketData={marketData} />
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
