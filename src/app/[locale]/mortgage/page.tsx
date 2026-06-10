/* eslint-disable i18next/no-literal-string -- multilingual SEO landing page */
import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import MortgageCalculator from "@/components/MortgageCalculator";
import { FAQJsonLd, BreadcrumbJsonLd } from "@/components/JsonLd";
import { canonical, altLangs, OG_LOCALE, DEFAULT_OG_IMAGE } from "@/lib/site";

export const revalidate = 86400;

const CONTENT = {
  en: {
    metaTitle: "Dubai Mortgage Calculator 2026 | UAE Home Loan Guide | Binayah",
    metaDesc: "Free Dubai mortgage calculator. Compare UAE home loan rates, LTV ratios for expats vs residents, required documents, and bank options. Expert guidance from Binayah.",
    heroLabel: "MORTGAGE & HOME LOANS",
    h1: "Dubai Mortgage Calculator",
    h1sub: "& UAE Home Loan Guide",
    heroDesc: "Calculate your monthly repayments instantly. Then read our complete guide to getting a mortgage in Dubai — rates, banks, LTV ratios, and everything expats need to know.",
    calcTitle: "Mortgage Calculator",
    guideTitle: "Complete Guide to Dubai Mortgages",
    sections: [
      {
        title: "Who Can Get a Mortgage in Dubai?",
        body: "Both UAE residents and non-residents (expats living abroad) can get a mortgage in Dubai. Residents typically qualify for LTV ratios of 75–80%, while non-residents are limited to 50–65%. Banks that lend to non-residents include Emirates NBD, ADCB, ENBD, Mashreq, and Dubai Islamic Bank. Minimum property value is typically AED 1,000,000 for non-resident financing.",
      },
      {
        title: "Current UAE Mortgage Rates (2026)",
        body: "UAE mortgage rates are either fixed or variable (linked to EIBOR — the Emirates Interbank Offered Rate). Fixed rates for 1–5 years typically range from 3.99% to 5.49% p.a. Variable rates follow EIBOR + 1.5–2.5%. Most borrowers opt for a fixed rate for the first 3–5 years for predictability. Islamic (Murabaha/Ijara) mortgages are also available and structurally competitive.",
      },
      {
        title: "Down Payment Requirements",
        body: "UAE regulations (CBUAE): For properties under AED 5M — residents need 20% down (first home), 30% for investment. Non-residents need 25–35%. For properties over AED 5M — 30% (residents) and 35–40% (non-residents). Off-plan mortgages typically require 50% down or a construction-linked payment plan. Developer financing can reduce initial cash requirements.",
      },
      {
        title: "Required Documents",
        body: "Salaried: passport, visa (residents), Emirates ID, 3–6 months bank statements, salary slips, employment letter. Self-employed: same + 2 years audited financial statements, trade licence. Non-residents: passport, 6 months home-country bank statements, proof of income, credit report from home country. Some banks also require a UAE credit report if you have any prior UAE financial history.",
      },
      {
        title: "Costs to Budget For",
        body: "Beyond the down payment: Arrangement fee (0.5–1% of loan), DLD registration fee (0.25% of loan value), property valuation fee (AED 2,500–3,500), property insurance (0.1–0.2%/year), life insurance (required by some banks, 0.1–0.3%/year), and legal fees (AED 5,000–10,000 for mortgage deed). Budget approximately 3–5% of property value for total transaction costs.",
      },
      {
        title: "Mortgage Timeline",
        body: "Pre-approval: 2–5 business days (after submitting documents). Formal approval: 7–14 days (after property valuation is done). Bank transfer to seller/DLD: 1–2 days after approval. Total from application to transfer: typically 3–5 weeks for ready properties. Off-plan mortgages may take longer as they depend on construction milestones.",
      },
    ],
    banksTitle: "Top Banks for Dubai Mortgages",
    banks: [
      { name: "Emirates NBD", rate: "From 3.99%", note: "Market leader, strong expat program" },
      { name: "ADCB", rate: "From 4.25%", note: "Competitive rates, fast approval" },
      { name: "Mashreq", rate: "From 4.10%", note: "Good for self-employed" },
      { name: "Dubai Islamic Bank", rate: "From 4.05%", note: "Sharia-compliant Islamic finance" },
      { name: "Abu Dhabi Commercial Bank", rate: "From 4.30%", note: "Strong non-resident program" },
      { name: "HSBC UAE", rate: "From 4.15%", note: "International clients, premium service" },
    ],
    faqTitle: "Frequently Asked Questions",
    faqs: [
      { question: "Can I get a mortgage in Dubai as an expat or non-resident?", answer: "Yes. UAE banks lend to both resident expats and non-residents living abroad. Residents can borrow up to 80% LTV (first home under AED 5M). Non-residents are limited to 50–65% LTV and need a minimum property value of AED 1,000,000. Banks like Emirates NBD, ADCB, and HSBC have specific non-resident mortgage programs." },
      { question: "What is the current mortgage rate in Dubai?", answer: "As of 2026, Dubai mortgage rates range from approximately 3.99% to 5.49% p.a. for fixed-rate products (1–5 year fix). Variable rates are linked to EIBOR (currently ~5%) plus a bank margin of 1.5–2.5%. The total effective rate for variable mortgages is typically 6.5–7.5% p.a. Fixed rates offer more certainty for the initial term." },
      { question: "How much deposit do I need for a Dubai mortgage?", answer: "UAE Central Bank rules: 20% minimum for residents buying their first home under AED 5M (80% LTV). 25–35% for non-residents on the same property value. 30% for residents buying an investment property. For properties over AED 5M, the minimum deposit is 30% (residents) or 35–40% (non-residents)." },
      { question: "What documents do I need to apply for a UAE mortgage?", answer: "Salaried applicants need: passport, 3–6 months bank statements, last 3 salary slips, and employer letter. Self-employed need 2 years of audited accounts and trade licence. Non-residents add a credit report and income proof from their home country. All documents typically need to be within 3 months of application." },
      { question: "Is it better to get a fixed or variable rate mortgage in Dubai?", answer: "Fixed rates (typically 3.99–5.49% for 1–5 years) give payment certainty and protect against rate rises. Variable rates (linked to EIBOR) can be lower when rates fall but create uncertainty. Most financial advisors recommend fixing for the first 3–5 years, especially for primary residences where budget certainty matters." },
      { question: "Can I get a mortgage for an off-plan property in Dubai?", answer: "Off-plan mortgages are available but less common. Most buyers of off-plan use developer payment plans (typically 40–60% during construction + 40–60% on handover). Some banks offer construction-linked mortgages that release funds at milestones. The minimum LTV is typically 50%, requiring a 50% down payment." },
      { question: "How long does it take to get mortgage approval in Dubai?", answer: "Pre-approval (also called approval-in-principle): 2–5 business days with complete documents. Full formal approval after property valuation: 7–14 days. The entire process from application to fund transfer typically takes 3–5 weeks for ready properties." },
      { question: "What are all the costs involved in getting a Dubai mortgage?", answer: "Down payment (20–35% of property value) + DLD transfer fee (4% of property value, typically split buyer/seller) + DLD mortgage registration fee (0.25% of loan) + bank arrangement fee (0.5–1% of loan) + property valuation (AED 2,500–3,500) + insurance. Total transaction cost beyond purchase price: approximately 3–5% of property value." },
    ],
    ctaTitle: "Get Pre-Approved Today",
    ctaDesc: "Binayah works with UAE's top mortgage brokers. We'll match you with the right bank, prepare your application, and guide you through approval — at no extra cost.",
    ctaBtn: "Talk to a Mortgage Specialist",
    ctaWhatsApp: "WhatsApp Us",
    breadcrumb: "Mortgage Calculator",
  },

  ru: {
    metaTitle: "Ипотечный калькулятор Дубай 2026 | Кредит на жильё ОАЭ | Binayah",
    metaDesc: "Бесплатный ипотечный калькулятор для Дубая. Ставки, LTV для экспатов и нерезидентов, необходимые документы. Полное руководство от Binayah Properties.",
    heroLabel: "ИПОТЕКА И ЖИЛИЩНЫЙ КРЕДИТ",
    h1: "Ипотечный калькулятор Дубая",
    h1sub: "и руководство по кредитам в ОАЭ",
    heroDesc: "Рассчитайте ежемесячный платёж мгновенно. Затем ознакомьтесь с нашим полным руководством по ипотеке в Дубае — ставки, банки, LTV для нерезидентов и всё, что нужно знать россиянам.",
    calcTitle: "Ипотечный калькулятор",
    guideTitle: "Полное руководство по ипотеке в Дубае",
    sections: [
      {
        title: "Кто может получить ипотеку в Дубае?",
        body: "Как резиденты ОАЭ, так и нерезиденты (в том числе граждане России) могут получить ипотеку в Дубае. Резиденты получают LTV до 75–80%, нерезиденты — до 50–65%. Банки, кредитующие нерезидентов: Emirates NBD, ADCB, ENBD, Mashreq, Dubai Islamic Bank. Минимальная стоимость объекта для нерезидентов — как правило, 1 000 000 AED.",
      },
      {
        title: "Текущие ставки по ипотеке в ОАЭ (2026)",
        body: "Ставки по ипотеке в ОАЭ бывают фиксированными или переменными (привязанными к EIBOR). Фиксированные ставки на 1–5 лет: 3,99–5,49% годовых. Переменные: EIBOR + 1,5–2,5%. Большинство заёмщиков выбирают фиксацию на первые 3–5 лет для предсказуемости платежей. Доступны также исламские ипотечные продукты (мурабаха/иджара).",
      },
      {
        title: "Требования к первоначальному взносу",
        body: "По правилам Центрального банка ОАЭ: при стоимости объекта до 5 млн AED — резиденты 20% (первое жильё), 30% (инвестиционный объект); нерезиденты 25–35%. При стоимости свыше 5 млн AED — резиденты 30%, нерезиденты 35–40%. Для новостроек минимальный взнос 50% или рассрочка по этапам строительства.",
      },
      {
        title: "Необходимые документы",
        body: "Наёмные работники: паспорт, виза (для резидентов), Emirates ID, выписки по счёту за 3–6 месяцев, расчётные листки, письмо от работодателя. Для нерезидентов: паспорт, выписки из российского банка за 6 месяцев, подтверждение дохода, кредитная история из страны проживания.",
      },
      {
        title: "Дополнительные расходы",
        body: "Помимо первоначального взноса: комиссия банка (0,5–1% от суммы кредита), регистрация ипотеки в DLD (0,25% от суммы кредита), оценка объекта (2 500–3 500 AED), страховка имущества (0,1–0,2%/год), страхование жизни (требуется некоторыми банками, 0,1–0,3%/год). Общие транзакционные расходы: около 3–5% от стоимости объекта.",
      },
      {
        title: "Сроки оформления ипотеки",
        body: "Предварительное одобрение: 2–5 рабочих дней. Полное одобрение после оценки объекта: 7–14 дней. Перевод средств: 1–2 дня. Весь процесс от подачи заявки до перехода права собственности: обычно 3–5 недель для готовых объектов.",
      },
    ],
    banksTitle: "Ведущие банки для ипотеки в Дубае",
    banks: [
      { name: "Emirates NBD", rate: "От 3,99%", note: "Рыночный лидер, программы для экспатов" },
      { name: "ADCB", rate: "От 4,25%", note: "Конкурентные ставки, быстрое одобрение" },
      { name: "Mashreq", rate: "От 4,10%", note: "Хорошо подходит для самозанятых" },
      { name: "Dubai Islamic Bank", rate: "От 4,05%", note: "Исламские финансовые продукты" },
      { name: "HSBC ОАЭ", rate: "От 4,15%", note: "Международные клиенты, премиум-обслуживание" },
      { name: "Abu Dhabi Commercial Bank", rate: "От 4,30%", note: "Программы для нерезидентов" },
    ],
    faqTitle: "Частые вопросы",
    faqs: [
      { question: "Могут ли граждане России получить ипотеку в Дубае?", answer: "Да. Банки ОАЭ выдают ипотеку нерезидентам, включая граждан России. LTV для нерезидентов — 50–65%, минимальная стоимость объекта — 1 000 000 AED. Из-за санкций некоторые банки могут запросить дополнительные документы, однако Emirates NBD, ADCB и Mashreq активно работают с российскими клиентами." },
      { question: "Какова текущая ипотечная ставка в Дубае?", answer: "В 2026 году ставки по ипотеке в Дубае составляют от 3,99% до 5,49% годовых (фиксированные продукты на 1–5 лет). Переменные ставки привязаны к EIBOR (~5%) плюс маржа банка 1,5–2,5%. Фиксированные ставки обеспечивают предсказуемость платежей." },
      { question: "Какой первоначальный взнос нужен для ипотеки в Дубае?", answer: "Требования ЦБ ОАЭ: для нерезидентов — минимум 25–35% при стоимости объекта до 5 млн AED, 35–40% при стоимости свыше 5 млн AED. Для объектов off-plan взнос, как правило, не менее 50%." },
      { question: "Какие документы нужны для ипотеки в ОАЭ нерезиденту?", answer: "Паспорт, выписки из банка за 6 месяцев (из российского банка), подтверждение дохода (справка о зарплате или документы для ИП), кредитная история из страны проживания. Некоторые банки требуют нотариально заверенные переводы на английский язык." },
      { question: "Что лучше — фиксированная или переменная ипотечная ставка?", answer: "Фиксированные ставки (3,99–5,49% на 1–5 лет) обеспечивают предсказуемость платежей и защищают от роста ставок. Большинство финансовых советников рекомендуют фиксацию на первые 3–5 лет, особенно для основного жилья." },
      { question: "Доступна ли ипотека для объектов off-plan?", answer: "Ипотека для новостроек доступна, но менее распространена. Большинство покупателей пользуются планами рассрочки от застройщика (40–60% в ходе строительства + 40–60% при сдаче). Минимальный взнос по ипотеке для новостроек — обычно 50%." },
      { question: "Сколько времени занимает одобрение ипотеки в Дубае?", answer: "Предварительное одобрение: 2–5 рабочих дней. Полное одобрение после оценки объекта: 7–14 дней. Весь процесс до перехода права собственности: обычно 3–5 недель для готовых объектов." },
      { question: "Каковы все расходы при оформлении ипотеки в Дубае?", answer: "Первоначальный взнос (25–35% стоимости) + сбор DLD (4%, обычно делится) + регистрация ипотеки в DLD (0,25% суммы кредита) + комиссия банка (0,5–1%) + оценка объекта (2 500–3 500 AED) + страховки. Общие транзакционные расходы сверх стоимости объекта: около 3–5%." },
    ],
    ctaTitle: "Получите предодобрение сегодня",
    ctaDesc: "Binayah работает с ведущими ипотечными брокерами ОАЭ. Мы подберём подходящий банк, подготовим заявку и сопроводим до одобрения — без дополнительных расходов.",
    ctaBtn: "Консультация по ипотеке",
    ctaWhatsApp: "WhatsApp",
    breadcrumb: "Ипотечный калькулятор",
  },

  ar: {
    metaTitle: "حاسبة رهن عقاري دبي 2026 | دليل القروض العقارية في الإمارات | بناية",
    metaDesc: "حاسبة رهن عقاري مجانية لدبي. معدلات التمويل الإماراتية، نسب التمويل للمقيمين وغير المقيمين، المستندات المطلوبة. دليل كامل من بناية للعقارات.",
    heroLabel: "الرهن العقاري والتمويل",
    h1: "حاسبة الرهن العقاري في دبي",
    h1sub: "ودليل التمويل العقاري في الإمارات",
    heroDesc: "احسب دفعاتك الشهرية على الفور، ثم اطلع على دليلنا الشامل للحصول على قرض عقاري في دبي — المعدلات والبنوك ونسب التمويل وكل ما يحتاج المشتري الأجنبي معرفته.",
    calcTitle: "حاسبة الرهن العقاري",
    guideTitle: "الدليل الشامل للرهن العقاري في دبي",
    sections: [
      { title: "من يمكنه الحصول على قرض عقاري في دبي؟", body: "يحق للمقيمين في الإمارات وغير المقيمين (المغتربين في الخارج) الحصول على رهن عقاري في دبي. يحصل المقيمون على نسب تمويل تصل إلى 75-80%، بينما يقتصر غير المقيمين على 50-65%. البنوك التي تموّل غير المقيمين: الإمارات NBD وADCB وماشريق وبنك دبي الإسلامي وHSBC." },
      { title: "معدلات الرهن العقاري الحالية (2026)", body: "تتراوح المعدلات الثابتة (1-5 سنوات) بين 3.99% و5.49% سنويًا. المعدلات المتغيرة مرتبطة بـ EIBOR بالإضافة إلى هامش البنك 1.5-2.5%. ينصح بتثبيت السعر للسنوات الثلاث إلى الخمس الأولى للحصول على دفعات متوقعة. التمويل الإسلامي (مرابحة/إجارة) متاح أيضًا." },
      { title: "متطلبات الدفعة المقدمة", body: "وفق لوائح البنك المركزي الإماراتي: للعقارات دون 5 مليون درهم — المقيمون 20% (المسكن الأول)، غير المقيمين 25-35%. للعقارات فوق 5 مليون درهم — المقيمون 30%، غير المقيمين 35-40%. الرهن على الخارطة يستلزم عادةً 50% على الأقل." },
      { title: "المستندات المطلوبة", body: "الموظفون: جواز سفر، إقامة (للمقيمين)، هوية إماراتية، كشوف بنكية لـ 3-6 أشهر، قسائم الراتب، خطاب توظيف. غير المقيمين: يضيفون كشوف بنكية من بلدهم لـ 6 أشهر وإثبات دخل وسجل ائتماني." },
      { title: "التكاليف الإضافية", body: "سوى الدفعة الأولى: رسوم الترتيب (0.5-1%)، رسوم تسجيل الرهن في DLD (0.25% من قيمة القرض)، رسوم تقييم العقار (2,500-3,500 درهم)، تأمين العقار (0.1-0.2% سنويًا)، تأمين الحياة (مطلوب من بعض البنوك). إجمالي تكاليف الصفقة: نحو 3-5% من قيمة العقار." },
      { title: "جدول زمني للحصول على الرهن", body: "الموافقة المبدئية: 2-5 أيام عمل. الموافقة الرسمية بعد التقييم: 7-14 يومًا. التحويل المصرفي: يوم إلى يومين. الإجمالي من تقديم الطلب إلى نقل الملكية: عادةً 3-5 أسابيع للعقارات الجاهزة." },
    ],
    banksTitle: "أبرز البنوك لتمويل العقارات في دبي",
    banks: [
      { name: "الإمارات NBD", rate: "من 3.99%", note: "الرائد في السوق، برامج للمغتربين" },
      { name: "ADCB", rate: "من 4.25%", note: "معدلات تنافسية، موافقة سريعة" },
      { name: "ماشريق", rate: "من 4.10%", note: "مناسب للعاملين لحسابهم الخاص" },
      { name: "بنك دبي الإسلامي", rate: "من 4.05%", note: "تمويل إسلامي متوافق مع الشريعة" },
      { name: "HSBC الإمارات", rate: "من 4.15%", note: "للعملاء الدوليين، خدمة متميزة" },
      { name: "بنك أبوظبي التجاري", rate: "من 4.30%", note: "برامج قوية لغير المقيمين" },
    ],
    faqTitle: "الأسئلة الشائعة",
    faqs: [
      { question: "هل يمكن للأجانب وغير المقيمين الحصول على قرض عقاري في دبي؟", answer: "نعم. تموّل بنوك الإمارات كلًا من المقيمين الأجانب وغير المقيمين في الخارج. يحصل المقيمون على نسبة تمويل تصل إلى 80%. أما غير المقيمين فتقتصر نسبتهم على 50-65%، والحد الأدنى لقيمة العقار مليون درهم." },
      { question: "ما معدل الرهن العقاري الحالي في دبي؟", answer: "في عام 2026، تتراوح معدلات الرهن في دبي بين 3.99% و5.49% سنويًا للمنتجات ذات السعر الثابت (1-5 سنوات). المعدلات المتغيرة مرتبطة بـ EIBOR (~5%) بالإضافة إلى هامش البنك." },
      { question: "كم تبلغ الدفعة الأولى المطلوبة للرهن العقاري في دبي؟", answer: "لوائح البنك المركزي الإماراتي: 20% للمقيمين الذين يشترون مسكنهم الأول (للعقارات دون 5 مليون درهم). 25-35% لغير المقيمين على نفس قيمة العقار. 30-40% للعقارات فوق 5 مليون درهم." },
      { question: "ما المستندات المطلوبة لتمويل عقاري في الإمارات؟", answer: "الموظفون: جواز سفر وكشوف بنكية لـ 3-6 أشهر وقسائم راتب وخطاب توظيف. المقيمون يضيفون هوية إماراتية وإقامة. غير المقيمين يضيفون كشوفًا بنكية من بلدهم لـ 6 أشهر وإثبات دخل وسجلًا ائتمانيًا." },
      { question: "هل يُفضَّل السعر الثابت أم المتغير للرهن العقاري؟", answer: "المعدلات الثابتة (3.99-5.49% لـ 1-5 سنوات) توفر يقينًا في الدفع وتحمي من ارتفاع الفائدة. يوصي معظم المستشارين بتثبيت السعر للسنوات الثلاث إلى الخمس الأولى، لا سيما للسكن الأساسي." },
      { question: "هل يمكن الحصول على رهن عقاري لشراء عقار على الخارطة؟", answer: "تمويل على الخارطة متاح لكن أقل شيوعًا. يلجأ معظم المشترين إلى خطط دفع المطوّر. الحد الأدنى لنسبة الدفعة الأولى في تمويل الخارطة عادةً 50%." },
      { question: "كم يستغرق الحصول على موافقة الرهن العقاري في دبي؟", answer: "الموافقة المبدئية: 2-5 أيام عمل. الموافقة الرسمية بعد التقييم: 7-14 يومًا. الإجمالي من تقديم الطلب إلى نقل الملكية: عادةً 3-5 أسابيع للعقارات الجاهزة." },
      { question: "ما جميع التكاليف المرتبطة بالحصول على رهن عقاري في دبي؟", answer: "الدفعة الأولى + رسوم DLD (4% من قيمة العقار، تُقسَّم عادةً) + رسوم تسجيل الرهن (0.25% من قيمة القرض) + رسوم الترتيب (0.5-1%) + التقييم (2,500-3,500 درهم) + التأمينات. إجمالي تكاليف الصفقة: نحو 3-5% من قيمة العقار." },
    ],
    ctaTitle: "احصل على موافقة مبدئية اليوم",
    ctaDesc: "تتعاون بناية مع كبار وسطاء الرهن العقاري في الإمارات. سنطابقك مع البنك المناسب ونُعدّ طلبك ونرافقك حتى الموافقة — دون أي تكلفة إضافية.",
    ctaBtn: "تحدث مع متخصص تمويل",
    ctaWhatsApp: "واتساب",
    breadcrumb: "حاسبة الرهن العقاري",
  },

  zh: {
    metaTitle: "迪拜房贷计算器2026 | 阿联酋住房贷款指南 | Binayah",
    metaDesc: "免费迪拜房贷计算器。阿联酋住房贷款利率、外籍人士与居民的贷款成数、所需文件及银行选择。Binayah专家指导。",
    heroLabel: "房贷与住房贷款",
    h1: "迪拜房贷计算器",
    h1sub: "及阿联酋住房贷款指南",
    heroDesc: "即时计算每月还款额，然后阅读我们完整的迪拜房贷指南——利率、银行、贷款成数，以及外籍人士需要了解的一切。",
    calcTitle: "房贷计算器",
    guideTitle: "迪拜房贷完整指南",
    sections: [
      { title: "谁可以在迪拜申请房贷？", body: "阿联酋居民和非居民（海外外籍人士）均可在迪拜申请房贷。居民的贷款成数（LTV）通常为75-80%，非居民为50-65%。为非居民提供贷款的银行包括阿联酋国民银行、阿布扎比商业银行、汇丰阿联酋等。非居民贷款最低房产价值通常为100万迪拉姆。" },
      { title: "2026年阿联酋房贷利率", body: "阿联酋房贷利率分固定利率和浮动利率。1-5年固定利率通常为3.99%-5.49%。浮动利率与EIBOR挂钩，加银行利差1.5-2.5%。大多数借款人选择前3-5年固定利率以确保可预测性。伊斯兰金融产品（穆拉巴哈/伊贾拉）也可申请。" },
      { title: "首付要求", body: "阿联酋央行规定：500万迪拉姆以下房产——居民首付20%（首套房），非居民25-35%。500万迪拉姆以上——居民30%，非居民35-40%。期房贷款通常需要50%首付或按施工进度付款计划。" },
      { title: "所需文件", body: "受薪人员：护照、居住签证（居民）、酋长国身份证、3-6个月银行对账单、工资单、雇主证明信。非居民：护照、6个月本国银行对账单、收入证明、本国信用报告。" },
      { title: "其他费用预算", body: "除首付外：银行安排费（贷款额的0.5-1%）、DLD抵押贷款登记费（贷款额的0.25%）、房产估价费（2,500-3,500迪拉姆）、房产保险（0.1-0.2%/年）、人寿保险（部分银行要求，0.1-0.3%/年）。总交易成本约为房产价值的3-5%。" },
      { title: "房贷申请时间表", body: "预批（原则批准）：提交完整材料后2-5个工作日。房产估价后正式批准：7-14天。资金转账：批准后1-2天。从申请到产权转移全程：现房通常3-5周。" },
    ],
    banksTitle: "迪拜顶级房贷银行",
    banks: [
      { name: "阿联酋国民银行", rate: "从3.99%起", note: "市场领头羊，外籍人士项目完善" },
      { name: "阿布扎比商业银行", rate: "从4.25%起", note: "利率竞争力强，审批快速" },
      { name: "马士理格银行", rate: "从4.10%起", note: "适合自雇人士" },
      { name: "迪拜伊斯兰银行", rate: "从4.05%起", note: "伊斯兰合规金融产品" },
      { name: "汇丰阿联酋", rate: "从4.15%起", note: "国际客户，优质服务" },
      { name: "ADCB", rate: "从4.30%起", note: "非居民项目强大" },
    ],
    faqTitle: "常见问题解答",
    faqs: [
      { question: "外籍人士或非居民可以在迪拜申请房贷吗？", answer: "可以。阿联酋银行为居住在当地的外籍居民和海外非居民提供贷款。居民LTV最高80%（500万以下首套房）。非居民LTV限制为50-65%，最低房产价值为100万迪拉姆。" },
      { question: "迪拜目前的房贷利率是多少？", answer: "2026年，迪拜房贷利率约为3.99%-5.49%（1-5年固定利率产品）。浮动利率与EIBOR（约5%）加银行利差1.5-2.5%挂钩。固定利率在初期提供更多确定性。" },
      { question: "迪拜房贷需要多少首付？", answer: "阿联酋央行规定：居民购买500万以下首套房最低首付20%（LTV 80%）。非居民同等房产首付25-35%。500万以上房产居民首付30%，非居民35-40%。" },
      { question: "申请阿联酋房贷需要哪些文件？", answer: "受薪人员：护照、3-6个月银行对账单、最近3个月工资单、雇主证明信。自雇人士需2年审计财务报告。非居民需添加本国银行对账单、收入证明和信用报告。" },
      { question: "固定利率和浮动利率哪个更好？", answer: "固定利率（1-5年3.99-5.49%）提供还款确定性，防范利率上涨。大多数财务顾问建议前3-5年选择固定利率，尤其对主要住所而言，预算确定性更为重要。" },
      { question: "可以为期房申请房贷吗？", answer: "期房房贷可用但不常见。大多数期房买家使用开发商付款计划（施工期间40-60%+交房时40-60%）。期房抵押贷款最低首付通常为50%。" },
      { question: "在迪拜获得房贷批准需要多长时间？", answer: "预批：提交完整文件后2-5个工作日。房产估价后正式批准：7-14天。从申请到资金转账全程：现房通常3-5周。" },
      { question: "迪拜房贷涉及哪些所有费用？", answer: "首付（房产价值的20-35%）+DLD过户费（4%，通常买卖各半）+DLD抵押贷款登记费（贷款额的0.25%）+银行安排费（0.5-1%）+估价费（2,500-3,500迪拉姆）+保险。超出购房价的总交易成本约3-5%。" },
    ],
    ctaTitle: "今天获取预批",
    ctaDesc: "Binayah与阿联酋顶级房贷经纪商合作。我们将为您匹配合适的银行，准备申请材料，全程指导至获批——无额外费用。",
    ctaBtn: "咨询房贷专家",
    ctaWhatsApp: "WhatsApp咨询",
    breadcrumb: "房贷计算器",
  },

  vi: {
    metaTitle: "Máy tính vay thế chấp Dubai 2026 | Hướng dẫn vay mua nhà UAE | Binayah",
    metaDesc: "Máy tính vay thế chấp Dubai miễn phí. So sánh lãi suất vay mua nhà UAE, tỷ lệ LTV cho người nước ngoài và cư dân, giấy tờ cần thiết và lựa chọn ngân hàng. Hướng dẫn chuyên gia từ Binayah.",
    heroLabel: "VAY THẾ CHẤP & VAY MUA NHÀ",
    h1: "Máy tính vay thế chấp Dubai",
    h1sub: "& Hướng dẫn vay mua nhà UAE",
    heroDesc: "Tính khoản trả hàng tháng của bạn tức thì. Sau đó đọc hướng dẫn đầy đủ của chúng tôi về việc vay thế chấp tại Dubai — lãi suất, ngân hàng, tỷ lệ LTV và mọi thứ người nước ngoài cần biết.",
    calcTitle: "Máy tính vay thế chấp",
    guideTitle: "Hướng dẫn đầy đủ về vay thế chấp tại Dubai",
    sections: [
      {
        title: "Ai có thể vay thế chấp tại Dubai?",
        body: "Cả cư dân UAE và người không cư trú (người nước ngoài sống ở nước ngoài) đều có thể vay thế chấp tại Dubai. Cư dân thường đủ điều kiện cho tỷ lệ LTV 75–80%, trong khi người không cư trú bị giới hạn ở 50–65%. Các ngân hàng cho người không cư trú vay gồm Emirates NBD, ADCB, ENBD, Mashreq và Dubai Islamic Bank. Giá trị bất động sản tối thiểu thường là 1.000.000 AED cho khoản vay người không cư trú.",
      },
      {
        title: "Lãi suất vay thế chấp UAE hiện tại (2026)",
        body: "Lãi suất vay thế chấp UAE là cố định hoặc thả nổi (liên kết với EIBOR — Lãi suất Liên ngân hàng Emirates). Lãi suất cố định cho 1–5 năm thường từ 3,99% đến 5,49%/năm. Lãi suất thả nổi theo EIBOR + 1,5–2,5%. Hầu hết người vay chọn lãi suất cố định cho 3–5 năm đầu để có sự dự đoán được. Vay thế chấp Hồi giáo (Murabaha/Ijara) cũng có sẵn và cạnh tranh về cơ cấu.",
      },
      {
        title: "Yêu cầu trả trước",
        body: "Quy định UAE (CBUAE): Với bất động sản dưới 5 triệu AED — cư dân cần trả trước 20% (nhà đầu tiên), 30% cho đầu tư. Người không cư trú cần 25–35%. Với bất động sản trên 5 triệu AED — 30% (cư dân) và 35–40% (người không cư trú). Vay thế chấp off-plan thường yêu cầu trả trước 50% hoặc kế hoạch thanh toán theo tiến độ xây dựng. Tài chính từ chủ đầu tư có thể giảm yêu cầu tiền mặt ban đầu.",
      },
      {
        title: "Giấy tờ cần thiết",
        body: "Người làm công ăn lương: hộ chiếu, thị thực (cư dân), Emirates ID, sao kê ngân hàng 3–6 tháng, phiếu lương, thư xác nhận việc làm. Người tự kinh doanh: tương tự + báo cáo tài chính được kiểm toán 2 năm, giấy phép kinh doanh. Người không cư trú: hộ chiếu, sao kê ngân hàng 6 tháng ở quốc gia của bạn, chứng minh thu nhập, báo cáo tín dụng từ quốc gia của bạn. Một số ngân hàng cũng yêu cầu báo cáo tín dụng UAE nếu bạn có lịch sử tài chính UAE trước đó.",
      },
      {
        title: "Chi phí cần dự trù",
        body: "Ngoài khoản trả trước: phí thu xếp (0,5–1% khoản vay), phí đăng ký DLD (0,25% giá trị khoản vay), phí định giá bất động sản (2.500–3.500 AED), bảo hiểm bất động sản (0,1–0,2%/năm), bảo hiểm nhân thọ (yêu cầu bởi một số ngân hàng, 0,1–0,3%/năm) và phí pháp lý (5.000–10.000 AED cho hồ sơ thế chấp). Dự trù khoảng 3–5% giá trị bất động sản cho tổng chi phí giao dịch.",
      },
      {
        title: "Lịch trình vay thế chấp",
        body: "Phê duyệt trước: 2–5 ngày làm việc (sau khi nộp giấy tờ). Phê duyệt chính thức: 7–14 ngày (sau khi định giá bất động sản xong). Chuyển khoản ngân hàng cho người bán/DLD: 1–2 ngày sau khi phê duyệt. Tổng từ nộp đơn đến chuyển nhượng: thường 3–5 tuần cho bất động sản đã hoàn thiện. Vay thế chấp off-plan có thể mất lâu hơn vì phụ thuộc vào các cột mốc xây dựng.",
      },
    ],
    banksTitle: "Các ngân hàng hàng đầu cho vay thế chấp Dubai",
    banks: [
      { name: "Emirates NBD", rate: "Từ 3,99%", note: "Dẫn đầu thị trường, chương trình mạnh cho người nước ngoài" },
      { name: "ADCB", rate: "Từ 4,25%", note: "Lãi suất cạnh tranh, phê duyệt nhanh" },
      { name: "Mashreq", rate: "Từ 4,10%", note: "Tốt cho người tự kinh doanh" },
      { name: "Dubai Islamic Bank", rate: "Từ 4,05%", note: "Tài chính Hồi giáo tuân thủ Sharia" },
      { name: "Abu Dhabi Commercial Bank", rate: "Từ 4,30%", note: "Chương trình mạnh cho người không cư trú" },
      { name: "HSBC UAE", rate: "Từ 4,15%", note: "Khách hàng quốc tế, dịch vụ cao cấp" },
    ],
    faqTitle: "Câu hỏi thường gặp",
    faqs: [
      { question: "Tôi có thể vay thế chấp tại Dubai với tư cách người nước ngoài hoặc người không cư trú không?", answer: "Có. Các ngân hàng UAE cho cả người nước ngoài cư trú và người không cư trú sống ở nước ngoài vay. Cư dân có thể vay tối đa 80% LTV (nhà đầu tiên dưới 5 triệu AED). Người không cư trú bị giới hạn ở 50–65% LTV và cần giá trị bất động sản tối thiểu 1.000.000 AED. Các ngân hàng như Emirates NBD, ADCB và HSBC có chương trình vay thế chấp riêng cho người không cư trú." },
      { question: "Lãi suất vay thế chấp hiện tại tại Dubai là bao nhiêu?", answer: "Tính đến năm 2026, lãi suất vay thế chấp Dubai dao động khoảng 3,99% đến 5,49%/năm cho sản phẩm lãi suất cố định (cố định 1–5 năm). Lãi suất thả nổi liên kết với EIBOR (hiện ~5%) cộng biên ngân hàng 1,5–2,5%. Tổng lãi suất hiệu dụng cho vay thế chấp thả nổi thường 6,5–7,5%/năm. Lãi suất cố định mang lại sự chắc chắn hơn cho kỳ hạn ban đầu." },
      { question: "Tôi cần đặt cọc bao nhiêu cho vay thế chấp Dubai?", answer: "Quy định Ngân hàng Trung ương UAE: tối thiểu 20% cho cư dân mua nhà đầu tiên dưới 5 triệu AED (80% LTV). 25–35% cho người không cư trú trên cùng giá trị bất động sản. 30% cho cư dân mua bất động sản đầu tư. Với bất động sản trên 5 triệu AED, đặt cọc tối thiểu là 30% (cư dân) hoặc 35–40% (người không cư trú)." },
      { question: "Tôi cần giấy tờ gì để xin vay thế chấp UAE?", answer: "Người làm công ăn lương cần: hộ chiếu, sao kê ngân hàng 3–6 tháng, 3 phiếu lương gần nhất và thư của chủ lao động. Người tự kinh doanh cần 2 năm tài khoản được kiểm toán và giấy phép kinh doanh. Người không cư trú bổ sung báo cáo tín dụng và chứng minh thu nhập từ quốc gia của họ. Mọi giấy tờ thường cần trong vòng 3 tháng kể từ khi nộp đơn." },
      { question: "Nên vay thế chấp lãi suất cố định hay thả nổi tại Dubai?", answer: "Lãi suất cố định (thường 3,99–5,49% cho 1–5 năm) mang lại sự chắc chắn về khoản trả và bảo vệ khỏi tăng lãi suất. Lãi suất thả nổi (liên kết với EIBOR) có thể thấp hơn khi lãi suất giảm nhưng tạo ra sự bất định. Hầu hết cố vấn tài chính khuyến nghị cố định cho 3–5 năm đầu, đặc biệt cho nơi ở chính nơi sự chắc chắn về ngân sách quan trọng." },
      { question: "Tôi có thể vay thế chấp cho bất động sản off-plan tại Dubai không?", answer: "Vay thế chấp off-plan có sẵn nhưng ít phổ biến hơn. Hầu hết người mua off-plan dùng kế hoạch thanh toán của chủ đầu tư (thường 40–60% trong quá trình xây dựng + 40–60% khi bàn giao). Một số ngân hàng cung cấp vay thế chấp liên kết xây dựng giải ngân vốn theo cột mốc. LTV tối thiểu thường là 50%, yêu cầu trả trước 50%." },
      { question: "Mất bao lâu để được phê duyệt vay thế chấp tại Dubai?", answer: "Phê duyệt trước (còn gọi là phê duyệt theo nguyên tắc): 2–5 ngày làm việc với giấy tờ đầy đủ. Phê duyệt chính thức đầy đủ sau khi định giá bất động sản: 7–14 ngày. Toàn bộ quy trình từ nộp đơn đến chuyển khoản thường mất 3–5 tuần cho bất động sản đã hoàn thiện." },
      { question: "Tất cả các chi phí liên quan đến việc vay thế chấp Dubai là gì?", answer: "Khoản trả trước (20–35% giá trị bất động sản) + phí chuyển nhượng DLD (4% giá trị bất động sản, thường chia người mua/người bán) + phí đăng ký thế chấp DLD (0,25% khoản vay) + phí thu xếp ngân hàng (0,5–1% khoản vay) + định giá bất động sản (2.500–3.500 AED) + bảo hiểm. Tổng chi phí giao dịch ngoài giá mua: khoảng 3–5% giá trị bất động sản." },
    ],
    ctaTitle: "Nhận phê duyệt trước hôm nay",
    ctaDesc: "Binayah hợp tác với các nhà môi giới vay thế chấp hàng đầu UAE. Chúng tôi sẽ kết nối bạn với đúng ngân hàng, chuẩn bị đơn của bạn và hướng dẫn bạn qua quá trình phê duyệt — không tốn thêm chi phí.",
    ctaBtn: "Trao đổi với chuyên gia vay thế chấp",
    ctaWhatsApp: "WhatsApp ngay",
    breadcrumb: "Máy tính vay thế chấp",
  },
} as const;

