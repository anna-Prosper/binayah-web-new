/* eslint-disable i18next/no-literal-string -- FAQ content */
import ServicesPageClient from "./ServicesPageClient";
import type { Metadata } from "next";
import { canonical, altLangs, OG_LOCALE, DEFAULT_OG_IMAGE } from "@/lib/site";
import { FAQJsonLd } from "@/components/JsonLd";

export const revalidate = 86400;

interface Props { params: Promise<{ locale: string }> }

const titles: Record<string, string> = {
  fr: "Services Immobiliers à Dubaï | Binayah Properties",
  en: "Real Estate Services in Dubai | Binayah Properties",
  ru: "Услуги в сфере недвижимости Дубая | Binayah Properties",
  ar: "خدمات العقارات في دبي | بناية للعقارات",
  zh: "迪拜房地产服务 | Binayah Properties",
  vi: "Dịch Vụ Bất Động Sản tại Dubai | Binayah Properties",
  he: "שירותי נדל\"ן בדובאי | Binayah Properties",
};
const descriptions: Record<string, string> = {
  fr: "Immobilier à service complet à Dubaï : achat, vente, location, investissement sur plan, gestion immobilière et évaluations. Plus de 19 ans d'expertise.",
  en: "Full-service Dubai real estate: buying, selling, renting, off-plan investment, property management and valuations. 19+ years of expertise.",
  ru: "Полный спектр услуг по недвижимости в Дубае: покупка, продажа, аренда, инвестиции в новостройки, управление недвижимостью и оценка. Более 19 лет опыта.",
  ar: "خدمات عقارية متكاملة في دبي: شراء، بيع، إيجار، استثمار على الخارطة، إدارة العقارات والتقييم. خبرة تزيد على 19 عامًا.",
  zh: "迪拜一站式房产服务：购买、出售、租赁、期房投资、物业管理和估价。超过19年专业经验。",
  vi: "Bất động sản Dubai dịch vụ đầy đủ: mua, bán, cho thuê, đầu tư dự án, quản lý và định giá tài sản. Hơn 19 năm kinh nghiệm.",
  he: "נדל\"ן בדובאי עם שירות מלא: קנייה, מכירה, השכרה, השקעה בתוכניות עתידיות, ניהול נכסים והערכות שווי. מעל 19 שנות מומחיות.",
};

