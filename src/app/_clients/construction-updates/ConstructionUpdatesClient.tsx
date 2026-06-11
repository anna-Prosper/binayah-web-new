/* eslint-disable i18next/no-literal-string */
"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Search, Clock, ChevronRight } from "lucide-react";
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

const PAGE_LABELS: Record<string, { hero: string; sub: string; search: string; noResults: string; readMore: string }> = {
  en: { hero: "Project Guides", sub: "In-depth guides for Dubai's top off-plan projects.", search: "Search…", noResults: "No articles found.", readMore: "Read more" },
  ru: { hero: "Гайды по проектам", sub: "Подробные гайды по ведущим офф-план проектам Дубая.", search: "Поиск…", noResults: "Статьи не найдены.", readMore: "Читать" },
  ar: { hero: "أدلة المشاريع", sub: "أدلة متعمقة لأفضل المشاريع على الخارطة في دبي.", search: "بحث…", noResults: "لا توجد مقالات.", readMore: "اقرأ المزيد" },
  zh: { hero: "项目指南", sub: "迪拜顶级期房项目深度指南。", search: "搜索…", noResults: "未找到文章。", readMore: "阅读更多" },
  vi: { hero: "Hướng dẫn dự án", sub: "Hướng dẫn chuyên sâu về các dự án off-plan hàng đầu Dubai.", search: "Tìm kiếm…", noResults: "Không tìm thấy bài viết.", readMore: "Đọc thêm" },
};

function formatDate(dateStr: string | null | undefined, lang: string) {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString(
      lang === "ar" ? "ar-AE" : lang === "zh" ? "zh-CN" : lang === "ru" ? "ru-RU" : "en-AE",
      { year: "numeric", month: "short", day: "numeric" }
    );
  } catch { return dateStr; }
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

  const [featured, ...rest] = filtered;

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? "rtl" : "ltr"}>
      <Navbar />

      {/* Masthead */}
      <div className="border-b border-border/60 bg-background pt-20 pb-5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-primary mb-1">Binayah Insights</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{labels.hero}</h1>
            <p className="text-sm text-muted-foreground mt-1">{labels.sub}</p>
          </div>
          <div className="relative w-full sm:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={labels.search}
              className="w-full pl-8 pr-3 py-2 text-sm bg-muted border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {filtered.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground">{labels.noResults}</div>
        ) : (
          <>
            {/* Featured — full-width hero card */}
            {featured && (
              <Link
                href={`${lp}/construction-updates/${featured.slug}`}
                className="group block mb-8 sm:mb-10 rounded-2xl overflow-hidden border border-border/40 hover:border-primary/30 hover:shadow-xl transition-all duration-300 bg-card"
              >
                <div className="sm:grid sm:grid-cols-[1fr_400px]">
                  <div className="relative aspect-[16/9] sm:aspect-auto sm:h-full min-h-[200px] bg-muted overflow-hidden">
                    {featured.heroImage?.url ? (
                      <Image
                        src={featured.heroImage.url}
                        alt={featured.heroImage.alt ?? featured.h1}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width:640px) 100vw, 60vw"
                        priority
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5" />
                    )}
                  </div>
                  <div className="p-6 sm:p-8 flex flex-col justify-between">
                    <div>
                      <span className="inline-block text-[10px] font-bold tracking-[0.2em] uppercase text-primary mb-3">Featured</span>
                      <h2 className="text-xl sm:text-2xl font-bold text-foreground leading-snug mb-3 group-hover:text-primary transition-colors">
                        {featured.h1}
                      </h2>
                      {featured.excerpt && (
                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{featured.excerpt}</p>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/40">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {featured.publishedAt && <span>{formatDate(featured.publishedAt, locale)}</span>}
                        {featured.readingTimeMin && (
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{featured.readingTimeMin} min</span>
                        )}
                      </div>
                      <span className="text-xs font-semibold text-primary flex items-center gap-0.5">
                        {labels.readMore}<ChevronRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            )}

            {/* Grid — remaining articles */}
            {rest.length > 0 && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                {rest.map((article) => (
                  <Link
                    key={article._id}
                    href={`${lp}/construction-updates/${article.slug}`}
                    className="group bg-card border border-border/40 rounded-2xl overflow-hidden hover:border-primary/30 hover:shadow-md transition-all duration-300 flex flex-col"
                  >
                    <div className="relative aspect-[16/9] bg-muted overflow-hidden">
                      {article.heroImage?.url ? (
                        <Image
                          src={article.heroImage.url}
                          alt={article.heroImage.alt ?? article.h1}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5" />
                      )}
                    </div>
                    <div className="p-4 sm:p-5 flex flex-col flex-1">
                      <h2 className="text-sm font-bold text-foreground leading-snug mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {article.h1}
                      </h2>
                      {article.excerpt && (
                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 flex-1 mb-3">{article.excerpt}</p>
                      )}
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-3 border-t border-border/40 mt-auto">
                        <div className="flex items-center gap-2">
                          {article.publishedAt && <span>{formatDate(article.publishedAt, locale)}</span>}
                          {article.readingTimeMin && (
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{article.readingTimeMin} min</span>
                          )}
                        </div>
                        <ChevronRight className="h-3.5 w-3.5 text-primary" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
