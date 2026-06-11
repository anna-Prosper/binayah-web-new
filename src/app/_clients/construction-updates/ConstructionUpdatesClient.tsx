/* eslint-disable i18next/no-literal-string */
"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Search, Clock, Calendar } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

interface ProjectArticle {
  _id: string;
  slug: string;
  h1: string;
  excerpt?: string;
  heroImage?: { url: string; alt?: string };
  publishedAt?: string | null;
  readingTimeMin?: number;
  projectSlug?: string;
  langs?: string[];
}

const PAGE_LABELS: Record<string, { hero: string; sub: string; search: string; noResults: string; label: string }> = {
  en: { label: "Project Guides", hero: "Project Guides", sub: "In-depth guides for Dubai's top off-plan projects — lifestyle, location, and investment insights.", search: "Search projects…", noResults: "No articles found." },
  ru: { label: "Гайды по проектам", hero: "Гайды по проектам", sub: "Подробные гайды по ведущим офф-план проектам Дубая — стиль жизни, локация, инвестиции.", search: "Поиск проектов…", noResults: "Статьи не найдены." },
  ar: { label: "أدلة المشاريع", hero: "أدلة المشاريع", sub: "أدلة متعمقة لأفضل المشاريع على الخارطة في دبي — أسلوب الحياة والموقع والاستثمار.", search: "البحث في المشاريع…", noResults: "لا توجد مقالات." },
  zh: { label: "项目指南", hero: "项目指南", sub: "迪拜顶级期房项目深度指南——生活方式、地理位置与投资洞察。", search: "搜索项目…", noResults: "未找到文章。" },
  vi: { label: "Hướng dẫn dự án", hero: "Hướng dẫn dự án", sub: "Hướng dẫn chuyên sâu về các dự án off-plan hàng đầu Dubai — phong cách sống, vị trí và đầu tư.", search: "Tìm kiếm dự án…", noResults: "Không tìm thấy bài viết." },
};

function formatDate(dateStr: string | null | undefined, lang: string) {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString(
      lang === "ar" ? "ar-AE" : lang === "zh" ? "zh-CN" : lang === "ru" ? "ru-RU" : "en-AE",
      { year: "numeric", month: "short", day: "numeric" }
    );
  } catch {
    return dateStr;
  }
}

export default function ConstructionUpdatesClient({ articles, locale }: { articles: ProjectArticle[]; locale: string }) {
  const [search, setSearch] = useState("");

  const labels = PAGE_LABELS[locale] ?? PAGE_LABELS.en;
  const lp = locale === "en" ? "" : `/${locale}`;
  const isRtl = locale === "ar";

  const filtered = articles.filter((a) => {
    const q = search.trim().toLowerCase();
    return !q || a.h1.toLowerCase().includes(q) || (a.excerpt ?? "").toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? "rtl" : "ltr"}>
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary via-primary/95 to-primary/85 pt-24 pb-10 sm:pb-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <p className="text-xs font-bold tracking-[0.25em] uppercase text-amber-300 mb-3">Binayah Insights</p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3">{labels.hero}</h1>
          <p className="text-sm sm:text-base text-white/70 max-w-xl">{labels.sub}</p>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

        {/* Search */}
        <div className="mb-8 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={labels.search}
              className="w-full pl-9 pr-3 py-2.5 text-sm bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <p className="text-xs text-muted-foreground mb-6">{filtered.length} articles</p>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">{labels.noResults}</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {filtered.map((article) => (
              <Link
                key={article._id}
                href={`${lp}/construction-updates/${article.slug}`}
                className="group bg-card border border-border/50 rounded-2xl overflow-hidden hover:border-primary/30 hover:shadow-lg transition-all duration-300 flex flex-col"
              >
                <div className="relative aspect-[16/9] bg-muted overflow-hidden">
                  {article.heroImage?.url ? (
                    <Image
                      src={article.heroImage.url}
                      alt={article.heroImage.alt ?? article.h1}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5" />
                  )}
                  {article.langs && article.langs.length > 1 && (
                    <span className="absolute top-3 left-3 bg-black/50 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full backdrop-blur-sm">
                      {article.langs.length} languages
                    </span>
                  )}
                </div>
                <div className="p-4 sm:p-5 flex flex-col flex-1">
                  <h2 className="text-sm font-bold text-foreground leading-snug mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {article.h1}
                  </h2>
                  {article.excerpt && (
                    <p className="text-xs text-muted-foreground leading-relaxed mb-3 line-clamp-3 flex-1">
                      {article.excerpt}
                    </p>
                  )}
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-auto pt-3 border-t border-border/40">
                    {article.publishedAt && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(article.publishedAt, locale)}
                      </span>
                    )}
                    {article.readingTimeMin && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {article.readingTimeMin} min
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
