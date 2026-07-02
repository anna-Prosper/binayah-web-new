"use client";
/* eslint-disable i18next/no-literal-string -- content/SEO landing page; dynamic copy is English */

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import ImageWithFallback from "@/components/ImageWithFallback";
import { AedPrice } from "@/components/AedPrice";
import Link from "next/link";
import {
  Building, CalendarDays, ChevronRight, MapPin, Bed, Bath, Maximize,
  Clock, CheckCircle2, TrendingUp, Layers, Landmark,
} from "lucide-react";

// ---- shapes (all serialized from the API) ---------------------------------
interface Pair { label?: string; value?: string; place?: string; time?: string; }
interface Enrichment {
  tagline?: string; overview?: string;
  highlights?: { label: string; value: string }[];
  keyFacts?: { developer?: string; communityType?: string; landArea?: string; propertyTypes?: string; handover?: string };
  connectivity?: { place: string; time: string }[];
  lifestyle?: string;
  amenityCategories?: { title: string; items: string[] }[];
  subCommunities?: string[];
  targetBuyer?: string; investmentNote?: string;
  faqs?: { q: string; a: string }[];
}
interface Community {
  name: string; slug: string; description?: string; featuredImage?: string;
  imageGallery?: string[]; latitude?: number | null; longitude?: number | null;
  enrichment?: Enrichment | null;
}
interface Project { slug: string; name: string; developerName?: string; featuredImage?: string; imageGallery?: string[]; status?: string; startingPrice?: number | null; currency?: string; completionDate?: string | null; }
interface Listing { slug: string; title?: string; name?: string; price?: number; currency?: string; bedrooms?: number; bathrooms?: number; size?: number; sizeUnit?: string; featuredImage?: string; community?: string; }
interface Nearby { name: string; slug: string; featuredImage?: string; }

interface Props {
  community: Community;
  projects: Project[];
  forSale: Listing[];
  forRent: Listing[];
  counts: { projects: number; forSale: number; forRent: number };
  developers: string[];
  nearby: Nearby[];
  locale: string;
}

const lp = (locale: string, path: string) => (locale === "en" ? path : `/${locale}${path}`);
const year = (d?: string | null) => { if (!d) return null; const dt = new Date(d); return isNaN(dt.getTime()) ? d : dt.getFullYear(); };

function projSlug(name: string) { return name.toLowerCase().replace(/[^\w\s-]/g, "").replace(/[\s_]+/g, "-"); }