const SERVICES_FAQS: Record<string, { question: string; answer: string }[]> = {
  en: [
    { question: "What real estate services does Binayah Properties offer?", answer: "Binayah Properties offers a complete range of Dubai real estate services: buying, selling, renting, off-plan project investment, property management for landlords, free AI-powered property valuations, and mortgage guidance. All services are provided by RERA-certified agents." },
    { question: "How much does it cost to use Binayah's services?", answer: "Buyer and tenant services are free, Binayah earns a commission from sellers and landlords. Seller commission is typically 2% of the sale price. Landlord commission for finding a tenant is 5% of the annual rent. Property management fees are typically 5-8% of the monthly rent." },
    { question: "Does Binayah offer property management services?", answer: "Yes. Binayah's property management service covers tenant screening, rent collection, maintenance coordination, EJARI registration, and annual property inspections. This is ideal for overseas investors who cannot manage their Dubai property in person." },
    { question: "Can Binayah help with off-plan investments?", answer: "Yes. Binayah has dedicated off-plan specialists with access to all major Dubai developer launches (Emaar, DAMAC, Sobha, Aldar, Nakheel, and more). We provide unbiased advice on which projects offer the best ROI, payment plans, and rental potential." },
    { question: "Does Binayah provide mortgage assistance?", answer: "Yes. Binayah works with UAE mortgage brokers and banks to help clients secure home loans. We advise on eligibility, documentation, LTV ratios, and current rates for both residents and non-residents." },
    { question: "How does Binayah's free property valuation work?", answer: "Binayah's AI-powered valuation tool uses recent DLD transaction data, current listings, and community-specific market intelligence to give you an instant estimate. For a detailed valuation report, our agents conduct a full analysis based on your specific unit's floor, view, and condition." },
  ],
  ru: [
    { question: "Какие услуги предоставляет Binayah Properties?", answer: "Binayah предоставляет полный спектр услуг: покупка, продажа, аренда, инвестиции в новостройки, управление недвижимостью, бесплатная оценка и консультации по ипотеке. Все услуги оказываются RERA-сертифицированными агентами с обслуживанием на русском языке." },
    { question: "Сколько стоят услуги Binayah?", answer: "Услуги для покупателей и арендаторов бесплатны, комиссия взимается с продавцов и арендодателей. Комиссия продавца, обычно 2% от стоимости продажи. Комиссия за поиск арендатора, 5% от годовой аренды." },
    { question: "Предоставляет ли Binayah услуги по управлению недвижимостью?", answer: "Да. Управление включает проверку арендаторов, сбор арендной платы, координацию технического обслуживания, регистрацию EJARI и ежегодные инспекции. Оптимально для зарубежных инвесторов." },
    { question: "Помогает ли Binayah с инвестициями в новостройки?", answer: "Да. Специалисты Binayah по новостройкам имеют доступ ко всем крупным застройщикам Дубая (Emaar, DAMAC, Sobha и др.) и дают независимые рекомендации по ROI и планам рассрочки." },
    { question: "Как работает бесплатная оценка недвижимости?", answer: "Инструмент оценки Binayah на базе ИИ использует данные о сделках DLD, текущие объявления и аналитику по конкретному рынку. Для детального отчёта агенты проводят полный анализ вашего объекта." },
  ],
  ar: [
    { question: "ما الخدمات التي تقدمها بناية للعقارات؟", answer: "تُقدّم بناية طيفًا كاملًا من خدمات عقارات دبي: شراء وبيع وإيجار واستثمار على الخارطة وإدارة عقارية وتقييم مجاني مدعوم بالذكاء الاصطناعي وإرشاد عقاري. جميع الخدمات من وكلاء معتمدين من RERA." },
    { question: "كم تكلّف خدمات بناية؟", answer: "خدمات المشترين والمستأجرين مجانية, تكسب بناية عمولةً من البائعين والملّاك. عمولة البائع عادةً 2% من سعر البيع. عمولة إيجاد مستأجر 5% من الإيجار السنوي." },
    { question: "هل تُقدّم بناية خدمات إدارة العقارات؟", answer: "نعم. تشمل الإدارة فحص المستأجرين وتحصيل الإيجار وتنسيق الصيانة وتسجيل عقود إيجاري والتفتيش السنوي. مثالية للمستثمرين من خارج الإمارات." },
    { question: "هل تساعد بناية في الاستثمار بالمشاريع على الخارطة؟", answer: "نعم. لدى بناية متخصصون في المشاريع على الخارطة مع إمكانية الوصول إلى جميع إطلاقات كبرى المطوّرين في دبي (إعمار وداماك وسوبها وغيرها) مع توصيات محايدة." },
    { question: "كيف يعمل تقييم العقارات المجاني؟", answer: "تستخدم أداة التقييم المدعومة بالذكاء الاصطناعي من بناية بيانات معاملات DLD الأخيرة والإعلانات الحالية لتقديم تقدير فوري. للتقرير التفصيلي، يُجري الوكلاء تحليلًا كاملًا للوحدة." },
  ],
  zh: [
    { question: "Binayah Properties提供哪些房产服务？", answer: "Binayah提供全套迪拜房产服务：购买、出售、租赁、期房投资、物业管理、免费AI驱动估价和按揭指导。所有服务均由RERA认证经纪人提供，支持中文服务。" },
    { question: "使用Binayah服务需要多少费用？", answer: "买方和租客服务免费, , Binayah从卖家和房东处收取佣金。卖家佣金通常为成交价的2%，寻找租客的佣金为年租金的5%。" },
    { question: "Binayah提供物业管理服务吗？", answer: "是的。物业管理服务涵盖租客筛选、租金收取、维修协调、EJARI登记和年度检查，非常适合无法亲自管理迪拜房产的海外投资者。" },
    { question: "Binayah协助期房投资吗？", answer: "是的。Binayah的期房专家可获取所有主要迪拜开发商的楼盘信息（Emaar、DAMAC、Sobha等），并提供关于投资回报率和付款计划的客观建议。" },
    { question: "免费房产估价如何运作？", answer: "Binayah的AI驱动估价工具使用DLD近期交易数据和当前房源信息提供即时估价。如需详细报告，经纪人将根据您的具体单元楼层、景观和状况进行全面分析。" },
  ],
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: titles[locale] || titles.en,
    description: descriptions[locale] || descriptions.en,
    alternates: {
      canonical: canonical(locale, "/services"),
      languages: altLangs("/services"),
    },
    openGraph: {
      title: titles[locale] || titles.en,
      description: descriptions[locale] || descriptions.en,
      url: canonical(locale, "/services"),
      type: "website",
      locale: OG_LOCALE[locale] ?? "en_AE",
      images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630 }],
    },
  };
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  const faqs = SERVICES_FAQS[locale] || SERVICES_FAQS.en;
  return (
    <>
      <FAQJsonLd faqs={faqs} />
      <ServicesPageClient />
    </>
  );
}
