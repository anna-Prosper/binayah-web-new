"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Bookmark,
  Calendar,
  CalendarCheck,
  ChevronRight,
  Clock,
  Facebook,
  Linkedin,
  Link as LinkIcon,
  MessageCircle,
  Twitter,
  TrendingUp,
  User,
} from "lucide-react";
import ImageWithFallback from "@/components/ImageWithFallback";
import { useTranslations } from "next-intl";
import ArticleBody, { type ArticleBlock } from "@/components/ArticleBody";
import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";

interface Article {
  _id: string;
  title: string;
  slug: string;
  content?: string;
  excerpt?: string;
  body?: ArticleBlock[];
  category?: string;
  tags?: string[];
  featuredImage?: string;
  author?: string;
  readTime?: string;
  publishedAt?: string;
}

interface RelatedArticle {
  _id: string;
  title: string;
  slug: string;
  category?: string;
  featuredImage?: string;
  publishedAt?: string;
  readTime?: string;
}

const FALLBACK_IMAGE = "/assets/dubai-hero.webp";
const WHATSAPP_NUMBER = "971543048";

function formatDate(dateStr?: string) {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
  } catch { return dateStr; }
}

function formatShortDate(dateStr?: string) {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
  } catch { return dateStr; }
}

function NewsDetailInner({
  article,
  related = [],
  marketStats,
}: {
  article: Article;
  related?: RelatedArticle[];
  marketStats?: any;
}) {
  const t = useTranslations("newsDetail");
  const tBreadcrumbs = useTranslations("breadcrumbs");
  const [copied, setCopied] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showTop, setShowTop] = useState(false);
  const [subState, setSubState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const articleRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => {
      const el = articleRef.current;
      if (!el) return;
      const { top, height } = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const read = Math.min(1, Math.max(0, (vh - top) / (height + vh)));
      setProgress(read * 100);
      setShowTop(window.scrollY > vh * 0.5);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const shareUrl =
    typeof window !== "undefined" ? window.location.href : `https://binayahhub.com/news/${article.slug}`;
  const shareText = encodeURIComponent(article.title);
  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    twitter: `https://twitter.com/intent/tweet?text=${shareText}&url=${encodeURIComponent(shareUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
  };
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* noop */
    }
  };

  const searchParams = useSearchParams();
  const containedHero = searchParams?.get("hero") === "contained";
  const boxedHero = searchParams?.get("hero") === "boxed";

  return (
    <div className="min-h-screen bg-background">
      {/* Reading progress bar */}
      <div className="fixed top-0 left-0 z-[60] h-[3px] bg-accent transition-all duration-75 ease-linear" style={{ width: `${progress}%` }} />

      <Navbar />

      {boxedHero ? (
        /* ── BOXED HERO: full-bleed look but constrained to content width ── */
        <div className="mt-12 sm:mt-16 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto relative h-[480px] md:h-[620px] overflow-hidden rounded-2xl flex items-end">
            <div className="absolute inset-0">
              <ImageWithFallback src={article.featuredImage || FALLBACK_IMAGE} alt={article.title} fill className="object-cover transition-none" priority />
              <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/80 to-transparent" />
            </div>
            {/* Back button at navbar level */}
            <div className="absolute top-0 left-0 right-0 h-12 sm:h-16 flex items-center px-4 sm:px-6 z-10">
              <Link href="/news" className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm font-medium transition-colors group">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 group-hover:bg-white/25 transition-colors">
                  <ArrowLeft className="h-4 w-4" />
                </span>
                <span className="hidden sm:inline">{t("breadcrumbNews")}</span>
              </Link>
            </div>
            <div className="w-full px-6 sm:px-8 pb-8 sm:pb-12 relative">
              <div className="flex items-center gap-2 text-sm text-white/60 mb-5">
                <Link href="/" className="hover:text-white transition-colors">{tBreadcrumbs("home")}</Link>
                <ChevronRight className="h-3.5 w-3.5" />
                <Link href="/news" className="hover:text-white transition-colors">{t("breadcrumbNews")}</Link>
                <ChevronRight className="h-3.5 w-3.5" />
                <span className="text-white/80 truncate max-w-[200px]">{article.title}</span>
              </div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                {article.category && (
                  <span className="inline-block text-[10px] font-bold px-3 py-1 rounded-lg bg-accent text-accent-foreground uppercase tracking-wider mb-4">
                    {article.category}
                  </span>
                )}
                <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-4 leading-tight">{article.title}</h1>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-white/60 text-xs sm:text-sm">
                  {article.publishedAt && (
                    <span className="flex items-center gap-1.5 whitespace-nowrap"><Calendar className="h-3.5 w-3.5 flex-shrink-0" /> {formatShortDate(article.publishedAt)}</span>
                  )}
                  {article.readTime && (
                    <span className="flex items-center gap-1.5 whitespace-nowrap"><Clock className="h-3.5 w-3.5 flex-shrink-0" /> {article.readTime}</span>
                  )}
                  {article.author && <span className="flex items-center gap-1.5 whitespace-nowrap"><User className="h-3.5 w-3.5 flex-shrink-0" /> {article.author}</span>}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      ) : containedHero ? (
        /* ── CONTAINED HERO: image in article column, title below ── */
        <div className="mt-12 sm:mt-16 max-w-4xl mx-auto px-4 sm:px-6 pt-8">
          <Link href="/news" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm font-medium transition-colors group mb-6">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-muted group-hover:bg-muted/70 transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" />
            </span>
            {t("breadcrumbNews")}
          </Link>
          {article.category && (
            <span className="inline-block text-[10px] font-bold px-3 py-1 rounded-lg bg-accent text-accent-foreground uppercase tracking-wider mb-4">
              {article.category}
            </span>
          )}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-4 leading-tight">{article.title}</h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-muted-foreground text-xs sm:text-sm mb-6">
            {article.publishedAt && (
              <span className="flex items-center gap-1.5 whitespace-nowrap"><Calendar className="h-3.5 w-3.5 flex-shrink-0" /> {formatShortDate(article.publishedAt)}</span>
            )}
            {article.readTime && (
              <span className="flex items-center gap-1.5 whitespace-nowrap"><Clock className="h-3.5 w-3.5 flex-shrink-0" /> {article.readTime}</span>
            )}
            {article.author && <span className="flex items-center gap-1.5 whitespace-nowrap"><User className="h-3.5 w-3.5 flex-shrink-0" /> {article.author}</span>}
          </div>
          <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden mb-2">
            <ImageWithFallback src={article.featuredImage || FALLBACK_IMAGE} alt={article.title} fill className="object-cover transition-none" priority />
          </div>
        </div>
      ) : (
        /* ── FULL-BLEED HERO ── */
        <section className="relative w-full h-[480px] md:h-[620px] overflow-hidden flex items-end">
          <div className="absolute inset-0">
            <ImageWithFallback src={article.featuredImage || FALLBACK_IMAGE} alt={article.title} fill className="object-cover transition-none" priority />
            <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/80 to-transparent" />
          </div>
          {/* Back button at navbar level */}
          <div className="absolute top-0 left-0 right-0 h-12 sm:h-16 flex items-center px-4 sm:px-6 z-10">
            <Link href="/news" className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm font-medium transition-colors group">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 group-hover:bg-white/25 transition-colors">
                <ArrowLeft className="h-4 w-4" />
              </span>
              <span className="hidden sm:inline">{t("breadcrumbNews")}</span>
            </Link>
          </div>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-10 sm:pb-14 relative w-full">
            <div className="flex items-center gap-2 text-sm text-white/60 mb-6">
              <Link href="/" className="hover:text-white transition-colors">{tBreadcrumbs("home")}</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <Link href="/news" className="hover:text-white transition-colors">{t("breadcrumbNews")}</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-white/80 truncate max-w-[200px]">{article.title}</span>
            </div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              {article.category && (
                <span className="inline-block text-[10px] font-bold px-3 py-1 rounded-lg bg-accent text-accent-foreground uppercase tracking-wider mb-4">
                  {article.category}
                </span>
              )}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-4 leading-tight">{article.title}</h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-white/60 text-xs sm:text-sm">
                {article.publishedAt && (
                  <span className="flex items-center gap-1.5 whitespace-nowrap"><Calendar className="h-3.5 w-3.5 flex-shrink-0" /> {formatShortDate(article.publishedAt)}</span>
                )}
                {article.readTime && (
                  <span className="flex items-center gap-1.5 whitespace-nowrap"><Clock className="h-3.5 w-3.5 flex-shrink-0" /> {article.readTime}</span>
                )}
                {article.author && <span className="flex items-center gap-1.5 whitespace-nowrap"><User className="h-3.5 w-3.5 flex-shrink-0" /> {article.author}</span>}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Content + Sidebar */}
      <section ref={articleRef} className="py-6 sm:py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-10 lg:gap-12">
            {/* Article body */}
            <div className="min-w-0">
              {/* Share strip — inline with article column */}
              <div className="flex items-center justify-between gap-4 mb-8 pb-6 border-b border-border/60">
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-muted-foreground">{t("shareLabel")}</span>
                  <a href={shareLinks.facebook} target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook" className="w-9 h-9 rounded-full bg-muted hover:bg-muted/70 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"><Facebook className="h-4 w-4" /></a>
                  <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer" aria-label="Share on Twitter" className="w-9 h-9 rounded-full bg-muted hover:bg-muted/70 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"><Twitter className="h-4 w-4" /></a>
                  <a href={shareLinks.linkedin} target="_blank" rel="noopener noreferrer" aria-label="Share on LinkedIn" className="w-9 h-9 rounded-full bg-muted hover:bg-muted/70 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"><Linkedin className="h-4 w-4" /></a>
                </div>
                <button type="button" onClick={handleCopy} aria-label="Copy link" className="w-9 h-9 rounded-full bg-muted hover:bg-muted/70 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors relative">
                  <LinkIcon className="h-4 w-4" />
                  {copied && <span className="absolute -top-8 right-0 text-[10px] font-semibold bg-foreground text-background px-2 py-1 rounded">{t("shareCopied")}</span>}
                </button>
              </div>
              {article.body && article.body.length > 0 ? (
                <ArticleBody body={article.body} />
              ) : article.content ? (
                <div
                  className="prose prose-lg max-w-none
                    prose-headings:text-foreground prose-headings:font-bold
                    prose-p:text-muted-foreground prose-p:leading-relaxed
                    prose-li:text-muted-foreground
                    prose-strong:text-foreground
                    prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                    prose-img:rounded-xl prose-img:shadow-lg"
                  dangerouslySetInnerHTML={{ __html: article.content }}
                />
              ) : article.excerpt ? (
                <p className="text-lg text-muted-foreground leading-relaxed">{article.excerpt}</p>
              ) : (
                <p className="text-muted-foreground">{t("noContent")}</p>
              )}

              {/* Tags */}
              {article.tags && article.tags.length > 0 && (
                <div className="mt-12 pt-8 border-t border-border">
                  <h3 className="text-sm font-semibold text-foreground mb-3">{t("tags")}</h3>
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((tag) => (
                      <Link key={tag} href={"/news?tag=" + encodeURIComponent(tag)} className="text-xs px-3 py-1.5 rounded-lg bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors">{tag}</Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Author bio card */}
              {(() => {
                const authorName = article.author || 'Binayah Editorial';
                const initials = authorName.split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase();
                return (
                  <div className="mt-10 p-5 rounded-2xl border border-border bg-card flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm flex-shrink-0">
                      {initials}
                    </div>
                    <div>
                      <p className="font-bold text-foreground">{authorName}</p>
                      <p className="text-xs text-muted-foreground mb-1">{t("authorRole")}</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">{t("authorBio")}</p>
                    </div>
                  </div>
                );
              })()}

              {/* Back link */}
              <div className="mt-12">
                <Link href="/news" className="inline-flex items-center gap-2 text-primary font-semibold hover:underline">
                  <ArrowLeft className="h-4 w-4" /> {t("backToNews")}
                </Link>
              </div>
            </div>

            {/* Sidebar */}
            <aside className="lg:sticky lg:top-24 self-start space-y-5 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:[scrollbar-width:none] lg:[&::-webkit-scrollbar]:hidden">
              {/* Investment Advice CTA */}
              <div className="rounded-2xl p-6 text-primary-foreground" style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}>
                <div className="w-10 h-10 rounded-xl bg-accent/90 flex items-center justify-center mb-4">
                  <TrendingUp className="h-5 w-5 text-accent-foreground" />
                </div>
                <h3 className="text-lg font-bold mb-1.5">{t("investmentAdviceTitle")}</h3>
                <p className="text-sm text-primary-foreground/75 leading-relaxed mb-4">
                  {t("investmentAdviceDesc")}
                </p>
                <Link
                  href="/contact"
                  className="block w-full text-center px-4 py-2.5 rounded-xl bg-accent text-accent-foreground text-sm font-semibold hover:bg-accent/90 transition-colors"
                >
                  {t("bookConsultation")}
                </Link>
              </div>

              {/* Related Articles compact list */}
              {related.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-foreground mb-4">
                    {t("relatedArticles")}
                  </p>
                  <div className="space-y-4">
                    {related.map((r) => (
                      <Link
                        key={r._id}
                        href={`/news/${r.slug}`}
                        className="group flex items-start gap-3"
                      >
                        <div className="relative w-20 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          <ImageWithFallback
                            src={r.featuredImage || FALLBACK_IMAGE}
                            alt={r.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          {r.publishedAt && (
                            <p className="text-[11px] text-muted-foreground mb-1">{formatShortDate(r.publishedAt)}</p>
                          )}
                          <p className="text-sm font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                            {r.title}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Newsletter */}
              <div className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center gap-2 mb-1.5">
                  <Bookmark className="h-4 w-4 text-accent" />
                  <h3 className="text-base font-bold text-foreground">{t("newsletterTitle")}</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                  {t("newsletterDesc")}
                </p>
                {subState === 'done' ? (
                  <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    {t("subscribedSuccess")}
                  </div>
                ) : (
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const fd = new FormData(e.currentTarget);
                      const email = fd.get("email");
                      if (!email) return;
                      setSubState('loading');
                      try {
                        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/market-report/subscribe`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ email: String(email), source: 'news-article' }),
                        });
                        if (res.ok) {
                          setSubState('done');
                        } else {
                          setSubState('error');
                        }
                      } catch {
                        setSubState('error');
                      }
                    }}
                    className="space-y-2.5"
                  >
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder={t("newsletterEmail")}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all"
                    />
                    <button
                      type="submit"
                      disabled={subState === 'loading'}
                      className="w-full px-4 py-2.5 rounded-xl text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60" style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
                    >
                      {subState === 'loading' ? '...' : t("newsletterSubscribe")}
                    </button>
                    {subState === 'error' && (
                      <p className="text-xs text-red-500">{t("subscribeError")}</p>
                    )}
                  </form>
                )}
              </div>

              {/* Market Snapshot */}
              <div className="rounded-2xl border border-border bg-card p-5">
                <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-foreground mb-4">
                  {t("marketSnapshot")}
                </p>
                <dl className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">{t("marketAvgYield")}</dt>
                    <dd className="font-bold text-foreground">{marketStats?.summary?.avgYield != null ? marketStats.summary.avgYield.toFixed(1) + '%' : '6.2%'}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">{t("marketYoyGrowth")}</dt>
                    <dd className="font-bold text-foreground">{marketStats?.yoyGrowth != null ? '+' + marketStats.yoyGrowth + '%' : '+11.4%'}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">{t("marketTransactions")}</dt>
                    <dd className="font-bold text-foreground">{"180K+"}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">{t("marketNewSupply")}</dt>
                    <dd className="font-bold text-foreground">{"70K units"}</dd>
                  </div>
                </dl>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Bottom CTA banner */}
      <section className="py-10 sm:py-14" style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-8">
            <div className="flex items-start gap-4 lg:flex-1">
              <div className="w-12 h-12 rounded-xl bg-accent/90 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-primary-foreground mb-1.5">
                  {t("ctaReadyTitle")}
                </h3>
                <p className="text-sm text-primary-foreground/80 leading-relaxed">
                  {t("ctaReadyDesc")}
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 lg:flex-shrink-0">
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(t("ctaWhatsAppPrefill", { title: article.title }))}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#25D366] text-white text-sm font-semibold hover:bg-[#1fbf58] transition-colors"
              >
                <MessageCircle className="h-4 w-4" /> {t("ctaWhatsApp")}
              </a>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-accent text-accent-foreground text-sm font-semibold hover:bg-accent/90 transition-colors"
              >
                <CalendarCheck className="h-4 w-4" /> {t("bookConsultation")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Related Articles */}

      {related.length > 0 && (
        <section className="px-4 sm:px-6 pb-20">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-end justify-between gap-4 mb-6 sm:mb-8">
              <div className="flex items-center gap-3">
                <div className="h-px w-8 bg-accent" />
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                  {t("relatedArticles").split(" ")[0]}{" "}
                  <span className="italic font-medium text-muted-foreground">
                    {t("relatedArticlesItalic")}
                  </span>
                </h2>
              </div>
              <Link
                href="/news"
                className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-foreground border border-border rounded-full px-4 py-2 hover:bg-muted/50 transition-colors"
              >
                {t("viewAll")} <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {related.map((r) => (
                <Link
                  key={r._id}
                  href={`/news/${r.slug}`}
                  className="group rounded-2xl overflow-hidden border border-border/60 bg-card hover:border-accent/50 transition-all hover:-translate-y-0.5"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                    <ImageWithFallback
                      src={r.featuredImage || FALLBACK_IMAGE}
                      alt={r.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {r.category && (
                      <span className="absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-md bg-primary text-primary-foreground uppercase tracking-wider">
                        {r.category}
                      </span>
                    )}
                    {r.readTime && (
                      <span className="absolute bottom-3 right-3 text-[10px] font-semibold px-2 py-1 rounded-md bg-foreground/70 text-white flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {r.readTime}
                      </span>
                    )}
                  </div>
                  <div className="p-4 sm:p-5">
                    {r.publishedAt && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5 mb-2">
                        <Calendar className="h-3 w-3" /> {formatShortDate(r.publishedAt)}
                      </p>
                    )}
                    <h3 className="text-base font-bold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                      {r.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
      <WhatsAppButton />

      {/* Back to top */}
      {showTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-24 right-5 z-50 w-10 h-10 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary/90 transition-all"
          aria-label="Back to top"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export default function NewsDetailClient(props: Parameters<typeof NewsDetailInner>[0]) {
  return (
    <Suspense fallback={null}>
      <NewsDetailInner {...props} />
    </Suspense>
  );
}
