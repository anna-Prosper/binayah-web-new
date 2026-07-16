/* eslint-disable i18next/no-literal-string -- programmatic SEO template; values are data-driven */
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { TrendingUp, Building2, LineChart, BadgeDollarSign, MapPin, ArrowRight, Percent, Bed, Bath, Maximize, ChevronRight, MessageCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ImageWithFallback from "@/components/ImageWithFallback";
import { BreadcrumbJsonLd, FAQJsonLd } from "@/components/JsonLd";
import { SectionEyebrow } from "@/components/SectionEyebrow";
import { FaqAccordion } from "@/components/FaqAccordion";
import WeeklySubscribeForm from "@/components/WeeklySubscribeForm";
import { canonical as makeCanonical, altLangs, DEFAULT_OG_IMAGE, OG_LOCALE } from "@/lib/site";
import { getDldBuilding, getDldBuildings, getCommunity, getCommunitiesIndex, serverApiUrl, serverFetch } from "@/lib/api";
import { fmtAed, dldAreaFor } from "@/lib/market";
import { getNonce } from "@/lib/nonce";

const WA = "https://wa.me/971549988811";
const slugifyArea = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const normName = (s: string) => s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, " ").trim();

// A page is indexable once it carries real market substance. Metadata is
// recomputed on every ISR revalidate (24h) from live DLD data, so as the daily
// import accumulates sales for a thin tower, its page flips to indexable
// automatically — no manual action needed. (Sitemap submission has a higher
// bar, ≥10 sales, so a noindexed URL is never submitted.)
const isIndexable = (b: { sales?: number; avgPrice?: number }) =>
  (b.sales || 0) >= 3 && (b.avgPrice || 0) > 0;

// Raw DLD area → community slug, for areas whose official name has no textual
// relation to the marketing name (audited 2026-07 against building counts).
const DLD_TO_COMMUNITY_SLUG: Record<string, string> = {
  "al barsha south fourth": "jumeirah-village-circle", // 55 buildings
  "al barsha south fifth": "jvt",
  "meydan one": "meydan", // 59 buildings
  "burj khalifa": "downtown-dubai",
  "palm deira": "dubai-islands",
  "madinat al mataar": "dubai-south",
  "silicon oasis": "dubai-silicon-oasis",
  "nadd hessa": "dubai-silicon-oasis",
  "jabal ali first": "jebel-ali",
  "wadi al safa 5": "arabian-ranches-3",
  "wadi al safa 3": "villanova", // Villanova / Dubailand belt
  "al yelayiss 2": "town-square",
  "madinat hind 4": "damac-hills-2",
  "al hebiah fifth": "damac-lagoons",
  "dubai hills": "dubai-hills-estate",
  "hadaeq sheikh mohammed bin rashid": "mohammed-bin-rashid-city",
  "marsa dubai": "dubai-marina",
  "al thanyah fifth": "jlt",
  "jumeirah lakes towers": "jlt",
  "tecom site a": "barsha-heights-tecom",
  "barsha heights": "barsha-heights-tecom",
  "al jadaf": "al-jaddaf",
  "arabian ranches i": "arabian-ranches",
  "nad al sheba gardens": "nad-al-sheba",
  "me aisem first": "jumeirah-golf-estates",
  "me aisem second": "the-oasis-by-emaar",
  "international city ph 1": "international-city-dubai",
  "dubai land residence complex": "dubai-land-residence-complex-dlrc",
  "dubai investment park second": "dubai-investment-park",
  // Second pass (coverage audit 2026-07): high-building-count raw DLD areas.
  "al wasl": "city-walk-dubai",                       // 29 bld — City Walk sits in Al Wasl
  "al merkadh": "mohammed-bin-rashid-city",           // 75 bld — MBR City district
  "al barshaa south third": "arjan-dubai",            // 65 bld — Arjan's official name (DLD double-a spelling)
  "al barsha south third": "arjan-dubai",
  "al hebiah fourth": "sports-city-dubai",            // 66 bld — Dubai Sports City district
  "madinat dubai almelaheyah": "dubai-maritime-city", // 34 bld — Maritime City
  "al khairan first": "dubai-creek-harbour",          // 41 bld — Creek Harbour district
  "al warsan first": "international-city-dubai",      // International City
};

// Map a DLD area to its parent community: the DLD name often differs from the
// community name ("Burj Khalifa" = Downtown Dubai), so try the explicit map,
// then a name match, then each community's own DLD alias resolution. Powers the
// hero image, og:image, the "About the area" section and the community link.
async function resolveAreaCommunity(dldArea: string): Promise<{ name: string; slug: string; featuredImage: string } | null> {
  const idx = await getCommunitiesIndex();
  const target = normName(dldArea);
  const mappedSlug = DLD_TO_COMMUNITY_SLUG[target];
  return (
    (mappedSlug && idx.find((c) => c.slug === mappedSlug)) ||
    idx.find((c) => normName(c.name) === target) ||
    idx.find((c) => normName(dldAreaFor(c.name)) === target) ||
    null
  );
}

export const revalidate = 86400;

// Opt into ISR. Without generateStaticParams a [slug] route is fully dynamic
// (private, no-store) regardless of `revalidate`. Returning [] prerenders
// nothing at build (light build) while making every slug ISR-cached on-demand.
export function generateStaticParams() {
  return [];
}

// DLD stores pricePerSqft as AED per SQUARE METRE despite the name.
const toSqft = (ppsfSqm: number | null | undefined) =>
  ppsfSqm && ppsfSqm > 0 ? Math.round(ppsfSqm / 10.764) : 0;

interface TrendPoint { month: string; avgPpsf: number; avgPrice: number; count: number }
interface BedRow { bedrooms: number; count: number; avgPrice: number; avgPpsf: number | null }
interface BuildingListing { slug: string; title?: string; name?: string; price?: number; currency?: string; bedrooms?: number; bathrooms?: number; size?: number; sizeUnit?: string; featuredImage?: string; listingType?: string; _src?: string }

// Single-sale months make the trend line jumpy and the 12-month % misleading.
// Keep months with ≥2 sales when enough of them exist; otherwise use all months.
function smoothTrend(trend: TrendPoint[]): { points: TrendPoint[]; smoothed: boolean } {
  const solid = trend.filter((t) => t.count >= 2);
  if (solid.length >= 4) return { points: solid, smoothed: solid.length !== trend.length };
  return { points: trend, smoothed: false };
}

// Live inventory in this tower — precise structured match via the search API's
// `building` param. Empty array (and a hidden section) on any failure.
async function getBuildingListings(name: string): Promise<BuildingListing[]> {
  try {
    const res = await serverFetch(serverApiUrl(`/api/search?building=${encodeURIComponent(name)}&limit=6`), 12_000);
    if (!res.ok) return [];
    const data = await res.json();
    const rows: BuildingListing[] = Array.isArray(data?.listings) ? data.listings : [];
    return rows.filter((l) => l.slug).slice(0, 6);
  } catch {
    return [];
  }
}

