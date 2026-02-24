"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { motion } from "framer-motion";
import { Award, Users, Building2, Globe, CheckCircle2 } from "lucide-react";

const stats = [
  { icon: Building2, value: "15+", label: "Years of Experience" },
  { icon: Users, value: "5,000+", label: "Happy Clients" },
  { icon: Globe, value: "30+", label: "Nationalities Served" },
  { icon: Award, value: "50+", label: "Industry Awards" },
];

const values = [
  { title: "Client-First Approach", desc: "Every decision we make is guided by the best interests of our clients." },
  { title: "Transparency", desc: "We believe in honest communication and full transparency in every transaction." },
  { title: "Market Expertise", desc: "Deep knowledge of Dubai's real estate landscape across all segments." },
  { title: "Innovation", desc: "Leveraging AI and cutting-edge technology to deliver smarter property solutions." },
  { title: "Integrity", desc: "We uphold the highest ethical standards in every interaction." },
  { title: "Excellence", desc: "Committed to delivering exceptional service at every touchpoint." },
];

export default function AboutPage() {
  return (
  <div className="min-h-screen bg-background">
    <Navbar />

    {/* Hero */}
    <section className="relative pt-32 pb-20 bg-primary text-primary-foreground overflow-hidden">
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)", backgroundSize: "48px 48px" }} />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-accent font-semibold tracking-[0.4em] uppercase text-xs mb-4">About Us</p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            Dubai's Trusted <span className="italic font-light">Property Partner</span>
          </h1>
          <p className="text-primary-foreground/70 max-w-2xl text-lg leading-relaxed">
            Binayah Real Estate has been connecting clients with exceptional homes and investments across Dubai for over 15 years. Our AI-powered approach combined with deep market expertise ensures every client finds their perfect match.
          </p>
        </motion.div>
      </div>
    </section>

    {/* Stats */}
    <section className="py-16 bg-card border-b border-border/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <s.icon className="h-6 w-6 text-accent" />
              </div>
              <p className="text-3xl font-bold text-foreground">{s.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* Story */}
    <section className="py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div className="aspect-[4/3] rounded-2xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1582407947092-37608ff63de2?w=800&h=600&fit=crop"
                alt="Dubai skyline"
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <motion.div initial={{ width: 0 }} whileInView={{ width: "3rem" }} viewport={{ once: true }} className="h-[2px] bg-accent mb-6" />
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
              Our <span className="italic font-light">Story</span>
            </h2>
            <div className="space-y-4 text-foreground/70 leading-relaxed">
              <p>
                Founded with a vision to redefine real estate in Dubai, Binayah Properties has grown from a boutique agency to one of the city's most respected property consultancies.
              </p>
              <p>
                We specialize in off-plan developments, luxury resale properties, property management, and investment advisory. Our team of multilingual experts understands the diverse needs of a global clientele.
              </p>
              <p>
                Today, we combine traditional real estate expertise with AI-driven market intelligence to deliver unparalleled service and results.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>

    {/* Values */}
    <section className="py-24 bg-card">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
          <motion.div initial={{ width: 0 }} whileInView={{ width: "3rem" }} viewport={{ once: true }} className="h-[2px] bg-accent mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
            Our <span className="italic font-light">Values</span>
          </h2>
        </motion.div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {values.map((v, i) => (
            <motion.div
              key={v.title}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="bg-background border border-border/50 rounded-2xl p-6"
            >
              <CheckCircle2 className="h-6 w-6 text-accent mb-4" />
              <h3 className="font-bold text-lg text-foreground mb-2">{v.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    <Footer />
    <WhatsAppButton />
  </div>
  );
}