export default function CommunityRichClient({ community, projects, forSale, forRent, counts, developers, nearby, locale }: Props) {
  const e = community.enrichment || {};
  const name = community.name;
  const hero = community.featuredImage || community.imageGallery?.[0] || "/assets/dubai-hero.webp";
  const mapSrc = community.latitude && community.longitude
    ? `https://maps.google.com/maps?q=${community.latitude},${community.longitude}&z=13&output=embed`
    : `https://maps.google.com/maps?q=${encodeURIComponent(name + ", Dubai")}&z=13&output=embed`;
  const overview = (e.overview || community.description || "").replace(/<[^>]*>/g, " ").trim();
  const kf = e.keyFacts || {};
  const keyFactRows = [
    ["Developer", kf.developer], ["Community type", kf.communityType],
    ["Land area", kf.landArea], ["Property types", kf.propertyTypes], ["Handover", kf.handover],
  ].filter(([, v]) => v) as [string, string][];

  // JSON-LD: Place + FAQ + Breadcrumb
  const jsonLd: any[] = [
    { "@context": "https://schema.org", "@type": "Place", name, description: overview.slice(0, 300),
      address: { "@type": "PostalAddress", addressLocality: name, addressRegion: "Dubai", addressCountry: "AE" },
      ...(community.latitude && community.longitude ? { geo: { "@type": "GeoCoordinates", latitude: community.latitude, longitude: community.longitude } } : {}) },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.binayah.ae/" },
      { "@type": "ListItem", position: 2, name: "Communities", item: "https://www.binayah.ae/communities" },
      { "@type": "ListItem", position: 3, name },
    ] },
  ];
  if (e.faqs?.length) jsonLd.push({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: e.faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) });

  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <div className="mb-6">
      <div className="h-1 w-10 rounded-full bg-accent mb-3" />
      <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">{children}</h2>
    </div>
  );

  const ProjectCard = ({ p }: { p: Project }) => (
    <Link href={lp(locale, `/project/${p.slug || projSlug(p.name)}`)} className="group block bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-border/50 hover:border-primary/20">
      <div className="relative overflow-hidden aspect-[4/3]">
        <ImageWithFallback src={p.featuredImage || p.imageGallery?.[0] || "/assets/property-placeholder-v2.webp"} alt={p.name} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-700" />
        {p.status && <span className="absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-lg bg-accent text-accent-foreground uppercase tracking-wider">{p.status}</span>}
      </div>
      <div className="p-5">
        {p.developerName && <p className="text-xs text-muted-foreground flex items-center gap-1.5 mb-2"><Building className="h-3 w-3" /> {p.developerName}</p>}
        <h3 className="font-bold text-foreground mb-3 group-hover:text-primary transition-colors line-clamp-2">{p.name}</h3>
        <div className="flex items-center justify-between border-t border-border pt-3">
          <p className="text-sm font-bold text-primary">{p.startingPrice ? <AedPrice value={p.startingPrice} currency={p.currency} /> : "Price on request"}</p>
          {year(p.completionDate) && <p className="text-xs text-muted-foreground flex items-center gap-1"><CalendarDays className="h-3 w-3" />{year(p.completionDate)}</p>}
        </div>
      </div>
    </Link>
  );

  const ListingCard = ({ l }: { l: Listing }) => (
    <Link href={lp(locale, `/property/${l.slug}`)} className="group block bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-border/50 hover:border-primary/20">
      <div className="relative overflow-hidden aspect-[4/3]">
        <ImageWithFallback src={l.featuredImage || "/assets/property-placeholder-v2.webp"} alt={l.title || l.name || name} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-700" />
      </div>
      <div className="p-5">
        <h3 className="font-semibold text-sm text-foreground mb-2 line-clamp-1 group-hover:text-primary transition-colors">{l.title || l.name}</h3>
        <p className="text-sm font-bold text-primary mb-3">{l.price ? <AedPrice value={l.price} currency={l.currency} /> : "Price on request"}</p>
        <div className="flex items-center gap-3 text-xs text-muted-foreground border-t border-border pt-3">
          {l.bedrooms != null && <span className="flex items-center gap-1"><Bed className="h-3 w-3" />{l.bedrooms || "Studio"}</span>}
          {l.bathrooms != null && <span className="flex items-center gap-1"><Bath className="h-3 w-3" />{l.bathrooms}</span>}
          {l.size ? <span className="flex items-center gap-1"><Maximize className="h-3 w-3" />{l.size.toLocaleString()} {l.sizeUnit || "sqft"}</span> : null}
        </div>
      </div>
    </Link>
  );

  return (
    <div className="min-h-screen bg-background">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />

      {/* Hero */}
      <section className="relative pt-24 pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <ImageWithFallback src={hero} alt={name} fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground via-foreground/60 to-foreground/30" />
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative pt-12">
          <div className="flex items-center gap-2 text-sm text-white/60 mb-6">
            <Link href={lp(locale, "/")} className="hover:text-white">Home</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href={lp(locale, "/communities")} className="hover:text-white">Communities</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-white">{name}</span>
          </div>
          <p className="text-accent font-semibold tracking-[0.25em] uppercase text-[11px] sm:text-xs mb-3">Community Guide</p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-3 tracking-tight">{name}</h1>
          {e.tagline && <p className="text-white/80 max-w-2xl text-lg leading-relaxed mb-6">{e.tagline}</p>}
          {e.highlights?.length ? (
            <div className="flex flex-wrap gap-2.5">
              {e.highlights.map((h, i) => (
                <span key={i} className="inline-flex items-center gap-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 px-3.5 py-2 text-sm text-white">
                  <span className="text-white/60">{h.label}:</span><span className="font-semibold">{h.value}</span>
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-16">
        {/* Overview + Key facts */}
        {(overview || keyFactRows.length) && (
          <section className="grid lg:grid-cols-3 gap-10 items-start">
            <div className="lg:col-span-2">
              <SectionTitle>About {name}</SectionTitle>
              {overview && (
                <div className="space-y-4 text-[15px] leading-[1.75] text-muted-foreground">
                  {overview.split(/\n{2,}/).map((para, i) => <p key={i}>{para.trim()}</p>)}
                </div>
              )}
              {e.targetBuyer && (
                <div className="mt-6 inline-flex items-center gap-2.5 rounded-xl bg-primary/5 border border-primary/10 px-4 py-2.5 text-sm">
                  <span className="font-semibold text-primary">Ideal for</span>
                  <span className="text-muted-foreground">{e.targetBuyer}</span>
                </div>
              )}
            </div>
            {keyFactRows.length > 0 && (
              <div className="lg:sticky lg:top-24 rounded-2xl border border-border/60 bg-gradient-to-b from-card to-muted/20 p-6 shadow-sm">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-accent mb-5">At a glance</h3>
                <dl className="space-y-4">
                  {keyFactRows.map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-6 text-sm border-b border-border/40 pb-4 last:border-0 last:pb-0">
                      <dt className="text-muted-foreground whitespace-nowrap">{k}</dt>
                      <dd className="font-semibold text-foreground text-right">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </section>
        )}

        {/* Location & connectivity */}
        <section className="grid lg:grid-cols-2 gap-8 items-stretch">
          <div>
            <SectionTitle>Location &amp; connectivity</SectionTitle>
            {e.connectivity?.length ? (
              <ul className="space-y-3">
                {e.connectivity.map((c, i) => (
                  <li key={i} className="flex items-center justify-between bg-card rounded-xl border border-border/50 px-4 py-3">
                    <span className="flex items-center gap-2 text-foreground"><MapPin className="h-4 w-4 text-primary" />{c.place}</span>
                    <span className="flex items-center gap-1.5 text-sm text-muted-foreground"><Clock className="h-3.5 w-3.5" />{c.time}</span>
                  </li>
                ))}
              </ul>
            ) : <p className="text-muted-foreground">{name} is well connected across Dubai.</p>}
          </div>
          <div className="rounded-2xl overflow-hidden border border-border/50 min-h-[280px]">
            <iframe title={`Map of ${name}`} src={mapSrc} className="w-full h-full min-h-[280px]" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          </div>
        </section>

        {/* Amenities & lifestyle */}
        {(e.amenityCategories?.length || e.lifestyle) && (
          <section>
            <SectionTitle>Amenities &amp; lifestyle</SectionTitle>
            {e.lifestyle && <p className="text-muted-foreground leading-relaxed mb-6 max-w-3xl">{e.lifestyle}</p>}
            {e.amenityCategories?.length ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {e.amenityCategories.map((cat, i) => (
                  <div key={i} className="bg-card rounded-2xl border border-border/50 p-5">
                    <h3 className="font-bold text-foreground mb-3 flex items-center gap-2"><Layers className="h-4 w-4 text-primary" />{cat.title}</h3>
                    <ul className="space-y-2">
                      {cat.items.map((it, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground"><CheckCircle2 className="h-4 w-4 text-primary/70 mt-0.5 flex-shrink-0" />{it}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : null}
          </section>
        )}

        {/* Sub-communities */}
        {e.subCommunities?.length ? (
          <section>
            <SectionTitle>Districts in {name}</SectionTitle>
            <div className="flex flex-wrap gap-2.5">
              {e.subCommunities.map((s, i) => (
                <span key={i} className="rounded-xl bg-primary/8 border border-primary/15 text-primary px-4 py-2 text-sm font-medium">{s}</span>
              ))}
            </div>
          </section>
        ) : null}

        {/* Off-plan projects */}
        {projects.length > 0 && (
          <section>
            <SectionTitle>Off-plan projects in {name} ({counts.projects})</SectionTitle>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {projects.slice(0, 9).map((p) => <ProjectCard key={p.slug || p.name} p={p} />)}
            </div>
            {counts.projects > 9 && (
              <Link href={lp(locale, `/search?status=Off-Plan&intent=off-plan&locations=${encodeURIComponent(name)}`)} className="inline-flex items-center gap-2 mt-6 text-primary font-semibold hover:underline">
                View all {counts.projects} projects <ChevronRight className="h-4 w-4" />
              </Link>
            )}
          </section>
        )}

        {/* For sale */}
        {forSale.length > 0 && (
          <section>
            <SectionTitle>Properties for sale in {name} ({counts.forSale})</SectionTitle>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {forSale.slice(0, 6).map((l) => <ListingCard key={l.slug} l={l} />)}
            </div>
            <Link href={lp(locale, `/search?status=Secondary&intent=buy&locations=${encodeURIComponent(name)}`)} className="inline-flex items-center gap-2 mt-6 text-primary font-semibold hover:underline">
              View all for sale <ChevronRight className="h-4 w-4" />
            </Link>
          </section>
        )}

        {/* For rent */}
        {forRent.length > 0 && (
          <section>
            <SectionTitle>Properties for rent in {name} ({counts.forRent})</SectionTitle>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {forRent.slice(0, 6).map((l) => <ListingCard key={l.slug} l={l} />)}
            </div>
            <Link href={lp(locale, `/search?status=Secondary&intent=rent&locations=${encodeURIComponent(name)}`)} className="inline-flex items-center gap-2 mt-6 text-primary font-semibold hover:underline">
              View all for rent <ChevronRight className="h-4 w-4" />
            </Link>
          </section>
        )}

        {/* Investment + developers */}
        {(e.investmentNote || developers.length > 0) && (
          <section className="grid lg:grid-cols-2 gap-8">
            {e.investmentNote && (
              <div className="bg-primary/5 rounded-2xl border border-primary/15 p-6">
                <h3 className="font-bold text-foreground mb-3 flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary" />Investment outlook</h3>
                <p className="text-muted-foreground leading-relaxed">{e.investmentNote}</p>
              </div>
            )}
            {developers.length > 0 && (
              <div className="bg-card rounded-2xl border border-border/50 p-6">
                <h3 className="font-bold text-foreground mb-3 flex items-center gap-2"><Landmark className="h-5 w-5 text-primary" />Developers active here</h3>
                <div className="flex flex-wrap gap-2">
                  {developers.map((d) => (
                    <Link key={d} href={lp(locale, `/developers/${projSlug(d)}`)} className="rounded-lg bg-muted/60 hover:bg-muted px-3 py-1.5 text-sm text-foreground transition-colors">{d}</Link>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* FAQs */}
        {e.faqs?.length ? (
          <section>
            <SectionTitle>{name}: frequently asked questions</SectionTitle>
            <div className="space-y-3">
              {e.faqs.map((f, i) => (
                <details key={i} className="group bg-card rounded-2xl border border-border/50 p-5">
                  <summary className="font-semibold text-foreground cursor-pointer list-none flex items-center justify-between">{f.q}<ChevronRight className="h-4 w-4 text-muted-foreground group-open:rotate-90 transition-transform" /></summary>
                  <p className="text-muted-foreground mt-3 leading-relaxed">{f.a}</p>
                </details>
              ))}
            </div>
          </section>
        ) : null}

        {/* Nearby communities */}
        {nearby.length > 0 && (
          <section>
            <SectionTitle>Explore nearby communities</SectionTitle>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {nearby.map((n) => (
                <Link key={n.slug} href={lp(locale, `/communities/${n.slug}`)} className="group relative rounded-xl overflow-hidden aspect-[4/3] border border-border/50">
                  <ImageWithFallback src={n.featuredImage || "/assets/property-placeholder-v2.webp"} alt={n.name} fill sizes="(max-width:768px) 50vw, 16vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <span className="absolute bottom-2 left-2 right-2 text-white text-xs font-semibold leading-tight">{n.name}</span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
