"use client";



import Navbar from "@/components/Navbar";
import { formatProjectPrice } from "@/lib/formatPrice";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { motion } from "framer-motion";
import { ArrowLeft, Building, CalendarDays, ChevronRight, MapPin } from "lucide-react";
import Link from "next/link";
import ImageWithFallback from "@/components/ImageWithFallback";
import { useTranslations } from "next-intl";

const S3_COMM = "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/communities";
const communityImages: Record<string, string> = {
  "downtown-dubai": `${S3_COMM}/downtown-dubai/rove-home-at-downtown-dubai_01.jpg`,
  "palm-jumeirah": `${S3_COMM}/palm-jumeirah/Palm-Jumeirah-Dubai.jpg`,
  "dubai-marina": `${S3_COMM}/dubai-marina/Dubai-Marina.jpg`,
  "business-bay": `${S3_COMM}/business-bay/featured.webp`,
};

interface Props {
  slug: string;
  communityName: string;
  communityDescription?: string;
  communityImage?: string;
  projects: any[];
}

export default function CommunityDetailPage({ slug, communityName, communityDescription, communityImage, projects }: Props) {
  const t = useTranslations("communityDetail");
  const tBreadcrumbs = useTranslations("breadcrumbs");
  const heroImage = communityImage || communityImages[slug] || "/assets/dubai-hero.webp";
  const desc = communityDescription || "";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="relative pt-24 pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <ImageWithFallback src={heroImage} alt={communityName} fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground via-foreground/60 to-foreground/30" />
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative pt-12">
          <div className="flex items-center gap-2 text-sm text-white/60 mb-6">
            <Link href="/" className="hover:text-white transition-colors">{tBreadcrumbs("home")}</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href="/communities" className="hover:text-white transition-colors">{t("breadcrumbCommunities")}</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-white">{communityName}</span>
          </div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">{communityName}</h1>
            {desc && <p className="text-white/70 max-w-2xl text-lg">{desc.slice(0, 200)}</p>}
          </motion.div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-foreground mb-8">{t("properties")} {communityName} ({projects.length})</h2>
          {projects && projects.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {projects.map((p, i) => (
                <motion.div key={p._id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                  <Link href={`/project/${p.slug}`} className="group block bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-border/50 hover:border-primary/20">
                    <div className="relative overflow-hidden aspect-[4/3]">
                      <ImageWithFallback src={p.featuredImage || p.imageGallery?.[0] || "/assets/amenities-placeholder.webp"} alt={p.name} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover group-hover:scale-110 transition-transform duration-700" />
                      <span className="absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-lg bg-accent text-accent-foreground uppercase tracking-wider">{p.status}</span>
                    </div>
                    <div className="p-5">
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5 mb-2"><Building className="h-3 w-3" /> {p.developerName}</p>
                      <h3 className="font-bold text-foreground mb-3 group-hover:text-primary transition-colors">{p.name}</h3>
                      <div className="flex items-center justify-between border-t border-border pt-3">
                        <p className="text-sm font-bold text-primary">{formatProjectPrice(p.startingPrice, p.currency)}</p>
                        {p.completionDate && <p className="text-xs text-muted-foreground flex items-center gap-1"><CalendarDays className="h-3 w-3" />{(() => { try { const d = new Date(p.completionDate); return isNaN(d.getTime()) ? p.completionDate : d.getFullYear(); } catch { return p.completionDate; } })()}</p>}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-card rounded-2xl border border-border/50">
              <MapPin className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">{t("noProperties")}</p>
              <Link href="/communities" className="inline-flex items-center gap-2 text-primary font-semibold mt-4 hover:underline">
                <ArrowLeft className="h-4 w-4" /> {t("breadcrumbCommunities")}
              </Link>
            </div>
          )}
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