const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const fmtMonth = (ym: string) => {
  const [y, m] = ym.split("-").map(Number);
  return `${MONTH_SHORT[(m || 1) - 1]} ${String(y).slice(2)}`;
};
const sinceLabel = (trend: TrendPoint[]): string | null => {
  if (!trend.length) return null;
  const [y, m] = trend[0].month.split("-").map(Number);
  return `${["January","February","March","April","May","June","July","August","September","October","November","December"][(m||1)-1]} ${y}`;
};
// ── Per-locale UI chrome (labels, headings, breadcrumbs, buttons) ────────────
// The building NAME and DLD numeric data stay verbatim (proper nouns / data);
// only the surrounding chrome is translated so /fr/building/x renders French
// chrome under fr hreflang, /ar/ Arabic, etc. — no duplicate-content signal.
interface BuildingChrome {
  home: string;
  dldEyebrow: string;
  viewListings: string;
  explore: string;
  nav: { overview: string; trend: string; units: string; transactions: string; faqs: string };
  statAvgPpsf: string; statAvgPrice: string; statDldSales: string; statGrossYield: string; statTotalUnits: string;
  atGlance: string;
  glCommunity: string; glMaster: string; glTotalUnits: string; glPropTypes: string; glAvgPrice: string; glAvgPpsf: string; glGrossYield: string; glDldSales: string;
  talkAdvisor: string;
  ebMarketSnapshot: string; tNumbers: (n: string) => string;
  tPriceTrend: (n: string) => string;
  trendDesc: (since: string, smoothed: boolean) => string;
  tPricesByUnit: string; avgSalePrice: string; saleCount: (n: string, count: number) => string; unitMix: string;
  tRecentSold: string;
  thDate: string; thType: string; thBeds: string; thSize: string; thPrice: string; thPpsf: string;
  ebLiveInventory: string; tAvailableNow: (n: string) => string; forRent: string; forSale: string; priceOnRequest: string;
  studio: string; bed: (n: number) => string; bed5plus: string;
  ebAboutArea: string; tIsIn: (b: string, area: string) => string; exploreGuide: (area: string) => string;
  ebNearby: string; tOtherBuildings: (area: string) => string; salesWord: string; avgWord: string;
  ebFaq: string; tFaq: (n: string) => string;
  considering: (n: string) => string; ctaBody: (area: string) => string;
  figuresNote: (n: string, area: string, hasYield: boolean) => string;
}

