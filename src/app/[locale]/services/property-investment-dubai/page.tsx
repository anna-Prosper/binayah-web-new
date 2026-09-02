/* eslint-disable i18next/no-literal-string -- multilingual SEO landing page */
import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { waHref, WA_DEFAULT_MESSAGE } from "@/lib/whatsapp";
import { FAQJsonLd, BreadcrumbJsonLd, ServiceJsonLd } from "@/components/JsonLd";
import { canonical, altLangs, OG_LOCALE, DEFAULT_OG_IMAGE } from "@/lib/site";

export const revalidate = 86400;

/* Route-relative hrefs shared by every locale. The locale prefix (`lp`) is
   prepended at render time. Every path below was verified to exist. */
const SITE_LINKS = [
  "/off-plan",
  "/off-plan/top-projects",
  "/buy",
  "/communities",
  "/developers",
  "/golden-visa",
  "/pulse/reports",
  "/valuation",
  "/services/real-estate-agency-dubai",
  "/services/real-estate-broker-dubai",
  "/contact",
] as const;

const GUIDE_LINKS = [
  "/pulse/guides/rental-yield-explained",
  "/pulse/guides/best-areas-high-rental-yield-dubai",
  "/pulse/guides/property-roi-dubai",
  "/pulse/guides/off-plan-vs-secondary",
  "/pulse/guides/off-plan-payment-plans",
  "/pulse/guides/off-plan-assignment-resale",
  "/pulse/guides/dld-fees-explained",
  "/pulse/guides/service-charges-explained",
  "/pulse/guides/golden-visa-process",
  "/pulse/guides/freehold-vs-leasehold-dubai",
  "/pulse/guides/dubai-market-outlook-2026",
  "/pulse/guides/dubai-property-management-guide",
  "/pulse/guides/landlord-checklist-dubai",
] as const;

