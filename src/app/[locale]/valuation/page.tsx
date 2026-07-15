/* eslint-disable i18next/no-literal-string -- FAQ content */
import { ValuationPage } from "@/components/valuation";
import type { Metadata } from "next";
import { canonical, altLangs, OG_LOCALE, DEFAULT_OG_IMAGE } from "@/lib/site";
import { FAQJsonLd } from "@/components/JsonLd";

export const revalidate = 86400;

interface Props { params: Promise<{ locale: string }> }

const titles: Record<string, string> = {
  fr: "Évaluation Gratuite de Propriété Dubaï | Estimation Instantanée par IA | Binayah",
  en: "Free Property Valuation Dubai | AI-Powered Instant Estimate | Binayah",
  ru: "Бесплатная оценка недвижимости в Дубае | ИИ-оценка онлайн | Binayah",
  ar: "تقييم عقاري مجاني في دبي | تقدير فوري بالذكاء الاصطناعي | بناية",
  zh: "迪拜免费房产估价 | AI驱动即时估价 | Binayah",
  vi: "Định Giá Bất Động Sản Miễn Phí Dubai | Ước Tính Tức Thì Bằng AI | Binayah",
  he: "הערכת נכס חינם בדובאי | הערכה מיידית מבוססת AI | Binayah",
};
const descriptions: Record<string, string> = {
  fr: "Obtenez une évaluation immobilière instantanée alimentée par l'IA pour les biens immobiliers à Dubaï et aux Émirats Arabes Unis. Gratuit, précis, sans inscription requise.",
  en: "Get an instant AI-powered property valuation for Dubai and UAE real estate. Free, accurate, no registration required.",
  ru: "Получите мгновенную оценку недвижимости в Дубае и ОАЭ на базе ИИ. Бесплатно, точно, без регистрации.",
  ar: "احصل على تقييم عقاري فوري بالذكاء الاصطناعي لعقارات دبي والإمارات. مجاني، دقيق، بدون تسجيل.",
  zh: "获取迪拜和阿联酋房产的AI驱动即时估价。免费、准确，无需注册。",
  vi: "Nhận định giá bất động sản tại Dubai và UAE ngay lập tức với công nghệ AI. Miễn phí, chính xác, không cần đăng ký.",
  he: "קבלו הערכת נכס מיידית בעזרת AI לנכסים בדובאי ובאיחוד האמירויות. חינם, מדויק, ללא צורך בהרשמה.",
};