const BUILDING_T: Record<string, BuildingChrome> = {
  en: {
    home: "Home", dldEyebrow: "Sold Prices · DLD Data", viewListings: "View listings", explore: "Explore",
    nav: { overview: "Overview", trend: "Price trend", units: "Unit types", transactions: "Transactions", faqs: "FAQs" },
    statAvgPpsf: "Avg Price / sqft", statAvgPrice: "Avg Sale Price", statDldSales: "DLD Sales Recorded", statGrossYield: "Est. Gross Yield", statTotalUnits: "Total Units",
    atGlance: "At a glance",
    glCommunity: "Community", glMaster: "Master project", glTotalUnits: "Total units", glPropTypes: "Property types", glAvgPrice: "Avg sale price", glAvgPpsf: "Avg price / sqft", glGrossYield: "Est. gross yield", glDldSales: "DLD sales recorded",
    talkAdvisor: "Talk to an advisor",
    ebMarketSnapshot: "Market snapshot", tNumbers: (n) => `${n} — the numbers`,
    tPriceTrend: (n) => `Price trend in ${n}`,
    trendDesc: (since, sm) => `Average sale price per sqft by month since ${since}${sm ? " (single-sale months excluded)" : ""}`,
    tPricesByUnit: "Prices by unit type", avgSalePrice: "avg sale price", saleCount: (n, c) => `${n} sale${c === 1 ? "" : "s"} · last 12 months`, unitMix: "Unit mix",
    tRecentSold: "Recent sold prices",
    thDate: "Date", thType: "Type", thBeds: "Beds", thSize: "Size (sqft)", thPrice: "Price", thPpsf: "AED/sqft",
    ebLiveInventory: "Live inventory", tAvailableNow: (n) => `Available now in ${n}`, forRent: "For Rent", forSale: "For Sale", priceOnRequest: "Price on request",
    studio: "Studio", bed: (n) => `${n} Bed`, bed5plus: "5+ Bed",
    ebAboutArea: "About the area", tIsIn: (b, a) => `${b} is in ${a}`, exploreGuide: (a) => `Explore the ${a} area guide`,
    ebNearby: "Nearby", tOtherBuildings: (a) => `Other buildings in ${a}`, salesWord: "sales", avgWord: "avg",
    ebFaq: "FAQ", tFaq: (n) => `${n}: frequently asked questions`,
    considering: (n) => `Considering ${n}?`, ctaBody: (a) => `Get honest, DLD-backed guidance on pricing, yields and availability in ${a} from Binayah's advisors — no pressure, just the numbers.`,
    figuresNote: (n, a, y) => `Figures are from Dubai Land Department transaction records for ${n}; individual units vary by floor, view and finish.${y ? ` Gross yield is estimated against average ${a} residential rents, before service charges.` : ""}`,
  },
  fr: {
    home: "Accueil", dldEyebrow: "Prix de vente · Données DLD", viewListings: "Voir les annonces", explore: "Découvrir",
    nav: { overview: "Aperçu", trend: "Tendance des prix", units: "Types d'unités", transactions: "Transactions", faqs: "FAQ" },
    statAvgPpsf: "Prix moy. / pi²", statAvgPrice: "Prix de vente moy.", statDldSales: "Ventes DLD enregistrées", statGrossYield: "Rendement brut est.", statTotalUnits: "Total des unités",
    atGlance: "En bref",
    glCommunity: "Communauté", glMaster: "Projet maître", glTotalUnits: "Total des unités", glPropTypes: "Types de biens", glAvgPrice: "Prix de vente moy.", glAvgPpsf: "Prix moy. / pi²", glGrossYield: "Rendement brut est.", glDldSales: "Ventes DLD enregistrées",
    talkAdvisor: "Parler à un conseiller",
    ebMarketSnapshot: "Aperçu du marché", tNumbers: (n) => `${n} — les chiffres`,
    tPriceTrend: (n) => `Tendance des prix à ${n}`,
    trendDesc: (since, sm) => `Prix de vente moyen par pi² et par mois depuis ${since}${sm ? " (mois à vente unique exclus)" : ""}`,
    tPricesByUnit: "Prix par type d'unité", avgSalePrice: "prix de vente moy.", saleCount: (n, c) => `${n} vente${c === 1 ? "" : "s"} · 12 derniers mois`, unitMix: "Répartition des unités",
    tRecentSold: "Prix de vente récents",
    thDate: "Date", thType: "Type", thBeds: "Ch.", thSize: "Surface (pi²)", thPrice: "Prix", thPpsf: "AED/pi²",
    ebLiveInventory: "Stock disponible", tAvailableNow: (n) => `Disponible maintenant à ${n}`, forRent: "À louer", forSale: "À vendre", priceOnRequest: "Prix sur demande",
    studio: "Studio", bed: (n) => `${n} ch.`, bed5plus: "5+ ch.",
    ebAboutArea: "À propos du quartier", tIsIn: (b, a) => `${b} se situe à ${a}`, exploreGuide: (a) => `Découvrir le guide du quartier ${a}`,
    ebNearby: "À proximité", tOtherBuildings: (a) => `Autres immeubles à ${a}`, salesWord: "ventes", avgWord: "moy.",
    ebFaq: "FAQ", tFaq: (n) => `${n} : questions fréquentes`,
    considering: (n) => `Vous envisagez ${n} ?`, ctaBody: (a) => `Obtenez des conseils honnêtes et fondés sur les données DLD concernant les prix, les rendements et la disponibilité à ${a} auprès des conseillers de Binayah — sans pression, juste les chiffres.`,
    figuresNote: (n, a, y) => `Les chiffres proviennent des registres de transactions du Dubai Land Department pour ${n} ; chaque unité varie selon l'étage, la vue et les finitions.${y ? ` Le rendement brut est estimé par rapport aux loyers résidentiels moyens à ${a}, avant charges.` : ""}`,
  },
  ru: {
    home: "Главная", dldEyebrow: "Цены продаж · Данные DLD", viewListings: "Смотреть объявления", explore: "Обзор",
    nav: { overview: "Обзор", trend: "Динамика цен", units: "Типы юнитов", transactions: "Сделки", faqs: "Вопросы" },
    statAvgPpsf: "Ср. цена / фут²", statAvgPrice: "Ср. цена продажи", statDldSales: "Сделок DLD", statGrossYield: "Валовая доходность (оц.)", statTotalUnits: "Всего юнитов",
    atGlance: "Кратко",
    glCommunity: "Район", glMaster: "Мастер-проект", glTotalUnits: "Всего юнитов", glPropTypes: "Типы недвижимости", glAvgPrice: "Ср. цена продажи", glAvgPpsf: "Ср. цена / фут²", glGrossYield: "Валовая доходность (оц.)", glDldSales: "Сделок DLD",
    talkAdvisor: "Связаться с консультантом",
    ebMarketSnapshot: "Обзор рынка", tNumbers: (n) => `${n} — цифры`,
    tPriceTrend: (n) => `Динамика цен в ${n}`,
    trendDesc: (since, sm) => `Средняя цена продажи за фут² по месяцам с ${since}${sm ? " (месяцы с единичными сделками исключены)" : ""}`,
    tPricesByUnit: "Цены по типам юнитов", avgSalePrice: "ср. цена продажи", saleCount: (n) => `${n} сделок · за 12 месяцев`, unitMix: "Структура юнитов",
    tRecentSold: "Недавние цены продаж",
    thDate: "Дата", thType: "Тип", thBeds: "Спальни", thSize: "Площадь (фут²)", thPrice: "Цена", thPpsf: "AED/фут²",
    ebLiveInventory: "Доступные объекты", tAvailableNow: (n) => `Доступно сейчас в ${n}`, forRent: "Аренда", forSale: "Продажа", priceOnRequest: "Цена по запросу",
    studio: "Студия", bed: (n) => `${n} спальн.`, bed5plus: "5+ спальн.",
    ebAboutArea: "О районе", tIsIn: (b, a) => `${b} находится в ${a}`, exploreGuide: (a) => `Открыть гид по району ${a}`,
    ebNearby: "Рядом", tOtherBuildings: (a) => `Другие здания в ${a}`, salesWord: "сделок", avgWord: "ср.",
    ebFaq: "Вопросы", tFaq: (n) => `${n}: часто задаваемые вопросы`,
    considering: (n) => `Рассматриваете ${n}?`, ctaBody: (a) => `Получите честные, основанные на данных DLD рекомендации по ценам, доходности и наличию в ${a} от консультантов Binayah — без давления, только цифры.`,
    figuresNote: (n, a, y) => `Данные взяты из записей о сделках Земельного департамента Дубая по ${n}; отдельные юниты различаются по этажу, виду и отделке.${y ? ` Валовая доходность оценена относительно средних арендных ставок в ${a}, без учёта сервисных сборов.` : ""}`,
  },
  ar: {
    home: "الرئيسية", dldEyebrow: "أسعار البيع · بيانات DLD", viewListings: "عرض القوائم", explore: "استكشف",
    nav: { overview: "نظرة عامة", trend: "اتجاه الأسعار", units: "أنواع الوحدات", transactions: "المعاملات", faqs: "الأسئلة الشائعة" },
    statAvgPpsf: "متوسط السعر / قدم²", statAvgPrice: "متوسط سعر البيع", statDldSales: "صفقات DLD المسجلة", statGrossYield: "العائد الإجمالي التقديري", statTotalUnits: "إجمالي الوحدات",
    atGlance: "لمحة سريعة",
    glCommunity: "المجتمع", glMaster: "المشروع الرئيسي", glTotalUnits: "إجمالي الوحدات", glPropTypes: "أنواع العقارات", glAvgPrice: "متوسط سعر البيع", glAvgPpsf: "متوسط السعر / قدم²", glGrossYield: "العائد الإجمالي التقديري", glDldSales: "صفقات DLD المسجلة",
    talkAdvisor: "تحدث إلى مستشار",
    ebMarketSnapshot: "لمحة عن السوق", tNumbers: (n) => `${n} — الأرقام`,
    tPriceTrend: (n) => `اتجاه الأسعار في ${n}`,
    trendDesc: (since, sm) => `متوسط سعر البيع لكل قدم² شهريًا منذ ${since}${sm ? " (باستثناء أشهر البيع الفردي)" : ""}`,
    tPricesByUnit: "الأسعار حسب نوع الوحدة", avgSalePrice: "متوسط سعر البيع", saleCount: (n) => `${n} صفقة · آخر 12 شهرًا`, unitMix: "توزيع الوحدات",
    tRecentSold: "أسعار البيع الأخيرة",
    thDate: "التاريخ", thType: "النوع", thBeds: "غرف", thSize: "المساحة (قدم²)", thPrice: "السعر", thPpsf: "درهم/قدم²",
    ebLiveInventory: "المعروض المتاح", tAvailableNow: (n) => `متاح الآن في ${n}`, forRent: "للإيجار", forSale: "للبيع", priceOnRequest: "السعر عند الطلب",
    studio: "استوديو", bed: (n) => `${n} غرفة`, bed5plus: "5+ غرفة",
    ebAboutArea: "عن المنطقة", tIsIn: (b, a) => `${b} يقع في ${a}`, exploreGuide: (a) => `استكشف دليل منطقة ${a}`,
    ebNearby: "بالقرب", tOtherBuildings: (a) => `مبانٍ أخرى في ${a}`, salesWord: "صفقة", avgWord: "متوسط",
    ebFaq: "الأسئلة الشائعة", tFaq: (n) => `${n}: الأسئلة الشائعة`,
    considering: (n) => `تفكر في ${n}؟`, ctaBody: (a) => `احصل على إرشادات صادقة ومدعومة ببيانات DLD حول الأسعار والعوائد والتوافر في ${a} من مستشاري Binayah — دون ضغط، مجرد أرقام.`,
    figuresNote: (n, a, y) => `الأرقام مأخوذة من سجلات معاملات دائرة الأراضي والأملاك في دبي لـ ${n}؛ تختلف الوحدات حسب الطابق والإطلالة والتشطيب.${y ? ` يُقدَّر العائد الإجمالي مقابل متوسط الإيجارات السكنية في ${a}، قبل رسوم الخدمة.` : ""}`,
  },
  zh: {
    home: "首页", dldEyebrow: "成交价 · DLD 数据", viewListings: "查看房源", explore: "探索",
    nav: { overview: "概览", trend: "价格走势", units: "户型", transactions: "交易记录", faqs: "常见问题" },
    statAvgPpsf: "均价 / 平方英尺", statAvgPrice: "平均成交价", statDldSales: "DLD 成交记录", statGrossYield: "预估毛收益率", statTotalUnits: "总户数",
    atGlance: "概况",
    glCommunity: "社区", glMaster: "总体项目", glTotalUnits: "总户数", glPropTypes: "物业类型", glAvgPrice: "平均成交价", glAvgPpsf: "均价 / 平方英尺", glGrossYield: "预估毛收益率", glDldSales: "DLD 成交记录",
    talkAdvisor: "咨询顾问",
    ebMarketSnapshot: "市场概况", tNumbers: (n) => `${n} — 数据`,
    tPriceTrend: (n) => `${n} 的价格走势`,
    trendDesc: (since, sm) => `自 ${since} 以来每月每平方英尺平均成交价${sm ? "（已排除仅一笔成交的月份）" : ""}`,
    tPricesByUnit: "各户型价格", avgSalePrice: "平均成交价", saleCount: (n) => `${n} 笔成交 · 近 12 个月`, unitMix: "户型分布",
    tRecentSold: "近期成交价",
    thDate: "日期", thType: "类型", thBeds: "卧室", thSize: "面积（平方英尺）", thPrice: "价格", thPpsf: "AED/平方英尺",
    ebLiveInventory: "在售房源", tAvailableNow: (n) => `${n} 现房源`, forRent: "出租", forSale: "出售", priceOnRequest: "价格待询",
    studio: "开间", bed: (n) => `${n} 卧`, bed5plus: "5+ 卧",
    ebAboutArea: "关于区域", tIsIn: (b, a) => `${b} 位于 ${a}`, exploreGuide: (a) => `浏览 ${a} 区域指南`,
    ebNearby: "附近", tOtherBuildings: (a) => `${a} 的其他建筑`, salesWord: "成交", avgWord: "均价",
    ebFaq: "常见问题", tFaq: (n) => `${n}：常见问题`,
    considering: (n) => `正在考虑 ${n}？`, ctaBody: (a) => `从 Binayah 顾问处获得基于 DLD 数据的诚实建议，了解 ${a} 的价格、收益和房源情况——没有压力，只有数据。`,
    figuresNote: (n, a, y) => `数据来自迪拜土地局关于 ${n} 的交易记录；具体单元因楼层、景观和装修而异。${y ? ` 毛收益率按 ${a} 平均住宅租金估算，未计物业费。` : ""}`,
  },
  vi: {
    home: "Trang chủ", dldEyebrow: "Giá bán · Dữ liệu DLD", viewListings: "Xem tin đăng", explore: "Khám phá",
    nav: { overview: "Tổng quan", trend: "Xu hướng giá", units: "Loại căn hộ", transactions: "Giao dịch", faqs: "Câu hỏi" },
    statAvgPpsf: "Giá TB / ft²", statAvgPrice: "Giá bán TB", statDldSales: "Giao dịch DLD đã ghi", statGrossYield: "Lợi suất gộp ước tính", statTotalUnits: "Tổng số căn",
    atGlance: "Tóm tắt",
    glCommunity: "Cộng đồng", glMaster: "Dự án tổng thể", glTotalUnits: "Tổng số căn", glPropTypes: "Loại hình BĐS", glAvgPrice: "Giá bán TB", glAvgPpsf: "Giá TB / ft²", glGrossYield: "Lợi suất gộp ước tính", glDldSales: "Giao dịch DLD đã ghi",
    talkAdvisor: "Trao đổi với chuyên viên",
    ebMarketSnapshot: "Ảnh chụp thị trường", tNumbers: (n) => `${n} — số liệu`,
    tPriceTrend: (n) => `Xu hướng giá tại ${n}`,
    trendDesc: (since, sm) => `Giá bán trung bình mỗi ft² theo tháng kể từ ${since}${sm ? " (đã loại các tháng chỉ một giao dịch)" : ""}`,
    tPricesByUnit: "Giá theo loại căn", avgSalePrice: "giá bán TB", saleCount: (n) => `${n} giao dịch · 12 tháng qua`, unitMix: "Cơ cấu căn hộ",
    tRecentSold: "Giá bán gần đây",
    thDate: "Ngày", thType: "Loại", thBeds: "PN", thSize: "Diện tích (ft²)", thPrice: "Giá", thPpsf: "AED/ft²",
    ebLiveInventory: "Hàng có sẵn", tAvailableNow: (n) => `Hiện có tại ${n}`, forRent: "Cho thuê", forSale: "Bán", priceOnRequest: "Giá liên hệ",
    studio: "Studio", bed: (n) => `${n} PN`, bed5plus: "5+ PN",
    ebAboutArea: "Về khu vực", tIsIn: (b, a) => `${b} nằm ở ${a}`, exploreGuide: (a) => `Xem hướng dẫn khu vực ${a}`,
    ebNearby: "Lân cận", tOtherBuildings: (a) => `Các tòa nhà khác tại ${a}`, salesWord: "giao dịch", avgWord: "TB",
    ebFaq: "Câu hỏi", tFaq: (n) => `${n}: câu hỏi thường gặp`,
    considering: (n) => `Đang cân nhắc ${n}?`, ctaBody: (a) => `Nhận tư vấn trung thực dựa trên dữ liệu DLD về giá, lợi suất và tình trạng có sẵn tại ${a} từ các chuyên viên của Binayah — không áp lực, chỉ có số liệu.`,
    figuresNote: (n, a, y) => `Số liệu lấy từ hồ sơ giao dịch của Sở Đất đai Dubai cho ${n}; từng căn khác nhau theo tầng, hướng nhìn và hoàn thiện.${y ? ` Lợi suất gộp được ước tính so với giá thuê nhà ở trung bình tại ${a}, trước phí dịch vụ.` : ""}`,
  },
  he: {
    home: "בית", dldEyebrow: "מחירי מכירה · נתוני DLD", viewListings: "צפייה בנכסים", explore: "לחקור",
    nav: { overview: "סקירה", trend: "מגמת מחירים", units: "סוגי יחידות", transactions: "עסקאות", faqs: "שאלות נפוצות" },
    statAvgPpsf: "מחיר ממוצע / רגל²", statAvgPrice: "מחיר מכירה ממוצע", statDldSales: "עסקאות DLD רשומות", statGrossYield: "תשואה ברוטו משוערת", statTotalUnits: "סך היחידות",
    atGlance: "במבט חטוף",
    glCommunity: "קהילה", glMaster: "פרויקט אב", glTotalUnits: "סך היחידות", glPropTypes: "סוגי נכסים", glAvgPrice: "מחיר מכירה ממוצע", glAvgPpsf: "מחיר ממוצע / רגל²", glGrossYield: "תשואה ברוטו משוערת", glDldSales: "עסקאות DLD רשומות",
    talkAdvisor: "שוחחו עם יועץ",
    ebMarketSnapshot: "תמונת מצב שוק", tNumbers: (n) => `${n} — המספרים`,
    tPriceTrend: (n) => `מגמת מחירים ב${n}`,
    trendDesc: (since, sm) => `מחיר מכירה ממוצע לרגל² לפי חודש מאז ${since}${sm ? " (חודשים עם עסקה בודדת הוסרו)" : ""}`,
    tPricesByUnit: "מחירים לפי סוג יחידה", avgSalePrice: "מחיר מכירה ממוצע", saleCount: (n) => `${n} עסקאות · 12 החודשים האחרונים`, unitMix: "תמהיל יחידות",
    tRecentSold: "מחירי מכירה אחרונים",
    thDate: "תאריך", thType: "סוג", thBeds: "חדרים", thSize: "שטח (רגל²)", thPrice: "מחיר", thPpsf: "AED/רגל²",
    ebLiveInventory: "מלאי זמין", tAvailableNow: (n) => `זמין כעת ב${n}`, forRent: "להשכרה", forSale: "למכירה", priceOnRequest: "מחיר לפי בקשה",
    studio: "סטודיו", bed: (n) => `${n} חדרים`, bed5plus: "5+ חדרים",
    ebAboutArea: "על האזור", tIsIn: (b, a) => `${b} ממוקם ב${a}`, exploreGuide: (a) => `למדריך אזור ${a}`,
    ebNearby: "בקרבת מקום", tOtherBuildings: (a) => `בניינים אחרים ב${a}`, salesWord: "עסקאות", avgWord: "ממוצע",
    ebFaq: "שאלות נפוצות", tFaq: (n) => `${n}: שאלות נפוצות`,
    considering: (n) => `שוקלים את ${n}?`, ctaBody: (a) => `קבלו ייעוץ כן ומבוסס נתוני DLD על מחירים, תשואות וזמינות ב${a} מיועצי Binayah — ללא לחץ, רק המספרים.`,
    figuresNote: (n, a, y) => `הנתונים לקוחים מרישומי העסקאות של רשות המקרקעין של דובאי עבור ${n}; יחידות בודדות משתנות לפי קומה, נוף וגימור.${y ? ` התשואה ברוטו מוערכת מול שכר הדירה הממוצע ב${a}, לפני דמי ניהול.` : ""}`,
  },
};

