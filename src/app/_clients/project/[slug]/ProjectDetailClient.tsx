"use client";

import { apiUrl } from "@/lib/api";
import { waHref } from "@/lib/whatsapp";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, MapPin, Building2, Calendar, Wallet, Bed, Ruler, Shield,
  Phone, MessageCircle, Mail, ChevronRight, ChevronDown, Play, CheckCircle2,
  Star, Clock, Users, FileText, ExternalLink, Download, Image as ImageIcon,
  Home, Landmark, TrendingUp, CreditCard, Globe, Compass, Waves, X,
  Sparkles, Eye, ArrowRight, HeartPulse,
  TreePine, Store, Tag, Percent,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import AIChatWidget from "@/components/AIChatWidget";
import FloorPlanPlaceholder from "@/components/FloorPlanPlaceholder";
import NextImage from "next/image";
import ImageWithFallback from "@/components/ImageWithFallback";
import { formatPropertyTypeLabel } from "@/lib/property-types";
import { DetailActions } from "@/components/PropertyActions";
import { SubscribeButton } from "@/components/SubscribeButton";
import { ProjectSubscribeSection } from "@/components/ProjectSubscribeSection";
import { AmenitiesSection } from "@/components/AmenitiesSection";
import { DetailBreadcrumb } from "@/components/DetailBreadcrumb";
import { GalleryModal } from "@/components/GalleryModal";
import { StatCard } from "@/components/StatCard";
import { FaqAccordion } from "@/components/FaqAccordion";
import { DetailStickyCta } from "@/components/DetailStickyCta";
import { trackLead } from "@/lib/track";
import { SectionEyebrow } from "@/components/SectionEyebrow";
import { HeroActionRow } from "@/components/HeroActionRow";
import { DetailTabs } from "@/components/DetailTabs";
import { ProjectSeoBlock } from "@/components/ProjectSeoBlock";
import { BUY_COMMUNITIES } from "@/lib/buy-communities";
import { LocationSection } from "@/components/LocationSection";
import { parseNearbyFromDescription, type NearbyItem as ParsedNearbyItem } from "@/lib/parseNearby";
import { SimilarItemsCarousel } from "@/components/SimilarItemsCarousel";
import { useCurrency, CurrencyPrice } from "@/context/CurrencyContext";
const amenitiesPlaceholder = "/assets/amenities-placeholder.webp";
const videoThumbnail = "/assets/video-thumbnail.webp";

/**
 * Build a keyless "classic" Google Maps embed (maps?q=...&output=embed). We use
 * this instead of the Maps Embed API v1, which requires an API key that has the
 * Embed API enabled AND the right HTTP-referrer allowlist — a fragile dependency
 * that was rendering blank maps in production.
 */
