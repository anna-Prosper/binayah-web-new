/* eslint-disable i18next/no-literal-string */
"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Calendar, Clock } from "lucide-react";
import { useTranslations } from "next-intl";

interface ProjectArticle {
  _id: string;
  slug: string;
  h1: string;
  excerpt?: string;
  heroImage?: { url: string; alt?: string };
  publishedAt?: string | null;
  readingTimeMin?: number;
  projectSlug?: string;
}

const FALLBACK_IMAGE = "/assets/dubai-hero.webp";

function formatDate(dateStr?: string | null) {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
  } catch { return dateStr; }
}

const LABEL: Record<string, { overline: string; h1: string; sub: string }> = {
  en: { overline: "Project Guides", h1: "Project Guides", sub: "In-depth guides for Dubai's top off-plan projects, lifestyle, location, and investment insights." },
  ru: { overline: "Гайды по проектам", h1: "Гайды по проектам", sub: "Подробные гайды по ведущим офф-план проектам Дубая, стиль жизни, локация, инвестиции." },
  ar: { overline: "أدلة المشاريع", h1: "أدلة المشاريع", sub: "أدلة متعمقة لأفضل المشاريع على الخارطة في دبي." },
  zh: { overline: "项目指南", h1: "项目指南", sub: "迪拜顶级期房项目深度指南, , 生活方式、地理位置与投资洞察。" },
  vi: { overline: "Hướng dẫn dự án", h1: "Hướng dẫn dự án", sub: "Hướng dẫn chuyên sâu về các dự án off-plan hàng đầu Dubai." },
};

export default function ConstructionUpdatesClient({ articles, locale }: { articles: ProjectArticle[]; locale: string }) {
  const lp = locale === "en" ? "" : `/${locale}`;
  const isRtl = locale === "ar" || locale === "he";
  const label = LABEL[locale] ?? LABEL.en;

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? "rtl" : "ltr"}>
      <Navbar />

      {/* Hero — identical to NewsPageClient */}
      <section className="relative pt-32 pb-20 text-white overflow-hidden" style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}>
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)", backgroundSize: "48px 48px" }} />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-accent font-semibold tracking-[0.4em] uppercase text-xs mb-4">{label.overline}</p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">{label.h1}</h1>
            <p className="text-primary-foreground/70 max-w-2xl text-lg">{label.sub}</p>
          </motion.div>
        </div>
      </section>

      {/* Grid — identical card style to NewsPageClient */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {articles.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">No articles published yet.</div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-7">
              {articles.map((a, i) => (
                <motion.div key={a._id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: Math.min(i * 0.06, 0.3) }} className="h-full">
                  <Link href={`${lp}/construction-updates/${a.slug}`} className="group flex flex-col h-full bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-border/50 hover:border-primary/20">
                    <div className="relative overflow-hidden aspect-[16/10]">
                      <Image
                        src={a.heroImage?.url || FALLBACK_IMAGE}
                        alt={a.heroImage?.alt ?? a.h1}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <span className="absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-lg text-white uppercase tracking-wider" style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}>
                        Project Guide
                      </span>
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5 mb-3">
                        <Calendar className="h-3 w-3" /> {formatDate(a.publishedAt)}
                        {a.readingTimeMin && <span className="ml-2 flex items-center gap-1"><Clock className="h-3 w-3" />{a.readingTimeMin} min</span>}
                      </p>
                      <h3 className="font-bold text-foreground group-hover:text-primary transition-colors leading-snug mb-2 line-clamp-2">{a.h1}</h3>
                      {a.excerpt && <p className="text-sm text-muted-foreground line-clamp-2">{a.excerpt}</p>}
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
