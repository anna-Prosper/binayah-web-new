/* eslint-disable i18next/no-literal-string -- multilingual SEO landing page */
import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { waHref, WA_DEFAULT_MESSAGE } from "@/lib/whatsapp";
import { FAQJsonLd, BreadcrumbJsonLd, ServiceJsonLd } from "@/components/JsonLd";
import { canonical, altLangs, OG_LOCALE, DEFAULT_OG_IMAGE } from "@/lib/site";

export const revalidate = 86400;

const PATH = "/services/real-estate-agency-dubai";

const CONTENT = {
  en: {
    metaTitle: "Real Estate Agency in Dubai | RERA-Registered Since 2007 | Binayah",
    metaDesc: "Binayah is a RERA-registered real estate agency in Dubai (ORN 1162), operating since 2007. Buying, selling, leasing, off-plan, management and valuations. 3,000+ active listings, multilingual team.",
    heroLabel: "REAL ESTATE AGENCY",
    h1: "Real Estate Agency in Dubai",
    heroDesc: "Binayah Properties is a RERA-registered Dubai real estate agency helping buyers, sellers, landlords and tenants across every freehold community in the city. One property agency for the whole journey, from the first viewing to the title deed.",
    heroCta: "Speak to an Agent",
    stats: [
      { n: "2007", label: "Serving Dubai Since" },
      { n: "19+", label: "Years of Market Experience" },
      { n: "3,000+", label: "Active Listings" },
      { n: "RERA", label: "Registered — ORN 1162" },
    ],
    answerTitle: "What Binayah does, and who we do it for",
    answerP1: "Binayah Properties is a full-service real estate agency in Dubai, registered with the Real Estate Regulatory Agency (RERA ORN 1162) and operating from our Dubai office since 2007. We handle residential and investment property end to end: buying, selling, leasing, off-plan purchases, property management and valuations, with more than 3,000 active listings across Dubai's freehold communities.",
    answerP2: "We work with end-users looking for a home, first-time investors buying a single studio, landlords with a growing portfolio, and overseas buyers who need the whole transaction handled remotely. The reason clients choose Binayah over other property agencies in Dubai is simple: RERA-certified agents, a multilingual team that advises in your own language, transparent commission with nothing charged upfront, and one point of contact who stays with you after the keys are handed over.",
    servicesTitle: "What our agency covers",
    services: [
      { icon: "🔑", title: "Buying a property", body: "Ready and secondary-market homes across Dubai. We shortlist against your budget and goals, arrange viewings, negotiate the price and manage the MOU, NOC and DLD transfer.", href: "/buy", cta: "Browse properties for sale" },
      { icon: "🏷️", title: "Selling a property", body: "Comparative market valuation, professional photography, portal and database marketing, qualified buyer viewings and negotiation. No sale, no fee.", href: "/sell", cta: "Sell with Binayah" },
      { icon: "📄", title: "Leasing & renting", body: "Tenant sourcing and screening for landlords, and rental search for tenants. Tenancy contracts and EJARI registration handled for you.", href: "/rent", cta: "See rental homes" },
      { icon: "🏗️", title: "Off-plan investment", body: "Launch access and payment plans from Emaar, DAMAC, Sobha, Nakheel and other major developers, with handover and snagging support.", href: "/off-plan", cta: "Explore off-plan projects" },
      { icon: "🧰", title: "Property management", body: "Rent collection, maintenance coordination, EJARI, inspections and monthly owner reporting, so a Dubai investment runs without you in the country.", href: "/services/property-management", cta: "Property management" },
      { icon: "📊", title: "Valuations", body: "An instant, data-backed estimate of what your property is worth today, followed by an agent review before you list.", href: "/valuation", cta: "Value my property" },
    ],
    plansTitle: "How we work with you",
    plans: [
      { name: "Buyer Representation", fee: "Free for buyers", features: ["Requirements brief and curated shortlist", "In-person or video viewings", "Price and payment-plan negotiation", "MOU, NOC and DLD transfer paperwork", "Mortgage and Golden Visa introductions", "Handover and snagging support"] },
      { name: "Seller Representation", fee: "Commission on completion", features: ["Comparative market valuation", "Professional photography and floor plans", "Portal, database and social marketing", "Buyer qualification and accompanied viewings", "Offer negotiation and MOU", "Transfer at the DLD trustee office"] },
      { name: "Investor & Landlord", fee: "Portfolio service", features: ["Yield-focused shortlist and area analysis", "Off-plan launch access and payment plans", "Tenant sourcing, screening and EJARI", "Ongoing property management", "Annual portfolio and rent review", "Remote handling for overseas owners"] },
    ],
    whyTitle: "Why choose Binayah as your Dubai property agency",
    whyPoints: [
      { title: "RERA-registered since 2007", body: "Binayah Properties holds RERA broker registration ORN 1162 with the Dubai Land Department, and has been advising on Dubai property for more than 19 years." },
      { title: "RERA-certified agents", body: "Our consultants are RERA-certified brokers, not unlicensed introducers. Every deal is documented through DLD channels." },
      { title: "Multilingual advice", body: "We advise in English, Arabic, Russian, French and Chinese, so nothing important gets lost in a translated contract." },
      { title: "Transparent commission", body: "Buyer and tenant services are free. We earn a commission from sellers and landlords on completion, with no upfront or hidden charges." },
      { title: "Built for overseas buyers", body: "Remote viewings, digital paperwork and power-of-attorney options. You do not need to be in Dubai to buy, sell or let a property with us." },
      { title: "One team after the sale", body: "The same agency that sold you the unit can also lease it, manage it and value it later. See the people you will work with on our team page." },
    ],
    exploreTitle: "Explore Binayah",
    links: [
      { label: "Real estate broker in Dubai", href: "/services/real-estate-broker-dubai" },
      { label: "Dubai property investment", href: "/services/property-investment-dubai" },
      { label: "Meet the team", href: "/team" },
      { label: "Dubai communities", href: "/communities" },
      { label: "About the agency", href: "/about" },
      { label: "All services", href: "/services" },
      { label: "Guide: How to choose a Dubai agency", href: "/pulse/guides/how-to-choose-a-real-estate-agency-dubai" },
      { label: "Guide: Best real estate companies in Dubai", href: "/pulse/guides/best-real-estate-companies-dubai" },
      { label: "Contact us", href: "/contact" },
    ],
    faqTitle: "Frequently Asked Questions",
    faqs: [
      { question: "Is Binayah a licensed real estate agency in Dubai?", answer: "Yes. Binayah Properties L.L.C is registered with the Real Estate Regulatory Agency under broker registration number (ORN) 1162, and our consultants hold RERA broker certification. Every sale and lease is registered through Dubai Land Department channels, including EJARI for tenancy contracts." },
      { question: "How much commission does a real estate agency in Dubai charge?", answer: "Standard market practice in Dubai is a 2% commission on the sale price, paid on completion. For leasing, the landlord commission for finding a tenant is typically 5% of the annual rent, and property management is charged separately at roughly 5-8% of the monthly rent. Binayah charges nothing upfront." },
      { question: "Do buyers pay agency fees in Dubai?", answer: "Buyer and tenant services at Binayah are free. We are paid by the seller or landlord when the transaction completes. Buyers still pay the statutory government costs: a 4% DLD transfer fee, an AED 580 DLD admin fee, a trustee fee of around AED 4,000 on properties above AED 500,000, and 0.25% of the loan value if there is a mortgage. Budget roughly 6-7% of the property value in total transaction costs." },
      { question: "What does a seller pay when selling through an agency?", answer: "The seller's main cost is the agent commission, typically 2% of the sale price, payable only when the property sells. Additional costs include a developer NOC fee of AED 500-5,000 and the DLD transfer fee of 4%, which in practice is often split with the buyer. There is no capital gains tax or income tax in the UAE." },
      { question: "Can I buy property in Dubai from overseas?", answer: "Yes. Non-residents can buy freehold property in Dubai, and it is one of the most common cases we handle. We run video viewings, send documents digitally and can act under a power of attorney so the DLD transfer completes without you flying in. Our multilingual team supports buyers in English, Arabic, Russian, French and Chinese." },
      { question: "How long does a Dubai property transaction take?", answer: "A secondary-market purchase typically takes 3-6 weeks from signed MOU to title deed: 10% deposit, developer NOC, then the DLD transfer. An off-plan booking is faster, usually 2-4 weeks. Leasing is quicker again, with contract and EJARI registration normally done within a few days of an agreed offer." },
      { question: "Which Dubai areas does the agency cover?", answer: "All major freehold communities, including Dubai Marina, Downtown Dubai, Palm Jumeirah, Business Bay, JVC, Dubai Hills Estate, Arabian Ranches, Emaar Beachfront and Dubai Creek Harbour, plus new master developments as they launch. You can browse our community guides to compare prices and rental yields area by area." },
      { question: "What is the difference between a property agency and a property manager?", answer: "An agency represents you in a transaction — finding a buyer, a tenant or the right property, and negotiating and documenting the deal. A property manager looks after the asset afterwards: rent collection, maintenance, EJARI renewals and reporting. Binayah does both, so a unit we sell or let can move straight onto our management service." },
    ],
    ctaTitle: "Talk to a Dubai property agent",
    ctaDesc: "Tell us what you are buying, selling or letting and we will put you with the right RERA-certified consultant. No obligation, and no charge for buyers or tenants.",
    ctaBtn: "Speak to an Agent",
    ctaWhatsApp: "WhatsApp Us",
    breadcrumbs: ["Home", "Services", "Real Estate Agency in Dubai"],
  },

  ru: {
    metaTitle: "Агентство недвижимости в Дубае | Лицензия RERA с 2007 года | Binayah",
    metaDesc: "Binayah — агентство недвижимости в Дубае с регистрацией RERA (ORN 1162), работает с 2007 года. Покупка, продажа, аренда, off-plan, управление и оценка. Более 3 000 объектов, поддержка на русском языке.",
    heroLabel: "АГЕНТСТВО НЕДВИЖИМОСТИ",
    h1: "Агентство недвижимости в Дубае",
    heroDesc: "Binayah Properties — зарегистрированное в RERA агентство недвижимости в Дубае. Мы работаем с покупателями, продавцами, собственниками и арендаторами во всех фрихолд-районах города: от первого просмотра до получения свидетельства о собственности.",
    heroCta: "Связаться с агентом",
    stats: [
      { n: "2007", label: "Работаем в Дубае с" },
      { n: "19+", label: "Лет опыта на рынке" },
      { n: "3 000+", label: "Активных объектов" },
      { n: "RERA", label: "Регистрация — ORN 1162" },
    ],
    answerTitle: "Чем занимается Binayah и для кого",
    answerP1: "Binayah Properties — агентство недвижимости полного цикла в Дубае, зарегистрированное в Управлении по регулированию рынка недвижимости (RERA ORN 1162) и работающее из собственного офиса в Дубае с 2007 года. Мы ведём сделки от начала до конца: покупка, продажа, аренда, приобретение объектов на стадии строительства, управление недвижимостью и оценка. В базе — более 3 000 актуальных предложений во фрихолд-районах Дубая.",
    answerP2: "Наши клиенты — это и те, кто ищет жильё для себя, и начинающие инвесторы с одной студией, и владельцы растущих портфелей, и зарубежные покупатели, которым нужно провести сделку дистанционно. Почему выбирают именно Binayah: сертифицированные RERA агенты, многоязычная команда, которая консультирует на вашем языке, прозрачная комиссия без предоплат и один персональный контакт, который остаётся с вами и после передачи ключей.",
    servicesTitle: "Что делает наше агентство",
    services: [
      { icon: "🔑", title: "Покупка недвижимости", body: "Готовое жильё и вторичный рынок Дубая. Подбираем объекты под бюджет и цели, организуем просмотры, ведём переговоры о цене и оформляем MOU, NOC и передачу в DLD.", href: "/buy", cta: "Смотреть объекты в продаже" },
      { icon: "🏷️", title: "Продажа недвижимости", body: "Сравнительная рыночная оценка, профессиональная фотосъёмка, размещение на порталах и в нашей базе, показы проверенным покупателям и переговоры. Нет продажи — нет комиссии.", href: "/sell", cta: "Продать с Binayah" },
      { icon: "📄", title: "Аренда и сдача", body: "Поиск и проверка арендаторов для собственников и подбор жилья для арендаторов. Договоры найма и регистрация EJARI — на нас.", href: "/rent", cta: "Смотреть аренду" },
      { icon: "🏗️", title: "Off-plan инвестиции", body: "Доступ к стартам продаж и рассрочкам от Emaar, DAMAC, Sobha, Nakheel и других крупных застройщиков, сопровождение приёмки объекта.", href: "/off-plan", cta: "Проекты на стадии строительства" },
      { icon: "🧰", title: "Управление недвижимостью", body: "Сбор арендной платы, координация обслуживания, EJARI, инспекции и ежемесячные отчёты владельцу — инвестиция работает без вашего присутствия в ОАЭ.", href: "/services/property-management", cta: "Управление недвижимостью" },
      { icon: "📊", title: "Оценка", body: "Мгновенная оценка на основе рыночных данных, а затем проверка агентом перед выходом на рынок.", href: "/valuation", cta: "Оценить объект" },
    ],
    plansTitle: "Как мы работаем",
    plans: [
      { name: "Сопровождение покупателя", fee: "Бесплатно для покупателя", features: ["Бриф по требованиям и подборка объектов", "Просмотры очно или по видеосвязи", "Переговоры о цене и рассрочке", "Оформление MOU, NOC и передачи в DLD", "Помощь с ипотекой и Golden Visa", "Сопровождение приёмки и устранения дефектов"] },
      { name: "Сопровождение продавца", fee: "Комиссия по факту сделки", features: ["Сравнительная рыночная оценка", "Профессиональные фото и планировки", "Продвижение на порталах, в базе и соцсетях", "Проверка покупателей и показы", "Переговоры по предложениям и MOU", "Регистрация сделки в офисе доверенного лица DLD"] },
      { name: "Инвестору и собственнику", fee: "Портфельный сервис", features: ["Подборка по доходности и анализ районов", "Доступ к стартам продаж и рассрочкам", "Поиск и проверка арендаторов, EJARI", "Постоянное управление недвижимостью", "Ежегодный пересмотр портфеля и арендных ставок", "Полное дистанционное ведение для нерезидентов"] },
    ],
    whyTitle: "Почему выбирают Binayah",
    whyPoints: [
      { title: "Регистрация RERA с 2007 года", body: "У Binayah Properties брокерская регистрация RERA ORN 1162 в Земельном департаменте Дубая и более 19 лет работы на рынке." },
      { title: "Сертифицированные агенты", body: "Наши консультанты — брокеры с сертификацией RERA, а не посредники без лицензии. Каждая сделка проходит через официальные каналы DLD." },
      { title: "Консультации на вашем языке", body: "Мы работаем на русском, английском, арабском, французском и китайском — важные детали договора не потеряются при переводе." },
      { title: "Прозрачная комиссия", body: "Для покупателей и арендаторов услуги бесплатны. Комиссию платят продавцы и собственники по факту сделки, без предоплат и скрытых платежей." },
      { title: "Опыт работы с нерезидентами", body: "Онлайн-просмотры, электронный документооборот и оформление по доверенности. Приезжать в Дубай для сделки не обязательно." },
      { title: "Одна команда после сделки", body: "То же агентство, что продало вам объект, сдаст его в аренду, возьмёт в управление и переоценит позже." },
    ],
    exploreTitle: "Больше о Binayah",
    links: [
      { label: "Брокер по недвижимости в Дубае", href: "/services/real-estate-broker-dubai" },
      { label: "Инвестиции в недвижимость Дубая", href: "/services/property-investment-dubai" },
      { label: "Наша команда", href: "/team" },
      { label: "Районы Дубая", href: "/communities" },
      { label: "Об агентстве", href: "/about" },
      { label: "Все услуги", href: "/services" },
      { label: "Гид: как выбрать агентство в Дубае", href: "/pulse/guides/how-to-choose-a-real-estate-agency-dubai" },
      { label: "Гид: лучшие компании недвижимости Дубая", href: "/pulse/guides/best-real-estate-companies-dubai" },
      { label: "Контакты", href: "/contact" },
    ],
    faqTitle: "Частые вопросы",
    faqs: [
      { question: "Есть ли у Binayah лицензия агентства недвижимости в Дубае?", answer: "Да. Binayah Properties L.L.C зарегистрирована в Управлении по регулированию рынка недвижимости под брокерским номером (ORN) 1162, а наши консультанты имеют брокерскую сертификацию RERA. Все сделки купли-продажи и аренды регистрируются через Земельный департамент Дубая, включая EJARI для договоров найма." },
      { question: "Какую комиссию берут агентства недвижимости в Дубае?", answer: "Стандартная практика рынка — 2% от цены продажи, оплата по факту сделки. При сдаче в аренду комиссия собственника за поиск арендатора обычно составляет 5% от годовой аренды, а управление недвижимостью оплачивается отдельно — примерно 5-8% от месячной аренды. Binayah не берёт предоплат." },
      { question: "Платит ли покупатель комиссию агентству?", answer: "Услуги для покупателей и арендаторов в Binayah бесплатны — нам платит продавец или собственник после закрытия сделки. Покупатель оплачивает государственные сборы: 4% сбор за передачу права в DLD, административный сбор 580 AED, сбор доверенного лица около 4 000 AED для объектов дороже 500 000 AED и 0,25% от суммы кредита при ипотеке. Итого закладывайте около 6-7% от стоимости объекта." },
      { question: "Какие расходы несёт продавец?", answer: "Основная статья расходов продавца — комиссия агента, обычно 2% от цены продажи, и оплачивается она только после продажи. Дополнительно: сбор за NOC у застройщика 500-5 000 AED и сбор DLD за передачу права 4%, который на практике часто делится с покупателем. Налога на прирост капитала и подоходного налога в ОАЭ нет." },
      { question: "Можно ли купить недвижимость в Дубае, находясь за границей?", answer: "Да. Нерезиденты могут покупать фрихолд-недвижимость в Дубае, и это один из самых частых сценариев в нашей работе. Мы проводим видеопросмотры, отправляем документы в электронном виде и можем действовать по доверенности, чтобы передача права в DLD прошла без вашего приезда. Поддержка на русском языке на всех этапах." },
      { question: "Сколько времени занимает сделка в Дубае?", answer: "Покупка на вторичном рынке обычно занимает 3-6 недель от подписания MOU до получения свидетельства о собственности: депозит 10%, NOC от застройщика, затем передача в DLD. Бронирование объекта на стадии строительства быстрее — как правило, 2-4 недели. Аренда оформляется ещё быстрее: договор и регистрация EJARI занимают несколько дней после согласования условий." },
      { question: "В каких районах работает агентство?", answer: "Во всех основных фрихолд-районах: Dubai Marina, Downtown Dubai, Palm Jumeirah, Business Bay, JVC, Dubai Hills Estate, Arabian Ranches, Emaar Beachfront, Dubai Creek Harbour, а также в новых мастер-проектах по мере их запуска. В разделе о районах можно сравнить цены и доходность по каждой локации." },
      { question: "Чем агентство отличается от управляющей компании?", answer: "Агентство представляет ваши интересы в сделке: находит покупателя, арендатора или подходящий объект, ведёт переговоры и оформляет документы. Управляющая компания занимается объектом после этого: сбор аренды, обслуживание, продление EJARI, отчётность. Binayah делает и то, и другое, поэтому проданный или сданный объект сразу может перейти на наше управление." },
    ],
    ctaTitle: "Поговорите с агентом в Дубае",
    ctaDesc: "Расскажите, что вы покупаете, продаёте или сдаёте, и мы подберём подходящего консультанта с сертификацией RERA. Без обязательств и без комиссии для покупателей и арендаторов.",
    ctaBtn: "Связаться с агентом",
    ctaWhatsApp: "Написать в WhatsApp",
    breadcrumbs: ["Главная", "Услуги", "Агентство недвижимости в Дубае"],
  },

  ar: {
    metaTitle: "وكالة عقارية في دبي | مسجَّلة لدى RERA منذ 2007 | بناية للعقارات",
    metaDesc: "بناية للعقارات وكالة عقارية في دبي مسجَّلة لدى RERA برقم ORN 1162 وتعمل منذ عام 2007. بيع وشراء وتأجير ومشاريع على الخارطة وإدارة عقارات وتقييم. أكثر من 3,000 عقار وفريق متعدد اللغات.",
    heroLabel: "وكالة عقارية",
    h1: "وكالة عقارية في دبي",
    heroDesc: "بناية للعقارات وكالة عقارية مسجَّلة لدى RERA في دبي، نخدم المشترين والبائعين والملّاك والمستأجرين في جميع مناطق التملك الحر بالمدينة, من أول معاينة وحتى استلام سند الملكية.",
    heroCta: "تحدث إلى وكيل",
    stats: [
      { n: "2007", label: "نخدم دبي منذ" },
      { n: "+19", label: "عامًا من الخبرة في السوق" },
      { n: "+3,000", label: "عقار معروض" },
      { n: "RERA", label: "مسجَّلة — ORN 1162" },
    ],
    answerTitle: "ماذا تقدّم بناية ولمن",
    answerP1: "بناية للعقارات وكالة عقارية متكاملة الخدمات في دبي، مسجَّلة لدى مؤسسة التنظيم العقاري (RERA) برقم الوسيط ORN 1162 وتعمل من مكتبها في دبي منذ عام 2007. نتولى المعاملة من بدايتها إلى نهايتها: الشراء والبيع والتأجير وشراء العقارات على الخارطة وإدارة العقارات والتقييم، مع أكثر من 3,000 عقار معروض في مناطق التملك الحر بدبي.",
    answerP2: "نعمل مع الباحثين عن سكن، والمستثمرين المبتدئين الذين يشترون استوديو واحدًا، والملّاك أصحاب المحافظ المتنامية، والمشترين من خارج الدولة الذين يحتاجون إلى إتمام المعاملة عن بُعد. سبب اختيار العملاء لبناية بين وكالات العقارات في دبي بسيط: وكلاء معتمدون من RERA، وفريق متعدد اللغات يقدّم المشورة بلغتك، وعمولة شفافة دون أي رسوم مقدَّمة، ونقطة تواصل واحدة تبقى معك بعد تسليم المفاتيح.",
    servicesTitle: "نطاق خدمات الوكالة",
    services: [
      { icon: "🔑", title: "شراء عقار", body: "عقارات جاهزة وسوق إعادة البيع في دبي. نختار العقارات المناسبة لميزانيتك وأهدافك، وننظّم المعاينات ونتفاوض على السعر ونتولى مذكرة التفاهم وشهادة عدم الممانعة ونقل الملكية في دائرة الأراضي.", href: "/buy", cta: "تصفح العقارات المعروضة للبيع" },
      { icon: "🏷️", title: "بيع عقار", body: "تقييم سوقي مقارن، وتصوير احترافي، وتسويق عبر المنصات وقاعدة بياناتنا، ومعاينات لمشترين مؤهَّلين وتفاوض. لا بيع، لا عمولة.", href: "/sell", cta: "بِع مع بناية" },
      { icon: "📄", title: "التأجير والاستئجار", body: "إيجاد المستأجرين وفحصهم للملّاك، والبحث عن سكن للمستأجرين. عقود الإيجار وتسجيل إيجاري نتولاها عنك.", href: "/rent", cta: "عقارات للإيجار" },
      { icon: "🏗️", title: "الاستثمار على الخارطة", body: "وصول مبكر لإطلاقات المشاريع وخطط سداد من إعمار وداماك وصبحا ونخيل وكبار المطورين، مع دعم التسليم وفحص العيوب.", href: "/off-plan", cta: "مشاريع على الخارطة" },
      { icon: "🧰", title: "إدارة العقارات", body: "تحصيل الإيجار وتنسيق الصيانة وإيجاري والفحوصات والتقارير الشهرية للمالك, ليعمل استثمارك في دبي دون حاجة لوجودك في الدولة.", href: "/services/property-management", cta: "إدارة العقارات" },
      { icon: "📊", title: "التقييم", body: "تقدير فوري مبني على بيانات السوق لقيمة عقارك اليوم، تليه مراجعة من وكيل قبل الطرح.", href: "/valuation", cta: "قيّم عقاري" },
    ],
    plansTitle: "كيف نعمل معك",
    plans: [
      { name: "تمثيل المشتري", fee: "مجانًا للمشتري", features: ["تحديد المتطلبات وقائمة عقارات مختارة", "معاينات حضورية أو عبر الفيديو", "التفاوض على السعر وخطة السداد", "مذكرة التفاهم وشهادة عدم الممانعة ونقل الملكية", "التعريف بجهات التمويل والإقامة الذهبية", "دعم التسليم وفحص العيوب"] },
      { name: "تمثيل البائع", fee: "عمولة عند الإتمام", features: ["تقييم سوقي مقارن", "تصوير احترافي ومخططات الطوابق", "تسويق عبر المنصات وقاعدة البيانات ووسائل التواصل", "تأهيل المشترين ومرافقتهم في المعاينات", "التفاوض على العروض ومذكرة التفاهم", "نقل الملكية في مكتب أمين التسجيل"] },
      { name: "المستثمر والمالك", fee: "خدمة المحافظ العقارية", features: ["قائمة مبنية على العائد وتحليل المناطق", "وصول مبكر للإطلاقات وخطط السداد", "إيجاد المستأجرين وفحصهم وتسجيل إيجاري", "إدارة عقارية مستمرة", "مراجعة سنوية للمحفظة وأسعار الإيجار", "إدارة كاملة عن بُعد للملّاك خارج الدولة"] },
    ],
    whyTitle: "لماذا تختار بناية وكالةً عقارية في دبي",
    whyPoints: [
      { title: "مسجَّلة لدى RERA منذ 2007", body: "تحمل بناية للعقارات تسجيل الوساطة لدى RERA برقم ORN 1162 في دائرة الأراضي والأملاك بدبي، وتقدّم الاستشارات العقارية منذ أكثر من 19 عامًا." },
      { title: "وكلاء معتمدون من RERA", body: "مستشارونا وسطاء معتمدون من RERA وليسوا وسطاء غير مرخَّصين. كل صفقة موثَّقة عبر قنوات دائرة الأراضي والأملاك." },
      { title: "استشارة بلغتك", body: "نقدّم المشورة بالعربية والإنجليزية والروسية والفرنسية والصينية، فلا يضيع أي بند مهم في الترجمة." },
      { title: "عمولة شفافة", body: "خدمات المشترين والمستأجرين مجانية. نتقاضى العمولة من البائعين والملّاك عند إتمام الصفقة دون رسوم مقدَّمة أو مخفية." },
      { title: "خبرة مع المشترين من الخارج", body: "معاينات عن بُعد ومستندات رقمية وخيار التوكيل الرسمي. لست مضطرًا للتواجد في دبي للشراء أو البيع أو التأجير." },
      { title: "فريق واحد بعد الصفقة", body: "الوكالة نفسها التي باعتك الوحدة تستطيع تأجيرها وإدارتها وإعادة تقييمها لاحقًا." },
    ],
    exploreTitle: "اكتشف بناية",
    links: [
      { label: "وسيط عقاري في دبي", href: "/services/real-estate-broker-dubai" },
      { label: "الاستثمار العقاري في دبي", href: "/services/property-investment-dubai" },
      { label: "فريق العمل", href: "/team" },
      { label: "مجتمعات دبي", href: "/communities" },
      { label: "عن الوكالة", href: "/about" },
      { label: "جميع الخدمات", href: "/services" },
      { label: "دليل: كيف تختار وكالة عقارية في دبي", href: "/pulse/guides/how-to-choose-a-real-estate-agency-dubai" },
      { label: "دليل: أفضل شركات العقارات في دبي", href: "/pulse/guides/best-real-estate-companies-dubai" },
      { label: "اتصل بنا", href: "/contact" },
    ],
    faqTitle: "الأسئلة الشائعة",
    faqs: [
      { question: "هل بناية وكالة عقارية مرخَّصة في دبي؟", answer: "نعم. بناية للعقارات ذ.م.م مسجَّلة لدى مؤسسة التنظيم العقاري برقم الوسيط (ORN) 1162، ومستشارونا حاصلون على اعتماد الوساطة من RERA. تُسجَّل كل عمليات البيع والتأجير عبر قنوات دائرة الأراضي والأملاك بدبي، بما في ذلك إيجاري لعقود الإيجار." },
      { question: "كم تبلغ عمولة الوكالة العقارية في دبي؟", answer: "العرف السائد في السوق هو عمولة 2% من سعر البيع تُدفع عند إتمام الصفقة. أما في التأجير فعمولة المالك لإيجاد مستأجر تبلغ عادةً 5% من الإيجار السنوي، وتُحتسب إدارة العقار بشكل منفصل بنحو 5-8% من الإيجار الشهري. بناية لا تتقاضى أي رسوم مقدَّمة." },
      { question: "هل يدفع المشتري رسوم الوكالة في دبي؟", answer: "خدمات المشترين والمستأجرين لدى بناية مجانية، إذ يدفع البائع أو المالك عند إتمام المعاملة. يبقى على المشتري سداد الرسوم الحكومية: 4% رسوم نقل ملكية لدائرة الأراضي، و580 درهمًا رسوم إدارية، ونحو 4,000 درهم رسوم أمين التسجيل للعقارات فوق 500,000 درهم، و0.25% من قيمة القرض في حال التمويل. احسب نحو 6-7% من قيمة العقار كتكاليف معاملة إجمالية." },
      { question: "ماذا يدفع البائع عند البيع عبر وكالة؟", answer: "التكلفة الأساسية على البائع هي عمولة الوكيل، وتبلغ عادةً 2% من سعر البيع وتُستحق فقط عند إتمام البيع. تضاف رسوم شهادة عدم الممانعة من المطور بين 500 و5,000 درهم، ورسوم نقل الملكية 4% التي تُقسَّم عمليًا مع المشتري في كثير من الحالات. لا توجد ضريبة أرباح رأسمالية أو ضريبة دخل في الإمارات." },
      { question: "هل يمكنني الشراء في دبي وأنا خارج الدولة؟", answer: "نعم. يمكن لغير المقيمين تملّك العقارات في مناطق التملك الحر بدبي، وهي من أكثر الحالات شيوعًا لدينا. ننظّم معاينات بالفيديو ونرسل المستندات إلكترونيًا ويمكننا التصرف بموجب توكيل رسمي لإتمام نقل الملكية دون سفرك. ويقدّم فريقنا الدعم بالعربية والإنجليزية والروسية والفرنسية والصينية." },
      { question: "كم تستغرق المعاملة العقارية في دبي؟", answer: "يستغرق الشراء في سوق إعادة البيع عادةً 3-6 أسابيع من توقيع مذكرة التفاهم حتى سند الملكية: دفعة 10%، ثم شهادة عدم الممانعة من المطور، ثم نقل الملكية في الدائرة. أما حجز عقار على الخارطة فأسرع، غالبًا 2-4 أسابيع. والتأجير أسرع من ذلك، إذ يُنجَز العقد وتسجيل إيجاري خلال أيام من الاتفاق." },
      { question: "ما المناطق التي تغطيها الوكالة؟", answer: "جميع مناطق التملك الحر الرئيسية، ومنها دبي مارينا ووسط مدينة دبي ونخلة جميرا والخليج التجاري وقرية جميرا الدائرية وتلال دبي والمرابع العربية وإعمار بيتشفرونت وخور دبي، إضافةً إلى المشاريع الكبرى الجديدة عند إطلاقها. يمكنك تصفح أدلة المجتمعات لمقارنة الأسعار والعوائد الإيجارية منطقةً بمنطقة." },
      { question: "ما الفرق بين الوكالة العقارية وشركة إدارة العقارات؟", answer: "الوكالة تمثّلك في المعاملة: إيجاد المشتري أو المستأجر أو العقار المناسب والتفاوض وتوثيق الصفقة. أما إدارة العقارات فتعتني بالأصل بعد ذلك: تحصيل الإيجار والصيانة وتجديد إيجاري والتقارير. تقدّم بناية الخدمتين معًا، فينتقل العقار الذي نبيعه أو نؤجّره مباشرةً إلى خدمة الإدارة لدينا." },
    ],
    ctaTitle: "تحدث إلى وكيل عقاري في دبي",
    ctaDesc: "أخبرنا بما ترغب في شرائه أو بيعه أو تأجيره وسنوجّهك إلى المستشار المعتمد من RERA المناسب. دون أي التزام، ودون رسوم على المشترين والمستأجرين.",
    ctaBtn: "تحدث إلى وكيل",
    ctaWhatsApp: "واتساب",
    breadcrumbs: ["الرئيسية", "الخدمات", "وكالة عقارية في دبي"],
  },

  zh: {
    metaTitle: "迪拜房产中介公司 | RERA注册，深耕迪拜自2007年 | Binayah",
    metaDesc: "Binayah是一家在迪拜注册的房地产中介公司（RERA ORN 1162），自2007年营业。提供买卖、租赁、期房、物业管理和估价服务。3,000+在售房源，多语言团队，全程中文服务。",
    heroLabel: "房产中介",
    h1: "迪拜房产中介公司",
    heroDesc: "Binayah Properties是一家持有RERA注册资质的迪拜房产中介，为买家、卖家、业主和租客服务，覆盖全市所有永久产权社区, 从第一次看房到拿到房产证，全程由同一支团队负责。",
    heroCta: "联系置业顾问",
    stats: [
      { n: "2007", label: "深耕迪拜起始年份" },
      { n: "19+", label: "年市场经验" },
      { n: "3,000+", label: "在售房源" },
      { n: "RERA", label: "注册编号 ORN 1162" },
    ],
    answerTitle: "Binayah做什么，为谁服务",
    answerP1: "Binayah Properties是一家提供全流程服务的迪拜房地产中介公司，已在迪拜房地产监管局（RERA）注册，经纪牌照编号ORN 1162，自2007年起在迪拜设有办公室并持续营业。我们承接完整链条的业务：买房、卖房、租赁、期房认购、物业管理和房产估价，目前在迪拜各永久产权社区拥有3,000多套在售房源。",
    answerP2: "我们的客户既有自住购房者，也有购入第一套单间公寓的新手投资者、持有多套房产的业主，以及需要全程远程办理的海外买家。客户在众多迪拜房产中介中选择Binayah的原因很直接：持RERA证书的经纪人、可用您的母语沟通的多语言团队、透明且无前期费用的佣金结构，以及一位在交房之后仍然对接您的专属顾问。",
    servicesTitle: "中介服务范围",
    services: [
      { icon: "🔑", title: "购买房产", body: "迪拜现房及二手房源。我们按您的预算和目标筛选房源、安排看房、议价，并办理MOU、开发商NOC和迪拜土地局过户。", href: "/buy", cta: "浏览在售房源" },
      { icon: "🏷️", title: "出售房产", body: "市场比较估价、专业摄影、门户网站与自有客户库推广、合格买家带看及议价。不成交不收费。", href: "/sell", cta: "委托Binayah出售" },
      { icon: "📄", title: "出租与租赁", body: "为业主寻找并审核租客，为租客匹配房源。租赁合同和EJARI登记由我们办理。", href: "/rent", cta: "查看出租房源" },
      { icon: "🏗️", title: "期房投资", body: "获取Emaar、DAMAC、Sobha、Nakheel等主要开发商的开盘名额与付款计划，并提供交房与验房支持。", href: "/off-plan", cta: "查看期房项目" },
      { icon: "🧰", title: "物业管理", body: "租金收取、维修协调、EJARI、房屋检查和月度业主报告, 让您的迪拜资产在您不在阿联酋时也正常运转。", href: "/services/property-management", cta: "物业管理服务" },
      { icon: "📊", title: "房产估价", body: "基于市场数据的即时估值，再由经纪人复核，帮助您在挂牌前定出合理价格。", href: "/valuation", cta: "免费估价" },
    ],
    plansTitle: "我们的合作方式",
    plans: [
      { name: "买方代理", fee: "买家免费", features: ["需求梳理与精选房源清单", "线下带看或视频看房", "价格与付款计划谈判", "MOU、NOC与土地局过户手续", "对接按揭与黄金签证", "交房与验房支持"] },
      { name: "卖方代理", fee: "成交后收取佣金", features: ["市场比较估价", "专业摄影与户型图", "门户网站、客户库与社交媒体推广", "买家资质审核与陪同带看", "报价谈判与MOU签署", "在土地局受托办公室完成过户"] },
      { name: "投资者与业主", fee: "资产组合服务", features: ["以收益率为导向的选房与区域分析", "开盘名额与付款计划", "租客寻找、审核与EJARI登记", "长期物业管理", "年度资产组合与租金复核", "海外业主全程远程办理"] },
    ],
    whyTitle: "为什么选择Binayah作为您的迪拜房产中介",
    whyPoints: [
      { title: "自2007年持RERA注册", body: "Binayah Properties持有迪拜土地局RERA经纪注册编号ORN 1162，从事迪拜房地产咨询已超过19年。" },
      { title: "RERA认证经纪人", body: "我们的顾问是持证RERA经纪人，而非无牌中间人。每笔交易均通过迪拜土地局官方渠道登记。" },
      { title: "母语沟通", body: "我们以中文、英语、阿拉伯语、俄语和法语提供咨询，合同中的关键条款不会因翻译而失真。" },
      { title: "佣金透明", body: "买家和租客免费。我们在成交后向卖家或业主收取佣金，无前期费用，无隐性收费。" },
      { title: "熟悉海外买家流程", body: "远程看房、电子文件与授权委托书方案。您无需身在迪拜即可完成买卖或出租。" },
      { title: "成交后仍是同一团队", body: "卖给您房子的中介，之后同样可以为您出租、托管并重新估价。" },
    ],
    exploreTitle: "了解Binayah",
    links: [
      { label: "迪拜房地产经纪人", href: "/services/real-estate-broker-dubai" },
      { label: "迪拜房产投资", href: "/services/property-investment-dubai" },
      { label: "认识我们的团队", href: "/team" },
      { label: "迪拜社区指南", href: "/communities" },
      { label: "关于我们", href: "/about" },
      { label: "全部服务", href: "/services" },
      { label: "指南：如何选择迪拜房产中介", href: "/pulse/guides/how-to-choose-a-real-estate-agency-dubai" },
      { label: "指南：迪拜最佳房地产公司", href: "/pulse/guides/best-real-estate-companies-dubai" },
      { label: "联系我们", href: "/contact" },
    ],
    faqTitle: "常见问题解答",
    faqs: [
      { question: "Binayah是持牌的迪拜房产中介吗？", answer: "是的。Binayah Properties L.L.C已在迪拜房地产监管局注册，经纪注册编号（ORN）为1162，我们的顾问持有RERA经纪资格认证。所有买卖和租赁均通过迪拜土地局渠道登记，租赁合同还会完成EJARI登记。" },
      { question: "迪拜房产中介收取多少佣金？", answer: "迪拜市场惯例是按成交价的2%收取佣金，成交时支付。租赁方面，业主为寻找租客支付的佣金通常为年租金的5%；物业管理另行计费，约为月租金的5%-8%。Binayah不收取任何前期费用。" },
      { question: "在迪拜买房，买家需要付中介费吗？", answer: "在Binayah，买家和租客的服务是免费的，佣金由卖家或业主在成交时支付。买家仍需承担法定政府费用：土地局过户费为房价的4%、土地局管理费580迪拉姆、50万迪拉姆以上房产约4,000迪拉姆的受托机构费，以及按揭情况下贷款额的0.25%。总交易成本约为房价的6%-7%。" },
      { question: "通过中介出售房产，卖家需要承担哪些费用？", answer: "卖家的主要成本是中介佣金，通常为成交价的2%，且只在成功售出后支付。此外还有开发商NOC费用500-5,000迪拉姆，以及4%的土地局过户费（实践中常与买家分担）。阿联酋没有资本利得税和个人所得税。" },
      { question: "我人在国外，可以购买迪拜房产吗？", answer: "可以。非居民能够购买迪拜永久产权房产，这也是我们最常处理的情况之一。我们提供视频看房、电子文件传递，并可依据授权委托书代为在土地局办理过户，您无需亲自前来。我们提供全程中文以及英语、阿拉伯语、俄语和法语支持。" },
      { question: "迪拜房产交易需要多长时间？", answer: "二手房交易通常从签署MOU到拿到房产证需要3-6周：支付10%定金、取得开发商NOC，然后在土地局完成过户。期房认购更快，一般为2-4周。租赁最快，达成一致后数日内即可完成合同签署和EJARI登记。" },
      { question: "中介覆盖迪拜哪些区域？", answer: "覆盖所有主要永久产权社区，包括迪拜码头、迪拜市中心、朱美拉棕榈岛、商业湾、JVC、迪拜山庄、阿拉伯牧场、Emaar Beachfront和迪拜溪港，以及新推出的大型综合体项目。您可以浏览我们的社区指南，逐区比较房价和租金回报率。" },
      { question: "房产中介和物业管理公司有什么区别？", answer: "中介在交易中代表您：寻找买家、租客或合适房源，负责议价和文件办理。物业管理公司则在此之后照管资产：收租、维修、EJARI续签和出具报告。Binayah两者兼营，因此我们售出或出租的房产可以直接转入托管服务。" },
    ],
    ctaTitle: "与迪拜置业顾问聊一聊",
    ctaDesc: "告诉我们您想买、想卖还是想出租，我们会为您匹配合适的RERA持证顾问。无任何义务，买家和租客免费。",
    ctaBtn: "联系置业顾问",
    ctaWhatsApp: "WhatsApp咨询",
    breadcrumbs: ["首页", "服务", "迪拜房产中介公司"],
  },

  fr: {
    metaTitle: "Agence immobilière à Dubaï | Enregistrée RERA depuis 2007 | Binayah",
    metaDesc: "Binayah est une agence immobilière à Dubaï enregistrée auprès de la RERA (ORN 1162), active depuis 2007. Achat, vente, location, VEFA, gestion locative et estimation. Plus de 3 000 biens, équipe multilingue.",
    heroLabel: "AGENCE IMMOBILIÈRE",
    h1: "Agence immobilière à Dubaï",
    heroDesc: "Binayah Properties est une agence immobilière enregistrée auprès de la RERA à Dubaï. Nous accompagnons acheteurs, vendeurs, propriétaires et locataires dans toutes les communautés en pleine propriété de la ville, de la première visite jusqu'au titre de propriété.",
    heroCta: "Parler à un conseiller",
    stats: [
      { n: "2007", label: "À Dubaï depuis" },
      { n: "19+", label: "Ans d'expérience du marché" },
      { n: "3 000+", label: "Biens disponibles" },
      { n: "RERA", label: "Enregistrée — ORN 1162" },
    ],
    answerTitle: "Ce que fait Binayah, et pour qui",
    answerP1: "Binayah Properties est une agence immobilière de plein exercice à Dubaï, enregistrée auprès de l'autorité de régulation immobilière (RERA, numéro de courtier ORN 1162) et installée dans ses bureaux de Dubaï depuis 2007. Nous prenons en charge la transaction de bout en bout : achat, vente, location, acquisition sur plan, gestion locative et estimation, avec plus de 3 000 biens disponibles dans les communautés en pleine propriété de Dubaï.",
    answerP2: "Nous travaillons aussi bien avec des particuliers qui cherchent un logement qu'avec des primo-investisseurs achetant un studio, des propriétaires bailleurs au portefeuille croissant et des acquéreurs étrangers qui doivent tout gérer à distance. La raison pour laquelle nos clients choisissent Binayah parmi les agences immobilières de Dubaï est simple : des conseillers certifiés RERA, une équipe multilingue qui vous conseille dans votre langue, une commission transparente sans aucun frais initial, et un interlocuteur unique qui reste à vos côtés après la remise des clés.",
    servicesTitle: "Le périmètre de notre agence",
    services: [
      { icon: "🔑", title: "Achat immobilier", body: "Biens livrés et marché secondaire à Dubaï. Nous établissons une sélection selon votre budget et vos objectifs, organisons les visites, négocions le prix et gérons le MOU, le NOC et le transfert au DLD.", href: "/buy", cta: "Voir les biens à vendre" },
      { icon: "🏷️", title: "Vente immobilière", body: "Estimation comparative de marché, photographie professionnelle, diffusion sur les portails et notre base d'acquéreurs, visites qualifiées et négociation. Pas de vente, pas d'honoraires.", href: "/sell", cta: "Vendre avec Binayah" },
      { icon: "📄", title: "Location et mise en location", body: "Recherche et sélection de locataires pour les propriétaires, recherche de logement pour les locataires. Contrat de bail et enregistrement EJARI pris en charge.", href: "/rent", cta: "Voir les locations" },
      { icon: "🏗️", title: "Investissement sur plan", body: "Accès aux lancements et échéanciers d'Emaar, DAMAC, Sobha, Nakheel et des autres grands promoteurs, avec accompagnement à la livraison et à la réception.", href: "/off-plan", cta: "Découvrir les projets sur plan" },
      { icon: "🧰", title: "Gestion locative", body: "Encaissement des loyers, coordination de l'entretien, EJARI, inspections et reporting mensuel au propriétaire : votre investissement tourne sans vous aux Émirats.", href: "/services/property-management", cta: "Gestion locative" },
      { icon: "📊", title: "Estimation", body: "Une estimation instantanée fondée sur les données du marché, revue ensuite par un conseiller avant la mise en vente.", href: "/valuation", cta: "Estimer mon bien" },
    ],
    plansTitle: "Comment nous travaillons avec vous",
    plans: [
      { name: "Accompagnement acheteur", fee: "Gratuit pour l'acheteur", features: ["Cahier des charges et sélection sur mesure", "Visites sur place ou en visioconférence", "Négociation du prix et de l'échéancier", "Formalités MOU, NOC et transfert DLD", "Mise en relation crédit et Golden Visa", "Accompagnement livraison et réception"] },
      { name: "Mandat de vente", fee: "Commission à la signature", features: ["Estimation comparative de marché", "Photographie professionnelle et plans", "Diffusion portails, base clients et réseaux sociaux", "Qualification des acquéreurs et visites accompagnées", "Négociation des offres et MOU", "Transfert au bureau du trustee du DLD"] },
      { name: "Investisseur et bailleur", fee: "Service portefeuille", features: ["Sélection orientée rendement et analyse des quartiers", "Accès aux lancements et échéanciers", "Recherche et sélection de locataires, EJARI", "Gestion locative continue", "Revue annuelle du portefeuille et des loyers", "Prise en charge à distance pour les non-résidents"] },
    ],
    whyTitle: "Pourquoi choisir Binayah comme agence immobilière à Dubaï",
    whyPoints: [
      { title: "Enregistrée RERA depuis 2007", body: "Binayah Properties détient l'enregistrement de courtier RERA ORN 1162 auprès du Dubai Land Department et conseille sur l'immobilier dubaïote depuis plus de 19 ans." },
      { title: "Conseillers certifiés RERA", body: "Nos consultants sont des courtiers certifiés RERA, et non des intermédiaires non agréés. Chaque opération est documentée via les canaux du DLD." },
      { title: "Conseil multilingue", body: "Nous conseillons en français, anglais, arabe, russe et chinois : aucune clause importante ne se perd dans la traduction d'un contrat." },
      { title: "Commission transparente", body: "Les services aux acheteurs et locataires sont gratuits. Nous sommes rémunérés par le vendeur ou le bailleur à la signature, sans frais initiaux ni frais cachés." },
      { title: "Pensée pour les acquéreurs étrangers", body: "Visites à distance, documents numériques et procuration possible. Il n'est pas nécessaire d'être à Dubaï pour acheter, vendre ou louer avec nous." },
      { title: "La même équipe après la vente", body: "L'agence qui vous a vendu le bien peut ensuite le louer, le gérer et le réévaluer plus tard." },
    ],
    exploreTitle: "Découvrir Binayah",
    links: [
      { label: "Courtier immobilier à Dubaï", href: "/services/real-estate-broker-dubai" },
      { label: "Investissement immobilier à Dubaï", href: "/services/property-investment-dubai" },
      { label: "Notre équipe", href: "/team" },
      { label: "Quartiers de Dubaï", href: "/communities" },
      { label: "À propos de l'agence", href: "/about" },
      { label: "Tous nos services", href: "/services" },
      { label: "Guide : comment choisir une agence à Dubaï", href: "/pulse/guides/how-to-choose-a-real-estate-agency-dubai" },
      { label: "Guide : les meilleures sociétés immobilières de Dubaï", href: "/pulse/guides/best-real-estate-companies-dubai" },
      { label: "Nous contacter", href: "/contact" },
    ],
    faqTitle: "Questions fréquentes",
    faqs: [
      { question: "Binayah est-elle une agence immobilière agréée à Dubaï ?", answer: "Oui. Binayah Properties L.L.C est enregistrée auprès de l'autorité de régulation immobilière sous le numéro de courtier (ORN) 1162, et nos conseillers détiennent la certification de courtier RERA. Chaque vente et chaque location sont enregistrées via les canaux du Dubai Land Department, y compris EJARI pour les contrats de bail." },
      { question: "Quelle commission prend une agence immobilière à Dubaï ?", answer: "L'usage du marché à Dubaï est une commission de 2 % du prix de vente, payable à la signature. En location, la commission du bailleur pour trouver un locataire s'élève généralement à 5 % du loyer annuel, et la gestion locative est facturée séparément, autour de 5 à 8 % du loyer mensuel. Binayah ne facture aucun frais initial." },
      { question: "L'acheteur paie-t-il des honoraires d'agence à Dubaï ?", answer: "Chez Binayah, les services aux acheteurs et aux locataires sont gratuits : nous sommes rémunérés par le vendeur ou le bailleur à la conclusion de la transaction. L'acheteur règle en revanche les frais publics : 4 % de frais de transfert DLD, 580 AED de frais administratifs, environ 4 000 AED de frais de trustee au-delà de 500 000 AED, et 0,25 % du montant emprunté en cas de crédit. Comptez au total environ 6 à 7 % de la valeur du bien." },
      { question: "Que paie un vendeur qui passe par une agence ?", answer: "Le principal coût du vendeur est la commission de l'agent, généralement 2 % du prix de vente, due uniquement lorsque le bien est vendu. S'y ajoutent les frais de NOC du promoteur (500 à 5 000 AED) et les frais de transfert DLD de 4 %, en pratique souvent partagés avec l'acheteur. Il n'y a ni impôt sur les plus-values ni impôt sur le revenu aux Émirats." },
      { question: "Puis-je acheter à Dubaï depuis l'étranger ?", answer: "Oui. Les non-résidents peuvent acquérir un bien en pleine propriété à Dubaï, et c'est l'un des cas que nous traitons le plus souvent. Nous organisons des visites vidéo, transmettons les documents par voie numérique et pouvons agir sous procuration pour que le transfert au DLD se fasse sans votre venue. Notre équipe vous accompagne en français, anglais, arabe, russe et chinois." },
      { question: "Combien de temps prend une transaction immobilière à Dubaï ?", answer: "Un achat dans l'ancien prend généralement 3 à 6 semaines entre la signature du MOU et le titre de propriété : acompte de 10 %, NOC du promoteur, puis transfert au DLD. Une réservation sur plan est plus rapide, souvent 2 à 4 semaines. La location l'est encore davantage : contrat et enregistrement EJARI se font habituellement en quelques jours après accord." },
      { question: "Quels quartiers de Dubaï l'agence couvre-t-elle ?", answer: "Toutes les grandes communautés en pleine propriété : Dubai Marina, Downtown Dubai, Palm Jumeirah, Business Bay, JVC, Dubai Hills Estate, Arabian Ranches, Emaar Beachfront et Dubai Creek Harbour, ainsi que les nouveaux grands projets dès leur lancement. Nos guides de quartiers permettent de comparer prix et rendements locatifs zone par zone." },
      { question: "Quelle différence entre une agence et un gestionnaire immobilier ?", answer: "Une agence vous représente dans la transaction : trouver un acquéreur, un locataire ou le bon bien, négocier et formaliser l'opération. Un gestionnaire s'occupe du bien ensuite : encaissement des loyers, entretien, renouvellement EJARI et reporting. Binayah fait les deux, si bien qu'un bien que nous vendons ou louons peut passer directement en gestion chez nous." },
    ],
    ctaTitle: "Parlez à un conseiller immobilier à Dubaï",
    ctaDesc: "Dites-nous ce que vous souhaitez acheter, vendre ou louer et nous vous mettrons en relation avec le conseiller certifié RERA adapté. Sans engagement, et sans frais pour les acheteurs et locataires.",
    ctaBtn: "Parler à un conseiller",
    ctaWhatsApp: "Écrivez-nous sur WhatsApp",
    breadcrumbs: ["Accueil", "Services", "Agence immobilière à Dubaï"],
  },

  vi: {
    metaTitle: "Công ty môi giới bất động sản tại Dubai | Đăng ký RERA từ 2007 | Binayah",
    metaDesc: "Binayah là công ty môi giới bất động sản tại Dubai có đăng ký RERA (ORN 1162), hoạt động từ năm 2007. Mua bán, cho thuê, dự án hình thành trong tương lai, quản lý và định giá. Hơn 3.000 bất động sản, đội ngũ đa ngôn ngữ.",
    heroLabel: "CÔNG TY MÔI GIỚI BẤT ĐỘNG SẢN",
    h1: "Công ty môi giới bất động sản tại Dubai",
    heroDesc: "Binayah Properties là công ty môi giới bất động sản tại Dubai có đăng ký RERA, đồng hành cùng người mua, người bán, chủ nhà và khách thuê tại mọi khu sở hữu vĩnh viễn của thành phố, từ buổi xem nhà đầu tiên đến khi nhận sổ hồng.",
    heroCta: "Trao đổi với chuyên viên",
    stats: [
      { n: "2007", label: "Hoạt động tại Dubai từ" },
      { n: "19+", label: "Năm kinh nghiệm thị trường" },
      { n: "3.000+", label: "Bất động sản đang chào bán" },
      { n: "RERA", label: "Đăng ký — ORN 1162" },
    ],
    answerTitle: "Binayah làm gì và phục vụ ai",
    answerP1: "Binayah Properties là công ty môi giới bất động sản trọn gói tại Dubai, đăng ký với Cơ quan Quản lý Bất động sản (RERA, số môi giới ORN 1162) và hoạt động từ văn phòng tại Dubai kể từ năm 2007. Chúng tôi xử lý giao dịch từ đầu đến cuối: mua, bán, cho thuê, mua dự án hình thành trong tương lai, quản lý bất động sản và định giá, với hơn 3.000 bất động sản đang chào bán tại các khu sở hữu vĩnh viễn của Dubai.",
    answerP2: "Khách hàng của chúng tôi gồm người tìm nhà để ở, nhà đầu tư lần đầu mua một căn studio, chủ nhà đang mở rộng danh mục, và người mua ở nước ngoài cần xử lý toàn bộ giao dịch từ xa. Lý do khách hàng chọn Binayah giữa nhiều công ty môi giới tại Dubai rất đơn giản: chuyên viên được chứng nhận RERA, đội ngũ đa ngôn ngữ tư vấn bằng chính ngôn ngữ của bạn, hoa hồng minh bạch và không thu trước bất kỳ khoản nào, cùng một đầu mối liên hệ vẫn đồng hành sau khi bàn giao nhà.",
    servicesTitle: "Phạm vi dịch vụ của chúng tôi",
    services: [
      { icon: "🔑", title: "Mua bất động sản", body: "Nhà đã bàn giao và thị trường thứ cấp tại Dubai. Chúng tôi lọc danh sách theo ngân sách và mục tiêu, sắp xếp xem nhà, đàm phán giá và xử lý MOU, NOC cùng thủ tục sang tên tại DLD.", href: "/buy", cta: "Xem bất động sản đang bán" },
      { icon: "🏷️", title: "Bán bất động sản", body: "Định giá so sánh thị trường, chụp ảnh chuyên nghiệp, quảng bá trên các cổng thông tin và cơ sở dữ liệu khách hàng, dẫn xem cho người mua đủ điều kiện và đàm phán. Không bán được, không tính phí.", href: "/sell", cta: "Bán cùng Binayah" },
      { icon: "📄", title: "Cho thuê và thuê nhà", body: "Tìm và sàng lọc khách thuê cho chủ nhà, tìm nhà cho khách thuê. Hợp đồng thuê và đăng ký EJARI do chúng tôi lo.", href: "/rent", cta: "Xem nhà cho thuê" },
      { icon: "🏗️", title: "Đầu tư dự án hình thành trong tương lai", body: "Tiếp cận đợt mở bán và lịch thanh toán từ Emaar, DAMAC, Sobha, Nakheel và các chủ đầu tư lớn khác, kèm hỗ trợ bàn giao và nghiệm thu.", href: "/off-plan", cta: "Khám phá dự án off-plan" },
      { icon: "🧰", title: "Quản lý bất động sản", body: "Thu tiền thuê, điều phối bảo trì, EJARI, kiểm tra định kỳ và báo cáo hàng tháng cho chủ sở hữu, để khoản đầu tư vận hành khi bạn không ở UAE.", href: "/services/property-management", cta: "Quản lý bất động sản" },
      { icon: "📊", title: "Định giá", body: "Ước tính tức thì dựa trên dữ liệu thị trường, sau đó được chuyên viên rà soát trước khi bạn chào bán.", href: "/valuation", cta: "Định giá nhà của tôi" },
    ],
    plansTitle: "Cách chúng tôi làm việc cùng bạn",
    plans: [
      { name: "Đại diện người mua", fee: "Miễn phí cho người mua", features: ["Xác định nhu cầu và danh sách chọn lọc", "Xem nhà trực tiếp hoặc qua video", "Đàm phán giá và lịch thanh toán", "Thủ tục MOU, NOC và sang tên tại DLD", "Kết nối vay thế chấp và Golden Visa", "Hỗ trợ bàn giao và nghiệm thu"] },
      { name: "Đại diện người bán", fee: "Hoa hồng khi hoàn tất", features: ["Định giá so sánh thị trường", "Ảnh chuyên nghiệp và mặt bằng căn hộ", "Quảng bá trên cổng thông tin, cơ sở dữ liệu và mạng xã hội", "Thẩm định người mua và dẫn xem", "Đàm phán đề nghị và ký MOU", "Sang tên tại văn phòng trustee của DLD"] },
      { name: "Nhà đầu tư và chủ nhà", fee: "Dịch vụ danh mục", features: ["Danh sách theo lợi suất và phân tích khu vực", "Tiếp cận đợt mở bán và lịch thanh toán", "Tìm, sàng lọc khách thuê và đăng ký EJARI", "Quản lý bất động sản liên tục", "Rà soát danh mục và giá thuê hàng năm", "Xử lý từ xa cho chủ sở hữu ở nước ngoài"] },
    ],
    whyTitle: "Vì sao chọn Binayah làm công ty môi giới tại Dubai",
    whyPoints: [
      { title: "Đăng ký RERA từ năm 2007", body: "Binayah Properties có đăng ký môi giới RERA số ORN 1162 với Sở Đất đai Dubai và đã tư vấn bất động sản Dubai hơn 19 năm." },
      { title: "Chuyên viên được chứng nhận RERA", body: "Đội ngũ của chúng tôi là môi giới có chứng nhận RERA, không phải người giới thiệu không phép. Mọi giao dịch đều được ghi nhận qua kênh của DLD." },
      { title: "Tư vấn đa ngôn ngữ", body: "Chúng tôi tư vấn bằng tiếng Anh, Ả Rập, Nga, Pháp và Trung, nên không điều khoản quan trọng nào bị hiểu sai qua bản dịch." },
      { title: "Hoa hồng minh bạch", body: "Dịch vụ cho người mua và khách thuê là miễn phí. Chúng tôi nhận hoa hồng từ người bán và chủ nhà khi giao dịch hoàn tất, không thu trước và không phí ẩn." },
      { title: "Quen thuộc với người mua ở nước ngoài", body: "Xem nhà từ xa, hồ sơ điện tử và phương án ủy quyền. Bạn không cần có mặt tại Dubai để mua, bán hay cho thuê." },
      { title: "Vẫn là một đội sau giao dịch", body: "Chính công ty đã bán căn hộ cho bạn cũng có thể cho thuê, quản lý và định giá lại về sau." },
    ],
    exploreTitle: "Tìm hiểu Binayah",
    links: [
      { label: "Môi giới bất động sản tại Dubai", href: "/services/real-estate-broker-dubai" },
      { label: "Đầu tư bất động sản tại Dubai", href: "/services/property-investment-dubai" },
      { label: "Đội ngũ của chúng tôi", href: "/team" },
      { label: "Các khu dân cư Dubai", href: "/communities" },
      { label: "Về công ty", href: "/about" },
      { label: "Tất cả dịch vụ", href: "/services" },
      { label: "Hướng dẫn: cách chọn đại lý bất động sản tại Dubai", href: "/pulse/guides/how-to-choose-a-real-estate-agency-dubai" },
      { label: "Hướng dẫn: các công ty bất động sản tốt nhất tại Dubai", href: "/pulse/guides/best-real-estate-companies-dubai" },
      { label: "Liên hệ", href: "/contact" },
    ],
    faqTitle: "Câu hỏi thường gặp",
    faqs: [
      { question: "Binayah có phải là công ty môi giới bất động sản được cấp phép tại Dubai không?", answer: "Có. Binayah Properties L.L.C đăng ký với Cơ quan Quản lý Bất động sản dưới số đăng ký môi giới (ORN) 1162, và các chuyên viên của chúng tôi có chứng nhận môi giới RERA. Mọi giao dịch mua bán và cho thuê đều được đăng ký qua kênh của Sở Đất đai Dubai, bao gồm EJARI cho hợp đồng thuê." },
      { question: "Công ty môi giới tại Dubai thu hoa hồng bao nhiêu?", answer: "Thông lệ thị trường Dubai là hoa hồng 2% giá bán, thanh toán khi hoàn tất giao dịch. Với cho thuê, hoa hồng chủ nhà trả để tìm khách thuê thường là 5% tiền thuê năm, còn quản lý bất động sản tính riêng, khoảng 5-8% tiền thuê hàng tháng. Binayah không thu bất kỳ khoản nào trước." },
      { question: "Người mua có phải trả phí môi giới tại Dubai không?", answer: "Tại Binayah, dịch vụ cho người mua và khách thuê là miễn phí; chúng tôi được người bán hoặc chủ nhà chi trả khi giao dịch hoàn tất. Người mua vẫn nộp các khoản phí nhà nước: phí sang tên DLD 4%, phí hành chính 580 AED, phí trustee khoảng 4.000 AED với bất động sản trên 500.000 AED, và 0,25% giá trị khoản vay nếu có thế chấp. Tổng chi phí giao dịch khoảng 6-7% giá trị bất động sản." },
      { question: "Người bán phải trả những gì khi bán qua công ty môi giới?", answer: "Chi phí chính của người bán là hoa hồng môi giới, thường 2% giá bán và chỉ phải trả khi bán được. Ngoài ra có phí NOC của chủ đầu tư từ 500 đến 5.000 AED và phí sang tên DLD 4%, trên thực tế thường được chia với người mua. UAE không có thuế lợi vốn và thuế thu nhập cá nhân." },
      { question: "Tôi ở nước ngoài có mua được bất động sản Dubai không?", answer: "Có. Người không cư trú được mua bất động sản sở hữu vĩnh viễn tại Dubai, và đây là một trong những trường hợp chúng tôi xử lý nhiều nhất. Chúng tôi tổ chức xem nhà qua video, gửi hồ sơ điện tử và có thể thay mặt bạn theo giấy ủy quyền để hoàn tất sang tên tại DLD mà bạn không cần bay sang." },
      { question: "Một giao dịch bất động sản tại Dubai mất bao lâu?", answer: "Mua ở thị trường thứ cấp thường mất 3-6 tuần từ khi ký MOU đến khi có sổ: đặt cọc 10%, xin NOC của chủ đầu tư, rồi sang tên tại DLD. Đặt chỗ dự án hình thành trong tương lai nhanh hơn, thường 2-4 tuần. Cho thuê còn nhanh hơn nữa, hợp đồng và đăng ký EJARI thường xong trong vài ngày sau khi chốt điều kiện." },
      { question: "Công ty phục vụ những khu vực nào của Dubai?", answer: "Tất cả các khu sở hữu vĩnh viễn lớn, gồm Dubai Marina, Downtown Dubai, Palm Jumeirah, Business Bay, JVC, Dubai Hills Estate, Arabian Ranches, Emaar Beachfront và Dubai Creek Harbour, cùng các đại dự án mới khi được mở bán. Bạn có thể xem các hướng dẫn khu dân cư của chúng tôi để so sánh giá và lợi suất cho thuê theo từng khu." },
      { question: "Công ty môi giới khác gì đơn vị quản lý bất động sản?", answer: "Công ty môi giới đại diện bạn trong giao dịch: tìm người mua, khách thuê hoặc bất động sản phù hợp, đàm phán và hoàn tất hồ sơ. Đơn vị quản lý chăm sóc tài sản sau đó: thu tiền thuê, bảo trì, gia hạn EJARI và báo cáo. Binayah làm cả hai, nên căn hộ chúng tôi bán hoặc cho thuê có thể chuyển thẳng sang dịch vụ quản lý." },
    ],
    ctaTitle: "Trao đổi với chuyên viên bất động sản Dubai",
    ctaDesc: "Cho chúng tôi biết bạn đang muốn mua, bán hay cho thuê và chúng tôi sẽ kết nối bạn với chuyên viên được chứng nhận RERA phù hợp. Không ràng buộc, miễn phí cho người mua và khách thuê.",
    ctaBtn: "Trao đổi với chuyên viên",
    ctaWhatsApp: "Nhắn WhatsApp",
    breadcrumbs: ["Trang chủ", "Dịch vụ", "Công ty môi giới bất động sản tại Dubai"],
  },

  he: {
    metaTitle: "סוכנות נדל\"ן בדובאי | רשומה ב-RERA מאז 2007 | Binayah",
    metaDesc: "Binayah היא סוכנות נדל\"ן בדובאי הרשומה ב-RERA (ORN 1162) ופועלת מאז 2007. קנייה, מכירה, השכרה, נכסים על הנייר, ניהול נכסים והערכות שווי. מעל 3,000 נכסים פעילים, צוות רב-לשוני.",
    heroLabel: "סוכנות נדל\"ן",
    h1: "סוכנות נדל\"ן בדובאי",
    heroDesc: "Binayah Properties היא סוכנות נדל\"ן בדובאי הרשומה ב-RERA, המלווה קונים, מוכרים, בעלי נכסים ושוכרים בכל קהילות הבעלות המלאה בעיר, מהסיור הראשון ועד לקבלת שטר הבעלות.",
    heroCta: "דברו עם סוכן",
    stats: [
      { n: "2007", label: "פועלים בדובאי מאז" },
      { n: "19+", label: "שנות ניסיון בשוק" },
      { n: "3,000+", label: "נכסים פעילים" },
      { n: "RERA", label: "רישום — ORN 1162" },
    ],
    answerTitle: "מה Binayah עושה, ועבור מי",
    answerP1: "Binayah Properties היא סוכנות נדל\"ן בדובאי המספקת שירות מלא, רשומה ברשות לרגולציה של נדל\"ן (RERA, מספר תיווך ORN 1162) ופועלת ממשרדיה בדובאי מאז 2007. אנו מלווים את העסקה מתחילתה ועד סופה: קנייה, מכירה, השכרה, רכישת נכסים על הנייר, ניהול נכסים והערכות שווי, עם מעל 3,000 נכסים פעילים בקהילות הבעלות המלאה של דובאי.",
    answerP2: "אנו עובדים עם מי שמחפש בית למגורים, עם משקיעים בתחילת דרכם שרוכשים סטודיו אחד, עם בעלי תיקי נכסים מתרחבים ועם רוכשים מחו\"ל שזקוקים לניהול העסקה כולה מרחוק. הסיבה שלקוחות בוחרים ב-Binayah מבין סוכנויות הנדל\"ן בדובאי פשוטה: סוכנים מוסמכי RERA, צוות רב-לשוני שמייעץ בשפה שלכם, עמלה שקופה ללא כל תשלום מראש, ואיש קשר אחד שנשאר איתכם גם אחרי מסירת המפתחות.",
    servicesTitle: "תחומי הפעילות של הסוכנות",
    services: [
      { icon: "🔑", title: "רכישת נכס", body: "נכסים מוכנים ושוק יד שנייה בדובאי. אנו מרכיבים רשימה קצרה לפי התקציב והיעדים שלכם, מתאמים סיורים, מנהלים משא ומתן על המחיר ומטפלים ב-MOU, ב-NOC ובהעברה ב-DLD.", href: "/buy", cta: "נכסים למכירה" },
      { icon: "🏷️", title: "מכירת נכס", body: "הערכת שווי השוואתית, צילום מקצועי, שיווק בפורטלים ובמאגר הלקוחות שלנו, סיורים עם קונים מסוננים ומשא ומתן. אין מכירה, אין עמלה.", href: "/sell", cta: "למכור עם Binayah" },
      { icon: "📄", title: "השכרה ושכירות", body: "איתור וסינון שוכרים עבור בעלי נכסים, וחיפוש דירה עבור שוכרים. חוזי שכירות ורישום EJARI, עלינו.", href: "/rent", cta: "נכסים להשכרה" },
      { icon: "🏗️", title: "השקעה בנכסים על הנייר", body: "גישה להשקות ותוכניות תשלום של Emaar, DAMAC, Sobha, Nakheel ויזמים מובילים נוספים, עם ליווי במסירה ובבדק.", href: "/off-plan", cta: "פרויקטים על הנייר" },
      { icon: "🧰", title: "ניהול נכסים", body: "גביית שכר דירה, תיאום אחזקה, EJARI, ביקורות ודיווח חודשי לבעלים, כדי שההשקעה בדובאי תעבוד גם כשאינכם באיחוד האמירויות.", href: "/services/property-management", cta: "ניהול נכסים" },
      { icon: "📊", title: "הערכת שווי", body: "הערכה מיידית מבוססת נתוני שוק לשווי הנכס שלכם היום, ולאחריה בדיקה של סוכן לפני היציאה לשוק.", href: "/valuation", cta: "להעריך את הנכס שלי" },
    ],
    plansTitle: "איך אנחנו עובדים אתכם",
    plans: [
      { name: "ליווי קונים", fee: "ללא עלות לקונה", features: ["אפיון צרכים ורשימת נכסים מותאמת", "סיורים פרונטליים או בווידאו", "משא ומתן על מחיר ותוכנית תשלומים", "טיפול ב-MOU, ב-NOC ובהעברה ב-DLD", "חיבור למשכנתאות ולוויזת הזהב", "ליווי במסירה ובבדק"] },
      { name: "ליווי מוכרים", fee: "עמלה בסיום העסקה", features: ["הערכת שווי השוואתית", "צילום מקצועי ותוכניות דירה", "שיווק בפורטלים, במאגר וברשתות", "סינון קונים וליווי בסיורים", "משא ומתן על הצעות וחתימת MOU", "העברה במשרד הנאמן של ה-DLD"] },
      { name: "משקיעים ובעלי נכסים", fee: "שירות תיק נכסים", features: ["רשימה מוכוונת תשואה וניתוח אזורים", "גישה להשקות ולתוכניות תשלום", "איתור וסינון שוכרים ורישום EJARI", "ניהול נכסים שוטף", "סקירה שנתית של התיק ושל שכר הדירה", "טיפול מלא מרחוק לבעלים מחו\"ל"] },
    ],
    whyTitle: "למה לבחור ב-Binayah כסוכנות הנדל\"ן שלכם בדובאי",
    whyPoints: [
      { title: "רשומה ב-RERA מאז 2007", body: "ל-Binayah Properties רישום תיווך RERA מספר ORN 1162 ברשות הקרקעות של דובאי, והיא מלווה עסקאות נדל\"ן בדובאי כבר יותר מ-19 שנה." },
      { title: "סוכנים מוסמכי RERA", body: "היועצים שלנו הם מתווכים בעלי הסמכת RERA, ולא מתווכים ללא רישיון. כל עסקה מתועדת דרך ערוצי ה-DLD." },
      { title: "ייעוץ רב-לשוני", body: "אנו מייעצים באנגלית, ערבית, רוסית, צרפתית וסינית, כדי ששום סעיף מהותי לא יאבד בתרגום החוזה." },
      { title: "עמלה שקופה", body: "השירות לקונים ולשוכרים ניתן ללא עלות. את העמלה משלמים המוכרים ובעלי הנכסים בסיום העסקה, ללא תשלום מראש וללא חיובים נסתרים." },
      { title: "מותאם לרוכשים מחו\"ל", body: "סיורים מרחוק, מסמכים דיגיטליים ואפשרות ייפוי כוח. אין צורך להיות בדובאי כדי לקנות, למכור או להשכיר אתנו." },
      { title: "אותו צוות גם אחרי העסקה", body: "אותה סוכנות שמכרה לכם את הנכס תוכל גם להשכיר אותו, לנהל אותו ולהעריך אותו מחדש בהמשך." },
    ],
    exploreTitle: "עוד על Binayah",
    links: [
      { label: "מתווך נדל\"ן בדובאי", href: "/services/real-estate-broker-dubai" },
      { label: "השקעות נדל\"ן בדובאי", href: "/services/property-investment-dubai" },
      { label: "הצוות שלנו", href: "/team" },
      { label: "קהילות בדובאי", href: "/communities" },
      { label: "אודות הסוכנות", href: "/about" },
      { label: "כל השירותים", href: "/services" },
      { label: "מדריך: איך לבחור סוכנות נדל\"ן בדובאי", href: "/pulse/guides/how-to-choose-a-real-estate-agency-dubai" },
      { label: "מדריך: חברות הנדל\"ן המובילות בדובאי", href: "/pulse/guides/best-real-estate-companies-dubai" },
      { label: "צרו קשר", href: "/contact" },
    ],
    faqTitle: "שאלות נפוצות",
    faqs: [
      { question: "האם Binayah היא סוכנות נדל\"ן מורשית בדובאי?", answer: "כן. Binayah Properties L.L.C רשומה ברשות לרגולציה של נדל\"ן תחת מספר תיווך (ORN) 1162, והיועצים שלנו בעלי הסמכת מתווך מטעם RERA. כל עסקאות המכירה וההשכרה נרשמות דרך ערוצי רשות הקרקעות של דובאי, כולל EJARI לחוזי שכירות." },
      { question: "כמה עמלה גובה סוכנות נדל\"ן בדובאי?", answer: "הנוהג המקובל בשוק בדובאי הוא עמלה של 2% ממחיר המכירה, המשולמת בסיום העסקה. בהשכרה, עמלת בעל הנכס עבור איתור שוכר עומדת בדרך כלל על 5% משכר הדירה השנתי, וניהול הנכס מחויב בנפרד בכ-5%-8% משכר הדירה החודשי. Binayah אינה גובה תשלום מראש." },
      { question: "האם קונים משלמים עמלת תיווך בדובאי?", answer: "ב-Binayah השירות לקונים ולשוכרים ניתן ללא עלות, ואנו מקבלים את שכרנו מהמוכר או מבעל הנכס בסיום העסקה. הקונה עדיין משלם את האגרות הממשלתיות: אגרת העברה של 4% ל-DLD, אגרה מנהלית של 580 דירהם, אגרת נאמן של כ-4,000 דירהם בנכסים מעל 500,000 דירהם, ו-0.25% מסכום ההלוואה במקרה של משכנתה. סך עלויות העסקה, כ-6%-7% משווי הנכס." },
      { question: "מה משלם מוכר שפועל דרך סוכנות?", answer: "ההוצאה המרכזית של המוכר היא עמלת הסוכן, בדרך כלל 2% ממחיר המכירה, והיא משולמת רק כשהנכס נמכר. בנוסף יש אגרת NOC מהיזם בסך 500-5,000 דירהם ואגרת העברה של 4% ל-DLD, שבפועל מתחלקת פעמים רבות עם הקונה. באיחוד האמירויות אין מס רווחי הון ואין מס הכנסה." },
      { question: "אפשר לרכוש נכס בדובאי מחו\"ל?", answer: "כן. תושבי חוץ רשאים לרכוש נכסים בבעלות מלאה בדובאי, וזהו אחד מהמקרים הנפוצים ביותר שאנו מטפלים בהם. אנו מקיימים סיורים בווידאו, שולחים מסמכים בדיגיטל ויכולים לפעול מכוח ייפוי כוח כך שההעברה ב-DLD תושלם בלי שתטוסו לדובאי." },
      { question: "כמה זמן נמשכת עסקת נדל\"ן בדובאי?", answer: "רכישה בשוק יד שנייה נמשכת בדרך כלל 3-6 שבועות מחתימת ה-MOU ועד שטר הבעלות: פיקדון של 10%, NOC מהיזם, ולאחר מכן ההעברה ב-DLD. הזמנת נכס על הנייר מהירה יותר, לרוב 2-4 שבועות. השכרה מהירה עוד יותר, החוזה ורישום ה-EJARI מושלמים בדרך כלל תוך ימים ספורים מסיכום התנאים." },
      { question: "באילו אזורים בדובאי הסוכנות פועלת?", answer: "בכל קהילות הבעלות המלאה המרכזיות, ובהן Dubai Marina, Downtown Dubai, Palm Jumeirah, Business Bay, JVC, Dubai Hills Estate, Arabian Ranches, Emaar Beachfront ו-Dubai Creek Harbour, וכן במיזמים חדשים עם השקתם. במדריכי הקהילות שלנו אפשר להשוות מחירים ותשואות שכירות אזור מול אזור." },
      { question: "מה ההבדל בין סוכנות נדל\"ן לחברת ניהול נכסים?", answer: "סוכנות מייצגת אתכם בעסקה: איתור קונה, שוכר או הנכס המתאים, ניהול המשא ומתן והשלמת המסמכים. חברת ניהול מטפלת בנכס לאחר מכן: גביית שכר דירה, אחזקה, חידושי EJARI ודיווח. Binayah עושה את שניהם, כך שנכס שמכרנו או השכרנו יכול לעבור ישירות לשירות הניהול שלנו." },
    ],
    ctaTitle: "דברו עם סוכן נדל\"ן בדובאי",
    ctaDesc: "ספרו לנו מה אתם קונים, מוכרים או משכירים ונחבר אתכם ליועץ מוסמך RERA המתאים. ללא התחייבות, וללא עלות לקונים ולשוכרים.",
    ctaBtn: "דברו עם סוכן",
    ctaWhatsApp: "כתבו לנו בוואטסאפ",
    breadcrumbs: ["דף הבית", "שירותים", "סוכנות נדל\"ן בדובאי"],
  },
} as const;

