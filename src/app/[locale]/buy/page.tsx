/* eslint-disable i18next/no-literal-string -- multilingual SEO landing page */
import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import SearchPageClient from "@/app/_clients/search/SearchPageClient";
import PropertyTypeSidebar from "@/components/PropertyTypeSidebar";
import { FAQJsonLd, BreadcrumbJsonLd } from "@/components/JsonLd";
import { canonical, altLangs, OG_LOCALE, DEFAULT_OG_IMAGE } from "@/lib/site";

export const dynamic = "force-dynamic";

const CONTENT = {
  he: {
    "metaTitle": "נכסים למכירה בדובאי | 3,000+ מודעות | Binayah",
    "metaDesc": "עיינו ב-3,000+ נכסים למכירה בדובאי — דירות, וילות, פרויקטים על הנייר (off-plan) ושוק משני. סננו לפי אזור, מחיר וחדרי שינה. מתעדכן מדי יום.",
    "heroLabel": "רכישת נכס בדובאי",
    "h1": "נכסים למכירה",
    "h1sub": "בדובאי",
    "heroDesc": "חפשו דירות, וילות, בתי טאון ופרויקטים על הנייר ביותר מ-60 קהילות ברחבי דובאי. מודעות מאומתות, מחירי DLD בזמן אמת וסוכנים מומחים זמינים 7 ימים בשבוע.",
    "stats": [
      {
        "n": "3,000+",
        "label": "נכסים למכירה"
      },
      {
        "n": "AED 350K",
        "label": "מחיר התחלתי"
      },
      {
        "n": "0%",
        "label": "מס רווחי הון"
      },
      {
        "n": "60+",
        "label": "קהילות"
      }
    ],
    "faqs": [
      {
        "question": "האם זרים יכולים לרכוש נכס בדובאי?",
        "answer": "כן. כל הלאומים יכולים לרכוש נכס בבעלות מלאה (freehold) באזורים המיועדים של דובאי — Dubai Marina, Downtown Dubai, JVC, Palm, Business Bay ועוד 60+ אזורים נוספים. אין צורך באשרת תושב. אתם מקבלים שטר בעלות מלא מטעם ה-DLD עם אותן זכויות בעלות כמו לאזרחי איחוד האמירויות."
      },
      {
        "question": "מהו תהליך רכישת נכס בדובאי?",
        "answer": "1) הסכמה על מחיר וחתימה על MOU (מזכר הבנות). 2) תשלום פיקדון של 10%. 3) קבלת NOC מהיזם. 4) העברת בעלות ב-DLD — תשלום עמלת העברה של 4%. 5) קבלת שטר הבעלות. התהליך אורך 3–6 שבועות בשוק המשני, ו-2–4 שבועות להזמנת נכס על הנייר."
      },
      {
        "question": "מהן העלויות הכוללות ברכישת נכס בדובאי?",
        "answer": "עמלת העברה של ה-DLD: 4% ממחיר הרכישה. עמלת סוכן: כ-2%. אגרה מנהלית של ה-DLD: AED 580. אגרת נאמן: AED 4,000 (נכסים מעל AED 500K). רישום משכנתה (אם רלוונטי): 0.25% מסכום ההלוואה. סך עלויות העסקה: כ-6–7% משווי הנכס."
      },
      {
        "question": "מהי ההשקעה המינימלית לרכישת נכס בדובאי?",
        "answer": "דירות סטודיו מתחילות מ-AED 300,000–500,000 (כ-82K$–136K$) בקהילות כמו JVC ו-Dubai South. לקבלת Golden Visa של איחוד האמירויות ל-10 שנים, שווי הנכס המינימלי הוא AED 2,000,000 (כ-545K$)."
      },
      {
        "question": "האם נכס בדובאי הוא השקעה טובה ב-2026?",
        "answer": "דובאי מציעה תשואות שכירות ברוטו של 5–8% (מהגבוהות בעולם), אפס מס רווחי הון, אפס מס הכנסה ומטבע מקובע ל-AED-USD. קהילות יוקרה רשמו עלייה של 40–60% בערך מאז 2021. היסודות — גידול אוכלוסין, מלאי וילות מצומצם ומעמד של מרכז עסקים — ממשיכים לתמוך."
      }
    ],
    "breadcrumb": "רכישה",
    "ctaTitle": "זקוקים לליווי מקצועי?",
    "ctaDesc": "הסוכנים שלנו, מוסמכי RERA, יסייעו לכם למצוא, לנהל משא ומתן ולהשלים את רכישת הנכס שלכם בדובאי — ללא עלות נוספת.",
    "ctaBtn": "שוחחו עם סוכן"
  },
  en: {
    metaTitle: "Properties for Sale in Dubai | 3,000+ Listings | Binayah",
    metaDesc: "Browse 3,000+ properties for sale in Dubai — apartments, villas, off-plan & secondary market. Filter by area, price and bedrooms. Updated daily.",
    heroLabel: "BUY PROPERTY IN DUBAI",
    h1: "Properties for Sale",
    h1sub: "in Dubai",
    heroDesc: "Search apartments, villas, townhouses and off-plan projects across 60+ Dubai communities. Verified listings, live DLD prices, and expert agents available 7 days a week.",
    stats: [
      { n: "3,000+", label: "Properties for Sale" },
      { n: "AED 350K", label: "Starting Price" },
      { n: "0%", label: "Capital Gains Tax" },
      { n: "60+", label: "Communities" },
    ],
    faqs: [
      { question: "Can foreigners buy property in Dubai?", answer: "Yes. All nationalities can buy freehold property in Dubai's designated zones — Marina, Downtown, JVC, Palm, Business Bay, and 60+ others. No residency required. You receive a full DLD title deed with the same ownership rights as UAE nationals." },
      { question: "What is the buying process for Dubai property?", answer: "1) Agree price & sign MOU (Memorandum of Understanding). 2) Pay 10% deposit. 3) Obtain NOC from developer. 4) DLD transfer — pay 4% transfer fee. 5) Receive title deed. The process takes 3–6 weeks for secondary market, 2–4 weeks for off-plan booking." },
      { question: "What are the total costs when buying property in Dubai?", answer: "DLD transfer fee: 4% of purchase price. Agent commission: ~2%. DLD admin fee: AED 580. Trustee fee: AED 4,000 (properties over AED 500K). Mortgage registration (if applicable): 0.25% of loan value. Total transaction costs: approximately 6–7% of property value." },
      { question: "What is the minimum investment to buy property in Dubai?", answer: "Studio apartments start from AED 300,000–500,000 (~$82K–$136K) in communities like JVC and Dubai South. For a 10-year UAE Golden Visa, the minimum property value is AED 2,000,000 (~$545K)." },
      { question: "Is Dubai property a good investment in 2026?", answer: "Dubai offers 5–8% gross rental yields (among the world's highest), zero capital gains tax, zero income tax, and an AED-USD pegged currency. Prime communities have seen 40–60% appreciation since 2021. The fundamentals — population growth, undersupplied villa stock, and business hub status — remain supportive." },
    ],
    breadcrumb: "Buy",
    ctaTitle: "Need Expert Guidance?",
    ctaDesc: "Our RERA-certified agents help you find, negotiate, and complete your Dubai property purchase — at no extra cost.",
    ctaBtn: "Talk to an Agent",
  },
  ru: {
    metaTitle: "Купить недвижимость в Дубае | 3000+ объектов | Binayah",
    metaDesc: "Более 3000 объектов на продажу в Дубае — квартиры, виллы, новостройки и вторичный рынок. Фильтр по району, цене и спальням. Обновляется ежедневно.",
    heroLabel: "КУПИТЬ НЕДВИЖИМОСТЬ В ДУБАЕ",
    h1: "Недвижимость на продажу",
    h1sub: "в Дубае",
    heroDesc: "Ищите квартиры, виллы, таунхаусы и новостройки в 60+ районах Дубая. Проверенные объявления, актуальные цены DLD и эксперты доступны 7 дней в неделю.",
    stats: [
      { n: "3 000+", label: "Объектов на продажу" },
      { n: "от 350K AED", label: "Стартовая цена" },
      { n: "0%", label: "Налог на прирост капитала" },
      { n: "60+", label: "Районов" },
    ],
    faqs: [
      { question: "Могут ли иностранцы покупать недвижимость в Дубае?", answer: "Да. Все национальности могут покупать фрихолд-недвижимость в специальных зонах Дубая — Марина, Даунтаун, JVC, Пальма, Бизнес-Бей и более 60 других. Вид на жительство не требуется. Вы получаете полноценное свидетельство DLD." },
      { question: "Каков процесс покупки недвижимости в Дубае?", answer: "1) Согласование цены и подписание MOU (меморандум о намерениях). 2) Оплата 10% задатка. 3) Получение NOC от застройщика. 4) Передача в DLD — уплата 4% сбора. 5) Получение свидетельства о праве собственности. Процесс занимает 3–6 недель для вторичного рынка, 2–4 недели для бронирования новостроек." },
      { question: "Каковы общие расходы при покупке недвижимости в Дубае?", answer: "Сбор DLD: 4% от стоимости. Комиссия агента: ~2%. Административный сбор DLD: 580 AED. Сбор за доверенность: 4 000 AED. Регистрация ипотеки (при наличии): 0,25% от суммы кредита. Итого: около 6–7% от стоимости объекта." },
      { question: "Какова минимальная сумма для покупки недвижимости в Дубае?", answer: "Студии начинаются от 300 000–500 000 AED (~$82–136 тыс.) в таких районах, как JVC и Дубай Саут. Для 10-летней Золотой визы ОАЭ минимальная стоимость объекта — 2 000 000 AED (~$545 тыс.)." },
      { question: "Выгодно ли инвестировать в недвижимость Дубая в 2026 году?", answer: "Дубай предлагает 5–8% доходности от аренды (одни из самых высоких в мире), нулевой налог на прирост капитала и подоходный налог, стабильную привязку AED к доллару. Премиальные районы выросли на 40–60% с 2021 года." },
    ],
    breadcrumb: "Купить",
    ctaTitle: "Нужна экспертная помощь?",
    ctaDesc: "Наши RERA-сертифицированные агенты помогут найти, согласовать и оформить покупку недвижимости в Дубае — без дополнительных расходов.",
    ctaBtn: "Связаться с агентом",
  },
  ar: {
    metaTitle: "عقارات للبيع في دبي | +3000 إعلان | بناية للعقارات",
    metaDesc: "أكثر من 3000 عقار للبيع في دبي — شقق وفلل وعلى الخارطة وثانوية. فلتر حسب المنطقة والسعر والغرف. يُحدَّث يومياً.",
    heroLabel: "شراء عقارات في دبي",
    h1: "عقارات للبيع",
    h1sub: "في دبي",
    heroDesc: "ابحث عن شقق وفلل وتاون هاوس ومشاريع على الخارطة في أكثر من 60 مجتمعًا في دبي. إعلانات موثَّقة وأسعار DLD حية وخبراء متاحون 7 أيام في الأسبوع.",
    stats: [
      { n: "+3000", label: "عقار للبيع" },
      { n: "350K درهم", label: "سعر البداية" },
      { n: "0%", label: "ضريبة أرباح رأس المال" },
      { n: "+60", label: "مجتمعًا" },
    ],
    faqs: [
      { question: "هل يمكن للأجانب شراء عقارات في دبي؟", answer: "نعم. يحق لجميع الجنسيات شراء عقارات حرة في المناطق المخصصة في دبي — المارينا ووسط المدينة وJVC والنخلة والخليج التجاري وأكثر من 60 منطقة أخرى. لا يُشترط الإقامة. تحصل على سند ملكية DLD رسمي." },
      { question: "ما إجراءات شراء العقار في دبي؟", answer: "١) الاتفاق على السعر وتوقيع MOU. ٢) دفع 10% عربون. ٣) الحصول على NOC من المطوّر. ٤) نقل الملكية في DLD مع رسوم 4%. ٥) استلام سند الملكية. تستغرق العملية 3-6 أسابيع للسوق الثانوية و2-4 أسابيع لحجز المشاريع على الخارطة." },
      { question: "ما التكاليف الإجمالية عند شراء عقار في دبي؟", answer: "رسوم DLD: 4% من سعر الشراء. عمولة الوكيل: ~2%. رسوم DLD الإدارية: 580 درهم. رسوم الوكالة: 4,000 درهم. تسجيل الرهن (إن وُجد): 0.25% من قيمة القرض. الإجمالي: ~6-7% من قيمة العقار." },
      { question: "ما الحد الأدنى للاستثمار في عقارات دبي؟", answer: "تبدأ الاستوديوهات من 300,000-500,000 درهم في مجتمعات كـJVC ودبي ساوث. للحصول على التأشيرة الذهبية لمدة 10 سنوات، الحد الأدنى لقيمة العقار 2,000,000 درهم." },
      { question: "هل عقارات دبي استثمار جيد في 2026؟", answer: "تُقدّم دبي عوائد إيجارية 5-8% (الأعلى عالميًا)، وصفر ضريبة مكاسب رأس المال، وصفر ضريبة دخل، وربط الدرهم بالدولار. ارتفعت المجتمعات المتميزة 40-60% منذ 2021." },
    ],
    breadcrumb: "شراء",
    ctaTitle: "تحتاج إرشادًا متخصصًا؟",
    ctaDesc: "يساعدك وكلاؤنا المعتمدون من RERA في إيجاد عقارك والتفاوض وإتمام صفقة شراء عقارك في دبي — دون تكاليف إضافية.",
    ctaBtn: "تحدث مع وكيل",
  },
  zh: {
    metaTitle: "迪拜房产出售 | 3000+房源 | Binayah Properties",
    metaDesc: "浏览3000多套迪拜在售房产——公寓、别墅、期房和二手房。按地区、价格和卧室筛选。每日更新。",
    heroLabel: "购买迪拜房产",
    h1: "迪拜在售房产",
    h1sub: "公寓 · 别墅 · 期房",
    heroDesc: "搜索迪拜60多个社区的公寓、别墅、联排别墅和期房项目。核实房源、实时DLD价格，专家每周7天为您服务。",
    stats: [
      { n: "3,000+", label: "在售房产" },
      { n: "35万AED", label: "起始价格" },
      { n: "0%", label: "资本利得税" },
      { n: "60+", label: "社区" },
    ],
    faqs: [
      { question: "外国人可以在迪拜购买房产吗？", answer: "可以。所有国籍均可在迪拜指定自由持有区购买房产——Marina、市中心、JVC、棕榈岛、商业湾等60多个地区。无需居住证。您将获得DLD官方产权证书。" },
      { question: "迪拜购房流程是怎样的？", answer: "1）议价并签署MOU（意向备忘录）。2）支付10%定金。3）获取开发商NOC。4）DLD过户——支付4%过户费。5）领取产权证书。二手房通常需3-6周，期房预订需2-4周。" },
      { question: "在迪拜购房的总费用是多少？", answer: "DLD过户费：购买价的4%。中介佣金：约2%。DLD行政费：580迪拉姆。公证费：4,000迪拉姆。按揭登记费（如适用）：贷款额的0.25%。总交易成本约为房产价值的6-7%。" },
      { question: "在迪拜购房的最低投资额是多少？", answer: "JVC和迪拜南区的单间公寓起价30-50万迪拉姆（约8.2-13.6万美元）。申请10年阿联酋黄金签证的最低房产价值为200万迪拉姆（约54.5万美元）。" },
      { question: "2026年投资迪拜房产是否明智？", answer: "迪拜提供5-8%租金收益率（全球最高之一）、零资本利得税、零所得税以及迪拉姆与美元的稳定挂钩。优质社区自2021年以来已升值40-60%。" },
    ],
    breadcrumb: "购买",
    ctaTitle: "需要专业指导？",
    ctaDesc: "我们的RERA认证经纪人帮助您在迪拜找到、谈判并完成房产购买——无额外费用。",
    ctaBtn: "联系经纪人",
  },
  vi: {
    metaTitle: "Bất động sản bán tại Dubai | 3.000+ tin đăng | Binayah",
    metaDesc: "Khám phá hơn 3.000 bất động sản bán tại Dubai — căn hộ, biệt thự, off-plan & thị trường thứ cấp. Lọc theo khu vực, giá và phòng ngủ. Cập nhật hàng ngày.",
    heroLabel: "MUA BẤT ĐỘNG SẢN TẠI DUBAI",
    h1: "Bất động sản bán",
    h1sub: "tại Dubai",
    heroDesc: "Tìm căn hộ, biệt thự, nhà phố và dự án off-plan trên 60+ khu vực Dubai. Tin đăng đã xác minh, giá DLD trực tiếp và chuyên viên sẵn sàng 7 ngày một tuần.",
    stats: [
      { n: "3.000+", label: "Bất động sản bán" },
      { n: "350K AED", label: "Giá khởi điểm" },
      { n: "0%", label: "Thuế lãi vốn" },
      { n: "60+", label: "Khu vực" },
    ],
    faqs: [
      { question: "Người nước ngoài có thể mua bất động sản tại Dubai không?", answer: "Có. Mọi quốc tịch đều có thể mua bất động sản freehold tại các khu được chỉ định của Dubai — Marina, Downtown, JVC, Palm, Business Bay và 60+ khu khác. Không cần cư trú. Bạn nhận sổ đỏ DLD đầy đủ với quyền sở hữu giống công dân UAE." },
      { question: "Quy trình mua bất động sản Dubai là gì?", answer: "1) Thỏa thuận giá & ký MOU (Bản ghi nhớ). 2) Trả 10% đặt cọc. 3) Lấy NOC từ chủ đầu tư. 4) Chuyển nhượng DLD — trả phí chuyển nhượng 4%. 5) Nhận sổ đỏ. Quy trình mất 3–6 tuần cho thị trường thứ cấp, 2–4 tuần cho đặt chỗ off-plan." },
      { question: "Tổng chi phí khi mua bất động sản tại Dubai là gì?", answer: "Phí chuyển nhượng DLD: 4% giá mua. Hoa hồng môi giới: ~2%. Phí quản lý DLD: 580 AED. Phí ủy thác: 4.000 AED (bất động sản trên 500K AED). Đăng ký vay thế chấp (nếu có): 0,25% giá trị khoản vay. Tổng chi phí giao dịch: khoảng 6–7% giá trị bất động sản." },
      { question: "Khoản đầu tư tối thiểu để mua bất động sản tại Dubai là bao nhiêu?", answer: "Căn hộ studio khởi điểm từ 300.000–500.000 AED (~82K–136K USD) tại các khu như JVC và Dubai South. Để nhận Golden Visa UAE 10 năm, giá trị bất động sản tối thiểu là 2.000.000 AED (~545K USD)." },
      { question: "Bất động sản Dubai có phải khoản đầu tư tốt năm 2026 không?", answer: "Dubai mang lại lợi suất cho thuê gộp 5–8% (cao nhất thế giới), 0 thuế lãi vốn, 0 thuế thu nhập và đồng tiền neo AED-USD. Các khu vực cao cấp đã tăng giá 40–60% kể từ năm 2021. Các yếu tố cơ bản — tăng dân số, nguồn cung biệt thự thiếu hụt và vị thế trung tâm kinh doanh — vẫn hỗ trợ." },
    ],
    breadcrumb: "Mua",
    ctaTitle: "Cần hướng dẫn chuyên gia?",
    ctaDesc: "Các chuyên viên được chứng nhận RERA của chúng tôi giúp bạn tìm, đàm phán và hoàn tất việc mua bất động sản tại Dubai — không tốn thêm chi phí.",
    ctaBtn: "Trao đổi với chuyên viên",
  },
} as const;

