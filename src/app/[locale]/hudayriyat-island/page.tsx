/* eslint-disable i18next/no-literal-string -- multilingual SEO landing page */
/* eslint-disable @next/next/no-img-element -- verified real-estate CDN images */
import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { BreadcrumbJsonLd, FAQJsonLd } from "@/components/JsonLd";
import { canonical as makeCanonical, altLangs } from "@/lib/site";
import { getNonce } from "@/lib/nonce";
import { Waves, Bike, Trophy, Trees, Anchor, Building2, MapPin, TrendingUp, Shield, Star, ArrowRight, Phone, ChevronRight, CheckCircle } from "lucide-react";

export const revalidate = 86400;

type Locale = "en" | "ru" | "ar" | "zh" | "vi" | "he";

const HERO_IMG = "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/seo/hudayriyat-island-hero.jpg";
const AERIAL_IMG = "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/seo/hudayriyat-island-aerial.jpg";
const OG_IMG = HERO_IMG;

const KEYWORDS =
  "Hudayriyat Island property, buy property Hudayriyat Island, Hudayriyat Island Abu Dhabi, Modon Properties Hudayriyat, freehold Abu Dhabi, Al Naseem villas, Nawayef Hudayriyat, off-plan Abu Dhabi 2025, Hudayriyat Island apartments, Abu Dhabi waterfront property";

// ─────────────────────────────────────────────────────────────
// Locale labels
// ─────────────────────────────────────────────────────────────

