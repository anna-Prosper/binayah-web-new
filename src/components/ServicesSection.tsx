import { ClipboardCheck, BarChart3, Wallet, Users, Wrench, Star, Home, ArrowRight } from "lucide-react";
// Locale-aware Link prefixes the active locale itself — hrefs stay bare.
import { Link } from "@/navigation";
import { getTranslations } from "next-intl/server";

// Server Component: renders as real crawlable HTML in the initial payload with
// zero client JS. The former framer-motion entrance animations were purely
// decorative and are dropped; hover states are plain CSS (group-hover) and are
// preserved. Rendered server-side (via a slot in page.tsx) instead of being
// gated behind LazyMount's IntersectionObserver, so crawlers see it.
export default async function ServicesSection({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "home.sections.services" });
  const PM = `/services/property-management`;
  const services = [
    { icon: ClipboardCheck, title: t("handover"), desc: t("handoverDesc"), popular: true, href: PM },
    { icon: Wallet, title: t("rentCollection"), desc: t("rentCollectionDesc"), popular: true, href: PM },
    { icon: Home, title: t("sellProperty"), desc: t("sellPropertyDesc"), popular: false, href: `/sell` },
    { icon: BarChart3, title: t("marketing"), desc: t("marketingDesc"), href: `/list-your-property` },
    { icon: Users, title: t("tenantManagement"), desc: t("tenantManagementDesc"), href: PM },
    { icon: Wrench, title: t("maintenance"), desc: t("maintenanceDesc"), href: PM },
  ];
  return (
  <section id="services" className="py-10 sm:py-24 text-white relative overflow-hidden scroll-mt-20" style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}>
    <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)", backgroundSize: "48px 48px" }} />

    <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
      {/* Desktop header */}
      <div className="hidden sm:block text-center mb-16">
        <div
          className="h-[2px] mx-auto mb-6 w-12"
          style={{ background: "linear-gradient(90deg, #D4A847, #B8922F)" }}
        />
        <p className="font-semibold tracking-[0.4em] uppercase text-xs mb-4" style={{ color: "#D4A847" }}>
          {t("label")}
        </p>
        <h2 className="text-4xl lg:text-5xl font-bold">
          {t("title")} <span className="font-light">{t("titleItalic")}</span>
        </h2>
        <p className="mt-5 text-white/60 max-w-lg mx-auto text-base">
          {t("subtitle")}
        </p>
      </div>

      {/* Mobile header */}
      <div className="sm:hidden flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="h-[2px] w-6" style={{ background: "linear-gradient(90deg, #D4A847, #B8922F)" }} />
          <p className="font-semibold tracking-[0.3em] uppercase text-[10px]" style={{ color: "#D4A847" }}>
            {t("label")}
          </p>
        </div>
      </div>

      {/* Desktop: full grid */}
      <div className="hidden sm:grid lg:grid-cols-3 sm:grid-cols-2 gap-5">
        {services.map((s) => (
          <Link
            key={s.title}
            href={s.href}
            className={`group relative block bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-6 transition-all duration-300 ${s.popular ? "bg-white/[0.07]" : ""}`}
          >
            <div className="w-12 h-12 rounded-xl bg-[#D4A847]/20 flex items-center justify-center mb-4 group-hover:scale-105 transition-all duration-300 relative overflow-hidden">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" style={{ background: "linear-gradient(135deg, #D4A847, #B8922F)" }} />
              <s.icon className="h-5 w-5 text-[#D4A847] group-hover:text-white transition-colors relative z-10" />
            </div>
            <h3 className="font-bold text-lg mb-2 leading-snug">{s.title}</h3>
            <p className="text-sm text-white/60 leading-snug">{s.desc}</p>
          </Link>
        ))}
      </div>

      {/* Mobile: show first 4, compact cards */}
      <div className="sm:hidden grid grid-cols-2 gap-2.5">
        {services.slice(0, 4).map((s) => (
          <Link
            key={s.title}
            href={s.href}
            className="group relative block bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-3 transition-all duration-300"
          >
            {s.popular && (
              <span className="absolute -top-1.5 right-2 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[7px] font-bold uppercase tracking-wider bg-[#D4A847] text-[#0B3D2E]">
                <Star className="h-1.5 w-1.5 fill-current" /> {t("popular")}
              </span>
            )}
            <div className="w-8 h-8 rounded-lg bg-[#D4A847]/20 flex items-center justify-center mb-2 relative overflow-hidden">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" style={{ background: "linear-gradient(135deg, #D4A847, #B8922F)" }} />
              <s.icon className="h-3.5 w-3.5 text-[#D4A847] group-hover:text-white transition-colors relative z-10" />
            </div>
            <h3 className="font-bold text-[11px] mb-0.5 leading-snug">{s.title}</h3>
            <p className="text-[10px] text-white/60 leading-snug line-clamp-2">{s.desc}</p>
          </Link>
        ))}
      </div>

      {/* View All Services button */}
      <div className="mt-5 sm:mt-10 text-center">
        <Link
          href={`/services`}
          className="inline-flex items-center gap-2 px-6 py-2.5 sm:py-3 rounded-full text-[12px] sm:text-sm font-bold transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] text-white border border-white/20 hover:border-white/40 bg-white/[0.06] hover:bg-white/10"
        >
          {t("viewAll")} <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  </section>
  );
}
