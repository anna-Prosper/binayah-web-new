/* eslint-disable i18next/no-literal-string -- multilingual SEO landing page */
import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { FAQJsonLd, BreadcrumbJsonLd, CollectionPageJsonLd } from "@/components/JsonLd";
import { canonical, altLangs, OG_LOCALE, DEFAULT_OG_IMAGE } from "@/lib/site";
import { serverFetch, serverApiUrl } from "@/lib/api";
import SearchPageClient from "@/app/_clients/search/SearchPageClient";
import PropertyTypeSidebar from "@/components/PropertyTypeSidebar";

export const dynamic = "force-dynamic";

async function getInitialOffPlanListings() {
  try {
    const res = await serverFetch(serverApiUrl("/api/search?intent=off-plan&status=Off-Plan&pageSize=24"), 8000);
    if (!res.ok) return null;
    return res.json() as Promise<any>;
  } catch {
    return null;
  }
}

function collectionItemsFrom(initialData: any): { url: string; name: string }[] {
  return [
    ...(Array.isArray(initialData?.projects) ? initialData.projects : [])
      .filter((p: any) => p?.slug && p?.name)
      .map((p: any) => ({ url: `/project/${p.slug}`, name: String(p.name) })),
    ...(Array.isArray(initialData?.listings) ? initialData.listings : [])
      .filter((l: any) => l?.slug && (l?.title || l?.name))
      .map((l: any) => ({ url: `/property/${l.slug}`, name: String(l.title || l.name) })),
  ];
}

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const CONTENT = {
  fr: {
    "metaTitle": "Biens sur plan à Dubaï 2026 | Nouveaux Lancements | Binayah",
    "metaDesc": "Parcourez plus de 3 000 biens sur plan à Dubaï. Nouveaux lancements de projets par Emaar, DAMAC, Sobha, Aldar. Plans de paiement flexibles, rendement élevé. Conseils d'experts.",
    "heroLabel": "SUR PLAN DUBAÏ",
    "h1": "Biens sur plan à Dubaï",
    "heroDesc": "Découvrez les meilleurs projets sur plan de Dubaï nouvellement lancés. Plans de paiement flexibles, garanties des promoteurs, et potentiel d'appréciation du capital de 15 à 30 % avant la remise des clés.",
    "faqs": [
      {
        "question": "Qu'est-ce qu'un bien sur plan à Dubaï ?",
        "answer": "Sur plan signifie acheter un bien avant qu'il ne soit construit ou pendant sa construction. Vous payez une partie à l'avance (généralement 10 à 20 %) et le reste est dû en plusieurs versements pendant la construction ou après la remise des clés. Les biens sur plan sont souvent 15 à 30 % moins chers que les unités prêtes dans le même immeuble."
      },
      {
        "question": "Quels sont les risques d'acheter sur plan à Dubaï ?",
        "answer": "Les principaux risques incluent les retards de projet et (rarement) l'insolvabilité du promoteur. La RERA de Dubaï régule les comptes séquestres — les fonds des promoteurs sont conservés dans des comptes séparés jusqu'à ce que les étapes de construction soient atteintes. Choisissez des projets enregistrés auprès de la RERA et des promoteurs expérimentés avec un historique solide."
      },
      {
        "question": "Puis-je vendre un bien sur plan avant la remise des clés ?",
        "answer": "Oui. Une fois que vous avez payé un minimum de 30 à 40 % de la valeur du bien, la plupart des promoteurs permettent la revente sur le marché secondaire. Cela s'appelle le 'flipping' et peut générer un profit de 10 à 30 % dans un marché en hausse avant même que vous ne receviez les clés."
      },
      {
        "question": "Quels promoteurs ont les meilleurs projets sur plan à Dubaï ?",
        "answer": "Les principaux promoteurs incluent Emaar (Downtown, Dubai Creek Harbour), DAMAC (Cavalli, Lagoons), Sobha Realty (Hartland II), Aldar (Yas Island), Nakheel (Palm Jumeirah), et Mag (MBR City). Chacun propose différents niveaux de prix, emplacements et structures de paiement."
      },
      {
        "question": "Quels plans de paiement les promoteurs sur plan offrent-ils ?",
        "answer": "Structures typiques : 10 % à la réservation + 10 % à la SPA + 30 % pendant la construction + 50 % à la remise des clés. Certains promoteurs offrent des plans de paiement après remise des clés (par exemple, 40 % pendant la construction + 60 % sur 3 ans après la remise des clés). Des plans sans intérêt sont également disponibles auprès de certains promoteurs."
      },
      {
        "question": "Le sur plan est-il meilleur qu'un bien prêt à Dubaï ?",
        "answer": "Le sur plan offre un prix d'entrée plus bas, un potentiel d'appréciation du capital, et des plans de paiement flexibles — mais vous attendez 2 à 4 ans pour les clés. Les biens prêts fournissent un revenu locatif immédiat, sont plus faciles à financer par prêt immobilier, et n'ont pas de risque d'achèvement. Le bon choix dépend de votre horizon d'investissement et de vos besoins en trésorerie."
      }
    ],
    "breadcrumb": "Sur Plan",
    "searchTitle": "Parcourir les Projets sur Plan"
  },
  he: {
    "metaTitle": "נכסים על הנייר בדובאי 2026 | השקות חדשות | Binayah",
    "metaDesc": "עיינו ביותר מ-3,000 נכסים על הנייר בדובאי. השקות פרויקטים חדשים מ-Emaar, DAMAC, Sobha, Aldar. תוכניות תשלום גמישות, תשואה גבוהה. ליווי מקצועי.",
    "heroLabel": "על הנייר בדובאי",
    "h1": "נכסים על הנייר בדובאי",
    "heroDesc": "גלו את פרויקטי ההשקה החדשים והטובים ביותר על הנייר בדובאי. תוכניות תשלום גמישות, ערבויות יזם ופוטנציאל עליית ערך של 15–30% לפני המסירה.",
    "faqs": [
      {
        "question": "מהו נכס על הנייר בדובאי?",
        "answer": "על הנייר משמעו רכישת נכס לפני שנבנה או במהלך הבנייה. משלמים חלק מראש (בדרך כלל 10–20%) והיתרה בתשלומים במהלך הבנייה או לאחר המסירה. נכסים על הנייר זולים לרוב ב-15–30% מיחידות מוכנות באותו בניין."
      },
      {
        "question": "מהם הסיכונים ברכישת נכס על הנייר בדובאי?",
        "answer": "הסיכונים העיקריים כוללים עיכובים בפרויקט ו(לעיתים נדירות) חדלות פירעון של היזם. ה-RERA של דובאי מסדירה חשבונות נאמנות — כספי היזם מוחזקים בחשבונות מופרדים עד להשגת אבני דרך בבנייה. בחרו פרויקטים רשומים ב-RERA ויזמים מנוסים בעלי רקורד מוכח."
      },
      {
        "question": "האם אפשר למכור נכס על הנייר לפני המסירה?",
        "answer": "כן. לאחר ששילמתם מינימום של 30–40% מערך הנכס, רוב היזמים מאפשרים מכירה חוזרת בשוק המשני. זה נקרא 'flipping' ויכול להניב רווח של 10–30% בשוק עולה עוד לפני שתקבלו את המפתחות."
      },
      {
        "question": "לאילו יזמים יש את הפרויקטים הטובים ביותר על הנייר בדובאי?",
        "answer": "בין היזמים המובילים: Emaar (Downtown, Dubai Creek Harbour), DAMAC (Cavalli, Lagoons), Sobha Realty (Hartland II), Aldar (Yas Island), Nakheel (Palm Jumeirah) ו-Mag (MBR City). לכל אחד מהם רמות מחיר, מיקומים ומבני תשלום שונים."
      },
      {
        "question": "אילו תוכניות תשלום מציעים יזמי נכסים על הנייר?",
        "answer": "מבנים אופייניים: 10% בעת ההזמנה + 10% בחתימת ה-SPA + 30% במהלך הבנייה + 50% במסירה. חלק מהיזמים מציעים תוכניות תשלום לאחר המסירה (לדוגמה 40% במהלך הבנייה + 60% על פני 3 שנים לאחר המסירה). תוכניות ללא ריבית זמינות אף הן אצל יזמים נבחרים."
      },
      {
        "question": "האם נכס על הנייר עדיף על נכס מוכן בדובאי?",
        "answer": "נכס על הנייר מציע מחיר כניסה נמוך יותר, פוטנציאל עליית ערך ותוכניות תשלום גמישות — אך תמתינו 2–4 שנים למפתחות. נכסים מוכנים מספקים הכנסה משכירות באופן מיידי, קל יותר למשכן אותם ואין בהם סיכון השלמה. הבחירה הנכונה תלויה באופק ההשקעה ובצורכי תזרים המזומנים שלכם."
      }
    ],
    "breadcrumb": "על הנייר",
    "searchTitle": "עיון בפרויקטים על הנייר"
  },
  en: {
    metaTitle: "Off-Plan Properties in Dubai 2026 | New Launches | Binayah",
    metaDesc: "Browse 3,000+ off-plan properties in Dubai. New project launches from Emaar, DAMAC, Sobha, Aldar. Flexible payment plans, high ROI. Expert guidance.",
    heroLabel: "OFF-PLAN DUBAI",
    h1: "Off-Plan Properties in Dubai",
    heroDesc: "Discover Dubai's best new-launch off-plan projects. Flexible payment plans, developer guarantees, and potential 15–30% capital appreciation before handover.",
    faqs: [
      { question: "What is an off-plan property in Dubai?", answer: "Off-plan means buying a property before it is built or during construction. You pay a portion upfront (typically 10–20%) with the rest due in instalments during construction or after handover. Off-plan properties are often 15–30% cheaper than ready units in the same building." },
      { question: "What are the risks of buying off-plan in Dubai?", answer: "Main risks include project delays and (rarely) developer insolvency. Dubai's RERA regulates escrow accounts — developer funds are held in ring-fenced accounts until construction milestones are met. Choose RERA-registered projects and experienced developers with a track record." },
      { question: "Can I sell an off-plan property before handover?", answer: "Yes. Once you have paid a minimum of 30–40% of the property value, most developers allow resale on the secondary market. This is called 'flipping' and can generate 10–30% profit in a rising market before you ever receive the keys." },
      { question: "Which developers have the best off-plan projects in Dubai?", answer: "Top developers include Emaar (Downtown, Dubai Creek Harbour), DAMAC (Cavalli, Lagoons), Sobha Realty (Hartland II), Aldar (Yas Island), Nakheel (Palm Jumeirah), and Mag (MBR City). Each has different price points, locations, and payment structures." },
      { question: "What payment plans do off-plan developers offer?", answer: "Typical structures: 10% on booking + 10% on SPA + 30% during construction + 50% on handover. Some developers offer post-handover payment plans (e.g. 40% during construction + 60% over 3 years after handover). Zero-interest plans are also available from selected developers." },
      { question: "Is off-plan better than ready property in Dubai?", answer: "Off-plan offers lower entry price, capital appreciation potential, and flexible payment plans — but you wait 2–4 years for the keys. Ready properties provide immediate rental income, are easier to mortgage, and have no completion risk. The right choice depends on your investment horizon and cash flow needs." },
    ],
    breadcrumb: "Off-Plan",
    searchTitle: "Browse Off-Plan Projects",
  },
  ru: {
    metaTitle: "Новостройки в Дубае 2026 | Новые проекты | Binayah Properties",
    metaDesc: "Более 3000 объектов off-plan в Дубае. Новые проекты от Emaar, DAMAC, Sobha, Aldar. Гибкие планы рассрочки, высокий ROI.",
    heroLabel: "НОВОСТРОЙКИ ДУБАЙ",
    h1: "Новостройки и объекты Off-Plan в Дубае",
    heroDesc: "Откройте для себя лучшие новостройки Дубая: гибкие планы рассрочки, гарантии застройщика и потенциальный рост стоимости на 15–30% до сдачи.",
    faqs: [
      { question: "Что такое объект off-plan в Дубае?", answer: "Off-plan — покупка объекта до или в процессе строительства. Обычно 10–20% вносится сразу, остаток — в рассрочку в ходе строительства или после сдачи. Off-plan объекты нередко на 15–30% дешевле готовых аналогов." },
      { question: "Каковы риски покупки off-plan в Дубае?", answer: "Основные риски: задержки строительства и (редко) банкротство застройщика. RERA Дубая регулирует эскроу-счета — средства покупателей хранятся отдельно до достижения строительных этапов. Выбирайте проекты, зарегистрированные RERA, и застройщиков с подтверждённым опытом." },
      { question: "Можно ли продать off-plan объект до сдачи?", answer: "Да. После оплаты минимум 30–40% стоимости большинство застройщиков разрешают перепродажу на вторичном рынке. Это может принести прибыль 10–30% ещё до получения ключей." },
      { question: "Какие крупнейшие застройщики в Дубае?", answer: "Ведущие застройщики: Emaar (Даунтаун, Дубай Крик Харбор), DAMAC (Cavalli, Lagoons), Sobha Realty (Hartland II), Aldar (о-в Яс), Nakheel (Пальма Джумейра), Mag (MBR City)." },
      { question: "Какие планы рассрочки предлагают застройщики?", answer: "Типичная структура: 10% при бронировании + 10% при SPA + 30% в ходе строительства + 50% при сдаче. Некоторые предлагают пост-хандоверные планы (оплата после получения ключей). Также доступны беспроцентные рассрочки." },
      { question: "Что выгоднее — новостройка или готовый объект?", answer: "Off-plan предлагает более низкую цену входа, потенциальный рост стоимости и гибкие платежи — но придётся ждать 2–4 года. Готовые объекты дают немедленный доход от аренды и проще в получении ипотеки." },
    ],
    breadcrumb: "Новостройки",
    searchTitle: "Найти объекты Off-Plan",
  },
  ar: {
    metaTitle: "العقارات على الخارطة في دبي 2026 | مشاريع جديدة | بناية",
    metaDesc: "أكثر من 3000 عقار على الخارطة في دبي. إطلاقات جديدة من إعمار وداماك وسوبها والدار. خطط سداد مرنة وعائد مرتفع.",
    heroLabel: "على الخارطة في دبي",
    h1: "العقارات على الخارطة في دبي",
    heroDesc: "اكتشف أفضل مشاريع دبي على الخارطة: خطط سداد مرنة وضمانات المطوّر وإمكانية ارتفاع القيمة 15-30% قبل التسليم.",
    faqs: [
      { question: "ما المقصود بالعقار على الخارطة في دبي؟", answer: "العقار على الخارطة هو شراء وحدة قبل اكتمال بنائها. تُدفع عادةً 10-20% مقدمًا والباقي بالتقسيط خلال البناء أو بعد التسليم. غالبًا أرخص 15-30% من الوحدات الجاهزة." },
      { question: "ما مخاطر الشراء على الخارطة في دبي؟", answer: "المخاطر الرئيسية: التأخير في التسليم وإفلاس المطوّر (نادر). تُنظّم RERA حسابات الضمان لحماية الأموال. اختر مشاريع مسجَّلة في RERA ومطوّرين ذوي سجل حافل." },
      { question: "هل يمكن بيع وحدة على الخارطة قبل التسليم؟", answer: "نعم. بعد دفع 30-40% من قيمة العقار، يسمح معظم المطوّرين بإعادة البيع. قد يُدرّ ربحًا 10-30% في السوق المتنامي قبل استلام المفاتيح." },
      { question: "ما أبرز المطوّرين في دبي؟", answer: "إعمار (وسط المدينة، دبي كريك هاربر)، داماك (كافالي، لاغونز)، سوبها ريلتي (هارتلاند II)، الدار (جزيرة ياس)، نخيل (نخلة جميرا)، ماغ (مدينة محمد بن راشد)." },
      { question: "ما خطط الدفع المتاحة للشراء على الخارطة؟", answer: "نموذج شائع: 10% عند الحجز + 10% عند توقيع SPA + 30% أثناء البناء + 50% عند التسليم. بعض المطوّرين يُقدّمون خطط دفع ما بعد التسليم وتمويلًا بدون فوائد." },
    ],
    breadcrumb: "على الخارطة",
    searchTitle: "استعرض المشاريع على الخارطة",
  },
  zh: {
    metaTitle: "迪拜期房项目2026 | 新楼盘 | Binayah Properties",
    metaDesc: "浏览3000多套迪拜期房。Emaar、DAMAC、Sobha、Aldar新项目发布。灵活付款计划，高回报率。",
    heroLabel: "迪拜期房",
    h1: "迪拜期房项目",
    heroDesc: "探索迪拜最佳新楼盘：灵活付款计划、开发商保障，以及交房前15-30%的潜在资本增值。",
    faqs: [
      { question: "什么是迪拜期房？", answer: "期房是指在建筑建成前购买的房产。通常预付10-20%，其余在施工期间或交付后分期支付。期房通常比同楼现房便宜15-30%。" },
      { question: "购买迪拜期房有什么风险？", answer: "主要风险包括工程延期和（极少情况下的）开发商破产。迪拜RERA监管托管账户，在建设里程碑完成前资金单独保管。选择RERA注册项目和有记录的知名开发商。" },
      { question: "交房前可以出售期房吗？", answer: "可以。在支付最低30-40%房款后，大多数开发商允许在二手市场转售。在上升市场中，可在拿到钥匙之前获得10-30%的利润。" },
      { question: "迪拜有哪些顶级开发商？", answer: "主要开发商：Emaar（市中心、迪拜溪港）、DAMAC（Cavalli、Lagoons）、Sobha Realty（Hartland II）、Aldar（雅斯岛）、Nakheel（棕榈岛）、Mag（MBR城）。" },
      { question: "期房付款计划是怎样的？", answer: "典型结构：预订时10% + 签约时10% + 施工期间30% + 交房时50%。部分开发商提供交房后付款计划（交房后3年内支付60%）以及零息分期计划。" },
    ],
    breadcrumb: "期房",
    searchTitle: "浏览期房项目",
  },
  vi: {
    metaTitle: "Bất động sản Off-Plan tại Dubai 2026 | Dự án mới | Binayah",
    metaDesc: "Khám phá hơn 3.000 bất động sản off-plan tại Dubai. Ra mắt dự án mới từ Emaar, DAMAC, Sobha, Aldar. Kế hoạch thanh toán linh hoạt, ROI cao. Hướng dẫn chuyên gia.",
    heroLabel: "OFF-PLAN DUBAI",
    h1: "Bất động sản Off-Plan tại Dubai",
    heroDesc: "Khám phá các dự án off-plan mới ra mắt tốt nhất Dubai. Kế hoạch thanh toán linh hoạt, bảo lãnh của chủ đầu tư và tiềm năng tăng giá vốn 15–30% trước khi bàn giao.",
    faqs: [
      { question: "Bất động sản off-plan tại Dubai là gì?", answer: "Off-plan có nghĩa là mua một bất động sản trước khi xây dựng hoặc trong quá trình xây dựng. Bạn trả một phần trước (thường 10–20%), phần còn lại trả góp trong quá trình xây dựng hoặc sau khi bàn giao. Bất động sản off-plan thường rẻ hơn 15–30% so với căn đã hoàn thiện trong cùng tòa nhà." },
      { question: "Rủi ro khi mua off-plan tại Dubai là gì?", answer: "Rủi ro chính bao gồm chậm tiến độ dự án và (hiếm khi) chủ đầu tư mất khả năng thanh toán. RERA của Dubai quản lý tài khoản ký quỹ — vốn của chủ đầu tư được giữ trong tài khoản tách biệt cho đến khi đạt các cột mốc xây dựng. Hãy chọn dự án đã đăng ký RERA và chủ đầu tư giàu kinh nghiệm có thành tích." },
      { question: "Tôi có thể bán bất động sản off-plan trước khi bàn giao không?", answer: "Có. Khi bạn đã trả tối thiểu 30–40% giá trị bất động sản, hầu hết chủ đầu tư cho phép bán lại trên thị trường thứ cấp. Việc này gọi là 'flipping' và có thể tạo ra 10–30% lợi nhuận trong thị trường tăng giá trước khi bạn nhận chìa khóa." },
      { question: "Chủ đầu tư nào có dự án off-plan tốt nhất tại Dubai?", answer: "Các chủ đầu tư hàng đầu gồm Emaar (Downtown, Dubai Creek Harbour), DAMAC (Cavalli, Lagoons), Sobha Realty (Hartland II), Aldar (Yas Island), Nakheel (Palm Jumeirah) và Mag (MBR City). Mỗi đơn vị có mức giá, vị trí và cơ cấu thanh toán khác nhau." },
      { question: "Chủ đầu tư off-plan cung cấp kế hoạch thanh toán nào?", answer: "Cơ cấu điển hình: 10% khi đặt chỗ + 10% khi ký SPA + 30% trong quá trình xây dựng + 50% khi bàn giao. Một số chủ đầu tư cung cấp kế hoạch thanh toán sau bàn giao (ví dụ 40% trong xây dựng + 60% trong 3 năm sau bàn giao). Kế hoạch không lãi suất cũng có sẵn từ một số chủ đầu tư." },
      { question: "Off-plan có tốt hơn bất động sản đã hoàn thiện tại Dubai không?", answer: "Off-plan mang lại giá vào thấp hơn, tiềm năng tăng giá vốn và kế hoạch thanh toán linh hoạt — nhưng bạn phải chờ 2–4 năm để nhận chìa khóa. Bất động sản đã hoàn thiện cung cấp thu nhập cho thuê ngay, dễ vay thế chấp hơn và không có rủi ro hoàn thành. Lựa chọn phù hợp phụ thuộc vào tầm nhìn đầu tư và nhu cầu dòng tiền của bạn." },
    ],
    breadcrumb: "Off-Plan",
    searchTitle: "Xem dự án Off-Plan",
  },
} as const;

