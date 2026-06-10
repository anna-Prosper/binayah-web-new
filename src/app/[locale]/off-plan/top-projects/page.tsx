/* eslint-disable i18next/no-literal-string -- multilingual SEO landing page */
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { FAQJsonLd, BreadcrumbJsonLd } from "@/components/JsonLd";
import { canonical, altLangs, OG_LOCALE, DEFAULT_OG_IMAGE } from "@/lib/site";
import { serverApiUrl, serverFetch } from "@/lib/api";

export const revalidate = 3600; // refresh every hour

// ─── Developer comparison data (editorial, updated quarterly) ───────────────

const DEVELOPERS = [
  {
    name: "Emaar Properties",
    flag: "🏆",
    founded: "1997",
    delivered: "90,000+",
    avgPriceSqft: "AED 1,800–3,500",
    avgYield: "5–7%",
    paymentPlan: "40/60 construction-linked",
    knownFor: "Downtown Dubai, Dubai Creek Harbour, Dubai Hills",
    bestFor: "Capital appreciation, iconic locations, long-term stability",
    rating: 5,
  },
  {
    name: "DAMAC Properties",
    flag: "🥈",
    founded: "2002",
    delivered: "46,000+",
    avgPriceSqft: "AED 1,200–2,800",
    avgYield: "5–8%",
    paymentPlan: "Post-handover up to 5 years",
    knownFor: "Damac Hills, Damac Lagoons, Cavalli Tower",
    bestFor: "Branded residences, flexible post-handover payments",
    rating: 4,
  },
  {
    name: "Sobha Realty",
    flag: "🥉",
    founded: "1976",
    delivered: "25,000+",
    avgPriceSqft: "AED 1,800–3,200",
    avgYield: "5–7%",
    paymentPlan: "40/60 construction-linked",
    knownFor: "Sobha Hartland, MBR City, Sobha Reserve",
    bestFor: "Build quality, family communities, greenery",
    rating: 4,
  },
  {
    name: "Binghatti Developers",
    flag: "⭐",
    founded: "2008",
    delivered: "20,000+",
    avgPriceSqft: "AED 1,100–2,000",
    avgYield: "6–9%",
    paymentPlan: "40/60 with 1% monthly installments",
    knownFor: "Binghatti Phantom, Bugatti Residences, Al Jaddaf",
    bestFor: "High rental yield, fast handover, affordable entry",
    rating: 4,
  },
  {
    name: "Ellington Properties",
    flag: "⭐",
    founded: "2014",
    delivered: "3,000+",
    avgPriceSqft: "AED 1,800–3,500",
    avgYield: "5–7%",
    paymentPlan: "20/80 with post-handover options",
    knownFor: "Ellington House, DT1, Belgravia",
    bestFor: "Design-led residences, boutique luxury",
    rating: 4,
  },
  {
    name: "Azizi Developments",
    flag: "⭐",
    founded: "2007",
    delivered: "11,000+",
    avgPriceSqft: "AED 900–1,600",
    avgYield: "6–8%",
    paymentPlan: "40/60 construction-linked",
    knownFor: "Azizi Riviera, Azizi Venice, Al Furjan",
    bestFor: "Affordable entry, high yield, diverse community",
    rating: 3,
  },
];

