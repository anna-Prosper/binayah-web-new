"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Calendar } from "lucide-react";
import Link from "next/link";

interface Article {
  _id: string;
  title: string;
  slug: string;
  category?: string;
  featuredImage?: string;
  publishedAt?: string;
}

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=400&fit=crop";

function formatDate(dateStr?: string) {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
  } catch { return dateStr; }
}

const NewsSection = ({ articles = [] }: { articles?: Article[] }) => (
  <section id="news" className="scroll-mt-20">
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      {/* Green gradient header */}
      <div className="relative overflow-hidden py-14 sm:py-20 px-4 sm:px-6 mb-0" style={{ background: "linear-gradient(135deg, #0B3D2E 0%, #1A7A5A 100%)" }}>
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)", backgroundSize: "40px 40px" }} />
        <div className="max-w-6xl mx-auto relative flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <motion.div initial={{ width: 0 }} whileInView={{ width: "3rem" }} viewport={{ once: true }} className="h-[2px] mb-6" style={{ background: "linear-gradient(90deg, #D4A847, #B8922F)" }} />
            <p className="font-semibold tracking-[0.4em] uppercase text-xs mb-4" style={{ color: "#D4A847" }}>Blog</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
              Latest <span className="italic font-light">News &amp; Insights</span>
            </h2>
            <p className="text-white/60 mt-3 max-w-lg">Stay informed with Dubai&apos;s real estate trends, investment tips, and market analysis.</p>
          </div>
          <a href="/news" className="group inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm text-white border border-white/20 hover:border-white/40 transition-all whitespace-nowrap">
            All Articles <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>
      </div>
      <div className="py-14 bg-background">

      {articles.length > 0 ? (
        <div className="grid md:grid-cols-3 gap-7">
          {articles.map((a, i) => (
            <motion.div
              key={a._id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              className="h-full"
            >
              <Link href={`/news/${a.slug}`} className="group flex flex-col h-full bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-border/50 hover:border-primary/20">
                <div className="relative overflow-hidden aspect-[16/10]">
                  <img src={a.featuredImage || FALLBACK_IMAGE} alt={a.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
                  {a.category && <span className="absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider text-white" style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}>{a.category}</span>}
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5 mb-3"><Calendar className="h-3 w-3" /> {formatDate(a.publishedAt)}</p>
                  <h3 className="font-bold text-foreground group-hover:text-primary transition-colors leading-snug">{a.title}</h3>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-center py-12">No articles yet.</p>
      )}
    </div>
  </div>
  </section>
);

export default NewsSection;