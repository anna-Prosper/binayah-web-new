/* eslint-disable i18next/no-literal-string -- multilingual SEO landing page */
import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { FAQJsonLd, BreadcrumbJsonLd } from "@/components/JsonLd";
import { canonical, altLangs, OG_LOCALE, DEFAULT_OG_IMAGE } from "@/lib/site";

export const revalidate = 86400;

const CONTENT = {
  he: {
    "metaTitle": "ניהול נכסים בדובאי | שירותי בעלי דירות ללא טרחה | Binayah",
    "metaDesc": "ניהול נכסים מקצועי בדובאי: סינון שוכרים, גביית שכר דירה, אחזקה, EJARI ודיווח. שחררו את זמנכם, הגנו על ההשקעה שלכם. מוסמך RERA.",
    "heroLabel": "ניהול נכסים",
    "h1": "שירותי ניהול נכסים בדובאי",
    "heroDesc": "תנו ל-Binayah לטפל בהכול — מאיתור השוכר המתאים ועד אחזקה חודשית וגביית שכר דירה. הצוות המוסמך שלנו מטעם RERA מגן על ההשקעה שלכם בזמן שאתם מתמקדים במה שחשוב.",
    "heroCta": "קבלו ייעוץ חינם",
    "stats": [
      {
        "n": "19+",
        "label": "שנות ניהול נכסים בדובאי"
      },
      {
        "n": "RERA",
        "label": "צוות ניהול מוסמך"
      },
      {
        "n": "95%",
        "label": "שיעור שימור שוכרים"
      },
      {
        "n": "48h",
        "label": "זמן תגובה ממוצע לשוכר"
      }
    ],
    "servicesTitle": "מה כלול בשירות",
    "services": [
      {
        "icon": "🏡",
        "title": "סינון ואיתור שוכרים",
        "body": "בדיקות רקע, אימות תעסוקה וסקירת היסטוריית שכירות. אנו משכנים רק שוכרים העומדים בקריטריוני ההסמכה המחמירים של Binayah."
      },
      {
        "icon": "💰",
        "title": "גביית שכר דירה והעברתו",
        "body": "גביית שכר דירה חודשית, ניהול המחאות והעברה ישירה לחשבונכם. דיווח דיגיטלי מלא הכולל אישורי תשלום."
      },
      {
        "icon": "🔧",
        "title": "אחזקה ותיקונים",
        "body": "תיאום אחזקה 24/7 עם רשת הקבלנים המאומתת שלנו. תוכניות אחזקה מונעת לשמירה על ערך הנכס ולצמצום עלויות חירום."
      },
      {
        "icon": "📋",
        "title": "EJARI ועמידה בדרישות החוק",
        "body": "ניסוח חוזי שכירות, רישום EJARI ברשות הקרקעות של דובאי (DLD), ועמידה מלאה בחוקי השכירות של איחוד האמירויות (צו מס' 33)."
      },
      {
        "icon": "📊",
        "title": "דיווח חודשי",
        "body": "דוחות חודשיים מפורטים הכוללים שכר דירה שנגבה, הוצאות אחזקה וביצועי הנכס. נגיש דרך פורטל הבעלים של Binayah."
      },
      {
        "icon": "⚖️",
        "title": "יישוב סכסוכים",
        "body": "גישור מקצועי ותמיכה משפטית בסכסוכי שכירות. צוות מוכשר מטעם RERA מטפל בפינויים, משאים ומתנים לחידוש והגשת תביעות ל-RDC."
      }
    ],
    "plansTitle": "תוכניות ניהול",
    "plans": [
      {
        "name": "סטנדרט",
        "fee": "5% / לחודש",
        "features": [
          "גביית שכר דירה",
          "רישום EJARI",
          "תקשורת עם השוכר",
          "תיאום אחזקה בסיסי",
          "דוחות חודשיים"
        ]
      },
      {
        "name": "פרימיום",
        "fee": "8% / לחודש",
        "features": [
          "כל מה שכלול בסטנדרט",
          "צילום מקצועי + פרסום מודעה",
          "סינון ואיתור שוכרים",
          "תגובת אחזקה 24/7",
          "ביקורת נכס רבעונית",
          "מנהל תיק ייעודי"
        ]
      },
      {
        "name": "שירות מלא",
        "fee": "10% / לחודש",
        "features": [
          "כל מה שכלול בפרימיום",
          "ניהול פרויקטי שיפוץ",
          "הסדרת שירותי תשתית וניהולם",
          "סקירה שנתית של שכר הדירה בשוק",
          "טיפול בסכסוכים משפטיים",
          "פורטל בעלים עם נתונים בזמן אמת"
        ]
      }
    ],
    "whyTitle": "למה לבחור ב-Binayah לניהול הנכס שלכם",
    "whyPoints": [
      {
        "title": "שירות מקצה לקצה",
        "body": "מיחידה ריקה ועד שכר דירה משולם — אנו מטפלים בכל שלב כדי שלא תצטרכו. אידיאלי למשקיעים מחו\"ל ולבעלי דירות עסוקים."
      },
      {
        "title": "עמלות שקופות",
        "body": "עמלות פשוטות מבוססות אחוזים ללא חיובים נסתרים. אתם משלמים רק כששכר הדירה נגבה."
      },
      {
        "title": "צוות מוסמך RERA",
        "body": "כל מנהלי הנכסים מורשים על ידי הרשות לרגולציה של נדל\"ן בדובאי. עמידה מלאה בדרישות החוק בכל שלב."
      },
      {
        "title": "רשת קבלנים מאומתת",
        "body": "קבלנים מאושרים מראש לאינסטלציה, חשמל, מיזוג אוויר, ניקיון וצביעה. ללא הצעות מחיר מנופחות — אנו משתמשים בתמחור מכרזי תחרותי."
      },
      {
        "title": "גישה לפורטל הבעלים",
        "body": "התחברו בכל עת לצפייה בתשלומי שכר דירה, היסטוריית אחזקה, פרטי שוכרים ומסמכי נכס."
      },
      {
        "title": "תקשורת יזומה",
        "body": "אתם מקבלים הודעה מראש על חידושי שכירות, העלאות שכר דירה וכל בעיה — לפני שהיא הופכת לבעיה ממשית."
      }
    ],
    "faqTitle": "שאלות נפוצות",
    "faqs": [
      {
        "question": "כמה עולה ניהול נכסים בדובאי?",
        "answer": "עמלות ניהול הנכסים של Binayah נעות בין 5% ל-10% משכר הדירה החודשי, בהתאם לרמת השירות. ניהול סטנדרטי (גביית שכר דירה, EJARI, אחזקה בסיסית) מתחיל מ-5% לחודש. ניהול שירות מלא הכולל איתור שוכרים, אחזקה 24/7 ותמיכה משפטית הוא 10% לחודש. אין עמלות מקדמה."
      },
      {
        "question": "מה כלול בניהול נכסים בדובאי?",
        "answer": "חבילת ניהול נכסים מלאה כוללת: סינון ואיתור שוכרים, ניסוח חוזה שכירות, רישום EJARI, גביית שכר דירה והעברתו, תיאום אחזקה (חירום ומתוכננת), ביקורות נכס רבעוניות, דיווח כספי חודשי ויישוב סכסוכים. Binayah מנהלת את כל מערכת היחסים בין בעל הדירה לשוכר בשמכם."
      },
      {
        "question": "האם Binayah יכולה לנהל את הנכס שלי אם אני גר בחו\"ל?",
        "answer": "כן, זהו אחד מהשימושים הנפוצים ביותר שלנו. משקיעים מרוסיה, אירופה, סין ומדינות בינלאומיות נוספות סומכים על Binayah לנהל את ההשקעות שלהם בדובאי מרחוק. אתם מקבלים את שכר הדירה ישירות לחשבון הבנק ודוחות חודשיים באימייל או דרך פורטל הבעלים שלנו. אין צורך אף פעם לבקר בדובאי לצורך ניהול שוטף."
      },
      {
        "question": "כמה מהר Binayah יכולה למצוא לי שוכר?",
        "answer": "עבור נכסים מתומחרים נכון, Binayah בדרך כלל מוצאת שוכר מתאים תוך 2–4 שבועות. אנו מפרסמים ב-Bayut, Propertyfinder, Dubizzle ובמאגר השוכרים המסוננים מראש שלנו. תוכניות הפרימיום והשירות המלא שלנו כוללות צילום מקצועי למיקסום ביצועי המודעה."
      },
      {
        "question": "מהו EJARI ומדוע הוא נדרש?",
        "answer": "EJARI היא מערכת רישום השכירות הרשמית בדובאי, הנדרשת על ידי רשות הקרקעות של דובאי (DLD) עבור כל חוזי השכירות. ללא רישום EJARI, שוכרים אינם יכולים לקבל אשרות תושבות באיחוד האמירויות, חיבורי תשתית או רישום לבתי ספר. הוא גם מגן על בעל הדירה ועל השוכר מבחינה משפטית. Binayah מטפלת ברישום EJARI כחלק מכל תוכניות הניהול."
      },
      {
        "question": "מה קורה אם שוכר לא משלם שכר דירה?",
        "answer": "ל-Binayah יש תהליך הסלמה מובנה: הודעות תזכורת, מכתבי דרישה רשמיים, ובמידת הצורך — הליכים משפטיים דרך מרכז יישוב סכסוכי השכירות (RDC). חוק איחוד האמירויות מאפשר לבעלי דירות לפנות שוכרים שאינם משלמים, אם כי התהליך אורך 3–6 חודשים. סינון השוכרים היסודי שלנו מצמצם משמעותית את סיכון אי-התשלום."
      },
      {
        "question": "האם אני יכול לעבור ל-Binayah אם כבר יש לי מנהל נכסים?",
        "answer": "כן. המעבר פשוט — אנו משתלטים על הניהול בעת חידוש החוזה או, במקרים מסוימים, במהלך השכירות הקיימת תוך מתן הודעה מתאימה למנהל הנוכחי. מנהל התיק שלכם ב-Binayah יטפל בכל תהליך המעבר."
      },
      {
        "question": "אילו סוגי נכסים Binayah מנהלת?",
        "answer": "אנו מנהלים את כל סוגי הנכסים למגורים: סטודיו, דירות עם 1–5 חדרי שינה, בתי עיר, וילות ופנטהאוזים. נכסים בכל הקהילות המרכזיות של דובאי כולל Dubai Marina, Downtown, Palm Jumeirah, JVC, Business Bay, Arabian Ranches ועוד."
      }
    ],
    "ctaTitle": "התחילו לנהל בצורה חכמה יותר",
    "ctaDesc": "קבלו ייעוץ חינם מצוות ניהול הנכסים שלנו. נעריך את הנכס שלכם, נמליץ על התוכנית המתאימה ונשתלט מהיום הראשון.",
    "ctaBtn": "קבלו ייעוץ חינם",
    "ctaWhatsApp": "כתבו לנו בוואטסאפ",
    "breadcrumbs": [
      "דף הבית",
      "שירותים",
      "ניהול נכסים"
    ]
  },
  en: {
    metaTitle: "Property Management Dubai | Hassle-Free Landlord Services | Binayah",
    metaDesc: "Professional Dubai property management: tenant screening, rent collection, maintenance, EJARI, and reporting. Free your time, protect your investment. RERA-certified.",
    heroLabel: "PROPERTY MANAGEMENT",
    h1: "Dubai Property Management Services",
    heroDesc: "Let Binayah handle everything — from finding the right tenant to monthly maintenance and rent collection. Our RERA-certified team protects your investment while you focus on what matters.",
    heroCta: "Get a Free Consultation",
    stats: [
      { n: "19+", label: "Years Managing Dubai Properties" },
      { n: "RERA", label: "Certified Management Team" },
      { n: "95%", label: "Tenant Retention Rate" },
      { n: "48h", label: "Average Tenant Response Time" },
    ],
    servicesTitle: "What's Included",
    services: [
      { icon: "🏡", title: "Tenant Screening & Placement", body: "Background checks, employment verification, and rental history review. We only place tenants who meet Binayah's strict qualification criteria." },
      { icon: "💰", title: "Rent Collection & Remittance", body: "Monthly rent collection, cheque management, and direct remittance to your account. Full digital reporting with payment confirmations." },
      { icon: "🔧", title: "Maintenance & Repairs", body: "24/7 maintenance coordination with our vetted contractor network. Preventive maintenance plans to protect asset value and minimise emergency costs." },
      { icon: "📋", title: "EJARI & Legal Compliance", body: "Tenancy contract drafting, EJARI registration with Dubai Land Department, and full compliance with UAE rental laws (Decree No. 33)." },
      { icon: "📊", title: "Monthly Reporting", body: "Detailed monthly statements covering rent received, maintenance spend, and property performance. Accessible via your Binayah owner portal." },
      { icon: "⚖️", title: "Dispute Resolution", body: "Expert mediation and legal support for tenancy disputes. RERA-trained team handles evictions, renewal negotiations, and RDC filings." },
    ],
    plansTitle: "Management Plans",
    plans: [
      { name: "Standard", fee: "5% / month", features: ["Rent collection", "EJARI registration", "Tenant communication", "Basic maintenance coordination", "Monthly statements"] },
      { name: "Premium", fee: "8% / month", features: ["Everything in Standard", "Professional photography + listing", "Tenant screening & placement", "24/7 maintenance response", "Quarterly property inspection", "Dedicated account manager"] },
      { name: "Full Service", fee: "10% / month", features: ["Everything in Premium", "Renovation project management", "Utility setup & management", "Annual market rent review", "Legal dispute handling", "Owner portal with real-time data"] },
    ],
    whyTitle: "Why Choose Binayah for Property Management",
    whyPoints: [
      { title: "End-to-End Service", body: "From empty unit to paid rent — we handle every step so you don't have to. Ideal for overseas investors and busy landlords." },
      { title: "Transparent Fees", body: "Simple percentage-based fees with no hidden charges. You only pay when rent is collected." },
      { title: "RERA-Certified Team", body: "All property managers are licensed by Dubai's Real Estate Regulatory Agency. Full legal compliance at every step." },
      { title: "Vetted Contractor Network", body: "Pre-approved contractors for plumbing, electrical, AC, cleaning, and painting. No inflated quotes — we use competitive tender pricing." },
      { title: "Owner Portal Access", body: "Log in anytime to view rent payments, maintenance history, tenant details, and property documents." },
      { title: "Proactive Communication", body: "You receive advance notice on lease renewals, rent increases, and any issues — before they become problems." },
    ],
    faqTitle: "Frequently Asked Questions",
    faqs: [
      { question: "How much does property management cost in Dubai?", answer: "Binayah's property management fees range from 5% to 10% of monthly rent, depending on the service level. Standard management (rent collection, EJARI, basic maintenance) starts at 5%/month. Full-service management including tenant finding, 24/7 maintenance, and legal support is 10%/month. There are no upfront fees." },
      { question: "What is included in Dubai property management?", answer: "A full-service property management package includes: tenant screening and placement, tenancy contract drafting, EJARI registration, rent collection and remittance, maintenance coordination (emergency and planned), quarterly property inspections, monthly financial reporting, and dispute resolution. Binayah manages the entire landlord-tenant relationship on your behalf." },
      { question: "Can Binayah manage my property if I live abroad?", answer: "Yes, this is one of our most common use cases. Russian, European, Chinese, and other international investors rely on Binayah to manage their Dubai investments remotely. You receive rent directly to your bank account and monthly reports via email or our owner portal. No need to ever visit Dubai for routine management." },
      { question: "How quickly can Binayah find me a tenant?", answer: "For well-priced properties, Binayah typically finds a qualified tenant within 2–4 weeks. We list on Bayut, Propertyfinder, Dubizzle, and our own database of pre-qualified tenants. Our Premium and Full Service plans include professional photography to maximise listing performance." },
      { question: "What is EJARI and why is it required?", answer: "EJARI is the official tenancy registration system in Dubai, required by the Dubai Land Department for all rental contracts. Without EJARI registration, tenants cannot get UAE residency visas, utility connections, or school enrolments. It also protects both landlord and tenant legally. Binayah handles EJARI registration as part of all management plans." },
      { question: "What happens if a tenant doesn't pay rent?", answer: "Binayah has a structured escalation process: reminder notices, formal demand letters, and — if necessary — legal proceedings through the Rental Disputes Centre (RDC). UAE law allows landlords to evict non-paying tenants, though the process takes 3–6 months. Our thorough tenant screening significantly reduces default risk." },
      { question: "Can I switch to Binayah if I already have a property manager?", answer: "Yes. Switching is straightforward — we take over management at lease renewal or, in some cases, during the existing tenancy with proper notice to the current manager. Your Binayah account manager will handle the full transition process." },
      { question: "What types of properties does Binayah manage?", answer: "We manage all residential property types: studios, 1–5 bedroom apartments, townhouses, villas, and penthouses. Properties across all major Dubai communities including Dubai Marina, Downtown, Palm Jumeirah, JVC, Business Bay, Arabian Ranches, and more." },
    ],
    ctaTitle: "Start Managing Smarter",
    ctaDesc: "Get a free consultation with our property management team. We'll assess your property, recommend the right plan, and take over from day one.",
    ctaBtn: "Get Free Consultation",
    ctaWhatsApp: "WhatsApp Us",
    breadcrumbs: ["Home", "Services", "Property Management"],
  },

  ru: {
    metaTitle: "Управление недвижимостью в Дубае | Полный сервис | Binayah",
    metaDesc: "Профессиональное управление недвижимостью в Дубае: поиск арендаторов, сбор аренды, техническое обслуживание, EJARI и отчётность. RERA-сертифицированная команда.",
    heroLabel: "УПРАВЛЕНИЕ НЕДВИЖИМОСТЬЮ",
    h1: "Управление недвижимостью в Дубае",
    heroDesc: "Доверьте Binayah всё — от поиска арендатора до ежемесячного обслуживания и сбора аренды. RERA-сертифицированная команда защитит ваши инвестиции, пока вы занимаетесь важными делами. Обслуживание на русском языке.",
    heroCta: "Бесплатная консультация",
    stats: [
      { n: "19+", label: "Лет управления в Дубае" },
      { n: "RERA", label: "Сертификация" },
      { n: "95%", label: "Удержание арендаторов" },
      { n: "48ч", label: "Среднее время ответа" },
    ],
    servicesTitle: "Что входит в услугу",
    services: [
      { icon: "🏡", title: "Поиск и проверка арендаторов", body: "Проверка биографии, подтверждение занятости и истории аренды. Мы размещаем только арендаторов, соответствующих строгим критериям Binayah." },
      { icon: "💰", title: "Сбор аренды и перечисление средств", body: "Ежемесячный сбор аренды, управление чеками и прямое перечисление на ваш счёт. Полная цифровая отчётность с подтверждениями платежей." },
      { icon: "🔧", title: "Обслуживание и ремонт", body: "Круглосуточная координация технического обслуживания с проверенной сетью подрядчиков. Плановые работы для сохранения стоимости актива." },
      { icon: "📋", title: "EJARI и правовое соответствие", body: "Составление договоров найма, регистрация EJARI в Земельном департаменте Дубая и полное соответствие законодательству ОАЭ." },
      { icon: "📊", title: "Ежемесячная отчётность", body: "Подробные ежемесячные отчёты о полученной аренде, расходах на обслуживание и результатах управления объектом." },
      { icon: "⚖️", title: "Урегулирование споров", body: "Профессиональное посредничество и юридическая поддержка в арендных спорах через RERA-сертифицированную команду." },
    ],
    plansTitle: "Тарифные планы",
    plans: [
      { name: "Стандарт", fee: "5% / мес.", features: ["Сбор аренды", "Регистрация EJARI", "Коммуникация с арендатором", "Базовая координация обслуживания", "Ежемесячные отчёты"] },
      { name: "Премиум", fee: "8% / мес.", features: ["Всё из Стандарта", "Фотосъёмка + размещение объявлений", "Проверка и поиск арендатора", "Техобслуживание 24/7", "Квартальная инспекция", "Персональный менеджер"] },
      { name: "Полный сервис", fee: "10% / мес.", features: ["Всё из Премиума", "Управление ремонтными проектами", "Настройка коммунальных услуг", "Ежегодный пересмотр арендной ставки", "Юридическое сопровождение споров", "Портал владельца с данными в реальном времени"] },
    ],
    whyTitle: "Почему Binayah для управления недвижимостью",
    whyPoints: [
      { title: "Полный сервис", body: "От пустой квартиры до оплаченной аренды — мы берём на себя каждый шаг. Идеально для зарубежных инвесторов." },
      { title: "Прозрачные тарифы", body: "Простые процентные комиссии без скрытых платежей. Оплата только после получения аренды." },
      { title: "RERA-сертификация", body: "Все управляющие имеют лицензию RERA. Полное соответствие законодательству ОАЭ на каждом этапе." },
      { title: "Проверенная сеть подрядчиков", body: "Одобренные подрядчики для сантехники, электрики, кондиционирования, уборки и покраски по конкурентным ценам." },
      { title: "Портал владельца", body: "Входите в любое время для просмотра платежей по аренде, истории обслуживания и документов." },
      { title: "Обслуживание на русском языке", body: "Полная поддержка на русском. Мы регулярно управляем объектами российских инвесторов дистанционно." },
    ],
    faqTitle: "Частые вопросы",
    faqs: [
      { question: "Сколько стоит управление недвижимостью в Дубае?", answer: "Тарифы Binayah составляют 5–10% от ежемесячной аренды в зависимости от уровня обслуживания. Стандартное управление начинается от 5%/мес., полный сервис — 10%/мес. Авансовых платежей нет." },
      { question: "Что входит в управление недвижимостью в Дубае?", answer: "Полный пакет включает: поиск и проверку арендаторов, составление договора, регистрацию EJARI, сбор аренды, координацию обслуживания, квартальные инспекции, ежемесячные финансовые отчёты и урегулирование споров." },
      { question: "Может ли Binayah управлять объектом, если я нахожусь за рубежом?", answer: "Да, это один из наших основных сценариев. Российские, европейские и азиатские инвесторы доверяют Binayah управление своей дубайской недвижимостью дистанционно. Аренда перечисляется на ваш счёт, ежемесячные отчёты приходят по электронной почте." },
      { question: "Как быстро Binayah найдёт арендатора?", answer: "Для правильно оценённых объектов Binayah обычно находит квалифицированного арендатора за 2–4 недели. Размещаем на Bayut, Propertyfinder, Dubizzle и в нашей базе данных." },
      { question: "Что такое EJARI и зачем он нужен?", answer: "EJARI — официальная система регистрации договоров аренды в Дубае, обязательная для всех арендных контрактов. Без регистрации EJARI арендаторы не могут получить визу ОАЭ, подключить коммунальные услуги или записать детей в школу. Binayah берёт на себя регистрацию EJARI." },
      { question: "Что происходит, если арендатор не платит?", answer: "У нас есть структурированный процесс: напоминания, официальные требования, при необходимости — юридическое производство через Центр разрешения арендных споров (RDC). Тщательная проверка арендаторов значительно снижает риск неплатежей." },
      { question: "Какими объектами управляет Binayah?", answer: "Все типы жилой недвижимости: студии, квартиры с 1–5 спальнями, таунхаусы, виллы и пентхаусы во всех основных районах Дубая: Марина, Даунтаун, Пальма Джумейра, JVC, Бизнес-Бей и других." },
    ],
    ctaTitle: "Начните управлять эффективнее",
    ctaDesc: "Получите бесплатную консультацию с нашей командой по управлению недвижимостью. Мы оценим объект, подберём оптимальный план и возьмёмся за работу сразу.",
    ctaBtn: "Бесплатная консультация",
    ctaWhatsApp: "WhatsApp",
    breadcrumbs: ["Главная", "Услуги", "Управление недвижимостью"],
  },

  ar: {
    metaTitle: "إدارة العقارات في دبي | خدمة شاملة | بناية للعقارات",
    metaDesc: "إدارة عقارية احترافية في دبي: فحص المستأجرين، تحصيل الإيجار، الصيانة، EJARI، والتقارير. فريق معتمد من RERA.",
    heroLabel: "إدارة العقارات",
    h1: "خدمات إدارة العقارات في دبي",
    heroDesc: "دع بناية تتولى كل شيء — من إيجاد المستأجر المناسب إلى الصيانة الشهرية وتحصيل الإيجار. فريقنا المعتمد من RERA يحمي استثمارك بينما أنت تنصرف لما يهمّك.",
    heroCta: "استشارة مجانية",
    stats: [
      { n: "+17", label: "عامًا في إدارة عقارات دبي" },
      { n: "RERA", label: "اعتماد" },
      { n: "95%", label: "معدل الاحتفاظ بالمستأجرين" },
      { n: "48س", label: "متوسط وقت الاستجابة" },
    ],
    servicesTitle: "ما الذي يشمله العقد",
    services: [
      { icon: "🏡", title: "فحص المستأجرين واستقطابهم", body: "فحص السيرة الذاتية والتحقق من التوظيف وتاريخ الإيجار. نُؤجَّر فقط لمستأجرين يستوفون معايير بناية الصارمة." },
      { icon: "💰", title: "تحصيل الإيجار وتحويله", body: "تحصيل شهري للإيجار وإدارة الشيكات وتحويل مباشر إلى حسابك مع تقارير رقمية كاملة." },
      { icon: "🔧", title: "الصيانة والإصلاحات", body: "تنسيق صيانة على مدار الساعة مع شبكة مقاولين معتمدين، وخطط صيانة وقائية للحفاظ على قيمة الأصل." },
      { icon: "📋", title: "الامتثال القانوني وتسجيل إيجاري", body: "صياغة عقود الإيجار وتسجيل إيجاري في دائرة الأراضي والأملاك والامتثال الكامل لقوانين الإيجار الإماراتية." },
      { icon: "📊", title: "التقارير الشهرية", body: "كشوف شهرية مفصَّلة بالإيجار المُحصَّل ومصاريف الصيانة وأداء العقار عبر بوابة المالك." },
      { icon: "⚖️", title: "فضّ النزاعات", body: "وساطة متخصصة ودعم قانوني لنزاعات الإيجار من خلال فريق معتمد من RERA." },
    ],
    plansTitle: "خطط الإدارة",
    plans: [
      { name: "قياسي", fee: "5% / شهر", features: ["تحصيل الإيجار", "تسجيل إيجاري", "التواصل مع المستأجر", "تنسيق الصيانة الأساسية", "كشوف شهرية"] },
      { name: "مميز", fee: "8% / شهر", features: ["كل ما في الخطة القياسية", "تصوير احترافي + إدراج", "فحص المستأجر واستقطابه", "صيانة 24/7", "فحص ربع سنوي", "مدير حساب مخصص"] },
      { name: "خدمة كاملة", fee: "10% / شهر", features: ["كل ما في الخطة المميزة", "إدارة مشاريع التجديد", "إعداد المرافق وإدارتها", "مراجعة سنوية لسعر الإيجار", "معالجة النزاعات القانونية", "بوابة المالك بالبيانات الفورية"] },
    ],
    whyTitle: "لماذا تختار بناية لإدارة عقارك",
    whyPoints: [
      { title: "خدمة متكاملة", body: "من الوحدة الفارغة إلى الإيجار المدفوع — نتولى كل خطوة. مثالية للمستثمرين من الخارج." },
      { title: "رسوم شفافة", body: "رسوم بسيطة بنسبة مئوية دون رسوم مخفية. تدفع فقط عند تحصيل الإيجار." },
      { title: "اعتماد RERA", body: "جميع المديرين العقاريين مرخَّصون من RERA. امتثال قانوني كامل في كل مرحلة." },
      { title: "شبكة مقاولين معتمدين", body: "مقاولون معتمدون مسبقًا للسباكة والكهرباء والتكييف والتنظيف والدهان بأسعار تنافسية." },
      { title: "بوابة المالك", body: "سجِّل الدخول في أي وقت لعرض مدفوعات الإيجار وسجل الصيانة والمستندات." },
      { title: "تواصل استباقي", body: "تتلقى إشعارًا مسبقًا بتجديد عقود الإيجار وزيادات الإيجار وأي مشكلات — قبل أن تتفاقم." },
    ],
    faqTitle: "الأسئلة الشائعة",
    faqs: [
      { question: "كم تكلّف إدارة العقارات في دبي؟", answer: "تتراوح رسوم بناية للإدارة بين 5% و10% من الإيجار الشهري حسب مستوى الخدمة. الإدارة القياسية تبدأ من 5%/شهر والخدمة الكاملة 10%/شهر. لا رسوم مقدَّمة." },
      { question: "ما الذي تشمله خدمة إدارة العقارات في دبي؟", answer: "تشمل الخدمة المتكاملة: فحص المستأجرين وتأهيلهم، صياغة عقد الإيجار، تسجيل إيجاري، تحصيل الإيجار، تنسيق الصيانة، الفحوصات الدورية، التقارير الشهرية، وفضّ النزاعات." },
      { question: "هل يمكن لبناية إدارة عقاري إذا كنت خارج الإمارات؟", answer: "نعم. يعتمد علينا مستثمرون دوليون من روسيا وأوروبا والصين وغيرها لإدارة استثماراتهم في دبي عن بُعد. يُحوَّل الإيجار مباشرةً إلى حسابك وتصلك التقارير الشهرية إلكترونيًا." },
      { question: "كم يستغرق إيجاد مستأجر؟", answer: "للعقارات المسعَّرة بشكل مناسب، تجد بناية عادةً مستأجرًا مؤهَّلًا خلال 2-4 أسابيع. نُدرج العقار على Bayut وPropertyfinder وDubizzle وقاعدة بياناتنا من المستأجرين المؤهَّلين." },
      { question: "ما هو إيجاري ولماذا هو مطلوب؟", answer: "إيجاري نظام التسجيل الرسمي لعقود الإيجار في دبي. بدون تسجيل إيجاري لا يستطيع المستأجر الحصول على إقامة أو توصيل خدمات أو تسجيل الأطفال في المدارس. تتولى بناية تسجيل إيجاري ضمن جميع خطط الإدارة." },
      { question: "ماذا يحدث إذا لم يدفع المستأجر الإيجار؟", answer: "لدينا عملية تصعيد منظَّمة: إشعارات تذكير، خطابات مطالبة رسمية، وإجراءات قانونية إذا اقتضى الأمر عبر مركز فضّ المنازعات الإيجارية (RDC). يقلّل الفحص الدقيق للمستأجرين من مخاطر التخلف عن السداد." },
    ],
    ctaTitle: "ابدأ الإدارة الذكية",
    ctaDesc: "احصل على استشارة مجانية مع فريق الإدارة العقارية لدينا. سنُقيَّم عقارك ونُوصي بالخطة المناسبة.",
    ctaBtn: "استشارة مجانية",
    ctaWhatsApp: "واتساب",
    breadcrumbs: ["الرئيسية", "الخدمات", "إدارة العقارات"],
  },

  zh: {
    metaTitle: "迪拜物业管理服务 | 全程托管 | Binayah Properties",
    metaDesc: "专业迪拜物业管理：租客筛选、租金收取、维修协调、EJARI登记和报告。RERA认证团队，中文服务。",
    heroLabel: "物业管理",
    h1: "迪拜物业管理服务",
    heroDesc: "让Binayah处理一切——从寻找合适租客到每月维护和租金收取。我们的RERA认证团队保护您的投资，提供全程中文服务。",
    heroCta: "免费咨询",
    stats: [
      { n: "19+", label: "年迪拜物业管理经验" },
      { n: "RERA", label: "认证团队" },
      { n: "95%", label: "租客留存率" },
      { n: "48小时", label: "平均响应时间" },
    ],
    servicesTitle: "服务内容",
    services: [
      { icon: "🏡", title: "租客筛选与安置", body: "背景调查、就业核实和租赁历史审查。我们只为符合Binayah严格资质标准的租客办理入住。" },
      { icon: "💰", title: "租金收取与汇款", body: "每月租金收取、支票管理和直接汇款至您的账户，提供完整的数字报告和付款确认。" },
      { icon: "🔧", title: "维修与保养", body: "通过我们经过审核的承包商网络提供24小时维修协调，以及预防性保养计划以保护资产价值。" },
      { icon: "📋", title: "EJARI及法律合规", body: "租赁合同起草、迪拜土地局EJARI登记，以及完全符合阿联酋租赁法律（第33号法令）。" },
      { icon: "📊", title: "月度报告", body: "详细的月度对账单，涵盖已收租金、维修支出和物业绩效，可通过业主门户随时查阅。" },
      { icon: "⚖️", title: "纠纷解决", body: "通过RERA认证团队提供专业调解和法律支持，处理租赁纠纷、驱逐和RDC申请。" },
    ],
    plansTitle: "管理方案",
    plans: [
      { name: "标准", fee: "5% / 月", features: ["租金收取", "EJARI登记", "租客沟通", "基础维修协调", "月度报表"] },
      { name: "高级", fee: "8% / 月", features: ["包含标准方案全部内容", "专业摄影+发布房源", "租客筛选与安置", "24小时维修响应", "季度物业检查", "专属客户经理"] },
      { name: "全托管", fee: "10% / 月", features: ["包含高级方案全部内容", "装修项目管理", "水电气设置与管理", "年度租金市场审查", "法律纠纷处理", "实时数据业主门户"] },
    ],
    whyTitle: "为什么选择Binayah物业管理",
    whyPoints: [
      { title: "端到端服务", body: "从空置单元到收取租金——我们处理每一步。非常适合海外投资者和繁忙的房东。" },
      { title: "透明收费", body: "简单的按比例收费，无隐性收费。只有在收取租金后才付费。" },
      { title: "RERA认证团队", body: "所有物业经理均持有RERA执照，每个环节完全符合阿联酋法律要求。" },
      { title: "审核承包商网络", body: "水暖、电气、空调、清洁和粉刷的预审承包商，提供竞争性报价。" },
      { title: "业主门户", body: "随时登录查看租金付款、维修历史、租客信息和物业文件。" },
      { title: "中文全程支持", body: "提供完整中文服务，我们定期为中国投资者远程管理迪拜房产。" },
    ],
    faqTitle: "常见问题解答",
    faqs: [
      { question: "迪拜物业管理费用是多少？", answer: "Binayah的物业管理费用为月租金的5%-10%，具体取决于服务级别。标准管理从5%/月起，全托管服务为10%/月。无前期费用。" },
      { question: "迪拜物业管理包含哪些内容？", answer: "全托管服务包括：租客筛选与安置、租赁合同起草、EJARI登记、租金收取、维修协调、季度物业检查、月度财务报告和纠纷解决。" },
      { question: "如果我在国内，Binayah可以管理我的物业吗？", answer: "可以。中国、俄罗斯和欧洲投资者信赖Binayah远程管理他们的迪拜投资。租金直接汇入您的银行账户，月度报告通过电子邮件发送。" },
      { question: "Binayah多快能找到租客？", answer: "对于定价合理的物业，Binayah通常在2-4周内找到合格租客。我们在Bayut、Propertyfinder、Dubizzle和我们的预审租客数据库上发布房源。" },
      { question: "什么是EJARI，为什么需要它？", answer: "EJARI是迪拜官方租赁登记系统，所有租赁合同必须登记。没有EJARI登记，租客无法获得居住签证、接通水电或为孩子办理入学。Binayah将EJARI登记纳入所有管理方案。" },
      { question: "如果租客不付租金怎么办？", answer: "我们有结构化的升级程序：提醒通知、正式催款函，必要时通过租赁纠纷中心（RDC）进行法律程序。严格的租客筛选大大降低违约风险。" },
      { question: "Binayah管理哪些类型的物业？", answer: "我们管理所有住宅类型：单间公寓、1-5卧室公寓、联排别墅、别墅和顶层公寓，覆盖迪拜所有主要社区。" },
    ],
    ctaTitle: "开始智能管理",
    ctaDesc: "与我们的物业管理团队进行免费咨询。我们将评估您的物业，推荐合适的方案，并从第一天就开始接手管理。",
    ctaBtn: "免费咨询",
    ctaWhatsApp: "WhatsApp咨询",
    breadcrumbs: ["首页", "服务", "物业管理"],
  },

  vi: {
    metaTitle: "Quản lý bất động sản Dubai | Dịch vụ chủ nhà không phiền hà | Binayah",
    metaDesc: "Quản lý bất động sản Dubai chuyên nghiệp: sàng lọc khách thuê, thu tiền thuê, bảo trì, EJARI và báo cáo. Giải phóng thời gian, bảo vệ khoản đầu tư của bạn. Chứng nhận RERA.",
    heroLabel: "QUẢN LÝ BẤT ĐỘNG SẢN",
    h1: "Dịch vụ quản lý bất động sản Dubai",
    heroDesc: "Để Binayah xử lý mọi thứ — từ tìm khách thuê phù hợp đến bảo trì hàng tháng và thu tiền thuê. Đội ngũ được chứng nhận RERA của chúng tôi bảo vệ khoản đầu tư của bạn trong khi bạn tập trung vào điều quan trọng.",
    heroCta: "Nhận tư vấn miễn phí",
    stats: [
      { n: "19+", label: "Năm quản lý bất động sản Dubai" },
      { n: "RERA", label: "Đội ngũ quản lý được chứng nhận" },
      { n: "95%", label: "Tỷ lệ giữ chân khách thuê" },
      { n: "48h", label: "Thời gian phản hồi khách thuê TB" },
    ],
    servicesTitle: "Những gì được bao gồm",
    services: [
      { icon: "🏡", title: "Sàng lọc & Bố trí khách thuê", body: "Kiểm tra lý lịch, xác minh việc làm và xem xét lịch sử thuê. Chúng tôi chỉ bố trí khách thuê đáp ứng tiêu chí đánh giá nghiêm ngặt của Binayah." },
      { icon: "💰", title: "Thu & Chuyển tiền thuê", body: "Thu tiền thuê hàng tháng, quản lý chi phiếu và chuyển tiền trực tiếp vào tài khoản của bạn. Báo cáo số đầy đủ với xác nhận thanh toán." },
      { icon: "🔧", title: "Bảo trì & Sửa chữa", body: "Điều phối bảo trì 24/7 với mạng lưới nhà thầu đã được kiểm duyệt của chúng tôi. Kế hoạch bảo trì phòng ngừa để bảo vệ giá trị tài sản và giảm thiểu chi phí khẩn cấp." },
      { icon: "📋", title: "EJARI & Tuân thủ pháp lý", body: "Soạn thảo hợp đồng thuê, đăng ký EJARI với Sở Đất đai Dubai và tuân thủ đầy đủ luật thuê UAE (Nghị định số 33)." },
      { icon: "📊", title: "Báo cáo hàng tháng", body: "Bảng kê chi tiết hàng tháng bao gồm tiền thuê đã nhận, chi tiêu bảo trì và hiệu suất bất động sản. Truy cập qua cổng chủ sở hữu Binayah của bạn." },
      { icon: "⚖️", title: "Giải quyết tranh chấp", body: "Hòa giải chuyên gia và hỗ trợ pháp lý cho tranh chấp thuê. Đội ngũ được đào tạo RERA xử lý trục xuất, đàm phán gia hạn và hồ sơ RDC." },
    ],
    plansTitle: "Gói quản lý",
    plans: [
      { name: "Tiêu chuẩn", fee: "5% / tháng", features: ["Thu tiền thuê", "Đăng ký EJARI", "Giao tiếp với khách thuê", "Điều phối bảo trì cơ bản", "Bảng kê hàng tháng"] },
      { name: "Cao cấp", fee: "8% / tháng", features: ["Mọi thứ trong Tiêu chuẩn", "Ảnh chuyên nghiệp + niêm yết", "Sàng lọc & bố trí khách thuê", "Phản hồi bảo trì 24/7", "Kiểm tra bất động sản hàng quý", "Quản lý tài khoản riêng"] },
      { name: "Dịch vụ trọn gói", fee: "10% / tháng", features: ["Mọi thứ trong Cao cấp", "Quản lý dự án cải tạo", "Thiết lập & quản lý tiện ích", "Xem xét tiền thuê thị trường hàng năm", "Xử lý tranh chấp pháp lý", "Cổng chủ sở hữu với dữ liệu thời gian thực"] },
    ],
    whyTitle: "Vì sao chọn Binayah để quản lý bất động sản",
    whyPoints: [
      { title: "Dịch vụ trọn gói", body: "Từ căn trống đến tiền thuê được trả — chúng tôi xử lý mọi bước để bạn không phải làm. Lý tưởng cho nhà đầu tư ở nước ngoài và chủ nhà bận rộn." },
      { title: "Phí minh bạch", body: "Phí dựa trên tỷ lệ phần trăm đơn giản, không phí ẩn. Bạn chỉ trả khi tiền thuê được thu." },
      { title: "Đội ngũ được chứng nhận RERA", body: "Mọi quản lý bất động sản đều được cấp phép bởi Cơ quan Quản lý Bất động sản của Dubai. Tuân thủ pháp lý đầy đủ ở mọi bước." },
      { title: "Mạng lưới nhà thầu đã kiểm duyệt", body: "Nhà thầu được phê duyệt trước cho ống nước, điện, điều hòa, vệ sinh và sơn. Không báo giá thổi phồng — chúng tôi sử dụng giá đấu thầu cạnh tranh." },
      { title: "Truy cập cổng chủ sở hữu", body: "Đăng nhập bất cứ lúc nào để xem thanh toán tiền thuê, lịch sử bảo trì, chi tiết khách thuê và tài liệu bất động sản." },
      { title: "Giao tiếp chủ động", body: "Bạn nhận thông báo trước về gia hạn hợp đồng thuê, tăng tiền thuê và bất kỳ vấn đề nào — trước khi chúng trở thành rắc rối." },
    ],
    faqTitle: "Câu hỏi thường gặp",
    faqs: [
      { question: "Quản lý bất động sản tại Dubai tốn bao nhiêu?", answer: "Phí quản lý bất động sản của Binayah dao động từ 5% đến 10% tiền thuê hàng tháng, tùy mức dịch vụ. Quản lý tiêu chuẩn (thu tiền thuê, EJARI, bảo trì cơ bản) khởi điểm từ 5%/tháng. Quản lý trọn gói bao gồm tìm khách thuê, bảo trì 24/7 và hỗ trợ pháp lý là 10%/tháng. Không có phí trả trước." },
      { question: "Quản lý bất động sản Dubai bao gồm những gì?", answer: "Gói quản lý bất động sản trọn gói bao gồm: sàng lọc và bố trí khách thuê, soạn thảo hợp đồng thuê, đăng ký EJARI, thu và chuyển tiền thuê, điều phối bảo trì (khẩn cấp và theo kế hoạch), kiểm tra bất động sản hàng quý, báo cáo tài chính hàng tháng và giải quyết tranh chấp. Binayah quản lý toàn bộ mối quan hệ chủ nhà-khách thuê thay mặt bạn." },
      { question: "Binayah có thể quản lý bất động sản của tôi nếu tôi sống ở nước ngoài không?", answer: "Có, đây là một trong những trường hợp sử dụng phổ biến nhất của chúng tôi. Các nhà đầu tư Nga, châu Âu, Trung Quốc và quốc tế khác tin tưởng Binayah quản lý các khoản đầu tư Dubai của họ từ xa. Bạn nhận tiền thuê trực tiếp vào tài khoản ngân hàng và báo cáo hàng tháng qua email hoặc cổng chủ sở hữu của chúng tôi. Không bao giờ cần đến Dubai để quản lý thường lệ." },
      { question: "Binayah có thể tìm khách thuê cho tôi nhanh thế nào?", answer: "Với bất động sản định giá tốt, Binayah thường tìm được khách thuê đủ điều kiện trong vòng 2–4 tuần. Chúng tôi niêm yết trên Bayut, Propertyfinder, Dubizzle và cơ sở dữ liệu khách thuê đã sàng lọc trước của riêng mình. Gói Cao cấp và Trọn gói của chúng tôi bao gồm ảnh chuyên nghiệp để tối đa hóa hiệu suất tin đăng." },
      { question: "EJARI là gì và vì sao cần nó?", answer: "EJARI là hệ thống đăng ký thuê chính thức tại Dubai, do Sở Đất đai Dubai yêu cầu cho mọi hợp đồng thuê. Không có đăng ký EJARI, khách thuê không thể nhận thị thực cư trú UAE, kết nối tiện ích hoặc đăng ký học. Nó cũng bảo vệ cả chủ nhà và khách thuê về mặt pháp lý. Binayah xử lý đăng ký EJARI như một phần của mọi gói quản lý." },
      { question: "Điều gì xảy ra nếu khách thuê không trả tiền thuê?", answer: "Binayah có quy trình leo thang có cấu trúc: thông báo nhắc nhở, thư yêu cầu chính thức và — nếu cần — thủ tục pháp lý qua Trung tâm Tranh chấp Thuê (RDC). Luật UAE cho phép chủ nhà trục xuất khách thuê không trả tiền, dù quy trình mất 3–6 tháng. Việc sàng lọc khách thuê kỹ lưỡng của chúng tôi giảm đáng kể rủi ro vỡ nợ." },
      { question: "Tôi có thể chuyển sang Binayah nếu đã có quản lý bất động sản không?", answer: "Có. Việc chuyển đổi đơn giản — chúng tôi tiếp quản quản lý khi gia hạn hợp đồng thuê hoặc, trong một số trường hợp, trong thời gian thuê hiện tại với thông báo phù hợp cho quản lý hiện tại. Quản lý tài khoản Binayah của bạn sẽ xử lý toàn bộ quá trình chuyển đổi." },
      { question: "Binayah quản lý những loại bất động sản nào?", answer: "Chúng tôi quản lý mọi loại bất động sản nhà ở: studio, căn hộ 1–5 phòng ngủ, nhà phố, biệt thự và penthouse. Bất động sản trên tất cả các khu vực lớn của Dubai bao gồm Dubai Marina, Downtown, Palm Jumeirah, JVC, Business Bay, Arabian Ranches và hơn thế nữa." },
    ],
    ctaTitle: "Bắt đầu quản lý thông minh hơn",
    ctaDesc: "Nhận tư vấn miễn phí với đội ngũ quản lý bất động sản của chúng tôi. Chúng tôi sẽ đánh giá bất động sản của bạn, đề xuất gói phù hợp và tiếp quản từ ngày đầu tiên.",
    ctaBtn: "Nhận tư vấn miễn phí",
    ctaWhatsApp: "WhatsApp ngay",
    breadcrumbs: ["Trang chủ", "Dịch vụ", "Quản lý bất động sản"],
  },
} as const;