function classicMapEmbed(query: string): string {
  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=15&output=embed`;
}

/** Convert any stored Google Maps URL to an embeddable iframe src (keyless). */
function toMapEmbedSrc(rawUrl: string): string {
  if (!rawUrl) return "";
  const url = rawUrl.split(/\s+/)[0]; // strip trailing HTML attributes
  // Already embeddable (classic output=embed or Embed API v1) — use as-is.
  if (url.includes("output=embed") || url.includes("/maps/embed")) return url;
  try {
    const parsed = new URL(url);
    // /maps/search/?api=1&query=lat,lng  or  /maps?q=lat,lng
    const q = parsed.searchParams.get("query") || parsed.searchParams.get("q");
    if (q) return classicMapEmbed(q);
    // /maps/place/PlaceName/@lat,lng/...
    const placeMatch = url.match(/\/place\/([^/@?]+)/);
    if (placeMatch) return classicMapEmbed(decodeURIComponent(placeMatch[1].replace(/\+/g, " ")));
  } catch { /* invalid URL, fall through */ }
  return "";
}
import UnitImagePlaceholder from "@/components/UnitImagePlaceholder";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import CountryCodeSelect from "@/components/CountryCodeSelect";
import { dialFromIso, readGeoCountryCookie } from "@/lib/country-codes";
import BrochureRequestModal from "@/components/BrochureRequestModal";

type NearbyAttraction = { name: string; type: string; distance: string };
type FAQ = { question: string; answer: string };

interface ProjectDetailClientProps {
  serverProject: any;
  // Related projects fetched on the server so their links render in SSR HTML
  // (crawlable). When provided, the client skips the in-browser fetch.
  serverSimilar?: any[];
  defaultTab?: "overview" | "floor-plans" | "location" | "payment" | "faq";
}

const LANGUAGES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "ar", label: "العربية", flag: "🇦🇪" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
];

// Collapse consecutive bedroom types with count ≥ 4 that appear 3+ in a row into "X–Y Bedrooms"
const normalizeBedSuffix = (suffix: string) => {
  const s = suffix.toLowerCase();
  if (s.includes("villa")) return "Bed Villas";
  if (s.includes("townhouse")) return "Bed Townhouse";
  if (s.includes("duplex")) return "Bed Duplex";
  if (s.includes("penthouse")) return "Bed Penthouse";
  if (s.includes("maid")) return "Bed + Maid";
  if (s.includes("study")) return "Bed + Study";
  if (s.includes("pool")) return "Bed + Pool";
  return suffix;
};

const formatUnitTypes = (types: string[], sep = " · ") => {
  if (!types?.length) return "-";
  const groups = new Map<string, number[]>();
  const standalone: string[] = [];
  for (const t of types) {
    const m = t.match(/^(\d+)\s+(.*)/);
    if (m) {
      const bed = parseInt(m[1]);
      const key = normalizeBedSuffix(m[2].trim());
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(bed);
    } else {
      standalone.push(t);
    }
  }
  const out: string[] = [];
  for (const [key, beds] of groups) {
    beds.sort((a, b) => a - b);
    const min = beds[0], max = beds[beds.length - 1];
    out.push(min === max ? `${min} ${key}` : `${min}-${max} ${key}`);
  }
  out.push(...standalone);
  return out.join(sep);
};

const attractionIcon = (type: string) => {
  const t = type?.toLowerCase() || "";
  if (t.includes("beach") || t.includes("marina")) return Waves;
  if (t.includes("mall") || t.includes("retail")) return Home;
  if (t.includes("airport")) return Globe;
  if (t.includes("landmark")) return Landmark;
  if (t.includes("park") || t.includes("garden")) return Compass;
  if (t.includes("transport") || t.includes("metro")) return ArrowRight;
  return MapPin;
};


const ProjectDetailClient = ({ serverProject, serverSimilar, defaultTab }: ProjectDetailClientProps) => {
  const t = useTranslations("projectDetail");
  const tCommon = useTranslations("common");
  const tE = useTranslations("enums");
  const tEnum = (v: string | undefined | null) => {
    if (!v) return "";
    const key = v.toString().trim().toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().split(/\s+/).map((w, i) => i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1)).join("");
    if (!key) return v;
    try { const out = tE(key as any); return out && out !== key ? out : v; } catch { return v; }
  };
  const tBed = (raw: string | undefined | null) => {
    if (!raw) return "";
    const s = raw.trim();
    if (/^studio$/i.test(s)) return tEnum("Studio");
    const m = s.match(/^(\d+)\s*\+?\s*(?:bedroom|br|bed)s?$/i);
    if (!m) return raw;
    try { return tE("bedroomCount", { count: parseInt(m[1], 10) } as any); } catch { return raw; }
  };
  const project = {
    ...serverProject,
    unitTypes: Array.isArray(serverProject.unitTypes) ? serverProject.unitTypes : [],
    propertyTypes: Array.isArray(serverProject.propertyTypes) && serverProject.propertyTypes.length > 0
      ? serverProject.propertyTypes
      : Array.isArray(serverProject.propertyType) && serverProject.propertyType.length > 0
        ? serverProject.propertyType
        : typeof serverProject.propertyType === "string" && serverProject.propertyType.includes(",")
          ? serverProject.propertyType.split(",").map((s: string) => s.trim()).filter(Boolean)
          : [],
  };
  const [activeImage, setActiveImage] = useState(0);
  const [descExpanded, setDescExpanded] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "floor-plans" | "location" | "payment" | "faq">(defaultTab ?? "overview");
  const { currency, setCurrency, format: formatPrice, rates: CURRENCY_RATES } = useCurrency();
  // priceRange is a freeform DB string (often "From AED 799,999"); localize a leading English
  // "From"/"Starting from" prefix to the active locale while keeping the per-project amount.
  const priceRangeLabel = (() => {
    const pr = (project.priceRange || "").trim();
    if (!pr) return "";
    const stripped = pr.replace(/^(starting\s+from|from)\s+/i, "").trim();
    return stripped !== pr ? `${t("startingFrom")} ${stripped}` : pr;
  })();
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [activeUnitTab, setActiveUnitTab] = useState(0);
  const [activeFloorPlanTab, setActiveFloorPlanTab] = useState(() => {
    const fps = Array.isArray(serverProject.floorPlans) ? serverProject.floorPlans : [];
    // Exact match on beds field first; then title prefix "1 " / "1BR" / "1 BR"
    const firstOneBR = fps.findIndex((fp: any) =>
      String(fp.beds ?? "").trim() === "1" ||
      /^1\s*(br|bed)/i.test(String(fp.title ?? ""))
    );
    return firstOneBR >= 0 ? firstOneBR : 0;
  });
  const [activePropertyType, setActivePropertyType] = useState<string>(() => project.propertyTypes?.[0] ?? "");
  const [enquiryForm, setEnquiryForm] = useState({ name: "", email: "", phone: "", countryCode: "+971", unitType: "", message: "", contactMethod: "whatsapp" as "whatsapp" | "email" | "phone" });
  const [enquirySubmitted, setEnquirySubmitted] = useState(false);
  const [enquirySending, setEnquirySending] = useState(false);
  const [enquiryError, setEnquiryError] = useState(false);
  const [brochureModalOpen, setBrochureModalOpen] = useState(false);
  // Seed from the server-fetched related projects so their links are present in
  // the SSR HTML (crawlable internal links). Show up to 6 for a richer graph.
  const [similarProjects, setSimilarProjects] = useState<Array<{ _id: string; name: string; slug: string; community?: string; status?: string; startingPrice?: number; featuredImage?: string }>>(
    Array.isArray(serverSimilar)
      ? serverSimilar.filter((p) => p?.slug && p.slug !== serverProject.slug).slice(0, 6)
      : []
  );

  // Fallback only: if the server didn't supply related projects, fetch them in
  // the browser (same params the server uses). When SSR already provided them,
  // skip the request entirely so the crawlable links stay stable.
  useEffect(() => {
    if (Array.isArray(serverSimilar) && serverSimilar.length > 0) return;
    const params = new URLSearchParams();
    if (project.community) params.set("community", project.community);
    else if (project.developerName) params.set("q", project.developerName);
    if (project.slug) params.set("exclude", project.slug);
    params.set("limit", "6");
    fetch(apiUrl(`/api/projects?${params.toString()}`))
      .then((r) => r.ok ? r.json() : [])
      .then((arr: any[]) => {
        const filtered = (Array.isArray(arr) ? arr : [])
          .filter((p) => p.slug && p.slug !== project.slug)
          .slice(0, 6);
        setSimilarProjects(filtered);
      })
      .catch(() => setSimilarProjects([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project.community, project.developerName, project.slug]);

  // Seed the country code from the geo cookie (set by middleware from
  // Vercel's x-vercel-ip-country). Only fires once on mount and only if the
  // user hasn't already typed a phone — never override an active edit.
  useEffect(() => {
    const dial = dialFromIso(readGeoCountryCookie());
    if (dial && dial !== "+971") {
      setEnquiryForm((f) => (f.phone ? f : { ...f, countryCode: dial }));
    }
  }, []);
  const [showMoreEnquiry, setShowMoreEnquiry] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [origin, setOrigin] = useState("");
  const [developerStats, setDeveloperStats] = useState<{
    projectsDelivered: number | null;
    foundedYear: number | null;
    totalUnits: number | null;
  }>({ projectsDelivered: null, foundedYear: null, totalUnits: null });

  useEffect(() => {
    const slug = project.developerSlug || (project.developerName ? project.developerName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") : "");
    if (!slug) return;
    fetch(apiUrl(`/api/developers/${slug}`))
      .then(r => r.ok ? r.json() : null)
      .then((data: any) => {
        if (!data?.developer) return;
        setDeveloperStats({
          projectsDelivered: Array.isArray(data.projects) ? data.projects.length : null,
          foundedYear: data.developer.foundedYear ?? null,
          totalUnits: data.developer.totalUnits ?? null,
        });
      })
      .catch(() => {});
  }, [project.developerSlug, project.developerName]);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  // Every WhatsApp CTA on the project page appends the project URL for the agent
  // (lead attribution). Uses the project's own number when set, else the company.
  const projectUrl = origin ? `${origin}/project/${project.slug}` : undefined;
  const projectWaNumber = project.whatsappNumber?.trim() || project.contactPhone?.trim() || "+971549988811";
  const waLink = (message: string) => waHref(message, projectUrl, projectWaNumber);

  const handleTabChange = (id: "overview" | "floor-plans" | "location" | "payment" | "faq") => {
    setActiveTab(id);
    const tabUrls: Record<typeof id, string> = {
      "overview":    `/project/${project.slug}`,
      "floor-plans": `/project/${project.slug}/floor-plans`,
      "location":    `/project/${project.slug}/location`,
      "payment":     `/project/${project.slug}/payment-plan`,
      "faq":         `/project/${project.slug}/faq`,
    };
    window.history.replaceState({}, "", tabUrls[id]);
  };

  // QR code link: real permit document URL if present, otherwise the project page.
  const qrUrl = project.permitUrl || (origin ? `${origin}/project/${project.slug}` : `/project/${project.slug}`);
  // If permitUrl points to a real document (PDF or external regulator page),
  // we open it directly on click instead of showing the larger-QR modal.
  const hasDirectPermit = Boolean(project.permitUrl);
  // QR source: 3-tier fallback. Prefer the real regulator-issued QR, then the
  // dummy QR placeholder image. If neither exists we show NO QR — the UI renders
  // a "for information only" compliance notice instead of a misleading permit.
  const hasRealQr = Boolean(project.qrCode && project.qrCode.startsWith("http"));
  const hasDummyQr = Boolean(project.dummyQrCode && project.dummyQrCode.startsWith("http"));
  const hasStoredQr = hasRealQr || hasDummyQr;
  const qrSrc = hasRealQr ? project.qrCode : hasDummyQr ? project.dummyQrCode : "";

  // Sub-page H1 suffix — tracks activeTab so it clears when the user switches
  // to Overview after arriving on a sub-page URL (defaultTab would stay stale).
  const h1Suffix: string | null =
    activeTab === "floor-plans" ? t("floorPlansLabel")
    : activeTab === "location"   ? t("locationLabel")
    : activeTab === "payment"    ? t("paymentPlanLabel")
    : activeTab === "faq"        ? t("faqLabel")
    : null;

  // ── Canonical payment plan — ONE ordered source of truth used everywhere on
  //    the page (stat card, overview timeline, payment tab, summary chips) so the
  //    structure is consistent. Ordered Down → During → Handover → Post Handover.
  //    paymentPlanSummary (e.g. a stale "65/35") is only a last-resort fallback. ──
  const orderedPaymentSteps: { title: string; pct: number }[] = (() => {
    const raw = Array.isArray(project.paymentPlanSteps) ? project.paymentPlanSteps : [];
    const steps = raw
      .map((s: any) => ({ title: String(s?.title || ""), pct: parseInt(String(s?.percentage ?? "").replace(/[^0-9]/g, "")) || 0 }))
      .filter((s) => s.pct > 0);
    const rank = (title: string) => {
      const x = title.toLowerCase();
      if (x.includes("down") || x.includes("booking")) return 0;
      if (x.includes("during") || x.includes("construction")) return 1;
      if (x.includes("post")) return 3;
      if (x.includes("handover") || x.includes("completion")) return 2;
      return 1.5;
    };
    return steps.sort((a, b) => rank(a.title) - rank(b.title));
  })();
  const paymentPlanPretty: string | null =
    orderedPaymentSteps.length > 0
      ? orderedPaymentSteps.map((s) => s.pct).join(" - ") + "%"
      : project.paymentPlanSummary && project.paymentPlanSummary !== "TBA"
      ? String(project.paymentPlanSummary)
      : null;

  // ── Entity interlink targets — only set when the destination page exists,
  //    so we never emit a link to a 404 (builds the topical graph for SEO). ──
  const interlinkDevSlug = project.developerSlug
    || (project.developerName ? String(project.developerName).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") : "");
  const interlinkDeveloperHref = interlinkDevSlug ? `/developers/${interlinkDevSlug}` : undefined;
  const interlinkPtype = String(
    Array.isArray(project.propertyType) ? project.propertyType[0] : (project.propertyType || project.propertyTypes?.[0] || "")
  ).toLowerCase();
  const interlinkTypeSlug = /apartment|flat|studio/.test(interlinkPtype) ? "apartments"
    : /townhouse/.test(interlinkPtype) ? "townhouses"
    : /villa/.test(interlinkPtype) ? "villas"
    : "";
  const interlinkTypeHref = interlinkTypeSlug ? `/off-plan/${interlinkTypeSlug}` : undefined;
  const interlinkCommunity = BUY_COMMUNITIES.find(
    (c) => c.name.toLowerCase() === String(project.community || "").toLowerCase()
  );
  const interlinkCommunityHref = interlinkCommunity ? `/off-plan-in/${interlinkCommunity.slug}` : undefined;

  const leadEntity = { entityType: "project", entitySlug: project.slug, entityTitle: project.name };

  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (enquirySending) return;
    setEnquirySending(true);
    setEnquiryError(false);
    try {
      const res = await fetch(apiUrl("/api/inquiries"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: enquiryForm.name,
          email: enquiryForm.email,
          phone: `${enquiryForm.countryCode} ${enquiryForm.phone}`,
          type: "project-enquiry",
          message: enquiryForm.message || `Interested in ${project.name}. Please share pricing and availability.`,
          source: `project-detail:${project.slug}`,
          unitType: enquiryForm.unitType,
          contactMethod: enquiryForm.contactMethod,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setEnquirySubmitted(true);
      setEnquiryForm({ name: "", email: "", phone: "", countryCode: "+971", unitType: "", message: "", contactMethod: "whatsapp" });
    } catch {
      setEnquiryError(true);
    } finally {
      setEnquirySending(false);
    }
  };





  const galleryUrls = (project.imageGallery || [])
    .map((item: any) => (typeof item === "object" && item.url ? item.url : item))
    .filter(Boolean);
  const images: string[] = galleryUrls.length
    ? galleryUrls
    : project.featuredImage
      ? [project.featuredImage]
      : ["/assets/amenities-placeholder.webp"];
  // Priority: 1) DB nearbyAttractions  2) parsed from locationDescription  3) empty
  const nearby: NearbyAttraction[] = (() => {
    const db = (project.nearbyAttractions as NearbyAttraction[] | null) || [];
    if (db.length > 0) return db;
    const parsed = parseNearbyFromDescription(project.locationDescription as string | undefined);
    if (parsed.length > 0) return parsed as unknown as NearbyAttraction[];
    return [];
  })();
  const dbFaqs = ((project.faqs as FAQ[] | null) || []).filter(f => f.question?.trim());
  const faqs = dbFaqs.length > 0 ? dbFaqs : [
    { question: `What is the starting price of ${project.name}?`, answer: project.startingPrice ? `${project.name} starts from ${project.currency || "AED"} ${(project.startingPrice < 1_000 ? project.startingPrice * 1_000_000 : project.startingPrice).toLocaleString("en-AE")}. Prices vary by unit type and floor. Contact us for the latest pricing and availability.` : `Please contact our team for the current pricing of ${project.name}. We'll share the latest price list and available units.` },
    { question: `What floor plans are available at ${project.name}?`, answer: `${project.name} offers ${Array.isArray(project.unitTypes) && project.unitTypes.length > 0 ? project.unitTypes.join(", ") : "a range of unit types"}. Detailed floor plans with dimensions are available on request, contact us via WhatsApp or the inquiry form above.` },
    { question: `Who is the developer of ${project.name}?`, answer: project.developerName ? `${project.name} is developed by ${project.developerName}, a leading real estate developer in Dubai. ${project.developerDescription ? project.developerDescription.slice(0, 120) + "…" : ""}` : `Please contact our team for developer information about ${project.name}.` },
    { question: `When is the handover date for ${project.name}?`, answer: project.completionDate ? `The expected handover date for ${project.name} is ${project.completionDate}. Timelines are subject to construction progress and regulatory approvals.` : `Please contact our team for the latest handover timeline for ${project.name}.` },
    { question: `What is the payment plan for ${project.name}?`, answer: project.paymentPlanSummary && project.paymentPlanSummary !== "TBA" ? project.paymentPlanSummary : `${project.name} offers a flexible payment plan designed for both end-users and investors, typically including a down payment on booking, installments during construction, and the balance on handover. Contact us for the full schedule.` },
    { question: `Is ${project.name} eligible for UAE Golden Visa?`, answer: `Yes, purchasing a property at ${project.name} valued at AED 2 million or above qualifies for the UAE Golden Visa, granting 10-year renewable residency. Our team can guide you through the application process.` },
    { question: `Where is ${project.name} located?`, answer: project.community ? `${project.name} is located in ${project.community}, ${project.city || "Dubai"}, ${project.country || "UAE"}. ${project.locationDescription ? project.locationDescription.slice(0, 150) + "…" : ""}` : `${project.name} is located in ${project.city || "Dubai"}, UAE. Contact us for detailed location and transport information.` },
    { question: "Is mortgage financing available?", answer: "Yes, mortgage financing is available through major UAE banks for both residents and non-residents. Typical loan-to-value ratios range from 50-80% depending on residency status. We can connect you with our banking partners for pre-approval." },
  ];
  const hasPaymentInfo = project.downPayment || project.paymentPlanSummary || project.paymentPlanDetails;

  const projectStatus = (project.status || "").toLowerCase();
  const isRentalProject = /rent/i.test(projectStatus);
  const isReadyProject  = /ready|complet/i.test(projectStatus);
  const parentBreadcrumb = isRentalProject
    ? { label: t("breadcrumbRent"),    href: "/rent" }
    : isReadyProject
      ? { label: t("breadcrumbBuy"),   href: "/buy" }
      : { label: t("breadcrumbOffPlan"), href: "/off-plan" };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />

      {/* ── BREADCRUMB (below navbar, above hero) ───────────────────────── */}
      <DetailBreadcrumb
        items={[
          { label: t("breadcrumbHome"), href: "/" },
          parentBreadcrumb,
          { label: project.name },
        ]}
      />

      {/* ───── HERO SECTION ───── */}
      <section className="relative">
        {/* Full-width hero image */}
        <div className="relative h-[50vh] sm:h-[65vh] lg:h-[70vh] overflow-hidden">
          {/* Mobile: horizontal scroll carousel */}
          <div className="sm:hidden w-full h-full overflow-x-auto snap-x snap-mandatory scrollbar-hide flex"
            onScroll={(e) => {
              const el = e.currentTarget;
              const idx = Math.round(el.scrollLeft / el.clientWidth);
              if (idx !== activeImage) setActiveImage(idx);
            }}
          >
            {images.map((img, i) => (
              <div key={i} className="relative w-full h-full flex-shrink-0 snap-center overflow-hidden"
                onClick={() => { setActiveImage(i); setShowGallery(true); }}
              >
                <ImageWithFallback
                  src={img}
                  alt={`${project.name} ${i + 1}`}
                  fill
                  sizes="100vw"
                  className="object-cover object-center"
                  priority={i === 0}
                />
              </div>
            ))}
          </div>
          {/* Mobile image counter */}
          <div className="sm:hidden absolute bottom-5 right-4 z-30 bg-black/60 backdrop-blur-sm text-white text-[13px] font-bold px-3 py-1 rounded-lg tracking-wide">
            {activeImage + 1}/{images.length}
          </div>
          {/* Desktop: single image */}
          <div className="hidden sm:block w-full h-full cursor-pointer" onClick={() => setShowGallery(true)}>
            <ImageWithFallback
              key={activeImage}
              src={images[activeImage]}
              alt={project.name}
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
          </div>

          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/15 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/15 to-transparent pointer-events-none" />

          {/* Hero content at bottom */}
          <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-6 sm:pb-8">
              <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3 sm:gap-6">
                {/* Left: Project info */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="pointer-events-auto flex-shrink-0"
                >
                  {/* Badges */}
                  <div className="flex items-center gap-1.5 mb-2 sm:mb-2">
                    <span
                      className="px-3 py-1 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold shadow-lg text-white"
                      style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
                    >
                      {tEnum(project.status)}
                    </span>
                    <span className="px-3 py-1 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold bg-white/15 backdrop-blur-md text-white border border-white/20 shadow-lg">
                      {(Array.isArray(project.propertyType) ? project.propertyType : [project.propertyType]).filter(Boolean).map((p: string) => tEnum(p)).join(" · ")}
                    </span>
                  </div>
                  {/* Developer name – hidden on mobile */}
                  <p className="hidden sm:flex text-white text-xs sm:text-sm font-medium mb-0.5 sm:mb-1 items-center gap-1.5">
                    {t("byDeveloper")} <span className="text-white font-semibold">{project.developerName}</span>
                  </p>
                  {/* Project title */}
                  <h1 className="text-[22px] sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-[1.15]">
                    {project.name}
                    {h1Suffix && (
                      <span className="block text-base sm:text-2xl lg:text-3xl font-semibold text-white/75 mt-1 tracking-normal">
                        {h1Suffix}
                      </span>
                    )}
                  </h1>
                  {/* Location with QR — only render if a regulator-issued QR image is stored in MongoDB */}
                  <div className="flex items-center gap-2 sm:gap-3 mt-1.5 sm:mt-3">
                    {hasStoredQr && (
                      hasDirectPermit ? (
                        <a
                          href={qrUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-white/90 p-0.5 shadow-sm hover:shadow-md active:scale-95 transition-all flex-shrink-0"
                          title={t("regulatoryPermit")}
                          aria-label={t("regulatoryPermit")}
                        >
                          <NextImage
                            src={qrSrc}
                            alt="Regulatory Permit QR"
                            width={80}
                            height={80}
                            unoptimized
                            className="w-full h-full rounded-sm"
                          />
                        </a>
                      ) : (
                        <button
                          onClick={() => setShowQrModal(true)}
                          className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-white/90 p-0.5 shadow-sm hover:shadow-md active:scale-95 transition-all cursor-pointer flex-shrink-0"
                          title="Regulatory Permit"
                        >
                          <NextImage
                            src={qrSrc}
                            alt="Regulatory Permit QR"
                            width={80}
                            height={80}
                            unoptimized
                            className="w-full h-full rounded-sm"
                          />
                        </button>
                      )
                    )}
                    <p className="text-white/80 flex items-center gap-1.5 text-[12px] sm:text-base">
                      <MapPin className="h-3.5 w-3.5 text-accent flex-shrink-0" />
                      <span>{project.community}, {project.city}, {project.country}</span>
                    </p>
                  </div>
                  {/* Save / Share / Subscribe (shared component) */}
                  <HeroActionRow
                    slug={project.slug}
                    title={project.name}
                    type="project"
                    subscribable
                    projectImage={project.featuredImage || project.images?.[0] || null}
                  />
                </motion.div>

                {/* Right: Price above thumbnails (desktop only) */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className="hidden sm:flex flex-col items-start lg:items-end gap-2 sm:gap-3 pointer-events-auto flex-shrink-0"
                >
                  <div className="flex flex-col gap-0.5 lg:items-end">
                    {project.startingPrice ? <span className="hidden sm:inline text-white/70 text-[11px] sm:text-xs uppercase tracking-widest font-semibold">{t("startingFrom")}</span> : null}
                    <CurrencyPrice aedPrice={project.startingPrice} opts={{ isProject: true }} className="text-xl sm:text-3xl lg:text-4xl font-bold text-white" />
                  </div>

                  {images.length > 1 && (
                    <div className="hidden lg:flex gap-2 items-end">
                      {images.slice(0, 4).map((img, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveImage(i)}
                          className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                            i === activeImage
                              ? "border-accent shadow-lg shadow-accent/20 scale-110"
                              : "border-white/20 opacity-70 hover:opacity-100 hover:border-white/50"
                          }`}
                        >
                          <ImageWithFallback src={img} alt="" fill sizes="64px" className="object-cover" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Watch Tour + Photos + Brochure inline */}
                  <div className="hidden sm:flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => setShowGallery(true)}
                      className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold text-white transition-all shadow-lg hover:shadow-xl hover:scale-[1.02]"
                      style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
                    >
                      <ImageIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> {t("gallery")}
                    </button>
                    <button
                      type="button"
                      onClick={() => setBrochureModalOpen(true)}
                      className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold text-white transition-all shadow-lg hover:shadow-xl hover:scale-[1.02]"
                      style={{ background: "linear-gradient(135deg, #D4A847, #B8922F)" }}
                    >
                      <Download className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> {t("brochureButton")}
                    </button>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Gallery + Brochure buttons — moved out of hero */}
      <div className="sm:hidden px-4 py-3 flex gap-2 items-center">
        <button
          onClick={() => setShowGallery(true)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-full text-[12px] font-bold text-white shadow-md active:scale-[0.97] transition-all"
          style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
        >
          <ImageIcon className="h-3.5 w-3.5" /> {t("galleryButton")} ({images.length})
        </button>
        <button
          type="button"
          onClick={() => setBrochureModalOpen(true)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-full text-[12px] font-bold text-white shadow-md active:scale-[0.97] transition-all"
          style={{ background: "linear-gradient(135deg, #D4A847, #B8922F)" }}
        >
          <Download className="h-3.5 w-3.5" /> {t("brochureButton")}
        </button>
      </div>

      {/* ───── QUICK STATS CARDS ───── */}
      <section className="py-4 sm:py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-2.5 sm:gap-3">
            {(() => {
              // Match all ready-state variants used across the data set:
              // "Ready", "Completed", "Ready to Move", "Ready To Move",
              // "Ready to Move-in", "Move-in Ready", etc. Treating any of
              // these as off-plan made the page show a stale "handover
              // date" instead of the actual ready status.
              const isReady = /ready|complet/i.test(project.status || "");
              const handoverValue = isReady
                ? "Ready to Move In"
                : project.completionDate
                  ? (() => { const d = new Date(project.completionDate); return isNaN(d.getTime()) ? project.completionDate : d.toLocaleDateString("en-GB", { month: "short", year: "numeric" }); })()
                  : "TBA";
              const handoverIcon = isReady ? CheckCircle2 : Calendar;

              const sqftToSqm = (sqft: number) => Math.round(sqft * 0.0929);
              const sizeValue = project.unitSizeMin && project.unitSizeMax
                ? `${Number(project.unitSizeMin).toLocaleString()} - ${Number(project.unitSizeMax).toLocaleString()} sqft`
                : "-";
              const sizeSub = project.unitSizeMin && project.unitSizeMax
                ? `${sqftToSqm(Number(project.unitSizeMin)).toLocaleString()} - ${sqftToSqm(Number(project.unitSizeMax)).toLocaleString()} sqm`
                : null;
              const currencyKeys = Object.keys(CURRENCY_RATES);

              // Skip cards with no real data so the grid doesn't show "—" placeholders.
              const unitTypesValue = formatUnitTypes(project.unitTypes, " · ");
              const hasSizeRange = project.unitSizeMin && project.unitSizeMax;

              // Payment card uses the canonical ordered plan (see orderedPaymentSteps above).
              const paymentCardValue = paymentPlanPretty
                || (project.downPayment ? `${String(project.downPayment).replace(/%/g, "")}% Down` : null);
              const paymentCardSub = orderedPaymentSteps.length > 0 ? t("paymentPlanDefaultDesc") : null;
              const hasPaymentData = !!paymentCardValue;

              const stats = [
                project.developerName && { icon: Building2, label: t("developer"), value: project.developerName, sub: null },
                project.startingPrice && { icon: Wallet, label: t("startingPrice"), value: formatPrice(project.startingPrice, { isProject: true }), sub: null, isCurrency: true },
                unitTypesValue && unitTypesValue !== "-" && { icon: Bed, label: t("unitTypes"), value: unitTypesValue, sub: null },
                hasSizeRange && { icon: Ruler, label: t("sizeRange"), value: sizeValue, sub: sizeSub },
                (isReady || project.completionDate) && { icon: handoverIcon, label: isReady ? t("status") : t("handover"), value: handoverValue, sub: null },
                hasPaymentData && { icon: CreditCard, label: t("paymentPlanLabel"), value: paymentCardValue!, sub: paymentCardSub, isPaymentPlan: true },
              ].filter(Boolean) as Array<{ icon: React.ElementType; label: string; value: string; sub: string | null; isCurrency?: boolean; isPaymentPlan?: boolean }>;

              return stats.map(({ icon: StatIcon, label, value, sub, isCurrency }, idx) => {
                const rightSlot = isCurrency ? (
                  <div className="relative">
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowCurrencyDropdown(!showCurrencyDropdown); }}
                      className="flex items-center gap-1 text-[10px] font-bold text-accent border border-accent/30 bg-accent/5 px-2 py-1 rounded-lg shadow-sm hover:bg-accent/10 transition-colors"
                    >
                      {currency}
                      <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${showCurrencyDropdown ? "rotate-180" : ""}`} />
                    </button>
                    <AnimatePresence>
                      {showCurrencyDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: -4, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -4, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 top-full mt-1.5 bg-card border border-border/60 rounded-xl shadow-lg z-50 min-w-[100px] overflow-hidden backdrop-blur-xl"
                        >
                          {currencyKeys.map((c) => (
                            <button
                              key={c}
                              onClick={(e) => { e.stopPropagation(); setCurrency(c); setShowCurrencyDropdown(false); }}
                              className={`w-full text-left px-3 py-2 text-[11px] font-semibold transition-colors ${c === currency ? "bg-accent/10 text-accent" : "text-foreground/70 hover:bg-muted/60 hover:text-foreground"}`}
                            >
                              {c}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : undefined;

                return (
                  <StatCard
                    key={label}
                    icon={StatIcon}
                    label={label}
                    value={value}
                    sub={sub ?? undefined}
                    rightSlot={rightSlot}
                    delay={0.05 * idx + 0.2}
                  />
                );
              });
            })()}
          </div>
        </div>
      </section>

      {/* ───── MAIN CONTENT ───── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-10 lg:gap-12">

          {/* ═══ LEFT COLUMN ═══ */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-8">

            {/* Tab Navigation (shared component) */}
            <DetailTabs<typeof activeTab>
              animate
              active={activeTab}
              onChange={handleTabChange}
              tabs={[
                { id: "overview",    label: t("tabOverview") },
                { id: "floor-plans", label: t("floorPlansLabel") },
                { id: "location",    label: t("tabLocation") },
                { id: "payment",     label: t("tabPayment") },
                { id: "faq",         label: t("tabFaq") },
              ]}
            />

            {/* Unique per-sub-page SEO copy. Follows the visible tab (activeTab),
                not the landing tab — tab switching uses history.replaceState (no
                re-render), so keying off defaultTab left stale copy (e.g. floor-
                plan text on the Payment tab). On SSR activeTab === defaultTab, so
                each URL still renders its own distinct content for SEO. */}
            {activeTab !== "overview" && (
              <ProjectSeoBlock project={project} tab={activeTab} paymentPlanLabel={paymentPlanPretty} />
            )}

            {/* ─── OVERVIEW TAB ─── */}
            <AnimatePresence mode="wait">
              {activeTab === "overview" && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4 sm:space-y-8"
                >
                  {/* Overview */}
                  <div className="space-y-4">
                    <SectionEyebrow
                      eyebrow={t("aboutTheProject")}
                      title={t("projectOverview")}
                      className=""
                    />
                    {(() => {
                      const isPlaceholder = (s?: string) =>
                        !s || /^update\s+soon\b/i.test(s.trim()) || s.trim().length < 12;
                      const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
                      // Strip WordPress cache-plugin boilerplate scraped into descriptions
                      // (e.g. "Note: None of these options will be applied if this post has
                      // been excluded from cache in the global cache settings.").
                      const stripJunk = (s: string) =>
                        s
                          .replace(/Note:\s*None of these options[^.]*\.?/gi, "")
                          .replace(/^.*\b(?:excluded from cache|global cache settings|none of these options will be applied)\b.*$/gim, "")
                          .replace(/[ \t]{2,}/g, " ")
                          .replace(/\n{3,}/g, "\n\n")
                          .trim();
                      const shortClean = stripJunk((project.shortOverview || "").trim());
                      // Keep newlines (structure) — only collapse runs of spaces/tabs.
                      const fullClean = stripJunk(
                        (project.fullDescription || "")
                          .replace(/<[^>]*>/g, " ")
                          .replace(/\r/g, "")
                          .replace(/[ \t]{2,}/g, " ")
                          .trim()
                      );
                      const showShort = !isPlaceholder(shortClean);
                      const showFull = !isPlaceholder(fullClean);
                      // The full description usually opens with the same text as the short overview.
                      // Render the richest text we have as the body; only show the curated short
                      // overview as a separate lead when the full body doesn't already include it.
                      const fullStartsWithShort =
                        showShort && showFull && norm(fullClean).startsWith(norm(shortClean));
                      const body = showFull ? fullClean : showShort ? shortClean : "";
                      const lead = showFull && showShort && !fullStartsWithShort ? shortClean : "";
                      if (!body) return null;

                      // Parse the body into typed blocks: section headers (h), bullet lists (ul),
                      // and paragraphs (p). Headers are short lines with no terminal punctuation.
                      type Block =
                        | { type: "h"; text: string }
                        | { type: "p"; text: string }
                        | { type: "ul"; items: string[] };
                      const blocks: Block[] = [];
                      for (const line of body.split(/\n+/).map((l) => l.trim()).filter(Boolean)) {
                        const bullet = line.match(/^[-•·▪*]\s+(.+)$/);
                        if (bullet) {
                          const last = blocks[blocks.length - 1];
                          if (last && last.type === "ul") last.items.push(bullet[1].trim());
                          else blocks.push({ type: "ul", items: [bullet[1].trim()] });
                          continue;
                        }
                        const isHeader =
                          line.split(/\s+/).length <= 6 && line.length <= 60 && !/[.!?:,;]$/.test(line);
                        blocks.push({ type: isHeader ? "h" : "p", text: line });
                      }
                      // No structure (one long paragraph)? Chunk it into ~3-sentence paragraphs so
                      // there's still something to collapse. Unicode-aware for RU/AR/ZH/HE/VI.
                      if (blocks.length === 1 && blocks[0].type === "p") {
                        const sentences = blocks[0].text
                          .split(/(?<=[.!?。！？])\s+(?=[\p{Lu}\p{Lo}])/u)
                          .filter(Boolean);
                        if (sentences.length > 3) {
                          blocks.length = 0;
                          for (let i = 0; i < sentences.length; i += 3)
                            blocks.push({ type: "p", text: sentences.slice(i, i + 3).join(" ") });
                        }
                      }

                      const hasMore = blocks.length > 1;
                      const renderBlock = (b: Block, key: number, prominent = false) => {
                        if (b.type === "h")
                          return (
                            <h3 key={key} className="text-base sm:text-lg font-bold text-foreground mt-4 first:mt-0">
                              {b.text}
                            </h3>
                          );
                        if (b.type === "ul")
                          return (
                            <ul key={key} className="list-disc pl-5 space-y-1 text-sm sm:text-base text-muted-foreground">
                              {b.items.map((it, i) => (
                                <li key={i}>{it}</li>
                              ))}
                            </ul>
                          );
                        return (
                          <p
                            key={key}
                            className={
                              prominent
                                ? "text-base sm:text-lg text-foreground/90 leading-relaxed font-medium"
                                : "text-sm sm:text-base text-muted-foreground leading-relaxed"
                            }
                          >
                            {b.text}
                          </p>
                        );
                      };

                      return (
                        <div className="space-y-3">
                          {lead && (
                            <p className="text-base sm:text-lg text-foreground/90 leading-relaxed font-medium">
                              {lead}
                            </p>
                          )}
                          {blocks.length > 0 &&
                            renderBlock(blocks[0], 0, !lead && blocks[0].type === "p")}

                          {descExpanded && blocks.slice(1).map((b, i) => renderBlock(b, i + 1))}

                          {hasMore && (
                            <button
                              type="button"
                              onClick={() => setDescExpanded((v) => !v)}
                              className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors mt-1"
                            >
                              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${descExpanded ? "rotate-180" : ""}`} />
                              {descExpanded ? t("readLess") : t("readMore")}
                            </button>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  {/* ─── EXCLUSIVE OFFERS ─── */}
                  {(project.offers?.length ?? 0) > 0 && (() => {
                    const offerIcons = (desc: string, title: string) => {
                      const s = (desc + " " + title).toLowerCase();
                      if (s.includes("payment") || s.includes("plan") || s.includes("50/50") || s.includes("installment")) return CreditCard;
                      if (s.includes("discount") || s.includes("fee") || s.includes("waiver") || s.includes("%")) return Percent;
                      return Tag;
                    };
                    return (
                    <div className="space-y-5">
                      {/* Section header */}
                      <div>
                        <div className="h-[2px] w-8 rounded-full bg-gradient-to-r from-accent to-accent/60 mb-3" />
                        <div className="flex items-center gap-2 mb-1">
                          <Sparkles className="h-3.5 w-3.5 text-accent" />
                          <p className="text-[10px] uppercase tracking-[0.25em] font-semibold text-accent">{t("limitedTime")}</p>
                        </div>
                        <h3 className="text-lg sm:text-2xl font-bold text-foreground">{t("exclusiveOffers")}</h3>
                      </div>

                      {/* Offer cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                        {(project.offers as { title: string; description?: string; badge?: string }[]).slice(0, 3).map((offer, idx) => {
                          const OfferIcon = offerIcons(offer.description || "", offer.title);
                          return (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.4, delay: idx * 0.1 }}
                              className="group relative rounded-2xl overflow-hidden border border-border/60 bg-card shadow-sm hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-0.5 transition-all duration-300 flex flex-col"
                            >
                              {/* Top accent stripe — green-to-gold */}
                              <div className="h-[3px] w-full shrink-0"
                                style={{ background: "linear-gradient(90deg, #0B5E41 0%, #1A9068 40%, #D4A847 100%)" }} />

                              <div className="p-5 sm:p-6 flex flex-col gap-4 flex-1">
                                {/* Icon + badge row */}
                                <div className="flex items-start justify-between gap-2">
                                  {/* Green gradient icon */}
                                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"
                                    style={{ background: "linear-gradient(135deg, #0B5E41 0%, #1A9068 100%)" }}>
                                    <OfferIcon className="h-5 w-5 text-white" strokeWidth={2} />
                                  </div>
                                  {offer.badge && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest text-white shrink-0 mt-0.5 shadow-sm"
                                      style={{ background: "linear-gradient(135deg, #B8922F 0%, #D4A847 100%)" }}>
                                      <Sparkles className="h-2 w-2" />
                                      {offer.badge}
                                    </span>
                                  )}
                                </div>

                                {/* Divider */}
                                <div className="h-px bg-border/50" />

                                {/* Stat + description */}
                                <div className="space-y-1.5">
                                  <p className="text-3xl sm:text-4xl font-extrabold leading-none tracking-tight"
                                    style={{ background: "linear-gradient(135deg, #B8922F 0%, #D4A847 55%, #B8922F 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                                    {offer.title}
                                  </p>
                                  {offer.description && (
                                    <p className="text-sm font-medium text-foreground/65 leading-snug">{offer.description}</p>
                                  )}
                                </div>

                                {/* Bottom tag */}
                                <div className="mt-auto flex items-center gap-1.5 text-[10px] font-semibold text-primary/60 uppercase tracking-wider">
                                  <CheckCircle2 className="h-3 w-3" />
                                  {t("exclusiveOffers")}
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                    );
                  })()}

                  {/* Available Units */}
                  {((project.unitTypes?.length ?? 0) > 0 || (project.unitsByType?.length ?? 0) > 0 || ((project.propertyTypes?.length ?? 0) > 1 && (project.priceByType?.length ?? 0) > 0)) && (() => {
                    const hasMultiplePropertyTypes = (project.propertyTypes?.length ?? 0) > 1;
                    // priceByType entries with a propertyType field (older schema)
                    const filteredPriceByType: any[] = hasMultiplePropertyTypes
                      ? (project.priceByType || []).filter((p: any) => p.propertyType === activePropertyType)
                      : [];

                    // basePrice: project.startingPrice for the first/main property type, 0 for others
                    const buildUnitEntry = (ut: string, idx: number, sizeMin: number, sizeMax: number, totalTypes: number, activeType: string, basePrice: number) => {
                      const bedroomMatch = ut.match(/(\d+)/);
                      const bedrooms = bedroomMatch ? parseInt(bedroomMatch[1]) : ut.toLowerCase() === "studio" ? 0 : ut.toLowerCase() === "penthouse" ? 4 : 1;
                      const bathrooms = Math.max(1, bedrooms);
                      // priceByType entry — sizes stored as "Size: 756 - 2,207 Sq.ft"
                      const priceEntry = (project.priceByType || []).find((p: any) => p.type === ut);
                      const rawPBTMin = priceEntry?.priceMin || 0;
                      const rawPBTMax = priceEntry?.priceMax || 0;
                      const resolvedMin = rawPBTMin > 0 ? (rawPBTMin < 1_000 ? rawPBTMin * 1_000_000 : rawPBTMin) : 0;
                      const resolvedMax = rawPBTMax > 0 ? (rawPBTMax < 1_000 ? rawPBTMax * 1_000_000 : rawPBTMax) : 0;

                      // Price logic: use priceByType if available; otherwise first unit = starting range,
                      // last unit = max range (if project.priceMax exists), all middle units = Contact Us.
                      const isFirst = idx === 0;
                      const isLast = idx === totalTypes - 1;
                      const base = basePrice < 1_000 && basePrice > 0 ? basePrice * 1_000_000 : basePrice;
                      let minPrice = 0, maxPrice = 0, contactUs = false;
                      if (resolvedMin > 0) {
                        minPrice = resolvedMin;
                        maxPrice = resolvedMax || Math.round(resolvedMin * 1.25);
                      } else if (isFirst && base > 0) {
                        minPrice = base;
                        maxPrice = Math.round(base * 1.2);
                      } else if (isLast && base > 0 && totalTypes > 1) {
                        const rawPMax = project.priceMax || 0;
                        const normPMax = rawPMax > 0 ? (rawPMax < 1_000 ? rawPMax * 1_000_000 : rawPMax) : 0;
                        if (normPMax > 0) {
                          minPrice = Math.round(normPMax * 0.88);
                          maxPrice = normPMax;
                        } else {
                          contactUs = true;
                        }
                      } else {
                        contactUs = true;
                      }

                      // Size: distribute evenly across the sizeMin-sizeMax range
                      const sizeStep = totalTypes > 1 ? (sizeMax - sizeMin) / (totalTypes - 1) : 0;
                      const unitMinSize = Math.round(sizeMin + sizeStep * idx);
                      const unitMaxSize = Math.round(unitMinSize + (sizeStep > 0 ? sizeStep * 0.8 : 200));
                      const features = [
                        tE("builtInWardrobes"),
                        bedrooms >= 2 ? tE("maidsRoom") : null,
                        tE("balcony"),
                        bedrooms >= 3 ? tE("privateTerrace") : null,
                        tE("centralAC"),
                        activeType.toLowerCase().includes("penthouse") || ut.toLowerCase().includes("penthouse") ? tE("privatePool") : null,
                      ].filter(Boolean) as string[];
                      return { name: ut, minPrice, maxPrice, contactUs, minSize: unitMinSize, maxSize: unitMaxSize, bedrooms, bathrooms, features, available: true };
                    };

                    const unitData = (() => {
                      if (hasMultiplePropertyTypes) {
                        // unitsByType has per-property-type size ranges and unit type lists
                        const ubt = (project.unitsByType || []).find((u: any) => u.propertyType === activePropertyType);
                        if (ubt?.unitTypes?.length > 0) {
                          const ubtPriceMin = ubt.priceMin || 0;
                          const normUbtMin = ubtPriceMin > 0 ? (ubtPriceMin < 1_000 ? ubtPriceMin * 1_000_000 : ubtPriceMin) : 0;
                          // startingPrice applies to the first/cheapest property type only
                          const isFirstPropType = activePropertyType === project.propertyTypes?.[0];
                          const basePrice = normUbtMin || (isFirstPropType ? (project.startingPrice || 0) : 0);
                          const ubtSizeMin = ubt.sizeMin || Number(project.unitSizeMin) || 400;
                          const ubtSizeMax = ubt.sizeMax || Number(project.unitSizeMax) || 2500;
                          return (ubt.unitTypes as string[]).map((ut: string, idx: number) =>
                            buildUnitEntry(ut, idx, ubtSizeMin, ubtSizeMax, ubt.unitTypes.length, activePropertyType, basePrice)
                          );
                        }
                        // Fallback: priceByType entries that already carry a propertyType field
                        if (filteredPriceByType.length > 0) {
                          const fpBase = project.startingPrice || 0;
                          return filteredPriceByType.map((p: any, idx: number) => {
                            const sizeStr: string = p.size || "";
                            const sizeParts = sizeStr.split("-").map((s: string) => parseInt(s.replace(/[^0-9]/g, ""))).filter(Boolean);
                            return buildUnitEntry(p.type || "", idx, sizeParts[0] || 400, sizeParts[1] || sizeParts[0] || 2500, filteredPriceByType.length, activePropertyType, fpBase);
                          });
                        }
                      }
                      // Single property type: use unitTypes with project-level size range
                      const totalTypes = project.unitTypes?.length ?? 0;
                      const baseSize = Number(project.unitSizeMin) || 400;
                      const topSize = Number(project.unitSizeMax) || 2500;
                      return (project.unitTypes || []).map((ut: string, idx: number) =>
                        buildUnitEntry(ut, idx, baseSize, topSize, totalTypes, "", project.startingPrice || 0)
                      );
                    })();

                    const clampedUnitTab = Math.min(activeUnitTab, Math.max(0, unitData.length - 1));
                    const activeUnit = unitData[clampedUnitTab];
                    return (
                      <div className="rounded-3xl overflow-hidden">
                        {/* Section header */}
                        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Home className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.25em] font-semibold text-accent">{t("browseUnits")}</p>
                            <h2 className="text-lg sm:text-2xl font-bold text-foreground">{t("availableUnits")}</h2>
                          </div>
                        </div>

                        {/* Primary property type tabs — segmented control */}
                        {hasMultiplePropertyTypes && (
                          <div className="mb-5">
                            <p className="text-xs uppercase tracking-widest font-bold text-foreground/70 mb-2.5 pl-0.5">{t("propertyTypeLabel")}</p>
                            <div className="inline-flex w-full gap-1.5 p-1.5 bg-muted/50 rounded-2xl border border-border/30">
                              {(project.propertyTypes as string[]).map((pt) => (
                                <button
                                  key={pt}
                                  onClick={() => { setActivePropertyType(pt); setActiveUnitTab(0); }}
                                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 whitespace-nowrap focus:outline-none focus-visible:outline-none ${
                                    activePropertyType === pt
                                      ? "bg-white text-primary shadow-md shadow-black/8 border border-border/20"
                                      : "text-muted-foreground hover:text-foreground"
                                  }`}
                                >
                                  {pt.toLowerCase().includes("villa") || pt.toLowerCase().includes("townhouse") ? (
                                    <Home className="w-3.5 h-3.5 flex-shrink-0" />
                                  ) : pt.toLowerCase().includes("penthouse") ? (
                                    <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
                                  ) : (
                                    <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
                                  )}
                                  <span className="truncate">{tEnum(pt)}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Secondary bedroom type tabs */}
                        <div className="flex gap-2 overflow-x-auto pb-3 sm:pb-5 scrollbar-hide">
                          {unitData.map((unit, i) => (
                            <button
                              key={unit.name}
                              onClick={() => setActiveUnitTab(i)}
                              className={`flex-shrink-0 px-4 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 whitespace-nowrap focus:outline-none focus-visible:outline-none ${
                                clampedUnitTab === i
                                  ? "text-white shadow-md shadow-primary/20"
                                  : "bg-transparent text-muted-foreground border border-border hover:border-primary/40 hover:text-foreground"
                              }`}
                              style={clampedUnitTab === i ? { background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" } : undefined}
                            >
                              {tBed(unit.name)}
                            </button>
                          ))}
                        </div>

                        {/* Unit detail card */}
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={`${activePropertyType}-${clampedUnitTab}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                            className="bg-card rounded-3xl border border-border/50 overflow-hidden shadow-sm"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-0">
                              {/* Floor plan side */}
                              {(() => {
                                // Match floor plan: title match first, then fuzzy beds match, then index fallback
                                const unitName = (activeUnit?.name || "").toLowerCase();
                                const floorPlanImg =
                                  project.floorPlans?.find((fp: any) =>
                                    fp.title?.toLowerCase() === unitName
                                  )?.image ||
                                  project.floorPlans?.find((fp: any) =>
                                    unitName && fp.title?.toLowerCase().includes(unitName.split(" ")[0])
                                  )?.image ||
                                  project.floorPlans?.[clampedUnitTab]?.image ||
                                  project.floor_plans?.[clampedUnitTab] ||
                                  null;
                                return (
                                  <div className="md:col-span-2 relative bg-muted/20 flex flex-col items-center justify-center min-h-[180px] sm:min-h-[280px] md:min-h-[420px]">
                                    {floorPlanImg ? (
                                      <div className="flex flex-col w-full h-full">
                                        <div className="relative flex-1 p-4" style={{ minHeight: 200 }}>
                                          <NextImage
                                            src={floorPlanImg as string}
                                            alt={`${activeUnit?.name} floor plan`}
                                            fill
                                            sizes="(max-width: 768px) 100vw, 40vw"
                                            className="object-contain"
                                          />
                                        </div>
                                        <div className="px-4 pb-4">
                                          <a
                                            href={floorPlanImg as string}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            download
                                            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-primary border border-primary/25 transition-all hover:bg-primary hover:text-white hover:border-transparent hover:shadow-md group"
                                          >
                                            <Download className="h-3.5 w-3.5 group-hover:translate-y-0.5 transition-transform" />
                                            {t("downloadFloorPlan")}
                                          </a>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
                                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                                          <FileText className="h-7 w-7 text-primary/60" />
                                        </div>
                                        <div>
                                          <p className="font-semibold text-foreground text-sm">{t("floorPlanOnRequest")}</p>
                                          <p className="text-xs text-muted-foreground mt-1">{t("floorPlanOnRequestDesc")}</p>
                                        </div>
                                        <a
                                          onClick={() => trackLead("whatsapp", leadEntity)}
                                          href={waLink(`I'd like to see the floor plan for ${activeUnit?.name} at ${project.name}`)}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white shadow-md transition-all hover:scale-[1.03]"
                                          style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
                                        >
                                          <MessageCircle className="h-4 w-4" />
                                          {t("requestFloorPlan")}
                                        </a>
                                      </div>
                                    )}
                                  </div>
                                );
                              })()}

                              {/* Info side */}
                              <div className="md:col-span-3 p-4 sm:p-6 md:p-8 flex flex-col justify-between gap-3 sm:gap-6">
                                {/* Top: Title + status */}
                                <div className="flex items-start justify-between gap-4">
                                  <div>
                                    <h3 className="text-lg sm:text-3xl font-bold text-foreground">{tBed(activeUnit?.name)}</h3>
                                    <p className="text-sm text-muted-foreground mt-1">{project.name}</p>
                                  </div>
                                  <span className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    {t("available")}
                                  </span>
                                </div>

                                {/* Price card */}
                                {activeUnit?.contactUs ? (
                                  <div className="rounded-2xl p-4 sm:p-5 text-white shadow-lg shadow-accent/20" style={{ background: "linear-gradient(to right, #D4A847, #B8922F)" }}>
                                    <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-white/70 font-bold">{t("pricingLabel")}</p>
                                    <p className="text-xl sm:text-2xl font-bold mt-1">{t("contactForPricing")}</p>
                                    <p className="text-sm text-white/60 mt-1">{t("contactForPricingDesc")}</p>
                                  </div>
                                ) : clampedUnitTab === 0 ? (
                                  <div className="rounded-2xl p-4 sm:p-5 text-white shadow-lg shadow-accent/20" style={{ background: "linear-gradient(to right, #D4A847, #B8922F)" }}>
                                    <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-white/70 font-bold">{t("startingFromLabel")}</p>
                                    <p className="text-xl sm:text-3xl font-bold mt-1">
                                      {formatPrice(activeUnit?.minPrice)}
                                    </p>
                                  </div>
                                ) : (
                                  <div className="rounded-2xl p-4 sm:p-5 text-white shadow-lg shadow-accent/20" style={{ background: "linear-gradient(to right, #D4A847, #B8922F)" }}>
                                    <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-white/70 font-bold">{t("priceRangeLabel")}</p>
                                    <p className="text-xl sm:text-3xl font-bold mt-1">
                                      {formatPrice(activeUnit?.minPrice)} - {formatPrice(activeUnit?.maxPrice)}</p>
                                  </div>
                                )}

                                {/* Stats */}
                                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                                  {[
                                    { icon: Bed, value: activeUnit?.bedrooms === 0 ? tE("studio") : activeUnit?.bedrooms, label: tE("bedroomsLabel") },
                                    { icon: Users, value: activeUnit?.bathrooms, label: t("bathsLabel") },
                                    { icon: Ruler, value: `${activeUnit?.minSize?.toLocaleString()}`, label: tE("sqftLabel") },
                                  ].map(({ icon: StatIcon, value, label }) => (
                                    <div key={label} className="bg-muted/40 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center border border-border/30 hover:border-primary/20 transition-all hover:shadow-sm group">
                                      <StatIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary/60 group-hover:text-primary mx-auto mb-1.5 transition-colors" />
                                      <p className="text-base sm:text-lg font-bold text-foreground">{value}</p>
                                      <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5">{label}</p>
                                    </div>
                                  ))}
                                </div>

                                {/* Features */}
                                <div>
                                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold mb-3">{t("keyFeatures")}</p>
                                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                    {activeUnit?.features.map((f, fi) => (
                                      <motion.span
                                        key={fi}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: fi * 0.04 }}
                                        className="px-3 sm:px-4 py-1.5 sm:py-2 bg-muted/50 text-foreground/80 rounded-full text-[11px] sm:text-xs font-medium border border-border/40 hover:border-primary/25 hover:bg-primary/[0.05] transition-all cursor-default"
                                      >
                                        {f}
                                      </motion.span>
                                    ))}
                                  </div>
                                </div>

                                {/* CTA */}
                                <a
                                  onClick={() => trackLead("whatsapp", leadEntity)}
                                  href={waLink(`I'm interested in ${activeUnit?.name} at ${project.name}`)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center justify-center gap-2 w-full px-6 py-3.5 rounded-full bg-gradient-to-r from-[#25D366] to-[#1DA851] text-white font-semibold text-sm shadow-lg shadow-[#25D366]/20 hover:shadow-xl hover:shadow-[#25D366]/30 hover:scale-[1.02] transition-all duration-300"
                                >
                                  <MessageCircle className="h-4 w-4" />
                                  {t("enquireAboutUnit")}
                                </a>
                              </div>
                            </div>
                          </motion.div>
                        </AnimatePresence>
                      </div>
                    );
                  })()}

                  {/* Brochure CTA — always collect email first, then deliver */}
                  <button
                    type="button"
                    onClick={() => setBrochureModalOpen(true)}
                    className="w-full text-left flex items-center gap-3 sm:gap-4 rounded-2xl sm:rounded-full p-4 sm:p-6 group transition-all duration-300 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.01] active:scale-[0.99]"
                    style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0">
                      <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-bold text-white">{t("downloadBrochure")}</p>
                      <p className="text-[10px] sm:text-[11px] text-white/70">{t("brochureDesc")}</p>
                    </div>
                    <Download className="h-5 w-5 text-white/60 group-hover:translate-y-0.5 transition-transform flex-shrink-0" />
                  </button>

                  {/* Key Highlights */}
                  {project.keyHighlights && project.keyHighlights.length > 0 && (
                    <div className="relative rounded-3xl overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-card to-accent/[0.03]" />
                      <div className="relative p-4 sm:p-8">
                         <div className="flex items-center gap-2 sm:gap-3 mb-5 sm:mb-8">
                          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-primary/10 flex items-center justify-center">
                            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.25em] font-semibold text-accent">{t("whyThisProject")}</p>
                            <h2 className="text-lg sm:text-2xl font-bold text-foreground">{t("keyHighlights")}</h2>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-4">
                          {project.keyHighlights.map((h: string, i: number) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, y: 16 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              viewport={{ once: true }}
                              transition={{ delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                              whileHover={{ scale: 1.02, y: -2 }}
                              className="group relative"
                            >
                              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/10 to-accent/10 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
                              <div className="relative flex items-center gap-2.5 sm:gap-4 p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-card/80 backdrop-blur-sm border border-border/60 group-hover:border-primary/30 group-hover:shadow-lg group-hover:shadow-primary/[0.06] transition-all duration-500">
                                <div className="w-8 h-8 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary/10 to-primary/80/10 flex items-center justify-center flex-shrink-0 group-hover:from-primary/20 group-hover:to-primary/80/20 transition-all duration-500">
                                  <Star className="h-4 w-4 sm:h-5 sm:w-5 text-accent fill-accent/30 group-hover:fill-accent/60 transition-all duration-300" />
                                </div>
                                <span className="text-xs sm:text-sm font-medium text-foreground/80 group-hover:text-foreground leading-relaxed transition-colors duration-300">{h}</span>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Project Video Overview — only if valid embeddable URL */}
                  {project.videoUrl && /youtube\.com\/watch|youtu\.be\/|youtube\.com\/embed|vimeo\.com\/\d/.test(project.videoUrl) && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-card rounded-2xl border border-border/50 overflow-hidden"
                  >
                    <div className="relative aspect-video group cursor-pointer">
                      <NextImage
                        src={project.imageGallery?.[0] || videoThumbnail}
                        alt={`${project.name} video overview`}
                        fill
                        sizes="(max-width: 768px) 100vw, 60vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10 group-hover:from-black/80 transition-all duration-500" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center group-hover:scale-110 group-hover:bg-white/30 transition-all duration-500 shadow-2xl">
                          <Play className="h-8 w-8 text-white fill-white ml-1" />
                        </div>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2.5 py-1 rounded-full bg-accent/90 text-accent-foreground text-[10px] font-bold uppercase tracking-wider">{t("videoTourLabel")}</span>
                        </div>
                        <h3 className="text-lg font-bold text-white">{t("discoverProject")} {project.name}</h3>
                        <p className="text-white/60 text-xs mt-1">{t("virtualTourDesc")}</p>
                      </div>
                    </div>
                  </motion.div>
                  )}

                  {/* ───── PHOTO GALLERY ───── */}
                  {images.length > 1 && (
                    <div className="bg-card rounded-2xl border border-border/50 p-4 sm:p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-accent/15 flex items-center justify-center">
                            <ImageIcon className="h-4 w-4 text-accent" />
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.25em] font-semibold text-accent">{t("mediaLabel")}</p>
                            <h2 className="text-base sm:text-lg font-bold text-foreground">{t("galleryLabel")}</h2>
                          </div>
                        </div>
                        <button
                          onClick={() => setShowGallery(true)}
                          className="text-xs text-accent font-semibold hover:underline flex items-center gap-1"
                        >
                          {t("viewAll")} ({images.length}) <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Mobile: horizontal scroll strip */}
                      <div className="sm:hidden -mx-4 px-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide flex gap-2.5 pb-1">
                        {images.slice(0, 6).map((img, i) => (
                          <motion.button
                            key={i}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.04 }}
                            onClick={() => { setActiveImage(i); setShowGallery(true); }}
                            className="relative flex-shrink-0 w-[70%] aspect-[3/2] rounded-xl overflow-hidden border border-border/50 snap-center"
                          >
                            <ImageWithFallback src={img} alt={`${project.name} - ${i + 1}`} fill sizes="70vw" className="object-cover" />
                            {i === 5 && images.length > 6 && (
                              <div className="absolute inset-0 bg-foreground/60 flex items-center justify-center">
                                <span className="text-white font-bold text-base">+{images.length - 6}</span>
                              </div>
                            )}
                          </motion.button>
                        ))}
                      </div>

                      {/* Desktop: straight row of 4 */}
                      <div className="hidden sm:grid grid-cols-4 gap-3">
                        {images.slice(0, 4).map((img, i) => (
                          <motion.button
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.05 }}
                            onClick={() => { setActiveImage(i); setShowGallery(true); }}
                            className="relative group aspect-[4/3] rounded-2xl overflow-hidden border border-border/50 hover:border-accent/30 transition-all"
                          >
                            <ImageWithFallback src={img} alt={`${project.name} - ${i + 1}`} fill sizes="25vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                            <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/20 transition-colors duration-300 flex items-center justify-center">
                              <Eye className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>
                            {i === 3 && images.length > 4 && (
                              <div className="absolute inset-0 bg-foreground/60 flex items-center justify-center rounded-2xl">
                                <span className="text-white font-bold text-lg">+{images.length - 4}</span>
                              </div>
                            )}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Payment Plan Visual Timeline */}
                  {project.unitTypes && project.unitTypes.length > 0 && (() => {
                    const rawPrice = project.startingPrice || 0;
                    const basePrice = rawPrice < 1_000 ? rawPrice * 1_000_000 : rawPrice;
                    const priceMultiplier = 1 + activeUnitTab * 0.35;
                    const unitPrice = Math.round(basePrice * priceMultiplier);

                    // Prefer the real, ordered payment plan from the DB; fall back to a
                    // generic schedule only when the project has no paymentPlanSteps.
                    const stepIcons = [Wallet, Building2, CheckCircle2, Clock];
                    const stepColors = ["bg-accent", "bg-primary/70", "bg-emerald-500", "bg-primary"];
                    const milestones = orderedPaymentSteps.length > 0
                      ? orderedPaymentSteps.map((s, i) => ({ pct: s.pct, label: s.title, icon: stepIcons[i % stepIcons.length], color: stepColors[i % stepColors.length] }))
                      : [
                          { pct: 10, label: t("onBooking"), icon: Wallet, color: "bg-accent" },
                          { pct: 10, label: t("after3Months"), icon: Calendar, color: "bg-primary" },
                          { pct: 10, label: t("after6Months"), icon: Clock, color: "bg-primary" },
                          { pct: 30, label: t("duringConstruction"), icon: Building2, color: "bg-primary/70" },
                          { pct: 40, label: t("onHandover"), icon: CheckCircle2, color: "bg-emerald-500" },
                        ];

                    // Single source of truth for the summary chip.
                    const planSummary = paymentPlanPretty;

                    return (
                      <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
                        {/* Header with gradient */}
                        <div className="p-3.5 sm:p-5 flex items-center justify-between" style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}>
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/10 flex items-center justify-center">
                              <CreditCard className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <h2 className="text-base sm:text-xl font-bold text-white">{t("paymentPlanLabel")}</h2>
                              <p className="text-[10px] sm:text-xs text-white/60">
                                {t("forUnit")} {project.unitTypes![activeUnitTab]} · {formatPrice(unitPrice)}
                              </p>
                            </div>
                          </div>
                          {planSummary && (
                            <span className="px-2.5 py-1 rounded-full text-[9px] sm:text-[10px] font-bold bg-white/15 text-white border border-white/20">
                              {planSummary}
                            </span>
                          )}
                        </div>

                        <div className="p-3.5 sm:p-6 space-y-4 sm:space-y-6">
                          {/* Progress bar */}
                          <div className="flex rounded-full overflow-hidden h-2.5 sm:h-3 bg-muted/50">
                            {milestones.map((m, i) => (
                              <motion.div
                                key={i}
                                initial={{ width: 0 }}
                                whileInView={{ width: `${m.pct}%` }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.15 * i + 0.3, duration: 0.5 }}
                                className={`${m.color} ${i === 0 ? "rounded-l-full" : ""} ${i === milestones.length - 1 ? "rounded-r-full" : ""} relative`}
                                style={{ minWidth: "2%" }}
                              >
                                {i < milestones.length - 1 && (
                                  <div className="absolute right-0 top-0 bottom-0 w-px bg-background" />
                                )}
                              </motion.div>
                            ))}
                          </div>

                          {/* Timeline steps — compact on mobile */}
                          <div className="relative">
                            <div className="absolute left-[11px] sm:left-[15px] top-3 bottom-3 w-[2px] bg-border rounded-full" />
                            <div className="space-y-0">
                              {milestones.map((m, i) => {
                                const amount = Math.round(unitPrice * m.pct / 100);
                                const MIcon = m.icon;
                                const cumulativePct = milestones.slice(0, i + 1).reduce((sum, ms) => sum + ms.pct, 0);
                                return (
                                  <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -10 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.1 * i + 0.2 }}
                                    className="flex items-center gap-2.5 sm:gap-4 py-2.5 sm:py-4 relative"
                                  >
                                    {/* Node */}
                                    <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full ${m.color} flex items-center justify-center flex-shrink-0 z-10 shadow-md`}>
                                      <MIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-white" />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 flex items-center justify-between gap-2 min-w-0">
                                      <div className="min-w-0">
                                        <p className="text-xs sm:text-sm font-bold text-foreground">{m.label}</p>
                                        <p className="text-[9px] sm:text-[11px] text-muted-foreground">{t("paymentStep", { step: i + 1 })} · {t("paymentStepPaid", { pct: cumulativePct })}</p>
                                      </div>
                                      <div className="flex items-baseline gap-1.5 sm:gap-2 flex-shrink-0">
                                        <span className="text-sm sm:text-lg font-bold text-foreground">{m.pct}%</span>
                                        {unitPrice > 0 && (
                                          <div className="flex flex-col items-end">
                                            <span className="text-[11px] sm:text-sm font-semibold text-foreground">{formatPrice(amount)}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </motion.div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Total summary */}
                          <div className="pt-3 sm:pt-4 border-t border-border/50 flex items-center justify-between">
                            <p className="text-xs sm:text-sm font-semibold text-muted-foreground">{t("totalLabel")}</p>
                            <div className="text-right">
                              <p className="text-base sm:text-lg font-bold text-foreground">{unitPrice > 0 ? formatPrice(unitPrice) : t("priceOnRequest")}</p>
                            </div>
                          </div>

                          {project.paymentPlanDetails && !/^Q\d+\./i.test(project.paymentPlanDetails.trim()) && (
                            <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed bg-muted/30 rounded-xl p-2.5 sm:p-3 border border-border/30">{project.paymentPlanDetails}</p>
                          )}
                        </div>
                      </div>
                    );
                  })()}


                  {/* Location & Nearby */}
                   <div className="bg-card rounded-2xl border border-border/50 p-4 sm:p-8 overflow-hidden">
                    <div className="flex items-center gap-2.5 mb-6">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                        <MapPin className="h-4.5 w-4.5 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-foreground">{t("locationNearby")}</h2>
                        {project.locationDescription && (() => {
                          // Show only the descriptive intro — the connectivity bullets duplicate
                          // the nearby-attraction cards rendered below the map.
                          const raw = project.locationDescription!;
                          const hadBullets = /[•●◦▪■]/.test(raw);
                          const lines = raw.split(/\s*[•●◦▪■]\s*/)[0].split(/\n+/).map((l: string) => l.trim()).filter(Boolean);
                          // Drop a trailing short header label (e.g. "Key Connectivities" / "Ключевые связи").
                          if (hadBullets && lines.length > 1) {
                            const last = lines[lines.length - 1];
                            if (last.split(/\s+/).length <= 6 && !/[.!?:,;]$/.test(last)) lines.pop();
                          }
                          const text = lines.join(" ").trim();
                          return text ? <p className="text-xs text-muted-foreground mt-0.5">{text}</p> : null;
                        })()}
                      </div>
                    </div>

                    {/* Map embed */}
                    {(() => {
                      let embedSrc = toMapEmbedSrc(project.mapUrl || "");
                      if (!embedSrc && project.latitude && project.longitude) {
                        embedSrc = classicMapEmbed(`${project.latitude},${project.longitude}`);
                      }
                      if (!embedSrc) {
                        embedSrc = classicMapEmbed(`${project.name}, ${project.community || project.city || ""}, ${project.country || "UAE"}`);
                      }
                      return (
                        <div className="rounded-xl overflow-hidden border border-border/50 mb-6 aspect-[16/9]">
                          <iframe
                            src={embedSrc}
                            className="w-full h-full border-0"
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title={`${project.name} location`}
                          />
                        </div>
                      );
                    })()}

                    {/* Nearby amenities — uses outer `nearby` (DB → parsed-from-description, no hardcoded fallback) */}
                    {nearby.length > 0 && (() => {
                      const items = nearby;
                      return (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                          {items.map((item, i) => {
                            const AIcon = attractionIcon(item.type);
                            return (
                              <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 6 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.05 }}
                                className="h-full flex flex-col rounded-xl border border-border/50 p-3 bg-muted/20 hover:bg-muted/40 transition-colors"
                              >
                                <div className="flex items-start gap-2 mb-1.5 flex-1">
                                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <AIcon className="h-3.5 w-3.5 text-primary" />
                                  </div>
                                  <span className="text-xs font-bold text-foreground leading-snug">{item.name}</span>
                                </div>
                                <p className="text-[11px] text-muted-foreground ml-9 mt-auto">{item.distance}</p>
                              </motion.div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Investment Highlights */}
                  {(() => {
                    const highlights = project.investmentHighlights || [];
                    const keyHighlights = Array.isArray(project.keyHighlights) && project.keyHighlights.length > 0 ? project.keyHighlights : null;
                    const defaultReasons = keyHighlights || [
                      t("reasonHighRentalDemand"),
                      t("reasonGoldenVisa"),
                      t("reasonTaxFree"),
                      t("reasonCapitalAppreciation"),
                      t("reasonWorldClassAmenities"),
                    ];
                    const reasons = highlights.length > 0 ? highlights : defaultReasons;
                    const stats = [
                      { label: t("estRentalYield"), value: "7-9%", sub: t("annualROI"), icon: TrendingUp, iconClass: "text-emerald-500" },
                      { label: t("capitalGrowth"), value: "12-15%", sub: t("yearOnYear"), icon: Sparkles, iconClass: "text-accent" },
                      { label: t("occupancyRate"), value: "90%+", sub: t("areaAverage"), icon: Users, iconClass: "text-primary" },
                    ];
                    return (
                      <div className="bg-card rounded-2xl border border-border/50 p-4 sm:p-8">
                        <div className="flex items-center gap-2.5 mb-6">
                          <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                            <TrendingUp className="h-4.5 w-4.5 text-emerald-500" />
                          </div>
                          <div>
                            <h2 className="text-lg sm:text-xl font-bold text-foreground">{t("investmentHighlights")}</h2>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-1.5 sm:gap-3 mb-4 sm:mb-6">
                          {stats.map((s, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, y: 8 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              viewport={{ once: true }}
                              transition={{ delay: i * 0.1 }}
                              className="rounded-xl border border-border/50 p-2 sm:p-3 text-center bg-muted/20"
                            >
                              <s.icon className={`h-4 w-4 ${s.iconClass} mx-auto mb-1`} />
                              <p className="text-base sm:text-xl font-bold text-foreground">{s.value}</p>
                              <p className="text-[8px] sm:text-[10px] font-semibold text-muted-foreground">{s.label}</p>
                              <p className="text-[7px] sm:text-[9px] text-muted-foreground/70 hidden sm:block">{s.sub}</p>
                            </motion.div>
                          ))}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {reasons.map((reason, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: -6 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              viewport={{ once: true }}
                              transition={{ delay: i * 0.05 }}
                              className="flex items-center gap-2.5 rounded-xl border border-border/50 p-2.5 sm:p-3 bg-muted/10 hover:bg-muted/30 transition-colors"
                            >
                              <div className="w-6 h-6 rounded-full bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                              </div>
                              <span className="text-xs font-semibold text-foreground">{reason}</span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Amenities & Facilities (shared component) */}
                  <AmenitiesSection
                    amenities={
                      project.amenities && project.amenities.length > 0
                        ? project.amenities
                        : [tE("swimmingPool"), tE("gymnasium"), tE("kidsPlayArea"), tE("conciergeService"), tE("parking"), tE("security24x7"), tE("spaSauna"), tE("bbqArea"), tE("joggingTrack"), tE("retailOutlets"), tE("landscapedGardens"), tE("smartHomeFeatures")]
                    }
                  />

                  {/* FAQ Section */}
                  <div className="bg-card rounded-2xl border border-border/50 p-4 sm:p-8">
                    <div className="flex items-center gap-2.5 mb-6">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                        <FileText className="h-4.5 w-4.5 text-primary" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.25em] font-semibold text-accent">{t("commonQuestions")}</p>
                        <h2 className="text-lg sm:text-xl font-bold text-foreground">{t("faqLabel")}</h2>
                      </div>
                    </div>
                    <FaqAccordion faqs={faqs} />

                  </div>


                  {/* About the Developer */}
                  {project.developerName && (
                    <div className="relative bg-card rounded-2xl border border-border/50 overflow-hidden">
                      <div className="h-1.5 bg-gradient-to-r from-primary via-primary/60 to-accent" />
                      <div className="p-4 sm:p-6 md:p-8">
                        {/* Header */}
                        <div className="flex items-center gap-2.5 mb-5 sm:mb-6">
                          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Building2 className="h-4.5 w-4.5 text-primary" />
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.25em] font-semibold text-accent">{t("developer")}</p>
                            <h2 className="text-lg sm:text-xl font-bold text-foreground">{t("aboutDeveloper")}</h2>
                          </div>
                        </div>

                        {/* Developer name + description */}
                        <div className="flex items-start gap-4 mb-5 sm:mb-6">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-border/50 flex items-center justify-center flex-shrink-0 shadow-sm">
                            <span className="text-xl font-black text-primary/60">{project.developerName.split(" ").map((w: string) => w[0]).join("").slice(0, 2)}</span>
                          </div>
                          <div>
                            <h3 className="text-base sm:text-lg font-bold text-foreground mb-1">{project.developerName}</h3>
                            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                              {t("developerDesc", { name: project.developerName })}
                            </p>
                          </div>
                        </div>

                        {/* Stats row — pulled live from /api/developers/:slug; render only what we have */}
                        {(() => {
                          const currentYear = new Date().getFullYear();
                          const stats = [
                            // Only show a project count we're confident in. Our DB often
                            // has just a handful of a developer's projects, so a low count
                            // (e.g. "2+" for Expo City Dubai) is misleading — hide under 10.
                            developerStats.projectsDelivered != null && developerStats.projectsDelivered >= 10
                              ? { value: `${developerStats.projectsDelivered}+`, label: t("projectsDelivered"), icon: Building2 }
                              : null,
                            developerStats.foundedYear
                              ? { value: `${currentYear - developerStats.foundedYear}+`, label: t("yearsExperience"), icon: Clock }
                              : null,
                            developerStats.totalUnits
                              ? { value: developerStats.totalUnits >= 1000 ? `${Math.floor(developerStats.totalUnits / 1000)}K+` : `${developerStats.totalUnits}+`, label: t("unitsCompleted"), icon: Home }
                              : null,
                          ].filter(Boolean) as { value: string; label: string; icon: React.ElementType }[];
                          if (stats.length === 0) return null;
                          return (
                            <div className={`grid gap-2 sm:gap-3 mb-5 sm:mb-6 ${stats.length === 1 ? "grid-cols-1" : stats.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
                              {stats.map((stat, i) => {
                                const StatIcon = stat.icon;
                                return (
                                  <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="flex flex-col items-center text-center rounded-xl border border-border/50 bg-muted/20 py-3 sm:py-4 px-2 hover:border-primary/20 hover:shadow-sm transition-all duration-300"
                                  >
                                    <StatIcon className="h-4 w-4 text-primary/60 mb-1.5" />
                                    <p className="text-base sm:text-xl font-bold text-foreground">{stat.value}</p>
                                    <p className="text-[9px] sm:text-[11px] text-muted-foreground font-medium mt-0.5 leading-tight">{stat.label}</p>
                                  </motion.div>
                                );
                              })}
                            </div>
                          );
                        })()}

                        {/* CTA — only render when we have a slug to link to */}
                        {(() => {
                          const devSlug = project.developerSlug ||
                            (project.developerName
                              ? project.developerName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
                              : "");
                          if (!devSlug) return null;
                          return (
                            <Link href={`/developers/${devSlug}`} className="inline-flex items-center gap-2 text-sm font-bold text-foreground border border-border/60 hover:border-primary/30 hover:bg-primary/5 px-5 py-2.5 rounded-full transition-all duration-300 group">
                              {t("viewDeveloperProfile")} <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                          );
                        })()}
                      </div>
                    </div>
                  )}

                  {/* Subscribe for project updates */}
                  <ProjectSubscribeSection
                    slug={project.slug}
                    projectName={project.name}
                    projectImage={project.featuredImage || project.images?.[0] || null}
                    prefillEmail={enquiryForm.email}
                  />

                  {/* Enquiry Form — hidden on mobile (shown inline below price card in right column) */}
                   <div className="hidden sm:block bg-card rounded-2xl border border-border/50 p-4 sm:p-8">
                    <div className="flex items-center gap-2.5 mb-5 sm:mb-6">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-accent/15 flex items-center justify-center">
                        <Mail className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-accent" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.25em] font-semibold text-accent">{t("getInTouch")}</p>
                        <h2 className="text-base sm:text-xl font-bold text-foreground">{t("enquireLabel")}</h2>
                        <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">{t("enquireDesc")}</p>
                      </div>
                    </div>

                    {enquirySubmitted ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="py-8 space-y-6"
                      >
                        {/* Thank-you message */}
                        <div className="text-center">
                          <div className="w-14 h-14 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 className="h-7 w-7 text-emerald-500" />
                          </div>
                          <h3 className="text-lg font-bold text-foreground mb-1">{t("thankYou")}</h3>
                          <p className="text-sm text-muted-foreground">{t("enquireThankYouDesc")}</p>
                          <button
                            onClick={() => { setEnquirySubmitted(false); setEnquiryForm({ name: "", email: "", phone: "", countryCode: "+971", unitType: "", message: "", contactMethod: "whatsapp" }); }}
                            className="mt-4 text-xs font-semibold text-primary hover:underline"
                          >
                            {t("submitAnotherEnquiry")}
                          </button>
                        </div>
                        {/* Subscribe CTA */}
                        <div className="border border-border/50 rounded-xl p-4 bg-muted/20 space-y-3">
                          <p className="text-sm font-semibold text-foreground text-center">
                            {t("wantUpdates", { name: project.name })}
                          </p>
                          <p className="text-xs text-muted-foreground text-center leading-relaxed">
                            {t("subscribeDesc")}
                          </p>
                          <div className="flex justify-center">
                            <SubscribeButton
                              slug={project.slug}
                              projectName={project.name}
                              projectImage={project.featuredImage || project.images?.[0] || null}
                              variant="cta"
                              prefillEmail={enquiryForm.email}
                            />
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <form
                        onSubmit={handleEnquirySubmit}
                        className="space-y-3 sm:space-y-4"
                      >
                        {/* Core fields — always visible */}
                        <div>
                          <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">{t("fullName")} *</label>
                          <input
                            type="text"
                            required
                            value={enquiryForm.name}
                            onChange={(e) => setEnquiryForm(f => ({ ...f, name: e.target.value }))}
                            className="w-full h-11 rounded-xl bg-muted/30 border border-border/50 px-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all"
                            placeholder={t("namePlaceholder")}
                          />
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">{t("phoneNumber")} *</label>
                          <div className="flex gap-2">
                            <CountryCodeSelect
                              value={enquiryForm.countryCode}
                              onChange={(dial) => setEnquiryForm(f => ({ ...f, countryCode: dial }))}
                              className="h-11 rounded-xl bg-muted/30 border border-border/50 px-3 text-sm text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all max-w-[180px]"
                            />
                            <input
                              type="tel"
                              required
                              value={enquiryForm.phone}
                              onChange={(e) => setEnquiryForm(f => ({ ...f, phone: e.target.value }))}
                              className="flex-1 h-11 rounded-xl bg-muted/30 border border-border/50 px-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all"
                              placeholder="50 123 4567"
                            />
                          </div>
                        </div>

                        {/* Pre-filled message */}
                        <div className="bg-muted/20 rounded-xl px-3.5 py-2.5 border border-border/30">
                          <p className="text-xs text-muted-foreground">
                            <span className="font-semibold text-foreground/70">{t("messageLabel")}:</span> {t("interestedInProject", { name: project.name })}
                          </p>
                        </div>

                        {/* Optional expander — mobile-first */}
                        <div>
                          <button
                            type="button"
                            onClick={() => setShowMoreEnquiry(!showMoreEnquiry)}
                            className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                          >
                            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showMoreEnquiry ? "rotate-180" : ""}`} />
                            {showMoreEnquiry ? t("hideDetails") : t("addMoreDetails")}
                          </button>

                          {showMoreEnquiry && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              className="space-y-3 mt-3 overflow-hidden"
                            >
                              <div>
                                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">{t("emailLabel")}</label>
                                <input
                                  type="email"
                                  required
                                  value={enquiryForm.email}
                                  onChange={(e) => setEnquiryForm(f => ({ ...f, email: e.target.value }))}
                                  className="w-full h-11 rounded-xl bg-muted/30 border border-border/50 px-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all"
                                  placeholder="your@email.com"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">{t("preferredUnitType")}</label>
                                <select
                                  value={enquiryForm.unitType}
                                  onChange={(e) => setEnquiryForm(f => ({ ...f, unitType: e.target.value }))}
                                  className="w-full h-11 rounded-xl bg-muted/30 border border-border/50 px-4 text-sm text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all appearance-none"
                                >
                                  <option value="">{t("selectUnitType")}</option>
                                  {project.unitTypes?.map((ut) => (
                                    <option key={ut} value={ut}>{ut}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">{t("customMessage")}</label>
                                <textarea
                                  rows={2}
                                  value={enquiryForm.message}
                                  onChange={(e) => setEnquiryForm(f => ({ ...f, message: e.target.value }))}
                                  className="w-full rounded-xl bg-muted/30 border border-border/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all resize-none"
                                  placeholder={t("requirementsPlaceholder")}
                                />
                              </div>
                              <div>
                                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">{t("preferredContact")}</label>
                                <div className="flex gap-2">
                                  {([
                                    { key: "whatsapp" as const, label: "WhatsApp", icon: MessageCircle },
                                    { key: "email" as const, label: "Email", icon: Mail },
                                    { key: "phone" as const, label: "Phone", icon: Phone },
                                  ]).map((method) => {
                                    const MIcon = method.icon;
                                    return (
                                      <button
                                        key={method.key}
                                        type="button"
                                        onClick={() => setEnquiryForm(f => ({ ...f, contactMethod: method.key }))}
                                        className={`flex-1 h-10 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                                          enquiryForm.contactMethod === method.key
                                            ? "text-white shadow-md"
                                            : "bg-muted/50 text-muted-foreground hover:bg-muted border border-border/50"
                                        }`}
                                        style={enquiryForm.contactMethod === method.key
                                          ? { background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }
                                          : undefined
                                        }
                                      >
                                        <MIcon className="h-3.5 w-3.5" />
                                        {method.label}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </div>

                        <button
                          type="submit"
                          disabled={enquirySending}
                          className="w-full h-12 rounded-full text-white font-bold text-sm transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:hover:scale-100"
                          style={{ background: "linear-gradient(to right, #D4A847, #B8922F)", boxShadow: "0 4px 20px rgba(212,168,71,0.3)" }}
                        >
                          {enquirySending ? t("sending") : t("sendQuickEnquiry")}
                        </button>

                        {enquiryError && <p className="text-xs text-red-600 text-center" role="alert">{tCommon("somethingWentWrong")}</p>}
                        <p className="text-[10px] text-muted-foreground text-center">{t("responseTime")}</p>
                      </form>
                    )}
                  </div>

                  {/* Schedule Video Consultation → WhatsApp deep link
                      with a pre-filled request so an agent can confirm a
                      time slot. The old `#schedule-call` anchor had no
                      matching target on the page. */}
                  <a
                    onClick={() => trackLead("whatsapp", leadEntity)}
                    href={waLink(`Hi, I'd like to schedule a video consultation about ${project.name}. When are you available?`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-2xl p-[2px] bg-gradient-to-r from-primary via-primary/60 to-accent transition-all duration-300 group hover:shadow-lg hover:shadow-primary/15 hover:scale-[1.01]"
                  >
                    <div className="rounded-[14px] bg-card/95 backdrop-blur-xl p-4 sm:p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/15 flex items-center justify-center flex-shrink-0 group-hover:from-primary/20 transition-all">
                          <Calendar className="h-4.5 w-4.5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold text-primary">{t("scheduleCall")}</h3>
                          <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{t("scheduleCallDesc")}</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-primary/40 group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
                      </div>
                    </div>
                  </a>

                </motion.div>
              )}

              {/* ─── FLOOR PLANS TAB ─── */}
              {activeTab === "floor-plans" && (
                <motion.div
                  key="floor-plans"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4 sm:space-y-8"
                >
                  {/* ───── FLOOR PLANS GALLERY ───── */}
                  {(project.floorPlans?.length ?? 0) > 0 ? (() => {
                    const fps = (project.floorPlans as { title: string; type?: string; beds?: string; baths?: string; size?: string; image?: string; pdf?: string }[]);
                    const activeFp = fps[activeFloorPlanTab] ?? fps[0];
                    return (
                      <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
                        {/* Header */}
                        <div className="px-4 sm:px-6 py-4 border-b border-border/50 flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                            <FileText className="h-4 w-4 text-accent" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] uppercase tracking-[0.25em] font-semibold text-accent">{t("floorPlansLabel")}</p>
                            <h2 className="text-base sm:text-lg font-bold text-foreground leading-tight">{project.name}, {t("floorPlans")}</h2>
                          </div>
                          {project.floorPlanPdfUrl && (
                            <a href={project.floorPlanPdfUrl} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-accent/30 text-accent text-xs font-semibold hover:bg-accent/10 transition-colors shrink-0">
                              <Download className="h-3.5 w-3.5" />
                              PDF
                            </a>
                          )}
                        </div>

                        {/* Tab pills */}
                        <div className="px-4 sm:px-6 pt-4 flex gap-2 flex-wrap">
                          {fps.map((fp, i) => (
                            <button
                              key={i}
                              onClick={() => setActiveFloorPlanTab(i)}
                              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${activeFloorPlanTab === i ? "border-accent bg-accent/10 text-accent" : "border-border text-muted-foreground hover:border-accent/40 hover:text-foreground"}`}
                            >
                              {fp.title}
                            </button>
                          ))}
                        </div>

                        {/* Active floor plan */}
                        <div className="p-4 sm:p-6">
                          {activeFp?.image ? (
                            <div className="flex flex-col sm:flex-row gap-4">
                              {/* Image */}
                              <div className="relative w-full sm:w-2/3 aspect-[4/3] rounded-xl overflow-hidden bg-muted border border-border/50">
                                <NextImage
                                  src={activeFp.image}
                                  alt={activeFp.title}
                                  fill
                                  className="object-contain"
                                  sizes="(max-width: 640px) 100vw, 50vw"
                                />
                              </div>
                              {/* Specs alongside image */}
                              <div className="flex flex-col gap-3 sm:w-1/3 justify-center">
                                <h3 className="font-bold text-foreground text-base">{activeFp.title}</h3>
                                {activeFp.type && (
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Building2 className="h-3.5 w-3.5 text-accent shrink-0" />
                                    {activeFp.type}
                                  </div>
                                )}
                                {activeFp.beds && (
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Bed className="h-3.5 w-3.5 text-accent shrink-0" />
                                    {activeFp.beds} {t("bedsLabel")}
                                    {activeFp.baths ? ` · ${activeFp.baths} ${t("bathsLabel")}` : ""}
                                  </div>
                                )}
                                {activeFp.size && (
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Ruler className="h-3.5 w-3.5 text-accent shrink-0" />
                                    {activeFp.size}
                                  </div>
                                )}
                                <a
                                  href={activeFp.image}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline"
                                >
                                  <ExternalLink className="h-3.5 w-3.5" />
                                  {t("viewFullSize")}
                                </a>
                              </div>
                            </div>
                          ) : (
                            /* No image — show specs grid so content is never empty */
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {(activeFp?.beds || activeFp?.baths) && (
                                  <div className="p-4 rounded-xl bg-muted/50 border border-border/50 flex items-center gap-3">
                                    <Bed className="h-5 w-5 text-accent shrink-0" />
                                    <div>
                                      <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground font-semibold">{t("bedsLabel")}</p>
                                      <p className="text-sm font-bold text-foreground">
                                        {activeFp?.beds ?? "-"}{activeFp?.baths ? ` · ${activeFp.baths} ${t("bathsLabel")}` : ""}
                                      </p>
                                    </div>
                                  </div>
                                )}
                                {activeFp?.size && (
                                  <div className="p-4 rounded-xl bg-muted/50 border border-border/50 flex items-center gap-3">
                                    <Ruler className="h-5 w-5 text-accent shrink-0" />
                                    <div>
                                      <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground font-semibold">{t("sizeRange")}</p>
                                      <p className="text-sm font-bold text-foreground">{activeFp.size}</p>
                                    </div>
                                  </div>
                                )}
                                {activeFp?.type && (
                                  <div className="p-4 rounded-xl bg-muted/50 border border-border/50 flex items-center gap-3">
                                    <Building2 className="h-5 w-5 text-accent shrink-0" />
                                    <div>
                                      <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground font-semibold">{t("propertyTypeLabel")}</p>
                                      <p className="text-sm font-bold text-foreground">{activeFp.type}</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                              {/* All-units summary table */}
                              {fps.length > 1 && (
                                <div className="overflow-x-auto rounded-xl border border-border/50">
                                  <table className="w-full text-sm">
                                    <thead>
                                      <tr className="border-b border-border/50 bg-muted/30">
                                        <th className="text-left px-4 py-2.5 text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-semibold">{t("floorPlansLabel")}</th>
                                        <th className="text-left px-4 py-2.5 text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-semibold">{t("bedsLabel")}</th>
                                        <th className="text-left px-4 py-2.5 text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-semibold">{t("bathsLabel")}</th>
                                        <th className="text-left px-4 py-2.5 text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-semibold">{t("sizeRange")}</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {fps.map((fp, i) => (
                                        <tr
                                          key={i}
                                          onClick={() => setActiveFloorPlanTab(i)}
                                          className={`border-b border-border/30 last:border-0 cursor-pointer transition-colors ${i === activeFloorPlanTab ? "bg-accent/5" : "hover:bg-muted/30"}`}
                                        >
                                          <td className="px-4 py-3 font-semibold text-foreground">{fp.title}</td>
                                          <td className="px-4 py-3 text-muted-foreground">{fp.beds ?? "-"}</td>
                                          <td className="px-4 py-3 text-muted-foreground">{fp.baths ?? "-"}</td>
                                          <td className="px-4 py-3 text-muted-foreground">{fp.size ?? "-"}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                              <p className="text-xs text-muted-foreground text-center">{t("floorPlanOnRequest")}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })() : (() => {
                    // No uploaded floor-plan images — render the indicative
                    // schematic card (one per unit type, derived from unitTypes
                    // + size range), the "beautiful card" from before the tabs.
                    // Fall back to generic types when unitTypes is empty.
                    const rawTypes = Array.isArray(project.unitTypes) && project.unitTypes.length > 0
                      ? (project.unitTypes as string[])
                      : ["Studio", "1 Bedroom", "2 Bedroom"];
                    const totalTypes = rawTypes.length;
                    const baseSize = Number(project.unitSizeMin) || 400;
                    const maxSize = Number(project.unitSizeMax) || 2500;
                    const units = rawTypes.map((ut, idx) => {
                      const m = ut.match(/(\d+)/);
                      const bedrooms = m ? parseInt(m[1], 10) : ut.toLowerCase() === "studio" ? 0 : ut.toLowerCase() === "penthouse" ? 4 : 1;
                      const sizeStep = totalTypes > 1 ? (maxSize - baseSize) / (totalTypes - 1) : 0;
                      const unitSize = Math.round(baseSize + sizeStep * idx);
                      return { name: ut, bedrooms, bathrooms: Math.max(1, bedrooms), unitSize, totalArea: unitSize + Math.round(unitSize * 0.08) };
                    });
                    const active = units[activeFloorPlanTab] ?? units[0];
                    return (
                      <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
                        <div className="px-4 sm:px-6 py-4 border-b border-border/50 flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                            <FileText className="h-4 w-4 text-accent" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] uppercase tracking-[0.25em] font-semibold text-accent">{t("floorPlansLabel")}</p>
                            <h2 className="text-base sm:text-lg font-bold text-foreground leading-tight">{project.name}, {t("floorPlans")}</h2>
                          </div>
                        </div>
                        <div className="px-4 sm:px-6 pt-4 flex gap-2 flex-wrap">
                          {units.map((u, i) => (
                            <button
                              key={i}
                              onClick={() => setActiveFloorPlanTab(i)}
                              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${activeFloorPlanTab === i ? "border-accent bg-accent/10 text-accent" : "border-border text-muted-foreground hover:border-accent/40 hover:text-foreground"}`}
                            >
                              {u.name}
                            </button>
                          ))}
                        </div>
                        <div className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4">
                          <div className="relative w-full sm:w-2/3 aspect-[4/3] rounded-xl overflow-hidden bg-white border border-border/50 flex items-center justify-center p-4">
                            <FloorPlanPlaceholder bedrooms={active?.bedrooms || 0} unitName={active?.name || ""} sqft={active?.unitSize || 0} />
                          </div>
                          <div className="flex flex-col gap-3 sm:w-1/3 justify-center">
                            <h3 className="font-bold text-foreground text-base">{active?.name}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Bed className="h-3.5 w-3.5 text-accent shrink-0" />
                              {active?.bedrooms === 0 ? tEnum("Studio") : `${active?.bedrooms} ${t("bedsLabel")}`}{active?.bathrooms ? ` · ${active.bathrooms} ${t("bathsLabel")}` : ""}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Ruler className="h-3.5 w-3.5 text-accent shrink-0" />
                              {`~${active?.totalArea.toLocaleString()} sqft`}
                            </div>
                            <a
                              href={waLink(`I'd like the floor plan for ${active?.name} at ${project.name}`)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-white"
                              style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
                            >
                              {t("requestFloorPlan")}
                            </a>
                          </div>
                        </div>
                        <p className="px-4 sm:px-6 pb-4 text-[11px] text-muted-foreground text-center sm:text-left">{t("floorPlanOnRequest")}</p>
                      </div>
                    );
                  })()}
                </motion.div>
              )}

              {/* ─── PAYMENT TAB ─── */}
              {activeTab === "payment" && (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4 sm:space-y-8"
                >
                  {/* Starting price card — payment-specific context only */}
                  {project.startingPrice && (
                    <div className="rounded-2xl overflow-hidden border border-border/50">
                      <div className="p-4 sm:p-6" style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}>
                        <p className="text-primary-foreground/60 text-[10px] sm:text-xs uppercase tracking-[0.15em] font-semibold">{t("startingPrice")}</p>
                        <CurrencyPrice aedPrice={project.startingPrice} opts={{ isProject: true }} className="text-2xl sm:text-4xl font-bold text-primary-foreground mt-1 block" />
                        {priceRangeLabel && <p className="text-primary-foreground/50 text-xs sm:text-sm mt-1">{priceRangeLabel}</p>}
                        {paymentPlanPretty && <p className="text-primary-foreground/60 text-xs sm:text-sm mt-1">{paymentPlanPretty}</p>}
                      </div>
                    </div>
                  )}

                  {/* Payment Plan Visual Timeline */}
                  {(() => {
                    const stepColors = ["from-accent to-accent/80", "from-primary to-primary/80", "from-primary to-[#145C42]", "from-accent/70 to-accent/50"];
                    const stepIcons = [Wallet, Building2, Home, CreditCard];
                    const milestones = orderedPaymentSteps.length > 0
                      ? orderedPaymentSteps.map((s, i) => ({
                          label: s.title,
                          pct: s.pct,
                          desc: "",
                          icon: stepIcons[i % stepIcons.length],
                          color: stepColors[i % stepColors.length],
                        }))
                      : (() => {
                          const downPct = parseInt(project.downPayment || "0") || 20;
                          const duringPct = 100 - downPct > 40 ? Math.round((100 - downPct) * 0.6) : 100 - downPct - 20;
                          const handoverPct = 100 - downPct - (duringPct > 0 ? duringPct : 0);
                          return [
                            { label: t("onBooking"), pct: downPct, desc: t("downPaymentDesc"), icon: Wallet, color: "from-accent to-accent/80" },
                            ...(duringPct > 0 ? [{ label: t("duringConstruction"), pct: duringPct, desc: t("progressInstallments"), icon: Building2, color: "from-primary to-primary/80" }] : []),
                            ...(handoverPct > 0 ? [{ label: t("onHandover"), pct: handoverPct, desc: t("balanceOnCompletion"), icon: Home, color: "from-primary to-[#145C42]" }] : []),
                          ];
                        })();
                    return (
                      <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
                        <div className="p-3.5 sm:p-6 flex items-center gap-2.5 sm:gap-3" style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}>
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white/10 flex items-center justify-center">
                            <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                          </div>
                          <div>
                            <h2 className="text-base sm:text-xl font-bold text-white">{t("paymentPlanLabel")}</h2>
                            {paymentPlanPretty && (
                              <p className="text-white/60 text-xs sm:text-sm">{paymentPlanPretty}</p>
                            )}
                          </div>
                        </div>

                        <div className="p-3.5 sm:p-8 space-y-4 sm:space-y-6">
                          {/* Progress bar */}
                          <div className="relative">
                            <div className="flex rounded-full overflow-hidden h-2.5 sm:h-3 bg-muted/50">
                              {milestones.map((m, i) => (
                                <motion.div
                                  key={i}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${m.pct}%` }}
                                  transition={{ delay: 0.3 + i * 0.2, duration: 0.6, ease: "easeOut" }}
                                  className={`bg-gradient-to-r ${m.color} ${i === 0 ? "rounded-l-full" : ""} ${i === milestones.length - 1 ? "rounded-r-full" : ""}`}
                                />
                              ))}
                            </div>
                          </div>

                          {/* Milestone cards */}
                          <div className={`grid grid-cols-1 gap-2.5 sm:gap-4 ${milestones.length === 4 ? "sm:grid-cols-4" : milestones.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}>
                            {milestones.map((m, i) => {
                              const MIcon = m.icon;
                              return (
                                <motion.div
                                  key={i}
                                  initial={{ opacity: 0, y: 15 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.2 + i * 0.1 }}
                                  className="relative bg-card rounded-xl border-l-[3px] border-l-accent border border-border/50 p-3 sm:p-5 hover:shadow-md transition-shadow"
                                >
                                  <div className="flex items-center justify-between sm:block">
                                    <div className="flex items-center gap-2 sm:mb-3">
                                      <MIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-accent" />
                                      <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.12em] text-muted-foreground font-semibold">{m.label}</p>
                                    </div>
                                    <p className="text-xl sm:text-3xl font-bold text-foreground">{m.pct}%</p>
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1">{m.desc}</p>
                                  {project.startingPrice && (
                                    <p className="text-sm font-semibold text-accent mt-2">
                                      {formatPrice(Math.round((project.startingPrice < 1_000 ? project.startingPrice * 1_000_000 : project.startingPrice) * m.pct / 100))}
                                    </p>
                                  )}
                                </motion.div>
                              );
                            })}
                          </div>

                          {/* Payment details */}
                          {project.paymentPlanDetails && !/^Q\d+\./i.test(project.paymentPlanDetails.trim()) && (
                            <div className="p-3 sm:p-4 bg-muted/30 rounded-xl border border-border/30">
                              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{project.paymentPlanDetails}</p>
                            </div>
                          )}

                          {/* Accepted methods */}
                          {project.acceptedPaymentMethods && project.acceptedPaymentMethods.length > 0 && (
                            <div>
                              <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-semibold mb-3">{t("acceptedMethods")}</p>
                              <div className="flex flex-wrap gap-2">
                                {project.acceptedPaymentMethods.map((m: string, i: number) => (
                                  <span key={i} className="text-[11px] sm:text-xs px-3 sm:px-4 py-2 sm:py-2.5 bg-card border border-border rounded-xl text-foreground font-semibold hover:border-primary/30 transition-colors">
                                    {m}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}


                  {/* Units Information */}
                  <div className="bg-card rounded-2xl border border-border/50 p-4 sm:p-6 md:p-8">
                    <div className="flex items-center gap-2.5 mb-4 sm:mb-6">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Bed className="h-4.5 w-4.5 text-primary" />
                      </div>
                      <h2 className="text-lg sm:text-xl font-bold text-foreground">{t("unitsInfo")}</h2>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 sm:gap-4">
                      {[
                        { label: "Unit Types", value: formatUnitTypes(project.unitTypes, ", "), icon: Bed },
                        { label: "Size Range", value: project.unitSizeMin && project.unitSizeMax ? `${Number(project.unitSizeMin).toLocaleString()} - ${Number(project.unitSizeMax).toLocaleString()} sqft` : "-", icon: Ruler },
                      ].map(({ label, value, icon: Icon }) => (
                        <div key={label} className="p-3 sm:p-5 bg-muted/40 rounded-xl text-center hover:bg-muted/60 transition-colors">
                          <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary mx-auto mb-1.5 sm:mb-2" />
                          <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-semibold mb-0.5 sm:mb-1">{label}</p>
                          <p className="text-xs sm:text-sm font-bold text-foreground">{value}</p>
                        </div>
                      ))}
                    </div>
                    {project.availabilityStatus && (
                      <div className="mt-5 flex items-center gap-2.5 p-3 bg-emerald-500/8 rounded-xl border border-emerald-500/15">
                        <span className={`w-2.5 h-2.5 rounded-full ${project.availabilityStatus === "Available" ? "bg-emerald-500 animate-pulse" : "bg-accent"}`} />
                        <span className="text-sm font-semibold text-foreground">{tEnum(project.availabilityStatus)}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* ─── FAQ TAB ─── */}
              {activeTab === "faq" && (
                <motion.div
                  key="faq"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4 sm:space-y-8"
                >
                  {faqs.length > 0 ? (
                    <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
                      <div className="flex items-center gap-2.5 p-3.5 sm:p-6 pb-0 sm:pb-0 mb-3 sm:mb-4">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                          <MessageCircle className="h-3.5 w-3.5 sm:h-4.5 sm:w-4.5 text-primary" />
                        </div>
                        <h2 className="text-base sm:text-xl font-bold text-foreground">{t("faqLabel")}</h2>
                      </div>
                      <div className="px-3.5 sm:px-6 pb-3.5 sm:pb-6">
                        <FaqAccordion faqs={faqs} emitJsonLd={false} allExpanded={defaultTab === "faq"} />
                      </div>
                    </div>
                  ) : (
                    <div className="bg-card rounded-2xl border border-border/50 p-6 text-center">
                      <MessageCircle className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
                      <p className="text-sm text-muted-foreground">{t("noFaqs")}</p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* ─── LOCATION TAB (shared component) ─── */}
              {activeTab === "location" && (
                <motion.div
                  key="location"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  {(() => {
                    let mapSrc = toMapEmbedSrc(project.mapUrl || "");
                    if (!mapSrc && project.latitude && project.longitude) {
                      mapSrc = classicMapEmbed(`${project.latitude},${project.longitude}`);
                    }
                    if (!mapSrc) {
                      mapSrc = classicMapEmbed(`${project.name}, ${project.community || project.city || ""}, ${project.country || "UAE"}`);
                    }
                    // Never use the embed URL as an external link — it only works inside iframes.
                    // Priority: stored googleMapsUrl → lat/lng search → place-name search.
                    const externalMapUrl: string = project.googleMapsUrl
                      || (project.latitude && project.longitude
                          ? `https://www.google.com/maps/search/?api=1&query=${project.latitude},${project.longitude}`
                          : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${project.name} ${project.community || project.city || ""} ${project.country || "UAE"}`.trim())}`);
                    return (
                      <LocationSection
                        community={project.community}
                        city={project.city}
                        country={project.country}
                        mapEmbedSrc={mapSrc}
                        description={project.locationDescription}
                        externalMapUrl={externalMapUrl}
                        nearby={nearby}
                        iconForType={attractionIcon}
                      />
                    );
                  })()}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Crawlable cross-links — the tab bar switches via history.replaceState
                (not crawlable), so these real <a> links let search engines discover
                and pass equity between every sub-page. */}
            <nav aria-label={t("discoverProject")} className="bg-card rounded-2xl border border-border/50 p-4 sm:p-5">
              <p className="text-[10px] uppercase tracking-[0.25em] font-semibold text-accent mb-3">{t("discoverProject")}</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { href: `/project/${project.slug}`, label: t("tabOverview"), active: !defaultTab || defaultTab === "overview" },
                  { href: `/project/${project.slug}/floor-plans`, label: t("floorPlansLabel"), active: defaultTab === "floor-plans" },
                  { href: `/project/${project.slug}/location`, label: t("tabLocation"), active: defaultTab === "location" },
                  { href: `/project/${project.slug}/payment-plan`, label: t("tabPayment"), active: defaultTab === "payment" },
                  { href: `/project/${project.slug}/faq`, label: t("tabFaq"), active: defaultTab === "faq" },
                ].map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    aria-current={l.active ? "page" : undefined}
                    className={`text-xs sm:text-sm font-semibold px-3 py-2 rounded-xl border transition-colors ${
                      l.active
                        ? "border-primary/30 bg-primary/5 text-primary"
                        : "border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/30"
                    }`}
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </nav>

            {/* Mobile-only: Quick Enquiry — after tab content */}
            <div className="sm:hidden space-y-0 mt-4">
              <div className="rounded-2xl rounded-b-none overflow-hidden shadow-lg shadow-foreground/5">
                <div className="relative p-5 overflow-hidden" style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}>
                  <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-accent/20 blur-2xl" />
                  <p className="text-primary-foreground/60 text-xs uppercase tracking-[0.15em] font-semibold mb-1 relative z-10">
                    {t("ctaHeadlineDefault")}
                  </p>
                  <CurrencyPrice aedPrice={project.startingPrice} opts={{ isProject: true }} className="text-3xl font-bold text-primary-foreground relative z-10 block" />
                  {priceRangeLabel && (
                    <p className="text-primary-foreground/50 text-sm mt-1.5 relative z-10">{priceRangeLabel}</p>
                  )}
                </div>
                <div className="px-4 pb-2 pt-2 bg-card border-x border-border/50">
                  <p className="text-[11px] text-muted-foreground text-center">
                    {t("haveQuestions")} <span className="font-semibold text-foreground/70">{t("fillBelow")}</span> ↓
                  </p>
                </div>
              </div>
              <div className="bg-card rounded-2xl rounded-t-none border border-border/50 border-t-0 p-4">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">{t("quickEnquiry")}</p>
                {enquirySubmitted ? (
                  <div className="py-4 space-y-4">
                    {/* Thank-you */}
                    <div className="text-center">
                      <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto mb-2" />
                      <p className="text-sm font-bold text-foreground">{t("sentLabel")}</p>
                      <p className="text-xs text-muted-foreground">{t("callWithin")}</p>
                      <button onClick={() => { setEnquirySubmitted(false); setEnquiryForm({ name: "", email: "", phone: "", countryCode: "+971", unitType: "", message: "", contactMethod: "whatsapp" }); }} className="mt-2 text-xs text-primary font-semibold">{t("sendAnother")}</button>
                    </div>
                    {/* Subscribe CTA */}
                    <div className="border border-border/50 rounded-xl p-3 bg-muted/20 space-y-2">
                      <p className="text-xs font-semibold text-foreground text-center">
                        {t("wantUpdates", { name: project.name })}
                      </p>
                      <div className="flex justify-center">
                        <SubscribeButton
                          slug={project.slug}
                          projectName={project.name}
                          projectImage={project.featuredImage || project.images?.[0] || null}
                          variant="cta"
                          prefillEmail={enquiryForm.email}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleEnquirySubmit} className="space-y-3">
                    <input
                      type="text" required
                      value={enquiryForm.name}
                      onChange={(e) => setEnquiryForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full h-11 rounded-xl bg-muted/30 border border-border/50 px-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all"
                      placeholder={t("namePlaceholder")}
                    />
                    <div className="flex gap-2">
                      <CountryCodeSelect
                        value={enquiryForm.countryCode}
                        onChange={(dial) => setEnquiryForm(f => ({ ...f, countryCode: dial }))}
                        className="h-11 rounded-xl bg-muted/30 border border-border/50 px-2.5 text-sm text-foreground outline-none max-w-[160px]"
                      />
                      <input
                        type="tel" required
                        value={enquiryForm.phone}
                        onChange={(e) => setEnquiryForm(f => ({ ...f, phone: e.target.value }))}
                        className="flex-1 h-11 rounded-xl bg-muted/30 border border-border/50 px-4 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none"
                        placeholder="50 123 4567"
                      />
                    </div>
                    <div className="bg-muted/20 rounded-xl px-3 py-2 border border-border/30">
                      <p className="text-[11px] text-muted-foreground"><span className="font-semibold text-foreground/70">{t("rePrefix")}</span> {project.name}</p>
                    </div>
                    <button
                      type="submit"
                      disabled={enquirySending}
                      className="w-full h-11 rounded-full text-white font-bold text-sm active:scale-[0.98] transition-all disabled:opacity-60"
                      style={{ background: "linear-gradient(to right, #D4A847, #B8922F)" }}
                    >
                      {enquirySending ? t("sending") : t("sendQuickEnquiry")}
                    </button>
                    {enquiryError && <p className="text-xs text-red-600 text-center" role="alert">{tCommon("somethingWentWrong")}</p>}
                    <p className="text-[10px] text-muted-foreground text-center">{t("responseTime")}</p>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* ═══ RIGHT COLUMN — STICKY SIDEBAR ═══ */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-5 -mt-2 sm:mt-0">

              {/* CTA Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="hidden sm:block bg-card rounded-2xl border border-border/50 overflow-hidden shadow-lg shadow-foreground/5 sm:rounded-b-2xl rounded-b-none"
              >
                <div className="relative p-6 overflow-hidden" style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}>
                  <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-accent/20 blur-2xl" />
                  <p className="text-primary-foreground/60 text-xs uppercase tracking-[0.15em] font-semibold mb-1 relative z-10">
                    {t("ctaHeadlineDefault")}
                  </p>
                  <CurrencyPrice aedPrice={project.startingPrice} opts={{ isProject: true }} className="text-3xl font-bold text-primary-foreground relative z-10 block" />
                  {priceRangeLabel && (
                    <p className="text-primary-foreground/50 text-sm mt-1.5 relative z-10">{priceRangeLabel}</p>
                  )}
                </div>
                {/* Desktop: full CTA buttons */}
                <div className="hidden sm:block p-5 space-y-3">
                  {t("ctaSubheadlineDefault") && (
                    <p className="text-sm text-muted-foreground mb-1">{t("ctaSubheadlineDefault")}</p>
                  )}
                  <a
                    onClick={() => trackLead("whatsapp", leadEntity)}
                    href={waLink(`Hi, I'm interested in ${project.name}`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-[#25D366] to-[#1DA851] text-white rounded-full text-sm font-bold transition-all duration-300 shadow-lg shadow-[#25D366]/25 hover:shadow-xl hover:shadow-[#25D366]/35 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <MessageCircle className="h-4 w-4" /> {t("whatsappInquiry")}
                  </a>
                  <a
                    onClick={() => trackLead("phone", leadEntity)}
                    href={`tel:${(project.contactPhone && project.contactPhone.trim()) || "+971549988811"}`}
                    className="w-full flex items-center justify-center gap-2 py-3.5 text-white rounded-full text-sm font-bold transition-all duration-300 shadow-lg shadow-accent/25 hover:shadow-xl hover:shadow-accent/40 hover:scale-[1.02] active:scale-[0.98]"
                    style={{ background: "linear-gradient(to right, #D4A847, #B8922F)" }}
                  >
                    <Phone className="h-4 w-4" /> {t("callNow")}
                  </a>
                  <button
                    type="button"
                    onClick={() => window.dispatchEvent(new CustomEvent("open-ai-chat"))}
                    className="w-full flex items-center justify-center gap-2 py-3 border-2 border-primary/30 text-primary rounded-full text-sm font-semibold transition-all duration-300 hover:bg-gradient-to-r hover:from-primary hover:to-primary/80 hover:text-white hover:border-transparent hover:shadow-lg hover:shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <MessageCircle className="h-4 w-4" /> {t("liveChat")}
                  </button>
                </div>
                {/* Mobile: compact nudge instead of duplicate buttons */}
                <div className="sm:hidden px-4 pb-4 pt-2">
                  <p className="text-[11px] text-muted-foreground text-center">
                    {t("haveQuestions")} <span className="font-semibold text-foreground/70">{t("tapBelow")}</span> {t("toReachUs")} ↓
                  </p>
                </div>
              </motion.div>



              {/* Quick Facts — desktop only */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="hidden sm:block bg-card rounded-2xl border border-border/50 p-5"
              >
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-[0.15em] mb-4">{t("projectDetailsLabel")}</h3>
                <div className="divide-y divide-border/40">
                  {([
                    { label: t("developer"), value: project.developerName, href: interlinkDeveloperHref },
                    { label: t("communityLabel"), value: project.community, href: interlinkCommunityHref },
                    { label: t("cityLabel"), value: `${project.city}, ${project.country}` },
                    { label: t("propertyTypeLabel"), value: project.propertyTypes?.length > 0 ? project.propertyTypes.map((pt: string) => tEnum(pt)).join(" · ") : tEnum(Array.isArray(project.propertyType) ? project.propertyType[0] : project.propertyType), href: interlinkTypeHref },
                    { label: t("projectTypeLabel"), value: tEnum(project.projectType) },
                    { label: t("status"), value: tEnum(project.status) },
                    { label: t("titleType"), value: tEnum(project.titleType) },
                    { label: t("eligibility"), value: tEnum(project.ownershipEligibility) },
                    { label: t("availability"), value: tEnum(project.availabilityStatus) },
                  ] as Array<{ label: string; value: unknown; href?: string }>).filter(f => f.value).map(({ label, value, href }) => (
                    <div key={label} className="flex justify-between items-center py-3.5 sm:py-3 text-sm">
                      <span className="text-muted-foreground">{label}</span>
                      {href ? (
                        <Link href={href} className="text-primary font-semibold text-right max-w-[55%] hover:underline">{value as React.ReactNode}</Link>
                      ) : (
                        <span className="text-foreground font-semibold text-right max-w-[55%]">{value as React.ReactNode}</span>
                      )}
                    </div>
                  ))}
                </div>
                {/* QR Code row — shown only when a real or dummy QR is stored.
                    When absent, no permit is shown; a quiet legal disclaimer
                    is rendered as fine print near the footer instead. */}
                {hasStoredQr && (() => {
                  const QrInner = (
                    <NextImage
                      src={qrSrc}
                      alt="Regulatory Permit QR"
                      width={100}
                      height={100}
                      unoptimized
                      className="w-full h-full rounded-sm"
                    />
                  );
                  const wrapperClass = "w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white border border-border/50 p-1 shadow-sm hover:shadow-md hover:border-primary/30 active:scale-95 transition-all cursor-pointer flex-shrink-0 inline-flex items-center justify-center";
                  return (
                    <div className="mt-4 pt-4 border-t border-border/40 flex items-center gap-3">
                      {hasDirectPermit ? (
                        <a
                          href={qrUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={wrapperClass}
                          title={t("regulatoryPermit")}
                          aria-label={t("regulatoryPermit")}
                        >
                          {QrInner}
                        </a>
                      ) : (
                        <button onClick={() => setShowQrModal(true)} className={wrapperClass} title="Scan QR Code">
                          {QrInner}
                        </button>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground">{t("regulatoryPermit")}</p>
                        {hasDirectPermit && (
                          <p className="text-[10px] text-muted-foreground mt-0.5">{t("openPermit") || "Open document →"}</p>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </motion.div>

              {/* Target Buyers */}
              {project.targetBuyers && project.targetBuyers.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl border border-primary/10 p-5"
                >
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-[0.15em] mb-4 flex items-center gap-2">
                    <Users className="h-3.5 w-3.5 text-primary" /> {t("idealFor")}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {project.targetBuyers.map((b: string, i: number) => {
                      const buyerIcons: Record<string, React.ElementType> = {
                        "End Users": Home,
                        "Investors": TrendingUp,
                        "Families": Users,
                        "Couples": HeartPulse,
                        "First-Time Buyers": Star,
                      };
                      const BuyerIcon = buyerIcons[b] || Users;
                      return (
                        <motion.span
                          key={i}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.7 + i * 0.1 }}
                          className="inline-flex items-center gap-2 px-4 py-2.5 bg-card text-foreground rounded-xl text-xs font-bold border border-border/50 shadow-sm hover:border-primary/30 hover:shadow-md transition-all duration-300"
                        >
                          <BuyerIcon className="h-3.5 w-3.5 text-primary" />
                          {b}
                        </motion.span>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ───── SIMILAR PROJECTS (real data) ───── */}
      {similarProjects.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
          <SimilarItemsCarousel
            title={t("similarProjects")}
            items={similarProjects.map((p) => ({
              key: p._id || p.slug,
              title: p.name,
              location: p.community || "",
              statusLabel: p.status || "Off-Plan",
              priceLabel: p.startingPrice ? formatPrice(p.startingPrice, { isProject: true }) : t("priceOnRequest"),
              priceEyebrow: t("startingFrom"),
              imageUrl: p.featuredImage,
              href: `/project/${p.slug}`,
            }))}
          />
        </div>
      )}

      {/* Per-project testimonials intentionally omitted — Google reviews are
          company-level, not project-specific, so we don't fabricate them here.
          Real company reviews live on the homepage. */}

      {/* ───── BUYER'S GUIDE ───── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 sm:pb-12">
        <div className="flex items-center justify-between mb-5 sm:mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-accent/15 flex items-center justify-center">
              <FileText className="h-4.5 w-4.5 text-accent" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-foreground">{t("buyerGuide")}</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">{t("buyerGuideDesc")}</p>
            </div>
          </div>
          <Link href="/pulse/guides" className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-accent hover:text-accent/80 transition-colors">
            {t("viewAll")} <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 items-stretch">
          {[
            { title: t("guideHowToBuyTitle"), desc: t("guideHowToBuyDesc"), icon: Home, href: "/pulse/guides/how-to-buy-property-in-dubai" },
            { title: t("guideGoldenVisaTitle"), desc: t("guideGoldenVisaDesc"), icon: Shield, href: "/pulse/guides/golden-visa-process" },
            { title: t("guideOffPlanTitle"), desc: t("guideOffPlanDesc"), icon: TrendingUp, href: "/pulse/guides/off-plan-vs-secondary" },
            { title: t("guideDldFeesTitle"), desc: t("guideDldFeesDesc"), icon: CreditCard, href: "/pulse/guides/dld-fees-explained" },
            { title: t("guideTitleDeedTitle"), desc: t("guideTitleDeedDesc"), icon: Compass, href: "/pulse/guides/title-deed-vs-oqood" },
            { title: t("guideNonResidentTitle"), desc: t("guideNonResidentDesc"), icon: Star, href: "/pulse/guides/buying-as-non-resident" },
          ].map((guide, i) => (
            <motion.a
              key={i}
              href={guide.href}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="flex items-start gap-3 rounded-xl border border-border/50 bg-card p-3 sm:p-4 hover:border-primary/30 hover:bg-primary/[0.02] transition-all group h-full"
            >
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/15 transition-colors">
                <guide.icon className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{guide.title}</p>
                <p className="hidden sm:block text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{guide.desc}</p>
              </div>
            </motion.a>
          ))}
        </div>
        <div className="sm:hidden text-center mt-3">
          <Link href="/pulse/guides" className="inline-flex items-center gap-1.5 text-xs font-bold text-accent border border-accent/30 rounded-full px-4 py-2 hover:bg-accent/5 transition-colors">
            {t("viewAllGuides")} <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* ───── FULL GALLERY MODAL (shared component) ───── */}
      <GalleryModal
        open={showGallery}
        onClose={() => setShowGallery(false)}
        images={images}
        activeIndex={activeImage}
        onChange={setActiveImage}
        title={project.name}
      />

      {/* ───── STICKY MOBILE CTA BAR (shared 3-button component — labels live inside) ───── */}
      <DetailStickyCta
        entity={leadEntity}
        whatsappUrl={waLink(`Hi, I'm interested in ${project.name}`)}
        phone={(project.contactPhone && project.contactPhone.trim()) || "+971549988811"}
      />

      {/* QR Code Modal */}
      <AnimatePresence>
        {showQrModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={() => setShowQrModal(false)}
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col items-center gap-3 max-w-[280px] sm:max-w-xs"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-48 h-48 sm:w-56 sm:h-56">
                {hasStoredQr && (
                  <NextImage
                    src={qrSrc}
                    alt="Regulatory Permit QR"
                    width={400}
                    height={400}
                    unoptimized
                    className="w-full h-full"
                  />
                )}
              </div>
              <p className="text-sm font-semibold text-foreground text-center">{project.name}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t("regulatoryPermit")}</p>
              <button
                onClick={() => setShowQrModal(false)}
                className="mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {t("tapToClose")}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quiet legal disclaimer — only when no regulator/dummy permit QR exists.
          Kept as low-contrast fine print for compliance cover, not prominence. */}
      {!hasStoredQr && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-6">
          <p className="text-[10px] leading-relaxed text-muted-foreground/45">{t("infoOnlyNote")}</p>
        </div>
      )}

      <Footer />
      <div className="hidden lg:block">
        <WhatsAppButton />
        <AIChatWidget />
      </div>

      <BrochureRequestModal
        open={brochureModalOpen}
        onClose={() => setBrochureModalOpen(false)}
        projectName={project.name}
        projectSlug={project.slug}
        brochureUrl={project.brochureUrl}
      />
    </div>
  );
};

export default ProjectDetailClient;
