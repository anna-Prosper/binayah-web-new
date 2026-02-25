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
  <section id="news" className="py-24 bg-background scroll-mt-20">
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-14 gap-4"
      >
        <div>
          <motion.div initial={{ width: 0 }} whileInView={{ width: "3rem" }} viewport={{ once: true }} className="h-[2px] bg-accent mb-6" />
          <p className="text-accent font-semibold tracking-[0.4em] uppercase text-xs mb-4">Blog</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
            Latest <span className="italic font-light">News</span>
          </h2>
        </div>
        <a href="/news" className="group flex items-center gap-2 text-primary font-semibold text-sm hover:gap-3 transition-all">
          All Articles <ArrowUpRight className="h-4 w-4" />
        </a>
      </motion.div>

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
                  {a.category && <span className="absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-lg bg-primary text-primary-foreground uppercase tracking-wider">{a.category}</span>}
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
  </section>
);

export default NewsSection;
