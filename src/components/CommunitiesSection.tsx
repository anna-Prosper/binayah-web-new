import { ArrowUpRight } from "lucide-react";
// Locale-aware Link (next-intl): plain next/link emits bare hrefs, which
// localePrefix "as-needed" resolves to the DEFAULT locale — dropping non-English
// readers back into English. This variant prefixes hrefs with the active locale.
import { Link } from "@/navigation";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { getCachedSearch } from "@/lib/api";

// `name` doubles as the /api/search `location` value (community names are stored
// in English in the DB), so it must stay in English here even on localized
// pages. No property counts are stored: they are read live per render, because
// the constants that used to sit here ("450+", "320+", "580+", "290+") had
// drifted to 7x, 5x, 13x and 2.5x the real inventory.
const COMMUNITIES = [
  { name: "Downtown Dubai", slug: "downtown-dubai", image: "/assets/communities/downtown-dubai.webp" },
  { name: "Palm Jumeirah", slug: "palm-jumeirah", image: "/assets/communities/palm-jumeirah.webp" },
  { name: "Dubai Marina", slug: "dubai-marina", image: "/assets/communities/dubai-marina.webp" },
  { name: "Business Bay", slug: "business-bay", image: "/assets/communities/business-bay.webp" },
];

// Thousands separator per locale, matching the numeral conventions used across
// the localized content. Intl.NumberFormat is deliberately not used: it renders
// Arabic-Indic digits for `ar` (٦٢), which nothing else on the site does.
const GROUP_SEP: Record<string, string> = {
  en: ",", zh: ",", ar: ",", he: ",", ru: "\u00A0", fr: "\u00A0", vi: ".",
};
function formatCount(n: number, locale: string): string {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, GROUP_SEP[locale] ?? ",");
}

/**
 * Live buy-side inventory for one community. Returns null when the API is
 * unavailable, malformed or reports nothing — the caller then drops that tile
 * entirely rather than printing "0" or falling back to a constant: a failed
 * fetch must never become an inventory claim. `getCachedSearch` returns null on
 * error instead of throwing and caches across requests, so these four reads are
 * one cheap upstream round each per revalidation window, not per render.
 */
async function liveCommunityCount(name: string): Promise<number | null> {
  const data = await getCachedSearch<{ totalCount?: number }>(
    `intent=buy&location=${encodeURIComponent(name)}&pageSize=1`
  );
  const n = Number(data?.totalCount);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : null;
}

// Grid width for however many tiles survived the live read. Every class string
// is a full literal so Tailwind's scanner keeps all four in the bundle.
const GRID_COLS: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-2 lg:grid-cols-4",
};

// Server Component: real crawlable HTML, zero client JS. Former framer-motion
// entrance animations were decorative and are dropped; hover states are pure
// CSS. Rendered server-side via a slot in page.tsx (not gated by LazyMount).
export default async function CommunitiesSection({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "home.sections.communities" });

  const counts = await Promise.all(COMMUNITIES.map((c) => liveCommunityCount(c.name)));
  const communities = COMMUNITIES
    .map((c, i) => ({ ...c, count: counts[i] }))
    .filter((c): c is (typeof COMMUNITIES)[number] & { count: number } => c.count !== null);

  // Nothing verifiable to show (API down): render no section at all rather than
  // a row of tiles carrying invented numbers.
  if (communities.length === 0) return null;

  return (
  <section id="communities" className="py-8 sm:py-20 bg-card scroll-mt-20">
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      {/* Mobile: compact inline header */}
      <div className="sm:hidden flex items-center justify-between mb-4">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.3em] uppercase mb-1" style={{ color: "#A07924" }}>{t("label")}</p>
          <h2 className="text-sm font-bold text-foreground">{t("title")}</h2>
        </div>
        <Link href="/communities" className="group flex items-center gap-1 text-primary font-semibold text-xs">
          {t("viewAll")} <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Desktop: centered header with View All */}
      <div className="hidden sm:block text-center mb-14 relative">
        <div className="h-[2px] mx-auto mb-6 w-12" style={{ background: "linear-gradient(90deg, #D4A847, #B8922F)" }} />
        <p className="font-semibold tracking-[0.4em] uppercase text-xs mb-4" style={{ color: "#D4A847" }}>
          {t("label")}
        </p>
        <h2 className="text-4xl lg:text-5xl font-bold text-foreground">
          {t("title")} <span className="font-light">{t("titleItalic")}</span>
        </h2>
        <Link href="/communities" className="group absolute right-0 bottom-0 flex items-center gap-2 text-primary font-semibold text-sm hover:gap-3 transition-all">
          {t("viewAll")} <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Mobile: horizontal scroll */}
      <div className="sm:hidden -mx-4 px-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide flex gap-3 pb-2">
        {communities.map((c) => (
          <div key={c.name} className="flex-shrink-0 w-[72%] snap-center">
            <Link href={`/communities/${c.slug}`} className="group block relative rounded-2xl overflow-hidden aspect-[4/3]">
              <Image src={c.image} alt={c.name} fill sizes="72vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-white font-bold text-base mb-0.5">{c.name}</h3>
                <p className="text-white/70 text-xs">{formatCount(c.count, locale)} {t("properties")}</p>
                <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-semibold text-white/90 px-2 py-0.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                  {t("explore")} <ArrowUpRight className="h-2.5 w-2.5" />
                </span>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* Desktop grid */}
      <div className={`hidden sm:grid ${GRID_COLS[communities.length]} gap-4 sm:gap-6`}>
        {communities.map((c) => (
          <div key={c.name}>
            <Link href={`/communities/${c.slug}`} className="group block relative rounded-2xl overflow-hidden aspect-[3/4]">
              <Image src={c.image} alt={c.name} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <h3 className="text-white font-bold text-lg mb-1">{c.name}</h3>
                <div className="flex items-center justify-between">
                  <p className="text-white/70 text-sm">{formatCount(c.count, locale)} {t("properties")}</p>
                  <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                    <ArrowUpRight className="h-4 w-4 text-white" />
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  </section>
  );
}
