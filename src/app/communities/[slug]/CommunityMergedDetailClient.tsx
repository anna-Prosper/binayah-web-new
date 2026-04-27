"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import ImageWithFallback from "@/components/ImageWithFallback";
import { formatProjectPrice } from "@/lib/formatPrice";
import { motion } from "framer-motion";
import {
  Building2,
  CheckCircle2,
  ChevronRight,
  MapPin,
  Building,
  Wallet,
  CalendarDays,
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import type { CommunityInfoPage } from "@/lib/communityScraper";

interface Props {
  community: Omit<CommunityInfoPage, "scrapedAt">;
  communityName: string;
  projects: any[];
  locale: string;
}

export default function CommunityMergedDetailClient({
  community,
  communityName,
  projects,
  locale,
}: Props) {
  const t = useTranslations("communityInfo");
  const tMerged = useTranslations("communityMergedDetail");

  const {
    name,
    location,
    description,
    developerName,
    heroImage,
    amenities,
    priceRange,
  } = community;

  const hasBody = description || location || developerName || priceRange;
  const hasAmenities = amenities && amenities.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ------------------------------------------------------------------ */}
      {/* HERO                                                                */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative h-[50vh] sm:h-[65vh] lg:h-[70vh] overflow-hidden">
        {heroImage ? (
          <>
            <ImageWithFallback
              src={heroImage}
              alt={name}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground via-foreground/60 to-foreground/30" />
          </>
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
          >
            <Building2 className="w-24 h-24 text-white/20" />
          </div>
        )}

        <div className="relative h-full flex flex-col justify-end max-w-7xl mx-auto px-4 sm:px-6 pb-10 sm:pb-14">
          <div className="flex items-center gap-2 text-sm text-white/60 mb-5">
            <Link href={`/${locale}`} className="hover:text-white transition-colors">
              {t("breadcrumbHome")}
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link
              href={`/${locale}/communities`}
              className="hover:text-white transition-colors"
            >
              {t("breadcrumbCommunities")}
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-white">{name}</span>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 rounded-full mb-4 bg-accent text-accent-foreground">
              {t("badge")}
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-3">
              {name}
            </h1>
            {location && (
              <p className="flex items-center gap-2 text-white/70 text-lg">
                <MapPin className="h-5 w-5 flex-shrink-0" />
                {location}
              </p>
            )}
          </motion.div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* BODY SECTIONS — description + sidebar                              */}
      {/* ------------------------------------------------------------------ */}
      {hasBody && (
        <section className="py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {description && (
                <motion.div
                  className="lg:col-span-2"
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0 }}
                >
                  <div className="bg-card rounded-2xl p-6 sm:p-8 border border-border/50 h-full">
                    <div className="h-[2px] w-8 rounded-full bg-gradient-to-r from-accent to-accent/60 mb-3" />
                    <p className="text-xs uppercase tracking-[0.3em] text-accent font-semibold mb-2">
                      {t("sectionAboutEyebrow")}
                    </p>
                    <h2 className="text-2xl font-bold text-foreground mb-4">{name}</h2>
                    <p className="text-base text-muted-foreground leading-relaxed">
                      {description}
                    </p>
                  </div>
                </motion.div>
              )}

              {(location || developerName || priceRange) && (
                <motion.div
                  className={description ? "lg:col-span-1" : "lg:col-span-3"}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.08 }}
                >
                  <div className="bg-card rounded-2xl p-6 sm:p-8 border border-border/50 h-full space-y-6">
                    <div className="h-[2px] w-8 rounded-full bg-gradient-to-r from-accent to-accent/60" />

                    {location && (
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-accent font-semibold mb-2">
                          {t("sectionLocationEyebrow")}
                        </p>
                        <p className="flex items-center gap-2 text-foreground font-medium">
                          <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          {location}
                        </p>
                      </div>
                    )}

                    {developerName && (
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-accent font-semibold mb-2">
                          {t("sectionDeveloperEyebrow")}
                        </p>
                        <p className="flex items-center gap-2 text-foreground font-medium">
                          <Building className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          {developerName}
                        </p>
                      </div>
                    )}

                    {priceRange && (
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-accent font-semibold mb-2">
                          {t("sectionPriceRangeEyebrow")}
                        </p>
                        <p className="flex items-center gap-2 text-foreground font-medium">
                          <Wallet className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          {formatProjectPrice(priceRange.min, priceRange.currency)}{" "}
                          &ndash;{" "}
                          {formatProjectPrice(priceRange.max, priceRange.currency)}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* AMENITIES                                                           */}
      {/* ------------------------------------------------------------------ */}
      {hasAmenities && (
        <section className="pb-12 sm:pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.16 }}
            >
              <div className="bg-card rounded-2xl p-6 sm:p-8 border border-border/50">
                <div className="h-[2px] w-8 rounded-full bg-gradient-to-r from-accent to-accent/60 mb-3" />
                <p className="text-xs uppercase tracking-[0.3em] text-accent font-semibold mb-2">
                  {t("sectionAmenitiesEyebrow")}
                </p>
                <h2 className="text-2xl font-bold text-foreground mb-6">
                  {t("sectionAmenitiesTitle")}
                </h2>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {amenities!.map((amenity, i) => (
                    <motion.span
                      key={`${amenity}-${i}`}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.04 }}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-muted text-sm text-foreground"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-accent flex-shrink-0" />
                      {amenity}
                    </motion.span>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* PROPERTIES GRID — DB projects for this community                   */}
      {/* ------------------------------------------------------------------ */}
      {projects.length > 0 && (
        <section className="py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0 }}
            >
              <div className="h-[2px] w-8 rounded-full bg-gradient-to-r from-accent to-accent/60 mb-3" />
              <p className="text-xs uppercase tracking-[0.3em] text-accent font-semibold mb-2">
                {tMerged("propertiesEyebrow")}
              </p>
              <h2 className="text-2xl font-bold text-foreground mb-8">
                {tMerged("propertiesTitle", {
                  communityName,
                  count: projects.length,
                })}
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {projects.map((p, i) => (
                <motion.div
                  key={p._id || p.slug || i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    href={`/project/${p.slug}`}
                    className="group block bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-border/50 hover:border-primary/20"
                  >
                    <div className="relative overflow-hidden aspect-[4/3]">
                      <ImageWithFallback
                        src={
                          p.featuredImage ||
                          p.imageGallery?.[0] ||
                          "/assets/amenities-placeholder.webp"
                        }
                        alt={p.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      {p.status && (
                        <span className="absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-lg bg-accent text-accent-foreground uppercase tracking-wider">
                          {p.status}
                        </span>
                      )}
                    </div>
                    <div className="p-5">
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5 mb-2">
                        <Building className="h-3 w-3" /> {p.developerName}
                      </p>
                      <h3 className="font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                        {p.name}
                      </h3>
                      <div className="flex items-center justify-between border-t border-border pt-3">
                        <p className="text-sm font-bold text-primary">
                          {formatProjectPrice(p.startingPrice, p.currency)}
                        </p>
                        {p.completionDate && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <CalendarDays className="h-3 w-3" />
                            {(() => {
                              try {
                                const d = new Date(p.completionDate);
                                return isNaN(d.getTime())
                                  ? p.completionDate
                                  : d.getFullYear();
                              } catch {
                                return p.completionDate;
                              }
                            })()}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Wikipedia attribution */}
            <p className="mt-10 text-xs text-muted-foreground/50 text-right">
              {tMerged("wikiAttribution")}
            </p>
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* BOTTOM CTA — brand-green banner                                     */}
      {/* ------------------------------------------------------------------ */}
      <section
        className="py-16 sm:py-20"
        style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-accent font-semibold mb-4">
            {t("ctaEyebrow")}
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            {t("ctaHeadline")}
          </h2>
          <p className="text-white/70 mb-8 text-base">{t("ctaSubline")}</p>
          <Link
            href={
              location
                ? `/search?location=${encodeURIComponent(location)}`
                : "/search"
            }
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-2xl"
            style={{
              background: "linear-gradient(to right, #D4A847, #B8922F)",
              boxShadow: "0 4px 20px rgba(212,168,71,0.3)",
            }}
          >
            {t("ctaButton")}
          </Link>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
