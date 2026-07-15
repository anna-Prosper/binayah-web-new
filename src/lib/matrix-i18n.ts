// Localized strings + templates for the bedroom×type matrix pages ([searchSlug]).
// Generated + translated across the 7 locales so non-English matrix pages are
// fully in-language (title, H1, description, DLD sold-price band). Templates use
// {beds} {type} {verb} {community} {median} {count} placeholders.
/* eslint-disable i18next/no-literal-string */

export interface MatrixStrings {
  studio: string; bedroom: string;
  Apartment: string; Villa: string; Townhouse: string; Penthouse: string;
  verbSale: string; verbRent: string;
  available: string; onRequest: string; priceRange: string; grossYield: string;
  home: string; buy: string; rent: string;
  soldTitle: string; median: string; ppsf: string; txns: string;
  salesWindow: string; getNotified: string;
  h1: string; soldNote: string; soldSentence: string; descLead: string; descTail: string;
  emptyTitle: string; emptyBody: string; allIn: string;
}

export const MATRIX_I18N: Record<string, MatrixStrings> = {
  "en": {
    "studio": "Studio",
    "bedroom": "Bedroom",
    "Apartment": "Apartments",
    "Villa": "Villas",
    "Townhouse": "Townhouses",
    "Penthouse": "Penthouses",
    "verbSale": "for Sale",
    "verbRent": "for Rent",
    "available": "Available",
    "onRequest": "On request",
    "priceRange": "Price range",
    "grossYield": "Gross yield",
    "home": "Home",
    "buy": "Buy",
    "rent": "Rent",
    "soldTitle": "DLD sold prices",
    "median": "Median sold price",
    "ppsf": "Avg price / sqft",
    "txns": "DLD transactions",
    "salesWindow": "sales · last 24 months",
    "getNotified": "Get notified",
    "h1": "{beds} {type} {verb} in {community}, Dubai",
    "soldNote": "Median of real Dubai Land Department sale transactions for {beds} {type} in {community} over the last 24 months.",
    "soldSentence": "Median sold price AED {median} from {count} DLD transactions.",
    "descLead": "Browse {beds} {type} {verb} in {community}, Dubai.",
    "descTail": "Live listings and DLD sold-price data with Binayah.",
    "emptyTitle": "No {beds} {type} listed right now",
    "emptyBody": "We add matching homes in {community} regularly. Tell us what you want and we will alert you, or browse everything available in {community} today.",
    "allIn": "All {type} in {community}"
  },
  "fr": {
    "studio": "Studio",
    "bedroom": "Chambre",
    "Apartment": "Appartements",
    "Villa": "Villas",
    "Townhouse": "Maisons de ville",
    "Penthouse": "Penthouses",
    "verbSale": "à vendre",
    "verbRent": "à louer",
    "available": "Disponible",
    "onRequest": "Sur demande",
    "priceRange": "Plage de prix",
    "grossYield": "Rendement brut",
    "home": "Accueil",
    "buy": "Acheter",
    "rent": "Louer",
    "soldTitle": "Prix de vente DLD",
    "median": "Prix de vente médian",
    "ppsf": "Prix moyen / sqft",
    "txns": "Transactions DLD",
    "salesWindow": "ventes · 24 derniers mois",
    "getNotified": "Recevoir des notifications",
    "h1": "{beds} {type} {verb} à {community}, Dubai",
    "soldNote": "Médiane des transactions de vente réelles du Dubai Land Department pour {beds} {type} dans {community} au cours des 24 derniers mois.",
    "soldSentence": "Prix de vente médian AED {median} provenant de {count} transactions DLD.",
    "descLead": "Parcourez {beds} {type} {verb} à {community}, Dubai.",
    "descTail": "Annonces en direct et données de prix de vente DLD avec Binayah.",
    "emptyTitle": "Aucun {beds} {type} listé en ce moment",
    "emptyBody": "Nous ajoutons régulièrement des maisons correspondantes dans {community}. Dites-nous ce que vous voulez et nous vous alerterons, ou parcourez tout ce qui est disponible dans {community} aujourd'hui.",
    "allIn": "Tous les {type} dans {community}"
  },
  "ru": {
    "studio": "Студия",
    "bedroom": "Спальня",
    "Apartment": "Апартаменты",
    "Villa": "Виллы",
    "Townhouse": "Таунхаусы",
    "Penthouse": "Пентхаусы",
    "verbSale": "на продажу",
    "verbRent": "в аренду",
    "available": "Доступно",
    "onRequest": "По запросу",
    "priceRange": "Ценовой диапазон",
    "grossYield": "Валовая доходность",
    "home": "Дом",
    "buy": "Купить",
    "rent": "Арендовать",
    "soldTitle": "Проданные цены DLD",
    "median": "Медианная цена продажи",
    "ppsf": "Средняя цена / кв. фут",
    "txns": "Транзакции DLD",
    "salesWindow": "продажи · последние 24 месяца",
    "getNotified": "Получить уведомление",
    "h1": "{beds} {type} {verb} в {community}, Dubai",
    "soldNote": "Медиана транзакций по продажам Департамента земельных ресурсов Дубая для {beds} {type} в {community} за последние 24 месяца.",
    "soldSentence": "Медианная цена продажи AED {median} из {count} транзакций DLD.",
    "descLead": "Просмотрите {beds} {type} {verb} в {community}, Dubai.",
    "descTail": "Актуальные объявления и данные о ценах на продажу DLD с Binayah.",
    "emptyTitle": "В данный момент нет {beds} {type}",
    "emptyBody": "Мы регулярно добавляем подходящие дома в {community}. Сообщите нам, что вы хотите, и мы уведомим вас, или просмотрите все доступные варианты в {community} сегодня.",
    "allIn": "Все {type} в {community}"
  },
  "ar": {
    "studio": "استوديو",
    "bedroom": "غرفة نوم",
    "Apartment": "شقق",
    "Villa": "فلل",
    "Townhouse": "تاون هاوس",
    "Penthouse": "بنتهاوس",
    "verbSale": "للبيع",
    "verbRent": "للايجار",
    "available": "متاح",
    "onRequest": "عند الطلب",
    "priceRange": "نطاق السعر",
    "grossYield": "العائد الإجمالي",
    "home": "المنزل",
    "buy": "شراء",
    "rent": "إيجار",
    "soldTitle": "أسعار مبيعات DLD",
    "median": "متوسط سعر البيع",
    "ppsf": "متوسط السعر / قدم مربع",
    "txns": "معاملات DLD",
    "salesWindow": "المبيعات · آخر 24 شهرًا",
    "getNotified": "احصل على إشعار",
    "h1": "{beds} {type} {verb} في {community}، دبي",
    "soldNote": "متوسط معاملات مبيعات دائرة الأراضي والأملاك في دبي لـ {beds} {type} في {community} خلال آخر 24 شهرًا.",
    "soldSentence": "متوسط سعر البيع AED {median} من {count} معاملات DLD.",
    "descLead": "تصفح {beds} {type} {verb} في {community}، دبي.",
    "descTail": "قوائم حية وبيانات أسعار مبيعات DLD مع Binayah.",
    "emptyTitle": "لا توجد {beds} {type} مدرجة الآن",
    "emptyBody": "نضيف منازل متطابقة في {community} بانتظام. أخبرنا بما تريده وسنقوم بإشعارك، أو تصفح كل ما هو متاح في {community} اليوم.",
    "allIn": "جميع {type} في {community}"
  },
  "zh": {
    "studio": "工作室",
    "bedroom": "卧室",
    "Apartment": "公寓",
    "Villa": "别墅",
    "Townhouse": "联排别墅",
    "Penthouse": "顶层公寓",
    "verbSale": "出售",
    "verbRent": "出租",
    "available": "可用",
    "onRequest": "应要求提供",
    "priceRange": "价格范围",
    "grossYield": "毛收益",
    "home": "家",
    "buy": "购买",
    "rent": "租赁",
    "soldTitle": "DLD 售出价格",
    "median": "中位数售出价格",
    "ppsf": "每平方英尺平均价格",
    "txns": "DLD 交易",
    "salesWindow": "销售 · 最近 24 个月",
    "getNotified": "获取通知",
    "h1": "{beds} {type} {verb} 在 {community}, Dubai",
    "soldNote": "过去 24 个月中，{community} 中 {beds} {type} 的真实迪拜土地局销售交易的中位数。",
    "soldSentence": "中位数售出价格 AED {median}，来自 {count} DLD 交易。",
    "descLead": "浏览 {community} 中的 {beds} {type} {verb}。",
    "descTail": "实时房源和 DLD 售出价格数据，提供给 Binayah。",
    "emptyTitle": "目前没有 {beds} {type} 列出",
    "emptyBody": "我们定期添加 {community} 中匹配的房源。告诉我们您想要的，我们会提醒您，或者今天浏览 {community} 中的所有可用房源。",
    "allIn": "所有 {type} 在 {community}"
  },
  "vi": {
    "studio": "Căn hộ Studio",
    "bedroom": "Phòng ngủ",
    "Apartment": "Căn hộ",
    "Villa": "Biệt thự",
    "Townhouse": "Nhà phố",
    "Penthouse": "Căn hộ Penthouse",
    "verbSale": "để Bán",
    "verbRent": "để Cho thuê",
    "available": "Có sẵn",
    "onRequest": "Theo yêu cầu",
    "priceRange": "Khoảng giá",
    "grossYield": "Lợi suất gộp",
    "home": "Nhà",
    "buy": "Mua",
    "rent": "Thuê",
    "soldTitle": "Giá đã bán DLD",
    "median": "Giá bán trung bình",
    "ppsf": "Giá trung bình / sqft",
    "txns": "Giao dịch DLD",
    "salesWindow": "bán · 24 tháng qua",
    "getNotified": "Nhận thông báo",
    "h1": "{beds} {type} {verb} tại {community}, Dubai",
    "soldNote": "Giá bán trung bình của các giao dịch bán hàng của Cục Đất đai Dubai cho {beds} {type} tại {community} trong 24 tháng qua.",
    "soldSentence": "Giá bán trung bình AED {median} từ {count} giao dịch DLD.",
    "descLead": "Duyệt {beds} {type} {verb} tại {community}, Dubai.",
    "descTail": "Danh sách trực tiếp và dữ liệu giá bán DLD với Binayah.",
    "emptyTitle": "Hiện không có {beds} {type} nào được liệt kê",
    "emptyBody": "Chúng tôi thường xuyên thêm các ngôi nhà phù hợp tại {community}. Hãy cho chúng tôi biết bạn muốn gì và chúng tôi sẽ thông báo cho bạn, hoặc duyệt tất cả những gì có sẵn tại {community} hôm nay.",
    "allIn": "Tất cả {type} tại {community}"
  },
  "he": {
    "studio": "סטודיו",
    "bedroom": "חדר שינה",
    "Apartment": "דירות",
    "Villa": "ווילות",
    "Townhouse": "בתים צמודי קרקע",
    "Penthouse": "פנטהאוזים",
    "verbSale": "למכירה",
    "verbRent": "להשכרה",
    "available": "זמין",
    "onRequest": "בהתאם לבקשה",
    "priceRange": "טווח מחירים",
    "grossYield": "תשואה גולמית",
    "home": "בית",
    "buy": "לקנות",
    "rent": "לשכור",
    "soldTitle": "מחירי מכירה של DLD",
    "median": "מחיר מכירה חציוני",
    "ppsf": "מחיר ממוצע / רגל רבועה",
    "txns": "עסקאות DLD",
    "salesWindow": "מכירות · 24 החודשים האחרונים",
    "getNotified": "קבל התראה",
    "h1": "{beds} {type} {verb} ב{community}, Dubai",
    "soldNote": "מחיר מכירה חציוני של עסקאות DLD אמיתיות ב{beds} {type} ב{community} במהלך 24 החודשים האחרונים.",
    "soldSentence": "מחיר מכירה חציוני AED {median} מ{count} עסקאות DLD.",
    "descLead": "עיין ב{beds} {type} {verb} ב{community}, Dubai.",
    "descTail": "רשימות חיות ונתוני מחירי מכירה של DLD עם Binayah.",
    "emptyTitle": "אין {beds} {type} רשומים כרגע",
    "emptyBody": "אנו מוסיפים בתים תואמים ב{community} באופן קבוע. ספר לנו מה אתה רוצה ואנו נודיע לך, או עיין בכל מה שזמין ב{community} היום.",
    "allIn": "כל {type} ב{community}"
  }
};

export function mx(locale: string): MatrixStrings {
  return MATRIX_I18N[locale] ?? MATRIX_I18N.en;
}

/** Localized bedroom label, e.g. "Studio" or "2-Bedroom" (locale word). */
export function bedsLabelL(locale: string, beds: number): string {
  const m = mx(locale);
  return beds === 0 ? m.studio : `${beds}-${m.bedroom}`;
}

/** Localized property-type plural for a canonical type. */
export function typeLabelL(locale: string, canon: string): string {
  const m = mx(locale);
  return (m as unknown as Record<string, string>)[canon] ?? canon + "s";
}

/** Fill a template's {placeholders}. */
export function fillT(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? vars[k] : `{${k}}`));
}
