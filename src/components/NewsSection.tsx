import { ArrowUpRight, Calendar } from "lucide-react";
import Link from "next/link";
import ImageWithFallback from "@/components/ImageWithFallback";
import { getTranslations } from "next-intl/server";

const FALLBACK_ARTICLES = [
  { slug: "best-offplan-under-2m", title: "Best Off-Plan Under AED 2 Million, Golden Visa Eligible", date: "9 Feb 2026", category: "Investment", image: "/assets/dubai-hero.webp" },
  { slug: "tax-benefits-dubai-property", title: "Tax Benefits of Owning Property in Dubai, The Complete Picture", date: "7 Feb 2026", category: "Guides", image: "/assets/dubai-hero.webp" },
  { slug: "dubai-property-investment-2026", title: "Is Dubai Property a Good Investment in 2026?", date: "7 Feb 2026", category: "Market Insights", image: "/assets/dubai-hero.webp" },
];

interface Article {
  _id: string;
  title: string;
  slug: string;
  category?: string;
  featuredImage?: string;
  publishedAt?: string;
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "";
  try { return new Date(dateStr).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }); }
  catch { return dateStr; }
}

// Server Component: real crawlable HTML, zero client JS. Former framer-motion
// entrance animations were decorative and are dropped. ImageWithFallback stays
// a client leaf (renders its <img> server-side, hydrates only the onError
// fallback). Rendered server-side via a slot in page.tsx (not gated by LazyMount).
export default async function NewsSection({ articles: propArticles = [], locale }: { articles?: Article[]; locale: string }) {
  const t = await getTranslations({ locale, namespace: "home.sections.news" });
  const articles = (propArticles.length > 0 ? propArticles : FALLBACK_ARTICLES.map((a, i) => ({
    _id: String(i), title: a.title, slug: a.slug, category: a.category,
    featuredImage: a.image, publishedAt: a.date
  }))).slice(0, 3);
  return (
  <section id="news" className="py-12 sm:py-24 bg-card scroll-mt-20">
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      {/* Mobile: compact inline header */}
      <div className="sm:hidden flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-foreground">{t("title")}</h2>
        <Link href="/news" className="group flex items-center gap-1 text-primary font-semibold text-xs">
          {t("viewAll")} <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Desktop: centered header with View All */}
      <div className="hidden sm:block text-center mb-14 relative">
        <div className="h-[2px] mx-auto mb-6 w-12" style={{ background: "linear-gradient(90deg, #D4A847, #B8922F)" }} />
        <p className="font-semibold tracking-[0.4em] uppercase text-xs mb-4" style={{ color: "#D4A847" }}>{t("blog")}</p>
        <h2 className="text-4xl lg:text-5xl font-bold text-foreground">
          {t("title")}
        </h2>
        <Link href="/news" className="group absolute right-0 bottom-0 flex items-center gap-2 text-primary font-semibold text-sm hover:gap-3 transition-all">
          {t("viewAll")} <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Mobile: swipable horizontal cards */}
      <div className="sm:hidden -mx-4 px-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide flex gap-3 pb-2">
        {articles.map((a) => (
          <div key={a.slug} className="flex-shrink-0 w-[260px] snap-start">
            <Link href={`/news/${a.slug}`} className="group block bg-card rounded-xl overflow-hidden border border-border/50">
              <div className="relative overflow-hidden aspect-[16/10]">
                <ImageWithFallback src={a.featuredImage || "/assets/dubai-hero.webp"} alt={a.title} fill sizes="260px" className="object-cover" />
                <span className="absolute top-2 left-2 text-[8px] font-bold px-1.5 py-0.5 rounded text-white uppercase tracking-wider" style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}>{a.category}</span>
              </div>
              <div className="p-3">
                <p className="text-[9px] text-muted-foreground flex items-center gap-1 mb-1"><Calendar className="h-2.5 w-2.5" /> {formatDate(a.publishedAt) || (a as any).date}</p>
                <h3 className="font-bold text-foreground text-xs leading-snug line-clamp-2">{a.title}</h3>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* Desktop grid */}
      <div className="hidden sm:grid md:grid-cols-3 gap-7">
        {articles.map((a) => (
          <div key={a.slug}>
            <Link href={`/news/${a.slug}`} className="group block bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-border/50 hover:border-primary/20 h-full">
              <div className="relative overflow-hidden aspect-[16/10]">
                <ImageWithFallback src={a.featuredImage || "/assets/dubai-hero.webp"} alt={a.title} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover group-hover:scale-110 transition-transform duration-700" />
                <span className="absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-lg text-white uppercase tracking-wider" style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}>{a.category}</span>
              </div>
              <div className="p-6">
                <p className="text-xs text-muted-foreground flex items-center gap-1.5 mb-3"><Calendar className="h-3 w-3" /> {formatDate(a.publishedAt) || (a as any).date}</p>
                <h3 className="font-bold text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2">{a.title}</h3>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  </section>
  );
}
