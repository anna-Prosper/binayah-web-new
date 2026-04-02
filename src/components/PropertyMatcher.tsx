"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Sparkles, ArrowLeft, Home, MapPin, Wallet, Bed, Loader2, RotateCcw,
  Building2, CheckSquare, ArrowRight,
} from "lucide-react";
import ReactMarkdown from "react-markdown";

const MATCHER_URL = "/api/property-matcher";

type QuestionDef = {
  id: string;
  question: string;
  subtitle: string;
  icon: React.ElementType;
  options: string[];
  multi?: boolean;
  popular?: string[];
};

const questions: QuestionDef[] = [
  {
    id: "purpose",
    question: "What's your goal?",
    subtitle: "This shapes everything — from location to ROI focus.",
    icon: Home,
    options: ["Buy to live in", "Buy to invest", "Buy to flip", "Rent a home", "Rent commercial"],
    popular: ["Buy to live in", "Buy to invest"],
  },
  {
    id: "propertyType",
    question: "What type of property?",
    subtitle: "Each type has different yields and lifestyle benefits.",
    icon: Building2,
    options: ["Apartment", "Villa", "Townhouse", "Penthouse", "Studio", "No preference"],
    popular: ["Apartment", "Villa"],
  },
  {
    id: "areas",
    question: "Which areas interest you?",
    subtitle: "Select all that appeal — or pick 'No preference'.",
    icon: MapPin,
    options: [
      "Downtown Dubai", "Dubai Marina", "Palm Jumeirah", "Business Bay",
      "JVC / JVT", "Dubai Hills", "Creek Harbour", "No preference",
    ],
    multi: true,
  },
  {
    id: "budget",
    question: "What's your budget?",
    subtitle: "We'll find the best value within your range.",
    icon: Wallet,
    options: [
      "Under AED 500K", "AED 500K – 1M", "AED 1M – 2M", "AED 2M – 5M",
      "AED 5M – 10M", "AED 10M+",
    ],
    popular: ["AED 1M – 2M", "AED 2M – 5M"],
  },
  {
    id: "bedrooms",
    question: "How many bedrooms?",
    subtitle: "Studios yield highest %, but families need space.",
    icon: Bed,
    options: ["Studio", "1 Bedroom", "2 Bedrooms", "3 Bedrooms", "4+ Bedrooms", "Flexible"],
  },
];

// ─── Result renderer ───
const ResultContent = ({ result }: { result: string }) => {
  const segments = useMemo(() => {
    const parts: { type: "text" | "link"; content: string; slug?: string }[] = [];
    const regex = /\[VIEW_PROPERTY:([\w-]+)\]/g;
    let lastIndex = 0;
    let match;
    while ((match = regex.exec(result)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: "text", content: result.slice(lastIndex, match.index) });
      }
      parts.push({ type: "link", content: "", slug: match[1] });
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < result.length) {
      parts.push({ type: "text", content: result.slice(lastIndex) });
    }
    return parts;
  }, [result]);

  return (
    <div className="space-y-3">
      {segments.map((seg, i) =>
        seg.type === "text" ? (
          <div key={i} className="prose prose-sm max-w-none text-foreground/80 leading-relaxed prose-headings:text-foreground prose-headings:font-bold prose-strong:text-foreground prose-h3:text-base prose-h3:mt-6 prose-h3:mb-2 prose-p:my-2 prose-ul:my-1 prose-li:my-0 prose-hr:my-4 prose-hr:border-border">
            <ReactMarkdown>{seg.content}</ReactMarkdown>
          </div>
        ) : (
          <Link
            key={i}
            href={`/project/${seg.slug}`}
            className="flex items-center gap-3 px-4 py-3 bg-primary/5 border border-primary/20 rounded-xl hover:bg-primary/10 hover:border-primary/30 transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Building2 className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm font-semibold text-primary flex-1">View Full Property Details</span>
            <ArrowRight className="h-4 w-4 text-primary opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
          </Link>
        )
      )}
    </div>
  );
};

