"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import Breadcrumbs from "@/components/Breadcrumbs";
import Link from "next/link";
import ImageWithFallback from "@/components/ImageWithFallback";
import { motion } from "framer-motion";
import { ArrowUpRight, MapPin } from "lucide-react";
import { useTranslations } from "next-intl";

export interface CommunityCard {
  slug: string;
  name: string;
  description?: string;
  thumbnail?: string;
  hasListings: boolean;
  hasGuide: boolean;
}

const FALLBACK_IMAGE = "/assets/dubai-hero.webp";

export default function CommunitiesPageClient({
  communities,
  kind = "community",
}: {
  communities: CommunityCard[];
  kind?: "community" | "area";
}) {
  const t = useTranslations(kind === "area" ? "areas" : "communities");
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Breadcrumbs
        items={[
          {
            label: t("heroLabel"),
            href: kind === "area" ? "/areas" : "/communities",
          },
        ]}
      />
      <section
        className="relative pt-32 pb-20 text-white overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
      >
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
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {communities.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-24 text-center bg-card rounded-2xl border border-border/50"
            >
              <MapPin className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {t("emptyTitle")}
              </h3>
              <p className="text-muted-foreground max-w-sm">{t("emptyBody")}</p>
            </motion.div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {communities.map((c, i) => (
                <motion.div
                  key={c.slug}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04 }}
                  className="h-full"
                >
                  <Link
                    href={`/communities/${c.slug}`}
                    className="group block relative h-full rounded-2xl overflow-hidden aspect-[3/4]"
                  >
                    <ImageWithFallback
                      src={c.thumbnail || FALLBACK_IMAGE}
                      alt={c.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Guide-only badge */}
                    {!c.hasListings && c.hasGuide && (
                      <span className="absolute top-3 left-3 z-10 bg-foreground/70 text-white rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm">
                        {t("badgeGuide")}
                      </span>
                    )}

                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <h3 className="text-white font-bold text-lg mb-1">{c.name}</h3>
                      {c.description && (
                        <p className="text-white/60 text-xs mb-2 line-clamp-2">
                          {c.description.slice(0, 100)}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <p className="text-white/70 text-sm">{t("viewCommunity")}</p>
                        <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                          <ArrowUpRight className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
