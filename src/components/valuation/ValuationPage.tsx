"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2, BedDouble, MapPin, Ruler, Target, User, Phone, Mail,
  Sparkles, ArrowLeft, Copy, Check, ChevronRight,
  TrendingUp, TrendingDown, AlertTriangle, MessageCircle, PhoneCall,
  RefreshCw, Search,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

// ─── Building suggestions ─────────────────────────────────────────────────────
// Popular Dubai buildings and communities for autocomplete

const BUILDING_SUGGESTIONS = [
  // Downtown Dubai
  "Burj Khalifa, Downtown Dubai",
  "The Address Downtown, Downtown Dubai",
  "Fountain Views 1, Downtown Dubai",
  "Fountain Views 2, Downtown Dubai",
  "Fountain Views 3, Downtown Dubai",
  "Opera Grand, Downtown Dubai",
  "Bellevue Tower 1, Downtown Dubai",
  "Bellevue Tower 2, Downtown Dubai",
  "Il Primo, Downtown Dubai",
  "Vida Residences, Downtown Dubai",
  "Act One | Act Two, Downtown Dubai",
  "29 Boulevard, Downtown Dubai",
  "Standpoint Tower A, Downtown Dubai",
  "Standpoint Tower B, Downtown Dubai",
  // Dubai Marina
  "Marina Gate 1, Dubai Marina",
  "Marina Gate 2, Dubai Marina",
  "Marina Gate 3, Dubai Marina",
  "Cayan Tower, Dubai Marina",
  "Infinity Tower, Dubai Marina",
  "Princess Tower, Dubai Marina",
  "Elite Residence, Dubai Marina",
  "Marina Crown, Dubai Marina",
  "Silverene Tower A, Dubai Marina",
  "Silverene Tower B, Dubai Marina",
  "The Torch, Dubai Marina",
  "Sulafa Tower, Dubai Marina",
  "Marina Heights, Dubai Marina",
  "Botanica Tower, Dubai Marina",
  "Jumeirah Living Marina Gate, Dubai Marina",
  // JBR
  "Murjan 1, JBR",
  "Sadaf 1, JBR",
  "Rimal 1, JBR",
  "Bahar 1, JBR",
  "1 JBR, Jumeirah Beach Residence",
  // Palm Jumeirah
  "Shoreline Apartments, Palm Jumeirah",
  "The 8, Palm Jumeirah",
  "Tiara Residences, Palm Jumeirah",
  "Oceana Atlantic, Palm Jumeirah",
  "Signature Villas, Palm Jumeirah",
  "Garden Homes, Palm Jumeirah",
  "One Palm, Palm Jumeirah",
  "Palme Couture Residences, Palm Jumeirah",
  // Business Bay
  "Executive Towers, Business Bay",
  "Damac Paramount, Business Bay",
  "Churchill Residency, Business Bay",
  "Bay's Edge, Business Bay",
  "Merano Tower, Business Bay",
  "Nobles Tower, Business Bay",
  // DIFC
  "Index Tower, DIFC",
  "Central Park Tower, DIFC",
  "Park Towers, DIFC",
  "Liberty House, DIFC",
  // JVC
  "Belgravia 1, JVC",
  "Belgravia 2, JVC",
  "Seasons Community, JVC",
  "Park Lane, JVC",
  "Bloom Heights, JVC",
  // Dubai Hills
  "Park Heights 1, Dubai Hills Estate",
  "Park Heights 2, Dubai Hills Estate",
  "Mulberry 1, Dubai Hills Estate",
  "Mulberry 2, Dubai Hills Estate",
  "Acacia, Dubai Hills Estate",
  "Maple 1, Dubai Hills Estate",
  // MBR City / Creek Harbour
  "Creekside 18, Dubai Creek Harbour",
  "Harbour Views 1, Dubai Creek Harbour",
  "Harbour Views 2, Dubai Creek Harbour",
  "Island Park 1, Dubai Creek Harbour",
  "Address Harbour Point, Dubai Creek Harbour",
  // Arabian Ranches
  "Palmera 1, Arabian Ranches",
  "Mirador, Arabian Ranches",
  "Saheel, Arabian Ranches",
  // City Walk
  "Central Park at City Walk, Al Wasl",
  "Eaton Place, JLT",
  // JLT
  "Goldcrest Views 1, JLT",
  "Goldcrest Views 2, JLT",
  "Platinum Tower, JLT",
  "HDS Tower, JLT",
  "Saba Tower 1, JLT",
  // Sports City
  "Elite Sports Residence 1, Dubai Sports City",
  "Golf Tower 1, Dubai Sports City",
  // Motor City
  "Green Lakes Tower 1, JLT",
  // Abu Dhabi
  "The Gate Tower, Al Reem Island",
  "Sun Tower, Al Reem Island",
  "Sky Tower, Al Reem Island",
  "Corniche Residence, Corniche Road Abu Dhabi",
  "Saadiyat Beach Residences, Saadiyat Island",
];

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = "form" | "processing" | "results";

interface FormData {
  unit: string;
  location: string;
  beds: string;
  baths: string;
  city: string;
  type: string;
  size: string;
  intent: string;
  name: string;
  phone: string;
  email: string;
  notes: string;
}

