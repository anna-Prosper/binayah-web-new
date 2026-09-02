"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Breadcrumbs from "@/components/Breadcrumbs";
import { motion } from "framer-motion";
import {
  Building2,
  BadgeCheck,
  CalendarClock,
  Users,
  MapPin,
  Phone,
  Clock,
  ArrowRight,
  ShieldCheck,
  Home,
  KeyRound,
  Hammer,
  ClipboardList,
  Calculator,
  LayoutGrid,
} from "lucide-react";
import NextImage from "next/image";
import { useTranslations } from "next-intl";
// Locale-aware Link: localePrefix "as-needed" resolves bare hrefs to English.
import { Link } from "@/navigation";

/* ────────────────────────────────────────────────────────────────────────────
 * VERIFIED COMPANY FACTS — do not add a value here unless it is already
 * published elsewhere in this repo. Sources:
 *   legal name, founding year, ORN, geo, socials → src/components/JsonLd.tsx
 *                                                  (OrganizationJsonLd)
 *   ORN wording                                  → messages/*.json services.reraNote
 *                                                  ("RERA Registration No. 1162")
 *   address / phone / email                      → src/components/Footer.tsx +
 *                                                  contact/ContactPageClient.tsx
 *   office hours                                 → messages/*.json contact.hours
 * Deliberately ABSENT (no verifiable value in the repo): DED trade licence
 * number, VAT/TRN, per-agent BRNs, awards, transaction volume, client counts.
 * ──────────────────────────────────────────────────────────────────────────── */
const LEGAL_NAME = "Binayah Properties L.L.C";
const FOUNDED_YEAR = "2007";
const ORN_DISPLAY = "ORN 1162";
const ADDRESS = "Mezzanine Floor, Liberty Building, Al Quoz 3, Sheikh Zayed Road, Dubai, UAE";
const MAP_URL = "https://maps.google.com/?q=Liberty+Building+Al+Quoz+3+Sheikh+Zayed+Road+Dubai";
const PHONE_DISPLAY = "+971 55 509 9157";
const PHONE_HREF = "tel:+971555099157";
const EMAIL = "info@binayah.com";
const YEARS_DISPLAY = "19+";
const LISTINGS_DISPLAY = "3,000+";
// Proper nouns — not translated. Sourced from the off-plan FAQ in
// src/app/[locale]/off-plan/page.tsx ("leading developers").
const DEVELOPERS = ["Emaar", "DAMAC", "Sobha Realty", "Nakheel", "Aldar", "MAG"];

interface Props {
  /** Published, indexable agent profiles — counted from the DB in page.tsx. */
  agentCount: number;
  /** In-house operations roles listed on /team (src/lib/support-team.ts). */
  supportCount: number;
}

