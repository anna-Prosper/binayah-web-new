/* eslint-disable i18next/no-literal-string -- multilingual SEO landing page */
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { waHref, WA_DEFAULT_MESSAGE } from "@/lib/whatsapp";
import { FAQJsonLd, BreadcrumbJsonLd } from "@/components/JsonLd";
import { FOREIGN_BUYERS, findForeignBuyer, localizeBuyerText } from "@/lib/foreign-buyers";
import { canonical as makeCanonical, altLangs, AE_URL, OG_LOCALE } from "@/lib/site";

export const revalidate = 86400;

// ── Static-params: all locales × all citizen slugs ─────────────────────────
export function generateStaticParams() {
  const locales = ["en", "ar", "zh", "ru", "vi", "he", "fr"];
  return locales.flatMap((locale) =>
    FOREIGN_BUYERS.map((b) => ({ locale, citizen: b.slug }))
  );
}

// ── UI content (locale-aware headings, steps, FAQs, labels) ────────────────
const CONTENT = {
  he: {
    "heroLabel": "מדריך לרוכש זר",
    "guideSuffix": "אזרח",
    "guideFor": "מדריך עבור",
    "buyers": "רוכשים",
    "introBadge": "רכישת נכס בדובאי",
    "statsLabels": {
      "tax": "מס רווחי הון",
      "ownership": "בעלות מלאה (Freehold)",
      "visa": "סף ה-Golden Visa",
      "yield": "תשואה ברוטו אופיינית"
    },
    "statsValues": {
      "tax": "0%",
      "ownership": "כל הלאומים",
      "visa": "AED 2M",
      "yield": "5-8%"
    },
    "stepsHeading": "כיצד לרכוש נכס בדובאי",
    "stepsSubheading": "תהליך הרכישה הסטנדרטי בן 5 השלבים חל על כל הלאומים, כולל מי שאינם תושבים.",
    "steps": [
      {
        "n": "01",
        "title": "הסכמה על מחיר וחתימה על MOU",
        "body": "נהלו משא ומתן וחתמו על מזכר הבנות (MOU / טופס F) מול המוכר. הסוכן שלכם מגיש אותו ל-Dubai Land Department."
      },
      {
        "n": "02",
        "title": "תשלום פיקדון ביטחון של 10%",
        "body": "פיקדון בגובה 10% (המוחזק בנאמנות או אצל סוכנות הנדל\"ן) משולם בעת החתימה על ה-MOU. הוא משריין את הנכס ומוחרם במקרה של חזרה מהעסקה."
      },
      {
        "n": "03",
        "title": "קבלת NOC מהיזם",
        "body": "היזם מנפיק אישור היעדר התנגדות (NOC) המאשר כי אין דמי שירות או תשלומים פתוחים על הנכס. בדרך כלל 5-10 ימי עסקים."
      },
      {
        "n": "04",
        "title": "העברת בעלות ב-DLD ותשלום אגרות",
        "body": "שני הצדדים מתייצבים במשרד הנאמן של ה-DLD (או באמצעות ייפוי כוח מורשה). משלמים אגרת העברה של 4% ל-DLD בתוספת דמי ניהול. שטר הבעלות מונפק באותו יום."
      },
      {
        "n": "05",
        "title": "קבלת שטר הבעלות",
        "body": "ה-DLD מנפיק שטר בעלות דיגיטלי ופיזי על שמכם. מרגע זה אתם הבעלים החוקיים. הכנסות השכירות פטורות לחלוטין ממס החל מהיום הראשון."
      }
    ],
    "whyHeading": "מדוע דובאי עבור",
    "legalHeading": "מעמד משפטי וזכויות בעלות",
    "financeHeading": "אפשרויות מימון",
    "taxHeading": "השלכות מס",
    "repatHeading": "החזרת כספים למדינת המוצא",
    "areasHeading": "אזורים מועדפים",
    "areasIntro": "בהתבסס על נתוני העסקאות של Binayah, הקהילות הנבחרות ביותר בקרב",
    "areasOutro": "רוכשים הן:",
    "areasCta": "רכשו נכס ב-",
    "faqHeading": "שאלות נפוצות",
    "faqs": [
      {
        "question": "האם כל לאום יכול לרכוש נכס בבעלות מלאה (Freehold) בדובאי?",
        "answer": "כן. כל הלאומים יכולים לרכוש נכסים בבעלות מלאה באזורי ה-Freehold הייעודיים של דובאי, מעל 60 קהילות, כולל Dubai Marina, Downtown Dubai, Palm Jumeirah, Business Bay ו-JVC. אין הגבלות על בסיס לאום, דת או מעמד תושבות. אתם מקבלים שטר בעלות של ה-DLD עם זכויות בעלות מלאות."
      },
      {
        "question": "האם אני זקוק לאשרת תושבות באיחוד האמירויות כדי לרכוש נכס בדובאי?",
        "answer": "לא. מי שאינם תושבים יכולים לרכוש נכס בדובאי, להחזיק בו ולהשכיר אותו ללא כל אשרה של איחוד האמירויות. אשרת תושבות אינה נדרשת לצורך הרכישה. אם ההשקעה שלכם היא AED 750,000 ומעלה אתם זכאים לאשרת משקיע ל-2 שנים; AED 2,000,000 ומעלה מזכים אתכם ב-Golden Visa של איחוד האמירויות ל-10 שנים."
      },
      {
        "question": "מהן העלויות הכוללות ברכישת נכס בדובאי?",
        "answer": "אגרת העברה ל-DLD: 4% ממחיר הרכישה. עמלת סוכן: בדרך כלל 2%. דמי ניהול ל-DLD: AED 580. אגרת משרד הנאמן: AED 4,000 (לנכסים מעל AED 500K). אגרת רישום משכנתה (אם רלוונטי): 0.25% מגובה ההלוואה. סך עלויות העסקה הוא כ-6-7% ממחיר הרכישה."
      },
      {
        "question": "האם אוכל לקבל משכנתה בדובאי כמי שאינו תושב?",
        "answer": "כן. בנקים באיחוד האמירויות מציעים משכנתאות למי שאינם תושבים, בדרך כלל ביחס מימון (LTV) של 40-50% (אתם משלמים 50-60% במזומן). מסמכי ההכנסה ממדינת המוצא שלכם, דפי החשבון והיסטוריית האשראי נבחנים. בנקים בינלאומיים גדולים באיחוד האמירויות (HSBC, Emirates NBD, Mashreq, Citibank) מעניקים אשראי באופן פעיל לרוכשים זרים. אישור מקדים אורך 2-4 שבועות."
      },
      {
        "question": "האם קיים מס כלשהו על הכנסות שכירות או על רווחי הון בדובאי?",
        "answer": "לא. דובאי גובה אפס מס הכנסה, אפס מס רווחי הון ואפס מס ירושה על נכסים. הכנסות שכירות פטורות לחלוטין ממס ברמת איחוד האמירויות. ייתכן שמדינת המוצא שלכם תמסה הכנסות שכירות או רווחים ממקור זר, ראו את סעיף המס הספציפי ללאום למעלה, והיוועצו ביועץ מס לגבי מצבכם הספציפי."
      }
    ],
    "ctaTitle": "מוכנים לרכוש בדובאי?",
    "ctaDesc": "סוכני Binayah המוסמכים מטעם RERA עובדים מדי יום עם רוכשים מכל הלאומים. אנו מטפלים בחיפוש הנכס, בסיורים, בתיאום המשפטי ובניהול שלאחר הרכישה.",
    "ctaBtn": "צרו קשר עם הצוות שלנו",
    "ctaBtnSecondary": "עיינו בנכסים",
    "breadcrumbs": {
      "home": "בית",
      "guides": "מדריכים"
    }
  },
  en: {
    heroLabel: "FOREIGN BUYER GUIDE",
    guideSuffix: "Citizen",
    guideFor: "Guide for",
    buyers: "Buyers",
    introBadge: "Buying Property in Dubai",

    statsLabels: {
      tax: "Capital Gains Tax",
      ownership: "Freehold Ownership",
      visa: "Golden Visa Threshold",
      yield: "Typical Gross Yield",
    },
    statsValues: {
      tax: "0%",
      ownership: "All Nationalities",
      visa: "AED 2M",
      yield: "5-8%",
    },

    stepsHeading: "How to Buy Property in Dubai",
    stepsSubheading: "The standard 5-step purchase process applies to all nationalities, including non-residents.",
    steps: [
      { n: "01", title: "Agree Price & Sign MOU", body: "Negotiate and sign a Memorandum of Understanding (MOU / Form F) with the seller. Your agent files this with the Dubai Land Department." },
      { n: "02", title: "Pay 10% Security Deposit", body: "A 10% deposit (held in trust or with the real estate agency) is paid upon signing the MOU. This secures the property and is forfeited if you pull out." },
      { n: "03", title: "Obtain NOC from Developer", body: "The developer issues a No Objection Certificate (NOC) confirming no outstanding service charges or payments on the property. Typically 5-10 working days." },
      { n: "04", title: "DLD Transfer & Fees", body: "Both parties attend the DLD Trustee Office (or use an authorised power-of-attorney). Pay the 4% DLD transfer fee plus admin fees. The title deed is issued same day." },
      { n: "05", title: "Receive Title Deed", body: "The DLD issues a digital and physical title deed in your name. You are now the legal owner. Rental income from day one is entirely tax-free." },
    ],

    whyHeading: "Why Dubai for",
    legalHeading: "Legal Status & Ownership Rights",
    financeHeading: "Financing Options",
    taxHeading: "Tax Implications",
    repatHeading: "Repatriating Funds",
    areasHeading: "Preferred Areas",
    areasIntro: "Based on Binayah's transaction data, the communities most commonly chosen by",
    areasOutro: "buyers are:",
    areasCta: "Buy property in",

    faqHeading: "Frequently Asked Questions",
    faqs: [
      {
        question: "Can any nationality buy freehold property in Dubai?",
        answer: "Yes. All nationalities can purchase freehold property in Dubai's designated freehold zones, over 60 communities including Dubai Marina, Downtown Dubai, Palm Jumeirah, Business Bay, and JVC. There are no restrictions based on nationality, religion, or residency status. You receive a DLD title deed with full ownership rights.",
      },
      {
        question: "Do I need a UAE residency visa to buy property in Dubai?",
        answer: "No. Non-residents can buy, own, and rent out property in Dubai without any UAE visa. A residency visa is not required for purchase. If your investment is AED 750,000 or more you qualify for a 2-year investor visa; AED 2,000,000 or more qualifies you for the 10-year UAE Golden Visa.",
      },
      {
        question: "What are the total costs when buying property in Dubai?",
        answer: "DLD transfer fee: 4% of purchase price. Agent commission: typically 2%. DLD admin fee: AED 580. Trustee office fee: AED 4,000 (for properties over AED 500K). Mortgage registration fee (if applicable): 0.25% of loan value. Total transaction costs are approximately 6-7% of purchase price.",
      },
      {
        question: "Can I get a mortgage in Dubai as a non-resident?",
        answer: "Yes. UAE banks offer non-resident mortgages to foreign nationals, typically at 40-50% LTV (you pay 50-60% cash). Your home-country income documentation, bank statements, and credit history are assessed. Major international banks in the UAE (HSBC, Emirates NBD, Mashreq, Citibank) actively lend to foreign buyers. Pre-approval takes 2-4 weeks.",
      },
      {
        question: "Is there any tax on rental income or capital gains in Dubai?",
        answer: "No. Dubai levies zero income tax, zero capital gains tax, and zero inheritance tax on property. Rental income is entirely tax-free at the UAE level. Your home country may tax foreign-source rental income or gains, see the nationality-specific tax section above, and consult a tax adviser for your specific situation.",
      },
    ],

    ctaTitle: "Ready to Buy in Dubai?",
    ctaDesc: "Binayah's RERA-certified agents work with buyers from every nationality daily. We handle property search, viewings, legal coordination, and post-purchase management.",
    ctaBtn: "Contact Our Team",
    ctaBtnSecondary: "Browse Properties",

    breadcrumbs: {
      home: "Home",
      guides: "Guides",
    },
  },

  fr: {
    heroLabel: "GUIDE DE L'ACHETEUR ÉTRANGER",
    guideSuffix: "ressortissant",
    guideFor: "Guide pour",
    buyers: "acheteurs",
    introBadge: "Acheter un bien immobilier à Dubaï",

    statsLabels: {
      tax: "Impôt sur les plus-values",
      ownership: "Pleine propriété",
      visa: "Seuil du Golden Visa",
      yield: "Rendement locatif brut typique",
    },
    statsValues: {
      tax: "0%",
      ownership: "Toutes nationalités",
      visa: "2 M AED",
      yield: "5-8%",
    },

    stepsHeading: "Comment acheter un bien immobilier à Dubaï",
    stepsSubheading: "Le processus d'achat standard en 5 étapes s'applique à toutes les nationalités, y compris les non-résidents.",
    steps: [
      { n: "01", title: "Convenir du prix et signer le MOU", body: "Négociez et signez un protocole d'accord (MOU / Form F) avec le vendeur. Votre agent le dépose auprès du Dubai Land Department." },
      { n: "02", title: "Verser un acompte de garantie de 10%", body: "Un acompte de 10% (conservé en fiducie ou par l'agence immobilière) est versé à la signature du MOU. Il sécurise le bien et est perdu si vous vous rétractez." },
      { n: "03", title: "Obtenir le NOC du promoteur", body: "Le promoteur délivre un certificat de non-objection (NOC) confirmant l'absence de charges de copropriété ou de paiements en souffrance sur le bien. Généralement 5 à 10 jours ouvrés." },
      { n: "04", title: "Transfert au DLD et frais", body: "Les deux parties se présentent au bureau du fiduciaire du DLD (ou recourent à une procuration autorisée). Payez les frais de transfert du DLD de 4% plus les frais administratifs. Le titre de propriété est délivré le jour même." },
      { n: "05", title: "Recevoir le titre de propriété", body: "Le DLD délivre un titre de propriété numérique et physique à votre nom. Vous êtes désormais le propriétaire légal. Les revenus locatifs sont entièrement exonérés d'impôt dès le premier jour." },
    ],

    whyHeading: "Pourquoi Dubaï pour",
    legalHeading: "Statut juridique et droits de propriété",
    financeHeading: "Options de financement",
    taxHeading: "Implications fiscales",
    repatHeading: "Rapatriement des fonds",
    areasHeading: "Quartiers privilégiés",
    areasIntro: "D'après les données de transactions de Binayah, les communautés les plus souvent choisies par les acheteurs",
    areasOutro: "sont :",
    areasCta: "Acheter un bien à",

    faqHeading: "Questions fréquentes",
    faqs: [
      {
        question: "Toute nationalité peut-elle acheter un bien en pleine propriété à Dubaï ?",
        answer: "Oui. Toutes les nationalités peuvent acquérir des biens en pleine propriété dans les zones de pleine propriété désignées de Dubaï, plus de 60 communautés dont Dubai Marina, Downtown Dubai, Palm Jumeirah, Business Bay et JVC. Il n'existe aucune restriction fondée sur la nationalité, la religion ou le statut de résidence. Vous recevez un titre de propriété du DLD conférant des droits de propriété complets.",
      },
      {
        question: "Ai-je besoin d'un visa de résidence aux Émirats pour acheter un bien à Dubaï ?",
        answer: "Non. Les non-résidents peuvent acheter, détenir et louer un bien à Dubaï sans aucun visa des Émirats. Un visa de résidence n'est pas requis pour l'achat. Si votre investissement atteint 750 000 AED ou plus, vous êtes éligible à un visa investisseur de 2 ans ; à partir de 2 000 000 AED, vous êtes éligible au Golden Visa des Émirats de 10 ans.",
      },
      {
        question: "Quels sont les coûts totaux lors de l'achat d'un bien à Dubaï ?",
        answer: "Frais de transfert du DLD : 4% du prix d'achat. Commission d'agence : généralement 2%. Frais administratifs du DLD : 580 AED. Frais du bureau du fiduciaire : 4 000 AED (pour les biens de plus de 500K AED). Frais d'enregistrement de l'hypothèque (le cas échéant) : 0,25% du montant du prêt. Les coûts totaux de transaction représentent environ 6 à 7% du prix d'achat.",
      },
      {
        question: "Puis-je obtenir un prêt immobilier à Dubaï en tant que non-résident ?",
        answer: "Oui. Les banques des Émirats proposent des prêts immobiliers aux non-résidents, généralement à un ratio prêt/valeur (LTV) de 40 à 50% (vous payez 50 à 60% en liquide). Vos justificatifs de revenus du pays d'origine, vos relevés bancaires et votre historique de crédit sont évalués. Les grandes banques internationales des Émirats (HSBC, Emirates NBD, Mashreq, Citibank) prêtent activement aux acheteurs étrangers. L'accord de principe prend 2 à 4 semaines.",
      },
      {
        question: "Existe-t-il un impôt sur les revenus locatifs ou les plus-values à Dubaï ?",
        answer: "Non. Dubaï ne prélève aucun impôt sur le revenu, aucun impôt sur les plus-values et aucun droit de succession sur les biens immobiliers. Les revenus locatifs sont entièrement exonérés d'impôt au niveau des Émirats. Votre pays d'origine peut imposer les revenus locatifs ou les plus-values de source étrangère, consultez la section fiscale spécifique à la nationalité ci-dessus et faites appel à un conseiller fiscal pour votre situation particulière.",
      },
    ],

    ctaTitle: "Prêt à acheter à Dubaï ?",
    ctaDesc: "Les agents de Binayah certifiés RERA travaillent chaque jour avec des acheteurs de toutes les nationalités. Nous prenons en charge la recherche de biens, les visites, la coordination juridique et la gestion après l'achat.",
    ctaBtn: "Contactez notre équipe",
    ctaBtnSecondary: "Parcourir les biens",

    breadcrumbs: {
      home: "Accueil",
      guides: "Guides",
    },
  },

  ru: {
    heroLabel: "РУКОВОДСТВО ДЛЯ ИНОСТРАННЫХ ПОКУПАТЕЛЕЙ",
    guideSuffix: "гражданин",
    guideFor: "Руководство для",
    buyers: "покупателей",
    introBadge: "Покупка недвижимости в Дубае",

    statsLabels: {
      tax: "Налог на прирост капитала",
      ownership: "Право собственности",
      visa: "Золотая виза от",
      yield: "Типичная доходность",
    },
    statsValues: {
      tax: "0%",
      ownership: "Все национальности",
      visa: "2М AED",
      yield: "5-8%",
    },

    stepsHeading: "Как купить недвижимость в Дубае",
    stepsSubheading: "Стандартный 5-шаговый процесс покупки применяется ко всем национальностям, включая нерезидентов.",
    steps: [
      { n: "01", title: "Согласование цены и подписание MOU", body: "Согласуйте и подпишите меморандум о намерениях (MOU / форма F) с продавцом. Агент регистрирует документ в Земельном департаменте Дубая (DLD)." },
      { n: "02", title: "Оплата 10% задатка", body: "При подписании MOU вносится 10% задатка (хранится у агента или в трасте). Задаток фиксирует объект и теряется в случае отказа покупателя." },
      { n: "03", title: "Получение NOC от застройщика", body: "Застройщик выдаёт Сертификат об отсутствии возражений (NOC), подтверждающий отсутствие задолженностей. Обычно занимает 5-10 рабочих дней." },
      { n: "04", title: "Передача прав в DLD и оплата сборов", body: "Обе стороны присутствуют в офисе доверенного лица DLD (или действуют через нотариальную доверенность). Оплачивается 4% сбор DLD плюс административные сборы. Свидетельство о праве собственности выдаётся в тот же день." },
      { n: "05", title: "Получение свидетельства о праве собственности", body: "DLD выдаёт цифровое и физическое свидетельство на ваше имя. С первого дня доход от аренды полностью освобождён от налогов на уровне ОАЭ." },
    ],

    whyHeading: "Почему Дубай для",
    legalHeading: "Правовой статус и права собственности",
    financeHeading: "Варианты финансирования",
    taxHeading: "Налоговые последствия",
    repatHeading: "Репатриация средств",
    areasHeading: "Предпочтительные районы",
    areasIntro: "По данным транзакций Binayah, наиболее популярные районы среди",
    areasOutro: "покупателей:",
    areasCta: "Купить недвижимость в",

    faqHeading: "Часто задаваемые вопросы",
    faqs: [
      {
        question: "Могут ли иностранцы любой национальности купить фрихолд-недвижимость в Дубае?",
        answer: "Да. Все национальности могут приобретать недвижимость в свободное владение в специально отведённых фрихолд-зонах Дубая, более 60 сообществ, включая Дубай Марина, Даунтаун Дубай, Пальм Джумейра, Бизнес-Бей и JVC. Ограничений по гражданству, религии или статусу резидента нет. Вы получаете официальное свидетельство DLD с полными правами собственности.",
      },
      {
        question: "Нужна ли виза резидента ОАЭ для покупки недвижимости в Дубае?",
        answer: "Нет. Нерезиденты могут покупать, владеть и сдавать недвижимость в Дубае без визы ОАЭ. Виза не требуется для совершения сделки. При инвестиции от 750 000 AED вы получаете 2-летнюю инвесторскую визу; от 2 000 000 AED, 10-летнюю Золотую визу ОАЭ.",
      },
      {
        question: "Каковы полные затраты при покупке недвижимости в Дубае?",
        answer: "Сбор DLD за передачу: 4% от стоимости. Комиссия агента: около 2%. Административный сбор DLD: 580 AED. Сбор доверенного офиса: 4 000 AED (для объектов свыше 500K AED). Регистрация ипотеки (при наличии): 0,25% от суммы кредита. Итого транзакционные расходы составляют около 6-7% от стоимости.",
      },
      {
        question: "Могу ли я получить ипотеку в Дубае как нерезидент?",
        answer: "Да. Банки ОАЭ предоставляют ипотеку нерезидентам, как правило при LTV 40-50% (вы оплачиваете 50-60% наличными). Оцениваются доходные документы, выписки со счетов и кредитная история вашей страны. Крупные международные банки в ОАЭ (HSBC, Emirates NBD, Mashreq, Citibank) активно кредитуют иностранных покупателей. Предварительное одобрение занимает 2-4 недели.",
      },
      {
        question: "Облагается ли налогом доход от аренды или прирост капитала в Дубае?",
        answer: "Нет. В Дубае нет налога на доходы физических лиц, налога на прирост капитала и налога на наследство. Доход от аренды полностью освобождён от налогов на уровне ОАЭ. Ваша страна проживания может облагать налогом иностранный доход от аренды или прирост, см. раздел о налоговых последствиях выше и проконсультируйтесь с налоговым консультантом.",
      },
    ],

    ctaTitle: "Готовы купить в Дубае?",
    ctaDesc: "Сертифицированные агенты RERA компании Binayah ежедневно работают с покупателями всех национальностей. Мы берём на себя поиск объектов, просмотры, юридическое сопровождение и управление после покупки.",
    ctaBtn: "Связаться с нашей командой",
    ctaBtnSecondary: "Просмотреть объекты",

    breadcrumbs: {
      home: "Главная",
      guides: "Гайды",
    },
  },

  ar: {
    heroLabel: "دليل المشتري الأجنبي",
    guideSuffix: "مواطن",
    guideFor: "دليل",
    buyers: "المشترين",
    introBadge: "شراء عقار في دبي",

    statsLabels: {
      tax: "ضريبة أرباح رأس المال",
      ownership: "حق التملك الحر",
      visa: "الحد الأدنى للتأشيرة الذهبية",
      yield: "عائد الإيجار المعتاد",
    },
    statsValues: {
      tax: "0%",
      ownership: "جميع الجنسيات",
      visa: "2 مليون درهم",
      yield: "5-8%",
    },

    stepsHeading: "كيفية شراء عقار في دبي",
    stepsSubheading: "تنطبق عملية الشراء المعيارية من 5 خطوات على جميع الجنسيات، بما فيها غير المقيمين.",
    steps: [
      { n: "٠١", title: "الاتفاق على السعر وتوقيع MOU", body: "تفاوض ووقّع على مذكرة التفاهم (MOU / نموذج F) مع البائع. يقدّم وكيلك هذه المذكرة إلى دائرة الأراضي والأملاك في دبي." },
      { n: "٠٢", title: "دفع عربون 10%", body: "يُدفع عربون 10% عند توقيع MOU (يُحفظ لدى الوكالة أو في حساب ائتماني). يضمن العربون الحجز ويُفقد في حال تراجع المشتري." },
      { n: "٠٣", title: "الحصول على عدم ممانعة من المطوّر", body: "يُصدر المطوّر شهادة عدم ممانعة (NOC) تؤكد خلوّ العقار من أي مستحقات أو رسوم. تستغرق عادةً 5-10 أيام عمل." },
      { n: "٠٤", title: "نقل الملكية عبر DLD وسداد الرسوم", body: "يحضر الطرفان إلى مكتب الأمين المعتمد لـDLD (أو يُنيبان محامياً بالتوكيل الرسمي). يُسدَّد رسم نقل 4% إضافةً إلى الرسوم الإدارية. يُصدر سند الملكية في نفس اليوم." },
      { n: "٠٥", title: "استلام سند الملكية", body: "تُصدر DLD سند ملكية رقمياً وورقياً باسمك. أنت الآن المالك القانوني. دخل الإيجار معفى تماماً من الضرائب اعتباراً من اليوم الأول." },
    ],

    whyHeading: "لماذا دبي لـ",
    legalHeading: "الوضع القانوني وحقوق الملكية",
    financeHeading: "خيارات التمويل",
    taxHeading: "الانعكاسات الضريبية",
    repatHeading: "إعادة الأموال إلى الوطن",
    areasHeading: "المناطق المفضلة",
    areasIntro: "استناداً إلى بيانات معاملات بناية، أكثر المجتمعات التي يختارها",
    areasOutro: "المشترون:",
    areasCta: "شراء عقار في",

    faqHeading: "الأسئلة الشائعة",
    faqs: [
      {
        question: "هل يمكن لأي جنسية شراء عقار تملّك حر في دبي؟",
        answer: "نعم. يحق لجميع الجنسيات شراء عقارات تملّك حر في المناطق المخصصة بدبي, أكثر من 60 مجتمعاً تشمل دبي مارينا ووسط المدينة والنخلة جميرا والخليج التجاري وJVC. لا توجد قيود على أساس الجنسية أو الدين أو وضع الإقامة. تحصل على سند ملكية DLD رسمي مع كامل حقوق الملكية.",
      },
      {
        question: "هل أحتاج إلى تأشيرة إقامة إماراتية لشراء عقار في دبي؟",
        answer: "لا. يمكن لغير المقيمين شراء العقارات وتملّكها وتأجيرها في دبي دون أي تأشيرة إماراتية. لا تُشترط تأشيرة الإقامة لإتمام الشراء. إذا كان استثمارك 750,000 درهم أو أكثر، تحصل على تأشيرة مستثمر لمدة سنتين؛ ومن 2,000,000 درهم فأكثر، تحصل على التأشيرة الذهبية الإماراتية لمدة 10 سنوات.",
      },
      {
        question: "ما التكاليف الإجمالية عند شراء عقار في دبي؟",
        answer: "رسوم نقل DLD: 4% من سعر الشراء. عمولة الوكيل: عادةً 2%. الرسوم الإدارية لـDLD: 580 درهماً. رسوم مكتب الأمين: 4,000 درهم (للعقارات التي تتجاوز 500,000 درهم). رسوم تسجيل الرهن العقاري (إن وُجد): 0.25% من قيمة القرض. تبلغ إجمالي تكاليف المعاملة نحو 6-7% من سعر الشراء.",
      },
      {
        question: "هل يمكنني الحصول على رهن عقاري في دبي بوصفي غير مقيم؟",
        answer: "نعم. تمنح البنوك الإماراتية رهوناً عقارية لغير المقيمين، وعادةً بنسبة تمويل 40-50% (تدفع 50-60% نقداً). تُقيَّم وثائق الدخل وكشوف الحساب البنكي والتاريخ الائتماني في بلدك. البنوك الدولية الكبرى في الإمارات (HSBC وإمارات NBD وماشريق وسيتي بنك) تُقرض المشترين الأجانب بنشاط. يستغرق الموافقة المسبقة 2-4 أسابيع.",
      },
      {
        question: "هل يوجد ضريبة على دخل الإيجار أو أرباح رأس المال في دبي؟",
        answer: "لا. لا تفرض دبي أي ضريبة دخل أو ضريبة على أرباح رأس المال أو ضريبة ميراث على العقارات. دخل الإيجار معفى تماماً على المستوى الإماراتي. قد تفرض دولتك ضريبةً على دخل الإيجار الأجنبي أو الأرباح, راجع قسم الانعكاسات الضريبية أعلاه واستشر مستشاراً ضريبياً.",
      },
    ],

    ctaTitle: "مستعد للشراء في دبي؟",
    ctaDesc: "يعمل وكلاء بناية المعتمدون من RERA يومياً مع مشترين من جميع الجنسيات. نتولى البحث عن العقار والمعاينات والتنسيق القانوني وإدارة العقار بعد الشراء.",
    ctaBtn: "تواصل مع فريقنا",
    ctaBtnSecondary: "تصفح العقارات",

    breadcrumbs: {
      home: "الرئيسية",
      guides: "الأدلة",
    },
  },

  zh: {
    heroLabel: "外国买家指南",
    guideSuffix: "公民",
    guideFor: "指南",
    buyers: "买家",
    introBadge: "在迪拜购买房产",

    statsLabels: {
      tax: "资本利得税",
      ownership: "自由持有产权",
      visa: "黄金签证门槛",
      yield: "典型租金回报率",
    },
    statsValues: {
      tax: "0%",
      ownership: "所有国籍均可",
      visa: "200万迪拉姆",
      yield: "5-8%",
    },

    stepsHeading: "如何在迪拜购买房产",
    stepsSubheading: "标准5步购房流程适用于所有国籍，包括非居民。",
    steps: [
      { n: "01", title: "议价并签署MOU", body: "与卖方协商并签署意向备忘录（MOU / F表格）。您的经纪人将此文件提交迪拜土地局（DLD）。" },
      { n: "02", title: "支付10%定金", body: "签署MOU时支付10%定金（由经纪公司或信托账户持有）。定金锁定房产，买方反悔则予以没收。" },
      { n: "03", title: "获取开发商NOC", body: "开发商签发无异议证书（NOC），确认房产无未缴服务费或欠款。通常需要5-10个工作日。" },
      { n: "04", title: "DLD过户并缴纳费用", body: "双方前往DLD受托人办公室（或通过公证授权书办理）。缴纳4%过户费及行政费用。产权证书当日签发。" },
      { n: "05", title: "领取产权证书", body: "DLD以您的名义签发电子和纸质产权证书。您现在是合法业主。迪拜层面的租金收入从第一天起完全免税。" },
    ],

    whyHeading: "迪拜为何吸引",
    legalHeading: "法律地位与产权",
    financeHeading: "融资选择",
    taxHeading: "税务影响",
    repatHeading: "资金汇回",
    areasHeading: "热门区域",
    areasIntro: "根据Binayah的交易数据，",
    areasOutro: "买家最常选择的社区为：",
    areasCta: "购买房产, ",

    faqHeading: "常见问题",
    faqs: [
      {
        question: "任何国籍都可以在迪拜购买自由持有房产吗？",
        answer: "可以。所有国籍均可在迪拜指定的自由持有区购买房产, , 超过60个社区，包括迪拜Marina、市中心、棕榈岛、商业湾和JVC。没有基于国籍、宗教或居住身份的限制。您将获得DLD官方产权证书，享有完整所有权。",
      },
      {
        question: "购买迪拜房产需要阿联酋居留签证吗？",
        answer: "不需要。非居民无需任何阿联酋签证即可在迪拜购买、持有和出租房产。购房不需要居留签证。投资75万迪拉姆及以上可申请2年投资者签证；200万迪拉姆及以上可申请10年阿联酋黄金签证。",
      },
      {
        question: "在迪拜购房的总费用是多少？",
        answer: "DLD过户费：购买价的4%。中介佣金：通常为2%。DLD行政费：580迪拉姆。受托人办公室费用：4,000迪拉姆（价值超过50万迪拉姆的房产）。按揭登记费（如适用）：贷款额的0.25%。交易总成本约为购买价的6-7%。",
      },
      {
        question: "作为非居民，我能在迪拜获得按揭贷款吗？",
        answer: "可以。阿联酋银行向非居民提供按揭贷款，通常贷款价值比（LTV）为40-50%（您需支付50-60%现金）。银行会评估您的母国收入证明、银行流水和信用记录。阿联酋主要国际银行（汇丰、阿联酋国民银行、马士里格银行、花旗银行）均积极为外国买家提供贷款。预批通常需2-4周。",
      },
      {
        question: "迪拜征收租金收入税或资本利得税吗？",
        answer: "不征收。迪拜不征收所得税、资本利得税和遗产税。在阿联酋层面，租金收入完全免税。您的母国可能对境外租金收入或收益征税, , 请参阅上方特定国籍税务部分，并咨询税务顾问了解您的具体情况。",
      },
    ],

    ctaTitle: "准备好在迪拜购房了吗？",
    ctaDesc: "Binayah的RERA认证经纪人每天为来自各国的买家提供服务。我们负责房产搜索、看房、法律协调及购后物业管理。",
    ctaBtn: "联系我们的团队",
    ctaBtnSecondary: "浏览房产",

    breadcrumbs: {
      home: "首页",
      guides: "指南",
    },
  },

  vi: {
    heroLabel: "HƯỚNG DẪN CHO NGƯỜI MUA NƯỚC NGOÀI",
    guideSuffix: "công dân",
    guideFor: "Hướng dẫn cho",
    buyers: "người mua",
    introBadge: "Mua bất động sản tại Dubai",

    statsLabels: {
      tax: "Thuế lãi vốn",
      ownership: "Sở hữu vĩnh viễn",
      visa: "Ngưỡng Golden Visa",
      yield: "Lợi suất gộp điển hình",
    },
    statsValues: {
      tax: "0%",
      ownership: "Mọi quốc tịch",
      visa: "2 triệu AED",
      yield: "5-8%",
    },

    stepsHeading: "Cách mua bất động sản tại Dubai",
    stepsSubheading: "Quy trình mua tiêu chuẩn 5 bước áp dụng cho mọi quốc tịch, bao gồm cả người không cư trú.",
    steps: [
      { n: "01", title: "Thỏa thuận giá & Ký MOU", body: "Đàm phán và ký Bản ghi nhớ (MOU / Form F) với người bán. Chuyên viên của bạn nộp văn bản này cho Sở Đất đai Dubai." },
      { n: "02", title: "Trả 10% đặt cọc", body: "Khoản đặt cọc 10% (được giữ ủy thác hoặc tại công ty môi giới) được trả khi ký MOU. Điều này giữ chỗ bất động sản và sẽ mất nếu bạn rút lui." },
      { n: "03", title: "Lấy NOC từ chủ đầu tư", body: "Chủ đầu tư cấp Chứng nhận Không phản đối (NOC) xác nhận không còn phí dịch vụ hoặc khoản thanh toán nào trên bất động sản. Thường 5-10 ngày làm việc." },
      { n: "04", title: "Chuyển nhượng DLD & Phí", body: "Cả hai bên đến Văn phòng Ủy thác DLD (hoặc dùng giấy ủy quyền hợp pháp). Trả phí chuyển nhượng DLD 4% cộng phí quản lý. Sổ đỏ được cấp trong ngày." },
      { n: "05", title: "Nhận sổ đỏ", body: "DLD cấp sổ đỏ điện tử và bản giấy mang tên bạn. Bạn nay là chủ sở hữu hợp pháp. Thu nhập cho thuê từ ngày đầu tiên hoàn toàn miễn thuế." },
    ],

    whyHeading: "Vì sao chọn Dubai cho",
    legalHeading: "Tình trạng pháp lý & Quyền sở hữu",
    financeHeading: "Lựa chọn tài chính",
    taxHeading: "Tác động thuế",
    repatHeading: "Hồi hương vốn",
    areasHeading: "Khu vực ưa thích",
    areasIntro: "Dựa trên dữ liệu giao dịch của Binayah, các khu vực được lựa chọn nhiều nhất bởi người mua",
    areasOutro: "là:",
    areasCta: "Mua bất động sản tại",

    faqHeading: "Câu hỏi thường gặp",
    faqs: [
      {
        question: "Bất kỳ quốc tịch nào cũng có thể mua bất động sản sở hữu vĩnh viễn tại Dubai không?",
        answer: "Có. Mọi quốc tịch đều có thể mua bất động sản freehold tại các khu freehold được chỉ định của Dubai, hơn 60 khu vực bao gồm Dubai Marina, Downtown Dubai, Palm Jumeirah, Business Bay và JVC. Không có hạn chế dựa trên quốc tịch, tôn giáo hay tình trạng cư trú. Bạn nhận sổ đỏ DLD với quyền sở hữu đầy đủ.",
      },
      {
        question: "Tôi có cần thị thực cư trú UAE để mua bất động sản tại Dubai không?",
        answer: "Không. Người không cư trú có thể mua, sở hữu và cho thuê bất động sản tại Dubai mà không cần bất kỳ thị thực UAE nào. Không cần thị thực cư trú để mua. Nếu khoản đầu tư của bạn từ 750.000 AED trở lên, bạn đủ điều kiện nhận thị thực nhà đầu tư 2 năm; từ 2.000.000 AED trở lên, bạn đủ điều kiện nhận Golden Visa UAE 10 năm.",
      },
      {
        question: "Tổng chi phí khi mua bất động sản tại Dubai là gì?",
        answer: "Phí chuyển nhượng DLD: 4% giá mua. Hoa hồng môi giới: thường 2%. Phí quản lý DLD: 580 AED. Phí văn phòng ủy thác: 4.000 AED (cho bất động sản trên 500K AED). Phí đăng ký vay thế chấp (nếu có): 0,25% giá trị khoản vay. Tổng chi phí giao dịch khoảng 6-7% giá mua.",
      },
      {
        question: "Tôi có thể vay thế chấp tại Dubai với tư cách người không cư trú không?",
        answer: "Có. Các ngân hàng UAE cung cấp vay thế chấp cho người không cư trú, thường ở mức LTV 40-50% (bạn trả 50-60% tiền mặt). Tài liệu thu nhập, sao kê ngân hàng và lịch sử tín dụng tại quốc gia của bạn được đánh giá. Các ngân hàng quốc tế lớn tại UAE (HSBC, Emirates NBD, Mashreq, Citibank) tích cực cho người mua nước ngoài vay. Phê duyệt trước mất 2-4 tuần.",
      },
      {
        question: "Có thuế nào trên thu nhập cho thuê hoặc lãi vốn tại Dubai không?",
        answer: "Không. Dubai áp dụng 0 thuế thu nhập, 0 thuế lãi vốn và 0 thuế thừa kế trên bất động sản. Thu nhập cho thuê hoàn toàn miễn thuế ở cấp độ UAE. Quốc gia của bạn có thể đánh thuế thu nhập cho thuê hoặc lãi từ nguồn nước ngoài, xem phần thuế theo quốc tịch ở trên và tham khảo cố vấn thuế cho tình huống cụ thể của bạn.",
      },
    ],

    ctaTitle: "Sẵn sàng mua tại Dubai?",
    ctaDesc: "Các chuyên viên được chứng nhận RERA của Binayah làm việc với người mua từ mọi quốc tịch hàng ngày. Chúng tôi xử lý tìm kiếm bất động sản, xem nhà, phối hợp pháp lý và quản lý sau khi mua.",
    ctaBtn: "Liên hệ đội ngũ của chúng tôi",
    ctaBtnSecondary: "Xem bất động sản",

    breadcrumbs: {
      home: "Trang chủ",
      guides: "Hướng dẫn",
    },
  },
} as const;

