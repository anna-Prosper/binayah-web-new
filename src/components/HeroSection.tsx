"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Building2, ChevronDown, Loader2, MapPin, MessageCircle, Search, Sparkles, X, Zap } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { apiUrl } from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import ParticleConstellation from "./ParticleConstellation";
import TypewriterHeadline from "./TypewriterHeadline";
import { useTranslations } from "next-intl";
import { formatPropertyTypeLabel, normalizePropertyType } from "@/lib/property-types";
import {
  buildHomeSearchUrl,
  createEmptyHomeSearchDraft,
  formatIntentLabel,
  getBudgetOptionsForIntent,
  getHomeSearchPlaceholderPool,
  HOME_SEARCH_BATHROOM_OPTIONS,
  HOME_SEARCH_BEDROOM_OPTIONS,
  HOME_SEARCH_PROPERTY_TYPES,
  HomeSearchDraft,
  HomeSearchRoutePayload,
  HomeSearchSuggestion,
  HomeSearchSuggestionGroups,
  HomeSearchTab,
  normalizeTabToIntent,
  parseHomeSearchQuery,
} from "@/lib/home-smart-search";

const heroImage = "/assets/dubai-hero.webp";

const statusTabs: HomeSearchTab[] = ["Buy", "Rent", "Off-Plan"];
const popularLocations = [
  { name: "Dubai Marina", city: "Dubai" },
  { name: "Downtown Dubai", city: "Dubai" },
  { name: "Business Bay", city: "Dubai" },
  { name: "Palm Jumeirah", city: "Dubai" },
  { name: "JBR", city: "Dubai" },
  { name: "Dubai Hills Estate", city: "Dubai" },
  { name: "Creek Harbour", city: "Dubai" },
  { name: "JVC", city: "Dubai" },
  { name: "DIFC", city: "Dubai" },
  { name: "MBR City", city: "Dubai" },
  { name: "Jumeirah", city: "Dubai" },
  { name: "Arabian Ranches", city: "Dubai" },
  { name: "Al Reem Island", city: "Abu Dhabi" },
  { name: "Saadiyat Island", city: "Abu Dhabi" },
  { name: "Yas Island", city: "Abu Dhabi" },
];

const emptySuggestions: HomeSearchSuggestionGroups = {
  askAi: [],
  communities: [],
  developers: [],
  places: [],
  projects: [],
  smart: [],
};

interface PlacePrediction {
  area: string;
  city: string;
  description: string;
}