type Locale = keyof typeof CONTENT;

interface Props { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const c = CONTENT[(locale as Locale)] || CONTENT.en;
  const url = canonical(locale, PATH);
  return {
    title: c.metaTitle,
    description: c.metaDesc,
    alternates: { canonical: url, languages: altLangs(PATH) },
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
      ? ["агентство недвижимости дубай", "агентство недвижимости в дубае", "риэлторское агентство дубай", "агентства недвижимости дубая", "купить недвижимость в дубае агентство"]
      : locale === "ar"
      ? ["وكالة عقارية في دبي", "وكالة عقارات دبي", "شركة عقارات في دبي", "وكالات عقارية في دبي", "مكتب عقاري دبي"]
      : locale === "zh"
      ? ["迪拜房产中介", "迪拜房地产中介公司", "迪拜地产公司", "迪拜买房中介", "迪拜中介公司"]
      : locale === "vi"
      ? ["công ty môi giới bất động sản dubai", "môi giới bất động sản dubai", "công ty bất động sản dubai", "đại lý bất động sản dubai"]
      : locale === "fr"
      ? ["agence immobilière dubaï", "agence immobilière à dubaï", "agences immobilières dubaï", "agent immobilier dubaï", "acheter un bien à dubaï agence"]
      : locale === "he"
      ? ["סוכנות נדל\"ן בדובאי", "סוכנות נדלן דובאי", "משרד תיווך דובאי", "סוכן נדל\"ן דובאי", "חברת נדל\"ן בדובאי"]
      : ["real estate agency in dubai", "real estate agency dubai", "dubai real estate agency", "property agency dubai", "property agencies dubai", "real estate agent dubai"],
  };
}

