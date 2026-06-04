import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { canonical, altLangs } from "@/lib/site";

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Properties for Sale in Dubai | Binayah Properties",
    description: "Browse apartments, villas and townhouses for sale in Dubai. Find secondary market properties with Binayah Properties.",
    alternates: {
      canonical: canonical(locale, "/buy"),
      languages: altLangs("/buy"),
    },
  };
}

export default async function BuyPage({ searchParams }: Props) {
  const sp = await searchParams;
  const qs = new URLSearchParams({ intent: "buy" });
  for (const [k, v] of Object.entries(sp)) {
    if (k === "intent") continue;
    if (Array.isArray(v)) v.forEach((vv) => qs.append(k, vv));
    else if (v != null) qs.set(k, v);
  }
  redirect(`/search?${qs.toString()}`);
}