type Locale = keyof typeof CONTENT;

// ── Metadata ───────────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; citizen: string }>;
}): Promise<Metadata> {
  const { citizen, locale } = await params;
  const b = findForeignBuyer(citizen);
  if (!b) return {};

  const isRu = locale === "ru";
  const isAr = locale === "ar"; // ar, he are rtl; vi, zh, ru, en are ltr
  const isZh = locale === "zh";
  const isVi = locale === "vi";
  const isHe = locale === "he";
  const isFr = locale === "fr";

  const title = isRu
    ? `Покупка недвижимости в Дубае для граждан ${b.country === "Russian" ? "России" : b.country} | Binayah`
    : isAr
    ? `شراء عقار في دبي للمواطنين ${b.flag} | بناية للعقارات`
    : isZh
    ? `${b.flag} ${b.citizen}公民在迪拜购房指南 | Binayah`
    : isVi
    ? `Mua bất động sản tại Dubai cho công dân ${b.citizen} ${b.flag} | Hướng dẫn đầy đủ | Binayah`
    : isHe
    ? `קניית נדל"ן בדובאי לאזרחי ${b.citizen} ${b.flag} | מדריך מלא | Binayah`
    : isFr
    ? `Acheter un bien immobilier à Dubaï en tant que ressortissant ${b.citizen} ${b.flag} | Guide complet | Binayah`
    : `Buying Property in Dubai as a ${b.citizen} Citizen ${b.flag} | Complete Guide | Binayah`;

  const description = isRu
    ? `Полное руководство для граждан по покупке недвижимости в Дубае: правовой статус, финансирование, налоги, репатриация средств и предпочтительные районы.`
    : isAr
    ? `الدليل الشامل لشراء عقار في دبي: الوضع القانوني وخيارات التمويل والضرائب وإعادة الأموال والمناطق المفضلة.`
    : isZh
    ? `在迪拜购房的完整指南：法律地位、融资选择、税务影响、资金汇回及热门区域。`
    : isVi
    ? `Hướng dẫn đầy đủ cho công dân ${b.citizen} mua bất động sản tại Dubai: tình trạng pháp lý, lựa chọn tài chính, tác động thuế, quy tắc hồi hương vốn và khu vực ưa thích.`
    : isHe
    ? `מדריך מלא לאזרחי ${b.citizen} לרכישת נדל"ן בדובאי: מעמד משפטי, אפשרויות מימון, השלכות מס, כללי החזרת הון ושכונות מועדפות.`
    : isFr
    ? `Guide complet pour les ressortissants ${b.citizen} qui achètent un bien immobilier à Dubaï : statut juridique, options de financement, implications fiscales, règles de rapatriement et communautés privilégiées.`
    : `Complete guide for ${b.citizen} citizens buying property in Dubai: legal status, financing options, tax implications, repatriation rules, and preferred communities.`;

  const path = `/buying-property-in-dubai-as/${b.slug}`;
  return {
    title,
    description,
    alternates: {
      canonical: makeCanonical(locale, path),
      languages: altLangs(path),
    },
    openGraph: {
      title,
      description,
      type: "article",
      url: makeCanonical(locale, path),
      locale: OG_LOCALE[locale] ?? "en_AE",
      images: [{ url: `${AE_URL}/assets/og-image.webp`, width: 1200, height: 630 }],
    },
    keywords:
      locale === "ru"
        ? [`купить недвижимость дубай ${b.country}`, "недвижимость дубай иностранцы", "покупка квартиры дубай нерезидент"]
        : locale === "ar" // vi branch below
        ? ["شراء عقار دبي أجانب", "تملك حر دبي", "عقارات دبي للمقيمين خارجها"]
        : locale === "zh"
        ? ["迪拜外国人购房", "迪拜自由持有房产", "迪拜黄金签证购房"]
        : locale === "vi"
        ? ["mua bất động sản dubai người nước ngoài", "bất động sản dubai freehold", "mua nhà dubai golden visa"]
        : locale === "he"
        ? ["קניית נדל\"ן בדובאי לזרים", "נדל\"ן freehold בדובאי", "קניית דירה בדובאי גולדן ויזה"]
        : locale === "fr"
        ? ["acheter un bien immobilier à dubaï étranger", "immobilier dubaï pleine propriété", "acheter un appartement à dubaï golden visa"]
        : [
            `buying property in dubai as ${b.citizen.toLowerCase()} citizen`,
            `dubai real estate ${b.citizen.toLowerCase()} buyer`,
            `${b.citizen.toLowerCase()} invest dubai property`,
            "foreign buyer dubai freehold",
            "dubai property non resident",
          ],
  };
}

