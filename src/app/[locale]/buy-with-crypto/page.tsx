/* eslint-disable i18next/no-literal-string -- multilingual SEO landing page, content stored inline per locale */
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { FAQJsonLd, BreadcrumbJsonLd } from "@/components/JsonLd";
import { canonical, altLangs, AE_URL } from "@/lib/site";

export const revalidate = 86400;

// ─────────────────────────────────────────────────────────────
// Content per locale
// ─────────────────────────────────────────────────────────────

const CONTENT = {
  en: {
    metaTitle: "Buy Property in Dubai with Bitcoin & Cryptocurrency | Binayah",
    metaDescription: "Purchase Dubai real estate with Bitcoin, Ethereum, USDT and other cryptocurrencies. Legal, DLD-compliant transactions. Expert guidance from Binayah Properties since 2007.",
    heroLabel: "NOW ACCEPTING",
    heroTitle: "Buy Property in Dubai",
    heroTitleSub: "with Bitcoin & Cryptocurrency",
    heroDesc: "Binayah Properties facilitates legally compliant cryptocurrency real estate transactions in Dubai — from off-plan projects to ready secondary market properties.",
    heroCta: "Get Free Consultation",
    coins: ["Bitcoin (BTC)", "Ethereum (ETH)", "Tether (USDT)", "USD Coin (USDC)", "Ripple (XRP)", "BNB"],
    coinsLabel: "Accepted Cryptocurrencies",
    howTitle: "How It Works",
    steps: [
      { n: "01", title: "Choose Your Property", body: "Browse 2,500+ listings and off-plan projects. Our agents will shortlist properties that match your budget and investment goals." },
      { n: "02", title: "Legal & Compliance Check", body: "We verify your crypto source documentation (AML/KYC) and coordinate with the developer or seller to confirm crypto acceptance." },
      { n: "03", title: "Secure Transaction", body: "Funds are transferred via a licensed crypto exchange or direct wallet transfer. The amount is converted to AED at the agreed rate for the DLD transfer." },
      { n: "04", title: "DLD Registration", body: "The property is registered at the Dubai Land Department in your name. You receive the title deed — fully legal ownership." },
    ],
    whyTitle: "Why Dubai for Crypto Real Estate",
    whyPoints: [
      { title: "Legal Framework", body: "Dubai's Virtual Assets Regulatory Authority (VARA) regulates crypto transactions. The UAE has no capital gains tax or income tax on property." },
      { title: "0% Tax", body: "No capital gains tax, no property tax, no income tax in the UAE. Your crypto-to-property investment grows tax-free." },
      { title: "DLD Compliant", body: "Transactions are registered at the Dubai Land Department. Your ownership is fully documented with an official title deed." },
      { title: "Global Access", body: "No restrictions for Russian, Chinese, European or any other nationality. Crypto is a borderless payment method — ideal for international investors." },
      { title: "Golden Visa", body: "Invest AED 2M+ (≈ $545K) in property and qualify for a 10-year UAE Golden Visa — with cryptocurrency as your payment method." },
      { title: "High ROI", body: "Dubai offers 5–10% gross rental yields, one of the world's highest. Off-plan prices have risen 40–60% in key areas since 2021." },
    ],
    faqTitle: "Frequently Asked Questions",
    faqs: [
      { q: "Is it legal to buy property in Dubai with cryptocurrency?", a: "Yes. The UAE's Virtual Assets Regulatory Authority (VARA) provides a clear legal framework for crypto transactions. Multiple Dubai developers and the Dubai Land Department (DLD) facilitate crypto property purchases. The transaction must comply with AML/KYC regulations, but there are no legal barriers for international buyers." },
      { q: "Which cryptocurrencies are accepted for Dubai property?", a: "Bitcoin (BTC), Ethereum (ETH), Tether (USDT), USD Coin (USDC), Ripple (XRP) and BNB are the most commonly accepted. USDT (stablecoin) is particularly popular as it eliminates price volatility risk during the transaction period." },
      { q: "Do I need to convert cryptocurrency to AED for the DLD transfer?", a: "Yes. The Dubai Land Department records transactions in AED. Your cryptocurrency is typically converted to AED at an agreed exchange rate on the transaction date, either through a licensed UAE crypto exchange or a developer-facilitated conversion. The conversion is handled by your Binayah agent." },
      { q: "Are there any taxes on crypto property purchases in Dubai?", a: "The UAE has no capital gains tax, no income tax, and no wealth tax. There is a one-time DLD transfer fee of 4% (paid on the AED equivalent), and an agency fee of approximately 2%. There are no taxes on crypto gains or the property purchase itself." },
      { q: "What is the minimum investment for buying Dubai property with crypto?", a: "You can purchase from AED 500,000 (approximately $136,000 or ₿2 at current rates) for studio apartments. For the 10-year UAE Golden Visa, the minimum property value is AED 2,000,000 (approximately $545,000)." },
      { q: "Can Russian citizens buy Dubai property with cryptocurrency?", a: "Absolutely. There are no restrictions for Russian nationals buying property in Dubai. Cryptocurrency is an especially convenient payment method for Russian investors given international banking limitations. We handle the full process including AML documentation." },
      { q: "How long does the crypto property purchase process take?", a: "For off-plan properties: 2–4 weeks from agreement to booking. For secondary market properties: 3–6 weeks for full transfer. The crypto transfer itself typically takes 1–3 business days once all documentation is in order." },
      { q: "Which Dubai areas are best for crypto real estate investment?", a: "Dubai Marina, Downtown Dubai, Business Bay, Palm Jumeirah and Jumeirah Village Circle (JVC) are top picks. Off-plan projects by Emaar, DAMAC and Sobha offer flexible payment plans where crypto is accepted for the initial down payment." },
    ],
    ctaTitle: "Ready to Invest?",
    ctaDesc: "Our crypto real estate specialists are available 7 days a week. Get a personalised consultation and property shortlist.",
    ctaBtn: "Contact a Crypto Specialist",
    breadcrumb: "Buy with Crypto",
  },
  ru: {
    metaTitle: "Купить недвижимость в Дубае за криптовалюту | Bitcoin | Binayah",
    metaDescription: "Купите квартиру, виллу или новостройку в Дубае за биткоин, эфириум, USDT. Легальные сделки через DLD. Без налогов. Эксперты Binayah Properties с 2007 года.",
    heroLabel: "ТЕПЕРЬ ПРИНИМАЕМ",
    heroTitle: "Купите недвижимость в Дубае",
    heroTitleSub: "за Bitcoin и криптовалюту",
    heroDesc: "Binayah Properties оформляет юридически чистые сделки с недвижимостью в Дубае за криптовалюту — от новостроек до вторичного рынка. Полное сопровождение на русском языке.",
    heroCta: "Бесплатная консультация",
    coins: ["Bitcoin (BTC)", "Ethereum (ETH)", "Tether (USDT)", "USD Coin (USDC)", "Ripple (XRP)", "BNB"],
    coinsLabel: "Принимаемые криптовалюты",
    howTitle: "Как это работает",
    steps: [
      { n: "01", title: "Выбор объекта", body: "Просматривайте более 2500 объектов и новостроек. Наши агенты подберут варианты под ваш бюджет и инвестиционные цели." },
      { n: "02", title: "Юридическая проверка", body: "Проверяем документы о происхождении криптовалюты (AML/KYC) и согласовываем с застройщиком или продавцом условия оплаты." },
      { n: "03", title: "Безопасная сделка", body: "Средства переводятся через лицензированную крипто-биржу или напрямую с кошелька. Сумма конвертируется в дирхамы по согласованному курсу для регистрации в DLD." },
      { n: "04", title: "Регистрация в DLD", body: "Недвижимость регистрируется в Земельном департаменте Дубая на ваше имя. Вы получаете правоустанавливающий документ — полноценное право собственности." },
    ],
    whyTitle: "Почему Дубай для крипто-инвестиций",
    whyPoints: [
      { title: "Правовая база", body: "Управление виртуальными активами ОАЭ (VARA) регулирует криптовалютные операции. Дубай — один из самых крипто-дружественных городов в мире." },
      { title: "0% налогов", body: "В ОАЭ нет налога на прирост капитала, налога на имущество и подоходного налога. Ваши инвестиции растут без налогов." },
      { title: "Регистрация в DLD", body: "Все сделки регистрируются в Земельном департаменте Дубая. Вы получаете официальный правоустанавливающий документ." },
      { title: "Для граждан России", body: "Никаких ограничений для российских граждан. Криптовалюта — удобный инструмент в условиях международных банковских ограничений." },
      { title: "Золотая виза", body: "Инвестируйте от 2 млн AED (≈$545 тыс.) в недвижимость и получите 10-летнюю Золотую визу ОАЭ. Оплата криптовалютой — доступна." },
      { title: "Высокая доходность", body: "Дубай предлагает 5–10% годовых от аренды — один из лучших показателей в мире. Новостройки в ключевых районах выросли на 40–60% с 2021 года." },
    ],
    faqTitle: "Часто задаваемые вопросы",
    faqs: [
      { q: "Законно ли покупать недвижимость в Дубае за криптовалюту?", a: "Да. Управление виртуальными активами ОАЭ (VARA) обеспечивает чёткую правовую базу для криптовалютных сделок. Несколько застройщиков Дубая и Земельный департамент (DLD) уже принимают криптовалюту. Сделки соответствуют требованиям AML/KYC, юридических барьеров для иностранных покупателей нет." },
      { q: "Какие криптовалюты принимаются при покупке недвижимости?", a: "Bitcoin (BTC), Ethereum (ETH), Tether (USDT), USD Coin (USDC), Ripple (XRP) и BNB. Наиболее популярен USDT (стейблкоин), так как он исключает волатильность цены в период оформления сделки." },
      { q: "Нужно ли конвертировать криптовалюту в дирхамы?", a: "Да. Земельный департамент Дубая регистрирует сделки в дирхамах (AED). Криптовалюта конвертируется по согласованному курсу на дату сделки через лицензированную биржу ОАЭ или при содействии застройщика. Конвертацию организует ваш агент Binayah." },
      { q: "Нужно ли платить налоги при покупке недвижимости за криптовалюту в ОАЭ?", a: "В ОАЭ нет налога на прирост капитала, подоходного налога и налога на богатство. Единовременный сбор DLD составляет 4% (от суммы в дирхамах) и агентская комиссия около 2%. Никаких налогов на крипто-доходы или саму покупку недвижимости." },
      { q: "Какова минимальная сумма инвестиций?", a: "Студии доступны от 500 000 AED (около $136 000 или ₿2 по текущему курсу). Для 10-летней Золотой визы ОАЭ минимальная стоимость недвижимости — 2 000 000 AED (около $545 000)." },
      { q: "Могут ли граждане России купить недвижимость в Дубае за криптовалюту?", a: "Абсолютно. Ограничений для граждан России нет. Криптовалюта — особенно удобный способ оплаты с учётом международных банковских ограничений. Мы берём на себя всё оформление, включая AML-документацию, на русском языке." },
      { q: "Сколько времени занимает покупка?", a: "Новостройки: 2–4 недели от подписания договора до бронирования. Вторичный рынок: 3–6 недель до полного переоформления права собственности. Сам перевод криптовалюты занимает 1–3 рабочих дня после подготовки документов." },
      { q: "Какие районы Дубая лучше всего подходят для крипто-инвестиций?", a: "Дубай Марина, Даунтаун, Бизнес-Бей, Пальма Джумейра и Джумейра Вилладж Сёркл (JVC) — лучшие варианты. Новостройки от Emaar, DAMAC и Sobha предлагают гибкие планы рассрочки, где криптовалюта принимается в качестве первоначального взноса." },
    ],
    ctaTitle: "Готовы инвестировать?",
    ctaDesc: "Наши специалисты по крипто-сделкам с недвижимостью доступны 7 дней в неделю. Получите персональную консультацию и подборку объектов.",
    ctaBtn: "Связаться со специалистом",
    breadcrumb: "Оплата криптовалютой",
  },
  ar: {
    metaTitle: "شراء عقارات دبي بالبيتكوين والعملات المشفرة | بناية للعقارات",
    metaDescription: "اشترِ شقة أو فيلا أو مشروعًا على الخارطة في دبي بعملة البيتكوين والإيثيريوم وUSDT. معاملات قانونية عبر DLD. بدون ضرائب. خبراء بناية للعقارات منذ 2007.",
    heroLabel: "نقبل الآن",
    heroTitle: "اشترِ عقارات دبي",
    heroTitleSub: "بالبيتكوين والعملات المشفرة",
    heroDesc: "تُيسّر بناية للعقارات معاملات عقارية متوافقة قانونيًا بالعملات المشفرة في دبي — من المشاريع على الخارطة إلى السوق الثانوية الجاهزة. خدمة كاملة باللغة العربية.",
    heroCta: "استشارة مجانية",
    coins: ["Bitcoin (BTC)", "Ethereum (ETH)", "Tether (USDT)", "USD Coin (USDC)", "Ripple (XRP)", "BNB"],
    coinsLabel: "العملات المشفرة المقبولة",
    howTitle: "كيف تتم العملية",
    steps: [
      { n: "01", title: "اختر عقارك", body: "تصفّح أكثر من 2500 عقار ومشروع على الخارطة. سيختار وكلاؤنا العقارات المناسبة لميزانيتك وأهدافك الاستثمارية." },
      { n: "02", title: "الفحص القانوني", body: "نتحقق من وثائق مصدر العملة المشفرة (AML/KYC) وننسق مع المطوّر أو البائع للتأكيد على قبول الدفع بالعملة المشفرة." },
      { n: "03", title: "معاملة آمنة", body: "تُحوَّل الأموال عبر بورصة تشفير مرخّصة أو تحويل مباشر من المحفظة. تُحوَّل المبالغ إلى درهم إماراتي بالسعر المتفق عليه لتسجيل دائرة الأراضي والأملاك." },
      { n: "04", title: "التسجيل في دائرة الأراضي", body: "يُسجَّل العقار في دائرة الأراضي والأملاك في دبي باسمك. تحصل على سند الملكية — ملكية قانونية كاملة." },
    ],
    whyTitle: "لماذا دبي للاستثمار بالعملات المشفرة",
    whyPoints: [
      { title: "الإطار القانوني", body: "توفّر هيئة تنظيم الأصول الافتراضية (VARA) في الإمارات إطارًا قانونيًا واضحًا للمعاملات بالعملات المشفرة." },
      { title: "0% ضرائب", body: "لا ضريبة على مكاسب رأس المال، لا ضريبة عقارية، لا ضريبة دخل في الإمارات. استثمارك ينمو خاليًا من الضرائب." },
      { title: "متوافق مع DLD", body: "تُسجَّل جميع المعاملات في دائرة الأراضي والأملاك في دبي. ملكيتك موثّقة بسند رسمي." },
      { title: "وصول عالمي", body: "لا قيود على أي جنسية. العملة المشفرة وسيلة دفع بلا حدود — مثالية للمستثمرين الدوليين." },
      { title: "الإقامة الذهبية", body: "استثمر 2 مليون درهم أو أكثر في العقارات واحصل على تأشيرة ذهبية لمدة 10 سنوات — مع إمكانية الدفع بالعملات المشفرة." },
      { title: "عائد استثماري مرتفع", body: "تقدّم دبي عائدات إيجارية تتراوح بين 5% و10% — من أعلى المعدلات عالميًا. ارتفعت أسعار المشاريع على الخارطة 40-60% منذ 2021." },
    ],
    faqTitle: "الأسئلة الشائعة",
    faqs: [
      { q: "هل شراء العقارات في دبي بالعملات المشفرة قانوني؟", a: "نعم. توفّر هيئة تنظيم الأصول الافتراضية (VARA) في الإمارات إطارًا قانونيًا واضحًا للمعاملات بالعملات المشفرة. يقبل عدد من المطوّرين في دبي ودائرة الأراضي والأملاك العملاتِ المشفرة. يجب أن تلتزم المعاملات بمتطلبات AML/KYC، ولا توجد عوائق قانونية للمشترين الأجانب." },
      { q: "ما العملات المشفرة المقبولة لشراء العقارات في دبي؟", a: "البيتكوين (BTC) والإيثيريوم (ETH) وتيثر (USDT) وUSD Coin وريبل (XRP) وBNB. الأكثر شيوعًا هو USDT (العملة المستقرة) لأنها تلغي مخاطر تذبذب الأسعار خلال فترة المعاملة." },
      { q: "هل يجب تحويل العملة المشفرة إلى درهم إماراتي؟", a: "نعم. تسجّل دائرة الأراضي والأملاك في دبي المعاملات بالدرهم الإماراتي. تُحوَّل العملة المشفرة إلى درهم بسعر صرف متفق عليه في تاريخ المعاملة عبر بورصة مرخّصة في الإمارات أو بتسهيل من المطوّر. يتولى وكيل بناية تنسيق عملية التحويل." },
      { q: "هل هناك ضرائب على شراء العقارات بالعملات المشفرة في الإمارات؟", a: "لا توجد ضريبة على مكاسب رأس المال، ولا ضريبة دخل، ولا ضريبة ثروة في الإمارات. رسوم DLD الموحّدة 4% (من المبلغ المحوّل إلى درهم) والعمولة العقارية حوالي 2%. لا ضرائب على مكاسب العملة المشفرة أو صفقة الشراء ذاتها." },
      { q: "ما الحد الأدنى للاستثمار؟", a: "تبدأ الشقق الاستوديو من 500,000 درهم (حوالي 136,000 دولار أو ₿2 بالأسعار الحالية). للحصول على التأشيرة الذهبية الإماراتية لمدة 10 سنوات، الحد الأدنى لقيمة العقار 2,000,000 درهم (حوالي 545,000 دولار)." },
      { q: "كم من الوقت تستغرق عملية الشراء؟", a: "المشاريع على الخارطة: 2-4 أسابيع من التوقيع إلى الحجز. السوق الثانوية: 3-6 أسابيع لنقل الملكية الكاملة. تستغرق عملية تحويل العملة المشفرة ذاتها 1-3 أيام عمل بعد استكمال الوثائق." },
      { q: "ما أفضل مناطق دبي للاستثمار العقاري بالعملات المشفرة؟", a: "دبي مارينا ووسط المدينة والخليج التجاري ونخلة جميرا وجميرا فيلدج سيركل (JVC) هي الخيارات الأفضل. تقدّم مشاريع إعمار وداماك وسوبها خططَ دفع مرنة تُقبل فيها العملة المشفرة كدفعة أولى." },
    ],
    ctaTitle: "مستعد للاستثمار؟",
    ctaDesc: "متخصصو صفقات العملات المشفرة العقارية لدينا متاحون 7 أيام في الأسبوع. احصل على استشارة شخصية وقائمة عقارات مختارة.",
    ctaBtn: "تواصل مع متخصص",
    breadcrumb: "الشراء بالعملات المشفرة",
  },
  zh: {
    metaTitle: "用比特币和加密货币购买迪拜房产 | Binayah Properties",
    metaDescription: "使用比特币、以太坊、USDT等加密货币购买迪拜公寓、别墅或期房项目。符合DLD法规的合法交易。零税收。Binayah Properties自2007年起为您服务。",
    heroLabel: "现已接受",
    heroTitle: "用加密货币购买",
    heroTitleSub: "迪拜房产",
    heroDesc: "Binayah Properties为您办理迪拜合法合规的加密货币房产交易——从期房项目到现房二手市场，提供全程中文服务。",
    heroCta: "免费咨询",
    coins: ["Bitcoin (BTC)", "Ethereum (ETH)", "Tether (USDT)", "USD Coin (USDC)", "Ripple (XRP)", "BNB"],
    coinsLabel: "接受的加密货币",
    howTitle: "购买流程",
    steps: [
      { n: "01", title: "选择房产", body: "浏览2500多套房源和期房项目。我们的经纪人将根据您的预算和投资目标为您筛选合适的房产。" },
      { n: "02", title: "法律与合规审查", body: "核实加密货币来源文件（AML/KYC），并与开发商或卖家确认接受加密货币付款。" },
      { n: "03", title: "安全交易", body: "通过持牌加密货币交易所或直接钱包转账完成付款。按约定汇率将金额兑换为迪拉姆，用于土地局登记。" },
      { n: "04", title: "土地局登记", body: "房产在迪拜土地局（DLD）以您的名义登记。您将收到产权证书——完全合法的所有权。" },
    ],
    whyTitle: "为什么选择迪拜进行加密货币房产投资",
    whyPoints: [
      { title: "法律框架", body: "阿联酋虚拟资产监管局（VARA）为加密货币交易提供清晰的法律框架。迪拜是全球最具加密友好环境的城市之一。" },
      { title: "0税收", body: "阿联酋无资本利得税、无房产税、无所得税。您的加密货币房产投资免税增值。" },
      { title: "DLD合规", body: "所有交易均在迪拜土地局登记。您的所有权有官方产权证书记录。" },
      { title: "全球开放", body: "不限国籍。加密货币是无国界支付方式——非常适合国际投资者。" },
      { title: "黄金签证", body: "投资200万迪拉姆（约54.5万美元）以上的房产，即可获得10年阿联酋黄金签证，可使用加密货币付款。" },
      { title: "高投资回报", body: "迪拜提供5-10%的租金收益率，位居全球前列。自2021年以来，核心地区期房价格上涨了40-60%。" },
    ],
    faqTitle: "常见问题解答",
    faqs: [
      { q: "在迪拜用加密货币购买房产合法吗？", a: "是的。阿联酋虚拟资产监管局（VARA）为加密货币交易提供了清晰的法律框架。多家迪拜开发商和迪拜土地局（DLD）已支持加密货币购房。交易须符合AML/KYC规定，外国买家无任何法律障碍。" },
      { q: "购买迪拜房产接受哪些加密货币？", a: "比特币（BTC）、以太坊（ETH）、泰达币（USDT）、USD Coin、瑞波币（XRP）和BNB最为常见。USDT（稳定币）因能消除交易期间的价格波动风险而尤为受欢迎。" },
      { q: "需要将加密货币兑换成迪拉姆吗？", a: "是的。迪拜土地局以迪拉姆（AED）记录交易。加密货币通常通过阿联酋持牌交易所或开发商协助，按交易日约定汇率兑换为迪拉姆。兑换过程由您的Binayah经纪人负责协调。" },
      { q: "用加密货币购买迪拜房产需要缴税吗？", a: "阿联酋无资本利得税、无所得税、无财富税。一次性DLD转让费为4%（按迪拉姆计算），中介费约2%。加密货币收益或房产购买本身均无需纳税。" },
      { q: "最低投资额是多少？", a: "单间公寓起价50万迪拉姆（约13.6万美元或按当前汇率约2个比特币）。申请10年阿联酋黄金签证的最低房产价值为200万迪拉姆（约54.5万美元）。" },
      { q: "购房流程需要多长时间？", a: "期房：从签约到预订约2-4周。二手房：完成完整产权转移约3-6周。加密货币转账本身在文件准备就绪后通常需要1-3个工作日。" },
      { q: "哪些迪拜地区最适合加密货币房产投资？", a: "迪拜marina、市中心、商业湾、棕榈岛和朱美拉村庄圈（JVC）是首选。Emaar、DAMAC和Sobha的期房项目提供灵活的付款计划，首付可使用加密货币支付。" },
    ],
    ctaTitle: "准备好投资了吗？",
    ctaDesc: "我们的加密货币房产专家每周7天为您服务。获取个性化咨询和精选房源列表。",
    ctaBtn: "联系加密货币专家",
    breadcrumb: "加密货币购房",
  },
} as const;

