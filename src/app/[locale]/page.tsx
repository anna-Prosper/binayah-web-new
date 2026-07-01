import HomePageClient from "@/components/HomePageClient";
import { getHomepageData } from "@/lib/api";
import type { Metadata } from "next";
import { canonical, altLangs, OG_LOCALE, AE_URL } from "@/lib/site";
import { FAQJsonLd } from "@/components/JsonLd";
import { getGoogleReviews } from "@/lib/googleReviews";
import FAQSectionServer from "@/components/FAQSectionServer";
import HomeIntro from "@/components/HomeIntro";
import ServicesSection from "@/components/ServicesSection";

export const revalidate = 300;

interface Props { params: Promise<{ locale: string }> }

const titles: Record<string, string> = {
  en: "Dubai Real Estate | Buy, Rent & Invest | Binayah Properties",
  ru: "Недвижимость в Дубае | Купить, Снять, Инвестировать | Binayah",
  ar: "عقارات دبي | شراء وإيجار واستثمار | بناية للعقارات",
  zh: "迪拜房地产 | 购买、租赁和投资 | Binayah Properties",
  vi: "Bất Động Sản Dubai | Mua, Thuê & Đầu Tư | Binayah Properties",
  he: "נדל\"ן בדובאי | קנייה, השכרה והשקעה | Binayah Properties",
  fr: "Immobilier à Dubaï | Acheter, Louer & Investir | Binayah Properties",
};
const descriptions: Record<string, string> = {
  en: "Buy, rent or invest in Dubai real estate — luxury apartments, villas & off-plan with flexible payment plans. RERA-certified, trusted since 2007.",
  ru: "Купить, арендовать или инвестировать в недвижимость Дубая — апартаменты, виллы и новостройки с гибкими планами оплаты. Сертификат RERA, нам доверяют с 2007 года.",
  ar: "اشترِ أو استأجر أو استثمر في عقارات دبي — شقق فاخرة وفلل ومشاريع على الخارطة بخطط سداد مرنة. معتمدون من RERA وموثوقون منذ عام 2007.",
  zh: "在迪拜购买、租赁或投资房地产——豪华公寓、别墅及期房项目，灵活付款计划。RERA 认证，自 2007 年值得信赖。",
  vi: "Mua, thuê hoặc đầu tư bất động sản Dubai — căn hộ sang trọng, biệt thự và dự án off-plan với kế hoạch thanh toán linh hoạt. Chứng nhận RERA, uy tín từ 2007.",
  he: "קנו, השכירו או השקיעו בנדל\"ן בדובאי — דירות יוקרה, וילות ופרויקטים על הנייר עם תוכניות תשלום גמישות. מוסמכים RERA ומהימנים מאז 2007.",
  fr: "Achetez, louez ou investissez dans l'immobilier à Dubaï — appartements de luxe, villas et projets sur plan avec paiements flexibles. Certifié RERA depuis 2007.",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: titles[locale] || titles.en,
    description: descriptions[locale] || descriptions.en,
    alternates: {
      canonical: canonical(locale, "/"),
      languages: altLangs("/"),
    },
    openGraph: {
      title: titles[locale] || titles.en,
      description: descriptions[locale] || descriptions.en,
      url: canonical(locale, "/"),
      type: "website",
      locale: OG_LOCALE[locale] ?? "en_AE",
      siteName: "Binayah Properties",
      images: [{ url: `${AE_URL}/assets/og-image.webp`, width: 1200, height: 630, alt: "Binayah Properties, Dubai Real Estate" }],
    },
  };
}

const FALLBACK_LISTINGS = [
  {
    _id: "fallback-listing-1",
    title: "Luxury 2BR Apartment in Dubai Marina",
    slug: "__fallback__",
    propertyId: "BIN-001",
    listingType: "Sale",
    propertyType: "Apartment",
    bedrooms: 2,
    bathrooms: 2,
    size: 1250,
    sizeUnit: "sqft",
    price: 2400000,
    currency: "AED",
    community: "Dubai Marina",
    city: "Dubai",
    featuredImage: "/assets/property-placeholder-v2.webp",
    imageGallery: ["/assets/property-placeholder-v2.webp"],
  },
];