const CONTENT = {
  en: {
    metaTitle: "Dubai Property Investment | Invest in Dubai Real Estate | Binayah",
    metaDesc: "Dubai property investment explained: off-plan vs secondary, payment plans, rental yields, freehold zones, the AED 2M Golden Visa threshold, DLD fees and service charges. RERA-certified since 2007.",
    heroLabel: "PROPERTY INVESTMENT",
    h1: "Dubai Property Investment",
    heroDesc: "Buy Dubai real estate for rental income, capital growth or 10-year residency. Binayah has been a RERA-certified Dubai brokerage since 2007, with 3,000+ active listings and direct access to Emaar, DAMAC, Sobha, Nakheel, Meraas and Aldar launches.",
    heroCta: "Speak to an Investment Advisor",
    stats: [
      { n: "19+", label: "Years in Dubai Real Estate" },
      { n: "3,000+", label: "Active Listings" },
      { n: "RERA", label: "Certified, ORN 1162" },
      { n: "AED 2M", label: "Golden Visa Threshold" },
    ],
    answerTitle: "What is Dubai property investment?",
    answerBody: [
      "Dubai property investment means buying residential or commercial real estate in Dubai to earn rental income, capital appreciation, or both. Foreign nationals can own property outright in Dubai's designated freehold areas, with ownership registered on a title deed issued by the Dubai Land Department (DLD). The UAE levies no annual property tax, no capital-gains tax and no income tax on rental earnings, so rent reaches the owner more directly than in most global markets.",
      "The citywide average gross rental yield is around 4.7%, with mid-market communities yielding above that line and prime waterfront below it. Budget roughly 5.5% of the purchase price in transaction costs on a cash deal and around 6.5% on a financed one, on top of the price itself. A purchase of AED 2 million or more in qualifying, DLD-registered property also makes the buyer eligible for a 10-year renewable Golden Visa.",
    ],
    servicesTitle: "What our investment service covers",
    services: [
      { icon: "🎯", title: "Strategy & goal setting", body: "Income, growth, or residency. We fix the objective first, because the highest-yielding property and the highest-appreciating property are rarely the same property." },
      { icon: "🏗️", title: "Off-plan sourcing", body: "Direct access to launches from Emaar, DAMAC, Sobha, Nakheel, Meraas and Aldar, including construction-linked and post-handover payment plans." },
      { icon: "🔑", title: "Ready & secondary acquisition", body: "Completed, title-deeded units from our 3,000+ active listings across Dubai's freehold communities, with income from the first tenancy." },
      { icon: "📊", title: "Yield & cost modelling", body: "Gross yield, net yield after service charges and voids, and the all-in transaction cost, calculated on the actual unit rather than a headline." },
      { icon: "🛂", title: "Golden Visa structuring", body: "Structuring the purchase so the registered value in your name clears the AED 2 million threshold without ambiguity." },
      { icon: "🔁", title: "Exit & resale", body: "Off-plan assignment with a developer NOC, or resale of a completed unit through the DLD. We plan the exit before you enter." },
    ],
    optionsTitle: "Dubai property investment options",
    optionsIntro: "There are six main ways to invest in Dubai property. They differ in how much cash you need upfront, when income starts, and where the risk sits.",
    optionsHead: ["Option", "How it works", "Best for", "Key consideration"],
    optionsRows: [
      ["Off-plan", "Buy from the developer before completion on a staged payment plan.", "Capital growth with low upfront cash.", "Developers typically price off-plan 15-25% below projected post-completion market value; delivery timing is the main risk."],
      ["Ready / secondary", "Buy a completed, title-deeded unit on the resale market.", "Income from day one.", "The full price falls due at transfer, so you need the whole amount or a mortgage."],
      ["Buy-to-let", "Hold a ready unit on a registered 12-month Ejari tenancy.", "Steady annual income.", "Citywide average gross yield is around 4.7%; net yield is typically 75-85% of gross."],
      ["Short-term / holiday let", "Licensed holiday-home letting of a furnished unit.", "Higher gross income in tourist districts.", "Higher operating costs, more management, and occupancy that moves with the season."],
      ["Off-plan assignment", "Sell the contract to a new buyer before handover.", "A shorter hold without waiting for completion.", "Developers usually require 30-40% of the price paid first, plus a No Objection Certificate (NOC)."],
      ["Golden Visa purchase", "Buy qualifying property at AED 2 million or above.", "10-year renewable UAE residency.", "The value must be genuine, title-deeded, DLD-registered equity in your name."],
    ],
    areasTitle: "Best areas to invest in Dubai",
    areasIntro: "Yield and capital growth pull in opposite directions. Affordable, high-demand communities produce the strongest gross yields; scarce prime addresses produce the strongest appreciation.",
    areasHead: ["Community", "Profile", "Indicative gross yield", "Buy it for"],
    areasRows: [
      ["Jumeirah Village Circle", "Mid-market apartments, deep and liquid tenant pool, large ongoing supply.", "7.2-8.5%", "Income"],
      ["Business Bay", "Central high-rise; higher absolute rents but higher prices too.", "6.2-7.1%", "Income and growth"],
      ["Dubai Marina", "Established waterfront, strong resale liquidity.", "4.5-6%", "Growth and liquidity"],
      ["Palm Jumeirah", "Scarce prime waterfront; land cannot be replicated.", "4.5-6%", "Capital appreciation"],
      ["Dubai South", "Growth corridor around Al Maktoum International Airport; among the most accessible prices per sq ft in Dubai.", "Above the citywide average", "Income, emerging-district profile"],
      ["Discovery Gardens / International City", "Mature, affordable stock with limited new supply and long-staying tenants.", "Above the citywide average", "Income first"],
    ],
    areasNote: "Benchmarks: the citywide average gross rental yield is around 4.7% and the citywide average sale price is around AED 1,879 per square foot. Prime waterfront generally yields below the citywide average and is bought for appreciation, not cash flow. The consensus analyst expectation for 2026-2028 is 5-12% annual appreciation in selected segments.",
    yieldTitle: "What rental yield can I get in Dubai?",
    yieldIntro: "The citywide average gross rental yield is around 4.7%. The range runs from about 4.5% in prime areas to about 8.5% in high-yield communities such as JVC. Gross is not what you keep.",
    yieldHead: ["Metric", "What it means", "Typical Dubai figure"],
    yieldRows: [
      ["Gross yield", "Annual rent divided by purchase price.", "Around 4.7% citywide; roughly 4.5% prime to 8.5% high-yield"],
      ["Net yield", "Gross less service charges, voids, maintenance and management.", "Typically 75-85% of gross"],
      ["Service charges", "Paid per square foot per year to the owners association.", "AED 10-30 per sq ft per year"],
      ["Ejari registration", "Mandatory DLD tenancy registration for every contract.", "Around AED 220"],
      ["Tax on rental income", "The UAE levies no annual property tax, no capital-gains tax and no income tax on rent.", "0%"],
    ],
    yieldNote: "Ask any agent for net yield, not gross. If they cannot tell you the service charge rate per square foot for the building, they do not yet know the real number.",
    offplanTitle: "How to buy off-plan property in Dubai",
    offplanIntro: "Off-plan makes up around 72% of Dubai listings, so it is the mainstream, not a niche. The process runs in seven steps.",
    offplanSteps: [
      { n: "1", title: "Set the budget and the strategy", body: "Decide whether you are buying for income, growth or residency, and add transaction costs on top of the price: roughly 5.5% on a cash deal, 6.5% on a financed one." },
      { n: "2", title: "Shortlist the developer, then the project", body: "Weigh the developer's delivery record as heavily as the headline terms, and confirm the project's DLD escrow account." },
      { n: "3", title: "Reserve the unit", body: "Sign a reservation form and pay the booking deposit to take the unit off the market." },
      { n: "4", title: "Sign the SPA", body: "Read the payment schedule line by line. Favour milestone-linked instalments over purely date-linked ones, so payments track construction." },
      { n: "5", title: "Register with the DLD (Oqood)", body: "The 4% DLD registration fee is normally paid at the point of purchase to register the Oqood. Where a developer advertises 'DLD fees waived', it usually means the developer absorbs the 4%, not that it is not charged." },
      { n: "6", title: "Pay instalments through construction", body: "A common structure pays 60% across construction and 40% at handover. A post-handover variant moves part of that final tranche into instalments after you receive the keys." },
      { n: "7", title: "Handover, snagging and title deed", body: "Inspect and snag the unit at handover, then the Oqood registration converts to a title deed in your name." },
    ],
    offplanNote: "Mortgage loan-to-value caps set by the UAE Central Bank reach up to 80% for residents and up to 50% for non-residents on a first property, and are typically lower for off-plan, so expect to fund more of an off-plan purchase from cash. If you need to exit before handover, an assignment is possible once you have paid the developer's minimum share, often around 30-40%, and obtained a No Objection Certificate.",
    costsTitle: "Dubai property purchase costs and ongoing charges",
    costsIntro: "The 4% DLD transfer fee is the headline, but the realistic all-in cost of registering a purchase is higher. Budget these separately from the price and from any payment plan.",
    costsHead: ["Cost", "Amount", "When it falls due"],
    costsRows: [
      ["DLD transfer fee", "4% of the purchase price", "At transfer, or at Oqood registration for off-plan"],
      ["Trustee / registration fee", "Around AED 4,000", "At transfer"],
      ["Title deed issuance", "AED 540", "At transfer"],
      ["Agency commission", "2% of the price plus 5% VAT", "At transfer"],
      ["Mortgage registration", "0.25% of the loan amount plus AED 290", "At transfer, financed deals only"],
      ["All-in transaction cost", "Around 5.5% cash, around 6.5% financed", "Budget on top of the purchase price"],
      ["Service charges", "AED 10-30 per sq ft per year", "Annually, from handover onwards"],
    ],
    plansTitle: "Three ways to structure a Dubai investment",
    plans: [
      { name: "Income", fee: "Ready units, rent from the first tenancy", features: ["Completed, title-deeded stock", "Mid-market communities such as JVC and Business Bay", "Citywide average gross yield around 4.7%", "Net yield typically 75-85% of gross", "Ejari registration and tenant placement handled for you"] },
      { name: "Growth", fee: "Off-plan, staged payments, capital appreciation", features: ["Developer payment plans across construction", "Typically priced 15-25% below projected post-completion value", "Post-handover plans available on selected projects", "Instalments held in a DLD escrow account", "Access to Emaar, DAMAC, Sobha, Nakheel, Meraas and Aldar launches"] },
      { name: "Residency", fee: "Golden Visa qualifying purchase from AED 2M", features: ["Qualifying property from AED 2 million", "10-year renewable UAE residency", "Spouse and children included on the application", "One property at AED 2M, or two at AED 1M combined", "Mortgaged purchases need at least AED 1M of equity"] },
    ],
    whyTitle: "Why invest through Binayah",
    whyPoints: [
      { title: "Dubai brokerage since 2007", body: "19+ years working the same market through several cycles, not a launch-to-launch operation." },
      { title: "RERA-certified, ORN 1162", body: "Licensed by the Dubai Land Department's Real Estate Regulatory Agency, with RERA-certified agents on every transaction." },
      { title: "3,000+ active listings", body: "Off-plan and ready stock across Dubai's freehold communities, so the shortlist is not limited to one developer's inventory." },
      { title: "Direct developer access", body: "Launch-day access to Emaar, DAMAC, Sobha, Nakheel, Meraas and Aldar releases, including payment-plan terms." },
      { title: "Numbers before narrative", body: "We model gross yield, net yield and the all-in cost on the specific unit in front of you, and tell you when the numbers do not work." },
      { title: "End to end", body: "Selection, DLD registration, mortgage introduction, Golden Visa paperwork, letting, management and eventual resale." },
    ],
    linksTitle: "Start your research",
    linksSubtitle: "Browse the market",
    guidesSubtitle: "Investment guides",
    siteLinkLabels: ["Off-plan projects", "Top off-plan projects", "Property for sale", "Dubai communities", "Developers", "Golden Visa", "Market reports", "Free property valuation", "Real estate agency in Dubai", "Real estate broker in Dubai", "Contact an advisor"],
    guideLinkLabels: ["Rental yield explained", "Best areas for high yield", "Property ROI in Dubai", "Off-plan vs secondary", "Off-plan payment plans", "Off-plan assignment & resale", "DLD fees explained", "Service charges explained", "Golden Visa process", "Freehold vs leasehold", "Dubai market outlook 2026", "Property management in Dubai", "Landlord checklist"],
    faqTitle: "Frequently Asked Questions",
    faqs: [
      { question: "Is Dubai property a good investment?", answer: "Dubai property suits investors who want rental income, capital growth, or residency. Foreign nationals can own outright in designated freehold areas, with ownership registered on a DLD title deed that does not expire. The UAE levies no annual property tax, no capital-gains tax and no income tax on rental earnings, so a larger share of the rent reaches the owner than in most global markets. The citywide average gross rental yield is around 4.7%. As with any market, returns depend on the specific unit, the community and the price paid, so model the numbers before you commit." },
      { question: "What rental yield can I get in Dubai?", answer: "The citywide average gross rental yield is around 4.7%. The range runs from about 4.5% in prime areas to about 8.5% in high-yield communities. Jumeirah Village Circle sits at roughly 7.2-8.5% gross because prices are low, around AED 700-900 per square foot, while rents are strong for the asset class. Business Bay runs around 6.2-7.1%. Premium waterfront such as Palm Jumeirah and Dubai Marina yields around 4.5-6% and is bought mainly for appreciation. Net yield, after service charges, voids, maintenance and management, is typically 75-85% of gross." },
      { question: "How much money do I need to invest in Dubai property?", answer: "There is no single entry price, but budget the transaction costs separately from the price: roughly 5.5% of the purchase price on a cash deal and around 6.5% on a financed one. That covers the 4% DLD transfer fee, a trustee fee of around AED 4,000, the AED 540 title deed, agency commission of 2% plus 5% VAT, and, on financed deals, mortgage registration of 0.25% of the loan plus AED 290. Mortgage loan-to-value caps set by the UAE Central Bank reach up to 80% for residents and up to 50% for non-residents on a first property. Off-plan lowers the cash needed at the start, because you pay a booking deposit and then stage the balance across construction." },
      { question: "Is off-plan or ready property better in Dubai?", answer: "It depends on whether you want growth or income. Off-plan is typically priced 15-25% below projected post-completion market value and is paid in instalments across construction, but income only starts after handover and delivery timing is the main risk. Ready property in the secondary market gives you a title deed and rental income immediately, but the full price falls due at transfer. Off-plan makes up around 72% of Dubai listings. If you may need to exit an off-plan unit before handover, you can assign the contract once you have paid the developer's minimum share, often around 30-40%, and obtained a No Objection Certificate." },
      { question: "How do I buy off-plan property in Dubai?", answer: "Set your budget and strategy, shortlist the developer before the project and check its delivery record and DLD escrow account, reserve the unit with a booking deposit, then sign the Sale and Purchase Agreement, reading the payment schedule line by line. The 4% DLD registration is normally paid at the point of purchase to register the Oqood. You then pay instalments through construction, a common structure being 60% across construction and 40% at handover, with post-handover variants moving part of the final tranche into instalments after you get the keys. At handover you snag the unit and the Oqood converts to a title deed." },
      { question: "Can foreigners buy property in Dubai?", answer: "Yes. In Dubai's designated freehold areas, foreign nationals can own property outright, permanently, with their name registered on a title deed issued by the Dubai Land Department. That ownership does not expire and carries the right to sell, lease and bequeath the property. Outside those zones, leasehold grants use for a long but finite term, commonly up to 99 years, after which rights revert to the freeholder. Confirm the tenure on the specific unit before you rely on it, particularly if residency is part of your reason for buying." },
      { question: "How much property do I need to buy for a Golden Visa?", answer: "A property investment of at least AED 2 million qualifies you for a 10-year, renewable UAE Golden Visa. It can be one property at AED 2 million or two properties at AED 1 million each, combined on a single application. Mortgaged and off-plan properties can qualify provided the AED 2 million threshold and the lender or developer conditions are met, and for a mortgaged purchase your equity must be at least AED 1 million. The value must be genuine, title-deeded, DLD-registered equity in your name. Spouse and children can be included, and renewal at ten years requires only that you still own qualifying property." },
      { question: "What are the ongoing costs of owning property in Dubai?", answer: "The main recurring cost is the service charge paid to the building's owners association, typically AED 10-30 per square foot per year, with amenity-heavy towers and waterfront communities at the top of that range. Add maintenance, a management fee if you are not self-managing, and a realistic void allowance for the weeks between tenants. Ejari tenancy registration costs around AED 220 per contract. There is no annual property tax, no capital-gains tax and no income tax on rental earnings in the UAE, so service charges and running costs are the figures that decide your net yield." },
    ],
    ctaTitle: "Build your Dubai portfolio",
    ctaDesc: "Tell us your budget and whether you are buying for income, growth or residency. We will come back with a shortlist and the modelled numbers on each unit, not a brochure.",
    ctaBtn: "Speak to an Advisor",
    ctaWhatsApp: "WhatsApp Us",
    breadcrumbs: ["Home", "Services", "Property Investment"],
  },

  ru: {
    metaTitle: "Инвестиции в недвижимость Дубая | Купить недвижимость в Дубае | Binayah",
    metaDesc: "Инвестиции в недвижимость Дубая: новостройки и вторичный рынок, планы рассрочки, арендная доходность, фрихолд-зоны, порог Golden Visa AED 2 млн, сборы DLD и сервисные платежи. RERA-сертификация, с 2007 года.",
    heroLabel: "ИНВЕСТИЦИИ В НЕДВИЖИМОСТЬ",
    h1: "Инвестиции в недвижимость Дубая",
    heroDesc: "Покупка недвижимости в Дубае ради арендного дохода, роста капитала или 10-летней резиденции. Binayah — RERA-сертифицированное агентство с 2007 года: более 3 000 активных объектов и прямой доступ к запускам Emaar, DAMAC, Sobha, Nakheel, Meraas и Aldar.",
    heroCta: "Консультация инвестора",
    stats: [
      { n: "19+", label: "Лет на рынке Дубая" },
      { n: "3 000+", label: "Активных объектов" },
      { n: "RERA", label: "Сертификация, ORN 1162" },
      { n: "AED 2 млн", label: "Порог Golden Visa" },
    ],
    answerTitle: "Что такое инвестиции в недвижимость Дубая?",
    answerBody: [
      "Инвестиции в недвижимость Дубая — это покупка жилой или коммерческой недвижимости ради арендного дохода, роста стоимости капитала или того и другого. Иностранные граждане могут владеть недвижимостью полностью в обозначенных фрихолд-зонах Дубая, право собственности регистрируется в титуле (title deed), который выдаёт Земельный департамент Дубая (DLD). В ОАЭ нет ежегодного налога на недвижимость, налога на прирост капитала и подоходного налога на арендные поступления, поэтому арендная плата доходит до владельца напрямую.",
      "Средняя валовая арендная доходность по городу составляет около 4,7%: районы среднего сегмента дают выше этой планки, премиальная набережная — ниже. Заложите примерно 5,5% от цены покупки на транзакционные расходы при оплате наличными и около 6,5% при ипотеке, сверх самой цены. Покупка недвижимости на сумму от AED 2 млн, зарегистрированной в DLD, также даёт право на 10-летнюю продлеваемую Golden Visa.",
    ],
    servicesTitle: "Что входит в инвестиционный сервис",
    services: [
      { icon: "🎯", title: "Стратегия и цели", body: "Доход, рост или резиденция. Сначала фиксируем цель: самый доходный объект и самый растущий в цене объект — это почти никогда не один и тот же объект." },
      { icon: "🏗️", title: "Подбор новостроек", body: "Прямой доступ к запускам Emaar, DAMAC, Sobha, Nakheel, Meraas и Aldar, включая планы рассрочки на этапе строительства и после передачи ключей." },
      { icon: "🔑", title: "Готовое жильё и вторичный рынок", body: "Готовые объекты с титулом из более чем 3 000 активных лотов во фрихолд-районах Дубая, с доходом уже с первого договора аренды." },
      { icon: "📊", title: "Расчёт доходности и затрат", body: "Валовая доходность, чистая доходность после сервисных сборов и простоев, полная стоимость сделки — по конкретному объекту, а не по заголовку объявления." },
      { icon: "🛂", title: "Структурирование Golden Visa", body: "Оформляем покупку так, чтобы зарегистрированная на ваше имя стоимость уверенно превышала порог в AED 2 млн." },
      { icon: "🔁", title: "Выход и перепродажа", body: "Переуступка договора новостройки с NOC от застройщика или продажа готового объекта через DLD. Планируем выход ещё до входа." },
    ],
    optionsTitle: "Варианты инвестиций в недвижимость Дубая",
    optionsIntro: "Есть шесть основных способов инвестировать в недвижимость Дубая. Они различаются размером стартового капитала, моментом начала дохода и распределением рисков.",
    optionsHead: ["Вариант", "Как это работает", "Кому подходит", "Что важно учесть"],
    optionsRows: [
      ["Новостройка (off-plan)", "Покупка у застройщика до сдачи по плану рассрочки.", "Рост капитала при небольшом стартовом взносе.", "Застройщики обычно ставят цену на 15-25% ниже прогнозной рыночной стоимости после сдачи; основной риск — сроки передачи."],
      ["Готовое / вторичный рынок", "Покупка завершённого объекта с титулом на вторичном рынке.", "Доход с первого дня.", "Полная стоимость оплачивается при переоформлении, нужна вся сумма или ипотека."],
      ["Долгосрочная аренда", "Готовый объект сдаётся по зарегистрированному договору Ejari на 12 месяцев.", "Стабильный годовой доход.", "Средняя валовая доходность по городу — около 4,7%; чистая обычно составляет 75-85% от валовой."],
      ["Краткосрочная аренда", "Лицензированная сдача меблированного объекта как holiday home.", "Более высокий валовой доход в туристических районах.", "Выше операционные расходы и управление, загрузка зависит от сезона."],
      ["Переуступка новостройки", "Продажа договора новому покупателю до передачи объекта.", "Более короткий срок удержания.", "Застройщики обычно требуют оплаты 30-40% стоимости и выдачи NOC."],
      ["Покупка ради Golden Visa", "Квалифицирующая недвижимость от AED 2 млн.", "10-летняя продлеваемая резиденция ОАЭ.", "Стоимость должна быть реальной долей, зарегистрированной в DLD на ваше имя."],
    ],
    areasTitle: "Лучшие районы для инвестиций в Дубае",
    areasIntro: "Доходность и рост капитала тянут в разные стороны. Доступные районы с высоким спросом дают самую высокую валовую доходность, дефицитные премиальные адреса — самый сильный рост стоимости.",
    areasHead: ["Район", "Профиль", "Ориентировочная валовая доходность", "Ради чего покупают"],
    areasRows: [
      ["Jumeirah Village Circle", "Квартиры среднего сегмента, глубокий и ликвидный пул арендаторов, большой объём нового предложения.", "7,2-8,5%", "Доход"],
      ["Business Bay", "Центральные высотки: выше абсолютные ставки аренды, но и цены выше.", "6,2-7,1%", "Доход и рост"],
      ["Dubai Marina", "Сложившаяся набережная, высокая ликвидность при перепродаже.", "4,5-6%", "Рост и ликвидность"],
      ["Palm Jumeirah", "Дефицитная премиальная набережная: землю невозможно воспроизвести.", "4,5-6%", "Рост капитала"],
      ["Dubai South", "Коридор роста вокруг аэропорта Аль-Мактум, одни из самых доступных цен за кв. фут в Дубае.", "Выше среднего по городу", "Доход, развивающийся район"],
      ["Discovery Gardens / International City", "Зрелый доступный фонд с ограниченным новым предложением и долгосрочными арендаторами.", "Выше среднего по городу", "В первую очередь доход"],
    ],
    areasNote: "Ориентиры: средняя валовая арендная доходность по городу — около 4,7%, средняя цена продажи — около AED 1 879 за квадратный фут. Премиальная набережная обычно даёт доходность ниже среднего по городу и покупается ради роста стоимости, а не денежного потока. Консенсус аналитиков на 2026-2028 годы — 5-12% годового прироста стоимости в отдельных сегментах.",
    yieldTitle: "Какую арендную доходность можно получить в Дубае?",
    yieldIntro: "Средняя валовая арендная доходность по городу — около 4,7%. Диапазон идёт примерно от 4,5% в премиальных районах до 8,5% в высокодоходных сообществах вроде JVC. Валовая доходность — не то, что остаётся у вас на руках.",
    yieldHead: ["Показатель", "Что это значит", "Типичные значения в Дубае"],
    yieldRows: [
      ["Валовая доходность", "Годовая аренда, делённая на цену покупки.", "Около 4,7% по городу; примерно от 4,5% в премиуме до 8,5% в высокодоходных районах"],
      ["Чистая доходность", "Валовая за вычетом сервисных сборов, простоев, обслуживания и управления.", "Обычно 75-85% от валовой"],
      ["Сервисные сборы", "Платятся ассоциации собственников за квадратный фут в год.", "AED 10-30 за кв. фут в год"],
      ["Регистрация Ejari", "Обязательная регистрация договора аренды в DLD.", "Около AED 220"],
      ["Налог на арендный доход", "В ОАЭ нет ежегодного налога на недвижимость, налога на прирост капитала и подоходного налога на аренду.", "0%"],
    ],
    yieldNote: "Спрашивайте у агента чистую доходность, а не валовую. Если он не может назвать ставку сервисного сбора за квадратный фут по конкретному зданию, он ещё не знает реальную цифру.",
    offplanTitle: "Как купить новостройку в Дубае",
    offplanIntro: "Новостройки составляют около 72% предложений в Дубае, то есть это мейнстрим, а не ниша. Процесс состоит из семи шагов.",
    offplanSteps: [
      { n: "1", title: "Определите бюджет и стратегию", body: "Решите, покупаете ли вы ради дохода, роста или резиденции, и добавьте к цене транзакционные расходы: около 5,5% при оплате наличными и 6,5% при ипотеке." },
      { n: "2", title: "Сначала застройщик, потом проект", body: "Оценивайте историю сдачи объектов застройщиком не менее серьёзно, чем условия рассрочки, и проверьте эскроу-счёт проекта в DLD." },
      { n: "3", title: "Забронируйте лот", body: "Подпишите форму бронирования и внесите депозит, чтобы снять объект с продажи." },
      { n: "4", title: "Подпишите SPA", body: "Читайте график платежей построчно. Предпочитайте платежи, привязанные к этапам строительства, а не только к календарным датам." },
      { n: "5", title: "Регистрация в DLD (Oqood)", body: "Сбор DLD в размере 4% обычно уплачивается при покупке для регистрации Oqood. Если застройщик пишет «DLD fees waived», как правило это значит, что 4% берёт на себя застройщик, а не то, что сбора нет." },
      { n: "6", title: "Платите взносы в ходе строительства", body: "Распространённая структура: 60% в течение строительства и 40% при передаче. Вариант с post-handover переносит часть последнего транша в рассрочку уже после получения ключей." },
      { n: "7", title: "Передача, снэггинг и титул", body: "Проверьте объект и составьте список недоделок при приёмке, после чего регистрация Oqood конвертируется в титул на ваше имя." },
    ],
    offplanNote: "Лимиты LTV, установленные Центральным банком ОАЭ, достигают 80% для резидентов и 50% для нерезидентов при покупке первого объекта, а для новостроек обычно ниже, поэтому большую часть суммы придётся закрыть собственными средствами. Если нужно выйти до передачи объекта, переуступка возможна после оплаты минимальной доли застройщику, часто около 30-40%, и получения NOC.",
    costsTitle: "Расходы на покупку и содержание недвижимости в Дубае",
    costsIntro: "Сбор DLD в 4% — это только заголовок, реальная полная стоимость оформления выше. Закладывайте эти суммы отдельно от цены и от графика рассрочки.",
    costsHead: ["Статья расходов", "Сумма", "Когда платится"],
    costsRows: [
      ["Трансферный сбор DLD", "4% от цены покупки", "При переоформлении или при регистрации Oqood для новостройки"],
      ["Сбор доверительного центра", "Около AED 4 000", "При переоформлении"],
      ["Выдача титула", "AED 540", "При переоформлении"],
      ["Комиссия агентства", "2% от цены плюс 5% НДС", "При переоформлении"],
      ["Регистрация ипотеки", "0,25% от суммы кредита плюс AED 290", "При переоформлении, только для ипотечных сделок"],
      ["Полная стоимость сделки", "Около 5,5% наличными, около 6,5% с ипотекой", "Сверх цены покупки"],
      ["Сервисные сборы", "AED 10-30 за кв. фут в год", "Ежегодно, начиная с передачи объекта"],
    ],
    plansTitle: "Три способа структурировать инвестицию в Дубае",
    plans: [
      { name: "Доход", fee: "Готовое жильё, аренда с первого договора", features: ["Завершённые объекты с титулом", "Районы среднего сегмента: JVC, Business Bay", "Средняя валовая доходность по городу около 4,7%", "Чистая доходность обычно 75-85% от валовой", "Регистрация Ejari и подбор арендатора на нашей стороне"] },
      { name: "Рост", fee: "Новостройка, рассрочка, рост капитала", features: ["Планы рассрочки застройщика на период строительства", "Цена обычно на 15-25% ниже прогнозной стоимости после сдачи", "По отдельным проектам доступна рассрочка после передачи ключей", "Платежи хранятся на эскроу-счёте DLD", "Доступ к запускам Emaar, DAMAC, Sobha, Nakheel, Meraas и Aldar"] },
      { name: "Резиденция", fee: "Квалифицирующая покупка от AED 2 млн", features: ["Квалифицирующая недвижимость от AED 2 млн", "10-летняя продлеваемая резиденция ОАЭ", "Супруг(а) и дети включаются в заявку", "Один объект на AED 2 млн или два по AED 1 млн", "При ипотеке собственный капитал не менее AED 1 млн"] },
    ],
    whyTitle: "Почему инвестировать через Binayah",
    whyPoints: [
      { title: "Агентство в Дубае с 2007 года", body: "Более 19 лет на одном и том же рынке, через несколько циклов, а не от запуска к запуску." },
      { title: "RERA-сертификация, ORN 1162", body: "Лицензия Агентства по регулированию недвижимости при Земельном департаменте Дубая; на каждой сделке — сертифицированные RERA агенты." },
      { title: "Более 3 000 активных объектов", body: "Новостройки и готовое жильё во фрихолд-районах Дубая, поэтому шорт-лист не ограничен ассортиментом одного застройщика." },
      { title: "Прямой доступ к застройщикам", body: "Доступ в день запуска к релизам Emaar, DAMAC, Sobha, Nakheel, Meraas и Aldar, включая условия рассрочки." },
      { title: "Сначала цифры, потом рассказ", body: "Считаем валовую и чистую доходность и полную стоимость по конкретному объекту и прямо говорим, когда цифры не сходятся." },
      { title: "Полный цикл", body: "Подбор, регистрация в DLD, ипотечное сопровождение, документы Golden Visa, сдача в аренду, управление и последующая перепродажа." },
    ],
    linksTitle: "С чего начать",
    linksSubtitle: "Смотреть рынок",
    guidesSubtitle: "Инвестиционные гиды",
    siteLinkLabels: ["Новостройки", "Лучшие новостройки", "Недвижимость на продажу", "Районы Дубая", "Застройщики", "Golden Visa", "Аналитика рынка", "Бесплатная оценка", "Агентство недвижимости в Дубае", "Брокер по недвижимости в Дубае", "Связаться с консультантом"],
    guideLinkLabels: ["Арендная доходность", "Районы с высокой доходностью", "ROI недвижимости в Дубае", "Новостройка или вторичка", "Планы рассрочки", "Переуступка новостройки", "Сборы DLD", "Сервисные сборы", "Процесс Golden Visa", "Фрихолд и лизхолд", "Прогноз рынка 2026", "Управление недвижимостью", "Чек-лист арендодателя"],
    faqTitle: "Частые вопросы",
    faqs: [
      { question: "Выгодно ли инвестировать в недвижимость Дубая?", answer: "Недвижимость Дубая подходит инвесторам, которым нужен арендный доход, рост капитала или резиденция. Иностранцы могут владеть объектами полностью в обозначенных фрихолд-зонах, право собственности фиксируется в бессрочном титуле DLD. В ОАЭ нет ежегодного налога на недвижимость, налога на прирост капитала и подоходного налога на аренду, поэтому владельцу достаётся большая часть арендной платы, чем на большинстве мировых рынков. Средняя валовая доходность по городу — около 4,7%. Как и на любом рынке, результат зависит от конкретного объекта, района и цены покупки, поэтому считайте цифры до сделки." },
      { question: "Какую арендную доходность можно получить в Дубае?", answer: "Средняя валовая доходность по городу — около 4,7%. Диапазон идёт примерно от 4,5% в премиальных районах до 8,5% в высокодоходных сообществах. Jumeirah Village Circle даёт примерно 7,2-8,5% валовой доходности, потому что цены низкие, около AED 700-900 за квадратный фут, а ставки аренды сильные для этого класса. Business Bay — около 6,2-7,1%. Премиальная набережная, Palm Jumeirah и Dubai Marina, даёт около 4,5-6% и покупается в основном ради роста стоимости. Чистая доходность после сервисных сборов, простоев, обслуживания и управления обычно составляет 75-85% от валовой." },
      { question: "Сколько денег нужно для инвестиции в недвижимость Дубая?", answer: "Единого порога входа нет, но транзакционные расходы закладывайте отдельно от цены: около 5,5% при оплате наличными и около 6,5% при ипотеке. Сюда входят трансферный сбор DLD 4%, сбор доверительного центра около AED 4 000, титул AED 540, комиссия агентства 2% плюс 5% НДС, а для ипотечных сделок — регистрация ипотеки 0,25% от суммы кредита плюс AED 290. Лимиты LTV Центрального банка ОАЭ достигают 80% для резидентов и 50% для нерезидентов при покупке первого объекта. Новостройка снижает стартовую сумму: вы вносите депозит бронирования, а остаток распределяется по этапам строительства." },
      { question: "Что лучше в Дубае: новостройка или готовое жильё?", answer: "Зависит от того, что вам нужно — рост или доход. Новостройка обычно оценивается на 15-25% ниже прогнозной рыночной стоимости после сдачи и оплачивается частями в ходе строительства, но доход начинается только после передачи, а главный риск — сроки. Готовое жильё на вторичном рынке сразу даёт титул и арендный доход, но полная стоимость оплачивается при переоформлении. Новостройки составляют около 72% предложений в Дубае. Если может понадобиться выход до передачи объекта, договор можно переуступить после оплаты минимальной доли застройщику, часто около 30-40%, и получения NOC." },
      { question: "Как купить новостройку в Дубае?", answer: "Определите бюджет и стратегию, сначала выберите застройщика и проверьте его историю сдачи и эскроу-счёт в DLD, забронируйте лот с депозитом, затем подпишите договор SPA, читая график платежей построчно. Сбор DLD в 4% обычно уплачивается при покупке для регистрации Oqood. Далее вы платите взносы в ходе строительства: распространённая структура — 60% в период строительства и 40% при передаче, а варианты post-handover переносят часть последнего транша в рассрочку после получения ключей. При передаче вы проводите приёмку, и Oqood конвертируется в титул." },
      { question: "Могут ли иностранцы покупать недвижимость в Дубае?", answer: "Да. В обозначенных фрихолд-зонах Дубая иностранные граждане могут владеть недвижимостью полностью и бессрочно, с регистрацией имени в титуле Земельного департамента Дубая. Такое право не истекает и включает возможность продать, сдать в аренду и передать по наследству. За пределами этих зон лизхолд даёт право пользования на длительный, но конечный срок, обычно до 99 лет, после чего права возвращаются собственнику земли. Уточняйте форму владения по конкретному объекту, особенно если покупка связана с получением резиденции." },
      { question: "Сколько нужно вложить для Golden Visa?", answer: "Инвестиция в недвижимость на сумму не менее AED 2 млн даёт право на 10-летнюю продлеваемую Golden Visa ОАЭ. Это может быть один объект на AED 2 млн или два объекта по AED 1 млн, объединённые в одной заявке. Ипотечные объекты и новостройки могут квалифицироваться при соблюдении порога AED 2 млн и условий банка или застройщика, а при ипотеке ваш собственный капитал должен быть не менее AED 1 млн. Стоимость должна быть реальной долей с титулом, зарегистрированной в DLD на ваше имя. Супруг(а) и дети включаются в заявку, а продление через десять лет требует лишь сохранения квалифицирующей собственности." },
      { question: "Какие есть текущие расходы на владение недвижимостью в Дубае?", answer: "Основной регулярный расход — сервисный сбор ассоциации собственников, обычно AED 10-30 за квадратный фут в год, причём башни с большим количеством удобств и объекты на набережной находятся в верхней части диапазона. Добавьте обслуживание, комиссию за управление, если вы не управляете сами, и реалистичный резерв на простой между арендаторами. Регистрация Ejari стоит около AED 220 за договор. В ОАЭ нет ежегодного налога на недвижимость, налога на прирост капитала и подоходного налога на аренду, поэтому именно сервисные сборы и текущие расходы определяют вашу чистую доходность." },
    ],
    ctaTitle: "Соберите портфель в Дубае",
    ctaDesc: "Назовите бюджет и цель — доход, рост или резиденция. Мы вернёмся с шорт-листом и расчётами по каждому объекту, а не с брошюрой.",
    ctaBtn: "Получить консультацию",
    ctaWhatsApp: "Написать в WhatsApp",
    breadcrumbs: ["Главная", "Услуги", "Инвестиции в недвижимость"],
  },

  ar: {
    metaTitle: "الاستثمار العقاري في دبي | استثمر في عقارات دبي | بناية للعقارات",
    metaDesc: "الاستثمار العقاري في دبي: على الخارطة مقابل السوق الثانوي، خطط السداد، العائد الإيجاري، مناطق التملك الحر، عتبة الإقامة الذهبية بمليوني درهم، رسوم دائرة الأراضي ورسوم الخدمة. معتمدون من RERA منذ 2007.",
    heroLabel: "الاستثمار العقاري",
    h1: "الاستثمار العقاري في دبي",
    heroDesc: "اشترِ عقارًا في دبي من أجل الدخل الإيجاري أو نمو رأس المال أو إقامة عشر سنوات. بناية وسيط عقاري معتمد من RERA منذ عام 2007، بأكثر من 3,000 عقار معروض ووصول مباشر إلى إطلاقات إعمار وداماك وصبحا ونخيل ومراس وألدار.",
    heroCta: "تحدث إلى مستشار استثماري",
    stats: [
      { n: "+19", label: "عامًا في عقارات دبي" },
      { n: "+3,000", label: "عقار معروض" },
      { n: "RERA", label: "اعتماد، رقم 1162" },
      { n: "2 مليون درهم", label: "عتبة الإقامة الذهبية" },
    ],
    answerTitle: "ما هو الاستثمار العقاري في دبي؟",
    answerBody: [
      "الاستثمار العقاري في دبي يعني شراء عقار سكني أو تجاري في دبي لتحقيق دخل إيجاري أو نمو في رأس المال أو كليهما. يستطيع الأجانب التملك الكامل في مناطق التملك الحر المخصصة في دبي، وتُسجَّل الملكية في سند ملكية تصدره دائرة الأراضي والأملاك في دبي. لا تفرض الإمارات ضريبة عقارية سنوية ولا ضريبة على الأرباح الرأسمالية ولا ضريبة دخل على عوائد الإيجار، لذا يصل الإيجار إلى المالك بشكل مباشر أكثر من معظم الأسواق العالمية.",
      "يبلغ متوسط العائد الإيجاري الإجمالي على مستوى المدينة نحو 4.7%، حيث تحقق مجتمعات السوق المتوسط عائدًا أعلى من هذا الخط، بينما تحقق الواجهات البحرية الفاخرة عائدًا أقل منه. خصِّص نحو 5.5% من سعر الشراء لتكاليف المعاملة في الصفقات النقدية ونحو 6.5% في الصفقات الممولة، فوق السعر نفسه. كما أن شراء عقار مؤهل بقيمة مليوني درهم أو أكثر ومسجَّل لدى دائرة الأراضي يمنح المشتري أهلية الإقامة الذهبية لعشر سنوات قابلة للتجديد.",
    ],
    servicesTitle: "ما تشمله خدمتنا الاستثمارية",
    services: [
      { icon: "🎯", title: "الاستراتيجية وتحديد الهدف", body: "دخل أم نمو أم إقامة. نحدد الهدف أولًا، لأن العقار الأعلى عائدًا والعقار الأسرع ارتفاعًا في القيمة نادرًا ما يكونان العقار نفسه." },
      { icon: "🏗️", title: "توفير مشاريع على الخارطة", body: "وصول مباشر إلى إطلاقات إعمار وداماك وصبحا ونخيل ومراس وألدار، بما في ذلك خطط السداد أثناء الإنشاء وبعد التسليم." },
      { icon: "🔑", title: "الشراء الجاهز والثانوي", body: "وحدات مكتملة بسند ملكية من أكثر من 3,000 عقار معروض في مجتمعات التملك الحر بدبي، مع دخل من أول عقد إيجار." },
      { icon: "📊", title: "نمذجة العائد والتكاليف", body: "العائد الإجمالي والعائد الصافي بعد رسوم الخدمة وفترات الشغور، والتكلفة الكاملة للمعاملة، محسوبة على الوحدة الفعلية لا على عنوان تسويقي." },
      { icon: "🛂", title: "هيكلة الإقامة الذهبية", body: "هيكلة الشراء بحيث تتجاوز القيمة المسجَّلة باسمك عتبة المليوني درهم دون أي التباس." },
      { icon: "🔁", title: "الخروج وإعادة البيع", body: "التنازل عن عقد على الخارطة بشهادة عدم ممانعة من المطور، أو إعادة بيع وحدة مكتملة عبر دائرة الأراضي. نخطط للخروج قبل الدخول." },
    ],
    optionsTitle: "خيارات الاستثمار العقاري في دبي",
    optionsIntro: "هناك ستة مسارات رئيسية للاستثمار العقاري في دبي، تختلف في حجم السيولة المطلوبة مقدمًا، وموعد بدء الدخل، وموقع المخاطرة.",
    optionsHead: ["الخيار", "كيف يعمل", "الأنسب لـ", "اعتبار أساسي"],
    optionsRows: [
      ["على الخارطة", "الشراء من المطور قبل الاكتمال وفق خطة سداد على مراحل.", "نمو رأس المال بسيولة أولية منخفضة.", "يسعِّر المطورون عادةً العقار على الخارطة بنسبة 15-25% أقل من القيمة السوقية المتوقعة بعد الاكتمال؛ والمخاطرة الأساسية هي توقيت التسليم."],
      ["جاهز / ثانوي", "شراء وحدة مكتملة بسند ملكية في سوق إعادة البيع.", "دخل من اليوم الأول.", "يستحق كامل السعر عند نقل الملكية، فتحتاج إلى المبلغ كاملًا أو إلى تمويل عقاري."],
      ["الشراء للتأجير", "الاحتفاظ بوحدة جاهزة بعقد إيجار مسجل في إيجاري لمدة 12 شهرًا.", "دخل سنوي ثابت.", "متوسط العائد الإجمالي على مستوى المدينة نحو 4.7%، والعائد الصافي عادةً 75-85% من الإجمالي."],
      ["الإيجار قصير الأجل", "تأجير وحدة مفروشة كمنزل عطلات بترخيص.", "دخل إجمالي أعلى في المناطق السياحية.", "تكاليف تشغيل وإدارة أعلى، وإشغال يتغير مع المواسم."],
      ["التنازل عن عقد على الخارطة", "بيع العقد لمشترٍ جديد قبل التسليم.", "فترة احتفاظ أقصر دون انتظار الاكتمال.", "يشترط المطورون عادةً سداد 30-40% من السعر أولًا، إضافة إلى شهادة عدم ممانعة."],
      ["شراء بغرض الإقامة الذهبية", "شراء عقار مؤهل بقيمة مليوني درهم أو أكثر.", "إقامة إماراتية لعشر سنوات قابلة للتجديد.", "يجب أن تكون القيمة حصة حقيقية بسند ملكية ومسجلة لدى دائرة الأراضي باسمك."],
    ],
    areasTitle: "أفضل المناطق للاستثمار في دبي",
    areasIntro: "العائد ونمو رأس المال يسحبان في اتجاهين متعاكسين. المجتمعات الميسورة ذات الطلب المرتفع تحقق أقوى عائد إجمالي، بينما تحقق العناوين الفاخرة النادرة أقوى ارتفاع في القيمة.",
    areasHead: ["المجتمع", "الملف", "العائد الإجمالي الإرشادي", "سبب الشراء"],
    areasRows: [
      ["قرية جميرا الدائرية", "شقق السوق المتوسط، قاعدة مستأجرين عميقة وسائلة، معروض جديد كبير ومستمر.", "7.2-8.5%", "الدخل"],
      ["الخليج التجاري", "أبراج في قلب المدينة؛ إيجارات مطلقة أعلى لكن أسعار أعلى أيضًا.", "6.2-7.1%", "دخل ونمو"],
      ["دبي مارينا", "واجهة بحرية راسخة وسيولة قوية عند إعادة البيع.", "4.5-6%", "نمو وسيولة"],
      ["نخلة جميرا", "واجهة بحرية فاخرة نادرة؛ أرض لا يمكن تكرارها.", "4.5-6%", "نمو رأس المال"],
      ["دبي الجنوب", "ممر نمو حول مطار آل مكتوم الدولي، وأسعار للقدم المربعة من الأكثر يسرًا في دبي.", "أعلى من متوسط المدينة", "الدخل، بملف منطقة ناشئة"],
      ["ديسكفري جاردنز / المدينة العالمية", "مخزون ناضج وميسور بمعروض جديد محدود ومستأجرين طويلي الإقامة.", "أعلى من متوسط المدينة", "الدخل أولًا"],
    ],
    areasNote: "المعايير المرجعية: متوسط العائد الإيجاري الإجمالي على مستوى المدينة نحو 4.7%، ومتوسط سعر البيع نحو 1,879 درهمًا للقدم المربعة. الواجهات البحرية الفاخرة تحقق عادةً عائدًا أقل من متوسط المدينة وتُشترى لنمو القيمة لا للتدفق النقدي. وتشير توقعات المحللين التوافقية للفترة 2026-2028 إلى ارتفاع سنوي بنسبة 5-12% في قطاعات مختارة.",
    yieldTitle: "ما العائد الإيجاري الذي يمكن تحقيقه في دبي؟",
    yieldIntro: "متوسط العائد الإيجاري الإجمالي على مستوى المدينة نحو 4.7%، ويمتد النطاق من نحو 4.5% في المناطق الفاخرة إلى نحو 8.5% في المجتمعات عالية العائد مثل قرية جميرا الدائرية. العائد الإجمالي ليس ما يبقى في يدك.",
    yieldHead: ["المؤشر", "ماذا يعني", "القيمة المعتادة في دبي"],
    yieldRows: [
      ["العائد الإجمالي", "الإيجار السنوي مقسومًا على سعر الشراء.", "نحو 4.7% على مستوى المدينة؛ من 4.5% تقريبًا في الفاخر إلى 8.5% في عالي العائد"],
      ["العائد الصافي", "الإجمالي بعد خصم رسوم الخدمة والشغور والصيانة والإدارة.", "عادةً 75-85% من الإجمالي"],
      ["رسوم الخدمة", "تُدفع لاتحاد الملاك عن كل قدم مربعة سنويًا.", "10-30 درهمًا للقدم المربعة سنويًا"],
      ["تسجيل إيجاري", "تسجيل إلزامي لعقد الإيجار لدى دائرة الأراضي.", "نحو 220 درهمًا"],
      ["الضريبة على دخل الإيجار", "لا تفرض الإمارات ضريبة عقارية سنوية ولا ضريبة أرباح رأسمالية ولا ضريبة دخل على الإيجار.", "0%"],
    ],
    yieldNote: "اطلب من أي وسيط العائد الصافي لا الإجمالي. إذا لم يستطع إخبارك برسوم الخدمة للقدم المربعة في المبنى، فهو لا يعرف الرقم الحقيقي بعد.",
    offplanTitle: "كيف تشتري عقارًا على الخارطة في دبي",
    offplanIntro: "تشكل العقارات على الخارطة نحو 72% من المعروض في دبي، أي أنها التيار الرئيسي لا سوقًا هامشية. تمر العملية بسبع خطوات.",
    offplanSteps: [
      { n: "1", title: "حدد الميزانية والاستراتيجية", body: "قرر ما إذا كنت تشتري للدخل أو النمو أو الإقامة، وأضف تكاليف المعاملة فوق السعر: نحو 5.5% نقدًا و6.5% مع التمويل." },
      { n: "2", title: "اختر المطور قبل المشروع", body: "زِن سجل المطور في التسليم بالقدر نفسه الذي تزن به شروط السداد، وتحقق من حساب الضمان (الإسكرو) لدى دائرة الأراضي." },
      { n: "3", title: "احجز الوحدة", body: "وقّع نموذج الحجز وادفع دفعة الحجز لسحب الوحدة من السوق." },
      { n: "4", title: "وقّع اتفاقية البيع والشراء", body: "اقرأ جدول الدفعات سطرًا بسطر، وفضّل الدفعات المرتبطة بمراحل الإنشاء على تلك المرتبطة بالتواريخ فقط." },
      { n: "5", title: "التسجيل لدى دائرة الأراضي (عقود)", body: "تُدفع رسوم التسجيل البالغة 4% عادةً عند الشراء لتسجيل عقود. وعندما يعلن مطور عن «إعفاء من رسوم الدائرة» فهذا يعني غالبًا أن المطور يتحمل الـ4% لا أنها غير مفروضة." },
      { n: "6", title: "سدد الأقساط أثناء الإنشاء", body: "من الهياكل الشائعة سداد 60% أثناء الإنشاء و40% عند التسليم. أما خطط ما بعد التسليم فتنقل جزءًا من الدفعة الأخيرة إلى أقساط بعد استلام المفاتيح." },
      { n: "7", title: "التسليم والفحص وسند الملكية", body: "افحص الوحدة وسجّل الملاحظات عند التسليم، ثم يتحول تسجيل عقود إلى سند ملكية باسمك." },
    ],
    offplanNote: "تصل حدود التمويل مقابل القيمة التي يضعها مصرف الإمارات المركزي إلى 80% للمقيمين و50% لغير المقيمين على العقار الأول، وهي عادةً أقل للعقارات على الخارطة، فتوقع تمويل جزء أكبر نقدًا. وإذا احتجت للخروج قبل التسليم، فالتنازل ممكن بعد سداد الحد الأدنى الذي يطلبه المطور، وغالبًا نحو 30-40%، والحصول على شهادة عدم ممانعة.",
    costsTitle: "تكاليف شراء العقار في دبي والرسوم المستمرة",
    costsIntro: "رسوم النقل البالغة 4% هي العنوان فقط، أما التكلفة الواقعية الكاملة للتسجيل فأعلى. خصِّص هذه المبالغ بمعزل عن السعر وعن خطة السداد.",
    costsHead: ["البند", "المبلغ", "موعد الاستحقاق"],
    costsRows: [
      ["رسوم النقل لدائرة الأراضي", "4% من سعر الشراء", "عند نقل الملكية، أو عند تسجيل عقود للعقار على الخارطة"],
      ["رسوم أمين التسجيل", "نحو 4,000 درهم", "عند نقل الملكية"],
      ["إصدار سند الملكية", "540 درهمًا", "عند نقل الملكية"],
      ["عمولة الوساطة", "2% من السعر زائد 5% ضريبة قيمة مضافة", "عند نقل الملكية"],
      ["تسجيل الرهن العقاري", "0.25% من قيمة القرض زائد 290 درهمًا", "عند نقل الملكية، للصفقات الممولة فقط"],
      ["إجمالي تكلفة المعاملة", "نحو 5.5% نقدًا، ونحو 6.5% مع التمويل", "فوق سعر الشراء"],
      ["رسوم الخدمة", "10-30 درهمًا للقدم المربعة سنويًا", "سنويًا، اعتبارًا من التسليم"],
    ],
    plansTitle: "ثلاث طرق لهيكلة استثمارك في دبي",
    plans: [
      { name: "الدخل", fee: "وحدات جاهزة، إيجار من أول عقد", features: ["مخزون مكتمل بسند ملكية", "مجتمعات السوق المتوسط مثل قرية جميرا الدائرية والخليج التجاري", "متوسط عائد إجمالي على مستوى المدينة نحو 4.7%", "عائد صافٍ عادةً 75-85% من الإجمالي", "تسجيل إيجاري وتأمين المستأجر من جهتنا"] },
      { name: "النمو", fee: "على الخارطة، دفعات مرحلية، نمو رأس المال", features: ["خطط سداد من المطور خلال الإنشاء", "تسعير أقل عادةً بنسبة 15-25% من القيمة المتوقعة بعد الاكتمال", "خطط ما بعد التسليم متاحة في مشاريع مختارة", "الأقساط محفوظة في حساب ضمان لدى دائرة الأراضي", "وصول إلى إطلاقات إعمار وداماك وصبحا ونخيل ومراس وألدار"] },
      { name: "الإقامة", fee: "شراء مؤهل من مليوني درهم", features: ["عقار مؤهل من مليوني درهم", "إقامة إماراتية لعشر سنوات قابلة للتجديد", "الزوج/الزوجة والأبناء ضمن الطلب", "عقار واحد بمليوني درهم أو عقاران بمليون درهم لكل منهما", "الشراء بتمويل يتطلب حصة ملكية لا تقل عن مليون درهم"] },
    ],
    whyTitle: "لماذا تستثمر عبر بناية",
    whyPoints: [
      { title: "وسيط في دبي منذ 2007", body: "أكثر من 19 عامًا في السوق نفسه عبر عدة دورات، لا عملًا يقفز من إطلاق إلى إطلاق." },
      { title: "اعتماد RERA، رقم 1162", body: "مرخصون من مؤسسة التنظيم العقاري التابعة لدائرة الأراضي والأملاك، مع وكلاء معتمدين من RERA في كل صفقة." },
      { title: "أكثر من 3,000 عقار معروض", body: "مشاريع على الخارطة ووحدات جاهزة في مجتمعات التملك الحر بدبي، فلا تقتصر القائمة على مخزون مطور واحد." },
      { title: "وصول مباشر إلى المطورين", body: "وصول في يوم الإطلاق إلى إصدارات إعمار وداماك وصبحا ونخيل ومراس وألدار، بما في ذلك شروط السداد." },
      { title: "الأرقام قبل السرد", body: "نحسب العائد الإجمالي والصافي والتكلفة الكاملة على الوحدة المحددة أمامك، ونقول لك بصراحة متى لا تنجح الأرقام." },
      { title: "من البداية إلى النهاية", body: "الاختيار، والتسجيل لدى دائرة الأراضي، والتعريف بالتمويل، وأوراق الإقامة الذهبية، والتأجير والإدارة وإعادة البيع لاحقًا." },
    ],
    linksTitle: "ابدأ بحثك",
    linksSubtitle: "تصفح السوق",
    guidesSubtitle: "أدلة الاستثمار",
    siteLinkLabels: ["مشاريع على الخارطة", "أفضل المشاريع على الخارطة", "عقارات للبيع", "مجتمعات دبي", "المطورون", "الإقامة الذهبية", "تقارير السوق", "تقييم مجاني للعقار", "وكالة عقارية في دبي", "وسيط عقاري في دبي", "تواصل مع مستشار"],
    guideLinkLabels: ["شرح العائد الإيجاري", "أفضل مناطق العائد المرتفع", "العائد على الاستثمار في دبي", "على الخارطة أم ثانوي", "خطط السداد", "التنازل وإعادة البيع", "رسوم دائرة الأراضي", "رسوم الخدمة", "إجراءات الإقامة الذهبية", "التملك الحر والإجارة الطويلة", "توقعات سوق دبي 2026", "إدارة العقارات في دبي", "قائمة مهام المالك"],
    faqTitle: "الأسئلة الشائعة",
    faqs: [
      { question: "هل العقار في دبي استثمار جيد؟", answer: "يناسب العقار في دبي المستثمرين الباحثين عن دخل إيجاري أو نمو رأسمالي أو إقامة. يستطيع الأجانب التملك الكامل في مناطق التملك الحر المخصصة، وتُسجَّل الملكية في سند ملكية من دائرة الأراضي لا ينتهي أجله. ولا تفرض الإمارات ضريبة عقارية سنوية ولا ضريبة أرباح رأسمالية ولا ضريبة دخل على عوائد الإيجار، فيصل إلى المالك جزء أكبر من الإيجار مقارنة بمعظم الأسواق العالمية. ويبلغ متوسط العائد الإجمالي على مستوى المدينة نحو 4.7%. وكما في أي سوق، تعتمد النتائج على الوحدة والمجتمع والسعر المدفوع، لذا احسب الأرقام قبل الالتزام." },
      { question: "ما العائد الإيجاري الذي يمكن تحقيقه في دبي؟", answer: "متوسط العائد الإيجاري الإجمالي على مستوى المدينة نحو 4.7%، ويمتد النطاق من نحو 4.5% في المناطق الفاخرة إلى نحو 8.5% في المجتمعات عالية العائد. تحقق قرية جميرا الدائرية نحو 7.2-8.5% إجمالًا لأن الأسعار منخفضة، نحو 700-900 درهم للقدم المربعة، بينما الإيجارات قوية لهذه الفئة. ويحقق الخليج التجاري نحو 6.2-7.1%. أما الواجهات البحرية الفاخرة مثل نخلة جميرا ودبي مارينا فتحقق نحو 4.5-6% وتُشترى أساسًا لنمو القيمة. والعائد الصافي، بعد رسوم الخدمة والشغور والصيانة والإدارة، يكون عادةً 75-85% من الإجمالي." },
      { question: "كم من المال أحتاج للاستثمار العقاري في دبي؟", answer: "لا يوجد سعر دخول واحد، لكن خصِّص تكاليف المعاملة بمعزل عن السعر: نحو 5.5% من سعر الشراء في الصفقات النقدية ونحو 6.5% في الصفقات الممولة. يشمل ذلك رسوم النقل البالغة 4% لدائرة الأراضي، ورسوم أمين التسجيل نحو 4,000 درهم، وسند الملكية 540 درهمًا، وعمولة الوساطة 2% زائد 5% ضريبة قيمة مضافة، وفي الصفقات الممولة تسجيل الرهن بنسبة 0.25% من القرض زائد 290 درهمًا. وتصل حدود التمويل مقابل القيمة لدى مصرف الإمارات المركزي إلى 80% للمقيمين و50% لغير المقيمين على العقار الأول. ويقلل الشراء على الخارطة السيولة المطلوبة في البداية، إذ تدفع دفعة حجز ثم توزع الباقي على مراحل الإنشاء." },
      { question: "أيهما أفضل في دبي: على الخارطة أم الجاهز؟", answer: "يعتمد ذلك على ما إذا كنت تريد نموًا أم دخلًا. العقار على الخارطة يُسعَّر عادةً بنسبة 15-25% أقل من القيمة السوقية المتوقعة بعد الاكتمال ويُدفع على أقساط خلال الإنشاء، لكن الدخل لا يبدأ إلا بعد التسليم والمخاطرة الأساسية هي توقيت التسليم. أما العقار الجاهز في السوق الثانوي فيمنحك سند ملكية ودخلًا إيجاريًا فورًا، لكن كامل السعر يستحق عند نقل الملكية. وتشكل العقارات على الخارطة نحو 72% من المعروض في دبي. وإذا احتجت للخروج قبل التسليم، يمكنك التنازل عن العقد بعد سداد الحد الأدنى الذي يطلبه المطور، وغالبًا نحو 30-40%، والحصول على شهادة عدم ممانعة." },
      { question: "كيف أشتري عقارًا على الخارطة في دبي؟", answer: "حدد ميزانيتك واستراتيجيتك، واختر المطور قبل المشروع مع فحص سجل تسليمه وحساب الضمان لدى دائرة الأراضي، ثم احجز الوحدة بدفعة حجز، ووقّع اتفاقية البيع والشراء بعد قراءة جدول الدفعات سطرًا بسطر. وتُدفع رسوم التسجيل البالغة 4% عادةً عند الشراء لتسجيل عقود. بعد ذلك تسدد الأقساط خلال الإنشاء، ومن الهياكل الشائعة 60% خلال الإنشاء و40% عند التسليم، مع خطط ما بعد التسليم التي تنقل جزءًا من الدفعة الأخيرة إلى أقساط بعد استلام المفاتيح. وعند التسليم تفحص الوحدة ويتحول تسجيل عقود إلى سند ملكية." },
      { question: "هل يمكن للأجانب شراء عقار في دبي؟", answer: "نعم. في مناطق التملك الحر المخصصة في دبي يستطيع الأجانب التملك الكامل والدائم، مع تسجيل أسمائهم في سند ملكية تصدره دائرة الأراضي والأملاك. وهذه الملكية لا تنتهي وتشمل حق البيع والتأجير والتوريث. أما خارج تلك المناطق فتمنح الإجارة الطويلة حق الانتفاع لمدة طويلة لكنها محددة، تصل عادةً إلى 99 عامًا، وبعدها تعود الحقوق إلى مالك الرقبة. تحقق من نوع الملكية على الوحدة المحددة قبل الاعتماد عليها، خصوصًا إذا كانت الإقامة جزءًا من دافعك للشراء." },
      { question: "كم يجب أن أشتري للحصول على الإقامة الذهبية؟", answer: "استثمار عقاري لا يقل عن مليوني درهم يؤهلك للإقامة الذهبية الإماراتية لعشر سنوات قابلة للتجديد. ويمكن أن يكون عقارًا واحدًا بمليوني درهم أو عقارين بمليون درهم لكل منهما ضمن طلب واحد. وقد تتأهل العقارات الممولة وعلى الخارطة شريطة استيفاء عتبة المليوني درهم وشروط الممول أو المطور، وفي الشراء بتمويل يجب ألا تقل حصتك عن مليون درهم. ويجب أن تكون القيمة حصة حقيقية بسند ملكية ومسجلة لدى دائرة الأراضي باسمك. ويمكن ضم الزوج/الزوجة والأبناء، ولا يتطلب التجديد بعد عشر سنوات سوى استمرار امتلاكك عقارًا مؤهلًا." },
      { question: "ما التكاليف المستمرة لامتلاك عقار في دبي؟", answer: "التكلفة المتكررة الرئيسية هي رسوم الخدمة المدفوعة لاتحاد الملاك، وتتراوح عادةً بين 10 و30 درهمًا للقدم المربعة سنويًا، وتقع الأبراج الغنية بالمرافق ومجتمعات الواجهة البحرية في الحد الأعلى من هذا النطاق. أضف الصيانة، ورسوم الإدارة إن لم تكن تدير بنفسك، ومخصصًا واقعيًا لفترات الشغور بين المستأجرين. ويكلف تسجيل إيجاري نحو 220 درهمًا لكل عقد. ولا توجد في الإمارات ضريبة عقارية سنوية ولا ضريبة أرباح رأسمالية ولا ضريبة دخل على الإيجار، لذا فإن رسوم الخدمة وتكاليف التشغيل هي التي تحدد عائدك الصافي." },
    ],
    ctaTitle: "ابنِ محفظتك العقارية في دبي",
    ctaDesc: "أخبرنا بميزانيتك وبما إذا كنت تشتري للدخل أو النمو أو الإقامة. سنعود إليك بقائمة مختصرة وبالأرقام المحسوبة لكل وحدة، لا بكتيب تسويقي.",
    ctaBtn: "تحدث إلى مستشار",
    ctaWhatsApp: "راسلنا على واتساب",
    breadcrumbs: ["الرئيسية", "الخدمات", "الاستثمار العقاري"],
  },

  zh: {
    metaTitle: "迪拜房产投资 | 投资迪拜房地产 | Binayah Properties",
    metaDesc: "迪拜房产投资全解：期房与二手房、付款计划、租金回报率、永久产权区、200万迪拉姆黄金签证门槛、DLD费用与物业费。RERA认证，自2007年起。",
    heroLabel: "房产投资",
    h1: "迪拜房产投资",
    heroDesc: "为租金收入、资本增值或10年居留权投资迪拜房产。Binayah自2007年起即为RERA认证的迪拜中介，拥有3,000+在售房源，并可直接对接Emaar、DAMAC、Sobha、Nakheel、Meraas和Aldar的新盘发售。",
    heroCta: "咨询投资顾问",
    stats: [
      { n: "19+", label: "年迪拜房地产经验" },
      { n: "3,000+", label: "在售房源" },
      { n: "RERA", label: "认证，编号1162" },
      { n: "200万迪拉姆", label: "黄金签证门槛" },
    ],
    answerTitle: "什么是迪拜房产投资？",
    answerBody: [
      "迪拜房产投资是指在迪拜购买住宅或商业地产，以获取租金收入、资本增值，或两者兼得。外国人可在迪拜指定的永久产权（freehold）区域完全拥有房产，产权登记在迪拜土地局（DLD）签发的房产证上。阿联酋不征收年度房产税、资本利得税，也不对租金收入征收所得税，因此租金比多数全球市场更直接地进入业主口袋。",
      "全市平均毛租金回报率约为4.7%，中端社区高于这条基准线，顶级海滨则低于它。除房价本身外，全款交易请预留约房价5.5%的交易成本，按揭交易约6.5%。购买价值200万迪拉姆及以上、在DLD登记的合格房产，还可使买家具备申请10年可续签黄金签证的资格。",
    ],
    servicesTitle: "我们的投资服务涵盖",
    services: [
      { icon: "🎯", title: "策略与目标设定", body: "收益、增值还是居留。我们先确定目标，因为回报率最高的房产与增值最快的房产极少是同一套。" },
      { icon: "🏗️", title: "期房房源对接", body: "直接对接Emaar、DAMAC、Sobha、Nakheel、Meraas和Aldar的新盘发售，包括施工期付款计划与交房后付款计划。" },
      { icon: "🔑", title: "现房与二手房收购", body: "从我们3,000+在售房源中挑选迪拜永久产权社区内已竣工、带房产证的单位，首个租约即产生收入。" },
      { icon: "📊", title: "回报与成本测算", body: "毛回报率、扣除物业费与空置期后的净回报率，以及全部交易成本，均按具体房源计算，而非广告标题。" },
      { icon: "🛂", title: "黄金签证架构", body: "设计购买方案，使登记在您名下的价值明确超过200万迪拉姆门槛。" },
      { icon: "🔁", title: "退出与转售", body: "凭开发商无异议证书（NOC）转让期房合同，或通过DLD转售现房。我们在入场前就规划好退出。" },
    ],
    optionsTitle: "迪拜房产投资方式",
    optionsIntro: "迪拜房产投资主要有六种方式，区别在于前期需要多少现金、何时开始产生收入，以及风险落在哪里。",
    optionsHead: ["方式", "运作方式", "适合", "关键考量"],
    optionsRows: [
      ["期房", "在竣工前按分期付款计划向开发商购买。", "以较少前期现金追求资本增值。", "开发商定价通常比竣工后预期市场价低15-25%；主要风险是交付时间。"],
      ["现房 / 二手房", "在二手市场购买已竣工、带房产证的单位。", "从第一天起产生收入。", "全款在过户时到期，需要全额资金或按揭。"],
      ["长租持有", "以登记的12个月Ejari租约持有现房。", "稳定的年度收入。", "全市平均毛回报率约4.7%；净回报率通常为毛回报率的75-85%。"],
      ["短租 / 度假屋", "以许可方式将带家具的单位作为度假屋出租。", "在旅游区获得更高毛收入。", "运营成本和管理投入更高，入住率随季节波动。"],
      ["期房转让", "在交房前将合同转让给新买家。", "无需等待竣工的较短持有期。", "开发商通常要求先支付房价的30-40%，并出具无异议证书（NOC）。"],
      ["黄金签证购房", "购买200万迪拉姆及以上的合格房产。", "10年可续签的阿联酋居留权。", "价值必须是登记在您名下、有房产证的DLD真实权益。"],
    ],
    areasTitle: "迪拜最佳投资区域",
    areasIntro: "回报率与资本增值方向相反。价格亲民、需求旺盛的社区毛回报率最高；稀缺的顶级地段增值最强。",
    areasHead: ["社区", "特征", "参考毛回报率", "购买目的"],
    areasRows: [
      ["Jumeirah Village Circle", "中端公寓，租客群体深厚且流动性好，新增供应量大。", "7.2-8.5%", "收益"],
      ["Business Bay", "市中心高层；绝对租金更高，但房价也更高。", "6.2-7.1%", "收益与增值"],
      ["Dubai Marina", "成熟海滨社区，转售流动性强。", "4.5-6%", "增值与流动性"],
      ["Palm Jumeirah", "稀缺顶级海滨；土地不可复制。", "4.5-6%", "资本增值"],
      ["Dubai South", "围绕阿勒马克图姆国际机场的增长走廊，每平方英尺价格在迪拜属最亲民之列。", "高于全市平均", "收益，新兴片区属性"],
      ["Discovery Gardens / International City", "成熟且价格亲民的存量房，新增供应有限，租客居住期长。", "高于全市平均", "收益优先"],
    ],
    areasNote: "基准数据：全市平均毛租金回报率约4.7%，全市平均售价约每平方英尺1,879迪拉姆。顶级海滨的回报率通常低于全市平均，买入目的是增值而非现金流。分析师对2026-2028年的共识预期为部分板块年增值5-12%。",
    yieldTitle: "在迪拜能获得多少租金回报率？",
    yieldIntro: "全市平均毛租金回报率约为4.7%，区间从顶级区域的约4.5%到JVC等高回报社区的约8.5%。毛回报率并不是您最终留下的钱。",
    yieldHead: ["指标", "含义", "迪拜常见数值"],
    yieldRows: [
      ["毛回报率", "年租金除以购买价格。", "全市约4.7%；顶级约4.5%至高回报社区约8.5%"],
      ["净回报率", "毛回报扣除物业费、空置期、维护与管理。", "通常为毛回报率的75-85%"],
      ["物业费", "按每平方英尺每年支付给业主协会。", "每平方英尺每年10-30迪拉姆"],
      ["Ejari登记", "每份租约必须在DLD登记。", "约220迪拉姆"],
      ["租金收入税", "阿联酋不征收年度房产税、资本利得税和租金所得税。", "0%"],
    ],
    yieldNote: "向任何中介索要的应是净回报率，而非毛回报率。如果对方说不出该楼盘每平方英尺的物业费标准，他就还不知道真实数字。",
    offplanTitle: "如何在迪拜购买期房",
    offplanIntro: "期房约占迪拜在售房源的72%，是主流而非小众。流程分为七步。",
    offplanSteps: [
      { n: "1", title: "确定预算与策略", body: "先决定是为收益、增值还是居留而买，并在房价之上加上交易成本：全款约5.5%，按揭约6.5%。" },
      { n: "2", title: "先选开发商，再选项目", body: "把开发商的交付记录看得和付款条件同样重要，并核实项目在DLD的托管（escrow）账户。" },
      { n: "3", title: "预订房源", body: "签署预订表并支付订金，将该单位从市场上锁定。" },
      { n: "4", title: "签署SPA", body: "逐条阅读付款计划表。优先选择与施工节点挂钩的分期，而非仅按日期付款。" },
      { n: "5", title: "在DLD登记（Oqood）", body: "4%的DLD登记费通常在购买时支付以完成Oqood登记。开发商宣传的“免DLD费用”通常指开发商代为承担这4%，而非不收取。" },
      { n: "6", title: "施工期分期付款", body: "常见结构为施工期支付60%、交房时支付40%。交房后付款方案则把最后一笔中的一部分转为拿到钥匙之后的分期。" },
      { n: "7", title: "交房、验房与房产证", body: "交房时验收并列出整改清单，随后Oqood登记转换为您名下的房产证。" },
    ],
    offplanNote: "阿联酋央行设定的按揭贷款成数上限，居民首套最高80%，非居民首套最高50%，期房通常更低，因此期房需要更多自有资金。若需在交房前退出，在支付开发商要求的最低比例（通常约30-40%）并取得无异议证书后可以转让合同。",
    costsTitle: "迪拜购房成本与持有费用",
    costsIntro: "4%的DLD过户费只是标题，实际全部登记成本更高。请把这些费用与房价及付款计划分开预算。",
    costsHead: ["费用项", "金额", "支付时点"],
    costsRows: [
      ["DLD过户费", "房价的4%", "过户时；期房为Oqood登记时"],
      ["受托登记处费用", "约4,000迪拉姆", "过户时"],
      ["房产证签发费", "540迪拉姆", "过户时"],
      ["中介佣金", "房价的2%加5%增值税", "过户时"],
      ["按揭登记费", "贷款金额的0.25%加290迪拉姆", "过户时，仅按揭交易"],
      ["全部交易成本", "全款约5.5%，按揭约6.5%", "在房价之外预算"],
      ["物业费", "每平方英尺每年10-30迪拉姆", "每年，自交房起"],
    ],
    plansTitle: "构建迪拜投资的三种方式",
    plans: [
      { name: "收益型", fee: "现房，首个租约即收租", features: ["已竣工、带房产证的房源", "JVC、Business Bay等中端社区", "全市平均毛回报率约4.7%", "净回报率通常为毛回报率的75-85%", "Ejari登记与租客安置由我们处理"] },
      { name: "增值型", fee: "期房，分期付款，资本增值", features: ["开发商施工期付款计划", "定价通常比竣工后预期价值低15-25%", "部分项目提供交房后付款计划", "分期款项存放于DLD托管账户", "可对接Emaar、DAMAC、Sobha、Nakheel、Meraas和Aldar新盘"] },
      { name: "居留型", fee: "200万迪拉姆起的黄金签证合格购房", features: ["200万迪拉姆起的合格房产", "10年可续签阿联酋居留权", "配偶与子女可一并申请", "一套200万迪拉姆，或两套各100万迪拉姆合并计算", "按揭购房的自有权益不低于100万迪拉姆"] },
    ],
    whyTitle: "为什么通过Binayah投资",
    whyPoints: [
      { title: "自2007年扎根迪拜", body: "在同一个市场经历多个周期的19年以上经验，而非追逐新盘的短期玩家。" },
      { title: "RERA认证，编号1162", body: "由迪拜土地局下属房地产监管局颁发牌照，每笔交易均由RERA认证经纪人经手。" },
      { title: "3,000+在售房源", body: "覆盖迪拜永久产权社区的期房与现房，选房范围不局限于某一家开发商的库存。" },
      { title: "开发商直连", body: "在发售日即可对接Emaar、DAMAC、Sobha、Nakheel、Meraas和Aldar的房源，包括付款条件。" },
      { title: "先看数字，再谈故事", body: "我们针对具体房源测算毛回报率、净回报率和全部成本，数字不合适时会直接告诉您。" },
      { title: "全流程服务", body: "选房、DLD登记、按揭引荐、黄金签证材料、出租、托管以及日后转售。" },
    ],
    linksTitle: "开始您的调研",
    linksSubtitle: "浏览市场",
    guidesSubtitle: "投资指南",
    siteLinkLabels: ["期房项目", "热门期房项目", "在售房源", "迪拜社区", "开发商", "黄金签证", "市场报告", "免费房产估值", "迪拜房产中介公司", "迪拜房产经纪", "联系顾问"],
    guideLinkLabels: ["租金回报率详解", "高回报率区域", "迪拜房产ROI", "期房与二手房对比", "期房付款计划", "期房转让与转售", "DLD费用详解", "物业费详解", "黄金签证流程", "永久产权与租赁产权", "2026迪拜市场展望", "迪拜物业管理", "房东检查清单"],
    faqTitle: "常见问题解答",
    faqs: [
      { question: "迪拜房产是好的投资吗？", answer: "迪拜房产适合追求租金收入、资本增值或居留权的投资者。外国人可在指定永久产权区域完全持有房产，产权登记在DLD签发且不设期限的房产证上。阿联酋不征收年度房产税、资本利得税和租金所得税，因此业主拿到的租金比多数全球市场更多。全市平均毛租金回报率约为4.7%。与任何市场一样，回报取决于具体房源、社区和买入价格，因此请在下定之前测算数字。" },
      { question: "在迪拜能获得多少租金回报率？", answer: "全市平均毛租金回报率约为4.7%，区间从顶级区域的约4.5%到高回报社区的约8.5%。Jumeirah Village Circle约为7.2-8.5%毛回报率，因为价格较低，约每平方英尺700-900迪拉姆，而该类资产的租金表现强劲。Business Bay约为6.2-7.1%。Palm Jumeirah和Dubai Marina等高端海滨约为4.5-6%，买入主要是为了增值。扣除物业费、空置期、维护和管理后的净回报率通常为毛回报率的75-85%。" },
      { question: "在迪拜投资房产需要多少钱？", answer: "没有统一的入场价，但交易成本要与房价分开预算：全款交易约为房价的5.5%，按揭交易约6.5%。其中包括4%的DLD过户费、约4,000迪拉姆的受托登记处费用、540迪拉姆的房产证费、2%加5%增值税的中介佣金，按揭交易还有贷款金额0.25%加290迪拉姆的按揭登记费。阿联酋央行设定的贷款成数上限为居民首套最高80%、非居民首套最高50%。期房可降低起步资金：先付订金，余款按施工节点分期。" },
      { question: "迪拜的期房和现房哪个更好？", answer: "取决于您要增值还是要收益。期房定价通常比竣工后预期市场价低15-25%，并在施工期分期支付，但收入要到交房后才开始，主要风险是交付时间。二手市场的现房可立即取得房产证和租金收入，但全款在过户时到期。期房约占迪拜在售房源的72%。如果可能需要在交房前退出，在支付开发商要求的最低比例（通常约30-40%）并取得无异议证书后可以转让合同。" },
      { question: "如何在迪拜购买期房？", answer: "先确定预算和策略；先选开发商再选项目，核查其交付记录和DLD托管账户；支付订金锁定房源；随后签署买卖合同（SPA），逐条阅读付款计划。4%的DLD登记费通常在购买时支付以完成Oqood登记。之后在施工期分期付款，常见结构为施工期60%、交房时40%，交房后付款方案会把最后一笔的一部分转为拿到钥匙之后的分期。交房时进行验房，Oqood随后转换为房产证。" },
      { question: "外国人可以在迪拜买房吗？", answer: "可以。在迪拜指定的永久产权区域，外国人可完全且永久地拥有房产，姓名登记在迪拜土地局签发的房产证上。该产权不设期限，并包含出售、出租和继承的权利。在这些区域之外，租赁产权授予长期但有期限的使用权，通常最长99年，期满后权利回归产权所有人。请在依赖之前确认具体房源的产权性质，尤其当居留权是您购房动机之一时。" },
      { question: "申请黄金签证需要购买多少金额的房产？", answer: "不低于200万迪拉姆的房产投资即可申请10年可续签的阿联酋黄金签证。可以是一套200万迪拉姆的房产，也可以是两套各100万迪拉姆的房产合并在一份申请中。按揭房产和期房在满足200万迪拉姆门槛以及银行或开发商条件的前提下也可符合资格，按揭购房时您的自有权益须不低于100万迪拉姆。该价值必须是登记在您名下、有房产证的DLD真实权益。配偶和子女可一并申请，满十年续签时只需仍持有合格房产。" },
      { question: "在迪拜持有房产有哪些持续费用？", answer: "主要的经常性支出是支付给业主协会的物业费，通常为每平方英尺每年10-30迪拉姆，配套丰富的高层塔楼和海滨社区处于该区间上端。此外还有维护费、若非自管则有管理费，以及租客更替期间的合理空置准备金。Ejari租约登记每份约220迪拉姆。阿联酋没有年度房产税、资本利得税和租金所得税，因此物业费和运营成本才是决定您净回报率的数字。" },
    ],
    ctaTitle: "构建您的迪拜投资组合",
    ctaDesc: "告诉我们您的预算，以及您是为收益、增值还是居留而买。我们会回复一份精选清单和每套房源的测算数字，而不是一本宣传册。",
    ctaBtn: "咨询顾问",
    ctaWhatsApp: "WhatsApp咨询",
    breadcrumbs: ["首页", "服务", "房产投资"],
  },

  fr: {
    metaTitle: "Investissement immobilier à Dubaï | Investir dans l'immobilier à Dubaï | Binayah",
    metaDesc: "L'investissement immobilier à Dubaï expliqué : VEFA ou seconde main, plans de paiement, rendements locatifs, zones freehold, seuil Golden Visa de 2 M AED, frais DLD et charges. Certifié RERA depuis 2007.",
    heroLabel: "INVESTISSEMENT IMMOBILIER",
    h1: "Investissement immobilier à Dubaï",
    heroDesc: "Achetez à Dubaï pour des revenus locatifs, une plus-value ou une résidence de 10 ans. Binayah est une agence de Dubaï certifiée RERA depuis 2007, avec plus de 3 000 annonces actives et un accès direct aux lancements d'Emaar, DAMAC, Sobha, Nakheel, Meraas et Aldar.",
    heroCta: "Parler à un conseiller en investissement",
    stats: [
      { n: "19+", label: "Ans dans l'immobilier à Dubaï" },
      { n: "3 000+", label: "Annonces actives" },
      { n: "RERA", label: "Certifié, ORN 1162" },
      { n: "2 M AED", label: "Seuil Golden Visa" },
    ],
    answerTitle: "Qu'est-ce que l'investissement immobilier à Dubaï ?",
    answerBody: [
      "Investir dans l'immobilier à Dubaï consiste à acheter un bien résidentiel ou commercial pour percevoir des revenus locatifs, réaliser une plus-value, ou les deux. Les étrangers peuvent détenir un bien en pleine propriété dans les zones freehold désignées de Dubaï, la propriété étant inscrite sur un titre de propriété délivré par le Dubai Land Department (DLD). Les Émirats ne prélèvent ni taxe foncière annuelle, ni impôt sur les plus-values, ni impôt sur les revenus locatifs : le loyer parvient au propriétaire plus directement que sur la plupart des marchés mondiaux.",
      "Le rendement locatif brut moyen à l'échelle de la ville est d'environ 4,7 %, les quartiers de milieu de gamme se situant au-dessus de cette ligne et le front de mer haut de gamme en dessous. Prévoyez environ 5,5 % du prix d'achat en frais de transaction pour un achat comptant et environ 6,5 % pour un achat financé, en plus du prix lui-même. Un achat d'au moins 2 millions AED en bien éligible enregistré au DLD ouvre également droit à un Golden Visa de 10 ans renouvelable.",
    ],
    servicesTitle: "Ce que couvre notre service d'investissement",
    services: [
      { icon: "🎯", title: "Stratégie et objectifs", body: "Revenu, croissance ou résidence. Nous fixons l'objectif d'abord, car le bien le plus rentable et le bien qui s'apprécie le plus sont rarement le même bien." },
      { icon: "🏗️", title: "Sourcing en VEFA", body: "Accès direct aux lancements d'Emaar, DAMAC, Sobha, Nakheel, Meraas et Aldar, y compris les plans de paiement pendant la construction et après la livraison." },
      { icon: "🔑", title: "Acquisition dans l'ancien", body: "Biens achevés et titrés parmi nos 3 000+ annonces actives dans les communautés freehold de Dubaï, avec des revenus dès le premier bail." },
      { icon: "📊", title: "Modélisation du rendement et des coûts", body: "Rendement brut, rendement net après charges et vacance, et coût total de la transaction, calculés sur le bien réel et non sur un chiffre d'accroche." },
      { icon: "🛂", title: "Structuration Golden Visa", body: "Structurer l'achat pour que la valeur enregistrée à votre nom dépasse sans ambiguïté le seuil de 2 millions AED." },
      { icon: "🔁", title: "Sortie et revente", body: "Cession du contrat en VEFA avec un NOC du promoteur, ou revente d'un bien achevé via le DLD. Nous planifions la sortie avant l'entrée." },
    ],
    optionsTitle: "Les options d'investissement immobilier à Dubaï",
    optionsIntro: "Il existe six grandes façons d'investir dans l'immobilier à Dubaï. Elles diffèrent par la mise de départ, le moment où les revenus commencent et l'endroit où se situe le risque.",
    optionsHead: ["Option", "Fonctionnement", "Convient à", "Point de vigilance"],
    optionsRows: [
      ["VEFA (sur plan)", "Achat auprès du promoteur avant l'achèvement, avec un plan de paiement échelonné.", "Plus-value avec une mise de départ réduite.", "Les promoteurs positionnent généralement le sur plan 15-25 % sous la valeur de marché projetée après achèvement ; le principal risque est le délai de livraison."],
      ["Prêt / seconde main", "Achat d'un bien achevé et titré sur le marché de la revente.", "Des revenus dès le premier jour.", "Le prix intégral est exigible au transfert : il faut la somme entière ou un crédit."],
      ["Location longue durée", "Détention d'un bien prêt sous bail Ejari enregistré de 12 mois.", "Un revenu annuel régulier.", "Le rendement brut moyen à l'échelle de la ville est d'environ 4,7 % ; le net représente généralement 75-85 % du brut."],
      ["Location courte durée", "Location saisonnière autorisée d'un bien meublé.", "Un revenu brut plus élevé dans les quartiers touristiques.", "Coûts d'exploitation et gestion plus lourds, et une occupation qui suit la saison."],
      ["Cession en VEFA", "Revente du contrat à un nouvel acquéreur avant la livraison.", "Une détention plus courte, sans attendre l'achèvement.", "Les promoteurs exigent généralement 30-40 % du prix déjà payés, plus un certificat de non-objection (NOC)."],
      ["Achat Golden Visa", "Achat d'un bien éligible à 2 millions AED ou plus.", "Une résidence émirienne de 10 ans renouvelable.", "La valeur doit correspondre à des fonds propres réels, titrés et enregistrés au DLD à votre nom."],
    ],
    areasTitle: "Les meilleurs quartiers où investir à Dubaï",
    areasIntro: "Rendement et plus-value tirent dans des directions opposées. Les communautés abordables à forte demande produisent les rendements bruts les plus élevés ; les adresses prime rares produisent la plus forte appréciation.",
    areasHead: ["Communauté", "Profil", "Rendement brut indicatif", "Acheter pour"],
    areasRows: [
      ["Jumeirah Village Circle", "Appartements de milieu de gamme, vivier de locataires profond et liquide, forte offre à venir.", "7,2-8,5 %", "Le revenu"],
      ["Business Bay", "Tours en position centrale ; loyers absolus plus élevés, mais prix plus élevés aussi.", "6,2-7,1 %", "Revenu et croissance"],
      ["Dubai Marina", "Front de mer établi, forte liquidité à la revente.", "4,5-6 %", "Croissance et liquidité"],
      ["Palm Jumeirah", "Front de mer prime et rare ; un foncier non reproductible.", "4,5-6 %", "La plus-value"],
      ["Dubai South", "Corridor de croissance autour de l'aéroport Al Maktoum, parmi les prix au pied carré les plus accessibles de Dubaï.", "Au-dessus de la moyenne de la ville", "Le revenu, profil de quartier émergent"],
      ["Discovery Gardens / International City", "Parc mature et abordable, offre neuve limitée et locataires de longue durée.", "Au-dessus de la moyenne de la ville", "Le revenu avant tout"],
    ],
    areasNote: "Repères : le rendement locatif brut moyen à l'échelle de la ville est d'environ 4,7 % et le prix de vente moyen d'environ 1 879 AED le pied carré. Le front de mer prime rend généralement moins que la moyenne de la ville et s'achète pour la plus-value, pas pour le cash-flow. Le consensus des analystes pour 2026-2028 table sur 5-12 % d'appréciation annuelle dans certains segments.",
    yieldTitle: "Quel rendement locatif peut-on obtenir à Dubaï ?",
    yieldIntro: "Le rendement locatif brut moyen à l'échelle de la ville est d'environ 4,7 %. La fourchette va d'environ 4,5 % dans les quartiers prime à environ 8,5 % dans les communautés à haut rendement comme JVC. Le brut n'est pas ce que vous conservez.",
    yieldHead: ["Indicateur", "Signification", "Ordre de grandeur à Dubaï"],
    yieldRows: [
      ["Rendement brut", "Loyer annuel divisé par le prix d'achat.", "Environ 4,7 % à l'échelle de la ville ; d'environ 4,5 % en prime à 8,5 % en haut rendement"],
      ["Rendement net", "Le brut moins charges, vacance, entretien et gestion.", "Généralement 75-85 % du brut"],
      ["Charges de copropriété", "Payées par pied carré et par an à l'association des propriétaires.", "10-30 AED par pied carré et par an"],
      ["Enregistrement Ejari", "Enregistrement obligatoire du bail auprès du DLD.", "Environ 220 AED"],
      ["Impôt sur les revenus locatifs", "Les Émirats ne prélèvent ni taxe foncière annuelle, ni impôt sur les plus-values, ni impôt sur les loyers.", "0 %"],
    ],
    yieldNote: "Demandez à tout agent le rendement net, pas le brut. S'il ne peut pas vous indiquer le montant des charges au pied carré pour l'immeuble, il ne connaît pas encore le vrai chiffre.",
    offplanTitle: "Comment acheter sur plan à Dubaï",
    offplanIntro: "Le sur plan représente environ 72 % des annonces à Dubaï : c'est le marché principal, pas une niche. Le processus se déroule en sept étapes.",
    offplanSteps: [
      { n: "1", title: "Fixer le budget et la stratégie", body: "Décidez si vous achetez pour le revenu, la croissance ou la résidence, et ajoutez les frais de transaction au prix : environ 5,5 % au comptant, 6,5 % avec un financement." },
      { n: "2", title: "Sélectionner le promoteur avant le projet", body: "Pesez l'historique de livraison du promoteur autant que les conditions affichées, et vérifiez le compte séquestre du projet auprès du DLD." },
      { n: "3", title: "Réserver le lot", body: "Signez le formulaire de réservation et versez l'acompte pour retirer le bien du marché." },
      { n: "4", title: "Signer le SPA", body: "Lisez l'échéancier ligne par ligne. Privilégiez les échéances liées aux jalons de construction plutôt qu'à de simples dates." },
      { n: "5", title: "Enregistrer auprès du DLD (Oqood)", body: "Les frais d'enregistrement DLD de 4 % sont normalement réglés au moment de l'achat pour enregistrer l'Oqood. Quand un promoteur annonce « frais DLD offerts », cela signifie en général qu'il les absorbe, non qu'ils ne sont pas dus." },
      { n: "6", title: "Payer les échéances pendant la construction", body: "Une structure courante prévoit 60 % pendant la construction et 40 % à la livraison. Une variante post-livraison décale une partie de cette dernière tranche en mensualités après la remise des clés." },
      { n: "7", title: "Livraison, réserves et titre de propriété", body: "Inspectez le bien et relevez les réserves à la livraison, puis l'enregistrement Oqood se convertit en titre de propriété à votre nom." },
    ],
    offplanNote: "Les plafonds de financement fixés par la Banque centrale des Émirats atteignent 80 % pour les résidents et 50 % pour les non-résidents sur un premier bien, et sont généralement plus bas en VEFA : prévoyez d'apporter davantage de fonds propres. Si vous devez sortir avant la livraison, une cession est possible une fois payée la part minimale exigée par le promoteur, souvent 30-40 %, et obtenu un certificat de non-objection.",
    costsTitle: "Coûts d'acquisition et charges récurrentes à Dubaï",
    costsIntro: "Les 4 % de frais de transfert du DLD sont l'affiche, mais le coût réel tout compris de l'enregistrement est plus élevé. Budgétez-les séparément du prix et du plan de paiement.",
    costsHead: ["Poste", "Montant", "Exigibilité"],
    costsRows: [
      ["Frais de transfert DLD", "4 % du prix d'achat", "Au transfert, ou à l'enregistrement Oqood en VEFA"],
      ["Frais de trustee / enregistrement", "Environ 4 000 AED", "Au transfert"],
      ["Émission du titre de propriété", "540 AED", "Au transfert"],
      ["Commission d'agence", "2 % du prix plus 5 % de TVA", "Au transfert"],
      ["Enregistrement de l'hypothèque", "0,25 % du montant du prêt plus 290 AED", "Au transfert, achats financés uniquement"],
      ["Coût total de transaction", "Environ 5,5 % au comptant, environ 6,5 % avec financement", "À prévoir en plus du prix d'achat"],
      ["Charges de copropriété", "10-30 AED par pied carré et par an", "Chaque année, à partir de la livraison"],
    ],
    plansTitle: "Trois façons de structurer un investissement à Dubaï",
    plans: [
      { name: "Revenu", fee: "Biens prêts, loyer dès le premier bail", features: ["Biens achevés et titrés", "Communautés de milieu de gamme comme JVC et Business Bay", "Rendement brut moyen de la ville autour de 4,7 %", "Rendement net généralement 75-85 % du brut", "Enregistrement Ejari et recherche de locataire pris en charge"] },
      { name: "Croissance", fee: "VEFA, paiements échelonnés, plus-value", features: ["Plans de paiement du promoteur pendant la construction", "Positionné en général 15-25 % sous la valeur projetée après achèvement", "Plans post-livraison disponibles sur certains projets", "Échéances déposées sur un compte séquestre DLD", "Accès aux lancements Emaar, DAMAC, Sobha, Nakheel, Meraas et Aldar"] },
      { name: "Résidence", fee: "Achat éligible Golden Visa à partir de 2 M AED", features: ["Bien éligible à partir de 2 millions AED", "Résidence émirienne de 10 ans renouvelable", "Conjoint et enfants inclus dans la demande", "Un bien à 2 M AED, ou deux à 1 M AED cumulés", "Achat financé : au moins 1 M AED de fonds propres"] },
    ],
    whyTitle: "Pourquoi investir avec Binayah",
    whyPoints: [
      { title: "Agence à Dubaï depuis 2007", body: "Plus de 19 ans sur le même marché, à travers plusieurs cycles, et non une activité qui saute d'un lancement à l'autre." },
      { title: "Certifié RERA, ORN 1162", body: "Agréé par l'agence de régulation immobilière du Dubai Land Department, avec des agents certifiés RERA sur chaque transaction." },
      { title: "Plus de 3 000 annonces actives", body: "Sur plan et biens prêts dans les communautés freehold de Dubaï : la sélection ne se limite pas au stock d'un seul promoteur." },
      { title: "Accès direct aux promoteurs", body: "Accès dès le jour du lancement aux sorties Emaar, DAMAC, Sobha, Nakheel, Meraas et Aldar, conditions de paiement comprises." },
      { title: "Les chiffres avant le discours", body: "Nous modélisons rendement brut, rendement net et coût total sur le bien précis que vous regardez, et vous disons quand les chiffres ne tiennent pas." },
      { title: "De bout en bout", body: "Sélection, enregistrement DLD, mise en relation bancaire, dossier Golden Visa, mise en location, gestion et revente le moment venu." },
    ],
    linksTitle: "Commencez vos recherches",
    linksSubtitle: "Explorer le marché",
    guidesSubtitle: "Guides d'investissement",
    siteLinkLabels: ["Projets sur plan", "Meilleurs projets sur plan", "Biens à vendre", "Communautés de Dubaï", "Promoteurs", "Golden Visa", "Rapports de marché", "Estimation gratuite", "Agence immobilière à Dubaï", "Courtier immobilier à Dubaï", "Contacter un conseiller"],
    guideLinkLabels: ["Le rendement locatif expliqué", "Meilleurs quartiers à haut rendement", "ROI immobilier à Dubaï", "Sur plan ou seconde main", "Plans de paiement en VEFA", "Cession et revente en VEFA", "Les frais DLD expliqués", "Les charges expliquées", "Procédure Golden Visa", "Freehold ou leasehold", "Perspectives du marché 2026", "La gestion locative à Dubaï", "Checklist du propriétaire bailleur"],
    faqTitle: "Questions fréquentes",
    faqs: [
      { question: "L'immobilier à Dubaï est-il un bon investissement ?", answer: "L'immobilier à Dubaï convient aux investisseurs qui recherchent un revenu locatif, une plus-value ou une résidence. Les étrangers peuvent détenir en pleine propriété dans les zones freehold désignées, la propriété étant inscrite sur un titre DLD qui n'expire pas. Les Émirats ne prélèvent ni taxe foncière annuelle, ni impôt sur les plus-values, ni impôt sur les revenus locatifs, si bien qu'une part plus importante du loyer revient au propriétaire que sur la plupart des marchés mondiaux. Le rendement locatif brut moyen à l'échelle de la ville est d'environ 4,7 %. Comme sur tout marché, le résultat dépend du bien, du quartier et du prix payé : modélisez les chiffres avant de vous engager." },
      { question: "Quel rendement locatif peut-on obtenir à Dubaï ?", answer: "Le rendement locatif brut moyen à l'échelle de la ville est d'environ 4,7 %. La fourchette va d'environ 4,5 % dans les quartiers prime à environ 8,5 % dans les communautés à haut rendement. Jumeirah Village Circle se situe autour de 7,2-8,5 % brut, parce que les prix y sont bas, environ 700-900 AED le pied carré, tandis que les loyers restent solides pour cette catégorie d'actifs. Business Bay tourne autour de 6,2-7,1 %. Le front de mer haut de gamme, comme Palm Jumeirah et Dubai Marina, rend environ 4,5-6 % et s'achète surtout pour la plus-value. Le rendement net, après charges, vacance, entretien et gestion, représente généralement 75-85 % du brut." },
      { question: "Quel budget faut-il pour investir dans l'immobilier à Dubaï ?", answer: "Il n'y a pas de ticket d'entrée unique, mais budgétez les frais de transaction séparément du prix : environ 5,5 % du prix d'achat au comptant et environ 6,5 % avec un financement. Cela couvre les 4 % de frais de transfert DLD, des frais de trustee d'environ 4 000 AED, le titre de propriété à 540 AED, la commission d'agence de 2 % plus 5 % de TVA et, pour les achats financés, l'enregistrement de l'hypothèque à 0,25 % du prêt plus 290 AED. Les plafonds de financement fixés par la Banque centrale des Émirats atteignent 80 % pour les résidents et 50 % pour les non-résidents sur un premier bien. La VEFA réduit la mise de départ : vous versez un acompte de réservation, puis échelonnez le solde pendant la construction." },
      { question: "Vaut-il mieux acheter sur plan ou dans l'ancien à Dubaï ?", answer: "Cela dépend si vous visez la croissance ou le revenu. Le sur plan est généralement positionné 15-25 % sous la valeur de marché projetée après achèvement et se paie par échéances pendant la construction, mais les revenus ne commencent qu'après la livraison et le principal risque porte sur les délais. Un bien prêt sur le marché de la revente vous donne immédiatement un titre de propriété et un revenu locatif, mais le prix intégral est exigible au transfert. Le sur plan représente environ 72 % des annonces à Dubaï. Si vous risquez de devoir sortir avant la livraison, vous pouvez céder le contrat une fois payée la part minimale exigée par le promoteur, souvent 30-40 %, et obtenu un certificat de non-objection." },
      { question: "Comment acheter un bien sur plan à Dubaï ?", answer: "Fixez votre budget et votre stratégie, sélectionnez le promoteur avant le projet en vérifiant son historique de livraison et le compte séquestre DLD, réservez le lot avec un acompte, puis signez le contrat de vente (SPA) en lisant l'échéancier ligne par ligne. Les 4 % d'enregistrement DLD sont normalement réglés au moment de l'achat pour enregistrer l'Oqood. Vous payez ensuite les échéances pendant la construction, une structure courante étant 60 % pendant les travaux et 40 % à la livraison, les variantes post-livraison décalant une partie de la dernière tranche après la remise des clés. À la livraison, vous relevez les réserves et l'Oqood se convertit en titre de propriété." },
      { question: "Les étrangers peuvent-ils acheter à Dubaï ?", answer: "Oui. Dans les zones freehold désignées de Dubaï, les ressortissants étrangers peuvent détenir un bien en pleine propriété, de façon permanente, avec leur nom inscrit sur un titre délivré par le Dubai Land Department. Cette propriété n'expire pas et emporte le droit de vendre, de louer et de léguer le bien. En dehors de ces zones, le leasehold accorde un droit d'usage pour une durée longue mais finie, couramment jusqu'à 99 ans, au terme de laquelle les droits reviennent au propriétaire du foncier. Vérifiez le régime de propriété du bien précis avant de compter dessus, surtout si la résidence fait partie de vos motivations." },
      { question: "Quel montant faut-il acheter pour un Golden Visa ?", answer: "Un investissement immobilier d'au moins 2 millions AED vous rend éligible à un Golden Visa émirien de 10 ans, renouvelable. Il peut s'agir d'un bien à 2 millions AED ou de deux biens à 1 million AED chacun, cumulés sur une même demande. Les biens financés et en VEFA peuvent être éligibles dès lors que le seuil de 2 millions AED et les conditions du prêteur ou du promoteur sont respectés, et pour un achat financé vos fonds propres doivent atteindre au moins 1 million AED. La valeur doit correspondre à des fonds propres réels, titrés et enregistrés au DLD à votre nom. Le conjoint et les enfants peuvent être inclus, et le renouvellement à dix ans exige seulement que vous déteniez toujours un bien éligible." },
      { question: "Quels sont les coûts récurrents d'un bien à Dubaï ?", answer: "Le principal coût récurrent est la charge de copropriété versée à l'association des propriétaires, généralement 10-30 AED par pied carré et par an, les tours très équipées et les communautés de front de mer se situant en haut de cette fourchette. Ajoutez l'entretien, des honoraires de gestion si vous ne gérez pas vous-même, et une provision réaliste pour vacance entre deux locataires. L'enregistrement Ejari du bail coûte environ 220 AED par contrat. Il n'existe aux Émirats ni taxe foncière annuelle, ni impôt sur les plus-values, ni impôt sur les revenus locatifs : ce sont donc les charges et les coûts d'exploitation qui déterminent votre rendement net." },
    ],
    ctaTitle: "Construisez votre portefeuille à Dubaï",
    ctaDesc: "Dites-nous votre budget et si vous achetez pour le revenu, la croissance ou la résidence. Nous revenons vers vous avec une sélection et les chiffres modélisés bien par bien, pas avec une brochure.",
    ctaBtn: "Parler à un conseiller",
    ctaWhatsApp: "Écrivez-nous sur WhatsApp",
    breadcrumbs: ["Accueil", "Services", "Investissement immobilier"],
  },

  vi: {
    metaTitle: "Đầu tư bất động sản Dubai | Đầu tư nhà đất tại Dubai | Binayah",
    metaDesc: "Đầu tư bất động sản Dubai: dự án hình thành trong tương lai và thứ cấp, kế hoạch thanh toán, lợi suất cho thuê, khu sở hữu vĩnh viễn, ngưỡng Golden Visa 2 triệu AED, phí DLD và phí dịch vụ. Chứng nhận RERA từ 2007.",
    heroLabel: "ĐẦU TƯ BẤT ĐỘNG SẢN",
    h1: "Đầu tư bất động sản Dubai",
    heroDesc: "Mua bất động sản Dubai để lấy thu nhập cho thuê, tăng giá vốn hoặc thường trú 10 năm. Binayah là môi giới được RERA chứng nhận tại Dubai từ năm 2007, với hơn 3.000 tin đăng đang hoạt động và quyền tiếp cận trực tiếp các đợt mở bán của Emaar, DAMAC, Sobha, Nakheel, Meraas và Aldar.",
    heroCta: "Trao đổi với chuyên viên đầu tư",
    stats: [
      { n: "19+", label: "Năm trong ngành BĐS Dubai" },
      { n: "3.000+", label: "Tin đăng đang hoạt động" },
      { n: "RERA", label: "Chứng nhận, ORN 1162" },
      { n: "2 triệu AED", label: "Ngưỡng Golden Visa" },
    ],
    answerTitle: "Đầu tư bất động sản Dubai là gì?",
    answerBody: [
      "Đầu tư bất động sản Dubai là việc mua bất động sản nhà ở hoặc thương mại tại Dubai để thu tiền cho thuê, hưởng tăng giá vốn, hoặc cả hai. Người nước ngoài có thể sở hữu toàn phần tại các khu sở hữu vĩnh viễn (freehold) được chỉ định của Dubai, quyền sở hữu được ghi nhận trên sổ đỏ do Sở Đất đai Dubai (DLD) cấp. UAE không đánh thuế bất động sản hằng năm, không thuế lãi vốn và không thuế thu nhập trên tiền cho thuê, nên tiền thuê đến tay chủ sở hữu trực tiếp hơn hầu hết các thị trường lớn khác.",
      "Lợi suất cho thuê gộp trung bình toàn thành phố vào khoảng 4,7%, các khu trung cấp cao hơn mức này còn khu ven biển cao cấp thấp hơn. Hãy dự trù khoảng 5,5% giá mua cho chi phí giao dịch khi trả bằng tiền mặt và khoảng 6,5% khi vay ngân hàng, ngoài giá bất động sản. Việc mua bất động sản đủ điều kiện từ 2 triệu AED trở lên và đã đăng ký tại DLD cũng giúp người mua đủ điều kiện xin Golden Visa 10 năm có thể gia hạn.",
    ],
    servicesTitle: "Dịch vụ đầu tư của chúng tôi bao gồm",
    services: [
      { icon: "🎯", title: "Chiến lược và mục tiêu", body: "Thu nhập, tăng giá hay thường trú. Chúng tôi xác định mục tiêu trước, vì bất động sản cho lợi suất cao nhất và bất động sản tăng giá mạnh nhất hiếm khi là cùng một căn." },
      { icon: "🏗️", title: "Nguồn hàng dự án mới", body: "Tiếp cận trực tiếp các đợt mở bán của Emaar, DAMAC, Sobha, Nakheel, Meraas và Aldar, bao gồm kế hoạch thanh toán trong quá trình xây dựng và sau bàn giao." },
      { icon: "🔑", title: "Mua nhà sẵn và thứ cấp", body: "Căn hộ đã hoàn thiện, có sổ, trong hơn 3.000 tin đăng đang hoạt động tại các cộng đồng freehold của Dubai, có thu nhập ngay từ hợp đồng thuê đầu tiên." },
      { icon: "📊", title: "Mô hình lợi suất và chi phí", body: "Lợi suất gộp, lợi suất ròng sau phí dịch vụ và thời gian trống, cùng tổng chi phí giao dịch, tính trên chính căn hộ đó chứ không phải con số quảng cáo." },
      { icon: "🛂", title: "Cấu trúc cho Golden Visa", body: "Sắp xếp giao dịch sao cho giá trị đăng ký đứng tên bạn vượt rõ ràng ngưỡng 2 triệu AED." },
      { icon: "🔁", title: "Thoát vốn và bán lại", body: "Chuyển nhượng hợp đồng dự án với NOC của chủ đầu tư, hoặc bán lại căn đã hoàn thiện qua DLD. Chúng tôi hoạch định lối ra trước khi bạn vào." },
    ],
    optionsTitle: "Các phương án đầu tư bất động sản Dubai",
    optionsIntro: "Có sáu cách chính để đầu tư bất động sản Dubai. Chúng khác nhau ở lượng tiền cần có ban đầu, thời điểm bắt đầu có thu nhập và nơi rủi ro nằm ở đâu.",
    optionsHead: ["Phương án", "Cách vận hành", "Phù hợp với", "Điểm cần lưu ý"],
    optionsRows: [
      ["Dự án hình thành trong tương lai", "Mua từ chủ đầu tư trước khi hoàn thành theo kế hoạch thanh toán theo đợt.", "Tăng giá vốn với ít tiền mặt ban đầu.", "Chủ đầu tư thường định giá thấp hơn 15-25% so với giá thị trường dự kiến sau khi hoàn thành; rủi ro chính là thời điểm bàn giao."],
      ["Nhà sẵn / thứ cấp", "Mua căn đã hoàn thiện, có sổ, trên thị trường bán lại.", "Có thu nhập ngay từ ngày đầu.", "Toàn bộ giá trị đến hạn khi sang tên, cần đủ tiền hoặc khoản vay."],
      ["Mua cho thuê dài hạn", "Giữ căn nhà sẵn với hợp đồng Ejari 12 tháng đã đăng ký.", "Thu nhập hằng năm ổn định.", "Lợi suất gộp trung bình toàn thành phố khoảng 4,7%; lợi suất ròng thường bằng 75-85% lợi suất gộp."],
      ["Cho thuê ngắn hạn", "Cho thuê căn hộ đầy đủ nội thất dạng nhà nghỉ dưỡng có giấy phép.", "Thu nhập gộp cao hơn ở khu du lịch.", "Chi phí vận hành và quản lý cao hơn, tỷ lệ lấp đầy dao động theo mùa."],
      ["Chuyển nhượng hợp đồng", "Bán hợp đồng cho người mua mới trước khi bàn giao.", "Thời gian nắm giữ ngắn hơn, không phải chờ hoàn thành.", "Chủ đầu tư thường yêu cầu đã thanh toán 30-40% giá trị, kèm giấy chứng nhận không phản đối (NOC)."],
      ["Mua để lấy Golden Visa", "Mua bất động sản đủ điều kiện từ 2 triệu AED.", "Thường trú UAE 10 năm, có thể gia hạn.", "Giá trị phải là phần vốn thực, có sổ và đăng ký tại DLD đứng tên bạn."],
    ],
    areasTitle: "Khu vực đầu tư tốt nhất tại Dubai",
    areasIntro: "Lợi suất và tăng giá vốn kéo về hai hướng ngược nhau. Các cộng đồng giá phải chăng, nhu cầu cao cho lợi suất gộp mạnh nhất; các địa chỉ cao cấp khan hiếm cho mức tăng giá mạnh nhất.",
    areasHead: ["Cộng đồng", "Đặc điểm", "Lợi suất gộp tham khảo", "Mua vì"],
    areasRows: [
      ["Jumeirah Village Circle", "Căn hộ trung cấp, nguồn khách thuê dồi dào và thanh khoản, nguồn cung mới lớn.", "7,2-8,5%", "Thu nhập"],
      ["Business Bay", "Cao ốc trung tâm; tiền thuê tuyệt đối cao hơn nhưng giá cũng cao hơn.", "6,2-7,1%", "Thu nhập và tăng giá"],
      ["Dubai Marina", "Khu ven biển đã định hình, thanh khoản bán lại tốt.", "4,5-6%", "Tăng giá và thanh khoản"],
      ["Palm Jumeirah", "Ven biển cao cấp khan hiếm; quỹ đất không thể tái tạo.", "4,5-6%", "Tăng giá vốn"],
      ["Dubai South", "Hành lang tăng trưởng quanh sân bay quốc tế Al Maktoum, giá mỗi foot vuông thuộc nhóm dễ tiếp cận nhất Dubai.", "Trên mức trung bình toàn thành phố", "Thu nhập, đặc thù khu mới nổi"],
      ["Discovery Gardens / International City", "Quỹ nhà lâu năm, giá phải chăng, nguồn cung mới hạn chế, khách thuê ở lâu.", "Trên mức trung bình toàn thành phố", "Ưu tiên thu nhập"],
    ],
    areasNote: "Mốc tham chiếu: lợi suất cho thuê gộp trung bình toàn thành phố khoảng 4,7% và giá bán trung bình khoảng 1.879 AED mỗi foot vuông. Khu ven biển cao cấp thường có lợi suất dưới mức trung bình và được mua để tăng giá chứ không phải để lấy dòng tiền. Kỳ vọng đồng thuận của giới phân tích cho giai đoạn 2026-2028 là mức tăng giá 5-12% mỗi năm ở một số phân khúc chọn lọc.",
    yieldTitle: "Lợi suất cho thuê tại Dubai là bao nhiêu?",
    yieldIntro: "Lợi suất cho thuê gộp trung bình toàn thành phố khoảng 4,7%. Biên độ chạy từ khoảng 4,5% ở khu cao cấp đến khoảng 8,5% ở các cộng đồng lợi suất cao như JVC. Lợi suất gộp không phải là phần bạn thực nhận.",
    yieldHead: ["Chỉ số", "Ý nghĩa", "Mức phổ biến tại Dubai"],
    yieldRows: [
      ["Lợi suất gộp", "Tiền thuê một năm chia cho giá mua.", "Khoảng 4,7% toàn thành phố; từ khoảng 4,5% khu cao cấp đến 8,5% khu lợi suất cao"],
      ["Lợi suất ròng", "Lợi suất gộp trừ phí dịch vụ, thời gian trống, bảo trì và quản lý.", "Thường bằng 75-85% lợi suất gộp"],
      ["Phí dịch vụ", "Trả cho ban quản trị theo mỗi foot vuông mỗi năm.", "10-30 AED mỗi foot vuông mỗi năm"],
      ["Đăng ký Ejari", "Đăng ký hợp đồng thuê bắt buộc tại DLD.", "Khoảng 220 AED"],
      ["Thuế thu nhập cho thuê", "UAE không đánh thuế bất động sản hằng năm, thuế lãi vốn hay thuế thu nhập trên tiền thuê.", "0%"],
    ],
    yieldNote: "Hãy hỏi môi giới lợi suất ròng, không phải lợi suất gộp. Nếu họ không nói được mức phí dịch vụ mỗi foot vuông của tòa nhà, họ chưa biết con số thật.",
    offplanTitle: "Cách mua bất động sản hình thành trong tương lai tại Dubai",
    offplanIntro: "Bất động sản dự án chiếm khoảng 72% tin đăng tại Dubai, tức là dòng chính chứ không phải phân khúc ngách. Quy trình gồm bảy bước.",
    offplanSteps: [
      { n: "1", title: "Xác định ngân sách và chiến lược", body: "Quyết định bạn mua vì thu nhập, tăng giá hay thường trú, rồi cộng thêm chi phí giao dịch trên giá mua: khoảng 5,5% khi trả tiền mặt, 6,5% khi vay." },
      { n: "2", title: "Chọn chủ đầu tư trước, rồi mới chọn dự án", body: "Cân nhắc lịch sử bàn giao của chủ đầu tư nghiêm túc như cân nhắc điều khoản thanh toán, và xác minh tài khoản ký quỹ của dự án tại DLD." },
      { n: "3", title: "Giữ chỗ căn hộ", body: "Ký phiếu đặt chỗ và nộp tiền đặt cọc để rút căn hộ khỏi thị trường." },
      { n: "4", title: "Ký hợp đồng SPA", body: "Đọc lịch thanh toán từng dòng. Ưu tiên các đợt gắn với mốc thi công thay vì chỉ gắn với ngày tháng." },
      { n: "5", title: "Đăng ký với DLD (Oqood)", body: "Phí đăng ký DLD 4% thường được nộp tại thời điểm mua để đăng ký Oqood. Khi chủ đầu tư quảng cáo 'miễn phí DLD', thường có nghĩa là chủ đầu tư gánh 4% đó, chứ không phải là không có phí." },
      { n: "6", title: "Thanh toán theo tiến độ xây dựng", body: "Một cấu trúc phổ biến là 60% trong quá trình xây dựng và 40% khi bàn giao. Biến thể sau bàn giao chuyển một phần đợt cuối thành các kỳ trả góp sau khi bạn nhận chìa khóa." },
      { n: "7", title: "Bàn giao, nghiệm thu và sổ đỏ", body: "Kiểm tra và lập danh sách lỗi khi nhận nhà, sau đó đăng ký Oqood chuyển thành sổ đỏ đứng tên bạn." },
    ],
    offplanNote: "Trần cho vay trên giá trị do Ngân hàng Trung ương UAE quy định lên tới 80% cho người cư trú và 50% cho người không cư trú với bất động sản đầu tiên, và thường thấp hơn với dự án hình thành trong tương lai, nên hãy dự trù nhiều vốn tự có hơn. Nếu cần thoát trước khi bàn giao, bạn có thể chuyển nhượng sau khi đã thanh toán tỷ lệ tối thiểu chủ đầu tư yêu cầu, thường khoảng 30-40%, và có giấy chứng nhận không phản đối.",
    costsTitle: "Chi phí mua và chi phí duy trì bất động sản Dubai",
    costsIntro: "Phí chuyển nhượng DLD 4% chỉ là con số tiêu đề; tổng chi phí đăng ký thực tế cao hơn. Hãy dự trù các khoản này tách khỏi giá mua và khỏi kế hoạch thanh toán.",
    costsHead: ["Khoản chi", "Mức phí", "Thời điểm phát sinh"],
    costsRows: [
      ["Phí chuyển nhượng DLD", "4% giá mua", "Khi sang tên, hoặc khi đăng ký Oqood với dự án"],
      ["Phí trung tâm đăng ký", "Khoảng 4.000 AED", "Khi sang tên"],
      ["Phí cấp sổ đỏ", "540 AED", "Khi sang tên"],
      ["Hoa hồng môi giới", "2% giá trị cộng 5% VAT", "Khi sang tên"],
      ["Đăng ký thế chấp", "0,25% khoản vay cộng 290 AED", "Khi sang tên, chỉ với giao dịch có vay"],
      ["Tổng chi phí giao dịch", "Khoảng 5,5% khi trả tiền mặt, khoảng 6,5% khi vay", "Dự trù ngoài giá mua"],
      ["Phí dịch vụ", "10-30 AED mỗi foot vuông mỗi năm", "Hằng năm, kể từ khi bàn giao"],
    ],
    plansTitle: "Ba cách cấu trúc một khoản đầu tư tại Dubai",
    plans: [
      { name: "Thu nhập", fee: "Nhà sẵn, có tiền thuê từ hợp đồng đầu tiên", features: ["Bất động sản đã hoàn thiện, có sổ", "Cộng đồng trung cấp như JVC và Business Bay", "Lợi suất gộp trung bình toàn thành phố khoảng 4,7%", "Lợi suất ròng thường bằng 75-85% lợi suất gộp", "Đăng ký Ejari và tìm khách thuê do chúng tôi xử lý"] },
      { name: "Tăng trưởng", fee: "Dự án mới, thanh toán theo đợt, tăng giá vốn", features: ["Kế hoạch thanh toán của chủ đầu tư trong quá trình xây dựng", "Thường được định giá thấp hơn 15-25% so với giá trị dự kiến sau hoàn thành", "Một số dự án có kế hoạch trả sau bàn giao", "Các đợt thanh toán được giữ trong tài khoản ký quỹ của DLD", "Tiếp cận các đợt mở bán của Emaar, DAMAC, Sobha, Nakheel, Meraas và Aldar"] },
      { name: "Thường trú", fee: "Giao dịch đủ điều kiện Golden Visa từ 2 triệu AED", features: ["Bất động sản đủ điều kiện từ 2 triệu AED", "Thường trú UAE 10 năm, có thể gia hạn", "Vợ/chồng và con cái được đưa vào hồ sơ", "Một căn 2 triệu AED, hoặc hai căn 1 triệu AED cộng gộp", "Giao dịch có vay cần vốn tự có tối thiểu 1 triệu AED"] },
    ],
    whyTitle: "Vì sao đầu tư cùng Binayah",
    whyPoints: [
      { title: "Môi giới tại Dubai từ 2007", body: "Hơn 19 năm làm việc trên cùng một thị trường qua nhiều chu kỳ, không phải kiểu chạy theo từng đợt mở bán." },
      { title: "Chứng nhận RERA, ORN 1162", body: "Được cấp phép bởi Cơ quan Quản lý Bất động sản thuộc Sở Đất đai Dubai, với chuyên viên được RERA chứng nhận trong mọi giao dịch." },
      { title: "Hơn 3.000 tin đăng đang hoạt động", body: "Dự án mới và nhà sẵn tại các cộng đồng freehold của Dubai, nên danh sách chọn lọc không bị giới hạn trong rổ hàng của một chủ đầu tư." },
      { title: "Tiếp cận trực tiếp chủ đầu tư", body: "Tiếp cận ngay ngày mở bán các đợt hàng của Emaar, DAMAC, Sobha, Nakheel, Meraas và Aldar, kèm điều khoản thanh toán." },
      { title: "Con số trước, câu chuyện sau", body: "Chúng tôi tính lợi suất gộp, lợi suất ròng và tổng chi phí trên đúng căn hộ bạn đang xem, và nói thẳng khi các con số không hợp lý." },
      { title: "Trọn quy trình", body: "Chọn sản phẩm, đăng ký DLD, giới thiệu vay ngân hàng, hồ sơ Golden Visa, cho thuê, quản lý và bán lại sau này." },
    ],
    linksTitle: "Bắt đầu tìm hiểu",
    linksSubtitle: "Khám phá thị trường",
    guidesSubtitle: "Cẩm nang đầu tư",
    siteLinkLabels: ["Dự án mới", "Dự án mới nổi bật", "Bất động sản đang bán", "Cộng đồng Dubai", "Chủ đầu tư", "Golden Visa", "Báo cáo thị trường", "Định giá miễn phí", "Đại lý bất động sản tại Dubai", "Môi giới bất động sản tại Dubai", "Liên hệ chuyên viên"],
    guideLinkLabels: ["Giải thích lợi suất cho thuê", "Khu vực lợi suất cao", "ROI bất động sản Dubai", "Dự án mới hay thứ cấp", "Kế hoạch thanh toán dự án", "Chuyển nhượng và bán lại", "Giải thích phí DLD", "Giải thích phí dịch vụ", "Quy trình Golden Visa", "Sở hữu vĩnh viễn và thuê dài hạn", "Triển vọng thị trường 2026", "Quản lý bất động sản tại Dubai", "Danh sách kiểm tra cho chủ nhà"],
    faqTitle: "Câu hỏi thường gặp",
    faqs: [
      { question: "Bất động sản Dubai có phải khoản đầu tư tốt không?", answer: "Bất động sản Dubai phù hợp với nhà đầu tư muốn có thu nhập cho thuê, tăng giá vốn hoặc thường trú. Người nước ngoài có thể sở hữu toàn phần tại các khu freehold được chỉ định, quyền sở hữu ghi trên sổ đỏ do DLD cấp và không có thời hạn. UAE không đánh thuế bất động sản hằng năm, thuế lãi vốn hay thuế thu nhập trên tiền thuê, nên chủ sở hữu giữ lại phần tiền thuê lớn hơn so với hầu hết thị trường lớn khác. Lợi suất cho thuê gộp trung bình toàn thành phố khoảng 4,7%. Như mọi thị trường, kết quả phụ thuộc vào từng căn, từng cộng đồng và mức giá đã trả, vì vậy hãy tính toán trước khi xuống tiền." },
      { question: "Lợi suất cho thuê tại Dubai là bao nhiêu?", answer: "Lợi suất cho thuê gộp trung bình toàn thành phố khoảng 4,7%. Biên độ chạy từ khoảng 4,5% ở khu cao cấp đến khoảng 8,5% ở các cộng đồng lợi suất cao. Jumeirah Village Circle vào khoảng 7,2-8,5% gộp vì giá thấp, khoảng 700-900 AED mỗi foot vuông, trong khi tiền thuê vẫn mạnh so với phân khúc. Business Bay khoảng 6,2-7,1%. Khu ven biển cao cấp như Palm Jumeirah và Dubai Marina đạt khoảng 4,5-6% và chủ yếu được mua để tăng giá. Lợi suất ròng, sau phí dịch vụ, thời gian trống, bảo trì và quản lý, thường bằng 75-85% lợi suất gộp." },
      { question: "Cần bao nhiêu tiền để đầu tư bất động sản Dubai?", answer: "Không có một mức khởi điểm duy nhất, nhưng hãy dự trù chi phí giao dịch tách khỏi giá mua: khoảng 5,5% giá mua khi trả tiền mặt và khoảng 6,5% khi vay. Khoản này gồm phí chuyển nhượng DLD 4%, phí trung tâm đăng ký khoảng 4.000 AED, phí sổ đỏ 540 AED, hoa hồng môi giới 2% cộng 5% VAT, và với giao dịch có vay là phí đăng ký thế chấp 0,25% khoản vay cộng 290 AED. Trần cho vay trên giá trị do Ngân hàng Trung ương UAE quy định lên tới 80% cho người cư trú và 50% cho người không cư trú với bất động sản đầu tiên. Mua dự án hình thành trong tương lai giúp giảm tiền cần có lúc đầu vì bạn đặt cọc giữ chỗ rồi chia nhỏ phần còn lại theo tiến độ." },
      { question: "Nên mua dự án mới hay nhà sẵn tại Dubai?", answer: "Tùy bạn muốn tăng giá hay muốn thu nhập. Bất động sản dự án thường được định giá thấp hơn 15-25% so với giá thị trường dự kiến sau hoàn thành và trả theo đợt trong quá trình xây dựng, nhưng thu nhập chỉ bắt đầu sau bàn giao và rủi ro chính là thời điểm bàn giao. Nhà sẵn trên thị trường thứ cấp cho bạn sổ đỏ và tiền thuê ngay lập tức, nhưng toàn bộ giá trị đến hạn khi sang tên. Bất động sản dự án chiếm khoảng 72% tin đăng tại Dubai. Nếu có khả năng phải thoát trước khi bàn giao, bạn có thể chuyển nhượng hợp đồng sau khi đã trả tỷ lệ tối thiểu chủ đầu tư yêu cầu, thường khoảng 30-40%, và có giấy chứng nhận không phản đối." },
      { question: "Mua bất động sản hình thành trong tương lai tại Dubai như thế nào?", answer: "Xác định ngân sách và chiến lược; chọn chủ đầu tư trước khi chọn dự án, kiểm tra lịch sử bàn giao và tài khoản ký quỹ tại DLD; giữ chỗ căn hộ bằng tiền đặt cọc; sau đó ký hợp đồng mua bán (SPA) và đọc lịch thanh toán từng dòng. Phí đăng ký DLD 4% thường được nộp tại thời điểm mua để đăng ký Oqood. Tiếp theo bạn thanh toán theo tiến độ xây dựng, cấu trúc phổ biến là 60% trong quá trình xây dựng và 40% khi bàn giao, còn phương án sau bàn giao chuyển một phần đợt cuối thành trả góp sau khi nhận chìa khóa. Khi bàn giao bạn nghiệm thu căn hộ và Oqood chuyển thành sổ đỏ." },
      { question: "Người nước ngoài có được mua nhà tại Dubai không?", answer: "Có. Tại các khu sở hữu vĩnh viễn được chỉ định của Dubai, người nước ngoài có thể sở hữu toàn phần và vĩnh viễn, với tên ghi trên sổ đỏ do Sở Đất đai Dubai cấp. Quyền sở hữu này không hết hạn và bao gồm quyền bán, cho thuê và để lại thừa kế. Ngoài các khu đó, hình thức thuê dài hạn (leasehold) cho quyền sử dụng trong thời hạn dài nhưng hữu hạn, thường tối đa 99 năm, sau đó quyền quay về chủ sở hữu đất. Hãy xác nhận hình thức sở hữu của chính căn bạn quan tâm trước khi dựa vào nó, nhất là khi thường trú là một phần lý do bạn mua." },
      { question: "Cần mua bất động sản trị giá bao nhiêu để có Golden Visa?", answer: "Khoản đầu tư bất động sản từ 2 triệu AED trở lên giúp bạn đủ điều kiện xin Golden Visa UAE 10 năm, có thể gia hạn. Đó có thể là một bất động sản 2 triệu AED hoặc hai bất động sản mỗi căn 1 triệu AED, cộng gộp trong cùng một hồ sơ. Bất động sản có thế chấp và dự án hình thành trong tương lai vẫn có thể đủ điều kiện nếu đạt ngưỡng 2 triệu AED và thỏa mãn điều kiện của ngân hàng hoặc chủ đầu tư; với giao dịch có vay, vốn tự có của bạn phải tối thiểu 1 triệu AED. Giá trị phải là phần vốn thực, có sổ và đăng ký tại DLD đứng tên bạn. Vợ/chồng và con cái có thể được đưa vào hồ sơ, và việc gia hạn sau mười năm chỉ yêu cầu bạn vẫn sở hữu bất động sản đủ điều kiện." },
      { question: "Chi phí duy trì khi sở hữu bất động sản tại Dubai gồm những gì?", answer: "Khoản chi định kỳ chính là phí dịch vụ trả cho ban quản trị tòa nhà, thường 10-30 AED mỗi foot vuông mỗi năm, trong đó các tòa nhiều tiện ích và cộng đồng ven biển nằm ở đầu trên của biên độ. Cộng thêm chi phí bảo trì, phí quản lý nếu bạn không tự quản lý, và một khoản dự phòng hợp lý cho thời gian trống giữa các khách thuê. Đăng ký hợp đồng thuê Ejari tốn khoảng 220 AED mỗi hợp đồng. UAE không có thuế bất động sản hằng năm, thuế lãi vốn hay thuế thu nhập trên tiền thuê, nên chính phí dịch vụ và chi phí vận hành mới quyết định lợi suất ròng của bạn." },
    ],
    ctaTitle: "Xây dựng danh mục Dubai của bạn",
    ctaDesc: "Cho chúng tôi biết ngân sách của bạn và bạn mua vì thu nhập, tăng giá hay thường trú. Chúng tôi sẽ gửi lại một danh sách chọn lọc kèm các con số đã tính cho từng căn, không phải một tờ rơi quảng cáo.",
    ctaBtn: "Trao đổi với chuyên viên",
    ctaWhatsApp: "Nhắn WhatsApp",
    breadcrumbs: ["Trang chủ", "Dịch vụ", "Đầu tư bất động sản"],
  },

  he: {
    metaTitle: "השקעות נדל\"ן בדובאי | להשקיע בנדל\"ן בדובאי | Binayah",
    metaDesc: "השקעות נדל\"ן בדובאי: על הנייר מול יד שנייה, תוכניות תשלום, תשואת שכירות, אזורי בעלות מלאה, סף ויזת הזהב של 2 מיליון AED, אגרות DLD ודמי ניהול. מוסמכים RERA מאז 2007.",
    heroLabel: "השקעות נדל\"ן",
    h1: "השקעות נדל\"ן בדובאי",
    heroDesc: "רכישת נדל\"ן בדובאי להכנסה משכירות, לעליית ערך או לתושבות ל-10 שנים. Binayah היא סוכנות דובאית מוסמכת RERA מאז 2007, עם מעל 3,000 נכסים פעילים וגישה ישירה להשקות של Emaar, DAMAC, Sobha, Nakheel, Meraas ו-Aldar.",
    heroCta: "לשיחה עם יועץ השקעות",
    stats: [
      { n: "19+", label: "שנות ותק בנדל\"ן בדובאי" },
      { n: "3,000+", label: "נכסים פעילים" },
      { n: "RERA", label: "הסמכה, ORN 1162" },
      { n: "2 מיליון AED", label: "סף ויזת הזהב" },
    ],
    answerTitle: "מהי השקעת נדל\"ן בדובאי?",
    answerBody: [
      "השקעת נדל\"ן בדובאי היא רכישת נכס מגורים או מסחרי בדובאי לצורך הכנסה משכירות, עליית ערך, או שניהם. אזרחים זרים יכולים להחזיק בבעלות מלאה באזורי הבעלות המלאה (freehold) המיועדים בדובאי, כשהבעלות נרשמת בשטר בעלות שמנפיקה רשות הקרקעות של דובאי (DLD). איחוד האמירויות אינו גובה ארנונה שנתית, מס רווחי הון או מס הכנסה על דמי שכירות, ולכן השכירות מגיעה לבעלים ישירות יותר מאשר ברוב השווקים בעולם.",
      "תשואת השכירות הברוטו הממוצעת בעיר עומדת על כ-4.7%, כאשר קהילות מהמגזר הבינוני נמצאות מעל הקו הזה וקו החוף היוקרתי מתחתיו. תקצבו כ-5.5% ממחיר הרכישה לעלויות עסקה בעסקת מזומן וכ-6.5% בעסקה ממומנת, מעבר למחיר עצמו. רכישה של נכס כשיר בשווי 2 מיליון AED ומעלה הרשום ב-DLD מקנה לרוכש גם זכאות לוויזת זהב ל-10 שנים הניתנת לחידוש.",
    ],
    servicesTitle: "מה כולל שירות ההשקעות שלנו",
    services: [
      { icon: "🎯", title: "אסטרטגיה והגדרת יעד", body: "הכנסה, צמיחה או תושבות. קודם כול מקבעים את המטרה, כי הנכס בעל התשואה הגבוהה ביותר והנכס שערכו עולה הכי מהר הם כמעט אף פעם לא אותו נכס." },
      { icon: "🏗️", title: "איתור פרויקטים על הנייר", body: "גישה ישירה להשקות של Emaar, DAMAC, Sobha, Nakheel, Meraas ו-Aldar, כולל תוכניות תשלום במהלך הבנייה ולאחר המסירה." },
      { icon: "🔑", title: "רכישה של נכסים מוכנים ויד שנייה", body: "יחידות גמורות עם שטר בעלות מתוך מעל 3,000 נכסים פעילים בקהילות הבעלות המלאה של דובאי, עם הכנסה כבר מחוזה השכירות הראשון." },
      { icon: "📊", title: "מודל תשואה ועלויות", body: "תשואה ברוטו, תשואה נטו לאחר דמי ניהול ותקופות ריקנות, ועלות העסקה הכוללת, מחושבות על היחידה הספציפית ולא על כותרת שיווקית." },
      { icon: "🛂", title: "בניית מבנה לוויזת זהב", body: "בניית העסקה כך שהשווי הרשום על שמכם יעבור בבירור את סף 2 מיליון AED." },
      { icon: "🔁", title: "יציאה ומכירה חוזרת", body: "המחאת חוזה על הנייר עם אישור NOC מהיזם, או מכירה חוזרת של יחידה גמורה דרך ה-DLD. אנחנו מתכננים את היציאה עוד לפני הכניסה." },
    ],
    optionsTitle: "אפשרויות השקעה בנדל\"ן בדובאי",
    optionsIntro: "יש שש דרכים מרכזיות להשקיע בנדל\"ן בדובאי. הן נבדלות בהון ההתחלתי הנדרש, במועד שבו מתחילה ההכנסה, ובמקום שבו יושב הסיכון.",
    optionsHead: ["אפשרות", "איך זה עובד", "מתאים ל", "שיקול מרכזי"],
    optionsRows: [
      ["על הנייר", "רכישה מהיזם לפני השלמת הבנייה לפי תוכנית תשלומים מדורגת.", "עליית ערך עם הון התחלתי נמוך.", "יזמים מתמחרים בדרך כלל 15-25% מתחת לשווי השוק הצפוי לאחר האכלוס; הסיכון המרכזי הוא עיתוי המסירה."],
      ["מוכן / יד שנייה", "רכישת יחידה גמורה עם שטר בעלות בשוק המשני.", "הכנסה מהיום הראשון.", "מלוא המחיר מגיע לפירעון בהעברת הבעלות, כך שנדרש הסכום המלא או משכנתה."],
      ["רכישה להשכרה", "החזקת יחידה מוכנה בחוזה שכירות רשום ב-Ejari ל-12 חודשים.", "הכנסה שנתית יציבה.", "התשואה הברוטו הממוצעת בעיר היא כ-4.7%; התשואה נטו היא בדרך כלל 75-85% מהברוטו."],
      ["השכרה לטווח קצר", "השכרת יחידה מרוהטת כדירת נופש ברישיון.", "הכנסה ברוטו גבוהה יותר באזורי תיירות.", "עלויות תפעול וניהול גבוהות יותר, ותפוסה שמשתנה לפי העונה."],
      ["המחאת חוזה על הנייר", "מכירת החוזה לרוכש חדש לפני המסירה.", "החזקה לטווח קצר יותר בלי להמתין לאכלוס.", "יזמים דורשים בדרך כלל תשלום של 30-40% מהמחיר, בתוספת אישור אי-התנגדות (NOC)."],
      ["רכישה לצורך ויזת זהב", "רכישת נכס כשיר בשווי 2 מיליון AED ומעלה.", "תושבות באיחוד האמירויות ל-10 שנים הניתנת לחידוש.", "השווי חייב להיות הון עצמי אמיתי, עם שטר בעלות, הרשום ב-DLD על שמכם."],
    ],
    areasTitle: "האזורים הטובים ביותר להשקעה בדובאי",
    areasIntro: "תשואה ועליית ערך מושכות לכיוונים הפוכים. קהילות זולות יחסית עם ביקוש גבוה מניבות את התשואות הברוטו החזקות ביותר; כתובות יוקרה נדירות מניבות את עליית הערך החזקה ביותר.",
    areasHead: ["קהילה", "פרופיל", "תשואה ברוטו מנחה", "לרכוש בשביל"],
    areasRows: [
      ["Jumeirah Village Circle", "דירות במגזר הבינוני, מאגר שוכרים עמוק ונזיל, היצע חדש גדול ומתמשך.", "7.2-8.5%", "הכנסה"],
      ["Business Bay", "מגדלים במרכז העיר; שכר דירה גבוה יותר במונחים מוחלטים, אך גם מחירים גבוהים יותר.", "6.2-7.1%", "הכנסה וצמיחה"],
      ["Dubai Marina", "קו חוף מבוסס, נזילות גבוהה במכירה חוזרת.", "4.5-6%", "צמיחה ונזילות"],
      ["Palm Jumeirah", "קו חוף יוקרתי ונדיר; קרקע שלא ניתן לשחזר.", "4.5-6%", "עליית ערך"],
      ["Dubai South", "מסדרון צמיחה סביב נמל התעופה אל מכתום, עם מחירים לרגל רבועה מהנגישים בדובאי.", "מעל הממוצע העירוני", "הכנסה, בפרופיל של אזור מתפתח"],
      ["Discovery Gardens / International City", "מלאי בשל וזול עם היצע חדש מוגבל ושוכרים לטווח ארוך.", "מעל הממוצע העירוני", "הכנסה בראש ובראשונה"],
    ],
    areasNote: "נקודות ייחוס: תשואת השכירות הברוטו הממוצעת בעיר היא כ-4.7% ומחיר המכירה הממוצע הוא כ-1,879 AED לרגל רבועה. קו החוף היוקרתי מניב בדרך כלל מתחת לממוצע העירוני ונרכש לצורך עליית ערך, לא לתזרים מזומנים. תחזית הקונצנזוס של האנליסטים לשנים 2026-2028 היא עליית ערך שנתית של 5-12% בסגמנטים נבחרים.",
    yieldTitle: "איזו תשואת שכירות אפשר לקבל בדובאי?",
    yieldIntro: "תשואת השכירות הברוטו הממוצעת בעיר היא כ-4.7%. הטווח נע מכ-4.5% באזורי יוקרה ועד כ-8.5% בקהילות בעלות תשואה גבוהה כמו JVC. ברוטו אינו מה שנשאר בידיכם.",
    yieldHead: ["מדד", "מה זה אומר", "טווח אופייני בדובאי"],
    yieldRows: [
      ["תשואה ברוטו", "שכר דירה שנתי חלקי מחיר הרכישה.", "כ-4.7% בעיר; מכ-4.5% ביוקרה ועד 8.5% בתשואה גבוהה"],
      ["תשואה נטו", "ברוטו בניכוי דמי ניהול, ריקנות, אחזקה וניהול.", "בדרך כלל 75-85% מהברוטו"],
      ["דמי ניהול (service charges)", "משולמים לאיגוד הבעלים לפי רגל רבועה לשנה.", "10-30 AED לרגל רבועה לשנה"],
      ["רישום Ejari", "רישום חובה של חוזה השכירות ב-DLD.", "כ-220 AED"],
      ["מס על הכנסה משכירות", "איחוד האמירויות אינו גובה ארנונה שנתית, מס רווחי הון או מס הכנסה על שכירות.", "0%"],
    ],
    yieldNote: "בקשו מכל סוכן תשואה נטו, לא ברוטו. אם הוא לא יודע לומר לכם את דמי הניהול לרגל רבועה בבניין, הוא עדיין לא מכיר את המספר האמיתי.",
    offplanTitle: "איך קונים נכס על הנייר בדובאי",
    offplanIntro: "נכסים על הנייר מהווים כ-72% מהנכסים המוצעים בדובאי, כלומר זה המיינסטרים ולא נישה. התהליך מתנהל בשבעה שלבים.",
    offplanSteps: [
      { n: "1", title: "קביעת תקציב ואסטרטגיה", body: "החליטו אם אתם קונים להכנסה, לצמיחה או לתושבות, והוסיפו עלויות עסקה מעל המחיר: כ-5.5% בעסקת מזומן, 6.5% בעסקה ממומנת." },
      { n: "2", title: "קודם היזם, אחר כך הפרויקט", body: "שקללו את היסטוריית המסירות של היזם באותה חומרה שבה אתם שוקלים את תנאי התשלום, ובדקו את חשבון הנאמנות (escrow) של הפרויקט ב-DLD." },
      { n: "3", title: "שריון היחידה", body: "חתמו על טופס שריון ושלמו את דמי ההזמנה כדי להוריד את היחידה מהשוק." },
      { n: "4", title: "חתימה על ה-SPA", body: "קראו את לוח התשלומים שורה אחר שורה. העדיפו תשלומים הצמודים לאבני דרך בבנייה על פני תשלומים הצמודים לתאריכים בלבד." },
      { n: "5", title: "רישום ב-DLD (Oqood)", body: "אגרת הרישום של 4% משולמת בדרך כלל במועד הרכישה לצורך רישום ה-Oqood. כשיזם מפרסם \"פטור מאגרות DLD\", בדרך כלל הכוונה היא שהיזם סופג את ה-4%, לא שהאגרה אינה נגבית." },
      { n: "6", title: "תשלומים לאורך הבנייה", body: "מבנה נפוץ הוא 60% במהלך הבנייה ו-40% במסירה. גרסת post-handover מעבירה חלק מהתשלום האחרון לתשלומים לאחר קבלת המפתחות." },
      { n: "7", title: "מסירה, בדק ושטר בעלות", body: "בצעו בדיקת מסירה ורשמו ליקויים, ולאחר מכן רישום ה-Oqood הופך לשטר בעלות על שמכם." },
    ],
    offplanNote: "מגבלות המימון שקבע הבנק המרכזי של איחוד האמירויות מגיעות עד 80% לתושבים ועד 50% ללא-תושבים בנכס ראשון, והן בדרך כלל נמוכות יותר בנכסים על הנייר, כך שצפו לממן חלק גדול יותר מההון העצמי. אם תצטרכו לצאת לפני המסירה, המחאת חוזה אפשרית לאחר תשלום החלק המינימלי שהיזם דורש, לרוב כ-30-40%, וקבלת אישור אי-התנגדות.",
    costsTitle: "עלויות רכישה ותשלומים שוטפים בדובאי",
    costsIntro: "אגרת ההעברה של 4% ל-DLD היא הכותרת, אך העלות הריאלית הכוללת של הרישום גבוהה יותר. תקצבו אותן בנפרד מהמחיר ומתוכנית התשלומים.",
    costsHead: ["עלות", "סכום", "מתי משולם"],
    costsRows: [
      ["אגרת העברה ל-DLD", "4% ממחיר הרכישה", "בהעברת הבעלות, או ברישום Oqood בנכס על הנייר"],
      ["אגרת נאמן / רישום", "כ-4,000 AED", "בהעברת הבעלות"],
      ["הנפקת שטר בעלות", "540 AED", "בהעברת הבעלות"],
      ["עמלת תיווך", "2% מהמחיר בתוספת 5% מע\"מ", "בהעברת הבעלות"],
      ["רישום משכנתה", "0.25% מסכום ההלוואה בתוספת 290 AED", "בהעברת הבעלות, בעסקאות ממומנות בלבד"],
      ["עלות עסקה כוללת", "כ-5.5% במזומן, כ-6.5% במימון", "לתקצב מעל מחיר הרכישה"],
      ["דמי ניהול", "10-30 AED לרגל רבועה לשנה", "מדי שנה, החל מהמסירה"],
    ],
    plansTitle: "שלוש דרכים לבנות השקעה בדובאי",
    plans: [
      { name: "הכנסה", fee: "נכסים מוכנים, שכירות כבר מהחוזה הראשון", features: ["מלאי גמור עם שטר בעלות", "קהילות מגזר בינוני כמו JVC ו-Business Bay", "תשואה ברוטו ממוצעת בעיר של כ-4.7%", "תשואה נטו של 75-85% מהברוטו בדרך כלל", "רישום Ejari ואיתור שוכר מטופלים על ידינו"] },
      { name: "צמיחה", fee: "על הנייר, תשלומים מדורגים, עליית ערך", features: ["תוכניות תשלום של היזם לאורך הבנייה", "מתומחר בדרך כלל 15-25% מתחת לשווי הצפוי לאחר האכלוס", "תוכניות post-handover זמינות בפרויקטים נבחרים", "התשלומים מוחזקים בחשבון נאמנות של ה-DLD", "גישה להשקות של Emaar, DAMAC, Sobha, Nakheel, Meraas ו-Aldar"] },
      { name: "תושבות", fee: "רכישה כשירה לוויזת זהב מ-2 מיליון AED", features: ["נכס כשיר מ-2 מיליון AED", "תושבות באיחוד האמירויות ל-10 שנים הניתנת לחידוש", "בן/בת זוג וילדים נכללים בבקשה", "נכס אחד ב-2 מיליון AED, או שניים במיליון AED במצטבר", "ברכישה במשכנתה נדרש הון עצמי של מיליון AED לפחות"] },
    ],
    whyTitle: "למה להשקיע דרך Binayah",
    whyPoints: [
      { title: "סוכנות בדובאי מאז 2007", body: "מעל 19 שנה באותו שוק לאורך כמה מחזורים, ולא עסק שקופץ מהשקה להשקה." },
      { title: "מוסמכים RERA, ORN 1162", body: "מורשים על ידי הרשות לרגולציה של נדל\"ן שברשות הקרקעות של דובאי, עם סוכנים מוסמכי RERA בכל עסקה." },
      { title: "מעל 3,000 נכסים פעילים", body: "נכסים על הנייר ומוכנים בקהילות הבעלות המלאה של דובאי, כך שהרשימה אינה מוגבלת למלאי של יזם אחד." },
      { title: "גישה ישירה ליזמים", body: "גישה ביום ההשקה למלאי של Emaar, DAMAC, Sobha, Nakheel, Meraas ו-Aldar, כולל תנאי תשלום." },
      { title: "מספרים לפני סיפור", body: "אנחנו מחשבים תשואה ברוטו, תשואה נטו ועלות כוללת על היחידה הספציפית שלפניכם, ואומרים לכם מתי המספרים לא מסתדרים." },
      { title: "מקצה לקצה", body: "בחירה, רישום ב-DLD, חיבור למשכנתה, מסמכי ויזת זהב, השכרה, ניהול ומכירה חוזרת בהמשך." },
    ],
    linksTitle: "התחילו במחקר",
    linksSubtitle: "לסייר בשוק",
    guidesSubtitle: "מדריכי השקעה",
    siteLinkLabels: ["פרויקטים על הנייר", "הפרויקטים המובילים על הנייר", "נכסים למכירה", "קהילות בדובאי", "יזמים", "ויזת זהב", "דוחות שוק", "הערכת שווי חינם", "סוכנות נדל\"ן בדובאי", "מתווך נדל\"ן בדובאי", "יצירת קשר עם יועץ"],
    guideLinkLabels: ["הסבר על תשואת שכירות", "אזורים עם תשואה גבוהה", "תשואה על השקעה בדובאי", "על הנייר מול יד שנייה", "תוכניות תשלום על הנייר", "המחאת חוזה ומכירה חוזרת", "הסבר על אגרות DLD", "הסבר על דמי ניהול", "תהליך ויזת הזהב", "בעלות מלאה מול חכירה", "תחזית שוק דובאי 2026", "ניהול נכסים בדובאי", "צ'ק ליסט לבעלי נכסים"],
    faqTitle: "שאלות נפוצות",
    faqs: [
      { question: "האם נדל\"ן בדובאי הוא השקעה טובה?", answer: "נדל\"ן בדובאי מתאים למשקיעים שרוצים הכנסה משכירות, עליית ערך או תושבות. אזרחים זרים יכולים להחזיק בבעלות מלאה באזורי הבעלות המיועדים, כשהבעלות נרשמת בשטר בעלות של ה-DLD שאינו פוקע. איחוד האמירויות אינו גובה ארנונה שנתית, מס רווחי הון או מס הכנסה על דמי שכירות, כך שחלק גדול יותר מהשכירות מגיע לבעלים בהשוואה לרוב השווקים בעולם. תשואת השכירות הברוטו הממוצעת בעיר היא כ-4.7%. כמו בכל שוק, התשואה תלויה ביחידה הספציפית, בקהילה ובמחיר ששולם, ולכן חשבו את המספרים לפני שאתם מתחייבים." },
      { question: "איזו תשואת שכירות אפשר לקבל בדובאי?", answer: "תשואת השכירות הברוטו הממוצעת בעיר היא כ-4.7%. הטווח נע מכ-4.5% באזורי יוקרה ועד כ-8.5% בקהילות בעלות תשואה גבוהה. Jumeirah Village Circle נמצאת סביב 7.2-8.5% ברוטו כי המחירים נמוכים, כ-700-900 AED לרגל רבועה, בעוד שכר הדירה חזק לסוג הנכס. Business Bay נעה סביב 6.2-7.1%. קו חוף יוקרתי כמו Palm Jumeirah ו-Dubai Marina מניב כ-4.5-6% ונרכש בעיקר לעליית ערך. התשואה נטו, לאחר דמי ניהול, ריקנות, אחזקה וניהול, היא בדרך כלל 75-85% מהברוטו." },
      { question: "כמה כסף צריך כדי להשקיע בנדל\"ן בדובאי?", answer: "אין מחיר כניסה אחד, אבל תקצבו את עלויות העסקה בנפרד מהמחיר: כ-5.5% ממחיר הרכישה בעסקת מזומן וכ-6.5% בעסקה ממומנת. זה כולל את אגרת ההעברה של 4% ל-DLD, אגרת נאמן של כ-4,000 AED, שטר בעלות ב-540 AED, עמלת תיווך של 2% בתוספת 5% מע\"מ, ובעסקאות ממומנות רישום משכנתה של 0.25% מההלוואה בתוספת 290 AED. מגבלות המימון של הבנק המרכזי של איחוד האמירויות מגיעות עד 80% לתושבים ועד 50% ללא-תושבים בנכס ראשון. רכישה על הנייר מקטינה את ההון הנדרש בהתחלה, כי משלמים דמי הזמנה ואז פורסים את היתרה לאורך הבנייה." },
      { question: "מה עדיף בדובאי, על הנייר או נכס מוכן?", answer: "זה תלוי אם אתם רוצים צמיחה או הכנסה. נכס על הנייר מתומחר בדרך כלל 15-25% מתחת לשווי השוק הצפוי לאחר האכלוס ומשולם בתשלומים לאורך הבנייה, אבל ההכנסה מתחילה רק אחרי המסירה והסיכון המרכזי הוא עיתוי המסירה. נכס מוכן בשוק המשני מעניק שטר בעלות והכנסה משכירות מיד, אבל מלוא המחיר מגיע לפירעון בהעברת הבעלות. נכסים על הנייר מהווים כ-72% מהנכסים המוצעים בדובאי. אם ייתכן שתצטרכו לצאת לפני המסירה, אפשר להמחות את החוזה לאחר תשלום החלק המינימלי שהיזם דורש, לרוב כ-30-40%, וקבלת אישור אי-התנגדות." },
      { question: "איך קונים נכס על הנייר בדובאי?", answer: "קבעו תקציב ואסטרטגיה, בחרו קודם את היזם ובדקו את היסטוריית המסירות שלו ואת חשבון הנאמנות ב-DLD, שריינו את היחידה עם דמי הזמנה, ואז חתמו על הסכם המכר (SPA) תוך קריאת לוח התשלומים שורה אחר שורה. אגרת הרישום של 4% ל-DLD משולמת בדרך כלל במועד הרכישה לצורך רישום ה-Oqood. לאחר מכן משלמים תשלומים לאורך הבנייה, כשמבנה נפוץ הוא 60% במהלך הבנייה ו-40% במסירה, וגרסאות post-handover מעבירות חלק מהתשלום האחרון לתשלומים לאחר קבלת המפתחות. במסירה מבצעים בדק, וה-Oqood הופך לשטר בעלות." },
      { question: "האם זרים יכולים לקנות נכס בדובאי?", answer: "כן. באזורי הבעלות המלאה המיועדים בדובאי, אזרחים זרים יכולים להחזיק בנכס בבעלות מלאה וקבועה, כששמם רשום בשטר בעלות שמנפיקה רשות הקרקעות של דובאי. בעלות זו אינה פוקעת וכוללת את הזכות למכור, להשכיר ולהוריש את הנכס. מחוץ לאזורים אלה, חכירה מעניקה זכות שימוש לתקופה ארוכה אך סופית, לרוב עד 99 שנה, שבסופה הזכויות חוזרות לבעל הקרקע. ודאו את סוג הבעלות ביחידה הספציפית לפני שאתם מסתמכים עליה, במיוחד אם תושבות היא חלק מהסיבה שלכם לרכוש." },
      { question: "כמה צריך לרכוש כדי לקבל ויזת זהב?", answer: "השקעה בנדל\"ן בסך 2 מיליון AED לפחות מזכה בוויזת זהב של איחוד האמירויות ל-10 שנים, הניתנת לחידוש. זה יכול להיות נכס אחד ב-2 מיליון AED או שני נכסים במיליון AED כל אחד, במאוחד בבקשה אחת. נכסים במשכנתה ונכסים על הנייר יכולים להיות כשירים בתנאי שסף 2 מיליון AED ותנאי המלווה או היזם מתקיימים, וברכישה במשכנתה ההון העצמי שלכם חייב להיות מיליון AED לפחות. השווי חייב להיות הון עצמי אמיתי, עם שטר בעלות, הרשום ב-DLD על שמכם. בן/בת זוג וילדים יכולים להיכלל, והחידוש כעבור עשר שנים דורש רק שתמשיכו להחזיק בנכס כשיר." },
      { question: "מהן העלויות השוטפות של החזקת נכס בדובאי?", answer: "העלות החוזרת המרכזית היא דמי הניהול המשולמים לאיגוד הבעלים של הבניין, בדרך כלל 10-30 AED לרגל רבועה לשנה, כשמגדלים עתירי מתקנים וקהילות על קו החוף נמצאים בקצה העליון של הטווח. הוסיפו אחזקה, דמי ניהול אם אינכם מנהלים בעצמכם, והפרשה ריאלית לתקופות ריקנות בין שוכרים. רישום Ejari עולה כ-220 AED לחוזה. באיחוד האמירויות אין ארנונה שנתית, מס רווחי הון או מס הכנסה על שכירות, ולכן דמי הניהול והעלויות השוטפות הם שקובעים את התשואה נטו שלכם." },
    ],
    ctaTitle: "בנו את תיק הנדל\"ן שלכם בדובאי",
    ctaDesc: "ספרו לנו מה התקציב ואם אתם קונים להכנסה, לצמיחה או לתושבות. נחזור אליכם עם רשימה מצומצמת ועם המספרים המחושבים לכל יחידה, לא עם חוברת שיווקית.",
    ctaBtn: "לשיחה עם יועץ",
    ctaWhatsApp: "כתבו לנו בוואטסאפ",
    breadcrumbs: ["דף הבית", "שירותים", "השקעות נדל\"ן"],
  },
} as const;

