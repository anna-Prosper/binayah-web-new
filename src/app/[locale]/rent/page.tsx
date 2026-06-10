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
  en: {
    metaTitle: "Properties for Rent in Dubai | Apartments & Villas | Binayah",
    metaDesc: "Find your perfect Dubai rental — apartments, villas, studios and townhouses. Verified listings with live prices. Move in ready. Search 1,000+ rentals now.",
    heroLabel: "RENT IN DUBAI",
    h1: "Properties for Rent",
    h1sub: "in Dubai",
    heroDesc: "Verified rental listings across all Dubai communities. Studios from AED 25K/year. Family villas from AED 90K/year. Find your home with Binayah's trusted rental agents.",
    stats: [
      { n: "1,000+", label: "Rental Listings" },
      { n: "AED 25K", label: "Studio from/year" },
      { n: "90K+", label: "Active Tenants" },
      { n: "48h", label: "Avg Match Time" },
    ],
    faqs: [
      { question: "What documents do I need to rent in Dubai?", answer: "Passport copy, Emirates ID (if resident) or visa, and post-dated cheques (or bank guarantee in some buildings). For annual rentals, most landlords require 1–4 post-dated cheques. You'll also need to register the tenancy contract with Ejari (DLD's tenancy system) — your agent handles this." },
      { question: "How does the rental process work in Dubai?", answer: "1) Find a property and agree on terms. 2) Sign the tenancy contract (standard RERA Form H). 3) Pay security deposit (usually 5% of annual rent) and first rent cheque(s). 4) Register with Ejari (AED 220). 5) Connect DEWA (electricity & water — AED 2,110 deposit, refundable on exit). Process takes 3–7 days." },
      { question: "Can a landlord increase my rent in Dubai?", answer: "Rent increases at renewal are capped by the RERA Rental Index. If your current rent is at or below the RERA benchmark, no increase is allowed. Increases are capped at 5–20% depending on how far below the index your current rent is. Check the RERA Rent Calculator (dubailand.gov.ae) before every renewal." },
      { question: "What is the cheapest area to rent in Dubai?", answer: "Most affordable areas: International City (studio from AED 18K), Dubai South (studio from AED 22K), Deira (1BR from AED 30K), JVC (studio from AED 28K). Best value with good connectivity: JVC, Al Quoz, and Al Nahda offer 20–35% savings vs Dubai Marina or Downtown for comparable unit sizes." },
      { question: "How much is the average rent in Dubai?", answer: "Studio: AED 28,000–55,000/year depending on area. 1-bedroom: AED 45,000–100,000/year. 2-bedroom: AED 70,000–160,000/year. 3-bedroom villa: AED 120,000–250,000/year. Dubai Marina and Downtown command premiums; JVC, JLT and Deira are significantly more affordable." },
    ],
    breadcrumb: "Rent",
    ctaTitle: "Need Help Finding a Rental?",
    ctaDesc: "Our rental agents shortlist properties matching your budget, community preference, and move-in date — free of charge for tenants.",
    ctaBtn: "Talk to a Rental Agent",
  },
  ru: {
    metaTitle: "Аренда недвижимости в Дубае | Квартиры и виллы | Binayah",
    metaDesc: "Найдите идеальное жильё в аренду в Дубае — квартиры, виллы, студии и таунхаусы. Проверенные объявления с актуальными ценами. Более 1000 объектов.",
    heroLabel: "АРЕНДА В ДУБАЕ",
    h1: "Аренда недвижимости",
    h1sub: "в Дубае",
    heroDesc: "Проверенные объявления об аренде во всех районах Дубая. Студии от 25 000 AED в год. Семейные виллы от 90 000 AED в год. Найдите жильё с надёжными агентами Binayah.",
    stats: [
      { n: "1 000+", label: "Объектов в аренду" },
      { n: "от 25К AED", label: "Студия в год" },
      { n: "90К+", label: "Активных арендаторов" },
      { n: "48ч", label: "Среднее время подбора" },
    ],
    faqs: [
      { question: "Какие документы нужны для аренды в Дубае?", answer: "Копия паспорта, Emirates ID (при наличии) или виза, постдатированные чеки (или банковская гарантия в некоторых зданиях). Для годовой аренды большинство арендодателей требуют 1–4 чека. Договор аренды нужно зарегистрировать в Ejari — агент оформляет это за вас." },
      { question: "Как работает процесс аренды в Дубае?", answer: "1) Выбор объекта и согласование условий. 2) Подписание договора аренды (стандартная форма RERA H). 3) Оплата депозита (обычно 5% от годовой арендной платы) и первого чека. 4) Регистрация в Ejari (220 AED). 5) Подключение DEWA (депозит 2 110 AED, возвращается). Процесс занимает 3–7 дней." },
      { question: "Может ли арендодатель поднять аренду в Дубае?", answer: "Повышение арендной платы при продлении ограничено индексом аренды RERA. Если ваша текущая аренда соответствует или ниже ориентира RERA, повышение не допускается. Проверьте Калькулятор арендной платы RERA на сайте dubailand.gov.ae перед каждым продлением." },
      { question: "Где самая дешёвая аренда в Дубае?", answer: "Наиболее доступные районы: Интернэшнл Сити (студия от 18 000 AED), Дубай Саут (от 22 000 AED), Дейра (1BR от 30 000 AED), JVC (студия от 28 000 AED). Хорошее соотношение цены и качества при развитой инфраструктуре: JVC, Аль-Куз, Аль-Нахда." },
      { question: "Сколько стоит средняя аренда в Дубае?", answer: "Студия: 28 000–55 000 AED/год. 1 спальня: 45 000–100 000 AED/год. 2 спальни: 70 000–160 000 AED/год. Вилла с 3 спальнями: 120 000–250 000 AED/год. Дубай Марина и Даунтаун — дороже; JVC, JLT и Дейра значительно доступнее." },
    ],
    breadcrumb: "Снять",
    ctaTitle: "Нужна помощь с поиском?",
    ctaDesc: "Наши агенты по аренде подберут объекты под ваш бюджет, предпочитаемый район и дату заезда — бесплатно для арендаторов.",
    ctaBtn: "Связаться с агентом",
  },
  ar: {
    metaTitle: "عقارات للإيجار في دبي | شقق وفلل | بناية للعقارات",
    metaDesc: "اعثر على إيجارك المثالي في دبي — شقق وفلل واستوديوهات وتاون هاوس. إعلانات موثَّقة بأسعار حية. أكثر من 1000 عقار.",
    heroLabel: "الإيجار في دبي",
    h1: "عقارات للإيجار",
    h1sub: "في دبي",
    heroDesc: "إعلانات إيجار موثَّقة في جميع مجتمعات دبي. استوديوهات من 25,000 درهم سنويًا. فلل عائلية من 90,000 درهم سنويًا. اعثر على منزلك مع وكلاء بناية الموثوقين.",
    stats: [
      { n: "+1000", label: "إعلان إيجار" },
      { n: "25K درهم", label: "استوديو/سنة" },
      { n: "+90K", label: "مستأجر نشط" },
      { n: "48س", label: "متوسط وقت المطابقة" },
    ],
    faqs: [
      { question: "ما الوثائق المطلوبة للإيجار في دبي؟", answer: "نسخة جواز سفر، هوية إماراتية (إن وُجدت) أو تأشيرة، وشيكات مؤجلة. لعقود الإيجار السنوية، يطلب معظم الملاك 1-4 شيكات. يجب تسجيل عقد الإيجار في منظومة إيجاري — يتولى وكيلك ذلك." },
      { question: "كيف تسير عملية الإيجار في دبي؟", answer: "١) إيجاد العقار والاتفاق على الشروط. ٢) توقيع عقد الإيجار (نموذج H المعتمد من RERA). ٣) دفع التأمين (عادةً 5% من الإيجار السنوي) وأول شيك. ٤) التسجيل في إيجاري (220 درهم). ٥) الاشتراك في ديوا (وديعة 2,110 درهم قابلة للاسترداد). تستغرق العملية 3-7 أيام." },
      { question: "هل يمكن للمالك رفع الإيجار في دبي؟", answer: "تخضع زيادات الإيجار عند التجديد لقيود مؤشر إيجار RERA. إذا كان إيجارك الحالي عند أو أدنى من المعيار، لا يُسمح بالزيادة. تحقق من حاسبة إيجار RERA على dubailand.gov.ae قبل كل تجديد." },
      { question: "أين أرخص مناطق الإيجار في دبي؟", answer: "أكثر المناطق تنافسيةً: المدينة العالمية (استوديو من 18,000 درهم)، دبي ساوث (من 22,000 درهم)، ديرة (1 غرفة من 30,000 درهم)، جميرا فيلدج سيركل (استوديو من 28,000 درهم)." },
      { question: "كم متوسط الإيجار في دبي؟", answer: "الاستوديو: 28,000-55,000 درهم/سنة. 1 غرفة نوم: 45,000-100,000 درهم/سنة. 2 غرفة نوم: 70,000-160,000 درهم/سنة. فيلا بـ 3 غرف: 120,000-250,000 درهم/سنة." },
    ],
    breadcrumb: "إيجار",
    ctaTitle: "تحتاج مساعدة في الإيجار؟",
    ctaDesc: "يختار وكلاؤنا المتخصصون في الإيجار عقارات تتناسب مع ميزانيتك وموقعك المفضل وتاريخ الانتقال — مجانًا للمستأجرين.",
    ctaBtn: "تحدث مع وكيل إيجار",
  },
  zh: {
    metaTitle: "迪拜租房 | 公寓和别墅出租 | Binayah Properties",
    metaDesc: "在迪拜找到您理想的租房——公寓、别墅、单间和联排别墅。核实房源，实时价格。1000多套出租房源。",
    heroLabel: "在迪拜租房",
    h1: "迪拜出租房产",
    h1sub: "公寓 · 别墅 · 单间",
    heroDesc: "迪拜所有社区的核实出租房源。单间公寓年租金从2.5万迪拉姆起。家庭别墅从9万迪拉姆起。通过Binayah可信赖的租赁经纪人找到您的家。",
    stats: [
      { n: "1,000+", label: "出租房源" },
      { n: "2.5万AED", label: "单间/年起" },
      { n: "9万+", label: "活跃租客" },
      { n: "48小时", label: "平均匹配时间" },
    ],
    faqs: [
      { question: "在迪拜租房需要哪些文件？", answer: "护照复印件、酋长国身份证（居民）或签证，以及远期支票（部分楼盘需银行担保）。年租合同通常需要1-4张支票。租赁合同需在EJARI登记（220迪拉姆）——您的经纪人会处理这些。" },
      { question: "迪拜租房流程是怎样的？", answer: "1）找到房源并商定条款。2）签署租赁合同（RERA标准H表格）。3）支付押金（通常为年租金的5%）和首张支票。4）EJARI登记（220迪拉姆）。5）开通DEWA水电（押金2,110迪拉姆，退租时退还）。整个过程需3-7天。" },
      { question: "迪拜房东可以提高租金吗？", answer: "续租时的租金涨幅受RERA租金指数限制。如果您的当前租金达到或低于RERA基准，则不允许涨价。每次续租前请在dubailand.gov.ae上查看RERA租金计算器。" },
      { question: "迪拜哪里租房最便宜？", answer: "最实惠的地区：国际城（单间从1.8万迪拉姆）、迪拜南区（从2.2万迪拉姆）、迪拉（1卧室从3万迪拉姆）、JVC（单间从2.8万迪拉姆）。" },
      { question: "迪拜的平均租金是多少？", answer: "单间：年租2.8-5.5万迪拉姆。1卧室：4.5-10万迪拉姆/年。2卧室：7-16万迪拉姆/年。3卧室别墅：12-25万迪拉姆/年。迪拜Marina和市中心租金较高；JVC、JLT和迪拉更实惠。" },
    ],
    breadcrumb: "租房",
    ctaTitle: "需要租房帮助？",
    ctaDesc: "我们的租赁经纪人根据您的预算、社区偏好和入住日期筛选房源——对租客免费。",
    ctaBtn: "联系租赁经纪人",
  },
  vi: {
    metaTitle: "Bất động sản cho thuê tại Dubai | Căn hộ & Biệt thự | Binayah",
    metaDesc: "Tìm bất động sản thuê hoàn hảo tại Dubai — căn hộ, biệt thự, studio và nhà phố. Tin đăng đã xác minh với giá trực tiếp. Sẵn vào ở. Tìm hơn 1.000 tin thuê ngay.",
    heroLabel: "THUÊ TẠI DUBAI",
    h1: "Bất động sản cho thuê",
    h1sub: "tại Dubai",
    heroDesc: "Tin đăng cho thuê đã xác minh trên tất cả khu vực Dubai. Studio từ 25K AED/năm. Biệt thự gia đình từ 90K AED/năm. Tìm ngôi nhà của bạn với chuyên viên cho thuê đáng tin cậy của Binayah.",
    stats: [
      { n: "1.000+", label: "Tin đăng cho thuê" },
      { n: "25K AED", label: "Studio từ/năm" },
      { n: "90K+", label: "Khách thuê đang hoạt động" },
      { n: "48h", label: "Thời gian so khớp TB" },
    ],
    faqs: [
      { question: "Tôi cần giấy tờ gì để thuê tại Dubai?", answer: "Bản sao hộ chiếu, Emirates ID (nếu là cư dân) hoặc thị thực, và chi phiếu ghi ngày sau (hoặc bảo lãnh ngân hàng ở một số tòa nhà). Với hợp đồng thuê hàng năm, hầu hết chủ nhà yêu cầu 1–4 chi phiếu ghi ngày sau. Bạn cũng cần đăng ký hợp đồng thuê với Ejari (hệ thống thuê của DLD) — chuyên viên của bạn xử lý việc này." },
      { question: "Quy trình thuê tại Dubai hoạt động như thế nào?", answer: "1) Tìm bất động sản và thỏa thuận điều khoản. 2) Ký hợp đồng thuê (Form H tiêu chuẩn RERA). 3) Trả tiền đặt cọc (thường 5% tiền thuê hàng năm) và chi phiếu thuê đầu tiên. 4) Đăng ký với Ejari (220 AED). 5) Kết nối DEWA (điện & nước — đặt cọc 2.110 AED, hoàn lại khi rời đi). Quy trình mất 3–7 ngày." },
      { question: "Chủ nhà có thể tăng tiền thuê của tôi tại Dubai không?", answer: "Tăng tiền thuê khi gia hạn bị giới hạn bởi Chỉ số Thuê RERA. Nếu tiền thuê hiện tại của bạn bằng hoặc thấp hơn chuẩn RERA, không được phép tăng. Mức tăng bị giới hạn ở 5–20% tùy thuộc vào tiền thuê hiện tại của bạn thấp hơn chỉ số bao nhiêu. Kiểm tra Máy tính Thuê RERA (dubailand.gov.ae) trước mỗi lần gia hạn." },
      { question: "Khu vực thuê rẻ nhất tại Dubai là đâu?", answer: "Các khu vực phải chăng nhất: International City (studio từ 18K AED), Dubai South (studio từ 22K AED), Deira (1PN từ 30K AED), JVC (studio từ 28K AED). Giá trị tốt nhất với kết nối tốt: JVC, Al Quoz và Al Nahda tiết kiệm 20–35% so với Dubai Marina hoặc Downtown cho diện tích căn tương đương." },
      { question: "Tiền thuê trung bình tại Dubai là bao nhiêu?", answer: "Studio: 28.000–55.000 AED/năm tùy khu vực. 1 phòng ngủ: 45.000–100.000 AED/năm. 2 phòng ngủ: 70.000–160.000 AED/năm. Biệt thự 3 phòng ngủ: 120.000–250.000 AED/năm. Dubai Marina và Downtown có giá cao hơn; JVC, JLT và Deira phải chăng hơn nhiều." },
    ],
    breadcrumb: "Thuê",
    ctaTitle: "Cần giúp tìm nhà thuê?",
    ctaDesc: "Các chuyên viên cho thuê của chúng tôi chọn lọc bất động sản phù hợp với ngân sách, khu vực ưa thích và ngày vào ở của bạn — miễn phí cho khách thuê.",
    ctaBtn: "Trao đổi với chuyên viên cho thuê",
  },
} as const;

