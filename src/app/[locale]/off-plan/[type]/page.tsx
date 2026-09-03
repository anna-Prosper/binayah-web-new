/* eslint-disable i18next/no-literal-string -- multilingual SEO landing page */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { waHref, WA_DEFAULT_MESSAGE } from "@/lib/whatsapp";
import { BreadcrumbJsonLd, FAQJsonLd, CollectionPageJsonLd } from "@/components/JsonLd";
import { canonical, altLangs, OG_LOCALE, DEFAULT_OG_IMAGE } from "@/lib/site";
import { serverFetch, serverApiUrl } from "@/lib/api";
import SearchPageClient from "@/app/_clients/search/SearchPageClient";
import PropertyTypeSidebar from "@/components/PropertyTypeSidebar";
import { normalizePropertyType } from "@/lib/property-types";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ locale: string; type: string }>;
}

// URL slug -> { searchType (passed to SearchPageClient + SSR fetch), per-locale labels }
const TYPES = {
  apartments: {
    searchType: "Apartment",
    label: { en: "Apartments", ru: "Апартаменты", ar: "شقق", zh: "公寓", vi: "Căn hộ", he: "דירות", fr: "Appartements" },
  },
  villas: {
    searchType: "Villa",
    label: { en: "Villas", ru: "Виллы", ar: "فلل", zh: "别墅", vi: "Biệt thự", he: "וילות", fr: "Villas" },
  },
  townhouses: {
    searchType: "Townhouse",
    label: { en: "Townhouses", ru: "Таунхаусы", ar: "تاون هاوس", zh: "联排别墅", vi: "Nhà phố", he: "בתים טוריים", fr: "Maisons de ville" },
  },
} as const;

type TypeSlug = keyof typeof TYPES;
type Loc = keyof (typeof TYPES)["apartments"]["label"];

const OFFPLAN_LABEL: Record<string, string> = {
  fr: "Sur plan",
  en: "Off-Plan", ru: "Новостройки", ar: "على الخارطة", zh: "期房", vi: "Off-Plan", he: "על הנייר",
};
const HOME_LABEL: Record<string, string> = {
  fr: "Accueil",
  en: "Home", ru: "Главная", ar: "الرئيسية", zh: "首页", vi: "Trang chủ", he: "בית",
};

function titleFor(typeLabel: string, locale: string): string {
  switch (locale) {
    case "ru": return `${typeLabel} в новостройках Дубая | Off-Plan | Binayah`;
    case "ar": return `${typeLabel} على الخارطة في دبي | بناية للعقارات`;
    case "zh": return `迪拜期房${typeLabel} | Binayah Properties`;
    case "vi": return `${typeLabel} off-plan tại Dubai | Binayah Properties`;
    case "he": return `${typeLabel} על הנייר בדובאי | Binayah Properties`;
    case "fr": return `${typeLabel} sur plan à Dubai | Nouveaux projets | Binayah`;
    default: return `Off-Plan ${typeLabel} in Dubai | New Launches | Binayah`;
  }
}
function descFor(typeLabel: string, locale: string): string {
  switch (locale) {
    case "ru": return `Новостройки (off-plan), ${typeLabel.toLowerCase()} в Дубае. Гибкие планы рассрочки от ведущих застройщиков, высокий потенциал доходности.`;
    case "ar": return `${typeLabel} على الخارطة في دبي من كبار المطوّرين. خطط سداد مرنة وإمكانية عائد مرتفع قبل التسليم.`;
    case "zh": return `迪拜期房${typeLabel}，来自顶级开发商。灵活付款计划，交房前高增值潜力。`;
    case "vi": return `${typeLabel} off-plan tại Dubai từ các chủ đầu tư hàng đầu. Kế hoạch thanh toán linh hoạt, tiềm năng tăng giá cao.`;
    case "he": return `${typeLabel} על הנייר בדובאי מהיזמים המובילים. תוכניות תשלום גמישות ופוטנציאל תשואה גבוה.`;
    case "fr": return `${typeLabel} sur plan à Dubai des meilleurs promoteurs. Plans de paiement flexibles et fort potentiel de plus-value avant la livraison.`;
    default: return `Off-plan ${typeLabel.toLowerCase()} in Dubai from top developers. Flexible payment plans and high capital-appreciation potential before handover.`;
  }
}

