"use client";

import { motion } from "framer-motion";
import { Send, Phone, Mail, MapPin } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const InquirySection = () => {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", phone: "", type: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Inquiry Sent!", description: "Our team will get back to you shortly." });
    setForm({ name: "", email: "", phone: "", type: "", message: "" });
  };

  return (
    <section id="contact" className="py-24 bg-card scroll-mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-14 items-start">
          {/* Left — Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <motion.div initial={{ width: 0 }} whileInView={{ width: "3rem" }} viewport={{ once: true }} className="h-[2px] bg-accent mb-6" />
            <p className="text-accent font-semibold tracking-[0.4em] uppercase text-xs mb-4">Get In Touch</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
              Quick <span className="italic font-light">Assistance</span>
            </h2>
            <p className="text-muted-foreground mb-10 max-w-md">
              Send us your details and our property experts will get back to you within 24 hours. Schedule viewings in person or virtually.
            </p>

            <div className="space-y-5">
              {[
                { icon: Phone, label: "+971 54 998 8811", href: "tel:+971549988811" },
                { icon: Phone, label: "+971 4 243 8479", href: "tel:+97142438479" },
                { icon: Mail, label: "info@binayah.com", href: "mailto:info@binayah.com" },
                { icon: MapPin, label: "Mezzanine Floor, Liberty Building, Al Quoz 3, Sheikh Zayed Rd, Dubai" },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center flex-shrink-0">
                    <item.icon className="h-4 w-4 text-primary" />
                  </div>
                  {item.href ? (
                    <a href={item.href} className="text-foreground hover:text-primary transition-colors text-sm pt-2.5">{item.label}</a>
                  ) : (
                    <p className="text-foreground text-sm pt-2.5">{item.label}</p>
                  )}
                </div>
              ))}
            </div>

            <p className="mt-8 text-xs text-muted-foreground">
              RERA Registration No. 1162 — Real Estate Regulation Authority of Dubai
            </p>
          </motion.div>

          {/* Right — Form */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-background rounded-2xl p-7 sm:p-9 shadow-sm border border-border/50"
          >
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase mb-1.5 block">Full Name</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-secondary/50 border border-border rounded-xl px-3.5 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase mb-1.5 block">Email</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-secondary/50 border border-border rounded-xl px-3.5 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                  placeholder="you@email.com"
                />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase mb-1.5 block">Phone</label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full bg-secondary/50 border border-border rounded-xl px-3.5 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                  placeholder="+971 XX XXX XXXX"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase mb-1.5 block">Inquiry Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full bg-secondary/50 border border-border rounded-xl px-3.5 py-3 text-sm text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                >
                  <option value="">Select type</option>
                  <option value="buy">Buy a Property</option>
                  <option value="rent">Rent a Property</option>
                  <option value="offplan">Off-Plan Investment</option>
                  <option value="management">Property Management</option>
                  <option value="valuation">Valuation</option>
                </select>
              </div>
            </div>
            <div className="mb-5">
              <label className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase mb-1.5 block">Message</label>
              <textarea
                rows={3}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full bg-secondary/50 border border-border rounded-xl px-3.5 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all resize-none"
                placeholder="Tell us what you're looking for..."
              />
            </div>
            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:shadow-primary/20 text-sm"
            >
              <Send className="h-4 w-4" />
              Send Inquiry
            </button>
          </motion.form>
        </div>
      </div>
    </section>
  );
};

export default InquirySection;
