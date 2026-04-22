"use client";

import { apiUrl } from "@/lib/api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { motion } from "framer-motion";
import { Building2, Search, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";

interface Developer {
  _id: string;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  projectCount?: number;
}

const BATCH_SIZE = 24;

export default function DevelopersPageClient({
  initialDevelopers,
  totalCount,
}: {
  initialDevelopers: Developer[];
  totalCount: number;
}) {
  const t = useTranslations("developers");
  const tSearch = useTranslations("search");
  const [developers, setDevelopers] = useState<Developer[]>(initialDevelopers);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialDevelopers.length < totalCount);
  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout>(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore || search) return;
    setLoading(true);
    try {
      const res = await fetch(apiUrl(`/api/developers?limit=${BATCH_SIZE}&skip=${developers.length}`));
      if (!res.ok) throw new Error("Failed to fetch");
      const newDevs: Developer[] = await res.json();
      if (!Array.isArray(newDevs) || newDevs.length === 0) {
        setHasMore(false);
      } else {
        setDevelopers((prev) => [...prev, ...newDevs]);
        if (developers.length + newDevs.length >= totalCount) {
          setHasMore(false);
        }
      }
    } catch (err) {
      console.error("Failed to load more developers:", err);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, developers.length, totalCount, search]);

  // Debounced search
  const handleSearch = (value: string) => {
    setSearch(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!value.trim()) {
      setDevelopers(initialDevelopers);
      setHasMore(initialDevelopers.length < totalCount);
      setSearching(false);
      return;
    }
    setSearching(true);
    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch(apiUrl(`/api/developers?q=${encodeURIComponent(value)}&limit=100`));
        if (!res.ok) throw new Error("Search failed");
        const results: Developer[] = await res.json();
        setDevelopers(Array.isArray(results) ? results : []);
        setHasMore(false);
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setSearching(false);
      }
    }, 350);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-20 text-white overflow-hidden" style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}>
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-accent font-semibold tracking-[0.4em] uppercase text-xs mb-4">
              {t("heroLabel")}
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              {t("heroTitle")}{" "}
              <span className="italic font-light">{t("heroTitleItalic")}</span>
            </h1>
            <p className="text-primary-foreground/70 max-w-2xl text-lg">
              {t("heroSubtitle")}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Listing */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Search bar */}
          <div className="mb-10 max-w-md">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={t("searchPlaceholder")}
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
              />
              {searching && (
                <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {developers.map((dev, i) => (
              <motion.div
                key={dev._id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: Math.min(i * 0.04, 0.3) }}
              >
                <Link
                  href={`/developers/${dev.slug}`}
                  className="group flex flex-col items-center bg-card rounded-2xl overflow-hidden border border-border/50 hover:border-primary/20 hover:shadow-xl transition-all duration-500 p-5 sm:p-6 text-center h-full"
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mb-4 rounded-xl bg-primary/[0.06] flex items-center justify-center overflow-hidden border border-primary/10 group-hover:border-primary/25 group-hover:bg-primary/[0.10] transition-all">
                    {dev.logo ? (
                      <img
                        src={dev.logo}
                        alt={dev.name}
                        className="w-full h-full object-contain p-2"
                        loading="lazy"
                      />
                    ) : (
                      <Building2 className="h-8 w-8 text-primary/50 group-hover:text-primary transition-colors" />
                    )}
                  </div>
                  <h3 className="font-bold text-sm text-foreground mb-1.5 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                    {dev.name}
                  </h3>
                  {dev.projectCount != null && dev.projectCount > 0 && (
                    <p className="text-xs font-semibold text-primary mt-auto pt-1">
                      {dev.projectCount} {t("projects")}
                    </p>
                  )}
                </Link>
              </motion.div>
            ))}
          </div>

          {developers.length === 0 && !searching && (
            <div className="text-center py-20">
              <Building2 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">{t("noResults")}</p>
            </div>
          )}

          {/* Load More Button (no infinite scroll - cleaner) */}
          <div className="mt-12 text-center">
            {loading && (
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm">{tSearch("loadMore")}</span>
              </div>
            )}
            {hasMore && !loading && !search && (
              <button
                onClick={loadMore}
                className="px-8 py-3 text-white rounded-xl font-semibold transition-all hover:shadow-lg" style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
              >
                {tSearch("loadMore")}
              </button>
            )}
            {!hasMore && !search && developers.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {t("showingAll", { count: developers.length.toLocaleString() })}
              </p>
            )}
          </div>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
