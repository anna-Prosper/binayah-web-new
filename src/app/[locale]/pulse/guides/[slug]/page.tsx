import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import PulseSubNav from "@/components/PulseSubNav";
import GuideDetailClient from "./GuideDetailClient";
import { PULSE_GUIDES, findGuide } from "@/lib/pulse-guides";
import { getTranslations } from "next-intl/server";

export const revalidate = 86400;

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateStaticParams() {
  return PULSE_GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const guide = findGuide(slug);
  if (!guide) return {};
  const t = await getTranslations("pulseGuides");
  return {
    title: `${t(guide.titleKey as Parameters<typeof t>[0])} | Dubai Pulse | Binayah Properties`,
    description: t(guide.descriptionKey as Parameters<typeof t>[0]),
  };
}

export default async function GuideDetailPage({ params }: Props) {
  const { slug } = await params;
  const guide = findGuide(slug);
  if (!guide) notFound();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <PulseSubNav />
      <GuideDetailClient guide={guide} />
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
