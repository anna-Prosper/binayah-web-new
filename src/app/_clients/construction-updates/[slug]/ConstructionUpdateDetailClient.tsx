/* eslint-disable i18next/no-literal-string */
"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Clock, Calendar, Globe, ExternalLink } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import ReactMarkdown from "react-markdown";

interface Faq { question: string; answer: string }

interface ProjectArticle {
  slug: string;
  h1: string;
  body?: string;
  excerpt?: string;
  heroImage?: { url: string; alt?: string; caption?: string };
  faq?: Faq[];
  projectSlug?: string;
  langs?: string[];
  readingTimeMin?: number;
  publishedAt?: string | null;
  keywords?: string[];
  dir?: string;
}

const LABELS: Record<string, Record<string, string>> = {
  en: { back: "Project Guides", faq: "FAQ", viewProject: "View Project", langs: "Read in", topics: "Topics" },
  ru: { back: "Гайды по проектам", faq: "Частые вопросы", viewProject: "Смотреть проект", langs: "Читать на", topics: "Темы" },
  ar: { back: "أدلة المشاريع", faq: "الأسئلة الشائعة", viewProject: "عرض المشروع", langs: "اقرأ بـ", topics: "مواضيع" },
  zh: { back: "项目指南", faq: "常见问题", viewProject: "查看项目", langs: "阅读语言", topics: "主题" },
  vi: { back: "Hướng dẫn dự án", faq: "FAQ", viewProject: "Xem dự án", langs: "Đọc bằng", topics: "Chủ đề" },
};

const LANG_NAMES: Record<string, string> = {
  en: "EN", ru: "RU", ar: "AR", zh: "ZH", he: "HE", vi: "VI",
};

function formatDate(dateStr: string | null | undefined, lang: string) {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString(
      lang === "ar" ? "ar-AE" : lang === "zh" ? "zh-CN" : lang === "ru" ? "ru-RU" : "en-AE",
      { year: "numeric", month: "long", day: "numeric" }
    );
  } catch { return dateStr; }
}

export default function ProjectArticleDetailClient({ article, locale }: { article: ProjectArticle; locale: string }) {
  const lp = locale === "en" ? "" : `/${locale}`;
  const isRtl = locale === "ar" || article.dir === "rtl";
  const l = LABELS[locale] ?? LABELS.en;

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? "rtl" : "ltr"}>
      <Navbar />

      {/* Full-width hero image */}
      <div className="relative w-full aspect-[21/9] sm:aspect-[3/1] bg-muted overflow-hidden mt-16">
        {article.heroImage?.url ? (
          <Image
            src={article.heroImage.url}
            alt={article.heroImage.alt ?? article.h1}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
      </div>

      {/* Article header — below image, above body */}
      <div className="border-b border-border/40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <Link
            href={`${lp}/construction-updates`}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary mb-4 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {l.back}
          </Link>

          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-primary">Binayah Insights</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground leading-tight mb-4">
            {article.h1}
          </h1>

          {article.excerpt && (
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-5 border-l-4 border-primary/40 pl-4">
              {article.excerpt}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Binayah Editorial</span>
            {article.publishedAt && (
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{formatDate(article.publishedAt, locale)}</span>
            )}
            {article.readingTimeMin && (
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{article.readingTimeMin} min read</span>
            )}
            {article.langs && article.langs.length > 1 && (
              <div className="flex items-center gap-1.5 ml-auto">
                <Globe className="w-3.5 h-3.5" />
                {article.langs.map((lang) => (
                  <Link
                    key={lang}
                    href={lang === "en" ? `/construction-updates/${article.slug}` : `/${lang}/construction-updates/${article.slug}`}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                      lang === locale ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {LANG_NAMES[lang] ?? lang.toUpperCase()}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Body + sidebar */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="lg:grid lg:grid-cols-[1fr_220px] lg:gap-12">

          {/* Article body */}
          <article className="min-w-0">
            {article.body && (
              <div className="prose prose-sm sm:prose-base max-w-none
                text-foreground
                prose-headings:font-bold prose-headings:text-foreground prose-headings:mt-8 prose-headings:mb-3
                prose-h2:text-xl prose-h3:text-base
                prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-4
                prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                prose-strong:text-foreground prose-strong:font-semibold
                prose-li:text-muted-foreground prose-li:leading-relaxed
                prose-ul:my-4 prose-ol:my-4
                prose-hr:border-border/50">
                <ReactMarkdown>{article.body}</ReactMarkdown>
              </div>
            )}

            {/* FAQ */}
            {article.faq && article.faq.length > 0 && (
              <div className="mt-12 pt-8 border-t border-border/40">
                <h2 className="text-lg sm:text-xl font-bold text-foreground mb-5">{l.faq}</h2>
                <div className="space-y-2">
                  {article.faq.map((item, i) => (
                    <details key={i} className="group border border-border/50 rounded-xl overflow-hidden">
                      <summary className="flex items-center justify-between gap-3 px-4 py-3.5 cursor-pointer list-none text-sm font-semibold text-foreground hover:text-primary hover:bg-muted/40 transition-colors">
                        <span>{item.question}</span>
                        <span className="text-accent text-lg font-light flex-shrink-0 transition-transform duration-200 group-open:rotate-45">+</span>
                      </summary>
                      <div className="px-4 pb-4 pt-2 text-sm text-muted-foreground leading-relaxed border-t border-border/30">
                        {item.answer}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            )}

            {/* Keywords */}
            {article.keywords && article.keywords.length > 0 && (
              <div className="mt-8 pt-6 border-t border-border/40 flex flex-wrap gap-2">
                {article.keywords.slice(0, 10).map((kw) => (
                  <span key={kw} className="px-3 py-1 bg-muted rounded-full text-xs text-muted-foreground">{kw}</span>
                ))}
              </div>
            )}
          </article>

          {/* Sticky sidebar */}
          <aside className="mt-10 lg:mt-0 space-y-4 lg:sticky lg:top-24 self-start">

            {/* View project CTA */}
            {article.projectSlug && (
              <Link
                href={`${lp}/projects/${article.projectSlug}`}
                className="flex items-center justify-between gap-2 bg-primary text-primary-foreground rounded-xl px-4 py-4 hover:opacity-90 transition-opacity"
              >
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider opacity-75 mb-0.5">{l.viewProject}</p>
                  <p className="text-sm font-bold leading-tight line-clamp-2">{article.h1.split(" by ")[0]}</p>
                </div>
                <ExternalLink className="w-4 h-4 flex-shrink-0 opacity-70" />
              </Link>
            )}

            {/* WhatsApp enquiry */}
            <a
              href={`https://wa.me/971549988811?text=I'm interested in ${encodeURIComponent(article.h1)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-[#25D366] text-white rounded-xl px-4 py-3 text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Enquire on WhatsApp
            </a>
          </aside>
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
