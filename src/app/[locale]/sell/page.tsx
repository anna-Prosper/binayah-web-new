/* eslint-disable i18next/no-literal-string -- multilingual SEO landing page, content stored inline per locale */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { FAQJsonLd, BreadcrumbJsonLd } from "@/components/JsonLd";
import { canonical, altLangs, OG_LOCALE, DEFAULT_OG_IMAGE } from "@/lib/site";

export const revalidate = 86400;

// ─────────────────────────────────────────────────────────────
// Content per locale
// ─────────────────────────────────────────────────────────────

const CONTENT = {
  en: {
    metaTitle: "Sell Property in Dubai | Fast, Expert, RERA-Certified | Binayah",
    metaDesc: "Sell your Dubai property with Binayah Properties. RERA-certified agents, professional valuation, 17+ years experience. Get a free market appraisal today.",
    heroLabel: "SELL WITH CONFIDENCE",
    h1: "Sell Your Property in Dubai",
    heroDesc: "Binayah Properties has been selling Dubai real estate since 2007. Our RERA-certified team delivers expert valuation, professional marketing, and fast results — with full service from listing to completion.",
    heroCta: "Get Free Valuation",
    heroCtaSecondary: "List Your Property",
    stats: [
      { n: "17+", label: "Years Selling Dubai Property" },
      { n: "RERA", label: "Certified Agents" },
      { n: "30", label: "Avg Days to Sell" },
      { n: "2,500+", label: "Properties Sold" },
    ],
    howTitle: "How We Sell Your Property",
    howSubtitle: "A proven 5-step process from valuation to title deed transfer",
    steps: [
      { n: "01", title: "Free Market Valuation", body: "Our agents assess your property using live DLD transaction data, comparable sales in your building, and current market conditions to set the right asking price." },
      { n: "02", title: "Professional Marketing", body: "We create a professional listing with HDR photography, floor plan, and a detailed description. Your property is listed on Bayut, Propertyfinder, Dubizzle, and Binayah.ae simultaneously." },
      { n: "03", title: "Buyer Qualification", body: "We only bring you pre-qualified, serious buyers — verified funds, mortgage pre-approval or cash proof confirmed before viewings." },
      { n: "04", title: "Offer & Negotiation", body: "We manage all offers and negotiate on your behalf to secure the best price. You approve the final terms before any paperwork is signed." },
      { n: "05", title: "DLD Transfer & Completion", body: "We coordinate with the buyer's agent, bank (if mortgaged), and the Dubai Land Department to ensure a smooth, legally compliant ownership transfer." },
    ],
    whyTitle: "Why Sell with Binayah",
    whyPoints: [
      { title: "RERA-Certified Team", body: "Every Binayah agent is licensed by the Real Estate Regulatory Agency (RERA). You're protected by Dubai law at every step." },
      { title: "Free Professional Valuation", body: "Based on real DLD transaction data and comparable sales — not estimates. You know exactly what your property is worth before you list." },
      { title: "Multi-Portal Marketing", body: "Listed on Bayut, Propertyfinder, Dubizzle, and Binayah.ae with professional photography. Maximum exposure to qualified buyers." },
      { title: "No Sale, No Fee", body: "We work on a commission basis — you only pay when your property sells. No upfront fees, no hidden charges." },
      { title: "Russian & International Buyers", body: "With offices serving Russian, Chinese, European and GCC buyers, we connect your property to a global pool of investors and end-users." },
      { title: "Full Paperwork Management", body: "From Memorandum of Understanding (MOU) to NOC, DLD transfer fees, and title deed — we handle all documentation end-to-end." },
    ],
    faqTitle: "Frequently Asked Questions",
    faqs: [
      { q: "How long does it take to sell a property in Dubai?", a: "The average time to sell a property in Dubai is 30–60 days from listing to transfer. Well-priced properties in prime locations (Dubai Marina, Downtown, Palm) can sell in under 2 weeks. Binayah's average is 30 days from listing to contract." },
      { q: "What fees do I pay when selling property in Dubai?", a: "As a seller, your main cost is the agent commission (typically 2% of the sale price). Additional costs include a DLD NOC fee (AED 500–5,000 depending on developer) and a DLD transfer fee (4% — though this is usually split between buyer and seller). There is no capital gains tax or income tax in the UAE." },
      { q: "Do I need to be in Dubai to sell my property?", a: "No. You can sell remotely by granting a Power of Attorney (POA) to your agent or a legal representative in Dubai. Binayah handles international sellers regularly, including Russian, European, and Asian clients who complete the sale entirely remotely." },
      { q: "Can I sell a mortgaged property in Dubai?", a: "Yes. The buyer's payment is used to settle your outstanding mortgage (called a 'blocking letter' process), with the remaining funds transferred to you. Your Binayah agent coordinates with your bank to ensure a smooth transition." },
      { q: "What documents do I need to sell property in Dubai?", a: "Passport copy, original title deed (or trustee-issued copy), property details (floor plan, service charge statements), NOC from the developer, and a signed Form A (listing agreement). If selling remotely, a POA from a UAE-authorised notary." },
      { q: "How is the property valuation calculated?", a: "Binayah's free valuation is based on recent DLD-registered sales in your building and community (not asking prices), current demand, floor level, view, and property condition. We use the same data sources as RERA and banks — so you get a realistic market price." },
      { q: "When is the best time to sell property in Dubai?", a: "Q1 (January–March) and Q4 (October–December) are historically the strongest selling seasons, driven by expat arrivals and investment activity. However, the Dubai market has been strong year-round since 2021, with transaction volumes at record highs." },
      { q: "What is an NOC and why do I need it?", a: "A No Objection Certificate (NOC) is issued by the property developer confirming there are no outstanding service charges or payments on the unit. Without an NOC, the Dubai Land Department will not process the ownership transfer. Your Binayah agent handles the NOC application on your behalf." },
    ],
    ctaTitle: "Ready to Sell?",
    ctaDesc: "Get a free, no-obligation market valuation from our RERA-certified team. We'll tell you exactly what your property is worth in today's market.",
    ctaBtn: "Get Free Valuation",
    ctaSecondary: "List Your Property",
    breadcrumb: "Sell Property",
  },

  ru: {
    metaTitle: "Продать недвижимость в Дубае | Быстро и выгодно | Binayah",
    metaDesc: "Продайте недвижимость в Дубае с Binayah Properties. RERA-сертифицированные агенты, профессиональная оценка, 17+ лет опыта. Бесплатная оценка рынка.",
    heroLabel: "ПРОДАЙТЕ ВЫГОДНО",
    h1: "Продать недвижимость в Дубае",
    heroDesc: "Binayah Properties продаёт недвижимость в Дубае с 2007 года. RERA-сертифицированная команда, профессиональный маркетинг и быстрые результаты — полное сопровождение от оценки до передачи права собственности. Обслуживание на русском языке.",
    heroCta: "Бесплатная оценка",
    heroCtaSecondary: "Выставить объект",
    stats: [
      { n: "17+", label: "Лет на рынке Дубая" },
      { n: "RERA", label: "Сертифицированные агенты" },
      { n: "30", label: "Дней в среднем до продажи" },
      { n: "2 500+", label: "Проданных объектов" },
    ],
    howTitle: "Как мы продаём вашу недвижимость",
    howSubtitle: "Проверенный 5-шаговый процесс от оценки до передачи права собственности",
    steps: [
      { n: "01", title: "Бесплатная рыночная оценка", body: "Наши агенты анализируют актуальные данные о сделках DLD, сопоставимые продажи в вашем доме и текущую рыночную конъюнктуру для установки правильной цены." },
      { n: "02", title: "Профессиональный маркетинг", body: "Создаём профессиональное объявление с HDR-фотографией и планировкой. Ваш объект одновременно размещается на Bayut, Propertyfinder, Dubizzle и Binayah.ae." },
      { n: "03", title: "Проверка покупателей", body: "Мы приводим только проверенных, серьёзных покупателей — с подтверждёнными средствами или одобренной ипотекой до начала показов." },
      { n: "04", title: "Переговоры и предложение", body: "Ведём переговоры от вашего имени для получения наилучшей цены. Вы утверждаете окончательные условия до подписания документов." },
      { n: "05", title: "Регистрация в DLD", body: "Координируем с агентом покупателя, банком (при ипотеке) и Земельным департаментом Дубая для юридически чистой передачи права собственности." },
    ],
    whyTitle: "Почему продавать с Binayah",
    whyPoints: [
      { title: "Сертификация RERA", body: "Каждый агент Binayah лицензирован RERA. Вы защищены законодательством ОАЭ на каждом этапе сделки." },
      { title: "Бесплатная оценка", body: "На основе реальных данных DLD о сделках, а не примерных оценок. Вы точно знаете рыночную стоимость объекта до выставления." },
      { title: "Размещение на всех порталах", body: "Bayut, Propertyfinder, Dubizzle и Binayah.ae с профессиональными фотографиями. Максимальный охват квалифицированных покупателей." },
      { title: "Комиссия только при продаже", body: "Мы работаем на комиссионной основе — оплата только после успешной продажи. Никаких авансовых платежей и скрытых комиссий." },
      { title: "Русскоязычное обслуживание", body: "Полное сопровождение на русском языке. Активная база российских, европейских и азиатских покупателей." },
      { title: "Полное ведение документов", body: "От MOU до NOC, сборов DLD и свидетельства о праве собственности — мы управляем всей документацией." },
    ],
    faqTitle: "Частые вопросы",
    faqs: [
      { q: "Сколько времени занимает продажа недвижимости в Дубае?", a: "В среднем 30–60 дней от выставления до передачи права собственности. Правильно оценённые объекты в ключевых локациях продаются менее чем за 2 недели. Средний срок Binayah — 30 дней от объявления до договора." },
      { q: "Какие расходы несёт продавец в Дубае?", a: "Основная статья — комиссия агента (обычно 2% от стоимости). Дополнительно: сбор NOC застройщика (500–5 000 AED) и сбор за передачу прав DLD (4% — обычно делится между сторонами). Налога на прирост капитала и подоходного налога в ОАЭ нет." },
      { q: "Можно ли продать недвижимость в Дубае дистанционно, находясь в России?", a: "Да. Оформите доверенность (POA) на представителя или агента в Дубае. Binayah регулярно ведёт сделки с российскими продавцами полностью дистанционно. Мы помогаем с оформлением доверенности." },
      { q: "Можно ли продать ипотечную недвижимость?", a: "Да. Средства покупателя используются для погашения вашей ипотеки (процедура «blocking letter»), остаток перечисляется вам. Агент Binayah координирует процесс с вашим банком." },
      { q: "Какие документы нужны для продажи?", a: "Копия паспорта, оригинал свидетельства о праве собственности, детали объекта (план, выписки по обслуживанию), NOC застройщика и подписанная форма A (договор о листинге). При дистанционной продаже — нотариально заверенная доверенность." },
      { q: "Как рассчитывается рыночная стоимость объекта?", a: "Оценка Binayah основана на зарегистрированных сделках DLD в вашем здании (не на ценах предложения), текущем спросе, этаже, виде и состоянии объекта. Те же данные используют RERA и банки — вы получаете реальную рыночную цену." },
      { q: "Когда лучше всего продавать недвижимость в Дубае?", a: "Исторически сильные сезоны — Q1 (январь–март) и Q4 (октябрь–декабрь). Однако с 2021 года рынок Дубая устойчив круглый год, а объёмы сделок на рекордном уровне." },
      { q: "Что такое NOC и зачем он нужен?", a: "NOC (No Objection Certificate) — документ застройщика, подтверждающий отсутствие задолженностей по обслуживанию. Без NOC Земельный департамент не оформит переход права собственности. Агент Binayah подаёт заявку на NOC от вашего имени." },
    ],
    ctaTitle: "Готовы продать?",
    ctaDesc: "Получите бесплатную рыночную оценку от RERA-сертифицированных агентов. Узнайте точную стоимость вашей недвижимости на сегодняшнем рынке.",
    ctaBtn: "Бесплатная оценка",
    ctaSecondary: "Выставить объект",
    breadcrumb: "Продать недвижимость",
  },

  ar: {
    metaTitle: "بيع عقارات دبي | سريع واحترافي | بناية للعقارات",
    metaDesc: "بِع عقارك في دبي مع بناية للعقارات. وكلاء معتمدون من RERA، تقييم احترافي، خبرة تزيد على 17 عامًا. تقييم سوقي مجاني.",
    heroLabel: "بِع بثقة",
    h1: "بيع عقارك في دبي",
    heroDesc: "تتولى بناية للعقارات بيع العقارات في دبي منذ عام 2007. فريق معتمد من RERA، تسويق احترافي، ونتائج سريعة — مع خدمة متكاملة من التقييم إلى نقل الملكية. خدمة كاملة باللغة العربية.",
    heroCta: "تقييم مجاني",
    heroCtaSecondary: "أدرج عقارك",
    stats: [
      { n: "+17", label: "عامًا في سوق دبي" },
      { n: "RERA", label: "وكلاء معتمدون" },
      { n: "30", label: "يومًا متوسط وقت البيع" },
      { n: "+2500", label: "عقار تم بيعه" },
    ],
    howTitle: "كيف نبيع عقارك",
    howSubtitle: "عملية مكوّنة من 5 خطوات من التقييم إلى نقل الملكية",
    steps: [
      { n: "١", title: "تقييم سوقي مجاني", body: "يحلّل وكلاؤنا أحدث بيانات معاملات DLD والمبيعات المقارنة في مبناك وأحوال السوق الراهنة لتحديد السعر المناسب." },
      { n: "٢", title: "تسويق احترافي", body: "نُعدّ إعلانًا احترافيًا بتصوير HDR ومخطط الشقة. يُدرج عقارك في آنٍ واحد على Bayut وPropertyfinder وDubizzle وBinayah.ae." },
      { n: "٣", title: "تأهيل المشترين", body: "نُحضر مشترين جادّين ومؤهَّلين فقط — مع تأكيد السيولة أو الموافقة المسبقة على التمويل قبل الجولات." },
      { n: "٤", title: "العرض والتفاوض", body: "ندير جميع العروض ونفاوض نيابةً عنك للحصول على أفضل سعر. أنت توافق على الشروط النهائية قبل توقيع أي أوراق." },
      { n: "٥", title: "التسجيل في DLD", body: "ننسّق مع وكيل المشتري والبنك (عند التمويل) ودائرة الأراضي والأملاك لضمان نقل ملكية سلس ومتوافق قانونيًا." },
    ],
    whyTitle: "لماذا تبيع مع بناية",
    whyPoints: [
      { title: "اعتماد RERA", body: "كل وكيل في بناية مرخّص من هيئة تنظيم العقارات (RERA). أنت محميٌّ بموجب القانون الإماراتي في كل خطوة." },
      { title: "تقييم مجاني", body: "يستند إلى بيانات معاملات DLD الفعلية، لا التقديرات. ستعرف القيمة السوقية الدقيقة لعقارك قبل إدراجه." },
      { title: "إدراج على جميع المنصات", body: "Bayut وPropertyfinder وDubizzle وBinayah.ae بتصوير احترافي. أقصى ظهور للمشترين المؤهَّلين." },
      { title: "لا عمولة قبل البيع", body: "نعمل على أساس العمولة — لا رسوم مسبقة ولا رسوم مخفية. تدفع فقط عند إتمام البيع." },
      { title: "قاعدة مشترين دولية", body: "وصول إلى مشترين خليجيين وعرب وأوروبيين وروس وصينيين من قاعدة بيانات بناية الدولية." },
      { title: "إدارة الأوراق بالكامل", body: "من MOU إلى NOC ورسوم DLD وسند الملكية — نتولى جميع المتطلبات الوثائقية من البداية إلى النهاية." },
    ],
    faqTitle: "الأسئلة الشائعة",
    faqs: [
      { q: "كم يستغرق بيع عقار في دبي؟", a: "يتراوح المتوسط بين 30 و60 يومًا من الإدراج إلى نقل الملكية. قد تُباع العقارات ذات التسعير المناسب في المواقع الرئيسية خلال أسبوعين أو أقل. متوسط بناية هو 30 يومًا من الإدراج إلى العقد." },
      { q: "ما الرسوم التي يتحملها البائع في دبي؟", a: "التكلفة الرئيسية هي عمولة الوكيل (عادةً 2% من سعر البيع). تضاف رسوم NOC من المطوّر (500–5,000 درهم) ورسوم نقل DLD (4% — يُقسَّم عادةً بين الطرفين). لا ضريبة مكاسب رأس المال ولا ضريبة دخل في الإمارات." },
      { q: "هل يمكن بيع العقار عن بُعد؟", a: "نعم. يمكن منح وكالة رسمية (POA) لوكيلك أو ممثلك القانوني في دبي لإتمام البيع. تتعامل بناية بانتظام مع بائعين دوليين يُنجزون البيع كاملًا عن بُعد." },
      { q: "هل يمكن بيع عقار ممرهَن؟", a: "نعم. تُستخدَم مدفوعات المشتري لسداد رهنك العقاري (إجراء «خطاب الحجب»)، وتُحوَّل الأموال المتبقية إليك. ينسّق وكيل بناية مع بنكك لضمان سير الأمور بسلاسة." },
      { q: "ما المستندات المطلوبة لبيع العقار؟", a: "نسخة جواز سفر، سند الملكية الأصلي، تفاصيل العقار (مخطط، كشوف رسوم الخدمة)، NOC من المطوّر، ونموذج A الموقَّع (اتفاقية الإدراج). عند البيع عن بُعد: وكالة رسمية موثَّقة." },
      { q: "كيف يُحسَب تقييم العقار؟", a: "يستند تقييم بناية المجاني إلى مبيعات DLD المسجَّلة في مبناك ومجتمعك (لا أسعار الطلب)، ويراعي الطلب الراهن والطابق والإطلالة وحالة العقار — البيانات ذاتها التي تستخدمها RERA والبنوك." },
      { q: "ما هو شهر NOC وما أهميته؟", a: "شهادة عدم الممانعة (NOC) وثيقة تُصدرها جهة التطوير تُثبت خلوّ العقار من متأخرات الخدمة. بدون NOC لن تتم عملية نقل الملكية في دائرة الأراضي. يتولى وكيل بناية تقديم الطلب نيابةً عنك." },
    ],
    ctaTitle: "هل أنت مستعد للبيع؟",
    ctaDesc: "احصل على تقييم سوقي مجاني من فريق معتمد من RERA. سنخبرك بالقيمة الدقيقة لعقارك في السوق الحالية.",
    ctaBtn: "تقييم مجاني",
    ctaSecondary: "أدرج عقارك",
    breadcrumb: "بيع العقارات",
  },

  zh: {
    metaTitle: "在迪拜出售房产 | 快速专业 | Binayah Properties",
    metaDesc: "通过Binayah Properties出售您的迪拜房产。RERA认证经纪人，专业估价，17年以上经验。立即获取免费市场评估。",
    heroLabel: "放心出售",
    h1: "在迪拜出售您的房产",
    heroDesc: "Binayah Properties自2007年起在迪拜销售房产。RERA认证团队，专业营销，快速成交——从估价到产权转让全程服务，提供中文支持。",
    heroCta: "免费估价",
    heroCtaSecondary: "挂牌出售",
    stats: [
      { n: "17+", label: "年迪拜房产经验" },
      { n: "RERA", label: "认证经纪人" },
      { n: "30", label: "天平均出售周期" },
      { n: "2,500+", label: "已售房产" },
    ],
    howTitle: "我们如何出售您的房产",
    howSubtitle: "从估价到产权转让的5步验证流程",
    steps: [
      { n: "01", title: "免费市场估价", body: "我们的经纪人基于DLD实时交易数据、同楼可比销售案例和当前市场状况，为您设定合理挂牌价格。" },
      { n: "02", title: "专业营销推广", body: "制作专业房源信息，包含HDR摄影和平面图。同步发布至Bayut、Propertyfinder、Dubizzle和Binayah.ae。" },
      { n: "03", title: "买家资质审核", body: "我们只为您引荐经过预审的认真买家——带看前确认资金证明或贷款预批。" },
      { n: "04", title: "报价与谈判", body: "代表您管理所有报价并进行谈判以争取最优价格。签署任何文件前均需您确认最终条款。" },
      { n: "05", title: "DLD登记过户", body: "协调买方经纪人、银行（若涉及贷款）和迪拜土地局，确保顺畅合规的产权转移。" },
    ],
    whyTitle: "为什么选择Binayah出售",
    whyPoints: [
      { title: "RERA认证团队", body: "每位Binayah经纪人均持有房地产监管局(RERA)执照，您在每个环节均受阿联酋法律保护。" },
      { title: "免费专业估价", body: "基于DLD真实交易数据，而非估算。挂牌前您将精准了解房产市值。" },
      { title: "全平台发布", body: "在Bayut、Propertyfinder、Dubizzle和Binayah.ae发布专业摄影房源，最大化触达合格买家。" },
      { title: "成交前零佣金", body: "佣金制合作——仅在房产成功出售后收取，无前期费用，无隐性收费。" },
      { title: "国际买家资源", body: "连接来自中国、俄罗斯、欧洲和海湾地区的买家池，助您快速找到优质买家。" },
      { title: "全程文件管理", body: "从意向书(MOU)到无异议证书(NOC)、DLD过户费用及产权证书——全程处理所有文件手续。" },
    ],
    faqTitle: "常见问题解答",
    faqs: [
      { q: "在迪拜出售房产需要多长时间？", a: "从挂牌到产权转移平均需要30-60天。优质地段定价合理的房产可在2周内完成。Binayah的平均周期为从挂牌到签约30天。" },
      { q: "卖家需要支付哪些费用？", a: "主要费用是经纪佣金（通常为成交价的2%）。另需支付开发商NOC费用（500-5,000迪拉姆）和DLD过户费（4%，通常买卖双方各承担一半）。阿联酋无资本利得税和所得税。" },
      { q: "可以在国内远程出售迪拜房产吗？", a: "可以。您可以向迪拜的代理人或法律代表授予授权委托书(POA)，委托其代办所有手续。Binayah定期为中国、俄罗斯等海外卖家提供全程远程出售服务。" },
      { q: "可以出售按揭中的房产吗？", a: "可以。买方款项将用于偿还您的贷款余额（封锁函流程），剩余款项转至您的账户。Binayah经纪人将协调您的贷款银行确保流程顺畅。" },
      { q: "出售房产需要哪些文件？", a: "护照复印件、原始产权证书、房产资料（平面图、物业费账单）、开发商NOC及签署的A表（委托挂牌协议）。远程出售需提供经公证的授权委托书。" },
      { q: "如何计算房产市值？", a: "Binayah的免费估价基于您所在楼栋的DLD登记交易（非挂牌价格），同时考虑当前需求、楼层、景观和房屋状况——与RERA和银行使用相同的数据来源。" },
      { q: "什么是NOC，为什么需要它？", a: "无异议证书(NOC)是开发商出具的证明，确认该单位不存在未付物业费或欠款。没有NOC，迪拜土地局将不会处理产权转让。您的Binayah经纪人将代您申请NOC。" },
    ],
    ctaTitle: "准备好出售了吗？",
    ctaDesc: "从我们的RERA认证团队获取免费无义务市场估价，了解您的房产在当前市场的精准价值。",
    ctaBtn: "获取免费估价",
    ctaSecondary: "挂牌出售",
    breadcrumb: "出售房产",
  },

  vi: {
    metaTitle: "Bán bất động sản tại Dubai | Nhanh, chuyên nghiệp, chứng nhận RERA | Binayah",
    metaDesc: "Bán bất động sản Dubai với Binayah Properties. Chuyên viên được chứng nhận RERA, định giá chuyên nghiệp, hơn 17 năm kinh nghiệm. Nhận định giá thị trường miễn phí ngay hôm nay.",
    heroLabel: "BÁN VỚI SỰ TỰ TIN",
    h1: "Bán bất động sản của bạn tại Dubai",
    heroDesc: "Binayah Properties đã bán bất động sản Dubai từ năm 2007. Đội ngũ được chứng nhận RERA của chúng tôi cung cấp định giá chuyên nghiệp, tiếp thị chuyên nghiệp và kết quả nhanh chóng — với dịch vụ trọn gói từ niêm yết đến hoàn tất.",
    heroCta: "Định giá miễn phí",
    heroCtaSecondary: "Niêm yết bất động sản",
    stats: [
      { n: "17+", label: "Năm bán bất động sản Dubai" },
      { n: "RERA", label: "Chuyên viên được chứng nhận" },
      { n: "30", label: "Số ngày bán TB" },
      { n: "2.500+", label: "Bất động sản đã bán" },
    ],
    howTitle: "Cách chúng tôi bán bất động sản của bạn",
    howSubtitle: "Quy trình 5 bước đã được kiểm chứng từ định giá đến chuyển nhượng sổ đỏ",
    steps: [
      { n: "01", title: "Định giá thị trường miễn phí", body: "Các chuyên viên của chúng tôi đánh giá bất động sản của bạn bằng dữ liệu giao dịch DLD trực tiếp, các giao dịch tương đương trong tòa nhà và điều kiện thị trường hiện tại để đặt giá chào bán phù hợp." },
      { n: "02", title: "Tiếp thị chuyên nghiệp", body: "Chúng tôi tạo tin đăng chuyên nghiệp với ảnh HDR, mặt bằng và mô tả chi tiết. Bất động sản của bạn được niêm yết đồng thời trên Bayut, Propertyfinder, Dubizzle và Binayah.ae." },
      { n: "03", title: "Sàng lọc người mua", body: "Chúng tôi chỉ mang đến những người mua nghiêm túc đã được sàng lọc trước — vốn đã xác minh, phê duyệt vay trước hoặc bằng chứng tiền mặt được xác nhận trước khi xem nhà." },
      { n: "04", title: "Chào giá & Đàm phán", body: "Chúng tôi quản lý mọi đề nghị và đàm phán thay mặt bạn để đạt giá tốt nhất. Bạn phê duyệt điều khoản cuối cùng trước khi ký bất kỳ giấy tờ nào." },
      { n: "05", title: "Chuyển nhượng DLD & Hoàn tất", body: "Chúng tôi phối hợp với chuyên viên của người mua, ngân hàng (nếu vay thế chấp) và Sở Đất đai Dubai để đảm bảo chuyển nhượng quyền sở hữu suôn sẻ, tuân thủ pháp luật." },
    ],
    whyTitle: "Vì sao bán với Binayah",
    whyPoints: [
      { title: "Đội ngũ được chứng nhận RERA", body: "Mọi chuyên viên Binayah đều được cấp phép bởi Cơ quan Quản lý Bất động sản (RERA). Bạn được luật Dubai bảo vệ ở mọi bước." },
      { title: "Định giá chuyên nghiệp miễn phí", body: "Dựa trên dữ liệu giao dịch DLD thực tế và các giao dịch tương đương — không phải ước tính. Bạn biết chính xác giá trị bất động sản trước khi niêm yết." },
      { title: "Tiếp thị đa cổng", body: "Niêm yết trên Bayut, Propertyfinder, Dubizzle và Binayah.ae với ảnh chuyên nghiệp. Tiếp cận tối đa người mua đủ điều kiện." },
      { title: "Không bán, không phí", body: "Chúng tôi làm việc trên cơ sở hoa hồng — bạn chỉ trả khi bất động sản được bán. Không phí trả trước, không phí ẩn." },
      { title: "Người mua Nga & Quốc tế", body: "Với các văn phòng phục vụ người mua Nga, Trung Quốc, châu Âu và GCC, chúng tôi kết nối bất động sản của bạn với mạng lưới nhà đầu tư và người dùng cuối toàn cầu." },
      { title: "Quản lý giấy tờ trọn gói", body: "Từ Bản ghi nhớ (MOU) đến NOC, phí chuyển nhượng DLD và sổ đỏ — chúng tôi xử lý mọi giấy tờ từ đầu đến cuối." },
    ],
    faqTitle: "Câu hỏi thường gặp",
    faqs: [
      { q: "Bán một bất động sản tại Dubai mất bao lâu?", a: "Thời gian trung bình để bán một bất động sản tại Dubai là 30–60 ngày từ niêm yết đến chuyển nhượng. Bất động sản định giá tốt ở vị trí cao cấp (Dubai Marina, Downtown, Palm) có thể bán trong dưới 2 tuần. Trung bình của Binayah là 30 ngày từ niêm yết đến hợp đồng." },
      { q: "Tôi phải trả phí gì khi bán bất động sản tại Dubai?", a: "Với tư cách người bán, chi phí chính của bạn là hoa hồng môi giới (thường 2% giá bán). Chi phí bổ sung bao gồm phí NOC của DLD (500–5.000 AED tùy chủ đầu tư) và phí chuyển nhượng DLD (4% — dù thường được chia giữa người mua và người bán). Không có thuế lãi vốn hay thuế thu nhập tại UAE." },
      { q: "Tôi có cần ở Dubai để bán bất động sản không?", a: "Không. Bạn có thể bán từ xa bằng cách cấp Giấy ủy quyền (POA) cho chuyên viên hoặc đại diện pháp lý tại Dubai. Binayah thường xuyên xử lý người bán quốc tế, bao gồm khách hàng Nga, châu Âu và châu Á hoàn tất giao dịch hoàn toàn từ xa." },
      { q: "Tôi có thể bán bất động sản đang thế chấp tại Dubai không?", a: "Có. Khoản thanh toán của người mua được dùng để tất toán khoản vay thế chấp còn lại của bạn (quy trình gọi là 'blocking letter'), số tiền còn lại được chuyển cho bạn. Chuyên viên Binayah phối hợp với ngân hàng của bạn để đảm bảo chuyển đổi suôn sẻ." },
      { q: "Tôi cần giấy tờ gì để bán bất động sản tại Dubai?", a: "Bản sao hộ chiếu, sổ đỏ gốc (hoặc bản sao do ủy thác cấp), chi tiết bất động sản (mặt bằng, bảng kê phí dịch vụ), NOC từ chủ đầu tư và Form A đã ký (thỏa thuận niêm yết). Nếu bán từ xa, cần POA từ công chứng viên được UAE ủy quyền." },
      { q: "Định giá bất động sản được tính như thế nào?", a: "Định giá miễn phí của Binayah dựa trên các giao dịch đã đăng ký DLD gần đây trong tòa nhà và khu vực của bạn (không phải giá chào), nhu cầu hiện tại, tầng, view và tình trạng bất động sản. Chúng tôi dùng cùng nguồn dữ liệu như RERA và ngân hàng — nên bạn có giá thị trường thực tế." },
      { q: "Thời điểm tốt nhất để bán bất động sản tại Dubai là khi nào?", a: "Q1 (tháng 1–tháng 3) và Q4 (tháng 10–tháng 12) trong lịch sử là mùa bán mạnh nhất, được thúc đẩy bởi người nước ngoài đến và hoạt động đầu tư. Tuy nhiên, thị trường Dubai đã mạnh quanh năm kể từ năm 2021, với khối lượng giao dịch ở mức kỷ lục." },
      { q: "NOC là gì và vì sao tôi cần nó?", a: "Chứng nhận Không phản đối (NOC) do chủ đầu tư cấp xác nhận không còn phí dịch vụ hoặc khoản thanh toán nào trên căn hộ. Không có NOC, Sở Đất đai Dubai sẽ không xử lý chuyển nhượng quyền sở hữu. Chuyên viên Binayah xử lý đơn xin NOC thay mặt bạn." },
    ],
    ctaTitle: "Sẵn sàng bán?",
    ctaDesc: "Nhận định giá thị trường miễn phí, không ràng buộc từ đội ngũ được chứng nhận RERA của chúng tôi. Chúng tôi sẽ cho bạn biết chính xác giá trị bất động sản của bạn trong thị trường hôm nay.",
    ctaBtn: "Định giá miễn phí",
    ctaSecondary: "Niêm yết bất động sản",
    breadcrumb: "Bán bất động sản",
  },
} as const;