export default function AboutPage({ agentCount, supportCount }: Props) {
  const t = useTranslations("about");
  const tc = useTranslations("contact");

  const stats = [
    { icon: CalendarClock, value: YEARS_DISPLAY, label: t("statYears"), note: t("statYearsNote") },
    { icon: Building2, value: LISTINGS_DISPLAY, label: t("statListings"), note: t("statListingsNote") },
    { icon: ShieldCheck, value: ORN_DISPLAY, label: t("statOrn"), note: t("statOrnNote") },
    ...(agentCount > 0
      ? [{ icon: Users, value: `${agentCount}`, label: t("statTeam"), note: t("statTeamNote") }]
      : []),
  ];

  const facts: { label: string; value: string; href?: string }[] = [
    { label: t("factLegalName"), value: LEGAL_NAME },
    { label: t("factFounded"), value: t("factFoundedValue") },
    { label: t("factYears"), value: t("factYearsValue") },
    { label: t("factStatus"), value: t("factStatusValue") },
    { label: t("factOrn"), value: `${ORN_DISPLAY} — ${t("factOrnIssuer")}` },
    { label: t("factRegulator"), value: t("factRegulatorValue") },
    { label: t("factOffice"), value: ADDRESS, href: MAP_URL },
    { label: t("factAreas"), value: t("factAreasValue") },
    { label: t("factLanguages"), value: t("factLanguagesValue") },
    { label: t("factHours"), value: tc("hours") },
    { label: t("factPhone"), value: PHONE_DISPLAY, href: PHONE_HREF },
    { label: t("factEmail"), value: EMAIL, href: `mailto:${EMAIL}` },
  ];

  const services: { href: string; title: string; desc: string; icon: typeof Home }[] = [
    { href: "/buy", title: t("svcBuy"), desc: t("svcBuyDesc"), icon: Home },
    { href: "/sell", title: t("svcSell"), desc: t("svcSellDesc"), icon: ClipboardList },
    { href: "/rent", title: t("svcRent"), desc: t("svcRentDesc"), icon: KeyRound },
    { href: "/off-plan", title: t("svcOffPlan"), desc: t("svcOffPlanDesc"), icon: Hammer },
    {
      href: "/services/property-management",
      title: t("svcManagement"),
      desc: t("svcManagementDesc"),
      icon: Building2,
    },
    { href: "/valuation", title: t("svcValuation"), desc: t("svcValuationDesc"), icon: Calculator },
    { href: "/services", title: t("svcAll"), desc: t("svcAllDesc"), icon: LayoutGrid },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Breadcrumbs items={[{ label: t("breadcrumb"), href: "/about" }]} />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section
        className="relative pt-32 pb-20 text-white overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
      >
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-accent font-semibold tracking-[0.4em] uppercase text-xs mb-4">
              {t("heroLabel")}
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              {t("heroTitle")} <span className="font-light">{t("heroTitleItalic")}</span>
            </h1>
            <p className="text-primary-foreground/70 max-w-2xl text-lg leading-relaxed">
              {t("heroSubtitle")}
            </p>
            <div className="mt-8 flex flex-wrap gap-2.5">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs sm:text-sm">
                <BadgeCheck className="h-4 w-4 text-accent" />
                {ORN_DISPLAY}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs sm:text-sm">
                <CalendarClock className="h-4 w-4 text-accent" />
                {t("chipSince", { year: FOUNDED_YEAR })}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs sm:text-sm">
                <MapPin className="h-4 w-4 text-accent" />
                {t("chipOffice")}
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── 1. Who Binayah is — the direct answer, first thing on the page ── */}
      <section className="py-20 sm:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="h-[2px] w-12 bg-accent mb-6" />
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
              {t("answerTitle")} <span className="font-light">{t("answerTitleItalic")}</span>
            </h2>
            <div className="space-y-5 text-foreground/75 leading-relaxed text-base sm:text-lg">
              <p className="text-foreground font-medium">{t("answerP1")}</p>
              <p>{t("answerP2")}</p>
              <p>{t("answerP3")}</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── 2. Company facts / credentials ───────────────────────────────── */}
      <section className="py-20 sm:py-24 bg-card border-y border-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10"
          >
            <p className="text-accent font-semibold tracking-[0.3em] uppercase text-[11px] mb-3">
              {t("factsLabel")}
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              {t("factsTitle")} <span className="font-light">{t("factsTitleItalic")}</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl leading-relaxed">{t("factsSubtitle")}</p>
          </motion.div>

          <dl className="grid sm:grid-cols-2 gap-px bg-border/60 rounded-2xl overflow-hidden border border-border/60">
            {facts.map((f) => (
              <div key={f.label} className="bg-card p-5 sm:p-6">
                <dt className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-2">
                  {f.label}
                </dt>
                <dd className="text-foreground font-medium leading-relaxed">
                  {f.href ? (
                    <a
                      href={f.href}
                      target={f.href.startsWith("http") ? "_blank" : undefined}
                      rel={f.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="hover:text-accent transition-colors"
                    >
                      {f.value}
                    </a>
                  ) : (
                    f.value
                  )}
                </dd>
              </div>
            ))}
          </dl>

          <p className="mt-6 text-xs text-muted-foreground max-w-3xl leading-relaxed">
            {t("factsVerifyNote")}
          </p>
        </div>
      </section>

      {/* ── 3. Track record ──────────────────────────────────────────────── */}
      <section className="py-20 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10"
          >
            <p className="text-accent font-semibold tracking-[0.3em] uppercase text-[11px] mb-3">
              {t("trackLabel")}
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              {t("trackTitle")} <span className="font-light">{t("trackTitleItalic")}</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-card border border-border/50 rounded-2xl p-5 sm:p-6"
              >
                <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                  <s.icon className="h-5 w-5 text-accent" />
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-foreground">{s.value}</p>
                <p className="text-sm text-foreground/80 mt-1 font-medium">{s.label}</p>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{s.note}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-5 mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-card border border-border/50 rounded-2xl p-6"
            >
              <h3 className="font-bold text-lg text-foreground mb-3">{t("devTitle")}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{t("devBody")}</p>
              <ul className="flex flex-wrap gap-2">
                {DEVELOPERS.map((d) => (
                  <li
                    key={d}
                    className="text-xs font-medium rounded-full border border-border/70 px-3 py-1 text-foreground/70"
                  >
                    {d}
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.08 }}
              className="bg-card border border-border/50 rounded-2xl p-6"
            >
              <h3 className="font-bold text-lg text-foreground mb-3">{t("scopeTitle")}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{t("scopeBody")}</p>
              <p className="text-sm text-muted-foreground leading-relaxed mt-3">{t("scopeBody2")}</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 4. Team ──────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-24 bg-card border-y border-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
                <NextImage
                  src="/assets/team.webp"
                  alt="Binayah Properties team"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover object-top"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <p className="text-accent font-semibold tracking-[0.3em] uppercase text-[11px] mb-3">
                {t("teamLabel")}
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-5">
                {t("teamTitle")} <span className="font-light">{t("teamTitleItalic")}</span>
              </h2>
              <div className="space-y-4 text-foreground/75 leading-relaxed">
                <p>{agentCount > 0 ? t("teamBody", { count: agentCount }) : t("teamBodyFallback")}</p>
                <p>{t("teamSupport", { count: supportCount })}</p>
              </div>
              <p className="mt-5 text-sm text-muted-foreground leading-relaxed border-s-2 border-accent/40 ps-4">
                {t("teamBrnNote")}
              </p>
              <Link
                href="/team"
                className="mt-7 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground hover:opacity-90 transition-opacity"
              >
                {t("teamCta")}
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 5. Services ──────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10"
          >
            <p className="text-accent font-semibold tracking-[0.3em] uppercase text-[11px] mb-3">
              {t("servicesLabel")}
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              {t("servicesTitle")} <span className="font-light">{t("servicesTitleItalic")}</span>
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {services.map((s, i) => (
              <motion.div
                key={s.href}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  href={s.href}
                  className="group block h-full bg-card border border-border/50 rounded-2xl p-6 hover:border-accent/60 transition-colors"
                >
                  <s.icon className="h-6 w-6 text-accent mb-4" />
                  <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
                    {s.title}
                    <ArrowRight className="h-4 w-4 text-accent opacity-0 group-hover:opacity-100 transition-opacity rtl:rotate-180" />
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. Contact / NAP ─────────────────────────────────────────────── */}
      <section className="py-20 sm:py-24 bg-card border-t border-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10"
          >
            <p className="text-accent font-semibold tracking-[0.3em] uppercase text-[11px] mb-3">
              {t("contactLabel")}
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              {t("contactTitle")} <span className="font-light">{t("contactTitleItalic")}</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl leading-relaxed">{t("contactSubtitle")}</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            <div className="bg-background border border-border/50 rounded-2xl p-6">
              <Building2 className="h-5 w-5 text-accent mb-3" />
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-1.5">
                {t("contactName")}
              </p>
              <p className="text-foreground font-medium">{LEGAL_NAME}</p>
            </div>
            <a
              href={MAP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-background border border-border/50 rounded-2xl p-6 hover:border-accent/60 transition-colors"
            >
              <MapPin className="h-5 w-5 text-accent mb-3" />
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-1.5">
                {t("factOffice")}
              </p>
              <p className="text-foreground font-medium leading-relaxed">{ADDRESS}</p>
              <p className="text-xs text-accent mt-2">{t("directions")}</p>
            </a>
            <div className="bg-background border border-border/50 rounded-2xl p-6">
              <Phone className="h-5 w-5 text-accent mb-3" />
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-1.5">
                {t("factPhone")}
              </p>
              <a href={PHONE_HREF} className="text-foreground font-medium hover:text-accent transition-colors" dir="ltr">
                {PHONE_DISPLAY}
              </a>
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground mt-4 mb-1.5">
                {t("factEmail")}
              </p>
              <a
                href={`mailto:${EMAIL}`}
                className="text-foreground font-medium hover:text-accent transition-colors break-all"
                dir="ltr"
              >
                {EMAIL}
              </a>
            </div>
            <div className="bg-background border border-border/50 rounded-2xl p-6">
              <Clock className="h-5 w-5 text-accent mb-3" />
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-1.5">
                {t("factHours")}
              </p>
              <p className="text-foreground font-medium">{tc("hours")}</p>
              <Link
                href="/contact"
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline"
              >
                {t("contactCta")}
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
