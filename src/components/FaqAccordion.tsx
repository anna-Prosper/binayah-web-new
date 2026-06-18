import { ChevronDown } from "lucide-react";
import { FAQJsonLd } from "./JsonLd";

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqAccordionProps {
  faqs: FaqItem[];
  /** Bordered-card style (current secondary look). */
  variant?: "card" | "compact";
  /** Emit FAQPage JSON-LD. Skip on supplementary inline FAQs to avoid duplicate schema on one page. */
  emitJsonLd?: boolean;
  /** Render all items open by default (dedicated /faq sub-pages). Answers are in the HTML either way. */
  allExpanded?: boolean;
}

/**
 * FAQ accordion built on native <details>/<summary>. The answer text is always
 * present in the server-rendered HTML (collapsed by default, no JS required to
 * read it) so Google indexes it — only the open/closed toggle is interactive.
 * `allExpanded` simply opens every item on load.
 */
export function FaqAccordion({ faqs, variant = "card", emitJsonLd = true, allExpanded = false }: FaqAccordionProps) {
  if (!faqs || faqs.length === 0) return null;

  const jsonLd = emitJsonLd ? <FAQJsonLd faqs={faqs} /> : null;

  if (variant === "compact") {
    // Tighter accordion used in inline / sidebar contexts.
    return (
      <div>
        {jsonLd}
        {faqs.map((faq, i) => (
          <details key={i} open={allExpanded} className="group border-b border-border/50 last:border-0">
            <summary className="w-full flex items-center justify-between gap-4 py-4 text-left cursor-pointer list-none [&::-webkit-details-marker]:hidden">
              <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                {faq.question}
              </span>
              <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0 transition-transform duration-200 group-open:rotate-180" />
            </summary>
            <p className="text-sm text-muted-foreground leading-relaxed pb-4 pr-8">{faq.answer}</p>
          </details>
        ))}
      </div>
    );
  }

  // "card" variant — bordered tiles with accent highlight when open.
  return (
    <div className="space-y-2 sm:space-y-3">
      {jsonLd}
      {faqs.map((faq, i) => (
        <details
          key={i}
          open={allExpanded}
          className="group rounded-xl overflow-hidden border border-border/50 transition-colors hover:border-border open:bg-primary/5 open:border-primary/15"
        >
          <summary className="w-full flex items-center justify-between p-3 sm:p-5 text-left gap-3 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
            <span className="text-xs sm:text-sm font-semibold text-foreground">{faq.question}</span>
            <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0 transition-transform duration-300 group-open:rotate-180 group-open:text-primary" />
          </summary>
          <div className="px-3 sm:px-5 pb-3 sm:pb-5">
            <div className="w-10 h-px bg-primary/20 mb-2 sm:mb-3" />
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
          </div>
        </details>
      ))}
    </div>
  );
}
