// Builds a data-driven "About" paragraph for a developer that has projects but
// no editorial description. Facts come straight from the developer's project
// list (count, communities, off-plan/ready mix, entry price) so each summary is
// factually unique per developer — not the kind of boilerplate Google discounts.
// Returns "" when there are no projects (nothing real to say → leave it noindexed).
//
// Localised: the same facts are rendered through per-locale sentence templates so
// non-EN developer pages carry native-language body copy (matches the guide/dev
// description translation layer). All 7 site locales are covered; unknown locales
// fall back to English.

interface SummaryProject {
  community?: string;
  status?: string;
  startingPrice?: number | null;
  currency?: string;
}

type Loc = "en" | "fr" | "ru" | "ar" | "zh" | "vi" | "he";

// Join a list of community names with the locale's "and" conjunction.
function joinList(items: string[], loc: Loc): string {
  if (items.length <= 1) return items[0] || "";
  const and: Record<Loc, string> = {
    en: "and", fr: "et", ru: "и", ar: "و", zh: "、", vi: "và", he: "ו-",
  };
  const head = items.slice(0, -1);
  const tail = items[items.length - 1];
  // Chinese uses the enumeration comma with no space; others use ", " + word.
  if (loc === "zh") return items.join("、");
  return `${head.join(", ")} ${and[loc]} ${tail}`;
}

interface Tmpl {
  // s1: intro with count + communities
  intro: (name: string, n: number, areas: string) => string;
  areasClauseNone: (name: string, n: number) => string;
  // portfolio mix
  mixBoth: string;
  mixOffplan: string;
  mixReady: string;
  priceWith: (mix: string, price: string) => string; // append price to an existing mix clause
  priceOnly: (price: string) => string; // price when no mix clause
  // closing
  browse: (name: string, n: number) => string;
}

const T: Record<Loc, Tmpl> = {
  en: {
    intro: (name, n, areas) => `${name} is a Dubai real estate developer with ${n} ${n === 1 ? "project" : "projects"} listed on Binayah, active in ${areas}.`,
    areasClauseNone: (name, n) => `${name} is a Dubai real estate developer with ${n} ${n === 1 ? "project" : "projects"} listed on Binayah.`,
    mixBoth: "The portfolio spans both off-plan and ready homes",
    mixOffplan: "The portfolio focuses on off-plan developments",
    mixReady: "The portfolio focuses on ready homes",
    priceWith: (mix, price) => `${mix}, with starting prices from ${price}.`,
    priceOnly: (price) => `Starting prices from ${price}.`,
    browse: (name, n) => `Browse all ${n} ${name} ${n === 1 ? "project" : "projects"} below.`,
  },
  fr: {
    intro: (name, n, areas) => `${name} est un promoteur immobilier à Dubaï avec ${n} ${n === 1 ? "projet" : "projets"} référencé${n === 1 ? "" : "s"} sur Binayah, actif à ${areas}.`,
    areasClauseNone: (name, n) => `${name} est un promoteur immobilier à Dubaï avec ${n} ${n === 1 ? "projet" : "projets"} référencé${n === 1 ? "" : "s"} sur Binayah.`,
    mixBoth: "Le portefeuille comprend à la fois des biens sur plan et livrés",
    mixOffplan: "Le portefeuille se concentre sur les projets sur plan",
    mixReady: "Le portefeuille se concentre sur les biens livrés",
    priceWith: (mix, price) => `${mix}, avec des prix à partir de ${price}.`,
    priceOnly: (price) => `Prix à partir de ${price}.`,
    browse: (name, n) => `Découvrez ci-dessous ${n === 1 ? "le projet" : `les ${n} projets`} de ${name}.`,
  },
  ru: {
    intro: (name, n, areas) => `${name} — застройщик недвижимости в Дубае, у которого на Binayah представлено ${n} ${n === 1 ? "проект" : "проектов"}, в районах ${areas}.`,
    areasClauseNone: (name, n) => `${name} — застройщик недвижимости в Дубае, у которого на Binayah представлено ${n} ${n === 1 ? "проект" : "проектов"}.`,
    mixBoth: "Портфель включает как строящиеся, так и готовые объекты",
    mixOffplan: "Портфель сосредоточен на строящихся проектах",
    mixReady: "Портфель сосредоточен на готовых объектах",
    priceWith: (mix, price) => `${mix}, с ценами от ${price}.`,
    priceOnly: (price) => `Цены от ${price}.`,
    browse: (name, n) => `Смотрите все ${n} ${n === 1 ? "проект" : "проектов"} застройщика ${name} ниже.`,
  },
  ar: {
    intro: (name, n, areas) => `${name} هي شركة تطوير عقاري في دبي، ولديها ${n} ${n === 1 ? "مشروع" : "مشاريع"} مدرجة على Binayah، وتنشط في ${areas}.`,
    areasClauseNone: (name, n) => `${name} هي شركة تطوير عقاري في دبي، ولديها ${n} ${n === 1 ? "مشروع" : "مشاريع"} مدرجة على Binayah.`,
    mixBoth: "تشمل المحفظة مشاريع على الخارطة وأخرى جاهزة",
    mixOffplan: "تركّز المحفظة على المشاريع على الخارطة",
    mixReady: "تركّز المحفظة على العقارات الجاهزة",
    priceWith: (mix, price) => `${mix}، بأسعار تبدأ من ${price}.`,
    priceOnly: (price) => `أسعار تبدأ من ${price}.`,
    browse: (name, n) => `تصفّح جميع مشاريع ${name} البالغ عددها ${n} أدناه.`,
  },
  zh: {
    intro: (name, n, areas) => `${name} 是一家迪拜房地产开发商，在 Binayah 上共有 ${n} 个项目，主要分布于${areas}。`,
    areasClauseNone: (name, n) => `${name} 是一家迪拜房地产开发商，在 Binayah 上共有 ${n} 个项目。`,
    mixBoth: "其项目组合涵盖期房与现房",
    mixOffplan: "其项目组合以期房开发为主",
    mixReady: "其项目组合以现房为主",
    priceWith: (mix, price) => `${mix}，起价 ${price}。`,
    priceOnly: (price) => `起价 ${price}。`,
    browse: (name, n) => `在下方浏览 ${name} 的全部 ${n} 个项目。`,
  },
  vi: {
    intro: (name, n, areas) => `${name} là một nhà phát triển bất động sản tại Dubai với ${n} dự án được niêm yết trên Binayah, hoạt động tại ${areas}.`,
    areasClauseNone: (name, n) => `${name} là một nhà phát triển bất động sản tại Dubai với ${n} dự án được niêm yết trên Binayah.`,
    mixBoth: "Danh mục bao gồm cả dự án hình thành trong tương lai và nhà đã bàn giao",
    mixOffplan: "Danh mục tập trung vào các dự án hình thành trong tương lai",
    mixReady: "Danh mục tập trung vào nhà đã bàn giao",
    priceWith: (mix, price) => `${mix}, với giá khởi điểm từ ${price}.`,
    priceOnly: (price) => `Giá khởi điểm từ ${price}.`,
    browse: (name, n) => `Xem tất cả ${n} dự án của ${name} bên dưới.`,
  },
  he: {
    intro: (name, n, areas) => `${name} היא חברת ייזום נדל"ן בדובאי עם ${n} ${n === 1 ? "פרויקט" : "פרויקטים"} המופיעים ב-Binayah, ופעילה ב${areas}.`,
    areasClauseNone: (name, n) => `${name} היא חברת ייזום נדל"ן בדובאי עם ${n} ${n === 1 ? "פרויקט" : "פרויקטים"} המופיעים ב-Binayah.`,
    mixBoth: "התיק כולל גם דירות על הנייר וגם דירות מוכנות",
    mixOffplan: "התיק מתמקד בפרויקטים על הנייר",
    mixReady: "התיק מתמקד בדירות מוכנות",
    priceWith: (mix, price) => `${mix}, במחירים החל מ-${price}.`,
    priceOnly: (price) => `מחירים החל מ-${price}.`,
    browse: (name, n) => `עיינו בכל ${n} ${n === 1 ? "הפרויקט" : "הפרויקטים"} של ${name} למטה.`,
  },
};