type Locale = keyof typeof CONTENT;

const PATH = "/services/property-investment-dubai";

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
      ? ["инвестиции в недвижимость дубая", "купить недвижимость в дубае", "инвестиционная компания дубай", "недвижимость дубай инвестиции", "доходность аренды дубай"]
      : locale === "ar"
      ? ["الاستثمار العقاري في دبي", "استثمار عقاري دبي", "شركة استثمار عقاري دبي", "شراء عقار في دبي", "العائد الإيجاري في دبي"]
      : locale === "zh"
      ? ["迪拜房产投资", "投资迪拜房地产", "迪拜房产投资公司", "迪拜买房", "迪拜租金回报率"]
      : locale === "vi"
      ? ["đầu tư bất động sản dubai", "đầu tư nhà đất dubai", "công ty đầu tư bất động sản dubai", "mua bất động sản dubai", "lợi suất cho thuê dubai"]
      : locale === "fr"
      ? ["investissement immobilier dubaï", "investir dans l'immobilier à dubaï", "société d'investissement immobilier dubaï", "acheter un bien à dubaï", "rendement locatif dubaï"]
      : locale === "he"
      ? ["השקעות נדלן בדובאי", "להשקיע בנדלן בדובאי", "חברת השקעות נדלן דובאי", "קניית נכס בדובאי", "תשואת שכירות דובאי"]
      : ["dubai property investment", "invest in dubai property", "property investment company dubai", "dubai real estate investment", "dubai rental yield", "buy property in dubai"],
  };
}

