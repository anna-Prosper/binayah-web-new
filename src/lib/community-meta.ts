/**
 * Search metadata for community pages.
 *
 * Lives here rather than inside the route so it can be exercised without
 * rendering a page — scripts/community-seo-audit.ts runs every community
 * through it and fails on anything Google would truncate or that reads wrong.
 * Four defects were live before it existed: 61 pages said "Dubai" twice, 47
 * titles ran past the ~60 characters Google shows, and three described
 * themselves as "homes for sale & rent ... from AED 1,656/sqft" — an average
 * rate presented as an entry price.
 */

/**
 * Per-locale title and description templates.
 *
 * `inCity` is a suffix, not a fixed part of the sentence, because 61 of the 152
 * community names already carry "Dubai" — Bur Dubai, Arjan Dubai, Dubai
 * Maritime City. Appending the emirate unconditionally produced "Arjan Dubai,
 * Dubai" and "Bur Dubai Properties for Sale & Rent in Dubai", which was live on
 * every one of them. Dropping it where the name already says it also buys back
 * ten characters of the title, which matters: 47 titles were over the ~60 that
 * Google will display.
 */
const COMM_META: Record<
  string,
  {
    /** Emirate suffix for the title, omitted when the name already says it. */
    inCity: string;
    /** Emirate suffix for prose, same rule. */
    ofCity: string;
    titleFull: (n: string, inCity: string) => string;
    titleShort: (n: string, inCity: string) => string;
    /** Last resort for names long enough to blow the limit on their own. */
    titleBare: (n: string) => string;
    leadProjects: (place: string, count: number, priceFrom: string) => string;
    leadPlain: (place: string) => string;
  }
> = {
  en: {
    inCity: " in Dubai",
    ofCity: ", Dubai",
    titleFull: (n, c) => `${n} Properties for Sale & Rent${c} | Binayah`,
    titleShort: (n, c) => `${n} Properties${c} | Binayah`,
    titleBare: (n) => `${n} | Binayah`,
    leadProjects: (place, c, p) => `${c} off-plan projects plus homes for sale & rent in ${place}${p ? ` from ${p}` : ""}.`,
    leadPlain: (place) => `Property for sale, rent & off-plan in ${place}.`,
  },
  fr: {
    inCity: " à Dubaï",
    ofCity: ", Dubaï",
    titleFull: (n, c) => `Biens à vendre et à louer à ${n}${c ? ", Dubaï" : ""} | Binayah`,
    titleShort: (n, c) => `Immobilier à ${n}${c ? ", Dubaï" : ""} | Binayah`,
    titleBare: (n) => `${n} | Binayah`,
    leadProjects: (place, c, p) => `${c} projets sur plan ainsi que des biens à vendre et à louer à ${place}${p ? ` à partir de ${p}` : ""}.`,
    leadPlain: (place) => `Biens à vendre, à louer et sur plan à ${place}.`,
  },
  ru: {
    inCity: " в Дубае",
    ofCity: ", Дубай",
    titleFull: (n, c) => `Недвижимость на продажу и в аренду в ${n}${c ? ", Дубай" : ""} | Binayah`,
    titleShort: (n, c) => `Недвижимость в ${n}${c ? ", Дубай" : ""} | Binayah`,
    titleBare: (n) => `${n} | Binayah`,
    leadProjects: (place, c, p) => `${c} проектов на стадии строительства, а также жильё на продажу и в аренду в ${place}${p ? ` от ${p}` : ""}.`,
    leadPlain: (place) => `Недвижимость на продажу, в аренду и на стадии строительства в ${place}.`,
  },
  ar: {
    inCity: " في دبي",
    ofCity: "، دبي",
    titleFull: (n, c) => `عقارات للبيع والإيجار في ${n}${c ? "، دبي" : ""} | بناية`,
    titleShort: (n, c) => `عقارات في ${n}${c ? "، دبي" : ""} | بناية`,
    titleBare: (n) => `${n} | بناية`,
    leadProjects: (place, c, p) => `${c} مشاريع على الخارطة بالإضافة إلى منازل للبيع والإيجار في ${place}${p ? ` تبدأ من ${p}` : ""}.`,
    leadPlain: (place) => `عقارات للبيع والإيجار وعلى الخارطة في ${place}.`,
  },
  zh: {
    inCity: "迪拜 ",
    ofCity: "迪拜 ",
    titleFull: (n, c) => `${c}${n} 待售及出租房产 | Binayah`,
    titleShort: (n, c) => `${c}${n} 房产 | Binayah`,
    titleBare: (n) => `${n} | Binayah`,
    leadProjects: (place, c, p) => `${place} 的 ${c} 个期房项目，以及待售和出租房源${p ? `，起价 ${p}` : ""}。`,
    leadPlain: (place) => `${place} 的待售、出租及期房房源。`,
  },
  vi: {
    inCity: " tại Dubai",
    ofCity: ", Dubai",
    titleFull: (n, c) => `Bất động sản bán & cho thuê tại ${n}${c ? ", Dubai" : ""} | Binayah`,
    titleShort: (n, c) => `Bất động sản tại ${n}${c ? ", Dubai" : ""} | Binayah`,
    titleBare: (n) => `${n} | Binayah`,
    leadProjects: (place, c, p) => `${c} dự án off-plan cùng nhà bán & cho thuê tại ${place}${p ? ` từ ${p}` : ""}.`,
    leadPlain: (place) => `Bất động sản bán, cho thuê & off-plan tại ${place}.`,
  },
  he: {
    inCity: " בדובאי",
    ofCity: ", דובאי",
    titleFull: (n, c) => `נכסים למכירה ולהשכרה ב-${n}${c ? ", דובאי" : ""} | Binayah`,
    titleShort: (n, c) => `נכסים ב-${n}${c ? ", דובאי" : ""} | Binayah`,
    titleBare: (n) => `${n} | Binayah`,
    leadProjects: (place, c, p) => `${c} פרויקטים על הנייר ונכסים למכירה ולהשכרה ב-${place}${p ? ` החל מ-${p}` : ""}.`,
    leadPlain: (place) => `נכסים למכירה, להשכרה ועל הנייר ב-${place}.`,
  },
};

