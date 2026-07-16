/* eslint-disable i18next/no-literal-string */
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PulseEmirateNav from "@/components/PulseEmirateNav";
import WeeklySubscribeForm from "@/components/WeeklySubscribeForm";
import ImageWithFallback from "@/components/ImageWithFallback";
import { Link } from "@/navigation";
import { serverApiUrl, serverFetch } from "@/lib/api";
import { canonical, altLangs, OG_LOCALE, DEFAULT_OG_IMAGE } from "@/lib/site";
import { FileText, ArrowRight, Calendar } from "lucide-react";

export const revalidate = 3600;

interface Props { params: Promise<{ locale: string }> }

const TITLES: Record<string, string> = {
  en: "Dubai Market Reports — Weekly Property Insights | Binayah Properties",
  fr: "Rapports de marché Dubaï — Analyses immobilières hebdomadaires | Binayah Properties",
  ru: "Отчёты по рынку Дубая — еженедельная аналитика недвижимости | Binayah Properties",
  ar: "تقارير سوق دبي — رؤى عقارية أسبوعية | بناية للعقارات",
  zh: "迪拜市场报告 — 每周房产洞察 | Binayah Properties",
  vi: "Báo cáo thị trường Dubai — Thông tin bất động sản hàng tuần | Binayah Properties",
  he: 'דוחות שוק דובאי — תובנות נדל"ן שבועיות | Binayah Properties',
};
const DESCRIPTIONS: Record<string, string> = {
  en: "Binayah's weekly Dubai property market report: top-moving communities, rental yields, new project launches and the numbers that matter for buyers and investors.",
  fr: "Le rapport hebdomadaire de Binayah sur le marché immobilier de Dubaï : communautés les plus dynamiques, rendements locatifs, lancements de projets et les chiffres qui comptent pour acheteurs et investisseurs.",
  ru: "Еженедельный отчёт Binayah по рынку недвижимости Дубая: самые активные районы, доходность аренды, запуски новых проектов и цифры, важные для покупателей и инвесторов.",
  ar: "تقرير بناية الأسبوعي عن سوق العقارات في دبي: المجتمعات الأكثر حركة، عوائد الإيجار، إطلاق المشاريع الجديدة والأرقام المهمة للمشترين والمستثمرين.",
  zh: "Binayah 每周迪拜房产市场报告：热门社区、租金收益率、新项目发布，以及买家和投资者关注的关键数据。",
  vi: "Báo cáo hàng tuần của Binayah về thị trường bất động sản Dubai: các cộng đồng sôi động nhất, lợi suất cho thuê, dự án mới ra mắt và những con số quan trọng với người mua và nhà đầu tư.",
  he: 'הדוח השבועי של Binayah על שוק הנדל"ן בדובאי: השכונות המובילות, תשואות שכירות, השקות פרויקטים חדשים והמספרים שחשובים לרוכשים ולמשקיעים.',
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const TITLE = TITLES[locale] ?? TITLES.en;
  const DESCRIPTION = DESCRIPTIONS[locale] ?? DESCRIPTIONS.en;
  return {
    title: TITLE,
    description: DESCRIPTION,
    alternates: { canonical: canonical(locale, "/pulse/reports"), languages: altLangs("/pulse/reports") },
    openGraph: {
      title: TITLE,
      description: DESCRIPTION,
      url: canonical(locale, "/pulse/reports"),
      type: "website",
      locale: OG_LOCALE[locale] ?? "en_AE",
      images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630 }],
    },
  };
}

interface ReportCard {
  slug: string;
  title: string;
  excerpt?: string;
  featuredImage?: string;
  publishedAt?: string;
  readTime?: string;
}

function fmtDate(d?: string, locale = "en"): string {
  if (!d) return "";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "";
  return date.toLocaleDateString(locale === "en" ? "en-GB" : locale, { day: "numeric", month: "short", year: "numeric" });
}

export default async function ReportsPage({ params }: Props) {
  const { locale } = await params;
  let reports: ReportCard[] = [];
  try {
    const res = await serverFetch(serverApiUrl(`/api/news?category=Weekly%20Report&lang=${locale}&limit=60`));
    if (res.ok) reports = await res.json();
  } catch (err) {
    console.warn("[ReportsPage] API unavailable:", (err as Error).message);
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <PulseEmirateNav />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-6">
        <div className="flex items-center gap-2 text-[11px] font-bold tracking-[0.2em] uppercase text-accent-foreground">
          <FileText className="h-3.5 w-3.5" style={{ color: "#B8922F" }} />
          <span style={{ color: "#B8922F" }}>Market Reports</span>
        </div>
        <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Dubai property market, week by week
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground leading-relaxed">
          Our weekly read on Dubai real estate — top-moving communities, fresh launches, and the
          data that matters for buyers and investors. Delivered here and straight to your inbox.
        </p>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-14">
        {reports.length === 0 ? (
          <p className="text-muted-foreground py-16 text-center">The first weekly report is on its way — check back soon.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((r) => (
              <Link
                key={r.slug}
                href={`/pulse/reports/${r.slug}`}
                locale={locale}
                className="group flex flex-col h-full bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-border/50 hover:border-primary/20"
              >
                <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                  <ImageWithFallback
                    src={r.featuredImage || "/assets/dubai-hero.webp"}
                    alt={r.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <span
                    className="absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-lg text-white uppercase tracking-wider"
                    style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
                  >
                    Market Report
                  </span>
                </div>
                <div className="flex flex-col flex-1 p-5">
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground mb-2">
                    <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" />{fmtDate(r.publishedAt, locale)}</span>
                    {r.readTime && <span>· {r.readTime}</span>}
                  </div>
                  <h2 className="text-base font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
                    {r.title}
                  </h2>
                  {r.excerpt && <p className="mt-2 text-sm text-muted-foreground line-clamp-3 flex-1">{r.excerpt}</p>}
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                    Read report <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-20">
        <WeeklySubscribeForm source="pulse-reports" variant="card" />
      </section>

      <Footer />
    </div>
  );
}
