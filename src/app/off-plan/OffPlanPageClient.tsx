"use client";

import { apiUrl } from "@/lib/api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import Breadcrumbs from "@/components/Breadcrumbs";
import { CardActions } from "@/components/PropertyActions";
import { formatProjectPrice } from "@/lib/formatPrice";
import { motion } from "framer-motion";
import { Building, CalendarDays, MapPin, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

interface Project {
  _id: string;
  name: string;
  slug: string;
  developerName?: string;
  community?: string;
  status: string;
  startingPrice?: number;
  currency?: string;
  completionDate?: string;
  shortOverview?: string;
  featuredImage?: string;
  imageGallery?: string[];
}

export default function OffPlanPageClient({
  initialProjects,
  totalCount,
  initialPage = 1,
  batchSize = 12,
}: {
  initialProjects: Project[];
  totalCount: number;
  initialPage?: number;
  batchSize?: number;
}) {
  const t = useTranslations("offPlan");
  const tSearch = useTranslations("search");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(initialPage);
  const [hasMore, setHasMore] = useState(initialProjects.length < totalCount);
  const loadingRef = useRef(false);
  const hasMoreRef = useRef(initialProjects.length < totalCount);
  const projectsLengthRef = useRef(initialProjects.length);

  // Sync ?page=N into the URL without scroll-jumping. router.replace keeps
  // the URL in lock-step with state so back-button returns to the right page.
  const writePageToUrl = useCallback((n: number) => {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    if (n <= 1) params.delete("page");
    else params.set("page", String(n));
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [router, pathname, searchParams]);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMoreRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    try {
      const res = await fetch(apiUrl(`/api/projects?limit=${batchSize}&skip=${projectsLengthRef.current}`));
      const newProjects: Project[] = await res.json();
      if (newProjects.length === 0) {
        hasMoreRef.current = false;
        setHasMore(false);
      } else {
        setProjects((prev) => {
          const next = [...prev, ...newProjects];
          projectsLengthRef.current = next.length;
          if (next.length >= totalCount) {
            hasMoreRef.current = false;
            setHasMore(false);
          }
          return next;
        });
        const nextPage = page + 1;
        setPage(nextPage);
        writePageToUrl(nextPage);
      }
    } catch (err) {
      console.error("Failed to load more projects:", err);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [totalCount, page, writePageToUrl, batchSize]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Breadcrumbs items={[{ label: t("title"), href: "/off-plan" }]} />
      <section className="relative pt-32 pb-20 text-white overflow-hidden" style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}>
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)", backgroundSize: "48px 48px" }} />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-accent font-semibold tracking-[0.4em] uppercase text-xs mb-4">{t("title")}</p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">{t("title")}</h1>
            <p className="text-primary-foreground/70 max-w-2xl text-lg">
              {t("subtitleWithCount", { count: totalCount.toLocaleString() })}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((p, i) => (
              <motion.div
                key={p._id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: Math.min(i * 0.06, 0.3) }}
                className="h-full"
              >
                <Link href={p.slug === "__fallback__" ? "#" : `/project/${p.slug}`} className="group flex flex-col h-full bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-border/50 hover:border-primary/20">
                  <div className="relative overflow-hidden aspect-[4/3]">
                    <img
                      src={p.featuredImage || p.imageGallery?.[0] || "/assets/amenities-placeholder.webp"}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    <span className="absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-lg bg-accent text-accent-foreground uppercase tracking-wider">
                      {p.status || "Off-Plan"}
                    </span>
                    <CardActions propertyId={p.slug} slug={p.slug} title={p.name} type="project" />
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                      {p.developerName && <span className="flex items-center gap-1"><Building className="h-3 w-3" /> {p.developerName}</span>}
                      {p.community && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {p.community}</span>}
                    </div>
                    <h3 className="font-bold text-foreground mb-3 group-hover:text-primary transition-colors leading-snug">{p.name}</h3>
                    {p.shortOverview && <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{p.shortOverview}</p>}
                    <div className="mt-auto flex items-center justify-between border-t border-border pt-3">
                      <p className="text-sm font-bold text-primary">
                        {formatProjectPrice(p.startingPrice, p.currency)}
                      </p>
                      {p.completionDate && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <CalendarDays className="h-3 w-3" />
                          {(() => { try { const d = new Date(p.completionDate); return isNaN(d.getTime()) ? p.completionDate : d.getFullYear(); } catch { return p.completionDate; } })()}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Scroll sentinel + Load More */}
          <div className="mt-12 text-center">
            {loading && (
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm">{t("loadingMore")}</span>
              </div>
            )}
            {hasMore && !loading && (
              <button
                onClick={loadMore}
                className="px-8 py-3 text-white rounded-xl font-semibold transition-all hover:shadow-lg"
                style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
              >
                {tSearch("loadMore")}
              </button>
            )}
            {!hasMore && projects.length > 12 && (
              <p className="text-sm text-muted-foreground">{t("showingAll", { count: projects.length.toLocaleString() })}</p>
            )}
          </div>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}