// ─── Component ───
const PropertyMatcher = () => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [multiSelections, setMultiSelections] = useState<string[]>([]);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const current = questions[step];
  const showResult = result || loading;

  const handleSingleSelect = (option: string) => {
    const updated = { ...answers, [current.id]: option };
    setAnswers(updated);
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      fetchRecommendations(updated);
    }
  };

  const toggleMulti = (option: string) => {
    if (option === "No preference") {
      setMultiSelections(["No preference"]);
      return;
    }
    setMultiSelections((prev) => {
      const filtered = prev.filter((o) => o !== "No preference");
      return filtered.includes(option)
        ? filtered.filter((o) => o !== option)
        : [...filtered, option];
    });
  };

  const confirmMulti = () => {
    const selections = multiSelections.length > 0 ? multiSelections : ["No preference"];
    const updated = { ...answers, [current.id]: selections };
    setAnswers(updated);
    setMultiSelections([]);
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      fetchRecommendations(updated);
    }
  };

  const fetchRecommendations = async (ans: Record<string, string | string[]>) => {
    setLoading(true);
    setResult("");

    const profile = {
      purpose: ans.purpose || "Not specified",
      propertyType: ans.propertyType || "Any",
      areas: Array.isArray(ans.areas) ? ans.areas : ans.areas ? [ans.areas] : ["No preference"],
      budget: ans.budget || "Not specified",
      bedrooms: ans.bedrooms || "Flexible",
      lifestyle: ["Not specified"],
      timeline: "Not specified",
    };

    try {
      const resp = await fetch(MATCHER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile }),
      });

      if (resp.status === 429 || resp.status === 402) {
        const data = await resp.json();
        setResult(data.error || "Service busy, please try again.");
        setLoading(false);
        return;
      }
      if (!resp.ok || !resp.body) throw new Error("Failed");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let full = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let idx: number;
        while ((idx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") break;
          try {
            const parsed = JSON.parse(json);
            const c = parsed.choices?.[0]?.delta?.content;
            if (c) { full += c; setResult(full); }
          } catch { buffer = line + "\n" + buffer; break; }
        }
      }
    } catch {
      setResult("Sorry, I couldn't generate recommendations right now. Please try again or contact us at +971 54 998 8811.");
    }
    setLoading(false);
  };

  const reset = () => {
    setStep(0);
    setAnswers({});
    setMultiSelections([]);
    setResult("");
    setLoading(false);
  };

  return (
    <section id="property-matcher" className="py-12 sm:py-24 relative overflow-hidden border-y border-border/30" style={{ background: "linear-gradient(160deg, hsl(40,20%,96%), hsl(43,40%,95%))" }}>
      <div className="absolute top-0 left-0 w-full h-[2px]" style={{ background: "linear-gradient(90deg, transparent, #D4A847, #B8922F, #D4A847, transparent)" }} />
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(212,168,71,0.4) 1px, transparent 0)", backgroundSize: "28px 28px" }} />
      <div className="absolute top-0 right-0 w-64 h-64 opacity-[0.08]" style={{ background: "radial-gradient(circle at top right, #D4A847, transparent 70%)" }} />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 relative">
        {/* Desktop header */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="hidden sm:block text-center mb-12">
          <motion.div initial={{ width: 0 }} whileInView={{ width: "3rem" }} viewport={{ once: true }} className="h-[2px] mx-auto mb-6" style={{ background: "linear-gradient(to right, #D4A847, #B8922F)" }} />
          <p className="font-semibold tracking-[0.4em] uppercase text-xs mb-4" style={{ color: "#D4A847" }}>AI Property Matcher</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
            Find Your <span className="italic font-light">Perfect Match</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-md mx-auto">
            Answer {questions.length} quick questions and our AI will recommend the best properties for you.
          </p>
        </motion.div>

        <div className="bg-background rounded-2xl shadow-sm border border-border/50 overflow-hidden">
          {/* Progress - collapsed header on mobile */}
          {!showResult && (
            <div className="px-4 sm:px-6 pt-4 sm:pt-6">
              {/* Mobile: compact header inside card */}
              <div className="sm:hidden flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" style={{ color: "#D4A847" }} />
                  <span className="text-sm font-bold text-foreground">Find Your Match</span>
                </div>
                <span className="text-xs text-muted-foreground font-medium">{step + 1} / {questions.length}</span>
              </div>
              <div className="flex gap-1 mb-1 sm:mb-2">
                {questions.map((_, i) => (
                  <div key={i} className={`h-1 sm:h-1.5 flex-1 rounded-full transition-all duration-500 ${i < step ? "bg-primary" : i === step ? "bg-primary/60" : "bg-border"}`} />
                ))}
              </div>
              <p className="hidden sm:block text-xs text-muted-foreground">{step + 1} of {questions.length}</p>
            </div>
          )}

          <div className="p-4 sm:p-8 min-h-[300px] sm:min-h-[380px]">
            <AnimatePresence mode="wait">
              {!showResult ? (
                <motion.div key={step} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.2 }}>
                  <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <current.icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    </div>
                    <h3 className="text-base sm:text-xl font-bold text-foreground">{current.question}</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6 ml-10 sm:ml-[52px]">{current.subtitle}</p>

                  <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
                    {current.options.map((opt) => {
                      const isSelected = current.multi && multiSelections.includes(opt);
                      const isPopular = current.popular?.includes(opt);
                      return (
                        <button
                          key={opt}
                          onClick={() => current.multi ? toggleMulti(opt) : handleSingleSelect(opt)}
                          className={`text-left px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border transition-all text-xs sm:text-sm font-medium flex items-center gap-2 ${
                            isSelected
                              ? "border-primary bg-primary/10 text-primary"
                              : isPopular
                                ? "border-primary/40 bg-primary/5 text-foreground hover:border-primary hover:bg-primary/10"
                                : "border-border hover:border-primary hover:bg-primary/5 text-foreground hover:text-primary"
                          }`}
                        >
                          {current.multi && (
                            <CheckSquare className={`h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0 ${isSelected ? "text-primary" : "text-muted-foreground/30"}`} />
                          )}
                          <span className="flex-1">{opt}</span>
                          {isPopular && !current.multi && (
                            <span className="hidden sm:inline text-[9px] uppercase tracking-wider font-bold text-primary/60">Popular</span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-4 sm:mt-5 flex items-center justify-between">
                    {step > 0 ? (
                      <button onClick={() => { setStep(step - 1); setMultiSelections([]); }} className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">
                        <ArrowLeft className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> Back
                      </button>
                    ) : <div />}
                    {current.multi && (
                      <button
                        onClick={confirmMulti}
                        disabled={multiSelections.length === 0}
                        className="px-4 sm:px-5 py-2 bg-primary text-primary-foreground rounded-xl text-xs sm:text-sm font-semibold disabled:opacity-40 hover:bg-primary/90 transition-colors"
                      >
                        Continue →
                      </button>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  {loading && !result ? (
                    <div className="flex flex-col items-center justify-center py-12 sm:py-16">
                      <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
                      <p className="text-muted-foreground text-sm">Analyzing your profile & finding perfect matches...</p>
                      <p className="text-muted-foreground/60 text-xs mt-1">This takes ~10 seconds</p>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 mb-5">
                        <Sparkles className="h-5 w-5" style={{ color: "#D4A847" }} />
                        <h3 className="text-lg font-bold text-foreground">Your Personalized Recommendations</h3>
                      </div>
                      <ResultContent result={result} />
                      <button onClick={reset} className="mt-6 flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
                        <RotateCcw className="h-4 w-4" /> Start Over
                      </button>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PropertyMatcher;