const CATEGORIES = {
  en: [
    { label: "Best for Capital Appreciation", dev: "Emaar Properties", why: "Downtown & Creek Harbour assets have delivered 40-60% appreciation since 2021. Emaar's brand commands resale premiums." },
    { label: "Best for Rental Yield", dev: "Binghatti Developers", why: "Binghatti projects in Al Jaddaf and Business Bay consistently achieve 7-9% gross yields — among the highest in Dubai." },
    { label: "Best for Families", dev: "Sobha Realty", why: "Sobha Hartland II and MBR City offer community living, international schools, and green spaces preferred by relocating families." },
    { label: "Best Payment Plan", dev: "DAMAC Properties", why: "DAMAC's post-handover payment plans (up to 5 years after keys) are the most buyer-friendly in the market." },
    { label: "Best Affordable Entry", dev: "Azizi Developments", why: "Studios from AED 500K in established communities. Azizi Riviera on the Dubai Canal offers canal views at competitive pricing." },
    { label: "Best Design & Finish", dev: "Ellington Properties", why: "Ellington's design-led approach and 5-star fit-out specifications position units at the premium end of the resale market." },
  ],
  ru: [
    { label: "Лучший для роста стоимости", dev: "Emaar Properties", why: "Объекты в Даунтаун и Дубай Крик Харбор выросли на 40–60% с 2021 года. Бренд Emaar обеспечивает премию при перепродаже." },
    { label: "Лучший для аренды", dev: "Binghatti Developers", why: "Проекты Binghatti в Al Jaddaf и Business Bay стабильно приносят 7–9% годовых — одни из лучших показателей в Дубае." },
    { label: "Лучший для семей", dev: "Sobha Realty", why: "Sobha Hartland II и MBR City предлагают комьюнити-формат, международные школы и зелёные зоны для семей с детьми." },
    { label: "Лучший план рассрочки", dev: "DAMAC Properties", why: "Планы DAMAC с отсроченными платежами до 5 лет после получения ключей — самые гибкие на рынке." },
    { label: "Лучший вход в рынок", dev: "Azizi Developments", why: "Студии от 500 000 AED в устоявшихся районах. Azizi Riviera на канале — отличное соотношение цены и качества." },
    { label: "Лучший дизайн и отделка", dev: "Ellington Properties", why: "Дизайнерский подход и отделка 5-звёздочного уровня обеспечивают Ellington-объектам премиум при перепродаже." },
  ],
  ar: [
    { label: "الأفضل لارتفاع القيمة", dev: "Emaar Properties", why: "ارتفعت أصول داون تاون وكريك هاربر بنسبة 40-60% منذ 2021. تتمتع علامة إعمار بمكانة متميزة في سوق إعادة البيع." },
    { label: "الأفضل للعائد الإيجاري", dev: "Binghatti Developers", why: "تحقق مشاريع بن غاطي في الجداف والخليج التجاري عوائد إيجارية 7-9% باستمرار — من أعلى المعدلات في دبي." },
    { label: "الأفضل للعائلات", dev: "Sobha Realty", why: "يوفر هارتلاند II ومدينة محمد بن راشد نمط الحياة الأسري مع مدارس دولية ومساحات خضراء." },
    { label: "أفضل خطة دفع", dev: "DAMAC Properties", why: "خطط داماك للدفع بعد التسليم تصل إلى 5 سنوات — الأكثر مرونةً في السوق." },
    { label: "أفضل سعر دخول", dev: "Azizi Developments", why: "استوديوهات من 500,000 درهم في مجتمعات راسخة. أزيزي ريفيرا على قناة دبي بأسعار تنافسية." },
    { label: "أفضل تصميم وتشطيب", dev: "Ellington Properties", why: "المقاربة التصميمية ومعايير التشطيب الخمسة نجوم تجعل وحدات إلينغتون متميزةً في سوق إعادة البيع." },
  ],
  zh: [
    { label: "最佳资本增值", dev: "Emaar Properties", why: "市中心和迪拜溪港资产自2021年以来上涨40-60%。Emaar品牌在二手市场享有溢价。" },
    { label: "最佳租金收益", dev: "Binghatti Developers", why: "Binghatti在Jaddaf和商业湾的项目consistently实现7-9%毛收益率——迪拜最高之一。" },
    { label: "最适合家庭", dev: "Sobha Realty", why: "Sobha Hartland II和MBR城提供社区式居住、国际学校和绿化空间，深受搬迁家庭青睐。" },
    { label: "最佳付款计划", dev: "DAMAC Properties", why: "DAMAC的交房后分期付款计划（最长5年）是市场上最灵活的买家友好方案。" },
    { label: "最佳低门槛入市", dev: "Azizi Developments", why: "成熟社区单间公寓起价50万迪拉姆。Azizi Riviera沿迪拜运河，性价比突出。" },
    { label: "最佳设计与精装", dev: "Ellington Properties", why: "Ellington以设计为核心的理念和五星级装修标准使其单位在二手市场具有溢价空间。" },
  ],
  vi: [
    { label: "Tốt nhất cho tăng giá vốn", dev: "Emaar Properties", why: "Tài sản tại Downtown & Creek Harbour đã tăng giá 40-60% kể từ năm 2021. Thương hiệu Emaar mang lại mức giá cao hơn khi bán lại." },
    { label: "Tốt nhất cho lợi suất cho thuê", dev: "Binghatti Developers", why: "Các dự án Binghatti tại Al Jaddaf và Business Bay liên tục đạt lợi suất gộp 7-9% — trong số cao nhất Dubai." },
    { label: "Tốt nhất cho gia đình", dev: "Sobha Realty", why: "Sobha Hartland II và MBR City mang đến lối sống cộng đồng, trường quốc tế và không gian xanh được các gia đình chuyển đến ưa thích." },
    { label: "Kế hoạch thanh toán tốt nhất", dev: "DAMAC Properties", why: "Kế hoạch thanh toán sau bàn giao của DAMAC (lên đến 5 năm sau khi nhận chìa khóa) là thân thiện với người mua nhất trên thị trường." },
    { label: "Điểm vào giá phải chăng nhất", dev: "Azizi Developments", why: "Studio từ 500K AED tại các khu vực lâu đời. Azizi Riviera trên Kênh Dubai mang đến view kênh với giá cạnh tranh." },
    { label: "Thiết kế & Hoàn thiện tốt nhất", dev: "Ellington Properties", why: "Cách tiếp cận lấy thiết kế làm trung tâm và tiêu chuẩn hoàn thiện 5 sao của Ellington định vị các căn ở phân khúc cao cấp của thị trường bán lại." },
  ],
};

