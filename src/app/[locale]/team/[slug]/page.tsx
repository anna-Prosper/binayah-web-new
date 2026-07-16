/* eslint-disable i18next/no-literal-string -- team pages render English agent data (names, bios) with English UI labels */
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Breadcrumbs from "@/components/Breadcrumbs";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Mail, Phone, MessageCircle, ShieldCheck, Globe, MapPin } from "lucide-react";
import type { Metadata } from "next";
import { canonical, altLangs, OG_LOCALE } from "@/lib/site";
import { PersonJsonLd, BreadcrumbJsonLd } from "@/components/JsonLd";
import { getAgent, bioText, hasRealLicense, isPublishableAgent, type Agent } from "@/lib/agents";
import { waHref } from "@/lib/whatsapp";

export const revalidate = 3600;

// ISR-eligible; locale matrix handled by the layout's generateStaticParams.
export function generateStaticParams() {
  return [];
}

interface Props {
  params: Promise<{ slug: string; locale: string }>;
}

const SITE = "https://www.binayah.ae";

// Fallback role label + description template per locale. The agent name is a
// proper noun kept verbatim; the surrounding phrasing is localized so each
// locale URL carries a genuinely localized <title>/<meta>. When a real bio
// exists it is used as-is (already authored in English).
const AGENT_META: Record<
  string,
  { role: string; desc: (name: string, role: string) => string }
> = {
  en: { role: "Real Estate Agent", desc: (n, r) => `${n}, ${r}Dubai real estate agent at Binayah Properties. Contact for buying, selling, renting and investing in Dubai property.` },
  fr: { role: "Agent immobilier", desc: (n, r) => `${n}, ${r}agent immobilier à Dubaï chez Binayah Properties. Contactez-le pour acheter, vendre, louer et investir dans l'immobilier à Dubaï.` },
  ru: { role: "Агент по недвижимости", desc: (n, r) => `${n}, ${r}агент по недвижимости в Дубае в Binayah Properties. Свяжитесь для покупки, продажи, аренды и инвестиций в недвижимость Дубая.` },
  ar: { role: "وكيل عقاري", desc: (n, r) => `${n}، ${r}وكيل عقاري في دبي لدى بناية للعقارات. تواصل معه للشراء والبيع والتأجير والاستثمار في عقارات دبي.` },
  zh: { role: "房地产经纪人", desc: (n, r) => `${n}，${r}Binayah Properties 迪拜房地产经纪人。买房、卖房、租房及投资迪拜房产，欢迎联系。` },
  vi: { role: "Chuyên viên BĐS", desc: (n, r) => `${n}, ${r}chuyên viên bất động sản Dubai tại Binayah Properties. Liên hệ để mua, bán, cho thuê và đầu tư BĐS Dubai.` },
  he: { role: "סוכן נדל\"ן", desc: (n, r) => `${n}, ${r}סוכן נדל\"ן בדובאי ב-Binayah Properties. צרו קשר לקנייה, מכירה, השכרה והשקעה בנדל\"ן בדובאי.` },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params;
  const agent = await getAgent(slug);
  if (!agent) return { title: "Agent Not Found | Binayah Properties" };
  const bio = bioText(agent.bio);
  const meta = AGENT_META[locale] ?? AGENT_META.en;
  const position = agent.position || meta.role;
  const role = agent.position ? `${agent.position}, ` : "";
  const title = `${agent.name} | ${position} | Binayah Properties`;
  const description = bio ? bio.slice(0, 155) : meta.desc(agent.name, role);
  return {
    title,
    description,
    // Thin profiles (no real bio + BRN) stay crawlable (follow) but noindex
    // until the real data lands, so we don't publish boilerplate pages.
    ...(isPublishableAgent(agent) ? {} : { robots: { index: false as const, follow: true } }),
    alternates: { canonical: canonical(locale, `/team/${slug}`), languages: altLangs(`/team/${slug}`) },
    openGraph: {
      title,
      description,
      url: canonical(locale, `/team/${slug}`),
      type: "profile",
      locale: OG_LOCALE[locale] ?? "en_AE",
      images: agent.photo ? [{ url: agent.photo }] : undefined,
    },
  };
}

function contactPhone(a: Agent): string | undefined {
  const m = (a.mobile || "").trim();
  return m || undefined;
}