/** True when the community name already carries the emirate. */
const NAME_HAS_CITY = /\bdubai\b/i;

/** A "from" price must be a total. An average per-square-foot rate is not a floor. */
const RATE_MARKER = /\/\s*sq\s*\.?\s*(ft|m)|per\s+sq|\bsqft\b|\bsqm\b|м²|قدم|平方|foot vuông/i;

export function pickPriceFrom(highlights: { label?: string; value?: string }[] | undefined): string | undefined {
  return highlights?.find(
    (h) => /price|prix|цен|سعر|价|giá|מחיר/i.test(h?.label || "") && !RATE_MARKER.test(String(h?.value ?? "")),
  )?.value;
}

export interface CommunityMetaInput {
  locale: string;
  name: string;
  projCount: number;
  priceFrom?: string;
  /** Editorial copy the description borrows its first sentence from. */
  baseDesc?: string;
}

/** Title and meta description for one community page, in one locale. */
export function buildCommunityMeta(i: CommunityMetaInput): { title: string; description: string } {
  const cm = COMM_META[i.locale] ?? COMM_META.en;
  const nameHasCity = NAME_HAS_CITY.test(i.name);
  const inCity = nameHasCity ? "" : cm.inCity;
  const place = nameHasCity ? i.name : i.locale === "zh" ? `${cm.ofCity}${i.name}` : `${i.name}${cm.ofCity}`;

  const full = cm.titleFull(i.name, inCity);
  const short = cm.titleShort(i.name, inCity);
  const title = full.length <= 60 ? full : short.length <= 60 ? short : cm.titleBare(i.name);

  const stripped = String(i.baseDesc ?? "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
  const firstSentence = ((stripped.match(/^.*?[.!?](\s|$)/) || [stripped])[0] || stripped).trim();
  const lead = i.projCount > 0 ? cm.leadProjects(place, i.projCount, i.priceFrom || "") : cm.leadPlain(place);
  let description = `${lead} ${firstSentence}`.replace(/\s+/g, " ").trim();
  if (description.length > 160) {
    const cut = description.lastIndexOf(" ", 158);
    description = description.slice(0, cut > 0 ? cut : 158).trimEnd() + "…";
  }
  return { title, description };
}
