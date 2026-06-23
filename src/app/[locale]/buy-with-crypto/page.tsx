/* eslint-disable i18next/no-literal-string -- multilingual SEO landing page, content stored inline per locale */
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { FAQJsonLd, BreadcrumbJsonLd } from "@/components/JsonLd";
import { canonical, altLangs, AE_URL } from "@/lib/site";
import { CRYPTO_PAGES, CRYPTO_LABELS, type CryptoLocale } from "@/lib/crypto-pages";

export const revalidate = 86400;

// ─────────────────────────────────────────────────────────────
// Locale content
// ─────────────────────────────────────────────────────────────

const CONTENT = {
  en: {
    metaTitle: "Buy Property in Dubai with Bitcoin & Cryptocurrency | Binayah",
    metaDesc: "Purchase Dubai real estate with Bitcoin, Ethereum or USDT. Legal DLD-compliant crypto transactions. 0% tax. Expert guidance from Binayah Properties.",
    ogLocale: "en_AE",
    heroLabel: "NOW ACCEPTING CRYPTO",
    h1a: "Buy Dubai Property",
    h1b: "with Cryptocurrency",
    heroDesc: "Binayah Properties facilitates legal, DLD-compliant cryptocurrency real estate transactions, off-plan and secondary market. Full guidance from consultation to title deed.",
    heroCta: "Free Consultation",
    heroCtaArrow: "→",
    stats: [
      { n: "500+", label: "Crypto Transactions" },
      { n: "19+", label: "Years in Dubai" },
      { n: "3,000+", label: "Properties" },
      { n: "0%", label: "Capital Gains Tax" },
    ],
    coinsLabel: "Accepted Cryptocurrencies",
    coins: ["Bitcoin (BTC)", "Ethereum (ETH)", "Tether (USDT)", "USD Coin (USDC)", "Ripple (XRP)", "BNB"],
    howTitle: "How It Works",
    steps: [
      { n: "01", title: "Choose Your Property", body: "Browse 3,000+ listings and off-plan projects. Our agents shortlist properties matching your budget and investment goals." },
      { n: "02", title: "Legal & KYC Review", body: "We verify your crypto source documentation (AML/KYC) and confirm crypto acceptance with the developer or seller." },
      { n: "03", title: "Secure Transfer", body: "Funds are transferred via a licensed crypto exchange or direct wallet transfer, converted to AED at the agreed rate for DLD registration." },
      { n: "04", title: "Title Deed Issued", body: "The property is registered at the Dubai Land Department in your name. You receive the official title deed, full legal ownership." },
    ],
    whyTitle: "Why Dubai for Crypto Real Estate",
    whyPoints: [
      { title: "VARA Legal Framework", body: "Dubai's Virtual Assets Regulatory Authority (VARA) provides a clear, enforceable legal framework for crypto property transactions." },
      { title: "0% Tax", body: "No capital gains tax, property tax or income tax in the UAE. Your crypto-to-property investment grows completely tax-free." },
      { title: "DLD Registration", body: "Every transaction is registered with the Dubai Land Department. Your ownership is documented with an official government title deed." },
      { title: "No Nationality Restrictions", body: "All nationalities welcome, including Russian, Chinese, European and GCC. Crypto is borderless, ideal for international investors." },
      { title: "10-Year Golden Visa", body: "Invest AED 2M+ (≈ $545K) in property and qualify for a UAE Golden Visa. Payable with cryptocurrency." },
      { title: "5-10% Rental Yields", body: "Among the world's highest rental returns. Off-plan prices in key areas have risen 40-60% since 2021." },
    ],
    faqTitle: "Frequently Asked Questions",
    faqs: [
      { q: "Is buying property in Dubai with cryptocurrency legal?", a: "Yes. The UAE's Virtual Assets Regulatory Authority (VARA) provides a clear legal framework. Multiple Dubai developers and the DLD facilitate crypto purchases. Transactions must comply with AML/KYC requirements, there are no legal barriers for foreign buyers." },
      { q: "Which cryptocurrencies are accepted?", a: "Bitcoin (BTC), Ethereum (ETH), Tether (USDT), USD Coin (USDC), Ripple (XRP) and BNB. USDT is most popular because it eliminates price volatility risk during the transaction period." },
      { q: "Does the DLD transfer require AED conversion?", a: "Yes. The DLD records transactions in AED. Your crypto is converted at an agreed exchange rate on the transaction date, via a licensed UAE exchange or through the developer. Your Binayah agent handles the full coordination." },
      { q: "Are there any taxes on crypto property purchases?", a: "No capital gains tax, no income tax, no wealth tax. The only costs are the DLD transfer fee (4% of the AED value) and the agency fee (~2%). No taxes on the crypto gains themselves." },
      { q: "What is the minimum investment?", a: "Studios start from AED 500,000 (≈$136K or ₿2). For a 10-year UAE Golden Visa, the minimum property value is AED 2,000,000 (≈$545K)." },
      { q: "Can Russian citizens buy Dubai property with crypto?", a: "Absolutely. No restrictions for Russian nationals. Cryptocurrency is especially convenient given international banking constraints. We handle the full process including AML documentation." },
      { q: "How long does the purchase process take?", a: "Off-plan: 2-4 weeks from agreement to booking confirmation. Secondary market: 3-6 weeks for full transfer. The crypto transfer itself takes 1-3 business days once documents are in order." },
      { q: "Which areas are best for crypto real estate investment?", a: "Dubai Marina, Downtown Dubai, Business Bay, Palm Jumeirah and JVC are top picks. Off-plan projects by Emaar, DAMAC and Sobha accept crypto for initial down payments with flexible payment plans." },
    ],
    ctaTitle: "Ready to Invest?",
    ctaDesc: "Our crypto real estate specialists are available 7 days a week. Get a personalised consultation and curated property shortlist.",
    ctaBtn: "Contact a Specialist",
    ctaWhatsApp: "WhatsApp Us",
    browseCta: "Browse Properties",
    breadcrumb: "Buy with Crypto",
  },

  ru: {
    metaTitle: "Купить недвижимость в Дубае за криптовалюту | Bitcoin | Binayah",
    metaDesc: "Купить квартиру или виллу в Дубае за биткоин, эфириум, USDT. Легальные сделки через DLD. 0% налогов. Эксперты Binayah Properties с 2007 года.",
    ogLocale: "ru_RU",
    heroLabel: "ПРИНИМАЕМ КРИПТОВАЛЮТУ",
    h1a: "Купить недвижимость в Дубае",
    h1b: "за криптовалюту",
    heroDesc: "Binayah Properties оформляет юридически чистые сделки с недвижимостью в Дубае за криптовалюту, новостройки и вторичный рынок. Полное сопровождение на русском языке.",
    heroCta: "Бесплатная консультация",
    heroCtaArrow: "→",
    stats: [
      { n: "500+", label: "Крипто-сделок" },
      { n: "19+", label: "Лет в Дубае" },
      { n: "3 000+", label: "Объектов" },
      { n: "0%", label: "Налог на прибыль" },
    ],
    coinsLabel: "Принимаемые криптовалюты",
    coins: ["Bitcoin (BTC)", "Ethereum (ETH)", "Tether (USDT)", "USD Coin (USDC)", "Ripple (XRP)", "BNB"],
    howTitle: "Как это работает",
    steps: [
      { n: "01", title: "Выбор объекта", body: "Более 3000 объектов и новостроек. Агенты подберут варианты под ваш бюджет и инвестиционные цели." },
      { n: "02", title: "Юридическая проверка", body: "Проверяем документы о происхождении криптовалюты (AML/KYC) и согласовываем с застройщиком или продавцом условия оплаты." },
      { n: "03", title: "Безопасная сделка", body: "Средства переводятся через лицензированную биржу или напрямую с кошелька. Сумма конвертируется в дирхамы по согласованному курсу." },
      { n: "04", title: "Получение правоустанавливающего документа", body: "Недвижимость регистрируется в Земельном департаменте Дубая (DLD) на ваше имя. Вы получаете официальный правоустанавливающий документ." },
    ],
    whyTitle: "Почему Дубай для крипто-инвестиций",
    whyPoints: [
      { title: "Правовая база VARA", body: "Управление виртуальными активами ОАЭ (VARA) регулирует криптовалютные операции. Дубай, один из самых крипто-дружественных городов мира." },
      { title: "0% налогов", body: "Нет налога на прирост капитала, налога на имущество и подоходного налога. Инвестиции растут без налоговой нагрузки." },
      { title: "Регистрация в DLD", body: "Все сделки регистрируются в Земельном департаменте Дубая. Вы получаете официальный правоустанавливающий документ государственного образца." },
      { title: "Для граждан России", body: "Никаких ограничений для российских граждан. Криптовалюта, удобный инструмент в условиях международных банковских ограничений." },
      { title: "Золотая виза на 10 лет", body: "Инвестируйте от 2 млн AED (≈$545 тыс.), получите 10-летнюю Золотую визу ОАЭ. Оплата криптовалютой доступна." },
      { title: "5-10% доходность", body: "Один из лучших показателей аренды в мире. Новостройки в ключевых районах выросли на 40-60% с 2021 года." },
    ],
    faqTitle: "Частые вопросы",
    faqs: [
      { q: "Законно ли покупать недвижимость в Дубае за криптовалюту?", a: "Да. Управление виртуальными активами ОАЭ (VARA) обеспечивает чёткую правовую базу. Несколько застройщиков Дубая и DLD уже принимают криптовалюту. Сделки соответствуют требованиям AML/KYC." },
      { q: "Какие криптовалюты принимаются?", a: "Bitcoin (BTC), Ethereum (ETH), Tether (USDT), USD Coin (USDC), Ripple (XRP) и BNB. Наиболее популярен USDT, стейблкоин, который исключает волатильность в период оформления." },
      { q: "Нужно ли конвертировать криптовалюту в дирхамы?", a: "Да. DLD регистрирует сделки в дирхамах. Криптовалюта конвертируется по согласованному курсу через лицензированную биржу ОАЭ. Конвертацию организует ваш агент Binayah." },
      { q: "Какие налоги при покупке за криптовалюту?", a: "В ОАЭ нет налога на прирост капитала, подоходного налога и налога на богатство. Разовый сбор DLD, 4%, агентская комиссия, около 2%." },
      { q: "Минимальная сумма инвестиций?", a: "Студии от 500 000 AED (~$136 тыс. или ₿2 по текущему курсу). Для 10-летней Золотой визы, от 2 000 000 AED (~$545 тыс.)." },
      { q: "Могут ли граждане России купить недвижимость за криптовалюту?", a: "Да. Ограничений для российских граждан нет. Криптовалюта, особенно удобный способ оплаты с учётом международных банковских ограничений. Мы берём на себя все документы включая AML." },
      { q: "Сколько времени занимает сделка?", a: "Новостройки: 2-4 недели до подтверждения бронирования. Вторичный рынок: 3-6 недель до полного переоформления. Сам перевод криптовалюты, 1-3 рабочих дня." },
      { q: "Лучшие районы Дубая для крипто-инвестиций?", a: "Дубай Марина, Даунтаун, Бизнес-Бей, Пальма Джумейра и JVC. Застройщики Emaar, DAMAC и Sobha принимают криптовалюту в качестве первоначального взноса." },
    ],
    ctaTitle: "Готовы инвестировать?",
    ctaDesc: "Специалисты по крипто-сделкам доступны 7 дней в неделю. Персональная консультация и подборка объектов.",
    ctaBtn: "Связаться со специалистом",
    ctaWhatsApp: "WhatsApp",
    browseCta: "Смотреть объекты",
    breadcrumb: "Оплата криптовалютой",
  },

  ar: {
    metaTitle: "شراء عقارات دبي بالبيتكوين والعملات المشفرة | بناية للعقارات",
    metaDesc: "اشترِ شقة أو فيلا في دبي بعملة البيتكوين والإيثيريوم وUSDT. معاملات قانونية عبر DLD. 0% ضرائب. خبراء بناية للعقارات منذ 2007.",
    ogLocale: "ar_AE",
    heroLabel: "نقبل العملات المشفرة",
    h1a: "اشترِ عقارات دبي",
    h1b: "بالبيتكوين والعملات المشفرة",
    heroDesc: "تُيسّر بناية للعقارات معاملات عقارية متوافقة قانونيًا بالعملات المشفرة في دبي, المشاريع على الخارطة والسوق الثانوية. خدمة كاملة باللغة العربية.",
    heroCta: "استشارة مجانية",
    heroCtaArrow: "←",
    stats: [
      { n: "+500", label: "معاملة بالكريبتو" },
      { n: "+17", label: "عامًا في دبي" },
      { n: "+3,000", label: "عقار" },
      { n: "0%", label: "ضريبة أرباح رأس المال" },
    ],
    coinsLabel: "العملات المشفرة المقبولة",
    coins: ["Bitcoin (BTC)", "Ethereum (ETH)", "Tether (USDT)", "USD Coin (USDC)", "Ripple (XRP)", "BNB"],
    howTitle: "كيف تتم العملية",
    steps: [
      { n: "١", title: "اختر عقارك", body: "أكثر من 3,000 عقار ومشروع على الخارطة. يختار وكلاؤنا العقارات المناسبة لميزانيتك وأهدافك الاستثمارية." },
      { n: "٢", title: "الفحص القانوني", body: "نتحقق من وثائق مصدر العملة المشفرة (AML/KYC) وننسق مع المطوّر أو البائع لتأكيد القبول." },
      { n: "٣", title: "معاملة آمنة", body: "تُحوَّل الأموال عبر بورصة مرخّصة أو من المحفظة مباشرةً، وتُحوَّل إلى درهم بالسعر المتفق عليه." },
      { n: "٤", title: "استلام سند الملكية", body: "يُسجَّل العقار في دائرة الأراضي والأملاك باسمك. تحصل على سند الملكية الرسمي, ملكية قانونية كاملة." },
    ],
    whyTitle: "لماذا دبي للاستثمار بالعملات المشفرة",
    whyPoints: [
      { title: "الإطار القانوني VARA", body: "توفّر هيئة تنظيم الأصول الافتراضية إطارًا قانونيًا واضحًا. دبي من أكثر مدن العالم ودًّا للعملات المشفرة." },
      { title: "0% ضرائب", body: "لا ضريبة على مكاسب رأس المال، لا ضريبة عقارية، لا ضريبة دخل. استثمارك ينمو خاليًا من الضرائب." },
      { title: "تسجيل DLD رسمي", body: "جميع المعاملات مسجّلة في دائرة الأراضي والأملاك. ملكيتك موثّقة بسند رسمي حكومي." },
      { title: "مفتوح لجميع الجنسيات", body: "لا قيود على أي جنسية. العملة المشفرة وسيلة دفع بلا حدود, مثالية للمستثمرين الدوليين." },
      { title: "إقامة ذهبية 10 سنوات", body: "استثمر 2 مليون درهم أو أكثر واحصل على تأشيرة ذهبية, مع إمكانية الدفع بالعملات المشفرة." },
      { title: "عائد 5-10%", body: "من أعلى عوائد الإيجار في العالم. ارتفعت أسعار المشاريع على الخارطة 40-60% منذ 2021." },
    ],
    faqTitle: "الأسئلة الشائعة",
    faqs: [
      { q: "هل شراء العقارات بالعملات المشفرة قانوني في دبي؟", a: "نعم. توفّر هيئة VARA إطارًا قانونيًا واضحًا. يقبل عدد من المطوّرين ودائرة الأراضي العملاتِ المشفرة. تلتزم المعاملات بمتطلبات AML/KYC دون أي عوائق للمشترين الأجانب." },
      { q: "ما العملات المشفرة المقبولة؟", a: "البيتكوين والإيثيريوم وتيثر (USDT) وUSDC وريبل وBNB. الأكثر شيوعًا USDT لأنه يلغي مخاطر التذبذب." },
      { q: "هل يجب تحويل العملة المشفرة إلى درهم؟", a: "نعم. تسجّل دائرة الأراضي بالدرهم. تُحوَّل العملة بسعر متفق عليه عبر بورصة مرخّصة في الإمارات. يتولى وكيل بناية تنسيق التحويل." },
      { q: "هل هناك ضرائب؟", a: "لا ضريبة على مكاسب رأس المال، لا ضريبة دخل، لا ضريبة ثروة. رسوم DLD الموحّدة 4% وعمولة الوكالة 2%." },
      { q: "ما الحد الأدنى للاستثمار؟", a: "الاستوديو يبدأ من 500,000 درهم (~136,000 دولار). للتأشيرة الذهبية 10 سنوات: 2,000,000 درهم (~545,000 دولار)." },
      { q: "كم تستغرق عملية الشراء؟", a: "المشاريع على الخارطة: 2-4 أسابيع. السوق الثانوية: 3-6 أسابيع. تحويل العملة المشفرة: 1-3 أيام عمل." },
      { q: "ما أفضل مناطق دبي للاستثمار بالعملات المشفرة؟", a: "دبي مارينا ووسط المدينة والخليج التجاري ونخلة جميرا وJVC. مشاريع إعمار وداماك وسوبها تقبل الكريبتو دفعةً أولى." },
    ],
    ctaTitle: "مستعد للاستثمار؟",
    ctaDesc: "متخصصو صفقات العملات المشفرة العقارية متاحون 7 أيام. استشارة شخصية وقائمة عقارات مختارة.",
    ctaBtn: "تواصل مع متخصص",
    ctaWhatsApp: "واتساب",
    browseCta: "تصفّح العقارات",
    breadcrumb: "الشراء بالعملات المشفرة",
  },

  zh: {
    metaTitle: "用比特币和加密货币购买迪拜房产 | Binayah Properties",
    metaDesc: "使用比特币、以太坊、USDT购买迪拜公寓或别墅。符合DLD法规的合法交易。0%税收。Binayah Properties自2007年起为您服务。",
    ogLocale: "zh_CN",
    heroLabel: "现已接受加密货币",
    h1a: "用加密货币",
    h1b: "购买迪拜房产",
    heroDesc: "Binayah Properties为您办理迪拜合法合规的加密货币房产交易, , 期房项目与现房二手市场，提供全程中文服务。",
    heroCta: "免费咨询",
    heroCtaArrow: "→",
    stats: [
      { n: "500+", label: "加密货币交易" },
      { n: "19+", label: "年迪拜经验" },
      { n: "3,000+", label: "在售房源" },
      { n: "0%", label: "资本利得税" },
    ],
    coinsLabel: "接受的加密货币",
    coins: ["Bitcoin (BTC)", "Ethereum (ETH)", "Tether (USDT)", "USD Coin (USDC)", "Ripple (XRP)", "BNB"],
    howTitle: "购买流程",
    steps: [
      { n: "01", title: "选择房产", body: "浏览3,000多套房源和期房项目。我们的经纪人根据您的预算和投资目标为您筛选最优选择。" },
      { n: "02", title: "法律与合规审查", body: "核实加密货币来源文件（AML/KYC），并与开发商或卖家确认接受加密货币付款。" },
      { n: "03", title: "安全交易", body: "通过持牌加密货币交易所或直接钱包转账完成付款，按约定汇率兑换为迪拉姆进行DLD登记。" },
      { n: "04", title: "产权证书签发", body: "房产在迪拜土地局（DLD）以您的名义登记，您将收到官方产权证书, , 完全合法的所有权。" },
    ],
    whyTitle: "为什么选择迪拜进行加密货币房产投资",
    whyPoints: [
      { title: "VARA法律框架", body: "阿联酋虚拟资产监管局（VARA）为加密货币交易提供清晰可执行的法律框架。迪拜是全球加密货币最友好的城市之一。" },
      { title: "0%税收", body: "阿联酋无资本利得税、无房产税、无所得税。您的加密货币房产投资免税增值。" },
      { title: "DLD官方登记", body: "所有交易均在迪拜土地局登记，您的所有权由官方政府产权证书记录。" },
      { title: "不限国籍", body: "不限国籍，包括中国、俄罗斯、欧洲等。加密货币是无国界支付方式，非常适合国际投资者。" },
      { title: "10年黄金签证", body: "投资200万迪拉姆以上（约54.5万美元）即可申请10年阿联酋黄金签证，支持加密货币付款。" },
      { title: "5-10%租金收益", body: "全球最高租金回报率之一。自2021年以来核心地区期房价格上涨40-60%。" },
    ],
    faqTitle: "常见问题解答",
    faqs: [
      { q: "在迪拜用加密货币购买房产合法吗？", a: "是的。VARA为加密货币交易提供了清晰的法律框架。多家迪拜开发商和土地局已支持加密货币购房。交易须符合AML/KYC规定，外国买家无任何法律障碍。" },
      { q: "接受哪些加密货币？", a: "比特币（BTC）、以太坊（ETH）、泰达币（USDT）、USDC、瑞波币（XRP）和BNB。USDT因消除价格波动风险而最受欢迎。" },
      { q: "需要将加密货币兑换成迪拉姆吗？", a: "是的。土地局以迪拉姆记录交易。通过阿联酋持牌交易所按约定汇率兑换，兑换过程由您的Binayah经纪人负责协调。" },
      { q: "需要缴税吗？", a: "阿联酋无资本利得税、无所得税、无财富税。一次性DLD转让费4%，中介费约2%，加密货币收益本身无需纳税。" },
      { q: "最低投资额是多少？", a: "单间公寓起价50万迪拉姆（约13.6万美元或约2个比特币）。申请10年黄金签证最低房产价值为200万迪拉姆（约54.5万美元）。" },
      { q: "购房流程需要多长时间？", a: "期房：签约后2-4周完成预订。二手房：3-6周完成产权转移。加密货币转账本身在文件就绪后1-3个工作日完成。" },
      { q: "哪些地区最适合加密货币房产投资？", a: "迪拜marina、市中心、商业湾、棕榈岛和JVC是首选。Emaar、DAMAC和Sobha的期房项目支持加密货币首付。" },
    ],
    ctaTitle: "准备好投资了吗？",
    ctaDesc: "我们的加密货币房产专家每周7天为您服务，提供个性化咨询和精选房源。",
    ctaBtn: "联系专家",
    ctaWhatsApp: "WhatsApp咨询",
    browseCta: "浏览房产",
    breadcrumb: "加密货币购房",
  },

  vi: {
    metaTitle: "Mua bất động sản Dubai bằng Bitcoin & Tiền điện tử | Binayah",
    metaDesc: "Mua bất động sản Dubai bằng Bitcoin, Ethereum hoặc USDT. Giao dịch tiền điện tử hợp pháp, tuân thủ DLD. 0% thuế. Hướng dẫn chuyên gia từ Binayah Properties.",
    ogLocale: "vi_VN",
    heroLabel: "HIỆN CHẤP NHẬN TIỀN ĐIỆN TỬ",
    h1a: "Mua bất động sản Dubai",
    h1b: "bằng Tiền điện tử",
    heroDesc: "Binayah Properties hỗ trợ các giao dịch bất động sản bằng tiền điện tử hợp pháp, tuân thủ DLD, off-plan và thị trường thứ cấp. Hướng dẫn trọn gói từ tư vấn đến sổ đỏ.",
    heroCta: "Tư vấn miễn phí",
    heroCtaArrow: "→",
    stats: [
      { n: "500+", label: "Giao dịch tiền điện tử" },
      { n: "19+", label: "Năm tại Dubai" },
      { n: "3.000+", label: "Bất động sản" },
      { n: "0%", label: "Thuế lãi vốn" },
    ],
    coinsLabel: "Tiền điện tử được chấp nhận",
    coins: ["Bitcoin (BTC)", "Ethereum (ETH)", "Tether (USDT)", "USD Coin (USDC)", "Ripple (XRP)", "BNB"],
    howTitle: "Cách hoạt động",
    steps: [
      { n: "01", title: "Chọn bất động sản của bạn", body: "Khám phá hơn 3.000 tin đăng và dự án off-plan. Các chuyên viên của chúng tôi chọn lọc bất động sản phù hợp với ngân sách và mục tiêu đầu tư của bạn." },
      { n: "02", title: "Xét duyệt pháp lý & KYC", body: "Chúng tôi xác minh tài liệu nguồn gốc tiền điện tử của bạn (AML/KYC) và xác nhận việc chấp nhận tiền điện tử với chủ đầu tư hoặc người bán." },
      { n: "03", title: "Chuyển khoản an toàn", body: "Vốn được chuyển qua sàn giao dịch tiền điện tử được cấp phép hoặc chuyển khoản ví trực tiếp, chuyển đổi sang AED theo tỷ giá thỏa thuận để đăng ký DLD." },
      { n: "04", title: "Cấp sổ đỏ", body: "Bất động sản được đăng ký tại Sở Đất đai Dubai dưới tên bạn. Bạn nhận sổ đỏ chính thức, quyền sở hữu hợp pháp đầy đủ." },
    ],
    whyTitle: "Vì sao chọn Dubai cho bất động sản tiền điện tử",
    whyPoints: [
      { title: "Khung pháp lý VARA", body: "Cơ quan Quản lý Tài sản Ảo của Dubai (VARA) cung cấp khung pháp lý rõ ràng, có thể thực thi cho các giao dịch bất động sản bằng tiền điện tử." },
      { title: "0% thuế", body: "Không thuế lãi vốn, thuế bất động sản hay thuế thu nhập tại UAE. Khoản đầu tư tiền điện tử thành bất động sản của bạn tăng trưởng hoàn toàn miễn thuế." },
      { title: "Đăng ký DLD", body: "Mọi giao dịch được đăng ký với Sở Đất đai Dubai. Quyền sở hữu của bạn được ghi nhận bằng sổ đỏ chính thức của chính phủ." },
      { title: "Không hạn chế quốc tịch", body: "Chào đón mọi quốc tịch, bao gồm Nga, Trung Quốc, châu Âu và GCC. Tiền điện tử không biên giới, lý tưởng cho nhà đầu tư quốc tế." },
      { title: "Golden Visa 10 năm", body: "Đầu tư 2 triệu AED+ (≈ 545K USD) vào bất động sản và đủ điều kiện nhận Golden Visa UAE. Có thể thanh toán bằng tiền điện tử." },
      { title: "Lợi suất cho thuê 5-10%", body: "Trong số lợi suất cho thuê cao nhất thế giới. Giá off-plan tại các khu vực chính đã tăng 40-60% kể từ năm 2021." },
    ],
    faqTitle: "Câu hỏi thường gặp",
    faqs: [
      { q: "Mua bất động sản tại Dubai bằng tiền điện tử có hợp pháp không?", a: "Có. Cơ quan Quản lý Tài sản Ảo của UAE (VARA) cung cấp khung pháp lý rõ ràng. Nhiều chủ đầu tư Dubai và DLD hỗ trợ mua bằng tiền điện tử. Giao dịch phải tuân thủ yêu cầu AML/KYC, không có rào cản pháp lý cho người mua nước ngoài." },
      { q: "Những loại tiền điện tử nào được chấp nhận?", a: "Bitcoin (BTC), Ethereum (ETH), Tether (USDT), USD Coin (USDC), Ripple (XRP) và BNB. USDT phổ biến nhất vì loại bỏ rủi ro biến động giá trong giai đoạn giao dịch." },
      { q: "Chuyển nhượng DLD có yêu cầu chuyển đổi sang AED không?", a: "Có. DLD ghi nhận giao dịch bằng AED. Tiền điện tử của bạn được chuyển đổi theo tỷ giá thỏa thuận vào ngày giao dịch, qua sàn giao dịch UAE được cấp phép hoặc qua chủ đầu tư. Chuyên viên Binayah xử lý toàn bộ việc phối hợp." },
      { q: "Có bất kỳ loại thuế nào trên giao dịch mua bất động sản bằng tiền điện tử không?", a: "Không thuế lãi vốn, không thuế thu nhập, không thuế tài sản. Chi phí duy nhất là phí chuyển nhượng DLD (4% giá trị AED) và phí môi giới (~2%). Không có thuế trên chính lãi tiền điện tử." },
      { q: "Khoản đầu tư tối thiểu là bao nhiêu?", a: "Studio khởi điểm từ 500.000 AED (≈136K USD hoặc ₿2). Để nhận Golden Visa UAE 10 năm, giá trị bất động sản tối thiểu là 2.000.000 AED (≈545K USD)." },
      { q: "Công dân Nga có thể mua bất động sản Dubai bằng tiền điện tử không?", a: "Hoàn toàn được. Không có hạn chế cho công dân Nga. Tiền điện tử đặc biệt tiện lợi do các hạn chế ngân hàng quốc tế. Chúng tôi xử lý toàn bộ quy trình bao gồm tài liệu AML." },
      { q: "Quy trình mua mất bao lâu?", a: "Off-plan: 2-4 tuần từ thỏa thuận đến xác nhận đặt chỗ. Thị trường thứ cấp: 3-6 tuần cho chuyển nhượng đầy đủ. Bản thân việc chuyển tiền điện tử mất 1-3 ngày làm việc khi giấy tờ đã đầy đủ." },
      { q: "Khu vực nào tốt nhất cho đầu tư bất động sản tiền điện tử?", a: "Dubai Marina, Downtown Dubai, Business Bay, Palm Jumeirah và JVC là những lựa chọn hàng đầu. Các dự án off-plan của Emaar, DAMAC và Sobha chấp nhận tiền điện tử cho khoản trả trước ban đầu với kế hoạch thanh toán linh hoạt." },
    ],
    ctaTitle: "Sẵn sàng đầu tư?",
    ctaDesc: "Các chuyên gia bất động sản tiền điện tử của chúng tôi sẵn sàng 7 ngày một tuần. Nhận tư vấn cá nhân hóa và danh sách bất động sản được chọn lọc.",
    ctaBtn: "Liên hệ chuyên gia",
    ctaWhatsApp: "WhatsApp ngay",
    browseCta: "Xem bất động sản",
    breadcrumb: "Mua bằng tiền điện tử",
  },
  he: {
    "metaTitle": "קניית נכס בדובאי עם ביטקוין ומטבעות קריפטו | Binayah",
    "metaDesc": "רכישת נדל\"ן בדובאי עם ביטקוין, את'ריום או USDT. עסקאות קריפטו חוקיות בהתאם ל-DLD. 0% מס. ליווי מקצועי מ-Binayah Properties.",
    "ogLocale": "he_IL",
    "heroLabel": "מקבלים כעת קריפטו",
    "h1a": "קניית נכס בדובאי",
    "h1b": "עם מטבעות קריפטו",
    "heroDesc": "Binayah Properties מאפשרת עסקאות נדל\"ן בקריפטו, חוקיות ובהתאם ל-DLD, על הנייר ובשוק המשני. ליווי מלא מהייעוץ הראשוני ועד לשטר הבעלות.",
    "heroCta": "ייעוץ חינם",
    "heroCtaArrow": "←",
    "stats": [
      {
        "n": "500+",
        "label": "עסקאות קריפטו"
      },
      {
        "n": "19+",
        "label": "שנים בדובאי"
      },
      {
        "n": "3,000+",
        "label": "נכסים"
      },
      {
        "n": "0%",
        "label": "מס רווחי הון"
      }
    ],
    "coinsLabel": "מטבעות קריפטו מתקבלים",
    "coins": [
      "Bitcoin (BTC)",
      "Ethereum (ETH)",
      "Tether (USDT)",
      "USD Coin (USDC)",
      "Ripple (XRP)",
      "BNB"
    ],
    "howTitle": "איך זה עובד",
    "steps": [
      {
        "n": "01",
        "title": "בחירת הנכס",
        "body": "עיינו ביותר מ-3,000 נכסים ופרויקטים על הנייר. הסוכנים שלנו ירכיבו רשימה קצרה של נכסים שמתאימים לתקציב וליעדי ההשקעה שלכם."
      },
      {
        "n": "02",
        "title": "בדיקה משפטית ו-KYC",
        "body": "אנחנו מאמתים את מסמכי מקור הקריפטו שלכם (AML/KYC) ומוודאים את קבלת הקריפטו מול היזם או המוכר."
      },
      {
        "n": "03",
        "title": "העברה מאובטחת",
        "body": "הכספים מועברים דרך בורסת קריפטו מורשית או בהעברה ישירה מהארנק, ומומרים ל-AED בשער המוסכם לצורך רישום ב-DLD."
      },
      {
        "n": "04",
        "title": "הנפקת שטר בעלות",
        "body": "הנכס נרשם במחלקת הקרקעות של דובאי (DLD) על שמכם. אתם מקבלים את שטר הבעלות הרשמי, בעלות חוקית מלאה."
      }
    ],
    "whyTitle": "למה דובאי לנדל\"ן בקריפטו",
    "whyPoints": [
      {
        "title": "מסגרת משפטית של VARA",
        "body": "רשות הנכסים הווירטואליים של דובאי (VARA) מספקת מסגרת משפטית ברורה ואכיפה לעסקאות נדל\"ן בקריפטו."
      },
      {
        "title": "0% מס",
        "body": "אין מס רווחי הון, מס נכסים או מס הכנסה באיחוד האמירויות. ההשקעה שלכם מקריפטו לנדל\"ן צומחת ללא מס כלל."
      },
      {
        "title": "רישום ב-DLD",
        "body": "כל עסקה נרשמת במחלקת הקרקעות של דובאי. הבעלות שלכם מתועדת בשטר בעלות ממשלתי רשמי."
      },
      {
        "title": "ללא הגבלות לאום",
        "body": "כל הלאומים מתקבלים בברכה, כולל רוסים, סינים, אירופאים ומדינות המפרץ. קריפטו הוא חוצה גבולות, אידיאלי למשקיעים בינלאומיים."
      },
      {
        "title": "Golden Visa ל-10 שנים",
        "body": "השקיעו 2 מיליון AED ומעלה (כ-545 אלף דולר) בנכס וזכאותכם ל-Golden Visa של איחוד האמירויות. ניתן לתשלום בקריפטו."
      },
      {
        "title": "תשואות שכירות של 5-10%",
        "body": "בין התשואות הגבוהות בעולם. מחירי נכסים על הנייר באזורים מרכזיים עלו ב-40-60% מאז 2021."
      }
    ],
    "faqTitle": "שאלות נפוצות",
    "faqs": [
      {
        "q": "האם קניית נכס בדובאי עם קריפטו חוקית?",
        "a": "כן. רשות הנכסים הווירטואליים (VARA) של איחוד האמירויות מספקת מסגרת משפטית ברורה. יזמים רבים בדובאי וה-DLD מאפשרים רכישות בקריפטו. העסקאות חייבות לעמוד בדרישות AML/KYC, אין מחסומים משפטיים לרוכשים זרים."
      },
      {
        "q": "אילו מטבעות קריפטו מתקבלים?",
        "a": "Bitcoin (BTC), Ethereum (ETH), Tether (USDT), USD Coin (USDC), Ripple (XRP) ו-BNB. USDT הוא הפופולרי ביותר כי הוא מבטל את סיכון תנודתיות המחיר במהלך תקופת העסקה."
      },
      {
        "q": "האם העברת ה-DLD מחייבת המרה ל-AED?",
        "a": "כן. ה-DLD רושם עסקאות ב-AED. הקריפטו שלכם מומר בשער חליפין מוסכם ביום העסקה, דרך בורסה מורשית באיחוד האמירויות או דרך היזם. סוכן Binayah שלכם מטפל בכל התיאום."
      },
      {
        "q": "האם יש מסים על רכישת נכס בקריפטו?",
        "a": "אין מס רווחי הון, אין מס הכנסה ואין מס עושר. העלויות היחידות הן דמי ההעברה של ה-DLD (4% מערך ה-AED) ודמי הסוכנות (כ-2%). אין מסים על רווחי הקריפטו עצמם."
      },
      {
        "q": "מהי ההשקעה המינימלית?",
        "a": "סטודיו מתחיל מ-500,000 AED (כ-136 אלף דולר או ₿2). ל-Golden Visa של איחוד האמירויות ל-10 שנים, ערך הנכס המינימלי הוא 2,000,000 AED (כ-545 אלף דולר)."
      },
      {
        "q": "האם אזרחים רוסים יכולים לקנות נכס בדובאי עם קריפטו?",
        "a": "בהחלט. אין הגבלות על אזרחים רוסים. קריפטו נוח במיוחד לנוכח מגבלות הבנקאות הבינלאומית. אנחנו מטפלים בכל התהליך כולל מסמכי AML."
      },
      {
        "q": "כמה זמן לוקח תהליך הרכישה?",
        "a": "על הנייר: 2-4 שבועות מההסכמה ועד לאישור ההזמנה. שוק משני: 3-6 שבועות להעברה מלאה. העברת הקריפטו עצמה לוקחת 1-3 ימי עסקים לאחר שהמסמכים מסודרים."
      },
      {
        "q": "אילו אזורים הכי טובים להשקעת נדל\"ן בקריפטו?",
        "a": "Dubai Marina, Downtown Dubai, Business Bay, Palm Jumeirah ו-JVC הם הבחירות המובילות. פרויקטים על הנייר של Emaar, DAMAC ו-Sobha מקבלים קריפטו למקדמות ראשוניות עם תוכניות תשלום גמישות."
      }
    ],
    "ctaTitle": "מוכנים להשקיע?",
    "ctaDesc": "המומחים שלנו לנדל\"ן בקריפטו זמינים 7 ימים בשבוע. קבלו ייעוץ אישי ורשימת נכסים מותאמת.",
    "ctaBtn": "צרו קשר עם מומחה",
    "ctaWhatsApp": "WhatsApp",
    "browseCta": "עיון בנכסים",
    "breadcrumb": "קנייה עם קריפטו"
  },
} as const;