const FALLBACK_PROJECTS = [
  {
    _id: "fallback-project-1",
    name: "Binghatti Hillcrest",
    slug: "binghatti-hillcrest",
    status: "Off-Plan",
    developerName: "Binghatti Developers",
    community: "Arjan",
    city: "Dubai",
    startingPrice: 799999,
    currency: "AED",
    handover: "Q4 2026",
    completionDate: "2026-12-01",
    shortOverview: "Striking modern residential development of studio, 1 & 2-bedroom apartments in Arjan, Dubai.",
    featuredImage: "/assets/dubai-hero.webp",
    imageGallery: ["/assets/dubai-hero.webp"],
    propertyType: "Apartment",
    unitTypes: ["Studio", "1 BR", "2 BR"],
    unitSizeMin: 333,
    unitSizeMax: 1028,
  },
  {
    _id: "fallback-project-2",
    name: "Emaar Beachfront",
    slug: "binghatti-hillcrest",
    status: "Off-Plan",
    developerName: "Emaar Properties",
    community: "Dubai Harbour",
    city: "Dubai",
    startingPrice: 1850000,
    currency: "AED",
    handover: "Q2 2027",
    featuredImage: "/assets/dubai-hero.webp",
    imageGallery: ["/assets/dubai-hero.webp"],
    propertyType: "Apartment",
  },
  {
    _id: "fallback-project-3",
    name: "Sobha Hartland II",
    slug: "binghatti-hillcrest",
    status: "Off-Plan",
    developerName: "Sobha Realty",
    community: "MBR City",
    city: "Dubai",
    startingPrice: 1200000,
    currency: "AED",
    handover: "Q1 2027",
    featuredImage: "/assets/dubai-hero.webp",
    imageGallery: ["/assets/dubai-hero.webp"],
    propertyType: "Apartment",
  },
  {
    _id: "fallback-project-4",
    name: "Tilal Al Ghaf Villas",
    slug: "binghatti-hillcrest",
    status: "Off-Plan",
    developerName: "Majid Al Futtaim",
    community: "Tilal Al Ghaf",
    city: "Dubai",
    startingPrice: 3500000,
    currency: "AED",
    handover: "Q3 2026",
    featuredImage: "/assets/property-placeholder-v2.webp",
    imageGallery: ["/assets/property-placeholder-v2.webp"],
    propertyType: "Villa",
  },
];

const FALLBACK_ARTICLES = [
  {
    _id: "fallback-article-1",
    title: "Best Off-Plan Under AED 2 Million, Golden Visa Eligible",
    slug: "best-offplan-under-2m",
    category: "Investment",
    featuredImage: "/assets/dubai-hero.webp",
    publishedAt: "2026-02-09",
  },
  {
    _id: "fallback-article-2",
    title: "Tax Benefits of Owning Property in Dubai, The Complete Picture",
    slug: "tax-benefits-dubai-property",
    category: "Guides",
    featuredImage: "/assets/dubai-hero.webp",
    publishedAt: "2026-02-07",
  },
  {
    _id: "fallback-article-3",
    title: "Is Dubai Property a Good Investment in 2026?",
    slug: "dubai-property-investment-2026",
    category: "Market Insights",
    featuredImage: "/assets/dubai-hero.webp",
    publishedAt: "2026-02-07",
  },
];