type Locale = keyof typeof CONTENT;
interface Props { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const c = CONTENT[(locale as Locale)] || CONTENT.en;
  const url = canonical(locale, "/buy");
  return {
    title: c.metaTitle,
    description: c.metaDesc,
    alternates: { canonical: url, languages: altLangs("/buy") },
    openGraph: {
      title: c.metaTitle, description: c.metaDesc, url,
      type: "website", locale: OG_LOCALE[locale] ?? "en_AE",
      images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630 }],
    },
    keywords: locale === "ru"
      ? ["купить недвижимость дубай", "квартиры на продажу дубай", "недвижимость дубай цены"]
      : locale === "ar" // vi branch below
      ? ["عقارات للبيع دبي", "شراء شقة دبي", "عقارات دبي أسعار"]
      : locale === "zh"
      ? ["迪拜房产出售", "购买迪拜房产", "迪拜公寓价格"]
      : locale === "vi" ? ["bất động sản bán dubai", "mua bất động sản dubai", "giá bất động sản dubai"] : locale === "he" ? ["נכסים למכירה בדובאי","קניית נכס בדובאי","נדל\"ן למכירה בדובאי","דירות למכירה בדובאי"] : ["properties for sale dubai", "buy property dubai", "dubai real estate for sale", "apartments for sale dubai"],
  };
}

