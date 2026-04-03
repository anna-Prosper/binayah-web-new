"use client";

import React, { useState, useEffect, useRef } from "react";
import { Phone, Menu, X, ChevronDown, Globe, MessageCircle } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const binayahLogo = "/assets/binayah-logo.png";

const CURRENCIES = ["AED", "USD", "EUR", "GBP", "CNY", "RUB"];
const LANGUAGES_LIST = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "ar", label: "العربية", flag: "🇦🇪" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
];

const primaryNav = [
  { label: "Buy", href: "/search?intent=buy" },
  { label: "Rent", href: "/search?intent=rent" },
  { label: "Off Plan", href: "/off-plan" },
];
const insightsNav = [
  { label: "Market Pulse", href: "/pulse" },
  { label: "Communities", href: "/communities" },
  { label: "Valuation", href: "/valuation" },
  { label: "Guides", href: "/news" },
];
const moreNav = [
  { label: "Services", href: "/services" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const Navbar = ({ extraItems }: { extraItems?: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [mobileInsightsOpen, setMobileInsightsOpen] = useState(false);
  const [mobileCompanyOpen, setMobileCompanyOpen] = useState(false);
  const [mobileCurrency, setMobileCurrency] = useState("AED");
  const [mobileLanguage, setMobileLanguage] = useState("en");
  const [phoneHover, setPhoneHover] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const insightsRef = useRef<HTMLDivElement>(null);
  const isHome = pathname === "/";

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", checkMobile);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", checkMobile); };
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
      document.body.classList.add("mobile-nav-open");
    } else {
      document.body.style.overflow = "";
      document.body.classList.remove("mobile-nav-open");
    }
    return () => {
      document.body.style.overflow = "";
      document.body.classList.remove("mobile-nav-open");
    };
  }, [mobileOpen]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false);
      if (insightsRef.current && !insightsRef.current.contains(e.target as Node)) setInsightsOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleNav = (href: string) => {
    setMobileOpen(false);
    setMoreOpen(false);
    setMobileInsightsOpen(false);
    setMobileCompanyOpen(false);
    router.push(href);
  };

  const isSolid = scrolled || !isHome || isMobile;
  const selectedLang = LANGUAGES_LIST.find(l => l.code === mobileLanguage) || LANGUAGES_LIST[0];

  return (
    <>
      <motion.nav
        className="fixed sm:fixed top-0 left-0 right-0 z-50 transition-all duration-500 backdrop-blur-xl shadow-lg max-sm:absolute"
        style={{ background: isSolid ? "linear-gradient(135deg, #0B3D2E, #1A7A5A)" : "transparent" }}
      >
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-10">
          <div className={`flex items-center justify-between transition-all duration-300 ${scrolled ? "h-12 sm:h-16" : "h-14 sm:h-20"}`}>
            <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
              <img src={binayahLogo} alt="Binayah Properties" className="h-8 sm:h-10 w-auto brightness-0 invert" />
            </Link>

            {/* Desktop nav */}
            <div className="hidden lg:flex items-center gap-1">
              {primaryNav.map((item) => (
                <button key={item.label} onClick={() => handleNav(item.href)}
                  className="relative flex items-center gap-1 px-4 py-2 text-[13px] font-medium text-white/80 hover:text-white transition-colors uppercase tracking-[0.15em] group whitespace-nowrap">
                  {item.label}
                  <span className="absolute bottom-0 left-4 right-4 h-[2px] bg-accent scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                </button>
              ))}

              <div ref={insightsRef} className="relative"
                onMouseEnter={() => { setInsightsOpen(true); setMoreOpen(false); }}
                onMouseLeave={() => setInsightsOpen(false)}>
                <button className="relative flex items-center gap-1 px-4 py-2 text-[13px] font-medium text-white/80 hover:text-white transition-colors uppercase tracking-[0.15em] group whitespace-nowrap">
                  Insights
                  <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${insightsOpen ? "rotate-180" : ""}`} />
                  <span className="absolute bottom-0 left-4 right-4 h-[2px] bg-accent scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                </button>
                <AnimatePresence>
                  {insightsOpen && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }} className="absolute top-full left-0 pt-2">
                      <div className="min-w-[180px] rounded-lg overflow-hidden shadow-xl border border-white/10" style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}>
                        {insightsNav.map((item) => (
                          <button key={item.label} onClick={() => handleNav(item.href)} className="w-full text-left px-5 py-3 text-[13px] font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors uppercase tracking-[0.15em]">
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div ref={moreRef} className="relative"
                onMouseEnter={() => { setMoreOpen(true); setInsightsOpen(false); }}
                onMouseLeave={() => setMoreOpen(false)}>
                <button className="relative flex items-center gap-1 px-4 py-2 text-[13px] font-medium text-white/80 hover:text-white transition-colors uppercase tracking-[0.15em] group whitespace-nowrap">
                  Company
                  <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${moreOpen ? "rotate-180" : ""}`} />
                  <span className="absolute bottom-0 left-4 right-4 h-[2px] bg-accent scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                </button>
                <AnimatePresence>
                  {moreOpen && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }} className="absolute top-full left-0 pt-2">
                      <div className="min-w-[160px] rounded-lg overflow-hidden shadow-xl border border-white/10" style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}>
                        {moreNav.map((item) => (
                          <button key={item.label} onClick={() => handleNav(item.href)} className="w-full text-left px-5 py-3 text-[13px] font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors uppercase tracking-[0.15em]">
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-3 flex-shrink-0">
              <div className="relative flex items-center"
                onMouseEnter={() => setPhoneHover(true)}
                onMouseLeave={() => setPhoneHover(false)}>
                <a href="tel:+971549988811" className="flex items-center gap-2 text-white/80 hover:text-white transition-all">
                  <div className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center flex-shrink-0 hover:bg-white/10 transition-colors">
                    <Phone className="h-4 w-4" />
                  </div>
                  <AnimatePresence>
                    {phoneHover && (
                      <motion.span initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: "auto" }} exit={{ opacity: 0, width: 0 }} transition={{ duration: 0.2 }} className="text-sm font-medium whitespace-nowrap overflow-hidden">
                        +971 54 998 8811
                      </motion.span>
                    )}
                  </AnimatePresence>
                </a>
              </div>
              <button onClick={() => handleNav("/contact")}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:shadow-lg hover:-translate-y-0.5 whitespace-nowrap"
                style={{ background: "linear-gradient(to right, #D4A847, #B8922F)", boxShadow: "0 4px 15px rgba(212,168,71,0.3)" }}>
                Get in Touch
              </button>
              {extraItems && (
                <>
                  <div className="w-px h-6 bg-white/15" />
                  {extraItems}
                </>
              )}
            </div>

            <button className="lg:hidden text-white min-w-[44px] min-h-[44px] flex items-center justify-center" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="h-7 w-7" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile fullscreen menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: "100%" }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="lg:hidden fixed inset-0 z-[100] flex flex-col"
            style={{ background: "linear-gradient(160deg, #0B3D2E 0%, #145C3F 50%, #1A7A5A 100%)" }}
          >
            <div className="flex items-center justify-between px-4 h-14 flex-shrink-0">
              <Link href="/" className="flex items-center" onClick={() => setMobileOpen(false)}>
                <img src={binayahLogo} alt="Binayah Properties" className="h-8 w-auto brightness-0 invert" />
              </Link>
              <button onClick={() => setMobileOpen(false)} className="min-w-[44px] min-h-[44px] flex items-center justify-center text-white">
                <X className="h-7 w-7" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-6 pt-2">
              {primaryNav.map((item, i) => (
                <motion.button key={item.label} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05, duration: 0.3 }}
                  onClick={() => handleNav(item.href)}
                  className="w-full text-left px-2 py-4 text-white/90 hover:text-white text-[15px] uppercase tracking-[0.15em] font-medium border-b border-white/10">
                  {item.label}
                </motion.button>
              ))}

              <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15, duration: 0.3 }} className="border-b border-white/10">
                <button onClick={() => { setMobileInsightsOpen(!mobileInsightsOpen); setMobileCompanyOpen(false); }}
                  className="w-full flex items-center justify-between px-2 py-4 text-white/90 hover:text-white text-[15px] uppercase tracking-[0.15em] font-medium">
                  Insights
                  <ChevronDown className={`h-5 w-5 transition-transform duration-200 ${mobileInsightsOpen ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {mobileInsightsOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                      <div className="pl-4 border-l-2 border-accent/40 ml-3 pb-3 space-y-0.5">
                        {insightsNav.map((item) => (
                          <button key={item.label} onClick={() => handleNav(item.href)} className="w-full text-left px-3 py-3 text-white/65 hover:text-white hover:bg-white/5 rounded-lg text-[13px] uppercase tracking-[0.12em] transition-colors min-h-[44px] flex items-center">
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2, duration: 0.3 }} className="border-b border-white/10">
                <button onClick={() => { setMobileCompanyOpen(!mobileCompanyOpen); setMobileInsightsOpen(false); }}
                  className="w-full flex items-center justify-between px-2 py-4 text-white/90 hover:text-white text-[15px] uppercase tracking-[0.15em] font-medium">
                  Company
                  <ChevronDown className={`h-5 w-5 transition-transform duration-200 ${mobileCompanyOpen ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {mobileCompanyOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                      <div className="pl-4 border-l-2 border-accent/40 ml-3 pb-3 space-y-0.5">
                        {moreNav.map((item) => (
                          <button key={item.label} onClick={() => handleNav(item.href)} className="w-full text-left px-3 py-3 text-white/65 hover:text-white hover:bg-white/5 rounded-lg text-[13px] uppercase tracking-[0.12em] transition-colors min-h-[44px] flex items-center">
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25, duration: 0.3 }} className="pt-6 pb-5 flex items-center gap-4">
                <button onClick={() => { const idx = CURRENCIES.indexOf(mobileCurrency); setMobileCurrency(CURRENCIES[(idx + 1) % CURRENCIES.length]); }}
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 transition-colors min-h-[44px]">
                  <Globe className="h-4 w-4 text-accent" />
                  <span className="text-sm font-bold text-white uppercase tracking-wider">{mobileCurrency}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-white/40" />
                </button>
                <button onClick={() => { const idx = LANGUAGES_LIST.findIndex(l => l.code === mobileLanguage); setMobileLanguage(LANGUAGES_LIST[(idx + 1) % LANGUAGES_LIST.length].code); }}
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 transition-colors min-h-[44px]">
                  <span className="text-base">{selectedLang.flag}</span>
                  <span className="text-sm font-bold text-white uppercase tracking-wider">{selectedLang.code.toUpperCase()}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-white/40" />
                </button>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3, duration: 0.3 }} className="pt-4 border-t border-white/10 space-y-1">
                <a href="tel:+971549988811" className="flex items-center gap-3 px-2 py-3 text-white/80 text-sm hover:text-white transition-colors min-h-[48px]">
                  <div className="w-10 h-10 rounded-full bg-[#3B82F6]/20 flex items-center justify-center flex-shrink-0">
                    <Phone className="h-[18px] w-[18px] text-[#60A5FA]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-white">Call Us</span>
                    <span className="text-[12px] text-white/50">+971 54 998 8811</span>
                  </div>
                </a>
                <a href="https://wa.me/971549988811" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-2 py-3 text-white/80 text-sm hover:text-white transition-colors min-h-[48px]">
                  <div className="w-10 h-10 rounded-full bg-[#25D366]/20 flex items-center justify-center flex-shrink-0">
                    <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-white">Chat on WhatsApp</span>
                    <span className="text-[12px] text-white/50">+971 54 998 8811</span>
                  </div>
                </a>
                <button type="button"
                  onClick={() => { setMobileOpen(false); setTimeout(() => { const chatBtn = document.querySelector<HTMLButtonElement>('[data-chat-trigger]'); if (chatBtn) chatBtn.click(); }, 350); }}
                  className="flex items-center gap-3 px-2 py-3 text-white/80 text-sm hover:text-white transition-colors w-full text-left min-h-[48px]">
                  <div className="w-10 h-10 rounded-full bg-[#D4A847]/20 flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="h-[18px] w-[18px] text-[#D4A847]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-white">Live Chat</span>
                    <span className="text-[12px] text-white/50">Chat with our team</span>
                  </div>
                </button>
              </motion.div>
            </div>

            <div className="flex-shrink-0 px-6 pb-6 pt-3">
              <button onClick={() => handleNav("/contact")}
                className="w-full py-3.5 rounded-xl text-sm font-semibold text-white"
                style={{ background: "linear-gradient(to right, #D4A847, #B8922F)" }}>
                Get in Touch
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
