"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Breadcrumbs from "@/components/Breadcrumbs";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2, TrendingUp, Home, Key, FileText, Handshake,
  ArrowRight, ChevronDown, Phone, MessageCircle, Shield,
  CheckCircle2, Globe, Award, Users, BadgeCheck,
  Landmark, ClipboardCheck, BarChart3, Info, Layers,
} from "lucide-react";
// Locale-aware Link (next-intl): plain next/link emits bare hrefs, which
// localePrefix "as-needed" resolves to the DEFAULT locale — dropping non-English
// readers back into English. This variant prefixes hrefs with the active locale.
import { Link } from "@/navigation";
import { waHref, WA_DEFAULT_MESSAGE } from "@/lib/whatsapp";
import { useState } from "react";
import { useTranslations } from "next-intl";

/* ──────────────────────────────────────────────────────────────────────────
   /services is the PARENT hub of the company cluster. It targets the
   word-order variants of one entity query — "real estate company in Dubai",
   "property company in Dubai", "property companies in Dubai", "Dubai real
   estate company", "Dubai property company" — on a single page, and routes
   into the specialist children rather than competing with them:
     /services/real-estate-agency-dubai   — agency / service-menu angle
     /services/real-estate-broker-dubai   — broker / transaction angle
     /services/property-investment-dubai  — investment angle
   Every claim on this page must be sourceable in-repo. The stat tiles below
   map to: JsonLd.tsx foundingDate (2007 → 19+ years), JsonLd.tsx
   hasCredential.identifier / footer.ornNumber (RERA ORN 1162), the about
   page's LISTINGS_DISPLAY (3,000+), and the live published-agent count
   passed in from the server. Do not add a stat without a source.
   ────────────────────────────────────────────────────────────────────────── */

/** Route map — every href verified to exist under src/app/[locale]. */
const ROUTES = {
  agency: "/services/real-estate-agency-dubai",
  broker: "/services/real-estate-broker-dubai",
  invest: "/services/property-investment-dubai",
  management: "/services/property-management",
  buy: "/buy",
  sell: "/sell",
  rent: "/rent",
  offPlan: "/off-plan",
  valuation: "/valuation",
  team: "/team",
  about: "/about",
  contact: "/contact",
} as const;