// ── Localized landing content (stats / FAQ / CTA). `{type}` is replaced with the
//    localized type label so one block serves apartments, villas and townhouses. ──
// NOTE: office hours in the CTA copy must stay Mon-Sat 09:00-18:00 — they have to
// match `contact.hours` in messages/*.json and the openingHoursSpecification in
// components/JsonLd.tsx. A previous "7 days a week" claim was removed for that reason.
interface LandingContent {
  stats: { n: string; label: string }[];
  faqHeading: string;
  faqs: { question: string; answer: string }[];
  ctaTitle: string;
  ctaDesc: string;
  ctaBtn: string;
}

const CONTENT: Record<string, LandingContent> = {
  en: {
    stats: [
      { n: "", label: "Off-Plan Projects" },
      { n: "10%+", label: "Down Payment Plans" },
      { n: "0%", label: "Capital Gains Tax" },
      { n: "100%", label: "Escrow-Protected" },
    ],
    faqHeading: "Off-Plan {type} in Dubai, FAQs",
    faqs: [
      { question: "Can foreigners buy off-plan {type} in Dubai?", answer: "Yes. All nationalities can buy off-plan {typeLower} on a freehold basis in Dubai's designated areas. You sign a Sales & Purchase Agreement (SPA) and the developer registers an Oqood (initial off-plan title) with the Dubai Land Department. No UAE residency is required, and full freehold ownership transfers to you on handover." },
      { question: "How do off-plan payment plans work in Dubai?", answer: "Off-plan {typeLower} are sold on construction-linked payment plans, typically a 10-20% down payment on booking, staged installments during construction, and the balance on handover. Many projects also offer post-handover plans that spread payments over 1-3 years after you receive the keys." },
      { question: "Are off-plan payments protected?", answer: "Yes. Dubai law (RERA) requires every off-plan project to deposit buyer payments into a regulated escrow account. Funds are released to the developer only as construction milestones are verified, protecting your money if a project is delayed." },
      { question: "Is off-plan a good investment in Dubai?", answer: "Off-plan {typeLower} are usually priced below ready units and let you lock in today's price while paying in installments. Buyers benefit from capital appreciation through the construction period, and Dubai's 0% capital-gains and property tax means gains are kept in full." },
      { question: "What fees apply when buying off-plan in Dubai?", answer: "Budget for the 4% Dubai Land Department registration fee, an Oqood registration fee (around AED 3,000) and any developer admin charges. There is no annual property tax. VAT does not apply to residential homes." },
      { question: "Does buying off-plan qualify for the UAE Golden Visa?", answer: "Yes. An off-plan purchase of AED 2 million or more qualifies for the 10-year UAE Golden Visa, provided the paid-up amount meets the threshold or is covered by an approved mortgage. Our team can guide you through the application." },
    ],
    ctaTitle: "Ready to Invest in Off-Plan {type}?",
    ctaDesc: "Get early access to new launches, exclusive payment plans and floor-plan availability before they go public. Our off-plan specialists are available Monday to Saturday, 9:00 AM - 6:00 PM.",
    ctaBtn: "Book a Free Consultation",
  },
  fr: {
    stats: [
      { n: "", label: "Projets sur plan" },
      { n: "10%+", label: "Plans d'acompte" },
      { n: "0%", label: "Impôt sur les plus-values" },
      { n: "100%", label: "Protégé par séquestre" },
    ],
    faqHeading: "{type} sur plan à Dubai, FAQ",
    faqs: [
      { question: "Les étrangers peuvent-ils acheter des {typeLower} sur plan à Dubai ?", answer: "Oui. Toutes les nationalités peuvent acheter des {typeLower} sur plan en pleine propriété dans les zones désignées de Dubai. Vous signez un contrat de vente (SPA) et le promoteur enregistre un Oqood (titre initial sur plan) auprès du Dubai Land Department. Aucune résidence requise, et la pleine propriété vous est transférée à la livraison." },
      { question: "Comment fonctionnent les plans de paiement sur plan à Dubai ?", answer: "Les {typeLower} sur plan sont vendus avec des plans de paiement liés à la construction, généralement un acompte de 10 à 20 % à la réservation, des versements échelonnés pendant la construction et le solde à la livraison. De nombreux projets proposent aussi des plans post-livraison étalés sur 1 à 3 ans après la remise des clés." },
      { question: "Les paiements sur plan sont-ils protégés ?", answer: "Oui. La loi de Dubai (RERA) impose que chaque projet sur plan dépose les paiements des acheteurs sur un compte séquestre réglementé. Les fonds ne sont versés au promoteur qu'à mesure que les étapes de construction sont validées, protégeant votre argent en cas de retard." },
      { question: "Le sur plan est-il un bon investissement à Dubai ?", answer: "Les {typeLower} sur plan sont généralement moins chers que les biens livrés et permettent de bloquer le prix d'aujourd'hui tout en payant par versements. Les acheteurs profitent de la plus-value pendant la construction, et l'absence d'impôt sur les plus-values et la propriété à Dubai signifie que les gains sont conservés en totalité." },
      { question: "Quels frais s'appliquent lors d'un achat sur plan à Dubai ?", answer: "Prévoyez les frais d'enregistrement de 4 % du Dubai Land Department, des frais d'enregistrement Oqood (environ 3 000 AED) et d'éventuels frais administratifs du promoteur. Il n'y a pas d'impôt foncier annuel. La TVA ne s'applique pas aux logements résidentiels." },
      { question: "L'achat sur plan donne-t-il droit au Golden Visa des Émirats ?", answer: "Oui. Un achat sur plan de 2 millions d'AED ou plus donne droit au Golden Visa de 10 ans, à condition que le montant déjà payé atteigne le seuil ou soit couvert par un crédit approuvé. Notre équipe peut vous accompagner dans la démarche." },
    ],
    ctaTitle: "Prêt à investir dans des {typeLower} sur plan ?",
    ctaDesc: "Accédez en avant-première aux nouveaux lancements, aux plans de paiement exclusifs et aux disponibilités avant leur sortie publique. Nos spécialistes du sur plan sont disponibles du lundi au samedi, de 9h00 à 18h00.",
    ctaBtn: "Réserver une consultation gratuite",
  },
  ru: {
    stats: [
      { n: "", label: "Проектов в новостройках" },
      { n: "10%+", label: "Планы рассрочки" },
      { n: "0%", label: "Налог на прирост капитала" },
      { n: "100%", label: "Защита через эскроу" },
    ],
    faqHeading: "{type} в новостройках Дубая, частые вопросы",
    faqs: [
      { question: "Могут ли иностранцы покупать {typeLower} в новостройках Дубая?", answer: "Да. Граждане любых стран могут покупать {typeLower} в новостройках в полную собственность (freehold) в специально отведённых районах Дубая. Вы подписываете договор купли-продажи (SPA), а застройщик регистрирует Oqood (первичный титул на стадии строительства) в Земельном департаменте Дубая. Резидентство ОАЭ не требуется, полная собственность переходит к вам при передаче объекта." },
      { question: "Как работают планы рассрочки в новостройках Дубая?", answer: "Off-plan {typeLower} продаются по планам, привязанным к ходу строительства, обычно 10-20% первоначальный взнос при бронировании, поэтапные платежи во время строительства и остаток при передаче. Многие проекты также предлагают планы с оплатой после передачи ключей на срок 1-3 года." },
      { question: "Защищены ли платежи в новостройках?", answer: "Да. Закон Дубая (RERA) требует, чтобы каждый проект на стадии строительства размещал платежи покупателей на регулируемом эскроу-счёте. Средства передаются застройщику только по мере подтверждения этапов строительства, что защищает ваши деньги при задержках." },
      { question: "Выгодно ли инвестировать в новостройки Дубая?", answer: "Off-plan {typeLower} обычно стоят дешевле готовых объектов и позволяют зафиксировать сегодняшнюю цену, оплачивая в рассрочку. Покупатели получают прирост стоимости за период строительства, а нулевой налог на прирост капитала и недвижимость в Дубае означает, что прибыль остаётся у вас полностью." },
      { question: "Какие сборы возникают при покупке в новостройке Дубая?", answer: "Заложите 4% сбор за регистрацию в Земельном департаменте Дубая, сбор за регистрацию Oqood (около 3 000 AED) и возможные административные сборы застройщика. Ежегодного налога на недвижимость нет. НДС не применяется к жилой недвижимости." },
      { question: "Даёт ли покупка в новостройке право на Golden Visa ОАЭ?", answer: "Да. Покупка off-plan на сумму от 2 млн AED даёт право на 10-летнюю Golden Visa ОАЭ при условии, что оплаченная сумма достигает порога или покрыта одобренной ипотекой. Наша команда поможет с оформлением." },
    ],
    ctaTitle: "Готовы инвестировать в {typeLower} в новостройках?",
    ctaDesc: "Получите ранний доступ к новым запускам, эксклюзивным планам рассрочки и наличию планировок до публичного старта продаж. Наши специалисты по новостройкам на связи с понедельника по субботу, 9:00-18:00.",
    ctaBtn: "Записаться на бесплатную консультацию",
  },
  ar: {
    stats: [
      { n: "", label: "مشاريع على الخارطة" },
      { n: "10%+", label: "خطط الدفعة الأولى" },
      { n: "0%", label: "ضريبة الأرباح الرأسمالية" },
      { n: "100%", label: "محمي بحساب ضمان" },
    ],
    faqHeading: "{type} على الخارطة في دبي, الأسئلة الشائعة",
    faqs: [
      { question: "هل يمكن للأجانب شراء {type} على الخارطة في دبي؟", answer: "نعم. يمكن لجميع الجنسيات شراء العقارات على الخارطة بنظام التملك الحر في المناطق المخصصة في دبي. توقّع اتفاقية بيع وشراء (SPA) ويسجّل المطوّر «أوقود» (سند ملكية مبدئي للعقار على الخارطة) لدى دائرة الأراضي والأملاك في دبي. لا تُشترط الإقامة في الإمارات، وتنتقل إليك الملكية الكاملة عند التسليم." },
      { question: "كيف تعمل خطط السداد على الخارطة في دبي؟", answer: "تُباع العقارات على الخارطة بخطط سداد مرتبطة بمراحل البناء, عادةً دفعة أولى بنسبة 10-20% عند الحجز، وأقساط مرحلية أثناء البناء، والرصيد عند التسليم. كما تقدّم مشاريع كثيرة خطط ما بعد التسليم تمتد من سنة إلى ثلاث سنوات بعد استلام المفاتيح." },
      { question: "هل المدفوعات على الخارطة محمية؟", answer: "نعم. يفرض قانون دبي (RERA) على كل مشروع على الخارطة إيداع مدفوعات المشترين في حساب ضمان (إسكرو) خاضع للرقابة. ولا تُفرَج الأموال للمطوّر إلا مع التحقق من إنجاز مراحل البناء، مما يحمي أموالك في حال تأخّر المشروع." },
      { question: "هل الشراء على الخارطة استثمار جيد في دبي؟", answer: "غالبًا ما تكون أسعار العقارات على الخارطة أقل من الجاهزة، وتتيح لك تثبيت سعر اليوم مع السداد بالأقساط. يستفيد المشترون من ارتفاع رأس المال خلال فترة البناء، وانعدام ضريبة الأرباح الرأسمالية والعقارات في دبي يعني الاحتفاظ بالأرباح بالكامل." },
      { question: "ما الرسوم المترتبة عند الشراء على الخارطة في دبي؟", answer: "احسب رسوم تسجيل بنسبة 4% لدائرة الأراضي والأملاك في دبي، ورسوم تسجيل «أوقود» (نحو 3,000 درهم)، وأي رسوم إدارية للمطوّر. لا توجد ضريبة عقارية سنوية، ولا تُطبَّق ضريبة القيمة المضافة على المساكن السكنية." },
      { question: "هل يؤهّل الشراء على الخارطة للحصول على الإقامة الذهبية؟", answer: "نعم. يؤهّل الشراء على الخارطة بقيمة مليوني درهم أو أكثر للحصول على الإقامة الذهبية لمدة 10 سنوات، شريطة أن يبلغ المبلغ المدفوع الحد المطلوب أو أن يكون مغطى برهن عقاري معتمد. ويمكن لفريقنا إرشادك خلال التقديم." },
    ],
    ctaTitle: "هل أنت مستعد للاستثمار في {type} على الخارطة؟",
    ctaDesc: "احصل على وصول مبكر للإطلاقات الجديدة وخطط السداد الحصرية وتوفّر المخططات قبل طرحها للعامة. مختصّو العقارات على الخارطة لدينا متاحون من الاثنين إلى السبت، 9:00 صباحاً - 6:00 مساءً.",
    ctaBtn: "احجز استشارة مجانية",
  },
  zh: {
    stats: [
      { n: "", label: "期房项目" },
      { n: "10%+", label: "首付分期计划" },
      { n: "0%", label: "资本利得税" },
      { n: "100%", label: "托管账户保护" },
    ],
    faqHeading: "迪拜期房{type}, 常见问题",
    faqs: [
      { question: "外国人可以在迪拜购买期房{type}吗？", answer: "可以。所有国籍人士均可在迪拜指定区域以永久产权（freehold）方式购买期房。您签署买卖协议（SPA），开发商向迪拜土地局登记 Oqood（期房初始产权）。无需阿联酋居留身份，交房时完整产权即转移给您。" },
      { question: "迪拜期房的付款计划如何运作？", answer: "期房{type}按与施工进度挂钩的付款计划销售, , 通常预订时支付 10-20% 首付，施工期间分期付款，交房时支付尾款。许多项目还提供交房后付款计划，在收房后 1-3 年内分摊付款。" },
      { question: "期房付款受保护吗？", answer: "受保护。迪拜法律（RERA）要求每个期房项目将购房款存入受监管的托管（escrow）账户。只有在施工里程碑得到核实后，资金才会拨付给开发商，从而在项目延期时保护您的资金。" },
      { question: "期房在迪拜是好的投资吗？", answer: "期房{type}通常定价低于现房，可让您锁定当前价格并分期付款。买家可在施工期间获得资本增值，而迪拜 0% 的资本利得税和房产税意味着收益可全额保留。" },
      { question: "在迪拜购买期房需要支付哪些费用？", answer: "请预留迪拜土地局 4% 的登记费、Oqood 登记费（约 3,000 迪拉姆）以及开发商的行政费用。没有年度房产税，住宅物业不征收增值税。" },
      { question: "购买期房可以申请阿联酋黄金签证吗？", answer: "可以。购买价值 200 万迪拉姆或以上的期房可申请 10 年期阿联酋黄金签证，前提是已付金额达到门槛或由获批贷款覆盖。我们的团队可协助您完成申请。" },
    ],
    ctaTitle: "准备好投资期房{type}了吗？",
    ctaDesc: "在公开发售前抢先获取新项目、专属付款计划和户型房源信息。我们的期房专家周一至周六 9:00 - 18:00 为您服务。",
    ctaBtn: "预约免费咨询",
  },
  vi: {
    stats: [
      { n: "", label: "Dự án off-plan" },
      { n: "10%+", label: "Kế hoạch trả trước" },
      { n: "0%", label: "Thuế lãi vốn" },
      { n: "100%", label: "Bảo vệ qua ký quỹ" },
    ],
    faqHeading: "{type} off-plan tại Dubai, Câu hỏi thường gặp",
    faqs: [
      { question: "Người nước ngoài có được mua {typeLower} off-plan tại Dubai không?", answer: "Có. Mọi quốc tịch đều có thể mua bất động sản off-plan theo hình thức sở hữu vĩnh viễn (freehold) tại các khu vực được chỉ định ở Dubai. Bạn ký Hợp đồng Mua bán (SPA) và chủ đầu tư đăng ký Oqood (giấy chứng nhận sở hữu off-plan ban đầu) với Sở Đất đai Dubai. Không cần thường trú tại UAE, và quyền sở hữu đầy đủ được chuyển cho bạn khi bàn giao." },
      { question: "Kế hoạch thanh toán off-plan tại Dubai hoạt động thế nào?", answer: "Bất động sản off-plan được bán theo kế hoạch thanh toán gắn với tiến độ xây dựng, thường là trả trước 10-20% khi đặt chỗ, các đợt theo tiến độ trong quá trình xây dựng và phần còn lại khi bàn giao. Nhiều dự án còn có kế hoạch sau bàn giao kéo dài 1-3 năm sau khi nhận nhà." },
      { question: "Các khoản thanh toán off-plan có được bảo vệ không?", answer: "Có. Luật Dubai (RERA) yêu cầu mọi dự án off-plan gửi tiền thanh toán của người mua vào tài khoản ký quỹ (escrow) được quản lý. Tiền chỉ được giải ngân cho chủ đầu tư khi các mốc xây dựng được xác minh, bảo vệ tiền của bạn nếu dự án chậm tiến độ." },
      { question: "Off-plan có phải khoản đầu tư tốt tại Dubai không?", answer: "Bất động sản off-plan thường có giá thấp hơn nhà có sẵn và cho phép bạn chốt giá hôm nay trong khi trả góp. Người mua hưởng lợi từ tăng giá trong giai đoạn xây dựng, và mức thuế lãi vốn và thuế bất động sản 0% của Dubai nghĩa là lợi nhuận được giữ trọn vẹn." },
      { question: "Mua off-plan tại Dubai phải trả những phí gì?", answer: "Hãy dự trù phí đăng ký 4% của Sở Đất đai Dubai, phí đăng ký Oqood (khoảng 3.000 AED) và các phí hành chính của chủ đầu tư. Không có thuế bất động sản hằng năm, và VAT không áp dụng cho nhà ở." },
      { question: "Mua off-plan có đủ điều kiện nhận Golden Visa UAE không?", answer: "Có. Mua off-plan từ 2 triệu AED trở lên đủ điều kiện nhận Golden Visa UAE 10 năm, với điều kiện số tiền đã trả đạt ngưỡng hoặc được bảo đảm bằng khoản vay đã duyệt. Đội ngũ của chúng tôi sẽ hướng dẫn bạn nộp hồ sơ." },
    ],
    ctaTitle: "Sẵn sàng đầu tư {typeLower} off-plan?",
    ctaDesc: "Tiếp cận sớm các dự án mới, kế hoạch thanh toán độc quyền và tình trạng mặt bằng trước khi mở bán công khai. Chuyên gia off-plan của chúng tôi phục vụ từ Thứ Hai đến Thứ Bảy, 9:00 - 18:00.",
    ctaBtn: "Đặt lịch tư vấn miễn phí",
  },
  he: {
    stats: [
      { n: "", label: "פרויקטים על הנייר" },
      { n: "10%+", label: "מסלולי מקדמה" },
      { n: "0%", label: "מס רווחי הון" },
      { n: "100%", label: "מוגן בנאמנות" },
    ],
    faqHeading: "{type} על הנייר בדובאי, שאלות נפוצות",
    faqs: [
      { question: "האם זרים יכולים לקנות {type} על הנייר בדובאי?", answer: "כן. כל הלאומים יכולים לרכוש נכסים על הנייר בבעלות מלאה (freehold) באזורים המיועדים בדובאי. חותמים על הסכם מכר (SPA) והיזם רושם Oqood (רישום בעלות ראשוני לנכס על הנייר) ברשות המקרקעין של דובאי. אין צורך בתושבות באיחוד, והבעלות המלאה עוברת אליכם במסירה." },
      { question: "כיצד פועלים מסלולי התשלום על הנייר בדובאי?", answer: "נכסים על הנייר נמכרים במסלולי תשלום הצמודים להתקדמות הבנייה, בדרך כלל מקדמה של 10-20% בהזמנה, תשלומים מדורגים במהלך הבנייה והיתרה במסירה. פרויקטים רבים מציעים גם מסלולים שלאחר המסירה הנפרסים על פני 1-3 שנים לאחר קבלת המפתחות." },
      { question: "האם התשלומים על הנייר מוגנים?", answer: "כן. חוק דובאי (RERA) מחייב כל פרויקט על הנייר להפקיד את תשלומי הרוכשים בחשבון נאמנות (escrow) מפוקח. הכספים משוחררים ליזם רק עם אימות אבני הדרך בבנייה, מה שמגן על כספכם במקרה של עיכוב." },
      { question: "האם רכישה על הנייר היא השקעה טובה בדובאי?", answer: "נכסים על הנייר מתומחרים בדרך כלל מתחת לנכסים מוכנים ומאפשרים לנעול את מחיר היום תוך תשלום בפריסה. הרוכשים נהנים מעליית ערך לאורך תקופת הבנייה, ומס רווחי ההון והנכס של 0% בדובאי משמעו שהרווחים נשמרים במלואם." },
      { question: "אילו עמלות חלות ברכישה על הנייר בדובאי?", answer: "תכננו את אגרת הרישום של 4% לרשות המקרקעין של דובאי, אגרת רישום Oqood (כ-AED 3,000) וכל עמלות ניהול של היזם. אין מס רכוש שנתי, ומע\"מ אינו חל על דירות מגורים." },
      { question: "האם רכישה על הנייר מזכה בוויזת הזהב של איחוד האמירויות?", answer: "כן. רכישה על הנייר של AED 2 מיליון ומעלה מזכה בוויזת הזהב ל-10 שנים, בתנאי שהסכום ששולם מגיע לסף או מכוסה במשכנתה מאושרת. הצוות שלנו ילווה אתכם בתהליך." },
    ],
    ctaTitle: "מוכנים להשקיע ב{type} על הנייר?",
    ctaDesc: "קבלו גישה מוקדמת להשקות חדשות, מסלולי תשלום בלעדיים וזמינות תוכניות דירה לפני שהן יוצאות לציבור. מומחי הנכסים על הנייר שלנו זמינים בימים ב'-ש', בשעות 9:00-18:00.",
    ctaBtn: "לקביעת ייעוץ חינם",
  },
};