type Locale = keyof typeof CONTENT;

interface Props { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const c = CONTENT[(locale as Locale)] || CONTENT.en;
  const url = canonical(locale, "/services/property-management");
  return {
    title: c.metaTitle,
    description: c.metaDesc,
    alternates: { canonical: url, languages: altLangs("/services/property-management") },
    openGraph: {
      title: c.metaTitle,
      description: c.metaDesc,
      url,
      type: "website",
      locale: OG_LOCALE[locale] ?? "en_AE",
      images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", title: c.metaTitle, description: c.metaDesc },
    keywords: locale === "ru"
      ? ["управление недвижимостью дубай", "управляющая компания дубай", "аренда недвижимость дубай управление"]
      : locale === "ar" // vi branch below
      ? ["إدارة العقارات دبي", "شركة إدارة عقارات دبي", "خدمات إدارة الإيجار دبي"]
      : locale === "zh"
      ? ["迪拜物业管理", "迪拜房产托管", "迪拜租赁管理"]
      : locale === "vi" ? ["quản lý bất động sản dubai", "quản lý bất động sản dubai chuyên nghiệp", "dịch vụ quản lý cho thuê dubai"] : locale === "he" ? ["ניהול נכסים Dubai","מנהל נכסים Dubai","ניהול וילות Dubai","ניהול השכרות Dubai","שירותי בעל נכס Dubai"] : ["property management dubai", "dubai property manager", "villa management dubai", "rental management dubai", "landlord services dubai"],
  };
}

export default async function PropertyManagementPage({ params }: Props) {
  const { locale } = await params;
  const c = CONTENT[locale as Locale] ?? CONTENT.en;
  const isRtl = locale === "ar" || locale === "he"; // ar, he are rtl; vi, zh, ru, en are ltr
  const lp = locale === "en" ? "" : `/${locale}`;

  const bcItems = [
    { name: c.breadcrumbs[0], href: `${lp}/` },
    { name: c.breadcrumbs[1], href: `${lp}/services` },
    { name: c.breadcrumbs[2], href: `${lp}/services/property-management` },
  ];

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? "rtl" : "ltr"}>
      <FAQJsonLd faqs={c.faqs.map(f => ({ question: f.question, answer: f.answer }))} />
      <BreadcrumbJsonLd items={bcItems} />
      <Navbar />