// ── Page ───────────────────────────────────────────────────────────────────
export default async function ForeignBuyerPage({
  params,
}: {
  params: Promise<{ locale: string; citizen: string }>;
}) {
  const { locale, citizen } = await params;
  const b = findForeignBuyer(citizen);
  if (!b) notFound();

  const c = CONTENT[(locale as Locale)] ?? CONTENT.en;
  const isRtl = locale === "ar" || locale === "he"; // ar, he are rtl; vi, zh, ru, en are ltr
  const lp = locale === "en" ? "" : `/${locale}`;

  const breadcrumbs = [
    { name: c.breadcrumbs.home, href: `${lp}/` },
    { name: c.breadcrumbs.guides, href: `${lp}/pulse/guides` },
    { name: `${b.citizen} ${c.guideSuffix}`, href: `${lp}/buying-property-in-dubai-as/${b.slug}` },
  ];

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? "rtl" : "ltr"}>
      <FAQJsonLd faqs={[...c.faqs]} />
      <BreadcrumbJsonLd items={breadcrumbs} />
      <Navbar />

      {/* ── Hero ── */}
      <section
        className="relative overflow-hidden pt-20 sm:pt-28 pb-10 sm:pb-14 text-white"
        style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
      >
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6">
          <p className="text-accent font-bold tracking-[0.4em] uppercase text-xs mb-4">
            <span className="mr-2 text-base">{b.flag}</span>
            {c.heroLabel}
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-4">
            {c.introBadge}{" "}
            <span className="font-light text-primary-foreground/70">
              {locale === "en"
                ? `as a ${b.citizen} Citizen`
                : locale === "ru"
                ? `для граждан ${b.country === "Russian" ? "России" : b.country}`
                : locale === "ar" // vi branch below
                ? `للمواطنين ${b.flag}`
                : locale === "vi"
                ? `cho công dân ${b.citizen}`
                : locale === "he"
                ? `לאזרחי ${b.citizen}`
                : locale === "fr"
                ? `en tant que ressortissant ${b.citizen}`
                : `, ${b.citizen}${c.guideSuffix}`}
            </span>
          </h1>
          <p className="text-primary-foreground/80 text-sm sm:text-base leading-relaxed max-w-3xl">
            {localizeBuyerText(b.intro, locale)}
          </p>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="border-b border-border/50 bg-card">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-border/40">
            {(
              [
                { val: c.statsValues.tax, label: c.statsLabels.tax },
                { val: c.statsValues.ownership, label: c.statsLabels.ownership },
                { val: c.statsValues.visa, label: c.statsLabels.visa },
                { val: c.statsValues.yield, label: c.statsLabels.yield },
              ] as const
            ).map((s) => (
              <div key={s.label} className="py-4 sm:py-5 px-3 sm:px-6 text-center">
                <p className="text-lg sm:text-2xl font-black text-primary mb-0.5">{s.val}</p>
                <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wide leading-tight">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Body ── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-14">

        {/* Why Dubai for this nationality */}
        <section>
          <p className="text-accent font-bold tracking-[0.35em] uppercase text-xs mb-3">
            {c.whyHeading} {b.citizen} {c.buyers}
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
            {c.whyHeading} {b.citizen} {c.buyers}
          </h2>
          <p className="text-base text-foreground/80 leading-relaxed">{localizeBuyerText(b.whyDubai, locale)}</p>
        </section>

        {/* Buying steps */}
        <section>
          <p className="text-accent font-bold tracking-[0.35em] uppercase text-xs mb-3">
            {locale === "en" ? "STEP BY STEP" : locale === "ru" ? "ШАГ ЗА ШАГОМ" : locale === "ar" ? "خطوة بخطوة" : locale === "vi" ? "TỪNG BƯỚC" : locale === "fr" ? "ÉTAPE PAR ÉTAPE" : locale === "he" ? "שלב אחר שלב" : "步骤详解"}
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">{c.stepsHeading}</h2>
          <p className="text-sm text-muted-foreground mb-8">{c.stepsSubheading}</p>
          <div className="space-y-4">
            {c.steps.map((step) => (
              <div
                key={step.n}
                className="flex gap-4 sm:gap-6 bg-card border border-border/50 rounded-2xl p-4 sm:p-6"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-black text-white"
                  style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}>
                  {step.n}
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-sm sm:text-base mb-1">{step.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Legal status */}
        <section>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">{c.legalHeading}</h2>
          <p className="text-base text-foreground/80 leading-relaxed">{localizeBuyerText(b.legalStatus, locale)}</p>
        </section>

        {/* Financing */}
        <section>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
            {c.financeHeading}
          </h2>
          <p className="text-base text-foreground/80 leading-relaxed">{localizeBuyerText(b.financing, locale)}</p>
        </section>

        {/* Tax */}
        <section>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">{c.taxHeading}</h2>
          <p className="text-base text-foreground/80 leading-relaxed">{localizeBuyerText(b.taxImplications, locale)}</p>
        </section>

        {/* Repatriation */}
        <section>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">{c.repatHeading}</h2>
          <p className="text-base text-foreground/80 leading-relaxed">{localizeBuyerText(b.repatriation, locale)}</p>
        </section>

        {/* Preferred areas */}
        <section>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">{c.areasHeading}</h2>
          <p className="text-sm text-muted-foreground mb-5">
            {c.areasIntro} {b.citizen} {c.areasOutro}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {b.preferredAreas.map((area) => {
              const slug = area.toLowerCase().replace(/\s+/g, "-");
              return (
                <Link
                  key={area}
                  href={`${lp}/buy-property-in/${slug}`}
                  className="flex items-center justify-between bg-card border border-border/50 rounded-xl px-4 py-3 hover:border-primary/40 hover:bg-primary/5 transition-all group"
                >
                  <span className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors">
                    {area}
                  </span>
                  <span className="text-primary text-lg" aria-hidden="true">→</span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* FAQ */}
        <section>
          <p className="text-accent font-bold tracking-[0.35em] uppercase text-xs mb-3">FAQ</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-6">{c.faqHeading}</h2>
          <div className="space-y-2 sm:space-y-3">
            {c.faqs.map((faq, i) => (
              <details
                key={i}
                className="group bg-card border border-border/50 rounded-2xl overflow-hidden"
              >
                <summary className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 sm:py-5 cursor-pointer list-none font-semibold text-foreground hover:text-primary transition-colors text-sm">
                  <span>{faq.question}</span>
                  <span
                    className="text-accent text-lg font-light flex-shrink-0 group-open:rotate-45 transition-transform"
                    aria-hidden="true"
                  >
                    +
                  </span>
                </summary>
                <div className="px-4 sm:px-6 pb-4 sm:pb-5 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/30 pt-3">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section
          className="rounded-2xl sm:rounded-3xl p-6 sm:p-10 text-center text-white relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
        >
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
              backgroundSize: "32px 32px",
            }}
          />
          <div className="relative z-10">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">{c.ctaTitle}</h2>
            <p className="text-primary-foreground/75 text-sm sm:text-base mb-7 max-w-lg mx-auto">
              {c.ctaDesc}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href={`${lp}/contact`}
                className="font-bold px-6 py-3 sm:px-8 sm:py-4 rounded-xl text-sm sm:text-base hover:opacity-90 transition-all"
                style={{ background: "linear-gradient(135deg, #D4A847, #B8922F)", color: "#fff" }}
              >
                {c.ctaBtn}
              </Link>
              <Link
                href={`${lp}/buy`}
                className="border-2 border-white/30 text-white font-bold px-6 py-3 sm:px-8 sm:py-4 rounded-xl text-sm sm:text-base hover:bg-white/10 transition-all"
              >
                {c.ctaBtnSecondary}
              </Link>
              <a
                href={waHref(WA_DEFAULT_MESSAGE, "/buying-property-in-dubai-as")}
                target="_blank"
                rel="noopener noreferrer"
                className="border-2 border-white/20 text-white font-bold px-6 py-3 sm:px-8 sm:py-4 rounded-xl text-sm sm:text-base hover:bg-white/10 transition-all"
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
