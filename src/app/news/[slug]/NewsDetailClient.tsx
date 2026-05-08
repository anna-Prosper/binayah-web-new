"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
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
} from "lucide-react";
import ImageWithFallback from "@/components/ImageWithFallback";
import { useTranslations } from "next-intl";
import ArticleBody, { type ArticleBlock } from "@/components/ArticleBody";
import { useState } from "react";

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

export default function NewsDetailClient({
  article,
  related = [],
}: {
  article: Article;
  related?: RelatedArticle[];
}) {
  const t = useTranslations("newsDetail");
  const tBreadcrumbs = useTranslations("breadcrumbs");
  const [copied, setCopied] = useState(false);

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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative w-full h-[60vw] min-h-[280px] max-h-[560px] overflow-hidden flex items-end">
        <div className="absolute inset-0">
          <ImageWithFallback src={article.featuredImage || FALLBACK_IMAGE} alt={article.title} fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground via-foreground/70 to-foreground/40" />
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
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">{article.title}</h1>
            <div className="flex items-center gap-4 text-white/60 text-sm">
              {article.publishedAt && (
                <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {formatDate(article.publishedAt)}</span>
              )}
              {article.readTime && (
                <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {article.readTime}</span>
              )}
              {article.author && <span>{t("publishedOn")} {article.author}</span>}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Share strip */}
      <section className="border-b border-border/60">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-muted-foreground">SHARE</span>
          <div className="flex items-center gap-2">
            <a
              href={shareLinks.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Share on Facebook"
              className="w-9 h-9 rounded-full bg-muted hover:bg-muted/70 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <Facebook className="h-4 w-4" />
            </a>
            <a
              href={shareLinks.twitter}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Share on Twitter"
              className="w-9 h-9 rounded-full bg-muted hover:bg-muted/70 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <Twitter className="h-4 w-4" />
            </a>
            <a
              href={shareLinks.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Share on LinkedIn"
              className="w-9 h-9 rounded-full bg-muted hover:bg-muted/70 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <Linkedin className="h-4 w-4" />
            </a>
            <button
              type="button"
              onClick={handleCopy}
              aria-label="Copy link"
              className="w-9 h-9 rounded-full bg-muted hover:bg-muted/70 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors relative"
            >
              <LinkIcon className="h-4 w-4" />
              {copied && (
                <span className="absolute -top-8 right-0 text-[10px] font-semibold bg-foreground text-background px-2 py-1 rounded">
                  Copied
                </span>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 sm:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
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
                  <span key={tag} className="text-xs px-3 py-1.5 rounded-lg bg-muted text-muted-foreground">{tag}</span>
                ))}
              </div>
            </div>
          )}

          {/* Back link */}
          <div className="mt-12">
            <Link href="/news" className="inline-flex items-center gap-2 text-primary font-semibold hover:underline">
              <ArrowLeft className="h-4 w-4" /> {t("backToNews")}
            </Link>
          </div>
        </div>
      </section>

      {/* Bottom CTA banner */}
      <section className="px-4 sm:px-6 pb-12">
        <div className="max-w-5xl mx-auto rounded-2xl bg-gradient-to-br from-primary to-primary/85 p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-8">
            <div className="flex items-start gap-4 lg:flex-1">
              <div className="w-12 h-12 rounded-xl bg-accent/90 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-primary-foreground mb-1.5">
                  Ready to Invest in Dubai?
                </h3>
                <p className="text-sm text-primary-foreground/80 leading-relaxed">
                  Speak with our analysts about the best opportunities in today's market — free consultation.
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 lg:flex-shrink-0">
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`I read "${article.title}" and would like more info.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#25D366] text-white text-sm font-semibold hover:bg-[#1fbf58] transition-colors"
              >
                <MessageCircle className="h-4 w-4" /> WhatsApp Us
              </a>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-accent text-accent-foreground text-sm font-semibold hover:bg-accent/90 transition-colors"
              >
                <CalendarCheck className="h-4 w-4" /> Book Consultation
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
                  Related <span className="italic font-medium text-muted-foreground">Articles</span>
                </h2>
              </div>
              <Link
                href="/news"
                className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-foreground border border-border rounded-full px-4 py-2 hover:bg-muted/50 transition-colors"
              >
                View all <ArrowRight className="h-3.5 w-3.5" />
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
    </div>
  );
}