interface FieldErrors {
  unit?: string;
  name?: string;
  contact?: string; // covers phone + email together
}

interface ValuationResult {
  currency: string;
  community: string;
  city: string;
  country: string;
  tags: string[];
  fairValueLow: number;
  fairValueHigh: number;
  confidence: "High" | "Medium" | "Low";
  confidenceReason: string;
  fairValueExplanation: string;
  quickSaleLow: number;
  quickSaleHigh: number;
  suggestedListLow: number;
  suggestedListHigh: number;
  comparables: {
    type: "Sale" | "Listing";
    size: string;
    date: string;
    price: number;
    reason: string;
  }[];
  marketRead: string;
  strategy: string;
  strategyBullets: string[];
  movingFactors: string[];
  disclaimer: string;
  sources: { url: string; title: string }[];
}

interface ApiResponse {
  leadId: string;
  createdAt: string;
  currency: string;
  estimate_low: number;
  estimate_high: number;
  estimate_summary: string;
  confidence: "High" | "Medium" | "Low";
  confidence_reason: string;
  recommended_list_price: { low: number; high: number; note: string };
  quick_sale_range: { low: number; high: number; note: string };
  recommendation: string;
  market_read: string;
  disclaimer: string;
  sources: { url: string; title: string }[];
  transactions: { size: string; date: string; price: number; headline: string; notes: string }[];
  listings: { size: string; date: string; price: number; headline: string; notes: string }[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2500;
const STREAM_TIMEOUT_MS = 90_000; // 90s

const processingSteps = [
  { label: "Preparing",         desc: "Validating property details" },
  { label: "Searching market",  desc: "Reviewing live listings and sales" },
  { label: "Building estimate", desc: "Turning research into pricing guidance" },
  { label: "Ready to review",   desc: "Formatting your valuation report" },
];

const phaseMap: Record<string, number> = {
  started: 0,
  searching_web: 1,
  generating_estimate: 2,
  final: 3,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number, currency = "AED") =>
  `${currency} ${n.toLocaleString("en-US")}`;

function extractCommunity(unit: string): string {
  if (!unit) return "Your Property";
  return unit.split(",")[0]?.trim() || "Your Property";
}

function validateForm(form: FormData): FieldErrors {
  const errors: FieldErrors = {};
  if (!form.unit.trim() || form.unit.trim().length < 5) {
    errors.unit = "Please enter the building or unit name (at least 5 characters).";
  }
  if (!form.name.trim() || form.name.trim().length < 2) {
    errors.name = "Your name is required.";
  }
  const hasPhone = form.phone.trim().length > 5;
  const hasEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());
  if (!hasPhone && !hasEmail) {
    errors.contact = "Please provide a phone number or email so we can follow up.";
  }
  return errors;
}

function mapApiToResult(api: ApiResponse, form: FormData): ValuationResult {
  const community = extractCommunity(form.unit);
  const propType = form.type?.toLowerCase() || "property";

  const comparables = [
    ...(api.transactions ?? []).map((c) => ({
      type: "Sale" as const,
      size: c.size || "Not stated",
      date: c.date || "Not stated",
      price: c.price,
      reason: [c.headline, c.notes].filter(Boolean).join(". ") || "Relevant comparable.",
    })),
    ...(api.listings ?? []).map((c) => ({
      type: "Listing" as const,
      size: c.size || "Not stated",
      date: c.date || "Not stated",
      price: c.price,
      reason: [c.headline, c.notes].filter(Boolean).join(". ") || "Relevant comparable.",
    })),
  ];

  return {
    currency: api.currency || "AED",
    community,
    city: form.city || "Dubai",
    country: "UAE",
    tags: [form.type, community, form.intent].filter(Boolean) as string[],
    fairValueLow: api.estimate_low,
    fairValueHigh: api.estimate_high,
    fairValueExplanation: api.estimate_summary,
    confidence: api.confidence,
    confidenceReason: api.confidence_reason,
    quickSaleLow: api.quick_sale_range?.low,
    quickSaleHigh: api.quick_sale_range?.high,
    suggestedListLow: api.recommended_list_price?.low,
    suggestedListHigh: api.recommended_list_price?.high,
    comparables,
    marketRead: api.market_read,
    strategy: api.recommendation,
    strategyBullets: [
      api.recommended_list_price?.note,
      api.quick_sale_range?.note,
    ].filter(Boolean) as string[],
    movingFactors: [
      "Specific floor level and direct view (sea, community, or road-facing).",
      "Condition and quality of finishes — upgraded kitchens and bathrooms add material value.",
      `Vacancy status — vacant ${propType}s typically command a 3–8% premium.`,
      "Furnishing level and quality for rental-intent buyers.",
      "Building age, facilities, and service charge ratio.",
      "Proximity to metro, retail, and key landmarks.",
    ],
    disclaimer: api.disclaimer || "AI-assisted market snapshot. Not a formal appraisal.",
    sources: api.sources || [],
  };
}

// Core streaming fetch — throws on failure, returns ApiResponse on success
async function fetchValuation(payload: object): Promise<ApiResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), STREAM_TIMEOUT_MS);

  try {
    const res = await fetch("/api/valuation/stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      if (res.status === 429) {
        const retry = errData?.retryAfterSeconds;
        throw new Error(
          retry
            ? `Service at capacity. Retrying in ${retry} seconds…`
            : (errData?.error ?? "Too many requests.")
        );
      }
      throw new Error(errData?.error ?? `Request failed (${res.status}).`);
    }

    if (!res.body) throw new Error("Streaming not supported in this browser.");

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let finalData: ApiResponse | null = null;

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (!line.trim()) continue;
        let evt: { event: string; data?: ApiResponse; error?: string };
        try { evt = JSON.parse(line); } catch { continue; }

        if (evt.event === "error") throw new Error(evt.error ?? "Valuation failed.");
        if (evt.event === "final" && evt.data) finalData = evt.data;
      }
    }

    if (!finalData) throw new Error("Stream ended before a result was returned.");
    return finalData;

  } finally {
    clearTimeout(timeout);
  }
}