// eslint-disable-next-line i18next/no-literal-string
const HOME_FAQS: Record<string, { question: string; answer: string }[]> = {
  en: [
    { question: "Can foreigners buy property in Dubai?", answer: "Yes. The UAE allows 100% freehold ownership for all nationalities in designated freehold areas including Dubai Marina, Downtown Dubai, Palm Jumeirah, Business Bay, JVC, and 60+ other communities. No residency required." },
    { question: "What is the minimum investment to buy property in Dubai?", answer: "Studio apartments start from AED 300,000-500,000 (~$82K-$136K). Off-plan projects often require a 10-20% down payment with flexible post-handover payment plans. For a 10-year UAE Golden Visa, the minimum is AED 2,000,000 (~$545K)." },
    { question: "Are there property taxes in Dubai?", answer: "No. Dubai has no annual property tax, no capital gains tax, no income tax, and no inheritance tax. The only one-time costs are the DLD transfer fee (4%) and the agent commission (~2%). This makes Dubai one of the most tax-efficient property markets in the world." },
    { question: "What is an off-plan property in Dubai?", answer: "Off-plan means buying a property before it is built or during construction. Buyers typically pay 10-20% upfront with the remainder due in instalments during construction or after handover. Off-plan properties in Dubai are often 15-30% cheaper than comparable ready units and offer strong capital appreciation." },
    { question: "What are the best areas to invest in Dubai?", answer: "For rental yield: Jumeirah Village Circle (JVC), Dubai Marina, and Business Bay offer 6-9% gross yields. For capital appreciation: Downtown Dubai, Palm Jumeirah, and Dubai Creek Harbour. For off-plan: Dubai South, Meydan, and Ras Al Khor are emerging high-growth areas." },
    { question: "How long does the property buying process take in Dubai?", answer: "Off-plan: 2-4 weeks from reservation to booking confirmation. Ready/secondary market: 4-8 weeks from agreed price to DLD title deed. The DLD transfer itself takes 1-2 business days once all documents are ready and the mortgage (if any) is approved." },
    { question: "Can I get a mortgage in Dubai as a non-resident?", answer: "Yes. UAE banks offer mortgages to non-residents for ready properties. Typical LTV for non-residents is 50-60% (versus 75-80% for UAE residents). Minimum property value for a non-resident mortgage is usually AED 1,000,000. Some developers also offer 0% interest developer financing on off-plan projects." },
    { question: "What is the DLD transfer fee in Dubai?", answer: "The Dubai Land Department (DLD) charges a 4% transfer fee on the property value. This is typically split equally between buyer and seller (2% each), though it can be negotiated. There is also a DLD admin fee of AED 580, a trustee fee of AED 4,000 (for properties over AED 500K), and a title deed issuance fee of AED 250." },
  ],
  ru: [
    { question: "Могут ли иностранцы покупать недвижимость в Дубае?", answer: "Да. ОАЭ разрешают 100% право собственности иностранным гражданам в специальных фрихолд-зонах, включая Дубай Марина, Даунтаун Дубай, Пальму Джумейру, Бизнес-Бей, JVC и более 60 других районов. Вид на жительство не требуется." },
    { question: "Какой минимальный бюджет для покупки недвижимости в Дубае?", answer: "Студии начинаются от 300 000-500 000 AED (~$82-136 тыс.). Новостройки часто требуют 10-20% первоначального взноса с гибкими планами оплаты. Для 10-летней Золотой визы ОАЭ минимум, 2 000 000 AED (~$545 тыс.)." },
    { question: "Есть ли налоги на недвижимость в Дубае?", answer: "Нет. В Дубае отсутствует ежегодный налог на имущество, налог на прирост капитала, подоходный налог и налог на наследство. Единоразовые расходы: сбор DLD (4%) и комиссия агента (~2%)." },
    { question: "Что такое недвижимость off-plan в Дубае?", answer: "Off-plan, покупка объекта до или в процессе строительства. Обычно 10-20% вносится сразу, остальное, в рассрочку в ходе строительства или после сдачи. Новостройки нередко на 15-30% дешевле готового жилья." },
    { question: "Какие районы лучше всего подходят для инвестиций?", answer: "По доходности от аренды: JVC, Дубай Марина, Бизнес-Бей (6-9% годовых). По росту стоимости: Даунтаун, Пальма Джумейра, Дубай Крик Харбор. По новостройкам: Дубай Саут, Мейдан, Рас-Аль-Хор." },
    { question: "Сколько времени занимает покупка недвижимости в Дубае?", answer: "Новостройки: 2-4 недели от бронирования до подтверждения. Вторичный рынок: 4-8 недель от согласования цены до получения свидетельства DLD." },
    { question: "Можно ли получить ипотеку в Дубае, не являясь резидентом?", answer: "Да. Банки ОАЭ выдают ипотеку нерезидентам на готовые объекты. LTV для нерезидентов обычно 50-60%. Некоторые застройщики предлагают беспроцентную рассрочку на новостройки." },
    { question: "Что такое сбор DLD и сколько он составляет?", answer: "Земельный департамент Дубая (DLD) взимает сбор в размере 4% от стоимости объекта при переходе права собственности. Обычно делится поровну между покупателем и продавцом (2% каждый)." },
  ],
  ar: [
    { question: "هل يمكن للأجانب شراء العقارات في دبي؟", answer: "نعم. تتيح الإمارات ملكية حرة بنسبة 100% لجميع الجنسيات في مناطق التملك الحر المخصصة، بما فيها دبي مارينا ووسط المدينة ونخلة جميرا والخليج التجاري وJVC وأكثر من 60 مجتمعًا آخر. لا تُشترط الإقامة." },
    { question: "ما الحد الأدنى للاستثمار العقاري في دبي؟", answer: "تبدأ شقق الاستوديو من 300,000 إلى 500,000 درهم (~82-136 ألف دولار). تستلزم المشاريع على الخارطة عادةً دفعة أولى بنسبة 10-20% مع خطط سداد مرنة. الحد الأدنى للتأشيرة الذهبية الإماراتية 2,000,000 درهم (~545 ألف دولار)." },
    { question: "هل هناك ضرائب على العقارات في دبي؟", answer: "لا. دبي خالية من ضريبة الأملاك السنوية وضريبة مكاسب رأس المال والضريبة على الدخل وضريبة الإرث. التكاليف الوحيدة لمرة واحدة: رسوم DLD (4%) وعمولة الوكيل (~2%)." },
    { question: "ما المقصود بالعقار على الخارطة في دبي؟", answer: "العقار على الخارطة هو شراء وحدة قبل اكتمال بنائها أو أثنائه. يُدفع عادةً 10-20% مقدمًا والباقي بالتقسيط خلال البناء أو بعد التسليم. غالبًا ما تكون أرخص 15-30% من الوحدات الجاهزة المماثلة." },
    { question: "ما أفضل مناطق الاستثمار في دبي؟", answer: "للعائد الإيجاري: جميرا فيلدج سيركل ودبي مارينا والخليج التجاري (6-9% سنويًا). لارتفاع القيمة: وسط المدينة ونخلة جميرا ودبي كريك هاربر. للمشاريع على الخارطة: دبي ساوث وميدان وراس الخور." },
    { question: "كم تستغرق عملية شراء العقار في دبي؟", answer: "المشاريع على الخارطة: 2-4 أسابيع من الحجز إلى التأكيد. السوق الثانوية: 4-8 أسابيع من الاتفاق على السعر إلى سند الملكية من DLD." },
    { question: "هل يمكن الحصول على قرض عقاري في دبي كغير مقيم؟", answer: "نعم. تُقدّم بنوك الإمارات قروضًا عقارية لغير المقيمين للعقارات الجاهزة. نسبة التمويل للمشترين الأجانب عادةً 50-60%. يُتيح بعض المطوّرين خططَ تقسيط بدون فوائد للمشاريع على الخارطة." },
    { question: "ما رسوم DLD وكم تبلغ؟", answer: "تفرض دائرة الأراضي والأملاك رسومًا بنسبة 4% من قيمة العقار عند نقل الملكية، تُقسَّم عادةً بالتساوي بين المشتري والبائع (2% لكلٍّ منهما)." },
  ],
  zh: [
    { question: "外国人可以在迪拜购买房产吗？", answer: "可以。阿联酋允许所有国籍在指定自由持有区享有100%产权，包括迪拜Marina、市中心、棕榈岛、商业湾、JVC等60多个社区，无需居住证。" },
    { question: "在迪拜购房的最低投资额是多少？", answer: "单间公寓起价30-50万迪拉姆（约8.2-13.6万美元）。期房通常需要10-20%首付，其余按施工进度付款。申请10年阿联酋黄金签证最低投资额为200万迪拉姆（约54.5万美元）。" },
    { question: "迪拜有房产税吗？", answer: "没有。迪拜无年度房产税、资本利得税、所得税或遗产税。唯一的一次性费用是DLD过户费（4%）和经纪佣金（约2%），是全球税收最优惠的房产市场之一。" },
    { question: "什么是迪拜期房？", answer: "期房是指在建筑建成前或建设中购买的房产。通常预付10-20%，其余在施工期间或交付后分期支付。迪拜期房通常比同类现房便宜15-30%，且具有较强的资本增值潜力。" },
    { question: "迪拜哪些地区最适合投资？", answer: "租金收益：朱美拉村庄圈（JVC）、迪拜Marina、商业湾提供6-9%年化收益。资本增值：市中心、棕榈岛、迪拜溪港。期房：迪拜南区、梅丹、拉斯海玛等新兴高增长区域。" },
    { question: "在迪拜购房需要多长时间？", answer: "期房：从预订到确认约2-4周。二手房：从议价到DLD产权证约4-8周。DLD过户本身在所有文件就绪后1-2个工作日完成。" },
    { question: "非居民可以在迪拜申请贷款吗？", answer: "可以。阿联酋银行为非居民提供现房贷款，外国买家的贷款价值比（LTV）通常为50-60%。部分开发商还为期房提供0利率开发商融资计划。" },
    { question: "DLD过户费是多少？", answer: "迪拜土地局（DLD）收取房产价值4%的过户费，通常由买卖双方各承担一半（各2%）。此外还有约580迪拉姆的行政费和4000迪拉姆的公证费。" },
  ],
  vi: [
    { question: "Người nước ngoài có thể mua bất động sản ở Dubai không?", answer: "Có. UAE cho phép sở hữu tự do 100% cho tất cả các quốc tịch trong các khu vực tự do được chỉ định bao gồm Dubai Marina, Downtown Dubai, Palm Jumeirah, Business Bay, JVC và hơn 60 cộng đồng khác. Không yêu cầu cư trú." },
    { question: "Đầu tư tối thiểu để mua bất động sản ở Dubai là bao nhiêu?", answer: "Căn hộ studio bắt đầu từ AED 300,000-500,000 (~$82K-$136K). Các dự án chưa hoàn thành thường yêu cầu đặt cọc 10-20% với các kế hoạch thanh toán linh hoạt sau khi bàn giao. Đối với Thị thực Vàng UAE 10 năm, tối thiểu là AED 2,000,000 (~$545K)." },
    { question: "Có thuế bất động sản ở Dubai không?", answer: "Không. Dubai không có thuế bất động sản hàng năm, không có thuế lợi tức vốn, không có thuế thu nhập và không có thuế thừa kế. Các chi phí một lần duy nhất là phí chuyển nhượng DLD (4%) và hoa hồng đại lý (~2%). Điều này làm cho Dubai trở thành một trong những thị trường bất động sản hiệu quả về thuế nhất trên thế giới." },
    { question: "Bất động sản chưa hoàn thành ở Dubai là gì?", answer: "Chưa hoàn thành có nghĩa là mua một bất động sản trước khi nó được xây dựng hoặc trong quá trình xây dựng. Người mua thường trả trước 10-20% với phần còn lại được thanh toán theo từng đợt trong quá trình xây dựng hoặc sau khi bàn giao. Bất động sản chưa hoàn thành ở Dubai thường rẻ hơn 15-30% so với các đơn vị đã sẵn sàng tương đương và mang lại sự tăng giá vốn mạnh mẽ." },
    { question: "Những khu vực nào tốt nhất để đầu tư ở Dubai?", answer: "Đối với lợi nhuận cho thuê: Jumeirah Village Circle (JVC), Dubai Marina và Business Bay cung cấp lợi nhuận gộp 6-9%. Đối với tăng giá vốn: Downtown Dubai, Palm Jumeirah và Dubai Creek Harbour. Đối với chưa hoàn thành: Dubai South, Meydan và Ras Al Khor là những khu vực tăng trưởng cao mới nổi." },
    { question: "Quá trình mua bất động sản ở Dubai mất bao lâu?", answer: "Chưa hoàn thành: 2-4 tuần từ khi đặt chỗ đến khi xác nhận đặt chỗ. Thị trường sẵn sàng/thứ cấp: 4-8 tuần từ giá đã thỏa thuận đến giấy chứng nhận quyền sở hữu DLD. Việc chuyển nhượng DLD tự nó mất 1-2 ngày làm việc khi tất cả các tài liệu đã sẵn sàng và khoản vay thế chấp (nếu có) được phê duyệt." },
    { question: "Tôi có thể vay thế chấp ở Dubai khi không phải là cư dân không?", answer: "Có. Các ngân hàng UAE cung cấp các khoản vay thế chấp cho người không cư trú đối với các bất động sản đã sẵn sàng. Tỷ lệ LTV điển hình cho người không cư trú là 50-60% (so với 75-80% cho cư dân UAE). Giá trị bất động sản tối thiểu cho khoản vay thế chấp của người không cư trú thường là AED 1,000,000. Một số nhà phát triển cũng cung cấp tài chính phát triển không lãi suất cho các dự án chưa hoàn thành." },
    { question: "Phí chuyển nhượng DLD ở Dubai là gì?", answer: "Cục Đất đai Dubai (DLD) tính phí chuyển nhượng 4% trên giá trị bất động sản. Thông thường, phí này được chia đều giữa người mua và người bán (2% mỗi bên), mặc dù có thể thương lượng. Cũng có phí hành chính DLD là AED 580, phí ủy thác là AED 4,000 (đối với bất động sản trên AED 500K), và phí cấp giấy chứng nhận quyền sở hữu là AED 250." },
  ],
  he: [
    { question: "האם זרים יכולים לקנות נכס בדובאי?", answer: "כן. איחוד האמירויות מאפשר בעלות חופשית של 100% לכל הלאומים באזורים חופשיים מוגדרים כולל Dubai Marina, Downtown Dubai, Palm Jumeirah, Business Bay, JVC, ו-60+ קהילות נוספות. אין צורך בתושבות." },
    { question: "מהו ההשקעה המינימלית לרכישת נכס בדובאי?", answer: "דירות סטודיו מתחילות מ-AED 300,000-500,000 (~$82K-$136K). פרויקטים בתכנון מוקדם דורשים לעיתים קרובות מקדמה של 10-20% עם תוכניות תשלום גמישות לאחר מסירה. עבור ויזת זהב ל-10 שנים באיחוד האמירויות, המינימום הוא AED 2,000,000 (~$545K)." },
    { question: "האם יש מיסי נכס בדובאי?", answer: "לא. בדובאי אין מס נכס שנתי, אין מס רווחי הון, אין מס הכנסה ואין מס ירושה. העלויות היחידות הן דמי העברה ל-DLD (4%) ועמלת סוכן (~2%). זה הופך את דובאי לאחד משוקי הנדל\"ן היעילים ביותר מבחינת מיסוי בעולם." },
    { question: "מהו נכס בתכנון מוקדם בדובאי?", answer: "תכנון מוקדם משמעו רכישת נכס לפני שהוא נבנה או במהלך הבנייה. קונים בדרך כלל משלמים 10-20% מראש והיתרה בתשלומים במהלך הבנייה או לאחר המסירה. נכסים בתכנון מוקדם בדובאי הם לעיתים קרובות זולים ב-15-30% מיחידות מוכנות דומות ומציעים הערכת הון חזקה." },
    { question: "מהם האזורים הטובים ביותר להשקעה בדובאי?", answer: "לתשואה מהשכרה: Jumeirah Village Circle (JVC), Dubai Marina, ו-Business Bay מציעים תשואות ברוטו של 6-9%. להערכת הון: Downtown Dubai, Palm Jumeirah, ו-Dubai Creek Harbour. לתכנון מוקדם: Dubai South, Meydan, ו-Ras Al Khor הם אזורים מתפתחים עם צמיחה גבוהה." },
    { question: "כמה זמן לוקח תהליך רכישת נכס בדובאי?", answer: "תכנון מוקדם: 2-4 שבועות מהזמנה לאישור הזמנה. שוק מוכן/משני: 4-8 שבועות מהסכמה על מחיר עד ל-DLD title deed. ההעברה ב-DLD עצמה לוקחת 1-2 ימי עסקים לאחר שכל המסמכים מוכנים והמשכנתא (אם יש) מאושרת." },
    { question: "האם אני יכול לקבל משכנתא בדובאי כלא תושב?", answer: "כן. בנקים באיחוד האמירויות מציעים משכנתאות ללא תושבים עבור נכסים מוכנים. יחס LTV טיפוסי ללא תושבים הוא 50-60% (לעומת 75-80% לתושבי איחוד האמירויות). ערך הנכס המינימלי למשכנתא ללא תושב הוא בדרך כלל AED 1,000,000. חלק מהיזמים מציעים גם מימון יזמי ללא ריבית על פרויקטים בתכנון מוקדם." },
    { question: "מהו דמי ההעברה ל-DLD בדובאי?", answer: "מחלקת הקרקעות של דובאי (DLD) גובה דמי העברה של 4% מערך הנכס. זה בדרך כלל מתחלק שווה בשווה בין הקונה והמוכר (2% כל אחד), אם כי ניתן לנהל משא ומתן. יש גם דמי ניהול ל-DLD של AED 580, דמי נאמן של AED 4,000 (לנכסים מעל AED 500K), ודמי הנפקת title deed של AED 250." },
  ],
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  const faqs = HOME_FAQS[locale] || HOME_FAQS.en;
  // Cached across requests (5-min revalidate) so SSR doesn't wait on the slow
  // Render API every load — that wait was the dominant TTFB/LCP cost.
  const data = await getHomepageData();
  const saleListings = (data.sale && data.sale.length > 0 ? data.sale : FALLBACK_LISTINGS) as any[];
  const rentalListings = (data.rental ?? []) as any[];
  const projects = (data.projects && data.projects.length > 0 ? data.projects : FALLBACK_PROJECTS) as any[];
  const articles = (data.articles && data.articles.length > 0 ? data.articles : FALLBACK_ARTICLES) as any[];

  // Real Google reviews (null until Places API is enabled + GOOGLE_PLACE_ID set).
  const googleReviews = await getGoogleReviews();

  return (
    <>
      <FAQJsonLd faqs={faqs} />
      <HomePageClient
        saleListings={saleListings.filter(Boolean)}
        rentalListings={rentalListings.filter(Boolean)}
        offPlanProjects={projects.filter(Boolean)}
        latestArticles={articles.filter(Boolean)}
        googleReviews={googleReviews}
        introSlot={<HomeIntro locale={locale} />}
        faqSlot={<FAQSectionServer faqs={faqs} locale={locale} />}
        servicesSlot={<ServicesSection locale={locale} />}
      />
    </>
  );
}
