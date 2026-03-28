"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { motion } from "framer-motion";
import {
  Building2,
  MapPin,
  CalendarDays,
  Globe,
  Mail,
  Phone,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

interface Developer {
  _id: string;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  address?: string;
  email?: string;
  phone?: string;
  website?: string;
  projectCount?: number;
}

interface Project {
  _id: string;
  name: string;
  slug: string;
  community?: string;
  status?: string;
  startingPrice?: number;
  completionDate?: string;
  featuredImage?: string;
  imageGallery?: string[];
}

function stripHtml(html: string): string {
  // Cut off anything after a "Projects" heading (embedded project lists from WP)
  let cleaned = html.replace(/<h[1-6][^>]*>.*?projects.*?<\/h[1-6]>[\s\S]*/i, "");
  // Remove all HTML tags
  let text = cleaned.replace(/<[^>]*>/g, " ");
  // Decode common HTML entities
  text = text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, " ");
  // Collapse multiple spaces/newlines into single space
  text = text.replace(/\s+/g, " ").trim();
  return text;
}

export default function DeveloperDetailClient({
  developer,
  projects,
}: {
  developer: Developer;
  projects: Project[];
}) {
  const cleanDescription = developer.description
    ? stripHtml(developer.description)
    : "";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-20 bg-primary text-primary-foreground overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
          <Link
            href="/developers"
            className="inline-flex items-center gap-2 text-sm text-primary-foreground/60 hover:text-primary-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> All Developers
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row items-start gap-6"
          >
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center overflow-hidden border border-white/10 flex-shrink-0">
              {developer.logo ? (
                <img
                  src={developer.logo}
                  alt={developer.name}
                  className="w-full h-full object-contain p-3"
                />
              ) : (
                <Building2 className="h-10 w-10 text-white/40" />
              )}
            </div>
            <div>
              <p className="text-accent font-semibold tracking-[0.4em] uppercase text-xs mb-3">
                Developer
              </p>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                {developer.name}
              </h1>
              {cleanDescription && (
                <p className="text-primary-foreground/70 max-w-2xl text-base leading-relaxed">
                  {cleanDescription}
                </p>
              )}

              {/* Contact details */}
              <div className="flex flex-wrap gap-4 mt-5 text-sm text-primary-foreground/60">
                {developer.address && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" /> {developer.address}
                  </span>
                )}
                {developer.website && (
                  <a
                    href={developer.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 hover:text-primary-foreground transition-colors"
                  >
                    <Globe className="h-3.5 w-3.5" /> Website
                  </a>
                )}
                {developer.email && (
                  <a
                    href={`mailto:${developer.email}`}
                    className="flex items-center gap-1.5 hover:text-primary-foreground transition-colors"
                  >
                    <Mail className="h-3.5 w-3.5" /> {developer.email}
                  </a>
                )}
                {developer.phone && (
                  <a
                    href={`tel:${developer.phone}`}
                    className="flex items-center gap-1.5 hover:text-primary-foreground transition-colors"
                  >
                    <Phone className="h-3.5 w-3.5" /> {developer.phone}
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Projects by this developer */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-foreground mb-8">
            Projects by {developer.name}{" "}
            <span className="text-muted-foreground font-normal text-lg">
              ({projects.length})
            </span>
          </h2>

          {projects.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((p, i) => (
                <motion.div
                  key={p._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: Math.min(i * 0.06, 0.3) }}
                >
                  <Link
                    href={`/project/${p.slug}`}
                    className="group block bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-border/50 hover:border-primary/20"
                  >
                    <div className="relative overflow-hidden aspect-[4/3]">
                      <img
                        src={
                          p.featuredImage ||
                          p.imageGallery?.[0] ||
                          "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600"
                        }
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                      <span className="absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-lg bg-accent text-accent-foreground uppercase tracking-wider">
                        {p.status || "Off-Plan"}
                      </span>
                    </div>
                    <div className="p-5">
                      {p.community && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                          <MapPin className="h-3 w-3" /> {p.community}
                        </div>
                      )}
                      <h3 className="font-bold text-foreground mb-3 group-hover:text-primary transition-colors leading-snug">
                        {p.name}
                      </h3>
                      <div className="flex items-center justify-between border-t border-border pt-3">
                        <p className="text-sm font-bold text-primary">
                          {p.startingPrice
                            ? `From AED ${(p.startingPrice / 1_000_000).toFixed(1)}M`
                            : "Price on request"}
                        </p>
                        {p.completionDate && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <CalendarDays className="h-3 w-3" />
                            {(() => {
                              try {
                                const d = new Date(p.completionDate);
                                return isNaN(d.getTime())
                                  ? p.completionDate
                                  : d.getFullYear();
                              } catch {
                                return p.completionDate;
                              }
                            })()}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Building2 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">
                No published projects found for this developer.
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