export default async function RealEstateAgencyDubaiPage({ params }: Props) {
  const { locale } = await params;
  const c = CONTENT[locale as Locale] ?? CONTENT.en;
  const isRtl = locale === "ar" || locale === "he"; // ar, he are rtl; vi, zh, ru, fr, en are ltr
  const lp = locale === "en" ? "" : `/${locale}`;

  const bcItems = [
    { name: c.breadcrumbs[0], href: `${lp}/` },
    { name: c.breadcrumbs[1], href: `${lp}/services` },
    { name: c.breadcrumbs[2], href: `${lp}${PATH}` },
  ];

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? "rtl" : "ltr"}>
      <FAQJsonLd faqs={c.faqs.map(f => ({ question: f.question, answer: f.answer }))} inLanguage={locale} />
      <BreadcrumbJsonLd items={bcItems} />
      <ServiceJsonLd
        name={c.metaTitle}
        description={c.metaDesc}
        url={canonical(locale, PATH)}
        serviceType="Real Estate Agency"
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
          <div className="bg-card border border-border/50 rounded-2xl p-6 sm:p-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">{c.answerTitle}</h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4">{c.answerP1}</p>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{c.answerP2}</p>
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
              <Link
                key={s.title}
                href={`${lp}${s.href}`}
                className="block bg-card border border-border/50 rounded-2xl p-6 hover:border-primary/20 transition-all"
              >
                <div className="text-2xl mb-3">{s.icon}</div>
                <h3 className="text-base font-bold text-foreground mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">{s.body}</p>
                <span className="text-sm font-semibold text-primary">{s.cta} →</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Plans */}
        <section>
          <div className="text-center mb-12">
            <p className="text-accent font-bold tracking-[0.35em] uppercase text-xs mb-3">Engagement</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">{c.plansTitle}</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-5">
            {c.plans.map((plan, i) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-5 sm:p-7 border ${i === 1 ? "border-primary/40 shadow-lg" : "border-border/50 bg-card"}`}
                style={i === 1 ? { background: "linear-gradient(135deg, #0B3D2E08, #1A7A5A12)" } : {}}
              >
                <h3 className="text-xl font-bold text-foreground mb-4">{plan.name}</h3>
                {/* Commission figures are covered in the FAQ rather than shown as a
                    headline price — an agency mandate is not a fixed-price product. */}
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

        {/* Explore */}
        <section>
          <div className="text-center mb-8">
            <p className="text-accent font-bold tracking-[0.35em] uppercase text-xs mb-3">Binayah</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">{c.exploreTitle}</h2>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {c.links.map((l) => (
              <Link
                key={l.href}
                href={`${lp}${l.href}`}
                className="inline-flex items-center gap-2 bg-card border border-border/50 rounded-xl px-4 py-2.5 text-sm font-semibold text-foreground hover:border-primary/30 hover:text-primary transition-all"
              >
                {l.label}
              </Link>
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
                href={waHref(WA_DEFAULT_MESSAGE, PATH)}
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
