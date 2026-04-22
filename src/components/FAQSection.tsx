"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { FAQJsonLd } from "./JsonLd";
import { useTranslations } from "next-intl";

const faqs = [
  {
    question: "How do I buy property in Dubai as a foreigner?",
    answer:
      "Foreigners can purchase freehold property in designated areas of Dubai. You'll need a valid passport, and no residency visa is required. Binayah guides you through the entire process — from selecting the right property to DLD registration and handover.",
  },
  {
    question: "What is off-plan property and is it a good investment?",
    answer:
      "Off-plan properties are purchased directly from developers before or during construction, typically at lower prices than ready properties. They offer flexible payment plans (often 60/40 or 70/30) and strong capital appreciation potential. Dubai's off-plan market has historically delivered 20-40% returns by handover.",
  },
  {
    question: "What are the costs involved in buying property in Dubai?",
    answer:
      "The main costs include: 4% DLD (Dubai Land Department) transfer fee, 2% agency commission, AED 4,200 DLD admin fee, and approximately AED 5,000-10,000 for NOC and trustee fees. There is no property tax, capital gains tax, or income tax on rental yields in Dubai.",
  },
  {
    question: "Can I get a Golden Visa through property investment?",
    answer:
      "Yes. Investing AED 2 million or more in Dubai real estate qualifies you for a 10-year Golden Visa. The property can be off-plan or ready, and you can combine multiple properties to meet the threshold. Binayah can help you identify Golden Visa-eligible properties.",
  },
  {
    question: "What rental yields can I expect in Dubai?",
    answer:
      "Dubai offers some of the highest rental yields globally, averaging 5-8% net. Areas like JVC, Dubai Silicon Oasis, and International City can yield 8-10%, while premium locations like Dubai Marina and Downtown average 5-7%. Our Pulse dashboard provides live yield data by area.",
  },
  {
    question: "How does Binayah's property management service work?",
    answer:
      "Our full-service property management includes tenant sourcing, rent collection, maintenance coordination, DEWA/Ejari setup, and regular property inspections. We charge a competitive management fee and handle everything so you can enjoy hassle-free rental income.",
  },
];

export default function FAQSection() {
  const t = useTranslations("faq");
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-16 sm:py-24 bg-card">
      <FAQJsonLd faqs={faqs} />
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <div
            className="h-[2px] w-12 mx-auto mb-6"
            style={{ background: "linear-gradient(90deg, #D4A847, #B8922F)" }}
          />
          <p
            className="font-semibold tracking-[0.4em] uppercase text-xs mb-4"
            style={{ color: "#D4A847" }}
          >
            {t("label")}
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
            {t("title")} <span className="italic font-light">{t("titleItalic")}</span>
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className="border border-border/50 rounded-xl overflow-hidden bg-background"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-muted/30 transition-colors"
                >
                  <span className="text-sm sm:text-base font-medium text-foreground pr-4">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 text-muted-foreground flex-shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
