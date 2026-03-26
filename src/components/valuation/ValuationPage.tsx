"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2, BedDouble, MapPin, Tag, Ruler, Target, User, Phone, Mail,
  StickyNote, Sparkles, ArrowLeft, Copy, Check, ChevronRight,
  TrendingUp, TrendingDown, AlertTriangle, MessageCircle, PhoneCall
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

interface ValuationResult {
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
}

// ── Exact shape returned by POST /api/valuation/stream (final event) ─────────
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

/** Maps the streaming API response to the component's ValuationResult shape */
function mapApiToResult(api: ApiResponse, form: FormData): ValuationResult {
  const community = extractCommunity(form.unit);

  const sales = (api.transactions ?? []).map((c) => ({
    type: "Sale" as const,
    size: c.size || "Not stated",
    date: c.date || "Not stated",
    price: c.price,
    reason: [c.headline, c.notes].filter(Boolean).join(". ") || "Relevant comparable.",
  }));

  const listings = (api.listings ?? []).map((c) => ({
    type: "Listing" as const,
    size: c.size || "Not stated",
    date: c.date || "Not stated",
    price: c.price,
    reason: [c.headline, c.notes].filter(Boolean).join(". ") || "Relevant comparable.",
  }));

  const strategyBullets = [
    api.recommended_list_price?.note,
    api.quick_sale_range?.note,
  ].filter(Boolean) as string[];

  const propType = form.type?.toLowerCase() || "property";
  const movingFactors = [
    "Specific floor level and direct view (sea, community, or road-facing).",
    `Condition and quality of finishes — upgraded kitchens and bathrooms add material value.`,
    `Vacancy status — vacant ${propType}s typically command a 3–8% premium.`,
    "Furnishing level and quality for rental-intent buyers.",
    "Building age, facilities, and service charge ratio.",
    "Proximity to metro, retail, and key landmarks.",
  ];

  return {
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
    comparables: [...sales, ...listings],
    marketRead: api.market_read,
    strategy: api.recommendation,
    strategyBullets,
    movingFactors,
  };
}

// ─────────────────────────────────────────────────────────────────────────────

const processingSteps = [
  { label: "Preparing", desc: "Validating property details" },
  { label: "Searching market", desc: "Reviewing live listings and sales" },
  { label: "Building estimate", desc: "Turning research into pricing guidance" },
  { label: "Ready to review", desc: "Formatting your valuation report" },
];

const formatAED = (n: number) => `AED ${n.toLocaleString("en-US")}`;

