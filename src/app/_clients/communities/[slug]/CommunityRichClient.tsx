/* eslint-disable i18next/no-literal-string -- content/SEO landing page; dynamic copy is English */
// Server Component — purely presentational (native <details> accordion, CSS
// sticky nav, no hooks/handlers), so it ships zero JS of its own. Client-only
// children (Navbar, Footer, WhatsAppButton, ImageWithFallback) remain islands.

import { IMAGE_PLACEHOLDER } from "@/lib/images";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ImageWithFallback from "@/components/ImageWithFallback";
import { AedPrice } from "@/components/AedPrice";
import { findBuyCommunity } from "@/lib/buy-communities";
import Link from "next/link";
import {
  Building, CalendarDays, ChevronRight, MapPin, Bed, Bath, Maximize, Clock,
  CheckCircle2, TrendingUp, Landmark, Waves, UtensilsCrossed, Dumbbell,
  ShoppingBag, Trees, Sparkles, Phone, ArrowRight, Layers,
} from "lucide-react";

// ---- shapes (all serialized from the API) ---------------------------------
interface Enrichment {
  tagline?: string; overview?: string;
  highlights?: { label: string; value: string }[];
  keyFacts?: { developer?: string; communityType?: string; landArea?: string; propertyTypes?: string; handover?: string };
  connectivity?: { place: string; time: string }[];
  lifestyle?: string;
  amenityCategories?: { title: string; items: string[] }[];
  subCommunities?: string[];
  targetBuyer?: string; investmentNote?: string;
  sectionHeadings?: { about?: string; location?: string; amenities?: string; projects?: string; investment?: string; faqs?: string; nearby?: string };
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

const WA = "https://wa.me/971549988811";
const lp = (locale: string, path: string) => (locale === "en" ? path : `/${locale}${path}`);
const year = (d?: string | null) => { if (!d) return null; const dt = new Date(d); return isNaN(dt.getTime()) ? d : dt.getFullYear(); };
const projSlug = (name: string) => name.toLowerCase().replace(/[^\w\s-]/g, "").replace(/[\s_]+/g, "-");
const isPlaceholder = (v?: string) => !v || /^(n\/?a|tba|tbd|not specified|not available|unknown|-)$/i.test(v.trim());

function amenityIcon(title: string) {
  const t = title.toLowerCase();
  if (/din|food|restaur|retail|shop|souk|mall/.test(t)) return /shop|retail|mall|souk/.test(t) ? ShoppingBag : UtensilsCrossed;
  if (/fit|gym|wellness|spa|health|sport/.test(t)) return Dumbbell;
  if (/beach|water|marina|pool|coast/.test(t)) return Waves;
  if (/park|green|garden|nature|outdoor|recreat/.test(t)) return Trees;
  return Sparkles;
}

export default function CommunityRichClient({ community, projects, forSale, forRent, counts, developers, nearby, locale }: Props) {
  // This is the informational area guide. When the area also has transactional
  // buy/rent/off-plan landing pages, cross-link to them (distinct intent) so the
  // two page types complement rather than compete for the same query.
  const isBuyCommunity = !!findBuyCommunity(community.slug);
  const e = community.enrichment || {};
  const sh = e.sectionHeadings || {};
  const name = community.name;
  const hero = community.featuredImage || community.imageGallery?.[0] || "/assets/dubai-hero.webp";
  const mapSrc = community.latitude && community.longitude
    ? `https://maps.google.com/maps?q=${community.latitude},${community.longitude}&z=13&output=embed`
    : `https://maps.google.com/maps?q=${encodeURIComponent(name + ", Dubai")}&z=13&output=embed`;
  const aiOverview = (e.overview || "").replace(/<[^>]*>/g, " ").trim();
  const dbDesc = (community.description || "").replace(/<[^>]*>/g, " ").trim();
  const overview = aiOverview.length >= dbDesc.length ? aiOverview : dbDesc;
  const kf = e.keyFacts || {};
  const priceFrom = (e.highlights || []).find((h) => /price/i.test(h.label))?.value;

  const glanceRows = ([
    ["Developer", kf.developer], ["Community type", kf.communityType], ["Land area", kf.landArea],
    ["Property types", kf.propertyTypes], ["Handover", kf.handover], ["Ideal for", e.targetBuyer],
  ] as [string, string | undefined][]).filter(([, v]) => !isPlaceholder(v)) as [string, string][];

  // Hero stat blocks — data-derived (no fabrication).
  const heroStats = ([
    counts.projects ? { v: String(counts.projects), l: "Off-plan projects" } : null,
    priceFrom ? { v: priceFrom, l: "Starting price" } : null,
    !isPlaceholder(kf.landArea) ? { v: kf.landArea!, l: "Land area" } : null,
    e.connectivity?.[0] ? { v: e.connectivity[0].time.replace(/[~\s]*/g, "").replace("minutes", "min").replace("min", " min"), l: `To ${e.connectivity[0].place}` } : null,
  ].filter(Boolean) as { v: string; l: string }[]).slice(0, 4);
  // Column count follows the number of real stats so there's never an empty
  // trailing cell (static strings so Tailwind's JIT keeps them).
  const heroCols = ({ 1: "sm:grid-cols-1", 2: "sm:grid-cols-2", 3: "sm:grid-cols-3", 4: "sm:grid-cols-4" } as Record<number, string>)[heroStats.length] ?? "sm:grid-cols-4";

  const pageUrl = `https://www.binayah.ae${lp(locale, `/communities/${community.slug}`)}`;
  const jsonLd: any[] = [
    { "@context": "https://schema.org", "@type": "Place", name, description: overview.slice(0, 300),
      url: pageUrl, ...(community.featuredImage ? { image: community.featuredImage } : {}),
      address: { "@type": "PostalAddress", addressLocality: name, addressRegion: "Dubai", addressCountry: "AE" },
      containedInPlace: { "@type": "City", name: "Dubai", address: { "@type": "PostalAddress", addressCountry: "AE" } },
      hasMap: `https://www.google.com/maps/search/${encodeURIComponent(name + ", Dubai")}`,
      ...(community.latitude && community.longitude ? { geo: { "@type": "GeoCoordinates", latitude: community.latitude, longitude: community.longitude } } : {}) },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.binayah.ae/" },
      { "@type": "ListItem", position: 2, name: "Communities", item: "https://www.binayah.ae/communities" },
      { "@type": "ListItem", position: 3, name },
    ] },
  ];
  if (e.faqs?.length) jsonLd.push({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: e.faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) });

  // Section header: gold eyebrow + editorial headline.
  const SecHead = ({ eyebrow, title }: { eyebrow: string; title: string }) => (
    <div className="mb-8 max-w-3xl">
      <span className="inline-block text-[11px] font-bold uppercase tracking-[0.18em] text-accent mb-3">{eyebrow}</span>
      <h2 className="text-2xl sm:text-3xl lg:text-[2.1rem] font-bold text-foreground tracking-tight leading-[1.15]">{title}</h2>
    </div>
  );

  const ProjectCard = ({ p }: { p: Project }) => (
    <Link href={lp(locale, `/project/${p.slug || projSlug(p.name)}`)} className="group block bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-border/50 hover:border-primary/20">
      <div className="relative overflow-hidden aspect-[4/3]">
        <ImageWithFallback src={p.featuredImage || p.imageGallery?.[0] || IMAGE_PLACEHOLDER} alt={p.name} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-700" />
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
        <ImageWithFallback src={l.featuredImage || IMAGE_PLACEHOLDER} alt={l.title || l.name || name} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-700" />
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

  // In-page section nav
  const navItems = [
    ["about", "Overview"], ["location", "Location"], ["amenities", "Amenities"],
    ["projects", "Projects"], ["invest", "Investment"], ["faqs", "FAQs"],
  ] as [string, string][];

  return (
    <div className="min-h-screen bg-background">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />

      {/* ===== Hero ===== */}
      <section className="relative min-h-[66vh] sm:min-h-[78vh] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <ImageWithFallback src={hero} alt={`${name} community in Dubai — properties for sale & rent`} fill sizes="100vw" className="object-cover" priority />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(11,61,46,0.96) 0%, rgba(11,61,46,0.65) 42%, rgba(14,28,34,0.25) 100%)" }} />
        </div>
        <div className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 pt-28 sm:pt-32 pb-10 sm:pb-14">
          <div className="flex items-center gap-2 text-sm text-white/55 mb-5">
            <Link href={lp(locale, "/")} className="hover:text-white">Home</Link><ChevronRight className="h-3.5 w-3.5" />
            <Link href={lp(locale, "/communities")} className="hover:text-white">Communities</Link><ChevronRight className="h-3.5 w-3.5" />
            <span className="text-white">{name}</span>
          </div>
          <span className="inline-block text-[11px] font-bold uppercase tracking-[0.25em] text-accent mb-4">
            Community Guide{kf.communityType && !isPlaceholder(kf.communityType) ? ` · ${kf.communityType}` : ""}
          </span>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-white mb-4 tracking-tight leading-[0.98]">{name}</h1>
          {e.tagline && <p className="text-white/80 max-w-2xl text-lg sm:text-xl leading-relaxed mb-8">{e.tagline}</p>}

          {heroStats.length > 0 && (
            <div className={`grid grid-cols-2 ${heroCols} gap-px rounded-2xl overflow-hidden bg-white/15 backdrop-blur-md border border-white/20 max-w-3xl mb-8`}>
              {heroStats.map((s, i) => (
                <div key={i} className={`bg-white/5 px-4 py-3.5 sm:px-5 sm:py-4${heroStats.length % 2 === 1 && i === heroStats.length - 1 ? " col-span-2 sm:col-span-1" : ""}`}>
                  <div className="text-lg sm:text-2xl font-bold text-white leading-tight">{s.v}</div>
                  <div className="text-[10px] sm:text-[11px] uppercase tracking-wider text-white/60 mt-1">{s.l}</div>
                </div>
              ))}
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-3">
            <a href={WA} target="_blank" rel="noopener noreferrer" className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/25 px-5 py-3.5 text-sm font-semibold text-white hover:bg-white/20 transition-colors">
              <Phone className="h-4 w-4" /> Talk to an Advisor
            </a>
            <a href="#projects" className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-semibold text-accent-foreground transition-transform hover:scale-[1.02]" style={{ background: "linear-gradient(135deg, #D4A847, #B8922F)" }}>
              Explore projects <ArrowRight className="h-4 w-4" />
            </a>
          </div>
          {isBuyCommunity && (
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mt-5 text-sm">
              <span className="text-white/50">Ready to transact in {name}?</span>
              <Link href={lp(locale, `/buy-property-in/${community.slug}`)} className="font-semibold text-white hover:text-accent transition-colors">Buy →</Link>
              <Link href={lp(locale, `/rent-property-in/${community.slug}`)} className="font-semibold text-white hover:text-accent transition-colors">Rent →</Link>
              <Link href={lp(locale, `/off-plan-in/${community.slug}`)} className="font-semibold text-white hover:text-accent transition-colors">Off-plan →</Link>
            </div>
          )}
        </div>
      </section>

      {/* ===== Sticky section nav ===== */}
      <nav aria-label={`${name} sections`} className="sticky top-0 sm:top-16 z-30 bg-background/95 backdrop-blur-md border-b border-border/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex gap-1 overflow-x-auto scrollbar-hide">
          {navItems.map(([id, label]) => (
            <a key={id} href={`#${id}`} className="whitespace-nowrap px-4 py-3.5 text-sm font-medium text-muted-foreground hover:text-primary border-b-2 border-transparent hover:border-accent transition-colors">{label}</a>
          ))}
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20 space-y-14 sm:space-y-20">
        {/* ===== About + At a glance ===== */}
        <section id="about" className="scroll-mt-28 grid lg:grid-cols-3 gap-8 lg:gap-10 items-start">
          <div className="lg:col-span-2">
            <SecHead eyebrow="About the community" title={sh.about || e.tagline || `Welcome to ${name}`} />
            {overview && (
              <div className="space-y-4 text-[15px] leading-[1.8] text-muted-foreground">
                {overview.split(/\n{2,}/).map((para, i) => <p key={i}>{para.trim()}</p>)}
              </div>
            )}
          </div>
          {glanceRows.length > 0 && (
            <aside className="lg:sticky lg:top-32 rounded-2xl border border-border/60 bg-gradient-to-b from-card to-muted/20 p-6 shadow-sm">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-accent mb-5">At a glance</h3>
              <dl className="space-y-4">
                {glanceRows.map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-5 text-sm border-b border-border/40 pb-4 last:border-0 last:pb-0">
                    <dt className="text-muted-foreground whitespace-nowrap">{k}</dt>
                    <dd className="font-semibold text-foreground text-right">{v}</dd>
                  </div>
                ))}
              </dl>
              <a href={WA} target="_blank" rel="noopener noreferrer" className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-accent-foreground transition-transform hover:scale-[1.02]" style={{ background: "linear-gradient(135deg, #D4A847, #B8922F)" }}>
                Speak to a Specialist
              </a>
            </aside>
          )}
        </section>

        {/* ===== Location & connectivity ===== */}
        <section id="location" className="scroll-mt-28">
          <SecHead eyebrow="Location & connectivity" title={sh.location || "Minutes from everywhere that matters"} />
          <div className="grid lg:grid-cols-2 gap-8 items-stretch">
            <div>
              {e.connectivity?.length ? (
                <ul className="space-y-3">
                  {e.connectivity.map((c, i) => (
                    <li key={i} className="flex items-center justify-between bg-card rounded-xl border border-border/50 px-4 py-3.5">
                      <span className="flex items-center gap-3 text-foreground font-medium"><span className="w-9 h-9 rounded-lg bg-primary/8 flex items-center justify-center"><MapPin className="h-4 w-4 text-primary" /></span>{c.place}</span>
                      <span className="flex items-center gap-1.5 text-sm text-muted-foreground"><Clock className="h-3.5 w-3.5" />{c.time}</span>
                    </li>
                  ))}
                </ul>
              ) : <p className="text-muted-foreground">{name} is well connected across Dubai.</p>}
            </div>
            <div className="rounded-2xl overflow-hidden border border-border/50 min-h-[320px]">
              <iframe title={`Map of ${name}, Dubai`} src={mapSrc} className="w-full h-full min-h-[320px]" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
            </div>
          </div>
        </section>

        {/* ===== Amenities & lifestyle ===== */}
        {(e.amenityCategories?.length || e.lifestyle) && (
          <section id="amenities" className="scroll-mt-28">
            <SecHead eyebrow="Amenities & lifestyle" title={sh.amenities || "Everything for a life well lived"} />
            {e.lifestyle && <p className="text-muted-foreground leading-relaxed mb-8 max-w-3xl -mt-2">{e.lifestyle}</p>}
            {e.amenityCategories?.length ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {e.amenityCategories.map((cat, i) => {
                  const Icon = amenityIcon(cat.title);
                  return (
                    <div key={i} className="bg-card rounded-2xl border border-border/50 p-6 hover:shadow-md transition-shadow">
                      <div className="w-11 h-11 rounded-xl bg-primary/8 flex items-center justify-center mb-4"><Icon className="h-5 w-5 text-primary" /></div>
                      <h3 className="font-bold text-foreground mb-3">{cat.title}</h3>
                      <ul className="space-y-2">
                        {cat.items.map((it, j) => <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground"><CheckCircle2 className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />{it}</li>)}
                      </ul>
                    </div>
                  );
                })}
              </div>
            ) : null}
            {e.subCommunities?.length ? (
              <div className="mt-8 flex flex-wrap gap-2.5">
                <span className="text-sm font-semibold text-foreground mr-1 self-center flex items-center gap-1.5"><Layers className="h-4 w-4 text-accent" />Districts:</span>
                {e.subCommunities.map((s, i) => <span key={i} className="rounded-lg bg-muted/60 border border-border/50 px-3 py-1.5 text-sm text-foreground">{s}</span>)}
              </div>
            ) : null}
          </section>
        )}

        {/* ===== Featured off-plan launches ===== */}
        {projects.length > 0 && (
          <section id="projects" className="scroll-mt-28">
            <SecHead eyebrow={`Off-plan projects · ${counts.projects} available`} title={sh.projects || `Featured launches in ${name}`} />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {projects.slice(0, 6).map((p) => <ProjectCard key={p.slug || p.name} p={p} />)}
            </div>
            {counts.projects > 6 && (
              <Link href={lp(locale, `/search?status=Off-Plan&intent=off-plan&locations=${encodeURIComponent(name)}`)} className="inline-flex items-center gap-2 mt-7 rounded-xl border border-border px-5 py-3 text-sm font-semibold text-foreground hover:border-primary/40 transition-colors">
                View all {counts.projects} projects <ChevronRight className="h-4 w-4" />
              </Link>
            )}
          </section>
        )}

        {/* ===== Secondary inventory ===== */}
        {(forSale.length > 0 || forRent.length > 0) && (
          <section className="scroll-mt-28 grid lg:grid-cols-2 gap-10">
            {forSale.length > 0 && (
              <div>
                <SecHead eyebrow="Resale market" title={`For sale in ${name}`} />
                <div className="grid sm:grid-cols-2 gap-5">{forSale.slice(0, 4).map((l) => <ListingCard key={l.slug} l={l} />)}</div>
                <Link href={lp(locale, `/search?status=Secondary&intent=buy&locations=${encodeURIComponent(name)}`)} className="inline-flex items-center gap-1.5 mt-5 text-sm font-semibold text-primary hover:underline">View all {counts.forSale} for sale <ChevronRight className="h-4 w-4" /></Link>
              </div>
            )}
            {forRent.length > 0 && (
              <div>
                <SecHead eyebrow="Rental market" title={`For rent in ${name}`} />
                <div className="grid sm:grid-cols-2 gap-5">{forRent.slice(0, 4).map((l) => <ListingCard key={l.slug} l={l} />)}</div>
                <Link href={lp(locale, `/search?status=Secondary&intent=rent&locations=${encodeURIComponent(name)}`)} className="inline-flex items-center gap-1.5 mt-5 text-sm font-semibold text-primary hover:underline">View all {counts.forRent} for rent <ChevronRight className="h-4 w-4" /></Link>
              </div>
            )}
          </section>
        )}

        {/* ===== Investment outlook ===== */}
        {(e.investmentNote || developers.length > 0) && (
          <section id="invest" className="scroll-mt-28 rounded-3xl bg-primary text-primary-foreground p-6 sm:p-12" style={{ background: "linear-gradient(135deg, #0B3D2E, #12503B)" }}>
            <span className="inline-block text-[11px] font-bold uppercase tracking-[0.18em] text-accent mb-3">Investment outlook</span>
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 max-w-2xl leading-tight">{sh.investment || `Why invest in ${name}`}</h2>
            {e.investmentNote && <p className="text-primary-foreground/80 leading-relaxed max-w-2xl mb-8">{e.investmentNote}</p>}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-px rounded-2xl overflow-hidden bg-white/10 border border-white/15 mb-8">
              <div className="bg-white/5 px-5 py-5"><div className="text-2xl font-bold text-accent">{counts.projects}</div><div className="text-[11px] uppercase tracking-wider text-primary-foreground/60 mt-1">Off-plan projects</div></div>
              {priceFrom && <div className="bg-white/5 px-5 py-5"><div className="text-2xl font-bold text-accent">{priceFrom}</div><div className="text-[11px] uppercase tracking-wider text-primary-foreground/60 mt-1">Starting price</div></div>}
              {developers.length > 0 && <div className="bg-white/5 px-5 py-5"><div className="text-2xl font-bold text-accent">{developers.length}+</div><div className="text-[11px] uppercase tracking-wider text-primary-foreground/60 mt-1">Active developers</div></div>}
              <div className="bg-white/5 px-5 py-5"><div className="text-2xl font-bold text-accent">2007</div><div className="text-[11px] uppercase tracking-wider text-primary-foreground/60 mt-1">Binayah since</div></div>
            </div>
            <a href={WA} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold text-accent-foreground transition-transform hover:scale-[1.02]" style={{ background: "linear-gradient(135deg, #D4A847, #B8922F)" }}>
              <TrendingUp className="h-4 w-4" /> Speak to an investment advisor
            </a>
            {developers.length > 0 && (
              <div className="mt-8 pt-8 border-t border-white/15">
                <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-primary-foreground/50 mb-3 flex items-center gap-2"><Landmark className="h-4 w-4" />Developers active here</p>
                <div className="flex flex-wrap gap-2">
                  {developers.map((d) => <Link key={d} href={lp(locale, `/developers/${projSlug(d)}`)} className="rounded-lg bg-white/10 hover:bg-white/20 px-3 py-1.5 text-sm text-white transition-colors">{d}</Link>)}
                </div>
              </div>
            )}
          </section>
        )}

        {/* ===== Good to know (FAQs) ===== */}
        {e.faqs?.length ? (
          <section id="faqs" className="scroll-mt-28">
            <SecHead eyebrow="Frequently asked questions" title={sh.faqs || "Good to know"} />
            <div className="space-y-3 max-w-3xl">
              {e.faqs.map((f, i) => (
                <details key={i} className="group bg-card rounded-2xl border border-border/50 p-5">
                  <summary className="font-semibold text-foreground cursor-pointer list-none flex items-center justify-between gap-4">{f.q}<ChevronRight className="h-4 w-4 text-muted-foreground group-open:rotate-90 transition-transform flex-shrink-0" /></summary>
                  <p className="text-muted-foreground mt-3 leading-relaxed">{f.a}</p>
                </details>
              ))}
            </div>
          </section>
        ) : null}

        {/* ===== Communities you may like ===== */}
        {nearby.length > 0 && (
          <section className="scroll-mt-28">
            <SecHead eyebrow="Explore nearby" title={sh.nearby || "Communities you may like"} />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {nearby.map((n) => (
                <Link key={n.slug} href={lp(locale, `/communities/${n.slug}`)} className="group relative rounded-xl overflow-hidden aspect-[4/3] border border-border/50">
                  <ImageWithFallback src={n.featuredImage || IMAGE_PLACEHOLDER} alt={n.name} fill sizes="(max-width:768px) 50vw, 16vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <span className="absolute bottom-2 left-2 right-2 text-white text-xs font-semibold leading-tight">{n.name}</span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ===== Final CTA band ===== */}
      <section className="relative overflow-hidden py-16 sm:py-20" style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">Ready to invest in {name}?</h2>
          <p className="text-white/75 max-w-xl mx-auto mb-8">Our advisors have been matching clients with the right {name} homes and off-plan opportunities since 2007. Let&apos;s find yours.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a href={WA} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold text-accent-foreground transition-transform hover:scale-[1.02]" style={{ background: "linear-gradient(135deg, #D4A847, #B8922F)" }}>
              <Phone className="h-4 w-4" /> Book a free consultation
            </a>
            <Link href={lp(locale, `/search?locations=${encodeURIComponent(name)}`)} className="inline-flex items-center gap-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/25 px-6 py-3.5 text-sm font-semibold text-white hover:bg-white/20 transition-colors">
              Browse all {name} listings <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