const CONTENT = {
  en: {
    metaTitle: "Best Off-Plan Projects in Dubai 2026 | New Launches | Binayah",
    metaDesc: "Compare Dubai's top off-plan developments for 2026. Emaar, DAMAC, Sobha, Binghatti — ROI, payment plans, yields, and live project listings from Binayah Properties.",
    heroLabel: "OFF-PLAN DUBAI 2026",
    h1: "Best Off-Plan Projects",
    h1sub: "in Dubai 2026",
    heroDesc: "Compare the top off-plan developers and new launch projects in Dubai. We rank by ROI potential, payment plan flexibility, build quality, and rental yield — with live listings updated daily.",
    devTitle: "Developer Comparison",
    devSubtitle: "Key metrics for Dubai's top off-plan developers",
    catTitle: "Best For Every Buyer Type",
    projectsTitle: "Latest Off-Plan Launches",
    fromLabel: "From",
    noPrice: "Price on request",
    viewAll: "Browse All Off-Plan Projects",
    faqs: [
      { question: "Which developer has the best off-plan projects in Dubai 2026?", answer: "Emaar leads for long-term capital appreciation (Downtown, Dubai Hills, Creek Harbour). Binghatti delivers the highest rental yields (7-9%) in mid-market locations. DAMAC offers the most flexible post-handover payment plans. Sobha Realty is top-rated for build quality and family communities. The 'best' developer depends entirely on your investment goals — ROI-focused buyers and end-users prioritise different criteria." },
      { question: "What is the average price of off-plan property in Dubai 2026?", answer: "Off-plan prices in Dubai vary enormously by location and developer. Entry-level (JVC, Dubai South, Arjan): AED 500K–900K for studios/1BR. Mid-market (Business Bay, Al Jaddaf, JBR): AED 900K–2M. Premium (Downtown, Dubai Marina, Palm): AED 2M–5M. Ultra-luxury (Palm Jumeirah, DIFC, Bluewaters): AED 5M+. The average off-plan transaction in Dubai in 2025 was approximately AED 1.8M." },
      { question: "What payment plans do Dubai off-plan developers offer in 2026?", answer: "Standard construction-linked plan: 10% booking + 10% on SPA + 30% during construction + 50% on handover. Extended post-handover plans (DAMAC, some Binghatti projects): 40% during construction + 60% over 2-5 years after handover. Zero interest is standard — developer financing plans carry no extra interest charge. Some developers offer 1% monthly installments." },
      { question: "What ROI can I expect from off-plan property in Dubai?", answer: "Typical rental yields for Dubai off-plan post-handover: 5-9% gross depending on location and developer. Capital appreciation (pre-handover flipping): 10-40% potential in rising markets. Since 2021, Emaar projects have delivered 40-70% capital appreciation from off-plan price to current market value. Past performance varies — prime locations and established developers historically outperform." },
      { question: "Is buying off-plan in Dubai safe in 2026?", answer: "Dubai has among the world's strongest off-plan buyer protections. RERA requires developers to place buyer payments in ring-fenced DLD escrow accounts — funds cannot be used until construction milestones are reached. All projects must be RERA-registered. Developers must post a completion guarantee bond. No reputable developer (Emaar, DAMAC, Sobha, Binghatti) has failed to deliver a registered project. However, smaller developers and new entrants carry more risk." },
      { question: "Can I resell an off-plan property before handover in Dubai?", answer: "Yes, once you have paid 30-40% of the property value (the threshold varies by developer). This is called a 'resale off-plan' transaction. Binayah handles both the original purchase and subsequent resale — our off-plan team tracks pre-handover opportunities across all major developments." },
    ],
    breadcrumb: "Top Projects 2026",
    catLabel: "Category",
  },
  ru: {
    metaTitle: "Лучшие новостройки Дубая 2026 | Сравнение застройщиков | Binayah",
    metaDesc: "Сравните лучшие новостройки Дубая 2026: Emaar, DAMAC, Sobha, Binghatti. ROI, планы рассрочки, доходность и актуальные объекты от Binayah Properties.",
    heroLabel: "НОВОСТРОЙКИ ДУБАЙ 2026",
    h1: "Лучшие новостройки",
    h1sub: "в Дубае 2026",
    heroDesc: "Сравниваем ведущих застройщиков и новые проекты Дубая. Ранжируем по потенциалу ROI, гибкости рассрочки, качеству строительства и доходности — с актуальными объектами, обновляемыми ежедневно.",
    devTitle: "Сравнение застройщиков",
    devSubtitle: "Ключевые показатели ведущих застройщиков Дубая",
    catTitle: "Лучший вариант для каждого типа инвестора",
    projectsTitle: "Последние запуски новостроек",
    fromLabel: "От",
    noPrice: "Цена по запросу",
    viewAll: "Смотреть все новостройки",
    faqs: [
      { question: "Какой застройщик предлагает лучшие новостройки в Дубае в 2026 году?", answer: "Emaar лидирует по долгосрочному росту стоимости (Даунтаун, Dubai Hills, Creek Harbour). Binghatti обеспечивает самую высокую арендную доходность (7–9%) в среднем ценовом сегменте. DAMAC предлагает наиболее гибкие планы оплаты после получения ключей. Sobha — лидер по качеству строительства и семейным комьюнити. Выбор «лучшего» застройщика зависит от ваших инвестиционных целей." },
      { question: "Какова средняя цена новостройки в Дубае в 2026 году?", answer: "Цены на новостройки в Дубае сильно варьируются в зависимости от района. Эконом-сегмент (JVC, Дубай Саут): 500–900 тыс. AED за студию/1BR. Средний сегмент (Бизнес-Бей, Al Jaddaf): 900 тыс. – 2 млн AED. Премиум (Даунтаун, Марина): 2–5 млн AED. Средняя стоимость сделки с новостройкой в Дубае в 2025 году составила около 1,8 млн AED." },
      { question: "Какие планы рассрочки предлагают застройщики в 2026 году?", answer: "Стандартный план: 10% при бронировании + 10% при SPA + 30% в ходе строительства + 50% при сдаче. Расширенный пост-хандоверный план (DAMAC): 40% в ходе строительства + 60% в течение 2–5 лет после сдачи. Рассрочка беспроцентная. Ряд застройщиков предлагает ежемесячные платежи 1% от стоимости." },
      { question: "Какой ROI можно ожидать от новостройки в Дубае?", answer: "Типичная арендная доходность после сдачи: 5–9% годовых в зависимости от локации и застройщика. Потенциал роста стоимости на этапе строительства (флиппинг): 10–40% на растущем рынке. С 2021 года объекты Emaar выросли на 40–70% от цены покупки off-plan до текущей рыночной стоимости." },
      { question: "Насколько безопасна покупка новостройки в Дубае в 2026 году?", answer: "В Дубае одна из сильнейших в мире систем защиты покупателей новостроек. RERA обязывает застройщиков хранить средства покупателей на эскроу-счетах DLD — они недоступны до достижения строительных этапов. Все проекты проходят регистрацию в RERA. Крупные застройщики (Emaar, DAMAC, Sobha, Binghatti) не имеют случаев срыва зарегистрированных проектов." },
      { question: "Можно ли продать новостройку до получения ключей?", answer: "Да, после оплаты 30–40% стоимости объекта (порог варьируется у разных застройщиков). Это называется перепродажей на этапе строительства. Binayah сопровождает как первичную покупку, так и последующую перепродажу." },
    ],
    breadcrumb: "Топ проектов 2026",
    catLabel: "Категория",
  },
  ar: {
    metaTitle: "أفضل مشاريع على الخارطة في دبي 2026 | مقارنة المطوّرين | بناية",
    metaDesc: "قارن بين أفضل مشاريع دبي على الخارطة لعام 2026: إعمار وداماك وسوبها وبن غاطي. العائد وخطط الدفع والعوائد الإيجارية.",
    heroLabel: "على الخارطة دبي 2026",
    h1: "أفضل المشاريع على الخارطة",
    h1sub: "في دبي 2026",
    heroDesc: "نقارن بين كبار المطوّرين والمشاريع الجديدة في دبي. نُرتِّب وفق إمكانية العائد ومرونة الدفع وجودة البناء والعائد الإيجاري — مع قوائم مُحدَّثة يوميًا.",
    devTitle: "مقارنة المطوّرين",
    devSubtitle: "مؤشرات رئيسية لأبرز مطوّري دبي",
    catTitle: "الأفضل لكل نوع من المستثمرين",
    projectsTitle: "أحدث الإطلاقات على الخارطة",
    fromLabel: "يبدأ من",
    noPrice: "السعر عند الطلب",
    viewAll: "تصفّح جميع المشاريع على الخارطة",
    faqs: [
      { question: "أيّ مطوّر يمتلك أفضل مشاريع على الخارطة في دبي 2026؟", answer: "تتصدر إعمار في ارتفاع قيمة رأس المال على المدى البعيد (وسط المدينة، دبي هيلز، كريك هاربر). تُحقّق بن غاطي أعلى عائدات إيجارية (7-9%) في الشريحة المتوسطة. تُقدّم داماك أكثر خطط السداد مرونةً. تتميز سوبها بجودة البناء والمجتمعات العائلية. يعتمد «الأفضل» كليًا على أهدافك الاستثمارية." },
      { question: "ما متوسط سعر العقار على الخارطة في دبي 2026؟", answer: "تتباين الأسعار تباينًا كبيرًا: الشريحة الاقتصادية (JVC، دبي ساوث): 500-900 ألف درهم للاستوديو/الغرفة الواحدة. الشريحة المتوسطة: 900 ألف - 2 مليون درهم. الفئة الفاخرة: 2-5 مليون درهم. متوسط صفقة على الخارطة في 2025: نحو 1.8 مليون درهم." },
      { question: "ما خطط الدفع المتاحة لمشاريع على الخارطة في دبي 2026؟", answer: "الخطة المرتبطة بالإنشاء: 10% عند الحجز + 10% عند SPA + 30% أثناء البناء + 50% عند التسليم. الخطة الممتدة بعد التسليم (داماك): 40% أثناء البناء + 60% خلال 2-5 سنوات بعد التسليم. لا توجد فوائد على خطط التمويل." },
      { question: "ما العائد الاستثماري المتوقع من عقار على الخارطة في دبي؟", answer: "عوائد إيجارية نموذجية بعد التسليم: 5-9% سنويًا حسب الموقع والمطوّر. إمكانية ارتفاع القيمة (إعادة البيع قبل التسليم): 10-40% في الأسواق المتنامية. منذ 2021، حققت مشاريع إعمار ارتفاعًا 40-70% من سعر الشراء إلى القيمة السوقية الحالية." },
      { question: "هل الشراء على الخارطة في دبي آمن في 2026؟", answer: "تمتلك دبي من أقوى أنظمة حماية مشتري الخارطة عالميًا. تُلزم RERA المطوّرين بإيداع أموال المشترين في حسابات ضمان منفصلة في DLD — لا يمكن الوصول إليها إلا عند اكتمال مراحل البناء. لا يوجد للمطوّرين الكبار (إعمار، داماك، سوبها، بن غاطي) تاريخ من الإخفاق في المشاريع المسجَّلة." },
      { question: "هل يمكن إعادة بيع وحدة على الخارطة قبل التسليم؟", answer: "نعم، بعد دفع 30-40% من قيمة العقار (يتفاوت الحد بين المطوّرين). تتولى بناية عمليتي الشراء الأصلي وإعادة البيع اللاحقة." },
    ],
    breadcrumb: "أفضل المشاريع 2026",
    catLabel: "الفئة",
  },
  zh: {
    metaTitle: "2026迪拜最佳期房项目 | 开发商对比 | Binayah Properties",
    metaDesc: "对比2026年迪拜顶级期房项目：Emaar、DAMAC、Sobha、Binghatti。投资回报、付款计划、租金收益及最新楼盘信息。",
    heroLabel: "迪拜期房2026",
    h1: "迪拜最佳期房项目",
    h1sub: "2026年精选",
    heroDesc: "对比迪拜顶级开发商和新楼盘。我们按投资回报潜力、付款灵活性、建筑质量和租金收益排名——每日更新实时楼盘。",
    devTitle: "开发商对比",
    devSubtitle: "迪拜顶级期房开发商关键指标",
    catTitle: "适合各类投资者的最佳选择",
    projectsTitle: "最新期房发布",
    fromLabel: "起价",
    noPrice: "价格面议",
    viewAll: "浏览所有期房项目",
    faqs: [
      { question: "2026年迪拜哪个开发商的期房项目最好？", answer: "Emaar在长期资本增值方面领先（市中心、迪拜山、溪港）。Binghatti在中端位置提供最高租金收益（7-9%）。DAMAC提供最灵活的交房后付款计划。Sobha在建筑质量和家庭社区方面评级最高。'最佳'开发商完全取决于您的投资目标。" },
      { question: "2026年迪拜期房的平均价格是多少？", answer: "迪拜期房价格因地区差异很大：经济型（JVC、迪拜南区）：单间/一卧50-90万迪拉姆；中端（商业湾、Jaddaf）：90万-200万迪拉姆；高端（市中心、Marina）：200-500万迪拉姆。2025年迪拜期房平均交易价约为180万迪拉姆。" },
      { question: "2026年迪拜期房开发商提供哪些付款计划？", answer: "标准施工联动计划：订购10%+SPA 10%+施工期间30%+交房时50%。DAMAC延伸计划：施工期间40%+交房后2-5年内60%。分期计划不收取利息。部分开发商提供每月1%的分期付款方案。" },
      { question: "迪拜期房投资可以期望什么样的回报？", answer: "交房后典型租金收益：根据地点和开发商，毛收益率5-9%。施工前资本增值（炒楼花）：上升市场潜在10-40%回报。自2021年以来，Emaar项目从期房价格到当前市值已实现40-70%的资本增值。" },
      { question: "2026年在迪拜购买期房安全吗？", answer: "迪拜拥有全球最强的期房买家保护机制之一。RERA要求开发商将买家款项存入DLD托管账户——资金在达到施工里程碑之前无法动用。所有项目必须在RERA注册。知名开发商（Emaar、DAMAC、Sobha、Binghatti）从未有注册项目交付失败的记录。" },
      { question: "可以在交房前转售期房吗？", answer: "可以，在支付房产价值的30-40%（不同开发商门槛不同）之后即可转售。Binayah处理原始购买和后续转售业务——我们的期房团队跟踪所有主要楼盘的交房前机会。" },
    ],
    breadcrumb: "2026精选项目",
    catLabel: "类别",
  },
  vi: {
    metaTitle: "Dự án Off-Plan tốt nhất tại Dubai 2026 | Ra mắt mới | Binayah",
    metaDesc: "So sánh các dự án off-plan hàng đầu Dubai cho 2026. Emaar, DAMAC, Sobha, Binghatti — ROI, kế hoạch thanh toán, lợi suất và tin đăng dự án trực tiếp từ Binayah Properties.",
    heroLabel: "OFF-PLAN DUBAI 2026",
    h1: "Dự án Off-Plan tốt nhất",
    h1sub: "tại Dubai 2026",
    heroDesc: "So sánh các chủ đầu tư off-plan hàng đầu và dự án ra mắt mới tại Dubai. Chúng tôi xếp hạng theo tiềm năng ROI, độ linh hoạt kế hoạch thanh toán, chất lượng xây dựng và lợi suất cho thuê — với tin đăng trực tiếp cập nhật hàng ngày.",
    devTitle: "So sánh chủ đầu tư",
    devSubtitle: "Các chỉ số chính cho các chủ đầu tư off-plan hàng đầu Dubai",
    catTitle: "Tốt nhất cho mọi loại người mua",
    projectsTitle: "Dự án Off-Plan mới nhất",
    fromLabel: "Từ",
    noPrice: "Giá theo yêu cầu",
    viewAll: "Xem tất cả dự án Off-Plan",
    faqs: [
      { question: "Chủ đầu tư nào có dự án off-plan tốt nhất tại Dubai 2026?", answer: "Emaar dẫn đầu về tăng giá vốn dài hạn (Downtown, Dubai Hills, Creek Harbour). Binghatti mang lại lợi suất cho thuê cao nhất (7-9%) ở các vị trí tầm trung. DAMAC cung cấp kế hoạch thanh toán sau bàn giao linh hoạt nhất. Sobha Realty được đánh giá cao nhất về chất lượng xây dựng và cộng đồng gia đình. Chủ đầu tư 'tốt nhất' phụ thuộc hoàn toàn vào mục tiêu đầu tư của bạn — người mua chú trọng ROI và người dùng cuối ưu tiên các tiêu chí khác nhau." },
      { question: "Giá trung bình của bất động sản off-plan tại Dubai 2026 là bao nhiêu?", answer: "Giá off-plan tại Dubai thay đổi rất lớn theo vị trí và chủ đầu tư. Cấp khởi điểm (JVC, Dubai South, Arjan): 500K–900K AED cho studio/1PN. Tầm trung (Business Bay, Al Jaddaf, JBR): 900K–2M AED. Cao cấp (Downtown, Dubai Marina, Palm): 2M–5M AED. Siêu sang (Palm Jumeirah, DIFC, Bluewaters): 5M+ AED. Giao dịch off-plan trung bình tại Dubai năm 2025 khoảng 1,8 triệu AED." },
      { question: "Chủ đầu tư off-plan Dubai cung cấp kế hoạch thanh toán nào năm 2026?", answer: "Kế hoạch liên kết xây dựng tiêu chuẩn: 10% đặt chỗ + 10% khi ký SPA + 30% trong xây dựng + 50% khi bàn giao. Kế hoạch sau bàn giao mở rộng (DAMAC, một số dự án Binghatti): 40% trong xây dựng + 60% trong 2-5 năm sau bàn giao. Không lãi suất là tiêu chuẩn — kế hoạch tài chính chủ đầu tư không tính thêm lãi. Một số chủ đầu tư cung cấp trả góp 1% hàng tháng." },
      { question: "Tôi có thể kỳ vọng ROI nào từ bất động sản off-plan tại Dubai?", answer: "Lợi suất cho thuê điển hình cho off-plan Dubai sau bàn giao: 5-9% gộp tùy vị trí và chủ đầu tư. Tăng giá vốn (flipping trước bàn giao): tiềm năng 10-40% trong thị trường tăng giá. Kể từ năm 2021, các dự án Emaar đã mang lại 40-70% tăng giá vốn từ giá off-plan đến giá trị thị trường hiện tại. Hiệu suất trong quá khứ thay đổi — các vị trí cao cấp và chủ đầu tư lâu đời trong lịch sử vượt trội hơn." },
      { question: "Mua off-plan tại Dubai có an toàn năm 2026 không?", answer: "Dubai có một trong những hệ thống bảo vệ người mua off-plan mạnh nhất thế giới. RERA yêu cầu chủ đầu tư đặt khoản thanh toán của người mua vào tài khoản ký quỹ DLD tách biệt — vốn không thể sử dụng cho đến khi đạt các cột mốc xây dựng. Mọi dự án phải được đăng ký RERA. Chủ đầu tư phải nộp trái phiếu bảo lãnh hoàn thành. Không có chủ đầu tư uy tín nào (Emaar, DAMAC, Sobha, Binghatti) thất bại trong việc bàn giao dự án đã đăng ký. Tuy nhiên, chủ đầu tư nhỏ hơn và đơn vị mới gia nhập mang rủi ro cao hơn." },
      { question: "Tôi có thể bán lại bất động sản off-plan trước khi bàn giao tại Dubai không?", answer: "Có, khi bạn đã trả 30-40% giá trị bất động sản (ngưỡng thay đổi theo chủ đầu tư). Đây gọi là giao dịch 'bán lại off-plan'. Binayah xử lý cả việc mua ban đầu và bán lại sau đó — đội ngũ off-plan của chúng tôi theo dõi các cơ hội trước bàn giao trên tất cả các dự án lớn." },
    ],
    breadcrumb: "Dự án hàng đầu 2026",
    catLabel: "Danh mục",
  },
} as const;

