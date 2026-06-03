import DeveloperDetailClient from "@/app/_clients/developers/[slug]/DeveloperDetailClient";
import { notFound } from "next/navigation";
import { getDeveloper } from "@/lib/api";
import type { Metadata } from "next";

export const revalidate = 3600;

interface Props {
  params: Promise<{ slug: string; locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params;
  const data = await getDeveloper(slug);
  if (!data?.developer) return { title: "Developer Not Found" };
  const { developer } = data;
  const name = developer.name as string;
  const siteUrl = "https://www.binayah.ae";
  return {
    title: `${name} Projects Dubai | Binayah Properties`,
    description: `Explore off-plan and ready projects by ${name} in Dubai. Find prices, payment plans and investment opportunities with Binayah Properties.`,
    alternates: {
      canonical: `${siteUrl}/${locale}/developers/${slug}`,
      languages: {
        en: `${siteUrl}/en/developers/${slug}`,
        ru: `${siteUrl}/ru/developers/${slug}`,
        ar: `${siteUrl}/ar/developers/${slug}`,
        zh: `${siteUrl}/zh/developers/${slug}`,
        "x-default": `${siteUrl}/en/developers/${slug}`,
      },
    },
    openGraph: {
      title: `${name} | Dubai Projects`,
      description: `Browse all ${name} projects in Dubai.`,
      url: `${siteUrl}/${locale}/developers/${slug}`,
      type: "website",
      ...(developer.logo ? { images: [developer.logo as string] } : {}),
    },
  };
}

export default async function DeveloperDetailPage({ params }: Props) {
  const { slug } = await params;

  const data = await getDeveloper(slug);

  if (!data || !data.developer) return notFound();

  const { developer, projects } = data;

  return (
    <DeveloperDetailClient
      developer={developer}
      projects={projects || []}
    />
  );
}
