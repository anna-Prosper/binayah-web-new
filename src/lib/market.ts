import { cache } from "react";
import { serverApiUrl, serverFetch } from "@/lib/api";

// Per-community market stats from the public /api/market-stats endpoint
// (listings + DLD/ejari enriched). Used to add real depth — avg price/sqft,
// gross yield, supply mix — to community/area/off-plan-in templates so they
// aren't thin. One upstream fetch is shared across the request via cache().

export interface CommunityStat {
  area: string;
  avgPricePerSqft: number;
  avgSalePrice: number;
  avgRentPrice: number;
  rentalYield: number;
  yieldSource: "listings" | "benchmark" | "ejari" | string;
  totalListings: number;
  offPlanCount: number;
  secondaryCount: number;
  investmentScore?: number;
}

export interface MarketStatsResponse {
  summary?: Record<string, number | null>;
  communityMatrix?: CommunityStat[];
  figuresSource?: string;
  figuresUpdatedAt?: string;
}

export const getMarketStats = cache(async (): Promise<MarketStatsResponse | null> => {
  try {
    // Cross-request cache: /api/market-stats is a heavy, site-wide, slow-moving
    // endpoint. serverFetch() is uncached (Next defaults to no-store), so every
    // render re-fetched it. Cache it in Next's data cache for an hour instead —
    // fetched at most once/hour site-wide and reused everywhere. (React cache()
    // dedupes within a single render; next.revalidate caches across requests.)
    const res = await fetch(serverApiUrl("/api/market-stats"), {
      signal: AbortSignal.timeout(10_000),
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return (await res.json()) as MarketStatsResponse;
  } catch {
    return null;
  }
});

const norm = (s: string) =>
  s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, " ").trim();

// Marketing community name → the official DLD area name used in the buildings
// dataset (the building filter is a contains-regex, so one canonical name is
// enough). Only the communities whose marketing name differs from the DLD area
// need an entry; everything else falls through unchanged. Verified to return
// buildings against /api/dld/buildings?area=.
const DLD_AREA_ALIASES: Record<string, string> = {
  "downtown dubai": "Burj Khalifa",
  "downtown": "Burj Khalifa",
  "dubai hills estate": "Dubai Hills",
  "mbr city": "Hadaeq Sheikh Mohammed Bin Rashid",
  "mohammed bin rashid city": "Hadaeq Sheikh Mohammed Bin Rashid",
  "sobha hartland": "Hadaeq Sheikh Mohammed Bin Rashid",
  "meydan": "Meydan",
  "jlt": "Jumeirah Lakes Towers",
  "jumeirah lake towers": "Jumeirah Lakes Towers",
  "jumeirah lakes towers": "Jumeirah Lakes Towers",
  // Verified against /api/dld/areas (2026-07): marketing name → official DLD area.
  "dubai islands": "Palm Deira",
  "the oasis by emaar": "Me'aisem Second",
  "jumeirah golf estates": "Me'aisem First",
  "nad al sheba": "Nad Al Sheba Gardens",
  "damac hills 2": "Madinat Hind 4",
  "damac island": "Madinat Hind 4",
  "damac islands": "Madinat Hind 4",
  "damac lagoons": "Al Hebiah Fifth",
  "damac riverside": "Dubai Investment Park Second",
  "jebel ali": "Jabal Ali First",
  "jebel ali village": "Jabal Ali First",
  "dubai silicon oasis": "Nadd Hessa",
  "al jaddaf": "Al Jadaf",
  "arabian ranches": "Arabian Ranches I",
  "arabian ranches 3": "Wadi Al Safa 5",
  "emaar beachfront": "Dubai Harbour",
  "sports city dubai": "Dubai Sports City",
  "international city dubai": "International City Ph 1",
  "dubai land residence complex dlrc": "Dubai Land Residence Complex",
};

/**
 * Map a community name to the DLD area name for building/area lookups.
 * Falls back to stripping a marketing " Dubai" suffix / parentheses ("Motor
 * City Dubai" → "Motor City", "… (DLRC)" → "…"), then the name itself.
 */
export function dldAreaFor(community: string): string {
  const aliased = DLD_AREA_ALIASES[norm(community)];
  if (aliased) return aliased;
  const stripped = community.replace(/\s*\([^)]*\)\s*$/, "").replace(/\s+Dubai$/i, "").trim();
  return stripped || community;
}

