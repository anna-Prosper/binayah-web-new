"use client";

import { IMAGE_PLACEHOLDER } from "@/lib/images";
import { apiUrl } from "@/lib/api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NewsletterStrip from "@/components/NewsletterStrip";
import { CardActions } from "@/components/PropertyActions";
import PropertyComparison from "@/components/PropertyComparison";
import { motion } from "framer-motion";
import { BedDouble, Bath, MapPin, Loader2, Maximize2, Building, Hash } from "lucide-react";
import Link from "next/link";
import ImageWithFallback from "@/components/ImageWithFallback";
import { useCallback, useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useCurrency } from "@/context/CurrencyContext";

interface Listing {
  _id: string;
  name: string;
  slug: string;
  listingType?: string;
  propertyType?: string;
  propertyId?: string;
  offplan?: string | number;
  completionStatus?: string;
  bedrooms?: string | number;
  bathrooms?: string | number;
  size?: number;
  sizeUnit?: string;
  price?: number;
  currency?: string;
  community?: string;
  city?: string;
  featuredImage?: string;
  imageGallery?: string[];
}

function ListingsPageClientInner({
  initialListings,
  totalCount,
  listingType,
  title,
  subtitle,
  initialPage = 1,
  batchSize = 9,
  community,
  propertyType,
  bedrooms,
  headerSlot,
  emptyState,
}: {
  initialListings: Listing[];
  totalCount: number;
  listingType: "Rent" | "Sale";
  title: string;
  subtitle: string;
  initialPage?: number;
  batchSize?: number;
  /** Restrict fetched listings to this community name. */
  community?: string;
  /** Restrict fetched listings to this propertyType (e.g. "Apartment"). */
  propertyType?: string;
  /** Restrict fetched listings to this bedroom count (0 = studio). */
  bedrooms?: string | number;
  /** Server-rendered SEO content slot, inserted between hero and listing grid. */
  headerSlot?: React.ReactNode;
  /** Custom node shown when there are no listings (replaces the default message). */
  emptyState?: React.ReactNode;
}) {
  const t = useTranslations("rent");
  const tEnum = useTranslations("enums");
  const { format: fmtCurrency } = useCurrency();
  const router = useRouter();
  const pathname = usePathname();
  const [page, setPage] = useState(initialPage);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["listings", listingType, community ?? "", propertyType ?? "", String(bedrooms ?? ""), initialPage],
    queryFn: async ({ pageParam = initialListings.length }) => {
      // Carry the same filters the SSR batch used, so load-more stays scoped
      // (e.g. on /2-bedroom-apartments-for-sale-in-... pages).
      const communityParam = community ? `&community=${encodeURIComponent(community)}` : "";
      const typeParam = propertyType ? `&propertyType=${encodeURIComponent(propertyType)}` : "";
      const bedsParam = bedrooms !== undefined && bedrooms !== "" ? `&bedrooms=${encodeURIComponent(String(bedrooms))}` : "";
      const res = await fetch(
        apiUrl(`/api/listings?listingType=${listingType}${communityParam}${typeParam}${bedsParam}&limit=${batchSize}&skip=${pageParam}`)
      );
      if (!res.ok) throw new Error("fetch failed");
      return res.json() as Promise<Listing[]>;
    },
    initialPageParam: initialListings.length,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.flat().length + initialListings.length;
      if (loaded >= totalCount) return undefined;
      if (lastPage.length === 0) return undefined;
      return loaded;
    },
    // Page 0 = SSR-rendered initial batch (covers ?page=N on initial load).
    // Subsequent pages append on load-more click.
    initialData: { pages: [], pageParams: [] },
    staleTime: 60 * 1000,
  });

  const listings = useMemo(() => {
    const fetched = data?.pages.flat() ?? [];
    return [...initialListings, ...fetched];
  }, [data, initialListings]);

  // Sync ?page=N into URL on load-more without scroll-jumping.
  // Reads the live query string instead of useSearchParams(): that hook forces
  // the whole subtree out of the static prerender, which left every
  // buy-property-in / rent-property-in page with an EMPTY server-rendered body
  // (no <h1>, no copy). This only ever runs from a click, so window is defined.
  const writePageToUrl = useCallback((n: number) => {
    const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
    if (n <= 1) params.delete("page");
    else params.set("page", String(n));
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : (pathname ?? ""), { scroll: false });
  }, [router, pathname]);

  const handleLoadMore = useCallback(async () => {
    if (!hasNextPage || isFetchingNextPage) return;
    await fetchNextPage();
    const next = page + 1;
    setPage(next);
    writePageToUrl(next);
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, page, writePageToUrl]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section
        className="relative pt-32 pb-20 text-white overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
      >
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-accent font-semibold tracking-[0.4em] uppercase text-xs mb-4">
              {listingType === "Rent" ? t("rentalsLabel") : t("secondaryMarketLabel")}
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              {title.split(" ").slice(0, -1).join(" ")}{" "}
              <span className="font-light">{title.split(" ").slice(-1)}</span>
            </h1>
            <p className="text-primary-foreground/70 max-w-2xl text-lg">
              {t("subtitleWithCount", { subtitle, count: totalCount })}
            </p>
          </motion.div>
        </div>
      </section>

      {headerSlot}

      <section className="py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {listings.length === 0 ? (
            emptyState ?? <p className="text-center text-muted-foreground py-20">{t("noListings")}</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((l, i) => (
                <motion.div
                  key={l._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: Math.min(i * 0.05, 0.3) }}
                  className="h-full"
                >
                  <Link
                    href={`/property/${l.slug}`}
                    className="group flex flex-col h-full bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-border/50 hover:border-primary/20"
                  >
                    <div className="relative overflow-hidden aspect-[4/3]">
                      <ImageWithFallback
                        src={l.featuredImage || l.imageGallery?.[0] || IMAGE_PLACEHOLDER}
                        alt={l.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                      <span className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-accent text-accent-foreground uppercase tracking-wider">
                          {l.listingType === "Rent" ? t("forRent") : t("forSale")}
                        </span>
                        {(String(l.offplan) === "1" || l.completionStatus === "off_plan") && (
                          <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg text-white uppercase tracking-wider" style={{ background: "linear-gradient(135deg, #D4A847, #B8922F)" }}>
                            {tEnum("offPlan")}
                          </span>
                        )}
                      </span>
                      {l.propertyType && (
                        <span className="absolute top-3 right-12 text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur text-foreground uppercase tracking-wider">
                          {l.propertyType}
                        </span>
                      )}
                      <CardActions propertyId={l.slug} slug={l.slug} title={l.name} />
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      {/* Top metadata row — propertyType + community, mirroring developer+community on /off-plan */}
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                        {l.propertyType && (
                          <span className="flex items-center gap-1">
                            <Building className="h-3 w-3" /> {l.propertyType}
                          </span>
                        )}
                        {l.community && (
                          <span className="flex items-center gap-1 truncate">
                            <MapPin className="h-3 w-3 flex-shrink-0" /> <span className="truncate">{l.community}</span>
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-foreground mb-3 group-hover:text-primary transition-colors leading-snug line-clamp-2">
                        {l.name}
                      </h3>
                      {/* Synthesized description line — gives the card the same visual weight as the off-plan card's shortOverview */}
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {[
                          l.bedrooms != null
                            ? (Number(l.bedrooms) === 0 ? "studio" : `${l.bedrooms} bedroom`)
                            : null,
                          l.propertyType ? l.propertyType.toLowerCase() : "property",
                          l.listingType === "Rent" ? "for rent" : "for sale",
                          l.community ? `in ${l.community}` : null,
                        ].filter(Boolean).join(" ")}
                      </p>
                      {/* Attributes row — bed · bath · sqft */}
                      <div className="flex gap-3 text-xs text-muted-foreground mb-3 flex-wrap">
                        {l.bedrooms != null && (
                          <span className="flex items-center gap-1">
                            <BedDouble className="h-3 w-3" /> {Number(l.bedrooms) === 0 ? tEnum("studio") : `${l.bedrooms} ${t("bed")}`}
                          </span>
                        )}
                        {l.bathrooms != null && Number(l.bathrooms) > 0 && (
                          <span className="flex items-center gap-1">
                            <Bath className="h-3 w-3" /> {`${l.bathrooms} ${t("bath")}`}
                          </span>
                        )}
                        {l.size && (
                          <span className="flex items-center gap-1">
                            <Maximize2 className="h-3 w-3" /> {l.size.toLocaleString()} {l.sizeUnit || "sqft"}
                          </span>
                        )}
                      </div>
                      {/* Footer — price (left) + propertyId (right) for the same justify-between balance the off-plan card has with completionDate */}
                      <div className="mt-auto flex items-center justify-between border-t border-border pt-3 gap-3">
                        <p className="text-sm font-bold text-primary truncate">
                          {fmtCurrency(l.price, { fallback: "Price on request" })}
                          {l.listingType === "Rent" && <span className="text-xs font-normal text-muted-foreground">{" "}{t("perYear")}</span>}
                          {l.size && l.price && l.price > 0 && (
                            <span className="block text-[10px] font-normal text-muted-foreground mt-0.5">
                              AED {Math.round(l.price / l.size).toLocaleString()}/{l.sizeUnit || "sqft"}
                            </span>
                          )}
                        </p>
                        {l.propertyId && (
                          <span className="text-[10px] font-mono text-muted-foreground/60 flex items-center gap-1 flex-shrink-0">
                            <Hash className="h-3 w-3" />{l.propertyId}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}

          <div className="mt-12 text-center">
            {isFetchingNextPage && (
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm">{t("loadingMore")}</span>
              </div>
            )}
            {hasNextPage && !isFetchingNextPage && (
              <button
                onClick={handleLoadMore}
                className="px-8 py-3 text-white rounded-xl font-semibold transition-all hover:shadow-lg"
                style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
              >
                {t("loadMore")}
              </button>
            )}
            {!hasNextPage && listings.length > batchSize && (
              <p className="text-sm text-muted-foreground">
                {t("showingAll", { count: listings.length })}
              </p>
            )}
          </div>
        </div>
      </section>

      <NewsletterStrip source="listings" />
      <Footer />
      <PropertyComparison />
    </div>
  );
}

// Previously this wrapped the tree in <Suspense fallback={null}> to satisfy
// useSearchParams(). On a statically prerendered page that made Next emit the
// *fallback* — i.e. nothing — so the served HTML had no <h1> and no body copy
// at all. useSearchParams() is gone (see writePageToUrl), so the page now
// prerenders in full and is server-rendered for crawlers.
export default function ListingsPageClient(props: Parameters<typeof ListingsPageClientInner>[0]) {
  return <ListingsPageClientInner {...props} />;
}
