"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, ChevronRight, Clock } from "lucide-react";
import ImageWithFallback from "@/components/ImageWithFallback";

interface Article {
  _id: string;
  title: string;
  slug: string;
  content?: string;
  excerpt?: string;
  category?: string;
  tags?: string[];
  featuredImage?: string;
  author?: string;
  readTime?: string;
  publishedAt?: string;
}

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&h=600&fit=crop";

function formatDate(dateStr?: string) {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
  } catch { return dateStr; }
}

export default function NewsDetailClient({ article }: { article: Article }) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0">
          <ImageWithFallback src={article.featuredImage || FALLBACK_IMAGE} alt={article.title} fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground via-foreground/70 to-foreground/40" />
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative pt-12">
          <div className="flex items-center gap-2 text-sm text-white/60 mb-6">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href="/news" className="hover:text-white transition-colors">News</Link>
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
              {article.author && <span>By {article.author}</span>}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          {article.content ? (
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
            <p className="text-muted-foreground">No content available.</p>
          )}

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-border">
              <h3 className="text-sm font-semibold text-foreground mb-3">Tags</h3>
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
              <ArrowLeft className="h-4 w-4" /> Back to News
            </Link>
          </div>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
