// Localized metadata + breadcrumb strings for the 4 project sub-pages
// (floor-plans, payment-plan, faq, location) across the 7 site locales.
// The project name, community and developer are proper nouns (already
// localized via applyTranslation where applicable) and passed in verbatim —
// only the surrounding phrasing + connectors are translated here.
/* eslint-disable i18next/no-literal-string */

export type Loc = "en" | "ar" | "fr" | "he" | "ru" | "vi" | "zh";

const LOCS: readonly string[] = ["ar", "fr", "he", "ru", "vi", "zh"];

export const pickLoc = (l: string): Loc => (LOCS.includes(l) ? l : "en") as Loc;

// " in {community}" connector — natural per-locale phrasing.
export function commIn(locale: string, community: string): string {
  const L = pickLoc(locale);
  return {
    en: ` in ${community}`,
    ar: ` في ${community}`,
    fr: ` à ${community}`,
    he: ` ב־${community}`,
    ru: ` в ${community}`,
    vi: ` tại ${community}`,
    zh: `位于${community}`,
  }[L];
}

// " by {developer}" connector.
export function byDev(locale: string, developer: string): string {
  const L = pickLoc(locale);
  return {
    en: ` by ${developer}`,
    ar: ` من ${developer}`,
    fr: ` par ${developer}`,
    he: ` מאת ${developer}`,
    ru: ` от ${developer}`,
    vi: ` bởi ${developer}`,
    zh: `由${developer}开发`,
  }[L];
}

// " with {pct}% down payment" connector (payment-plan only).
export function downPay(locale: string, pct: number | string): string {
  const L = pickLoc(locale);
  return {
    en: ` with ${pct}% down payment`,
    ar: ` بدفعة أولى ${pct}%`,
    fr: ` avec ${pct}% d'acompte`,
    he: ` עם מקדמה של ${pct}%`,
    ru: ` с первым взносом ${pct}%`,
    vi: ` với ${pct}% trả trước`,
    zh: `，首付${pct}%`,
  }[L];
}

// Breadcrumb parent labels (Home + Buy/Rent/Off-Plan).
export function crumbParents(locale: string): { home: string; buy: string; rent: string; offplan: string } {
  const L = pickLoc(locale);
  return {
    home:    { en: "Home", ar: "الرئيسية", fr: "Accueil", he: "דף הבית", ru: "Главная", vi: "Trang chủ", zh: "首页" }[L],
    buy:     { en: "Buy", ar: "شراء", fr: "Acheter", he: "קנייה", ru: "Купить", vi: "Mua", zh: "购买" }[L],
    rent:    { en: "Rent", ar: "إيجار", fr: "Louer", he: "השכרה", ru: "Аренда", vi: "Thuê", zh: "租赁" }[L],
    offplan: { en: "Off-Plan", ar: "على المخطط", fr: "Sur plan", he: "על הנייר", ru: "Офф-план", vi: "Off-Plan", zh: "期房" }[L],
  };
}

type LeafKey = "floorPlans" | "paymentPlan" | "faq" | "location";

// Breadcrumb leaf label for each sub-page.
export function leafLabel(locale: string, page: LeafKey): string {
  const L = pickLoc(locale);
  const maps: Record<LeafKey, Record<Loc, string>> = {
    floorPlans:  { en: "Floor Plans", ar: "مخططات الطوابق", fr: "Plans d'étage", he: "תוכניות קומה", ru: "Планировки", vi: "Mặt bằng", zh: "平面图" },
    paymentPlan: { en: "Payment Plan", ar: "خطة السداد", fr: "Plan de paiement", he: "תוכנית תשלומים", ru: "План оплаты", vi: "Kế hoạch thanh toán", zh: "付款计划" },
    faq:         { en: "FAQ", ar: "الأسئلة الشائعة", fr: "FAQ", he: "שאלות נפוצות", ru: "Вопросы и ответы", vi: "Câu hỏi thường gặp", zh: "常见问题" },
    location:    { en: "Location", ar: "الموقع", fr: "Emplacement", he: "מיקום", ru: "Расположение", vi: "Vị trí", zh: "位置" },
  };
  return maps[page][L];
}

// ── Title + description builders ─────────────────────────────────────────────