export default async function BuyPage({ params }: Props) {
  const { locale } = await params;
  const c = CONTENT[(locale as Locale)] || CONTENT.en;
  const isRtl = locale === "ar" || locale === "he"; // ar, he are rtl; vi, zh, ru, en are ltr
  const lp = locale === "en" ? "" : `/${locale}`;

  const breadcrumbs = [
    { name: locale === "ru" ? "Главная" : locale === "ar" ? "الرئيسية" : locale === "zh" ? "首页" : locale === "vi" ? "Trang chủ" : locale === "he" ? "בית" : "Home", href: `${lp}/` },
    { name: c.breadcrumb, href: `${lp}/buy` },
  ];

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? "rtl" : "ltr"}>
      <FAQJsonLd faqs={[...c.faqs]} />
      <BreadcrumbJsonLd items={breadcrumbs} />
      <Navbar />

      {/* Hero */}
      <section
        className="relative overflow-hidden pt-20 sm:pt-28 pb-8 sm:pb-12 text-white"
        style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
      >
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)", backgroundSize: "48px 48px" }} />
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
          <p className="text-accent font-bold tracking-[0.4em] uppercase text-xs mb-3">{c.heroLabel}</p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-1">
            {c.h1} <span className="font-light text-primary-foreground/70">{c.h1sub}</span>
          </h1>
          <p className="text-primary-foreground/75 text-sm sm:text-base mt-3 max-w-2xl">{c.heroDesc}</p>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-border/50 bg-card">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-border/40">
            {c.stats.map((s) => (
              <div key={s.label} className="py-4 sm:py-5 px-3 sm:px-6 text-center">
                <p className="text-xl sm:text-2xl font-black text-primary mb-0.5">{s.n}</p>
                <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wide leading-tight">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Full-width embedded search (spans the page like the sections above) */}
      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8">
        <SearchPageClient defaultIntent="buy" syncUrl={false} />
      </div>

      {/* FAQ + CTA, with the sidebar starting here (below the full-width search) */}
      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 pb-12 sm:pb-16 lg:grid lg:grid-cols-[1fr_320px] lg:gap-8 lg:items-start">

        {/* Main column: FAQ + CTA */}
        <div className="min-w-0 space-y-12 sm:space-y-16">

          {/* FAQ */}
          <div>
            <div className="text-center mb-8">
              <p className="text-accent font-bold tracking-[0.35em] uppercase text-xs mb-3">FAQ</p>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                {locale === "ru" ? "Частые вопросы о покупке" : locale === "ar" ? "أسئلة شائعة عن الشراء" : locale === "zh" ? "购房常见问题" : locale === "vi" ? "Mua tại Dubai — Câu hỏi thường gặp" : locale === "he" ? "קנייה בדובאי — שאלות נפוצות" : "Buying in Dubai — FAQs"}
              </h2>
            </div>
            <div className="space-y-2 sm:space-y-3">
              {c.faqs.map((faq, i) => (
                <details key={i} className="group bg-card border border-border/50 rounded-2xl overflow-hidden">
                  <summary className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 sm:py-5 cursor-pointer list-none font-semibold text-foreground hover:text-primary transition-colors text-sm">
                    <span>{faq.question}</span>
                    <span className="text-accent text-lg font-light flex-shrink-0 group-open:rotate-45 transition-transform" aria-hidden="true">+</span>
                  </summary>
                  <div className="px-4 sm:px-6 pb-4 sm:pb-5 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/30 pt-3">{faq.answer}</div>
                </details>
              ))}
            </div>
          </div>

          {/* CTA */}
          <section
            className="rounded-2xl sm:rounded-3xl p-6 sm:p-10 text-center text-white relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
          >
            <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)", backgroundSize: "32px 32px" }} />
            <div className="relative z-10">
              <h2 className="text-2xl sm:text-3xl font-bold mb-3">{c.ctaTitle}</h2>
              <p className="text-primary-foreground/75 text-sm sm:text-base mb-7 max-w-lg mx-auto">{c.ctaDesc}</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href={`${lp}/contact`}
                  className="font-bold px-6 py-3 sm:px-8 sm:py-4 rounded-xl text-sm sm:text-base hover:opacity-90 transition-all"
                  style={{ background: "linear-gradient(135deg, #D4A847, #B8922F)", color: "#fff" }}
                >
                  {c.ctaBtn}
                </Link>
                <a
                  href="https://wa.me/971549988811"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-2 border-white/30 text-white font-bold px-6 py-3 sm:px-8 sm:py-4 rounded-xl text-sm sm:text-base hover:bg-white/10 transition-all"
                >
                  WhatsApp
                </a>
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="mt-12 lg:mt-0 lg:sticky lg:top-24 self-start lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:[scrollbar-width:none] lg:[&::-webkit-scrollbar]:hidden">
          <PropertyTypeSidebar locale={locale} slug="buy" />
        </aside>
      </div>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
