/* eslint-disable i18next/no-literal-string -- multilingual SEO landing page */
import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { waHref, WA_DEFAULT_MESSAGE } from "@/lib/whatsapp";
import { FAQJsonLd, BreadcrumbJsonLd, ServiceJsonLd } from "@/components/JsonLd";
import { canonical, altLangs, OG_LOCALE, DEFAULT_OG_IMAGE } from "@/lib/site";

export const revalidate = 86400;

const PATH = "/services/real-estate-broker-dubai";

const CONTENT = {
  en: {
    metaTitle: "Real Estate Broker in Dubai | RERA-Registered | Binayah Properties",
    metaDesc: "Work with a RERA-registered real estate broker in Dubai. Buyer and seller representation, Form F/MOU, developer NOC, DLD transfer, 4% fee guidance and commission agreed in writing. Brokering since 2007.",
    heroLabel: "REAL ESTATE BROKER",
    h1: "Real Estate Broker in Dubai",
    heroDesc: "Binayah is a RERA-registered brokerage. Our property brokers in Dubai represent you on one side of the deal, negotiate the price and terms, prepare the RERA forms, and take the transaction through NOC and DLD registration to title deed.",
    heroCta: "Speak to a Broker",
    stats: [
      { n: "19+", label: "Years brokering in Dubai" },
      { n: "ORN 1162", label: "RERA-registered brokerage" },
      { n: "3,000+", label: "Active listings" },
      { n: "4%", label: "DLD transfer fee at registration" },
    ],
    answerTitle: "What does a real estate broker in Dubai actually do?",
    answerBody: "A real estate broker in Dubai is a RERA-registered intermediary, licensed through the Dubai Land Department, who represents either the buyer or the seller in a property transaction. Every individual broker holds a Broker Registration Number (BRN) and works under a brokerage with an Office Registration Number (ORN) — you can ask for both and verify them. In practice the broker sources or markets the property, verifies title and service-charge status, negotiates price and payment terms, prepares the RERA paperwork (Form A for a seller, Form B for a buyer, Form F for the MOU), coordinates the developer's No Objection Certificate on a resale, and completes the transfer at a DLD-approved trustee office. Binayah Properties has been brokering Dubai real estate since 2007 under RERA ORN 1162.",
    linksTitle: "Useful next steps",
    links: [
      { label: "Real estate agency in Dubai", href: "/services/real-estate-agency-dubai" },
      { label: "Properties for sale", href: "/buy" },
      { label: "Off-plan projects", href: "/off-plan" },
      { label: "Sell your property", href: "/sell" },
      { label: "Meet our brokers", href: "/team" },
      { label: "Guide: How to buy property in Dubai", href: "/pulse/guides/how-to-buy-property-in-dubai" },
      { label: "Guide: DLD fees explained", href: "/pulse/guides/dld-fees-explained" },
      { label: "Guide: Agent commission in Dubai", href: "/pulse/guides/dubai-property-agent-commission" },
    ],
    servicesTitle: "What your broker handles",
    services: [
      { icon: "🔎", title: "Buyer representation", body: "We take a written brief, shortlist against real comparables, run the viewings, and sign a Form B so it is documented who represents you and on what terms." },
      { icon: "🏷️", title: "Seller representation", body: "Pricing from recent DLD-registered transactions, a Form A listing agreement, marketing across the portals, and screening so only qualified buyers reach your door." },
      { icon: "🤝", title: "Negotiation", body: "Price is only one lever. We also negotiate payment structure, handover date, what stays in the unit, and who carries the 4% DLD transfer fee." },
      { icon: "📄", title: "RERA forms & due diligence", body: "Form A, Form B, Form I between cooperating brokers, and Form F for the MOU. Before you sign we check the title deed, the service-charge account and any mortgage on the unit." },
      { icon: "🏦", title: "Deposit & escrow handling", body: "The 10% MOU deposit is normally a manager's cheque held by the broker or in a regulated account, never in an agent's personal account. Off-plan instalments go into the project's DLD-supervised escrow account." },
      { icon: "🏛️", title: "NOC & DLD transfer", body: "We chase the developer NOC on resales, book the trustee office slot, marshal the manager's cheques, and stay in the room until the title deed (or Oqood registration) is issued." },
    ],
    processTitle: "The Dubai buying process, step by step",
    process: [
      { n: "01", title: "Brief and shortlist", body: "Define the objective — yield, end use, capital growth or the AED 2M Golden Visa threshold — then view a shortlist that actually matches it. Your broker confirms the unit sits in a freehold zone." },
      { n: "02", title: "Offer and negotiation", body: "The offer goes to the seller through the brokers. Terms cover price, deposit, timeline and the split of costs. Nothing is binding at this stage." },
      { n: "03", title: "MOU / Form F and 10% deposit", body: "The MOU is signed on RERA's Form F and the buyer normally pays a 10% deposit, typically as a manager's cheque held by the broker until transfer. Form F also sets the completion deadline." },
      { n: "04", title: "Developer NOC", body: "On a resale the developer issues a No Objection Certificate confirming service charges are clear. Expect roughly 3–10 working days and a developer fee of about AED 500–5,000. Off-plan purchases direct from a developer need no NOC." },
      { n: "05", title: "DLD transfer at the trustee office", body: "Buyer, seller and any lender meet at a DLD-approved trustee office. The 4% transfer fee, trustee fee and title deed fee are settled by manager's cheque, and the seller is paid." },
      { n: "06", title: "Title deed and handover", body: "The new title deed is issued in your name — or an Oqood interim registration if the unit is off-plan — and keys, access cards and utility accounts are handed over." },
    ],
    costsTitle: "What the transaction costs",
    costsNote: "Government charges are set by the Dubai Land Department. Commission is a market norm rather than a statutory rate — we put ours in writing before you commit.",
    costs: [
      { label: "DLD transfer fee", value: "4% of the purchase price" },
      { label: "Trustee office fee", value: "AED 4,000 + VAT (AED 2,000 under AED 500K)" },
      { label: "Title deed issuance", value: "AED 540" },
      { label: "Agency commission (sale)", value: "Around 2% + VAT, agreed in writing" },
      { label: "Agency commission (lease)", value: "Around 5% of annual rent + VAT" },
      { label: "Mortgage registration", value: "0.25% of the loan + AED 290, if financed" },
      { label: "Developer NOC", value: "Around AED 500–5,000, resale only" },
    ],
    plansTitle: "How we can represent you",
    plans: [
      { name: "Buyer representation", fee: "Form B", features: ["Written search brief", "Comparable-based price advice", "Viewings and shortlisting", "Offer and negotiation", "Title and service-charge checks", "Trustee office attendance"] },
      { name: "Seller representation", fee: "Form A", features: ["Valuation from DLD-registered comparables", "Form A listing agreement", "Photography and portal marketing", "Buyer qualification", "NOC coordination with the developer", "Transfer day management"] },
      { name: "Off-plan purchase", fee: "Direct from developer", features: ["Developer and project due diligence", "Payment plan comparison", "Payments into DLD escrow", "Oqood interim registration", "No NOC required", "Handover and snagging support"] },
    ],
    whyTitle: "How Binayah's brokers work",
    whyPoints: [
      { title: "RERA-registered, ORN 1162", body: "Binayah operates under RERA Office Registration Number 1162 and our agents are RERA-certified. Ask any broker for their BRN — you can check it on the Dubai REST app." },
      { title: "Brokering since 2007", body: "Nineteen-plus years of Dubai transactions across freehold apartments, villas, townhouses and off-plan launches." },
      { title: "Commission agreed in writing", body: "Around 2% plus VAT on a sale is the market norm. Whatever we agree goes in the brokerage agreement before the deal proceeds — no adjustment at the trustee office." },
      { title: "Verification before you sign", body: "Title deed, mortgage status, service-charge account and NOC risk are checked before the MOU, not after. That is where resale deals usually stall." },
      { title: "Multilingual team", body: "Our brokers work in English, Arabic, Russian, French and Chinese, and this site serves seven languages. Meet the team before you pick a broker." },
      { title: "3,000+ active listings", body: "Ready and off-plan inventory across Dubai's freehold communities, plus direct developer access on new launches." },
    ],
    faqTitle: "Frequently Asked Questions",
    faqs: [
      { question: "What is the difference between a real estate broker and an agent in Dubai?", answer: "In everyday use the terms overlap. Formally, the brokerage is the licensed office registered with RERA under an Office Registration Number (ORN), and the individual agent working for it holds a Broker Registration Number (BRN). When people search for a real estate broker in Dubai, they usually mean the licensed person who will represent them in the transaction — that person must hold a valid BRN and work under a registered brokerage." },
      { question: "Does a real estate broker in Dubai have to be RERA-registered?", answer: "Yes. Only agents registered with RERA, the regulatory arm of the Dubai Land Department, can legally broker property in Dubai. A registered broker holds a BRN and uses the official RERA forms — Form A with a seller, Form B with a buyer, Form I between cooperating brokers and Form F for the MOU. You can ask to see the BRN and verify it. An agent who cannot show one is a reason to stop." },
      { question: "How much commission do property brokers in Dubai charge?", answer: "For a sale, the agency commission is typically around 2% of the purchase price plus VAT. For a lease it is typically around 5% of the annual rent plus VAT. These are market conventions rather than fixed statutory rates, so the figure can be discussed and should be recorded in the brokerage agreement before the deal proceeds." },
      { question: "Who pays the 4% DLD transfer fee?", answer: "The Dubai Land Department charges 4% of the agreed purchase price at registration. The percentage is fixed and there is no exemption, but who pays it can be negotiated. In practice the buyer pays the full 4% in the overwhelming majority of transactions. Budget 5–7% all-in once the trustee fee (AED 4,000 + VAT), title deed fee (AED 540) and commission are added." },
      { question: "What is Form F, and what is the MOU?", answer: "Form F is RERA's standard Memorandum of Understanding — the sale agreement between buyer and seller. It records the price, the deposit, the completion deadline and who pays which costs. It is signed once terms are agreed, normally alongside a deposit of about 10% of the price, and it is the document the trustee office works from on transfer day." },
      { question: "Where does my deposit sit before the transfer?", answer: "On a resale, the 10% MOU deposit is normally a manager's cheque held by the broker (or in a regulated account) until transfer — it should never go into an agent's personal account. On an off-plan purchase, payments go into the project's escrow account supervised by the Dubai Land Department and are released to the developer against construction milestones, which is what ring-fences your money during construction." },
      { question: "Do I need an NOC, and how long does it take?", answer: "You need a developer No Objection Certificate for secondary-market resales — the DLD will not register the transfer without it. It confirms service charges are paid and there are no outstanding fines or objections. It usually takes 3–10 working days once arrears are cleared, and developer fees typically range from about AED 500 to AED 5,000. Off-plan purchases direct from a developer do not require one." },
      { question: "How long does buying a property in Dubai take?", answer: "A ready-property purchase usually completes in about 2–6 weeks from agreed terms to title deed, assuming financing is arranged and the NOC is not delayed. Cash purchases move fastest; mortgage transactions add valuation and bank approval time. The NOC is the most common cause of delay, which is why your broker should raise it early." },
    ],
    ctaTitle: "Talk to a RERA-registered broker",
    ctaDesc: "Tell us whether you are buying, selling or investing off-plan. We will assign the right broker, put the terms in writing, and walk the transaction through to the title deed.",
    ctaBtn: "Speak to a Broker",
    ctaWhatsApp: "WhatsApp Us",
    breadcrumbs: ["Home", "Services", "Real Estate Broker in Dubai"],
  },

  ru: {
    metaTitle: "Брокер по недвижимости в Дубае | Лицензия RERA | Binayah",
    metaDesc: "Брокер по недвижимости в Дубае с регистрацией RERA. Представление интересов покупателя и продавца, Form F (MOU), NOC застройщика, регистрация в DLD, сбор 4% и комиссия, зафиксированная письменно. С 2007 года.",
    heroLabel: "БРОКЕР ПО НЕДВИЖИМОСТИ",
    h1: "Брокер по недвижимости в Дубае",
    heroDesc: "Binayah — брокерская компания, зарегистрированная в RERA. Наши брокеры представляют вашу сторону сделки, ведут переговоры о цене и условиях, готовят формы RERA и доводят сделку через NOC и регистрацию в DLD до получения title deed.",
    heroCta: "Связаться с брокером",
    stats: [
      { n: "19+", label: "Лет брокерской работы в Дубае" },
      { n: "ORN 1162", label: "Регистрация в RERA" },
      { n: "3,000+", label: "Активных объектов" },
      { n: "4%", label: "Сбор DLD при регистрации" },
    ],
    answerTitle: "Чем на самом деле занимается брокер по недвижимости в Дубае?",
    answerBody: "Брокер по недвижимости в Дубае — это посредник, зарегистрированный в RERA при Земельном департаменте Дубая (DLD), который представляет либо покупателя, либо продавца. У каждого брокера есть личный номер BRN, а у компании — офисный номер ORN; и то и другое можно запросить и проверить. На практике брокер подбирает или продвигает объект, проверяет право собственности и состояние счёта по сервисным сборам, ведёт переговоры о цене и графике платежей, готовит документы RERA (Form A — с продавцом, Form B — с покупателем, Form F — MOU), получает NOC застройщика при перепродаже и завершает сделку в аккредитованном офисе трасти DLD. Binayah работает на рынке Дубая с 2007 года под номером RERA ORN 1162.",
    linksTitle: "Полезные разделы",
    links: [
      { label: "Агентство недвижимости в Дубае", href: "/services/real-estate-agency-dubai" },
      { label: "Объекты на продажу", href: "/buy" },
      { label: "Проекты off-plan", href: "/off-plan" },
      { label: "Продать недвижимость", href: "/sell" },
      { label: "Наша команда брокеров", href: "/team" },
      { label: "Гид: как купить недвижимость в Дубае", href: "/pulse/guides/how-to-buy-property-in-dubai" },
      { label: "Гид: сборы DLD", href: "/pulse/guides/dld-fees-explained" },
      { label: "Гид: комиссия агента в Дубае", href: "/pulse/guides/dubai-property-agent-commission" },
    ],
    servicesTitle: "Что берёт на себя брокер",
    services: [
      { icon: "🔎", title: "Представление покупателя", body: "Фиксируем письменное задание, формируем шортлист по реальным сопоставимым сделкам, проводим просмотры и подписываем Form B, чтобы было документально ясно, кто вас представляет и на каких условиях." },
      { icon: "🏷️", title: "Представление продавца", body: "Оценка по недавним сделкам, зарегистрированным в DLD, договор Form A, размещение на порталах и отбор — до вас доходят только платёжеспособные покупатели." },
      { icon: "🤝", title: "Переговоры", body: "Цена — лишь один рычаг. Обсуждаем также структуру платежей, дату передачи, что остаётся в квартире и кто оплачивает 4% сбора DLD." },
      { icon: "📄", title: "Формы RERA и due diligence", body: "Form A, Form B, Form I между сотрудничающими брокерами и Form F для MOU. До подписания проверяем title deed, счёт по сервисным сборам и наличие ипотеки на объекте." },
      { icon: "🏦", title: "Депозит и эскроу", body: "Депозит 10% по MOU обычно оформляется банковским чеком, который хранится у брокера или на регулируемом счёте, а не на личном счёте агента. Платежи по off-plan идут на эскроу-счёт проекта под надзором DLD." },
      { icon: "🏛️", title: "NOC и регистрация в DLD", body: "Получаем NOC застройщика при перепродаже, бронируем слот в офисе трасти, собираем банковские чеки и присутствуем до выдачи title deed или регистрации Oqood." },
    ],
    processTitle: "Процесс покупки в Дубае по шагам",
    process: [
      { n: "01", title: "Задание и шортлист", body: "Определяем цель — доходность, проживание, рост капитала или порог 2 млн AED для Golden Visa — и смотрим только подходящие объекты. Брокер подтверждает, что объект во фрихолд-зоне." },
      { n: "02", title: "Оферта и переговоры", body: "Предложение передаётся продавцу через брокеров. Обсуждаются цена, депозит, сроки и распределение расходов. На этом этапе обязательств ещё нет." },
      { n: "03", title: "MOU / Form F и депозит 10%", body: "MOU подписывается на форме RERA Form F, покупатель обычно вносит депозит 10% банковским чеком, который хранится у брокера до перехода права. Form F также фиксирует крайний срок сделки." },
      { n: "04", title: "NOC застройщика", body: "При перепродаже застройщик выдаёт No Objection Certificate, подтверждающий отсутствие задолженности по сервисным сборам. Обычно 3–10 рабочих дней, сбор застройщика примерно 500–5 000 AED. Для off-plan напрямую от застройщика NOC не нужен." },
      { n: "05", title: "Переход права в офисе трасти DLD", body: "Покупатель, продавец и банк встречаются в аккредитованном офисе трасти. Сбор 4%, сбор трасти и пошлина за title deed оплачиваются банковскими чеками, продавец получает деньги." },
      { n: "06", title: "Title deed и передача объекта", body: "Новый title deed оформляется на ваше имя (или Oqood для off-plan), после чего передаются ключи, карты доступа и коммунальные счета." },
    ],
    costsTitle: "Стоимость сделки",
    costsNote: "Государственные сборы установлены Земельным департаментом Дубая. Комиссия — рыночная норма, а не тариф закона; мы фиксируем её письменно до начала сделки.",
    costs: [
      { label: "Сбор DLD за переход права", value: "4% от цены покупки" },
      { label: "Сбор офиса трасти", value: "4 000 AED + НДС (2 000 AED при цене до 500K)" },
      { label: "Выдача title deed", value: "540 AED" },
      { label: "Комиссия при покупке", value: "около 2% + НДС, письменно" },
      { label: "Комиссия при аренде", value: "около 5% годовой аренды + НДС" },
      { label: "Регистрация ипотеки", value: "0,25% суммы кредита + 290 AED" },
      { label: "NOC застройщика", value: "около 500–5 000 AED, только перепродажа" },
    ],
    plansTitle: "Как мы можем вас представлять",
    plans: [
      { name: "Сторона покупателя", fee: "Form B", features: ["Письменное задание на поиск", "Оценка цены по сопоставимым сделкам", "Просмотры и шортлист", "Оферта и переговоры", "Проверка права и сервисных сборов", "Сопровождение в офисе трасти"] },
      { name: "Сторона продавца", fee: "Form A", features: ["Оценка по сделкам, зарегистрированным в DLD", "Договор Form A", "Фотосъёмка и продвижение на порталах", "Проверка платёжеспособности покупателя", "Получение NOC у застройщика", "Ведение дня сделки"] },
      { name: "Покупка off-plan", fee: "Напрямую у застройщика", features: ["Проверка застройщика и проекта", "Сравнение планов рассрочки", "Платежи на эскроу-счёт DLD", "Регистрация Oqood", "NOC не требуется", "Поддержка при приёмке объекта"] },
    ],
    whyTitle: "Как работают брокеры Binayah",
    whyPoints: [
      { title: "Регистрация RERA, ORN 1162", body: "Binayah работает под офисным номером RERA 1162, агенты сертифицированы RERA. Запросите у брокера BRN — его можно проверить в приложении Dubai REST." },
      { title: "На рынке с 2007 года", body: "Более 19 лет сделок в Дубае: квартиры во фрихолд-зонах, виллы, таунхаусы и off-plan запуски." },
      { title: "Комиссия зафиксирована письменно", body: "Около 2% плюс НДС при покупке — рыночная норма. Согласованная сумма вносится в договор до начала сделки, никаких пересмотров в офисе трасти." },
      { title: "Проверка до подписания", body: "Title deed, ипотека, счёт по сервисным сборам и риски по NOC проверяются до MOU, а не после. Именно здесь чаще всего срываются сделки перепродажи." },
      { title: "Многоязычная команда", body: "Наши брокеры работают на английском, арабском, русском, французском и китайском; сайт доступен на семи языках." },
      { title: "3,000+ активных объектов", body: "Готовая и off-plan недвижимость во всех фрихолд-районах Дубая плюс прямой доступ к новым запускам застройщиков." },
    ],
    faqTitle: "Частые вопросы",
    faqs: [
      { question: "Чем брокер отличается от агента по недвижимости в Дубае?", answer: "В обиходе термины совпадают. Формально брокерская компания — это лицензированный офис, зарегистрированный в RERA под номером ORN, а конкретный сотрудник имеет личный номер брокера BRN. Когда ищут брокера по недвижимости в Дубае, обычно имеют в виду именно лицензированного специалиста, который будет представлять вас в сделке; у него должен быть действующий BRN и работа под зарегистрированной компанией." },
      { question: "Обязательна ли регистрация брокера в RERA?", answer: "Да. Легально работать с недвижимостью в Дубае могут только агенты, зарегистрированные в RERA — регуляторе при Земельном департаменте. Зарегистрированный брокер имеет BRN и использует официальные формы: Form A с продавцом, Form B с покупателем, Form I между брокерами и Form F для MOU. Номер BRN можно запросить и проверить; отсутствие номера — повод прекратить общение." },
      { question: "Какая комиссия у брокеров по недвижимости в Дубае?", answer: "При покупке комиссия агентства обычно составляет около 2% от цены объекта плюс НДС. При аренде — около 5% годовой аренды плюс НДС. Это рыночные нормы, а не установленные законом тарифы, поэтому сумма обсуждается и должна быть зафиксирована в брокерском договоре до начала сделки." },
      { question: "Кто платит сбор DLD в размере 4%?", answer: "Земельный департамент Дубая взимает 4% от согласованной цены при регистрации. Ставка фиксирована и льгот нет, но плательщика можно обсуждать. На практике в подавляющем большинстве сделок все 4% платит покупатель. Закладывайте 5–7% с учётом сбора трасти (4 000 AED + НДС), пошлины за title deed (540 AED) и комиссии." },
      { question: "Что такое Form F и MOU?", answer: "Form F — стандартный меморандум о взаимопонимании RERA, то есть договор между покупателем и продавцом. В нём фиксируются цена, депозит, крайний срок сделки и распределение расходов. Он подписывается после согласования условий, обычно вместе с депозитом около 10%, и именно с ним работает офис трасти в день сделки." },
      { question: "Где хранится мой депозит до сделки?", answer: "При перепродаже депозит 10% по MOU обычно оформляется банковским чеком, который хранится у брокера или на регулируемом счёте до перехода права, и никогда не должен попадать на личный счёт агента. При покупке off-plan платежи поступают на эскроу-счёт проекта под надзором DLD и выдаются застройщику по мере выполнения этапов строительства." },
      { question: "Нужен ли NOC и сколько он занимает?", answer: "NOC застройщика необходим при перепродаже на вторичном рынке: без него DLD не зарегистрирует переход права. Он подтверждает оплату сервисных сборов и отсутствие штрафов и возражений. Обычно занимает 3–10 рабочих дней после погашения задолженности, сбор застройщика — примерно 500–5 000 AED. Для покупки off-plan напрямую у застройщика NOC не требуется." },
      { question: "Сколько времени занимает покупка недвижимости в Дубае?", answer: "Покупка готового объекта обычно завершается за 2–6 недель от согласования условий до title deed, если финансирование готово и NOC не задерживается. Быстрее всего проходят сделки за наличные; ипотека добавляет время на оценку и одобрение банка. Чаще всего задержки вызывает именно NOC, поэтому брокер должен поднять этот вопрос заранее." },
    ],
    ctaTitle: "Поговорите с брокером, зарегистрированным в RERA",
    ctaDesc: "Расскажите, покупаете вы, продаёте или инвестируете в off-plan. Мы подберём брокера, зафиксируем условия письменно и доведём сделку до title deed.",
    ctaBtn: "Связаться с брокером",
    ctaWhatsApp: "WhatsApp",
    breadcrumbs: ["Главная", "Услуги", "Брокер по недвижимости в Дубае"],
  },

  ar: {
    metaTitle: "وسيط عقاري في دبي | مسجَّل لدى RERA | بناية للعقارات",
    metaDesc: "وسيط عقاري مسجَّل لدى RERA في دبي: تمثيل المشتري والبائع، نموذج F (مذكرة التفاهم)، شهادة عدم ممانعة من المطوّر، نقل الملكية في دائرة الأراضي، رسوم 4% وعمولة موثَّقة كتابيًا. منذ 2007.",
    heroLabel: "وسيط عقاري",
    h1: "وسيط عقاري في دبي",
    heroDesc: "بناية شركة وساطة مسجَّلة لدى RERA. يمثّل وسطاؤنا العقاريون في دبي طرفك في الصفقة، ويتفاوضون على السعر والشروط، ويجهّزون نماذج RERA، ويتابعون المعاملة عبر شهادة عدم الممانعة وتسجيل دائرة الأراضي حتى صدور سند الملكية.",
    heroCta: "تحدّث إلى وسيط",
    stats: [
      { n: "+19", label: "عامًا في الوساطة العقارية بدبي" },
      { n: "ORN 1162", label: "تسجيل لدى RERA" },
      { n: "3,000+", label: "عقار معروض" },
      { n: "4%", label: "رسوم النقل لدى دائرة الأراضي" },
    ],
    answerTitle: "ماذا يفعل الوسيط العقاري في دبي فعليًا؟",
    answerBody: "الوسيط العقاري في دبي هو وسيط مسجَّل لدى مؤسسة التنظيم العقاري (RERA) التابعة لدائرة الأراضي والأملاك، ويمثّل إمّا المشتري أو البائع في الصفقة. لكل وسيط رقم تسجيل شخصي (BRN)، ويعمل تحت مظلة شركة لها رقم تسجيل مكتب (ORN)، ويمكنك طلب الرقمين والتحقق منهما. عمليًا يبحث الوسيط عن العقار أو يسوّقه، ويتحقق من سند الملكية وحساب رسوم الخدمات، ويتفاوض على السعر وجدول الدفع، ويُعدّ مستندات RERA (نموذج A مع البائع، ونموذج B مع المشتري، ونموذج F لمذكرة التفاهم)، وينسّق شهادة عدم الممانعة من المطوّر في صفقات إعادة البيع، ثم يُتمّ نقل الملكية في مكتب أمين تسجيل معتمد من دائرة الأراضي. تعمل بناية في السوق العقاري بدبي منذ عام 2007 برقم RERA ORN 1162.",
    linksTitle: "خطوات مفيدة",
    links: [
      { label: "وكالة عقارية في دبي", href: "/services/real-estate-agency-dubai" },
      { label: "عقارات للبيع", href: "/buy" },
      { label: "مشاريع على الخارطة", href: "/off-plan" },
      { label: "بيع عقارك", href: "/sell" },
      { label: "تعرّف على وسطائنا", href: "/team" },
      { label: "دليل: كيف تشتري عقارًا في دبي", href: "/pulse/guides/how-to-buy-property-in-dubai" },
      { label: "دليل: رسوم دائرة الأراضي", href: "/pulse/guides/dld-fees-explained" },
      { label: "دليل: عمولة الوسيط في دبي", href: "/pulse/guides/dubai-property-agent-commission" },
    ],
    servicesTitle: "ما الذي يتولاه وسيطك",
    services: [
      { icon: "🔎", title: "تمثيل المشتري", body: "نوثّق متطلباتك كتابيًا، ونضع قائمة مختصرة مبنية على صفقات مقارنة حقيقية، وننظّم المعاينات، ونوقّع نموذج B ليكون واضحًا من يمثّلك وبأي شروط." },
      { icon: "🏷️", title: "تمثيل البائع", body: "تسعير مبني على صفقات مسجَّلة حديثًا لدى دائرة الأراضي، واتفاقية إدراج بنموذج A، وتسويق عبر المنصات، وفرز المشترين بحيث لا يصلك سوى الجاد والمؤهَّل." },
      { icon: "🤝", title: "التفاوض", body: "السعر ليس العنصر الوحيد. نتفاوض أيضًا على هيكل الدفع وتاريخ التسليم وما يبقى داخل الوحدة ومن يتحمّل رسوم النقل البالغة 4%." },
      { icon: "📄", title: "نماذج RERA والفحص النافي للجهالة", body: "نموذج A ونموذج B ونموذج I بين الوسطاء المتعاونين ونموذج F لمذكرة التفاهم. قبل التوقيع نتحقق من سند الملكية وحساب رسوم الخدمات وأي رهن على الوحدة." },
      { icon: "🏦", title: "العربون وحساب الضمان", body: "يُدفع عربون 10% عادةً بشيك مصرفي يُحتفظ به لدى الوسيط أو في حساب منظَّم، ولا يُودَع في حساب شخصي لأي وكيل. أمّا دفعات العقارات على الخارطة فتذهب إلى حساب ضمان المشروع الخاضع لإشراف دائرة الأراضي." },
      { icon: "🏛️", title: "شهادة عدم الممانعة ونقل الملكية", body: "نتابع إصدار شهادة عدم الممانعة في إعادة البيع، ونحجز موعد مكتب أمين التسجيل، ونجهّز الشيكات المصرفية، ونبقى حتى صدور سند الملكية أو تسجيل عقود (أوقود)." },
    ],
    processTitle: "خطوات الشراء في دبي",
    process: [
      { n: "01", title: "تحديد الهدف والقائمة المختصرة", body: "حدّد الهدف: عائد إيجاري، سكن، نمو رأسمالي، أو حد مليوني درهم للإقامة الذهبية، ثم عاين ما يناسبه فعلًا. يؤكّد الوسيط أن العقار ضمن منطقة تملّك حر." },
      { n: "02", title: "العرض والتفاوض", body: "يُقدَّم العرض إلى البائع عبر الوسطاء ويشمل السعر والعربون والجدول الزمني وتوزيع التكاليف. لا التزام قانونيًا في هذه المرحلة." },
      { n: "03", title: "مذكرة التفاهم (نموذج F) وعربون 10%", body: "تُوقَّع مذكرة التفاهم على نموذج RERA رقم F، ويدفع المشتري عادةً عربونًا بنسبة 10% بشيك مصرفي يُحتفظ به لدى الوسيط حتى النقل. ويحدّد النموذج أيضًا الموعد النهائي لإتمام الصفقة." },
      { n: "04", title: "شهادة عدم الممانعة من المطوّر", body: "في إعادة البيع يصدر المطوّر شهادة عدم ممانعة تؤكد سداد رسوم الخدمات. تستغرق عادةً 3–10 أيام عمل برسوم تتراوح بين 500 و5,000 درهم تقريبًا. ولا تُطلب للشراء على الخارطة مباشرةً من المطوّر." },
      { n: "05", title: "النقل في مكتب أمين التسجيل", body: "يجتمع المشتري والبائع والبنك في مكتب أمين تسجيل معتمد. تُسدَّد رسوم النقل 4% ورسوم أمين التسجيل ورسوم سند الملكية بشيكات مصرفية، ويستلم البائع المبلغ." },
      { n: "06", title: "سند الملكية والتسليم", body: "يصدر سند الملكية الجديد باسمك، أو تسجيل (أوقود) المؤقت للعقارات على الخارطة، ثم تُسلَّم المفاتيح وبطاقات الدخول وحسابات المرافق." },
    ],
    costsTitle: "تكاليف الصفقة",
    costsNote: "الرسوم الحكومية تحدّدها دائرة الأراضي والأملاك في دبي. أمّا العمولة فهي عُرف سوقي وليست نسبة قانونية ثابتة، ونحن نوثّقها كتابيًا قبل بدء الصفقة.",
    costs: [
      { label: "رسوم نقل الملكية", value: "4% من سعر الشراء" },
      { label: "رسوم مكتب أمين التسجيل", value: "4,000 درهم + ضريبة (2,000 لما دون 500 ألف)" },
      { label: "إصدار سند الملكية", value: "540 درهمًا" },
      { label: "عمولة البيع", value: "نحو 2% + ضريبة، موثَّقة كتابيًا" },
      { label: "عمولة الإيجار", value: "نحو 5% من الإيجار السنوي + ضريبة" },
      { label: "تسجيل الرهن العقاري", value: "0.25% من قيمة القرض + 290 درهمًا" },
      { label: "شهادة عدم الممانعة", value: "نحو 500–5,000 درهم، لإعادة البيع فقط" },
    ],
    plansTitle: "كيف نمثّلك",
    plans: [
      { name: "تمثيل المشتري", fee: "نموذج B", features: ["متطلبات بحث موثَّقة", "تسعير مبني على صفقات مقارنة", "معاينات وقائمة مختصرة", "تقديم العرض والتفاوض", "فحص الملكية ورسوم الخدمات", "الحضور في مكتب أمين التسجيل"] },
      { name: "تمثيل البائع", fee: "نموذج A", features: ["تقييم من صفقات مسجَّلة لدى الدائرة", "اتفاقية إدراج بنموذج A", "تصوير احترافي وتسويق رقمي", "تأهيل المشترين", "تنسيق شهادة عدم الممانعة", "إدارة يوم نقل الملكية"] },
      { name: "الشراء على الخارطة", fee: "مباشرةً من المطوّر", features: ["فحص المطوّر والمشروع", "مقارنة خطط السداد", "الدفع في حساب الضمان", "تسجيل (أوقود)", "لا حاجة لشهادة عدم ممانعة", "دعم التسليم وفحص العيوب"] },
    ],
    whyTitle: "كيف يعمل وسطاء بناية",
    whyPoints: [
      { title: "مسجَّلون لدى RERA برقم 1162", body: "تعمل بناية برقم تسجيل مكتب RERA رقم 1162، ووكلاؤنا معتمدون من RERA. اطلب من أي وسيط رقم BRN وتحقّق منه عبر تطبيق دبي ريست." },
      { title: "في السوق منذ 2007", body: "أكثر من 19 عامًا من الصفقات في دبي: شقق التملّك الحر والفلل والتاون هاوس والمشاريع على الخارطة." },
      { title: "عمولة موثَّقة كتابيًا", body: "نحو 2% زائد الضريبة عند البيع هو العُرف السائد. ما نتفق عليه يُدوَّن في اتفاقية الوساطة قبل بدء الصفقة، دون أي تعديل في مكتب أمين التسجيل." },
      { title: "تحقّق قبل التوقيع", body: "نفحص سند الملكية والرهن وحساب رسوم الخدمات ومخاطر شهادة عدم الممانعة قبل مذكرة التفاهم لا بعدها، فهنا تتعثر معظم صفقات إعادة البيع." },
      { title: "فريق متعدد اللغات", body: "يعمل وسطاؤنا بالعربية والإنجليزية والروسية والفرنسية والصينية، والموقع متاح بسبع لغات." },
      { title: "أكثر من 3,000 عقار", body: "معروضات جاهزة وعلى الخارطة في مناطق التملّك الحر بدبي، مع وصول مباشر إلى الإطلاقات الجديدة." },
    ],
    faqTitle: "الأسئلة الشائعة",
    faqs: [
      { question: "ما الفرق بين الوسيط العقاري والوكيل في دبي؟", answer: "في الاستخدام اليومي يتداخل المصطلحان. رسميًا، شركة الوساطة هي المكتب المرخَّص والمسجَّل لدى RERA برقم مكتب (ORN)، أمّا الموظف الذي يعمل لديها فيحمل رقم تسجيل وسيط (BRN). وعندما يبحث الناس عن وسيط عقاري في دبي فهم يقصدون عادةً الشخص المرخَّص الذي سيمثّلهم في الصفقة، ويجب أن يحمل رقم BRN ساريًا ويعمل تحت شركة مسجَّلة." },
      { question: "هل يجب أن يكون الوسيط العقاري مسجَّلًا لدى RERA؟", answer: "نعم. لا يجوز قانونًا مزاولة الوساطة العقارية في دبي إلا للوكلاء المسجَّلين لدى RERA، الذراع التنظيمية لدائرة الأراضي والأملاك. الوسيط المسجَّل يحمل رقم BRN ويستخدم نماذج RERA الرسمية: نموذج A مع البائع، ونموذج B مع المشتري، ونموذج I بين الوسطاء، ونموذج F لمذكرة التفاهم. يمكنك طلب الرقم والتحقق منه، وعدم وجوده سبب كافٍ للتوقف." },
      { question: "كم تبلغ عمولة الوسطاء العقاريين في دبي؟", answer: "في البيع تبلغ عمولة الوساطة عادةً نحو 2% من سعر الشراء زائد ضريبة القيمة المضافة. وفي الإيجار نحو 5% من الإيجار السنوي زائد الضريبة. هذه أعراف سوقية وليست نسبًا محددة بالقانون، لذا يمكن مناقشتها ويجب توثيقها في اتفاقية الوساطة قبل بدء الصفقة." },
      { question: "من يدفع رسوم النقل البالغة 4%؟", answer: "تفرض دائرة الأراضي والأملاك رسمًا بنسبة 4% من السعر المتفق عليه عند التسجيل. النسبة ثابتة ولا توجد إعفاءات، لكن من يدفعها قابل للتفاوض. عمليًا يتحمّل المشتري كامل الـ4% في الغالبية العظمى من الصفقات. خصّص 5–7% إجمالًا بعد إضافة رسوم أمين التسجيل (4,000 درهم + ضريبة) ورسوم سند الملكية (540 درهمًا) والعمولة." },
      { question: "ما هو نموذج F ومذكرة التفاهم؟", answer: "نموذج F هو مذكرة التفاهم المعتمدة من RERA، أي عقد البيع بين المشتري والبائع. يوثّق السعر والعربون والموعد النهائي لإتمام الصفقة وتوزيع التكاليف. يُوقَّع بعد الاتفاق على الشروط، عادةً مع عربون بنحو 10%، وهو المستند الذي يعتمد عليه مكتب أمين التسجيل يوم النقل." },
      { question: "أين يُحفظ العربون قبل نقل الملكية؟", answer: "في إعادة البيع يكون عربون الـ10% عادةً شيكًا مصرفيًا يُحتفظ به لدى الوسيط أو في حساب منظَّم حتى النقل، ولا يجوز إيداعه في حساب شخصي لأي وكيل. أمّا في الشراء على الخارطة فتذهب الدفعات إلى حساب ضمان المشروع الخاضع لإشراف دائرة الأراضي، ويُفرَج عنها للمطوّر مقابل إنجاز مراحل البناء، وهو ما يحمي أموالك أثناء الإنشاء." },
      { question: "هل أحتاج شهادة عدم ممانعة وكم تستغرق؟", answer: "شهادة عدم الممانعة من المطوّر مطلوبة في صفقات إعادة البيع، ولن تسجّل الدائرة النقل بدونها. تؤكد سداد رسوم الخدمات وخلو الوحدة من المخالفات أو الاعتراضات. تستغرق عادةً 3–10 أيام عمل بعد تسوية المتأخرات، ورسوم المطوّر تتراوح تقريبًا بين 500 و5,000 درهم. ولا تُطلب عند الشراء على الخارطة مباشرةً من المطوّر." },
      { question: "كم يستغرق شراء عقار في دبي؟", answer: "يكتمل شراء العقار الجاهز عادةً خلال 2–6 أسابيع من الاتفاق على الشروط حتى سند الملكية، بشرط جاهزية التمويل وعدم تأخر شهادة عدم الممانعة. الشراء النقدي هو الأسرع، بينما يضيف التمويل العقاري وقتًا للتقييم وموافقة البنك. وشهادة عدم الممانعة هي السبب الأشيع للتأخير، لذا يجب أن يثيرها وسيطك مبكرًا." },
    ],
    ctaTitle: "تحدّث إلى وسيط مسجَّل لدى RERA",
    ctaDesc: "أخبرنا إن كنت تشتري أو تبيع أو تستثمر على الخارطة. سنكلّف الوسيط المناسب، ونوثّق الشروط كتابيًا، ونتابع الصفقة حتى سند الملكية.",
    ctaBtn: "تحدّث إلى وسيط",
    ctaWhatsApp: "واتساب",
    breadcrumbs: ["الرئيسية", "الخدمات", "وسيط عقاري في دبي"],
  },

  zh: {
    metaTitle: "迪拜房产经纪 | RERA注册持牌 | Binayah Properties",
    metaDesc: "与迪拜RERA注册房产经纪合作：买方与卖方代理、Form F（MOU）、开发商NOC、DLD过户、4%过户费说明与书面约定佣金。自2007年起从业。",
    heroLabel: "房产经纪",
    h1: "迪拜房产经纪",
    heroDesc: "Binayah是一家在RERA注册的房产经纪公司。我们的迪拜房产经纪代表您一方参与交易，谈判价格与条款，准备RERA表格，并推动交易通过NOC与迪拜土地局登记，直至取得产权证。",
    heroCta: "联系经纪人",
    stats: [
      { n: "19+", label: "年迪拜经纪从业经验" },
      { n: "ORN 1162", label: "RERA注册编号" },
      { n: "3,000+", label: "在售房源" },
      { n: "4%", label: "土地局过户费" },
    ],
    answerTitle: "迪拜房产经纪到底做什么？",
    answerBody: "迪拜房产经纪是在迪拜土地局下属监管机构RERA注册的持牌中介，在交易中代表买方或卖方其中一方。每位经纪人都持有个人经纪注册号（BRN），所属公司持有办公室注册号（ORN），两者您都可以索要并核验。实际工作中，经纪人负责寻找或推广房源、核查产权与物业费账户、谈判价格与付款条件、准备RERA文件（卖方Form A、买方Form B、成交备忘录Form F）、在二手转售中协调开发商的无异议证明（NOC），并在土地局认可的受托登记处完成过户。Binayah自2007年起在迪拜从事房产经纪业务，RERA注册编号为ORN 1162。",
    linksTitle: "下一步",
    links: [
      { label: "迪拜房地产中介", href: "/services/real-estate-agency-dubai" },
      { label: "在售房源", href: "/buy" },
      { label: "期房项目", href: "/off-plan" },
      { label: "出售您的房产", href: "/sell" },
      { label: "认识我们的经纪团队", href: "/team" },
      { label: "指南：如何在迪拜买房", href: "/pulse/guides/how-to-buy-property-in-dubai" },
      { label: "指南：土地局费用详解", href: "/pulse/guides/dld-fees-explained" },
      { label: "指南：迪拜经纪佣金", href: "/pulse/guides/dubai-property-agent-commission" },
    ],
    servicesTitle: "经纪人负责的工作",
    services: [
      { icon: "🔎", title: "买方代理", body: "以书面需求为准，依据真实可比成交筛选房源、安排看房，并签署Form B，明确记录由谁代表您、以何种条件代表。" },
      { icon: "🏷️", title: "卖方代理", body: "基于土地局近期登记成交定价，签署Form A委托协议，在各大门户网站推广，并筛选买家，只让有支付能力的买家上门。" },
      { icon: "🤝", title: "谈判", body: "价格只是其中一项。我们还会谈付款结构、交房日期、房内保留物品，以及由谁承担4%的土地局过户费。" },
      { icon: "📄", title: "RERA表格与尽职调查", body: "Form A、Form B、经纪人之间合作的Form I，以及作为MOU的Form F。签约前核查产权证、物业费账户以及该单位是否存在抵押。" },
      { icon: "🏦", title: "定金与托管", body: "10%的MOU定金通常以银行本票形式由经纪公司或受监管账户保管，绝不进入经纪人个人账户。期房分期款则进入受土地局监管的项目托管账户。" },
      { icon: "🏛️", title: "NOC与土地局过户", body: "二手转售时我们跟进开发商NOC，预约受托登记处，备齐银行本票，并全程陪同直至产权证（或期房Oqood登记）出具。" },
    ],
    processTitle: "迪拜购房流程分步说明",
    process: [
      { n: "01", title: "明确需求与筛选", body: "先确定目标：租金回报、自住、资本增值，或满足200万迪拉姆黄金签证门槛，再看真正匹配的房源。经纪人会确认该房产位于永久产权区。" },
      { n: "02", title: "出价与谈判", body: "报价通过双方经纪人传递给卖方，内容包括价格、定金、时间安排与费用分担。此阶段尚不具约束力。" },
      { n: "03", title: "MOU / Form F 与10%定金", body: "成交备忘录以RERA的Form F签署，买方通常支付10%定金，一般以银行本票形式保管至过户。Form F同时约定完成交易的最后期限。" },
      { n: "04", title: "开发商NOC", body: "二手转售需由开发商出具无异议证明，确认物业费已结清。通常需要3–10个工作日，开发商费用约500–5,000迪拉姆。直接向开发商购买期房无需NOC。" },
      { n: "05", title: "在受托登记处完成过户", body: "买方、卖方及贷款银行在土地局认可的受托登记处会面。4%过户费、受托处费用与产权证费用以银行本票结清，卖方收款。" },
      { n: "06", title: "产权证与交房", body: "新的产权证登记在您名下（期房则为Oqood临时登记），随后交接钥匙、门禁卡与水电账户。" },
    ],
    costsTitle: "交易成本",
    costsNote: "政府收费由迪拜土地局设定。佣金属于市场惯例而非法定费率，我们会在您做出承诺前以书面形式确认。",
    costs: [
      { label: "土地局过户费", value: "成交价的4%" },
      { label: "受托登记处费用", value: "4,000迪拉姆+增值税（50万以下为2,000）" },
      { label: "产权证签发费", value: "540迪拉姆" },
      { label: "买卖佣金", value: "约2%+增值税，书面约定" },
      { label: "租赁佣金", value: "约年租金的5%+增值税" },
      { label: "按揭登记费", value: "贷款额的0.25%+290迪拉姆" },
      { label: "开发商NOC", value: "约500–5,000迪拉姆，仅二手转售" },
    ],
    plansTitle: "我们可以怎样代表您",
    plans: [
      { name: "买方代理", fee: "Form B", features: ["书面购房需求", "基于可比成交的价格建议", "看房与筛选", "出价与谈判", "产权与物业费核查", "陪同前往受托登记处"] },
      { name: "卖方代理", fee: "Form A", features: ["依据土地局登记成交估价", "Form A委托协议", "专业摄影与门户推广", "买家资质审核", "与开发商协调NOC", "过户当日全程管理"] },
      { name: "期房购买", fee: "直接向开发商", features: ["开发商与项目尽调", "付款计划对比", "款项进入土地局托管账户", "Oqood临时登记", "无需NOC", "交房与验房支持"] },
    ],
    whyTitle: "Binayah经纪人的工作方式",
    whyPoints: [
      { title: "RERA注册，ORN 1162", body: "Binayah持有RERA办公室注册编号1162，团队为RERA认证。您可向任何经纪人索要BRN，并在Dubai REST应用中核验。" },
      { title: "自2007年从业", body: "19年以上迪拜交易经验，覆盖永久产权公寓、别墅、联排别墅与期房首发项目。" },
      { title: "佣金书面约定", body: "买卖交易约2%加增值税是市场惯例。约定内容在交易开始前写入经纪协议，过户当天不会临时调整。" },
      { title: "签约前先核查", body: "产权证、抵押状态、物业费账户与NOC风险都在签署MOU之前核查，而不是之后。二手交易卡壳通常就出在这里。" },
      { title: "多语种团队", body: "我们的经纪人可用英语、阿拉伯语、俄语、法语与中文沟通，网站提供七种语言。" },
      { title: "3,000+在售房源", body: "覆盖迪拜各永久产权社区的现房与期房，并可直接对接开发商新盘。" },
    ],
    faqTitle: "常见问题解答",
    faqs: [
      { question: "在迪拜，房产经纪与房产中介有什么区别？", answer: "日常用语中两者常混用。正式来说，经纪公司是在RERA注册并持有办公室注册号（ORN）的持牌机构，而为其工作的个人持有经纪注册号（BRN）。人们搜索“迪拜房产经纪”时，通常指的是将代表自己完成交易的持牌人员，该人员必须持有有效BRN并隶属于注册经纪公司。" },
      { question: "迪拜房产经纪必须在RERA注册吗？", answer: "必须。只有在迪拜土地局监管机构RERA注册的中介才可合法从事迪拜房产经纪业务。注册经纪人持有BRN，并使用RERA官方表格：与卖方签Form A、与买方签Form B、经纪人之间合作用Form I、成交备忘录用Form F。您可以要求查看BRN并核验；无法出示者应立即停止合作。" },
      { question: "迪拜房产经纪收多少佣金？", answer: "买卖交易的中介佣金通常约为成交价的2%加增值税；租赁通常约为年租金的5%加增值税。这些是市场惯例而非法定固定费率，因此金额可以商议，并应在交易启动前写入经纪协议。" },
      { question: "4%的土地局过户费由谁承担？", answer: "迪拜土地局在登记时按成交价收取4%。比例固定且无豁免，但由谁支付可以协商。实际操作中绝大多数交易由买方全额承担。加上受托登记处费用（4,000迪拉姆+增值税）、产权证费用（540迪拉姆）与佣金，整体应预留成交价的5%–7%。" },
      { question: "Form F和MOU是什么？", answer: "Form F是RERA的标准成交备忘录，即买卖双方之间的买卖协议，载明价格、定金、完成期限以及费用分担。条款谈妥后签署，通常同时支付约10%的定金；过户当天受托登记处正是依据这份文件办理。" },
      { question: "过户前我的定金存放在哪里？", answer: "二手交易中，10%的MOU定金通常以银行本票由经纪公司或受监管账户保管至过户，绝不应进入经纪人个人账户。期房交易中，款项进入受迪拜土地局监管的项目托管账户，并按工程节点分批释放给开发商，从而在施工期间保护您的资金。" },
      { question: "我需要NOC吗？需要多久？", answer: "二手转售必须取得开发商无异议证明，否则土地局不予登记过户。它确认物业费已结清且无未处理罚款或异议。结清欠费后通常需要3–10个工作日，开发商费用一般约500至5,000迪拉姆。直接向开发商购买期房则无需NOC。" },
      { question: "在迪拜买房需要多长时间？", answer: "现房交易从条款谈妥到取得产权证通常约需2–6周，前提是资金到位且NOC未延误。全款交易最快；按揭会增加估价与银行审批时间。NOC是最常见的延误原因，因此经纪人应尽早提出。" },
    ],
    ctaTitle: "与RERA注册经纪人沟通",
    ctaDesc: "告诉我们您是买房、卖房还是投资期房。我们会安排合适的经纪人，把条款写进书面协议，并把交易推进到产权证。",
    ctaBtn: "联系经纪人",
    ctaWhatsApp: "WhatsApp咨询",
    breadcrumbs: ["首页", "服务", "迪拜房产经纪"],
  },

  fr: {
    metaTitle: "Courtier immobilier à Dubaï | Agréé RERA | Binayah Properties",
    metaDesc: "Un courtier immobilier agréé RERA à Dubaï : représentation de l'acheteur et du vendeur, Form F (MOU), NOC du promoteur, transfert au DLD, frais de 4 % expliqués et commission actée par écrit. Depuis 2007.",
    heroLabel: "COURTIER IMMOBILIER",
    h1: "Courtier immobilier à Dubaï",
    heroDesc: "Binayah est une agence de courtage enregistrée auprès de la RERA. Nos courtiers immobiliers à Dubaï représentent votre côté de la transaction, négocient le prix et les conditions, préparent les formulaires RERA et mènent le dossier du NOC à l'enregistrement au DLD jusqu'au titre de propriété.",
    heroCta: "Parler à un courtier",
    stats: [
      { n: "19+", label: "Ans de courtage à Dubaï" },
      { n: "ORN 1162", label: "Enregistrement RERA" },
      { n: "3 000+", label: "Biens en portefeuille" },
      { n: "4 %", label: "Frais de transfert DLD" },
    ],
    answerTitle: "Que fait réellement un courtier immobilier à Dubaï ?",
    answerBody: "Un courtier immobilier à Dubaï est un intermédiaire enregistré auprès de la RERA, l'organe de régulation du Dubai Land Department, qui représente soit l'acheteur, soit le vendeur dans une transaction. Chaque courtier possède un numéro personnel (BRN) et exerce au sein d'une agence titulaire d'un numéro d'enregistrement de bureau (ORN) : vous pouvez demander les deux et les vérifier. Concrètement, le courtier recherche ou commercialise le bien, vérifie le titre de propriété et le compte de charges, négocie le prix et l'échéancier, prépare les documents RERA (Form A avec le vendeur, Form B avec l'acheteur, Form F pour le MOU), obtient le certificat de non-objection du promoteur en cas de revente, puis finalise le transfert dans un bureau de trustee agréé par le DLD. Binayah exerce le courtage immobilier à Dubaï depuis 2007 sous le numéro RERA ORN 1162.",
    linksTitle: "Pour aller plus loin",
    links: [
      { label: "Agence immobilière à Dubaï", href: "/services/real-estate-agency-dubai" },
      { label: "Biens à vendre", href: "/buy" },
      { label: "Projets sur plan", href: "/off-plan" },
      { label: "Vendre votre bien", href: "/sell" },
      { label: "Nos courtiers", href: "/team" },
      { label: "Guide : acheter un bien à Dubaï", href: "/pulse/guides/how-to-buy-property-in-dubai" },
      { label: "Guide : les frais du DLD", href: "/pulse/guides/dld-fees-explained" },
      { label: "Guide : la commission d'agence à Dubaï", href: "/pulse/guides/dubai-property-agent-commission" },
    ],
    servicesTitle: "Ce que prend en charge votre courtier",
    services: [
      { icon: "🔎", title: "Représentation de l'acheteur", body: "Nous formalisons votre cahier des charges, présélectionnons sur la base de comparables réels, organisons les visites et signons un Form B qui acte qui vous représente et à quelles conditions." },
      { icon: "🏷️", title: "Représentation du vendeur", body: "Prix établi à partir de transactions récemment enregistrées au DLD, mandat Form A, diffusion sur les portails et qualification des acheteurs, afin que seuls des candidats solides se présentent." },
      { icon: "🤝", title: "Négociation", body: "Le prix n'est qu'un levier. Nous négocions aussi l'échéancier, la date de remise des clés, ce qui reste dans le bien et qui supporte les 4 % de frais du DLD." },
      { icon: "📄", title: "Formulaires RERA et vérifications", body: "Form A, Form B, Form I entre courtiers coopérants et Form F pour le MOU. Avant signature, nous contrôlons le titre de propriété, le compte de charges et une éventuelle hypothèque." },
      { icon: "🏦", title: "Acompte et séquestre", body: "L'acompte de 10 % au MOU prend normalement la forme d'un chèque de banque conservé par le courtier ou sur un compte encadré, jamais sur le compte personnel d'un agent. Les échéances sur plan sont versées sur le compte séquestre du projet supervisé par le DLD." },
      { icon: "🏛️", title: "NOC et transfert au DLD", body: "Nous obtenons le NOC du promoteur en revente, réservons le créneau au bureau de trustee, réunissons les chèques de banque et restons présents jusqu'à l'émission du titre (ou de l'enregistrement Oqood)." },
    ],
    processTitle: "Le processus d'achat à Dubaï, étape par étape",
    process: [
      { n: "01", title: "Cahier des charges et présélection", body: "Définir l'objectif — rendement, résidence, plus-value ou le seuil de 2 M AED du Golden Visa — puis ne visiter que ce qui y correspond. Le courtier confirme que le bien se situe en zone freehold." },
      { n: "02", title: "Offre et négociation", body: "L'offre est transmise au vendeur par les courtiers : prix, acompte, calendrier et répartition des frais. Rien n'est encore engageant à ce stade." },
      { n: "03", title: "MOU / Form F et acompte de 10 %", body: "Le MOU est signé sur le Form F de la RERA et l'acheteur verse généralement 10 %, le plus souvent par chèque de banque conservé par le courtier jusqu'au transfert. Le Form F fixe aussi la date limite de finalisation." },
      { n: "04", title: "NOC du promoteur", body: "En revente, le promoteur délivre un certificat de non-objection attestant que les charges sont soldées. Comptez environ 3 à 10 jours ouvrés et des frais promoteur d'environ 500 à 5 000 AED. Un achat sur plan directement auprès du promoteur n'en nécessite pas." },
      { n: "05", title: "Transfert au bureau de trustee du DLD", body: "Acheteur, vendeur et banque éventuelle se réunissent dans un bureau de trustee agréé. Les 4 %, les frais de trustee et le titre de propriété sont réglés par chèque de banque, et le vendeur est payé." },
      { n: "06", title: "Titre de propriété et remise", body: "Le nouveau titre est émis à votre nom — ou un enregistrement Oqood pour un bien sur plan — puis les clés, badges d'accès et compteurs sont transférés." },
    ],
    costsTitle: "Le coût de la transaction",
    costsNote: "Les frais publics sont fixés par le Dubai Land Department. La commission relève d'un usage de marché et non d'un taux légal : nous l'actons par écrit avant tout engagement.",
    costs: [
      { label: "Frais de transfert DLD", value: "4 % du prix d'achat" },
      { label: "Frais de bureau de trustee", value: "4 000 AED + TVA (2 000 sous 500 000 AED)" },
      { label: "Émission du titre de propriété", value: "540 AED" },
      { label: "Commission (vente)", value: "environ 2 % + TVA, actée par écrit" },
      { label: "Commission (location)", value: "environ 5 % du loyer annuel + TVA" },
      { label: "Enregistrement d'hypothèque", value: "0,25 % du prêt + 290 AED" },
      { label: "NOC du promoteur", value: "environ 500 à 5 000 AED, revente uniquement" },
    ],
    plansTitle: "Comment nous pouvons vous représenter",
    plans: [
      { name: "Côté acheteur", fee: "Form B", features: ["Cahier des charges écrit", "Avis de prix fondé sur des comparables", "Visites et présélection", "Offre et négociation", "Contrôle du titre et des charges", "Présence au bureau de trustee"] },
      { name: "Côté vendeur", fee: "Form A", features: ["Estimation sur comparables enregistrés au DLD", "Mandat Form A", "Photographie et diffusion sur les portails", "Qualification des acheteurs", "Obtention du NOC auprès du promoteur", "Pilotage du jour du transfert"] },
      { name: "Achat sur plan", fee: "Directement auprès du promoteur", features: ["Analyse du promoteur et du projet", "Comparaison des échéanciers", "Versements sur compte séquestre DLD", "Enregistrement Oqood", "Aucun NOC requis", "Accompagnement à la livraison"] },
    ],
    whyTitle: "Comment travaillent les courtiers Binayah",
    whyPoints: [
      { title: "Agréé RERA, ORN 1162", body: "Binayah exerce sous le numéro d'enregistrement de bureau RERA 1162 et nos agents sont certifiés RERA. Demandez son BRN à n'importe quel courtier : il se vérifie dans l'application Dubai REST." },
      { title: "Courtage depuis 2007", body: "Plus de 19 ans de transactions à Dubaï : appartements en freehold, villas, maisons de ville et lancements sur plan." },
      { title: "Commission actée par écrit", body: "Environ 2 % plus TVA sur une vente correspond à l'usage du marché. Ce qui est convenu figure dans le mandat avant que le dossier n'avance, sans révision au bureau de trustee." },
      { title: "Vérifications avant signature", body: "Titre de propriété, hypothèque, compte de charges et risque de NOC sont contrôlés avant le MOU, pas après. C'est précisément là que les reventes se bloquent." },
      { title: "Équipe multilingue", body: "Nos courtiers travaillent en anglais, arabe, russe, français et chinois, et ce site est publié en sept langues." },
      { title: "Plus de 3 000 biens", body: "Stock livré et sur plan dans toutes les communautés freehold de Dubaï, plus un accès direct aux lancements des promoteurs." },
    ],
    faqTitle: "Questions fréquentes",
    faqs: [
      { question: "Quelle différence entre un courtier et un agent immobilier à Dubaï ?", answer: "Dans l'usage courant, les deux termes se confondent. Formellement, l'agence de courtage est le bureau agréé enregistré auprès de la RERA sous un numéro de bureau (ORN), tandis que la personne qui y travaille détient un numéro de courtier (BRN). Lorsqu'on cherche un courtier immobilier à Dubaï, on désigne généralement la personne agréée qui vous représentera : elle doit détenir un BRN valide et exercer au sein d'une agence enregistrée." },
      { question: "Un courtier immobilier à Dubaï doit-il être enregistré auprès de la RERA ?", answer: "Oui. Seuls les agents enregistrés auprès de la RERA, l'organe de régulation du Dubai Land Department, peuvent légalement exercer le courtage immobilier à Dubaï. Un courtier enregistré détient un BRN et utilise les formulaires officiels : Form A avec le vendeur, Form B avec l'acheteur, Form I entre courtiers et Form F pour le MOU. Vous pouvez demander le BRN et le vérifier ; l'absence de numéro doit vous faire arrêter là." },
      { question: "Quelle commission prennent les courtiers immobiliers à Dubaï ?", answer: "Pour une vente, la commission d'agence est généralement d'environ 2 % du prix d'achat plus TVA. Pour une location, elle avoisine 5 % du loyer annuel plus TVA. Ce sont des usages de marché et non des taux légaux : le montant se discute et doit figurer dans le mandat avant que la transaction n'avance." },
      { question: "Qui paie les 4 % de frais de transfert du DLD ?", answer: "Le Dubai Land Department prélève 4 % du prix convenu au moment de l'enregistrement. Le taux est fixe et sans exonération, mais la répartition se négocie. En pratique, l'acheteur règle l'intégralité des 4 % dans la très grande majorité des transactions. Prévoyez 5 à 7 % au total une fois ajoutés les frais de trustee (4 000 AED + TVA), le titre de propriété (540 AED) et la commission." },
      { question: "Qu'est-ce que le Form F, et qu'est-ce que le MOU ?", answer: "Le Form F est le protocole d'accord standard de la RERA, autrement dit le contrat de vente entre acheteur et vendeur. Il consigne le prix, l'acompte, la date limite de finalisation et la répartition des frais. Il se signe une fois les conditions convenues, généralement avec un acompte d'environ 10 %, et c'est le document sur lequel s'appuie le bureau de trustee le jour du transfert." },
      { question: "Où est conservé mon acompte avant le transfert ?", answer: "En revente, l'acompte de 10 % prend normalement la forme d'un chèque de banque conservé par le courtier (ou sur un compte encadré) jusqu'au transfert : il ne doit jamais atterrir sur le compte personnel d'un agent. Pour un achat sur plan, les versements vont sur le compte séquestre du projet supervisé par le Dubai Land Department et sont libérés au promoteur au fil des jalons de construction, ce qui protège vos fonds pendant les travaux." },
      { question: "Ai-je besoin d'un NOC, et en combien de temps ?", answer: "Le certificat de non-objection du promoteur est requis pour les reventes sur le marché secondaire : sans lui, le DLD n'enregistre pas le transfert. Il atteste que les charges sont réglées et qu'aucune amende ou objection ne subsiste. Comptez généralement 3 à 10 jours ouvrés une fois les arriérés soldés, pour des frais promoteur d'environ 500 à 5 000 AED. Un achat sur plan directement auprès du promoteur n'en requiert pas." },
      { question: "Combien de temps prend un achat immobilier à Dubaï ?", answer: "Pour un bien livré, comptez généralement 2 à 6 semaines entre l'accord sur les conditions et le titre de propriété, à condition que le financement soit prêt et le NOC non retardé. Les achats comptant sont les plus rapides ; un crédit ajoute le délai d'expertise et d'accord bancaire. Le NOC reste la cause de retard la plus fréquente : votre courtier doit l'anticiper." },
    ],
    ctaTitle: "Parlez à un courtier agréé RERA",
    ctaDesc: "Dites-nous si vous achetez, vendez ou investissez sur plan. Nous vous affectons le bon courtier, actons les conditions par écrit et menons la transaction jusqu'au titre de propriété.",
    ctaBtn: "Parler à un courtier",
    ctaWhatsApp: "Écrivez-nous sur WhatsApp",
    breadcrumbs: ["Accueil", "Services", "Courtier immobilier à Dubaï"],
  },

  vi: {
    metaTitle: "Môi giới bất động sản tại Dubai | Đăng ký RERA | Binayah",
    metaDesc: "Môi giới bất động sản đăng ký RERA tại Dubai: đại diện bên mua và bên bán, Form F (MOU), NOC của chủ đầu tư, sang tên tại DLD, phí 4% và hoa hồng thỏa thuận bằng văn bản. Hoạt động từ 2007.",
    heroLabel: "MÔI GIỚI BẤT ĐỘNG SẢN",
    h1: "Môi giới bất động sản tại Dubai",
    heroDesc: "Binayah là công ty môi giới đăng ký với RERA. Các môi giới bất động sản Dubai của chúng tôi đại diện cho bên của bạn trong giao dịch, đàm phán giá và điều khoản, chuẩn bị biểu mẫu RERA, và đưa giao dịch qua NOC và đăng ký tại DLD cho tới khi có sổ hồng.",
    heroCta: "Trao đổi với môi giới",
    stats: [
      { n: "19+", label: "Năm môi giới tại Dubai" },
      { n: "ORN 1162", label: "Đăng ký với RERA" },
      { n: "3.000+", label: "Bất động sản đang chào bán" },
      { n: "4%", label: "Phí sang tên tại DLD" },
    ],
    answerTitle: "Môi giới bất động sản tại Dubai thực sự làm gì?",
    answerBody: "Môi giới bất động sản tại Dubai là bên trung gian đăng ký với RERA, cơ quan quản lý thuộc Sở Đất đai Dubai, đại diện cho bên mua hoặc bên bán trong một giao dịch. Mỗi môi giới có Số đăng ký môi giới cá nhân (BRN) và làm việc dưới một công ty có Số đăng ký văn phòng (ORN); bạn có thể yêu cầu và kiểm tra cả hai. Trên thực tế, môi giới tìm kiếm hoặc tiếp thị bất động sản, kiểm tra sổ hồng và tài khoản phí dịch vụ, đàm phán giá và tiến độ thanh toán, chuẩn bị hồ sơ RERA (Form A với bên bán, Form B với bên mua, Form F cho MOU), phối hợp lấy Giấy không phản đối (NOC) của chủ đầu tư khi bán lại, và hoàn tất sang tên tại văn phòng trustee được DLD chấp thuận. Binayah hoạt động môi giới bất động sản Dubai từ năm 2007 với số RERA ORN 1162.",
    linksTitle: "Bước tiếp theo",
    links: [
      { label: "Đại lý bất động sản tại Dubai", href: "/services/real-estate-agency-dubai" },
      { label: "Bất động sản đang bán", href: "/buy" },
      { label: "Dự án hình thành trong tương lai", href: "/off-plan" },
      { label: "Bán bất động sản của bạn", href: "/sell" },
      { label: "Đội ngũ môi giới", href: "/team" },
      { label: "Hướng dẫn: mua bất động sản tại Dubai", href: "/pulse/guides/how-to-buy-property-in-dubai" },
      { label: "Hướng dẫn: các khoản phí DLD", href: "/pulse/guides/dld-fees-explained" },
      { label: "Hướng dẫn: hoa hồng môi giới tại Dubai", href: "/pulse/guides/dubai-property-agent-commission" },
    ],
    servicesTitle: "Môi giới của bạn xử lý những gì",
    services: [
      { icon: "🔎", title: "Đại diện bên mua", body: "Chúng tôi ghi nhận yêu cầu bằng văn bản, chọn lọc dựa trên giao dịch so sánh thực tế, tổ chức xem nhà và ký Form B để ghi rõ ai đại diện cho bạn và theo điều khoản nào." },
      { icon: "🏷️", title: "Đại diện bên bán", body: "Định giá từ các giao dịch đã đăng ký tại DLD, hợp đồng niêm yết Form A, tiếp thị trên các cổng thông tin và sàng lọc để chỉ khách mua đủ năng lực mới tới xem." },
      { icon: "🤝", title: "Đàm phán", body: "Giá chỉ là một đòn bẩy. Chúng tôi còn đàm phán cấu trúc thanh toán, ngày bàn giao, những gì để lại trong căn hộ, và ai chịu khoản phí sang tên 4% của DLD." },
      { icon: "📄", title: "Biểu mẫu RERA và thẩm định", body: "Form A, Form B, Form I giữa các môi giới hợp tác, và Form F cho MOU. Trước khi ký, chúng tôi kiểm tra sổ hồng, tài khoản phí dịch vụ và khoản thế chấp nếu có." },
      { icon: "🏦", title: "Tiền đặt cọc và ký quỹ", body: "Khoản cọc 10% khi ký MOU thường là séc ngân hàng do công ty môi giới hoặc tài khoản được quản lý giữ, không bao giờ vào tài khoản cá nhân của môi giới. Các đợt thanh toán dự án hình thành trong tương lai đi vào tài khoản ký quỹ do DLD giám sát." },
      { icon: "🏛️", title: "NOC và sang tên tại DLD", body: "Chúng tôi theo sát NOC của chủ đầu tư khi bán lại, đặt lịch tại văn phòng trustee, chuẩn bị séc ngân hàng và có mặt cho tới khi sổ hồng (hoặc đăng ký Oqood) được cấp." },
    ],
    processTitle: "Quy trình mua bất động sản tại Dubai theo từng bước",
    process: [
      { n: "01", title: "Xác định mục tiêu và danh sách rút gọn", body: "Xác định mục tiêu: lợi suất cho thuê, để ở, tăng giá vốn, hay ngưỡng 2 triệu AED cho Golden Visa, rồi chỉ xem những căn thật sự phù hợp. Môi giới xác nhận bất động sản nằm trong khu sở hữu vĩnh viễn." },
      { n: "02", title: "Chào giá và đàm phán", body: "Đề nghị được chuyển tới bên bán qua các môi giới, gồm giá, tiền cọc, tiến độ và phân chia chi phí. Ở bước này chưa có ràng buộc pháp lý." },
      { n: "03", title: "MOU / Form F và cọc 10%", body: "MOU được ký trên Form F của RERA và bên mua thường đặt cọc 10%, phổ biến bằng séc ngân hàng do môi giới giữ tới ngày sang tên. Form F cũng ấn định thời hạn hoàn tất giao dịch." },
      { n: "04", title: "NOC của chủ đầu tư", body: "Khi bán lại, chủ đầu tư cấp Giấy không phản đối xác nhận đã thanh toán hết phí dịch vụ. Thường mất khoảng 3–10 ngày làm việc, phí chủ đầu tư khoảng 500–5.000 AED. Mua trực tiếp dự án hình thành trong tương lai không cần NOC." },
      { n: "05", title: "Sang tên tại văn phòng trustee của DLD", body: "Bên mua, bên bán và ngân hàng (nếu có) gặp nhau tại văn phòng trustee được DLD chấp thuận. Phí 4%, phí trustee và phí cấp sổ được thanh toán bằng séc ngân hàng, và bên bán nhận tiền." },
      { n: "06", title: "Sổ hồng và bàn giao", body: "Sổ hồng mới đứng tên bạn, hoặc đăng ký tạm Oqood nếu là dự án hình thành trong tương lai, sau đó bàn giao chìa khóa, thẻ ra vào và tài khoản tiện ích." },
    ],
    costsTitle: "Chi phí giao dịch",
    costsNote: "Các khoản phí nhà nước do Sở Đất đai Dubai ấn định. Hoa hồng là thông lệ thị trường chứ không phải mức luật định, và chúng tôi ghi rõ bằng văn bản trước khi bạn cam kết.",
    costs: [
      { label: "Phí sang tên DLD", value: "4% giá mua" },
      { label: "Phí văn phòng trustee", value: "4.000 AED + VAT (2.000 nếu dưới 500K)" },
      { label: "Phí cấp sổ hồng", value: "540 AED" },
      { label: "Hoa hồng mua bán", value: "khoảng 2% + VAT, ghi bằng văn bản" },
      { label: "Hoa hồng cho thuê", value: "khoảng 5% tiền thuê năm + VAT" },
      { label: "Đăng ký thế chấp", value: "0,25% khoản vay + 290 AED" },
      { label: "NOC của chủ đầu tư", value: "khoảng 500–5.000 AED, chỉ khi bán lại" },
    ],
    plansTitle: "Chúng tôi có thể đại diện bạn thế nào",
    plans: [
      { name: "Đại diện bên mua", fee: "Form B", features: ["Yêu cầu tìm kiếm bằng văn bản", "Tư vấn giá theo giao dịch so sánh", "Xem nhà và chọn lọc", "Chào giá và đàm phán", "Kiểm tra sổ hồng và phí dịch vụ", "Đi cùng tới văn phòng trustee"] },
      { name: "Đại diện bên bán", fee: "Form A", features: ["Định giá từ giao dịch đã đăng ký DLD", "Hợp đồng niêm yết Form A", "Chụp ảnh và tiếp thị trên cổng thông tin", "Thẩm định năng lực bên mua", "Phối hợp NOC với chủ đầu tư", "Quản lý ngày sang tên"] },
      { name: "Mua dự án hình thành trong tương lai", fee: "Trực tiếp từ chủ đầu tư", features: ["Thẩm định chủ đầu tư và dự án", "So sánh tiến độ thanh toán", "Thanh toán vào tài khoản ký quỹ DLD", "Đăng ký tạm Oqood", "Không cần NOC", "Hỗ trợ bàn giao và nghiệm thu"] },
    ],
    whyTitle: "Môi giới Binayah làm việc thế nào",
    whyPoints: [
      { title: "Đăng ký RERA, ORN 1162", body: "Binayah hoạt động theo Số đăng ký văn phòng RERA 1162 và các đại lý được chứng nhận RERA. Hãy hỏi bất kỳ môi giới nào về BRN, bạn có thể kiểm tra trên ứng dụng Dubai REST." },
      { title: "Môi giới từ năm 2007", body: "Hơn 19 năm giao dịch tại Dubai: căn hộ sở hữu vĩnh viễn, biệt thự, nhà phố và các đợt mở bán dự án." },
      { title: "Hoa hồng ghi bằng văn bản", body: "Khoảng 2% cộng VAT khi mua bán là thông lệ thị trường. Mức đã thỏa thuận được đưa vào hợp đồng môi giới trước khi giao dịch tiến hành, không điều chỉnh vào ngày sang tên." },
      { title: "Kiểm tra trước khi ký", body: "Sổ hồng, tình trạng thế chấp, tài khoản phí dịch vụ và rủi ro NOC đều được kiểm tra trước MOU chứ không phải sau. Đây chính là nơi giao dịch bán lại thường tắc." },
      { title: "Đội ngũ đa ngôn ngữ", body: "Môi giới của chúng tôi làm việc bằng tiếng Anh, Ả Rập, Nga, Pháp và Trung, và trang web phục vụ bảy ngôn ngữ." },
      { title: "Hơn 3.000 bất động sản", body: "Hàng sẵn sàng bàn giao và dự án hình thành trong tương lai trên khắp các khu sở hữu vĩnh viễn của Dubai, cùng quyền tiếp cận trực tiếp các đợt mở bán." },
    ],
    faqTitle: "Câu hỏi thường gặp",
    faqs: [
      { question: "Môi giới và đại lý bất động sản tại Dubai khác nhau thế nào?", answer: "Trong đời sống hằng ngày hai từ này gần như đồng nghĩa. Về mặt chính thức, công ty môi giới là văn phòng được cấp phép và đăng ký với RERA theo Số đăng ký văn phòng (ORN), còn cá nhân làm việc cho công ty đó giữ Số đăng ký môi giới (BRN). Khi tìm môi giới bất động sản tại Dubai, người ta thường muốn nói tới cá nhân được cấp phép sẽ đại diện cho mình, và người đó phải có BRN hợp lệ, làm việc dưới một công ty đã đăng ký." },
      { question: "Môi giới bất động sản tại Dubai có bắt buộc đăng ký RERA không?", answer: "Có. Chỉ những đại lý đăng ký với RERA, cơ quan quản lý thuộc Sở Đất đai Dubai, mới được phép môi giới bất động sản tại Dubai. Môi giới đã đăng ký giữ BRN và sử dụng các biểu mẫu chính thức: Form A với bên bán, Form B với bên mua, Form I giữa các môi giới hợp tác và Form F cho MOU. Bạn có quyền yêu cầu xem BRN và kiểm tra; nếu không xuất trình được thì nên dừng lại." },
      { question: "Môi giới bất động sản tại Dubai lấy hoa hồng bao nhiêu?", answer: "Với giao dịch mua bán, hoa hồng thường khoảng 2% giá mua cộng VAT. Với cho thuê, thường khoảng 5% tiền thuê năm cộng VAT. Đây là thông lệ thị trường chứ không phải mức luật định, nên con số có thể trao đổi và cần được ghi vào hợp đồng môi giới trước khi giao dịch tiến hành." },
      { question: "Ai trả khoản phí sang tên 4% của DLD?", answer: "Sở Đất đai Dubai thu 4% giá đã thỏa thuận khi đăng ký. Tỷ lệ này cố định và không có miễn trừ, nhưng ai trả thì có thể đàm phán. Trên thực tế, bên mua trả toàn bộ 4% trong phần lớn giao dịch. Hãy dự trù 5–7% tổng cộng sau khi cộng phí trustee (4.000 AED + VAT), phí cấp sổ (540 AED) và hoa hồng." },
      { question: "Form F là gì và MOU là gì?", answer: "Form F là Biên bản ghi nhớ chuẩn của RERA, tức hợp đồng mua bán giữa bên mua và bên bán. Nó ghi giá, tiền cọc, thời hạn hoàn tất và ai chịu khoản chi phí nào. Form F được ký sau khi thống nhất điều khoản, thường kèm khoản cọc khoảng 10%, và là tài liệu mà văn phòng trustee dựa vào trong ngày sang tên." },
      { question: "Tiền cọc của tôi được giữ ở đâu trước khi sang tên?", answer: "Khi bán lại, khoản cọc 10% theo MOU thường là séc ngân hàng do công ty môi giới (hoặc tài khoản được quản lý) giữ tới ngày sang tên, và không bao giờ được vào tài khoản cá nhân của môi giới. Với dự án hình thành trong tương lai, tiền đi vào tài khoản ký quỹ của dự án dưới sự giám sát của Sở Đất đai Dubai và chỉ được giải ngân cho chủ đầu tư theo tiến độ xây dựng, nhờ đó bảo vệ dòng tiền của bạn." },
      { question: "Tôi có cần NOC không và mất bao lâu?", answer: "Bạn cần Giấy không phản đối của chủ đầu tư cho các giao dịch bán lại trên thị trường thứ cấp; nếu thiếu, DLD sẽ không đăng ký sang tên. Giấy này xác nhận đã thanh toán phí dịch vụ và không còn phạt hay khiếu nại. Thường mất 3–10 ngày làm việc sau khi thanh toán hết nợ, phí chủ đầu tư khoảng 500 đến 5.000 AED. Mua trực tiếp dự án hình thành trong tương lai thì không cần." },
      { question: "Mua bất động sản tại Dubai mất bao lâu?", answer: "Với bất động sản đã bàn giao, giao dịch thường hoàn tất trong khoảng 2–6 tuần từ lúc chốt điều khoản tới khi có sổ hồng, với điều kiện tài chính đã sẵn sàng và NOC không bị chậm. Mua bằng tiền mặt là nhanh nhất; vay ngân hàng cộng thêm thời gian thẩm định và phê duyệt. NOC là nguyên nhân chậm trễ phổ biến nhất, nên môi giới cần nêu vấn đề này sớm." },
    ],
    ctaTitle: "Trao đổi với môi giới đăng ký RERA",
    ctaDesc: "Hãy cho chúng tôi biết bạn đang mua, bán hay đầu tư dự án hình thành trong tương lai. Chúng tôi sẽ phân công đúng môi giới, ghi rõ điều khoản bằng văn bản và theo giao dịch tới khi có sổ hồng.",
    ctaBtn: "Trao đổi với môi giới",
    ctaWhatsApp: "WhatsApp ngay",
    breadcrumbs: ["Trang chủ", "Dịch vụ", "Môi giới bất động sản tại Dubai"],
  },

  he: {
    metaTitle: "מתווך נדל\"ן בדובאי | רשום ב-RERA | Binayah",
    metaDesc: "מתווך נדל\"ן בדובאי הרשום ב-RERA: ייצוג קונים ומוכרים, טופס F (MOU), אישור NOC מהיזם, העברת בעלות ב-DLD, אגרת 4% ועמלה מוסכמת בכתב. פועלים מאז 2007.",
    heroLabel: "מתווך נדל\"ן",
    h1: "מתווך נדל\"ן בדובאי",
    heroDesc: "Binayah היא חברת תיווך הרשומה ב-RERA. מתווכי הנדל\"ן שלנו בדובאי מייצגים את הצד שלכם בעסקה, מנהלים משא ומתן על המחיר והתנאים, מכינים את טפסי RERA ומלווים את העסקה דרך אישור ה-NOC ורישום ב-DLD ועד לקבלת שטר הבעלות.",
    heroCta: "דברו עם מתווך",
    stats: [
      { n: "19+", label: "שנות תיווך בדובאי" },
      { n: "ORN 1162", label: "רישום ב-RERA" },
      { n: "3,000+", label: "נכסים פעילים" },
      { n: "4%", label: "אגרת העברה ב-DLD" },
    ],
    answerTitle: "מה מתווך נדל\"ן בדובאי באמת עושה?",
    answerBody: "מתווך נדל\"ן בדובאי הוא מתווך הרשום ב-RERA, הזרוע הרגולטורית של רשות הקרקעות של דובאי (DLD), המייצג את הקונה או את המוכר בעסקה. לכל מתווך יש מספר רישום אישי (BRN), והוא פועל תחת חברה בעלת מספר רישום משרד (ORN), ואת שניהם אפשר לבקש ולאמת. בפועל המתווך מאתר או משווק את הנכס, בודק את שטר הבעלות ואת חשבון דמי הניהול, מנהל משא ומתן על המחיר ולוח התשלומים, מכין את מסמכי RERA (טופס A מול מוכר, טופס B מול קונה וטופס F ל-MOU), מסדיר את אישור ה-NOC מהיזם בעסקאות יד שנייה, ומשלים את העברת הבעלות במשרד נאמן מאושר מטעם ה-DLD. Binayah עוסקת בתיווך נדל\"ן בדובאי מאז 2007 תחת מספר RERA ORN 1162.",
    linksTitle: "צעדים מומלצים",
    links: [
      { label: "סוכנות נדל\"ן בדובאי", href: "/services/real-estate-agency-dubai" },
      { label: "נכסים למכירה", href: "/buy" },
      { label: "פרויקטים על הנייר", href: "/off-plan" },
      { label: "מכירת הנכס שלכם", href: "/sell" },
      { label: "המתווכים שלנו", href: "/team" },
      { label: "מדריך: איך קונים נכס בדובאי", href: "/pulse/guides/how-to-buy-property-in-dubai" },
      { label: "מדריך: אגרות ה-DLD", href: "/pulse/guides/dld-fees-explained" },
      { label: "מדריך: עמלת תיווך בדובאי", href: "/pulse/guides/dubai-property-agent-commission" },
    ],
    servicesTitle: "מה המתווך שלכם מטפל בו",
    services: [
      { icon: "🔎", title: "ייצוג הקונה", body: "אנו מגדירים בכתב את דרישות החיפוש, מסננים לפי עסקאות השוואה אמיתיות, מקיימים את הסיורים וחותמים על טופס B כך שמתועד מי מייצג אתכם ובאילו תנאים." },
      { icon: "🏷️", title: "ייצוג המוכר", body: "תמחור לפי עסקאות שנרשמו לאחרונה ב-DLD, הסכם תיווך בטופס A, שיווק בפורטלים וסינון כך שרק קונים מתאימים מגיעים לנכס." },
      { icon: "🤝", title: "משא ומתן", body: "המחיר הוא רק מרכיב אחד. אנו מנהלים משא ומתן גם על מבנה התשלומים, מועד המסירה, מה נשאר בדירה ומי נושא באגרת ה-DLD בשיעור 4%." },
      { icon: "📄", title: "טפסי RERA ובדיקת נאותות", body: "טופס A, טופס B, טופס I בין מתווכים משתפי פעולה וטופס F ל-MOU. לפני החתימה אנו בודקים את שטר הבעלות, חשבון דמי הניהול ומשכנתא רשומה על היחידה." },
      { icon: "🏦", title: "פיקדון ונאמנות", body: "פיקדון של 10% במעמד ה-MOU ניתן בדרך כלל בהמחאה בנקאית המוחזקת אצל המתווך או בחשבון מפוקח, ולעולם לא בחשבון פרטי של סוכן. תשלומים בפרויקטים על הנייר מועברים לחשבון הנאמנות של הפרויקט בפיקוח ה-DLD." },
      { icon: "🏛️", title: "NOC והעברה ב-DLD", body: "אנו מטפלים בהשגת ה-NOC מהיזם בעסקאות יד שנייה, קובעים תור במשרד הנאמן, מרכזים את ההמחאות הבנקאיות ונשארים עד להנפקת שטר הבעלות (או רישום Oqood)." },
    ],
    processTitle: "תהליך הרכישה בדובאי, שלב אחר שלב",
    process: [
      { n: "01", title: "הגדרת מטרה ורשימה מצומצמת", body: "מגדירים את המטרה, תשואה, מגורים, עליית ערך או סף 2 מיליון דירהם לויזת הזהב, ורק אז יוצאים לסיורים מתאימים. המתווך מוודא שהנכס נמצא באזור בעלות מלאה." },
      { n: "02", title: "הצעה ומשא ומתן", body: "ההצעה מועברת למוכר דרך המתווכים וכוללת מחיר, פיקדון, לוח זמנים וחלוקת עלויות. בשלב זה עדיין אין התחייבות מחייבת." },
      { n: "03", title: "MOU / טופס F ופיקדון 10%", body: "ה-MOU נחתם על טופס F של RERA והקונה משלם בדרך כלל פיקדון של 10%, לרוב בהמחאה בנקאית המוחזקת אצל המתווך עד להעברה. טופס F קובע גם את המועד האחרון להשלמת העסקה." },
      { n: "04", title: "אישור NOC מהיזם", body: "בעסקת יד שנייה היזם מנפיק אישור אי-התנגדות המאשר שדמי הניהול שולמו. בדרך כלל 3–10 ימי עבודה ואגרת יזם של כ-500 עד 5,000 דירהם. רכישה על הנייר ישירות מהיזם אינה מצריכה NOC." },
      { n: "05", title: "העברה במשרד הנאמן של ה-DLD", body: "הקונה, המוכר והבנק נפגשים במשרד נאמן מאושר. אגרת ה-4%, אגרת הנאמן ואגרת שטר הבעלות משולמות בהמחאות בנקאיות, והמוכר מקבל את התמורה." },
      { n: "06", title: "שטר בעלות ומסירה", body: "שטר הבעלות החדש מונפק על שמכם, או רישום Oqood זמני בנכס על הנייר, ולאחר מכן נמסרים המפתחות, כרטיסי הכניסה וחשבונות התשתיות." },
    ],
    costsTitle: "עלויות העסקה",
    costsNote: "האגרות הממשלתיות נקבעות על ידי רשות הקרקעות של דובאי. העמלה היא נוהג שוק ולא שיעור הקבוע בחוק, ואנו מעגנים אותה בכתב לפני שאתם מתחייבים.",
    costs: [
      { label: "אגרת העברה ב-DLD", value: "4% ממחיר הרכישה" },
      { label: "אגרת משרד הנאמן", value: "4,000 דירהם + מע\"מ (2,000 מתחת ל-500K)" },
      { label: "הנפקת שטר בעלות", value: "540 דירהם" },
      { label: "עמלת תיווך במכירה", value: "כ-2% + מע\"מ, מעוגן בכתב" },
      { label: "עמלת תיווך בהשכרה", value: "כ-5% מדמי השכירות השנתיים + מע\"מ" },
      { label: "רישום משכנתא", value: "0.25% מסכום ההלוואה + 290 דירהם" },
      { label: "אישור NOC מהיזם", value: "כ-500 עד 5,000 דירהם, ביד שנייה בלבד" },
    ],
    plansTitle: "כיצד נוכל לייצג אתכם",
    plans: [
      { name: "ייצוג קונה", fee: "טופס B", features: ["הגדרת חיפוש בכתב", "חוות דעת מחיר לפי עסקאות השוואה", "סיורים וסינון", "הצעה ומשא ומתן", "בדיקת בעלות ודמי ניהול", "ליווי במשרד הנאמן"] },
      { name: "ייצוג מוכר", fee: "טופס A", features: ["הערכת שווי לפי עסקאות רשומות ב-DLD", "הסכם תיווך בטופס A", "צילום מקצועי ושיווק בפורטלים", "סינון קונים", "תיאום NOC מול היזם", "ניהול יום ההעברה"] },
      { name: "רכישה על הנייר", fee: "ישירות מהיזם", features: ["בדיקת היזם והפרויקט", "השוואת תוכניות תשלום", "תשלומים לחשבון נאמנות של ה-DLD", "רישום Oqood זמני", "אין צורך ב-NOC", "ליווי במסירה ובבדק"] },
    ],
    whyTitle: "כך עובדים המתווכים של Binayah",
    whyPoints: [
      { title: "רשומים ב-RERA, ORN 1162", body: "Binayah פועלת תחת מספר רישום משרד RERA 1162 והסוכנים שלנו מוסמכי RERA. בקשו מכל מתווך את מספר ה-BRN שלו, ניתן לאמת אותו באפליקציית Dubai REST." },
      { title: "בתיווך מאז 2007", body: "יותר מ-19 שנות עסקאות בדובאי: דירות בבעלות מלאה, וילות, בתי עיר ופרויקטים על הנייר." },
      { title: "עמלה מעוגנת בכתב", body: "כ-2% בתוספת מע\"מ בעסקת מכר הוא נוהג השוק. מה שסוכם נכנס להסכם התיווך לפני שהעסקה מתקדמת, ללא שינויים במשרד הנאמן." },
      { title: "בדיקות לפני החתימה", body: "שטר הבעלות, מצב המשכנתא, חשבון דמי הניהול וסיכון ה-NOC נבדקים לפני ה-MOU ולא אחריו. שם בדיוק נתקעות רוב עסקאות יד שנייה." },
      { title: "צוות רב-לשוני", body: "המתווכים שלנו עובדים באנגלית, ערבית, רוסית, צרפתית וסינית, והאתר מוגש בשבע שפות." },
      { title: "יותר מ-3,000 נכסים", body: "מלאי מוכן ועל הנייר בכל קהילות הבעלות המלאה בדובאי, לצד גישה ישירה להשקות חדשות של יזמים." },
    ],
    faqTitle: "שאלות נפוצות",
    faqs: [
      { question: "מה ההבדל בין מתווך נדל\"ן לסוכן נדל\"ן בדובאי?", answer: "בשפה היומיומית המונחים חופפים. באופן רשמי, חברת התיווך היא המשרד המורשה הרשום ב-RERA תחת מספר רישום משרד (ORN), ואילו האדם שעובד בה מחזיק במספר רישום מתווך (BRN). כשמחפשים מתווך נדל\"ן בדובאי מתכוונים בדרך כלל לאדם המורשה שייצג אתכם בעסקה, והוא חייב להחזיק ב-BRN בתוקף ולפעול תחת חברה רשומה." },
      { question: "האם מתווך נדל\"ן בדובאי חייב להיות רשום ב-RERA?", answer: "כן. רק סוכנים הרשומים ב-RERA, הזרוע הרגולטורית של רשות הקרקעות של דובאי, רשאים לעסוק בתיווך נדל\"ן בדובאי כחוק. מתווך רשום מחזיק ב-BRN ומשתמש בטפסי RERA הרשמיים: טופס A מול המוכר, טופס B מול הקונה, טופס I בין מתווכים וטופס F ל-MOU. אפשר לבקש לראות את ה-BRN ולאמת אותו, ומי שאינו יכול להציגו, זו סיבה לעצור." },
      { question: "כמה עמלה גובים מתווכי נדל\"ן בדובאי?", answer: "בעסקת מכר העמלה עומדת בדרך כלל על כ-2% ממחיר הרכישה בתוספת מע\"מ. בהשכרה, כ-5% מדמי השכירות השנתיים בתוספת מע\"מ. אלה נהגי שוק ולא שיעורים הקבועים בחוק, ולכן הסכום ניתן לדיון ויש לעגן אותו בהסכם התיווך לפני שהעסקה מתקדמת." },
      { question: "מי משלם את אגרת ההעברה של 4%?", answer: "רשות הקרקעות של דובאי גובה 4% ממחיר הרכישה המוסכם במעמד הרישום. השיעור קבוע ואין פטורים, אך אפשר לנהל משא ומתן על מי משלם. בפועל, ברוב המכריע של העסקאות הקונה משלם את מלוא ה-4%. תכננו 5%-7% בסך הכול בתוספת אגרת הנאמן (4,000 דירהם + מע\"מ), אגרת שטר הבעלות (540 דירהם) והעמלה." },
      { question: "מהו טופס F ומהו ה-MOU?", answer: "טופס F הוא מזכר ההבנות התקני של RERA, כלומר הסכם המכר בין הקונה למוכר. הוא מעגן את המחיר, הפיקדון, המועד האחרון להשלמת העסקה וחלוקת העלויות. הוא נחתם לאחר שהתנאים סוכמו, בדרך כלל יחד עם פיקדון של כ-10%, והוא המסמך שמשרד הנאמן פועל לפיו ביום ההעברה." },
      { question: "היכן מוחזק הפיקדון שלי עד ההעברה?", answer: "בעסקת יד שנייה, פיקדון ה-10% ניתן בדרך כלל בהמחאה בנקאית המוחזקת אצל המתווך או בחשבון מפוקח עד להעברה, ולעולם אינו אמור להגיע לחשבון פרטי של סוכן. ברכישה על הנייר התשלומים מועברים לחשבון הנאמנות של הפרויקט בפיקוח רשות הקרקעות של דובאי ומשוחררים ליזם בהתאם לאבני דרך בבנייה, וכך הכסף שלכם מוגן במהלך הבנייה." },
      { question: "האם אני צריך NOC וכמה זמן זה לוקח?", answer: "אישור אי-התנגדות מהיזם נדרש בעסקאות יד שנייה, ובלעדיו ה-DLD לא ירשום את ההעברה. הוא מאשר שדמי הניהול שולמו ואין קנסות או התנגדויות פתוחות. בדרך כלל 3–10 ימי עבודה לאחר סילוק חובות, ואגרת היזם נעה בדרך כלל בין כ-500 ל-5,000 דירהם. רכישה על הנייר ישירות מהיזם אינה מצריכה NOC." },
      { question: "כמה זמן לוקחת רכישת נכס בדובאי?", answer: "רכישת נכס מוכן מסתיימת בדרך כלל תוך 2–6 שבועות מרגע סיכום התנאים ועד שטר הבעלות, בהנחה שהמימון מוכן וה-NOC אינו מתעכב. עסקאות במזומן מהירות ביותר, ומשכנתא מוסיפה זמן לשמאות ולאישור הבנק. ה-NOC הוא הגורם הנפוץ ביותר לעיכוב, ולכן על המתווך להעלות אותו מוקדם." },
    ],
    ctaTitle: "דברו עם מתווך רשום ב-RERA",
    ctaDesc: "ספרו לנו אם אתם קונים, מוכרים או משקיעים על הנייר. נשבץ את המתווך המתאים, נעגן את התנאים בכתב ונלווה את העסקה עד לשטר הבעלות.",
    ctaBtn: "דברו עם מתווך",
    ctaWhatsApp: "כתבו לנו בוואטסאפ",
    breadcrumbs: ["דף הבית", "שירותים", "מתווך נדל\"ן בדובאי"],
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
      ? ["брокер по недвижимости в дубае", "брокер недвижимости дубай", "брокеры по недвижимости дубай", "риелтор дубай", "агент по недвижимости дубай"]
      : locale === "ar"
      ? ["وسيط عقاري في دبي", "وسيط عقاري دبي", "وسطاء عقاريون في دبي", "وكيل عقاري دبي", "شركة وساطة عقارية دبي"]
      : locale === "zh"
      ? ["迪拜房产经纪", "迪拜房地产经纪人", "迪拜房产中介", "迪拜买房经纪", "迪拜持牌经纪"]
      : locale === "vi"
      ? ["môi giới bất động sản dubai", "môi giới bđs tại dubai", "công ty môi giới dubai", "đại lý bất động sản dubai"]
      : locale === "fr"
      ? ["courtier immobilier dubaï", "courtier immobilier à dubaï", "agent immobilier dubaï", "courtiers immobiliers dubaï"]
      : locale === "he"
      ? ["מתווך נדל\"ן בדובאי", "מתווך נדלן דובאי", "מתווכי נדל\"ן בדובאי", "סוכן נדל\"ן דובאי"]
      : ["real estate broker in dubai", "real estate broker dubai", "real estate brokers dubai", "dubai property broker", "property brokers in dubai", "rera registered broker dubai"],
  };
}

