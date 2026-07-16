"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Breadcrumbs from "@/components/Breadcrumbs";
import CountryCodeSelect from "@/components/CountryCodeSelect";
import { dialFromIso, readGeoCountryCookie } from "@/lib/country-codes";
import { motion } from "framer-motion";
import { Phone, Mail, Clock, MessageCircle, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { apiUrl } from "@/lib/api";
import { useHoneypot } from "@/components/Honeypot";
import { waHref } from "@/lib/whatsapp";
import { useTranslations, useLocale } from "next-intl";

export default function ContactPage() {
  const t = useTranslations("contact");
  const tWa = useTranslations("whatsapp");
  const locale = useLocale();
  const router = useRouter();
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", phone: "", countryCode: "+971", message: "" });
  const [sending, setSending] = useState(false);
  const [optIn, setOptIn] = useState(true);
  const { value: hp, field: honeypotField } = useHoneypot();

  // Seed country code from geo cookie (set by middleware from Vercel IP).
  useEffect(() => {
    const dial = dialFromIso(readGeoCountryCookie());
    if (dial && dial !== "+971") {
      setForm((f) => (f.phone ? f : { ...f, countryCode: dial }));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const res = await fetch(apiUrl("/api/inquiries"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          hp,
          phone: form.phone ? `${form.countryCode} ${form.phone}` : "",
          inquiryType: "General",
          source: "contact-page",
          locale,
        }),
      });
      if (!res.ok) throw new Error("Request failed");
      // Newsletter opt-in — fire-and-forget so it never blocks the redirect.
      if (optIn && form.email) {
        fetch(apiUrl("/api/market-report/subscribe"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: form.email.trim().toLowerCase(),
            name: form.name,
            phone: form.phone ? `${form.countryCode} ${form.phone}` : "",
            source: "contact-optin",
          }),
        }).catch(() => {});
      }
      // Hard navigation to /contact/thank-you so analytics registers a
      // discrete conversion page view (GA4, Clarity, Vercel Analytics)
      // rather than a soft in-page toast that's invisible to tracking.
      router.push("/contact/thank-you");
    } catch {
      toast({ title: t("errorToast"), variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Breadcrumbs items={[{ label: t("heroLabel"), href: "/contact" }]} />

      {/* Hero */}
      <section className="relative pt-32 pb-20 text-white overflow-hidden" style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}>
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)", backgroundSize: "48px 48px" }} />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-accent font-semibold tracking-[0.4em] uppercase text-xs mb-4">{t("heroLabel")}</p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              {t("heroTitle")} <span className="font-light">{t("heroTitleItalic")}</span>
            </h1>
            <p className="text-primary-foreground/70 max-w-2xl text-lg">
              {t("heroSubtitle")}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-5 gap-12">
            {/* Contact info */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-6">{t("infoTitle")}</h2>
                <div className="space-y-5">
                  {[
                    { icon: Phone, label: "Phone", value: "+971 54 998 8811", href: "tel:+971549988811" },
                    { icon: Mail, label: t("email"), value: "info@binayah.com", href: "mailto:info@binayah.com" },
                    { icon: MessageCircle, label: t("whatsappLabel"), value: "+971 54 998 8811", href: waHref(tWa("prefillGeneral"), "/contact") },
                    { icon: MapPin, label: "Address", value: "Mezzanine Floor, Liberty Building, Al Quoz 3, Sheikh Zayed Road, Dubai", href: "https://maps.google.com/?q=Liberty+Building+Al+Quoz+3+Sheikh+Zayed+Road+Dubai" },
                    { icon: Clock, label: t("office"), value: t("hours"), href: undefined },
                  ].map((c) => (
                    <div key={c.label} className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                        <c.icon className="h-4 w-4 text-accent" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-0.5">{c.label}</p>
                        {c.href ? (
                          <a href={c.href} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-foreground hover:text-primary transition-colors">{c.value}</a>
                        ) : (
                          <p className="text-sm font-medium text-foreground">{c.value}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-3">
              <div className="bg-card rounded-2xl border border-border/50 p-8">
                <h2 className="text-2xl font-bold text-foreground mb-6">{t("formTitle")}</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                  {honeypotField}
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">{t("name")}</label>
                      <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder={t("namePlaceholder")} />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">{t("email")}</label>
                      <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder={t("emailPlaceholder")} />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">{t("phone")}</label>
                    <div className="flex gap-2">
                      <CountryCodeSelect
                        value={form.countryCode}
                        onChange={(dial) => setForm({ ...form, countryCode: dial })}
                        className="px-3 py-3 rounded-xl bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 max-w-[180px]"
                      />
                      <input type="tel" required pattern="[0-9+\s()-]{6,}" title={t("phoneInvalid")} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="flex-1 px-4 py-3 rounded-xl bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder={t("phonePlaceholder")} />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">{t("message")}</label>
                    <textarea required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" placeholder={t("messagePlaceholder")} />
                  </div>
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={optIn}
                      onChange={(e) => setOptIn(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-border text-accent focus:ring-accent/30"
                    />
                    <span className="text-xs text-muted-foreground leading-relaxed">{t("newsletterOptIn")}</span>
                  </label>
                  <button type="submit" disabled={sending} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground py-3.5 rounded-xl font-semibold transition-all hover:shadow-lg hover:shadow-accent/20 disabled:opacity-50">
                    {sending ? t("sending") : t("send")}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
