"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import AIChatWidget from "@/components/AIChatWidget";
import Breadcrumbs from "@/components/Breadcrumbs";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardCheck, BarChart3, Wallet, Users, Wrench, ShieldCheck,
  Building2, TrendingUp, Home, Key, FileText, Handshake,
  ArrowRight, ChevronDown, Phone, MessageCircle, Shield,
  CheckCircle2, Star, Globe, Sparkles, Clock, Award, MapPin,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

/* ── Data ── */

const managementServices = [
  { icon: ClipboardCheck, title: "Property Handover & Snagging", desc: "Thorough inspection and seamless handover process for your new property. We document every detail and ensure developer accountability.", tag: "Popular" },
  { icon: BarChart3, title: "Marketing & Leasing", desc: "Professional photography, listing across 10+ platforms, and targeted campaigns to attract quality tenants fast.", tag: null },
  { icon: Wallet, title: "Financial Management", desc: "Rent collection, cheque tracking, security deposits, and transparent monthly financial reporting.", tag: "Popular" },
  { icon: Users, title: "Tenant Management", desc: "End-to-end tenant screening, contract drafting, move-in coordination, and ongoing relations for hassle-free ownership.", tag: null },
  { icon: Wrench, title: "Maintenance & Repairs", desc: "Preventive maintenance plans, 24/7 emergency response, and vetted contractor network to protect your asset.", tag: null },
  { icon: ShieldCheck, title: "Legal & Dispute Resolution", desc: "Expert mediation, eviction management, and legal support through our RERA-certified team.", tag: null },
];

const additionalServices = [
  { icon: Building2, title: "Off-Plan Investment Advisory", desc: "Expert guidance on the best off-plan opportunities with high ROI potential across Dubai's emerging communities.", link: "/off-plan" },
  { icon: TrendingUp, title: "AI Property Valuation", desc: "Get an instant, AI-driven property valuation based on real-time market data and comparable transactions.", link: "/valuation" },
  { icon: Home, title: "Resale Properties", desc: "Access premium secondary market listings across 50+ communities with dedicated buyer representation.", link: "/search?intent=buy" },
  { icon: Key, title: "Rental Services", desc: "Whether you're a tenant looking for a home or a landlord listing a property — we match you perfectly.", link: "/search?intent=rent" },
  { icon: FileText, title: "Mortgage Advisory", desc: "Pre-approval assistance, rate comparison from 12+ banks, and end-to-end mortgage processing support.", link: "/contact" },
  { icon: Handshake, title: "Golden Visa Assistance", desc: "Complete support for property-linked Golden Visa applications — from eligibility to approval.", link: "/contact" },
];

const processSteps = [
  { num: "01", title: "Consultation", desc: "Free assessment of your property and investment goals", icon: MessageCircle },
  { num: "02", title: "Strategy", desc: "Customized management or investment plan", icon: FileText },
  { num: "03", title: "Execution", desc: "Hands-on implementation with regular updates", icon: Sparkles },
  { num: "04", title: "Results", desc: "Transparent reporting and ongoing optimization", icon: TrendingUp },
];

const faqs = [
  { q: "What is included in your property management service?", a: "Our comprehensive service covers tenant sourcing, rent collection, maintenance coordination, financial reporting, legal compliance, and 24/7 emergency support. We handle everything so you can enjoy passive income." },
  { q: "How much do you charge for property management?", a: "Our management fees are competitive and transparent — typically 5-8% of annual rental income depending on the property type and service tier. No hidden fees, no surprises." },
  { q: "Can you help with off-plan properties I haven't received yet?", a: "Absolutely. We offer pre-handover snagging inspections, coordinate the DLD transfer process, and can have your property market-ready for tenants immediately after handover." },
  { q: "Do you assist international investors?", a: "Yes, over 60% of our clients are international. We handle everything remotely — from purchase to management — with multi-language support in English, Arabic, Russian, and Chinese." },
  { q: "What areas do you cover?", a: "We operate across all major Dubai communities including Marina, Downtown, Palm Jumeirah, JBR, Business Bay, JVC, Dubai Hills, and many more. Contact us for coverage in Abu Dhabi and other emirates." },
  { q: "How quickly can you find a tenant?", a: "On average, we secure quality tenants within 2-3 weeks thanks to our multi-platform marketing, professional photography, and extensive database of pre-qualified tenants." },
];