type Locale = keyof typeof CONTENT;

// ─────────────────────────────────────────────────────────────
// Metadata
// ─────────────────────────────────────────────────────────────

interface Props { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const c = CONTENT[locale as Locale] ?? CONTENT.en;
  const url = canonical(locale, "/buy-with-crypto");
  return {
    title: c.metaTitle,
    description: c.metaDesc,
    alternates: { canonical: url, languages: altLangs("/buy-with-crypto") },
    openGraph: {
      title: c.metaTitle,
      description: c.metaDesc,
      url,
      type: "website",
      locale: c.ogLocale,
      siteName: "Binayah Properties",
      images: [{ url: `${AE_URL}/assets/crypto-banner.webp`, width: 1200, height: 630, alt: c.h1a }],
    },
    twitter: {
      card: "summary_large_image",
      title: c.metaTitle,
      description: c.metaDesc,
      images: [`${AE_URL}/assets/crypto-banner.webp`],
    },
    keywords: locale === "ru"
      ? ["купить недвижимость за биткоин дубай", "криптовалюта недвижимость дубай", "купить квартиру за крипто дубай", "биткоин недвижимость оаэ", "инвестиции крипто дубай"]
      : locale === "ar" // vi branch below
      ? ["شراء عقار بالبيتكوين دبي", "عقارات بالعملات المشفرة دبي", "استثمار عقاري بالكريبتو", "شراء شقة بالبيتكوين الإمارات"]
      : locale === "zh"
      ? ["用比特币购买迪拜房产", "迪拜加密货币购房", "比特币房产迪拜", "用USDT买迪拜房子"]
      : locale === "vi" ? ["mua bất động sản dubai bitcoin", "bất động sản tiền điện tử dubai", "mua căn hộ dubai tiền điện tử", "bitcoin bất động sản uae", "mua bất động sản dubai usdt"] : locale === "he" ? ["לקנות נכס בדובאי ביטקוין","נדל\"ן קריפטו דובאי","לקנות דירה בדובאי במטבעות קריפטו","נכס ביטקוין איחוד האמירויות","את'ריום לקנות נכס בדובאי"] : ["buy property dubai bitcoin", "crypto real estate dubai", "buy dubai apartment cryptocurrency", "bitcoin property uae", "ethereum buy dubai property"],
  };
}

