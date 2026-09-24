"use client";

import { Phone, Mail, MapPin } from "lucide-react";
// Locale-aware Link (next-intl): plain next/link emits bare hrefs, which
// localePrefix "as-needed" resolves to the DEFAULT locale — dropping non-English
// readers back into English. This variant prefixes hrefs with the active locale.
import { Link } from "@/navigation";
import Image from "next/image";
// Intentional: this pathname is sent to a sales agent as a WhatsApp reference
// link, so it must be the REAL URL including the locale segment. next-intl's
// usePathname strips that prefix, which would send the wrong link.
// eslint-disable-next-line no-restricted-imports
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { waHref } from "@/lib/whatsapp";
const binayahLogo = "/assets/binayah-logo.webp";

// SEO deep links — distribute crawl equity from the sitewide footer to the
// high-value programmatic pages (community + property-type landings). Names are
// proper nouns / language-neutral; only the section headings are translated.
// Slugs match BUY_COMMUNITIES and the /apartments|/villas|/townhouses routes.
const FOOTER_COMMUNITIES: { name: string; slug: string }[] = [
  { name: "Dubai Marina", slug: "dubai-marina" },
  { name: "Downtown Dubai", slug: "downtown-dubai" },
  { name: "Palm Jumeirah", slug: "palm-jumeirah" },
  { name: "Business Bay", slug: "business-bay" },
  { name: "Jumeirah Village Circle", slug: "jumeirah-village-circle" },
  { name: "Dubai Hills Estate", slug: "dubai-hills-estate" },
  { name: "Jumeirah Beach Residence", slug: "jumeirah-beach-residence" },
  { name: "Dubai Creek Harbour", slug: "dubai-creek-harbour" },
  { name: "Arabian Ranches", slug: "arabian-ranches" },
  { name: "DIFC", slug: "difc" },
  { name: "Jumeirah Lakes Towers", slug: "jumeirah-lakes-towers" },
  { name: "MBR City", slug: "mbr-city" },
];

// Property-type landings. The residential three already had footer links; the
// specialist types (penthouses / land / offices / warehouses) were reachable
// only from the Navbar mega menu, whose panels mount on open and therefore
// contribute no crawlable internal links to the served HTML.
const FOOTER_TYPES: { nameKey: string; href: string }[] = [
  { nameKey: "apartments", href: "/apartments" },
  { nameKey: "villas", href: "/villas" },
  { nameKey: "townhouses", href: "/townhouses" },
  { nameKey: "penthouses", href: "/penthouses" },
  { nameKey: "landForSale", href: "/land-for-sale" },
  { nameKey: "offices", href: "/offices" },
  { nameKey: "warehouses", href: "/warehouses" },
];