type Locale = keyof typeof CONTENT;
interface Props { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const c = CONTENT[(locale as Locale)] || CONTENT.en;
  const url = canonical(locale, "/rent");
  return {
    title: c.metaTitle,
    description: c.metaDesc,
    alternates: { canonical: url, languages: altLangs("/rent") },
    openGraph: {
      title: c.metaTitle, description: c.metaDesc, url,
      type: "website", locale: OG_LOCALE[locale] ?? "en_AE",
      images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630 }],
    },
    keywords: locale === "ru"
      ? ["аренда квартир дубай", "снять квартиру дубай", "аренда жилья дубай"]
      : locale === "ar" // vi branch below
      ? ["شقق للإيجار دبي", "إيجار عقارات دبي", "استئجار شقة دبي"]
      : locale === "zh"
      ? ["迪拜租房", "迪拜公寓出租", "迪拜租住公寓"]
      : locale === "vi"
      ? ["bất động sản cho thuê dubai", "thuê căn hộ dubai", "tin đăng cho thuê dubai"]
      : ["properties for rent dubai", "rent apartment dubai", "dubai rental listings", "apartments for rent dubai"],
  };
}

export default async function RentPage({ params }: Props) {
  const { locale } = await params;
  const c = CONTENT[(locale as Locale)] || CONTENT.en;
  const isRtl = locale === "ar"; // vi, zh, ru, en are ltr
  const lp = locale === "en" ? "" : `/${locale}`;

  const breadcrumbs = [
    { name: locale === "ru" ? "Главная" : locale === "ar" ? "الرئيسية" : locale === "zh" ? "首页" : locale === "vi" ? "Trang chủ" : "Home", href: `${lp}/` },
    { name: c.breadcrumb, href: `${lp}/rent` },
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

      {/* Search + sidebar two-column region */}
      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 lg:grid lg:grid-cols-[1fr_320px] lg:gap-8 lg:items-start">

        {/* Main column: search + FAQ + CTA */}
        <div className="min-w-0 space-y-12 sm:space-y-16">
          <SearchPageClient defaultIntent="rent" syncUrl={false} />

          {/* FAQ */}
          <div>
            <div className="text-center mb-8">
              <p className="text-accent font-bold tracking-[0.35em] uppercase text-xs mb-3">FAQ</p>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                {locale === "ru" ? "Частые вопросы об аренде" : locale === "ar" ? "أسئلة شائعة عن الإيجار" : locale === "zh" ? "租房常见问题" : locale === "vi" ? "Thuê tại Dubai — Câu hỏi thường gặp" : "Renting in Dubai — FAQs"}
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
          <PropertyTypeSidebar locale={locale} slug="rent" />
        </aside>
      </div>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
