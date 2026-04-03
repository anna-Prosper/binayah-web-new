"use client";

import { motion } from "framer-motion";
import { Send, Phone, Mail, MapPin, ArrowRight, Clock, Shield, ChevronDown } from "lucide-react";
import { useState } from "react";

const inputClasses =
  "w-full bg-white border border-border/60 rounded-xl px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all duration-300 hover:border-border";

const InquirySection = () => {
  const [form, setForm] = useState({ name: "", email: "", phone: "", countryCode: "+971", type: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [showMessage, setShowMessage] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, phone: `${form.countryCode} ${form.phone}`, source: "homepage-inquiry" }),
      });
    } catch {}
    setTimeout(() => {
      setSent(true);
      setSending(false);
      setForm({ name: "", email: "", phone: "", countryCode: "+971", type: "", message: "" });
      setTimeout(() => setSent(false), 4000);
    }, 600);
  };

  const contactItems = [
    { icon: Phone, label: "+971 54 998 8811", href: "tel:+971549988811" },
    { icon: Phone, label: "+971 4 243 8479", href: "tel:+97142438479" },
    { icon: Mail, label: "info@binayah.com", href: "mailto:info@binayah.com" },
    { icon: MapPin, label: "Mezzanine Floor, Liberty Building, Al Quoz 3, Sheikh Zayed Rd, Dubai", href: undefined },
  ];

  return (
    <section id="contact" className="relative py-10 sm:py-28 scroll-mt-20 overflow-hidden"
      style={{ background: "linear-gradient(180deg, hsl(var(--muted) / 0.3) 0%, hsl(var(--background)) 100%)" }}>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">

        {/* Mobile header */}
        <div className="lg:hidden text-center mb-6">
          <motion.div initial={{ width: 0 }} whileInView={{ width: "3rem" }} viewport={{ once: true }} className="h-[2px] mx-auto mb-4" style={{ background: "linear-gradient(90deg, #D4A847, #B8922F)" }} />
          <p className="font-semibold tracking-[0.4em] uppercase text-[10px] mb-2" style={{ color: "#D4A847" }}>Get In Touch</p>
          <h2 className="text-2xl font-bold text-foreground mb-1">Quick <span className="italic font-light text-foreground/80">Assistance</span></h2>
          <p className="text-muted-foreground text-sm">Get a callback within 24 hours.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-start">

          {/* Left — Info (desktop only) */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="hidden lg:block">
            <motion.div initial={{ width: 0 }} whileInView={{ width: "3rem" }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }} className="h-[2px] mb-6" style={{ background: "linear-gradient(90deg, #D4A847, #B8922F)" }} />
            <p className="font-semibold tracking-[0.4em] uppercase text-xs mb-3" style={{ color: "#D4A847" }}>Get In Touch</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-5 leading-[1.15]">
              Quick <span className="italic font-light text-foreground/80">Assistance</span>
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md leading-relaxed">
              Send us your details and our property experts will get back to you within 24 hours. Schedule viewings in person or virtually.
            </p>

            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5 text-accent" />
                <span>24hr Response</span>
              </div>
              <div className="w-px h-3.5 bg-border" />
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Shield className="h-3.5 w-3.5 text-accent" />
                <span>RERA Licensed</span>
              </div>
            </div>

            <div className="space-y-3">
              {contactItems.map((item, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -15 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 * i, duration: 0.4 }} className="flex items-start gap-4 group">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border border-accent/20 group-hover:border-accent/40 transition-all duration-300"
                    style={{ background: "rgba(212,168,71,0.08)" }}>
                    <item.icon className="h-4 w-4 text-accent" />
                  </div>
                  {item.href ? (
                    <a href={item.href} className="text-foreground/75 hover:text-accent transition-colors text-sm pt-2.5 font-medium">{item.label}</a>
                  ) : (
                    <p className="text-foreground/75 text-sm pt-2.5 leading-relaxed">{item.label}</p>
                  )}
                </motion.div>
              ))}
            </div>

            <p className="mt-8 text-[11px] text-muted-foreground/50 tracking-wide">
              RERA Registration No. 1162 — Real Estate Regulation Authority of Dubai
            </p>
          </motion.div>

          {/* Right — Form Card */}
          <motion.form onSubmit={handleSubmit} initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.15 }}
            className="rounded-2xl p-6 sm:p-8 shadow-lg border border-border/40 bg-white/80 backdrop-blur-xl">

            {/* Desktop: full layout */}
            <div className="hidden sm:block">
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-[11px] font-semibold tracking-[0.15em] text-muted-foreground uppercase mb-2 block">Full Name</label>
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClasses} placeholder="Your name" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold tracking-[0.15em] text-muted-foreground uppercase mb-2 block">Email</label>
                  <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClasses} placeholder="you@email.com" />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-[11px] font-semibold tracking-[0.15em] text-muted-foreground uppercase mb-2 block">Phone</label>
                  <div className="flex gap-2">
                    <div className="relative">
                      <select value={form.countryCode} onChange={(e) => setForm({ ...form, countryCode: e.target.value })}
                        className="h-full bg-white border border-border/60 rounded-xl pl-3 pr-7 text-sm text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 py-3.5">
                        <option value="+971">🇦🇪 +971</option>
                        <option value="+44">🇬🇧 +44</option>
                        <option value="+1">🇺🇸 +1</option>
                        <option value="+91">🇮🇳 +91</option>
                        <option value="+86">🇨🇳 +86</option>
                        <option value="+7">🇷🇺 +7</option>
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
                    </div>
                    <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={`${inputClasses} flex-1`} placeholder="50 123 4567" />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-semibold tracking-[0.15em] text-muted-foreground uppercase mb-2 block">Inquiry Type</label>
                  <div className="relative">
                    <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                      className={`${inputClasses} appearance-none cursor-pointer`}>
                      <option value="">Select type</option>
                      <option value="buy">Buy a Property</option>
                      <option value="rent">Rent a Property</option>
                      <option value="offplan">Off-Plan Investment</option>
                      <option value="management">Property Management</option>
                      <option value="valuation">Valuation</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
              </div>
              <div className="mb-6">
                <label className="text-[11px] font-semibold tracking-[0.15em] text-muted-foreground uppercase mb-2 block">Message</label>
                <textarea rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className={`${inputClasses} resize-none`} placeholder="Tell us what you're looking for..." />
              </div>
            </div>

            {/* Mobile: compact layout */}
            <div className="sm:hidden space-y-3.5 mb-4">
              <div>
                <label className="text-[11px] font-semibold tracking-[0.15em] text-muted-foreground uppercase mb-2 block">Full Name</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClasses} placeholder="Your name" />
              </div>
              <div>
                <label className="text-[11px] font-semibold tracking-[0.15em] text-muted-foreground uppercase mb-2 block">Phone</label>
                <div className="flex gap-2">
                  <div className="relative">
                    <select value={form.countryCode} onChange={(e) => setForm({ ...form, countryCode: e.target.value })}
                      className="bg-white border border-border/60 rounded-xl pl-3 pr-6 text-sm text-foreground appearance-none cursor-pointer focus:outline-none py-3.5">
                      <option value="+971">🇦🇪 +971</option>
                      <option value="+44">🇬🇧 +44</option>
                      <option value="+1">🇺🇸 +1</option>
                      <option value="+7">🇷🇺 +7</option>
                    </select>
                    <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
                  </div>
                  <input required type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={`${inputClasses} flex-1`} placeholder="50 123 4567" />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-semibold tracking-[0.15em] text-muted-foreground uppercase mb-2 block">Inquiry Type</label>
                <div className="relative">
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={`${inputClasses} appearance-none cursor-pointer`}>
                    <option value="">Select type</option>
                    <option value="buy">Buy a Property</option>
                    <option value="rent">Rent a Property</option>
                    <option value="offplan">Off-Plan Investment</option>
                    <option value="management">Property Management</option>
                    <option value="valuation">Valuation</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
              <button type="button" onClick={() => setShowMessage(!showMessage)}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                <ChevronDown className={`h-3 w-3 transition-transform ${showMessage ? "rotate-180" : ""}`} />
                Add a message (optional)
              </button>
              {showMessage && (
                <textarea rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className={`${inputClasses} resize-none`} placeholder="Tell us what you're looking for..." />
              )}
            </div>

            <motion.button type="submit" disabled={sending}
              whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.985 }}
              className="w-full text-white py-4 rounded-full font-bold flex items-center justify-center gap-2.5 transition-all text-sm disabled:opacity-70 shadow-lg hover:shadow-xl"
              style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)", boxShadow: "0 4px 24px rgba(11,61,46,0.35)" }}>
              {sending ? (
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }} className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
              ) : sent ? (
                <>✓ Inquiry Sent!</>
              ) : (
                <><Send className="h-4 w-4" /> Send Inquiry <ArrowRight className="h-3.5 w-3.5 opacity-60" /></>
              )}
            </motion.button>
          </motion.form>
        </div>
      </div>
    </section>
  );
};

export default InquirySection;