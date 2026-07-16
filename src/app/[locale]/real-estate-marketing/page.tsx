/* eslint-disable i18next/no-literal-string -- multilingual SEO landing page */
import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FAQJsonLd, BreadcrumbJsonLd } from "@/components/JsonLd";
import { canonical, altLangs, OG_LOCALE, DEFAULT_OG_IMAGE } from "@/lib/site";

export const revalidate = 86400;

interface Props { params: Promise<{ locale: string }> }

const TITLES: Record<string, string> = {
  fr: "Marketing Immobilier Dubaï | Listez & Vendez Plus Vite | Binayah Properties",
  en: "Real Estate Marketing Dubai | List & Sell Faster | Binayah Properties",
  ru: "Маркетинг недвижимости в Дубае | Продайте быстрее | Binayah Properties",
  ar: "تسويق عقارات دبي | بِع أسرع | بناية للعقارات",
  zh: "迪拜房产营销 | 更快出售 | Binayah Properties",
  vi: "Tiếp thị bất động sản Dubai | Niêm yết & Bán nhanh hơn | Binayah Properties",
  he: "שיווק נדל\"ן בדובאי | רשום ומכור מהר יותר | Binayah Properties",
};
const DESCS: Record<string, string> = {
  fr: "Marketing immobilier professionnel à Dubaï. Photographie HDR, annonces sur Bayut & Propertyfinder, réseaux sociaux et campagnes digitales. Vendez ou louez plus rapidement avec Binayah.",
  en: "Professional real estate marketing in Dubai. HDR photography, Bayut & Propertyfinder listings, social media, and digital campaigns. Sell or rent faster with Binayah.",
  ru: "Профессиональный маркетинг недвижимости в Дубае. HDR-фотосъёмка, размещение на Bayut и Propertyfinder, соцсети. Продайте или сдайте быстрее с Binayah.",
  ar: "تسويق عقاري احترافي في دبي. تصوير HDR وإدراج على Bayut وPropertyfinder وسوشيال ميديا. بِع أو أجِّر أسرع مع بناية.",
  zh: "迪拜专业房产营销。HDR摄影、Bayut和Propertyfinder挂牌、社交媒体和数字广告活动。与Binayah更快出售或出租。",
  vi: "Tiếp thị bất động sản chuyên nghiệp tại Dubai. Ảnh HDR, tin đăng Bayut & Propertyfinder, mạng xã hội và chiến dịch số. Bán hoặc cho thuê nhanh hơn với Binayah.",
  he: "שיווק נדל\"ן מקצועי בדובאי. צילום HDR, רישומים ב-Bayut ו-Propertyfinder, מדיה חברתית וקמפיינים דיגיטליים. מכרו או השכירו מהר יותר עם Binayah.",
};
const SERVICES = [
  { en: "Professional HDR Photography", fr: "Photographie HDR professionnelle", ru: "Профессиональная HDR-съёмка", ar: "تصوير HDR احترافي", zh: "专业HDR摄影", vi: "Chụp ảnh HDR chuyên nghiệp", he: "צילום HDR מקצועי", icon: "📸", body: { en: "Full-service property photography with HDR post-processing, sky replacement, and virtual staging options. Properties with professional photos receive 4x more inquiries.", fr: "Service complet de photographie immobilière avec post-traitement HDR, remplacement du ciel et options de home staging virtuel. Les biens dotés de photos professionnelles reçoivent 4x plus de demandes.", ru: "Полный комплекс услуг по фотосъемке недвижимости с HDR постобработкой, заменой неба и вариантами виртуальной постановки. Объекты с профессиональными фотографиями получают в 4 раза больше запросов.", ar: "خدمة تصوير عقارات شاملة مع معالجة HDR، واستبدال السماء، وخيارات التأثيث الافتراضي. العقارات التي تحتوي على صور احترافية تتلقى استفسارات أكثر بمقدار 4x.", zh: "全方位物业摄影服务，包含HDR后期处理、天空替换和虚拟布景选项。拥有专业照片的物业收到的询问量增加4倍。", vi: "Dịch vụ chụp ảnh bất động sản toàn diện với xử lý hậu kỳ HDR, thay thế bầu trời và tùy chọn dàn dựng ảo. Bất động sản có ảnh chuyên nghiệp nhận được nhiều yêu cầu hơn 4 lần.", he: "צילום נכסים מלא עם עיבוד HDR, החלפת שמיים ואפשרויות בימוי וירטואלי. נכסים עם תמונות מקצועיות מקבלים פי 4 יותר פניות." } },
  { en: "Floor Plan & 3D Virtual Tour", fr: "Plan d'étage et visite virtuelle 3D", ru: "Планировка и 3D-тур", ar: "مخطط الشقة وجولة 3D", zh: "平面图和3D虚拟参观", vi: "Mặt bằng & Tham quan ảo 3D", he: "תוכנית קומה וסיור וירטואלי תלת-ממדי", icon: "🗺️", body: { en: "Measured floor plan drawings and Matterport 3D virtual tours. International buyers can virtually tour your property before flying to Dubai.", fr: "Plans d'étage cotés et visites virtuelles 3D Matterport. Les acheteurs internationaux peuvent visiter votre bien virtuellement avant de s'envoler pour Dubaï.", ru: "Чертежи планов этажей и виртуальные туры Matterport 3D. Международные покупатели могут виртуально осмотреть вашу недвижимость до поездки в Дубай.", ar: "رسومات مخططات الطوابق المقاسة وجولات افتراضية Matterport 3D. يمكن للمشترين الدوليين القيام بجولة افتراضية في عقارك قبل السفر إلى دبي.", zh: "测量的平面图绘制和Matterport 3D虚拟导览。国际买家可以在飞往迪拜之前虚拟参观您的物业。", vi: "Bản vẽ mặt bằng đo lường và tour ảo 3D Matterport. Người mua quốc tế có thể tham quan ảo bất động sản của bạn trước khi bay đến Dubai.", he: "שרטוטי תוכניות קומה ומסלולי סיור וירטואליים Matterport 3D. קונים בינלאומיים יכולים לסייר בנכס שלך באופן וירטואלי לפני הטיסה לדובאי." } },
  { en: "Multi-Portal Listing", fr: "Diffusion multi-portails", ru: "Размещение на всех порталах", ar: "الإدراج على جميع المنصات", zh: "多平台挂牌", vi: "Niêm yết đa cổng", he: "פרסום רב-פורטלי", icon: "🌐", body: { en: "Simultaneous listing on Bayut, Propertyfinder, Dubizzle, Binayah.ae, and 8+ additional portals. Premium featured placement to appear at the top of search results.", fr: "Diffusion simultanée de votre annonce sur Bayut, Propertyfinder, Dubizzle, Binayah.ae et plus de 8 portails supplémentaires. Placement premium en vedette pour apparaître en tête des résultats de recherche.", ru: "Одновременное размещение на Bayut, Propertyfinder, Dubizzle, Binayah.ae и 8+ дополнительных порталах. Премиум размещение для появления в верхней части результатов поиска.", ar: "إدراج متزامن على Bayut وPropertyfinder وDubizzle وBinayah.ae و8+ بوابات إضافية. وضع مميز متميز للظهور في أعلى نتائج البحث.", zh: "同时在Bayut、Propertyfinder、Dubizzle、Binayah.ae和其他8+门户网站上列出。高级特色位置以在搜索结果顶部出现。", vi: "Đăng tin đồng thời trên Bayut, Propertyfinder, Dubizzle, Binayah.ae và hơn 8 cổng thông tin bổ sung khác. Vị trí nổi bật cao cấp để xuất hiện ở đầu kết quả tìm kiếm.", he: "רישום סימולטני ב-Bayut, Propertyfinder, Dubizzle, Binayah.ae, ו-8+ פורטלים נוספים. מיקום מוצג פרימיום להופעה בראש תוצאות החיפוש." } },
  { en: "Social Media Campaigns", fr: "Campagnes sur les réseaux sociaux", ru: "Кампании в социальных сетях", ar: "حملات وسائل التواصل الاجتماعي", zh: "社交媒体广告活动", vi: "Chiến dịch mạng xã hội", he: "קמפיינים ברשתות חברתיות", icon: "📱", body: { en: "Targeted property promotions on Instagram, Facebook, YouTube, and LinkedIn reaching qualified buyer demographics in UAE, Russia, China, and Europe.", fr: "Promotions immobilières ciblées sur Instagram, Facebook, YouTube et LinkedIn atteignant des profils d'acheteurs qualifiés aux Émirats, en Russie, en Chine et en Europe.", ru: "Целевая реклама недвижимости на Instagram, Facebook, YouTube и LinkedIn, охватывающая квалифицированные демографические группы покупателей в ОАЭ, России, Китае и Европе.", ar: "ترويج مستهدف للعقارات على Instagram وFacebook وYouTube وLinkedIn للوصول إلى ديموغرافيات المشترين المؤهلين في الإمارات وروسيا والصين وأوروبا.", zh: "在Instagram、Facebook、YouTube和LinkedIn上进行有针对性的物业推广，覆盖阿联酋、俄罗斯、中国和欧洲的合格买家群体。", vi: "Quảng cáo bất động sản có mục tiêu trên Instagram, Facebook, YouTube và LinkedIn tiếp cận các nhóm người mua đủ điều kiện tại UAE, Nga, Trung Quốc và Châu Âu.", he: "קידום ממוקד של נכסים ב-Instagram, Facebook, YouTube ו-LinkedIn המגיע לדמוגרפיה של קונים מוסמכים ב-UAE, רוסיה, סין ואירופה." } },
  { en: "Video & Drone Footage", fr: "Vidéo et prises de vue par drone", ru: "Видео и съёмка с дрона", ar: "فيديو ولقطات جوية بالطائرة المسيَّرة", zh: "视频和无人机拍摄", vi: "Video & Quay flycam", he: "וידאו וצילומי רחפן", icon: "🎥", body: { en: "Cinematic property tours and drone aerial footage of the building and community. Video listings generate 3x more engagement than photo-only listings.", fr: "Visites immobilières cinématographiques et prises de vue aériennes par drone du bâtiment et de la communauté. Les annonces vidéo génèrent 3x plus d'engagement que les annonces avec photos seules.", ru: "Кинематографические туры по недвижимости и аэрофотосъемка здания и сообщества с дрона. Видеообъявления генерируют в 3 раза больше вовлеченности, чем объявления только с фотографиями.", ar: "جولات سينمائية للعقارات ولقطات جوية بالطائرات بدون طيار للمبنى والمجتمع. القوائم بالفيديو تولد تفاعلًا أكثر بمقدار 3x من القوائم التي تحتوي على صور فقط.", zh: "电影级物业导览和建筑及社区的无人机航拍。视频列表比仅有照片的列表产生3倍的互动。", vi: "Tour bất động sản điện ảnh và cảnh quay trên không bằng drone của tòa nhà và cộng đồng. Danh sách video tạo ra sự tương tác nhiều hơn 3 lần so với danh sách chỉ có ảnh.", he: "סיורי נכסים קולנועיים וצילומי אוויר של הבניין והקהילה באמצעות רחפן. רישומי וידאו מייצרים פי 3 יותר מעורבות מאשר רישומים עם תמונות בלבד." } },
  { en: "WhatsApp & CRM Marketing", fr: "Marketing WhatsApp et CRM", ru: "WhatsApp и CRM-маркетинг", ar: "واتساب وتسويق CRM", zh: "WhatsApp和CRM营销", vi: "Tiếp thị WhatsApp & CRM", he: "שיווק ב-WhatsApp ו-CRM", icon: "💬", body: { en: "Broadcast your listing to Binayah's database of 15,000+ qualified buyers and investors via WhatsApp and email. Instant exposure to motivated purchasers.", fr: "Diffusez votre annonce à la base de données Binayah de plus de 15 000 acheteurs et investisseurs qualifiés via WhatsApp et email. Exposition instantanée auprès d'acheteurs motivés.", ru: "Распространите ваше объявление в базе данных Binayah из 15,000+ квалифицированных покупателей и инвесторов через WhatsApp и электронную почту. Мгновенное привлечение мотивированных покупателей.", ar: "قم ببث قائمتك إلى قاعدة بيانات Binayah التي تضم 15,000+ من المشترين والمستثمرين المؤهلين عبر WhatsApp والبريد الإلكتروني. تعرض فوري للمشترين المتحمسين.", zh: "通过WhatsApp和电子邮件将您的房源广播到Binayah的15,000+合格买家和投资者数据库。即时曝光给有购买意向的客户。", vi: "Phát sóng danh sách của bạn đến cơ sở dữ liệu của Binayah với hơn 15,000 người mua và nhà đầu tư đủ điều kiện qua WhatsApp và email. Tiếp xúc ngay lập tức với những người mua có động lực.", he: "שדר את הרישום שלך למאגר של Binayah עם 15,000+ קונים ומשקיעים מוסמכים דרך WhatsApp ודוא\"ל. חשיפה מיידית לרוכשים מוטיבציוניים." } },
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
    { question: locale === "fr" ? "Comment Binayah commercialise-t-il mon bien ?" : locale === "ru" ? "Как Binayah продвигает мою недвижимость?" : locale === "ar" ? "كيف تُسوِّق بناية عقاري؟" : locale === "zh" ? "Binayah如何营销我的房产？" : locale === "vi" ? "Binayah tiếp thị bất động sản của tôi như thế nào?" : locale === "he" ? "איך Binayah משווקים את הנכס שלי?" : "How does Binayah market my property?",
      answer: locale === "fr" ? "Nous réalisons une photographie professionnelle, diffusons l'annonce sur tous les grands portails (Bayut, Propertyfinder, Dubizzle, Binayah.ae), menons des campagnes ciblées sur les réseaux sociaux et diffusons à notre base de données de plus de 15 000 acheteurs qualifiés via WhatsApp et email. Le tout inclus dans la commission d'agence standard." : locale === "ar" ? "نقوم بتصوير احترافي، والإدراج على جميع المنصات الكبرى (Bayut، Propertyfinder، Dubizzle، Binayah.ae)، وإطلاق حملات مستهدفة على وسائل التواصل الاجتماعي، والبث إلى قاعدة بياناتنا التي تضم أكثر من 15,000 مشترٍ مؤهل عبر WhatsApp والبريد الإلكتروني. كل ذلك مشمول في عمولة الوكيل القياسية." : locale === "zh" ? "我们进行专业摄影，在所有主要门户网站（Bayut、Propertyfinder、Dubizzle、Binayah.ae）上挂牌，开展有针对性的社交媒体活动，并通过WhatsApp和电子邮件向我们超过15,000名合格买家的数据库进行推送。所有服务均包含在标准代理佣金内。" : locale === "ru" ? "Мы проводим профессиональную фотосъёмку, размещаем объявление на всех основных порталах (Bayut, Propertyfinder, Dubizzle, Binayah.ae), продвигаем в социальных сетях и рассылаем нашей базе из 15 000+ покупателей через WhatsApp и email. Весь комплекс услуг, в рамках стандартной агентской комиссии." : locale === "vi" ? "Chúng tôi chụp ảnh chuyên nghiệp, niêm yết trên tất cả các cổng lớn (Bayut, Propertyfinder, Dubizzle, Binayah.ae), chạy chiến dịch mạng xã hội nhắm mục tiêu và phát đến cơ sở dữ liệu hơn 15.000 người mua đủ điều kiện qua WhatsApp và email. Tất cả bao gồm trong hoa hồng môi giới tiêu chuẩn." : locale === "he" ? "אנו מבצעים צילום מקצועי, מפרסמים בכל הפורטלים הגדולים (Bayut, Propertyfinder, Dubizzle, Binayah.ae), מנהלים קמפיינים ממוקדים ברשתות החברתיות, ומשדרים למאגר שלנו של יותר מ-15,000 קונים מוסמכים דרך WhatsApp ודואר אלקטרוני. הכל כלול בעמלת הסוכן הסטנדרטית." : "We conduct professional photography, list on all major portals (Bayut, Propertyfinder, Dubizzle, Binayah.ae), run targeted social media campaigns, and broadcast to our database of 15,000+ qualified buyers via WhatsApp and email. All included in the standard agent commission." },
    { question: locale === "fr" ? "Combien coûte le marketing immobilier à Dubaï ?" : locale === "ru" ? "Сколько стоит маркетинг недвижимости в Дубае?" : locale === "ar" ? "كم تكلّف تسويق العقارات في دبي؟" : locale === "zh" ? "迪拜房产营销费用是多少？" : locale === "vi" ? "Tiếp thị bất động sản tại Dubai tốn bao nhiêu?" : locale === "he" ? "כמה עולה שיווק נכס בדובאי?" : "How much does property marketing cost in Dubai?",
      answer: locale === "fr" ? "Les services de marketing standard sont inclus dans la commission d'agence (généralement 2% du prix de vente ou 5% du loyer annuel pour les locations). La photographie professionnelle, la diffusion sur les portails et la promotion de base sur les réseaux sociaux sont sans frais supplémentaires. Des forfaits marketing premium (vidéo par drone, visites 3D, campagnes internationales) sont disponibles pour les biens haut de gamme." : locale === "ar" ? "خدمات التسويق القياسية مشمولة في عمولة الوكيل (عادةً 2% من سعر البيع أو 5% من الإيجار السنوي للتأجير). التصوير الاحترافي والإدراج على المنصات والترويج الأساسي على وسائل التواصل الاجتماعي بدون تكلفة إضافية. تتوفر باقات تسويق مميزة (فيديو بالطائرة المسيَّرة، جولات ثلاثية الأبعاد، حملات دولية) للعقارات الراقية." : locale === "zh" ? "标准营销服务包含在代理佣金内（通常为售价的2%或出租年租金的5%）。专业摄影、门户挂牌和基础社交媒体推广均无额外费用。高端营销套餐（无人机视频、3D参观、国际广告活动）适用于顶级物业。" : locale === "ru" ? "Стандартные маркетинговые услуги включены в агентскую комиссию (обычно 2% от стоимости продажи или 5% от годовой аренды). Профессиональная фотосъёмка, размещение на порталах и базовое продвижение в соцсетях, без дополнительной платы." : locale === "vi" ? "Các dịch vụ tiếp thị tiêu chuẩn được bao gồm trong hoa hồng môi giới (thường 2% giá bán hoặc 5% tiền thuê hàng năm đối với cho thuê). Chụp ảnh chuyên nghiệp, niêm yết trên cổng và quảng bá mạng xã hội cơ bản không tốn thêm chi phí. Các gói tiếp thị cao cấp (video flycam, tham quan 3D, chiến dịch quốc tế) có sẵn cho các bất động sản hàng đầu." : locale === "he" ? "שירותי שיווק סטנדרטיים כלולים בעמלת הסוכן (בדרך כלל 2% ממחיר המכירה או 5% משכר הדירה השנתי להשכרות). צילום מקצועי, פרסום בפורטלים וקידום בסיסי ברשתות החברתיות הם ללא עלות נוספת. חבילות שיווק פרימיום (וידאו רחפן, סיורים תלת-ממדיים, קמפיינים בינלאומיים) זמינות לנכסים ברמה גבוהה." : "Standard marketing services are included in the agent commission (typically 2% of sale price or 5% of annual rent for rentals). Professional photography, portal listings, and basic social media promotion are at no extra cost. Premium marketing packages (drone video, 3D tours, international campaigns) are available for top-tier properties." },
    { question: locale === "fr" ? "En combien de temps Binayah vend-il ou loue-t-il un bien ?" : locale === "ru" ? "Как быстро Binayah продаёт или сдаёт недвижимость?" : locale === "ar" ? "ما سرعة بيع بناية للعقارات أو تأجيرها؟" : locale === "zh" ? "Binayah出售或出租房产需要多长时间？" : locale === "vi" ? "Binayah bán hoặc cho thuê bất động sản nhanh thế nào?" : locale === "he" ? "כמה מהר Binayah מוכרת או משכירה נכס?" : "How quickly does Binayah sell or rent a property?",
      answer: locale === "fr" ? "Pour les biens correctement évalués dans des emplacements recherchés, Binayah reçoit généralement des demandes qualifiées dans les 24 à 72 heures suivant la mise en ligne. La vente moyenne, de la mise en ligne au protocole d'accord signé, prend 2 à 4 semaines. Les biens locatifs trouvent généralement un locataire en 2 à 4 semaines. Les biens surévalués peuvent rester sur le marché pendant des mois quel que soit le marketing : un prix juste est le facteur le plus déterminant pour la rapidité de vente." : locale === "ru" ? "Для объектов с адекватной ценой в востребованных локациях Binayah обычно получает квалифицированные запросы в течение 24–72 часов после публикации. Средняя продажа от публикации до подписания MOU занимает 2–4 недели. Арендные объекты обычно находят арендатора в течение 2–4 недель. Переоценённые объекты могут оставаться на рынке месяцами независимо от маркетинга — точная цена является главным фактором скорости продажи." : locale === "ar" ? "بالنسبة للعقارات ذات التسعير المناسب في المواقع القوية، تتلقى بناية عادةً استفسارات مؤهلة خلال 24-72 ساعة من الإدراج. متوسط البيع من الإدراج إلى توقيع مذكرة التفاهم هو 2-4 أسابيع. عادةً ما تجد العقارات المؤجَّرة مستأجرًا خلال 2-4 أسابيع. يمكن أن تبقى العقارات المبالغ في تسعيرها لأشهر بغض النظر عن التسويق، فالتسعير الدقيق هو العامل الأهم في سرعة البيع." : locale === "zh" ? "对于位置优越、定价合理的物业，Binayah通常在挂牌后24至72小时内收到合格询价。从挂牌到签署谅解备忘录的平均成交时间为2至4周。出租物业通常在2至4周内找到租客。定价过高的物业无论如何营销都可能滞销数月，准确定价是决定销售速度的最重要因素。" : locale === "vi" ? "Với các bất động sản định giá tốt ở vị trí mạnh, Binayah thường nhận được yêu cầu đủ điều kiện trong vòng 24-72 giờ kể từ khi niêm yết. Giao dịch bán trung bình từ niêm yết đến MOU đã ký là 2-4 tuần. Bất động sản cho thuê thường tìm được khách thuê trong vòng 2-4 tuần. Bất động sản định giá quá cao có thể tồn nhiều tháng bất kể tiếp thị, định giá chính xác là yếu tố lớn nhất quyết định tốc độ bán." : locale === "he" ? "עבור נכסים במחיר טוב במיקומים חזקים, Binayah בדרך כלל מקבלת פניות מוסמכות תוך 24-72 שעות מרגע הפרסום. המכירה הממוצעת מרגע הפרסום ועד לחתימת מזכר הבנות היא 2-4 שבועות. נכסים להשכרה בדרך כלל מוצאים דייר תוך 2-4 שבועות. נכסים במחיר יתר יכולים להישאר חודשים ללא קשר לשיווק, תמחור מדויק הוא הגורם החשוב ביותר במהירות המכירה." : "For well-priced properties in strong locations, Binayah typically receives qualified inquiries within 24-72 hours of listing. The average sale from listing to signed MOU is 2-4 weeks. Rental properties typically find a tenant within 2-4 weeks. Overpriced properties can sit for months regardless of marketing, accurate pricing is the single biggest factor in speed of sale." },
    { question: locale === "fr" ? "Binayah touche-t-il les acheteurs internationaux ?" : locale === "ru" ? "Работает ли Binayah с иностранными покупателями?" : locale === "ar" ? "هل تعمل بناية مع المشترين الأجانب؟" : locale === "zh" ? "Binayah与外国买家合作吗？" : locale === "vi" ? "Binayah có tiếp cận người mua quốc tế không?" : locale === "he" ? "האם Binayah מגיעה לקונים בינלאומיים?" : "Does Binayah reach international buyers?",
      answer: locale === "fr" ? "Oui. Binayah dispose d'une base de données active d'acheteurs russes, chinois, européens et des pays du Golfe. Nous commercialisons les biens en russe, en chinois et en arabe sur les plateformes sociales internationales. Pour les biens premium, nous menons des campagnes ciblées atteignant des investisseurs fortunés internationaux vérifiés." : locale === "ar" ? "نعم. تمتلك بناية قاعدة بيانات نشطة من المشترين الروس والصينيين والأوروبيين ومن دول مجلس التعاون الخليجي. نسوّق العقارات بالروسية والصينية والعربية عبر المنصات الاجتماعية الدولية. وبالنسبة للعقارات المميزة، نطلق حملات مستهدفة تصل إلى مستثمرين دوليين من ذوي الملاءة المالية العالية المُتحقَّق منهم." : locale === "zh" ? "是的。Binayah拥有活跃的俄罗斯、中国、欧洲和海湾国家买家数据库。我们在国际社交平台上以俄语、中文和阿拉伯语营销物业。对于高端物业，我们开展有针对性的广告活动，触达经过验证的国际高净值投资者。" : locale === "ru" ? "Да. У Binayah, активная база российских, китайских, европейских и покупателей из стран Персидского залива. Мы продвигаем объекты на русскоязычных платформах и в русскоязычных социальных сетях, а также через международные порталы." : locale === "vi" ? "Có. Binayah có cơ sở dữ liệu khách mua Nga, Trung Quốc, châu Âu và GCC đang hoạt động. Chúng tôi tiếp thị bất động sản bằng tiếng Nga, Trung Quốc và Ả Rập trên các nền tảng xã hội quốc tế. Với bất động sản cao cấp, chúng tôi chạy chiến dịch nhắm mục tiêu tiếp cận nhà đầu tư giàu có quốc tế đã xác minh." : locale === "he" ? "כן. ל-Binayah יש מאגר פעיל של קונים רוסים, סינים, אירופאים וממדינות ה-GCC. אנו משווקים נכסים ברוסית, סינית וערבית בפלטפורמות חברתיות בינלאומיות. עבור נכסים פרימיום, אנו מנהלים קמפיינים ממוקדים המגיעים למשקיעים בינלאומיים בעלי הון גבוה מאומתים." : "Yes. Binayah has an active database of Russian, Chinese, European, and GCC buyers. We market properties in Russian, Chinese, and Arabic across international social platforms. For premium properties, we run targeted campaigns reaching verified international HNW investors." },
  ];

  const breadcrumbs = [
    { name: locale === "fr" ? "Accueil" : locale === "ru" ? "Главная" : locale === "ar" ? "الرئيسية" : locale === "zh" ? "首页" : locale === "vi" ? "Trang chủ" : locale === "he" ? "בית" : "Home", href: `${lp}/` },
    { name: locale === "fr" ? "Services" : locale === "ru" ? "Услуги" : locale === "ar" ? "الخدمات" : locale === "zh" ? "服务" : locale === "vi" ? "Dịch vụ" : locale === "he" ? "שירותים" : "Services", href: `${lp}/services` },
    { name: locale === "fr" ? "Marketing immobilier" : locale === "ru" ? "Маркетинг недвижимости" : locale === "ar" ? "تسويق العقارات" : locale === "zh" ? "房产营销" : locale === "vi" ? "Tiếp thị bất động sản" : locale === "he" ? "שיווק נדל\"ן" : "Real Estate Marketing", href: `${lp}/real-estate-marketing` },
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
            {locale === "fr" ? "MARKETING IMMOBILIER" : locale === "ru" ? "МАРКЕТИНГ НЕДВИЖИМОСТИ" : locale === "ar" ? "تسويق عقاري" : locale === "zh" ? "房产营销" : locale === "vi" ? "TIẾP THỊ BẤT ĐỘNG SẢN" : locale === "he" ? "שיווק נדל\"ן" : "REAL ESTATE MARKETING"}
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            {locale === "fr" ? "Vendez plus vite avec Binayah" : locale === "ru" ? "Продайте быстрее с Binayah" : locale === "ar" ? "بِع أسرع مع بناية" : locale === "zh" ? "与Binayah更快出售" : locale === "vi" ? "Bán nhanh hơn với Binayah" : locale === "he" ? "מכור מהר יותר עם Binayah" : "Sell Faster with Binayah"}
          </h1>
          <p className="text-primary-foreground/80 text-lg max-w-2xl mb-10">{DESCS[locale] || DESCS.en}</p>
          <div className="flex flex-wrap gap-4">
            <Link href={`${lp}/list-your-property`} className="font-bold px-8 py-4 rounded-xl hover:opacity-90 transition-all" style={{ background: "linear-gradient(135deg, #D4A847, #B8922F)", color: "#fff" }}>
              {locale === "fr" ? "Publier votre bien" : locale === "ru" ? "Выставить объект" : locale === "ar" ? "أدرج عقارك" : locale === "zh" ? "挂牌出售" : locale === "vi" ? "Niêm yết bất động sản" : locale === "he" ? "רשום את הנכס שלך" : "List Your Property"} →
            </Link>
            <Link href={`${lp}/contact`} className="border-2 border-white/30 text-white font-bold px-8 py-4 rounded-xl hover:bg-white/10 transition-all">
              {locale === "fr" ? "Consultation gratuite" : locale === "ru" ? "Консультация" : locale === "ar" ? "استشارة" : locale === "zh" ? "咨询" : locale === "vi" ? "Tư vấn miễn phí" : locale === "he" ? "ייעוץ חינם" : "Free Consultation"}
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-border/50 bg-card">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-border/40">
            {[
              { n: "10+", label: locale === "fr" ? "Portails de diffusion" : locale === "ru" ? "Порталов размещения" : locale === "ar" ? "منصات الإدراج" : locale === "zh" ? "挂牌平台" : locale === "vi" ? "Cổng niêm yết" : locale === "he" ? "פורטלי רישום" : "Listing Portals" },
              { n: "15K+", label: locale === "fr" ? "Base d'acheteurs" : locale === "ru" ? "База покупателей" : locale === "ar" ? "قاعدة المشترين" : locale === "zh" ? "买家数据库" : locale === "vi" ? "Cơ sở dữ liệu người mua" : locale === "he" ? "מאגר קונים" : "Buyer Database" },
              { n: "4x", label: locale === "fr" ? "Plus de demandes" : locale === "ru" ? "Больше запросов" : locale === "ar" ? "مزيد من الاستفسارات" : locale === "zh" ? "更多询价" : locale === "vi" ? "Nhiều yêu cầu hơn" : locale === "he" ? "עוד פניות" : "More Inquiries" },
              { n: "19+", label: locale === "fr" ? "Ans d'expérience" : locale === "ru" ? "Лет опыта" : locale === "ar" ? "سنوات خبرة" : locale === "zh" ? "年经验" : locale === "vi" ? "Năm kinh nghiệm" : locale === "he" ? "שנות ניסיון" : "Years Experience" },
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
              {locale === "fr" ? "Nos services de marketing" : locale === "ru" ? "Наши маркетинговые услуги" : locale === "ar" ? "خدماتنا التسويقية" : locale === "zh" ? "我们的营销服务" : locale === "vi" ? "Dịch vụ tiếp thị của chúng tôi" : locale === "he" ? "שירותי השיווק שלנו" : "Our Marketing Services"}
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {SERVICES.map((s) => (
              <div key={s.en} className="bg-card border border-border/50 rounded-2xl p-6 hover:border-primary/20 transition-all">
                <div className="text-2xl mb-3">{s.icon}</div>
                <h3 className="font-bold text-foreground mb-2 text-sm">
                  {locale === "fr" ? s.fr : locale === "ru" ? s.ru : locale === "ar" ? s.ar : locale === "zh" ? s.zh : locale === "vi" ? s.vi : locale === "he" ? s.he : s.en}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.body[locale] || s.body.en}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="text-center mb-10">
            <p className="text-accent font-bold tracking-[0.35em] uppercase text-xs mb-3">FAQ</p>
            <h2 className="text-3xl font-bold text-foreground">
              {locale === "fr" ? "Questions fréquentes" : locale === "ru" ? "Частые вопросы" : locale === "ar" ? "الأسئلة الشائعة" : locale === "zh" ? "常见问题" : locale === "vi" ? "Câu hỏi thường gặp" : locale === "he" ? "שאלות נפוצות" : "Frequently Asked Questions"}
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
              {locale === "fr" ? "Prêt à vendre ou à louer ?" : locale === "ru" ? "Готовы продать или сдать?" : locale === "ar" ? "هل أنت مستعد للبيع أو التأجير؟" : locale === "zh" ? "准备好出售或出租了吗？" : locale === "vi" ? "Sẵn sàng bán hoặc cho thuê?" : locale === "he" ? "מוכנים למכור או להשכיר?" : "Ready to Sell or Rent?"}
            </h2>
            <p className="text-primary-foreground/75 text-lg mb-10 max-w-xl mx-auto">
              {locale === "fr" ? "Obtenez une estimation de marché et une proposition de marketing gratuites auprès de notre équipe." : locale === "ru" ? "Получите бесплатную рыночную оценку и маркетинговое предложение." : locale === "ar" ? "احصل على تقييم سوقي مجاني وعرض تسويقي." : locale === "zh" ? "获取免费市场估价和营销方案。" : locale === "vi" ? "Nhận định giá thị trường miễn phí và đề xuất tiếp thị từ đội ngũ của chúng tôi." : locale === "he" ? "קבלו הערכת שוק והצעת שיווק חינם מהצוות שלנו." : "Get a free market appraisal and marketing proposal from our team."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={`${lp}/list-your-property`} className="font-bold px-8 py-4 rounded-xl hover:opacity-90 transition-all" style={{ background: "linear-gradient(135deg, #D4A847, #B8922F)", color: "#fff" }}>
                {locale === "fr" ? "Publier votre bien" : locale === "ru" ? "Выставить объект" : locale === "ar" ? "أدرج عقارك" : locale === "zh" ? "挂牌出售" : locale === "vi" ? "Niêm yết bất động sản" : locale === "he" ? "רשום את הנכס שלך" : "List Your Property"}
              </Link>
              <Link href={`${lp}/valuation`} className="border-2 border-white/30 text-white font-bold px-8 py-4 rounded-xl hover:bg-white/10 transition-all">
                {locale === "fr" ? "Estimation gratuite" : locale === "ru" ? "Оценить объект" : locale === "ar" ? "قيِّم عقارك" : locale === "zh" ? "估价房产" : locale === "vi" ? "Định giá miễn phí" : locale === "he" ? "קבלו הערכת שווי חינם" : "Get Free Valuation"}
              </Link>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}
