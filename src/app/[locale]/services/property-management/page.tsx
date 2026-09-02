/* eslint-disable i18next/no-literal-string -- multilingual SEO landing page */
import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { waHref, WA_DEFAULT_MESSAGE } from "@/lib/whatsapp";
import { FAQJsonLd, BreadcrumbJsonLd, ServiceJsonLd } from "@/components/JsonLd";
import { canonical, altLangs, OG_LOCALE, DEFAULT_OG_IMAGE } from "@/lib/site";

export const revalidate = 86400;

const CONTENT = {
  he: {
    "metaTitle": "ניהול נכסים בדובאי | חברת ניהול ושירותי בעלי נכסים | Binayah",
    "metaDesc": "חברת ניהול נכסים בדובאי המוסמכת על ידי RERA. שירותי בעלי נכסים: סינון שוכרים, גביית שכר דירה, EJARI, אחזקה ודיווח חודשי.",
    "heroLabel": "ניהול נכסים",
    "h1": "שירותי ניהול נכסים בדובאי",
    "heroDesc": "תנו ל-Binayah לטפל בהכול, מאיתור השוכר המתאים ועד אחזקה חודשית וגביית שכר דירה. הצוות המוסמך שלנו מטעם RERA פועל בשוק הנדל\"ן של דובאי משנת 2007 ומגן על ההשקעה שלכם בזמן שאתם מתמקדים במה שחשוב.",
    "heroCta": "קבלו ייעוץ חינם",
    "answerTitle": "מהו ניהול נכסים בדובאי וכמה זה עולה?",
    "answer": "ניהול נכסים בדובאי הוא שירות שבו חברה מוסמכת מטעם RERA מפעילה עבורכם את הנכס המושכר: תמחור היחידה ושיווקה, סינון שוכרים, ניסוח חוזה השכירות ורישומו ב-EJARI ברשות הקרקעות של דובאי, גביית שכר דירה, תיאום אחזקה, טיפול בחידושים לפי מדד השכירות של RERA, והגשת תביעה למרכז יישוב סכסוכי השכירות (RDC) במידת הצורך. השירות מיועד בעיקר לבעלי נכסים שגרים בחו\"ל, למשקיעים שמחזיקים כמה יחידות ולמי שפשוט לא רוצה את הטלפונים היומיומיים. דמי הניהול של Binayah נעים בין 5% ל-10% משכר הדירה בהתאם לתוכנית, ללא תשלום מקדמה, וכל התוכניות כוללות רישום EJARI ודיווח חודשי לבעלים.",
    "answerPoints": [
      { "k": "למי זה מתאים", "v": "בעלי נכסים בחו\"ל, משקיעים עם כמה יחידות ומי שרוצה השכרה ללא התעסקות." },
      { "k": "מה כלול", "v": "איתור וסינון שוכרים, EJARI, גביית שכר דירה, אחזקה, ביקורות, חידושים וסכסוכים." },
      { "k": "כמה זה עולה", "v": "5%-10% משכר הדירה בהתאם לתוכנית. ללא תשלום מקדמה, משלמים ככל ששכר הדירה נגבה." },
      { "k": "מי מנהל", "v": "צוות בדובאי המוסמך על ידי RERA. Binayah פועלת בנדל\"ן בדובאי משנת 2007." }
    ],
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
        "body": "מיחידה ריקה ועד שכר דירה משולם, אנו מטפלים בכל שלב כדי שלא תצטרכו. אידיאלי למשקיעים מחו\"ל ולבעלי דירות עסוקים."
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
        "body": "קבלנים מאושרים מראש לאינסטלציה, חשמל, מיזוג אוויר, ניקיון וצביעה. ללא הצעות מחיר מנופחות, אנו משתמשים בתמחור מכרזי תחרותי."
      },
      {
        "title": "גישה לפורטל הבעלים",
        "body": "התחברו בכל עת לצפייה בתשלומי שכר דירה, היסטוריית אחזקה, פרטי שוכרים ומסמכי נכס."
      },
      {
        "title": "תקשורת יזומה",
        "body": "אתם מקבלים הודעה מראש על חידושי שכירות, העלאות שכר דירה וכל בעיה, לפני שהיא הופכת לבעיה ממשית. הודעות חידוש נשלחות לפחות 90 יום מראש, כפי שמחייב חוק השכירות של דובאי."
      },
      {
        "title": "בדובאי משנת 2007",
        "body": "Binayah פועלת בשוק דובאי משנת 2007, לאורך כמה מחזורי שכירות. הניסיון הזה הוא שקובע איך אנחנו מתמחרים חידוש והיכן אנחנו מתווכחים על הצעת מחיר של קבלן."
      },
      {
        "title": "עמידה בחוק כברירת מחדל",
        "body": "חוזי שכירות, רישום EJARI, הודעות חידוש והעלאות שכר דירה פועלים לפי חוק השכירות של דובאי (חוק מס' 26 משנת 2007 כפי שתוקן בחוק מס' 33 משנת 2008) ולפי מדד השכירות של RERA."
      }
    ],
    "faqTitle": "שאלות נפוצות",
    "faqs": [
      {
        "question": "כמה עולה ניהול נכסים בדובאי?",
        "answer": "עמלות ניהול הנכסים של Binayah נעות בין 5% ל-10% משכר הדירה החודשי, בהתאם לרמת השירות. ניהול סטנדרטי (גביית שכר דירה, EJARI, אחזקה בסיסית) מתחיל מ-5% לחודש. ניהול שירות מלא הכולל איתור שוכרים, אחזקה 24/7 ותמיכה משפטית הוא 10% לחודש. אין עמלות מקדמה."
      },
      {
        "question": "מה כוללים שירותי ניהול נכסים בדובאי?",
        "answer": "חבילת ניהול נכסים מלאה כוללת: סינון ואיתור שוכרים, ניסוח חוזה שכירות, רישום EJARI, גביית שכר דירה והעברתו, תיאום אחזקה (חירום ומתוכננת), ביקורות נכס רבעוניות, דיווח כספי חודשי, משא ומתן על חידוש מול מדד השכירות של RERA ויישוב סכסוכים. Binayah מנהלת את כל מערכת היחסים בין בעל הדירה לשוכר בשמכם."
      },
      {
        "question": "האם Binayah יכולה לנהל את הנכס שלי אם אני גר בחו\"ל, והאם נדרש ייפוי כוח?",
        "answer": "כן, בעלי נכסים שגרים בחו\"ל הם אחד המקרים הנפוצים ביותר אצלנו. משקיעים מרוסיה, אירופה, סין ומדינות נוספות סומכים על Binayah לנהל את הנכסים שלהם בדובאי מרחוק: שכר הדירה מועבר ישירות לחשבון הבנק שלכם, הדוחות החודשיים מגיעים במייל או דרך פורטל הבעלים, ואין צורך להגיע לדובאי לצורך ניהול שוטף. לניהול השוטף די בהסכם ניהול חתום, ואין צורך בייפוי כוח. ייפוי כוח נוטריוני נדרש רק כאשר נציג צריך לחתום במקומכם, למשל במכירה או בהעברת בעלות ברשות הקרקעות של דובאי, וניתן לאמת אותו בדובאי או בחו\"ל דרך שגרירות איחוד האמירויות בצירוף תרגום משפטי לערבית."
      },
      {
        "question": "כמה מהר Binayah יכולה למצוא לי שוכר?",
        "answer": "עבור נכסים מתומחרים נכון, Binayah בדרך כלל מוצאת שוכר מתאים תוך 2-4 שבועות. אנו מפרסמים ב-Bayut, Propertyfinder, Dubizzle ובמאגר השוכרים המסוננים מראש שלנו. תוכניות הפרימיום והשירות המלא שלנו כוללות צילום מקצועי למיקסום ביצועי המודעה."
      },
      {
        "question": "מהו EJARI ומדוע הוא נדרש?",
        "answer": "EJARI היא מערכת רישום השכירות הרשמית בדובאי, הנדרשת על ידי רשות הקרקעות של דובאי (DLD) עבור כל חוזי השכירות. ללא רישום EJARI, שוכרים אינם יכולים לקבל אשרות תושבות באיחוד האמירויות, חיבורי תשתית או רישום לבתי ספר. הוא גם מגן על בעל הדירה ועל השוכר מבחינה משפטית. Binayah מטפלת ברישום EJARI כחלק מכל תוכניות הניהול."
      },
      {
        "question": "בכמה מותר להעלות את שכר הדירה בחידוש?",
        "answer": "העלאות שכר דירה בדובאי מוגבלות בצו מס' 43 משנת 2013 ומחושבות מול מדד השכירות של RERA, ולא לפי רצון בעל הנכס. אם שכר הדירה הנוכחי נמצא בטווח של 10% ממחיר השוק ליחידות דומות, אין אפשרות להעלות. ההעלאה מוגבלת ל-5% כאשר שכר הדירה נמוך מהשוק ב-11%-20%, ל-10% בפער של 21%-30%, ל-15% בפער של 31%-40% ול-20% בפער של יותר מ-40%. על כל העלאה או שינוי תנאים יש להודיע לשוכר בכתב לפחות 90 יום לפני החידוש. Binayah בודקת את המדד לפני כל חידוש ושולחת את ההודעה במועד."
      },
      {
        "question": "מה קורה אם שוכר לא משלם שכר דירה?",
        "answer": "ל-Binayah יש תהליך הסלמה מובנה: הודעות תזכורת, דרישה רשמית עם מועד של 30 יום שנמסרת דרך נוטריון או דואר רשום, ואם החוב נותר, תביעה במרכז יישוב סכסוכי השכירות (RDC). חוק איחוד האמירויות מאפשר לפנות שוכר שאינו משלם, אך תיק שנוי במחלוקת נמשך חודשים ולא שבועות. סינון שוכרים יסודי וניהול נכון של המחאות דחויות הם מה שבאמת מקטין את הסיכון."
      },
      {
        "question": "כיצד מטופלים סכסוכי שכירות בדובאי?",
        "answer": "סכסוכים בין בעל נכס לשוכר נדונים במרכז יישוב סכסוכי השכירות (RDC) שברשות הקרקעות של דובאי, לפי חוק מס' 26 משנת 2007 כפי שתוקן בחוק מס' 33 משנת 2008. כדי להגיש תביעה נדרש חוזה רשום ב-EJARI. אגרת ההגשה היא 3.5% משכר הדירה השנתי, במינימום 500 דירהם ובמקסימום 20,000 דירהם. רוב המקרים שאנחנו מטפלים בהם, איחור בתשלום, מחלוקות על חידוש וניכויים מהפיקדון, נסגרים לפני הגשה. כשאין ברירה, מנהל התיק שלכם מכין את התיק ומתאם ייצוג משפטי."
      },
      {
        "question": "מי משלם את דמי הניהול של הבניין, בעל הנכס או השוכר?",
        "answer": "דמי הניהול של הבניין (service charges) בדובאי הם הוצאה של בעל הנכס. הם משולמים לאגודת הבעלים או לחברת הניהול, מחושבים לפי רגל רבועה על בסיס מדד דמי הניהול המאושר על ידי RERA, ואינם מגולגלים על השוכר. השוכר משלם DEWA, חיוב קירור נפרד אם קיים, אינטרנט ואגרת דיור עירונית בשיעור 5% שנגבית דרך חשבון ה-DEWA. Binayah עוקבת אחר חשבונות דמי הניהול של נכסים מנוהלים כדי שלא יוחמצו תשלומים ולא ייחסם NOC בהמשך."
      },
      {
        "question": "עדיף להשכיר לטווח ארוך או כדירת נופש לטווח קצר?",
        "answer": "השכרה ארוכת טווח (שנתית) מספקת הכנסה צפויה, שוכר אחד, עלויות תחלופה נמוכות וציות פשוט דרך EJARI, ולכן מתאימה לרוב הבעלים. השכרה קצרת טווח יכולה להניב תשואה ברוטו גבוהה יותר באזורים תיירותיים, אך היא מחייבת רישיון דירת נופש ממחלקת הכלכלה והתיירות של דובאי לכל יחידה, גביית דירהם תיירות, עלויות תפעול וריהוט גבוהות יותר, והיא אינה מותרת בכל בניין. תוכניות הניהול של Binayah מכסות השכרה ארוכת טווח, ונאמר לכם בכנות איזה מודל מתאים ליחידה ולקהילה שלכם."
      },
      {
        "question": "האם אני יכול לעבור ל-Binayah אם כבר יש לי מנהל נכסים?",
        "answer": "כן. המעבר פשוט, אנו משתלטים על הניהול בעת חידוש החוזה או, במקרים מסוימים, במהלך השכירות הקיימת תוך מתן הודעה מתאימה למנהל הנוכחי. מנהל התיק שלכם ב-Binayah יטפל בכל תהליך המעבר."
      },
      {
        "question": "אילו סוגי נכסים Binayah מנהלת?",
        "answer": "אנו מנהלים את כל סוגי הנכסים למגורים: סטודיו, דירות עם 1-5 חדרי שינה, בתי עיר, וילות ופנטהאוזים. נכסים בכל הקהילות המרכזיות של דובאי כולל Dubai Marina, Downtown, Palm Jumeirah, JVC, Business Bay, Arabian Ranches ועוד."
      }
    ],
    "guidesTitle": "מדריכים שכדאי לבעלי נכסים לקרוא",
    "guides": [
      { "slug": "ejari-process", "title": "רישום EJARI, שלב אחר שלב" },
      { "slug": "rera-rental-index-rent-increase", "title": "מדד השכירות של RERA והעלאות שכר דירה" },
      { "slug": "rental-disputes-dubai-rdc", "title": "סכסוכי שכירות וה-RDC" },
      { "slug": "service-charges-explained", "title": "דמי ניהול בניין, הסבר מלא" },
      { "slug": "how-to-rent-in-dubai", "title": "איך עובדת שכירות בדובאי" },
      { "slug": "short-term-rental-dubai", "title": "השכרה קצרת טווח ודירות נופש" },
      { "slug": "power-of-attorney-property-dubai", "title": "ייפוי כוח לנכס בדובאי" },
      { "slug": "snagging-handover-inspection", "title": "בדיקת מסירה וליקויים" }
    ],
    "linksTitle": "שימושי גם",
    "links": [
      { "path": "/rent", "label": "נכסים להשכרה בדובאי" },
      { "path": "/list-your-property", "label": "פרסמו את הנכס שלכם" },
      { "path": "/valuation", "label": "הערכת שווי חינם" },
      { "path": "/team", "label": "הכירו את הצוות" },
      { "path": "/contact", "label": "דברו עם מנהל נכסים" }
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
    metaTitle: "Property Management Dubai | Landlord Services Company | Binayah",
    metaDesc: "RERA-certified property management company in Dubai. Landlord services covering tenant screening, rent collection, EJARI, maintenance and monthly owner reporting.",
    heroLabel: "PROPERTY MANAGEMENT",
    h1: "Property Management Services in Dubai",
    heroDesc: "Let Binayah handle everything, from finding the right tenant to monthly maintenance and rent collection. Our RERA-certified team has worked in Dubai real estate since 2007 and protects your investment while you focus on what matters.",
    heroCta: "Get a Free Consultation",
    answerTitle: "What is property management in Dubai, and what does it cost?",
    answer: "Property management in Dubai is a service in which a RERA-certified company runs your rented home on your behalf: pricing and marketing the unit, screening tenants, drafting the tenancy contract and registering it with EJARI at the Dubai Land Department, collecting rent, coordinating maintenance, handling renewals against the RERA rental index, and filing at the Rental Disputes Centre if something goes wrong. It is used mainly by overseas landlords, investors holding several units, and owners who simply do not want the day-to-day calls. Binayah's property management fees run from 5% to 10% of rent depending on the plan, with no upfront charge, and every plan includes EJARI registration and monthly owner reporting.",
    answerPoints: [
      { k: "Who it's for", v: "Overseas landlords, multi-unit investors, and owners who want a hands-off tenancy." },
      { k: "What it covers", v: "Tenant finding and screening, EJARI, rent collection, maintenance, inspections, renewals and disputes." },
      { k: "What it costs", v: "5%-10% of rent depending on the plan. No upfront fees, you pay as rent is collected." },
      { k: "Who runs it", v: "A Dubai-based, RERA-certified property management team. Binayah has worked in Dubai real estate since 2007." },
    ],
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
      { title: "End-to-End Service", body: "From empty unit to paid rent, we handle every step so you don't have to. Ideal for overseas investors and busy landlords." },
      { title: "Transparent Fees", body: "Simple percentage-based fees with no hidden charges. You only pay when rent is collected." },
      { title: "RERA-Certified Team", body: "All property managers are licensed by Dubai's Real Estate Regulatory Agency. Full legal compliance at every step." },
      { title: "Vetted Contractor Network", body: "Pre-approved contractors for plumbing, electrical, AC, cleaning, and painting. No inflated quotes, we use competitive tender pricing." },
      { title: "Owner Portal Access", body: "Log in anytime to view rent payments, maintenance history, tenant details, and property documents." },
      { title: "Proactive Communication", body: "You receive advance notice on lease renewals, rent increases, and any issues, before they become problems. Renewal notices go out at least 90 days ahead, as Dubai tenancy law requires." },
      { title: "In Dubai Since 2007", body: "Binayah has worked in the Dubai market since 2007, through several rental cycles. That history is what informs how we price a renewal and where we push back on a contractor quote." },
      { title: "Compliance Built In", body: "Tenancy contracts, EJARI registration, renewal notices and rent increases follow Dubai's tenancy law (Law No. 26 of 2007 as amended by Law No. 33 of 2008) and the RERA rental index." },
    ],
    faqTitle: "Frequently Asked Questions",
    faqs: [
      { question: "How much does property management cost in Dubai?", answer: "Binayah's property management fees range from 5% to 10% of monthly rent, depending on the service level. Standard management (rent collection, EJARI, basic maintenance) starts at 5%/month. Full-service management including tenant finding, 24/7 maintenance, and legal support is 10%/month. There are no upfront fees, and the fee is charged as rent is collected. Third-party costs such as EJARI registration, DEWA deposits and contractor invoices are billed at cost and shown in your monthly statement." },
      { question: "What is included in Dubai property management services?", answer: "A full-service property management package includes: tenant screening and placement, tenancy contract drafting, EJARI registration, rent collection and remittance, maintenance coordination (emergency and planned), quarterly property inspections, monthly financial reporting, renewal negotiation against the RERA rental index, and dispute resolution. Binayah manages the entire landlord-tenant relationship on your behalf." },
      { question: "Can Binayah manage my property if I live abroad, and do you need power of attorney?", answer: "Yes, overseas landlords are one of our most common cases. Russian, European, Chinese, and other international investors rely on Binayah to manage their Dubai investments remotely: rent is remitted to your bank account and monthly reports arrive by email or through the owner portal, and you never need to fly in for routine management. Routine management runs on a signed management agreement, not a power of attorney. A notarised power of attorney is only needed if you want a representative to sign for you on matters like selling or transferring the property at the Dubai Land Department, and it can be notarised in Dubai or attested abroad through the UAE embassy with a legal Arabic translation." },
      { question: "How quickly can Binayah find me a tenant?", answer: "For well-priced properties, Binayah typically finds a qualified tenant within 2-4 weeks. We list on Bayut, Propertyfinder, Dubizzle, and our own database of pre-qualified tenants. Our Premium and Full Service plans include professional photography to maximise listing performance." },
      { question: "What is EJARI and why is it required?", answer: "EJARI is the official tenancy registration system in Dubai, required by the Dubai Land Department for all rental contracts. Without EJARI registration, tenants cannot get UAE residency visas, utility connections, or school enrolments, and a landlord cannot file a case at the Rental Disputes Centre. It also protects both landlord and tenant legally. Binayah handles EJARI registration as part of all management plans." },
      { question: "How much can I increase the rent when the tenancy renews?", answer: "Rent increases in Dubai are capped by Decree No. 43 of 2013 and calculated against the RERA rental index, not by what the landlord would like to charge. If the current rent is within 10% of the market rate for comparable units, no increase is permitted. Increases are capped at 5% where rent is 11-20% below market, 10% where it is 21-30% below, 15% where it is 31-40% below, and 20% where it is more than 40% below. Any increase or change of terms must be notified to the tenant in writing at least 90 days before renewal. Binayah checks the index before every renewal and issues the notice on time." },
      { question: "What happens if a tenant doesn't pay the rent?", answer: "Binayah runs a structured escalation: reminder notices, a formal 30-day notice to settle served through a notary or registered post, and, if the arrears remain, a case at the Rental Disputes Centre (RDC). UAE law allows landlords to evict non-paying tenants, though a contested case typically takes months rather than weeks. Thorough tenant screening and post-dated cheque management are what actually keep default risk low." },
      { question: "How are rental disputes handled in Dubai?", answer: "Landlord-tenant disputes are heard by the Rental Disputes Centre (RDC), part of the Dubai Land Department, under Law No. 26 of 2007 as amended by Law No. 33 of 2008. A registered EJARI contract is required to file. The filing fee is 3.5% of the annual rent, subject to a minimum of AED 500 and a maximum of AED 20,000. Most matters we handle, late payment, renewal disagreements, deposit deductions, are resolved before filing. Where a case is unavoidable, your account manager prepares the file and coordinates legal representation." },
      { question: "Who pays the service charges, the landlord or the tenant?", answer: "Service charges are an owner cost in Dubai. They are paid by the landlord to the owners association or building management, calculated per square foot against the service charge index approved by RERA, and they are not passed to the tenant. The tenant pays DEWA, cooling or chiller charges where these are billed separately, internet, and the 5% Dubai Municipality housing fee collected through the DEWA bill. Binayah tracks service charge invoices for managed units so payments are not missed and an NOC is not blocked later." },
      { question: "Should I let my property long-term or as a short-term holiday home?", answer: "Long-term (annual) letting gives predictable income, one tenant, low turnover cost and simple compliance through EJARI, which is why it suits most owners. Short-term holiday-home letting can produce higher gross returns in tourist-heavy communities but requires a permit from Dubai's Department of Economy and Tourism for each unit, tourism dirham collection, higher operating and furnishing costs, and it is not allowed under every building's rules. Binayah's management plans cover long-term tenancies, and we will tell you honestly which model your specific unit and community are suited to." },
      { question: "Can I switch to Binayah if I already have a property manager?", answer: "Yes. Switching is straightforward, we take over management at lease renewal or, in some cases, during the existing tenancy with proper notice to the current manager. Your Binayah account manager collects the tenancy contract, EJARI certificate, cheques and maintenance history and handles the full transition process." },
      { question: "What types of properties does Binayah manage?", answer: "We manage all residential property types: studios, 1-5 bedroom apartments, townhouses, villas, and penthouses. Properties across all major Dubai communities including Dubai Marina, Downtown, Palm Jumeirah, JVC, Business Bay, Arabian Ranches, and more." },
    ],
    guidesTitle: "Landlord guides worth reading",
    guides: [
      { slug: "ejari-process", title: "EJARI registration, step by step" },
      { slug: "rera-rental-index-rent-increase", title: "RERA rental index and rent increases" },
      { slug: "rental-disputes-dubai-rdc", title: "Rental disputes and the RDC" },
      { slug: "service-charges-explained", title: "Service charges explained" },
      { slug: "how-to-rent-in-dubai", title: "How renting in Dubai works" },
      { slug: "short-term-rental-dubai", title: "Short-term and holiday-home letting" },
      { slug: "power-of-attorney-property-dubai", title: "Power of attorney for Dubai property" },
      { slug: "snagging-handover-inspection", title: "Snagging and handover inspection" },
    ],
    linksTitle: "Also useful",
    links: [
      { path: "/rent", label: "Browse Dubai rentals" },
      { path: "/list-your-property", label: "List your property" },
      { path: "/valuation", label: "Free property valuation" },
      { path: "/team", label: "Meet the team" },
      { path: "/contact", label: "Talk to a property manager" },
    ],
    ctaTitle: "Start Managing Smarter",
    ctaDesc: "Get a free consultation with our property management team. We'll assess your property, recommend the right plan, and take over from day one.",
    ctaBtn: "Get Free Consultation",
    ctaWhatsApp: "WhatsApp Us",
    breadcrumbs: ["Home", "Services", "Property Management"],
  },

  fr: {
    metaTitle: "Gestion locative Dubaï | Société de gestion immobilière | Binayah",
    metaDesc: "Société de gestion locative certifiée RERA à Dubaï. Services propriétaire : sélection des locataires, encaissement des loyers, EJARI, entretien et reporting mensuel.",
    heroLabel: "GESTION LOCATIVE",
    h1: "Services de gestion locative à Dubaï",
    heroDesc: "Laissez Binayah tout gérer, de la recherche du bon locataire à l'entretien mensuel et à l'encaissement des loyers. Notre équipe certifiée RERA travaille sur le marché immobilier de Dubaï depuis 2007 et protège votre investissement pendant que vous vous concentrez sur l'essentiel.",
    heroCta: "Obtenez une consultation gratuite",
    answerTitle: "Qu'est-ce que la gestion locative à Dubaï et combien coûte-t-elle ?",
    answer: "La gestion locative à Dubaï est un service par lequel une société certifiée RERA administre votre bien loué à votre place : positionnement du loyer et diffusion de l'annonce, sélection des locataires, rédaction du contrat de location et enregistrement EJARI auprès du Dubai Land Department, encaissement des loyers, coordination de l'entretien, renouvellements calculés selon l'indice locatif de la RERA et saisine du centre de règlement des litiges locatifs en cas de problème. Elle s'adresse avant tout aux propriétaires résidant à l'étranger, aux investisseurs détenant plusieurs lots et à ceux qui ne veulent tout simplement plus gérer le quotidien. Les honoraires de gestion de Binayah vont de 5 % à 10 % du loyer selon la formule, sans frais initiaux, et chaque formule inclut l'enregistrement EJARI et un reporting mensuel au propriétaire.",
    answerPoints: [
      { k: "Pour qui", v: "Propriétaires expatriés, investisseurs multi-lots et bailleurs qui veulent une location sans contrainte." },
      { k: "Ce qui est couvert", v: "Recherche et sélection des locataires, EJARI, encaissement des loyers, entretien, inspections, renouvellements et litiges." },
      { k: "Combien ça coûte", v: "5 % à 10 % du loyer selon la formule. Aucuns frais initiaux, vous payez à mesure que le loyer est encaissé." },
      { k: "Qui s'en charge", v: "Une équipe basée à Dubaï et certifiée RERA. Binayah exerce dans l'immobilier à Dubaï depuis 2007." },
    ],
    stats: [
      { n: "19+", label: "Ans de gestion locative à Dubaï" },
      { n: "RERA", label: "Équipe de gestion certifiée" },
      { n: "95%", label: "Taux de fidélisation des locataires" },
      { n: "48h", label: "Délai moyen de réponse aux locataires" },
    ],
    servicesTitle: "Ce qui est inclus",
    services: [
      { icon: "🏡", title: "Sélection et placement des locataires", body: "Vérification des antécédents, contrôle de l'emploi et examen de l'historique locatif. Nous ne plaçons que des locataires répondant aux critères de qualification stricts de Binayah." },
      { icon: "💰", title: "Encaissement et reversement des loyers", body: "Encaissement mensuel des loyers, gestion des chèques et reversement direct sur votre compte. Reporting numérique complet avec confirmations de paiement." },
      { icon: "🔧", title: "Entretien et réparations", body: "Coordination de l'entretien 24h/24 et 7j/7 avec notre réseau d'artisans agréés. Plans d'entretien préventif pour préserver la valeur du bien et limiter les coûts d'urgence." },
      { icon: "📋", title: "EJARI et conformité légale", body: "Rédaction des contrats de location, enregistrement EJARI auprès du Dubai Land Department et pleine conformité aux lois locatives des Émirats (décret n° 33)." },
      { icon: "📊", title: "Reporting mensuel", body: "Relevés mensuels détaillés couvrant les loyers perçus, les dépenses d'entretien et la performance du bien. Accessibles via votre portail propriétaire Binayah." },
      { icon: "⚖️", title: "Règlement des litiges", body: "Médiation experte et accompagnement juridique pour les litiges locatifs. L'équipe formée RERA gère les expulsions, les négociations de renouvellement et les dépôts auprès du RDC." },
    ],
    plansTitle: "Formules de gestion",
    plans: [
      { name: "Standard", fee: "5 % / mois", features: ["Encaissement des loyers", "Enregistrement EJARI", "Communication avec le locataire", "Coordination de l'entretien de base", "Relevés mensuels"] },
      { name: "Premium", fee: "8 % / mois", features: ["Tout ce qui est inclus dans Standard", "Photographie professionnelle + annonce", "Sélection et placement des locataires", "Réponse entretien 24h/24 et 7j/7", "Inspection trimestrielle du bien", "Gestionnaire de compte dédié"] },
      { name: "Service complet", fee: "10 % / mois", features: ["Tout ce qui est inclus dans Premium", "Gestion de projets de rénovation", "Mise en service et gestion des services publics", "Révision annuelle du loyer de marché", "Traitement des litiges juridiques", "Portail propriétaire avec données en temps réel"] },
    ],
    whyTitle: "Pourquoi choisir Binayah pour la gestion locative",
    whyPoints: [
      { title: "Service de bout en bout", body: "Du logement vide au loyer perçu, nous gérons chaque étape pour vous. Idéal pour les investisseurs étrangers et les propriétaires occupés." },
      { title: "Honoraires transparents", body: "Des honoraires simples, basés sur un pourcentage, sans frais cachés. Vous ne payez que lorsque le loyer est encaissé." },
      { title: "Équipe certifiée RERA", body: "Tous les gestionnaires immobiliers sont agréés par l'agence de régulation immobilière de Dubaï (RERA). Pleine conformité légale à chaque étape." },
      { title: "Réseau d'artisans agréés", body: "Artisans pré-approuvés pour la plomberie, l'électricité, la climatisation, le nettoyage et la peinture. Pas de devis gonflés, nous recourons à une mise en concurrence tarifaire." },
      { title: "Accès au portail propriétaire", body: "Connectez-vous à tout moment pour consulter les paiements de loyer, l'historique d'entretien, les informations sur les locataires et les documents du bien." },
      { title: "Communication proactive", body: "Vous êtes prévenu à l'avance des renouvellements de bail, des augmentations de loyer et de tout problème, avant qu'il ne devienne un souci. Les préavis de renouvellement partent au moins 90 jours à l'avance, comme l'exige la loi locative de Dubaï." },
      { title: "À Dubaï depuis 2007", body: "Binayah travaille sur le marché de Dubaï depuis 2007, à travers plusieurs cycles locatifs. C'est cette expérience qui guide la façon dont nous fixons un loyer de renouvellement et dont nous contestons un devis d'artisan." },
      { title: "Conformité intégrée", body: "Contrats de location, enregistrement EJARI, préavis de renouvellement et augmentations de loyer suivent la loi locative de Dubaï (loi n° 26 de 2007 modifiée par la loi n° 33 de 2008) et l'indice locatif de la RERA." },
    ],
    faqTitle: "Questions fréquentes",
    faqs: [
      { question: "Combien coûte la gestion locative à Dubaï ?", answer: "Les honoraires de gestion locative de Binayah varient de 5 % à 10 % du loyer mensuel, selon le niveau de service. La gestion standard (encaissement des loyers, EJARI, entretien de base) démarre à 5 %/mois. La gestion en service complet, incluant la recherche de locataires, l'entretien 24h/24 et 7j/7 et l'accompagnement juridique, s'élève à 10 %/mois. Il n'y a aucuns frais initiaux." },
      { question: "Que comprennent les services de gestion locative à Dubaï ?", answer: "Une formule de gestion locative en service complet comprend : la sélection et le placement des locataires, la rédaction du contrat de location, l'enregistrement EJARI, l'encaissement et le reversement des loyers, la coordination de l'entretien (urgent et planifié), les inspections trimestrielles du bien, le reporting financier mensuel, la négociation du renouvellement selon l'indice locatif de la RERA et le règlement des litiges. Binayah gère l'intégralité de la relation propriétaire-locataire pour votre compte." },
      { question: "Binayah peut-elle gérer mon bien si je réside à l'étranger, et avez-vous besoin d'une procuration ?", answer: "Oui, les propriétaires non-résidents sont l'un de nos cas les plus fréquents. Des investisseurs russes, européens, chinois et d'autres pays font confiance à Binayah pour gérer leurs biens à Dubaï à distance : le loyer est viré sur votre compte bancaire, les rapports mensuels arrivent par e-mail ou via le portail propriétaire, et vous n'avez jamais besoin de venir à Dubaï pour la gestion courante. La gestion courante repose sur un mandat de gestion signé, pas sur une procuration. Une procuration notariée n'est nécessaire que si un représentant doit signer à votre place, par exemple pour vendre ou transférer le bien auprès du Dubai Land Department ; elle peut être notariée à Dubaï ou légalisée à l'étranger via l'ambassade des Émirats avec une traduction assermentée en arabe." },
      { question: "En combien de temps Binayah peut-elle me trouver un locataire ?", answer: "Pour les biens correctement positionnés en prix, Binayah trouve généralement un locataire qualifié en 2 à 4 semaines. Nous publions sur Bayut, Propertyfinder, Dubizzle et dans notre propre base de locataires pré-qualifiés. Nos formules Premium et Service complet incluent une photographie professionnelle pour maximiser la performance de l'annonce." },
      { question: "Qu'est-ce que l'EJARI et pourquoi est-il obligatoire ?", answer: "EJARI est le système officiel d'enregistrement des locations à Dubaï, exigé par le Dubai Land Department pour tous les contrats de location. Sans enregistrement EJARI, les locataires ne peuvent obtenir de visa de résidence aux Émirats, de raccordement aux services publics ni d'inscription scolaire. Il protège également le propriétaire et le locataire sur le plan juridique. Binayah prend en charge l'enregistrement EJARI dans toutes ses formules de gestion." },
      { question: "De combien puis-je augmenter le loyer au renouvellement ?", answer: "Les augmentations de loyer à Dubaï sont plafonnées par le décret n° 43 de 2013 et calculées par rapport à l'indice locatif de la RERA, et non selon le souhait du propriétaire. Si le loyer actuel se situe à moins de 10 % du prix de marché pour des biens comparables, aucune augmentation n'est autorisée. Le plafond est de 5 % lorsque le loyer est inférieur de 11 à 20 % au marché, 10 % de 21 à 30 %, 15 % de 31 à 40 %, et 20 % au-delà de 40 %. Toute augmentation ou modification des conditions doit être notifiée par écrit au locataire au moins 90 jours avant le renouvellement. Binayah vérifie l'indice avant chaque renouvellement et envoie le préavis dans les délais." },
      { question: "Que se passe-t-il si un locataire ne paie pas son loyer ?", answer: "Binayah applique un processus d'escalade structuré : avis de rappel, mise en demeure formelle de 30 jours signifiée par notaire ou courrier recommandé et, si l'impayé persiste, une procédure devant le centre de règlement des litiges locatifs (RDC). La loi émirienne autorise l'expulsion d'un locataire défaillant, mais une affaire contestée se compte en mois. Une sélection rigoureuse des locataires et une bonne gestion des chèques post-datés restent la meilleure protection contre les impayés." },
      { question: "Comment les litiges locatifs sont-ils traités à Dubaï ?", answer: "Les litiges entre propriétaire et locataire relèvent du centre de règlement des litiges locatifs (RDC), rattaché au Dubai Land Department, en application de la loi n° 26 de 2007 modifiée par la loi n° 33 de 2008. Un contrat enregistré sous EJARI est indispensable pour déposer un dossier. Les frais de dépôt s'élèvent à 3,5 % du loyer annuel, avec un minimum de 500 AED et un maximum de 20 000 AED. La plupart des situations que nous traitons, retards de paiement, désaccords sur le renouvellement, retenues sur dépôt, se règlent avant tout dépôt de dossier. Lorsqu'une procédure est inévitable, votre gestionnaire de compte constitue le dossier et coordonne la représentation juridique." },
      { question: "Qui paie les charges de copropriété, le propriétaire ou le locataire ?", answer: "À Dubaï, les charges de copropriété (service charges) sont à la charge du propriétaire. Elles sont versées à l'association des propriétaires ou au gestionnaire de l'immeuble, calculées au pied carré selon l'indice de charges approuvé par la RERA, et ne sont pas répercutées sur le locataire. Le locataire paie la DEWA, la climatisation centralisée lorsqu'elle est facturée séparément, l'internet et la taxe d'habitation municipale de 5 % prélevée sur la facture DEWA. Binayah suit les appels de charges des biens gérés afin qu'aucun paiement ne soit oublié et qu'aucun NOC ne soit bloqué plus tard." },
      { question: "Faut-il louer en longue durée ou en location saisonnière ?", answer: "La location longue durée (annuelle) offre des revenus prévisibles, un seul locataire, peu de frais de rotation et une conformité simple via EJARI, ce qui convient à la majorité des propriétaires. La location saisonnière peut générer un rendement brut supérieur dans les quartiers touristiques, mais elle exige un permis « holiday home » du Département de l'Économie et du Tourisme de Dubaï pour chaque logement, la collecte du dirham touristique, des coûts d'exploitation et d'ameublement plus élevés, et elle n'est pas autorisée dans tous les immeubles. Les formules de gestion Binayah couvrent la location longue durée, et nous vous dirons franchement quel modèle convient à votre bien et à votre communauté." },
      { question: "Puis-je passer chez Binayah si j'ai déjà un gestionnaire immobilier ?", answer: "Oui. Le changement est simple, nous reprenons la gestion au renouvellement du bail ou, dans certains cas, en cours de bail moyennant un préavis adéquat au gestionnaire actuel. Votre gestionnaire de compte Binayah récupère le contrat de location, le certificat EJARI, les chèques et l'historique d'entretien, et prend en charge l'intégralité de la transition." },
      { question: "Quels types de biens Binayah gère-t-elle ?", answer: "Nous gérons tous les types de biens résidentiels : studios, appartements de 1 à 5 chambres, maisons de ville, villas et penthouses. Des biens dans toutes les grandes communautés de Dubaï, notamment Dubai Marina, Downtown, Palm Jumeirah, JVC, Business Bay, Arabian Ranches, et bien d'autres." },
    ],
    guidesTitle: "Guides utiles pour les propriétaires",
    guides: [
      { slug: "ejari-process", title: "L'enregistrement EJARI, étape par étape" },
      { slug: "rera-rental-index-rent-increase", title: "Indice locatif RERA et augmentations de loyer" },
      { slug: "rental-disputes-dubai-rdc", title: "Litiges locatifs et RDC" },
      { slug: "service-charges-explained", title: "Les charges de copropriété expliquées" },
      { slug: "how-to-rent-in-dubai", title: "Comment fonctionne la location à Dubaï" },
      { slug: "short-term-rental-dubai", title: "Location saisonnière et holiday homes" },
      { slug: "power-of-attorney-property-dubai", title: "La procuration immobilière à Dubaï" },
      { slug: "snagging-handover-inspection", title: "Réception du bien et levée des réserves" },
    ],
    linksTitle: "Également utile",
    links: [
      { path: "/rent", label: "Locations à Dubaï" },
      { path: "/list-your-property", label: "Confier mon bien" },
      { path: "/valuation", label: "Estimation gratuite" },
      { path: "/team", label: "Découvrir l'équipe" },
      { path: "/contact", label: "Parler à un gestionnaire" },
    ],
    ctaTitle: "Gérez plus intelligemment",
    ctaDesc: "Obtenez une consultation gratuite avec notre équipe de gestion locative. Nous évaluerons votre bien, recommanderons la formule adaptée et prendrons le relais dès le premier jour.",
    ctaBtn: "Consultation gratuite",
    ctaWhatsApp: "Écrivez-nous sur WhatsApp",
    breadcrumbs: ["Accueil", "Services", "Gestion locative"],
  },

  ru: {
    metaTitle: "Управление недвижимостью в Дубае | Управляющая компания | Binayah",
    metaDesc: "RERA-сертифицированная управляющая компания в Дубае. Услуги для собственников: поиск арендаторов, сбор аренды, EJARI, обслуживание и ежемесячная отчётность.",
    heroLabel: "УПРАВЛЕНИЕ НЕДВИЖИМОСТЬЮ",
    h1: "Управление недвижимостью в Дубае",
    heroDesc: "Доверьте Binayah всё, от поиска арендатора до ежемесячного обслуживания и сбора аренды. RERA-сертифицированная команда работает на рынке Дубая с 2007 года и защитит ваши инвестиции, пока вы занимаетесь важными делами. Обслуживание на русском языке.",
    heroCta: "Бесплатная консультация",
    answerTitle: "Что такое управление недвижимостью в Дубае и сколько это стоит?",
    answer: "Управление недвижимостью в Дубае — это услуга, при которой RERA-сертифицированная компания ведёт вашу сдаваемую квартиру или виллу за вас: определяет ставку и размещает объявление, проверяет арендаторов, готовит договор найма и регистрирует его в EJARI в Земельном департаменте Дубая, собирает аренду, координирует обслуживание, продлевает договор с учётом индекса аренды RERA и при необходимости подаёт дело в Центр разрешения арендных споров (RDC). Услугой пользуются прежде всего собственники, живущие за рубежом, инвесторы с несколькими объектами и те, кто просто не хочет заниматься ежедневными вопросами. Комиссия Binayah за управление составляет от 5% до 10% от аренды в зависимости от плана, без авансовых платежей; регистрация EJARI и ежемесячная отчётность входят во все планы.",
    answerPoints: [
      { k: "Для кого", v: "Собственники за рубежом, инвесторы с несколькими объектами и те, кому нужна аренда без забот." },
      { k: "Что входит", v: "Поиск и проверка арендаторов, EJARI, сбор аренды, обслуживание, инспекции, продления и споры." },
      { k: "Сколько стоит", v: "5-10% от аренды в зависимости от плана. Авансовых платежей нет, оплата по мере поступления аренды." },
      { k: "Кто ведёт", v: "Команда в Дубае с сертификацией RERA. Binayah работает на рынке недвижимости Дубая с 2007 года." },
    ],
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
      { title: "Полный сервис", body: "От пустой квартиры до оплаченной аренды, мы берём на себя каждый шаг. Идеально для зарубежных инвесторов." },
      { title: "Прозрачные тарифы", body: "Простые процентные комиссии без скрытых платежей. Оплата только после получения аренды." },
      { title: "RERA-сертификация", body: "Все управляющие имеют лицензию RERA. Полное соответствие законодательству ОАЭ на каждом этапе." },
      { title: "Проверенная сеть подрядчиков", body: "Одобренные подрядчики для сантехники, электрики, кондиционирования, уборки и покраски по конкурентным ценам." },
      { title: "Портал владельца", body: "Входите в любое время для просмотра платежей по аренде, истории обслуживания и документов." },
      { title: "Обслуживание на русском языке", body: "Полная поддержка на русском. Мы регулярно управляем объектами российских инвесторов дистанционно." },
      { title: "В Дубае с 2007 года", body: "Binayah работает на рынке Дубая с 2007 года и прошла несколько арендных циклов. Этот опыт определяет, как мы считаем ставку при продлении и где оспариваем счёт подрядчика." },
      { title: "Соответствие закону по умолчанию", body: "Договоры найма, регистрация EJARI, уведомления о продлении и повышение аренды соответствуют законодательству Дубая (Закон № 26 от 2007 г. с изменениями по Закону № 33 от 2008 г.) и индексу аренды RERA." },
    ],
    faqTitle: "Частые вопросы",
    faqs: [
      { question: "Сколько стоит управление недвижимостью в Дубае?", answer: "Тарифы Binayah составляют 5-10% от ежемесячной аренды в зависимости от уровня обслуживания. Стандартное управление (сбор аренды, EJARI, базовое обслуживание) начинается от 5%/мес., полный сервис — 10%/мес. Авансовых платежей нет, комиссия удерживается по мере поступления аренды. Расходы третьих сторон (регистрация EJARI, депозиты DEWA, счета подрядчиков) выставляются по себестоимости и отражаются в ежемесячном отчёте." },
      { question: "Что входит в услуги по управлению недвижимостью в Дубае?", answer: "Полный пакет включает: поиск и проверку арендаторов, составление договора найма, регистрацию EJARI, сбор и перечисление аренды, координацию обслуживания (аварийного и планового), квартальные инспекции, ежемесячные финансовые отчёты, пересмотр ставки при продлении по индексу RERA и урегулирование споров. Binayah ведёт все отношения с арендатором от вашего имени." },
      { question: "Может ли Binayah управлять объектом, если я нахожусь за рубежом, и нужна ли доверенность?", answer: "Да, зарубежные собственники — один из наших основных сценариев. Российские, европейские, китайские и другие инвесторы доверяют Binayah дистанционное управление своей дубайской недвижимостью: аренда перечисляется на ваш банковский счёт, ежемесячные отчёты приходят по электронной почте или в портал владельца, приезжать в Дубай для текущего управления не нужно. Для текущего управления достаточно подписанного договора управления, доверенность не требуется. Нотариальная доверенность нужна только тогда, когда представитель должен подписывать за вас, например при продаже или переоформлении объекта в Земельном департаменте; её оформляют у нотариуса в Дубае либо заверяют за рубежом через посольство ОАЭ с присяжным переводом на арабский." },
      { question: "Как быстро Binayah найдёт арендатора?", answer: "Для правильно оценённых объектов Binayah обычно находит квалифицированного арендатора за 2-4 недели. Размещаем на Bayut, Propertyfinder, Dubizzle и в нашей базе предварительно проверенных арендаторов. Планы «Премиум» и «Полный сервис» включают профессиональную фотосъёмку." },
      { question: "Что такое EJARI и зачем он нужен?", answer: "EJARI — официальная система регистрации договоров аренды в Дубае, обязательная для всех арендных контрактов. Без регистрации EJARI арендаторы не могут получить визу ОАЭ, подключить коммунальные услуги или записать детей в школу, а собственник не может подать дело в Центр разрешения арендных споров. Binayah берёт регистрацию EJARI на себя во всех планах." },
      { question: "На сколько можно повысить аренду при продлении договора?", answer: "Повышение аренды в Дубае ограничено Декретом № 43 от 2013 года и считается по индексу аренды RERA, а не по желанию собственника. Если текущая ставка отличается от рыночной менее чем на 10%, повышение не допускается. Далее действуют пределы: 5% при отставании от рынка на 11-20%, 10% — на 21-30%, 15% — на 31-40% и 20% — более чем на 40%. О любом повышении или изменении условий арендатора нужно письменно уведомить не менее чем за 90 дней до продления. Binayah сверяет индекс перед каждым продлением и направляет уведомление в срок." },
      { question: "Что происходит, если арендатор не платит?", answer: "У нас структурированный процесс: напоминания, официальное 30-дневное требование через нотариуса или заказным письмом и, если долг сохраняется, дело в Центре разрешения арендных споров (RDC). Закон ОАЭ позволяет выселить неплательщика, но спорное дело занимает месяцы, а не недели. Тщательная проверка арендаторов и работа с постдатированными чеками реально снижают риск неплатежей." },
      { question: "Как в Дубае решаются арендные споры?", answer: "Споры между собственником и арендатором рассматривает Центр разрешения арендных споров (RDC) при Земельном департаменте Дубая на основании Закона № 26 от 2007 года с изменениями по Закону № 33 от 2008 года. Для подачи дела нужен зарегистрированный договор EJARI. Пошлина — 3,5% от годовой аренды, минимум 500 дирхамов, максимум 20 000 дирхамов. Большинство ситуаций (просрочка, разногласия по продлению, удержания из депозита) мы закрываем до подачи. Если дело неизбежно, ваш менеджер готовит материалы и координирует юридическое представительство." },
      { question: "Кто платит сервисные сборы — собственник или арендатор?", answer: "Сервисные сборы (service charges) в Дубае платит собственник. Они перечисляются ассоциации собственников или управляющей компании здания, считаются за квадратный фут по индексу сервисных сборов, утверждённому RERA, и не перекладываются на арендатора. Арендатор оплачивает DEWA, охлаждение (чиллер), если оно выставляется отдельно, интернет и муниципальный жилищный сбор 5%, который списывается через счёт DEWA. Binayah отслеживает счета по сервисным сборам управляемых объектов, чтобы платёж не был пропущен и позже не заблокировали NOC." },
      { question: "Сдавать долгосрочно или посуточно?", answer: "Долгосрочная (годовая) аренда даёт предсказуемый доход, одного арендатора, низкие расходы на смену жильцов и простое оформление через EJARI, поэтому подходит большинству собственников. Краткосрочная аренда может дать более высокую валовую доходность в туристических районах, но требует разрешения holiday home от Департамента экономики и туризма Дубая на каждый объект, уплаты туристического дирхама, более высоких операционных расходов и меблировки, и разрешена не во всех зданиях. Планы Binayah охватывают долгосрочную аренду, и мы честно скажем, какая модель подходит именно вашему объекту." },
      { question: "Можно ли перейти в Binayah, если у меня уже есть управляющий?", answer: "Да. Переход простой: мы принимаем управление при продлении договора или, в отдельных случаях, в течение текущей аренды с надлежащим уведомлением прежнего управляющего. Ваш менеджер Binayah соберёт договор найма, сертификат EJARI, чеки и историю обслуживания и проведёт весь переход." },
      { question: "Какими объектами управляет Binayah?", answer: "Все типы жилой недвижимости: студии, квартиры с 1-5 спальнями, таунхаусы, виллы и пентхаусы во всех основных районах Дубая: Марина, Даунтаун, Пальма Джумейра, JVC, Бизнес-Бей и других." },
    ],
    guidesTitle: "Полезные гайды для собственников",
    guides: [
      { slug: "ejari-process", title: "Регистрация EJARI: пошагово" },
      { slug: "rera-rental-index-rent-increase", title: "Индекс аренды RERA и повышение ставки" },
      { slug: "rental-disputes-dubai-rdc", title: "Арендные споры и RDC" },
      { slug: "service-charges-explained", title: "Сервисные сборы: что это и сколько" },
      { slug: "how-to-rent-in-dubai", title: "Как устроена аренда в Дубае" },
      { slug: "short-term-rental-dubai", title: "Краткосрочная аренда в Дубае" },
      { slug: "power-of-attorney-property-dubai", title: "Доверенность на недвижимость в Дубае" },
      { slug: "snagging-handover-inspection", title: "Приёмка объекта и снагинг" },
    ],
    linksTitle: "Также полезно",
    links: [
      { path: "/rent", label: "Аренда в Дубае" },
      { path: "/list-your-property", label: "Сдать объект через нас" },
      { path: "/valuation", label: "Бесплатная оценка" },
      { path: "/team", label: "Наша команда" },
      { path: "/contact", label: "Связаться с управляющим" },
    ],
    ctaTitle: "Начните управлять эффективнее",
    ctaDesc: "Получите бесплатную консультацию с нашей командой по управлению недвижимостью. Мы оценим объект, подберём оптимальный план и возьмёмся за работу сразу.",
    ctaBtn: "Бесплатная консультация",
    ctaWhatsApp: "WhatsApp",
    breadcrumbs: ["Главная", "Услуги", "Управление недвижимостью"],
  },

  ar: {
    metaTitle: "إدارة العقارات في دبي | شركة إدارة أملاك معتمدة | بناية للعقارات",
    metaDesc: "شركة إدارة عقارات في دبي معتمدة من RERA. خدمات الملاك: فحص المستأجرين، تحصيل الإيجار، تسجيل إيجاري، الصيانة والتقارير الشهرية.",
    heroLabel: "إدارة العقارات",
    h1: "خدمات إدارة العقارات في دبي",
    heroDesc: "دع بناية تتولى كل شيء, من إيجاد المستأجر المناسب إلى الصيانة الشهرية وتحصيل الإيجار. فريقنا المعتمد من RERA يعمل في سوق دبي العقاري منذ عام 2007 ويحمي استثمارك بينما أنت تنصرف لما يهمّك.",
    heroCta: "استشارة مجانية",
    answerTitle: "ما هي إدارة العقارات في دبي وكم تكلفتها؟",
    answer: "إدارة العقارات في دبي خدمة تتولى فيها شركة معتمدة من RERA تشغيل عقارك المؤجَّر نيابةً عنك: تسعير الوحدة وتسويقها، فحص المستأجرين، صياغة عقد الإيجار وتسجيله في إيجاري لدى دائرة الأراضي والأملاك، تحصيل الإيجار، تنسيق الصيانة، إدارة التجديد وفق مؤشر الإيجارات الصادر عن RERA، ورفع الدعوى أمام مركز فضّ المنازعات الإيجارية عند الحاجة. تناسب الخدمة بالدرجة الأولى الملاك المقيمين خارج الدولة، والمستثمرين الذين يملكون أكثر من وحدة، ومن لا يرغب في متابعة التفاصيل اليومية. تتراوح رسوم بناية للإدارة بين 5% و10% من الإيجار حسب الخطة، دون رسوم مقدَّمة، وتشمل جميع الخطط تسجيل إيجاري والتقارير الشهرية للمالك.",
    answerPoints: [
      { k: "لمن هذه الخدمة", v: "الملاك خارج الدولة، وأصحاب الوحدات المتعددة، ومن يريد إيجارًا بلا متابعة يومية." },
      { k: "ما الذي تغطيه", v: "إيجاد المستأجر وفحصه، إيجاري، تحصيل الإيجار، الصيانة، الفحوصات، التجديد وفضّ النزاعات." },
      { k: "كم تكلّف", v: "من 5% إلى 10% من الإيجار حسب الخطة. لا رسوم مقدَّمة، والدفع مع تحصيل الإيجار." },
      { k: "من يديرها", v: "فريق في دبي معتمد من RERA. تعمل بناية في عقارات دبي منذ عام 2007." },
    ],
    stats: [
      { n: "+19", label: "عامًا في إدارة عقارات دبي" },
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
      { title: "خدمة متكاملة", body: "من الوحدة الفارغة إلى الإيجار المدفوع, نتولى كل خطوة. مثالية للمستثمرين من الخارج." },
      { title: "رسوم شفافة", body: "رسوم بسيطة بنسبة مئوية دون رسوم مخفية. تدفع فقط عند تحصيل الإيجار." },
      { title: "اعتماد RERA", body: "جميع المديرين العقاريين مرخَّصون من RERA. امتثال قانوني كامل في كل مرحلة." },
      { title: "شبكة مقاولين معتمدين", body: "مقاولون معتمدون مسبقًا للسباكة والكهرباء والتكييف والتنظيف والدهان بأسعار تنافسية." },
      { title: "بوابة المالك", body: "سجِّل الدخول في أي وقت لعرض مدفوعات الإيجار وسجل الصيانة والمستندات." },
      { title: "تواصل استباقي", body: "تتلقى إشعارًا مسبقًا بتجديد عقود الإيجار وزيادات الإيجار وأي مشكلات, قبل أن تتفاقم. تُرسل إشعارات التجديد قبل 90 يومًا على الأقل كما يقتضي قانون الإيجارات في دبي." },
      { title: "في دبي منذ 2007", body: "تعمل بناية في سوق دبي منذ عام 2007 وعبر أكثر من دورة إيجارية. هذه الخبرة هي ما يحدد كيف نُسعّر التجديد وأين نناقش عرض سعر المقاول." },
      { title: "الامتثال جزء من الخدمة", body: "عقود الإيجار وتسجيل إيجاري وإشعارات التجديد وزيادات الإيجار تتبع قانون إيجارات دبي (القانون رقم 26 لسنة 2007 وتعديلاته بالقانون رقم 33 لسنة 2008) ومؤشر الإيجارات الصادر عن RERA." },
    ],
    faqTitle: "الأسئلة الشائعة",
    faqs: [
      { question: "كم تكلّف إدارة العقارات في دبي؟", answer: "تتراوح رسوم بناية للإدارة بين 5% و10% من الإيجار الشهري حسب مستوى الخدمة. الإدارة القياسية (تحصيل الإيجار، إيجاري، الصيانة الأساسية) تبدأ من 5%/شهر، والخدمة الكاملة 10%/شهر. لا رسوم مقدَّمة، وتُحتسب الرسوم مع تحصيل الإيجار. أما تكاليف الجهات الأخرى مثل رسوم تسجيل إيجاري وتأمين ديوا وفواتير المقاولين فتُحمَّل بالتكلفة وتظهر في كشفك الشهري." },
      { question: "ما الذي تشمله خدمات إدارة العقارات في دبي؟", answer: "تشمل الخدمة المتكاملة: فحص المستأجرين وتأهيلهم، صياغة عقد الإيجار، تسجيل إيجاري، تحصيل الإيجار وتحويله، تنسيق الصيانة (الطارئة والمجدولة)، الفحوصات الربع سنوية، التقارير المالية الشهرية، التفاوض على التجديد وفق مؤشر الإيجارات، وفضّ النزاعات. تدير بناية علاقة المالك بالمستأجر بالكامل نيابةً عنك." },
      { question: "هل يمكن لبناية إدارة عقاري إذا كنت خارج الإمارات، وهل تحتاجون إلى وكالة؟", answer: "نعم، الملاك المقيمون خارج الدولة من أكثر حالاتنا شيوعًا. يعتمد علينا مستثمرون من روسيا وأوروبا والصين وغيرها لإدارة عقاراتهم في دبي عن بُعد: يُحوَّل الإيجار إلى حسابك البنكي وتصلك التقارير الشهرية بالبريد الإلكتروني أو عبر بوابة المالك، ولا تحتاج إلى الحضور إلى دبي للإدارة اليومية. تكفي اتفاقية الإدارة الموقَّعة للإدارة اليومية، ولا حاجة إلى وكالة. الوكالة الموثَّقة مطلوبة فقط عندما يوقّع عنك ممثل في أمور مثل البيع أو نقل الملكية لدى دائرة الأراضي والأملاك، ويمكن توثيقها في دبي أو تصديقها في الخارج عبر سفارة الإمارات مع ترجمة قانونية إلى العربية." },
      { question: "كم يستغرق إيجاد مستأجر؟", answer: "للعقارات المسعَّرة بشكل مناسب، تجد بناية عادةً مستأجرًا مؤهَّلًا خلال 2-4 أسابيع. نُدرج العقار على Bayut وPropertyfinder وDubizzle وقاعدة بياناتنا من المستأجرين المؤهَّلين، وتشمل خطتا «مميز» و«خدمة كاملة» التصوير الاحترافي." },
      { question: "ما هو إيجاري ولماذا هو مطلوب؟", answer: "إيجاري نظام التسجيل الرسمي لعقود الإيجار في دبي وتشترطه دائرة الأراضي والأملاك لكل عقد. بدون تسجيل إيجاري لا يستطيع المستأجر الحصول على إقامة أو توصيل الخدمات أو تسجيل الأطفال في المدارس، ولا يستطيع المالك رفع دعوى أمام مركز فضّ المنازعات الإيجارية. تتولى بناية تسجيل إيجاري ضمن جميع خطط الإدارة." },
      { question: "كم يمكنني زيادة الإيجار عند التجديد؟", answer: "زيادات الإيجار في دبي محكومة بالمرسوم رقم 43 لسنة 2013 وتُحتسب وفق مؤشر الإيجارات الصادر عن RERA لا وفق رغبة المالك. إذا كان الإيجار الحالي ضمن 10% من سعر السوق للوحدات المماثلة فلا زيادة. وتكون الزيادة 5% إذا كان الإيجار أقل من السوق بنسبة 11-20%، و10% عند 21-30%، و15% عند 31-40%، و20% عند أكثر من 40%. ويجب إخطار المستأجر كتابةً بأي زيادة أو تعديل للشروط قبل 90 يومًا على الأقل من التجديد. تتحقق بناية من المؤشر قبل كل تجديد وترسل الإشعار في موعده." },
      { question: "ماذا يحدث إذا لم يدفع المستأجر الإيجار؟", answer: "لدينا عملية تصعيد منظَّمة: إشعارات تذكير، ثم إنذار رسمي بمهلة 30 يومًا عبر كاتب العدل أو البريد المسجَّل، ثم دعوى أمام مركز فضّ المنازعات الإيجارية (RDC) إذا استمر التأخر. يسمح القانون الإماراتي بإخلاء المستأجر المتخلف عن السداد، لكن الدعوى المتنازع عليها تستغرق أشهرًا لا أسابيع. الفحص الدقيق للمستأجرين وإدارة الشيكات المؤجَّلة هما ما يقلّل المخاطر فعليًا." },
      { question: "كيف تُحلّ النزاعات الإيجارية في دبي؟", answer: "ينظر مركز فضّ المنازعات الإيجارية (RDC) التابع لدائرة الأراضي والأملاك في نزاعات المالك والمستأجر وفق القانون رقم 26 لسنة 2007 وتعديلاته بالقانون رقم 33 لسنة 2008. ويشترط لرفع الدعوى وجود عقد مسجَّل في إيجاري. رسوم رفع الدعوى 3.5% من الإيجار السنوي بحد أدنى 500 درهم وحد أقصى 20,000 درهم. معظم الحالات التي نتعامل معها, تأخر السداد وخلافات التجديد وخصومات التأمين, تُحسم قبل رفع الدعوى. وعند تعذّر ذلك يُجهّز مدير حسابك الملف وينسّق التمثيل القانوني." },
      { question: "من يدفع رسوم الخدمة، المالك أم المستأجر؟", answer: "رسوم الخدمة في دبي على المالك. تُدفع لاتحاد الملاك أو إدارة المبنى وتُحتسب لكل قدم مربع وفق مؤشر رسوم الخدمة المعتمد من RERA، ولا تُحمَّل على المستأجر. أما المستأجر فيدفع ديوا ورسوم التبريد إذا كانت تُفوتر منفصلة والإنترنت ورسوم السكن البلدية بنسبة 5% التي تُحصَّل عبر فاتورة ديوا. تتابع بناية فواتير رسوم الخدمة للوحدات المُدارة حتى لا يفوت السداد ولا تتعطل شهادة عدم الممانعة لاحقًا." },
      { question: "هل أؤجّر عقاري طويل الأجل أم كمسكن عطلات قصير الأجل؟", answer: "الإيجار السنوي طويل الأجل يمنح دخلًا ثابتًا ومستأجرًا واحدًا وتكلفة دوران منخفضة وامتثالًا بسيطًا عبر إيجاري، ولهذا يناسب معظم الملاك. أما التأجير قصير الأجل فقد يحقق عائدًا إجماليًا أعلى في المناطق السياحية، لكنه يتطلب تصريح مسكن عطلات من دائرة الاقتصاد والسياحة في دبي لكل وحدة، وتحصيل درهم السياحة، وتكاليف تشغيل وتأثيث أعلى، وهو غير مسموح في كل المباني. تغطي خطط بناية الإيجار طويل الأجل، وسنخبرك بصراحة أي نموذج يناسب وحدتك ومجتمعك السكني." },
      { question: "هل يمكنني التحول إلى بناية إذا كان لديّ مدير عقاري بالفعل؟", answer: "نعم. التحول بسيط: نتسلّم الإدارة عند تجديد العقد أو، في بعض الحالات، أثناء الإيجار الحالي بعد إخطار المدير الحالي بشكل صحيح. يجمع مدير حسابك في بناية عقد الإيجار وشهادة إيجاري والشيكات وسجل الصيانة ويتولى عملية الانتقال بالكامل." },
      { question: "ما أنواع العقارات التي تديرها بناية؟", answer: "ندير جميع أنواع العقارات السكنية: الاستوديوهات والشقق من غرفة إلى خمس غرف والتاون هاوس والفلل والبنتهاوس، في جميع مجتمعات دبي الرئيسية بما فيها دبي مارينا وداون تاون ونخلة جميرا وقرية جميرا الدائرية والخليج التجاري ومزارع العرب وغيرها." },
    ],
    guidesTitle: "أدلة مفيدة للملاك",
    guides: [
      { slug: "ejari-process", title: "تسجيل إيجاري خطوة بخطوة" },
      { slug: "rera-rental-index-rent-increase", title: "مؤشر الإيجارات وزيادة الإيجار" },
      { slug: "rental-disputes-dubai-rdc", title: "النزاعات الإيجارية ومركز فضّ المنازعات" },
      { slug: "service-charges-explained", title: "رسوم الخدمة بالتفصيل" },
      { slug: "how-to-rent-in-dubai", title: "كيف يعمل الإيجار في دبي" },
      { slug: "short-term-rental-dubai", title: "التأجير قصير الأجل ومساكن العطلات" },
      { slug: "power-of-attorney-property-dubai", title: "الوكالة العقارية في دبي" },
      { slug: "snagging-handover-inspection", title: "فحص التسليم والملاحظات" },
    ],
    linksTitle: "مفيد أيضًا",
    links: [
      { path: "/rent", label: "عقارات للإيجار في دبي" },
      { path: "/list-your-property", label: "أدرج عقارك معنا" },
      { path: "/valuation", label: "تقييم مجاني للعقار" },
      { path: "/team", label: "تعرّف على الفريق" },
      { path: "/contact", label: "تحدّث إلى مدير عقاري" },
    ],
    ctaTitle: "ابدأ الإدارة الذكية",
    ctaDesc: "احصل على استشارة مجانية مع فريق الإدارة العقارية لدينا. سنُقيَّم عقارك ونُوصي بالخطة المناسبة.",
    ctaBtn: "استشارة مجانية",
    ctaWhatsApp: "واتساب",
    breadcrumbs: ["الرئيسية", "الخدمات", "إدارة العقارات"],
  },

  zh: {
    metaTitle: "迪拜物业管理公司 | 房东托管服务 | Binayah Properties",
    metaDesc: "RERA认证的迪拜物业管理公司，提供全套房东服务：租客筛选、租金收取、EJARI登记、维修协调与月度报告。",
    heroLabel: "物业管理",
    h1: "迪拜物业管理服务",
    heroDesc: "让Binayah处理一切, , 从寻找合适租客到每月维护和租金收取。我们的RERA认证团队自2007年起深耕迪拜房地产市场，保护您的投资，并提供全程中文服务。",
    heroCta: "免费咨询",
    answerTitle: "什么是迪拜物业管理？费用是多少？",
    answer: "迪拜物业管理是指由持有RERA认证的公司代业主运营出租房产：定价与推广房源、筛选租客、起草租赁合同并在迪拜土地局完成EJARI登记、收取租金、协调维修、依据RERA租金指数处理续约，必要时向租赁纠纷中心（RDC）提起案件。这项服务主要面向身在海外的业主、持有多套房产的投资者，以及不愿处理日常琐事的房东。Binayah的管理费为租金的5%至10%（视方案而定），无前期费用，所有方案均包含EJARI登记与月度业主报告。",
    answerPoints: [
      { k: "适合谁", v: "海外业主、持有多套房产的投资者，以及希望省心出租的房东。" },
      { k: "包含什么", v: "找租客与背景筛选、EJARI登记、租金收取、维修、验房、续约与纠纷处理。" },
      { k: "费用多少", v: "租金的5%-10%，视方案而定。无前期费用，收到租金后才收费。" },
      { k: "谁来执行", v: "位于迪拜的RERA认证团队。Binayah自2007年起从事迪拜房地产业务。" },
    ],
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
      { title: "端到端服务", body: "从空置单元到收取租金, , 我们处理每一步。非常适合海外投资者和繁忙的房东。" },
      { title: "透明收费", body: "简单的按比例收费，无隐性收费。只有在收取租金后才付费。" },
      { title: "RERA认证团队", body: "所有物业经理均持有RERA执照，每个环节完全符合阿联酋法律要求。" },
      { title: "审核承包商网络", body: "水暖、电气、空调、清洁和粉刷的预审承包商，提供竞争性报价。" },
      { title: "业主门户", body: "随时登录查看租金付款、维修历史、租客信息和物业文件。" },
      { title: "中文全程支持", body: "提供完整中文服务，我们定期为中国投资者远程管理迪拜房产。" },
      { title: "自2007年扎根迪拜", body: "Binayah自2007年起在迪拜市场经营，经历了多个租赁周期。这些经验决定了我们如何定价续约租金，以及在哪些环节对承包商报价提出异议。" },
      { title: "合规内置于流程", body: "租赁合同、EJARI登记、续约通知和租金上调均遵循迪拜租赁法（2007年第26号法律及其2008年第33号法律修订）与RERA租金指数。" },
    ],
    faqTitle: "常见问题解答",
    faqs: [
      { question: "迪拜物业管理费用是多少？", answer: "Binayah的物业管理费用为月租金的5%-10%，具体取决于服务级别。标准管理（租金收取、EJARI登记、基础维修）从5%/月起，全托管服务为10%/月。无前期费用，收到租金后才计费。EJARI登记费、DEWA押金和承包商发票等第三方费用按成本代付，并在月度报表中列明。" },
      { question: "迪拜物业管理服务包含哪些内容？", answer: "全托管服务包括：租客筛选与安置、租赁合同起草、EJARI登记、租金收取与汇款、维修协调（紧急与计划性）、季度物业检查、月度财务报告、依据RERA租金指数进行的续约谈判，以及纠纷解决。Binayah代您管理全部房东与租客关系。" },
      { question: "如果我在海外，Binayah可以管理我的物业吗？需要授权委托书吗？", answer: "可以，海外业主是我们最常见的客户之一。中国、俄罗斯、欧洲及其他国家的投资者信赖Binayah远程管理他们的迪拜房产：租金直接汇入您的银行账户，月度报告通过电子邮件或业主门户发送，日常管理无需您亲自到迪拜。日常管理只需签署管理协议，不需要授权委托书。只有在需要代表您签字的事项上（例如在迪拜土地局出售或过户房产）才需要经公证的授权委托书，可在迪拜公证，或在海外经阿联酋使馆认证并附阿拉伯语法律翻译件。" },
      { question: "Binayah多快能找到租客？", answer: "对于定价合理的物业，Binayah通常在2-4周内找到合格租客。我们在Bayut、Propertyfinder、Dubizzle和我们的预审租客数据库上发布房源，高级方案与全托管方案还包含专业摄影。" },
      { question: "什么是EJARI，为什么需要它？", answer: "EJARI是迪拜官方租赁登记系统，迪拜土地局要求所有租赁合同登记。没有EJARI登记，租客无法获得居住签证、接通水电或为孩子办理入学，业主也无法向租赁纠纷中心提起案件。Binayah将EJARI登记纳入所有管理方案。" },
      { question: "续约时租金最多可以上调多少？", answer: "迪拜的租金上调受2013年第43号法令约束，依据RERA租金指数计算，而非由房东自行决定。若现租金与同类房源市场价的差距在10%以内，则不得上调；低于市场价11%-20%时上限为5%，21%-30%时为10%，31%-40%时为15%，超过40%时为20%。任何涨租或条款变更都必须在续约前至少90天书面通知租客。Binayah会在每次续约前核对指数并按时发出通知。" },
      { question: "如果租客不付租金怎么办？", answer: "我们有结构化的升级程序：提醒通知、通过公证处或挂号信送达的30天正式催缴通知，若欠租仍未解决，则通过租赁纠纷中心（RDC）提起案件。阿联酋法律允许房东驱逐欠租租客，但有争议的案件通常需要数月而非数周。严格的租客筛选和远期支票管理才是真正降低违约风险的手段。" },
      { question: "迪拜的租赁纠纷如何处理？", answer: "房东与租客的纠纷由迪拜土地局下属的租赁纠纷中心（RDC）依据2007年第26号法律（经2008年第33号法律修订）审理。提起案件必须持有已登记的EJARI合同。立案费为年租金的3.5%，最低500迪拉姆，最高20,000迪拉姆。我们处理的多数问题（逾期付款、续约分歧、押金扣除）在立案前即已解决；确需立案时，由您的客户经理准备卷宗并协调法律代理。" },
      { question: "物业服务费由房东还是租客承担？", answer: "在迪拜，物业服务费（service charges）由业主承担。该费用支付给业主协会或大楼管理方，按每平方英尺、依据RERA核准的服务费指数计算，不转嫁给租客。租客承担DEWA水电费、单独计费的中央供冷费、网络费，以及通过DEWA账单代收的5%市政房产税。Binayah会跟踪托管房源的服务费账单，避免漏缴而在日后影响NOC的办理。" },
      { question: "应该长租还是做短租民宿？", answer: "长租（年租）收入稳定、租客单一、周转成本低，通过EJARI合规也很简单，因此适合大多数业主。短租民宿在旅游密集社区可能带来更高的毛收益，但每套房源都需要向迪拜经济与旅游部申请度假屋许可、代收旅游迪拉姆，运营与家具成本更高，且并非所有楼盘都允许。Binayah的管理方案覆盖长租，我们会坦率地告诉您您的房源与社区更适合哪种模式。" },
      { question: "我已有物业管理方，可以转到Binayah吗？", answer: "可以。转换很简单：我们在租约续约时接手，某些情况下也可在现有租期内接手，前提是按规定通知现管理方。您的Binayah客户经理会收集租赁合同、EJARI证书、支票和维修记录，并处理整个交接过程。" },
      { question: "Binayah管理哪些类型的物业？", answer: "我们管理所有住宅类型：单间公寓、1-5卧室公寓、联排别墅、别墅和顶层公寓，覆盖迪拜所有主要社区，包括迪拜码头、市中心、棕榈朱美拉、JVC、商业湾和阿拉伯牧场等。" },
    ],
    guidesTitle: "房东必读指南",
    guides: [
      { slug: "ejari-process", title: "EJARI登记流程详解" },
      { slug: "rera-rental-index-rent-increase", title: "RERA租金指数与涨租规则" },
      { slug: "rental-disputes-dubai-rdc", title: "租赁纠纷与RDC" },
      { slug: "service-charges-explained", title: "物业服务费解析" },
      { slug: "how-to-rent-in-dubai", title: "迪拜租房流程" },
      { slug: "short-term-rental-dubai", title: "迪拜短租与度假屋" },
      { slug: "power-of-attorney-property-dubai", title: "迪拜房产授权委托书" },
      { slug: "snagging-handover-inspection", title: "交房验收与瑕疵检查" },
    ],
    linksTitle: "其他实用页面",
    links: [
      { path: "/rent", label: "浏览迪拜租盘" },
      { path: "/list-your-property", label: "委托出租房源" },
      { path: "/valuation", label: "免费房产估值" },
      { path: "/team", label: "了解我们的团队" },
      { path: "/contact", label: "联系物业经理" },
    ],
    ctaTitle: "开始智能管理",
    ctaDesc: "与我们的物业管理团队进行免费咨询。我们将评估您的物业，推荐合适的方案，并从第一天就开始接手管理。",
    ctaBtn: "免费咨询",
    ctaWhatsApp: "WhatsApp咨询",
    breadcrumbs: ["首页", "服务", "物业管理"],
  },

  vi: {
    metaTitle: "Quản lý bất động sản Dubai | Công ty dịch vụ chủ nhà | Binayah",
    metaDesc: "Công ty quản lý bất động sản tại Dubai được RERA chứng nhận. Dịch vụ chủ nhà: sàng lọc khách thuê, thu tiền thuê, EJARI, bảo trì và báo cáo hàng tháng.",
    heroLabel: "QUẢN LÝ BẤT ĐỘNG SẢN",
    h1: "Dịch vụ quản lý bất động sản tại Dubai",
    heroDesc: "Để Binayah xử lý mọi thứ, từ tìm khách thuê phù hợp đến bảo trì hàng tháng và thu tiền thuê. Đội ngũ được chứng nhận RERA của chúng tôi đã hoạt động trên thị trường bất động sản Dubai từ năm 2007 và bảo vệ khoản đầu tư của bạn trong khi bạn tập trung vào điều quan trọng.",
    heroCta: "Nhận tư vấn miễn phí",
    answerTitle: "Quản lý bất động sản tại Dubai là gì và chi phí bao nhiêu?",
    answer: "Quản lý bất động sản tại Dubai là dịch vụ trong đó một công ty được RERA chứng nhận vận hành căn nhà cho thuê thay mặt chủ sở hữu: định giá và quảng bá căn hộ, sàng lọc khách thuê, soạn hợp đồng thuê và đăng ký EJARI tại Sở Đất đai Dubai, thu tiền thuê, điều phối bảo trì, xử lý gia hạn theo chỉ số giá thuê của RERA và nộp hồ sơ lên Trung tâm Giải quyết Tranh chấp Thuê (RDC) khi cần. Dịch vụ chủ yếu dành cho chủ nhà đang sống ở nước ngoài, nhà đầu tư sở hữu nhiều căn và những người không muốn bận tâm chuyện hằng ngày. Phí quản lý của Binayah từ 5% đến 10% tiền thuê tùy gói, không thu phí trả trước, và mọi gói đều bao gồm đăng ký EJARI cùng báo cáo hàng tháng cho chủ sở hữu.",
    answerPoints: [
      { k: "Dành cho ai", v: "Chủ nhà ở nước ngoài, nhà đầu tư nhiều căn và chủ sở hữu muốn cho thuê không phải bận tâm." },
      { k: "Bao gồm những gì", v: "Tìm và sàng lọc khách thuê, EJARI, thu tiền thuê, bảo trì, kiểm tra, gia hạn và tranh chấp." },
      { k: "Chi phí bao nhiêu", v: "5%-10% tiền thuê tùy gói. Không phí trả trước, bạn trả khi tiền thuê được thu." },
      { k: "Ai thực hiện", v: "Đội ngũ tại Dubai được RERA chứng nhận. Binayah hoạt động trong bất động sản Dubai từ năm 2007." },
    ],
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
      { title: "Dịch vụ trọn gói", body: "Từ căn trống đến tiền thuê được trả, chúng tôi xử lý mọi bước để bạn không phải làm. Lý tưởng cho nhà đầu tư ở nước ngoài và chủ nhà bận rộn." },
      { title: "Phí minh bạch", body: "Phí dựa trên tỷ lệ phần trăm đơn giản, không phí ẩn. Bạn chỉ trả khi tiền thuê được thu." },
      { title: "Đội ngũ được chứng nhận RERA", body: "Mọi quản lý bất động sản đều được cấp phép bởi Cơ quan Quản lý Bất động sản của Dubai. Tuân thủ pháp lý đầy đủ ở mọi bước." },
      { title: "Mạng lưới nhà thầu đã kiểm duyệt", body: "Nhà thầu được phê duyệt trước cho ống nước, điện, điều hòa, vệ sinh và sơn. Không báo giá thổi phồng, chúng tôi sử dụng giá đấu thầu cạnh tranh." },
      { title: "Truy cập cổng chủ sở hữu", body: "Đăng nhập bất cứ lúc nào để xem thanh toán tiền thuê, lịch sử bảo trì, chi tiết khách thuê và tài liệu bất động sản." },
      { title: "Giao tiếp chủ động", body: "Bạn nhận thông báo trước về gia hạn hợp đồng thuê, tăng tiền thuê và bất kỳ vấn đề nào, trước khi chúng trở thành rắc rối. Thông báo gia hạn được gửi trước ít nhất 90 ngày theo luật thuê nhà Dubai." },
      { title: "Có mặt tại Dubai từ 2007", body: "Binayah hoạt động trên thị trường Dubai từ năm 2007, qua nhiều chu kỳ cho thuê. Chính kinh nghiệm đó quyết định cách chúng tôi định giá gia hạn và chỗ nào cần đàm phán lại báo giá của nhà thầu." },
      { title: "Tuân thủ ngay từ đầu", body: "Hợp đồng thuê, đăng ký EJARI, thông báo gia hạn và mức tăng tiền thuê đều tuân theo luật thuê nhà Dubai (Luật số 26 năm 2007, sửa đổi bởi Luật số 33 năm 2008) và chỉ số giá thuê của RERA." },
    ],
    faqTitle: "Câu hỏi thường gặp",
    faqs: [
      { question: "Quản lý bất động sản tại Dubai tốn bao nhiêu?", answer: "Phí quản lý bất động sản của Binayah dao động từ 5% đến 10% tiền thuê hàng tháng, tùy mức dịch vụ. Quản lý tiêu chuẩn (thu tiền thuê, EJARI, bảo trì cơ bản) khởi điểm từ 5%/tháng. Quản lý trọn gói bao gồm tìm khách thuê, bảo trì 24/7 và hỗ trợ pháp lý là 10%/tháng. Không có phí trả trước." },
      { question: "Dịch vụ quản lý bất động sản tại Dubai bao gồm những gì?", answer: "Gói quản lý bất động sản trọn gói bao gồm: sàng lọc và bố trí khách thuê, soạn thảo hợp đồng thuê, đăng ký EJARI, thu và chuyển tiền thuê, điều phối bảo trì (khẩn cấp và theo kế hoạch), kiểm tra bất động sản hàng quý, báo cáo tài chính hàng tháng, đàm phán gia hạn theo chỉ số giá thuê của RERA và giải quyết tranh chấp. Binayah quản lý toàn bộ mối quan hệ chủ nhà-khách thuê thay mặt bạn." },
      { question: "Binayah có thể quản lý bất động sản của tôi nếu tôi sống ở nước ngoài không, và có cần giấy ủy quyền không?", answer: "Có, chủ nhà ở nước ngoài là một trong những trường hợp phổ biến nhất của chúng tôi. Các nhà đầu tư Nga, châu Âu, Trung Quốc và quốc tế khác tin tưởng Binayah quản lý bất động sản Dubai của họ từ xa: tiền thuê được chuyển thẳng vào tài khoản ngân hàng, báo cáo hàng tháng gửi qua email hoặc cổng chủ sở hữu, và bạn không bao giờ cần bay sang Dubai cho việc quản lý thường lệ. Quản lý thường lệ chỉ cần hợp đồng quản lý đã ký, không cần giấy ủy quyền. Giấy ủy quyền công chứng chỉ cần khi bạn muốn người đại diện ký thay trong các việc như bán hoặc sang tên bất động sản tại Sở Đất đai Dubai; giấy này có thể công chứng tại Dubai hoặc hợp pháp hóa ở nước ngoài qua đại sứ quán UAE kèm bản dịch pháp lý tiếng Ả Rập." },
      { question: "Binayah có thể tìm khách thuê cho tôi nhanh thế nào?", answer: "Với bất động sản định giá tốt, Binayah thường tìm được khách thuê đủ điều kiện trong vòng 2-4 tuần. Chúng tôi niêm yết trên Bayut, Propertyfinder, Dubizzle và cơ sở dữ liệu khách thuê đã sàng lọc trước của riêng mình. Gói Cao cấp và Trọn gói của chúng tôi bao gồm ảnh chuyên nghiệp để tối đa hóa hiệu suất tin đăng." },
      { question: "EJARI là gì và vì sao cần nó?", answer: "EJARI là hệ thống đăng ký thuê chính thức tại Dubai, do Sở Đất đai Dubai yêu cầu cho mọi hợp đồng thuê. Không có đăng ký EJARI, khách thuê không thể nhận thị thực cư trú UAE, kết nối tiện ích hoặc đăng ký học. Nó cũng bảo vệ cả chủ nhà và khách thuê về mặt pháp lý. Binayah xử lý đăng ký EJARI như một phần của mọi gói quản lý." },
      { question: "Tôi được tăng tiền thuê bao nhiêu khi gia hạn?", answer: "Mức tăng tiền thuê tại Dubai bị giới hạn bởi Nghị định số 43 năm 2013 và được tính theo chỉ số giá thuê của RERA, không theo mong muốn của chủ nhà. Nếu tiền thuê hiện tại chênh dưới 10% so với giá thị trường của các căn tương đương thì không được tăng. Mức trần là 5% khi tiền thuê thấp hơn thị trường 11-20%, 10% khi thấp hơn 21-30%, 15% khi thấp hơn 31-40% và 20% khi thấp hơn trên 40%. Mọi thay đổi về giá hay điều khoản phải thông báo cho khách thuê bằng văn bản ít nhất 90 ngày trước khi gia hạn. Binayah kiểm tra chỉ số trước mỗi lần gia hạn và gửi thông báo đúng hạn." },
      { question: "Điều gì xảy ra nếu khách thuê không trả tiền thuê?", answer: "Binayah có quy trình leo thang có cấu trúc: thông báo nhắc nhở, thư yêu cầu thanh toán chính thức trong 30 ngày gửi qua công chứng viên hoặc thư bảo đảm, và nếu vẫn nợ thì nộp hồ sơ lên Trung tâm Giải quyết Tranh chấp Thuê (RDC). Luật UAE cho phép chủ nhà trục xuất khách thuê không trả tiền, dù một vụ tranh chấp thường mất vài tháng chứ không phải vài tuần. Sàng lọc khách thuê kỹ lưỡng và quản lý chi phiếu ghi ngày sau mới là thứ thực sự giảm rủi ro." },
      { question: "Tranh chấp cho thuê tại Dubai được giải quyết như thế nào?", answer: "Tranh chấp giữa chủ nhà và khách thuê do Trung tâm Giải quyết Tranh chấp Thuê (RDC) thuộc Sở Đất đai Dubai xét xử theo Luật số 26 năm 2007, sửa đổi bởi Luật số 33 năm 2008. Muốn nộp hồ sơ phải có hợp đồng đã đăng ký EJARI. Phí nộp hồ sơ là 3,5% tiền thuê năm, tối thiểu 500 AED và tối đa 20.000 AED. Phần lớn vụ việc chúng tôi xử lý, chậm thanh toán, bất đồng khi gia hạn, khấu trừ tiền cọc, đều được giải quyết trước khi nộp hồ sơ. Khi buộc phải khởi kiện, quản lý tài khoản của bạn chuẩn bị hồ sơ và điều phối đại diện pháp lý." },
      { question: "Ai trả phí dịch vụ, chủ nhà hay khách thuê?", answer: "Tại Dubai, phí dịch vụ (service charges) là chi phí của chủ sở hữu. Khoản này nộp cho hiệp hội chủ sở hữu hoặc ban quản lý tòa nhà, tính theo mỗi foot vuông dựa trên chỉ số phí dịch vụ do RERA phê duyệt, và không chuyển sang khách thuê. Khách thuê trả DEWA, phí làm mát nếu được tính riêng, internet và phí nhà ở 5% của Chính quyền Dubai thu qua hóa đơn DEWA. Binayah theo dõi hóa đơn phí dịch vụ của các căn đang quản lý để không bỏ sót khoản nào và không bị vướng khi xin NOC sau này." },
      { question: "Nên cho thuê dài hạn hay ngắn hạn kiểu nhà nghỉ dưỡng?", answer: "Cho thuê dài hạn (theo năm) mang lại thu nhập ổn định, một khách thuê, chi phí thay khách thấp và tuân thủ đơn giản qua EJARI, nên phù hợp với đa số chủ sở hữu. Cho thuê ngắn hạn có thể mang lại lợi suất gộp cao hơn ở các khu du lịch, nhưng cần giấy phép nhà nghỉ dưỡng từ Sở Kinh tế và Du lịch Dubai cho từng căn, thu phí tourism dirham, chi phí vận hành và nội thất cao hơn, và không phải tòa nhà nào cũng cho phép. Các gói quản lý của Binayah phục vụ cho thuê dài hạn, và chúng tôi sẽ nói thẳng mô hình nào phù hợp với căn hộ và cộng đồng của bạn." },
      { question: "Tôi có thể chuyển sang Binayah nếu đã có quản lý bất động sản không?", answer: "Có. Việc chuyển đổi đơn giản, chúng tôi tiếp quản quản lý khi gia hạn hợp đồng thuê hoặc, trong một số trường hợp, trong thời gian thuê hiện tại với thông báo phù hợp cho quản lý hiện tại. Quản lý tài khoản Binayah của bạn sẽ thu thập hợp đồng thuê, chứng nhận EJARI, chi phiếu và lịch sử bảo trì, rồi xử lý toàn bộ quá trình chuyển đổi." },
      { question: "Binayah quản lý những loại bất động sản nào?", answer: "Chúng tôi quản lý mọi loại bất động sản nhà ở: studio, căn hộ 1-5 phòng ngủ, nhà phố, biệt thự và penthouse. Bất động sản trên tất cả các khu vực lớn của Dubai bao gồm Dubai Marina, Downtown, Palm Jumeirah, JVC, Business Bay, Arabian Ranches và hơn thế nữa." },
    ],
    guidesTitle: "Hướng dẫn hữu ích cho chủ nhà",
    guides: [
      { slug: "ejari-process", title: "Đăng ký EJARI từng bước" },
      { slug: "rera-rental-index-rent-increase", title: "Chỉ số giá thuê RERA và mức tăng" },
      { slug: "rental-disputes-dubai-rdc", title: "Tranh chấp cho thuê và RDC" },
      { slug: "service-charges-explained", title: "Phí dịch vụ được tính thế nào" },
      { slug: "how-to-rent-in-dubai", title: "Thuê nhà ở Dubai diễn ra ra sao" },
      { slug: "short-term-rental-dubai", title: "Cho thuê ngắn hạn tại Dubai" },
      { slug: "power-of-attorney-property-dubai", title: "Giấy ủy quyền bất động sản Dubai" },
      { slug: "snagging-handover-inspection", title: "Kiểm tra bàn giao và lỗi hoàn thiện" },
    ],
    linksTitle: "Cũng hữu ích",
    links: [
      { path: "/rent", label: "Nhà cho thuê tại Dubai" },
      { path: "/list-your-property", label: "Đăng bất động sản của bạn" },
      { path: "/valuation", label: "Định giá miễn phí" },
      { path: "/team", label: "Gặp đội ngũ của chúng tôi" },
      { path: "/contact", label: "Nói chuyện với quản lý" },
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
      ? ["управление недвижимостью дубай", "управляющая компания дубай", "услуги управления недвижимостью дубай", "аренда недвижимость дубай управление"]
      : locale === "ar" // vi branch below
      ? ["إدارة العقارات دبي", "شركة إدارة عقارات دبي", "خدمات إدارة الإيجار دبي"]
      : locale === "zh"
      ? ["迪拜物业管理", "迪拜房产托管", "迪拜租赁管理"]
      : locale === "vi" ? ["quản lý bất động sản dubai", "quản lý bất động sản dubai chuyên nghiệp", "dịch vụ quản lý cho thuê dubai"] : locale === "fr" ? ["gestion locative dubaï", "gestion immobilière dubaï", "société de gestion locative dubaï", "services propriétaire dubaï"] : locale === "he" ? ["ניהול נכסים Dubai","מנהל נכסים Dubai","ניהול וילות Dubai","ניהול השכרות Dubai","שירותי בעל נכס Dubai"] : ["property management dubai", "property management in dubai", "property management company dubai", "property management services dubai", "dubai property manager", "villa management dubai", "rental management dubai", "landlord services dubai"],
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
      <ServiceJsonLd
        name={c.metaTitle}
        description={c.metaDesc}
        url={canonical(locale, "/services/property-management")}
        serviceType="Property Management"
        plans={c.plans.map((p) => ({ name: p.name }))}
      />
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

        {/* Direct answer */}
        <section>
          <div className="bg-card border border-border/50 rounded-2xl p-6 sm:p-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">{c.answerTitle}</h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{c.answer}</p>
            <dl className="mt-7 grid sm:grid-cols-2 gap-x-8 gap-y-4">
              {c.answerPoints.map((p) => (
                <div key={p.k}>
                  <dt className="text-xs font-bold uppercase tracking-wider text-primary mb-1">{p.k}</dt>
                  <dd className="text-sm text-muted-foreground leading-relaxed">{p.v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

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
                <h3 className="text-xl font-bold text-foreground mb-4">{plan.name}</h3>
                {/* Fee percentages hidden pending confirmation of real pricing.
                    The `fee` values remain in the per-locale plan data so they
                    can be re-enabled here once the correct figures are set. */}
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

        {/* Guides & internal links */}
        <section>
          <div className="text-center mb-12">
            <p className="text-accent font-bold tracking-[0.35em] uppercase text-xs mb-3">Resources</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">{c.guidesTitle}</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {c.guides.map((g) => (
              <Link
                key={g.slug}
                href={`${lp}/pulse/guides/${g.slug}`}
                className="flex items-center justify-between gap-3 bg-card border border-border/50 rounded-xl px-5 py-4 text-sm font-semibold text-foreground hover:border-primary/30 hover:text-primary transition-colors"
              >
                <span>{g.title}</span>
                <span className="text-accent" aria-hidden="true">{isRtl ? "←" : "→"}</span>
              </Link>
            ))}
          </div>
          <div className="mt-8">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4">{c.linksTitle}</h3>
            <div className="flex flex-wrap gap-3">
              {c.links.map((l) => (
                <Link
                  key={l.path}
                  href={`${lp}${l.path}`}
                  className="border border-border/60 rounded-full px-4 py-2 text-sm font-semibold text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors"
                >
                  {l.label}
                </Link>
              ))}
            </div>
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
                href={waHref(WA_DEFAULT_MESSAGE, "/services/property-management")}
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
    </div>
  );
}
