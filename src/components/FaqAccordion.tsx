"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqAccordionProps {
  faqs: FaqItem[];
  /** Bordered-card style (current secondary look). */
  variant?: "card" | "compact";
}

export function FaqAccordion({ faqs, variant = "card" }: FaqAccordionProps) {
  const [open, setOpen] = useState<number | null>(null);

  if (!faqs || faqs.length === 0) return null;

  if (variant === "compact") {
    // Tighter accordion used in inline / sidebar contexts.
    return (
      <div>
        {faqs.map((faq, i) => (
          <div key={i} className="border-b border-border/50 last:border-0">
            <button
              type="button"
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between gap-4 py-4 text-left group"
            >
              <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                {faq.question}
              </span>
              <ChevronDown
                className={`h-4 w-4 text-muted-foreground flex-shrink-0 transition-transform duration-200 ${open === i ? "rotate-180" : ""}`}
              />
            </button>
            <AnimatePresence initial={false}>
              {open === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className="overflow-hidden"
                >
                  <p className="text-sm text-muted-foreground leading-relaxed pb-4 pr-8">{faq.answer}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    );
  }

  // "card" variant — bordered tiles with accent highlight when open.
  return (
    <div className="space-y-2 sm:space-y-3">
      {faqs.map((faq, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.05 }}
          className={`rounded-xl overflow-hidden transition-colors ${open === i ? "bg-primary/5 border border-primary/15" : "border border-border/50 hover:border-border"}`}
        >
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between p-3 sm:p-5 text-left gap-3"
          >
            <span className="text-xs sm:text-sm font-semibold text-foreground">{faq.question}</span>
            <ChevronDown
              className={`h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0 transition-transform duration-300 ${open === i ? "rotate-180 text-primary" : ""}`}
            />
          </button>
          <AnimatePresence>
            {open === i && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                <div className="px-3 sm:px-5 pb-3 sm:pb-5">
                  <div className="w-10 h-px bg-primary/20 mb-2 sm:mb-3" />
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
}