// ─── Autocomplete hook ────────────────────────────────────────────────────────

function useBuildingSuggestions(query: string) {
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) { setSuggestions([]); return; }

    const matches = BUILDING_SUGGESTIONS.filter((b) =>
      b.toLowerCase().includes(q)
    ).slice(0, 6);
    setSuggestions(matches);
  }, [query]);

  return suggestions;
}

// ─── Field error component ────────────────────────────────────────────────────

const FieldError = ({ message }: { message?: string }) =>
  message ? (
    <p className="text-xs text-destructive mt-1 flex items-center gap-1">
      <AlertTriangle className="h-3 w-3 flex-shrink-0" />
      {message}
    </p>
  ) : null;

// ─── Component ────────────────────────────────────────────────────────────────

const ValuationPage = () => {
  const [step, setStep] = useState<Step>("form");
  const [form, setForm] = useState<FormData>({
    unit: "", location: "", beds: "", baths: "", city: "Dubai",
    type: "", size: "", intent: "", name: "", phone: "", email: "", notes: "",
  });
  const [result, setResult] = useState<ValuationResult | null>(null);
  const [activeProcessStep, setActiveProcessStep] = useState(0);
  const [copied, setCopied] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);
  const unitInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const suggestions = useBuildingSuggestions(form.unit);

  const updateField = useCallback((key: keyof FormData, val: string) => {
    setForm((f) => ({ ...f, [key]: val }));

    // Live validation after first submit attempt
    if (submitAttempted) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        if (key === "unit") {
          if (val.trim().length >= 5) delete next.unit;
          else next.unit = "Please enter the building or unit name (at least 5 characters).";
        }
        if (key === "name") {
          if (val.trim().length >= 2) delete next.name;
          else next.name = "Your name is required.";
        }
        if (key === "phone" || key === "email") {
          const phone = key === "phone" ? val : form.phone;
          const email = key === "email" ? val : form.email;
          const hasPhone = phone.trim().length > 5;
          const hasEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
          if (hasPhone || hasEmail) delete next.contact;
          else next.contact = "Please provide a phone number or email so we can follow up.";
        }
        return next;
      });
    }
  }, [submitAttempted, form.phone, form.email]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node) &&
        unitInputRef.current && !unitInputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const runValuation = useCallback(async (payload: object, attempt: number) => {
    try {
      const data = await fetchValuation(payload);

      // Update phase to final on success
      setActiveProcessStep(3);
      setResult(mapApiToResult(data as ApiResponse, form));
      setStep("results");
      topRef.current?.scrollIntoView({ behavior: "smooth" });

    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      console.error(`[ValuationPage] attempt ${attempt}:`, err);

      // Detect abort = timeout
      const isTimeout = err instanceof Error && err.name === "AbortError";
      const isRetryable = isTimeout || (
        !msg.includes("Too many requests") &&
        !msg.includes("capacity") &&
        attempt < MAX_RETRIES
      );

      if (isRetryable) {
        const nextAttempt = attempt + 1;
        setRetryCount(nextAttempt);
        setActiveProcessStep(0); // reset progress
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
        await runValuation(payload, nextAttempt);
      } else {
        setGlobalError(
          isTimeout
            ? "The request timed out after multiple attempts. Please try again."
            : msg
        );
        setStep("form");
        topRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [form]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);

    const errors = validateForm(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      // Scroll to first error
      topRef.current?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    setFieldErrors({});
    setGlobalError(null);
    setRetryCount(0);
    setStep("processing");
    setActiveProcessStep(0);
    topRef.current?.scrollIntoView({ behavior: "smooth" });

    // Kick off stream — phase updates happen inside runValuation via phaseMap
    // We hook into the stream for phase events separately
    const apiPayload = {
      propertyName: form.unit,
      location: form.location,
      city: form.city,
      propertyType: form.type,
      bedrooms: form.beds,
      bathrooms: form.baths,
      size: form.size,
      ownerName: form.name,
      email: form.email,
      phone: form.phone,
      intent: form.intent,
      notes: form.notes,
    };

    // Run with phase tracking
    await runValuationWithPhases(apiPayload, 1);
  };

  // Separate function that also tracks phases (keeps runValuation clean for retries)
  const runValuationWithPhases = async (payload: object, attempt: number) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), STREAM_TIMEOUT_MS);

    try {
      const res = await fetch("/api/valuation/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        if (res.status === 429) {
          const retry = errData?.retryAfterSeconds;
          throw new Error(
            retry
              ? `Service at capacity. Please try again in ${retry} seconds.`
              : (errData?.error ?? "Too many requests.")
          );
        }
        throw new Error(errData?.error ?? `Request failed (${res.status}).`);
      }

      if (!res.body) throw new Error("Streaming not supported in this browser.");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let finalData: ApiResponse | null = null;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.trim()) continue;
          let evt: { event: string; data?: ApiResponse; error?: string };
          try { evt = JSON.parse(line); } catch { continue; }

          if (evt.event === "error") throw new Error(evt.error ?? "Valuation failed.");
          if (evt.event in phaseMap) setActiveProcessStep(phaseMap[evt.event]);
          if (evt.event === "final" && evt.data) finalData = evt.data;
        }
      }

      if (!finalData) throw new Error("Stream ended before a result was returned.");

      setResult(mapApiToResult(finalData, form));
      setStep("results");
      topRef.current?.scrollIntoView({ behavior: "smooth" });

    } catch (err) {
      clearTimeout(timeout);
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      const isTimeout = err instanceof Error && err.name === "AbortError";
      const isRetryable = (isTimeout || !msg.includes("Too many requests")) && attempt < MAX_RETRIES;

      console.error(`[ValuationPage] attempt ${attempt}:`, err);

      if (isRetryable) {
        setRetryCount(attempt);
        setActiveProcessStep(0);
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
        await runValuationWithPhases(payload, attempt + 1);
      } else {
        setGlobalError(
          isTimeout
            ? "The valuation timed out. Please try again."
            : msg
        );
        setStep("form");
        topRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    } finally {
      clearTimeout(timeout);
    }
  };

  const copySummary = () => {
    if (!result) return;
    const c = result.currency;
    const text = [
      `Valuation for ${result.community}, ${result.city}`,
      `Fair Value: ${fmt(result.fairValueLow, c)} – ${fmt(result.fairValueHigh, c)}`,
      `Suggested List: ${fmt(result.suggestedListLow, c)} – ${fmt(result.suggestedListHigh, c)}`,
      `Quick Sale: ${fmt(result.quickSaleLow, c)} – ${fmt(result.quickSaleHigh, c)}`,
    ].join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div ref={topRef} className="h-20" />

      <AnimatePresence mode="wait">

        {/* ── Form ── */}
        {step === "form" && (
          <motion.div key="form"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}
          >
            {/* Hero */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-8">
              <div className="grid lg:grid-cols-5 gap-12 items-start">
                <div className="lg:col-span-3">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#0B3D2E] to-[#1A7A5A] flex items-center justify-center shadow-md">
                      <Target className="h-4 w-4 text-white" />
                    </div>
                    <p className="text-[10px] font-bold tracking-[0.2em] uppercase"
                      style={{ background: "linear-gradient(to right, #D4A847, #B8922F)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                      Owner-Ready Valuation
                    </p>
                  </div>
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] mb-6">
                    Understand your property&apos;s{" "}
                    <span style={{ background: "linear-gradient(to right, #D4A847, #B8922F)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                      value
                    </span>{" "}in minutes.
                  </h1>
                  <p className="text-muted-foreground text-lg max-w-lg mb-6">
                    A refined estimate based on recent transactions, active listings, and comparable homes in the same market.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {["Recent sales", "Live asking prices", "Expert guidance"].map((t) => (
                      <span key={t} className="inline-flex items-center gap-2 px-4 py-2.5 bg-card text-foreground rounded-xl text-xs font-bold border border-border/50 shadow-sm hover:border-primary/30 hover:shadow-md transition-all duration-300">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-2">
                  <div className="rounded-2xl border border-border/50 bg-card p-6 space-y-5 shadow-sm">
                    <div className="flex items-center gap-2.5">
                      <div className="w-1 h-6 rounded-full" style={{ background: "linear-gradient(to bottom, #D4A847, #B8922F)" }} />
                      <p className="text-[10px] font-bold tracking-[0.2em] uppercase"
                        style={{ background: "linear-gradient(to right, #D4A847, #B8922F)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                        What You Get
                      </p>
                    </div>
                    {[
                      { icon: TrendingUp, title: "Sharper fair value range",    desc: "Built from same-building sales, nearby comparables, and current asking prices." },
                      { icon: Target,     title: "Actionable pricing guidance", desc: "See fair value, suggested list price, and quick-sale range in one snapshot." },
                      { icon: Sparkles,   title: "Expert follow-up",            desc: "Our valuation team reviews your report and reaches out with tailored advice." },
                    ].map((item) => (
                      <div key={item.title} className="flex gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#0B3D2E]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <item.icon className="h-4 w-4 text-[#0B3D2E]" />
                        </div>
                        <div>
                          <h3 className="font-bold text-foreground text-sm">{item.title}</h3>
                          <p className="text-muted-foreground text-sm mt-0.5 leading-relaxed">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Global error banner */}
            {globalError && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-4">
                <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-6 py-4 text-sm text-destructive font-medium flex items-start gap-3">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>{globalError}</span>
                </div>
              </div>
            )}

            {/* Form */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
              <div className="rounded-2xl border border-border/50 bg-card p-8 sm:p-10 shadow-sm">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0B3D2E] to-[#1A7A5A] flex items-center justify-center shadow-md">
                    <Building2 className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold">Tell us about the property</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">All the core details in one screen. The more precise, the tighter the estimate.</p>
                  </div>
                </div>
                <div className="h-px bg-border/50 my-6" />

                <form onSubmit={handleSubmit} noValidate className="space-y-6">

                  {/* Row 1 — Unit (with autocomplete) / Location / City */}
                  <div className="grid sm:grid-cols-4 gap-4">
                    <div className="sm:col-span-2">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1.5 flex items-center gap-1">
                        Unit / Building
                        <span className="text-[9px] bg-gradient-to-r from-[#D4A847] to-[#B8922F] text-white px-1.5 py-0.5 rounded-full font-bold">Required</span>
                      </label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10 pointer-events-none" />
                        <input
                          ref={unitInputRef}
                          value={form.unit}
                          onChange={(e) => { updateField("unit", e.target.value); setShowSuggestions(true); }}
                          onFocus={() => setShowSuggestions(true)}
                          onKeyDown={(e) => { if (e.key === "Escape") setShowSuggestions(false); }}
                          placeholder="Dubai Marina, Marina Gate 2, Unit 2704"
                          autoComplete="off"
                          className={`w-full pl-10 h-12 bg-background rounded-xl border px-3 text-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#0B3D2E]/20 ${
                            fieldErrors.unit ? "border-destructive" : "border-border focus:border-[#0B3D2E]/40"
                          }`}
                        />
                        {/* Suggestions dropdown */}
                        {showSuggestions && suggestions.length > 0 && (
                          <div ref={suggestionsRef}
                            className="absolute top-full left-0 right-0 mt-1 z-50 rounded-xl border border-border bg-card shadow-lg overflow-hidden">
                            {suggestions.map((s) => (
                              <button key={s} type="button"
                                className="w-full text-left px-4 py-3 text-sm hover:bg-muted/50 transition-colors flex items-center gap-2.5 border-b border-border/30 last:border-0"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  updateField("unit", s);
                                  // Auto-fill location from suggestion
                                  const parts = s.split(", ");
                                  if (parts.length > 1) updateField("location", parts.slice(1).join(", "));
                                  setShowSuggestions(false);
                                  unitInputRef.current?.blur();
                                }}>
                                <Building2 className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                                <span className="text-foreground">{s}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <FieldError message={fieldErrors.unit} />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1.5 block">Community / Area</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input value={form.location} onChange={(e) => updateField("location", e.target.value)}
                          placeholder="Dubai Marina" className="pl-10 h-12 bg-background" />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1.5 block">City</label>
                      <Select value={form.city} onValueChange={(v) => updateField("city", v)}>
                        <SelectTrigger className="h-12 bg-background"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "RAK"].map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Row 2 — Type / Beds / Baths / Size / Intent */}
                  <div className="grid sm:grid-cols-5 gap-4">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1.5 block">Type</label>
                      <Select value={form.type} onValueChange={(v) => updateField("type", v)}>
                        <SelectTrigger className="h-12 bg-background"><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          {["Apartment", "Villa", "Townhouse", "Penthouse", "Studio"].map((t) => (
                            <SelectItem key={t} value={t}>{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1.5 block">Beds</label>
                      <div className="relative">
                        <BedDouble className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input value={form.beds} onChange={(e) => updateField("beds", e.target.value)}
                          placeholder="2" className="pl-10 h-12 bg-background" />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1.5 block">Baths</label>
                      <div className="relative">
                        <BedDouble className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input value={form.baths} onChange={(e) => updateField("baths", e.target.value)}
                          placeholder="2" className="pl-10 h-12 bg-background" />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1.5 block">Size</label>
                      <div className="relative">
                        <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input value={form.size} onChange={(e) => updateField("size", e.target.value)}
                          placeholder="1,420 sq ft" className="pl-10 h-12 bg-background" />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1.5 block">Intent</label>
                      <Select value={form.intent} onValueChange={(v) => updateField("intent", v)}>
                        <SelectTrigger className="h-12 bg-background"><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          {["Thinking of selling", "Need a fast cash offer", "Curious about market value", "Want to list with an agent"].map((i) => (
                            <SelectItem key={i} value={i}>{i}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Row 3 — Name / Phone / Email (all required / at least one contact) */}
                  <div>
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1.5 flex items-center gap-1">
                          Name
                          <span className="text-[9px] bg-gradient-to-r from-[#D4A847] to-[#B8922F] text-white px-1.5 py-0.5 rounded-full font-bold">Required</span>
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input value={form.name} onChange={(e) => updateField("name", e.target.value)}
                            placeholder="Your name"
                            className={`pl-10 h-12 bg-background ${fieldErrors.name ? "border-destructive focus-visible:ring-destructive/20" : ""}`} />
                        </div>
                        <FieldError message={fieldErrors.name} />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1.5 flex items-center gap-1">
                          Phone
                          <span className="text-[9px] text-muted-foreground/60 font-normal normal-case tracking-normal">or email</span>
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input value={form.phone} onChange={(e) => updateField("phone", e.target.value)}
                            placeholder="+971 50 000 0000"
                            className={`pl-10 h-12 bg-background ${fieldErrors.contact ? "border-destructive focus-visible:ring-destructive/20" : ""}`} />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1.5 flex items-center gap-1">
                          Email
                          <span className="text-[9px] text-muted-foreground/60 font-normal normal-case tracking-normal">or phone</span>
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input value={form.email} onChange={(e) => updateField("email", e.target.value)}
                            placeholder="owner@example.com" type="email"
                            className={`pl-10 h-12 bg-background ${fieldErrors.contact ? "border-destructive focus-visible:ring-destructive/20" : ""}`} />
                        </div>
                      </div>
                    </div>
                    <FieldError message={fieldErrors.contact} />
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1.5 block">Notes</label>
                    <Textarea value={form.notes} onChange={(e) => updateField("notes", e.target.value)}
                      placeholder="Renovated, vacant, sea view, high floor, upgraded kitchen"
                      className="bg-background min-h-[100px]" />
                  </div>

                  <div>
                    <button type="submit"
                      className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full font-bold text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
                      style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)", boxShadow: "0 4px 20px rgba(11,61,46,0.3)" }}>
                      <Sparkles className="h-4 w-4" />
                      Get Quick Valuation
                    </button>
                    <p className="text-xs text-muted-foreground mt-3">
                      Views, upgrades, floor, vacancy, furnishings, and condition help refine the estimate.
                    </p>
                  </div>
                </form>
              </div>
            </section>
          </motion.div>
        )}

        {/* ── Processing ── */}
        {step === "processing" && (
          <motion.div key="processing"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}
            className="max-w-3xl mx-auto px-4 sm:px-6 py-20"
          >
            <div className="rounded-2xl border border-border bg-card p-8 sm:p-12">
              <p className="text-xs font-bold tracking-[0.2em] uppercase mb-3" style={{ color: "#D4A847" }}>Valuation Snapshot</p>
              <h2 className="text-3xl font-bold mb-2">{extractCommunity(form.unit)}</h2>
              <p className="text-muted-foreground mb-3">Key pricing guidance first, then comparable sales, and supporting sources.</p>
              <span className="inline-block px-3 py-1 rounded-full border border-border text-sm font-medium">{form.city}</span>

              {/* Retry notice */}
              {retryCount > 0 && (
                <div className="mt-4 flex items-center gap-2 text-sm text-[#D4A847]">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Retrying… attempt {retryCount + 1} of {MAX_RETRIES + 1}
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
                {processingSteps.map((ps, i) => (
                  <div key={ps.label} className={`rounded-xl border p-4 transition-all duration-500 ${
                    i <= activeProcessStep ? "border-[#0B3D2E]/30 bg-[#0B3D2E]/5" : "border-border bg-muted/30"
                  }`}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className={`h-2 w-2 rounded-full transition-colors duration-500 ${
                        i < activeProcessStep ? "bg-[#0B3D2E]"
                          : i === activeProcessStep ? "animate-pulse bg-[#0B3D2E]"
                          : "bg-muted-foreground/30"
                      }`} />
                      <span className="text-sm font-bold">{ps.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{ps.desc}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 space-y-4">
                {[1, 2].map((n) => (
                  <div key={n} className="rounded-xl bg-secondary/50 p-6 space-y-3 animate-pulse">
                    <div className="h-4 w-1/3 bg-[#0B3D2E]/10 rounded" />
                    <div className="h-3 w-2/3 bg-[#0B3D2E]/5 rounded" />
                    <div className="h-3 w-1/2 bg-[#0B3D2E]/5 rounded" />
                    <div className="h-3 w-3/4 bg-[#0B3D2E]/5 rounded" />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Results ── */}
        {step === "results" && result && (
          <motion.div key="results"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}
            className="max-w-4xl mx-auto px-4 sm:px-6 py-12"
          >
            {/* Back */}
            <button onClick={() => { setStep("form"); setResult(null); }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full border-2 border-[#0B3D2E]/20 text-sm font-semibold text-[#0B3D2E] hover:bg-[#0B3D2E] hover:text-white hover:border-transparent transition-all duration-300 mb-8">
              <ArrowLeft className="h-4 w-4" /> New Search
            </button>

            {/* Header */}
            <div className="rounded-2xl border border-border/50 bg-card p-8 mb-4 shadow-sm">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0B3D2E] to-[#1A7A5A] flex items-center justify-center shadow-md">
                  <Target className="h-4 w-4 text-white" />
                </div>
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase"
                  style={{ background: "linear-gradient(to right, #D4A847, #B8922F)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  Valuation Snapshot
                </p>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-2">{result.community}, {result.city}, {result.country}</h2>
              <p className="text-muted-foreground mb-4">Key pricing guidance first, then comparable sales and market context.</p>
              <div className="flex flex-wrap gap-2">
                {result.tags.map((t) => (
                  <span key={t} className="px-4 py-1.5 rounded-full text-sm font-medium text-foreground"
                    style={{ background: "linear-gradient(135deg, rgba(11,61,46,0.08), rgba(26,122,90,0.12))", border: "1px solid rgba(11,61,46,0.15)" }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Fair Value + Confidence */}
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div className="rounded-2xl overflow-hidden shadow-sm">
                <div className="bg-gradient-to-br from-[#D4A847] via-[#C9A83E] to-[#B8922F] p-8 text-white">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/70 font-bold mb-2">Fair Value</p>
                  <p className="text-2xl sm:text-3xl font-bold">
                    {fmt(result.fairValueLow, result.currency)} – {fmt(result.fairValueHigh, result.currency)}
                  </p>
                  <p className="text-sm text-white/80 mt-3 leading-relaxed">{result.fairValueExplanation}</p>
                </div>
              </div>
              <div className="rounded-2xl border border-border/50 bg-card p-8 border-l-[3px] border-l-[#0B3D2E] shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-2">Confidence</p>
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className={`h-5 w-5 ${
                    result.confidence === "High" ? "text-[#0B3D2E]"
                      : result.confidence === "Medium" ? "text-[#D4A847]"
                      : "text-destructive"
                  }`} />
                  <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                    result.confidence === "High" ? "bg-[#0B3D2E]/10 text-[#0B3D2E]"
                      : result.confidence === "Medium" ? "bg-[#D4A847]/15 text-[#B8922F]"
                      : "bg-destructive/10 text-destructive"
                  }`}>
                    {result.confidence}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{result.confidenceReason}</p>
              </div>
            </div>

            {/* Copy */}
            <div className="flex justify-end mb-4">
              <button onClick={copySummary} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied!" : "Copy summary"}
              </button>
            </div>

            {/* Price bars */}
            <div className="rounded-2xl border border-border/50 bg-card p-8 mb-4 shadow-sm">
              <div className="flex items-center gap-2.5 mb-6">
                <div className="w-1 h-6 rounded-full bg-gradient-to-b from-[#D4A847] to-[#B8922F]" />
                <p className="text-sm font-semibold text-foreground">Price Comparison</p>
              </div>
              <PriceBar label="Quick sale"     low={result.quickSaleLow}     high={result.quickSaleHigh}     min={result.quickSaleLow} max={result.suggestedListHigh} color="#D4A847" currency={result.currency} />
              <PriceBar label="Fair value"     low={result.fairValueLow}     high={result.fairValueHigh}     min={result.quickSaleLow} max={result.suggestedListHigh} color="#0B3D2E" currency={result.currency} />
              <PriceBar label="Suggested list" low={result.suggestedListLow} high={result.suggestedListHigh} min={result.quickSaleLow} max={result.suggestedListHigh} color="#1A7A5A" currency={result.currency} />
              <p className="text-[10px] text-muted-foreground mt-4 bg-muted/30 rounded-xl p-3 border border-border/30">{result.disclaimer}</p>
            </div>

            {/* Suggested + Quick sale cards */}
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div className="rounded-2xl border border-border/50 bg-card p-6 border-l-[3px] border-l-[#0B3D2E] shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-[#0B3D2E]/10 flex items-center justify-center">
                    <TrendingUp className="h-3.5 w-3.5 text-[#0B3D2E]" />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Suggested List Price</p>
                </div>
                <p className="text-xl font-bold">{fmt(result.suggestedListLow, result.currency)} – {fmt(result.suggestedListHigh, result.currency)}</p>
              </div>
              <div className="rounded-2xl border border-border/50 bg-card p-6 border-l-[3px] border-l-[#D4A847] shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-[#D4A847]/10 flex items-center justify-center">
                    <TrendingDown className="h-3.5 w-3.5 text-[#D4A847]" />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Quick Sale Range</p>
                </div>
                <p className="text-xl font-bold">{fmt(result.quickSaleLow, result.currency)} – {fmt(result.quickSaleHigh, result.currency)}</p>
              </div>
            </div>

            {/* Comparables */}
            <div className="rounded-2xl border border-border/50 bg-card p-8 mb-4 shadow-sm">
              <div className="flex items-center gap-2.5 mb-1">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0B3D2E] to-[#1A7A5A] flex items-center justify-center shadow-md">
                  <Building2 className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-xl font-bold">Comparable evidence</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-6 ml-[46px]">Strongest sales and active listings used in the estimate</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[10px] uppercase tracking-[0.2em] text-muted-foreground border-b border-border">
                      <th className="pb-3 pr-4">Type</th>
                      <th className="pb-3 pr-4">Size</th>
                      <th className="pb-3 pr-4">Date</th>
                      <th className="pb-3 pr-4">Price</th>
                      <th className="pb-3">Why It Matters</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.comparables.map((c, i) => (
                      <tr key={i} className="border-b border-border/50 last:border-0">
                        <td className="py-3 pr-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            c.type === "Sale" ? "bg-[#0B3D2E]/10 text-[#0B3D2E]" : "bg-[#D4A847]/15 text-[#B8922F]"
                          }`}>{c.type}</span>
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground">{c.size}</td>
                        <td className="py-3 pr-4 text-muted-foreground">{c.date}</td>
                        <td className="py-3 pr-4 font-bold">{fmt(c.price, result.currency)}</td>
                        <td className="py-3 text-muted-foreground max-w-xs">{c.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Market read */}
            <div className="rounded-2xl border border-border/50 bg-card p-8 mb-4 shadow-sm">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-1 h-6 rounded-full" style={{ background: "linear-gradient(to bottom, #D4A847, #B8922F)" }} />
                <h3 className="text-xl font-bold">Market read</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">{result.marketRead}</p>
            </div>

            {/* Strategy */}
            <div className="rounded-2xl border border-border/50 bg-card p-8 mb-4 shadow-sm">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-9 h-9 rounded-xl bg-[#0B3D2E]/10 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-[#0B3D2E]" />
                </div>
                <h3 className="text-xl font-bold">Recommended strategy</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-4">{result.strategy}</p>
              <ul className="space-y-2.5">
                {result.strategyBullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-muted-foreground text-sm">
                    <ChevronRight className="h-4 w-4 mt-0.5 text-[#0B3D2E] flex-shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>

            {/* Moving factors */}
            <div className="rounded-2xl border border-border/50 bg-card p-8 mb-8 shadow-sm">
              <div className="flex items-center gap-2.5 mb-1">
                <div className="w-9 h-9 rounded-xl bg-[#D4A847]/10 flex items-center justify-center">
                  <AlertTriangle className="h-4 w-4 text-[#D4A847]" />
                </div>
                <h3 className="text-xl font-bold">What can move this estimate</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4 ml-[46px]">Common reasons real-world pricing can shift</p>
              <ul className="space-y-2.5">
                {result.movingFactors.map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-muted-foreground text-sm">
                    <span className="h-2 w-2 rounded-full mt-1.5 flex-shrink-0"
                      style={{ background: "linear-gradient(135deg, #D4A847, #B8922F)" }} />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA */}
            <div className="rounded-3xl p-10 sm:p-14 text-center mb-12 relative overflow-hidden border border-border/30"
              style={{ background: "linear-gradient(160deg, hsl(40,20%,96%), hsl(43,40%,95%))" }}>
              <div className="absolute top-0 left-0 w-full h-[2px]"
                style={{ background: "linear-gradient(90deg, transparent, #D4A847, #B8922F, #D4A847, transparent)" }} />
              <div className="absolute inset-0 opacity-[0.04]"
                style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(212,168,71,0.4) 1px, transparent 0)", backgroundSize: "28px 28px" }} />
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg"
                  style={{ background: "linear-gradient(135deg, #D4A847, #B8922F)", boxShadow: "0 8px 24px -4px rgba(212,168,71,0.3)" }}>
                  <Target className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold mb-3 text-foreground">Want a detailed appraisal?</h3>
                <p className="text-muted-foreground max-w-lg mx-auto mb-10 leading-relaxed">
                  Our RERA-certified valuation experts can provide a formal appraisal with an on-site inspection. Get a precise figure you can use for selling, financing, or legal purposes.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <a href="https://wa.me/971549988811?text=Hi%2C%20I%20just%20used%20the%20online%20valuation%20tool%20and%20would%20like%20a%20detailed%20appraisal."
                    target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-3 w-full sm:w-64 py-4 rounded-full font-bold text-white transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl active:scale-[0.98] text-[15px] shadow-lg"
                    style={{ background: "linear-gradient(to right, #25D366, #1DA851)", boxShadow: "0 8px 24px -4px rgba(37,211,102,0.3)" }}>
                    <MessageCircle className="h-5 w-5" />
                    WhatsApp Inquiry
                  </a>
                  <a href="tel:+971549988811"
                    className="inline-flex items-center justify-center gap-3 w-full sm:w-64 py-4 rounded-full font-bold text-white transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl active:scale-[0.98] text-[15px] shadow-lg"
                    style={{ background: "linear-gradient(to right, #D4A847, #B8922F)", boxShadow: "0 8px 24px -4px rgba(212,168,71,0.3)" }}>
                    <PhoneCall className="h-5 w-5" />
                    Call Now
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

// ─── PriceBar ─────────────────────────────────────────────────────────────────

const PriceBar = ({
  label, low, high, min, max, color, currency = "AED",
}: {
  label: string; low: number; high: number; min: number; max: number; color: string; currency?: string;
}) => {
  const range = max - min || 1;
  const leftPct = ((low - min) / range) * 100;
  const widthPct = ((high - low) / range) * 100;

  return (
    <div className="flex items-center gap-3 mb-4 min-w-0">
      <span className="text-sm font-medium w-28 flex-shrink-0">{label}</span>
      <div className="flex-1 h-3 bg-muted rounded-full relative overflow-hidden">
        <div className="h-3 rounded-full absolute top-0"
          style={{ left: `${leftPct}%`, width: `${Math.max(widthPct, 3)}%`, backgroundColor: color }} />
      </div>
      <span className="text-sm text-muted-foreground flex-shrink-0 text-right whitespace-nowrap">
        {fmt(low, currency)} – {fmt(high, currency)}
      </span>
    </div>
  );
};

export default ValuationPage;