function fill(s: string, typeLabel: string): string {
  return s.replaceAll("{type}", typeLabel).replaceAll("{typeLower}", typeLabel.toLowerCase());
}

async function getInitialOffPlanListings(searchType: string) {
  try {
    const res = await serverFetch(
      serverApiUrl(`/api/search?intent=off-plan&status=Off-Plan&type=${encodeURIComponent(searchType)}&pageSize=24`),
      8000,
    );
    if (!res.ok) return null;
    return res.json() as Promise<any>; // server-trusted API response
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, type } = await params;
  const entry = TYPES[type as TypeSlug];
  if (!entry) notFound();
  const typeLabel = entry.label[(locale as Loc)] ?? entry.label.en;
  const url = canonical(locale, `/off-plan/${type}`);
  const title = titleFor(typeLabel, locale);
  const description = descFor(typeLabel, locale);
  return {
    title,
    description,
    alternates: { canonical: url, languages: altLangs(`/off-plan/${type}`) },
    openGraph: {
      title, description, url, type: "website",
      locale: OG_LOCALE[locale] ?? "en_AE",
      images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630 }],
    },
  };
}

export default async function OffPlanTypePage({ params }: Props) {
  const { locale, type } = await params;
  const entry = TYPES[type as TypeSlug];
  if (!entry) return notFound();

  const isRtl = locale === "ar" || locale === "he";
  const lp = locale === "en" ? "" : `/${locale}`;
  const typeLabel = entry.label[(locale as Loc)] ?? entry.label.en;
  const offplan = OFFPLAN_LABEL[locale] ?? OFFPLAN_LABEL.en;
  const c = CONTENT[locale] ?? CONTENT.en;

  // Match the client's query exactly — SearchPageClient normalizes defaultType
  // before fetching, and "Townhouse" normalizes to "Villa". Without this the
  // SSR'd listings wouldn't match what the client requests on that page.
  const normalizedType = String(normalizePropertyType(entry.searchType, entry.searchType));
  const initialData = await getInitialOffPlanListings(normalizedType);

  const faqs = c.faqs.map((f) => ({ question: fill(f.question, typeLabel), answer: fill(f.answer, typeLabel) }));

  // ItemList for the SSR'd projects shown on this landing page.
  const collectionItems: { url: string; name: string }[] = Array.isArray(initialData?.projects)
    ? initialData.projects
        .filter((p: any) => p?.slug && p?.name)
        .map((p: any) => ({ url: `/project/${p.slug}`, name: String(p.name) }))
    : [];

  const breadcrumbs = [
    { name: HOME_LABEL[locale] ?? HOME_LABEL.en, href: `${lp}/` },
    { name: offplan, href: `${lp}/off-plan` },
    { name: typeLabel, href: `${lp}/off-plan/${type}` },
  ];

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? "rtl" : "ltr"}>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <FAQJsonLd faqs={faqs} />
      <CollectionPageJsonLd
        name={titleFor(typeLabel, locale).split(" | ")[0]}
        description={descFor(typeLabel, locale)}
        url={`/off-plan/${type}`}
        items={collectionItems}
      />
      <Navbar />

      {/* Hero — compact; max-w-6xl matches SearchPageClient's container so the
          heading aligns with the search bar below it. */}
      <section
        className="relative overflow-hidden pt-28 pb-7 text-white"
        style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
      >
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)", backgroundSize: "48px 48px" }} />
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
          <p className="text-accent font-bold tracking-[0.4em] uppercase text-[11px] mb-2">{offplan}</p>
          <h1 className="text-2xl sm:text-4xl font-bold leading-tight mb-2">{titleFor(typeLabel, locale).split(" | ")[0]}</h1>
          <p className="text-primary-foreground/80 text-sm sm:text-base max-w-2xl">{descFor(typeLabel, locale)}</p>
        </div>
      </section>

      {/* Search + sidebar — SearchPageClient keeps the filter bar full-width and
          docks the sidebar on the right next to the listings (below the filters). */}
      <SearchPageClient
        defaultStatus="Off-Plan"
        defaultIntent="off-plan"
        defaultType={entry.searchType}
        syncUrl={false}
        initialData={initialData}
        sidebarSlot={<PropertyTypeSidebar locale={locale} slug="off-plan" />}
      />

      {/* FAQ + CTA — full width below the search/listings */}
      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-10 sm:py-14 space-y-12 sm:space-y-16">

        {/* FAQ */}
        <div>
          <div className="text-center mb-8">
            <p className="text-accent font-bold tracking-[0.35em] uppercase text-xs mb-3">FAQ</p>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">{fill(c.faqHeading, typeLabel)}</h2>
          </div>
          <div className="space-y-2 sm:space-y-3">
            {faqs.map((faq, i) => (
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
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">{fill(c.ctaTitle, typeLabel)}</h2>
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
                href={waHref(WA_DEFAULT_MESSAGE, "/off-plan")}
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

      <Footer />
    </div>
  );
}