type Locale = keyof typeof CONTENT;

// ─────────────────────────────────────────────────────────────
// Metadata
// ─────────────────────────────────────────────────────────────

interface Props { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!(locale in CONTENT)) return {};
  const c = CONTENT[locale as Locale];
  const url = canonical(locale, "/sell");
  return {
    title: c.metaTitle,
    description: c.metaDesc,
    alternates: { canonical: url, languages: altLangs("/sell") },
    openGraph: {
      title: c.metaTitle,
      description: c.metaDesc,
      url,
      type: "website",
      locale: OG_LOCALE[locale] ?? "en_AE",
      siteName: "Binayah Properties",
      images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", title: c.metaTitle, description: c.metaDesc },
    keywords: locale === "ru"
      ? ["продать недвижимость дубай", "продать квартиру дубай", "оценка недвижимости дубай", "продажа виллы дубай"]
      : locale === "ar" // vi branch below
      ? ["بيع عقار دبي", "بيع شقة دبي", "تقييم عقاري دبي", "بيع فيلا دبي"]
      : locale === "zh"
      ? ["在迪拜出售房产", "卖迪拜房子", "迪拜房产估价", "迪拜二手房出售"]
      : locale === "vi"
      ? ["bán bất động sản dubai", "bán căn hộ dubai", "định giá bất động sản dubai", "bán biệt thự dubai"]
      : ["sell property dubai", "sell apartment dubai", "sell house dubai", "list property dubai", "dubai property valuation"],
  };
}