const stats = [
  { value: "2,500+", label: "Properties Managed", icon: Building2 },
  { value: "98%", label: "Occupancy Rate", icon: TrendingUp },
  { value: "15+", label: "Years Experience", icon: Award },
  { value: "4.9★", label: "Client Rating", icon: Star },
];

/* ── Component ── */

export default function ServicesPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />
      <Breadcrumbs items={[{ label: "Services", href: "/services" }]} />

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
            <Link href="/" className="hover:text-white/70 transition-colors">Home</Link>
            <ArrowRight className="h-3 w-3" />
            <span className="text-white/70">Services</span>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <motion.div initial={{ width: 0 }} animate={{ width: "3rem" }} transition={{ duration: 0.8, delay: 0.3 }} className="h-[2px] mb-5 sm:mb-6" style={{ background: "linear-gradient(90deg, #D4A847, #B8922F)" }} />
            <p className="font-semibold tracking-[0.4em] uppercase text-[10px] sm:text-xs mb-3 sm:mb-4" style={{ color: "#D4A847" }}>Our Services</p>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-[1.1]">
              Complete Property<br /><span className="italic font-light">Solutions</span>
            </h1>
            <p className="text-white/60 max-w-xl text-sm sm:text-lg leading-relaxed">
              From finding your dream home to managing your investment portfolio — we deliver end-to-end real estate services backed by 15+ years of Dubai market expertise.
            </p>
          </motion.div>

          {/* Stats strip */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-8 sm:mt-12 grid grid-cols-4 gap-2 sm:gap-4">
            {stats.map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.1 }}
                className="text-center sm:text-left bg-white/[0.06] backdrop-blur-sm border border-white/10 rounded-xl sm:rounded-2xl p-2.5 sm:p-5">
                <s.icon className="h-4 w-4 sm:h-5 sm:w-5 mx-auto sm:mx-0 mb-1 sm:mb-2" style={{ color: "#D4A847" }} />
                <p className="text-base sm:text-2xl font-bold text-white">{s.value}</p>
                <p className="text-[8px] sm:text-xs text-white/50 mt-0.5">{s.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="py-12 sm:py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-8 sm:mb-14">
            <p className="font-semibold tracking-[0.4em] uppercase text-[10px] sm:text-xs mb-2 sm:mb-3" style={{ color: "#D4A847" }}>How It Works</p>
            <h2 className="text-2xl sm:text-4xl font-bold text-foreground">Simple <span className="italic font-light">Process</span></h2>
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

      {/* ═══ PROPERTY MANAGEMENT ═══ */}
      <section className="pt-14 pb-8 sm:pt-24 sm:pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-8 sm:mb-14">
            <motion.div initial={{ width: 0 }} whileInView={{ width: "3rem" }} viewport={{ once: true }} className="h-[2px] mx-auto mb-4 sm:mb-6" style={{ background: "linear-gradient(90deg, #D4A847, #B8922F)" }} />
            <p className="font-semibold tracking-[0.4em] uppercase text-[10px] sm:text-xs mb-2 sm:mb-4" style={{ color: "#D4A847" }}>Property Management</p>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-foreground">
              Complete Property <span className="italic font-light">Care</span>
            </h2>
            <p className="mt-3 sm:mt-5 text-muted-foreground max-w-lg mx-auto text-sm sm:text-base">
              Our RERA-certified team ensures your investment is protected, profitable, and hassle-free.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
            {managementServices.map((s, i) => (
              <motion.div key={s.title} initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="group relative bg-card hover:bg-card/80 border border-border/50 hover:border-accent/30 rounded-2xl p-5 sm:p-7 transition-all duration-300 hover:shadow-lg hover:shadow-accent/[0.06]">
                {/* Tag */}
                {s.tag && (
                  <span className="absolute top-4 right-4 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: "linear-gradient(135deg, #D4A847, #B8922F)", color: "#fff" }}>
                    {s.tag}
                  </span>
                )}
                {/* Icon */}
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mb-3 sm:mb-4 overflow-hidden relative transition-all duration-300 group-hover:scale-110"
                  style={{ backgroundColor: "rgba(212,168,71,0.1)" }}>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" style={{ background: "linear-gradient(135deg, #D4A847, #B8922F)" }} />
                  <s.icon className="h-5 w-5 relative z-10 transition-colors duration-300" style={{ color: "#D4A847" }}  />
                </div>
                <h3 className="font-bold text-base sm:text-lg text-foreground mb-1.5 sm:mb-2">{s.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ ADDITIONAL SERVICES ═══ */}
      <section className="pt-4 pb-14 sm:pt-6 sm:pb-24" style={{ background: "linear-gradient(180deg, hsl(var(--muted) / 0.3) 0%, hsl(var(--background)) 100%)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-8 sm:mb-14">
            <motion.div initial={{ width: 0 }} whileInView={{ width: "3rem" }} viewport={{ once: true }} className="h-[2px] mx-auto mb-4 sm:mb-6" style={{ background: "linear-gradient(90deg, #0B3D2E, #1A7A5A)" }} />
            <p className="font-semibold tracking-[0.4em] uppercase text-[10px] sm:text-xs mb-2 sm:mb-4" style={{ color: "#0B3D2E" }}>Real Estate Services</p>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-foreground">
              Beyond <span className="italic font-light">Management</span>
            </h2>
            <p className="mt-3 sm:mt-5 text-muted-foreground max-w-lg mx-auto text-sm sm:text-base">
              Whether you&apos;re buying, selling, renting, or investing — our full-service approach covers every angle.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
            {additionalServices.map((s, i) => (
              <motion.div key={s.title} initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                <Link href={s.link}
                  className="group block bg-card border border-border/50 hover:border-primary/25 rounded-2xl p-5 sm:p-7 transition-all duration-300 hover:shadow-lg hover:shadow-primary/[0.06] h-full">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mb-3 sm:mb-4 overflow-hidden relative transition-all duration-300 group-hover:scale-110"
                    style={{ backgroundColor: "rgba(11,61,46,0.08)" }}>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }} />
                    <s.icon className="h-5 w-5 text-primary relative z-10 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h3 className="font-bold text-base sm:text-lg text-foreground mb-1.5 sm:mb-2 group-hover:text-primary transition-colors">{s.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-3 sm:mb-4">{s.desc}</p>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary group-hover:gap-2.5 transition-all">
                    Learn more <ArrowRight className="h-3 w-3" />
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ WHY CHOOSE BINAYAH ═══ */}
      <section className="py-14 sm:py-24 text-white relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}>
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)", backgroundSize: "48px 48px" }} />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #D4A847, transparent 70%)" }} />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-8 sm:mb-14">
            <motion.div initial={{ width: 0 }} whileInView={{ width: "3rem" }} viewport={{ once: true }} className="h-[2px] mx-auto mb-4 sm:mb-6" style={{ background: "linear-gradient(90deg, #D4A847, #B8922F)" }} />
            <p className="font-semibold tracking-[0.4em] uppercase text-[10px] sm:text-xs mb-2 sm:mb-4" style={{ color: "#D4A847" }}>Why Binayah</p>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold">
              Trusted by <span className="italic font-light">Thousands</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-5">
            {[
              { icon: Shield, title: "RERA Certified", desc: "Reg. No. 1162 — fully licensed and regulated", color: "#D4A847" },
              { icon: Globe, title: "Multilingual Team", desc: "Support in English, Arabic, Russian & Chinese", color: "#D4A847" },
              { icon: Clock, title: "24/7 Support", desc: "Round-the-clock emergency maintenance response", color: "#D4A847" },
              { icon: CheckCircle2, title: "Zero Hidden Fees", desc: "Transparent pricing with no surprises", color: "#D4A847" },
              { icon: MapPin, title: "50+ Communities", desc: "Coverage across all major Dubai areas", color: "#D4A847" },
              { icon: Users, title: "Dedicated Manager", desc: "Single point of contact for your portfolio", color: "#D4A847" },
              { icon: BarChart3, title: "Monthly Reporting", desc: "Detailed financials and performance insights", color: "#D4A847" },
              { icon: Award, title: "Award Winning", desc: "Recognized by Dubai Land Department", color: "#D4A847" },
            ].map((item, i) => (
              <motion.div key={item.title} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                className="bg-white/[0.06] backdrop-blur-sm border border-white/10 rounded-xl sm:rounded-2xl p-3 sm:p-5 hover:bg-white/[0.1] hover:border-white/20 transition-all duration-300 group">
                <item.icon className="h-4 w-4 sm:h-5 sm:w-5 mb-2 sm:mb-3 transition-transform duration-300 group-hover:scale-110" style={{ color: item.color }} />
                <h3 className="font-bold text-xs sm:text-sm text-white mb-0.5 sm:mb-1">{item.title}</h3>
                <p className="text-[10px] sm:text-xs text-white/50 leading-relaxed">{item.desc}</p>
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
            <p className="font-semibold tracking-[0.4em] uppercase text-[10px] sm:text-xs mb-2 sm:mb-4" style={{ color: "#D4A847" }}>FAQ</p>
            <h2 className="text-2xl sm:text-4xl font-bold text-foreground">
              Common <span className="italic font-light">Questions</span>
            </h2>
          </motion.div>

          <div className="space-y-2 sm:space-y-3">
            {faqs.map((faq, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className={`rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-300 border ${openFaq === i ? "border-primary/20 bg-primary/[0.02] shadow-sm" : "border-border/50 bg-card hover:border-border"}`}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-4 sm:p-5 text-left gap-3">
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
            <h2 className="text-2xl sm:text-4xl font-bold text-white mb-3 sm:mb-4">Need a Custom Solution?</h2>
            <p className="text-white/60 max-w-lg mx-auto text-sm sm:text-base">
              Whether you own one unit or an entire portfolio — our team will craft a tailored plan that maximizes your returns.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 sm:gap-4 max-w-xl mx-auto">
            <a href="https://wa.me/971549988811?text=Hi, I'd like to learn about your property services"
              target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 py-3.5 sm:py-4 rounded-xl sm:rounded-full bg-gradient-to-r from-[#25D366] to-[#1DA851] text-white font-bold text-sm transition-all hover:shadow-xl hover:shadow-[#25D366]/25 hover:scale-[1.02] active:scale-[0.98]">
              <MessageCircle className="h-4 w-4" /> WhatsApp Us
            </a>
            <Link href="/contact"
              className="flex items-center justify-center gap-2.5 py-3.5 sm:py-4 rounded-xl sm:rounded-full text-white font-bold text-sm transition-all hover:shadow-xl hover:shadow-accent/25 hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: "linear-gradient(135deg, #D4A847, #B8922F)" }}>
              <Phone className="h-4 w-4" /> Schedule a Call
            </Link>
          </div>

          <p className="text-center text-white/30 text-[11px] sm:text-xs mt-5 sm:mt-6">
            RERA Registration No. 1162 — Real Estate Regulation Authority of Dubai
          </p>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
      <AIChatWidget />
    </div>
  );
}
