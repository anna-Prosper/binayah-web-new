"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";
import Link from "next/link";
const cryptoBg = "/assets/crypto-banner.webp";

const CryptoBanner = () => {
  const t = useTranslations("home.crypto");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const cryptoHref = `${locale === "en" ? "" : `/${locale}`}/buy-with-crypto`;
  return (
  <section className="relative overflow-hidden">
    <div className="relative h-[130px] sm:h-[200px] lg:h-[240px]">
      {/* Background image — next/image serves correctly-sized WebP, saving ~400KB */}
      <Image
        src={cryptoBg}
        alt="Buy property with cryptocurrency"
        fill
        sizes="100vw"
        quality={75}
        className="object-cover object-[center_25%]"
        loading="lazy"
      />
      {/* Rich dual overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#3a2206]/80 via-[#5a3a10]/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, x: -24 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-10 lg:px-16 flex items-center justify-between gap-4"
      >
        <div>
          <p className="text-white/60 text-[9px] sm:text-[11px] font-semibold tracking-[0.3em] uppercase mb-1 sm:mb-2">
            {t("accepting")}
          </p>
          <h2 className="text-white text-lg sm:text-3xl lg:text-[2.5rem] font-bold leading-[1.15]">
            {t("title")}
          </h2>
          <p className="text-white/80 text-base sm:text-2xl lg:text-[2rem] font-light leading-tight mt-0.5">
            {t("subtitle")}
          </p>
        </div>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} className="hidden sm:block shrink-0">
          <Link
            href={cryptoHref}
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-lg text-sm font-bold tracking-wide uppercase transition-all duration-300 hover:shadow-[0_6px_28px_rgba(212,168,71,0.5)] hover:brightness-110"
            style={{
              background: "linear-gradient(135deg, #D4A847 0%, #C49B35 50%, #B8922F 100%)",
              color: "#fff",
              boxShadow: "0 4px 20px rgba(212,168,71,0.35)",
              border: "1px solid rgba(255,255,255,0.15)",
            }}
          >
            {tCommon("learnMore")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </motion.div>

      {/* Mobile CTA */}
      <Link
        href={cryptoHref}
        className="sm:hidden absolute bottom-4 right-4 z-10 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold text-white"
        style={{
          background: "linear-gradient(135deg, #D4A847, #B8922F)",
          boxShadow: "0 3px 16px rgba(212,168,71,0.3)",
        }}
      >
        {tCommon("learnMore")}
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  </section>
  );
};

export default CryptoBanner;