/* Shared table shell. Wide tables scroll inside their own container so the
   page body never scrolls horizontally on mobile. */
function DataTable({ head, rows, isRtl }: { head: readonly string[]; rows: readonly (readonly string[])[]; isRtl: boolean }) {
  const align = isRtl ? "text-right" : "text-left";
  return (
    <div className="overflow-x-auto rounded-2xl border border-border/50 bg-card">
      <table className="w-full min-w-[640px] text-sm border-collapse">
        <thead>
          <tr className="bg-primary/5">
            {head.map((h) => (
              <th key={h} scope="col" className={`px-4 py-3 text-xs font-bold uppercase tracking-wider text-foreground ${align}`}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t border-border/40">
              {row.map((cell, j) => (
                <td key={j} className={`px-4 py-3 align-top leading-relaxed ${j === 0 ? "font-semibold text-foreground" : "text-muted-foreground"} ${align}`}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function PropertyInvestmentDubaiPage({ params }: Props) {
  const { locale } = await params;
  const c = CONTENT[locale as Locale] ?? CONTENT.en;
  const isRtl = locale === "ar" || locale === "he"; // ar, he are rtl; vi, zh, ru, en, fr are ltr
  const lp = locale === "en" ? "" : `/${locale}`;

  const bcItems = [
    { name: c.breadcrumbs[0], href: `${lp}/` },
    { name: c.breadcrumbs[1], href: `${lp}/services` },
    { name: c.breadcrumbs[2], href: `${lp}${PATH}` },
  ];

  const siteLabels = c.siteLinkLabels as readonly string[];
  const guideLabels = c.guideLinkLabels as readonly string[];

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? "rtl" : "ltr"}>
      <FAQJsonLd faqs={c.faqs.map(f => ({ question: f.question, answer: f.answer }))} inLanguage={locale} />
      <BreadcrumbJsonLd items={bcItems} />
      <ServiceJsonLd
        name={c.metaTitle}
        description={c.metaDesc}
        url={canonical(locale, PATH)}
        serviceType="Property Investment"
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
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">{c.answerTitle}</h2>
          <div className="space-y-4">
            {c.answerBody.map((p, i) => (
              <p key={i} className="text-base text-muted-foreground leading-relaxed">{p}</p>
            ))}
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

        {/* Investment options */}
        <section>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">{c.optionsTitle}</h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-6 max-w-3xl">{c.optionsIntro}</p>
          <DataTable head={c.optionsHead as readonly string[]} rows={c.optionsRows as readonly (readonly string[])[]} isRtl={isRtl} />
        </section>

        {/* Best areas */}
        <section>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">{c.areasTitle}</h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-6 max-w-3xl">{c.areasIntro}</p>
          <DataTable head={c.areasHead as readonly string[]} rows={c.areasRows as readonly (readonly string[])[]} isRtl={isRtl} />
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mt-4">{c.areasNote}</p>
        </section>

        {/* Rental yield */}
        <section>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">{c.yieldTitle}</h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-6 max-w-3xl">{c.yieldIntro}</p>
          <DataTable head={c.yieldHead as readonly string[]} rows={c.yieldRows as readonly (readonly string[])[]} isRtl={isRtl} />
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mt-4">{c.yieldNote}</p>
        </section>

        {/* How to buy off-plan */}
        <section>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">{c.offplanTitle}</h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-6 max-w-3xl">{c.offplanIntro}</p>
          <ol className="space-y-3">
            {c.offplanSteps.map((s) => (
              <li key={s.n} className="bg-card border border-border/50 rounded-2xl p-5 flex items-start gap-4">
                <span className="w-8 h-8 shrink-0 rounded-lg bg-primary/10 text-primary font-bold text-sm flex items-center justify-center">{s.n}</span>
                <div>
                  <h3 className="text-sm font-bold text-foreground mb-1">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mt-4">{c.offplanNote}</p>
        </section>

        {/* Costs */}
        <section>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">{c.costsTitle}</h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-6 max-w-3xl">{c.costsIntro}</p>
          <DataTable head={c.costsHead as readonly string[]} rows={c.costsRows as readonly (readonly string[])[]} isRtl={isRtl} />
        </section>

        {/* Strategies */}
        <section>
          <div className="text-center mb-12">
            <p className="text-accent font-bold tracking-[0.35em] uppercase text-xs mb-3">Strategies</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">{c.plansTitle}</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-5">
            {c.plans.map((plan, i) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-5 sm:p-7 border ${i === 1 ? "border-primary/40 shadow-lg" : "border-border/50 bg-card"}`}
                style={i === 1 ? { background: "linear-gradient(135deg, #0B3D2E08, #1A7A5A12)" } : {}}
              >
                <h3 className="text-xl font-bold text-foreground mb-1">{plan.name}</h3>
                <p className="text-xs text-muted-foreground mb-4 leading-relaxed">{plan.fee}</p>
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

        {/* Internal links */}
        <section>
          <div className="text-center mb-12">
            <p className="text-accent font-bold tracking-[0.35em] uppercase text-xs mb-3">Resources</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">{c.linksTitle}</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4">{c.linksSubtitle}</h3>
              <ul className="space-y-2">
                {SITE_LINKS.map((href, i) => (
                  <li key={href}>
                    <Link href={`${lp}${href}`} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      {siteLabels[i] ?? href} →
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4">{c.guidesSubtitle}</h3>
              <ul className="space-y-2">
                {GUIDE_LINKS.map((href, i) => (
                  <li key={href}>
                    <Link href={`${lp}${href}`} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      {guideLabels[i] ?? href} →
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
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