// ── Server-rendered price-trend chart (zero client JS) ───────────────────────
// Single series → one brand hue, 2px line, recessive grid, no legend (the title
// names the series). Native SVG <title> gives a hover tooltip per point.
function TrendChart({ points }: { points: { label: string; value: number; count: number }[] }) {
  const W = 660, H = 230, PAD_L = 56, PAD_R = 14, PAD_T = 14, PAD_B = 30;
  const iw = W - PAD_L - PAD_R, ih = H - PAD_T - PAD_B;
  const vals = points.map((p) => p.value);
  const lo = Math.min(...vals), hi = Math.max(...vals);
  const span = Math.max(hi - lo, Math.round(hi * 0.06) || 1); // avoid a flat-line collapse
  const yMin = Math.max(0, lo - span * 0.25), yMax = hi + span * 0.25;
  const x = (i: number) => PAD_L + (points.length === 1 ? iw / 2 : (i / (points.length - 1)) * iw);
  const y = (v: number) => PAD_T + ih - ((v - yMin) / (yMax - yMin)) * ih;
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(" ");
  const areaPath = `${path} L${x(points.length - 1).toFixed(1)},${(PAD_T + ih).toFixed(1)} L${x(0).toFixed(1)},${(PAD_T + ih).toFixed(1)} Z`;
  const gridVals = [0.25, 0.5, 0.75].map((f) => yMin + f * (yMax - yMin));
  const labelEvery = points.length > 8 ? 2 : 1;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Average sale price per square foot by month" className="w-full h-auto">
      {gridVals.map((v, i) => (
        <g key={i}>
          <line x1={PAD_L} x2={W - PAD_R} y1={y(v)} y2={y(v)} stroke="currentColor" className="text-border" strokeWidth="1" strokeDasharray="2 4" />
          <text x={PAD_L - 8} y={y(v) + 3.5} textAnchor="end" fontSize="10" className="fill-muted-foreground">{Math.round(v).toLocaleString("en-AE")}</text>
        </g>
      ))}
      <path d={areaPath} fill="#1A7A5A" opacity="0.09" />
      <path d={path} fill="none" stroke="#1A7A5A" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {points.map((p, i) => (
        <g key={i}>
          {/* ≥8px hit target with a native tooltip; visible dot stays small */}
          <circle cx={x(i)} cy={y(p.value)} r="9" fill="transparent">
            <title>{`${p.label}: AED ${p.value.toLocaleString("en-AE")}/sqft · ${p.count} sale${p.count === 1 ? "" : "s"}`}</title>
          </circle>
          <circle cx={x(i)} cy={y(p.value)} r="3" fill="#1A7A5A" stroke="#fff" strokeWidth="1.5" />
          {i % labelEvery === 0 && (
            <text x={x(i)} y={H - 10} textAnchor="middle" fontSize="10" className="fill-muted-foreground">{p.label}</text>
          )}
        </g>
      ))}
    </svg>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string; locale: string }> }): Promise<Metadata> {
  const { slug, locale } = await params;
  const b = await getDldBuilding(slug);
  if (!b) return { title: "Building Not Found" };
  const ppsf = toSqft(b.avgPpsf);
  const { points: trend } = smoothTrend(((Array.isArray(b.trend) ? b.trend : []) as TrendPoint[]).filter((t) => t.avgPpsf > 0));
  const first = trend[0], last = trend[trend.length - 1];
  const changePct = first && last && first.avgPpsf > 0 && trend.length > 1
    ? Math.round(((last.avgPpsf - first.avgPpsf) / first.avgPpsf) * 1000) / 10
    : null;
  const BL: Record<string, { soldTitle: string; sales: (n: string) => string; soldData: string; avg: (p: string) => string; since: (l: string) => string; yieldF: (y: number) => string; tail: string }> = {
    en: { soldTitle: "Sold Prices & Transactions", sales: (n) => `${n} DLD sales`, soldData: "DLD sold-price data", avg: (p) => `, avg AED ${p}/sqft`, since: (l) => ` since ${l}`, yieldF: (y) => `, ~${y}% gross yield`, tail: ". Real transactions, price trend & unit mix." },
    fr: { soldTitle: "Prix de vente et transactions", sales: (n) => `${n} ventes DLD`, soldData: "données de prix de vente DLD", avg: (p) => `, moy. ${p} AED/pi²`, since: (l) => ` depuis ${l}`, yieldF: (y) => `, rendement brut ~${y} %`, tail: ". Transactions réelles, tendance des prix et répartition des unités." },
    ru: { soldTitle: "Цены продаж и сделки", sales: (n) => `${n} сделок DLD`, soldData: "данные о ценах продаж DLD", avg: (p) => `, в среднем ${p} AED/фут²`, since: (l) => ` с ${l}`, yieldF: (y) => `, валовая доходность ~${y}%`, tail: ". Реальные сделки, динамика цен и структура юнитов." },
    ar: { soldTitle: "أسعار البيع والمعاملات", sales: (n) => `${n} صفقة (DLD)`, soldData: "بيانات أسعار البيع من DLD", avg: (p) => `، متوسط ${p} درهم/قدم²`, since: (l) => ` منذ ${l}`, yieldF: (y) => `، عائد إجمالي ~${y}%`, tail: ". معاملات حقيقية واتجاه الأسعار وتوزيع الوحدات." },
    zh: { soldTitle: "成交价与交易记录", sales: (n) => `${n} 笔 DLD 成交`, soldData: "DLD 成交价数据", avg: (p) => `，均价 AED ${p}/平方英尺`, since: (l) => ` 自 ${l}`, yieldF: (y) => `，毛收益率约 ${y}%`, tail: "。真实成交、价格走势与户型分布。" },
    vi: { soldTitle: "Giá bán và giao dịch", sales: (n) => `${n} giao dịch DLD`, soldData: "dữ liệu giá bán DLD", avg: (p) => `, TB ${p} AED/foot²`, since: (l) => ` từ ${l}`, yieldF: (y) => `, lợi suất gộp ~${y}%`, tail: ". Giao dịch thực tế, xu hướng giá và cơ cấu căn hộ." },
    he: { soldTitle: "מחירי מכירה ועסקאות", sales: (n) => `${n} עסקאות DLD`, soldData: 'נתוני מחירי מכירה של DLD', avg: (p) => `, ממוצע ${p} AED/רגל²`, since: (l) => ` מאז ${l}`, yieldF: (y) => `, תשואה ברוטו ~${y}%`, tail: ". עסקאות אמיתיות, מגמת מחירים ותמהיל יחידות." },
  };
  const bl = BL[locale] ?? BL.en;
  const sl = sinceLabel(trend);
  const title = `${b.name} — ${bl.soldTitle} | ${b.area}, Dubai`;
  const description = `${b.name}, ${b.area}: ${b.sales ? bl.sales(b.sales.toLocaleString("en-AE")) : bl.soldData}${ppsf ? bl.avg(ppsf.toLocaleString("en-AE")) : ""}${changePct != null ? ` (${changePct > 0 ? "+" : ""}${changePct}%${sl ? bl.since(sl) : ""})` : ""}${b.areaYield?.grossYieldPct ? bl.yieldF(b.areaYield.grossYieldPct) : ""}${bl.tail}`;
  const path = `/building/${slug}`;
  // Social preview: the parent community's hero (resized ~70KB JPEG via the
  // image optimizer — raw heroes are 8-12MB and get rejected by some crawlers).
  const areaCommunity = await resolveAreaCommunity(b.area);
  const ogImage = areaCommunity?.featuredImage
    ? `https://www.binayah.ae/_next/image?url=${encodeURIComponent(areaCommunity.featuredImage)}&w=1200&q=72`
    : DEFAULT_OG_IMAGE;
  return {
    title: `${title} | Binayah`,
    description,
    // Thin towers (few recorded sales) noindex until the daily DLD import gives
    // them substance — then this flips to indexable on the next revalidate.
    ...(isIndexable(b) ? {} : { robots: { index: false as const, follow: true } }),
    alternates: { canonical: makeCanonical(locale, path), languages: altLangs(path) },
    openGraph: {
      locale: OG_LOCALE[locale] ?? "en_AE", title, description, type: "website", url: makeCanonical(locale, path), images: [{ url: ogImage, width: 1200, height: 630, alt: `${b.name}, ${b.area}` }] },
    twitter: { card: "summary_large_image", title, description, images: [ogImage] },
  };
}

