"use client";

import React, { useState, useEffect } from "react";
import { ChevronDown, Phone, Menu, X } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
const binayahLogo = "/assets/binayah-logo.png";

const navItems = [
  { label: "Off Plan", href: "/off-plan", isRoute: true },
  { label: "Developers", href: "/developers", isRoute: true },
  { label: "Communities", href: "/communities", isRoute: true },
  { label: "Services", href: "/services", isRoute: true },
  { label: "Valuation", href: "/valuation", isRoute: true },
  { label: "News", href: "/news", isRoute: true },
  { label: "About", href: "/about", isRoute: true },
];

const Navbar = ({ extraItems }: { extraItems?: React.ReactNode }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const isSolid = scrolled || pathname !== "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNav = (href: string, isRoute?: boolean) => {
    setMobileOpen(false);
    if (isRoute) {
      router.push(href);
    } else {
      const el = document.querySelector(href);
      el?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isSolid
          ? "bg-foreground/95 backdrop-blur-xl shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-[1600px] px-6 lg:px-10">
        <div className={`flex items-center justify-between transition-all duration-300 ${isSolid ? "h-16" : "h-20"}`}>
          {/* Logo - far left */}
          <a href="/" className="flex items-center gap-2 group flex-shrink-0">
            <img src={binayahLogo} alt="Binayah Properties" className="h-10 w-auto brightness-0 invert" />
          </a>

          {/* Nav links */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
              <button
                key={item.label}
                onClick={() => handleNav(item.href, item.isRoute)}
                className={`relative flex items-center gap-1 px-4 py-2 text-[13px] font-medium transition-colors uppercase tracking-[0.15em] group whitespace-nowrap ${isActive ? "text-accent" : "text-white/80 hover:text-white"}`}
              >
                {item.label}
                <span className={`absolute bottom-0 left-4 right-4 h-[2px] bg-accent transition-transform origin-left ${isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`} />
              </button>
              );
            })}
          </div>

          {/* Right actions */}
          <div className="hidden lg:flex items-center gap-3 flex-shrink-0">
            <a href="tel:+97154998811" className="flex items-center gap-2 text-white/80 hover:text-white text-sm transition-colors whitespace-nowrap">
              <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center flex-shrink-0">
                <Phone className="h-3.5 w-3.5" />
              </div>
              <span className="text-[10px] uppercase tracking-widest text-white/50">Call Us</span>
              <span className="text-sm font-medium">+971 54 998 8811</span>
            </a>
            <button
              onClick={() => handleNav("/contact", true)}
              className="bg-accent hover:bg-accent/90 text-accent-foreground px-5 py-2.5 rounded-lg text-sm font-semibold transition-all hover:shadow-lg hover:shadow-accent/20 hover:-translate-y-0.5 whitespace-nowrap"
            >
              Get in Touch
            </button>
            {extraItems && (
              <>
                <div className="w-px h-6 bg-white/15" />
                {extraItems}
              </>
            )}
          </div>

          <button className="lg:hidden text-white p-2" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden bg-foreground/98 backdrop-blur-xl border-t border-white/5"
          >
            <div className="px-6 py-6 space-y-1">
              {navItems.map((item, i) => (
                <motion.button
                  key={item.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => handleNav(item.href, item.isRoute)}
                  className="w-full text-left px-3 py-3 text-white/80 hover:text-white hover:bg-white/5 rounded-lg text-sm uppercase tracking-[0.15em] transition-colors"
                >
                  {item.label}
                </motion.button>
              ))}
              <div className="pt-4 border-t border-white/10 mt-4">
                <a href="tel:+97154998811" className="flex items-center gap-3 px-3 py-3 text-white/80 text-sm">
                  <Phone className="h-4 w-4 text-accent" />
                  +971 54 998 8811
                </a>
                <button
                  onClick={() => handleNav("/contact", true)}
                  className="w-full mt-2 bg-accent text-accent-foreground py-3 rounded-lg text-sm font-semibold"
                >
                  Get in Touch
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;