/* eslint-disable i18next/no-literal-string -- multilingual SEO landing page */
import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { FAQJsonLd, BreadcrumbJsonLd } from "@/components/JsonLd";
import { canonical, altLangs, OG_LOCALE, DEFAULT_OG_IMAGE } from "@/lib/site";

export const revalidate = 86400;

interface Props { params: Promise<{ locale: string }> }

const TITLES: Record<string, string> = {
  en: "Real Estate Marketing Dubai | List & Sell Faster | Binayah Properties",
  ru: "Маркетинг недвижимости в Дубае | Продайте быстрее | Binayah Properties",
  ar: "تسويق عقارات دبي | بِع أسرع | بناية للعقارات",
  zh: "迪拜房产营销 | 更快出售 | Binayah Properties",
  vi: "Tiếp thị bất động sản Dubai | Niêm yết & Bán nhanh hơn | Binayah Properties",
  he: "שיווק נדל\"ן בדובאי | רשום ומכור מהר יותר | Binayah Properties",
};
const DESCS: Record<string, string> = {
  en: "Professional real estate marketing in Dubai. HDR photography, Bayut & Propertyfinder listings, social media, and digital campaigns. Sell or rent faster with Binayah.",
  ru: "Профессиональный маркетинг недвижимости в Дубае. HDR-фотосъёмка, размещение на Bayut и Propertyfinder, соцсети. Продайте или сдайте быстрее с Binayah.",
  ar: "تسويق عقاري احترافي في دبي. تصوير HDR وإدراج على Bayut وPropertyfinder وسوشيال ميديا. بِع أو أجِّر أسرع مع بناية.",
  zh: "迪拜专业房产营销。HDR摄影、Bayut和Propertyfinder挂牌、社交媒体和数字广告活动。与Binayah更快出售或出租。",
  vi: "Tiếp thị bất động sản chuyên nghiệp tại Dubai. Ảnh HDR, tin đăng Bayut & Propertyfinder, mạng xã hội và chiến dịch số. Bán hoặc cho thuê nhanh hơn với Binayah.",
  he: "שיווק נדל\"ן מקצועי בדובאי. צילום HDR, רישומים ב-Bayut ו-Propertyfinder, מדיה חברתית וקמפיינים דיגיטליים. מכרו או השכירו מהר יותר עם Binayah.",
};
const SERVICES = [
  { en: "Professional HDR Photography", ru: "Профессиональная HDR-съёмка", ar: "تصوير HDR احترافي", zh: "专业HDR摄影", vi: "Chụp ảnh HDR chuyên nghiệp", he: "צילום HDR מקצועי", icon: "📸", enBody: "Full-service property photography with HDR post-processing, sky replacement, and virtual staging options. Properties with professional photos receive 4x more inquiries." },
  { en: "Floor Plan & 3D Virtual Tour", ru: "Планировка и 3D-тур", ar: "مخطط الشقة وجولة 3D", zh: "平面图和3D虚拟参观", vi: "Mặt bằng & Tham quan ảo 3D", he: "תוכנית קומה וסיור וירטואלי תלת-ממדי", icon: "🗺️", enBody: "Measured floor plan drawings and Matterport 3D virtual tours. International buyers can virtually tour your property before flying to Dubai." },
  { en: "Multi-Portal Listing", ru: "Размещение на всех порталах", ar: "الإدراج على جميع المنصات", zh: "多平台挂牌", vi: "Niêm yết đa cổng", he: "פרסום רב-פורטלי", icon: "🌐", enBody: "Simultaneous listing on Bayut, Propertyfinder, Dubizzle, Binayah.ae, and 8+ additional portals. Premium featured placement to appear at the top of search results." },
  { en: "Social Media Campaigns", ru: "Кампании в социальных сетях", ar: "حملات وسائل التواصل الاجتماعي", zh: "社交媒体广告活动", vi: "Chiến dịch mạng xã hội", he: "קמפיינים ברשתות חברתיות", icon: "📱", enBody: "Targeted property promotions on Instagram, Facebook, YouTube, and LinkedIn reaching qualified buyer demographics in UAE, Russia, China, and Europe." },
  { en: "Video & Drone Footage", ru: "Видео и съёмка с дрона", ar: "فيديو ولقطات جوية بالطائرة المسيَّرة", zh: "视频和无人机拍摄", vi: "Video & Quay flycam", he: "וידאו וצילומי רחפן", icon: "🎥", enBody: "Cinematic property tours and drone aerial footage of the building and community. Video listings generate 3x more engagement than photo-only listings." },
  { en: "WhatsApp & CRM Marketing", ru: "WhatsApp и CRM-маркетинг", ar: "واتساب وتسويق CRM", zh: "WhatsApp和CRM营销", vi: "Tiếp thị WhatsApp & CRM", he: "שיווק ב-WhatsApp ו-CRM", icon: "💬", enBody: "Broadcast your listing to Binayah's database of 15,000+ qualified buyers and investors via WhatsApp and email. Instant exposure to motivated purchasers." },
];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const url = canonical(locale, "/real-estate-marketing");
  return {
    title: TITLES[locale] || TITLES.en,
    description: DESCS[locale] || DESCS.en,
    alternates: { canonical: url, languages: altLangs("/real-estate-marketing") },
    openGraph: { title: TITLES[locale] || TITLES.en, description: DESCS[locale] || DESCS.en, url, type: "website", locale: OG_LOCALE[locale] ?? "en_AE", images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630 }] },
    keywords: locale === "ru"
      ? ["маркетинг недвижимости дубай", "продать квартиру дубай агентство", "продвижение недвижимости дубай"]
      : locale === "ar" // vi branch below
      ? ["تسويق عقارات دبي", "بيع عقار دبي وكالة", "ترويج عقاري دبي"]
      : locale === "zh"
      ? ["迪拜房产营销", "迪拜出售房产代理", "迪拜房产推广"]
      : locale === "vi" ? ["tiếp thị bất động sản dubai", "bán bất động sản dubai môi giới", "quảng bá bất động sản dubai"] : locale === "he" ? ["שיווק נדל\"ן Dubai","שיווק נכסים Dubai","מכירת נכס Dubai סוכן","רישום נכסים Dubai"] : ["real estate marketing dubai", "property marketing dubai", "sell property dubai agent", "dubai property listing"],
  };
}

