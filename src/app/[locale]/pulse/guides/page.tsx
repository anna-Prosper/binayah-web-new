import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NewsletterStrip from "@/components/NewsletterStrip";
import PulseEmirateNav from "@/components/PulseEmirateNav";
import GuidesClient from "./GuidesClient";
import type { Metadata } from "next";
import { canonical, altLangs } from "@/lib/site";
import { getTranslations } from "next-intl/server";

export const revalidate = 86400;

interface Props { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pulseGuides" });
  const pageTitle = `${t("title")} ${t("titleItalic")} | Dubai Pulse | Binayah Properties`;
  const description = t("subtitle");
  return {
    title: pageTitle,
    description,
    alternates: {
      canonical: canonical(locale, "/pulse/guides"),
      languages: altLangs("/pulse/guides"),
    },
    openGraph: {
      title: `${t("title")} ${t("titleItalic")} | Binayah Properties`,
      description,
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
      <NewsletterStrip source="guides-index" />
      <Footer />
    </div>
  );
}