const Footer = () => {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");
  const tListProperty = useTranslations("listProperty");
  const tWa = useTranslations("whatsapp");
  const pathname = usePathname();

  // Shared link styling. Underline-on-hover rather than colour-only, so the
  // affordance does not depend on distinguishing gold from white.
  const linkCls =
    "text-white/75 hover:text-accent hover:underline underline-offset-4 decoration-accent/60 transition-colors";

  return (
  <footer className="relative text-white/75" style={{ background: "linear-gradient(160deg, #0B3D2E 0%, #12583F 55%, #1A7A5A 100%)" }}>
    {/* Soft radial lift behind the brand column so the flat gradient reads with
        depth rather than as a single sheet of colour. Purely decorative. */}
    <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.45]" style={{ background: "radial-gradient(60rem 28rem at 12% 0%, rgba(212,168,71,0.10), transparent 60%)" }} />

    <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
      {/* Top border accent */}
      <div className="h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />

      <div className="py-10 sm:py-16 grid grid-cols-2 md:grid-cols-12 gap-x-6 gap-y-9 sm:gap-10">
        <div className="col-span-2 md:col-span-3">
          <div className="mb-4 sm:mb-5">
            <Image src={binayahLogo} alt="Binayah Properties" height={40} width={120} className="h-9 sm:h-10 w-auto brightness-0 invert" />
          </div>
          <p className="text-xs sm:text-sm leading-relaxed text-white/70 mb-5 sm:mb-6 max-w-xs">
            {t("taglineExtended")}
          </p>
          <div className="flex gap-2.5 sm:gap-3">
            {/* Instagram */}
            <a href="https://www.instagram.com/dubai_realty" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center hover:bg-accent hover:border-accent transition-all group">
              <svg className="h-4 w-4 text-white/70 group-hover:text-accent-foreground transition-colors" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
            </a>
            {/* Facebook */}
            <a href="https://www.facebook.com/BinayahRealEstateLLC" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center hover:bg-accent hover:border-accent transition-all group">
              <svg className="h-4 w-4 text-white/70 group-hover:text-accent-foreground transition-colors" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
            {/* YouTube */}
            <a href="https://www.youtube.com/@binayahproperties" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center hover:bg-accent hover:border-accent transition-all group">
              <svg className="h-4 w-4 text-white/70 group-hover:text-accent-foreground transition-colors" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            </a>
            {/* WhatsApp */}
            <a href={waHref(tWa("prefillGeneral"), pathname ?? undefined)} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center hover:bg-accent hover:border-accent transition-all group">
              <svg className="h-4 w-4 text-white/70 group-hover:text-accent-foreground transition-colors" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            </a>
            {/* LinkedIn */}
            <a href="https://www.linkedin.com/company/binayah-real-estate" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center hover:bg-accent hover:border-accent transition-all group">
              <svg className="h-4 w-4 text-white/70 group-hover:text-accent-foreground transition-colors" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </a>
          </div>
        </div>

        <div className="md:col-span-2">
          <h4 className="font-semibold text-white mb-3 sm:mb-5 text-[10px] sm:text-xs uppercase tracking-[0.2em]">{t("properties")}</h4>
          <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
            <li><Link href="/buy" className={linkCls}>{t("links.buy")}</Link></li>
            <li><Link href="/rent" className={linkCls}>{t("links.rent")}</Link></li>
            <li><Link href="/off-plan" className={linkCls}>{t("links.offPlan")}</Link></li>
            <li><Link href="/offers" className={linkCls}>{t("links.offers")}</Link></li>
            <li><Link href="/communities" className={linkCls}>{t("links.communities")}</Link></li>
            <li><Link href="/developers" className={linkCls}>{t("links.developers")}</Link></li>
          </ul>
        </div>

        <div className="md:col-span-2">
          <h4 className="font-semibold text-white mb-3 sm:mb-5 text-[10px] sm:text-xs uppercase tracking-[0.2em]">{t("company")}</h4>
          <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
            <li><Link href="/services" className={linkCls}>{t("links.services")}</Link></li>
            {/* The commercial service pages. These live in the footer rather than
                only in the Navbar mega menu because the mega-menu panels mount
                on open, so their links never appear in the served HTML and carry
                no crawlable internal-link equity. */}
            <li><Link href="/services/real-estate-agency-dubai" className={linkCls}>{t("links.agencyDubai")}</Link></li>
            <li><Link href="/services/real-estate-broker-dubai" className={linkCls}>{t("links.brokerDubai")}</Link></li>
            <li><Link href="/services/property-investment-dubai" className={linkCls}>{t("links.investmentDubai")}</Link></li>
            <li><Link href="/services/property-management" className={linkCls}>{t("links.propertyManagement")}</Link></li>
            <li><Link href="/about" className={linkCls}>{t("links.about")}</Link></li>
            <li><Link href="/team" className={linkCls}>{t("links.team")}</Link></li>
            <li><Link href="/contact" className={linkCls}>{t("links.contact")}</Link></li>
          </ul>
        </div>

        {/* Resources — the intent-heavy tools and guides. Every one of these was
            previously reachable only from a mega-menu panel or the sitemap. */}
        <div className="md:col-span-2">
          <h4 className="font-semibold text-white mb-3 sm:mb-5 text-[10px] sm:text-xs uppercase tracking-[0.2em]">{t("resources")}</h4>
          <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
            <li><Link href="/valuation" className={linkCls}>{t("links.valuation")}</Link></li>
            <li><Link href="/deal-check" className={linkCls}>{t("links.dealCheck")}</Link></li>
            <li><Link href="/mortgage" className={linkCls}>{tNav("mortgageGuide")}</Link></li>
            <li><Link href="/golden-visa" className={linkCls}>{tNav("goldenVisaGuide")}</Link></li>
            <li><Link href="/pulse" className={linkCls}>{tNav("pulse")}</Link></li>
            <li><Link href="/news" className={linkCls}>{t("links.news")}</Link></li>
            <li><Link href="/buy-with-crypto" className={linkCls}>{tNav("buyWithCrypto")}</Link></li>
            {/* Hub for the per-nationality buyer guides. Those 12+ pages were
                reachable only from the sitemap; this is their one crawlable
                inbound link from every page on the site. */}
            <li><Link href="/buying-property-in-dubai-as" className={linkCls}>{t("links.foreignBuyers")}</Link></li>
          </ul>
        </div>

        <div className="col-span-2 md:col-span-3">
          <h4 className="font-semibold text-white mb-3 sm:mb-5 text-[10px] sm:text-xs uppercase tracking-[0.2em]">{t("contactUs")}</h4>
          <ul className="space-y-3 sm:space-y-4 text-xs sm:text-sm">
            <li className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                <Phone className="h-3.5 w-3.5 text-accent" />
              </div>
              <a href="tel:+971549988811" className={linkCls}>{t("phoneNumber")}</a>
            </li>
            <li className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                <Mail className="h-3.5 w-3.5 text-accent" />
              </div>
              {/* break-words, not break-all: the latter splits mid-word and
                  rendered the address as "info@binayah.c / om". */}
              <a href={`mailto:${t("email")}`} className={`${linkCls} break-words`}>{t("email")}</a>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                <MapPin className="h-3.5 w-3.5 text-accent" />
              </div>
              <a href="https://maps.google.com/?q=Liberty+Building+Al+Quoz+3+Sheikh+Zayed+Road+Dubai" target="_blank" rel="noopener noreferrer" className={`${linkCls} leading-relaxed`}>{t("address")}</a>
            </li>
          </ul>

          {/* Seller-side CTA. The footer otherwise speaks only to buyers and
              renters; /sell and /list-your-property had no sitewide entry. */}
          <div className="mt-6 sm:mt-7 pt-5 border-t border-white/15 flex flex-col gap-2.5">
            <Link href="/sell" className="flex w-full items-center justify-center rounded-full bg-accent px-4 py-2.5 text-xs font-semibold text-accent-foreground hover:brightness-110 transition-all">
              {tNav("listYourProperty")}
            </Link>
            <Link href="/list-your-property" className="text-[11px] text-white/70 hover:text-accent hover:underline underline-offset-4 transition-colors text-center">
              {tListProperty("heroLabel")}
            </Link>
          </div>
        </div>
      </div>

      {/* SEO internal-linking row — deep links to popular community & type pages */}
      <div className="border-t border-white/15 py-6 sm:py-8 grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8">
        <div className="md:col-span-8">
          <h4 className="font-semibold text-white mb-3 sm:mb-4 text-[10px] sm:text-xs uppercase tracking-[0.2em]">{t("popularCommunities")}</h4>
          <ul className="flex flex-wrap gap-x-2 gap-y-2 text-xs sm:text-sm">
            {FOOTER_COMMUNITIES.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/buy-property-in/${c.slug}`}
                  className="inline-block rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5 text-white/75 hover:border-accent hover:bg-accent hover:text-accent-foreground transition-all"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="md:col-span-4">
          <h4 className="font-semibold text-white mb-3 sm:mb-4 text-[10px] sm:text-xs uppercase tracking-[0.2em]">{t("browseByType")}</h4>
          <ul className="flex flex-wrap gap-x-2 gap-y-2 text-xs sm:text-sm">
            {FOOTER_TYPES.map((tpe) => (
              <li key={tpe.href}>
                <Link
                  href={tpe.href}
                  className="inline-block rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5 text-white/75 hover:border-accent hover:bg-accent hover:text-accent-foreground transition-all"
                >
                  {tNav(tpe.nameKey)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Trust Badges — compact 3-col row on mobile, generous wrap on desktop */}
      <div className="border-t border-white/15 py-5 sm:py-6">
        <div className="grid grid-cols-3 sm:flex sm:flex-wrap items-center justify-items-center sm:justify-center gap-y-3 gap-x-2 sm:gap-x-10">
          <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2.5 text-center sm:text-left">
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-accent/15 ring-1 ring-accent/30 flex items-center justify-center flex-shrink-0">
              <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <div>
              <p className="text-[8px] sm:text-[10px] text-white/55 uppercase tracking-wider leading-tight">{t("reraRegistered")}</p>
              <p className="text-[10px] sm:text-xs text-white font-semibold leading-tight">{t("ornNumber")}</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2.5 text-center sm:text-left">
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-accent/15 ring-1 ring-accent/30 flex items-center justify-center flex-shrink-0">
              <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
            </div>
            <div>
              <p className="text-[8px] sm:text-[10px] text-white/55 uppercase tracking-wider leading-tight">{t("dldCertified")}</p>
              <p className="text-[10px] sm:text-xs text-white font-semibold leading-tight">{t("dubaiLandDept")}</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2.5 text-center sm:text-left">
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-accent/15 ring-1 ring-accent/30 flex items-center justify-center flex-shrink-0">
              <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            </div>
            <div>
              <p className="text-[8px] sm:text-[10px] text-white/55 uppercase tracking-wider leading-tight">{t("established")}</p>
              <p className="text-[10px] sm:text-xs text-white font-semibold leading-tight">{t("yearsInDubai")}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Extra bottom padding on mobile to clear FABs */}
      <div className="border-t border-white/15 py-5 sm:py-6 pb-20 sm:pb-6 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-center sm:text-left">
        <p className="text-[10px] sm:text-xs text-white/55">{t("copyright")} {t("rights")}</p>
        <div className="flex items-center gap-4 sm:gap-6 text-[10px] sm:text-xs text-white/55">
          <Link href="/privacy-policy" className="hover:text-white transition-colors">{t("privacyPolicy")}</Link>
          <Link href="/terms-of-service" className="hover:text-white transition-colors">{t("termsOfService")}</Link>
        </div>
      </div>
    </div>
  </footer>
  );
};

export default Footer;