export default async function RealEstateMarketingPage({ params }: Props) {
  const { locale } = await params;
  const isRtl = locale === "ar" || locale === "he"; // ar, he are rtl; vi, zh, ru, en are ltr
  const lp = locale === "en" ? "" : `/${locale}`;

  const faqs = [
    { question: locale === "ru" ? "Как Binayah продвигает мою недвижимость?" : locale === "ar" ? "كيف تُسوِّق بناية عقاري؟" : locale === "zh" ? "Binayah如何营销我的房产？" : locale === "vi" ? "Binayah tiếp thị bất động sản của tôi như thế nào?" : locale === "he" ? "איך Binayah משווקים את הנכס שלי?" : "How does Binayah market my property?",
      answer: locale === "ru" ? "Мы проводим профессиональную фотосъёмку, размещаем объявление на всех основных порталах (Bayut, Propertyfinder, Dubizzle, Binayah.ae), продвигаем в социальных сетях и рассылаем нашей базе из 15 000+ покупателей через WhatsApp и email. Весь комплекс услуг — в рамках стандартной агентской комиссии." : locale === "vi" ? "Chúng tôi chụp ảnh chuyên nghiệp, niêm yết trên tất cả các cổng lớn (Bayut, Propertyfinder, Dubizzle, Binayah.ae), chạy chiến dịch mạng xã hội nhắm mục tiêu và phát đến cơ sở dữ liệu hơn 15.000 người mua đủ điều kiện qua WhatsApp và email. Tất cả bao gồm trong hoa hồng môi giới tiêu chuẩn." : locale === "he" ? "אנו מבצעים צילום מקצועי, מפרסמים בכל הפורטלים הגדולים (Bayut, Propertyfinder, Dubizzle, Binayah.ae), מנהלים קמפיינים ממוקדים ברשתות החברתיות, ומשדרים למאגר שלנו של יותר מ-15,000 קונים מוסמכים דרך WhatsApp ודואר אלקטרוני. הכל כלול בעמלת הסוכן הסטנדרטית." : "We conduct professional photography, list on all major portals (Bayut, Propertyfinder, Dubizzle, Binayah.ae), run targeted social media campaigns, and broadcast to our database of 15,000+ qualified buyers via WhatsApp and email. All included in the standard agent commission." },
    { question: locale === "ru" ? "Сколько стоит маркетинг недвижимости в Дубае?" : locale === "ar" ? "كم تكلّف تسويق العقارات في دبي؟" : locale === "zh" ? "迪拜房产营销费用是多少？" : locale === "vi" ? "Tiếp thị bất động sản tại Dubai tốn bao nhiêu?" : locale === "he" ? "כמה עולה שיווק נכס בדובאי?" : "How much does property marketing cost in Dubai?",
      answer: locale === "ru" ? "Стандартные маркетинговые услуги включены в агентскую комиссию (обычно 2% от стоимости продажи или 5% от годовой аренды). Профессиональная фотосъёмка, размещение на порталах и базовое продвижение в соцсетях — без дополнительной платы." : locale === "vi" ? "Các dịch vụ tiếp thị tiêu chuẩn được bao gồm trong hoa hồng môi giới (thường 2% giá bán hoặc 5% tiền thuê hàng năm đối với cho thuê). Chụp ảnh chuyên nghiệp, niêm yết trên cổng và quảng bá mạng xã hội cơ bản không tốn thêm chi phí. Các gói tiếp thị cao cấp (video flycam, tham quan 3D, chiến dịch quốc tế) có sẵn cho các bất động sản hàng đầu." : locale === "he" ? "שירותי שיווק סטנדרטיים כלולים בעמלת הסוכן (בדרך כלל 2% ממחיר המכירה או 5% משכר הדירה השנתי להשכרות). צילום מקצועי, פרסום בפורטלים וקידום בסיסי ברשתות החברתיות הם ללא עלות נוספת. חבילות שיווק פרימיום (וידאו רחפן, סיורים תלת-ממדיים, קמפיינים בינלאומיים) זמינות לנכסים ברמה גבוהה." : "Standard marketing services are included in the agent commission (typically 2% of sale price or 5% of annual rent for rentals). Professional photography, portal listings, and basic social media promotion are at no extra cost. Premium marketing packages (drone video, 3D tours, international campaigns) are available for top-tier properties." },
    { question: locale === "ru" ? "Как быстро Binayah продаёт или сдаёт недвижимость?" : locale === "ar" ? "ما سرعة بيع بناية للعقارات أو تأجيرها؟" : locale === "zh" ? "Binayah出售或出租房产需要多长时间？" : locale === "vi" ? "Binayah bán hoặc cho thuê bất động sản nhanh thế nào?" : locale === "he" ? "כמה מהר Binayah מוכרת או משכירה נכס?" : "How quickly does Binayah sell or rent a property?",
      answer: locale === "vi" ? "Với các bất động sản định giá tốt ở vị trí mạnh, Binayah thường nhận được yêu cầu đủ điều kiện trong vòng 24–72 giờ kể từ khi niêm yết. Giao dịch bán trung bình từ niêm yết đến MOU đã ký là 2–4 tuần. Bất động sản cho thuê thường tìm được khách thuê trong vòng 2–4 tuần. Bất động sản định giá quá cao có thể tồn nhiều tháng bất kể tiếp thị — định giá chính xác là yếu tố lớn nhất quyết định tốc độ bán." : locale === "he" ? "עבור נכסים במחיר טוב במיקומים חזקים, Binayah בדרך כלל מקבלת פניות מוסמכות תוך 24–72 שעות מרגע הפרסום. המכירה הממוצעת מרגע הפרסום ועד לחתימת מזכר הבנות היא 2–4 שבועות. נכסים להשכרה בדרך כלל מוצאים דייר תוך 2–4 שבועות. נכסים במחיר יתר יכולים להישאר חודשים ללא קשר לשיווק — תמחור מדויק הוא הגורם החשוב ביותר במהירות המכירה." : "For well-priced properties in strong locations, Binayah typically receives qualified inquiries within 24–72 hours of listing. The average sale from listing to signed MOU is 2–4 weeks. Rental properties typically find a tenant within 2–4 weeks. Overpriced properties can sit for months regardless of marketing — accurate pricing is the single biggest factor in speed of sale." },
    { question: locale === "ru" ? "Работает ли Binayah с иностранными покупателями?" : locale === "ar" ? "هل تعمل بناية مع المشترين الأجانب؟" : locale === "zh" ? "Binayah与外国买家合作吗？" : locale === "vi" ? "Binayah có tiếp cận người mua quốc tế không?" : locale === "he" ? "האם Binayah מגיעה לקונים בינלאומיים?" : "Does Binayah reach international buyers?",
      answer: locale === "ru" ? "Да. У Binayah — активная база российских, китайских, европейских и покупателей из стран Персидского залива. Мы продвигаем объекты на русскоязычных платформах и в русскоязычных социальных сетях, а также через международные порталы." : locale === "vi" ? "Có. Binayah có cơ sở dữ liệu khách mua Nga, Trung Quốc, châu Âu và GCC đang hoạt động. Chúng tôi tiếp thị bất động sản bằng tiếng Nga, Trung Quốc và Ả Rập trên các nền tảng xã hội quốc tế. Với bất động sản cao cấp, chúng tôi chạy chiến dịch nhắm mục tiêu tiếp cận nhà đầu tư giàu có quốc tế đã xác minh." : locale === "he" ? "כן. ל-Binayah יש מאגר פעיל של קונים רוסים, סינים, אירופאים וממדינות ה-GCC. אנו משווקים נכסים ברוסית, סינית וערבית בפלטפורמות חברתיות בינלאומיות. עבור נכסים פרימיום, אנו מנהלים קמפיינים ממוקדים המגיעים למשקיעים בינלאומיים בעלי הון גבוה מאומתים." : "Yes. Binayah has an active database of Russian, Chinese, European, and GCC buyers. We market properties in Russian, Chinese, and Arabic across international social platforms. For premium properties, we run targeted campaigns reaching verified international HNW investors." },
  ];

  const breadcrumbs = [
    { name: locale === "ru" ? "Главная" : locale === "ar" ? "الرئيسية" : locale === "zh" ? "首页" : locale === "vi" ? "Trang chủ" : locale === "he" ? "בית" : "Home", href: `${lp}/` },
    { name: locale === "ru" ? "Услуги" : locale === "ar" ? "الخدمات" : locale === "zh" ? "服务" : locale === "vi" ? "Dịch vụ" : locale === "he" ? "שירותים" : "Services", href: `${lp}/services` },
    { name: locale === "ru" ? "Маркетинг недвижимости" : locale === "ar" ? "تسويق العقارات" : locale === "zh" ? "房产营销" : locale === "vi" ? "Tiếp thị bất động sản" : locale === "he" ? "שיווק נדל\"ן" : "Real Estate Marketing", href: `${lp}/real-estate-marketing` },
  ];

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? "rtl" : "ltr"}>
      <FAQJsonLd faqs={faqs} />
      <BreadcrumbJsonLd items={breadcrumbs} />
      <Navbar />

      <section className="relative overflow-hidden pt-20 sm:pt-32 pb-10 sm:pb-16 text-white" style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}>
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)", backgroundSize: "48px 48px" }} />
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6">
          <p className="text-accent font-bold tracking-[0.4em] uppercase text-xs mb-4">
            {locale === "ru" ? "МАРКЕТИНГ НЕДВИЖИМОСТИ" : locale === "ar" ? "تسويق عقاري" : locale === "zh" ? "房产营销" : locale === "vi" ? "TIẾP THỊ BẤT ĐỘNG SẢN" : locale === "he" ? "שיווק נדל\"ן" : "REAL ESTATE MARKETING"}
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            {locale === "ru" ? "Продайте быстрее с Binayah" : locale === "ar" ? "بِع أسرع مع بناية" : locale === "zh" ? "与Binayah更快出售" : locale === "vi" ? "Bán nhanh hơn với Binayah" : locale === "he" ? "מכור מהר יותר עם Binayah" : "Sell Faster with Binayah"}
          </h1>
          <p className="text-primary-foreground/80 text-lg max-w-2xl mb-10">{DESCS[locale] || DESCS.en}</p>
          <div className="flex flex-wrap gap-4">
            <Link href={`${lp}/list-your-property`} className="font-bold px-8 py-4 rounded-xl hover:opacity-90 transition-all" style={{ background: "linear-gradient(135deg, #D4A847, #B8922F)", color: "#fff" }}>
              {locale === "ru" ? "Выставить объект" : locale === "ar" ? "أدرج عقارك" : locale === "zh" ? "挂牌出售" : locale === "vi" ? "Niêm yết bất động sản" : locale === "he" ? "רשום את הנכס שלך" : "List Your Property"} →
            </Link>
            <Link href={`${lp}/contact`} className="border-2 border-white/30 text-white font-bold px-8 py-4 rounded-xl hover:bg-white/10 transition-all">
              {locale === "ru" ? "Консультация" : locale === "ar" ? "استشارة" : locale === "zh" ? "咨询" : locale === "vi" ? "Tư vấn miễn phí" : locale === "he" ? "ייעוץ חינם" : "Free Consultation"}
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-border/50 bg-card">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-border/40">
            {[
              { n: "10+", label: locale === "ru" ? "Порталов размещения" : locale === "ar" ? "منصات الإدراج" : locale === "zh" ? "挂牌平台" : locale === "vi" ? "Cổng niêm yết" : locale === "he" ? "פורטלי רישום" : "Listing Portals" },
              { n: "15K+", label: locale === "ru" ? "База покупателей" : locale === "ar" ? "قاعدة المشترين" : locale === "zh" ? "买家数据库" : locale === "vi" ? "Cơ sở dữ liệu người mua" : locale === "he" ? "מאגר קונים" : "Buyer Database" },
              { n: "4x", label: locale === "ru" ? "Больше запросов" : locale === "ar" ? "مزيد من الاستفسارات" : locale === "zh" ? "更多询价" : locale === "vi" ? "Nhiều yêu cầu hơn" : locale === "he" ? "עוד פניות" : "More Inquiries" },
              { n: "17+", label: locale === "ru" ? "Лет опыта" : locale === "ar" ? "سنوات خبرة" : locale === "zh" ? "年经验" : locale === "vi" ? "Năm kinh nghiệm" : locale === "he" ? "שנות ניסיון" : "Years Experience" },
            ].map((s) => (
              <div key={s.label} className="py-6 px-4 sm:px-8 text-center">
                <p className="text-2xl font-black text-primary mb-1">{s.n}</p>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-12 sm:space-y-16">
        <section>
          <div className="text-center mb-10">
            <p className="text-accent font-bold tracking-[0.35em] uppercase text-xs mb-3">Services</p>
            <h2 className="text-3xl font-bold text-foreground">
              {locale === "ru" ? "Наши маркетинговые услуги" : locale === "ar" ? "خدماتنا التسويقية" : locale === "zh" ? "我们的营销服务" : locale === "vi" ? "Dịch vụ tiếp thị của chúng tôi" : locale === "he" ? "שירותי השיווק שלנו" : "Our Marketing Services"}
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {SERVICES.map((s) => (
              <div key={s.en} className="bg-card border border-border/50 rounded-2xl p-6 hover:border-primary/20 transition-all">
                <div className="text-2xl mb-3">{s.icon}</div>
                <h3 className="font-bold text-foreground mb-2 text-sm">
                  {locale === "ru" ? s.ru : locale === "ar" ? s.ar : locale === "zh" ? s.zh : locale === "vi" ? s.vi : locale === "he" ? s.he : s.en}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.enBody}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="text-center mb-10">
            <p className="text-accent font-bold tracking-[0.35em] uppercase text-xs mb-3">FAQ</p>
            <h2 className="text-3xl font-bold text-foreground">
              {locale === "ru" ? "Частые вопросы" : locale === "ar" ? "الأسئلة الشائعة" : locale === "zh" ? "常见问题" : locale === "vi" ? "Câu hỏi thường gặp" : locale === "he" ? "שאלות נפוצות" : "Frequently Asked Questions"}
            </h2>
          </div>
          <div className="space-y-3">
            {faqs.map((f, i) => (
              <details key={i} className="group bg-card border border-border/50 rounded-2xl overflow-hidden">
                <summary className="flex items-center justify-between gap-4 px-6 py-5 cursor-pointer list-none font-semibold text-foreground hover:text-primary text-sm sm:text-base">
                  <span>{f.question}</span>
                  <span className="text-accent text-xl font-light flex-shrink-0 group-open:rotate-45 transition-transform" aria-hidden="true">+</span>
                </summary>
                <div className="px-6 pb-6 text-sm text-muted-foreground border-t border-border/30 pt-4">{f.answer}</div>
              </details>
            ))}
          </div>
        </section>

        <section className="rounded-3xl p-10 sm:p-14 text-center text-white relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}>
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)", backgroundSize: "32px 32px" }} />
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-4">
              {locale === "ru" ? "Готовы продать или сдать?" : locale === "ar" ? "هل أنت مستعد للبيع أو التأجير؟" : locale === "zh" ? "准备好出售或出租了吗？" : locale === "vi" ? "Sẵn sàng bán hoặc cho thuê?" : locale === "he" ? "מוכנים למכור או להשכיר?" : "Ready to Sell or Rent?"}
            </h2>
            <p className="text-primary-foreground/75 text-lg mb-10 max-w-xl mx-auto">
              {locale === "ru" ? "Получите бесплатную рыночную оценку и маркетинговое предложение." : locale === "ar" ? "احصل على تقييم سوقي مجاني وعرض تسويقي." : locale === "zh" ? "获取免费市场估价和营销方案。" : locale === "vi" ? "Nhận định giá thị trường miễn phí và đề xuất tiếp thị từ đội ngũ của chúng tôi." : locale === "he" ? "קבלו הערכת שוק והצעת שיווק חינם מהצוות שלנו." : "Get a free market appraisal and marketing proposal from our team."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={`${lp}/list-your-property`} className="font-bold px-8 py-4 rounded-xl hover:opacity-90 transition-all" style={{ background: "linear-gradient(135deg, #D4A847, #B8922F)", color: "#fff" }}>
                {locale === "ru" ? "Выставить объект" : locale === "ar" ? "أدرج عقارك" : locale === "zh" ? "挂牌出售" : locale === "vi" ? "Niêm yết bất động sản" : locale === "he" ? "רשום את הנכס שלך" : "List Your Property"}
              </Link>
              <Link href={`${lp}/valuation`} className="border-2 border-white/30 text-white font-bold px-8 py-4 rounded-xl hover:bg-white/10 transition-all">
                {locale === "ru" ? "Оценить объект" : locale === "ar" ? "قيِّم عقارك" : locale === "zh" ? "估价房产" : locale === "vi" ? "Định giá miễn phí" : locale === "he" ? "קבלו הערכת שווי חינם" : "Get Free Valuation"}
              </Link>
            </div>
          </div>
        </section>
      </div>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
