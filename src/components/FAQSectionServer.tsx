import { getTranslations } from "next-intl/server";
import { ChevronDown } from "lucide-react";

// Server-rendered FAQ: same data as the FAQPage JSON-LD, so the visible text
// matches the schema and lands in the initial HTML (crawlable without JS).
// Native <details>/<summary> accordion — zero client JS, no framer-motion.
export default async function FAQSectionServer({
  faqs,
  locale,
}: {
  faqs: { question: string; answer: string }[];
  locale: string;
}) {
  const t = await getTranslations({ locale, namespace: "faq" });
  return (
    <section className="py-16 sm:py-24 bg-card">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <div className="h-[2px] w-12 mx-auto mb-6" style={{ background: "linear-gradient(90deg, #D4A847, #B8922F)" }} />
          <p className="font-semibold tracking-[0.4em] uppercase text-xs mb-4" style={{ color: "#D4A847" }}>
            {t("label")}
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
            {t("title")} <span className="font-light">{t("titleItalic")}</span>
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <details
              key={i}
              open={i === 0}
              className="group border border-border/50 rounded-xl overflow-hidden bg-background"
            >
              <summary className="flex items-center justify-between p-5 cursor-pointer list-none [&::-webkit-details-marker]:hidden hover:bg-muted/30 transition-colors">
                <span className="text-sm sm:text-base font-medium text-foreground pr-4">{faq.question}</span>
                <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0 transition-transform duration-200 group-open:rotate-180" />
              </summary>
              <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">{faq.answer}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
