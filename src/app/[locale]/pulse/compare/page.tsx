import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import PulseEmirateNav from "@/components/PulseEmirateNav";
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
  const [marketStats, marketData, communities, developers, dldAreas] = await Promise.all([
    fetchJson("/api/market-stats"),
    fetchJson("/api/market-data"),
    fetchJson("/api/communities"),
    fetchJson("/api/developers?limit=200"),
    fetchJson("/api/dld/areas?limit=200&sortBy=totalSales"),
  ]);

  // Build set of community names that have actual data (market-stats or DLD areas)
  const matrixNames = new Set<string>(
    ((marketStats as { communityMatrix?: { area: string }[] } | null)?.communityMatrix ?? [])
      .map((c: { area: string }) => c.area.toLowerCase())
  );
  const dldAreaNames = new Set<string>(
    ((dldAreas as { results?: { name: string }[] } | null)?.results ?? [])
      .map((a: { name: string }) => a.name.toLowerCase())
  );

  // Only include communities that have at least one data source
  const filteredCommunities = Array.isArray(communities)
    ? communities.filter((c: { name: string }) =>
        matrixNames.has(c.name.toLowerCase()) || dldAreaNames.has(c.name.toLowerCase())
      )
    : communities;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <PulseEmirateNav />
      <CompareClient
        marketStats={marketStats}
        marketData={marketData}
        communities={filteredCommunities}
        developers={developers}
      />
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