export default async function RealEstateBrokerDubaiPage({ params }: Props) {
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
        serviceType="Real Estate Brokerage"
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
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{c.answerBody}</p>
            <div className="mt-6 pt-5 border-t border-border/40">
              <p className="text-xs font-bold text-accent tracking-[0.25em] uppercase mb-3">{c.linksTitle}</p>
              <div className="flex flex-wrap gap-2">
                {c.links.map((l) => (
                  <Link
                    key={l.href}
                    href={`${lp}${l.href}`}
                    className="inline-flex items-center rounded-full border border-border/60 px-3.5 py-1.5 text-xs font-semibold text-foreground hover:border-primary/40 hover:text-primary transition-colors"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Services */}
        <section>
          <div className="text-center mb-12">
            <p className="text-accent font-bold tracking-[0.35em] uppercase text-xs mb-3">Broker Role</p>
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

        {/* Process */}
        <section>
          <div className="text-center mb-12">
            <p className="text-accent font-bold tracking-[0.35em] uppercase text-xs mb-3">Process</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">{c.processTitle}</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {c.process.map((step) => (
              <div key={step.n} className="bg-card border border-border/50 rounded-2xl p-6 hover:border-primary/20 transition-all">
                <p className="text-2xl font-black text-primary/25 mb-2">{step.n}</p>
                <h3 className="text-base font-bold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Costs */}
        <section>
          <div className="text-center mb-12">
            <p className="text-accent font-bold tracking-[0.35em] uppercase text-xs mb-3">Costs</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">{c.costsTitle}</h2>
          </div>
          <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
            {c.costs.map((row) => (
              <div key={row.label} className="flex flex-wrap items-baseline justify-between gap-3 px-5 sm:px-7 py-4 border-b border-border/30 last:border-b-0">
                <span className="text-sm font-semibold text-foreground">{row.label}</span>
                <span className="text-sm text-muted-foreground">{row.value}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed mt-4">{c.costsNote}</p>
        </section>

        {/* Representation tiers */}
        <section>
          <div className="text-center mb-12">
            <p className="text-accent font-bold tracking-[0.35em] uppercase text-xs mb-3">Representation</p>
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
                <p className="text-xs font-bold text-primary tracking-widest uppercase mb-4">{plan.fee}</p>
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