const LABELS: Record<Locale, {
  metaTitle: string;
  metaDesc: string;
  heroEyebrow: string;
  heroH1Line1: string;
  heroH1Line2: string;
  heroSubtitle: string;
  trustSignals: string[];
  ctaPrimary: string;
  ctaSecondary: string;
  aboutEyebrow: string;
  aboutHeading: string;
  aboutPara1: string;
  aboutPara2: string;
  aboutMinistats: [string, string][];
  amenitiesEyebrow: string;
  amenitiesHeading: string;
  amenitiesSubheading: string;
  communitiesEyebrow: string;
  communitiesHeading: string;
  communitiesSubheading: string;
  communitiesCta: string;
  communitiesStartingFrom: string;
  communitiesHandover: string;
  whyInvestEyebrow: string;
  whyInvestHeading: string;
  whyInvestSubheading: string;
  tableHeaders: [string, string, string];
  whyInvestCards: [string, string][];
  stats: [string, string, string][];
  faqEyebrow: string;
  faqHeading: string;
  faqSubheading: string;
  faqs: { question: string; answer: string }[];
  ctaEyebrow: string;
  ctaHeading: string;
  ctaBody: string;
  ctaPrimaryBtn: string;
  trustFooter: string[];
  developerBadge: string;
  developerSub: string;
  freeholdBadge: string;
}> = {
  en: {
    metaTitle: "Hudayriyat Island Property for Sale | Abu Dhabi Freehold | Binayah",
    metaDesc:
      "Buy freehold property on Hudayriyat Island, Abu Dhabi, villas from AED 6M, apartments from AED 2M. Government-backed developer Modon. 2% transfer fee. 10 min from Abu Dhabi CBD. Expert guidance from Binayah Properties.",
    heroEyebrow: "Abu Dhabi · Freehold Island · By Modon Properties",
    heroH1Line1: "The Beverly Hills",
    heroH1Line2: "of Abu Dhabi",
    heroSubtitle:
      "Hudayriyat Island, 3,000+ hectares of master-planned coastal living, 10 minutes from Abu Dhabi CBD. Freehold for all nationalities, 2% transfer fee, government-backed developer.",
    trustSignals: ["Freehold · All nationalities", "2% transfer fee", "Golden Visa eligible", "Modon (ADQ-backed)"],
    ctaPrimary: "Free Investment Consultation",
    ctaSecondary: "View Communities",
    aboutEyebrow: "About the Island",
    aboutHeading: "Abu Dhabi's Most Ambitious Coastal Development",
    aboutPara1:
      "Al Hudayriyat Island spans over 3,000 hectares off Abu Dhabi's western coast. Connected to the mainland via Hudayriyat Bridge, it is just 10 minutes from the UAE capital's CBD, the closest freehold waterfront in Abu Dhabi. Developed by Modon Properties (84.5% government-owned via ADQ), the island is Abu Dhabi's flagship coastal city project.",
    aboutPara2:
      "With 16 km of natural beaches, 2.25 million sqm of park, Surf Abu Dhabi (the world's largest artificial wave pool), and 220 km of cycling infrastructure, Hudayriyat is the only address in the UAE that combines elite sport, coastal lifestyle, and freehold residential in one master-planned island.",
    aboutMinistats: [
      ["3,000+", "Hectares total area"],
      ["16 km", "Natural beaches"],
      ["10-20 min", "Drive to Abu Dhabi CBD"],
      ["99", "Nationalities investing"],
    ],
    amenitiesEyebrow: "World-Class Infrastructure",
    amenitiesHeading: "Built for an Active, Coastal Life",
    amenitiesSubheading:
      "The only UAE address where Surf, Velodrome, 220 km cycling, and beachfront living exist in one master plan.",
    communitiesEyebrow: "Residential Communities",
    communitiesHeading: "Find Your Community",
    communitiesSubheading:
      "Six freehold communities by Modon, apartments from AED 2M, ultra-luxury mansions to AED 80M+.",
    communitiesCta: "Get Availability & Pricing",
    communitiesStartingFrom: "Starting from",
    communitiesHandover: "Handover",
    whyInvestEyebrow: "Investment Case",
    whyInvestHeading: "Why Investors Choose Hudayriyat",
    whyInvestSubheading:
      "Abu Dhabi's #1 real estate market by transaction value in Q1 2026. Four structural advantages no other island offers.",
    tableHeaders: ["Metric", "Hudayriyat Island", "Dubai Average"],
    whyInvestCards: [
      ["Government-Backed Developer", "Modon Properties is 84.5% owned by ADQ, Abu Dhabi's sovereign investment arm. The strongest developer guarantee in the UAE."],
      ["2% Transfer Fee", "Half of Dubai's 4%. Lower transaction costs improve net ROI for investors and reduce friction at every resale."],
      ["Freehold, All Nationalities", "100% ownership rights, no restrictions. Properties above AED 2M automatically qualify you for UAE Golden Visa residency."],
      ["10 Minutes to City Centre", "Via Hudayriyat Bridge. 25 minutes to Abu Dhabi International Airport. The closest waterfront freehold to the UAE capital."],
    ],
    stats: [
      ["AED 11.97B", "Q1 2026 Transactions", "#1 in Abu Dhabi"],
      ["40-50%", "Capital Appreciation", "Recorded by early buyers"],
      ["7-9%", "Gross Rental Yield", "Coastal Abu Dhabi"],
      ["2%", "Transfer Fee", "Half of Dubai's rate"],
    ],
    faqEyebrow: "Common Questions",
    faqHeading: "Hudayriyat Island, Property FAQ",
    faqSubheading: "Everything buyers and investors ask before committing to Abu Dhabi's fastest-growing address.",
    faqs: [
      {
        question: "Can foreigners buy property on Hudayriyat Island?",
        answer:
          "Yes. Hudayriyat Island is a designated freehold zone open to all nationalities. You receive full ownership rights with a UAE title deed registered with Abu Dhabi's Department of Municipalities and Transport. Properties priced above AED 2 million qualify for the UAE Golden Visa (10-year renewable residency).",
      },
      {
        question: "What is the transfer fee on Hudayriyat Island?",
        answer:
          "Abu Dhabi's property transfer fee is 2% of the purchase price, exactly half of Dubai's 4%. This reduces your entry cost and improves net investment returns on any resale.",
      },
      {
        question: "What types of property are available?",
        answer:
          "Hudayriyat Island offers: apartments (1-4BR, from AED 2M); villas (3-8BR, from AED 6M); golf villas and townhouses (from AED 4.25M); luxury mansions (from AED 25M); ultra-luxury hilltop mansions (AED 41M+). All are developed by government-backed Modon Properties.",
      },
      {
        question: "What rental yields can I expect on Hudayriyat Island?",
        answer:
          "Coastal Abu Dhabi properties typically generate 7-9% gross rental yields. Early buyers on Hudayriyat Island have recorded 40-50% capital appreciation since the island's launch in 2020. Q1 2026 saw AED 11.97B in island transactions, the highest of any area in Abu Dhabi.",
      },
      {
        question: "How far is Hudayriyat Island from Abu Dhabi city centre?",
        answer:
          "10-20 minutes by car via Hudayriyat Bridge. The island sits on Abu Dhabi's western coast opposite Al Bateen. Abu Dhabi International Airport is approximately 25-30 minutes away. A dedicated Surf Abu Dhabi metro/bus link is planned as part of the Abu Dhabi Urban Mobility Master Plan.",
      },
      {
        question: "Is Hudayriyat Island a good investment vs Dubai?",
        answer:
          "Hudayriyat Island offers a lower entry cost to high-quality freehold than comparable Dubai waterfront communities, with a 2% transfer fee vs Dubai's 4%, higher gross yields (7-9% vs Dubai's 5.5-7%), and 40-50% documented capital appreciation for early buyers. The government-backed developer and sovereign-backed land title remove delivery risk entirely.",
      },
    ],
    ctaEyebrow: "Talk to a Specialist",
    ctaHeading: "Ready to Invest on Hudayriyat Island?",
    ctaBody:
      "Our Abu Dhabi team provides free, no-obligation advice on unit availability, payment plans, and expected ROI across all six Modon communities, including off-market options.",
    ctaPrimaryBtn: "Free Consultation",
    trustFooter: ["19+ Years in UAE Real Estate", "3,000+ Properties", "No Commission for Buyers", "Regulated by RERA"],
    developerBadge: "Modon Properties · Government-Backed",
    developerSub: "84.5% owned by ADQ, Abu Dhabi's sovereign investment arm",
    freeholdBadge: "Freehold · All Nationalities",
  },

  ru: {
    metaTitle: "Недвижимость на Hudayriyat Island | Фрихолд Абу-Даби | Binayah",
    metaDesc:
      "Купить фрихолд-недвижимость на Hudayriyat Island, Абу-Даби, виллы от AED 6 млн, апартаменты от AED 2 млн. Застройщик Modon с государственной поддержкой. Налог на передачу 2%. 10 мин от делового центра Абу-Даби.",
    heroEyebrow: "Абу-Даби · Фрихолд-остров · Застройщик Modon Properties",
    heroH1Line1: "Беверли-Хиллз",
    heroH1Line2: "Абу-Даби",
    heroSubtitle:
      "Hudayriyat Island, более 3 000 га планируемой прибрежной застройки в 10 минутах от делового центра Абу-Даби. Фрихолд для всех гражданств, 2% налог на передачу, застройщик под государственной гарантией.",
    trustSignals: ["Фрихолд · Все гражданства", "Налог на передачу 2%", "Право на Золотую визу", "Modon (под управлением ADQ)"],
    ctaPrimary: "Бесплатная инвестиционная консультация",
    ctaSecondary: "Просмотр сообществ",
    aboutEyebrow: "Об острове",
    aboutHeading: "Самый амбициозный прибрежный проект Абу-Даби",
    aboutPara1:
      "Остров Аль-Худайрият занимает более 3 000 га у западного побережья Абу-Даби. Связанный с материком мостом Худайрият, он расположен всего в 10 минутах от делового центра столицы ОАЭ, ближайшая фрихолд-набережная в Абу-Даби. Застройщик, Modon Properties (84,5% в государственной собственности через ADQ), флагманский прибрежный городской проект эмирата.",
    aboutPara2:
      "16 км природных пляжей, 2,25 млн кв. м парка, Surf Abu Dhabi (крупнейший в мире искусственный волновой бассейн) и 220 км велосипедной инфраструктуры делают Худайрият единственным адресом в ОАЭ, где сочетаются элитный спорт, прибрежный образ жизни и фрихолд-жильё.",
    aboutMinistats: [
      ["3 000+", "Гектаров общей площади"],
      ["16 км", "Природных пляжей"],
      ["10-20 мин", "Езды до делового центра Абу-Даби"],
      ["99", "Гражданств инвесторов"],
    ],
    amenitiesEyebrow: "Инфраструктура мирового класса",
    amenitiesHeading: "Создан для активной жизни у моря",
    amenitiesSubheading:
      "Единственный адрес в ОАЭ, где серфинг, велодром, 220 км велодорожек и жизнь на берегу объединены в одном мастер-плане.",
    communitiesEyebrow: "Жилые сообщества",
    communitiesHeading: "Найдите своё сообщество",
    communitiesSubheading:
      "Шесть фрихолд-сообществ от Modon, апартаменты от AED 2 млн, ультра-люксовые особняки до AED 80 млн+.",
    communitiesCta: "Узнать наличие и цены",
    communitiesStartingFrom: "Цена от",
    communitiesHandover: "Сдача",
    whyInvestEyebrow: "Инвестиционный кейс",
    whyInvestHeading: "Почему инвесторы выбирают Худайрият",
    whyInvestSubheading: "Рынок недвижимости №1 в Абу-Даби по объёму сделок в I кв. 2026 г.",
    tableHeaders: ["Показатель", "Hudayriyat Island", "Среднее по Дубаю"],
    whyInvestCards: [
      ["Застройщик с государственной поддержкой", "Modon Properties на 84,5% принадлежит ADQ, суверенному инвестиционному фонду Абу-Даби."],
      ["2% налог на передачу права", "Вдвое меньше дубайских 4%."],
      ["Фрихолд для всех гражданств", "100% право собственности. Объекты выше AED 2 млн дают право на Золотую визу."],
      ["10 минут до центра города", "Через мост Худайрият. 25 минут до аэропорта Абу-Даби."],
    ],
    stats: [
      ["AED 11,97 млрд", "Сделки за I кв. 2026 г.", "#1 в Абу-Даби"],
      ["40-50%", "Прирост капитала", "Зафиксировано ранними покупателями"],
      ["7-9%", "Валовая доходность аренды", "Прибрежный Абу-Даби"],
      ["2%", "Налог на передачу", "Вдвое меньше, чем в Дубае"],
    ],
    faqEyebrow: "Частые вопросы",
    faqHeading: "Hudayriyat Island, Вопросы о недвижимости",
    faqSubheading: "Ответы на вопросы покупателей и инвесторов.",
    faqs: [
      {
        question: "Могут ли иностранцы купить недвижимость на Hudayriyat Island?",
        answer:
          "Да. Hudayriyat Island является обозначенной фрихолд-зоной, открытой для всех гражданств. Вы получаете полные права собственности с титулом ОАЭ, зарегистрированным в Департаменте муниципалитетов и транспорта Абу-Даби. Объекты стоимостью свыше AED 2 млн дают право на Золотую визу ОАЭ (возобновляемый вид на жительство сроком 10 лет).",
      },
      {
        question: "Каков налог на передачу недвижимости на Hudayriyat Island?",
        answer:
          "Налог на передачу недвижимости в Абу-Даби составляет 2% от стоимости покупки, ровно вдвое меньше дубайских 4%. Это снижает порог входа и улучшает чистую доходность при любой перепродаже.",
      },
      {
        question: "Какие типы недвижимости доступны?",
        answer:
          "На Hudayriyat Island представлены: апартаменты (1-4 спальни, от AED 2 млн); виллы (3-8 спален, от AED 6 млн); гольф-виллы и таунхаусы (от AED 4,25 млн); люксовые особняки (от AED 25 млн); ультра-люксовые особняки на холме (от AED 41 млн+). Все объекты, от государственного застройщика Modon Properties.",
      },
      {
        question: "На какую арендную доходность можно рассчитывать?",
        answer:
          "Прибрежная недвижимость Абу-Даби, как правило, приносит 7-9% валовой арендной доходности. Ранние покупатели на Hudayriyat Island зафиксировали прирост капитала 40-50% с момента запуска острова в 2020 году. В I кв. 2026 г. объём сделок составил AED 11,97 млрд, рекорд для любого района Абу-Даби.",
      },
      {
        question: "Как далеко Hudayriyat Island от делового центра Абу-Даби?",
        answer:
          "10-20 минут на автомобиле по мосту Худайрият. Остров расположен у западного побережья Абу-Даби напротив Аль-Батин. До международного аэропорта Абу-Даби около 25-30 минут. В рамках Генерального плана городской мобильности Абу-Даби запланировано прямое метро/автобусное сообщение с Surf Abu Dhabi.",
      },
      {
        question: "Hudayriyat Island, хорошая инвестиция по сравнению с Дубаем?",
        answer:
          "Hudayriyat Island предлагает более низкий порог входа в качественный фрихолд, чем сопоставимые прибрежные районы Дубая: 2% налог на передачу против 4% в Дубае, более высокая валовая доходность (7-9% против 5,5-7%), а также задокументированный прирост капитала 40-50% для ранних покупателей. Государственный застройщик и суверенный земельный титул полностью исключают риск несдачи объекта.",
      },
    ],
    ctaEyebrow: "Свяжитесь со специалистом",
    ctaHeading: "Готовы инвестировать на Hudayriyat Island?",
    ctaBody:
      "Наша команда в Абу-Даби предоставляет бесплатные консультации по наличию объектов, планам оплаты и ожидаемой доходности во всех шести сообществах Modon, включая варианты вне рынка.",
    ctaPrimaryBtn: "Бесплатная консультация",
    trustFooter: ["19+ лет на рынке недвижимости ОАЭ", "3 000+ объектов", "Без комиссии для покупателей", "Лицензировано RERA"],
    developerBadge: "Modon Properties · Государственный застройщик",
    developerSub: "84,5% принадлежит ADQ, суверенному инвестиционному фонду Абу-Даби",
    freeholdBadge: "Фрихолд · Все гражданства",
  },

  ar: {
    metaTitle: "عقارات جزيرة الحديريات | تملك حر أبوظبي | بناية",
    metaDesc:
      "شراء عقارات بنظام التملك الحر في جزيرة الحديريات، أبوظبي, فلل من 6 ملايين درهم، شقق من 2 مليون درهم. مطوّر Modon مدعوم حكومياً. رسوم نقل 2%. 10 دقائق من مركز أعمال أبوظبي.",
    heroEyebrow: "أبوظبي · جزيرة تملك حر · من Modon Properties",
    heroH1Line1: "بيفرلي هيلز",
    heroH1Line2: "أبوظبي",
    heroSubtitle:
      "جزيرة الحديريات, أكثر من 3,000 هكتار من المجتمعات الساحلية المخططة، على بُعد 10 دقائق من مركز أعمال أبوظبي.",
    trustSignals: ["تملك حر · جميع الجنسيات", "رسوم نقل 2%", "مؤهل للتأشيرة الذهبية", "Modon (مدعومة من ADQ)"],
    ctaPrimary: "استشارة استثمارية مجانية",
    ctaSecondary: "استعراض المجتمعات",
    aboutEyebrow: "عن الجزيرة",
    aboutHeading: "أكثر مشاريع التطوير الساحلي طموحاً في أبوظبي",
    aboutPara1:
      "تمتد جزيرة الحديريات على أكثر من 3,000 هكتار قبالة الساحل الغربي لأبوظبي. وعبر جسر الحديريات، تبعد الجزيرة 10 دقائق فقط عن مركز أعمال عاصمة الإمارات, أقرب واجهة مائية بنظام التملك الحر في أبوظبي. تُطوّرها شركة Modon Properties (المملوكة بنسبة 84.5% للحكومة عبر ADQ).",
    aboutPara2:
      "بفضل 16 كيلومتراً من الشواطئ الطبيعية، و2.25 مليون متر مربع من الحدائق، وSurf Abu Dhabi (أكبر حوض أمواج اصطناعي في العالم)، تُعدّ الحديريات العنوان الوحيد في الإمارات الذي يجمع الرياضة النخبوية والحياة الساحلية والمساكن بنظام التملك الحر.",
    aboutMinistats: [
      ["+3,000", "هكتار من المساحة الإجمالية"],
      ["16 كم", "من الشواطئ الطبيعية"],
      ["10-20 دقيقة", "بالسيارة إلى مركز أعمال أبوظبي"],
      ["99", "جنسية من المستثمرين"],
    ],
    amenitiesEyebrow: "بنية تحتية عالمية المستوى",
    amenitiesHeading: "مُصمَّم لحياة ساحلية نشطة",
    amenitiesSubheading:
      "العنوان الوحيد في الإمارات الذي يجمع التزلج على الأمواج والفيلودروم و220 كم من مسارات الدراجات والمعيشة الشاطئية في مخطط رئيسي واحد.",
    communitiesEyebrow: "المجتمعات السكنية",
    communitiesHeading: "اعثر على مجتمعك",
    communitiesSubheading:
      "ستة مجتمعات بنظام التملك الحر من Modon, شقق تبدأ من 2 مليون درهم، وقصور فاخرة حتى 80 مليون درهم وأكثر.",
    communitiesCta: "الاطلاع على التوفر والأسعار",
    communitiesStartingFrom: "يبدأ من",
    communitiesHandover: "التسليم",
    whyInvestEyebrow: "حجة الاستثمار",
    whyInvestHeading: "لماذا يختار المستثمرون الحديريات",
    whyInvestSubheading:
      "السوق العقاري الأول في أبوظبي من حيث قيمة المعاملات في الربع الأول من عام 2026.",
    tableHeaders: ["المؤشر", "جزيرة الحديريات", "متوسط دبي"],
    whyInvestCards: [
      ["مطوّر مدعوم حكومياً", "Modon Properties مملوكة بنسبة 84.5% لـ ADQ, الذراع الاستثماري السيادي لأبوظبي."],
      ["رسوم نقل 2%", "نصف رسوم دبي البالغة 4%. تكاليف معاملات أقل تحسّن صافي العائد على الاستثمار."],
      ["تملك حر لجميع الجنسيات", "حقوق ملكية 100% بلا قيود. العقارات التي تتجاوز 2 مليون درهم تمنحك التأشيرة الذهبية الإماراتية."],
      ["10 دقائق إلى وسط المدينة", "عبر جسر الحديريات. 25 دقيقة إلى مطار أبوظبي الدولي."],
    ],
    stats: [
      ["11.97 مليار درهم", "معاملات الربع الأول 2026", "الأول في أبوظبي"],
      ["40-50%", "ارتفاع رأس المال", "سجّله المشترون الأوائل"],
      ["7-9%", "عائد إيجاري إجمالي", "الساحل أبوظبي"],
      ["2%", "رسوم النقل", "نصف معدل دبي"],
    ],
    faqEyebrow: "الأسئلة الشائعة",
    faqHeading: "جزيرة الحديريات, أسئلة العقارات",
    faqSubheading: "إجابات على أسئلة المشترين والمستثمرين.",
    faqs: [
      {
        question: "هل يمكن للأجانب شراء عقارات في جزيرة الحديريات؟",
        answer:
          "نعم. جزيرة الحديريات منطقة تملك حر مخصصة ومفتوحة لجميع الجنسيات. ستحصل على حقوق ملكية كاملة بصك ملكية إماراتي مسجل لدى دائرة البلديات والنقل في أبوظبي. العقارات التي تزيد قيمتها عن 2 مليون درهم تمنح حق الحصول على التأشيرة الذهبية الإماراتية (إقامة متجددة لمدة 10 سنوات).",
      },
      {
        question: "ما هي رسوم نقل الملكية في جزيرة الحديريات؟",
        answer:
          "رسوم نقل الملكية في أبوظبي 2% من سعر الشراء, أي نصف رسوم دبي البالغة 4% بالضبط. مما يقلل تكاليف الدخول ويحسّن صافي عائد الاستثمار عند أي إعادة بيع.",
      },
      {
        question: "ما أنواع العقارات المتاحة؟",
        answer:
          "تتوفر في جزيرة الحديريات: شقق (1-4 غرف نوم، من 2 مليون درهم)؛ فلل (3-8 غرف نوم، من 6 ملايين درهم)؛ فلل جولف وتاون هاوس (من 4.25 مليون درهم)؛ قصور فاخرة (من 25 مليون درهم)؛ قصور فاخرة على التلال (41 مليون درهم وأكثر). جميعها من تطوير Modon Properties المدعومة حكومياً.",
      },
      {
        question: "ما العائد الإيجاري المتوقع في جزيرة الحديريات؟",
        answer:
          "تحقق العقارات الساحلية في أبوظبي عادةً عائداً إيجارياً إجمالياً يتراوح بين 7-9%. وسجّل المشترون الأوائل في جزيرة الحديريات ارتفاعاً في رأس المال بنسبة 40-50% منذ إطلاق الجزيرة عام 2020. وبلغت قيمة المعاملات في الربع الأول من 2026 نحو 11.97 مليار درهم، وهو الأعلى بين جميع مناطق أبوظبي.",
      },
      {
        question: "كم تبعد جزيرة الحديريات عن وسط مدينة أبوظبي؟",
        answer:
          "10-20 دقيقة بالسيارة عبر جسر الحديريات. تقع الجزيرة على الساحل الغربي لأبوظبي في مواجهة البطين. مطار أبوظبي الدولي على بُعد 25-30 دقيقة تقريباً. ورابط مترو/حافلة مخصص لـ Surf Abu Dhabi مخطط ضمن الخطة الرئيسية لتنقل أبوظبي الحضري.",
      },
      {
        question: "هل تُعدّ جزيرة الحديريات استثماراً جيداً مقارنةً بدبي؟",
        answer:
          "تُتيح جزيرة الحديريات دخولاً بتكلفة أقل إلى تملك حر عالي الجودة مقارنةً بمجتمعات دبي الساحلية المماثلة، بفارق رسوم نقل (2% مقابل 4% في دبي)، وعوائد أعلى (7-9% مقابل 5.5-7%)، وارتفاع موثّق في رأس المال بنسبة 40-50% للمشترين الأوائل. فضلاً عن أن المطوّر المدعوم حكومياً وصك الأرض السيادي يزيلان مخاطر التسليم كلياً.",
      },
    ],
    ctaEyebrow: "تحدّث إلى متخصص",
    ctaHeading: "هل أنت مستعد للاستثمار في جزيرة الحديريات؟",
    ctaBody:
      "يقدّم فريقنا في أبوظبي استشارات مجانية وغير مُلزِمة حول توفر الوحدات وخطط السداد والعائد على الاستثمار في جميع مجتمعات Modon الستة.",
    ctaPrimaryBtn: "استشارة مجانية",
    trustFooter: ["أكثر من 17 عاماً في سوق العقارات الإماراتي", "3,000+ عقار", "بدون عمولة للمشترين", "مرخّص من RERA"],
    developerBadge: "Modon Properties · مدعومة حكومياً",
    developerSub: "مملوكة بنسبة 84.5% لـ ADQ, الذراع الاستثماري السيادي لأبوظبي",
    freeholdBadge: "تملك حر · جميع الجنسيات",
  },

  zh: {
    metaTitle: "Hudayriyat Island房产出售 | 阿布扎比永久产权 | Binayah",
    metaDesc:
      "在Hudayriyat Island购买永久产权房产, , 别墅起价600万迪拉姆，公寓起价200万迪拉姆。政府背书开发商Modon，2%过户费，距阿布扎比中央商务区仅10分钟。",
    heroEyebrow: "阿布扎比 · 自由持有产权岛 · 开发商 Modon Properties",
    heroH1Line1: "阿布扎比的",
    heroH1Line2: "比弗利山庄",
    heroSubtitle:
      "Hudayriyat Island, 逾3,000公顷综合规划滨海社区，距阿布扎比中央商务区仅10分钟车程。面向所有国籍的永久产权，2%过户费，政府背书开发商。",
    trustSignals: ["永久产权 · 所有国籍", "2% 过户费", "符合黄金签证资格", "Modon（ADQ支持）"],
    ctaPrimary: "免费投资咨询",
    ctaSecondary: "查看社区",
    aboutEyebrow: "关于岛屿",
    aboutHeading: "阿布扎比最具雄心的滨海开发项目",
    aboutPara1:
      "Al Hudayriyat Island位于阿布扎比西海岸，占地逾3,000公顷。通过Hudayriyat大桥与大陆相连，距阿联酋首都中央商务区仅10分钟车程, , 是阿布扎比最近的永久产权滨水区域。由Modon Properties开发（84.5%由ADQ国家控股），是阿布扎比旗舰滨海城市项目。",
    aboutPara2:
      "拥有16公里天然海滩、225万平方米公园、Surf Abu Dhabi（全球最大人工冲浪池）及220公里骑行基础设施，Hudayriyat是阿联酋唯一将精英运动、滨海生活与永久产权住宅融为一体的综合规划岛屿。",
    aboutMinistats: [
      ["3,000+", "公顷总面积"],
      ["16 公里", "天然海滩"],
      ["10-20 分钟", "驾车至阿布扎比中央商务区"],
      ["99", "投资者国籍"],
    ],
    amenitiesEyebrow: "世界级基础设施",
    amenitiesHeading: "专为活力滨海生活而设计",
    amenitiesSubheading:
      "阿联酋唯一将冲浪、自行车场馆、220公里骑行道与海滨生活融于同一总体规划的地址。",
    communitiesEyebrow: "住宅社区",
    communitiesHeading: "寻找您的社区",
    communitiesSubheading:
      "Modon旗下六个永久产权社区, , 公寓起价200万迪拉姆，超豪华庄园最高8,000万迪拉姆以上。",
    communitiesCta: "获取房源及价格",
    communitiesStartingFrom: "起价",
    communitiesHandover: "交付时间",
    whyInvestEyebrow: "投资理由",
    whyInvestHeading: "为何投资者选择Hudayriyat",
    whyInvestSubheading: "2026年第一季度阿布扎比交易额排名第一的房地产市场。",
    tableHeaders: ["指标", "Hudayriyat Island", "迪拜平均"],
    whyInvestCards: [
      ["政府背书开发商", "Modon Properties由ADQ持股84.5%, , 阿布扎比主权投资机构，是阿联酋最强开发商保障。"],
      ["2%过户费", "仅为迪拜4%的一半，更低交易成本提升净投资回报率。"],
      ["永久产权·所有国籍", "100%所有权，无限制。200万迪拉姆以上房产自动符合阿联酋黄金签证居留资格。"],
      ["10分钟至市中心", "经Hudayriyat大桥。距阿布扎比国际机场25分钟。阿联酋首都最近的滨水永久产权区域。"],
    ],
    stats: [
      ["AED 119.7亿", "2026年第一季度交易额", "阿布扎比第一"],
      ["40-50%", "资本增值", "早期买家已录得"],
      ["7-9%", "毛租金回报率", "阿布扎比沿海"],
      ["2%", "过户费", "迪拜的一半"],
    ],
    faqEyebrow: "常见问题",
    faqHeading: "Hudayriyat Island, 房产常见问题",
    faqSubheading: "买家和投资者的常见疑问解答。",
    faqs: [
      {
        question: "外国人可以在Hudayriyat Island购买房产吗？",
        answer:
          "可以。Hudayriyat Island是向所有国籍开放的指定永久产权区域。您将获得完整所有权，并持有在阿布扎比市政和交通部登记的阿联酋产权证书。价格超过200万迪拉姆的房产可申请阿联酋黄金签证（10年可续期居留权）。",
      },
      {
        question: "Hudayriyat Island的过户费是多少？",
        answer:
          "阿布扎比房产过户费为购买价格的2%, , 恰好是迪拜4%的一半。这降低了您的入市成本，并在每次转售时提高净投资回报。",
      },
      {
        question: "有哪些类型的房产可供选择？",
        answer:
          "Hudayriyat Island提供：公寓（1-4卧室，起价200万迪拉姆）；别墅（3-8卧室，起价600万迪拉姆）；高尔夫别墅和联排别墅（起价425万迪拉姆）；豪华庄园（起价2,500万迪拉姆）；超豪华山顶庄园（4,100万迪拉姆以上）。所有房产均由政府背书的Modon Properties开发。",
      },
      {
        question: "在Hudayriyat Island可以期待什么样的租金回报？",
        answer:
          "阿布扎比沿海房产通常产生7-9%的毛租金回报率。自2020年岛屿推出以来，早期买家已录得40-50%的资本增值。2026年第一季度岛内交易额达119.7亿迪拉姆, , 为阿布扎比所有地区中最高。",
      },
      {
        question: "Hudayriyat Island距阿布扎比市中心有多远？",
        answer:
          "经Hudayriyat大桥驾车10-20分钟。该岛位于阿布扎比西海岸，与Al Bateen相对。距阿布扎比国际机场约25-30分钟。作为阿布扎比城市交通总体规划的一部分，专用的Surf Abu Dhabi地铁/公交线路已在规划之中。",
      },
      {
        question: "与迪拜相比，Hudayriyat Island是否是一项好投资？",
        answer:
          "与迪拜可比滨水社区相比，Hudayriyat Island提供更低的永久产权优质入市门槛：2%过户费对比迪拜4%，更高毛回报率（7-9%对比迪拜5.5-7%），以及早期买家已记录的40-50%资本增值。政府背书开发商和主权土地产权完全消除了交付风险。",
      },
    ],
    ctaEyebrow: "联系专家",
    ctaHeading: "准备好在Hudayriyat Island投资了吗？",
    ctaBody:
      "我们的阿布扎比团队为您提供免费、无义务的咨询，涵盖所有六个Modon社区的单位供应、付款计划及预期投资回报, , 包括非公开市场房源。",
    ctaPrimaryBtn: "免费咨询",
    trustFooter: ["深耕阿联酋房地产17年以上", "3,000+套房产", "买家零佣金", "持RERA监管牌照"],
    developerBadge: "Modon Properties · 政府背书开发商",
    developerSub: "84.5%由ADQ持股, , 阿布扎比主权投资机构",
    freeholdBadge: "永久产权 · 所有国籍",
  },

  vi: {
    metaTitle: "Bất động sản Hudayriyat Island | Sở hữu vĩnh viễn Abu Dhabi | Binayah",
    metaDesc:
      "Mua bất động sản sở hữu vĩnh viễn trên Hudayriyat Island, Abu Dhabi, biệt thự từ 6 triệu AED, căn hộ từ 2 triệu AED. Chủ đầu tư được chính phủ hậu thuẫn Modon. Phí chuyển nhượng 2%. 10 phút từ CBD Abu Dhabi. Hướng dẫn chuyên gia từ Binayah Properties.",
    heroEyebrow: "Abu Dhabi · Đảo sở hữu vĩnh viễn · Bởi Modon Properties",
    heroH1Line1: "Beverly Hills",
    heroH1Line2: "của Abu Dhabi",
    heroSubtitle:
      "Hudayriyat Island, hơn 3.000 hecta sống ven biển quy hoạch tổng thể, 10 phút từ CBD Abu Dhabi. Sở hữu vĩnh viễn cho mọi quốc tịch, phí chuyển nhượng 2%, chủ đầu tư được chính phủ hậu thuẫn.",
    trustSignals: ["Sở hữu vĩnh viễn · Mọi quốc tịch", "Phí chuyển nhượng 2%", "Đủ điều kiện Golden Visa", "Modon (ADQ hậu thuẫn)"],
    ctaPrimary: "Tư vấn đầu tư miễn phí",
    ctaSecondary: "Xem các khu dân cư",
    aboutEyebrow: "Về hòn đảo",
    aboutHeading: "Dự án ven biển tham vọng nhất Abu Dhabi",
    aboutPara1:
      "Al Hudayriyat Island trải dài hơn 3.000 hecta ngoài khơi bờ biển phía tây Abu Dhabi. Kết nối với đất liền qua Cầu Hudayriyat, chỉ cách CBD của thủ đô UAE 10 phút, khu ven biển sở hữu vĩnh viễn gần nhất tại Abu Dhabi. Được phát triển bởi Modon Properties (84,5% thuộc sở hữu nhà nước qua ADQ), hòn đảo là dự án thành phố ven biển hàng đầu của Abu Dhabi.",
    aboutPara2:
      "Với 16 km bãi biển tự nhiên, 2,25 triệu m² công viên, Surf Abu Dhabi (hồ tạo sóng nhân tạo lớn nhất thế giới) và 220 km hạ tầng đạp xe, Hudayriyat là địa chỉ duy nhất tại UAE kết hợp thể thao đỉnh cao, lối sống ven biển và nhà ở sở hữu vĩnh viễn trong một hòn đảo quy hoạch tổng thể.",
    aboutMinistats: [
      ["3.000+", "Hecta tổng diện tích"],
      ["16 km", "Bãi biển tự nhiên"],
      ["10-20 phút", "Lái xe đến CBD Abu Dhabi"],
      ["99", "Quốc tịch đang đầu tư"],
    ],
    amenitiesEyebrow: "Hạ tầng đẳng cấp thế giới",
    amenitiesHeading: "Được xây dựng cho cuộc sống ven biển năng động",
    amenitiesSubheading:
      "Địa chỉ UAE duy nhất nơi lướt sóng, velodrome, 220 km đạp xe và sống ven biển tồn tại trong một quy hoạch tổng thể.",
    communitiesEyebrow: "Khu dân cư",
    communitiesHeading: "Tìm khu của bạn",
    communitiesSubheading:
      "Sáu khu sở hữu vĩnh viễn bởi Modon, căn hộ từ 2 triệu AED, dinh thự siêu sang đến 80 triệu AED+.",
    communitiesCta: "Nhận thông tin sẵn có & Giá",
    communitiesStartingFrom: "Khởi điểm từ",
    communitiesHandover: "Bàn giao",
    whyInvestEyebrow: "Luận điểm đầu tư",
    whyInvestHeading: "Vì sao nhà đầu tư chọn Hudayriyat",
    whyInvestSubheading:
      "Thị trường bất động sản số 1 Abu Dhabi theo giá trị giao dịch trong Q1 2026. Bốn lợi thế cấu trúc không hòn đảo nào khác có.",
    tableHeaders: ["Chỉ số", "Hudayriyat Island", "TB Dubai"],
    whyInvestCards: [
      ["Chủ đầu tư được chính phủ hậu thuẫn", "Modon Properties thuộc sở hữu 84,5% của ADQ, cánh tay đầu tư chủ quyền của Abu Dhabi. Bảo lãnh chủ đầu tư mạnh nhất UAE."],
      ["Phí chuyển nhượng 2%", "Bằng một nửa mức 4% của Dubai. Chi phí giao dịch thấp hơn cải thiện ROI ròng cho nhà đầu tư và giảm ma sát ở mỗi lần bán lại."],
      ["Sở hữu vĩnh viễn, mọi quốc tịch", "Quyền sở hữu 100%, không hạn chế. Bất động sản trên 2 triệu AED tự động giúp bạn đủ điều kiện cư trú Golden Visa UAE."],
      ["10 phút đến trung tâm thành phố", "Qua Cầu Hudayriyat. 25 phút đến Sân bay Quốc tế Abu Dhabi. Khu ven biển sở hữu vĩnh viễn gần thủ đô UAE nhất."],
    ],
    stats: [
      ["11,97 tỷ AED", "Giao dịch Q1 2026", "#1 tại Abu Dhabi"],
      ["40-50%", "Tăng giá vốn", "Ghi nhận bởi người mua sớm"],
      ["7-9%", "Lợi suất cho thuê gộp", "Abu Dhabi ven biển"],
      ["2%", "Phí chuyển nhượng", "Bằng một nửa mức của Dubai"],
    ],
    faqEyebrow: "Câu hỏi thường gặp",
    faqHeading: "Hudayriyat Island, Câu hỏi về bất động sản",
    faqSubheading: "Mọi điều người mua và nhà đầu tư hỏi trước khi cam kết với địa chỉ phát triển nhanh nhất Abu Dhabi.",
    faqs: [
      {
        question: "Người nước ngoài có thể mua bất động sản trên Hudayriyat Island không?",
        answer:
          "Có. Hudayriyat Island là khu sở hữu vĩnh viễn được chỉ định mở cho mọi quốc tịch. Bạn nhận quyền sở hữu đầy đủ với sổ đỏ UAE được đăng ký với Sở Đô thị và Giao thông Abu Dhabi. Bất động sản có giá trên 2 triệu AED đủ điều kiện nhận Golden Visa UAE (cư trú 10 năm có thể gia hạn).",
      },
      {
        question: "Phí chuyển nhượng trên Hudayriyat Island là bao nhiêu?",
        answer:
          "Phí chuyển nhượng bất động sản Abu Dhabi là 2% giá mua, đúng bằng một nửa mức 4% của Dubai. Điều này giảm chi phí vào của bạn và cải thiện lợi nhuận đầu tư ròng ở mọi lần bán lại.",
      },
      {
        question: "Những loại bất động sản nào có sẵn?",
        answer:
          "Hudayriyat Island cung cấp: căn hộ (1-4PN, từ 2 triệu AED); biệt thự (3-8PN, từ 6 triệu AED); biệt thự golf và nhà phố (từ 4,25 triệu AED); dinh thự sang trọng (từ 25 triệu AED); dinh thự siêu sang trên đồi (41 triệu AED+). Tất cả đều được phát triển bởi Modon Properties được chính phủ hậu thuẫn.",
      },
      {
        question: "Tôi có thể kỳ vọng lợi suất cho thuê nào trên Hudayriyat Island?",
        answer:
          "Bất động sản ven biển Abu Dhabi thường tạo ra lợi suất cho thuê gộp 7-9%. Người mua sớm trên Hudayriyat Island đã ghi nhận tăng giá vốn 40-50% kể từ khi hòn đảo ra mắt năm 2020. Q1 2026 chứng kiến 11,97 tỷ AED giao dịch trên đảo, cao nhất trong số bất kỳ khu vực nào ở Abu Dhabi.",
      },
      {
        question: "Hudayriyat Island cách trung tâm thành phố Abu Dhabi bao xa?",
        answer:
          "10-20 phút bằng ô tô qua Cầu Hudayriyat. Hòn đảo nằm trên bờ biển phía tây Abu Dhabi đối diện Al Bateen. Sân bay Quốc tế Abu Dhabi cách khoảng 25-30 phút. Một tuyến metro/xe buýt Surf Abu Dhabi chuyên dụng được lên kế hoạch như một phần của Kế hoạch Tổng thể Giao thông Đô thị Abu Dhabi.",
      },
      {
        question: "Hudayriyat Island có phải khoản đầu tư tốt so với Dubai không?",
        answer:
          "Hudayriyat Island cung cấp chi phí vào thấp hơn cho bất động sản sở hữu vĩnh viễn chất lượng cao so với các khu ven biển Dubai tương đương, với phí chuyển nhượng 2% so với 4% của Dubai, lợi suất gộp cao hơn (7-9% so với 5,5-7% của Dubai) và tăng giá vốn 40-50% được ghi nhận cho người mua sớm. Chủ đầu tư được chính phủ hậu thuẫn và sổ đỏ đất được chủ quyền bảo đảm loại bỏ hoàn toàn rủi ro bàn giao.",
      },
    ],
    ctaEyebrow: "Trao đổi với chuyên gia",
    ctaHeading: "Sẵn sàng đầu tư trên Hudayriyat Island?",
    ctaBody:
      "Đội ngũ Abu Dhabi của chúng tôi cung cấp tư vấn miễn phí, không ràng buộc về tình trạng căn sẵn có, kế hoạch thanh toán và ROI dự kiến trên cả sáu khu Modon, bao gồm các lựa chọn ngoài thị trường.",
    ctaPrimaryBtn: "Tư vấn miễn phí",
    trustFooter: ["19+ năm trong bất động sản UAE", "3.000+ bất động sản", "Không hoa hồng cho người mua", "Được RERA quản lý"],
    developerBadge: "Modon Properties · Được chính phủ hậu thuẫn",
    developerSub: "84,5% thuộc sở hữu ADQ, cánh tay đầu tư chủ quyền của Abu Dhabi",
    freeholdBadge: "Sở hữu vĩnh viễn · Mọi quốc tịch",
  },
he: {
    metaTitle: "Hudayriyat Island נכסים למכירה | בעלות מלאה (Freehold) אבו דאבי | Binayah",
    metaDesc:
      "קנו נכסים בבעלות מלאה ב-Hudayriyat Island, אבו דאבי, וילות החל מ-AED 6M, דירות החל מ-AED 2M. מפתח מגובה ממשלתית Modon. דמי העברה 2%. 10 דקות ממרכז העסקים של אבו דאבי. ייעוץ מומחים מ-Binayah Properties.",
    heroEyebrow: "אבו דאבי · אי בעלות מלאה · על ידי Modon Properties",
    heroH1Line1: "הבוורלי הילס",
    heroH1Line2: "של אבו דאבי",
    heroSubtitle:
      "Hudayriyat Island, מעל 3,000 דונם של מגורים חופיים מתוכננים, 10 דקות ממרכז העסקים של אבו דאבי. בעלות מלאה לכל הלאומים, דמי העברה 2%, מפתח מגובה ממשלתית.",
    trustSignals: ["בעלות מלאה · כל הלאומים", "דמי העברה 2%", "זכאות לויזת זהב", "Modon (מגובה על ידי ADQ)"],
    ctaPrimary: "ייעוץ השקעה חינם",
    ctaSecondary: "צפו בקהילות",
    aboutEyebrow: "על האי",
    aboutHeading: "הפיתוח החופי השאפתני ביותר של אבו דאבי",
    aboutPara1:
      "אי אל-חודייריאת משתרע על פני יותר מ-3,000 דונם מול חוף המערבי של אבו דאבי. מחובר ליבשה דרך גשר חודייריאת, הוא נמצא רק 10 דקות ממרכז העסקים של בירת האמירויות, החוף הקרוב ביותר בבעלות מלאה באבו דאבי. פותח על ידי Modon Properties (84.5% בבעלות ממשלתית דרך ADQ), האי הוא פרויקט הדגל החופי של אבו דאבי.",
    aboutPara2:
      "עם 16 ק\"מ של חופים טבעיים, 2.25 מיליון מ\"ר של פארק, Surf Abu Dhabi (בריכת הגלים המלאכותית הגדולה בעולם), ו-220 ק\"מ של תשתית רכיבה על אופניים, חודייריאת הוא הכתובת היחידה באמירויות שמשלבת ספורט עילית, אורח חיים חופי, ומגורים בבעלות מלאה באי מתוכנן אחד.",
    aboutMinistats: [
      ["3,000+", "דונם שטח כולל"],
      ["16 ק\"מ", "חופים טבעיים"],
      ["10-20 דקות", "נסיעה למרכז העסקים של אבו דאבי"],
      ["99", "לאומים משקיעים"],
    ],
    amenitiesEyebrow: "תשתית ברמה עולמית",
    amenitiesHeading: "נבנה לחיים פעילים וחופיים",
    amenitiesSubheading:
      "הכתובת היחידה באמירויות שבה Surf, Velodrome, 220 ק\"מ רכיבה על אופניים, ומגורים על חוף הים קיימים בתוכנית אב אחת.",
    communitiesEyebrow: "קהילות מגורים",
    communitiesHeading: "מצאו את הקהילה שלכם",
    communitiesSubheading:
      "שש קהילות בעלות מלאה על ידי Modon, דירות החל מ-AED 2M, אחוזות אולטרה-יוקרתיות עד AED 80M+.",
    communitiesCta: "קבלו זמינות ומחירים",
    communitiesStartingFrom: "החל מ",
    communitiesHandover: "מסירה",
    whyInvestEyebrow: "מקרה השקעה",
    whyInvestHeading: "למה משקיעים בוחרים בחודייריאת",
    whyInvestSubheading:
      "שוק הנדל\"ן מספר 1 של אבו דאבי לפי ערך עסקאות ברבעון הראשון של 2026. ארבעה יתרונות מבניים שאין לאי אחר.",
    tableHeaders: ["מדד", "Hudayriyat Island", "ממוצע דובאי"],
    whyInvestCards: [
      ["מפתח מגובה ממשלתית", "Modon Properties הוא בבעלות 84.5% על ידי ADQ, זרוע ההשקעות הריבונית של אבו דאבי. ההבטחה החזקה ביותר של מפתח באמירויות."],
      ["דמי העברה 2%", "חצי מה-4% של דובאי. עלויות עסקה נמוכות יותר משפרות את התשואה נטו על ההשקעה ומפחיתות חיכוך בכל מכירה חוזרת."],
      ["בעלות מלאה, כל הלאומים", "זכויות בעלות 100%, ללא הגבלות. נכסים מעל AED 2M מזכים אוטומטית לויזת זהב של האמירויות."],
      ["10 דקות למרכז העיר", "דרך גשר חודייריאת. 25 דקות לנמל התעופה הבינלאומי של אבו דאבי. החוף הקרוב ביותר בבעלות מלאה לבירת האמירויות."],
    ],
    stats: [
      ["AED 11.97B", "עסקאות ברבעון הראשון של 2026", "#1 באבו דאבי"],
      ["40-50%", "הערכת ערך הון", "נרשם על ידי קונים מוקדמים"],
      ["7-9%", "תשואת שכירות ברוטו", "חוף אבו דאבי"],
      ["2%", "דמי העברה", "חצי מהשיעור של דובאי"],
    ],
    faqEyebrow: "שאלות נפוצות",
    faqHeading: "Hudayriyat Island, שאלות נפוצות על נכסים",
    faqSubheading: "כל מה שקונים ומשקיעים שואלים לפני שמתחייבים לכתובת הצומחת ביותר של אבו דאבי.",
    faqs: [
      {
        question: "האם זרים יכולים לקנות נכסים ב-Hudayriyat Island?",
        answer:
          "כן. Hudayriyat Island הוא אזור בעלות מלאה המיועד לכל הלאומים. אתם מקבלים זכויות בעלות מלאות עם שטר בעלות של האמירויות הרשום במחלקת העיריות והתחבורה של אבו דאבי. נכסים במחיר מעל 2 מיליון AED מזכים לויזת זהב של האמירויות (תושבות מתחדשת ל-10 שנים).",
      },
      {
        question: "מהו דמי ההעברה ב-Hudayriyat Island?",
        answer:
          "דמי ההעברה של נכסים באבו דאבי הם 2% ממחיר הרכישה, בדיוק חצי מה-4% של דובאי. זה מפחית את עלות הכניסה ומשפר את התשואה נטו על ההשקעה בכל מכירה חוזרת.",
      },
      {
        question: "אילו סוגי נכסים זמינים?",
        answer:
          "Hudayriyat Island מציע: דירות (1-4 חדרי שינה, החל מ-AED 2M); וילות (3-8 חדרי שינה, החל מ-AED 6M); וילות גולף ובתים טוריים (החל מ-AED 4.25M); אחוזות יוקרה (החל מ-AED 25M); אחוזות אולטרה-יוקרתיות על גבעה (AED 41M+). כל אלו מפותחים על ידי Modon Properties המגובה ממשלתית.",
      },
      {
        question: "אילו תשואות שכירות אני יכול לצפות ב-Hudayriyat Island?",
        answer:
          "נכסים בחוף אבו דאבי בדרך כלל מניבים תשואות שכירות ברוטו של 7-9%. קונים מוקדמים ב-Hudayriyat Island רשמו הערכת ערך הון של 40-50% מאז השקת האי ב-2020. ברבעון הראשון של 2026 נרשמו עסקאות באי בסך AED 11.97B, הגבוה ביותר בכל אזור באבו דאבי.",
      },
      {
        question: "כמה רחוק Hudayriyat Island ממרכז העיר אבו דאבי?",
        answer:
          "10-20 דקות ברכב דרך גשר חודייריאת. האי ממוקם על החוף המערבי של אבו דאבי מול אל-בטין. נמל התעופה הבינלאומי של אבו דאבי נמצא כ-25-30 דקות משם. מתוכנן קישור מטרו/אוטובוס ייעודי ל-Surf Abu Dhabi כחלק מתוכנית האב לניידות עירונית של אבו דאבי.",
      },
      {
        question: "האם Hudayriyat Island היא השקעה טובה לעומת דובאי?",
        answer:
          "Hudayriyat Island מציע עלות כניסה נמוכה יותר לנכסים בבעלות מלאה באיכות גבוהה מאשר קהילות חוף דובאי דומות, עם דמי העברה של 2% לעומת 4% של דובאי, תשואות ברוטו גבוהות יותר (7-9% לעומת 5.5-7% של דובאי), והערכת ערך הון של 40-50% שתועדה עבור קונים מוקדמים. המפתח המגובה ממשלתית ושטר הבעלות המגובה ריבונית מסירים את הסיכון למסירה לחלוטין.",
      },
    ],
    ctaEyebrow: "דברו עם מומחה",
    ctaHeading: "מוכנים להשקיע ב-Hudayriyat Island?",
    ctaBody:
      "הצוות שלנו באבו דאבי מספק ייעוץ חינם וללא התחייבות על זמינות יחידות, תוכניות תשלום, ותשואה צפויה על ההשקעה בכל שש הקהילות של Modon, כולל אפשרויות מחוץ לשוק.",
    ctaPrimaryBtn: "ייעוץ חינם",
    trustFooter: ["19+ שנים בנדל\"ן באמירויות", "3,000+ נכסים", "ללא עמלה לקונים", "מוסדר על ידי RERA"],
    developerBadge: "Modon Properties · מגובה ממשלתית",
    developerSub: "בבעלות 84.5% על ידי ADQ, זרוע ההשקעות הריבונית של אבו דאבי",
    freeholdBadge: "בעלות מלאה · כל הלאומים",
},
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const L = LABELS[locale as Locale] ?? LABELS.en;
  return {
    title: L.metaTitle,
    description: L.metaDesc,
    keywords: KEYWORDS,
    alternates: {
      canonical: makeCanonical(locale, "/hudayriyat-island"),
      languages: altLangs("/hudayriyat-island"),
    },
    openGraph: {
      title: L.metaTitle,
      description: L.metaDesc,
      type: "website",
      url: makeCanonical(locale, "/hudayriyat-island"),
      siteName: "Binayah Properties",
      locale: locale === "ar" ? "ar_AE" : locale === "zh" ? "zh_CN" : locale === "ru" ? "ru_RU" : locale === "vi" ? "vi_VN" : locale === "he" ? "he_IL" : "en_AE",
      images: [
        {
          url: OG_IMG,
          width: 1200,
          height: 800,
          alt: "Hudayriyat Island Abu Dhabi, Mediterranean villas with Abu Dhabi skyline",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: L.metaTitle,
      description: L.metaDesc,
      images: [OG_IMG],
    },
    robots: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  };
}

// ─────────────────────────────────────────────────────────────
// Structured data
// ─────────────────────────────────────────────────────────────

const SCHEMA_ARTICLE = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Hudayriyat Island Property Guide 2025, Buy Freehold in Abu Dhabi",
  description: LABELS.en.metaDesc,
  image: OG_IMG,
  author: { "@type": "Organization", name: "Binayah Properties", url: "https://www.binayah.ae" },
  publisher: {
    "@type": "Organization",
    name: "Binayah Properties",
    logo: { "@type": "ImageObject", url: "https://www.binayah.ae/assets/binayah-logo.svg" },
  },
  datePublished: "2025-01-01",
  dateModified: "2026-06-01",
};

// ─────────────────────────────────────────────────────────────
// Static data (English proper nouns — locale-independent)
// ─────────────────────────────────────────────────────────────

const AMENITIES = [
  { icon: Waves, label: "Surf Abu Dhabi", desc: "World's largest artificial wave pool, all skill levels" },
  { icon: Bike, label: "220 km Cycling", desc: "Official Bike City, dedicated cycle network" },
  { icon: Trophy, label: "Abu Dhabi Velodrome", desc: "International-grade indoor cycling track" },
  { icon: Trees, label: "2.25M sqm Park", desc: "Landscaped urban park & jogging trails" },
  { icon: Anchor, label: "Hudayriyat Marina", desc: "Full-service waterfront marina & mooring" },
  { icon: Waves, label: "Free Public Beaches", desc: "Mar Vista & Al Bateen Beach, free entry" },
  { icon: Building2, label: "321 Sports Dome", desc: "Largest indoor sports dome in the region" },
  { icon: Star, label: "Bab Al Nojoum", desc: "5-star beachfront glamping & eco resort" },
];

const COMMUNITIES = [
  {
    name: "Nawayef Park Views",
    type: "Apartments",
    beds: "1-4 BR",
    priceFrom: "AED 2M",
    handover: "Q1 2028",
    desc: "Mediterranean-inspired residences overlooking the Arabian Gulf and Abu Dhabi skyline. Souq plaza, fine dining, and wellness spaces at your doorstep.",
    img: "https://cdn.prod.website-files.com/65b8ae9b3af43cf735dab067/69329ce567c111d16cb2bf52_6759761015ef38dc475c58d0_Nawayef%2520Park%2520Views.webp",
    tag: "Apartments",
    badge: "From AED 2M",
    tagColor: "#2563EB",
  },
  {
    name: "Bashayer",
    type: "Waterfront Villas & Apartments",
    beds: "1-5 BR",
    priceFrom: "AED 2.35M",
    handover: "Q4 2028-2029",
    desc: "Abu Dhabi's first waterfront island community. 157 villas + 330 apartments, rooftop infinity pool, 3.5 km promenade. Sold out at launch, raising AED 3B.",
    img: "https://cdn.prod.website-files.com/65b8ae9b3af43cf735dab067/69329cd6f5558c90f6eda9dd_6926cae021fc4137d048275b_Bashayer%250.webp",
    tag: "Waterfront",
    badge: "From AED 2.35M",
    tagColor: "#0891B2",
  },
  {
    name: "Al Naseem",
    type: "Standalone Villas",
    beds: "4-6 BR",
    priceFrom: "AED 7.8M",
    handover: "Q4 2027",
    desc: "Signature freestanding villas in South Californian and Modern Contemporary styles. Schools, community centre, pools, and cycling paths all within the community.",
    img: "https://www.modon.com/images/modoncorporatelibraries/real-estate/al-naseem_skyline_1920x1080.jpg",
    tag: "Villas",
    badge: "From AED 7.8M",
    tagColor: "#059669",
  },
  {
    name: "Nawayef Homes",
    type: "Hillside Villas",
    beds: "3-5 BR",
    priceFrom: "AED 6M",
    handover: "Q4 2026-2027",
    desc: "Perched on man-made hills up to 60m high, panoramic views of Abu Dhabi's skyline and the Arabian Gulf. 3,700-5,000 sqft. Unique in the UAE.",
    img: "https://cdn.prod.website-files.com/65b8ae9b3af43cf735dab067/69329cdd77e71177de17491b_66c86ee529c70d65ed7c63d7_65eeb0678d0f6e270a004de0_Nawayef_Mansions_Type5_1%252520(1).webp",
    tag: "Hillside Villas",
    badge: "From AED 6M",
    tagColor: "#D97706",
  },
  {
    name: "Hudayriyat Golf Estates",
    type: "Golf Villas & Townhouses",
    beds: "4-6 BR",
    priceFrom: "AED 4.25M",
    handover: "Q3 2030",
    desc: "Championship golf-course-front villas and townhouses. Resort lifestyle with direct green frontage in the heart of the island's leisure district.",
    img: "https://cdn.prod.website-files.com/65b8ae9b3af43cf735dab067/6a0ee7e2e846da995b0ace83_img33.webp",
    tag: "Golf Villas",
    badge: "From AED 4.25M",
    tagColor: "#065F46",
  },
  {
    name: "Nawayef Mansions",
    type: "Ultra-Luxury Mansions",
    beds: "6-8 BR",
    priceFrom: "AED 25M",
    handover: "2027",
    desc: "The most exclusive addresses in Abu Dhabi. 8,700-29,000 sqft hilltop mansions commanding the island's highest elevations and uninterrupted 360° views.",
    img: AERIAL_IMG,
    tag: "Ultra Luxury",
    badge: "From AED 25M",
    tagColor: "#92400E",
  },
];

const WHY_INVEST_ICONS = [Shield, TrendingUp, Star, MapPin];

// Comparison table rows — labels are locale-aware, values are numeric/universal
const TABLE_ROWS_EN = [
  ["Transfer Fee", "2%", "4%"],
  ["Gross Rental Yield", "7-9%", "5.5-7%"],
  ["Capital Appreciation", "40-50%", "15-25%"],
  ["Developer Risk", "Sovereign (ADQ)", "Varies"],
  ["Golden Visa Threshold", "AED 2M", "AED 2M"],
];

const TABLE_ROWS_RU = [
  ["Налог на передачу", "2%", "4%"],
  ["Валовая доходность аренды", "7-9%", "5.5-7%"],
  ["Прирост капитала", "40-50%", "15-25%"],
  ["Риск застройщика", "Суверенный (ADQ)", "Varies"],
  ["Порог Золотой визы", "AED 2 млн", "AED 2 млн"],
];

const TABLE_ROWS_AR = [
  ["رسوم النقل", "2%", "4%"],
  ["العائد الإيجاري الإجمالي", "7-9%", "5.5-7%"],
  ["ارتفاع رأس المال", "40-50%", "15-25%"],
  ["مخاطر المطوّر", "سيادي (ADQ)", "يتفاوت"],
  ["حد التأشيرة الذهبية", "2 مليون درهم", "2 مليون درهم"],
];

const TABLE_ROWS_ZH = [
  ["过户费", "2%", "4%"],
  ["毛租金回报率", "7-9%", "5.5-7%"],
  ["资本增值", "40-50%", "15-25%"],
  ["开发商风险", "主权背书 (ADQ)", "不等"],
  ["黄金签证门槛", "200万迪拉姆", "200万迪拉姆"],
];

const TABLE_ROWS_VI = [
  ["Phí chuyển nhượng", "2%", "4%"],
  ["Lợi suất cho thuê gộp", "7-9%", "5.5-7%"],
  ["Tăng giá vốn", "40-50%", "15-25%"],
  ["Rủi ro chủ đầu tư", "Chủ quyền (ADQ)", "Thay đổi"],
  ["Ngưỡng Golden Visa", "2 triệu AED", "2 triệu AED"],
];

const TABLE_ROWS_HE = [
  ["דמי העברה", "2%", "4%"],
  ["תשואת שכירות ברוטו", "7-9%", "5.5-7%"],
  ["עליית ערך הון", "40-50%", "15-25%"],
  ["סיכון יזם", "ריבוני (ADQ)", "משתנה"],
  ["סף ויזת זהב", "AED 2M", "AED 2M"],
];

function getTableRows(locale: Locale): string[][] {
  if (locale === "ru") return TABLE_ROWS_RU;
  if (locale === "ar") return TABLE_ROWS_AR; // vi uses TABLE_ROWS_VI below
  if (locale === "zh") return TABLE_ROWS_ZH;
  if (locale === "vi") return TABLE_ROWS_VI;
  if (locale === "he") return TABLE_ROWS_HE;
  return TABLE_ROWS_EN;
}

// ─────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────

export default async function HudayriyatIslandPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const nonce = await getNonce();
  const localePrefix = locale === "en" ? "" : `/${locale}`;
  const L = LABELS[locale as Locale] ?? LABELS.en;
  const isRtl = locale === "ar" || locale === "he"; // ar, he are rtl; vi, zh, ru, en are ltr
  const tableRows = getTableRows(locale as Locale);

  const breadcrumbs = [
    { name: "Home", href: `${localePrefix}/` },
    { name: "Areas", href: `${localePrefix}/areas` },
    { name: "Hudayriyat Island", href: `${localePrefix}/hudayriyat-island` },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA_ARTICLE).replace(/</g, "\\u003c") }}
      />
      <BreadcrumbJsonLd items={breadcrumbs} />
      <FAQJsonLd faqs={L.faqs} />
      <Navbar />

      <div dir={isRtl ? "rtl" : "ltr"}>

        {/* ── HERO ── */}
        <section className="relative min-h-[95vh] flex items-end overflow-hidden">
          <div className="absolute inset-0">
            <img
              src={HERO_IMG}
              alt="Hudayriyat Island Abu Dhabi, aerial view of Mediterranean villas with Abu Dhabi skyline"
              className="w-full h-full object-cover"
              fetchPriority="high"
            />
            {/* Multi-stop gradient for depth */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to bottom, rgba(11,61,46,0.15) 0%, rgba(11,61,46,0.35) 35%, rgba(11,61,46,0.75) 65%, #0B3D2E 100%)",
              }}
            />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pb-16 sm:pb-28 w-full">
            <div className="max-w-3xl">
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-3 mb-6">
                <span className="h-px w-8 bg-accent" />
                <span className="text-accent text-[11px] font-bold uppercase tracking-[0.35em]">
                  {L.heroEyebrow}
                </span>
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-[4.5rem] font-bold text-white leading-[1.02] mb-5 tracking-tight">
                {L.heroH1Line1}<br />
                <span style={{ color: "#D4A847" }}>{L.heroH1Line2}</span>
              </h1>

              <p className="text-white/80 text-lg sm:text-xl leading-relaxed mb-3 max-w-2xl">
                {L.heroSubtitle}
              </p>

              {/* Trust signals row */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-9">
                {L.trustSignals.map((t) => (
                  <div key={t} className="flex items-center gap-1.5 text-white/65 text-sm">
                    <CheckCircle className="h-3.5 w-3.5 text-accent flex-shrink-0" />
                    <span>{t}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href={`${localePrefix}/contact`}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-sm font-bold text-white transition-all hover:shadow-2xl hover:-translate-y-0.5 whitespace-nowrap"
                  style={{ background: "linear-gradient(to right, #D4A847, #B8922F)", boxShadow: "0 4px 20px rgba(212,168,71,0.45)" }}
                >
                  {L.ctaPrimary} <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="#communities"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-sm font-bold text-white border border-white/25 hover:bg-white/10 transition-all whitespace-nowrap"
                >
                  {L.ctaSecondary} <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-50">
            <div className="w-px h-8 bg-white animate-pulse" />
            <span className="text-white text-[9px] uppercase tracking-widest">Scroll</span>
          </div>
        </section>

        {/* ── STATS BAR ── */}
        <section
          style={{ background: "linear-gradient(135deg, #0B3D2E 0%, #1A5C44 100%)" }}
          className="py-10 border-b border-white/10"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0 lg:divide-x lg:divide-white/15">
              {L.stats.map(([value, label, sub]) => (
                <div key={value} className="text-center lg:px-8">
                  <p className="text-3xl sm:text-4xl font-bold text-white mb-1 tabular-nums">{value}</p>
                  <p className="text-white/65 text-sm font-medium">{label}</p>
                  <p className="text-accent text-xs mt-1 font-semibold">{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── ABOUT ── */}
        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
            <div className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-accent font-bold mb-4">{L.aboutEyebrow}</p>
                <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6 leading-tight">
                  {L.aboutHeading}
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-5 text-[15px]">
                  {L.aboutPara1}
                </p>
                <p className="text-muted-foreground leading-relaxed mb-8 text-[15px]">
                  {L.aboutPara2}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {L.aboutMinistats.map(([val, lbl]) => (
                    <div key={lbl} className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors">
                      <p className="text-xl font-bold text-foreground">{val}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{lbl}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Image with annotation */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src={AERIAL_IMG}
                  alt="Hudayriyat Island masterplan aerial, circular villa community Abu Dhabi"
                  className="w-full aspect-[4/3] object-cover"
                  loading="lazy"
                />
                {/* Developer badge */}
                <div
                  className="absolute bottom-0 inset-x-0 p-5"
                  style={{ background: "linear-gradient(to top, rgba(11,61,46,0.92), transparent)" }}
                >
                  <p className="text-white font-semibold text-sm">{L.developerBadge}</p>
                  <p className="text-white/65 text-xs mt-0.5">
                    {L.developerSub}
                  </p>
                </div>
                {/* Verified badge */}
                <div className="absolute top-4 right-4 bg-accent/90 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full">
                  {L.freeholdBadge}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── AMENITIES ── */}
        <section className="py-20 bg-muted/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
            <div className="text-center mb-14">
              <p className="text-xs uppercase tracking-[0.3em] text-accent font-bold mb-3">{L.amenitiesEyebrow}</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground">{L.amenitiesHeading}</h2>
              <p className="text-muted-foreground mt-3 max-w-xl mx-auto text-[15px]">
                {L.amenitiesSubheading}
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5">
              {AMENITIES.map((a) => (
                <div
                  key={a.label}
                  className="group bg-card border border-border rounded-2xl p-5 hover:border-primary/40 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-default"
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-colors group-hover:bg-primary/10"
                    style={{ background: "linear-gradient(135deg, rgba(11,61,46,0.08), rgba(26,122,90,0.12))" }}
                  >
                    <a.icon className="h-5 w-5 text-primary" />
                  </div>
                  <p className="font-semibold text-foreground text-sm mb-1">{a.label}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{a.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── COMMUNITIES ── */}
        <section id="communities" className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-accent font-bold mb-3">{L.communitiesEyebrow}</p>
                <h2 className="text-3xl sm:text-4xl font-bold text-foreground">{L.communitiesHeading}</h2>
                <p className="text-muted-foreground mt-2 max-w-xl text-[15px]">
                  {L.communitiesSubheading}
                </p>
              </div>
              <Link
                href={`${localePrefix}/contact`}
                className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 hover:-translate-y-0.5 whitespace-nowrap"
                style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
              >
                {L.communitiesCta} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {COMMUNITIES.map((c) => (
                <article
                  key={c.name}
                  className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300"
                >
                  <div className="relative h-52 overflow-hidden">
                    <img
                      src={c.img}
                      alt={`${c.name}, ${c.type} on Hudayriyat Island Abu Dhabi`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div
                      className="absolute inset-0"
                      style={{ background: "linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.55) 100%)" }}
                    />
                    <span
                      className="absolute top-3 left-3 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                      style={{ backgroundColor: c.tagColor }}
                    >
                      {c.tag}
                    </span>
                    <span className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white text-[10px] font-semibold px-2.5 py-1 rounded-full">
                      {c.badge}
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-foreground mb-0.5">{c.name}</h3>
                    <p className="text-xs text-muted-foreground mb-3 font-medium">{c.type} · {c.beds}</p>
                    <p className="text-sm text-foreground/75 leading-relaxed mb-4">{c.desc}</p>
                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{L.communitiesStartingFrom}</p>
                        <p className="text-base font-bold text-primary">{c.priceFrom}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{L.communitiesHandover}</p>
                        <p className="text-sm font-semibold text-foreground">{c.handover}</p>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── WHY INVEST ── */}
        <section
          style={{ background: "linear-gradient(145deg, #0A3529 0%, #0B3D2E 40%, #0F4A36 100%)" }}
          className="py-20"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
            <div className="text-center mb-14">
              <p className="text-xs uppercase tracking-[0.3em] text-accent font-bold mb-3">{L.whyInvestEyebrow}</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-white">
                {L.whyInvestHeading}
              </h2>
              <p className="text-white/60 mt-3 max-w-xl mx-auto text-[15px]">
                {L.whyInvestSubheading}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-14">
              {L.whyInvestCards.map(([title, body], idx) => {
                const Icon = WHY_INVEST_ICONS[idx];
                return (
                  <div
                    key={title}
                    className="border border-white/12 rounded-2xl p-6 hover:bg-white/5 transition-colors"
                    style={{ background: "rgba(255,255,255,0.04)" }}
                  >
                    <div className="w-11 h-11 rounded-xl bg-accent/15 border border-accent/25 flex items-center justify-center mb-4">
                      <Icon className="h-5 w-5 text-accent" />
                    </div>
                    <h3 className="font-bold text-white mb-2 text-sm leading-snug">{title}</h3>
                    <p className="text-white/55 text-xs leading-relaxed">{body}</p>
                  </div>
                );
              })}
            </div>

            {/* Comparison table */}
            <div className="rounded-2xl overflow-hidden border border-white/15">
              <div className="grid grid-cols-3 bg-white/10 text-white/50 text-[11px] uppercase tracking-wider font-semibold py-3 px-4 sm:px-6">
                <span>{L.tableHeaders[0]}</span>
                <span className="text-accent text-center">{L.tableHeaders[1]}</span>
                <span className="text-center">{L.tableHeaders[2]}</span>
              </div>
              {tableRows.map(([label, hub, dubai], i) => (
                <div
                  key={label}
                  className={`grid grid-cols-3 py-4 px-4 sm:px-6 items-center ${i % 2 === 0 ? "bg-white/3" : ""}`}
                >
                  <span className="text-white/70 text-sm">{label}</span>
                  <span className="text-accent font-bold text-sm text-center">{hub}</span>
                  <span className="text-white/45 text-sm text-center">{dubai}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="py-20 bg-background">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <p className="text-xs uppercase tracking-[0.3em] text-accent font-bold mb-3">{L.faqEyebrow}</p>
              <h2 className="text-3xl font-bold text-foreground">
                {L.faqHeading}
              </h2>
              <p className="text-muted-foreground mt-3 text-[15px]">
                {L.faqSubheading}
              </p>
            </div>
            <div className="divide-y divide-border">
              {L.faqs.map((f) => (
                <details key={f.question} className="group py-5 cursor-pointer">
                  <summary className="flex items-start justify-between gap-4 list-none select-none">
                    <span className="font-semibold text-foreground text-sm sm:text-base leading-snug pr-2">{f.question}</span>
                    <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5 group-open:rotate-90 transition-transform duration-200" />
                  </summary>
                  <p className="mt-3 text-muted-foreground text-sm leading-relaxed pr-8">{f.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-20 bg-card border-t border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-accent font-bold mb-4">{L.ctaEyebrow}</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              {L.ctaHeading}
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto text-[15px]">
              {L.ctaBody}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href={`${localePrefix}/contact`}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-bold text-white transition-all hover:shadow-2xl hover:-translate-y-0.5 whitespace-nowrap"
                style={{ background: "linear-gradient(to right, #D4A847, #B8922F)", boxShadow: "0 4px 20px rgba(212,168,71,0.35)" }}
              >
                {L.ctaPrimaryBtn} <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="tel:+971549988811"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-semibold border border-border hover:bg-muted transition-colors text-foreground whitespace-nowrap"
              >
                <Phone className="h-4 w-4" />
                +971 54 998 8811
              </a>
            </div>

            {/* Trust footer */}
            <div className="mt-10 pt-8 border-t border-border flex flex-wrap justify-center gap-6 text-muted-foreground text-xs">
              {L.trustFooter.map((t) => (
                <div key={t} className="flex items-center gap-1.5">
                  <CheckCircle className="h-3 w-3 text-accent flex-shrink-0" />
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

      </div>

      <Footer />
      <WhatsAppButton />
    </>
  );
}