export default async function AgentPage({ params }: Props) {
  const { slug, locale } = await params;
  const agent = await getAgent(slug);
  if (!agent) notFound();

  const lp = locale === "en" ? "" : `/${locale}`;
  const AL: Record<string, { email: string; about: string; specialties: string; browse: string; back: string }> = {
    en: { email: "Email", about: "About", specialties: "Specialties", browse: "Browse properties for sale", back: "← All team members" },
    fr: { email: "E-mail", about: "À propos", specialties: "Spécialités", browse: "Parcourir les biens à vendre", back: "← Tous les membres de l'équipe" },
    ru: { email: "Эл. почта", about: "О консультанте", specialties: "Специализация", browse: "Смотреть объекты на продажу", back: "← Все члены команды" },
    ar: { email: "البريد الإلكتروني", about: "نبذة", specialties: "التخصصات", browse: "تصفح العقارات المعروضة للبيع", back: "→ جميع أعضاء الفريق" },
    zh: { email: "邮箱", about: "简介", specialties: "专长", browse: "浏览待售房源", back: "← 所有团队成员" },
    vi: { email: "Email", about: "Giới thiệu", specialties: "Chuyên môn", browse: "Xem bất động sản đang bán", back: "← Tất cả thành viên" },
    he: { email: "אימייל", about: "אודות", specialties: "התמחויות", browse: "עיון בנכסים למכירה", back: "→ כל חברי הצוות" },
  };
  const AGL = AL[locale] ?? AL.en;
  const bio = bioText(agent.bio);
  const phone = contactPhone(agent);
  const sameAs = [agent.social?.linkedin, agent.social?.instagram, agent.social?.facebook, agent.social?.twitter].filter(
    (u): u is string => !!u && /^https?:\/\//.test(u)
  );
  const crumbs = [
    { label: locale === "fr" ? "Notre équipe" : locale === "ru" ? "Наша команда" : locale === "ar" ? "فريقنا" : locale === "zh" ? "我们的团队" : locale === "vi" ? "Đội ngũ của chúng tôi" : locale === "he" ? "הצוות שלנו" : "Our Team", href: `${lp}/team` },
    { label: agent.name, href: `${lp}/team/${slug}` },
  ];
  const waMsg = `Hi, I'd like to speak with ${agent.name} about Dubai property.`;
  // Home → Our Team → {agent.name}. Reuse the localized crumbs labels/hrefs so
  // the structured data matches the visible breadcrumb exactly.
  const homeLabel = locale === "fr" ? "Accueil" : locale === "ru" ? "Главная" : locale === "ar" ? "الرئيسية" : locale === "zh" ? "首页" : locale === "vi" ? "Trang chủ" : locale === "he" ? "בית" : "Home";
  const breadcrumbItems = [
    { name: homeLabel, href: `${lp}/` },
    ...crumbs.map((c) => ({ name: c.label, href: c.href })),
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6">
          <Breadcrumbs items={crumbs} />
        </div>

        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
          <div className="grid md:grid-cols-[280px_1fr] gap-6 sm:gap-10 items-start">
            {/* Photo + contact */}
            <div className="space-y-4">
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden border border-border/60 bg-muted/30">
                {agent.photo ? (
                  <Image src={agent.photo} alt={agent.name} fill sizes="280px" className="object-cover" priority />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl font-semibold text-muted-foreground/40">
                    {agent.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <a
                  href={waHref(waMsg, undefined, agent.mobile)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  <MessageCircle className="h-4 w-4" /> WhatsApp
                </a>
                {agent.email && (
                  <a
                    href={`mailto:${agent.email}`}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted/40 transition-colors"
                  >
                    <Mail className="h-4 w-4" /> {AGL.email}
                  </a>
                )}
                {phone && (
                  <a
                    href={`tel:${phone.replace(/\s/g, "")}`}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted/40 transition-colors"
                  >
                    <Phone className="h-4 w-4" /> {phone}
                  </a>
                )}
              </div>
            </div>

            {/* Details */}
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">{agent.name}</h1>
              {agent.position && <p className="mt-1 text-base text-primary font-medium">{agent.position}</p>}

              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                {hasRealLicense(agent) && (
                  <span className="inline-flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-primary" /> RERA BRN {agent.license}
                  </span>
                )}
                {agent.languages && agent.languages.length > 0 && (
                  <span className="inline-flex items-center gap-1.5">
                    <Globe className="h-4 w-4" /> {agent.languages.join(", ")}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" /> Dubai, UAE
                </span>
              </div>

              {bio && (
                <div className="mt-6">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground/80 mb-2">{AGL.about}</h2>
                  <p className="text-sm sm:text-base text-foreground/90 leading-relaxed whitespace-pre-line">{bio}</p>
                </div>
              )}

              {agent.specialties && (
                <div className="mt-6">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground/80 mb-2">{AGL.specialties}</h2>
                  <p className="text-sm sm:text-base text-foreground/90 leading-relaxed">{agent.specialties}</p>
                </div>
              )}

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href={`${lp}/buy`}
                  className="inline-flex items-center rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/40 transition-colors"
                >
                  {AGL.browse}
                </Link>
                <Link
                  href={`${lp}/team`}
                  className="inline-flex items-center rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/40 transition-colors"
                >
                  {AGL.back}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />

      <PersonJsonLd
        name={agent.name}
        url={`${SITE}${lp}/team/${slug}`}
        jobTitle={agent.position}
        image={agent.photo}
        email={agent.email}
        telephone={phone}
        description={bio || undefined}
        languages={agent.languages}
        brn={hasRealLicense(agent) ? agent.license : undefined}
        sameAs={sameAs.length ? sameAs : undefined}
      />
      <BreadcrumbJsonLd items={breadcrumbItems} />
    </div>
  );
}