export function floorPlansMeta(
  locale: string,
  o: { name: string; comm: string; dev: string; unitStr: string },
): { title: string; desc: string } {
  const L = pickLoc(locale);
  const { name, comm, dev, unitStr } = o;
  const title = {
    en: `${name} Floor Plans & Unit Sizes${comm} | Binayah`,
    ar: `مخططات الطوابق ومساحات الوحدات – ${name}${comm} | بناية`,
    fr: `Plans d'étage et surfaces – ${name}${comm} | Binayah`,
    he: `תוכניות קומה ושטחי יחידות – ${name}${comm} | Binayah`,
    ru: `Планировки и площади – ${name}${comm} | Binayah`,
    vi: `Mặt bằng & diện tích căn hộ – ${name}${comm} | Binayah`,
    zh: `${name}${comm}平面图与户型面积 | Binayah`,
  }[L];
  const desc = {
    en: `Browse all floor plans for ${name}${dev}${comm}, Dubai. View unit configurations including ${unitStr}, exact sizes in sqft and sqm, and downloadable PDFs.`,
    ar: `تصفّح جميع مخططات الطوابق لمشروع ${name}${dev}${comm}، دبي. اطّلع على تكوينات الوحدات بما في ذلك ${unitStr}، والمساحات الدقيقة بالقدم والمتر المربع، وملفات PDF قابلة للتنزيل.`,
    fr: `Parcourez tous les plans d'étage de ${name}${dev}${comm}, à Dubaï. Découvrez les configurations des unités dont ${unitStr}, les surfaces exactes en sqft et m², et des PDF téléchargeables.`,
    he: `עיינו בכל תוכניות הקומה של ${name}${dev}${comm}, דובאי. תצורות יחידות הכוללות ${unitStr}, שטחים מדויקים ב-sqft וב-מ"ר, וקובצי PDF להורדה.`,
    ru: `Все планировки ${name}${dev}${comm}, Дубай. Конфигурации юнитов, включая ${unitStr}, точные площади в кв. футах и кв. метрах, а также PDF для скачивания.`,
    vi: `Xem tất cả mặt bằng của ${name}${dev}${comm}, Dubai. Các cấu hình căn hộ gồm ${unitStr}, diện tích chính xác theo sqft và m², cùng file PDF tải về.`,
    zh: `浏览${name}${dev}${comm}（迪拜）的全部平面图。查看包括${unitStr}在内的户型配置、以平方英尺和平方米计的精确面积，以及可下载的 PDF 文件。`,
  }[L];
  return { title, desc };
}

export function paymentPlanMeta(
  locale: string,
  o: { name: string; comm: string; dev: string; dp: string },
): { title: string; desc: string } {
  const L = pickLoc(locale);
  const { name, comm, dev, dp } = o;
  const title = {
    en: `${name} Payment Plan${comm} | Binayah`,
    ar: `خطة السداد – ${name}${comm} | بناية`,
    fr: `Plan de paiement – ${name}${comm} | Binayah`,
    he: `תוכנית תשלומים – ${name}${comm} | Binayah`,
    ru: `План оплаты – ${name}${comm} | Binayah`,
    vi: `Kế hoạch thanh toán – ${name}${comm} | Binayah`,
    zh: `${name}${comm}付款计划 | Binayah`,
  }[L];
  const desc = {
    en: `View the full payment plan for ${name}${dev}${comm}${dp}. Milestone breakdown, starting price, DLD fees and buyer costs for this Dubai off-plan project.`,
    ar: `اطّلع على خطة السداد الكاملة لمشروع ${name}${dev}${comm}${dp}. تفاصيل الدفعات، سعر البداية، رسوم دائرة الأراضي وتكاليف المشتري لهذا المشروع على المخطط في دبي.`,
    fr: `Consultez le plan de paiement complet de ${name}${dev}${comm}${dp}. Échéancier des versements, prix de départ, frais DLD et coûts pour l'acheteur de ce projet sur plan à Dubaï.`,
    he: `צפו בתוכנית התשלומים המלאה של ${name}${dev}${comm}${dp}. פירוט אבני דרך, מחיר התחלתי, אגרות DLD ועלויות לרוכש בפרויקט על הנייר בדובאי.`,
    ru: `Полный план оплаты ${name}${dev}${comm}${dp}. График платежей, стартовая цена, сборы DLD и расходы покупателя по этому проекту офф-план в Дубае.`,
    vi: `Xem kế hoạch thanh toán đầy đủ của ${name}${dev}${comm}${dp}. Chi tiết các mốc thanh toán, giá khởi điểm, phí DLD và chi phí cho người mua của dự án off-plan tại Dubai.`,
    zh: `查看${name}${dev}${comm}${dp}的完整付款计划。了解这个迪拜期房项目的分期节点、起始价格、DLD 费用及买家成本。`,
  }[L];
  return { title, desc };
}