export function buildDeveloperSummary(
  name: string,
  projects: SummaryProject[] | undefined | null,
  locale: string = "en",
): string {
  if (!projects || projects.length === 0) return "";
  const loc = (T[locale as Loc] ? (locale as Loc) : "en");
  const t = T[loc];
  const n = projects.length;

  // Communities by frequency (top 3)
  const freq = new Map<string, number>();
  for (const p of projects) {
    const c = (p.community || "").trim();
    if (c) freq.set(c, (freq.get(c) || 0) + 1);
  }
  const top = [...freq.entries()].sort((a, b) => b[1] - a[1]).map(([c]) => c).slice(0, 3);

  // Off-plan vs ready mix
  let ready = 0, offplan = 0;
  for (const p of projects) {
    const s = (p.status || "").toLowerCase();
    if (/ready|complet/.test(s)) ready++;
    else offplan++;
  }

  // Entry price — normalise the "< 1000 means millions" shorthand used elsewhere
  let min = Infinity, currency = "AED";
  for (const p of projects) {
    if (p.currency) currency = p.currency;
    const raw = typeof p.startingPrice === "number" ? p.startingPrice : NaN;
    if (!isNaN(raw) && raw > 0) {
      const v = raw < 1000 ? raw * 1_000_000 : raw;
      if (v < min) min = v;
    }
  }

  const sentences: string[] = [];

  sentences.push(top.length ? t.intro(name, n, joinList(top, loc)) : t.areasClauseNone(name, n));

  let mix = "";
  if (offplan > 0 && ready > 0) mix = t.mixBoth;
  else if (offplan > 0) mix = t.mixOffplan;
  else if (ready > 0) mix = t.mixReady;
  if (min !== Infinity) {
    const price = `${currency} ${Math.round(min).toLocaleString("en-AE")}`;
    sentences.push(mix ? t.priceWith(mix, price) : t.priceOnly(price));
  } else if (mix) {
    sentences.push(mix + (loc === "zh" ? "。" : "."));
  }

  sentences.push(t.browse(name, n));
  return sentences.join(" ");
}