type Locale = keyof typeof CONTENT;
interface Props { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const c = CONTENT[(locale as Locale)] || CONTENT.en;
  const url = canonical(locale, "/mortgage");
  return {
    title: c.metaTitle,
    description: c.metaDesc,
    alternates: { canonical: url, languages: altLangs("/mortgage") },
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
      ? ["ипотека дубай", "ипотечный калькулятор дубай", "кредит на жилье дубай", "ипотека оаэ нерезидент"]
      : locale === "ar"
      ? ["حاسبة رهن عقاري دبي", "قرض عقاري دبي", "تمويل عقاري دبي", "رهن عقاري للأجانب دبي"]
      : locale === "zh"
      ? ["迪拜房贷计算器", "迪拜住房贷款", "迪拜按揭贷款", "阿联酋房贷外籍人士"]
      : locale === "vi"
      ? ["máy tính vay thế chấp dubai", "vay mua nhà dubai", "lãi suất vay thế chấp uae", "vay thế chấp dubai người nước ngoài"]
      : ["mortgage calculator dubai", "dubai home loan", "uae mortgage rates", "dubai mortgage expat", "buy property dubai mortgage"],
  };
}

export default async function MortgagePage({ params }: Props) {
  const { locale } = await params;
  const c = CONTENT[(locale as Locale)] || CONTENT.en;
  const isRtl = locale === "ar";
  const lp = locale === "en" ? "" : `/${locale}`;

  const bcItems = [
    { name: locale === "ru" ? "Главная" : locale === "ar" ? "الرئيسية" : locale === "zh" ? "首页" : locale === "vi" ? "Trang chủ" : "Home", href: `${lp}/` },
    { name: c.breadcrumb, href: `${lp}/mortgage` },
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
          <p className="text-accent font-bold tracking-[0.4em] uppercase text-xs mb-4">{c.heroLabel}</p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-2">
            {c.h1}
          </h1>
          <p className="text-3xl sm:text-4xl font-light text-primary-foreground/70 mb-6">{c.h1sub}</p>
          <p className="text-primary-foreground/80 text-lg leading-relaxed max-w-2xl">{c.heroDesc}</p>
        </div>
      </section>

      {/* Calculator */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <h2 className="text-2xl font-bold text-foreground mb-6 text-center">{c.calcTitle}</h2>
        <MortgageCalculator embedded />
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-10 sm:pb-16 space-y-12 sm:space-y-16">

        {/* Guide */}
        <section>
          <h2 className="text-3xl font-bold text-foreground mb-8">{c.guideTitle}</h2>
          <div className="space-y-6">
            {c.sections.map((s) => (
              <div key={s.title} className="bg-card border border-border/50 rounded-2xl p-6">
                <h3 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                  {s.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Banks */}
        <section>
          <div className="text-center mb-8">
            <p className="text-accent font-bold tracking-[0.35em] uppercase text-xs mb-3">Banks</p>
            <h2 className="text-3xl font-bold text-foreground">{c.banksTitle}</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {c.banks.map((b) => (
              <div key={b.name} className="bg-card border border-border/50 rounded-2xl p-5 hover:border-primary/20 transition-all">
                <h3 className="font-bold text-foreground mb-1">{b.name}</h3>
                <p className="text-xl font-black text-primary mb-2">{b.rate}</p>
                <p className="text-xs text-muted-foreground">{b.note}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground text-center mt-4">
            {locale === "ru" ? "* Ставки актуальны на 2026 г. Условия зависят от профиля заёмщика." :
             locale === "ar" ? "* المعدلات اعتبارًا من 2026. تتوقف الشروط على ملف المقترض." :
             locale === "zh" ? "* 利率截至2026年。条款因借款人状况而异。" :
             locale === "vi" ? "* Lãi suất tính đến năm 2026. Điều khoản phụ thuộc vào hồ sơ người vay và loại bất động sản." :
             "* Rates as of 2026. Terms depend on borrower profile and property type."}
          </p>
        </section>

        {/* FAQ */}
        <section>
          <div className="text-center mb-10">
            <p className="text-accent font-bold tracking-[0.35em] uppercase text-xs mb-3">FAQ</p>
            <h2 className="text-3xl font-bold text-foreground">{c.faqTitle}</h2>
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
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">{c.ctaTitle}</h2>
            <p className="text-primary-foreground/75 text-lg mb-10 max-w-xl mx-auto">{c.ctaDesc}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`${lp}/contact`}
                className="font-bold px-8 py-4 rounded-xl text-base hover:opacity-90 transition-all"
                style={{ background: "linear-gradient(135deg, #D4A847, #B8922F)", color: "#fff" }}
              >
                {c.ctaBtn}
              </Link>
              <a
                href="https://wa.me/971549988811"
                target="_blank"
                rel="noopener noreferrer"
                className="border-2 border-white/30 text-white font-bold px-8 py-4 rounded-xl hover:bg-white/10 transition-all"
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
