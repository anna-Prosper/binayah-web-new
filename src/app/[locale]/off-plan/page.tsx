import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { canonical, altLangs, OG_LOCALE, DEFAULT_OG_IMAGE } from "@/lib/site";

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Off-Plan Properties in Dubai | Binayah Properties",
    description: "Discover Dubai's best off-plan developments. High-ROI projects in prime locations with flexible payment plans. Browse with Binayah Properties.",
    alternates: {
      canonical: canonical(locale, "/off-plan"),
      languages: altLangs("/off-plan"),
    },
    openGraph: {
      title: "Off-Plan Properties in Dubai | Binayah Properties",
      description: "Discover Dubai's best off-plan developments. High-ROI projects in prime locations with flexible payment plans.",
      url: canonical(locale, "/off-plan"),
      type: "website",
      locale: OG_LOCALE[locale] ?? "en_AE",
      images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630 }],
    },
  };
}

export default async function OffPlanPage({ searchParams }: Props) {
  const sp = await searchParams;
  const qs = new URLSearchParams({ status: "Off-Plan" });
  for (const [k, v] of Object.entries(sp)) {
    if (k === "status") continue;
    if (Array.isArray(v)) v.forEach((vv) => qs.append(k, vv));
    else if (v != null) qs.set(k, v);
  }
  redirect(`/search?${qs.toString()}`);
}