export default function ServicesPage({ agentCount = 0 }: { agentCount?: number }) {
  const t = useTranslations("services");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Sourced stats only. The agent tile is driven by the live published-agent
  // count and disappears entirely if the DB read came back empty, rather than
  // rendering a placeholder number.
  const stats: { value: string; label: string; icon: typeof Award }[] = [
    { value: t("statYears"), label: t("statYearsLabel"), icon: Award },
    { value: t("statOrn"), label: t("statOrnLabel"), icon: BadgeCheck },
    { value: t("statListings"), label: t("statListingsLabel"), icon: Building2 },
  ];
  if (agentCount > 0) {
    stats.push({ value: String(agentCount), label: t("statAgentsLabel"), icon: Users });
  }

  const facts = [
    { label: t("factLegalLabel"), value: t("factLegalValue") },
    { label: t("factOrnLabel"), value: t("factOrnValue") },
    { label: t("factSinceLabel"), value: t("factSinceValue") },
    { label: t("factBaseLabel"), value: t("factBaseValue") },
  ];

  const routeGroups = [
    {
      heading: t("routeGroupA"),
      items: [
        { icon: Landmark, title: t("routeAgencyTitle"), desc: t("routeAgencyDesc"), href: ROUTES.agency },
        { icon: Handshake, title: t("routeBrokerTitle"), desc: t("routeBrokerDesc"), href: ROUTES.broker },
        { icon: TrendingUp, title: t("routeInvestTitle"), desc: t("routeInvestDesc"), href: ROUTES.invest },
      ],
    },
    {
      heading: t("routeGroupB"),
      items: [
        { icon: Home, title: t("routeBuyTitle"), desc: t("routeBuyDesc"), href: ROUTES.buy },
        { icon: FileText, title: t("routeSellTitle"), desc: t("routeSellDesc"), href: ROUTES.sell },
        { icon: Key, title: t("routeRentTitle"), desc: t("routeRentDesc"), href: ROUTES.rent },
        { icon: Building2, title: t("routeOffPlanTitle"), desc: t("routeOffPlanDesc"), href: ROUTES.offPlan },
        { icon: BarChart3, title: t("routeValuationTitle"), desc: t("routeValuationDesc"), href: ROUTES.valuation },
        { icon: ClipboardCheck, title: t("routeMgmtTitle"), desc: t("routeMgmtDesc"), href: ROUTES.management },
      ],
    },
    {
      heading: t("routeGroupC"),
      items: [
        { icon: Users, title: t("routeTeamTitle"), desc: t("routeTeamDesc"), href: ROUTES.team },
        { icon: Info, title: t("routeAboutTitle"), desc: t("routeAboutDesc"), href: ROUTES.about },
        { icon: Phone, title: t("routeContactTitle"), desc: t("routeContactDesc"), href: ROUTES.contact },
      ],
    },
  ];

  const processSteps = [
    { num: "01", title: t("step1Title"), desc: t("step1Desc") },
    { num: "02", title: t("step2Title"), desc: t("step2Desc") },
    { num: "03", title: t("step3Title"), desc: t("step3Desc") },
    { num: "04", title: t("step4Title"), desc: t("step4Desc") },
  ];

  const whyPoints = [
    { icon: Shield, title: t("why1Title"), desc: t("why1Desc") },
    { icon: Award, title: t("why2Title"), desc: t("why2Desc") },
    { icon: Layers, title: t("why3Title"), desc: t("why3Desc") },
    { icon: Globe, title: t("why4Title"), desc: t("why4Desc") },
    { icon: Users, title: t("why5Title"), desc: t("why5Desc") },
    { icon: CheckCircle2, title: t("why6Title"), desc: t("why6Desc") },
  ];

  // Kept in lockstep with the FAQPage JSON-LD emitted by page.tsx, which reads
  // the same message keys — the visible answers and the structured data can't
  // drift apart.
  const faqs = [1, 2, 3, 4, 5, 6].map((i) => ({
    q: t(`faq${i}Q`),
    a: t(`faq${i}A`),
  }));

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />
      <Breadcrumbs items={[{ label: t("heroLabel"), href: "/services" }]} />

      {/* ═══ HERO ═══ */}
      <section className="relative pt-24 sm:pt-32 pb-16 sm:pb-24 text-white overflow-hidden" style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}>
        {/* Dot pattern */}
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)", backgroundSize: "48px 48px" }} />
        {/* Decorative lines */}
        <div className="absolute top-1/4 left-8 w-px h-32 bg-gradient-to-b from-transparent via-white/10 to-transparent hidden lg:block" />
        <div className="absolute top-1/3 right-12 w-px h-24 bg-gradient-to-b from-transparent via-[#D4A847]/20 to-transparent hidden lg:block" />
        {/* Glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #D4A847, transparent 70%)" }} />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
          {/* Breadcrumb */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="flex items-center gap-1.5 text-[11px] sm:text-sm text-white/40 mb-6 sm:mb-8">
            <Link href="/" className="hover:text-white/70 transition-colors">{t("breadcrumbHome")}</Link>
            <ArrowRight className="h-3 w-3 rtl:rotate-180" />
            <span className="text-white/70">{t("heroLabel")}</span>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <motion.div initial={{ width: 0 }} animate={{ width: "3rem" }} transition={{ duration: 0.8, delay: 0.3 }} className="h-[2px] mb-5 sm:mb-6" style={{ background: "linear-gradient(90deg, #D4A847, #B8922F)" }} />
            <p className="font-semibold tracking-[0.4em] uppercase text-[10px] sm:text-xs mb-3 sm:mb-4" style={{ color: "#D4A847" }}>{t("heroLabel")}</p>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-[1.1]">
              {t("heroTitle")}<br /><span className="font-light">{t("heroTitleItalic")}</span>
            </h1>
            <p className="text-white/70 max-w-2xl text-sm sm:text-lg leading-relaxed">
              {t("heroSubtitle")}
            </p>
          </motion.div>

          {/* Stats strip — sourced values only (see file header) */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className={`mt-8 sm:mt-12 grid gap-2 sm:gap-4 ${stats.length === 4 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-3"}`}>
            {stats.map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.1 }}
                className="text-center sm:text-start bg-white/[0.06] backdrop-blur-sm border border-white/10 rounded-xl sm:rounded-2xl p-2.5 sm:p-5">
                <s.icon className="h-4 w-4 sm:h-5 sm:w-5 mx-auto sm:mx-0 mb-1 sm:mb-2" style={{ color: "#D4A847" }} />
                <p className="text-base sm:text-2xl font-bold text-white">{s.value}</p>
                <p className="text-[9px] sm:text-xs text-white/50 mt-0.5">{s.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══ DIRECT ANSWER — what the company is ═══ */}
      <section className="py-12 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <p className="font-semibold tracking-[0.4em] uppercase text-[10px] sm:text-xs mb-2 sm:mb-3" style={{ color: "#D4A847" }}>{t("answerLabel")}</p>
            <h2 className="text-2xl sm:text-4xl font-bold text-foreground mb-4 sm:mb-6">{t("answerTitle")}</h2>
            <div className="space-y-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
              <p>{t("answerP1")}</p>
              <p>{t("answerP2")}</p>
              <p>{t("answerP3")}</p>
            </div>

            {/* Company facts — every value is sourced in-repo */}
            <dl className="mt-7 sm:mt-9 grid sm:grid-cols-2 gap-3 sm:gap-4">
              {facts.map((f) => (
                <div key={f.label} className="rounded-xl sm:rounded-2xl border border-border/60 bg-card p-4 sm:p-5">
                  <dt className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground">{f.label}</dt>
                  <dd className="mt-1 text-sm sm:text-base font-bold text-foreground">{f.value}</dd>
                </div>
              ))}
            </dl>
          </motion.div>
        </div>
      </section>

      {/* ═══ ROUTING — the whole service range, and where each one lives ═══ */}
      <section className="pt-4 pb-14 sm:pt-6 sm:pb-24" style={{ background: "linear-gradient(180deg, hsl(var(--muted) / 0.3) 0%, hsl(var(--background)) 100%)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-8 sm:mb-14 pt-10 sm:pt-16">
            <motion.div initial={{ width: 0 }} whileInView={{ width: "3rem" }} viewport={{ once: true }} className="h-[2px] mx-auto mb-4 sm:mb-6" style={{ background: "linear-gradient(90deg, #0B3D2E, #1A7A5A)" }} />
            <p className="font-semibold tracking-[0.4em] uppercase text-[10px] sm:text-xs mb-2 sm:mb-4" style={{ color: "#0B3D2E" }}>{t("routeLabel")}</p>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-foreground">
              {t("routeTitle")} <span className="font-light">{t("routeTitleItalic")}</span>
            </h2>
            <p className="mt-3 sm:mt-5 text-muted-foreground max-w-lg mx-auto text-sm sm:text-base">
              {t("routeSubtitle")}
            </p>
          </motion.div>

          <div className="space-y-8 sm:space-y-12">
            {routeGroups.map((group) => (
              <div key={group.heading}>
                <h3 className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground mb-3 sm:mb-5">{group.heading}</h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
                  {group.items.map((s, i) => (
                    <motion.div key={s.href} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}>
                      <Link href={s.href}
                        className="group block bg-card border border-border/50 hover:border-primary/25 rounded-2xl p-5 sm:p-7 transition-all duration-300 hover:shadow-lg hover:shadow-primary/[0.06] h-full">
                        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mb-3 sm:mb-4 overflow-hidden relative transition-all duration-300 group-hover:scale-110"
                          style={{ backgroundColor: "rgba(11,61,46,0.08)" }}>
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }} />
                          <s.icon className="h-5 w-5 text-primary relative z-10 group-hover:text-white transition-colors duration-300" />
                        </div>
                        <h4 className="font-bold text-base sm:text-lg text-foreground mb-1.5 sm:mb-2 group-hover:text-primary transition-colors">{s.title}</h4>
                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-3 sm:mb-4">{s.desc}</p>
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary group-hover:gap-2.5 transition-all">
                          {t("learnMore")} <ArrowRight className="h-3 w-3 rtl:rotate-180" />
                        </span>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="py-12 sm:py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-8 sm:mb-14">
            <p className="font-semibold tracking-[0.4em] uppercase text-[10px] sm:text-xs mb-2 sm:mb-3" style={{ color: "#D4A847" }}>{t("howItWorksLabel")}</p>
            <h2 className="text-2xl sm:text-4xl font-bold text-foreground">{t("howItWorksTitle")} <span className="font-light">{t("howItWorksTitleItalic")}</span></h2>
          </motion.div>

          {/* Mobile: vertical timeline */}
          <div className="sm:hidden space-y-3">
            {processSteps.map((step, i) => (
              <motion.div key={step.num} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-sm font-black text-white"
                  style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}>
                  {step.num}
                </div>
                <div className="pt-1">
                  <h3 className="text-sm font-bold text-foreground">{step.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Desktop: horizontal steps with connecting line */}
          <div className="hidden sm:block">
            <div className="relative">
              {/* Connecting line */}
              <div className="absolute top-8 left-[10%] right-[10%] h-px bg-border" />
              <div className="grid grid-cols-4 gap-6">
                {processSteps.map((step, i) => (
                  <motion.div key={step.num} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                    className="relative text-center group">
                    <div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center text-xl font-black text-white relative z-10 shadow-lg transition-transform duration-300 group-hover:scale-110"
                      style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)", boxShadow: "0 8px 24px rgba(11,61,46,0.25)" }}>
                      {step.num}
                    </div>
                    <h3 className="text-base font-bold text-foreground mb-1.5">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ WHY BINAYAH ═══ */}
      <section className="py-14 sm:py-24 text-white relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}>
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)", backgroundSize: "48px 48px" }} />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #D4A847, transparent 70%)" }} />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-8 sm:mb-14">
            <motion.div initial={{ width: 0 }} whileInView={{ width: "3rem" }} viewport={{ once: true }} className="h-[2px] mx-auto mb-4 sm:mb-6" style={{ background: "linear-gradient(90deg, #D4A847, #B8922F)" }} />
            <p className="font-semibold tracking-[0.4em] uppercase text-[10px] sm:text-xs mb-2 sm:mb-4" style={{ color: "#D4A847" }}>{t("whyLabel")}</p>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold">
              {t("whyTitle")} <span className="font-light">{t("whyTitleItalic")}</span>
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-5">
            {whyPoints.map((item, i) => (
              <motion.div key={item.title} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                className="bg-white/[0.06] backdrop-blur-sm border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-5 hover:bg-white/[0.1] hover:border-white/20 transition-all duration-300 group">
                <item.icon className="h-4 w-4 sm:h-5 sm:w-5 mb-2 sm:mb-3 transition-transform duration-300 group-hover:scale-110" style={{ color: "#D4A847" }} />
                <h3 className="font-bold text-xs sm:text-sm text-white mb-0.5 sm:mb-1">{item.title}</h3>
                <p className="text-[11px] sm:text-xs text-white/60 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section className="py-14 sm:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-8 sm:mb-14">
            <motion.div initial={{ width: 0 }} whileInView={{ width: "3rem" }} viewport={{ once: true }} className="h-[2px] mx-auto mb-4 sm:mb-6" style={{ background: "linear-gradient(90deg, #D4A847, #B8922F)" }} />
            <p className="font-semibold tracking-[0.4em] uppercase text-[10px] sm:text-xs mb-2 sm:mb-4" style={{ color: "#D4A847" }}>{t("faqLabel")}</p>
            <h2 className="text-2xl sm:text-4xl font-bold text-foreground">
              {t("faqTitle")} <span className="font-light">{t("faqTitleItalic")}</span>
            </h2>
          </motion.div>

          <div className="space-y-2 sm:space-y-3">
            {faqs.map((faq, i) => (
              <motion.div key={faq.q} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className={`rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-300 border ${openFaq === i ? "border-primary/20 bg-primary/[0.02] shadow-sm" : "border-border/50 bg-card hover:border-border"}`}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-4 sm:p-5 text-start gap-3">
                  <span className="text-sm sm:text-base font-semibold text-foreground">{faq.q}</span>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground flex-shrink-0 transition-transform duration-300 ${openFaq === i ? "rotate-180 text-primary" : ""}`} />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}>
                      <div className="px-4 sm:px-5 pb-4 sm:pb-5">
                        <div className="w-10 h-px mb-3" style={{ background: "linear-gradient(90deg, #D4A847, transparent)" }} />
                        <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-14 sm:py-20 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}>
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "40px 40px" }} />
        <div className="absolute -top-16 right-0 w-64 h-64 rounded-full opacity-[0.08]" style={{ background: "radial-gradient(circle, #D4A847, transparent 70%)" }} />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-2xl sm:text-4xl font-bold text-white mb-3 sm:mb-4">{t("ctaTitle")}</h2>
            <p className="text-white/60 max-w-lg mx-auto text-sm sm:text-base">
              {t("ctaSubtitle")}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 sm:gap-4 max-w-xl mx-auto">
            <a href={waHref(WA_DEFAULT_MESSAGE, "https://www.binayah.ae/services")}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 py-3.5 sm:py-4 rounded-xl sm:rounded-full bg-gradient-to-r from-[#25D366] to-[#1DA851] text-white font-bold text-sm transition-all hover:shadow-xl hover:shadow-[#25D366]/25 hover:scale-[1.02] active:scale-[0.98]">
              <MessageCircle className="h-4 w-4" /> {t("whatsappUs")}
            </a>
            <Link href={ROUTES.contact}
              className="flex items-center justify-center gap-2.5 py-3.5 sm:py-4 rounded-xl sm:rounded-full text-white font-bold text-sm transition-all hover:shadow-xl hover:shadow-accent/25 hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: "linear-gradient(135deg, #D4A847, #B8922F)" }}>
              <Phone className="h-4 w-4" /> {t("scheduleCall")}
            </Link>
          </div>

          <p className="text-center text-white/30 text-[11px] sm:text-xs mt-5 sm:mt-6">
            {t("reraNote")}
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
