import DeveloperDetailClient from "@/app/_clients/developers/[slug]/DeveloperDetailClient";
import { notFound } from "next/navigation";
import { getDeveloper } from "@/lib/api";
import type { Metadata } from "next";
import { canonical, altLangs } from "@/lib/site";

export const revalidate = 3600;

interface Props {
  params: Promise<{ slug: string; locale: string }>;
}

// Locale-specific title/description templates. The developer name is a proper
// noun (Emaar, DAMAC…) kept verbatim, wrapped in a translated phrase so every
// locale URL carries a genuinely localized <title>/<meta> even though the body
// data is English. Self-referencing canonical + hreflang for all 7 locales.
const DEV_META: Record<
  string,
  { title: (n: string) => string; desc: (n: string) => string; og: (n: string) => string }
> = {
  en: {
    title: (n) => `${n} Projects Dubai | Binayah Properties`,
    desc: (n) => `Explore off-plan and ready projects by ${n} in Dubai. Find prices, payment plans and investment opportunities with Binayah Properties.`,
    og: (n) => `Browse all ${n} projects in Dubai.`,
  },
  fr: {
    title: (n) => `Projets ${n} à Dubaï | Binayah Properties`,
    desc: (n) => `Découvrez les projets sur plan et livrés de ${n} à Dubaï. Prix, plans de paiement et opportunités d'investissement avec Binayah Properties.`,
    og: (n) => `Parcourez tous les projets ${n} à Dubaï.`,
  },
  ru: {
    title: (n) => `Проекты ${n} в Дубае | Binayah Properties`,
    desc: (n) => `Проекты ${n} в Дубае — на стадии строительства и готовые. Цены, планы оплаты и инвестиционные возможности с Binayah Properties.`,
    og: (n) => `Все проекты ${n} в Дубае.`,
  },
  ar: {
    title: (n) => `مشاريع ${n} في دبي | بناية للعقارات`,
    desc: (n) => `اكتشف مشاريع ${n} على الخارطة والجاهزة في دبي. الأسعار وخطط السداد وفرص الاستثمار مع بناية للعقارات.`,
    og: (n) => `تصفّح جميع مشاريع ${n} في دبي.`,
  },
  zh: {
    title: (n) => `${n} 迪拜项目 | Binayah Properties`,
    desc: (n) => `探索 ${n} 在迪拜的期房与现房项目。查看价格、付款计划及投资机会，尽在 Binayah Properties。`,
    og: (n) => `浏览 ${n} 在迪拜的所有项目。`,
  },
  vi: {
    title: (n) => `Dự án ${n} tại Dubai | Binayah Properties`,
    desc: (n) => `Khám phá các dự án off-plan và bàn giao của ${n} tại Dubai. Giá, kế hoạch thanh toán và cơ hội đầu tư cùng Binayah Properties.`,
    og: (n) => `Xem tất cả dự án ${n} tại Dubai.`,
  },
  he: {
    title: (n) => `פרויקטים של ${n} בדובאי | Binayah Properties`,
    desc: (n) => `גלו את הפרויקטים על הנייר והמוכנים של ${n} בדובאי. מחירים, תוכניות תשלום והזדמנויות השקעה עם Binayah Properties.`,
    og: (n) => `עיינו בכל הפרויקטים של ${n} בדובאי.`,
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params;
  const data = await getDeveloper(slug);
  if (!data?.developer) return { title: "Developer Not Found" };
  const { developer } = data;
  const name = developer.name as string;
  // A developer page with no description and no projects is blank boilerplate.
  // Return 404 so Google drops the URL rather than parking it as noindex.
  const hasContent = !!(
    (developer.description && String(developer.description).trim()) ||
    (Array.isArray(data.projects) && data.projects.length > 0)
  );
  if (!hasContent) notFound();
  const m = DEV_META[locale] ?? DEV_META.en;
  return {
    title: m.title(name),
    description: m.desc(name),
    alternates: {
      canonical: canonical(locale, `/developers/${slug}`),
      languages: altLangs(`/developers/${slug}`),
    },
    openGraph: {
      title: m.title(name),
      description: m.og(name),
      url: canonical(locale, `/developers/${slug}`),
      type: "website",
      ...(developer.logo ? { images: [developer.logo as string] } : {}),
    },
  };
}

export default async function DeveloperDetailPage({ params }: Props) {
  const { slug } = await params;

  const data = await getDeveloper(slug);

  if (!data || !data.developer) return notFound();

  const { developer, projects } = data;

  return (
    <DeveloperDetailClient
      developer={developer}
      projects={projects || []}
    />
  );
}
