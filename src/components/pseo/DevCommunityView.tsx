/* eslint-disable i18next/no-literal-string -- programmatic SEO template; values are data-driven English */
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Building2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { BreadcrumbJsonLd } from "@/components/JsonLd";
import CommunityStatsBand from "@/components/CommunityStatsBand";
import { getDeveloper } from "@/lib/api";
import { findBuyCommunity } from "@/lib/buy-communities";
import { getCommunityStats, buildCommunityFaqs, fmtAed } from "@/lib/market";
import { getNonce } from "@/lib/nonce";
import { canonical as makeCanonical, altLangs, AE_URL } from "@/lib/site";

// URL: /{developer-slug}-projects-in-{community-slug}
export function parseDevCommunity(slug: string): { devSlug: string; communitySlug: string } | null {
  const m = slug.match(/^(.+)-projects-in-(.+)$/i);
  if (!m) return null;
  return { devSlug: m[1].toLowerCase(), communitySlug: m[2].toLowerCase() };
}

const norm = (s: string) => (s || "").toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, " ").trim();

export async function resolveDevCommunity(devSlug: string, communitySlug: string) {
  return resolve(devSlug, communitySlug);
}
async function resolve(devSlug: string, communitySlug: string) {
  const community = findBuyCommunity(communitySlug);
  if (!community) return null;
  const data = (await getDeveloper(devSlug)) as { developer?: { name?: string }; projects?: any[] } | null;
  if (!data?.developer?.name) return null;
  const apiCommunity = community.apiName ?? community.name;
  const targets = new Set([norm(community.name), norm(apiCommunity)]);
  const projects = (data.projects || []).filter((p) => {
    const cn = norm(p.community || "");
    return cn && (targets.has(cn) || [...targets].some((t) => cn.includes(t) || t.includes(cn)));
  });
  return { developerName: data.developer.name, community, apiCommunity, projects };
}

const startingPriceAed = (p: any): number =>
  p?.startingPrice ? (p.startingPrice < 1_000 ? p.startingPrice * 1_000_000 : p.startingPrice) : 0;

export async function buildDevCommunityMeta(devSlug: string, communitySlug: string, locale: string, searchSlug: string): Promise<Metadata> {
  const r = await resolve(devSlug, communitySlug);
  if (!r) return {};
  const title = `${r.developerName} Projects in ${r.community.name}, Dubai | Binayah`;
  const description = `Explore off-plan projects by ${r.developerName} in ${r.community.name}, Dubai — prices, floor plans, payment plans and availability. ${r.projects.length} project${r.projects.length === 1 ? "" : "s"} with Binayah.`.slice(0, 158);
  const path = `/${searchSlug}`;
  return {
    title,
    description,
    ...(r.projects.length === 0 ? { robots: { index: false, follow: true } } : {}),
    alternates: { canonical: makeCanonical(locale, path), languages: altLangs(path) },
    openGraph: { title, description, type: "website", url: makeCanonical(locale, path), images: [{ url: `${AE_URL}/assets/og-image.webp`, width: 1200, height: 630 }] },
  };
}

export default async function DevCommunityView({ devSlug, communitySlug, locale, searchSlug }: { devSlug: string; communitySlug: string; locale: string; searchSlug: string }) {
  const r = await resolve(devSlug, communitySlug);
  if (!r) return null; // caller 404s
  const { developerName, community, apiCommunity, projects } = r;
  const lp = locale === "en" ? "" : `/${locale}`;
  const nonce = await getNonce();
  const stats = await getCommunityStats(apiCommunity);
  const faqs = buildCommunityFaqs(community.name, stats);

  const h1 = `${developerName} Projects in ${community.name}, Dubai`;
  const breadcrumbs = [
    { name: "Home", href: `${lp}/` },
    { name: "Developers", href: `${lp}/developers` },
    { name: developerName, href: `${lp}/developers/${devSlug}` },
    { name: community.name, href: `${lp}/off-plan-in/${community.slug}` },
  ];

  return (
    <div className="min-h-screen bg-background">
      <BreadcrumbJsonLd items={breadcrumbs} nonce={nonce} />
      <Navbar />

      <section className="relative overflow-hidden pt-28 pb-12 text-white" style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}>
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)", backgroundSize: "48px 48px" }} />
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
          <p className="text-accent font-bold tracking-[0.3em] uppercase text-xs mb-3">{developerName} · {community.name}</p>
          <h1 className="text-3xl sm:text-5xl font-bold leading-tight mb-3">{h1}</h1>
          <p className="text-primary-foreground/80 text-lg max-w-2xl">
            {projects.length > 0
              ? `${projects.length} ${developerName} development${projects.length === 1 ? "" : "s"} in ${community.name} — explore prices, floor plans and payment plans.`
              : `Discover ${developerName} developments in ${community.name}, Dubai.`}
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-10">
        {projects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((p) => {
              const price = startingPriceAed(p);
              const img = p.featuredImage || (Array.isArray(p.imageGallery) ? p.imageGallery[0] : "") || "";
              return (
                <Link key={p.slug} href={`${lp}/project/${p.slug}`} className="group rounded-2xl overflow-hidden border border-border/50 hover:border-primary/30 hover:shadow-md transition-all bg-background">
                  <div className="relative aspect-[4/3] bg-muted">
                    {img ? (
                      <Image src={img} alt={p.name} fill className="object-cover group-hover:scale-[1.03] transition-transform duration-500" sizes="(max-width:768px) 100vw, 360px" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-muted-foreground"><Building2 className="h-8 w-8" /></div>
                    )}
                  </div>
                  <div className="p-4">
                    <h2 className="font-bold text-foreground text-sm sm:text-base leading-snug mb-1 line-clamp-1">{p.name}</h2>
                    <p className="text-xs text-muted-foreground mb-2">{p.status || "Off-Plan"} · {p.community}</p>
                    <p className="text-sm font-semibold" style={{ color: "#1A7A5A" }}>{price ? `From ${fmtAed(price)}` : "Price on request"}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="max-w-xl mx-auto text-center py-12">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">No {developerName} projects listed in {community.name} right now</h2>
            <p className="text-sm text-muted-foreground mb-6">Browse all {developerName} projects, or everything available in {community.name}.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href={`${lp}/developers/${devSlug}`} className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-white font-semibold text-sm" style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}>All {developerName} projects <ArrowRight className="h-4 w-4" /></Link>
              <Link href={`${lp}/off-plan-in/${community.slug}`} className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-semibold text-sm border-2" style={{ borderColor: "#D4A847", color: "#B8922F" }}>Off-plan in {community.name} <ArrowRight className="h-4 w-4" /></Link>
            </div>
          </div>
        )}

        {/* Cross-links */}
        <div className="flex flex-wrap gap-3 mt-8">
          <Link href={`${lp}/developers/${devSlug}`} className="text-sm text-primary hover:underline">All {developerName} projects in Dubai →</Link>
          <span className="text-border">|</span>
          <Link href={`${lp}/off-plan-in/${community.slug}`} className="text-sm text-primary hover:underline">All off-plan in {community.name} →</Link>
        </div>
      </div>

      <CommunityStatsBand name={community.name} stats={stats} faqs={faqs} localePrefix={lp} nonce={nonce} />

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