// ─────────────────────────────────────────────────────────────
// Page component
// ─────────────────────────────────────────────────────────────

export default async function BuyWithCryptoPage({ params }: Props) {
  const { locale } = await params;
  const c = CONTENT[locale as Locale] ?? CONTENT.en;
  const isRtl = locale === "ar" || locale === "he"; // ar, he are rtl; vi, zh, ru, en are ltr
  const lp = locale === "en" ? "" : `/${locale}`;

  const breadcrumbs = [
    { name: locale === "ru" ? "Главная" : locale === "ar" ? "الرئيسية" : locale === "zh" ? "首页" : locale === "vi" ? "Trang chủ" : locale === "he" ? "בית" : "Home", href: `${lp}/` },
    { name: c.breadcrumb, href: `${lp}/buy-with-crypto` },
  ];

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? "rtl" : "ltr"}>
      <FAQJsonLd faqs={c.faqs.map(f => ({ question: f.q, answer: f.a }))} />
      <BreadcrumbJsonLd items={breadcrumbs} />
      <Navbar />

      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden min-h-[360px] sm:min-h-[520px] flex items-center">
        {/* Gold crypto banner as full hero background */}
        <Image
          src="/assets/crypto-banner.webp"
          alt={locale === "ru" ? "Криптовалюта и недвижимость Дубая" : locale === "ar" ? "العملات المشفرة والعقارات في دبي" : locale === "zh" ? "加密货币与迪拜房产投资" : locale === "vi" ? "Tiền điện tử và đầu tư bất động sản Dubai" : locale === "he" ? "השקעה בנדל\"ן בדובאי ומטבעות קריפטוגרפיים" : "Cryptocurrency and Dubai real estate investment"}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        {/* Dark overlay for text readability while preserving the gold coins */}
        <div className="absolute inset-0 bg-black/55" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-28 md:py-36">
          <p className="text-accent font-bold tracking-[0.4em] uppercase text-xs mb-5">{c.heroLabel}</p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-2">
            {c.h1a}
          </h1>
          <p className="text-3xl sm:text-4xl lg:text-5xl font-light text-primary-foreground/70 mb-7">
            {c.h1b}
          </p>
          <p className="text-primary-foreground/80 text-lg leading-relaxed max-w-2xl mb-10">{c.heroDesc}</p>
          <div className="flex flex-wrap gap-4">
            <Link
              href={`${lp}/contact`}
              className="inline-flex items-center gap-2 font-bold px-8 py-4 rounded-xl text-base transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg, #D4A847, #B8922F)", color: "#fff" }}
            >
              {c.heroCta} <span aria-hidden="true">{c.heroCtaArrow}</span>
            </Link>
            <Link
              href={`${lp}/search`}
              className="inline-flex items-center gap-2 border-2 border-white/30 text-white font-semibold px-8 py-4 rounded-xl text-base hover:border-white/60 hover:bg-white/5 transition-all"
            >
              {c.browseCta}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats strip ─────────────────────────────────────────── */}
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

      {/* ── Accepted coins ──────────────────────────────────────── */}
      <section className="bg-muted/30 border-b border-border/40 py-5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap items-center gap-3 justify-center sm:justify-start">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] shrink-0">{c.coinsLabel}:</span>
            {c.coins.map((coin) => (
              <span
                key={coin}
                className="text-xs font-bold px-3 py-1.5 rounded-full border"
                style={{ background: "rgba(212,168,71,0.08)", borderColor: "rgba(212,168,71,0.3)", color: "#B8922F" }}
              >
                {coin}
              </span>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-14 sm:space-y-20">

        {/* ── How it works ────────────────────────────────────────── */}
        <section>
          <div className="text-center mb-12">
            <p className="text-accent font-bold tracking-[0.35em] uppercase text-xs mb-3">Process</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">{c.howTitle}</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            {c.steps.map((step) => (
              <div
                key={step.n}
                className="group bg-card border border-border/50 rounded-2xl p-5 sm:p-7 hover:border-primary/30 hover:shadow-sm transition-all"
              >
                <div
                  className="text-4xl font-black mb-4 leading-none"
                  style={{ color: "rgba(26,122,90,0.2)" }}
                >
                  {step.n}
                </div>
                <h3 className="text-base font-bold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Why Dubai ───────────────────────────────────────────── */}
        <section>
          <div className="text-center mb-12">
            <p className="text-accent font-bold tracking-[0.35em] uppercase text-xs mb-3">Benefits</p>
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

        {/* ── FAQ ─────────────────────────────────────────────────── */}
        <section>
          <div className="text-center mb-12">
            <p className="text-accent font-bold tracking-[0.35em] uppercase text-xs mb-3">FAQ</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">{c.faqTitle}</h2>
          </div>
          <div className="space-y-3">
            {c.faqs.map((faq, i) => (
              <details
                key={i}
                className="group bg-card border border-border/50 rounded-2xl overflow-hidden hover:border-primary/20 transition-colors"
              >
                <summary className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 sm:py-5 cursor-pointer list-none font-semibold text-foreground hover:text-primary transition-colors text-sm">
                  <span>{faq.q}</span>
                  <span
                    className="text-accent text-xl font-light flex-shrink-0 transition-transform duration-200 group-open:rotate-45"
                    aria-hidden="true"
                  >
                    +
                  </span>
                </summary>
                <div className="px-4 sm:px-6 pb-4 sm:pb-6 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/30 pt-3 sm:pt-4">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* ── Related crypto guides (hub → spokes, SEO siloing) ───── */}
        <section>
          <h2 className="text-lg font-bold text-foreground mb-4">{(CRYPTO_LABELS[locale as CryptoLocale] ?? CRYPTO_LABELS.en).relatedTitle}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {CRYPTO_PAGES.map((p) => {
              const sc = p.locales[locale as CryptoLocale] ?? p.locales.en;
              return (
                <Link
                  key={p.slug}
                  href={`${lp}/buy-with-crypto/${p.slug}`}
                  className="block bg-card border border-border/50 rounded-2xl p-5 hover:border-primary/30 hover:shadow-sm transition-all"
                >
                  <p className="text-sm font-bold text-foreground mb-1 group-hover:text-primary">{sc.breadcrumb}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{sc.heroDesc}</p>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ── CTA ─────────────────────────────────────────────────── */}
        <section
          className="rounded-2xl sm:rounded-3xl p-6 sm:p-10 lg:p-14 text-center text-white relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
        >
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)", backgroundSize: "32px 32px" }}
          />
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
                className="border-2 border-white/30 text-white font-bold px-6 py-3 sm:px-8 sm:py-4 rounded-xl text-sm sm:text-base hover:bg-white/10 hover:border-white/50 transition-all text-base"
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