const HeroSection = () => {
  const t = useTranslations("home.hero");
  const tNav = useTranslations("nav");
  const tabLabel = (tab: HomeSearchTab) =>
    tab === "Buy" ? tNav("buy") : tab === "Rent" ? tNav("rent") : tNav("offPlan");
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<HomeSearchTab>("Buy");
  const [smartSearch, setSmartSearch] = useState("");
  const [smartDraft, setSmartDraft] = useState<HomeSearchDraft>(createEmptyHomeSearchDraft("buy"));
  const [parsedTags, setParsedTags] = useState<HomeSearchDraft["tags"]>([]);
  const [isQuestion, setIsQuestion] = useState(false);
  const [selLocation, setSelLocation] = useState("");
  const [selType, setSelType] = useState("");
  const [selBedroom, setSelBedroom] = useState("");
  const [selBathroom, setSelBathroom] = useState("");
  const [selBudget, setSelBudget] = useState("");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [locationSearch, setLocationSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [smartSuggestions, setSmartSuggestions] = useState<HomeSearchSuggestionGroups>(emptySuggestions);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [highlightedSuggestion, setHighlightedSuggestion] = useState(-1);
  const [isSmartLoading, setIsSmartLoading] = useState(false);
  const [communityInfoResult, setCommunityInfoResult] = useState<{ name: string; slug: string } | null>(null);
  const filtersRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const smartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const smartRequestRef = useRef(0);
  const ref = useRef<HTMLDivElement>(null);

  const activeIntent = normalizeTabToIntent(activeTab);
  const budgetOptions = getBudgetOptionsForIntent(activeIntent);
  const searchPlaceholders = getHomeSearchPlaceholderPool(activeIntent);
  const suggestionSections = getSuggestionSections(smartSuggestions);
  const flatSuggestions = suggestionSections.flatMap((section) => section.items);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  useEffect(() => {
    setPlaceholderIndex(0);
    const interval = setInterval(() => {
      setPlaceholderIndex((current) => (current + 1) % searchPlaceholders.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [activeTab]);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (filtersRef.current && !filtersRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setHighlightedSuggestion(-1);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    return () => {
      if (smartTimerRef.current) clearTimeout(smartTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (selBudget && !budgetOptions.some((option) => option === selBudget)) {
      setSelBudget("");
    }
  }, [activeTab, selBudget]);

  useEffect(() => {
    if (!smartSearch.trim()) {
      const draft = createEmptyHomeSearchDraft(activeIntent);
      setSmartDraft(draft);
      setParsedTags([]);
      setIsQuestion(false);
      setSmartSuggestions(emptySuggestions);
      setCommunityInfoResult(null);
      setHighlightedSuggestion(-1);
      return;
    }

    runSmartSearch(smartSearch, { keepMenuOpen: showSuggestions });
  }, [activeTab]);

  const runSmartSearch = (value: string, options: { keepMenuOpen?: boolean } = {}) => {
    const localDraft = parseHomeSearchQuery(value, { defaultIntent: activeIntent });
    const trimmed = value.trim();

    setSmartDraft(localDraft);
    setParsedTags(localDraft.tags);
    setIsQuestion(localDraft.isQuestion);
    setShowSuggestions(options.keepMenuOpen ?? trimmed.length >= 2);

    if (smartTimerRef.current) clearTimeout(smartTimerRef.current);

    if (trimmed.length < 2) {
      setIsSmartLoading(false);
      setSmartSuggestions(emptySuggestions);
      setHighlightedSuggestion(-1);
      return;
    }

    const requestId = ++smartRequestRef.current;
    setIsSmartLoading(true);
    smartTimerRef.current = setTimeout(async () => {
      const [smartResult, placesResult] = await Promise.allSettled([
        fetch(apiUrl(`/api/home-smart-search?q=${encodeURIComponent(trimmed)}&tab=${encodeURIComponent(activeTab)}`), { cache: "no-store" }),
        fetch(apiUrl(`/api/places?q=${encodeURIComponent(trimmed)}`), { cache: "no-store" }),
      ]);

      if (smartRequestRef.current !== requestId) return;

      let nextDraft = localDraft;
      let nextSuggestions = emptySuggestions;

      if (smartResult.status === "fulfilled" && smartResult.value.ok) {
        try {
          const payload = await smartResult.value.json() as HomeSearchRoutePayload;
          if (payload?.draft) nextDraft = payload.draft;
          if (payload?.suggestions) {
            nextSuggestions = {
              ...emptySuggestions,
              ...payload.suggestions,
            };
          }
        } catch {
          nextSuggestions = emptySuggestions;
        }
      }

      if (placesResult.status === "fulfilled" && placesResult.value.ok) {
        try {
          const payload = await placesResult.value.json() as { predictions?: PlacePrediction[] };
          nextSuggestions = {
            ...nextSuggestions,
            places: mapPlacePredictions(payload.predictions ?? []),
          };
        } catch {
          nextSuggestions = { ...nextSuggestions, places: [] };
        }
      }

      setSmartDraft(nextDraft);
      setParsedTags(nextDraft.tags);
      setIsQuestion(nextDraft.isQuestion);
      setSmartSuggestions(nextSuggestions);
      setHighlightedSuggestion(countSuggestionItems(nextSuggestions) > 0 ? 0 : -1);
      setIsSmartLoading(false);
      if (searchRef.current?.contains(document.activeElement)) {
        setShowSuggestions(true);
      }

      // When zero project/listing results come back for a meaningful query,
      // check community_info_pages for a matching informational page.
      if (countSuggestionItems(nextSuggestions) === 0 && trimmed.length >= 3) {
        try {
          const ciRes = await fetch(`/api/community-info?q=${encodeURIComponent(trimmed)}`, { cache: "no-store" });
          if (smartRequestRef.current !== requestId) return; // stale
          if (ciRes.ok) {
            const ciData = await ciRes.json() as { exists: boolean; data?: { name: string; slug: string } };
            if (ciData.exists && ciData.data?.slug) {
              setCommunityInfoResult({ name: ciData.data.name, slug: ciData.data.slug });
              setShowSuggestions(true);
            } else {
              setCommunityInfoResult(null);
            }
          }
        } catch {
          // Silently skip — no community info result shown
          setCommunityInfoResult(null);
        }
      } else {
        setCommunityInfoResult(null);
      }
    }, 280);
  };

  const handleSmartInput = (value: string) => {
    setSmartSearch(value);
    runSmartSearch(value);
  };

  const clearSmartSearch = () => {
    if (smartTimerRef.current) clearTimeout(smartTimerRef.current);
    setSmartSearch("");
    setSmartDraft(createEmptyHomeSearchDraft(activeIntent));
    setParsedTags([]);
    setIsQuestion(false);
    setShowSuggestions(false);
    setSmartSuggestions(emptySuggestions);
    setCommunityInfoResult(null);
    setHighlightedSuggestion(-1);
    setIsSmartLoading(false);
  };

  const getManualDraft = (): Partial<HomeSearchDraft> => ({
    bathrooms: selBathroom || null,
    bedrooms: selBedroom || null,
    budgetLabel: selBudget || null,
    budgetMax: null,
    budgetMin: null,
    city: null,
    developer: null,
    furnishing: null,
    intent: activeIntent,
    location: selLocation || null,
    project: null,
    propertyType: selType ? String(normalizePropertyType(selType, selType)) : null,
  });

  const applyDraftToFilters = (draft: Partial<HomeSearchDraft>) => {
    if (draft.intent) setActiveTab(formatIntentLabel(draft.intent) as HomeSearchTab);
    if (draft.location) setSelLocation(draft.location);
    if (draft.propertyType) setSelType(String(normalizePropertyType(draft.propertyType, draft.propertyType)));
    if (draft.bedrooms) setSelBedroom(draft.bedrooms);
    if (draft.bathrooms) setSelBathroom(draft.bathrooms);
    if (draft.budgetLabel) setSelBudget(draft.budgetLabel);
  };

  const shouldOpenAi = (query: string, draft: Partial<HomeSearchDraft>, forceAskAi = false) => {
    if (forceAskAi) return true;

    const signalCount = [
      draft.intent,
      draft.location,
      draft.project,
      draft.developer,
      draft.propertyType,
      draft.bedrooms,
      draft.bathrooms,
      draft.budgetLabel,
    ].filter(Boolean).length;

    return Boolean(query.trim()) && Boolean(draft.isQuestion) && signalCount < 3;
  };

  const openAiChat = (question: string) => {
    window.dispatchEvent(new CustomEvent("open-ai-chat", { detail: { question } }));
  };

  const executeSmartAction = (options: {
    draft?: Partial<HomeSearchDraft>;
    forceAskAi?: boolean;
    query?: string;
  } = {}) => {
    const query = String(options.query ?? smartSearch).trim();
    const nextDraft = {
      ...smartDraft,
      ...Object.fromEntries(Object.entries(options.draft ?? {}).filter(([, value]) => value != null)),
    };
    const manualDraft = { ...getManualDraft() };

    if (options.draft) {
      for (const [key, value] of Object.entries(options.draft)) {
        if (value != null && key in manualDraft) {
          (manualDraft as Record<string, unknown>)[key] = null;
        }
      }
    }

    if (shouldOpenAi(query, nextDraft, options.forceAskAi)) {
      if (query) openAiChat(query);
      return;
    }

    applyDraftToFilters(nextDraft);
    setShowSuggestions(false);
    setOpenDropdown(null);

    router.push(buildHomeSearchUrl({
      activeTab: nextDraft.intent ? formatIntentLabel(nextDraft.intent) as HomeSearchTab : activeTab,
      draft: nextDraft,
      manual: manualDraft,
      query,
    }));
  };

  const handleSearch = () => {
    executeSmartAction();
  };

  const handleSuggestionSelect = (suggestion: HomeSearchSuggestion) => {
    if (suggestion.kind !== "ask-ai") {
      setSmartSearch(suggestion.query);
    }

    executeSmartAction({
      draft: suggestion.parsed,
      forceAskAi: suggestion.kind === "ask-ai",
      query: suggestion.query,
    });
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" && flatSuggestions.length > 0) {
      event.preventDefault();
      setShowSuggestions(true);
      setHighlightedSuggestion((current) => (current + 1) % flatSuggestions.length);
      return;
    }

    if (event.key === "ArrowUp" && flatSuggestions.length > 0) {
      event.preventDefault();
      setShowSuggestions(true);
      setHighlightedSuggestion((current) => (current <= 0 ? flatSuggestions.length - 1 : current - 1));
      return;
    }

    if (event.key === "Escape") {
      setShowSuggestions(false);
      setHighlightedSuggestion(-1);
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      if (showSuggestions && highlightedSuggestion >= 0 && flatSuggestions[highlightedSuggestion]) {
        handleSuggestionSelect(flatSuggestions[highlightedSuggestion]);
        return;
      }

      handleSearch();
    }
  };

  return (
    <section ref={ref} className="relative min-h-[auto] sm:min-h-screen flex items-end sm:items-center justify-center pt-16 pb-8 sm:pt-0 sm:pb-0" style={{ overflow: "visible" }}>
      <motion.div className="absolute inset-0 overflow-hidden" style={{ y: imageY }}>
        <Image src={heroImage} alt="Dubai skyline" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/70" />
      </motion.div>

      <div className="hidden sm:block"><ParticleConstellation /></div>

      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 2 }}>
        <div className="absolute top-1/4 left-8 w-px h-32 bg-gradient-to-b from-transparent via-accent/30 to-transparent hidden lg:block" />
        <div className="absolute top-1/3 right-8 w-px h-24 bg-gradient-to-b from-transparent via-white/20 to-transparent hidden lg:block" />
      </div>

      <div ref={searchRef} className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 pt-12 sm:pt-24 pb-6 sm:pb-12">
        <motion.div style={{ y: textY, opacity }}>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }} className="text-center mb-8 sm:mb-14">
            <motion.div initial={{ width: 0 }} animate={{ width: "3rem" }} transition={{ duration: 0.8, delay: 0.3 }} className="h-[2px] bg-accent mx-auto mb-4 sm:mb-6" />
            <p className="hidden sm:block text-accent font-medium tracking-[0.4em] uppercase text-[10px] sm:text-sm mb-3 sm:mb-5">{t("companyName")}</p>
            <h1 className="text-3xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white leading-[0.95] mb-4 sm:mb-6">
              <TypewriterHeadline /><br /><span className="italic font-light">{t("dubaiItalic")}</span>
            </h1>
            <p className="hidden sm:block text-white/60 text-sm sm:text-lg max-w-xl mx-auto font-light px-4 sm:px-0">
              {t("subtitle")}
            </p>
            <p className="sm:hidden text-white/50 text-xs font-light">{t("mobileSubtitle")}</p>
          </motion.div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }} className="sm:hidden w-full">
          <div className="flex gap-0.5 mb-0">
            {statusTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 text-[10px] font-bold tracking-[0.15em] uppercase rounded-t-xl transition-all duration-300 focus:outline-none ${activeTab === tab ? "text-white shadow-lg" : "bg-white/8 text-white/60 backdrop-blur-sm border-t border-x border-white/10"}`}
                style={activeTab === tab ? { background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" } : undefined}
              >
                {tabLabel(tab)}
              </button>
            ))}
          </div>

          <div className="backdrop-blur-2xl rounded-b-2xl shadow-2xl border border-white/20 p-3.5" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.08) 100%)" }}>
            <div className="relative mb-3">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none z-10">
                <Sparkles className="h-4 w-4" style={{ color: "#D4A847" }} />
              </div>
              <input
                value={smartSearch}
                onChange={(event) => handleSmartInput(event.target.value)}
                onKeyDown={handleInputKeyDown}
                onFocus={() => setShowSuggestions(smartSearch.trim().length >= 2)}
                placeholder={`Try: ${searchPlaceholders[placeholderIndex]}`}
                className="w-full pl-10 pr-11 py-3.5 bg-white border border-white/30 rounded-2xl text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/50 transition-all shadow-sm"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40">
                {isSmartLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : smartSearch ? (
                  <button onClick={clearSmartSearch} className="p-1">
                    <X className="h-4 w-4" />
                  </button>
                ) : null}
              </div>
            </div>

            {smartSearch.trim() && (
              <p className="text-[11px] text-white/70 mb-3">
                {isQuestion ? "This looks conversational. Search will open Binayah AI." : smartDraft.summary}
              </p>
            )}

            {parsedTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {parsedTags.slice(0, 4).map((tag) => (
                  <span key={tag.key} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-medium text-accent border border-accent/20" style={{ background: "rgba(212,168,71,0.1)" }}>
                    <Zap className="h-2.5 w-2.5" />
                    <span className="opacity-60">{tag.label}:</span> {tag.value}
                  </span>
                ))}
              </div>
            )}

            <button
              onClick={handleSearch}
              className="w-full text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2.5 transition-all hover:shadow-xl active:scale-[0.98] text-sm tracking-wide uppercase"
              style={{ background: "linear-gradient(135deg, #D4A847, #B8922F)", boxShadow: "0 4px 20px rgba(212,168,71,0.3)" }}
            >
              {isQuestion ? <MessageCircle className="h-4 w-4" /> : <Search className="h-4 w-4" />}
              {isQuestion ? t("askAiCta") : t("searchCta")}
            </button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }} className="hidden sm:block w-full max-w-5xl mx-auto">
          <div className="flex justify-center gap-px mb-0">
            {statusTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative px-5 sm:px-8 py-2.5 sm:py-3 text-[11px] sm:text-xs font-semibold tracking-[0.15em] uppercase rounded-t-xl transition-all duration-300 focus:outline-none ${activeTab === tab ? "text-white shadow-lg" : "bg-white/8 text-white/70 hover:bg-white/15 backdrop-blur-sm hover:text-white border-t border-x border-white/10"}`}
                style={activeTab === tab ? { background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" } : undefined}
              >
                {tabLabel(tab)}
              </button>
            ))}
          </div>

          <div className="backdrop-blur-2xl rounded-b-2xl rounded-tr-2xl shadow-2xl border border-white/20 overflow-visible" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.08) 100%)" }}>
            <div className="px-5 sm:px-7 pt-5 sm:pt-6">
              <div className="relative">
                <div className="flex items-center">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none z-10">
                    <Sparkles className="h-4 w-4" style={{ color: "#D4A847" }} />
                    <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:block" style={{ color: "#D4A847" }}>{t("smartAiSearch")}</span>
                  </div>
                  <input
                    value={smartSearch}
                    onChange={(event) => handleSmartInput(event.target.value)}
                    onFocus={() => setShowSuggestions(smartSearch.trim().length >= 2)}
                    onKeyDown={handleInputKeyDown}
                    placeholder={`Try: ${searchPlaceholders[placeholderIndex]}`}
                    className="w-full pl-32 sm:pl-36 pr-14 py-4 bg-white border border-white/30 rounded-2xl text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/50 transition-all shadow-sm"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3 text-white/40">
                    {isSmartLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                    {smartSearch ? (
                      <button onClick={clearSmartSearch} className="p-1 text-white/40 hover:text-white">
                        <X className="h-4 w-4" />
                      </button>
                    ) : (
                      <div className="text-[10px] text-white/30 hidden sm:block">{t("cmdK")}</div>
                    )}
                  </div>
                </div>

                {showSuggestions && (isSmartLoading || countSuggestionItems(smartSuggestions) > 0 || communityInfoResult) && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-card/95 backdrop-blur-xl rounded-2xl border border-border/60 shadow-2xl z-[9999] overflow-hidden">
                    <div className="max-h-[26rem] overflow-y-auto">
                      {suggestionSections.map((section) => (
                        <div key={section.title} className="border-b border-border/30 last:border-b-0">
                          <p className="px-4 pt-3 pb-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{section.title}</p>
                          {section.items.map((item) => {
                            const itemIndex = flatSuggestions.findIndex((entry) => entry.id === item.id);
                            const active = itemIndex === highlightedSuggestion;
                            return (
                              <button
                                key={item.id}
                                onMouseDown={(event) => {
                                  event.preventDefault();
                                  handleSuggestionSelect(item);
                                }}
                                onMouseEnter={() => setHighlightedSuggestion(itemIndex)}
                                className={`w-full text-left px-4 py-3.5 flex items-center gap-3 transition-colors border-t border-border/10 ${active ? "bg-primary/8" : "hover:bg-muted/60"}`}
                              >
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${active ? "bg-primary/12" : "bg-muted/60"}`}>
                                  {renderSuggestionIcon(item)}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className={`text-sm font-medium truncate ${active ? "text-primary" : "text-foreground"}`}>{item.title}</p>
                                  {item.subtitle && (
                                    <p className="text-xs text-muted-foreground truncate">{item.subtitle}</p>
                                  )}
                                </div>
                                {item.badge && (
                                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full bg-primary/10 text-primary">
                                    {item.badge}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      ))}

                      {/* Community Information row — shown when project search returns zero results */}
                      {communityInfoResult && (
                        <div className="border-t border-border/30">
                          <p className="px-4 pt-3 pb-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Community Guide</p>
                          <Link
                            href={`/communities/${communityInfoResult.slug}`}
                            onMouseDown={(e: React.MouseEvent) => e.preventDefault()}
                            onClick={() => setShowSuggestions(false)}
                            className="w-full text-left px-4 py-3.5 flex items-center gap-3 transition-colors hover:bg-muted/60"
                          >
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-accent/10">
                              <Building2 className="h-4 w-4 text-accent" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium truncate text-foreground">{communityInfoResult.name}</p>
                              <p className="text-xs text-muted-foreground truncate">Community information</p>
                            </div>
                            <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full bg-accent/10 text-accent">
                              Guide
                            </span>
                          </Link>
                        </div>
                      )}
                    </div>
                    <div className="px-4 py-2.5 text-[10px] text-muted-foreground border-t border-border/30 bg-muted/20 flex items-center justify-between">
                      <span>{t("enterToSearch")}</span>
                      <span>{t("arrowsToBrowse")}</span>
                    </div>
                  </div>
                )}
              </div>

              {smartSearch.trim() && (
                <div className="mt-2 flex items-center justify-between gap-3">
                  <p className="text-xs text-white/70">
                    {isQuestion ? "This looks conversational. Search will open Binayah AI instead of listing results." : smartDraft.summary}
                  </p>
                  {!isQuestion && smartDraft.confidence > 0 ? (
                    <span className="text-[10px] text-white/50 uppercase tracking-wider whitespace-nowrap">
                      {`${Math.round(smartDraft.confidence * 100)}% ${t("match")}`}
                    </span>
                  ) : null}
                </div>
              )}

              {isQuestion && smartSearch.trim() ? (
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium text-accent border border-accent/20" style={{ background: "rgba(212,168,71,0.1)" }}>
                    <MessageCircle className="h-3 w-3" /> {t("looksLikeQuestion")}
                  </span>
                </div>
              ) : parsedTags.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {parsedTags.map((tag) => (
                    <span key={tag.key} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium text-accent border border-accent/20" style={{ background: "rgba(212,168,71,0.1)" }}>
                      <Zap className="h-2.5 w-2.5" />
                      <span className="opacity-60">{tag.label}:</span> {tag.value}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="px-5 sm:px-7 pb-5 sm:pb-7 pt-3">
              <div ref={filtersRef} className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 relative" style={{ overflow: "visible" }}>
                <div className="relative">
                  <label className="text-[11px] font-semibold tracking-[0.15em] text-white/70 uppercase block mb-1.5">{t("filterLocation")}</label>
                  <button
                    onClick={() => setOpenDropdown(openDropdown === "location" ? null : "location")}
                    className="w-full bg-white/95 hover:bg-white border border-white/40 rounded-xl px-3.5 py-[11px] text-sm text-left flex items-center justify-between transition-all focus:outline-none focus:ring-2 focus:ring-accent/30 shadow-sm backdrop-blur-md"
                  >
                    <span className={selLocation ? "text-foreground font-medium" : "text-muted-foreground"}>{selLocation || t("filterLocation")}</span>
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${openDropdown === "location" ? "rotate-180" : ""}`} />
                  </button>
                  {openDropdown === "location" && (
                    <div className="absolute top-full left-0 mt-2 w-80 bg-card/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-border/50 z-[9999] overflow-hidden">
                      <div className="p-3 border-b border-border/50">
                        <input
                          value={locationSearch}
                          onChange={(event) => setLocationSearch(event.target.value)}
                          placeholder="Search areas..."
                          autoFocus
                          className="w-full px-3 py-2 text-sm bg-muted/50 rounded-xl border border-border/50 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/40 transition-all"
                        />
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        <p className="px-4 pt-3 pb-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t("popularLocations")}</p>
                        {popularLocations
                          .filter((location) => !locationSearch || location.name.toLowerCase().includes(locationSearch.toLowerCase()))
                          .map((location) => (
                            <button
                              key={location.name}
                              onMouseDown={(event) => {
                                event.preventDefault();
                                setSelLocation(location.name);
                                setLocationSearch("");
                                setOpenDropdown(null);
                              }}
                              className={`w-full text-left px-4 py-2.5 flex items-center gap-3 hover:bg-primary/5 transition-colors border-b border-border/20 last:border-0 ${selLocation === location.name ? "bg-primary/8" : ""}`}
                            >
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${selLocation === location.name ? "bg-primary/15" : "bg-muted"}`}>
                                <MapPin className={`h-3.5 w-3.5 ${selLocation === location.name ? "text-primary" : "text-muted-foreground"}`} />
                              </div>
                              <div>
                                <p className={`text-sm font-medium ${selLocation === location.name ? "text-primary" : "text-foreground"}`}>{location.name}</p>
                                <p className="text-xs text-muted-foreground">{location.city}</p>
                              </div>
                              {selLocation === location.name && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="relative">
                  <label className="text-[11px] font-semibold tracking-[0.15em] text-white/70 uppercase block mb-1.5">{t("filterPropertyType")}</label>
                  <button
                    onClick={() => setOpenDropdown(openDropdown === "type" ? null : "type")}
                    className="w-full bg-white/95 hover:bg-white border border-white/40 rounded-xl px-3.5 py-[11px] text-sm text-left flex items-center justify-between transition-all focus:outline-none focus:ring-2 focus:ring-accent/30 shadow-sm backdrop-blur-md"
                  >
                    <span className={selType ? "text-foreground font-medium" : "text-muted-foreground"}>{selType ? formatPropertyTypeLabel(selType, selType) : t("filterPropertyType")}</span>
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${openDropdown === "type" ? "rotate-180" : ""}`} />
                  </button>
                  {openDropdown === "type" && (
                    <div className="absolute top-full left-0 mt-2 w-56 bg-card/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-border/50 z-[9999] overflow-hidden">
                      <div className="p-1.5">
                        {HOME_SEARCH_PROPERTY_TYPES.map((propertyType) => (
                          <button
                            key={propertyType}
                            onMouseDown={(event) => {
                              event.preventDefault();
                              setSelType(selType === propertyType ? "" : propertyType);
                              setOpenDropdown(null);
                            }}
                            className={`w-full text-left px-4 py-3 text-sm rounded-xl transition-colors flex items-center justify-between ${selType === propertyType ? "font-semibold text-primary bg-primary/8" : "text-foreground hover:bg-muted/60"}`}
                          >
                            {formatPropertyTypeLabel(propertyType, propertyType)}
                            {selType === propertyType && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="relative">
                  <label className="text-[11px] font-semibold tracking-[0.15em] text-white/70 uppercase block mb-1.5">{t("filterBedsBaths")}</label>
                  <button
                    onClick={() => setOpenDropdown(openDropdown === "beds" ? null : "beds")}
                    className="w-full bg-white/95 hover:bg-white border border-white/40 rounded-xl px-3.5 py-[11px] text-sm text-left flex items-center justify-between transition-all focus:outline-none focus:ring-2 focus:ring-accent/30 shadow-sm backdrop-blur-md"
                  >
                    <span className={(selBedroom || selBathroom) ? "text-foreground font-medium" : "text-muted-foreground"}>
                      {[selBedroom && `${selBedroom} bed`, selBathroom && `${selBathroom} bath`].filter(Boolean).join(", ") || t("filterBedsBaths")}
                    </span>
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${openDropdown === "beds" ? "rotate-180" : ""}`} />
                  </button>
                  {openDropdown === "beds" && (
                    <div className="absolute top-full left-0 mt-2 w-72 bg-card/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-border/50 z-[9999] p-4">
                      <div className="mb-4">
                        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2.5">{t("bedrooms")}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {HOME_SEARCH_BEDROOM_OPTIONS.map((bedroom) => (
                            <button
                              key={bedroom}
                              onMouseDown={(event) => {
                                event.preventDefault();
                                setSelBedroom(selBedroom === bedroom ? "" : bedroom);
                              }}
                              className={`min-w-[36px] h-9 px-2.5 rounded-xl text-sm font-semibold transition-all ${selBedroom === bedroom ? "text-white shadow-sm" : "bg-muted/60 text-foreground hover:bg-primary/10 hover:text-primary"}`}
                              style={selBedroom === bedroom ? { background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" } : undefined}
                            >
                              {bedroom}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="border-t border-border/40 pt-3.5">
                        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2.5">{t("bathrooms")}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {HOME_SEARCH_BATHROOM_OPTIONS.map((bathroom) => (
                            <button
                              key={bathroom}
                              onMouseDown={(event) => {
                                event.preventDefault();
                                setSelBathroom(selBathroom === bathroom ? "" : bathroom);
                              }}
                              className={`min-w-[36px] h-9 px-2.5 rounded-xl text-sm font-semibold transition-all ${selBathroom === bathroom ? "text-white shadow-sm" : "bg-muted/60 text-foreground hover:bg-primary/10 hover:text-primary"}`}
                              style={selBathroom === bathroom ? { background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" } : undefined}
                            >
                              {bathroom}
                            </button>
                          ))}
                        </div>
                      </div>
                      {(selBedroom || selBathroom) && (
                        <button
                          onMouseDown={(event) => {
                            event.preventDefault();
                            setSelBedroom("");
                            setSelBathroom("");
                          }}
                          className="mt-3 text-[11px] text-muted-foreground hover:text-primary transition-colors underline underline-offset-2"
                        >
                          {t("clearSelection")}
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="relative">
                  <label className="text-[11px] font-semibold tracking-[0.15em] text-white/70 uppercase block mb-1.5">{t("filterBudget")}</label>
                  <button
                    onClick={() => setOpenDropdown(openDropdown === "budget" ? null : "budget")}
                    className="w-full bg-white/95 hover:bg-white border border-white/40 rounded-xl px-3.5 py-[11px] text-sm text-left flex items-center justify-between transition-all focus:outline-none focus:ring-2 focus:ring-accent/30 shadow-sm backdrop-blur-md"
                  >
                    <span className={selBudget ? "text-foreground font-medium" : "text-muted-foreground"}>{selBudget || t("filterBudget")}</span>
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${openDropdown === "budget" ? "rotate-180" : ""}`} />
                  </button>
                  {openDropdown === "budget" && (
                    <div className="absolute top-full left-0 mt-2 w-56 bg-card/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-border/50 z-[9999] overflow-hidden">
                      <div className="p-1.5">
                        {budgetOptions.map((budget) => (
                          <button
                            key={budget}
                            onMouseDown={(event) => {
                              event.preventDefault();
                              setSelBudget(selBudget === budget ? "" : budget);
                              setOpenDropdown(null);
                            }}
                            className={`w-full text-left px-4 py-3 text-sm rounded-xl transition-colors flex items-center justify-between ${selBudget === budget ? "font-semibold text-primary bg-primary/8" : "text-foreground hover:bg-muted/60"}`}
                          >
                            <span>AED {budget}</span>
                            {selBudget === budget && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col justify-end col-span-2 lg:col-span-1">
                  <button
                    onClick={handleSearch}
                    className="w-full text-white py-[13px] rounded-xl font-bold flex items-center justify-center gap-2.5 transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] text-sm tracking-wide uppercase"
                    style={{ background: "linear-gradient(135deg, #D4A847, #B8922F)", boxShadow: "0 4px 20px rgba(212,168,71,0.3)" }}
                  >
                    {isQuestion ? <MessageCircle className="h-4 w-4" /> : <Search className="h-4 w-4" />}
                    {isQuestion && smartSearch.trim() ? t("askAiCta") : t("searchCta")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 hidden sm:block" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}>
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center pt-2">
          <div className="w-1 h-2 rounded-full bg-white/60" />
        </motion.div>
      </motion.div>
    </section>
  );
};

function renderSuggestionIcon(suggestion: HomeSearchSuggestion) {
  if (suggestion.kind === "community" || suggestion.kind === "place") {
    return <MapPin className="h-4 w-4 text-primary" />;
  }

  if (suggestion.kind === "project" || suggestion.kind === "developer") {
    return <Building2 className="h-4 w-4 text-primary" />;
  }

  if (suggestion.kind === "ask-ai") {
    return <MessageCircle className="h-4 w-4 text-accent" />;
  }

  return <Search className="h-4 w-4 text-primary" />;
}

function getSuggestionSections(suggestions: HomeSearchSuggestionGroups) {
  return [
    { title: "Quick Search", items: suggestions.smart },
    { title: "Communities", items: suggestions.communities },
    { title: "Projects", items: suggestions.projects },
    { title: "Developers", items: suggestions.developers },
    { title: "Places", items: suggestions.places },
    { title: "Ask AI", items: suggestions.askAi },
  ].filter((section) => section.items.length > 0);
}

function mapPlacePredictions(predictions: PlacePrediction[]) {
  return predictions.slice(0, 4).map((prediction) => {
    const location = prediction.area || prediction.description.split(",")[0].trim();
    return {
      badge: prediction.city || "UAE",
      id: `place-${location.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      kind: "place" as const,
      parsed: {
        city: prediction.city || null,
        location,
      },
      query: location,
      subtitle: prediction.description,
      title: location,
    };
  });
}

function countSuggestionItems(suggestions: HomeSearchSuggestionGroups) {
  return suggestions.smart.length
    + suggestions.communities.length
    + suggestions.projects.length
    + suggestions.developers.length
    + suggestions.places.length
    + suggestions.askAi.length;
}

export default HeroSection;
