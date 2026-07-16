import { notFound } from "next/navigation";
import ProjectDetailClient from "@/app/_clients/project/[slug]/ProjectDetailClient";
import { canonical as makeCanonical, altLangs, OG_LOCALE } from "@/lib/site";
import { getProject, getRelatedProjects } from "@/lib/api";
import { applyTranslation } from "@/lib/applyTranslation";
import { BreadcrumbJsonLd } from "@/components/JsonLd";
import { getNonce } from "@/lib/nonce";
import { sanitizeDescriptions } from "@/lib/sanitize";

export const revalidate = 1800;

// Opt into ISR. Without generateStaticParams a [slug] route is fully dynamic
// (private, no-store) regardless of `revalidate`. Returning [] prerenders
// nothing at build (light build) while making every slug ISR-cached on-demand.
export function generateStaticParams() {
  return [];
}

// Normalize any common YouTube/Vimeo URL form (watch / youtu.be / embed) so the
// VideoObject can emit a proper embedUrl â what Google wants for hosted players.
function youtubeId(u: string): string | null {
  const m = String(u).match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([\w-]{11})/i);
  return m ? m[1] : null;
}
function vimeoId(u: string): string | null {
  const m = String(u).match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  return m ? m[1] : null;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const project = sanitizeDescriptions(applyTranslation(await getProject(slug), locale));
  // Missing/delisted project â real 404 (status code), not a soft 200+noindex
  // page. Calling notFound() in generateMetadata makes Next return a proper 404
  // so Google drops the URL instead of parking it under "Excluded by noindex".
  if (!project) notFound();
  const rawSeo = project.seo || {};
  // Strip Yoast/RankMath WordPress import artifacts â fields that start with
  // "Note: None of these options will be appliedâ¦" are placeholder noise, not
  // real descriptions. Treat them as empty so the fallback kicks in.
  const cleanSeo = (v: unknown) =>
    typeof v === "string" && v.startsWith("Note: None of these options") ? "" : v;
  const seo = {
    ...rawSeo,
    metaDescription:     cleanSeo(rawSeo.metaDescription),
    ogDescription:       cleanSeo(rawSeo.ogDescription),
    twitterDescription:  cleanSeo(rawSeo.twitterDescription),
  };

  // Title with a price hook for CTR (project + area + "From AED â¦" + brand),
  // kept within Google's ~60-char SERP limit.
  const rawName = String(project.name || "Off-Plan Project");
  const projName = rawName.length > 38 ? `${rawName.slice(0, 37).trimEnd()}â¦` : rawName;
  const communityStr = project.community ? ` | ${project.community}` : "";
  const priceNum = project.startingPrice
    ? (project.startingPrice < 1_000 ? project.startingPrice * 1_000_000 : project.startingPrice)
    : 0;
  const priceShort = priceNum >= 1_000_000
    ? `AED ${(priceNum / 1_000_000).toFixed(priceNum >= 10_000_000 ? 0 : 1)}M`
    : priceNum >= 1_000
    ? `AED ${Math.round(priceNum / 1_000)}K`
    : "";
  const PJ: Record<string, { from: string; dev: string; desc: (n: string, c: string, d: string, p: string) => string }> = {
    en: { from: "From", dev: "a leading developer", desc: (n, c, d, p) => `${n}${c ? ` in ${c}` : ""}, Dubai by ${d}.${p ? ` Off-plan from ${p} with flexible payment plans.` : ""} Floor plans, prices, handover dates & expert advice — explore with Binayah.` },
    fr: { from: "À partir de", dev: "un promoteur de premier plan", desc: (n, c, d, p) => `${n}${c ? ` à ${c}` : ""}, Dubaï, par ${d}.${p ? ` Sur plan à partir de ${p} avec plans de paiement flexibles.` : ""} Plans, prix, dates de livraison et conseils d'experts — à découvrir avec Binayah.` },
    ru: { from: "от", dev: "ведущего застройщика", desc: (n, c, d, p) => `${n}${c ? ` в ${c}` : ""}, Дубай, от ${d}.${p ? ` Новостройка от ${p} с гибкими планами оплаты.` : ""} Планировки, цены, даты сдачи и советы экспертов — узнайте с Binayah.` },
    ar: { from: "من", dev: "مطوّر رائد", desc: (n, c, d, p) => `${n}${c ? ` في ${c}` : ""}، دبي، من ${d}.${p ? ` على الخارطة ابتداءً من ${p} مع خطط سداد مرنة.` : ""} مخططات وأسعار ومواعيد التسليم ونصائح الخبراء — اكتشفها مع بناية.` },
    zh: { from: "起价", dev: "知名开发商", desc: (n, c, d, p) => `${n}${c ? `，位于${c}` : ""}，迪拜，由${d}开发。${p ? `期房，${p}起，付款计划灵活。` : ""} 户型图、价格、交付日期及专家建议——尽在 Binayah。` },
    vi: { from: "Từ", dev: "một chủ đầu tư hàng đầu", desc: (n, c, d, p) => `${n}${c ? ` tại ${c}` : ""}, Dubai, bởi ${d}.${p ? ` Off-plan từ ${p} với kế hoạch thanh toán linh hoạt.` : ""} Mặt bằng, giá, ngày bàn giao và tư vấn chuyên gia — khám phá cùng Binayah.` },
    he: { from: "החל מ-", dev: "יזם מוביל", desc: (n, c, d, p) => `${n}${c ? ` ב-${c}` : ""}, דובאי, מאת ${d}.${p ? ` על הנייר החל מ-${p} עם תוכניות תשלום גמישות.` : ""} תוכניות, מחירים, מועדי מסירה וייעוץ מומחים — גלו עם Binayah.` },
  };
  const pj = PJ[locale] ?? PJ.en;
  const titleFallback = `${projName}${communityStr}${priceShort ? ` | ${pj.from} ${priceShort}` : ""} | Binayah`;
  const descFallbackRaw = pj.desc(project.name, project.community || "", project.developerName || pj.dev, priceShort);
  const descFallback = descFallbackRaw.length <= 158 ? descFallbackRaw : descFallbackRaw.slice(0, 157).replace(/\s+\S*$/, "") + "â¦";

  // Always self-referential to the .ae URL. Migrated projects carry stale
  // seo.canonicalUrl values â legacy binayah.com/projects/<slug> (the old WP
  // path is now /dubai-projects/<slug>, so it 404s) or outdated .ae slugs â
  // so honoring the stored value risks canonicalising to a non-existent URL.
  const path = `/project/${slug}`;
  const canonicalUrl = makeCanonical(locale, path);

  return {
    title: seo.metaTitle || titleFallback,
    description: seo.metaDescription || descFallback,
    alternates: {
      canonical: canonicalUrl,
      languages: altLangs(path),
    },
    openGraph: {
      title: seo.ogTitle || seo.metaTitle || titleFallback,
      description: seo.ogDescription || seo.metaDescription || descFallback,
      // opengraph-image.tsx serves the dynamic branded OG image (price/completion/photo overlay).
      type: "website",
      url: makeCanonical(locale, path),
      locale: OG_LOCALE[locale] ?? "en_AE",
    },
    twitter: {
      card: "summary_large_image",
      title: seo.twitterTitle || seo.metaTitle || titleFallback,
      description: seo.twitterDescription || seo.metaDescription || descFallback,
    },
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const project = sanitizeDescriptions(applyTranslation(await getProject(slug), locale));
  if (!project) return notFound();
  const nonce = await getNonce();

  // Related projects fetched server-side so the projectâproject links render in
  // SSR HTML (crawlable internal-link graph) instead of a client-only fetch.
  const relatedProjects = await getRelatedProjects(
    project.community || "",
    project.developerName || "",
    slug,
    8
  );

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.binayah.ae";
  const ytId = project.videoUrl ? youtubeId(project.videoUrl) : null;
  const vmId = project.videoUrl ? vimeoId(project.videoUrl) : null;
  const realEstate: Record<string, unknown> = {
    "@type": "RealEstateListing",
    name: project.name,
    description: project.shortOverview || project.overview || undefined,
    url: `${siteUrl}/${locale}/project/${slug}`,
    ...(project.featuredImage ? { image: [project.featuredImage] } : {}),
    ...(project.startingPrice ? {
      offers: {
        "@type": "Offer",
        price: project.startingPrice < 1_000 ? project.startingPrice * 1_000_000 : project.startingPrice,
        priceCurrency: project.currency || "AED",
        availability: "https://schema.org/PreOrder",
      },
    } : {}),
    address: {
      "@type": "PostalAddress",
      ...(project.community ? { addressLocality: project.community } : {}),
      addressRegion: project.city || "Dubai",
      addressCountry: "AE",
    },
    ...(project.developerName ? {
      author: {
        "@type": "Organization",
        name: project.developerName,
      },
    } : {}),
    ...(project.latitude && project.longitude ? {
      geo: {
        "@type": "GeoCoordinates",
        latitude: project.latitude,
        longitude: project.longitude,
      },
    } : {}),
    ...(Array.isArray(project.amenities) && project.amenities.length > 0 ? {
      amenityFeature: project.amenities.map((a: string) => ({
        "@type": "LocationFeatureSpecification",
        name: a,
        value: true,
      })),
    } : {}),
    ...(Array.isArray(project.unitTypes) && project.unitTypes.length > 0 ? {
      numberOfBedrooms: project.unitTypes.join(", "),
    } : {}),
    ...(project.unitSizeMin && project.unitSizeMax ? {
      floorSize: {
        "@type": "QuantitativeValue",
        minValue: project.unitSizeMin,
        maxValue: project.unitSizeMax,
        unitCode: project.unitSizeUnit === "sqm" ? "MTK" : "FTK",
      },
    } : {}),
    ...(project.seo?.metaKeywords?.length ? {
      keywords: Array.isArray(project.seo.metaKeywords)
        ? project.seo.metaKeywords.join(", ")
        : project.seo.metaKeywords,
    } : {}),
  };

  // Top-level VideoObject node (Google detects standalone video rich results far
  // more reliably than one nested inside RealEstateListing). embedUrl for
  // YouTube/Vimeo, contentUrl for a direct file; auto-thumbnail for YouTube.
  const videoNode: Record<string, unknown> | null = project.videoUrl ? {
    "@type": "VideoObject",
    name: `${project.name} - Project Video`,
    description: project.shortOverview || `Video overview of ${project.name} by ${project.developerName || "developer"} in ${project.community || project.city || "Dubai"}.`,
    thumbnailUrl: project.videoThumbnail || project.featuredImage || (ytId ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg` : undefined),
    uploadDate: project.createdAt || new Date().toISOString(),
    ...(ytId
      ? { embedUrl: `https://www.youtube.com/embed/${ytId}` }
      : vmId
        ? { embedUrl: `https://player.vimeo.com/video/${vmId}` }
        : { contentUrl: project.videoUrl }),
  } : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": videoNode ? [realEstate, videoNode] : [realEstate],
  };

  const localePrefix = locale === "en" ? "" : `/${locale}`;
  const projectStatus = String(project.status || "").toLowerCase();
  const isRentalHub = /rent/i.test(projectStatus);
  const isReadyHub  = /ready|complet/i.test(projectStatus);
  const parentName  = isRentalHub ? "Rent" : isReadyHub ? "Buy" : "Off-Plan";
  const parentPath  = isRentalHub ? "/rent" : isReadyHub ? "/buy" : "/off-plan";
  const breadcrumbs = [
    { name: locale === "fr" ? "Accueil" : locale === "ru" ? "Главная" : locale === "ar" ? "الرئيسية" : locale === "zh" ? "首页" : locale === "vi" ? "Trang chủ" : locale === "he" ? "בית" : "Home", href: `${localePrefix}/` },
    { name: parentName,      href: `${localePrefix}${parentPath}` },
    { name: project.name,    href: `${localePrefix}/project/${slug}` },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <BreadcrumbJsonLd items={breadcrumbs} />
      <ProjectDetailClient serverProject={project} serverSimilar={relatedProjects} />
    </>
  );
}