// ─────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────

export default async function SellPage({ params }: Props) {
  const { locale } = await params;
  if (!(locale in CONTENT)) return notFound();
  const c = CONTENT[locale as Locale];
  const isRtl = locale === "ar"; // vi, zh, ru, en are ltr
  const lp = locale === "en" ? "" : `/${locale}`;

  const breadcrumbs = [
    { name: locale === "ru" ? "Главная" : locale === "ar" ? "الرئيسية" : locale === "zh" ? "首页" : locale === "vi" ? "Trang chủ" : "Home", href: `${lp}/` },
    { name: c.breadcrumb, href: `${lp}/sell` },
  ];

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? "rtl" : "ltr"}>
      <FAQJsonLd faqs={c.faqs.map(f => ({ question: f.q, answer: f.a }))} />
      <BreadcrumbJsonLd items={breadcrumbs} />
      <Navbar />

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden pt-20 sm:pt-32 pb-12 sm:pb-20 text-white"
        style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
      >
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)", backgroundSize: "48px 48px" }} />
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6">
          <p className="text-accent font-bold tracking-[0.4em] uppercase text-xs mb-4">{c.heroLabel}</p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-3 sm:mb-4">{c.h1}</h1>
          <p className="text-primary-foreground/80 text-sm sm:text-base leading-relaxed max-w-2xl mb-8 sm:mb-10">{c.heroDesc}</p>
          <div className="flex flex-wrap gap-4">
            <Link
              href={`${lp}/valuation`}
              className="inline-flex items-center gap-2 font-bold px-8 py-4 rounded-xl text-base hover:opacity-90 transition-all"
              style={{ background: "linear-gradient(135deg, #D4A847, #B8922F)", color: "#fff" }}
            >
              {c.heroCta} →
            </Link>
            <Link
              href={`${lp}/list-your-property`}
              className="inline-flex items-center gap-2 border-2 border-white/30 text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/10 transition-all"
            >
              {c.heroCtaSecondary}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────────────── */}
      <section className="border-b border-border/50 bg-card">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-border/40">
            {c.stats.map((s) => (
              <div key={s.label} className="py-6 px-4 sm:px-8 text-center">
                <p className="text-3xl font-black text-primary mb-1">{s.n}</p>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-14 sm:space-y-20">

        {/* ── How it works ──────────────────────────────────────────── */}
        <section>
          <div className="text-center mb-12">
            <p className="text-accent font-bold tracking-[0.35em] uppercase text-xs mb-3">Process</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">{c.howTitle}</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">{c.howSubtitle}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {c.steps.map((step) => (
              <div key={step.n} className="bg-card border border-border/50 rounded-2xl p-7 hover:border-primary/30 hover:shadow-sm transition-all">
                <div className="text-4xl font-black mb-4 leading-none" style={{ color: "rgba(26,122,90,0.2)" }}>{step.n}</div>
                <h3 className="text-base font-bold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Why Binayah ───────────────────────────────────────────── */}
        <section>
          <div className="text-center mb-12">
            <p className="text-accent font-bold tracking-[0.35em] uppercase text-xs mb-3">Why Us</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">{c.whyTitle}</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {c.whyPoints.map((pt) => (
              <div key={pt.title} className="bg-card border border-border/50 rounded-2xl p-6 hover:border-primary/20 transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground">{pt.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{pt.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── FAQ ───────────────────────────────────────────────────── */}
        <section>
          <div className="text-center mb-12">
            <p className="text-accent font-bold tracking-[0.35em] uppercase text-xs mb-3">FAQ</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">{c.faqTitle}</h2>
          </div>
          <div className="space-y-3">
            {c.faqs.map((faq, i) => (
              <details key={i} className="group bg-card border border-border/50 rounded-2xl overflow-hidden hover:border-primary/20 transition-colors">
                <summary className="flex items-center justify-between gap-4 px-6 py-5 cursor-pointer list-none font-semibold text-foreground hover:text-primary transition-colors text-sm sm:text-base">
                  <span>{faq.q}</span>
                  <span className="text-accent text-xl font-light flex-shrink-0 transition-transform duration-200 group-open:rotate-45" aria-hidden="true">+</span>
                </summary>
                <div className="px-6 pb-6 text-sm text-muted-foreground leading-relaxed border-t border-border/30 pt-4">{faq.a}</div>
              </details>
            ))}
          </div>
        </section>

        {/* ── CTA ───────────────────────────────────────────────────── */}
        <section
          className="rounded-3xl p-10 sm:p-14 text-center text-white relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
        >
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)", backgroundSize: "32px 32px" }} />
          <div className="relative z-10">
            <p className="text-accent font-bold tracking-[0.4em] uppercase text-xs mb-4">Binayah Properties</p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">{c.ctaTitle}</h2>
            <p className="text-primary-foreground/75 text-lg mb-10 max-w-xl mx-auto">{c.ctaDesc}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`${lp}/valuation`}
                className="font-bold px-8 py-4 rounded-xl text-base hover:opacity-90 transition-all"
                style={{ background: "linear-gradient(135deg, #D4A847, #B8922F)", color: "#fff" }}
              >
                {c.ctaBtn}
              </Link>
              <Link
                href={`${lp}/list-your-property`}
                className="border-2 border-white/30 text-white font-bold px-8 py-4 rounded-xl hover:bg-white/10 transition-all"
              >
                {c.ctaSecondary}
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
