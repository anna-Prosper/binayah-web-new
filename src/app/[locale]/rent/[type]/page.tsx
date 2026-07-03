/* eslint-disable i18next/no-literal-string -- multilingual SEO landing page */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { waHref, WA_DEFAULT_MESSAGE } from "@/lib/whatsapp";
import Link from "next/link";
import { BreadcrumbJsonLd, CollectionPageJsonLd, FAQJsonLd } from "@/components/JsonLd";
import { canonical, altLangs, OG_LOCALE, DEFAULT_OG_IMAGE } from "@/lib/site";
import { serverFetch, serverApiUrl } from "@/lib/api";
import { normalizePropertyType } from "@/lib/property-types";
import SearchPageClient from "@/app/_clients/search/SearchPageClient";
import PropertyTypeSidebar from "@/components/PropertyTypeSidebar";

export const dynamic = "force-dynamic";

async function getInitialRentTypeListings(searchType: string) {
  try {
    const t = String(normalizePropertyType(searchType, searchType));
    const res = await serverFetch(serverApiUrl(`/api/search?intent=rent&type=${encodeURIComponent(t)}&pageSize=24`), 8000);
    if (!res.ok) return null;
    return res.json() as Promise<any>;
  } catch {
    return null;
  }
}

interface Props {
  params: Promise<{ locale: string; type: string }>;
}

// URL slug -> { searchType passed to SearchPageClient, per-locale label, sidebar slug }
const TYPES = {
  apartments: {
    searchType: "Apartment", slug: "apartments",
    label: { en: "Apartments", ru: "Апартаменты", ar: "شقق", zh: "公寓", vi: "Căn hộ", he: "דירות" },
  },
  villas: {
    searchType: "Villa", slug: "villas",
    label: { en: "Villas", ru: "Виллы", ar: "فلل", zh: "别墅", vi: "Biệt thự", he: "וילות" },
  },
  townhouses: {
    searchType: "Townhouse", slug: "townhouses",
    label: { en: "Townhouses", ru: "Таунхаусы", ar: "تاون هاوس", zh: "联排别墅", vi: "Nhà phố", he: "בתים טוריים" },
  },
} as const;

type TypeSlug = keyof typeof TYPES;
type Loc = keyof (typeof TYPES)["apartments"]["label"];

const RENT_LABEL: Record<string, string> = {
  fr: "Louer",
  en: "Rent", ru: "Аренда", ar: "إيجار", zh: "租赁", vi: "Thuê", he: "השכרה",
};
const HOME_LABEL: Record<string, string> = {
  fr: "Accueil",
  en: "Home", ru: "Главная", ar: "الرئيسية", zh: "首页", vi: "Trang chủ", he: "בית",
};

function titleFor(typeLabel: string, locale: string): string {
  switch (locale) {
    case "ru": return `Аренда: ${typeLabel.toLowerCase()} в Дубае | Binayah Properties`;
    case "ar": return `${typeLabel} للإيجار في دبي | بناية للعقارات`;
    case "zh": return `迪拜${typeLabel}租赁 | Binayah Properties`;
    case "vi": return `${typeLabel} cho thuê tại Dubai | Binayah Properties`;
    case "he": return `${typeLabel} להשכרה בדובאי | Binayah Properties`;
    default: return `${typeLabel} for Rent in Dubai | Binayah Properties`;
  }
}
function descFor(typeLabel: string, locale: string): string {
  switch (locale) {
    case "ru": return `Аренда: ${typeLabel.toLowerCase()} в Дубае. Проверенные объявления по районам, цене и количеству спален. Поддержка экспертов Binayah.`;
    case "ar": return `${typeLabel} للإيجار في دبي. عروض موثوقة حسب المنطقة والسعر وعدد الغرف. دعم خبراء بناية.`;
    case "zh": return `迪拜${typeLabel}租赁。按地区、价格和卧室数量筛选的真实房源。Binayah专家支持。`;
    case "vi": return `${typeLabel} cho thuê tại Dubai. Tin đăng đã xác minh theo khu vực, giá và số phòng ngủ. Hỗ trợ chuyên gia Binayah.`;
    case "he": return `${typeLabel} להשכרה בדובאי. מודעות מאומתות לפי אזור, מחיר ומספר חדרי שינה. ליווי מומחי Binayah.`;
    default: return `${typeLabel} for rent in Dubai. Verified listings filtered by area, price and bedrooms. Expert support from Binayah.`;
  }
}

