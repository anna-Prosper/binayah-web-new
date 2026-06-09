import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import PulseEmirateNav from "@/components/PulseEmirateNav";
import DailyClient from "./DailyClient";
import { serverApiUrl, serverFetch } from "@/lib/api";
import { CalendarDays } from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { canonical, altLangs, OG_LOCALE, DEFAULT_OG_IMAGE } from "@/lib/site";

export const revalidate = 300;

interface Props { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations("pulseDaily");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      canonical: canonical(locale, "/pulse/daily"),
      languages: altLangs("/pulse/daily"),
    },
    openGraph: {
      title: t("metaTitle"),
      description: t("metaDescription"),
      url: canonical(locale, "/pulse/daily"),
      type: "website",
      locale: OG_LOCALE[locale] ?? "en_AE",
      images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630 }],
    },
  };
}

async function fetchJson(path: string) {
  try {
    const res = await serverFetch(serverApiUrl(path), 12_000);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function DailyPage() {
  const t = await getTranslations("pulseDaily");

  // Initial server fetch — defaults to today (Dubai time) on the API side.
  const initialData = await fetchJson("/api/dld/daily");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <PulseEmirateNav />

      {/* Hero — verbatim pulse green gradient band */}
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
            <CalendarDays className="h-5 w-5 text-accent" />
            <p className="text-accent font-semibold tracking-[0.4em] uppercase text-xs">{t("heroLabel")}</p>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
            {t("heroTitle")} <span className="font-light">{t("heroTitleItalic")}</span>
          </h1>
          <p className="text-primary-foreground/70 max-w-2xl text-base sm:text-lg">
            {t("heroSubtitle")}
          </p>
          <div className="mt-5">
            <span className="inline-flex items-center gap-2 text-[11px] sm:text-xs text-primary-foreground/80 bg-white/10 border border-white/15 rounded-full px-3 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              {t("sourcePill")}
            </span>
          </div>
        </div>
      </section>

      <DailyClient initialData={initialData} />

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