type Locale = keyof typeof CONTENT;

// ─────────────────────────────────────────────────────────────
// Metadata
// ─────────────────────────────────────────────────────────────

interface Props { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!(locale in CONTENT)) return {};
  const c = CONTENT[locale as Locale];
  return {
    title: c.metaTitle,
    description: c.metaDescription,
    alternates: {
      canonical: canonical(locale, "/buy-with-crypto"),
      languages: altLangs("/buy-with-crypto"),
    },
    openGraph: {
      title: c.metaTitle,
      description: c.metaDescription,
      url: canonical(locale, "/buy-with-crypto"),
      type: "website",
      images: [{ url: `${AE_URL}/assets/crypto-banner.webp`, width: 1200, height: 630 }],
    },
    keywords: locale === "ru"
      ? ["купить недвижимость за биткоин дубай", "криптовалюта недвижимость дубай", "купить квартиру за крипто", "биткоин недвижимость оаэ"]
      : locale === "ar"
      ? ["شراء عقار بالبيتكوين دبي", "عقارات بالعملات المشفرة دبي", "استثمار عقاري بالكريبتو"]
      : locale === "zh"
      ? ["用比特币购买迪拜房产", "迪拜加密货币购房", "比特币房产迪拜"]
      : ["buy property dubai bitcoin", "crypto real estate dubai", "buy dubai apartment cryptocurrency", "bitcoin property uae"],
  };
}