// Localized rent FAQ + CTA. `{type}` → localized type label so one block serves
// apartments, villas and townhouses; gives each rent type page real content.
interface RentContent {
  faqHeading: string;
  faqs: { question: string; answer: string }[];
  ctaTitle: string;
  ctaDesc: string;
  ctaBtn: string;
}

const RENT_CONTENT: Record<string, RentContent> = {
  en: {
    faqHeading: "Renting {type} in Dubai, FAQs",
    faqs: [
      { question: "Can foreigners rent {type} in Dubai?", answer: "Yes. Any nationality can rent {typeLower} in Dubai. You'll need a passport and a UAE residence visa or Emirates ID; tourists on a visit visa can rent short-term. Every tenancy contract is registered with RERA through Ejari." },
      { question: "How are rent payments structured in Dubai?", answer: "Annual rent is typically paid with 1-4 post-dated cheques, fewer cheques often secure a better price. Some landlords and agencies now accept monthly payments by card or bank transfer for a small premium." },
      { question: "What is Ejari and is it required?", answer: "Ejari is the Dubai Land Department's official tenancy-registration system. Registration is mandatory and is needed to connect DEWA (utilities), sponsor family visas, and enrol children in school. It costs around AED 220." },
      { question: "What upfront costs should I budget when renting {type}?", answer: "Plan for a refundable security deposit (5% of annual rent unfurnished, 10% furnished), agency commission (typically 5% of annual rent), the Ejari fee (~AED 220) and a DEWA connection deposit (AED 2,000 apartment / AED 4,000 villa)." },
      { question: "Can my landlord increase the rent?", answer: "Only within the limits of the RERA rental index, which caps increases based on how far your rent sits below the market rate. The landlord must give 90 days' written notice before renewal, there is no increase in the first year of a tenancy." },
      { question: "What documents do I need to rent in Dubai?", answer: "A passport copy, your UAE residence visa and Emirates ID (or visit-visa stamp for short lets), and the cheques or proof of income for payment. Our team handles the contract and Ejari registration for you." },
    ],
    ctaTitle: "Looking to Rent {type} in Dubai?",
    ctaDesc: "Tell us your budget, preferred area and move-in date, our rental specialists will share matching {typeLower} and arrange viewings. Available 7 days a week.",
    ctaBtn: "Talk to a Rental Expert",
  },
  fr: {
    faqHeading: "Louer des {typeLower} à Dubai, FAQ",
    faqs: [
      { question: "Les étrangers peuvent-ils louer des {typeLower} à Dubai ?", answer: "Oui. Toutes les nationalités peuvent louer à Dubai. Il vous faut un passeport et un visa de résidence ou une carte Emirates ID ; les touristes peuvent louer en courte durée. Chaque contrat est enregistré auprès du RERA via Ejari." },
      { question: "Comment sont structurés les paiements de loyer à Dubai ?", answer: "Le loyer annuel se règle généralement par 1 à 4 chèques postdatés, moins de chèques permet souvent un meilleur prix. Certains bailleurs acceptent désormais des paiements mensuels par carte ou virement, moyennant un léger supplément." },
      { question: "Qu'est-ce qu'Ejari et est-ce obligatoire ?", answer: "Ejari est le système officiel d'enregistrement des baux du Dubai Land Department. L'enregistrement est obligatoire et nécessaire pour raccorder la DEWA, parrainer des visas familiaux et inscrire les enfants à l'école. Coût : environ 220 AED." },
      { question: "Quels frais initiaux prévoir pour louer des {typeLower} ?", answer: "Prévoyez un dépôt de garantie remboursable (5 % du loyer annuel non meublé, 10 % meublé), une commission d'agence (généralement 5 % du loyer annuel), les frais Ejari (~220 AED) et un dépôt DEWA (2 000 AED appartement / 4 000 AED villa)." },
      { question: "Mon propriétaire peut-il augmenter le loyer ?", answer: "Uniquement dans les limites de l'indice locatif du RERA, qui plafonne les hausses selon l'écart entre votre loyer et le marché. Un préavis écrit de 90 jours est obligatoire avant le renouvellement, aucune hausse la première année." },
      { question: "Quels documents pour louer à Dubai ?", answer: "Une copie du passeport, votre visa de résidence et carte Emirates ID (ou tampon de visa touristique pour le court terme), et les chèques ou justificatifs de revenus. Notre équipe gère le contrat et l'enregistrement Ejari pour vous." },
    ],
    ctaTitle: "Vous cherchez à louer des {typeLower} à Dubai ?",
    ctaDesc: "Indiquez votre budget, votre quartier et votre date d'emménagement, nos spécialistes de la location vous proposeront des {typeLower} correspondants et organiseront les visites. Disponibles 7j/7.",
    ctaBtn: "Parler à un expert location",
  },
  ru: {
    faqHeading: "Аренда: {typeLower} в Дубае, частые вопросы",
    faqs: [
      { question: "Могут ли иностранцы арендовать {typeLower} в Дубае?", answer: "Да. Граждане любых стран могут арендовать жильё в Дубае. Понадобится паспорт и резидентская виза ОАЭ или Emirates ID; туристы по визиту могут снять краткосрочно. Каждый договор регистрируется в RERA через Ejari." },
      { question: "Как устроены арендные платежи в Дубае?", answer: "Годовая аренда обычно оплачивается 1-4 чеками с отсроченной датой, меньше чеков часто означает лучшую цену. Некоторые арендодатели и агентства принимают ежемесячную оплату картой или переводом с небольшой наценкой." },
      { question: "Что такое Ejari и обязателен ли он?", answer: "Ejari, официальная система регистрации аренды Земельного департамента Дубая. Регистрация обязательна и нужна для подключения DEWA, спонсирования виз семьи и зачисления детей в школу. Стоит около 220 AED." },
      { question: "Какие первоначальные расходы при аренде {typeLower}?", answer: "Заложите возвратный депозит (5% годовой аренды без мебели, 10% с мебелью), комиссию агентства (обычно 5% годовой аренды), сбор Ejari (~220 AED) и депозит DEWA (2 000 AED квартира / 4 000 AED вилла)." },
      { question: "Может ли арендодатель повысить плату?", answer: "Только в пределах индекса аренды RERA, который ограничивает рост в зависимости от того, насколько ваша ставка ниже рыночной. Требуется письменное уведомление за 90 дней до продления, в первый год повышения нет." },
      { question: "Какие документы нужны для аренды в Дубае?", answer: "Копия паспорта, резидентская виза ОАЭ и Emirates ID (или штамп визита для краткосрочной аренды), а также чеки или подтверждение дохода. Наша команда оформит договор и регистрацию Ejari." },
    ],
    ctaTitle: "Хотите арендовать {typeLower} в Дубае?",
    ctaDesc: "Сообщите бюджет, желаемый район и дату заселения, наши специалисты подберут подходящие {typeLower} и организуют просмотры. Работаем 7 дней в неделю.",
    ctaBtn: "Связаться со специалистом",
  },
  ar: {
    faqHeading: "استئجار {type} في دبي, الأسئلة الشائعة",
    faqs: [
      { question: "هل يمكن للأجانب استئجار {type} في دبي؟", answer: "نعم. يمكن لجميع الجنسيات الاستئجار في دبي. ستحتاج إلى جواز سفر وتأشيرة إقامة في الإمارات أو هوية إماراتية؛ ويمكن للسياح الاستئجار لفترات قصيرة. ويُسجَّل كل عقد إيجار لدى مؤسسة التنظيم العقاري عبر «إيجاري»." },
      { question: "كيف تُنظَّم دفعات الإيجار في دبي؟", answer: "يُدفع الإيجار السنوي عادةً بـ 1-4 شيكات مؤجلة, وعدد الشيكات الأقل غالبًا يضمن سعرًا أفضل. وتقبل بعض الجهات الآن الدفع الشهري بالبطاقة أو التحويل مقابل زيادة بسيطة." },
      { question: "ما هو «إيجاري» وهل هو إلزامي؟", answer: "«إيجاري» هو النظام الرسمي لتسجيل عقود الإيجار لدى دائرة الأراضي والأملاك في دبي. التسجيل إلزامي ولازم لتوصيل ديوا، وكفالة تأشيرات العائلة، وتسجيل الأبناء في المدارس. وتبلغ تكلفته نحو 220 درهمًا." },
      { question: "ما التكاليف المبدئية عند استئجار {type}؟", answer: "احسب تأمينًا قابلًا للاسترداد (5% من الإيجار السنوي غير المفروش، و10% للمفروش)، وعمولة الوكالة (عادةً 5% من الإيجار السنوي)، ورسوم «إيجاري» (~220 درهمًا)، وتأمين ديوا (2,000 درهم للشقة / 4,000 درهم للفيلا)." },
      { question: "هل يمكن للمالك زيادة الإيجار؟", answer: "فقط ضمن حدود مؤشر الإيجارات لمؤسسة التنظيم العقاري، الذي يحدّ من الزيادة بحسب مدى انخفاض إيجارك عن سعر السوق. ويجب إشعار خطي قبل 90 يومًا من التجديد, ولا زيادة في السنة الأولى." },
      { question: "ما المستندات المطلوبة للاستئجار في دبي؟", answer: "نسخة من جواز السفر، وتأشيرة الإقامة والهوية الإماراتية (أو ختم تأشيرة الزيارة للإيجار القصير)، والشيكات أو إثبات الدخل. ويتولّى فريقنا إعداد العقد وتسجيل «إيجاري» نيابةً عنك." },
    ],
    ctaTitle: "تبحث عن استئجار {type} في دبي؟",
    ctaDesc: "أخبرنا بميزانيتك والمنطقة المفضّلة وتاريخ الانتقال, وسيشاركك مختصّو الإيجار لدينا الوحدات المطابقة وينظّمون المعاينات. متاحون 7 أيام في الأسبوع.",
    ctaBtn: "تحدث إلى خبير إيجار",
  },
  zh: {
    faqHeading: "在迪拜租赁{type}, 常见问题",
    faqs: [
      { question: "外国人可以在迪拜租赁{type}吗？", answer: "可以。所有国籍人士均可在迪拜租房。您需要护照以及阿联酋居留签证或 Emirates ID；持访问签证的游客可短租。每份租赁合同都通过 Ejari 在 RERA 登记。" },
      { question: "迪拜的租金如何支付？", answer: "年租通常以 1-4 张远期支票支付, , 支票越少通常价格越优惠。部分房东和中介现可接受刷卡或转账按月支付，需支付少量溢价。" },
      { question: "什么是 Ejari，是否必须办理？", answer: "Ejari 是迪拜土地局官方的租赁登记系统。登记为强制要求，办理 DEWA（水电）、为家属担保签证及子女入学均需用到，费用约 220 迪拉姆。" },
      { question: "租赁{type}需要哪些前期费用？", answer: "请预留可退还押金（无家具为年租的 5%，带家具为 10%）、中介佣金（通常为年租的 5%）、Ejari 费用（约 220 迪拉姆）以及 DEWA 接通押金（公寓 2,000 迪拉姆 / 别墅 4,000 迪拉姆）。" },
      { question: "房东可以涨租吗？", answer: "只能在 RERA 租金指数允许的范围内上调，涨幅取决于您的租金低于市场价的程度。续约前须提前 90 天书面通知, , 租期第一年不得涨租。" },
      { question: "在迪拜租房需要哪些文件？", answer: "护照复印件、阿联酋居留签证及 Emirates ID（短租可用访问签证章），以及支票或收入证明。合同与 Ejari 登记由我们的团队为您办理。" },
    ],
    ctaTitle: "想在迪拜租赁{type}？",
    ctaDesc: "告诉我们您的预算、心仪区域和入住时间, , 我们的租赁专家将推荐匹配房源并安排看房。每周 7 天为您服务。",
    ctaBtn: "咨询租赁专家",
  },
  vi: {
    faqHeading: "Thuê {typeLower} tại Dubai, Câu hỏi thường gặp",
    faqs: [
      { question: "Người nước ngoài có được thuê {typeLower} tại Dubai không?", answer: "Có. Mọi quốc tịch đều có thể thuê nhà tại Dubai. Bạn cần hộ chiếu và thị thực cư trú UAE hoặc Emirates ID; khách du lịch có thể thuê ngắn hạn. Mọi hợp đồng thuê đều được đăng ký với RERA qua Ejari." },
      { question: "Tiền thuê tại Dubai được thanh toán thế nào?", answer: "Tiền thuê năm thường trả bằng 1-4 tấm séc ghi ngày sau, càng ít séc thường càng được giá tốt. Một số chủ nhà và đại lý nay chấp nhận trả hàng tháng qua thẻ hoặc chuyển khoản với mức phụ phí nhỏ." },
      { question: "Ejari là gì và có bắt buộc không?", answer: "Ejari là hệ thống đăng ký hợp đồng thuê chính thức của Sở Đất đai Dubai. Việc đăng ký là bắt buộc và cần để đấu nối DEWA (điện nước), bảo lãnh thị thực gia đình và cho con nhập học. Chi phí khoảng 220 AED." },
      { question: "Cần dự trù chi phí ban đầu nào khi thuê {typeLower}?", answer: "Hãy dự trù tiền đặt cọc hoàn lại (5% tiền thuê năm nếu không nội thất, 10% nếu có nội thất), hoa hồng đại lý (thường 5% tiền thuê năm), phí Ejari (~220 AED) và tiền cọc đấu nối DEWA (2.000 AED căn hộ / 4.000 AED biệt thự)." },
      { question: "Chủ nhà có được tăng tiền thuê không?", answer: "Chỉ trong giới hạn của chỉ số thuê RERA, vốn giới hạn mức tăng dựa trên khoảng cách giữa giá thuê của bạn và giá thị trường. Phải báo trước bằng văn bản 90 ngày trước khi gia hạn, năm đầu tiên không được tăng." },
      { question: "Cần giấy tờ gì để thuê nhà tại Dubai?", answer: "Bản sao hộ chiếu, thị thực cư trú UAE và Emirates ID (hoặc dấu thị thực du lịch cho thuê ngắn hạn), cùng séc hoặc chứng minh thu nhập. Đội ngũ của chúng tôi lo hợp đồng và đăng ký Ejari cho bạn." },
    ],
    ctaTitle: "Đang tìm thuê {typeLower} tại Dubai?",
    ctaDesc: "Cho chúng tôi biết ngân sách, khu vực mong muốn và ngày dọn vào, chuyên gia cho thuê của chúng tôi sẽ gửi {typeLower} phù hợp và sắp xếp xem nhà. Phục vụ 7 ngày/tuần.",
    ctaBtn: "Trao đổi với chuyên gia cho thuê",
  },
  he: {
    faqHeading: "השכרת {type} בדובאי, שאלות נפוצות",
    faqs: [
      { question: "האם זרים יכולים לשכור {type} בדובאי?", answer: "כן. כל לאום יכול לשכור בדובאי. תזדקקו לדרכון ולאשרת תושב באיחוד או ל-Emirates ID; תיירים באשרת ביקור יכולים לשכור לטווח קצר. כל חוזה שכירות נרשם ב-RERA דרך Ejari." },
      { question: "כיצד בנויים תשלומי השכירות בדובאי?", answer: "שכר הדירה השנתי משולם בדרך כלל ב-1-4 צ'קים דחויים, פחות צ'קים מבטיח לרוב מחיר טוב יותר. חלק מהמשכירים והסוכנויות מאפשרים כיום תשלום חודשי בכרטיס או בהעברה בתוספת קטנה." },
      { question: "מהו Ejari והאם הוא חובה?", answer: "Ejari היא מערכת הרישום הרשמית של חוזי השכירות ברשות המקרקעין של דובאי. הרישום הוא חובה ונדרש לחיבור DEWA (חשמל ומים), לחסות אשרות משפחה ולרישום ילדים לבית הספר. עלותו כ-220 درهم." },
      { question: "אילו עלויות ראשוניות לתכנן בהשכרת {type}?", answer: "תכננו פיקדון בר-החזר (5% מהשכירות השנתית ללא ריהוט, 10% עם ריהוט), עמלת סוכנות (לרוב 5% מהשכירות השנתית), אגרת Ejari (כ-220 درهم) ופיקדון חיבור DEWA (2,000 درهم לדירה / 4,000 درهم לווילה)." },
      { question: "האם המשכיר רשאי להעלות את השכירות?", answer: "רק בגבולות מדד השכירות של RERA, המגביל את ההעלאה לפי המרחק בין שכר הדירה שלכם למחיר השוק. נדרשת הודעה בכתב 90 יום לפני החידוש, אין העלאה בשנה הראשונה." },
      { question: "אילו מסמכים נדרשים לשכירות בדובאי?", answer: "צילום דרכון, אשרת תושב ו-Emirates ID (או חותמת אשרת ביקור לשכירות קצרה), וצ'קים או הוכחת הכנסה. הצוות שלנו מטפל בחוזה וברישום Ejari עבורכם." },
    ],
    ctaTitle: "מחפשים לשכור {type} בדובאי?",
    ctaDesc: "ספרו לנו על התקציב, האזור המועדף ותאריך הכניסה, מומחי ההשכרה שלנו ישלחו {type} מתאימים ויארגנו צפייה. זמינים 7 ימים בשבוע.",
    ctaBtn: "לשיחה עם מומחה השכרה",
  },
};

