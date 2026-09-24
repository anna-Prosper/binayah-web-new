"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Breadcrumbs from "@/components/Breadcrumbs";
import Reveal from "@/components/Reveal";
import { useTranslations } from "next-intl";

export default function TermsOfServiceClient() {
  const t = useTranslations("termsOfService");

  const sections = [
    "acceptance",
    "useOfService",
    "intellectualProperty",
    "liability",
    "governing",
  ] as const;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Breadcrumbs items={[{ label: t("breadcrumb"), href: "/terms-of-service" }]} />

      {/* Hero */}
      <section
        className="relative pt-32 pb-20 text-white overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
      >
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 relative">
          <Reveal trigger="mount" y={20}>
            <p className="text-accent font-semibold tracking-[0.4em] uppercase text-xs mb-4">
              {t("heroLabel")}
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              {t("heroTitle")}{" "}
              <span className="font-light">{t("heroTitleItalic")}</span>
            </h1>
            <p className="text-primary-foreground/70 text-lg mb-6">
              {t("heroSubtitle")}
            </p>
            <p className="text-white/40 text-sm">{t("lastUpdated")}</p>
          </Reveal>
        </div>
      </section>

      {/* Body */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="space-y-10">
            {sections.map((key, i) => (
              <Reveal
                key={key}
                y={24}
                delay={i * 60}
                className="bg-card rounded-2xl p-6 sm:p-8 border border-border/50"
              >
                <div className="h-[2px] w-8 rounded-full bg-gradient-to-r from-accent to-accent/60 mb-3" />
                <h2 className="text-xl font-bold text-foreground mb-4">
                  {t(`sections.${key}.title`)}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {t(`sections.${key}.body`)}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