const VALUATION_FAQS: Record<string, { question: string; answer: string }[]> = {
  en: [
    { question: "How accurate is the Binayah property valuation tool?", answer: "Binayah's AI valuation uses real DLD-registered transaction data from the past 6-12 months for your specific building and community. Accuracy is typically within 5-10% of actual market value. For mortgage or legal purposes, a RICS-certified in-person appraisal is recommended." },
    { question: "What factors affect property value in Dubai?", answer: "Key factors include: location and community (Downtown and Palm command premiums), floor level and view, property condition and renovation, size and layout, building amenities (gym, pool, concierge), current market supply/demand, and proximity to metro, schools, and retail." },
    { question: "Is the property valuation really free?", answer: "Yes, completely free with no registration required. Binayah's valuation tool is designed to give owners and investors instant market intelligence. There is no obligation and no fee." },
    { question: "How often do Dubai property values change?", answer: "Dubai property values are updated in real-time based on DLD transaction registrations. The market has seen 15-25% annual appreciation in prime areas since 2021. Use Binayah's Market Pulse dashboard for monthly trends by community." },
    { question: "Can I use the Binayah valuation for a mortgage application?", answer: "Binayah's free online valuation is useful for market awareness but is not accepted as a formal valuation for mortgage purposes. Banks require an official RICS or bank-approved valuer. Your Binayah agent can refer you to accredited valuers." },
    { question: "How is Dubai property value measured?", answer: "Dubai property is typically valued per square foot (AED/sqft). Average prices vary significantly: Downtown Dubai and Palm Jumeirah range from AED 2,000-5,000+/sqft, while areas like JVC and Dubai South range from AED 700-1,200/sqft." },
  ],
  ru: [
    { question: "Насколько точна оценка Binayah?", answer: "ИИ-оценка Binayah использует реальные данные DLD о сделках за последние 6-12 месяцев по вашему зданию и району. Точность, как правило, в пределах 5-10% от рыночной стоимости." },
    { question: "Какие факторы влияют на стоимость недвижимости в Дубае?", answer: "Ключевые факторы: локация и район (Даунтаун и Пальма имеют премиальные цены), этаж и вид, состояние объекта, площадь и планировка, инфраструктура здания, близость к метро, школам и торговым центрам." },
    { question: "Оценка действительно бесплатна?", answer: "Да, абсолютно бесплатно без регистрации. Инструмент оценки Binayah даёт мгновенную рыночную информацию без каких-либо обязательств и платежей." },
    { question: "Как часто меняются цены на недвижимость в Дубае?", answer: "Данные обновляются на основе зарегистрированных в DLD сделок. Начиная с 2021 года рынок показывает рост на 15-25% в год в премиальных районах." },
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
  vi: [
    { question: "Công cụ định giá của Binayah chính xác đến mức nào?", answer: "Định giá bằng AI của Binayah sử dụng dữ liệu giao dịch thực tế đã đăng ký với DLD trong 6-12 tháng gần nhất cho chính tòa nhà và khu vực của bạn. Độ chính xác thường trong khoảng 5-10% so với giá trị thị trường thực tế. Với mục đích vay thế chấp hoặc pháp lý, nên có thẩm định trực tiếp đạt chuẩn RICS." },
    { question: "Những yếu tố nào ảnh hưởng đến giá trị bất động sản ở Dubai?", answer: "Các yếu tố chính gồm: vị trí và khu vực (Downtown và Palm có mức giá cao hơn), tầng và tầm nhìn, tình trạng và cải tạo, diện tích và bố cục, tiện ích tòa nhà, cung-cầu thị trường, và khoảng cách đến tàu điện, trường học, mua sắm." },
    { question: "Định giá có thực sự miễn phí không?", answer: "Có, hoàn toàn miễn phí và không cần đăng ký. Công cụ định giá của Binayah mang đến cho chủ nhà và nhà đầu tư thông tin thị trường tức thì, không ràng buộc và không phí." },
    { question: "Giá bất động sản Dubai thay đổi thường xuyên như thế nào?", answer: "Giá trị được cập nhật theo thời gian thực dựa trên các giao dịch đăng ký với DLD. Thị trường đã tăng 15-25% mỗi năm ở các khu vực cao cấp kể từ năm 2021. Hãy dùng bảng điều khiển Market Pulse của Binayah để xem xu hướng hàng tháng theo khu vực." },
    { question: "Tôi có thể dùng định giá Binayah cho hồ sơ vay thế chấp không?", answer: "Định giá trực tuyến miễn phí của Binayah hữu ích để nắm bắt thị trường nhưng không được chấp nhận là định giá chính thức cho mục đích vay. Ngân hàng yêu cầu thẩm định viên RICS hoặc được ngân hàng phê duyệt. Đại lý Binayah có thể giới thiệu bạn đến các thẩm định viên được công nhận." },
    { question: "Giá trị bất động sản Dubai được đo lường như thế nào?", answer: "Bất động sản Dubai thường được định giá theo mỗi foot vuông (AED/sqft). Giá dao động đáng kể: Downtown Dubai và Palm Jumeirah từ 2.000-5.000+ AED/sqft, trong khi các khu như JVC và Dubai South từ 700-1.200 AED/sqft." },
  ],
  fr: [
    { question: "Quelle est la précision de l'outil d'évaluation Binayah ?", answer: "L'évaluation par IA de Binayah utilise les données réelles de transactions enregistrées au DLD des 6 à 12 derniers mois pour votre immeuble et votre quartier. La précision se situe généralement à 5-10 % de la valeur de marché réelle. Pour un prêt hypothécaire ou à des fins juridiques, une expertise en personne certifiée RICS est recommandée." },
    { question: "Quels facteurs influencent la valeur d'un bien à Dubaï ?", answer: "Les principaux facteurs sont : l'emplacement et le quartier (Downtown et Palm affichent une prime), l'étage et la vue, l'état et les rénovations, la surface et l'agencement, les équipements de l'immeuble, l'offre et la demande, et la proximité du métro, des écoles et des commerces." },
    { question: "L'évaluation est-elle vraiment gratuite ?", answer: "Oui, entièrement gratuite et sans inscription. L'outil d'évaluation de Binayah offre aux propriétaires et investisseurs une information de marché instantanée, sans engagement ni frais." },
    { question: "À quelle fréquence les prix de l'immobilier à Dubaï évoluent-ils ?", answer: "Les valeurs sont mises à jour en temps réel selon les enregistrements de transactions au DLD. Le marché a connu une appréciation annuelle de 15 à 25 % dans les zones prisées depuis 2021. Consultez le tableau de bord Market Pulse de Binayah pour les tendances mensuelles par quartier." },
    { question: "Puis-je utiliser l'évaluation Binayah pour une demande de prêt ?", answer: "L'évaluation en ligne gratuite de Binayah est utile pour connaître le marché mais n'est pas acceptée comme évaluation formelle pour un prêt. Les banques exigent un expert agréé RICS ou approuvé par la banque. Votre agent Binayah peut vous orienter vers des experts accrédités." },
    { question: "Comment mesure-t-on la valeur d'un bien à Dubaï ?", answer: "La valeur se calcule généralement au pied carré (AED/sqft). Les prix varient fortement : Downtown Dubai et Palm Jumeirah de 2 000 à 5 000+ AED/sqft, tandis que des zones comme JVC et Dubai South se situent entre 700 et 1 200 AED/sqft." },
  ],
  he: [
    { question: "עד כמה מדויק כלי ההערכה של Binayah?", answer: "הערכת ה-AI של Binayah מסתמכת על נתוני עסקאות אמיתיים הרשומים ב-DLD מ-6-12 החודשים האחרונים עבור הבניין והאזור הספציפיים שלכם. הדיוק בדרך כלל בטווח של 5-10% מערך השוק בפועל. למשכנתא או לצרכים משפטיים מומלצת הערכה פרונטלית בהסמכת RICS." },
    { question: "אילו גורמים משפיעים על ערך הנכס בדובאי?", answer: "הגורמים המרכזיים: מיקום ואזור (Downtown ו-Palm בפרמיה), קומה ונוף, מצב הנכס ושיפוצים, שטח ותכנון, מתקני הבניין, היצע וביקוש בשוק, וקרבה לרכבת התחתית, בתי ספר וקניות." },
    { question: "האם ההערכה באמת חינם?", answer: "כן, חינם לחלוטין וללא הרשמה. כלי ההערכה של Binayah נועד להעניק לבעלים ולמשקיעים מודיעין שוק מיידי, ללא התחייבות וללא תשלום." },
    { question: "באיזו תדירות משתנים מחירי הנדל\"ן בדובאי?", answer: "הערכים מתעדכנים בזמן אמת לפי רישומי עסקאות ב-DLD. השוק רשם עלייה שנתית של 15-25% באזורי היוקרה מאז 2021. השתמשו בלוח Market Pulse של Binayah למגמות חודשיות לפי אזור." },
    { question: "האם ניתן להשתמש בהערכת Binayah לבקשת משכנתא?", answer: "ההערכה המקוונת החינמית של Binayah שימושית להיכרות עם השוק אך אינה מתקבלת כהערכה רשמית למשכנתא. הבנקים דורשים שמאי מוסמך RICS או מאושר בנק. סוכן Binayah יכול להפנות אתכם לשמאים מוסמכים." },
    { question: "כיצד נמדד ערך הנכס בדובאי?", answer: "נכס בדובאי מוערך בדרך כלל לפי רגל רבועה (AED/sqft). המחירים משתנים מאוד: Downtown Dubai ו-Palm Jumeirah בטווח 2,000-5,000+ AED/sqft, בעוד אזורים כמו JVC ו-Dubai South בטווח 700-1,200 AED/sqft." },
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
    twitter: {
      card: "summary_large_image",
      title: titles[locale] || titles.en,
      description: descriptions[locale] || descriptions.en,
      images: [DEFAULT_OG_IMAGE],
    },
  };
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  const faqs = VALUATION_FAQS[locale] || VALUATION_FAQS.en;
  // Describes the free AI valuation tool as a web app (price 0) — helps Google
  // understand the interactive page beyond the FAQ.
  const appLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Binayah AI Property Valuation",
    url: canonical(locale, "/valuation"),
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web browser",
    description: descriptions[locale] || descriptions.en,
    offers: { "@type": "Offer", price: "0", priceCurrency: "AED" },
    provider: { "@type": "RealEstateAgent", name: "Binayah Properties", url: "https://www.binayah.ae" },
    featureList: [
      "Instant AI-powered property valuation",
      "Based on real DLD transaction data",
      "Free, no registration required",
      "Dubai and UAE coverage",
    ],
    inLanguage: locale,
  };
  return (
    <>
      <FAQJsonLd faqs={faqs} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(appLd).replace(/</g, "\\u003c") }}
      />
      <ValuationPage />
    </>
  );
}