function fillRent(s: string, typeLabel: string): string {
  return s.replaceAll("{type}", typeLabel).replaceAll("{typeLower}", typeLabel.toLowerCase());
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, type } = await params;
  const entry = TYPES[type as TypeSlug];
  if (!entry) notFound();
  const typeLabel = entry.label[(locale as Loc)] ?? entry.label.en;
  const url = canonical(locale, `/rent/${type}`);
  const title = titleFor(typeLabel, locale);
  const description = descFor(typeLabel, locale);
  return {
    title, description,
    alternates: { canonical: url, languages: altLangs(`/rent/${type}`) },
    openGraph: {
      title, description, url, type: "website",
      locale: OG_LOCALE[locale] ?? "en_AE",
      images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630 }],
    },
  };
}

export default async function RentTypePage({ params }: Props) {
  const { locale, type } = await params;
  const entry = TYPES[type as TypeSlug];
  if (!entry) return notFound();

  const isRtl = locale === "ar" || locale === "he";
  const lp = locale === "en" ? "" : `/${locale}`;
  const typeLabel = entry.label[(locale as Loc)] ?? entry.label.en;
  const rent = RENT_LABEL[locale] ?? RENT_LABEL.en;

  const rc = RENT_CONTENT[locale] ?? RENT_CONTENT.en;
  const faqs = rc.faqs.map((f) => ({ question: fillRent(f.question, typeLabel), answer: fillRent(f.answer, typeLabel) }));

  const initialData = await getInitialRentTypeListings(entry.searchType);
  const collectionItems: { url: string; name: string }[] = [
    ...(Array.isArray(initialData?.listings) ? initialData.listings : [])
      .filter((l: any) => l?.slug && (l?.title || l?.name))
      .map((l: any) => ({ url: `/property/${l.slug}`, name: String(l.title || l.name) })),
    ...(Array.isArray(initialData?.projects) ? initialData.projects : [])
      .filter((p: any) => p?.slug && p?.name)
      .map((p: any) => ({ url: `/project/${p.slug}`, name: String(p.name) })),
  ];

  const breadcrumbs = [
    { name: HOME_LABEL[locale] ?? HOME_LABEL.en, href: `${lp}/` },
    { name: rent, href: `${lp}/rent` },
    { name: typeLabel, href: `${lp}/rent/${type}` },
  ];

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? "rtl" : "ltr"}>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <CollectionPageJsonLd
        name={titleFor(typeLabel, locale).split(" | ")[0]}
        description={descFor(typeLabel, locale)}
        url={`/rent/${type}`}
        items={collectionItems}
      />
      <FAQJsonLd faqs={faqs} />
      <Navbar />

      <section
        className="relative overflow-hidden pt-28 pb-12 text-white"
        style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
      >
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)", backgroundSize: "48px 48px" }} />
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6">
          <p className="text-accent font-bold tracking-[0.4em] uppercase text-xs mb-3">{rent}</p>
          <h1 className="text-3xl sm:text-5xl font-bold leading-tight mb-4">{titleFor(typeLabel, locale).split(" | ")[0]}</h1>
          <p className="text-primary-foreground/80 text-lg max-w-2xl">{descFor(typeLabel, locale)}</p>
        </div>
      </section>

      {/* Embedded search (SSR'd listings) — sidebar docked beside the listings
          via sidebarSlot; the filter bar stays full-width. */}
      <SearchPageClient
        defaultIntent="rent"
        defaultType={entry.searchType}
        syncUrl={false}
        initialData={initialData}
        sidebarSlot={<PropertyTypeSidebar locale={locale} slug={entry.slug} />}
      />

      {/* FAQ + CTA — unique, indexable content below the listings */}
      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-10 sm:py-14 space-y-12 sm:space-y-16">
        <div>
          <div className="text-center mb-8">
            <p className="text-accent font-bold tracking-[0.35em] uppercase text-xs mb-3">FAQ</p>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">{fillRent(rc.faqHeading, typeLabel)}</h2>
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

        <section
          className="rounded-2xl sm:rounded-3xl p-6 sm:p-10 text-center text-white relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
        >
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)", backgroundSize: "32px 32px" }} />
          <div className="relative z-10">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">{fillRent(rc.ctaTitle, typeLabel)}</h2>
            <p className="text-primary-foreground/75 text-sm sm:text-base mb-7 max-w-lg mx-auto">{fillRent(rc.ctaDesc, typeLabel)}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href={`${lp}/contact`}
                className="font-bold px-6 py-3 sm:px-8 sm:py-4 rounded-xl text-sm sm:text-base hover:opacity-90 transition-all"
                style={{ background: "linear-gradient(135deg, #D4A847, #B8922F)", color: "#fff" }}
              >
                {rc.ctaBtn}
              </Link>
              <a
                href={waHref(WA_DEFAULT_MESSAGE, "/rent")}
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
