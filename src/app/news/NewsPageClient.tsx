"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import Breadcrumbs from "@/components/Breadcrumbs";
import Link from "next/link";
import ImageWithFallback from "@/components/ImageWithFallback";
import { motion } from "framer-motion";
import { Calendar } from "lucide-react";

interface Article {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  category?: string;
  featuredImage?: string;
  publishedAt?: string;
  readTime?: string;
}

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=400&fit=crop";

function formatDate(dateStr?: string) {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
  } catch { return dateStr; }
}

export default function NewsPageClient({ articles }: { articles: Article[] }) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Breadcrumbs items={[{ label: "News", href: "/news" }]} />
      <section className="relative pt-32 pb-20 text-white overflow-hidden" style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}>
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)", backgroundSize: "48px 48px" }} />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-accent font-semibold tracking-[0.4em] uppercase text-xs mb-4">Blog</p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">Latest <span className="italic font-light">News & Insights</span></h1>
            <p className="text-primary-foreground/70 max-w-2xl text-lg">
              Stay informed with Dubai&apos;s real estate trends, investment tips, and market analysis — {articles.length} articles.
            </p>
          </motion.div>
        </div>
      </section>
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-7">
            {articles.map((a, i) => (
              <motion.div key={a._id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: Math.min(i * 0.06, 0.3) }} className="h-full">
                <Link href={`/news/${a.slug}`} className="group flex flex-col h-full bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-border/50 hover:border-primary/20">
                  <div className="relative overflow-hidden aspect-[16/10]">
                    <ImageWithFallback src={a.featuredImage || FALLBACK_IMAGE} alt={a.title} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover group-hover:scale-110 transition-transform duration-700" />
                    {a.category && <span className="absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-lg text-white uppercase tracking-wider" style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}>{a.category}</span>}
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 mb-3">
                      <Calendar className="h-3 w-3" /> {formatDate(a.publishedAt)}
                      {a.readTime && <span className="ml-2">{a.readTime}</span>}
                    </p>
                    <h3 className="font-bold text-foreground group-hover:text-primary transition-colors leading-snug mb-2 line-clamp-2">{a.title}</h3>
                    {a.excerpt && <p className="text-sm text-muted-foreground line-clamp-2">{a.excerpt}</p>}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
