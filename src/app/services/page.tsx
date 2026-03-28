"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { motion } from "framer-motion";
import { ClipboardCheck, BarChart3, Wallet, Users, Wrench, ShieldCheck, Building2, TrendingUp, Home, Key, FileText, Handshake } from "lucide-react";
import Link from "next/link";

const managementServices = [
  { icon: ClipboardCheck, title: "Property Handover & Snagging", desc: "Thorough inspection and seamless handover process for your new property." },
  { icon: BarChart3, title: "Marketing", desc: "Professional listing and exposure across top platforms to attract quality tenants." },
  { icon: Wallet, title: "Money Management", desc: "Rent collection, cheque tracking and comprehensive financial reporting." },
  { icon: Users, title: "Tenant Management", desc: "Screening, contracts, and ongoing tenant relations for hassle-free ownership." },
  { icon: Wrench, title: "Maintenance Services", desc: "Repairs, upkeep, and 24/7 emergency support to protect your investment." },
  { icon: ShieldCheck, title: "Dispute Resolution", desc: "Expert mediation and legal support when needed for tenant disputes." },
];

const additionalServices = [
  { icon: Building2, title: "Off-Plan Investment Advisory", desc: "Expert guidance on the best off-plan opportunities with high ROI potential." },
  { icon: TrendingUp, title: "Market Valuation", desc: "Accurate property valuations based on AI-driven market analysis." },
  { icon: Home, title: "Resale Properties", desc: "Access to premium resale listings across Dubai's top communities." },
  { icon: Key, title: "Rental Services", desc: "Find the perfect rental property or list yours with our expert team." },
  { icon: FileText, title: "Mortgage Advisory", desc: "Connecting you with the best mortgage options from leading UAE banks." },
  { icon: Handshake, title: "Golden Visa Assistance", desc: "Complete support for property-linked Golden Visa applications." },
];

export default function ServicesPage() {
  return (
  <div className="min-h-screen bg-background">
    <Navbar />

    {/* Hero */}
    <section className="relative pt-32 pb-20 bg-primary text-primary-foreground overflow-hidden">
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)", backgroundSize: "48px 48px" }} />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-accent font-semibold tracking-[0.4em] uppercase text-xs mb-4">Our Services</p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            Complete Property <span className="italic font-light">Solutions</span>
          </h1>
          <p className="text-primary-foreground/70 max-w-2xl text-lg">
            From finding your dream home to managing your investment — we handle everything.
          </p>
        </motion.div>
      </div>
    </section>

    {/* Property Management */}
    <section className="py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
          <motion.div initial={{ width: 0 }} whileInView={{ width: "3rem" }} viewport={{ once: true }} className="h-[2px] bg-accent mx-auto mb-6" />
          <p className="text-accent font-semibold tracking-[0.4em] uppercase text-xs mb-4">Property Management</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
            Complete Property <span className="italic font-light">Care</span>
          </h2>
          <p className="mt-5 text-muted-foreground max-w-lg mx-auto">Our comprehensive management program ensures your investment is protected and performing at its best.</p>
        </motion.div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {managementServices.map((s, i) => (
            <motion.div key={s.title} initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="group bg-card hover:bg-card/80 border border-border/50 rounded-2xl p-6 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent group-hover:scale-110 transition-all duration-300">
                <s.icon className="h-5 w-5 text-accent group-hover:text-accent-foreground transition-colors" />
              </div>
              <h3 className="font-bold text-lg text-foreground mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* Additional Services */}
    <section className="py-24 bg-card">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
          <motion.div initial={{ width: 0 }} whileInView={{ width: "3rem" }} viewport={{ once: true }} className="h-[2px] bg-accent mx-auto mb-6" />
          <p className="text-accent font-semibold tracking-[0.4em] uppercase text-xs mb-4">Real Estate Services</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
            Beyond <span className="italic font-light">Management</span>
          </h2>
        </motion.div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {additionalServices.map((s, i) => (
            <motion.div key={s.title} initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="group bg-background border border-border/50 rounded-2xl p-6 transition-all duration-300 hover:border-primary/20">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                <s.icon className="h-5 w-5 text-primary group-hover:text-primary-foreground transition-colors" />
              </div>
              <h3 className="font-bold text-lg text-foreground mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="py-20 bg-primary text-primary-foreground">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="text-3xl font-bold mb-4">Need a Custom Solution?</h2>
        <p className="text-primary-foreground/70 mb-8">Contact our team to discuss your specific property needs.</p>
        <Link href="/contact" className="inline-block bg-accent hover:bg-accent/90 text-accent-foreground px-8 py-3.5 rounded-xl font-semibold transition-all hover:shadow-lg hover:shadow-accent/20">
          Contact Us
        </Link>
      </div>
    </section>

    <Footer />
    <WhatsAppButton />
  </div>
  );
}
