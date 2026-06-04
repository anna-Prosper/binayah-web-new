/* eslint-disable i18next/no-literal-string -- FAQ content */
import { ValuationPage } from "@/components/valuation";
import type { Metadata } from "next";
import { canonical, altLangs, OG_LOCALE, DEFAULT_OG_IMAGE } from "@/lib/site";
import { FAQJsonLd } from "@/components/JsonLd";

export const revalidate = 86400;

interface Props { params: Promise<{ locale: string }> }

const titles: Record<string, string> = {
  en: "Free Property Valuation Dubai | AI-Powered Instant Estimate | Binayah",
  ru: "Бесплатная оценка недвижимости в Дубае | ИИ-оценка онлайн | Binayah",
  ar: "تقييم عقاري مجاني في دبي | تقدير فوري بالذكاء الاصطناعي | بناية",
  zh: "迪拜免费房产估价 | AI驱动即时估价 | Binayah",
};
const descriptions: Record<string, string> = {
  en: "Get an instant AI-powered property valuation for Dubai and UAE real estate. Free, accurate, no registration required.",
  ru: "Получите мгновенную оценку недвижимости в Дубае и ОАЭ на базе ИИ. Бесплатно, точно, без регистрации.",
  ar: "احصل على تقييم عقاري فوري بالذكاء الاصطناعي لعقارات دبي والإمارات. مجاني، دقيق، بدون تسجيل.",
  zh: "获取迪拜和阿联酋房产的AI驱动即时估价。免费、准确，无需注册。",
};

const VALUATION_FAQS: Record<string, { question: string; answer: string }[]> = {
  en: [
    { question: "How accurate is the Binayah property valuation tool?", answer: "Binayah's AI valuation uses real DLD-registered transaction data from the past 6–12 months for your specific building and community. Accuracy is typically within 5–10% of actual market value. For mortgage or legal purposes, a RICS-certified in-person appraisal is recommended." },
    { question: "What factors affect property value in Dubai?", answer: "Key factors include: location and community (Downtown and Palm command premiums), floor level and view, property condition and renovation, size and layout, building amenities (gym, pool, concierge), current market supply/demand, and proximity to metro, schools, and retail." },
    { question: "Is the property valuation really free?", answer: "Yes, completely free with no registration required. Binayah's valuation tool is designed to give owners and investors instant market intelligence. There is no obligation and no fee." },
    { question: "How often do Dubai property values change?", answer: "Dubai property values are updated in real-time based on DLD transaction registrations. The market has seen 15–25% annual appreciation in prime areas since 2021. Use Binayah's Market Pulse dashboard for monthly trends by community." },
    { question: "Can I use the Binayah valuation for a mortgage application?", answer: "Binayah's free online valuation is useful for market awareness but is not accepted as a formal valuation for mortgage purposes. Banks require an official RICS or bank-approved valuer. Your Binayah agent can refer you to accredited valuers." },
    { question: "How is Dubai property value measured?", answer: "Dubai property is typically valued per square foot (AED/sqft). Average prices vary significantly: Downtown Dubai and Palm Jumeirah range from AED 2,000–5,000+/sqft, while areas like JVC and Dubai South range from AED 700–1,200/sqft." },
  ],
  ru: [
    { question: "Насколько точна оценка Binayah?", answer: "ИИ-оценка Binayah использует реальные данные DLD о сделках за последние 6–12 месяцев по вашему зданию и району. Точность — как правило, в пределах 5–10% от рыночной стоимости." },
    { question: "Какие факторы влияют на стоимость недвижимости в Дубае?", answer: "Ключевые факторы: локация и район (Даунтаун и Пальма имеют премиальные цены), этаж и вид, состояние объекта, площадь и планировка, инфраструктура здания, близость к метро, школам и торговым центрам." },
    { question: "Оценка действительно бесплатна?", answer: "Да, абсолютно бесплатно без регистрации. Инструмент оценки Binayah даёт мгновенную рыночную информацию без каких-либо обязательств и платежей." },
    { question: "Как часто меняются цены на недвижимость в Дубае?", answer: "Данные обновляются на основе зарегистрированных в DLD сделок. Начиная с 2021 года рынок показывает рост на 15–25% в год в премиальных районах." },
    { question: "Можно ли использовать оценку Binayah для ипотеки?", answer: "Онлайн-оценка Binayah подходит для понимания рынка, но не является официальной для банков. Банки требуют оценку от аккредитованного оценщика RICS. Агент Binayah направит вас к проверенным специалистам." },
  ],
  ar: [
    { question: "ما مدى دقة أداة التقييم في بناية؟", answer: "يستخدم تقييم الذكاء الاصطناعي في بناية بيانات معاملات DLD المسجَّلة خلال الـ 6-12 شهرًا الماضية لمبناك ومجتمعك. الدقة عادةً ضمن 5-10% من القيمة السوقية الفعلية." },
    { question: "ما العوامل المؤثرة في قيمة العقار بدبي؟", answer: "تشمل العوامل الرئيسية: الموقع والمجتمع، الطابق والإطلالة، حالة الوحدة، المساحة والتصميم، مرافق المبنى، القرب من المترو والمدارس ومراكز التسوق." },
    { question: "هل التقييم مجاني فعلًا؟", answer: "نعم، مجاني تمامًا دون تسجيل. صُمِّمت أداة التقييم لمنح المالكين والمستثمرين معلومات سوقية فورية دون أي التزام أو رسوم." },
    { question: "كم مرة تتغير أسعار العقارات في دبي؟", answer: "تُحدَّث البيانات استنادًا إلى معاملات DLD المسجَّلة. شهد السوق تقديرًا سنويًا بنسبة 15-25% في المناطق الرئيسية منذ عام 2021." },
  ],
  zh: [
    { question: "Binayah房产估价工具有多准确？", answer: "Binayah的AI估价使用您所在楼栋和社区过去6-12个月的DLD实际登记交易数据，准确率通常在市场价值的5-10%以内。" },
    { question: "影响迪拜房产价值的因素有哪些？", answer: "主要因素包括：位置和社区（市中心和棕榈岛价格溢价）、楼层和景观、房产状况、面积和户型、楼栋配套设施、距地铁/学校/商场的距离。" },
    { question: "估价真的免费吗？", answer: "是的，完全免费，无需注册。Binayah的估价工具旨在为业主和投资者提供即时市场信息，无任何义务和费用。" },
    { question: "迪拜房产价值多久变化一次？", answer: "数据根据DLD交易登记实时更新。自2021年以来，优质地区的年均增值率为15-25%。" },
    { question: "Binayah估价可用于贷款申请吗？", answer: "Binayah的在线估价适合了解市场行情，但不被银行接受为正式贷款估价。银行需要RICS认证评估师的报告，您的Binayah经纪人可为您推荐认可评估师。" },
  ],
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: titles[locale] || titles.en,
    description: descriptions[locale] || descriptions.en,
    alternates: {
      canonical: canonical(locale, "/valuation"),
      languages: altLangs("/valuation"),
    },
    openGraph: {
      title: titles[locale] || titles.en,
      description: descriptions[locale] || descriptions.en,
      url: canonical(locale, "/valuation"),
      type: "website",
      locale: OG_LOCALE[locale] ?? "en_AE",
      images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630 }],
    },
  };
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  const faqs = VALUATION_FAQS[locale] || VALUATION_FAQS.en;
  return (
    <>
      <FAQJsonLd faqs={faqs} />
      <ValuationPage />
    </>
  );
}