// ─────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────

export default async function BuyWithCryptoPage({ params }: Props) {
  const { locale } = await params;
  if (!(locale in CONTENT)) return notFound();
  const c = CONTENT[locale as Locale];
  const isRtl = locale === "ar";
  const localePrefix = locale === "en" ? "" : `/${locale}`;

  const breadcrumbs = [
    { name: locale === "ru" ? "Главная" : locale === "ar" ? "الرئيسية" : locale === "zh" ? "首页" : "Home", href: `${localePrefix}/` },
    { name: c.breadcrumb, href: `${localePrefix}/buy-with-crypto` },
  ];

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? "rtl" : "ltr"}>
      <Navbar />

      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden min-h-[420px] flex items-center">
        <Image
          src="/assets/crypto-banner.webp"
          alt={c.heroTitle}
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/55" />
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-24 md:py-32">
          <p className="text-amber-400 font-bold tracking-[0.35em] uppercase text-xs mb-4">{c.heroLabel}</p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-2">
            {c.heroTitle}
          </h1>
          <p className="text-3xl sm:text-4xl font-light text-amber-300 mb-6">{c.heroTitleSub}</p>
          <p className="text-white/80 text-lg max-w-2xl mb-8">{c.heroDesc}</p>
          <Link
            href={`${localePrefix}/contact`}
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-bold px-8 py-4 rounded-xl text-lg transition-colors"
          >
            {c.heroCta} →
          </Link>
        </div>
      </section>

      {/* ── Accepted coins ───────────────────────────────── */}
      <section className="bg-muted/40 border-y border-border/40 py-6">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap items-center gap-4 justify-center sm:justify-start">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{c.coinsLabel}:</span>
            {c.coins.map((coin) => (
              <span key={coin} className="bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold px-3 py-1.5 rounded-full">{coin}</span>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 space-y-20">

        {/* ── How it works ────────────────────────────────── */}
        <section>
          <h2 className="text-3xl font-bold text-foreground mb-10 text-center">{c.howTitle}</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {c.steps.map((step) => (
              <div key={step.n} className="bg-card border border-border/50 rounded-2xl p-6 hover:border-amber-300/50 transition-colors">
                <div className="text-3xl font-black text-amber-400/40 mb-3">{step.n}</div>
                <h3 className="text-lg font-bold text-foreground mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Why Dubai ───────────────────────────────────── */}
        <section>
          <h2 className="text-3xl font-bold text-foreground mb-10 text-center">{c.whyTitle}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {c.whyPoints.map((pt) => (
              <div key={pt.title} className="bg-card border border-border/50 rounded-2xl p-5">
                <h3 className="text-base font-bold text-foreground mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                  {pt.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{pt.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── FAQ ─────────────────────────────────────────── */}
        <section>
          <h2 className="text-3xl font-bold text-foreground mb-10 text-center">{c.faqTitle}</h2>
          <div className="space-y-4">
            {c.faqs.map((faq, i) => (
              <details
                key={i}
                className="group bg-card border border-border/50 rounded-2xl overflow-hidden"
              >
                <summary className="flex items-center justify-between gap-4 px-6 py-5 cursor-pointer list-none font-semibold text-foreground hover:text-amber-600 transition-colors">
                  {faq.q}
                  <span className="text-amber-400 text-xl flex-shrink-0 group-open:rotate-45 transition-transform">+</span>
                </summary>
                <div className="px-6 pb-5 text-muted-foreground leading-relaxed text-sm border-t border-border/30 pt-4">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* ── CTA ─────────────────────────────────────────── */}
        <section
          className="rounded-3xl p-10 text-center text-white"
          style={{ background: "linear-gradient(135deg, #78350f, #b45309, #d97706)" }}
        >
          <h2 className="text-3xl font-bold mb-3">{c.ctaTitle}</h2>
          <p className="text-white/80 mb-8 max-w-xl mx-auto">{c.ctaDesc}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`${localePrefix}/contact`}
              className="bg-white text-amber-900 font-bold px-8 py-4 rounded-xl hover:bg-amber-50 transition-colors"
            >
              {c.ctaBtn}
            </Link>
            <a
              href="https://wa.me/971549988811"
              target="_blank"
              rel="noopener noreferrer"
              className="border-2 border-white text-white font-bold px-8 py-4 rounded-xl hover:bg-white/10 transition-colors"
            >
              WhatsApp
            </a>
          </div>
        </section>

      </div>

      <Footer />
      <WhatsAppButton />

      {/* JSON-LD */}
      <FAQJsonLd faqs={c.faqs.map(f => ({ question: f.q, answer: f.a }))} />
      <BreadcrumbJsonLd items={breadcrumbs} />
    </div>
  );
}
