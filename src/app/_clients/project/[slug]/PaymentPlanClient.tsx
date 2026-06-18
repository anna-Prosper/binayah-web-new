/* eslint-disable i18next/no-literal-string -- SEO content intentionally in English */
"use client";

import { useTranslations } from "next-intl";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { DetailBreadcrumb } from "@/components/DetailBreadcrumb";
import { ProjectSubNav } from "@/components/ProjectSubNav";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  CreditCard, Wallet, Building2, Home, MessageCircle, BadgeDollarSign,
} from "lucide-react";
import { useCurrency, CurrencyPrice } from "@/context/CurrencyContext";

export default function PaymentPlanClient({ serverProject }: { serverProject: any }) {
  const t = useTranslations("projectDetail");
  const { format: formatPrice } = useCurrency();
  const project = serverProject;

  const status      = String(project.status || "").toLowerCase();
  const isRent      = /rent/i.test(status);
  const isReady     = /ready|complet/i.test(status);
  const parentLabel = isRent ? t("breadcrumbRent") : isReady ? t("breadcrumbBuy") : t("breadcrumbOffPlan");
  const parentHref  = isRent ? "/rent" : isReady ? "/buy" : "/off-plan";

  const downPct    = parseInt(project.downPayment || "0") || 20;
  const duringPct  = 100 - downPct > 40 ? Math.round((100 - downPct) * 0.6) : 100 - downPct - 20;
  const handoverPct = 100 - downPct - (duringPct > 0 ? duringPct : 0);
  const startingPrice = project.startingPrice
    ? (project.startingPrice < 1_000 ? project.startingPrice * 1_000_000 : project.startingPrice)
    : null;

  const milestones = [
    { label: t("onBooking"), pct: downPct, desc: t("downPaymentDesc"), Icon: Wallet, color: "from-accent to-accent/80" },
    ...(duringPct > 0 ? [{ label: t("duringConstruction"), pct: duringPct, desc: t("progressInstallments"), Icon: Building2, color: "from-primary to-primary/80" }] : []),
    ...(handoverPct > 0 ? [{ label: t("onHandover"), pct: handoverPct, desc: t("balanceOnCompletion"), Icon: Home, color: "from-primary to-[#145C42]" }] : []),
  ];

  const whatsappNum = project.whatsappNumber || "971559994111";
  const whatsappMsg = encodeURIComponent(
    `Hi, I'm interested in the payment plan for ${project.name}. Could you share the full schedule?`
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <DetailBreadcrumb
        items={[
          { label: t("breadcrumbHome"), href: "/" },
          { label: parentLabel, href: parentHref },
          { label: project.name, href: `/project/${project.slug}` },
          { label: t("tabPayment") },
        ]}
      />
      <ProjectSubNav slug={project.slug} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">

        {/* Page hero */}
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] font-semibold text-accent mb-1">
            {t("paymentPlanLabel")}
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            {project.name} — {t("paymentPlanLabel")}
          </h1>
          {project.community && (
            <p className="text-muted-foreground mt-1">
              {project.community}, {project.city || "Dubai"}
            </p>
          )}
        </div>

        {/* Intro SEO text */}
        <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
          <p>
            {project.name}{project.developerName ? ` by ${project.developerName}` : ""} offers a
            {project.paymentPlanSummary ? ` ${project.paymentPlanSummary}` : ` ${downPct}/${100 - downPct}`}
            {" "}payment plan
            {project.community ? ` for units in ${project.community}` : ""}.
            {startingPrice
              ? ` Starting from AED ${startingPrice.toLocaleString("en-AE")}, the ${downPct}% down payment on booking secures your unit while spreading the remaining balance over the construction period.`
              : ` The ${downPct}% down payment on booking secures your unit while spreading the remaining balance over the construction period.`}
          </p>
          {project.paymentPlanDetails && !/^Q\d+\./i.test(project.paymentPlanDetails.trim()) && (
            <p>{project.paymentPlanDetails}</p>
          )}
        </div>

        {/* Starting price card */}
        {startingPrice && (
          <div className="rounded-2xl overflow-hidden border border-border/50">
            <div className="p-4 sm:p-6" style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}>
              <p className="text-primary-foreground/60 text-[10px] uppercase tracking-[0.15em] font-semibold">
                {t("startingPrice")}
              </p>
              <CurrencyPrice
                aedPrice={project.startingPrice}
                opts={{ isProject: true }}
                className="text-2xl sm:text-4xl font-bold text-primary-foreground mt-1 block"
              />
              {project.paymentPlanSummary && (
                <p className="text-primary-foreground/60 text-xs sm:text-sm mt-1">
                  {project.paymentPlanSummary}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Payment plan timeline */}
        <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
          <div className="p-3.5 sm:p-6 flex items-center gap-2.5 sm:gap-3" style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-bold text-white">{t("paymentPlanLabel")}</h2>
              {project.paymentPlanSummary && (
                <p className="text-white/60 text-xs sm:text-sm">{project.paymentPlanSummary}</p>
              )}
            </div>
          </div>

          <div className="p-3.5 sm:p-8 space-y-4 sm:space-y-6">
            {/* Progress bar */}
            <div className="flex rounded-full overflow-hidden h-2.5 sm:h-3 bg-muted/50">
              {milestones.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ width: 0 }}
                  animate={{ width: `${m.pct}%` }}
                  transition={{ delay: 0.2 + i * 0.2, duration: 0.6, ease: "easeOut" }}
                  className={`bg-gradient-to-r ${m.color} ${i === 0 ? "rounded-l-full" : ""} ${i === milestones.length - 1 ? "rounded-r-full" : ""}`}
                />
              ))}
            </div>

            {/* Milestone cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4">
              {milestones.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="relative bg-card rounded-xl border-l-[3px] border-l-accent border border-border/50 p-3 sm:p-5"
                >
                  <div className="flex items-center justify-between sm:block">
                    <div className="flex items-center gap-2 sm:mb-3">
                      <m.Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-accent" />
                      <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.12em] text-muted-foreground font-semibold">
                        {m.label}
                      </p>
                    </div>
                    <p className="text-xl sm:text-3xl font-bold text-foreground">{m.pct}%</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{m.desc}</p>
                  {startingPrice && (
                    <p className="text-sm font-semibold text-accent mt-2">
                      {formatPrice(Math.round(startingPrice * m.pct / 100))}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Accepted payment methods */}
            {Array.isArray(project.acceptedPaymentMethods) && project.acceptedPaymentMethods.length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-semibold mb-3">
                  {t("acceptedMethods")}
                </p>
                <div className="flex flex-wrap gap-2">
                  {project.acceptedPaymentMethods.map((m: string, i: number) => (
                    <span
                      key={i}
                      className="text-[11px] sm:text-xs px-3 sm:px-4 py-2 sm:py-2.5 bg-card border border-border rounded-xl text-foreground font-semibold"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Dubai buyer costs */}
        <div className="bg-muted/30 rounded-2xl border border-border/50 p-4 sm:p-6 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center">
              <BadgeDollarSign className="h-4 w-4 text-accent" />
            </div>
            <h2 className="text-base font-bold text-foreground">Buyer Costs to Budget For</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Beyond the purchase price, off-plan buyers in Dubai should budget for the following
            one-time transaction costs:
          </p>
          <div className="space-y-2">
            {[
              { label: "DLD Registration Fee", value: "4% of purchase price" },
              { label: "Trustee Registration Fee", value: "AED 4,200 (approx.)" },
              { label: "OQOOD Off-Plan Registration", value: "AED 3,010 + 5% VAT" },
              { label: "Real Estate Agency Commission", value: "2% + 5% VAT" },
              ...(project.serviceCharge ? [{ label: "Annual Service Charge", value: `AED ${project.serviceCharge}/sqft/year` }] : []),
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0 text-sm">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-semibold text-foreground text-right">{value}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            All DLD payments are protected via a RERA-registered escrow account throughout the
            construction period.
          </p>
        </div>

        {/* Off-plan payment context */}
        <div className="bg-muted/30 rounded-2xl border border-border/50 p-4 sm:p-6 space-y-3 text-sm text-muted-foreground leading-relaxed">
          <h2 className="text-base font-bold text-foreground">
            How Dubai Off-Plan Payment Plans Work
          </h2>
          <p>
            Dubai&apos;s off-plan payment plans are structured to align buyer payments with construction
            milestones — you pay as the building progresses, not all upfront. The Dubai Land
            Department (DLD) mandates that all off-plan payments be deposited into a dedicated
            escrow account, protecting buyer funds regardless of construction progress.
          </p>
          <p>
            For investors, construction-linked payment plans significantly reduce the capital
            required to enter the market. A property starting from AED{" "}
            {startingPrice ? startingPrice.toLocaleString("en-AE") : "1,000,000"} requires only
            AED {startingPrice ? Math.round(startingPrice * downPct / 100).toLocaleString("en-AE") : "200,000"}{" "}
            on booking, allowing capital to be deployed across multiple investments simultaneously.
          </p>
          <p>
            For end-users, the construction timeline (typically 2–4 years for off-plan projects in
            Dubai) provides time to arrange mortgage financing or accumulate the handover balance
            through savings.
          </p>
        </div>

        {/* CTA */}
        <div className="bg-card rounded-2xl border border-border/50 p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1">
            <h2 className="font-bold text-foreground text-base">
              Get a Full Payment Schedule
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Our team can provide a unit-specific payment breakdown, including floor-level pricing
              and the exact milestone dates for {project.name}.
            </p>
          </div>
          <a
            href={`https://wa.me/${whatsappNum}?text=${whatsappMsg}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#25D366] text-white text-sm font-semibold hover:bg-[#1ebe5d] transition-colors shrink-0"
          >
            <MessageCircle className="h-4 w-4" />
            Chat on WhatsApp
          </a>
        </div>

        {/* Internal links */}
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <Link href={`/project/${project.slug}`} className="hover:text-foreground transition-colors">
            ← Back to {project.name}
          </Link>
          <span className="opacity-30">·</span>
          <Link
            href={`/project/${project.slug}/floor-plans`}
            className="hover:text-foreground transition-colors"
          >
            Floor Plans →
          </Link>
          <span className="opacity-30">·</span>
          <Link
            href={`/project/${project.slug}/location`}
            className="hover:text-foreground transition-colors"
          >
            Location →
          </Link>
        </div>
      </main>

      <WhatsAppButton />
      <Footer />
    </div>
  );
}