export function faqMeta(
  locale: string,
  o: { name: string; comm: string; dev: string },
): { title: string; desc: string } {
  const L = pickLoc(locale);
  const { name, comm, dev } = o;
  const title = {
    en: `${name} FAQ, Common Questions Answered${comm} | Binayah`,
    ar: `الأسئلة الشائعة – ${name}${comm} | بناية`,
    fr: `FAQ – ${name}${comm} | Binayah`,
    he: `שאלות נפוצות – ${name}${comm} | Binayah`,
    ru: `Вопросы и ответы – ${name}${comm} | Binayah`,
    vi: `Câu hỏi thường gặp – ${name}${comm} | Binayah`,
    zh: `${name}${comm}常见问题解答 | Binayah`,
  }[L];
  const desc = {
    en: `Frequently asked questions about ${name}${dev}${comm}, Dubai. Pricing, payment plan, floor plans, developer, handover date, Golden Visa eligibility and more.`,
    ar: `الأسئلة الأكثر شيوعًا حول ${name}${dev}${comm}، دبي. الأسعار، خطة السداد، مخططات الطوابق، المطوّر، موعد التسليم، أهلية الإقامة الذهبية والمزيد.`,
    fr: `Questions fréquentes sur ${name}${dev}${comm}, à Dubaï. Prix, plan de paiement, plans d'étage, promoteur, date de livraison, éligibilité au Golden Visa et plus.`,
    he: `שאלות נפוצות על ${name}${dev}${comm}, דובאי. מחירים, תוכנית תשלומים, תוכניות קומה, יזם, מועד מסירה, זכאות לגולדן ויזה ועוד.`,
    ru: `Часто задаваемые вопросы о ${name}${dev}${comm}, Дубай. Цены, план оплаты, планировки, застройщик, дата сдачи, право на Golden Visa и не только.`,
    vi: `Các câu hỏi thường gặp về ${name}${dev}${comm}, Dubai. Giá, kế hoạch thanh toán, mặt bằng, chủ đầu tư, ngày bàn giao, điều kiện Golden Visa và hơn thế.`,
    zh: `关于${name}${dev}${comm}（迪拜）的常见问题。涵盖价格、付款计划、平面图、开发商、交房日期、黄金签证资格等。`,
  }[L];
  return { title, desc };
}

export function locationMeta(
  locale: string,
  o: { name: string; comm: string; dev: string; area: string },
): { title: string; desc: string } {
  const L = pickLoc(locale);
  const { name, comm, dev, area } = o;
  const title = {
    en: `${name} Location & Neighbourhood${comm}, Dubai | Binayah`,
    ar: `الموقع والحي – ${name}${comm}، دبي | بناية`,
    fr: `Emplacement et quartier – ${name}${comm}, Dubaï | Binayah`,
    he: `מיקום ושכונה – ${name}${comm}, דובאי | Binayah`,
    ru: `Расположение и район – ${name}${comm}, Дубай | Binayah`,
    vi: `Vị trí & khu vực – ${name}${comm}, Dubai | Binayah`,
    zh: `${name}${comm}位置与社区（迪拜）| Binayah`,
  }[L];
  const desc = {
    en: `Explore the location of ${name}${dev}${comm}. View the map, nearby landmarks, transport links, schools, malls and community highlights in ${area}.`,
    ar: `اكتشف موقع ${name}${dev}${comm}. اطّلع على الخريطة، المعالم القريبة، وسائل النقل، المدارس، المولات وأبرز مزايا ${area}.`,
    fr: `Découvrez l'emplacement de ${name}${dev}${comm}. Consultez la carte, les points d'intérêt à proximité, les transports, écoles, centres commerciaux et les atouts de ${area}.`,
    he: `גלו את המיקום של ${name}${dev}${comm}. צפו במפה, באתרים סמוכים, בתחבורה, בבתי ספר, בקניונים ובנקודות הבולטות של ${area}.`,
    ru: `Узнайте расположение ${name}${dev}${comm}. Карта, ближайшие достопримечательности, транспорт, школы, торговые центры и особенности района ${area}.`,
    vi: `Khám phá vị trí của ${name}${dev}${comm}. Xem bản đồ, địa điểm lân cận, giao thông, trường học, trung tâm mua sắm và điểm nổi bật của ${area}.`,
    zh: `探索${name}${dev}${comm}的位置。查看地图、周边地标、交通、学校、购物中心以及${area}的社区亮点。`,
  }[L];
  return { title, desc };
}