type Locale = keyof typeof CONTENT;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const c = CONTENT[(locale as Locale)] || CONTENT.en;
  const url = canonical(locale, "/off-plan");
  return {
    title: c.metaTitle,
    description: c.metaDesc,
    alternates: { canonical: url, languages: altLangs("/off-plan") },
    openGraph: {
      title: c.metaTitle,
      description: c.metaDesc,
      url,
      type: "website",
      locale: OG_LOCALE[locale] ?? "en_AE",
      images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: c.metaTitle,
      description: c.metaDesc,
      images: [DEFAULT_OG_IMAGE],
    },
    keywords: locale === "ru"
      ? ["новостройки дубай", "купить новостройку дубай", "off-plan дубай 2026", "инвестиции новостройки дубай"]
      : locale === "ar" // vi branch below
      ? ["عقارات على الخارطة دبي", "مشاريع على الخارطة دبي 2026", "استثمار على الخارطة دبي"]
      : locale === "zh"
      ? ["迪拜期房", "迪拜新楼盘2026", "迪拜期房投资", "迪拜开发商楼盘"]
      : locale === "vi" ? ["bất động sản off-plan dubai", "off-plan dubai 2026", "dự án mới dubai", "đầu tư off-plan dubai", "mua off-plan dubai"] : locale === "he" ? ["נכסים בתכנון מראש Dubai","תכנון מראש Dubai 2026","השקה חדשה Dubai","השקעה בתכנון מראש Dubai","קנה בתכנון מראש Dubai"] : ["off-plan properties dubai", "off-plan dubai 2026", "new launch dubai", "dubai off plan investment", "buy off plan dubai"],
  };
}

