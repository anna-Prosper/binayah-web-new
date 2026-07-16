/* eslint-disable i18next/no-literal-string -- team pages render English agent data (names, bios) with English UI labels */
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Breadcrumbs from "@/components/Breadcrumbs";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { canonical, altLangs, OG_LOCALE, DEFAULT_OG_IMAGE } from "@/lib/site";
import { getAgents } from "@/lib/agents";

export const revalidate = 3600;

// ISR-eligible (see the other [slug] routes). The locale matrix is handled by
// the layout's generateStaticParams.
export function generateStaticParams() {
  return [];
}

interface Props {
  params: Promise<{ locale: string }>;
}

const TEAM_META: Record<string, { title: string; description: string }> = {
  en: {
    title: "Our Team | RERA-Certified Dubai Property Experts | Binayah",
    description: "Meet the Binayah Properties team — RERA-certified real estate agents helping you buy, sell, rent and invest in Dubai since 2007.",
  },
  fr: {
    title: "Notre équipe | Experts immobiliers certifiés RERA à Dubaï | Binayah",
    description: "Rencontrez l'équipe Binayah Properties — des agents immobiliers certifiés RERA qui vous aident à acheter, vendre, louer et investir à Dubaï depuis 2007.",
  },
  ru: {
    title: "Наша команда | Сертифицированные RERA эксперты по недвижимости Дубая | Binayah",
    description: "Познакомьтесь с командой Binayah Properties — сертифицированные RERA агенты помогают покупать, продавать, арендовать и инвестировать в недвижимость Дубая с 2007 года.",
  },
  ar: {
    title: "فريقنا | خبراء عقارات دبي المعتمدون من RERA | بناية",
    description: "تعرّف على فريق بناية للعقارات — وكلاء عقاريون معتمدون من RERA يساعدونك في شراء وبيع وتأجير والاستثمار في عقارات دبي منذ 2007.",
  },
  zh: {
    title: "我们的团队 | RERA 认证迪拜房产专家 | Binayah",
    description: "认识 Binayah Properties 团队——自 2007 年起，RERA 认证房产顾问助您在迪拜买房、卖房、租房与投资。",
  },
  vi: {
    title: "Đội ngũ của chúng tôi | Chuyên gia BĐS Dubai được RERA chứng nhận | Binayah",
    description: "Gặp gỡ đội ngũ Binayah Properties — các chuyên viên BĐS được RERA chứng nhận, hỗ trợ bạn mua, bán, cho thuê và đầu tư tại Dubai từ năm 2007.",
  },
  he: {
    title: "הצוות שלנו | מומחי נדל\"ן בדובאי בהסמכת RERA | Binayah",
    description: "הכירו את צוות Binayah Properties — סוכני נדל\"ן מוסמכי RERA שמסייעים לכם לקנות, למכור, לשכור ולהשקיע בנדל\"ן בדובאי משנת 2007.",
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const { title, description } = TEAM_META[locale] ?? TEAM_META.en;
  return {
    title,
    description,
    alternates: { canonical: canonical(locale, "/team"), languages: altLangs("/team") },
    openGraph: {
      title,
      description,
      url: canonical(locale, "/team"),
      type: "website",
      locale: OG_LOCALE[locale] ?? "en_AE",
      images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630 }],
    },
  };
}

export default async function TeamPage({ params }: Props) {
  const { locale } = await params;
  const lp = locale === "en" ? "" : `/${locale}`;
  const agents = await getAgents();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
          <Breadcrumbs items={[{ label: "Our Team", href: `${lp}/team` }]} />
        </div>

        <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">Meet the Binayah team</h1>
          <p className="mt-3 max-w-2xl text-sm sm:text-base text-muted-foreground leading-relaxed">
            RERA-certified property consultants who have helped clients buy, sell, rent and invest across Dubai
            since 2007. Get matched with a specialist for your area and budget.
          </p>
        </section>

        <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {agents.map((a) => (
              <Link
                key={a.slug}
                href={`${lp}/team/${a.slug}`}
                className="group rounded-2xl border border-border/60 bg-card overflow-hidden hover:border-primary/40 hover:shadow-lg transition-all"
              >
                <div className="relative aspect-[4/5] bg-muted/30 overflow-hidden">
                  {a.photo ? (
                    <Image
                      src={a.photo}
                      alt={a.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl font-semibold text-muted-foreground/40">
                      {a.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="p-3 sm:p-4">
                  <h2 className="font-semibold text-sm sm:text-base text-foreground leading-tight group-hover:text-primary transition-colors">
                    {a.name}
                  </h2>
                  {a.position && <p className="mt-0.5 text-xs sm:text-sm text-muted-foreground">{a.position}</p>}
                  {a.languages && a.languages.length > 0 && (
                    <p className="mt-2 text-[11px] text-muted-foreground/70">{a.languages.join(" · ")}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
          {agents.length === 0 && (
            <p className="text-sm text-muted-foreground">Our team directory is being updated. Please check back shortly.</p>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}