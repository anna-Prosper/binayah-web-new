"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Search, Clock, Calendar } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

interface Article {
  _id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  featuredImage: string;
  publishedAt: string;
  readTime: string;
  _appliedLang?: string;
}

const CATEGORY_LABELS: Record<string, Record<string, string>> = {
  en: { all: "All", "Market Report": "Market Report", Investment: "Investment", Lifestyle: "Lifestyle" },
  ru: { all: "Все", "Market Report": "Отчёты", Investment: "Инвестиции", Lifestyle: "Стиль жизни" },
  ar: { all: "الكل", "Market Report": "تقارير السوق", Investment: "استثمار", Lifestyle: "أسلوب الحياة" },
  zh: { all: "全部", "Market Report": "市场报告", Investment: "投资", Lifestyle: "生活方式" },
  vi: { all: "Tất cả", "Market Report": "Báo cáo", Investment: "Đầu tư", Lifestyle: "Phong cách sống" },
};

const PAGE_LABELS: Record<string, { hero: string; sub: string; search: string; noResults: string }> = {
  en: { hero: "Real Estate Insights", sub: "Expert analysis, market reports and investment guides for Dubai property.", search: "Search articles…", noResults: "No articles found." },
  ru: { hero: "Аналитика рынка", sub: "Экспертный анализ, отчёты и инвестиционные гайды по недвижимости Дубая.", search: "Поиск статей…", noResults: "Статьи не найдены." },
  ar: { hero: "رؤى عقارية", sub: "تحليل متخصص وتقارير السوق وأدلة الاستثمار في عقارات دبي.", search: "البحث في المقالات…", noResults: "لا توجد مقالات." },
  zh: { hero: "房产洞察", sub: "迪拜房产专家分析、市场报告与投资指南。", search: "搜索文章…", noResults: "未找到文章。" },
  vi: { hero: "Phân tích bất động sản", sub: "Phân tích chuyên sâu, báo cáo thị trường và hướng dẫn đầu tư bất động sản Dubai.", search: "Tìm bài viết…", noResults: "Không tìm thấy bài viết." },
};

function formatDate(dateStr: string, lang: string) {
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

const CATEGORIES = ["all", "Market Report", "Investment", "Lifestyle"];

export default function ConstructionUpdatesClient({ articles, locale }: { articles: Article[]; locale: string }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const labels = PAGE_LABELS[locale] ?? PAGE_LABELS.en;
  const catLabels = CATEGORY_LABELS[locale] ?? CATEGORY_LABELS.en;
  const lp = locale === "en" ? "" : `/${locale}`;
  const isRtl = locale === "ar";

  const filtered = articles.filter((a) => {
    const q = search.trim().toLowerCase();
    const matchesSearch = !q || a.title.toLowerCase().includes(q) || a.excerpt.toLowerCase().includes(q);
    const matchesCategory = category === "all" || a.category === category;
    return matchesSearch && matchesCategory;
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

        {/* Search + category tabs */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={labels.search}
              className="w-full pl-9 pr-3 py-2.5 text-sm bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  category === cat
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {catLabels[cat] ?? cat}
              </button>
            ))}
          </div>
        </div>

        {/* Count */}
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
                  {article.featuredImage ? (
                    <Image
                      src={article.featuredImage}
                      alt={article.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5" />
                  )}
                  <span className="absolute top-3 left-3 bg-primary/90 text-primary-foreground text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                    {catLabels[article.category] ?? article.category}
                  </span>
                </div>
                <div className="p-4 sm:p-5 flex flex-col flex-1">
                  <h2 className="text-sm font-bold text-foreground leading-snug mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {article.title}
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
                    {article.readTime && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {article.readTime}
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