export default async function BuildingPage({ params }: { params: Promise<{ slug: string; locale: string }> }) {
  const { slug, locale } = await params;
  const b = await getDldBuilding(slug);
  if (!b) return notFound();
  const nonce = await getNonce();
  const lp = locale === "en" ? "" : `/${locale}`;
  const t = BUILDING_T[locale] ?? BUILDING_T.en;

  // Resolve the parent community first (explicit DLD map → name → alias), then
  // fetch siblings + live inventory + the community bundle in parallel.
  const resolved = await resolveAreaCommunity(b.area);
  const communitySlug = resolved?.slug || slugifyArea(b.area);
  const [siblingsRes, listings, communityBundle] = await Promise.all([
    getDldBuildings(`area=${encodeURIComponent(b.area)}&limit=13&sortBy=sales`),
    getBuildingListings(b.name),
    getCommunity(communitySlug),
  ]);
  // getCommunity returns the landing bundle — the community doc is nested.
  const parent = communityBundle?.community || null;
  const siblings = siblingsRes.results
    .filter((x: { slug?: string; name?: string }) => x.slug && x.name && x.slug !== slug)
    .slice(0, 9)
    .map((x: { slug: string; name: string; sales?: number; avgPrice?: number }) => ({ slug: x.slug, name: x.name, sales: x.sales, avgPrice: x.avgPrice }));

  // Hero image: a real listing photo in this tower → parent community photo
  // (resolved doc, then index entry) → branded gradient.
  const heroImage: string | null =
    listings.find((l) => l.featuredImage)?.featuredImage ||
    parent?.featuredImage ||
    parent?.imageGallery?.[0] ||
    resolved?.featuredImage ||
    null;

  // "About the area" — the parent community's editorial overview (AI enrichment
  // or legacy description), trimmed to ~2 sentences. Adds unique area context to
  // every tower page (most valuable on lighter ones) + a crawlable link to the
  // community guide.
  const areaName: string = parent?.name || resolved?.name || b.area;
  const areaOverviewRaw: string = ((parent?.enrichment as { overview?: string } | null)?.overview || parent?.description || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const areaAbout = areaOverviewRaw
    ? (areaOverviewRaw.match(/^(?:[^.!?]*[.!?]){1,2}/) || [areaOverviewRaw.slice(0, 280)])[0].trim()
    : "";

  const ppsf = toSqft(b.avgPpsf);
  const { points: trend, smoothed } = smoothTrend(((Array.isArray(b.trend) ? b.trend : []) as TrendPoint[]).filter((t) => t.avgPpsf > 0));
  const trendPts = trend.map((t) => ({ label: fmtMonth(t.month), value: toSqft(t.avgPpsf), count: t.count }));
  const first = trend[0], last = trend[trend.length - 1];
  const changePct = first && last && first.avgPpsf > 0 && trend.length > 1
    ? Math.round(((last.avgPpsf - first.avgPpsf) / first.avgPpsf) * 1000) / 10
    : null;
  const trendSales = trend.reduce((s, t) => s + t.count, 0);
  const byBedrooms: BedRow[] = (Array.isArray(b.byBedrooms) ? b.byBedrooms : []).filter((r: BedRow) => r.count > 0);
  const yieldPct: number | null = b.areaYield?.grossYieldPct ?? null;

  const rb = b.roomTypeBreakdown || {};
  const roomMix = [
    { label: t.studio, n: rb.studio },
    { label: t.bed(1), n: rb.oneBr },
    { label: t.bed(2), n: rb.twoBr },
    { label: t.bed(3), n: rb.threeBr },
    { label: t.bed(4), n: rb.fourBr },
    { label: t.bed5plus, n: rb.fivePlus },
  ].filter((r) => r.n && r.n > 0);
  const txns: any[] = Array.isArray(b.recentTransactions) ? b.recentTransactions : [];

  const stats = [
    { icon: TrendingUp, label: t.statAvgPpsf, value: ppsf ? `AED ${ppsf.toLocaleString("en-AE")}` : "-" },
    { icon: BadgeDollarSign, label: t.statAvgPrice, value: fmtAed(b.avgPrice) },
    { icon: LineChart, label: t.statDldSales, value: b.sales ? b.sales.toLocaleString("en-AE") : "-" },
    ...(yieldPct
      ? [{ icon: Percent, label: t.statGrossYield, value: `${yieldPct}%` }]
      : [{ icon: Building2, label: t.statTotalUnits, value: b.units ? b.units.toLocaleString("en-AE") : "-" }]),
  ];

  // ── Data-driven narrative (unique per building — the SEO body copy) ──
  const paras: string[] = [];
  paras.push(
    `${b.name} is a residential ${b.propertyTypes?.length ? b.propertyTypes.join("/").toLowerCase() : "building"} in ${b.area}, Dubai${b.units ? ` with approximately ${b.units.toLocaleString("en-AE")} units` : ""}. Dubai Land Department records show ${b.sales ? `${b.sales.toLocaleString("en-AE")} sales` : "recorded sales"} in the building${b.avgPrice ? `, at an average price of ${fmtAed(b.avgPrice)}${ppsf ? ` — around AED ${ppsf.toLocaleString("en-AE")} per square foot` : ""}` : ""}.`
  );
  if (trend.length > 1 && changePct != null) {
    paras.push(
      `Since ${sinceLabel(trend) || "the start of available records"}, ${trendSales.toLocaleString("en-AE")} sale${trendSales === 1 ? "" : "s"} completed in ${b.name}, with the average price per square foot moving from AED ${toSqft(first!.avgPpsf).toLocaleString("en-AE")} to AED ${toSqft(last!.avgPpsf).toLocaleString("en-AE")} (${changePct > 0 ? "+" : ""}${changePct}%). ${changePct > 3 ? "That upward drift suggests sellers currently hold pricing power here." : changePct < -3 ? "That softening can open negotiating room for buyers." : "Prices have held broadly steady, a sign of a balanced market in the tower."}`
    );
  }
  if (yieldPct) {
    paras.push(
      `Benchmarked against average residential rents in ${b.area}, a typical unit in ${b.name} returns an estimated ${yieldPct}% gross rental yield before service charges — a useful starting point for investors comparing towers across ${b.area}.`
    );
  }

  const faqs = [
    b.avgPrice && { question: `What is the average price in ${b.name}?`, answer: `The average recorded sale price in ${b.name}, ${b.area} is ${fmtAed(b.avgPrice)}${ppsf ? `, around AED ${ppsf.toLocaleString("en-AE")} per square foot` : ""}, based on Dubai Land Department transaction data.` },
    changePct != null && { question: `Are prices in ${b.name} going up or down?`, answer: `Average sale prices in ${b.name} have ${changePct > 0.5 ? "risen" : changePct < -0.5 ? "eased" : "held steady"} ${changePct > 0 ? "+" : ""}${changePct}% per square foot since ${sinceLabel(trend) || "records began"}, across ${trendSales.toLocaleString("en-AE")} DLD-recorded sales.` },
    yieldPct && { question: `What rental yield can I expect in ${b.name}?`, answer: `Based on average ${b.area} residential rents against sale prices in the building, a typical unit in ${b.name} yields roughly ${yieldPct}% gross per year, before service charges and fees.` },
    b.sales && { question: `How many properties have sold in ${b.name}?`, answer: `${b.sales.toLocaleString("en-AE")} sales have been recorded in ${b.name} according to DLD data${b.units ? `, across approximately ${b.units.toLocaleString("en-AE")} units` : ""}.` },
    roomMix.length > 0 && { question: `What unit types are available in ${b.name}?`, answer: `${b.name} offers ${roomMix.map((r) => r.label.toLowerCase()).join(", ")} units. Contact Binayah for current availability and pricing.` },
  ].filter(Boolean) as { question: string; answer: string }[];

  const breadcrumbs = [
    { name: t.home, href: `${lp}/` },
    { name: b.area, href: `${lp}/search?q=${encodeURIComponent(b.area)}` },
    { name: b.name, href: `${lp}/building/${slug}` },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ApartmentComplex",
    name: b.name,
    address: { "@type": "PostalAddress", addressLocality: b.area, addressRegion: "Dubai", addressCountry: "AE" },
    ...(b.units ? { numberOfAccommodationUnits: b.units } : {}),
    url: makeCanonical(locale, `/building/${slug}`),
  };

  // Sticky sub-nav — only anchor sections that actually render.
  const navItems = [
    { id: "overview", label: t.nav.overview },
    trendPts.length > 1 && { id: "trend", label: t.nav.trend },
    byBedrooms.length > 0 && { id: "units", label: t.nav.units },
    txns.length > 0 && { id: "transactions", label: t.nav.transactions },
    faqs.length > 0 && { id: "faqs", label: t.nav.faqs },
  ].filter(Boolean) as { id: string; label: string }[];

  // "At a glance" sidebar rows.
  const glance = [
    { label: t.glCommunity, value: b.area },
    b.masterProject ? { label: t.glMaster, value: b.masterProject } : null,
    b.units ? { label: t.glTotalUnits, value: b.units.toLocaleString("en-AE") } : null,
    b.propertyTypes?.length ? { label: t.glPropTypes, value: b.propertyTypes.join(", ") } : null,
    b.avgPrice ? { label: t.glAvgPrice, value: fmtAed(b.avgPrice) } : null,
    ppsf ? { label: t.glAvgPpsf, value: `AED ${ppsf.toLocaleString("en-AE")}` } : null,
    yieldPct ? { label: t.glGrossYield, value: `${yieldPct}%` } : null,
    b.sales ? { label: t.glDldSales, value: b.sales.toLocaleString("en-AE") } : null,
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <div className="min-h-screen bg-background">
      <BreadcrumbJsonLd items={breadcrumbs} nonce={nonce} />
      {faqs.length > 0 && <FAQJsonLd faqs={faqs} nonce={nonce} />}
      <script type="application/ld+json" nonce={nonce} dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <Navbar />

      {/* ── Hero (image-led: listing → community → gradient) ── */}
      <section className={`relative flex items-end overflow-hidden text-white ${heroImage ? "min-h-[58vh] sm:min-h-[68vh]" : ""}`}>
        {heroImage ? (
          <ImageWithFallback src={heroImage} alt={`${b.name}, ${b.area}`} fill priority sizes="100vw" className="object-cover" />
        ) : (
          <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }} />
        )}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(11,61,46,0.97) 0%, rgba(11,61,46,0.78) 38%, rgba(11,61,46,0.30) 72%, rgba(11,61,46,0.12) 100%)" }} />
        {!heroImage && <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)", backgroundSize: "48px 48px" }} />}
        <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 pt-28 pb-8 sm:pb-12">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs sm:text-sm text-white/70 mb-5">
            <Link href={`${lp}/`} className="hover:text-white transition-colors">{t.home}</Link>
            <ChevronRight className="h-3 w-3 flex-shrink-0 text-white/40" />
            <Link href={`${lp}/search?q=${encodeURIComponent(b.area)}`} className="hover:text-white transition-colors whitespace-nowrap">{b.area}</Link>
            <ChevronRight className="h-3 w-3 flex-shrink-0 text-white/40" />
            <span className="text-white/90 truncate">{b.name}</span>
          </nav>
          <p className="text-accent font-bold tracking-[0.25em] uppercase text-[11px] sm:text-xs mb-3">{t.dldEyebrow}</p>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] mb-3 max-w-3xl">{b.name}</h1>
          <p className="flex items-center gap-2 text-white/85 text-base sm:text-lg mb-7">
            <MapPin className="h-4 w-4 flex-shrink-0" style={{ color: "#D4A847" }} /> {b.area}, {b.city || "Dubai"}{b.masterProject ? ` · ${b.masterProject}` : ""}
          </p>
          {/* Glass stat tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px rounded-2xl overflow-hidden border border-white/20 bg-white/10 backdrop-blur-md max-w-3xl">
            {stats.map((s) => (
              <div key={s.label} className="bg-white/[0.06] px-4 py-4 sm:py-5">
                <s.icon className="h-4 w-4 mb-2" style={{ color: "#D4A847" }} />
                <p className="text-lg sm:text-2xl font-bold tabular-nums leading-none">{s.value}</p>
                <p className="text-[10px] text-white/70 mt-1.5 tracking-[0.08em] uppercase leading-tight">{s.label}</p>
              </div>
            ))}
          </div>
          {/* CTAs */}
          <div className="flex flex-wrap gap-3 mt-6">
            <Link href={`${lp}/search?q=${encodeURIComponent(b.name)}`} className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-white font-semibold text-sm shadow-lg transition-transform hover:-translate-y-0.5" style={{ background: "linear-gradient(135deg, #D4A847, #B8922F)" }}>
              {t.viewListings} <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href={parent ? `${lp}/communities/${communitySlug}` : `${lp}/search?q=${encodeURIComponent(b.area)}`} className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm text-white border border-white/30 bg-white/10 backdrop-blur-md hover:bg-white/20 transition-colors">
              {t.explore} {areaName} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Sticky section sub-nav ── */}
      {navItems.length > 1 && (
        <nav aria-label="Sections" className="sticky top-0 sm:top-16 z-30 bg-background/95 backdrop-blur-md border-b border-border/50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center gap-1 sm:gap-3 overflow-x-auto scrollbar-hide">
            {navItems.map((n) => (
              <a key={n.id} href={`#${n.id}`} className="flex-shrink-0 px-3 sm:px-4 py-3.5 text-sm font-medium text-muted-foreground hover:text-foreground border-b-2 border-transparent hover:border-accent whitespace-nowrap transition-colors">
                {n.label}
              </a>
            ))}
          </div>
        </nav>
      )}

      {/* ── Two-column body ── */}
      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-10 sm:py-12 grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        <div className="lg:col-span-2 space-y-12 min-w-0">
          {/* Overview / narrative */}
          <section id="overview" className="scroll-mt-32">
            <SectionEyebrow eyebrow={t.ebMarketSnapshot} title={t.tNumbers(b.name)} />
            <div className="space-y-4">
              {paras.map((p, i) => (
                <p key={i} className="text-base sm:text-lg text-foreground/85 leading-relaxed">{p}</p>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground mt-5">{t.figuresNote(b.name, b.area, !!yieldPct)}</p>
          </section>

          {/* Price trend */}
          {trendPts.length > 1 && (
            <section id="trend" className="scroll-mt-32">
              <SectionEyebrow eyebrow={t.nav.trend} title={t.tPriceTrend(b.name)} className="mb-3" />
              <p className="text-sm text-muted-foreground mb-5">
                {t.trendDesc(sinceLabel(trend) || "—", smoothed)}
                {changePct != null && (
                  <span className="ml-2 inline-flex items-center gap-1 font-bold" style={{ color: changePct > 0.5 ? "#1A7A5A" : changePct < -0.5 ? "#E53E3E" : "#6B7782" }}>
                    {changePct > 0 ? "+" : ""}{changePct}% <TrendingUp className={`h-3.5 w-3.5 ${changePct < -0.5 ? "rotate-180" : ""}`} />
                  </span>
                )}
              </p>
              <div className="rounded-2xl border border-border/50 bg-card p-4 sm:p-6 shadow-sm">
                <TrendChart points={trendPts} />
              </div>
            </section>
          )}

          {/* Prices by unit type — cards + unit-mix chips */}
          {byBedrooms.length > 0 && (
            <section id="units" className="scroll-mt-32">
              <SectionEyebrow eyebrow={t.nav.units} title={t.tPricesByUnit} />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                {byBedrooms.map((r) => (
                  <div key={r.bedrooms} className="rounded-2xl border border-border/50 bg-card p-4 sm:p-5 hover:border-accent/40 transition-colors">
                    <p className="text-xs font-bold tracking-[0.12em] uppercase text-accent-foreground" style={{ color: "#B8922F" }}>{r.bedrooms === 0 ? t.studio : t.bed(r.bedrooms)}</p>
                    <p className="text-xl sm:text-2xl font-bold text-foreground mt-2 tabular-nums leading-none">{fmtAed(r.avgPrice)}</p>
                    <p className="text-xs text-muted-foreground mt-1.5 tabular-nums">{r.avgPpsf ? `AED ${toSqft(r.avgPpsf).toLocaleString("en-AE")}/sqft` : t.avgSalePrice}</p>
                    <p className="text-[11px] text-muted-foreground mt-3 pt-3 border-t border-border/50">{t.saleCount(r.count.toLocaleString("en-AE"), r.count)}</p>
                  </div>
                ))}
              </div>
              {roomMix.length > 0 && (
                <div className="mt-5 rounded-2xl border border-border/50 bg-gradient-to-b from-card to-muted/20 p-5">
                  <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-accent mb-3">{t.unitMix}</p>
                  <div className="flex flex-wrap gap-2">
                    {roomMix.map((r) => (
                      <span key={r.label} className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border/60 bg-background text-sm">
                        <span className="font-semibold text-foreground">{r.label}</span>
                        <span className="text-muted-foreground tabular-nums">{r.n!.toLocaleString("en-AE")}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Recent transactions */}
          {txns.length > 0 && (
            <section id="transactions" className="scroll-mt-32">
              <SectionEyebrow eyebrow={t.nav.transactions} title={t.tRecentSold} />
              <div className="overflow-x-auto rounded-2xl border border-border/50 shadow-sm">
                <table className="w-full text-sm">
                  <thead className="bg-primary/[0.04] text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3.5 font-semibold">{t.thDate}</th>
                      <th className="px-4 py-3.5 font-semibold">{t.thType}</th>
                      <th className="px-4 py-3.5 font-semibold">{t.thBeds}</th>
                      <th className="px-4 py-3.5 text-right font-semibold">{t.thSize}</th>
                      <th className="px-4 py-3.5 text-right font-semibold">{t.thPrice}</th>
                      <th className="px-4 py-3.5 text-right font-semibold">{t.thPpsf}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {txns.map((t, i) => (
                      <tr key={i} className="odd:bg-muted/20 hover:bg-accent/[0.04] transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{t.transactionDate ? new Date(t.transactionDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "-"}</td>
                        <td className="px-4 py-3">{t.transactionType || t.propertyType || "-"}</td>
                        <td className="px-4 py-3">{t.bedrooms ?? "-"}</td>
                        <td className="px-4 py-3 text-right tabular-nums">{t.size ? Math.round(t.size * 10.764).toLocaleString("en-AE") : "-"}</td>
                        <td className="px-4 py-3 text-right tabular-nums font-semibold text-foreground">{t.amount ? fmtAed(t.amount) : "-"}</td>
                        <td className="px-4 py-3 text-right tabular-nums font-semibold" style={{ color: "#B8922F" }}>{t.pricePerSqft ? `AED ${toSqft(t.pricePerSqft).toLocaleString("en-AE")}` : "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Live inventory */}
          {listings.length > 0 && (
            <section className="scroll-mt-32">
              <SectionEyebrow eyebrow={t.ebLiveInventory} title={t.tAvailableNow(b.name)} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {listings.map((l) => (
                  <Link key={l.slug} href={`${lp}/property/${l.slug}`} className="group block bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-border/50 hover:border-primary/20">
                    <div className="relative overflow-hidden aspect-[4/3]">
                      <ImageWithFallback src={l.featuredImage || "/assets/property-placeholder-v2.webp"} alt={l.title || l.name || b.name} fill sizes="(max-width:768px) 100vw, 50vw" className="object-cover group-hover:scale-105 transition-transform duration-700" />
                      {(l.listingType || l._src) && (
                        <span className="absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-lg text-white uppercase tracking-wider" style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}>
                          {l.listingType === "Rent" || l._src === "rent" ? t.forRent : t.forSale}
                        </span>
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="font-semibold text-sm text-foreground mb-2 line-clamp-1 group-hover:text-primary transition-colors">{l.title || l.name}</h3>
                      <p className="text-sm font-bold text-primary mb-3">{l.price ? `AED ${l.price.toLocaleString("en-AE")}` : t.priceOnRequest}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground border-t border-border pt-3">
                        {l.bedrooms != null && <span className="flex items-center gap-1"><Bed className="h-3 w-3" />{l.bedrooms || t.studio}</span>}
                        {l.bathrooms != null && <span className="flex items-center gap-1"><Bath className="h-3 w-3" />{l.bathrooms}</span>}
                        {l.size ? <span className="flex items-center gap-1"><Maximize className="h-3 w-3" />{l.size.toLocaleString("en-AE")} {l.sizeUnit || "sqft"}</span> : null}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* ── Sidebar ── */}
        <aside className="lg:col-span-1 space-y-5">
          <div className="rounded-2xl border border-border/50 bg-gradient-to-b from-card to-muted/20 p-6">
            <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-accent mb-4">{t.atGlance}</p>
            <dl className="space-y-3 text-sm">
              {glance.map((g) => (
                <div key={g.label} className="flex items-start justify-between gap-4 border-b border-border/40 pb-3 last:border-0 last:pb-0">
                  <dt className="text-muted-foreground flex-shrink-0">{g.label}</dt>
                  <dd className="font-semibold text-foreground text-right">{g.value}</dd>
                </div>
              ))}
            </dl>
            <a href={WA} target="_blank" rel="noopener noreferrer" className="mt-5 flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-transform hover:-translate-y-0.5" style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}>
              <MessageCircle className="h-4 w-4" /> {t.talkAdvisor}
            </a>
          </div>

          <WeeklySubscribeForm source={`building:${slug}`} variant="card" defaultAreas={[communitySlug]} />
        </aside>
      </div>

      {/* ── About the area — parent community's editorial context + guide link ── */}
      {areaAbout && (
        <section className="max-w-6xl mx-auto w-full px-4 sm:px-6 pb-12">
          <div className="rounded-3xl border border-border/50 bg-card p-6 sm:p-8">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] mb-2" style={{ color: "#B8922F" }}>{t.ebAboutArea}</p>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">{t.tIsIn(b.name, areaName)}</h2>
            <p className="text-muted-foreground leading-relaxed max-w-3xl">{areaAbout}</p>
            {parent && (
              <Link href={`${lp}/communities/${communitySlug}`} className="inline-flex items-center gap-1.5 mt-4 text-sm font-semibold text-primary hover:underline">
                {t.exploreGuide(areaName)} <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </section>
      )}

      {/* ── Related buildings ── */}
      {siblings.length > 0 && (
        <section className="max-w-6xl mx-auto w-full px-4 sm:px-6 pb-12">
          <SectionEyebrow eyebrow={t.ebNearby} title={t.tOtherBuildings(b.area)} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {siblings.map((s) => (
              <Link key={s.slug} href={`${lp}/building/${s.slug}`} className="group flex items-center justify-between gap-3 rounded-2xl border border-border/50 bg-card px-5 py-4 hover:border-primary/20 hover:shadow-md transition-all">
                <div className="min-w-0">
                  <p className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">{s.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 tabular-nums">
                    {b.area}{s.sales ? ` · ${s.sales.toLocaleString("en-AE")} ${t.salesWord}` : ""}{s.avgPrice ? ` · ${fmtAed(s.avgPrice)} ${t.avgWord}` : ""}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 flex-shrink-0 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── FAQs ── */}
      {faqs.length > 0 && (
        <section id="faqs" className="max-w-6xl mx-auto w-full px-4 sm:px-6 pb-14 scroll-mt-32">
          <SectionEyebrow eyebrow={t.ebFaq} title={t.tFaq(b.name)} />
          <FaqAccordion faqs={faqs} variant="card" emitJsonLd={false} />
        </section>
      )}

      {/* ── Closing CTA band ── */}
      <section className="relative overflow-hidden text-white" style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}>
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)", backgroundSize: "48px 48px" }} />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-14 sm:py-16 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">{t.considering(b.name)}</h2>
          <p className="text-white/80 mb-8 max-w-xl mx-auto leading-relaxed">{t.ctaBody(b.area)}</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a href={WA} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-7 py-3 rounded-full font-semibold text-sm text-white shadow-lg transition-transform hover:-translate-y-0.5" style={{ background: "linear-gradient(135deg, #D4A847, #B8922F)" }}>
              <MessageCircle className="h-4 w-4" /> {t.talkAdvisor}
            </a>
            <Link href={`${lp}/search?q=${encodeURIComponent(b.area)}`} className="inline-flex items-center gap-2 px-7 py-3 rounded-full font-semibold text-sm text-white border border-white/30 bg-white/10 backdrop-blur-md hover:bg-white/20 transition-colors">
              {t.explore} {b.area} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