export default async function OffPlanPage({ params }: Props) {
  const { locale } = await params;
  const c = CONTENT[(locale as Locale)] || CONTENT.en;
  const isRtl = locale === "ar" || locale === "he"; // ar, he are rtl; vi, zh, ru, en are ltr
  const lp = locale === "en" ? "" : `/${locale}`;

  const initialData = await getInitialOffPlanListings();
  const collectionItems = collectionItemsFrom(initialData);

  const breadcrumbs = [
    { name: locale === "ru" ? "Главная" : locale === "ar" ? "الرئيسية" : locale === "zh" ? "首页" : locale === "vi" ? "Trang chủ" : locale === "he" ? "בית" : "Home", href: `${lp}/` },
    { name: c.breadcrumb, href: `${lp}/off-plan` },
  ];

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? "rtl" : "ltr"}>
      <FAQJsonLd faqs={c.faqs.map(f => ({ question: f.question, answer: f.answer }))} />
      <BreadcrumbJsonLd items={breadcrumbs} />
      <CollectionPageJsonLd name={c.h1} description={c.heroDesc} url="/off-plan" items={collectionItems} />
      <Navbar />

      {/* Hero */}
      <section
        className="relative overflow-hidden pt-28 pb-12 text-white"
        style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
      >
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)", backgroundSize: "48px 48px" }} />
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6">
          <p className="text-accent font-bold tracking-[0.4em] uppercase text-xs mb-3">{c.heroLabel}</p>
          <h1 className="text-3xl sm:text-5xl font-bold leading-tight mb-4">{c.h1}</h1>
          <p className="text-primary-foreground/80 text-lg max-w-2xl">{c.heroDesc}</p>
        </div>
      </section>

      {/* Full-width embedded search (spans the page like the sections above) */}
      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-8">
        <SearchPageClient defaultStatus="Off-Plan" defaultIntent="off-plan" syncUrl={false} initialData={initialData} />
      </div>

      {/* FAQ, with the sidebar starting here (below the full-width search) */}
      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 pb-12 sm:pb-16 lg:grid lg:grid-cols-[1fr_320px] lg:gap-8 lg:items-start">

        {/* Main column: FAQ */}
        <div className="min-w-0 space-y-12 sm:space-y-16">

          {/* FAQ */}
          <div>
            <div className="text-center mb-10">
              <p className="text-accent font-bold tracking-[0.35em] uppercase text-xs mb-3">FAQ</p>
              <h2 className="text-3xl font-bold text-foreground">
                {locale === "ru" ? "Частые вопросы" : locale === "ar" ? "الأسئلة الشائعة" : locale === "zh" ? "常见问题" : locale === "vi" ? "Câu hỏi về Off-Plan" : locale === "he" ? "שאלות נפוצות על הנייר" : "Off-Plan FAQs"}
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
          </div>
        </div>

        {/* Sidebar */}
        <aside className="mt-12 lg:mt-0 lg:sticky lg:top-24 self-start lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:[scrollbar-width:none] lg:[&::-webkit-scrollbar]:hidden">
          <PropertyTypeSidebar locale={locale} slug="off-plan" />
        </aside>
      </div>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
