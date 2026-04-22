"use client";

import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "next-intl";

const NewsletterStrip = () => {
  const [email, setEmail] = useState("");
  const { toast } = useToast();
  const t = useTranslations("newsletter");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast({ title: t("successTitle"), description: t("successDesc") });
      setEmail("");
    }
  };

  return (
    <section className="py-6 sm:py-10" style={{ background: "linear-gradient(135deg, #D4A847, #B8922F)" }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6"
        >
          {/* Desktop: icon + text side by side */}
          <div className="hidden sm:flex items-center gap-3 flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Mail className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">{t("title")}</p>
              <p className="text-white/70 text-xs">{t("subtitle")}</p>
            </div>
          </div>

          {/* Mobile: compact single-line label */}
          <p className="sm:hidden text-white font-bold text-sm text-center">
            {t("titleMobile")}
          </p>

          <div className="flex flex-1 w-full sm:w-auto gap-2 min-w-0">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("placeholder")}
              className="flex-1 min-w-0 bg-white/25 border border-white/20 rounded-full px-4 py-3 text-sm text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/40 focus:bg-white/35"
              required
            />
            <button
              type="submit"
              className="font-bold px-5 sm:px-6 py-3 rounded-full text-sm transition-all hover:-translate-y-0.5 flex-shrink-0 whitespace-nowrap shadow-lg"
              style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)", color: "white" }}
            >
              {t("button")}
            </button>
          </div>
        </motion.form>
      </div>
    </section>
  );
};

export default NewsletterStrip;