/** Find the stats row for a community name (tolerant of aliases/casing). */
export const getCommunityStats = cache(async (community: string): Promise<CommunityStat | null> => {
  if (!community) return null;
  const data = await getMarketStats();
  const rows = data?.communityMatrix;
  if (!Array.isArray(rows) || rows.length === 0) return null;
  const target = norm(community);
  // exact normalized match first, then a contains match either direction
  return (
    rows.find((r) => norm(r.area) === target) ||
    rows.find((r) => norm(r.area).includes(target) || target.includes(norm(r.area))) ||
    null
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// i18n for the data-driven market sentence + FAQ set. Numbers, community names,
// AED, DLD, RERA, %, and the "DLD/Ejari" source token stay verbatim across all
// locales — only the surrounding phrasing is translated. Unknown locale → en.
// ─────────────────────────────────────────────────────────────────────────────

interface MarketI18n {
  and: string;
  // market note (buy)
  buyPerSqft: (v: string) => string;
  buyAsking: (v: string) => string;
  buySentence: (name: string, parts: string) => string;
  // market note (rent)
  rentAvg: (v: string) => string;
  rentYield: (pct: number, src: string) => string;
  rentSentence: (name: string, parts: string) => string;
  noteSrcEjari: string;
  noteSrcListings: string;
  noteSrcBenchmark: string;
  // FAQ source labels
  faqSrcEjari: string;
  faqSrcListings: string;
  faqSrcBenchmark: string;
  // FAQ Q/A
  q1: (name: string) => string;
  a1: (name: string, v: string) => string;
  q2: (name: string) => string;
  a2: (name: string, pct: number, src: string) => string;
  q3: (name: string) => string;
  a3: (name: string, off: string, sec: string) => string;
  q4: (name: string) => string;
  a4: (name: string, v: string) => string;
}

const MARKET_I18N: Record<string, MarketI18n> = {
  en: {
    and: " and ",
    buyPerSqft: (v) => `average sale prices around AED ${v} per sqft`,
    buyAsking: (v) => `a typical asking price near AED ${v}`,
    buySentence: (name, parts) => `Buyers in ${name} are seeing ${parts}, based on the latest listing and Dubai Land Department (DLD) data.`,
    rentAvg: (v) => `average rents around AED ${v} per year`,
    rentYield: (pct, src) => `a gross rental yield of about ${pct}% (${src})`,
    rentSentence: (name, parts) => `Tenants and investors in ${name} are seeing ${parts}.`,
    noteSrcEjari: "DLD/Ejari contracts",
    noteSrcListings: "current listings",
    noteSrcBenchmark: "market benchmarks",
    faqSrcEjari: "DLD/Ejari rental contracts",
    faqSrcListings: "current rental listings",
    faqSrcBenchmark: "Dubai market benchmarks",
    q1: (name) => `What is the average price per square foot in ${name}?`,
    a1: (name, v) => `The current average sale price in ${name} is around AED ${v} per square foot, based on the latest listing and Dubai Land Department (DLD) data.`,
    q2: (name) => `What rental yield can I expect in ${name}?`,
    a2: (name, pct, src) => `${name} offers an average gross rental yield of about ${pct}%, derived from ${src}. Actual yield varies by building, unit type and furnishing.`,
    q3: (name) => `Is ${name} better for off-plan or ready property?`,
    a3: (name, off, sec) => `${name} currently has roughly ${off} off-plan and ${sec} ready (secondary) listings. Off-plan suits investors wanting payment plans and capital appreciation; ready suits end-users and immediate rental income.`,
    q4: (name) => `How much does property cost in ${name}?`,
    a4: (name, v) => `The average asking price in ${name} is around AED ${v}, though it ranges widely by unit size, view and building. Browse live listings above for current availability.`,
  },
  fr: {
    and: " et ",
    buyPerSqft: (v) => `des prix de vente moyens d'environ AED ${v} par pied carré`,
    buyAsking: (v) => `un prix affiché typique proche de AED ${v}`,
    buySentence: (name, parts) => `Les acheteurs à ${name} constatent ${parts}, d'après les dernières annonces et les données du Dubai Land Department (DLD).`,
    rentAvg: (v) => `des loyers moyens d'environ AED ${v} par an`,
    rentYield: (pct, src) => `un rendement locatif brut d'environ ${pct}% (${src})`,
    rentSentence: (name, parts) => `Les locataires et investisseurs à ${name} constatent ${parts}.`,
    noteSrcEjari: "contrats DLD/Ejari",
    noteSrcListings: "annonces actuelles",
    noteSrcBenchmark: "références du marché",
    faqSrcEjari: "contrats de location DLD/Ejari",
    faqSrcListings: "annonces de location actuelles",
    faqSrcBenchmark: "références du marché de Dubaï",
    q1: (name) => `Quel est le prix moyen au pied carré à ${name} ?`,
    a1: (name, v) => `Le prix de vente moyen actuel à ${name} est d'environ AED ${v} par pied carré, d'après les dernières annonces et les données du Dubai Land Department (DLD).`,
    q2: (name) => `Quel rendement locatif puis-je espérer à ${name} ?`,
    a2: (name, pct, src) => `${name} offre un rendement locatif brut moyen d'environ ${pct}%, calculé à partir de ${src}. Le rendement réel varie selon l'immeuble, le type de bien et l'ameublement.`,
    q3: (name) => `${name} convient-il mieux au sur plan ou au prêt à emménager ?`,
    a3: (name, off, sec) => `${name} compte actuellement environ ${off} annonces sur plan et ${sec} annonces prêtes à emménager (revente). Le sur plan convient aux investisseurs recherchant des plans de paiement et une plus-value ; le prêt à emménager convient aux occupants et à un revenu locatif immédiat.`,
    q4: (name) => `Combien coûte un bien à ${name} ?`,
    a4: (name, v) => `Le prix affiché moyen à ${name} est d'environ AED ${v}, mais il varie fortement selon la taille du bien, la vue et l'immeuble. Parcourez les annonces en direct ci-dessus pour les disponibilités actuelles.`,
  },
  ar: {
    and: " و",
    buyPerSqft: (v) => `متوسط أسعار البيع نحو AED ${v} للقدم المربّع`,
    buyAsking: (v) => `سعراً معروضاً نموذجياً يقارب AED ${v}`,
    buySentence: (name, parts) => `يشهد المشترون في ${name} ${parts}، استناداً إلى أحدث القوائم وبيانات دائرة الأراضي والأملاك في دبي (DLD).`,
    rentAvg: (v) => `متوسط إيجارات سنوية نحو AED ${v}`,
    rentYield: (pct, src) => `عائداً إيجارياً إجمالياً يبلغ نحو ${pct}% (${src})`,
    rentSentence: (name, parts) => `يشهد المستأجرون والمستثمرون في ${name} ${parts}.`,
    noteSrcEjari: "عقود DLD/إيجاري",
    noteSrcListings: "القوائم الحالية",
    noteSrcBenchmark: "مؤشرات السوق",
    faqSrcEjari: "عقود إيجار DLD/إيجاري",
    faqSrcListings: "قوائم الإيجار الحالية",
    faqSrcBenchmark: "مؤشرات سوق دبي",
    q1: (name) => `ما متوسط سعر القدم المربّع في ${name}؟`,
    a1: (name, v) => `يبلغ متوسط سعر البيع الحالي في ${name} نحو AED ${v} للقدم المربّع، استناداً إلى أحدث القوائم وبيانات دائرة الأراضي والأملاك في دبي (DLD).`,
    q2: (name) => `ما العائد الإيجاري المتوقّع في ${name}؟`,
    a2: (name, pct, src) => `يوفّر ${name} عائداً إيجارياً إجمالياً متوسطاً يبلغ نحو ${pct}%، مستمداً من ${src}. يختلف العائد الفعلي حسب المبنى ونوع الوحدة والتأثيث.`,
    q3: (name) => `هل ${name} أفضل للعقارات على الخارطة أم الجاهزة؟`,
    a3: (name, off, sec) => `يضم ${name} حالياً نحو ${off} قائمة على الخارطة و${sec} قائمة جاهزة (سوق ثانوي). العقارات على الخارطة تناسب المستثمرين الراغبين بخطط سداد ونمو رأس المال؛ والجاهزة تناسب المستخدمين النهائيين والدخل الإيجاري الفوري.`,
    q4: (name) => `كم تبلغ تكلفة العقار في ${name}؟`,
    a4: (name, v) => `يبلغ متوسط السعر المعروض في ${name} نحو AED ${v}، وإن كان يتفاوت كثيراً حسب مساحة الوحدة والإطلالة والمبنى. تصفّح القوائم المباشرة أعلاه لمعرفة المتاح حالياً.`,
  },
  he: {
    and: " ו-",
    buyPerSqft: (v) => `מחירי מכירה ממוצעים של כ-AED ${v} לרגל רבוע`,
    buyAsking: (v) => `מחיר מבוקש טיפוסי של כ-AED ${v}`,
    buySentence: (name, parts) => `רוכשים ב-${name} רואים ${parts}, על בסיס המודעות העדכניות ונתוני רשות המקרקעין של דובאי (DLD).`,
    rentAvg: (v) => `שכר דירה שנתי ממוצע של כ-AED ${v}`,
    rentYield: (pct, src) => `תשואת שכירות ברוטו של כ-${pct}% (${src})`,
    rentSentence: (name, parts) => `שוכרים ומשקיעים ב-${name} רואים ${parts}.`,
    noteSrcEjari: "חוזי DLD/Ejari",
    noteSrcListings: "מודעות נוכחיות",
    noteSrcBenchmark: "מדדי שוק",
    faqSrcEjari: "חוזי שכירות DLD/Ejari",
    faqSrcListings: "מודעות שכירות נוכחיות",
    faqSrcBenchmark: "מדדי שוק דובאי",
    q1: (name) => `מהו המחיר הממוצע לרגל רבוע ב-${name}?`,
    a1: (name, v) => `מחיר המכירה הממוצע הנוכחי ב-${name} הוא כ-AED ${v} לרגל רבוע, על בסיס המודעות העדכניות ונתוני רשות המקרקעין של דובאי (DLD).`,
    q2: (name) => `איזו תשואת שכירות אפשר לצפות ב-${name}?`,
    a2: (name, pct, src) => `${name} מציעה תשואת שכירות ברוטו ממוצעת של כ-${pct}%, הנגזרת מ${src}. התשואה בפועל משתנה לפי הבניין, סוג הדירה והריהוט.`,
    q3: (name) => `האם ${name} מתאימה יותר לנכסים על הנייר או מוכנים לאכלוס?`,
    a3: (name, off, sec) => `ב-${name} יש כיום כ-${off} מודעות על הנייר ו-${sec} מודעות מוכנות לאכלוס (שוק משני). נכסים על הנייר מתאימים למשקיעים המעוניינים בתוכניות תשלום ובעליית ערך; נכסים מוכנים מתאימים לדיירים ולהכנסה משכירות מיידית.`,
    q4: (name) => `כמה עולה נכס ב-${name}?`,
    a4: (name, v) => `המחיר המבוקש הממוצע ב-${name} הוא כ-AED ${v}, אך הוא משתנה מאוד לפי גודל הדירה, הנוף והבניין. עיינו במודעות החיות למעלה לזמינות עדכנית.`,
  },
  ru: {
    and: " и ",
    buyPerSqft: (v) => `среднюю цену продажи около AED ${v} за кв. фут`,
    buyAsking: (v) => `типичную запрашиваемую цену около AED ${v}`,
    buySentence: (name, parts) => `Покупатели в ${name} видят ${parts}, по данным последних объявлений и Земельного департамента Дубая (DLD).`,
    rentAvg: (v) => `среднюю аренду около AED ${v} в год`,
    rentYield: (pct, src) => `валовую доходность аренды около ${pct}% (${src})`,
    rentSentence: (name, parts) => `Арендаторы и инвесторы в ${name} видят ${parts}.`,
    noteSrcEjari: "контракты DLD/Ejari",
    noteSrcListings: "текущие объявления",
    noteSrcBenchmark: "рыночные ориентиры",
    faqSrcEjari: "договоров аренды DLD/Ejari",
    faqSrcListings: "текущих объявлений об аренде",
    faqSrcBenchmark: "рыночных ориентиров Дубая",
    q1: (name) => `Какова средняя цена за квадратный фут в ${name}?`,
    a1: (name, v) => `Текущая средняя цена продажи в ${name} составляет около AED ${v} за квадратный фут, по данным последних объявлений и Земельного департамента Дубая (DLD).`,
    q2: (name) => `На какую доходность аренды можно рассчитывать в ${name}?`,
    a2: (name, pct, src) => `${name} обеспечивает среднюю валовую доходность аренды около ${pct}%, рассчитанную на основе ${src}. Фактическая доходность зависит от здания, типа квартиры и меблировки.`,
    q3: (name) => `Что лучше в ${name} — недвижимость на стадии строительства или готовая?`,
    a3: (name, off, sec) => `В ${name} сейчас около ${off} объявлений на стадии строительства и ${sec} готовых (вторичных). Недвижимость на стадии строительства подходит инвесторам, которым нужны планы оплаты и рост капитала; готовая — для проживания и немедленного дохода от аренды.`,
    q4: (name) => `Сколько стоит недвижимость в ${name}?`,
    a4: (name, v) => `Средняя запрашиваемая цена в ${name} составляет около AED ${v}, хотя она сильно зависит от площади, вида и здания. Просмотрите актуальные объявления выше для текущего наличия.`,
  },
  vi: {
    and: " và ",
    buyPerSqft: (v) => `giá bán trung bình khoảng AED ${v} mỗi foot vuông`,
    buyAsking: (v) => `mức giá chào bán điển hình gần AED ${v}`,
    buySentence: (name, parts) => `Người mua tại ${name} đang thấy ${parts}, dựa trên tin đăng mới nhất và dữ liệu của Cục Đất đai Dubai (DLD).`,
    rentAvg: (v) => `giá thuê trung bình khoảng AED ${v} mỗi năm`,
    rentYield: (pct, src) => `lợi suất cho thuê gộp khoảng ${pct}% (${src})`,
    rentSentence: (name, parts) => `Người thuê và nhà đầu tư tại ${name} đang thấy ${parts}.`,
    noteSrcEjari: "hợp đồng DLD/Ejari",
    noteSrcListings: "tin đăng hiện tại",
    noteSrcBenchmark: "chuẩn thị trường",
    faqSrcEjari: "hợp đồng cho thuê DLD/Ejari",
    faqSrcListings: "tin cho thuê hiện tại",
    faqSrcBenchmark: "chuẩn thị trường Dubai",
    q1: (name) => `Giá trung bình mỗi foot vuông tại ${name} là bao nhiêu?`,
    a1: (name, v) => `Giá bán trung bình hiện tại tại ${name} vào khoảng AED ${v} mỗi foot vuông, dựa trên tin đăng mới nhất và dữ liệu của Cục Đất đai Dubai (DLD).`,
    q2: (name) => `Tôi có thể kỳ vọng lợi suất cho thuê nào tại ${name}?`,
    a2: (name, pct, src) => `${name} mang lại lợi suất cho thuê gộp trung bình khoảng ${pct}%, tính từ ${src}. Lợi suất thực tế thay đổi theo tòa nhà, loại căn hộ và nội thất.`,
    q3: (name) => `${name} phù hợp hơn với bất động sản off-plan hay sẵn sàng bàn giao?`,
    a3: (name, off, sec) => `${name} hiện có khoảng ${off} tin off-plan và ${sec} tin sẵn sàng bàn giao (thứ cấp). Off-plan phù hợp với nhà đầu tư muốn có kế hoạch thanh toán và tăng giá vốn; bất động sản sẵn có phù hợp với người ở thực và thu nhập cho thuê ngay.`,
    q4: (name) => `Bất động sản tại ${name} có giá bao nhiêu?`,
    a4: (name, v) => `Giá chào bán trung bình tại ${name} vào khoảng AED ${v}, dù dao động nhiều tùy theo diện tích, hướng nhìn và tòa nhà. Xem tin đăng trực tiếp phía trên để biết tình trạng hiện có.`,
  },
  zh: {
    and: "，",
    buyPerSqft: (v) => `平均售价约为每平方英尺 AED ${v}`,
    buyAsking: (v) => `典型挂牌价接近 AED ${v}`,
    buySentence: (name, parts) => `根据最新房源和迪拜土地局（DLD）数据，${name}的买家看到${parts}。`,
    rentAvg: (v) => `平均年租金约为 AED ${v}`,
    rentYield: (pct, src) => `毛租金回报率约为 ${pct}%（${src}）`,
    rentSentence: (name, parts) => `${name}的租户和投资者看到${parts}。`,
    noteSrcEjari: "DLD/Ejari 合同",
    noteSrcListings: "当前房源",
    noteSrcBenchmark: "市场基准",
    faqSrcEjari: "DLD/Ejari 租赁合同",
    faqSrcListings: "当前租赁房源",
    faqSrcBenchmark: "迪拜市场基准",
    q1: (name) => `${name}每平方英尺的平均价格是多少？`,
    a1: (name, v) => `根据最新房源和迪拜土地局（DLD）数据，${name}目前的平均售价约为每平方英尺 AED ${v}。`,
    q2: (name) => `在${name}可以期待多少租金回报？`,
    a2: (name, pct, src) => `${name}的平均毛租金回报率约为 ${pct}%，依据${src}计算。实际回报因楼盘、户型和家具配置而异。`,
    q3: (name) => `${name}更适合期房还是现房？`,
    a3: (name, off, sec) => `${name}目前约有 ${off} 套期房和 ${sec} 套现房（二手）房源。期房适合希望获得付款计划和资本增值的投资者；现房适合自住者和寻求即时租金收入的买家。`,
    q4: (name) => `在${name}购置房产需要多少钱？`,
    a4: (name, v) => `${name}的平均挂牌价约为 AED ${v}，但会因户型面积、景观和楼盘而有较大差异。浏览上方的实时房源了解当前可选情况。`,
  },
};

const marketStrings = (locale?: string): MarketI18n => MARKET_I18N[locale ?? "en"] ?? MARKET_I18N.en;

/** Data-driven FAQ set for a community/area page (only includes Qs we have data for). */
export function buildCommunityFaqs(name: string, s: CommunityStat | null, locale?: string): { question: string; answer: string }[] {
  const t = marketStrings(locale);
  const faqs: { question: string; answer: string }[] = [];
  if (s?.avgPricePerSqft) {
    faqs.push({ question: t.q1(name), answer: t.a1(name, s.avgPricePerSqft.toLocaleString("en-AE")) });
  }
  if (s?.rentalYield) {
    const src = s.yieldSource === "ejari" ? t.faqSrcEjari : s.yieldSource === "listings" ? t.faqSrcListings : t.faqSrcBenchmark;
    faqs.push({ question: t.q2(name), answer: t.a2(name, s.rentalYield, src) });
  }
  if (s && (s.offPlanCount || s.secondaryCount)) {
    faqs.push({ question: t.q3(name), answer: t.a3(name, s.offPlanCount.toLocaleString("en-AE"), s.secondaryCount.toLocaleString("en-AE")) });
  }
  if (s?.avgSalePrice) {
    faqs.push({ question: t.q4(name), answer: t.a4(name, s.avgSalePrice.toLocaleString("en-AE")) });
  }
  return faqs;
}

/**
 * A transaction-type-specific market sentence for the buy-/rent-property-in
 * community pages, so the two (otherwise near-identical) templates diverge with
 * real, distinct DLD data: sale metrics on Buy, rent metrics on Rent. Returns ""
 * when there's no data to state. Localized to the page's locale (defaults to en).
 */
export function buildMarketNote(name: string, s: CommunityStat | null, intent: "buy" | "rent", locale?: string): string {
  if (!s) return "";
  const t = marketStrings(locale);
  if (intent === "buy") {
    const parts: string[] = [];
    if (s.avgPricePerSqft) parts.push(t.buyPerSqft(s.avgPricePerSqft.toLocaleString("en-AE")));
    if (s.avgSalePrice) parts.push(t.buyAsking(s.avgSalePrice.toLocaleString("en-AE")));
    if (!parts.length) return "";
    return t.buySentence(name, parts.join(t.and));
  }
  const parts: string[] = [];
  if (s.avgRentPrice) parts.push(t.rentAvg(s.avgRentPrice.toLocaleString("en-AE")));
  if (s.rentalYield) {
    const src = s.yieldSource === "ejari" ? t.noteSrcEjari : s.yieldSource === "listings" ? t.noteSrcListings : t.noteSrcBenchmark;
    parts.push(t.rentYield(s.rentalYield, src));
  }
  if (!parts.length) return "";
  return t.rentSentence(name, parts.join(t.and));
}

/**
 * Data-driven fallback "About" paragraph for a community page whose DB record has
 * no editorial description (the DB-only render branch). Uses real project count +
 * DLD stats so the hero isn't left blank and the copy is factually unique.
 */
export function buildCommunitySummary(name: string, s: CommunityStat | null, projectCount: number): string {
  let first = projectCount > 0
    ? `${name} is a Dubai community with ${projectCount} ${projectCount === 1 ? "project" : "projects"} listed on Binayah`
    : `${name} is a residential community in Dubai`;
  const bits: string[] = [];
  if (s?.avgPricePerSqft) bits.push(`average sale prices around AED ${s.avgPricePerSqft.toLocaleString("en-AE")} per sqft`);
  if (s?.rentalYield) bits.push(`a gross rental yield of about ${s.rentalYield}%`);
  if (bits.length) first += `, with ${bits.join(" and ")} based on the latest DLD and listing data`;
  first += ".";
  return `${first} Browse off-plan and ready properties for sale and rent in ${name} below.`;
}

export const fmtAed = (n: number | null | undefined): string =>
  !n || n <= 0
    ? "-"
    : n >= 1_000_000
    ? `AED ${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}M`
    : n >= 1_000
    ? `AED ${Math.round(n / 1_000)}K`
    : `AED ${n.toLocaleString("en-AE")}`;
