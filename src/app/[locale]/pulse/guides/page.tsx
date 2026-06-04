import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import PulseEmirateNav from "@/components/PulseEmirateNav";
import GuidesClient from "./GuidesClient";
import type { Metadata } from "next";
import { canonical, altLangs } from "@/lib/site";

export const revalidate = 86400;

interface Props { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Property Investment Guides | Dubai Pulse | Binayah Properties",
    description: "In-depth guides on Dubai real estate investing — best areas, yields, off-plan vs secondary, and more.",
    alternates: {
      canonical: canonical(locale, "/pulse/guides"),
      languages: altLangs("/pulse/guides"),
    },
    openGraph: {
      title: "Property Investment Guides | Binayah Properties",
      url: canonical(locale, "/pulse/guides"),
      type: "website",
      images: [{ url: "/assets/og-image.webp", width: 1200, height: 630 }],
    },
  };
}

export default function GuidesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <PulseEmirateNav />
      <GuidesClient />
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