const ValuationPage = () => {
  const [step, setStep] = useState<Step>("form");
  const [form, setForm] = useState<FormData>({
    unit: "", location: "", beds: "", baths: "", city: "Dubai", type: "", size: "", intent: "", name: "", phone: "", email: "", notes: "",
  });
  const [result, setResult] = useState<ValuationResult | null>(null);
  const [activeProcessStep, setActiveProcessStep] = useState(0);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const updateField = (key: keyof FormData, val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep("processing");
    setActiveProcessStep(0);
    setError(null);
    topRef.current?.scrollIntoView({ behavior: "smooth" });

    // Payload matches the API spec exactly
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

    const endpoint = "/api/valuation/stream";

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiPayload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        if (res.status === 429) {
          const retry = errData?.retryAfterSeconds;
          throw new Error(
            retry
              ? `The valuation service is at capacity. Please try again in ${retry} seconds.`
              : (errData?.error ?? "Too many requests. Please try again shortly.")
          );
        }
        throw new Error(errData?.error ?? "The valuation request failed.");
      }

      if (!res.body) throw new Error("Streaming is not supported in this browser.");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let finalData: ApiResponse | null = null;

      const phaseMap: Record<string, number> = {
        started: 0,
        searching_web: 1,
        generating_estimate: 2,
        final: 3,
      };

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
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      console.error("[ValuationPage]", err);
      setError(msg);
      setStep("form");
      topRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const copySummary = () => {
    if (!result) return;
    const text = `Valuation for ${result.community}, ${result.city}\nFair Value: ${formatAED(result.fairValueLow)} – ${formatAED(result.fairValueHigh)}\nSuggested List: ${formatAED(result.suggestedListLow)} – ${formatAED(result.suggestedListHigh)}\nQuick Sale: ${formatAED(result.quickSaleLow)} – ${formatAED(result.quickSaleHigh)}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div ref={topRef} className="h-20" />

      <AnimatePresence mode="wait">
        {step === "form" && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            {/* Hero */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-8">
              <div className="grid lg:grid-cols-5 gap-12 items-start">
                <div className="lg:col-span-3">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#0B3D2E] to-[#1A7A5A] flex items-center justify-center shadow-md">
                      <Target className="h-4 w-4 text-white" />
                    </div>
                    <p className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{ background: "linear-gradient(to right, #D4A847, #B8922F)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                      Owner-Ready Valuation
                    </p>
                  </div>
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] mb-6">
                    Understand your property&apos;s{" "}
                    <span style={{ background: "linear-gradient(to right, #D4A847, #B8922F)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>value</span> in minutes.
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
                      <p className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{ background: "linear-gradient(to right, #D4A847, #B8922F)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>What You Get</p>
                    </div>
                    {[
                      { icon: TrendingUp, title: "Sharper fair value range", desc: "Built from same-building sales, nearby comparables, and current asking prices." },
                      { icon: Target, title: "Actionable pricing guidance", desc: "See fair value, suggested list price, and quick-sale range in one snapshot." },
                      { icon: Sparkles, title: "Expert follow-up", desc: "Our valuation team reviews your report and reaches out with tailored advice." },
                    ].map((item) => (
                      <div key={item.title} className="flex gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#0B3D2E]/8 flex items-center justify-center flex-shrink-0 mt-0.5">
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

            {/* Error banner */}
            {error && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-4">
                <div className="rounded-2xl border border-destructive/30 bg-destructive/8 px-6 py-4 text-sm text-destructive font-medium">
                  {error}
                </div>
              </div>
            )}

            {/* Form */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
              <div className="rounded-2xl border border-border/50 bg-card p-8 sm:p-10 shadow-sm">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0B3D2E] to-[#1A7A5A] flex items-center justify-center shadow-md">
                    <Building2 className="h-4.5 w-4.5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold">Tell us about the property</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">All the core details in one screen. The more precise, the tighter the estimate.</p>
                  </div>
                </div>
                <div className="h-px bg-border/50 my-6" />

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Row 1 — Unit + Location + Beds + City */}
                  <div className="grid sm:grid-cols-4 gap-4">
                    <div className="sm:col-span-2">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1.5 flex items-center gap-1">
                        Unit / Building <span className="text-[9px] bg-gradient-to-r from-[#D4A847] to-[#B8922F] text-white px-1.5 py-0.5 rounded-full font-bold">Required</span>
                      </label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          value={form.unit}
                          onChange={(e) => updateField("unit", e.target.value)}
                          placeholder="Dubai Marina, Marina Gate 2, Unit 2704"
                          className="pl-10 h-12 bg-background"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1.5 block">Community / Area</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          value={form.location}
                          onChange={(e) => updateField("location", e.target.value)}
                          placeholder="Dubai Marina"
                          className="pl-10 h-12 bg-background"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1.5 block">City</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                        <Select value={form.city} onValueChange={(v) => updateField("city", v)}>
                          <SelectTrigger className="pl-10 h-12 bg-background">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "RAK"].map((c) => (
                              <SelectItem key={c} value={c}>{c}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Row 2 — Type + Beds + Baths + Size + Intent */}
                  <div className="grid sm:grid-cols-5 gap-4">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1.5 block">Type</label>
                      <Select value={form.type} onValueChange={(v) => updateField("type", v)}>
                        <SelectTrigger className="h-12 bg-background">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
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
                        <Input
                          value={form.beds}
                          onChange={(e) => updateField("beds", e.target.value)}
                          placeholder="2"
                          className="pl-10 h-12 bg-background"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1.5 block">Baths</label>
                      <div className="relative">
                        <BedDouble className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          value={form.baths}
                          onChange={(e) => updateField("baths", e.target.value)}
                          placeholder="2"
                          className="pl-10 h-12 bg-background"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1.5 block">Size</label>
                      <div className="relative">
                        <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          value={form.size}
                          onChange={(e) => updateField("size", e.target.value)}
                          placeholder="1,420 sq ft"
                          className="pl-10 h-12 bg-background"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1.5 block">Intent</label>
                      <Select value={form.intent} onValueChange={(v) => updateField("intent", v)}>
                        <SelectTrigger className="h-12 bg-background">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {["Thinking of selling", "Need a fast cash offer", "Curious about market value", "Want to list with an agent"].map((i) => (
                            <SelectItem key={i} value={i}>{i}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Row 3 — Name + Phone + Email */}
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1.5 block">Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          value={form.name}
                          onChange={(e) => updateField("name", e.target.value)}
                          placeholder="Your name"
                          className="pl-10 h-12 bg-background"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1.5 block">Phone</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          value={form.phone}
                          onChange={(e) => updateField("phone", e.target.value)}
                          placeholder="+971 50 000 0000"
                          className="pl-10 h-12 bg-background"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1.5 block">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          value={form.email}
                          onChange={(e) => updateField("email", e.target.value)}
                          placeholder="owner@example.com"
                          type="email"
                          className="pl-10 h-12 bg-background"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1.5 block">Notes</label>
                    <Textarea
                      value={form.notes}
                      onChange={(e) => updateField("notes", e.target.value)}
                      placeholder="Renovated, vacant, sea view, high floor, upgraded kitchen"
                      className="bg-background min-h-[100px]"
                    />
                  </div>

                  <div>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full font-bold text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
                      style={{
                        background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)",
                        boxShadow: "0 4px 20px rgba(11, 61, 46, 0.3)",
                      }}
                    >
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

        {step === "processing" && (
          <motion.div
            key="processing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="max-w-3xl mx-auto px-4 sm:px-6 py-20"
          >
            <div className="rounded-2xl border border-border bg-card p-8 sm:p-12">
              <p className="text-xs font-bold tracking-[0.2em] uppercase mb-3" style={{ color: "#D4A847" }}>Valuation Snapshot</p>
              <h2 className="text-3xl font-bold mb-2">{extractCommunity(form.unit)}</h2>
              <p className="text-muted-foreground mb-3">Key pricing guidance first, then comparable sales, and supporting sources.</p>
              <span className="inline-block px-3 py-1 rounded-full border border-border text-sm font-medium">{form.city}</span>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
                {processingSteps.map((ps, i) => (
                  <div
                    key={ps.label}
                    className={`rounded-xl border p-4 transition-all duration-500 ${
                      i <= activeProcessStep
                        ? "border-[#0B3D2E]/30 bg-[#0B3D2E]/5"
                        : "border-border bg-muted/30"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <div
                        className={`h-2 w-2 rounded-full transition-colors duration-500 ${
                          i < activeProcessStep ? "bg-[#0B3D2E]" : i === activeProcessStep ? "animate-pulse" : "bg-muted-foreground/30"
                        }`}
                        style={i === activeProcessStep ? { background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" } : i < activeProcessStep ? { background: "#0B3D2E" } : {}}
                      />
                      <span className="text-sm font-bold">{ps.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{ps.desc}</p>
                  </div>
                ))}
              </div>

              {/* Skeleton loaders */}
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

        {step === "results" && result && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="max-w-4xl mx-auto px-4 sm:px-6 py-12"
          >
            {/* Back button */}
            <button
              onClick={() => { setStep("form"); setResult(null); }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full border-2 border-[#0B3D2E]/20 text-sm font-semibold text-[#0B3D2E] hover:bg-gradient-to-r hover:from-[#0B3D2E] hover:to-[#1A7A5A] hover:text-white hover:border-transparent transition-all duration-300 mb-8"
            >
              <ArrowLeft className="h-4 w-4" /> New Search
            </button>

            {/* Header */}
            <div className="rounded-2xl border border-border/50 bg-card p-8 mb-4 shadow-sm">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0B3D2E] to-[#1A7A5A] flex items-center justify-center shadow-md">
                  <Target className="h-4.5 w-4.5 text-white" />
                </div>
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{ background: "linear-gradient(to right, #D4A847, #B8922F)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Valuation Snapshot</p>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-2">{result.community}, {result.city}, {result.country}</h2>
              <p className="text-muted-foreground mb-4">Key pricing guidance first, then comparable sales and market context.</p>
              <div className="flex flex-wrap gap-2">
                {result.tags.map((t) => (
                  <span key={t} className="px-4 py-1.5 rounded-full text-sm font-medium text-foreground" style={{ background: "linear-gradient(135deg, rgba(11,61,46,0.08), rgba(26,122,90,0.12))", border: "1px solid rgba(11,61,46,0.15)" }}>{t}</span>
                ))}
              </div>
            </div>

            {/* Fair Value + Confidence */}
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div className="rounded-2xl overflow-hidden shadow-sm">
                <div className="bg-gradient-to-br from-[#D4A847] via-[#C9A83E] to-[#B8922F] p-8 text-white">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/70 font-bold mb-2">Fair Value</p>
                  <p className="text-2xl sm:text-3xl font-bold">
                    {formatAED(result.fairValueLow)} – {formatAED(result.fairValueHigh)}
                  </p>
                  <p className="text-sm text-white/80 mt-3 leading-relaxed">{result.fairValueExplanation}</p>
                </div>
              </div>
              <div className="rounded-2xl border border-border/50 bg-card p-8 border-l-[3px] border-l-[#0B3D2E] shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-2">Confidence</p>
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className={`h-5 w-5 ${result.confidence === "High" ? "text-[#0B3D2E]" : result.confidence === "Medium" ? "text-[#D4A847]" : "text-destructive"}`} />
                  <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                    result.confidence === "High" ? "bg-[#0B3D2E]/10 text-[#0B3D2E]" : result.confidence === "Medium" ? "bg-[#D4A847]/15 text-[#B8922F]" : "bg-destructive/10 text-destructive"
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

            {/* Price Bars */}
            <div className="rounded-2xl border border-border/50 bg-card p-8 mb-4 shadow-sm">
              <div className="flex items-center gap-2.5 mb-6">
                <div className="w-1 h-6 rounded-full bg-gradient-to-b from-[#D4A847] to-[#B8922F]" />
                <p className="text-sm font-semibold text-foreground">Price Comparison</p>
              </div>
              <PriceBar label="Quick sale" low={result.quickSaleLow} high={result.quickSaleHigh} min={result.quickSaleLow} max={result.suggestedListHigh} color="#D4A847" />
              <PriceBar label="Fair value" low={result.fairValueLow} high={result.fairValueHigh} min={result.quickSaleLow} max={result.suggestedListHigh} color="#0B3D2E" />
              <PriceBar label="Suggested list" low={result.suggestedListLow} high={result.suggestedListHigh} min={result.quickSaleLow} max={result.suggestedListHigh} color="#1A7A5A" />
              <p className="text-[10px] text-muted-foreground mt-4 bg-muted/30 rounded-xl p-3 border border-border/30">AI-assisted market snapshot. Not a formal appraisal.</p>
            </div>

            {/* Suggested & Quick Sale Cards */}
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div className="rounded-2xl border border-border/50 bg-card p-6 border-l-[3px] border-l-[#0B3D2E] shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-[#0B3D2E]/10 flex items-center justify-center">
                    <TrendingUp className="h-3.5 w-3.5 text-[#0B3D2E]" />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Suggested List Price</p>
                </div>
                <p className="text-xl font-bold">{formatAED(result.suggestedListLow)} – {formatAED(result.suggestedListHigh)}</p>
              </div>
              <div className="rounded-2xl border border-border/50 bg-card p-6 border-l-[3px] border-l-[#D4A847] shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-[#D4A847]/10 flex items-center justify-center">
                    <TrendingDown className="h-3.5 w-3.5 text-[#D4A847]" />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Quick Sale Range</p>
                </div>
                <p className="text-xl font-bold">{formatAED(result.quickSaleLow)} – {formatAED(result.quickSaleHigh)}</p>
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
                          }`}>
                            {c.type}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground">{c.size}</td>
                        <td className="py-3 pr-4 text-muted-foreground">{c.date}</td>
                        <td className="py-3 pr-4 font-bold">{formatAED(c.price)}</td>
                        <td className="py-3 text-muted-foreground max-w-xs">{c.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Market Read */}
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

            {/* Moving Factors */}
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
                    <span className="h-2 w-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: "linear-gradient(135deg, #D4A847, #B8922F)" }} />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA */}
            <div className="rounded-3xl p-10 sm:p-14 text-center mb-12 relative overflow-hidden border border-border/30" style={{ background: "linear-gradient(160deg, hsl(40,20%,96%), hsl(43,40%,95%))" }}>
              <div className="absolute top-0 left-0 w-full h-[2px]" style={{ background: "linear-gradient(90deg, transparent, #D4A847, #B8922F, #D4A847, transparent)" }} />
              <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(212,168,71,0.4) 1px, transparent 0)", backgroundSize: "28px 28px" }} />
              <div className="absolute top-0 right-0 w-64 h-64 opacity-[0.08]" style={{ background: "radial-gradient(circle at top right, #D4A847, transparent 70%)" }} />

              <div className="relative">
                <div className="w-14 h-14 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg" style={{ background: "linear-gradient(135deg, #D4A847, #B8922F)", boxShadow: "0 8px 24px -4px rgba(212,168,71,0.3)" }}>
                  <Target className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold mb-3 text-foreground">Want a detailed appraisal?</h3>
                <p className="text-muted-foreground max-w-lg mx-auto mb-10 leading-relaxed">
                  Our RERA-certified valuation experts can provide a formal appraisal with an on-site inspection. Get a precise figure you can use for selling, financing, or legal purposes.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <a
                    href="https://wa.me/971549988811?text=Hi%2C%20I%20just%20used%20the%20online%20valuation%20tool%20and%20would%20like%20a%20detailed%20appraisal."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-3 w-full sm:w-64 py-4 rounded-full font-bold text-white transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl active:scale-[0.98] text-[15px] shadow-lg hover:shadow-xl"
                    style={{ background: "linear-gradient(to right, #25D366, #1DA851)", boxShadow: "0 8px 24px -4px rgba(37,211,102,0.3)" }}
                  >
                    <MessageCircle className="h-5 w-5" />
                    WhatsApp Inquiry
                  </a>
                  <a
                    href="tel:+971549988811"
                    className="inline-flex items-center justify-center gap-3 w-full sm:w-64 py-4 rounded-full font-bold text-white transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl active:scale-[0.98] text-[15px] shadow-lg hover:shadow-xl"
                    style={{ background: "linear-gradient(to right, #D4A847, #B8922F)", boxShadow: "0 8px 24px -4px rgba(212,168,71,0.3)" }}
                  >
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

/* ---------- Sub-components ---------- */

const PriceBar = ({
  label, low, high, min, max, color,
}: {
  label: string; low: number; high: number; min: number; max: number; color: string;
}) => {
  const range = max - min || 1;
  const leftPct = ((low - min) / range) * 100;
  const widthPct = ((high - low) / range) * 100;

  return (
    <div className="flex items-center gap-4 mb-4">
      <span className="text-sm font-medium w-28 flex-shrink-0">{label}</span>
      <div className="flex-1 h-3 bg-muted rounded-full relative">
        <div
          className="h-3 rounded-full absolute top-0"
          style={{ left: `${leftPct}%`, width: `${Math.max(widthPct, 3)}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-sm text-muted-foreground w-64 flex-shrink-0 text-right">
        {formatAED(low)} – {formatAED(high)}
      </span>
    </div>
  );
};

/* ---------- Helpers ---------- */

function extractCommunity(unit: string): string {
  if (!unit) return "Your Property";
  const parts = unit.split(",");
  return parts[0]?.trim() || "Your Property";
}

function generateMockResult(form: FormData): ValuationResult {
  const community = extractCommunity(form.unit);
  const base = 1400000;
  return {
    community,
    city: form.city || "Dubai",
    country: "UAE",
    tags: [form.type || "Apartment", community, "Investment", "Waterfront Living"].filter(Boolean),
    fairValueLow: base - 50000,
    fairValueHigh: base + 200000,
    confidence: "Medium",
    confidenceReason: `Confidence is moderate due to lack of specific bedroom count and square footage. Valuation is based on typical ${community} apartment sizes.`,
    fairValueExplanation: `Based on current market trends for apartments in ${community}, a fair market value for a typical unit ranges between AED ${(base - 50000).toLocaleString()} and AED ${(base + 200000).toLocaleString()}.`,
    quickSaleLow: base - 200000,
    quickSaleHigh: base - 100000,
    suggestedListLow: base + 50000,
    suggestedListHigh: base + 250000,
    comparables: [
      { type: "Sale", size: "850 sqft", date: "2025-01-15", price: 1400000, reason: "1-bedroom apartment in a similar mid-tier building, partial Marina view, sold quickly." },
      { type: "Sale", size: "1100 sqft", date: "2024-12-01", price: 1750000, reason: "2-bedroom apartment with full Marina view, premium finishes." },
      { type: "Listing", size: "780 sqft", date: "2025-02-10", price: 1300000, reason: "1-bedroom apartment, lower floor, street view, still on market." },
      { type: "Sale", size: "900 sqft", date: "2024-11-20", price: 1550000, reason: "1-bedroom apartment, high floor, good condition, sold for cash." },
      { type: "Listing", size: "880 sqft", date: "2025-01-25", price: 1495000, reason: "1-bedroom apartment with good amenities, current listing, asking price." },
      { type: "Sale", size: "950 sqft", date: "2024-10-05", price: 1620000, reason: "2-bedroom (loft style) in a well-regarded building, waterfront access." },
    ],
    marketRead: `The ${community} apartment market remains robust, driven by strong investor interest and expatriate demand. Prices have seen steady appreciation, and this trend is expected to continue into 2025–2026, albeit with some stabilization.`,
    strategy: `Given the owner's curiosity about market value, a pragmatic approach is to understand the property's unique selling points and compare them against recent sales. If considering a sale, pricing strategically within the suggested listing range will attract serious buyers while allowing room for negotiation.`,
    strategyBullets: [
      "Obtain professional photography and virtual tour.",
      "Highlight specific building amenities and community advantages.",
      "Consider minor aesthetic upgrades to enhance appeal.",
      "Be prepared to disclose all service charges and community fees upfront.",
    ],
    movingFactors: [
      "Specific square footage and layout of the apartment.",
      "Number of bedrooms and bathrooms.",
      "Floor level and view (Marina, partial Marina, community, or street).",
      "Condition and quality of interior finishes and upgrades.",
      "Building age, amenities, and maintenance standards.",
      "Proximity to metro, retail, and key attractions.",
    ],
  };
}

export default ValuationPage;