type Locale = keyof typeof CONTENT;
interface Props { params: Promise<{ locale: string }> }

// ─── Metadata ────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const c = CONTENT[(locale as Locale)] || CONTENT.en;
  const url = canonical(locale, "/off-plan/top-projects");
  return {
    title: c.metaTitle,
    description: c.metaDesc,
    alternates: { canonical: url, languages: altLangs("/off-plan/top-projects") },
    openGraph: {
      title: c.metaTitle, description: c.metaDesc, url,
      type: "website", locale: OG_LOCALE[locale] ?? "en_AE",
      images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", title: c.metaTitle, description: c.metaDesc },
    keywords: locale === "ru"
      ? ["лучшие новостройки дубай 2026", "off-plan дубай сравнение", "emaar damac sobha дубай", "новостройки дубай инвестиции"]
      : locale === "ar" // vi branch below
      ? ["أفضل مشاريع على الخارطة دبي 2026", "مقارنة مطوّري دبي", "إعمار داماك سوبها دبي"]
      : locale === "zh"
      ? ["迪拜最佳期房2026", "迪拜开发商对比", "Emaar DAMAC Sobha迪拜"]
      : locale === "vi"
      ? ["dự án off-plan tốt nhất dubai 2026", "emaar so với damac dubai", "so sánh chủ đầu tư dubai hàng đầu", "dự án mới dubai 2026"]
      : ["best off-plan projects dubai 2026", "emaar vs damac dubai", "top dubai developers comparison", "new launch dubai 2026"],
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function TopProjectsPage({ params }: Props) {
  const { locale } = await params;
  const c = CONTENT[(locale as Locale)] || CONTENT.en;
  const cats = CATEGORIES[(locale as Locale)] || CATEGORIES.en;
  const isRtl = locale === "ar"; // vi, zh, ru, en are ltr
  const lp = locale === "en" ? "" : `/${locale}`;

  // Fetch latest off-plan projects from API
  let projects: any[] = [];
  try {
    const res = await serverFetch(serverApiUrl("/api/projects?status=Off-Plan&limit=12&sort=newest"), 8000);
    if (res.ok) projects = await res.json();
  } catch { /* serve page without live projects */ }

  const bcItems = [
    { name: locale === "ru" ? "Главная" : locale === "ar" ? "الرئيسية" : locale === "zh" ? "首页" : locale === "vi" ? "Trang chủ" : "Home", href: `${lp}/` },
    { name: locale === "ru" ? "Новостройки" : locale === "ar" ? "على الخارطة" : locale === "zh" ? "期房" : locale === "vi" ? "Off-Plan" : "Off-Plan", href: `${lp}/off-plan` },
    { name: c.breadcrumb, href: `${lp}/off-plan/top-projects` },
  ];

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? "rtl" : "ltr"}>
      <FAQJsonLd faqs={c.faqs.map(f => ({ question: f.question, answer: f.answer }))} />
      <BreadcrumbJsonLd items={bcItems} />
      <Navbar />

      {/* Hero */}
      <section
        className="relative overflow-hidden pt-20 sm:pt-32 pb-10 sm:pb-16 text-white"
        style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
      >
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)", backgroundSize: "48px 48px" }} />
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6">
          <p className="text-accent font-bold tracking-[0.4em] uppercase text-xs mb-3 sm:mb-4">{c.heroLabel}</p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-2">{c.h1}</h1>
          <p className="text-xl sm:text-3xl font-light text-primary-foreground/70 mb-4 sm:mb-6">{c.h1sub}</p>
          <p className="text-primary-foreground/80 text-sm sm:text-base leading-relaxed max-w-2xl">{c.heroDesc}</p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-14 sm:space-y-20">

        {/* Developer comparison */}
        <section>
          <div className="text-center mb-8 sm:mb-10">
            <p className="text-accent font-bold tracking-[0.35em] uppercase text-xs mb-3">Compare</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">{c.devTitle}</h2>
            <p className="text-sm sm:text-base text-muted-foreground">{c.devSubtitle}</p>
          </div>

          {/* Mobile: cards */}
          <div className="sm:hidden space-y-3">
            {DEVELOPERS.map((d) => (
              <div key={d.name} className="bg-card border border-border/50 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{d.flag}</span>
                  <div>
                    <p className="font-bold text-foreground text-sm">{d.name}</p>
                    <p className="text-[10px] text-muted-foreground">{d.knownFor}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="bg-muted/30 rounded-lg p-2 text-center">
                    <p className="text-muted-foreground mb-0.5">Yield</p>
                    <p className="font-bold text-emerald-600">{d.avgYield}</p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-2 text-center">
                    <p className="text-muted-foreground mb-0.5">Price/sqft</p>
                    <p className="font-semibold text-foreground text-[10px]">{d.avgPriceSqft}</p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-2 text-center">
                    <p className="text-muted-foreground mb-0.5">Delivered</p>
                    <p className="font-semibold text-foreground">{d.delivered}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: table */}
          <div className="hidden sm:block overflow-x-auto rounded-2xl border border-border/50">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/40 border-b border-border/50">
                  {["Developer", "Est.", "Units Delivered", "Price/sqft", "Avg Yield", "Payment Plan"].map((h, i) => (
                    <th key={h} className={`px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider ${i === 0 ? "text-left" : "text-center"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DEVELOPERS.map((d) => (
                  <tr key={d.name} className="border-b border-border/30 last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{d.flag}</span>
                        <div>
                          <p className="font-semibold text-foreground text-sm">{d.name}</p>
                          <p className="text-[10px] text-muted-foreground leading-tight max-w-[160px]">{d.knownFor}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center text-muted-foreground">{d.founded}</td>
                    <td className="px-4 py-4 text-center font-semibold text-foreground">{d.delivered}</td>
                    <td className="px-4 py-4 text-center text-foreground">{d.avgPriceSqft}</td>
                    <td className="px-4 py-4 text-center"><span className="text-emerald-600 font-bold">{d.avgYield}</span></td>
                    <td className="px-4 py-4 text-center text-muted-foreground text-xs">{d.paymentPlan}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Best for categories */}
        <section>
          <div className="text-center mb-10">
            <p className="text-accent font-bold tracking-[0.35em] uppercase text-xs mb-3">{c.catLabel}</p>
            <h2 className="text-3xl font-bold text-foreground">{c.catTitle}</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cats.map((cat) => (
              <div key={cat.label} className="bg-card border border-border/50 rounded-2xl p-5 hover:border-primary/20 transition-all">
                <p className="text-xs font-bold text-accent uppercase tracking-wider mb-2">{cat.label}</p>
                <p className="font-bold text-foreground mb-2">{cat.dev}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{cat.why}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Live projects */}
        {projects.length > 0 && (
          <section>
            <div className="text-center mb-10">
              <p className="text-accent font-bold tracking-[0.35em] uppercase text-xs mb-3">Live</p>
              <h2 className="text-3xl font-bold text-foreground">{c.projectsTitle}</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {projects.map((p: any) => (
                <Link
                  key={p.slug}
                  href={`${lp}/project/${p.slug}`}
                  className="group bg-card border border-border/50 rounded-2xl overflow-hidden hover:border-primary/30 hover:shadow-md transition-all"
                >
                  {p.featuredImage && (
                    <div className="relative h-44 overflow-hidden">
                      <Image
                        src={p.featuredImage}
                        alt={p.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <p className="text-xs text-muted-foreground mb-1">{p.developerName}</p>
                    <h3 className="font-bold text-foreground text-sm mb-2 leading-tight">{p.name}</h3>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">{p.community || p.city}</p>
                      {p.startingPrice ? (
                        <p className="text-sm font-bold text-primary">
                          {c.fromLabel} AED {(p.startingPrice / 1_000_000).toFixed(1)}M
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground">{c.noPrice}</p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link
                href={`${lp}/off-plan`}
                className="inline-flex items-center gap-2 font-bold px-8 py-4 rounded-xl border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all"
              >
                {c.viewAll} →
              </Link>
            </div>
          </section>
        )}

        {/* FAQ */}
        <section>
          <div className="text-center mb-10">
            <p className="text-accent font-bold tracking-[0.35em] uppercase text-xs mb-3">FAQ</p>
            <h2 className="text-3xl font-bold text-foreground">
              {locale === "ru" ? "Частые вопросы" : locale === "ar" ? "الأسئلة الشائعة" : locale === "zh" ? "常见问题" : locale === "vi" ? "Câu hỏi thường gặp" : "Frequently Asked Questions"}
            </h2>
          </div>
          <div className="space-y-3">
            {c.faqs.map((faq, i) => (
              <details key={i} className="group bg-card border border-border/50 rounded-2xl overflow-hidden hover:border-primary/20 transition-colors">
                <summary className="flex items-center justify-between gap-4 px-6 py-5 cursor-pointer list-none font-semibold text-foreground hover:text-primary transition-colors text-sm sm:text-base">
                  <span>{faq.question}</span>
                  <span className="text-accent text-xl font-light flex-shrink-0 transition-transform duration-200 group-open:rotate-45" aria-hidden="true">+</span>
                </summary>
                <div className="px-6 pb-6 text-sm text-muted-foreground leading-relaxed border-t border-border/30 pt-4">{faq.answer}</div>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section
          className="rounded-3xl p-10 sm:p-14 text-center text-white relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
        >
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)", backgroundSize: "32px 32px" }} />
          <div className="relative z-10">
            <p className="text-accent font-bold tracking-[0.4em] uppercase text-xs mb-4">Binayah Properties</p>
            <h2 className="text-3xl font-bold mb-4">
              {locale === "ru" ? "Найдите идеальную новостройку" : locale === "ar" ? "ابحث عن مشروعك المثالي" : locale === "zh" ? "找到您理想的期房项目" : locale === "vi" ? "Tìm dự án Off-Plan hoàn hảo của bạn" : "Find Your Perfect Off-Plan Project"}
            </h2>
            <p className="text-primary-foreground/75 text-lg mb-10 max-w-xl mx-auto">
              {locale === "ru" ? "Наши специалисты по новостройкам помогут подобрать оптимальный объект под ваши инвестиционные цели." : locale === "ar" ? "يساعدك متخصصو بناية في اختيار المشروع المثالي لأهدافك الاستثمارية." : locale === "zh" ? "我们的期房专家将帮助您找到最符合投资目标的项目。" : locale === "vi" ? "Các chuyên gia off-plan của chúng tôi sẽ kết nối bạn với dự án phù hợp cho mục tiêu đầu tư, ngân sách và thời gian của bạn." : "Our off-plan specialists will match you with the right project for your investment goals, budget, and timeline."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`${lp}/contact`}
                className="font-bold px-8 py-4 rounded-xl text-base hover:opacity-90 transition-all"
                style={{ background: "linear-gradient(135deg, #D4A847, #B8922F)", color: "#fff" }}
              >
                {locale === "ru" ? "Получить консультацию" : locale === "ar" ? "احصل على استشارة" : locale === "zh" ? "获取咨询" : locale === "vi" ? "Nhận tư vấn chuyên gia" : "Get Expert Advice"} →
              </Link>
              <Link
                href={`${lp}/off-plan`}
                className="border-2 border-white/30 text-white font-bold px-8 py-4 rounded-xl hover:bg-white/10 transition-all"
              >
                {c.viewAll}
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
