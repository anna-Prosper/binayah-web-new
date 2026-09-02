/* eslint-disable i18next/no-literal-string -- team pages render English agent data (names, bios) with English UI labels */
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Breadcrumbs from "@/components/Breadcrumbs";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { MessageCircle, Phone, Mail, Globe } from "lucide-react";
import { canonical, altLangs, OG_LOCALE, DEFAULT_OG_IMAGE } from "@/lib/site";
import { getAgents } from "@/lib/agents";
import { waHref } from "@/lib/whatsapp";
import { SUPPORT_TEAM } from "@/lib/support-team";

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
    title: "Real Estate Agents in Dubai | RERA-Certified Binayah Team",
    description: "Browse Binayah's RERA-certified real estate agents in Dubai — photo, languages and direct contact on every profile. Dubai property brokers since 2007.",
  },
  fr: {
    title: "Agents immobiliers à Dubaï | Équipe Binayah certifiée RERA",
    description: "Découvrez les agents immobiliers de Binayah à Dubaï — conseillers certifiés RERA, avec photo, langues et contact direct sur chaque profil. Courtiers depuis 2007.",
  },
  ru: {
    title: "Агенты по недвижимости в Дубае | Команда Binayah (RERA)",
    description: "Каталог агентов по недвижимости Binayah в Дубае — сертифицированные RERA консультанты: фото, языки и прямые контакты в каждом профиле. Брокеры Дубая с 2007 года.",
  },
  ar: {
    title: "وكلاء عقارات في دبي | فريق بناية المعتمد من RERA",
    description: "تصفّح وكلاء العقارات في دبي لدى بناية — مستشارون معتمدون من RERA، مع صورة ولغات وتواصل مباشر في كل ملف. وسطاء عقاريون في دبي منذ 2007.",
  },
  zh: {
    title: "迪拜房产经纪人 | RERA 认证的 Binayah 团队",
    description: "浏览 Binayah 的迪拜房产经纪人名录——RERA 认证顾问，每份资料均附照片、语言与直接联系方式。自 2007 年起深耕迪拜市场。",
  },
  vi: {
    title: "Môi giới bất động sản tại Dubai | Đội ngũ Binayah chuẩn RERA",
    description: "Danh bạ môi giới bất động sản tại Dubai của Binayah — chuyên viên được RERA chứng nhận, mỗi hồ sơ có ảnh, ngôn ngữ và liên hệ trực tiếp. Hoạt động từ 2007.",
  },
  he: {
    title: "סוכני נדל\"ן בדובאי | צוות Binayah בהסמכת RERA",
    description: "מדריך סוכני הנדל\"ן של Binayah בדובאי — יועצים מוסמכי RERA, לכל פרופיל תמונה, שפות ויצירת קשר ישירה. מתווכים בדובאי משנת 2007.",
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

// `intro` frames who the team is; `intro2` answers what a directory searcher
// wants (coverage, credentials, that every profile is published). `intro2`
// deliberately says the BRN shows "where one is on file" — only some
// consultants have a real RERA BRN recorded (see hasRealLicense in lib/agents),
// so the page must never imply every agent publishes one.
interface TeamCopy {
  crumb: string;
  heading: string;
  intro: string;
  intro2: string;
  langLabel: string;
  compareLead: string;
  linkBrokers: string;
  linkCompanies: string;
  and: string;
  servicesLead: string;
  linkAgency: string;
  linkBroker: string;
  and2: string;
  stop: string;
  empty: string;
  salesHeading: string;
  supportHeading: string;
  supportIntro: string;
}

const TEAM_L: Record<string, TeamCopy> = {
  en: {
    crumb: "Real Estate Agents",
    heading: "Real Estate Agents in Dubai",
    intro: "Binayah Properties is a RERA-certified Dubai brokerage, ORN 1162, working this market since 2007 — 19 years. Below is our sales team in full: the consultant you reach is the consultant who handles your deal, with photo, languages and direct WhatsApp, phone and email on every card.",
    intro2: "Between them they cover apartments, villas, townhouses and off-plan launches across Dubai's freehold communities — Downtown Dubai, Dubai Marina, Palm Jumeirah, Business Bay, Jumeirah Village Circle, Dubai Hills Estate and beyond — for buyers, sellers, landlords, tenants and investors, backed by 3,000+ active listings. Every agent has a published profile page, including their RERA broker number (BRN) where one is on file, so you can check who you are dealing with before you call.",
    langLabel: "Languages spoken across the team:",
    compareLead: "Choosing between agencies first? Read our guides to the",
    linkBrokers: "best real estate brokers in Dubai",
    linkCompanies: "best real estate companies in Dubai",
    and: " and the ",
    servicesLead: "Every consultant above works under Binayah's RERA registration, ORN 1162. More on how we operate as a",
    linkAgency: "real estate agency in Dubai",
    linkBroker: "real estate broker in Dubai",
    and2: " and as your ",
    stop: ".",
    empty: "Our team directory is being updated. Please check back shortly.",
    salesHeading: "Our property agents in Dubai",
    supportHeading: "Operations & Support",
    supportIntro: "The people behind the scenes keeping every deal, viewing and handover running smoothly.",
  },
  fr: {
    crumb: "Agents immobiliers",
    heading: "Agents immobiliers à Dubaï",
    intro: "Binayah Properties est une agence immobilière de Dubaï certifiée RERA (ORN 1162), active sur ce marché depuis 2007, soit 19 ans. Voici notre équipe commerciale au complet : le conseiller que vous contactez est celui qui suivra votre dossier, avec photo, langues parlées et WhatsApp, téléphone et e-mail directs sur chaque fiche.",
    intro2: "Ensemble, ils couvrent appartements, villas, maisons de ville et lancements sur plan dans les quartiers en pleine propriété de Dubaï — Downtown Dubai, Dubai Marina, Palm Jumeirah, Business Bay, Jumeirah Village Circle, Dubai Hills Estate et au-delà — pour les acheteurs, vendeurs, propriétaires, locataires et investisseurs, avec plus de 3 000 annonces actives. Chaque agent dispose d'une fiche publiée, incluant son numéro de courtier RERA (BRN) lorsqu'il figure à notre dossier, afin que vous sachiez à qui vous parlez avant d'appeler.",
    langLabel: "Langues parlées au sein de l'équipe :",
    compareLead: "Vous comparez d'abord les agences ? Consultez nos guides sur les",
    linkBrokers: "meilleurs courtiers immobiliers de Dubaï",
    linkCompanies: "meilleures agences immobilières de Dubaï",
    and: " et les ",
    servicesLead: "Chaque conseiller ci-dessus exerce sous l'enregistrement RERA de Binayah (ORN 1162). En savoir plus sur notre",
    linkAgency: "agence immobilière à Dubaï",
    linkBroker: "courtier immobilier à Dubaï",
    and2: " et sur notre rôle de ",
    stop: ".",
    empty: "Notre annuaire d'équipe est en cours de mise à jour. Merci de revenir bientôt.",
    salesHeading: "Nos agents immobiliers à Dubaï",
    supportHeading: "Opérations et support",
    supportIntro: "Les personnes en coulisses qui font que chaque transaction, visite et remise se déroule sans accroc.",
  },
  ru: {
    crumb: "Агенты по недвижимости",
    heading: "Агенты по недвижимости в Дубае",
    intro: "Binayah Properties — сертифицированное RERA агентство недвижимости в Дубае (ORN 1162), работающее на этом рынке с 2007 года, уже 19 лет. Ниже — наш отдел продаж целиком: консультант, к которому вы обратитесь, и будет вести вашу сделку. В каждой карточке — фото, языки и прямые WhatsApp, телефон и e-mail.",
    intro2: "Вместе они работают с квартирами, виллами, таунхаусами и проектами на стадии строительства во фрихолд-районах Дубая — Downtown Dubai, Dubai Marina, Palm Jumeirah, Business Bay, Jumeirah Village Circle, Dubai Hills Estate и других — для покупателей, продавцов, собственников, арендаторов и инвесторов, с более чем 3 000 активных объектов в базе. У каждого агента есть опубликованный профиль, включая номер брокера RERA (BRN), если он есть в нашей базе, — так вы можете проверить человека ещё до звонка.",
    langLabel: "Языки, на которых говорит команда:",
    compareLead: "Сначала сравниваете агентства? Прочитайте наши обзоры:",
    linkBrokers: "лучшие брокеры по недвижимости в Дубае",
    linkCompanies: "лучшие агентства недвижимости в Дубае",
    and: " и ",
    servicesLead: "Все консультанты выше работают под регистрацией RERA компании Binayah (ORN 1162). Подробнее о нас как об",
    linkAgency: "агентстве недвижимости в Дубае",
    linkBroker: "брокере по недвижимости в Дубае",
    and2: " и как о вашем ",
    stop: ".",
    empty: "Каталог нашей команды обновляется. Пожалуйста, зайдите позже.",
    salesHeading: "Наши агенты по недвижимости в Дубае",
    supportHeading: "Операции и поддержка",
    supportIntro: "Люди за кулисами, благодаря которым каждая сделка, просмотр и передача проходят гладко.",
  },
  ar: {
    crumb: "وكلاء العقارات",
    heading: "وكلاء عقارات في دبي",
    intro: "بناية للعقارات وسيط عقاري في دبي معتمد من RERA برقم ORN 1162، ويعمل في هذا السوق منذ 2007 أي 19 عامًا. في الأسفل فريق المبيعات بالكامل: المستشار الذي تتواصل معه هو نفسه من يتابع صفقتك، مع صورته ولغاته وواتساب وهاتف وبريد إلكتروني مباشر في كل بطاقة.",
    intro2: "يغطي الفريق الشقق والفلل والتاون هاوس ومشاريع على الخارطة في مجتمعات التملك الحر بدبي — وسط مدينة دبي، دبي مارينا، نخلة جميرا، الخليج التجاري، قرية جميرا الدائرية، دبي هيلز إستيت وغيرها — للمشترين والبائعين والملاك والمستأجرين والمستثمرين، مع أكثر من 3,000 عقار معروض. لكل وكيل صفحة ملف منشورة تتضمن رقم الوسيط العقاري (BRN) عند توفره لدينا، لتتحقق ممن تتعامل معه قبل الاتصال.",
    langLabel: "اللغات التي يتحدث بها الفريق:",
    compareLead: "تقارن بين الشركات أولًا؟ اطّلع على دليلينا حول",
    linkBrokers: "أفضل الوسطاء العقاريين في دبي",
    linkCompanies: "أفضل شركات العقارات في دبي",
    and: " و",
    servicesLead: "يعمل كل مستشار أعلاه تحت تسجيل بناية لدى RERA (ORN 1162). اعرف المزيد عن عملنا كـ",
    linkAgency: "وكالة عقارية في دبي",
    linkBroker: "وسيط عقاري في دبي",
    and2: " و",
    stop: ".",
    empty: "يتم تحديث دليل فريقنا. يرجى العودة قريبًا.",
    salesHeading: "وكلاء العقارات لدينا في دبي",
    supportHeading: "العمليات والدعم",
    supportIntro: "الفريق خلف الكواليس الذي يضمن سير كل صفقة ومعاينة وتسليم بسلاسة.",
  },
  zh: {
    crumb: "房产经纪人",
    heading: "迪拜房产经纪人",
    intro: "Binayah Properties 是获 RERA 认证的迪拜房产中介（ORN 1162），自 2007 年起深耕这一市场，至今 19 年。以下是我们完整的销售团队：您联系的顾问就是全程负责您交易的人，每张名片均附照片、语言以及 WhatsApp、电话与邮箱直连。",
    intro2: "团队覆盖迪拜各永久产权社区的公寓、别墅、联排别墅与楼花项目——迪拜市中心、迪拜码头、棕榈朱美拉、商业湾、朱美拉环村（JVC）、迪拜山庄等——服务买家、卖家、业主、租客与投资者，平台在售房源超过 3,000 套。每位顾问都有公开的资料页，若我们存有其 RERA 经纪编号（BRN）也会一并列出，方便您在联系前先核实对方身份。",
    langLabel: "团队使用的语言：",
    compareLead: "还在比较中介公司？请先阅读我们的指南：",
    linkBrokers: "迪拜最佳房产经纪人",
    linkCompanies: "迪拜最佳房产公司",
    and: "、",
    servicesLead: "以上所有顾问均在 Binayah 的 RERA 注册（ORN 1162）下执业。进一步了解我们的",
    linkAgency: "迪拜房产中介服务",
    linkBroker: "迪拜房产经纪服务",
    and2: "与",
    stop: "。",
    empty: "我们的团队目录正在更新中，请稍后再来查看。",
    salesHeading: "我们的迪拜房产顾问",
    supportHeading: "运营与支持",
    supportIntro: "幕后团队，确保每一笔交易、看房与交接顺利进行。",
  },
  vi: {
    crumb: "Môi giới bất động sản",
    heading: "Môi giới bất động sản tại Dubai",
    intro: "Binayah Properties là công ty môi giới bất động sản tại Dubai được RERA chứng nhận (ORN 1162), hoạt động trên thị trường này từ năm 2007 — 19 năm. Dưới đây là toàn bộ đội ngũ kinh doanh: chuyên viên bạn liên hệ cũng chính là người theo sát giao dịch của bạn, kèm ảnh, ngôn ngữ và WhatsApp, điện thoại, email trực tiếp trên mỗi thẻ.",
    intro2: "Đội ngũ phụ trách căn hộ, biệt thự, nhà phố và dự án hình thành trong tương lai tại các cộng đồng sở hữu vĩnh viễn của Dubai — Downtown Dubai, Dubai Marina, Palm Jumeirah, Business Bay, Jumeirah Village Circle, Dubai Hills Estate và nhiều nơi khác — cho người mua, người bán, chủ nhà, người thuê và nhà đầu tư, với hơn 3.000 tin đăng đang hoạt động. Mỗi chuyên viên đều có trang hồ sơ công khai, kèm số môi giới RERA (BRN) nếu chúng tôi có trong hồ sơ, để bạn kiểm tra người mình sắp làm việc cùng trước khi gọi.",
    langLabel: "Các ngôn ngữ đội ngũ sử dụng:",
    compareLead: "Bạn đang so sánh các công ty? Hãy đọc hướng dẫn của chúng tôi về",
    linkBrokers: "những môi giới bất động sản tốt nhất Dubai",
    linkCompanies: "những công ty bất động sản tốt nhất Dubai",
    and: " và ",
    servicesLead: "Mọi chuyên viên ở trên đều làm việc dưới đăng ký RERA của Binayah (ORN 1162). Tìm hiểu thêm về",
    linkAgency: "dịch vụ công ty bất động sản tại Dubai",
    linkBroker: "dịch vụ môi giới bất động sản tại Dubai",
    and2: " và ",
    stop: ".",
    empty: "Danh bạ đội ngũ của chúng tôi đang được cập nhật. Vui lòng quay lại sau.",
    salesHeading: "Chuyên viên bất động sản của chúng tôi tại Dubai",
    supportHeading: "Vận hành & hỗ trợ",
    supportIntro: "Những người phía sau giúp mọi giao dịch, buổi xem nhà và bàn giao diễn ra suôn sẻ.",
  },
  he: {
    crumb: 'סוכני נדל"ן',
    heading: 'סוכני נדל"ן בדובאי',
    intro: 'Binayah Properties היא סוכנות נדל"ן בדובאי בהסמכת RERA (ORN 1162), הפועלת בשוק הזה מאז 2007 — 19 שנה. לפניכם צוות המכירות המלא: היועץ שאליו תפנו הוא זה שילווה את העסקה שלכם, עם תמונה, שפות ו-WhatsApp, טלפון ואימייל ישירים בכל כרטיס.',
    intro2: 'הצוות מטפל בדירות, וילות, בתי טאון ופרויקטים בהקמה בקהילות הבעלות המלאה של דובאי — Downtown Dubai, Dubai Marina, Palm Jumeirah, Business Bay, Jumeirah Village Circle, Dubai Hills Estate ועוד — עבור קונים, מוכרים, בעלי נכסים, שוכרים ומשקיעים, עם יותר מ-3,000 נכסים פעילים. לכל סוכן יש דף פרופיל מפורסם, ובו גם מספר המתווך שלו ב-RERA (BRN) כאשר הוא קיים אצלנו, כדי שתוכלו לבדוק עם מי אתם מדברים עוד לפני שאתם מתקשרים.',
    langLabel: "השפות שבהן דובר הצוות:",
    compareLead: "משווים בין סוכנויות? קראו את המדריכים שלנו על",
    linkBrokers: 'מתווכי הנדל"ן הטובים בדובאי',
    linkCompanies: 'חברות הנדל"ן הטובות בדובאי',
    and: " ועל ",
    servicesLead: "כל היועצים שלמעלה פועלים תחת רישום ה-RERA של Binayah (ORN 1162). מידע נוסף על",
    linkAgency: 'סוכנות הנדל"ן שלנו בדובאי',
    linkBroker: "שירותי התיווך שלנו בדובאי",
    and2: " ועל ",
    stop: ".",
    empty: "מדריך הצוות שלנו מתעדכן. אנא בדקו שוב בקרוב.",
    salesHeading: 'סוכני הנדל"ן שלנו בדובאי',
    supportHeading: "תפעול ותמיכה",
    supportIntro: "האנשים שמאחורי הקלעים שדואגים שכל עסקה, סיור ומסירה יתנהלו בצורה חלקה.",
  },
};

export default async function TeamPage({ params }: Props) {
  const { locale } = await params;
  const lp = locale === "en" ? "" : `/${locale}`;
  const L = TEAM_L[locale] ?? TEAM_L.en;
  const agents = await getAgents();
  // Order by seniority so leadership (Head of Sales, then Director/Managers)
  // leads the grid; consultants follow, keeping their existing order within a
  // rank. Unknown positions sort to the end.
  const RANK: Record<string, number> = {
    "head of sales": 0, "sales director": 1, "sales manager": 2,
    "senior property consultant": 3, "property consultant": 4, "property manager": 5,
  };
  const rankOf = (p?: string) => RANK[(p || "").trim().toLowerCase()] ?? 9;
  const sortedAgents = [...agents].sort((a, b) => rankOf(a.position) - rankOf(b.position));
  // Derived from the live roster, never hardcoded — the languages line stays
  // true as agents are added or their profiles change.
  const teamLanguages = Array.from(
    new Set(
      sortedAgents
        .flatMap((a) => a.languages ?? [])
        .map((l) => l.trim())
        .filter(Boolean),
    ),
  );
  const linkCls = "text-primary underline underline-offset-2 hover:no-underline";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
          <Breadcrumbs items={[{ label: L.crumb, href: `${lp}/team` }]} />
        </div>

        <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">{L.heading}</h1>
          <p className="mt-3 max-w-3xl text-sm sm:text-base text-muted-foreground leading-relaxed">
            {L.intro}
          </p>
          <p className="mt-3 max-w-3xl text-sm sm:text-base text-muted-foreground leading-relaxed">
            {L.intro2}
          </p>
          {teamLanguages.length > 0 && (
            <p className="mt-4 flex max-w-3xl items-start gap-2 text-sm text-muted-foreground leading-relaxed">
              <Globe className="h-4 w-4 mt-0.5 shrink-0 text-primary/70" />
              <span>
                <span className="font-semibold text-foreground">{L.langLabel}</span>{" "}
                {teamLanguages.join(" · ")}
              </span>
            </p>
          )}
          <p className="mt-4 max-w-3xl text-sm text-muted-foreground leading-relaxed">
            {L.compareLead}{" "}
            <Link href={`${lp}/pulse/guides/best-real-estate-brokers-dubai`} className={linkCls}>
              {L.linkBrokers}
            </Link>
            {L.and}
            <Link href={`${lp}/pulse/guides/best-real-estate-companies-dubai`} className={linkCls}>
              {L.linkCompanies}
            </Link>
            {L.stop}
          </p>
        </section>

        <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight mb-6">{L.salesHeading}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {sortedAgents.map((a) => {
              const tel = (a.mobile || "").replace(/[^\d+]/g, "");
              const waMsg = `Hi ${a.name}! 👋 I found your profile on Binayah and I'd like to discuss a property in Dubai.`;
              return (
                <div
                  key={a.slug}
                  className="group flex flex-col rounded-2xl border border-border/60 bg-card overflow-hidden hover:border-primary/40 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                >
                  {/* Photo → profile */}
                  <Link href={`${lp}/team/${a.slug}`} className="relative aspect-[4/5] block bg-muted/30 overflow-hidden">
                    {a.photo ? (
                      <Image
                        src={a.photo}
                        alt={a.name}
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="object-cover group-hover:scale-[1.04] transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl font-semibold text-muted-foreground/40">
                        {a.name.charAt(0)}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent" />
                    {a.position && (
                      <span
                        className="absolute top-3 left-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.06em] text-white shadow-md"
                        style={{ background: "linear-gradient(135deg, #D4A847, #B8922F)" }}
                      >
                        {a.position}
                      </span>
                    )}
                    <h3 className="absolute bottom-2.5 left-3 right-3 text-white font-bold text-sm sm:text-base leading-tight drop-shadow-md">
                      {a.name}
                    </h3>
                  </Link>

                  {/* Body: languages + contact */}
                  <div className="p-3 sm:p-4 flex flex-col gap-3 flex-1">
                    {a.languages && a.languages.length > 0 && (
                      <p className="flex items-start gap-1.5 text-[11px] leading-snug text-muted-foreground">
                        <Globe className="h-3.5 w-3.5 mt-px shrink-0 text-primary/70" />
                        <span>{a.languages.join(" · ")}</span>
                      </p>
                    )}
                    <div className="mt-auto flex items-center gap-2">
                      {tel && (
                        <a
                          href={waHref(waMsg, undefined, a.mobile)}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`WhatsApp ${a.name}`}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold text-white transition-transform hover:scale-[1.02]"
                          style={{ background: "linear-gradient(135deg, #25D366, #1DA851)" }}
                        >
                          <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                        </a>
                      )}
                      {tel && (
                        <a
                          href={`tel:${tel}`}
                          aria-label={`Call ${a.name}`}
                          className="grid place-items-center h-8 w-8 shrink-0 rounded-lg border border-border/70 text-primary hover:bg-primary/8 transition-colors"
                        >
                          <Phone className="h-3.5 w-3.5" />
                        </a>
                      )}
                      {a.email && (
                        <a
                          href={`mailto:${a.email}`}
                          aria-label={`Email ${a.name}`}
                          className="grid place-items-center h-8 w-8 shrink-0 rounded-lg border border-border/70 text-primary hover:bg-primary/8 transition-colors"
                        >
                          <Mail className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {sortedAgents.length === 0 && (
            <p className="text-sm text-muted-foreground">{L.empty}</p>
          )}
          <p className="mt-8 max-w-3xl text-sm text-muted-foreground leading-relaxed">
            {L.servicesLead}{" "}
            <Link href={`${lp}/services/real-estate-agency-dubai`} className={linkCls}>
              {L.linkAgency}
            </Link>
            {L.and2}
            <Link href={`${lp}/services/real-estate-broker-dubai`} className={linkCls}>
              {L.linkBroker}
            </Link>
            {L.stop}
          </p>
        </section>

        {/* Operations & support — role-labelled, no individual pages (nothing
            extra for crawlers to index); the sales agents above are the
            indexable, linkable profiles. */}
        {SUPPORT_TEAM.length > 0 && (
          <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-20 border-t border-border/50 pt-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">{L.supportHeading}</h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground leading-relaxed">{L.supportIntro}</p>
            <ul className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 list-none p-0">
              {SUPPORT_TEAM.map((m) => (
                <li
                  key={m.slug}
                  className="rounded-2xl border border-border/60 bg-card overflow-hidden"
                >
                  <div className="relative aspect-[4/5] bg-muted/30 overflow-hidden">
                    <Image
                      src={m.photo}
                      alt={m.role}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="p-3 sm:p-4">
                    <p className="font-semibold text-sm sm:text-base text-foreground leading-tight">{m.role}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">Binayah Properties</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}