      {/* Hero */}
      <section
        className="relative overflow-hidden pt-20 sm:pt-32 pb-12 sm:pb-20 text-white"
        style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
      >
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)", backgroundSize: "48px 48px" }} />
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6">
          <p className="text-accent font-bold tracking-[0.4em] uppercase text-xs mb-4">{c.heroLabel}</p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-4">{c.h1}</h1>
          <p className="text-primary-foreground/80 text-lg leading-relaxed max-w-2xl mb-10">{c.heroDesc}</p>
          <Link
            href={`${lp}/contact`}
            className="inline-flex items-center gap-2 font-bold px-6 py-3 sm:px-8 sm:py-4 rounded-xl text-sm sm:text-base hover:opacity-90 transition-all"
            style={{ background: "linear-gradient(135deg, #D4A847, #B8922F)", color: "#fff" }}
          >
            {c.heroCta} →
          </Link>
        </div>
      </section>

      {/* Stats */}
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

        {/* Services */}
        <section>
          <div className="text-center mb-12">
            <p className="text-accent font-bold tracking-[0.35em] uppercase text-xs mb-3">Services</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">{c.servicesTitle}</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {c.services.map((s) => (
              <div key={s.title} className="bg-card border border-border/50 rounded-2xl p-6 hover:border-primary/20 transition-all">
                <div className="text-2xl mb-3">{s.icon}</div>
                <h3 className="text-base font-bold text-foreground mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Plans */}
        <section>
          <div className="text-center mb-12">
            <p className="text-accent font-bold tracking-[0.35em] uppercase text-xs mb-3">Pricing</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">{c.plansTitle}</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-5">
            {c.plans.map((plan, i) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-5 sm:p-7 border ${i === 1 ? "border-primary/40 shadow-lg" : "border-border/50 bg-card"}`}
                style={i === 1 ? { background: "linear-gradient(135deg, #0B3D2E08, #1A7A5A12)" } : {}}
              >
                {i === 1 && <div className="text-xs font-bold text-primary tracking-widest uppercase mb-3">Most Popular</div>}
                <h3 className="text-xl font-bold text-foreground mb-1">{plan.name}</h3>
                <p className="text-2xl font-black text-primary mb-5">{plan.fee}</p>
                <ul className="space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-primary mt-0.5">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={`${lp}/contact`}
                  className="mt-6 w-full flex items-center justify-center py-3 rounded-xl text-sm font-bold transition-all border"
                  style={i === 1
                    ? { background: "linear-gradient(135deg, #D4A847, #B8922F)", color: "#fff", borderColor: "transparent" }
                    : { borderColor: "var(--border)", color: "var(--foreground)" }
                  }
                >
                  {c.heroCta}
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Why */}
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

        {/* FAQ */}
        <section>
          <div className="text-center mb-12">
            <p className="text-accent font-bold tracking-[0.35em] uppercase text-xs mb-3">FAQ</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">{c.faqTitle}</h2>
          </div>
          <div className="space-y-3">
            {c.faqs.map((faq, i) => (
              <details key={i} className="group bg-card border border-border/50 rounded-2xl overflow-hidden hover:border-primary/20 transition-colors">
                <summary className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 sm:py-5 cursor-pointer list-none font-semibold text-foreground hover:text-primary transition-colors text-sm">
                  <span>{faq.question}</span>
                  <span className="text-accent text-xl font-light flex-shrink-0 transition-transform duration-200 group-open:rotate-45" aria-hidden="true">+</span>
                </summary>
                <div className="px-4 sm:px-6 pb-4 sm:pb-6 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/30 pt-3 sm:pt-4">{faq.answer}</div>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section
          className="rounded-2xl sm:rounded-3xl p-6 sm:p-10 lg:p-14 text-center text-white relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
        >
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)", backgroundSize: "32px 32px" }} />
          <div className="relative z-10">
            <p className="text-accent font-bold tracking-[0.4em] uppercase text-xs mb-4">Binayah Properties</p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">{c.ctaTitle}</h2>
            <p className="text-primary-foreground/75 text-lg mb-10 max-w-xl mx-auto">{c.ctaDesc}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
                {c.ctaWhatsApp}
              </a>
            </div>
          </div>
        </section>

      </div>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
