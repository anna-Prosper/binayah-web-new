/* eslint-disable i18next/no-literal-string -- English-only standalone showcase page */
"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { ArrowRight, Anchor, Waves, UtensilsCrossed, ShoppingBag, HeartPulse, Trees, Building2, Phone, ChevronDown, MessageCircle } from "lucide-react";
import { GalleryModal } from "@/components/GalleryModal";
import { FaqAccordion, type FaqItem } from "@/components/FaqAccordion";
import { waHref } from "@/lib/whatsapp";

const TICKER_ITEMS = [
  "Dubai's Second Palm",
  "16 Fronds",
  "110km of New Coastline",
  "Freehold for All Nationalities",
  "Nakheel Master Developer",
  "Villas from AED 18.5M",
];

// Diagonal light sweep on hover — used on the gold CTA buttons. Parent needs
// `group relative overflow-hidden`; this only paints the moving highlight.
function Shine() {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute top-0 left-0 h-full w-1/4 -skew-x-12 bg-white/40 blur-sm -translate-x-[300%] transition-transform duration-700 ease-out group-hover:translate-x-[400%]"
    />
  );
}

function Marquee() {
  const reduceMotion = useReducedMotion();
  const loop = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div className="overflow-hidden border-y border-white/10 bg-[#051820] py-4 sm:py-5">
      <motion.div
        className="flex gap-10 sm:gap-16 whitespace-nowrap w-max"
        animate={reduceMotion ? undefined : { x: ["0%", "-50%"] }}
        transition={reduceMotion ? undefined : { duration: 26, ease: "linear", repeat: Infinity }}
      >
        {loop.map((t, i) => (
          <span key={i} className="text-white/40 text-xs sm:text-sm uppercase tracking-[0.3em] flex items-center gap-10 sm:gap-16 flex-shrink-0">
            {t}
            <span className="text-[#C9A26A]">•</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// Subtle cursor-driven 3D tilt for the residence panels — kept to a few
// degrees so it reads as tactile polish rather than a gimmick.
function TiltCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduceMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    ref.current.style.transform = `perspective(1200px) rotateY(${px * 4}deg) rotateX(${-py * 4}deg) scale(1.015)`;
  };
  const reset = () => {
    if (ref.current) ref.current.style.transform = "";
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      className={`transition-transform duration-300 ease-out will-change-transform ${className}`}
    >
      {children}
    </div>
  );
}

const NAV_LINKS = [
  { href: "#residences", label: "Residences" },
  { href: "#gallery", label: "Gallery" },
  { href: "#location", label: "Location" },
  { href: "#payment-plan", label: "Payment Plan" },
  { href: "#faq", label: "FAQ" },
];

// This page's anchor nav scrolls smoothly on click without relying on global
// `scroll-behavior: smooth` (intentionally removed site-wide in globals.css),
// and offsets for the fixed header height so section titles aren't hidden under it.
function scrollToAnchor(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
  const target = document.querySelector(href);
  if (!target) return;
  e.preventDefault();
  const headerOffset = 88;
  const top = target.getBoundingClientRect().top + window.scrollY - headerOffset;
  window.scrollTo({ top, behavior: "smooth" });
}

function SiteHeader({ waLink }: { waLink: string }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      setScrolled(window.scrollY > 60);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-[#06232E]/90 backdrop-blur-md border-b border-white/10 py-3" : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-8 flex items-center justify-between">
        <a
          href="#top"
          onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
          className="text-white font-bold tracking-[0.3em] text-xs sm:text-sm uppercase"
        >
          Palm<span className="text-[#C9A26A]"> Jebel Ali</span>
        </a>
        <nav className="hidden lg:flex items-center gap-8">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={(e) => scrollToAnchor(e, l.href)}
              className="text-white/70 hover:text-white text-xs uppercase tracking-wider transition-colors"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative overflow-hidden inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#06232E]"
          style={{ background: "linear-gradient(to right, #C9A26A, #A8814A)" }}
        >
          <MessageCircle className="h-3.5 w-3.5" /> Enquire
          <Shine />
        </a>
      </div>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="bg-[#051820] border-t border-white/10 py-14 sm:py-20">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8 mb-10 sm:mb-14">
          <div>
            <p className="text-white font-bold tracking-[0.3em] text-sm uppercase mb-3">
              Palm<span className="text-[#C9A26A]"> Jebel Ali</span>
            </p>
            <p className="text-white/50 text-sm max-w-sm leading-relaxed">
              An independent showcase for Nakheel&apos;s Palm Jebel Ali, curated by a Dubai brokerage tracking release phases directly.
            </p>
          </div>
          <div className="flex gap-3">
            <a
              href={waHref(WA_MESSAGE, PAGE_URL)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-xs font-bold uppercase tracking-wider text-[#06232E]"
              style={{ background: "linear-gradient(to right, #C9A26A, #A8814A)" }}
            >
              <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
            </a>
            <a
              href="tel:+971549988811"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-xs font-bold uppercase tracking-wider text-white border border-white/20"
            >
              <Phone className="h-3.5 w-3.5" /> Call
            </a>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <p className="text-white/35 text-xs leading-relaxed max-w-2xl">
            Palm Jebel Ali is a master development by Nakheel. Renders shown are illustrative concept imagery, not official developer material. Marketed by{" "}
            <a href="https://www.binayah.ae" className="underline hover:text-white/60">Binayah Properties</a>, RERA ORN 1162, an independent brokerage, not affiliated with or endorsed by Nakheel.
          </p>
          <p className="text-white/35 text-xs whitespace-nowrap">© 2026 Palm Jebel Ali Showcase</p>
        </div>
      </div>
    </footer>
  );
}

const IMG_BASE = "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/showcase-images/palm-jebel-ali";
const HERO_IMG = `${IMG_BASE}/hero-aerial.png`;
const MASTERPLAN_IMG = `${IMG_BASE}/masterplan-aerial.png`;
const VILLA_EXT_IMG = `${IMG_BASE}/villa-exterior.png`;
const VILLA_INT_IMG = `${IMG_BASE}/villa-interior.png`;
const MARINA_IMG = `${IMG_BASE}/marina-club.png`;
const POOL_IMG = `${IMG_BASE}/amenities-pool.png`;
const BEDROOM_IMG = `${IMG_BASE}/bedroom-suite.png`;

const PAGE_URL = "https://www.binayah.ae/palm-jebel-ali";
const WA_MESSAGE = "Hi Binayah! I'd like the current release schedule and pricing for Palm Jebel Ali.";

const FAQS: FaqItem[] = [
  {
    question: "What is Palm Jebel Ali?",
    answer:
      "A new palm-shaped island development by Nakheel off Dubai's southern coast, roughly twice the size of Palm Jumeirah, comprising 16 fronds across 7 islands.",
  },
  {
    question: "How much does it cost to buy at Palm Jebel Ali?",
    answer:
      "Beachfront villas start from AED 18.5 million; apartments and townhouses at Palm Central start from AED 2.7 million, depending on release phase and unit.",
  },
  {
    question: "What is the payment plan?",
    answer:
      "Launch inventory has typically followed an 80/20 structure, 20% on booking, 60% during construction, 20% on handover, though terms vary by release.",
  },
  {
    question: "When is handover?",
    answer:
      "Villas are phased in across multiple fronds under active construction. Palm Central apartments and townhouses are scheduled from 2028, with later phases through 2030.",
  },
  {
    question: "Is Palm Jebel Ali really bigger than Palm Jumeirah?",
    answer: "Yes, the master plan is roughly double the footprint, adding around 110km of new coastline to Dubai.",
  },
  {
    question: "Can foreign buyers own freehold here?",
    answer:
      "Yes, Palm Jebel Ali falls within Dubai's designated freehold zones, open to foreign ownership like Palm Jumeirah and other Nakheel master communities.",
  },
];

const GALLERY_IMAGES = [VILLA_EXT_IMG, VILLA_INT_IMG, BEDROOM_IMG, MARINA_IMG, POOL_IMG, MASTERPLAN_IMG];

const AMENITIES = [
  { icon: Waves, label: "Private beach frontage on every frond" },
  { icon: Anchor, label: "Marina & yacht club" },
  { icon: UtensilsCrossed, label: "Beach clubs & fine dining" },
  { icon: ShoppingBag, label: "Boutique retail districts" },
  { icon: HeartPulse, label: "Wellness centres & spas" },
  { icon: Trees, label: "Parks & waterfront promenades" },
  { icon: Building2, label: "Up to 80 hotels & resorts island-wide" },
];

function useRevealOnScroll<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

function CountUp({ target, suffix = "", duration = 1400 }: { target: number; suffix?: string; duration?: number }) {
  const { ref, visible } = useRevealOnScroll<HTMLSpanElement>();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!visible) return;
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setValue(target);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [visible, target, duration]);

  return (
    <span ref={ref}>
      {value}
      {suffix}
    </span>
  );
}

function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

const heroStagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
};
const heroItem: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
};
const galleryStagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const galleryItem: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.96 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

export default function PalmJebelAliClient() {
  const reduceMotion = useReducedMotion();
  const heroRef = useRef<HTMLDivElement>(null);
  const heroImgRef = useRef<HTMLDivElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);

  useEffect(() => {
    const section = heroRef.current;
    if (!section) return;
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = section.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, -rect.top / (rect.height || 1)));
      if (heroImgRef.current) heroImgRef.current.style.transform = `translateY(${p * 12}%)`;
      if (heroTextRef.current) {
        heroTextRef.current.style.transform = `translateY(${p * 30}%)`;
        heroTextRef.current.style.opacity = `${Math.max(0, 1 - p / 0.7)}`;
      }
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div id="top" className="bg-[#06232E]">
      <SiteHeader waLink={waHref(WA_MESSAGE, PAGE_URL)} />
      {/* ── HERO ── */}
      <section ref={heroRef} className="relative min-h-[100vh] flex items-end overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div ref={heroImgRef} className="absolute inset-x-0 -top-[10%] h-[130%] will-change-transform">
            {/* eslint-disable-next-line @next/next/no-img-element -- external S3 CDN hero */}
            <img src={HERO_IMG} alt="Aerial view of Palm Jebel Ali, Dubai's second palm island" className="w-full h-full object-cover" fetchPriority="high" />
            <div
              className="absolute inset-0"
              style={{ background: "linear-gradient(to bottom, rgba(6,35,46,0.05) 0%, rgba(6,35,46,0.25) 45%, rgba(6,35,46,0.85) 80%, #06232E 100%)" }}
            />
          </div>
        </div>

        <div ref={heroTextRef} className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 pb-28 sm:pb-28 w-full will-change-transform">
          <motion.div
            variants={reduceMotion ? undefined : heroStagger}
            initial={reduceMotion ? undefined : "hidden"}
            animate={reduceMotion ? undefined : "show"}
          >
            <motion.p variants={reduceMotion ? undefined : heroItem} className="text-[#C9A26A] text-xs sm:text-sm font-semibold uppercase tracking-[0.4em] mb-5">
              Palm Jebel Ali
            </motion.p>
            <motion.h1 variants={reduceMotion ? undefined : heroItem} className="text-white font-bold leading-[0.95] text-4xl sm:text-6xl lg:text-8xl mb-6 max-w-4xl">
              The second palm.
              <br />
              <span className="font-light">Twice the shoreline.</span>
            </motion.h1>
            <motion.p variants={reduceMotion ? undefined : heroItem} className="text-white/75 text-base sm:text-xl max-w-xl mb-9 leading-relaxed">
              16 fronds. 110 kilometres of new coastline. A private island city rising off Dubai&apos;s southern shore, and the first villas are already under construction.
            </motion.p>
            <motion.div variants={reduceMotion ? undefined : heroItem} className="flex flex-wrap gap-4">
              <a
                href={waHref(WA_MESSAGE, PAGE_URL)}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative overflow-hidden inline-flex items-center gap-2 px-7 py-4 rounded-full text-sm font-bold uppercase tracking-wider text-[#06232E] transition-transform hover:scale-[1.03]"
                style={{ background: "linear-gradient(to right, #C9A26A, #A8814A)" }}
              >
                Register your interest <ArrowRight className="h-4 w-4" />
                <Shine />
              </a>
              <a
                href="tel:+971549988811"
                className="inline-flex items-center gap-2 px-7 py-4 rounded-full text-sm font-bold uppercase tracking-wider text-white border border-white/30 hover:bg-white/10 transition-colors"
              >
                <Phone className="h-4 w-4" /> Speak with Binayah
              </a>
            </motion.div>
          </motion.div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
          <ChevronDown className="h-6 w-6 text-white/50" />
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="border-y border-white/10">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10 sm:py-14 grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-4 divide-x-0 sm:divide-x sm:divide-white/10">
          {[
            { value: 110, suffix: "km", label: "New coastline" },
            { value: 2, suffix: "×", label: "The size of Palm Jumeirah" },
            { value: 16, suffix: "", label: "Fronds across 7 islands" },
            { value: 80, suffix: "/20", label: "Launch payment plan" },
          ].map((s) => (
            <div key={s.label} className="text-center sm:px-4">
              <div className="text-3xl sm:text-5xl font-bold text-white mb-2">
                <CountUp target={s.value} suffix={s.suffix} />
              </div>
              <p className="text-white/50 text-xs sm:text-sm uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── POSITIONING INTRO ── */}
      <section className="max-w-3xl mx-auto px-5 sm:px-8 py-20 sm:py-32 text-center">
        <Reveal>
          <p className="text-white/80 text-xl sm:text-3xl leading-relaxed font-light">
            Nakheel built Palm Jumeirah once. Palm Jebel Ali is what happens when they get to do it again, with two more decades of lessons, twice the land, and a waterfront capable of housing 35,000 families.
          </p>
        </Reveal>
      </section>

      <Marquee />

      {/* ── FRONDS / MASTER PLAN STORY ── */}
      <section className="bg-[#0E3B45] py-20 sm:py-32">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <Reveal className="mb-14 sm:mb-20 max-w-2xl">
            <p className="text-[#C9A26A] text-xs font-semibold uppercase tracking-[0.4em] mb-4">One trunk, sixteen fronds</p>
            <h2 className="text-white text-3xl sm:text-5xl font-bold leading-tight">A coastline built from scratch.</h2>
          </Reveal>

          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <Reveal>
              <div className="rounded-2xl overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element -- external S3 CDN */}
                <img src={MASTERPLAN_IMG} alt="Palm Jebel Ali master plan, 16 fronds and a central crescent" className="w-full h-auto object-cover" loading="lazy" />
              </div>
            </Reveal>

            <div className="space-y-10">
              <Reveal>
                <p className="text-white/70 text-base sm:text-lg leading-relaxed">
                  Seven islands, sixteen fronds, and more shoreline than most countries add in a decade, all connected by three mainland access points straight onto Sheikh Zayed Road.
                </p>
              </Reveal>

              <Reveal>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/60 text-sm">Palm Jumeirah</span>
                    <span className="text-white/60 text-sm">~56km</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full rounded-full bg-white/30" style={{ width: "50%" }} />
                  </div>
                </div>
              </Reveal>

              <Reveal>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white text-sm font-semibold">Palm Jebel Ali</span>
                    <span className="text-[#C9A26A] text-sm font-semibold">~110km</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: "100%", background: "linear-gradient(to right, #C9A26A, #A8814A)" }} />
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ── RESIDENCES ── */}
      <section id="residences" className="grid md:grid-cols-2">
        {[
          {
            img: VILLA_EXT_IMG,
            label: "Beachfront Villas",
            price: "AED 18.5M",
            facts: ["5, 6 & 7-bedroom private villas", "Frond-front plots with direct beach access", "544 villas underway across six fronds"],
          },
          {
            img: MARINA_IMG,
            label: "Palm Central Residences",
            price: "AED 2.7M",
            facts: ["1–4 bedroom apartments & 4–5 bedroom townhouses", "Sea-facing, resort-style low-rise blocks", "Handover phased toward 2030"],
          },
        ].map((r) => (
          <TiltCard key={r.label} className="relative min-h-[70vh] group overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element -- external S3 CDN */}
            <img src={r.img} alt={r.label} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
            <div className="relative z-10 h-full flex flex-col justify-end p-8 sm:p-12">
              <p className="text-[#C9A26A] text-xs font-semibold uppercase tracking-[0.3em] mb-3">{r.label}</p>
              <p className="text-white text-4xl sm:text-5xl font-bold mb-5">
                From <span className="text-[#C9A26A]">{r.price}</span>
              </p>
              <ul className="space-y-1.5">
                {r.facts.map((f) => (
                  <li key={f} className="text-white/75 text-sm sm:text-base">{f}</li>
                ))}
              </ul>
            </div>
          </TiltCard>
        ))}
      </section>

      {/* ── GALLERY ── */}
      <section id="gallery" className="max-w-6xl mx-auto px-5 sm:px-8 py-20 sm:py-32">
        <Reveal className="mb-10 sm:mb-14">
          <p className="text-[#C9A26A] text-xs font-semibold uppercase tracking-[0.3em] mb-4">Built for a life lived outdoors</p>
          <h2 className="text-white text-3xl sm:text-5xl font-bold leading-tight max-w-2xl">
            Private beaches. A working marina. Everyday texture as considered as the villas themselves.
          </h2>
        </Reveal>

        <motion.div
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4"
          initial={reduceMotion ? undefined : "hidden"}
          whileInView={reduceMotion ? undefined : "show"}
          viewport={{ once: true, margin: "-80px" }}
          variants={reduceMotion ? undefined : galleryStagger}
        >
          {GALLERY_IMAGES.map((img, i) => (
            <motion.button
              key={img}
              variants={reduceMotion ? undefined : galleryItem}
              onClick={() => { setGalleryIndex(i); setGalleryOpen(true); }}
              className={`relative overflow-hidden rounded-xl group ${i === 0 ? "col-span-2 row-span-2" : ""}`}
              style={{ aspectRatio: i === 0 ? "1 / 1" : "1 / 1" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- external S3 CDN */}
              <img src={img} alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            </motion.button>
          ))}
        </motion.div>
      </section>
      <GalleryModal open={galleryOpen} onClose={() => setGalleryOpen(false)} images={GALLERY_IMAGES} activeIndex={galleryIndex} onChange={setGalleryIndex} title="Palm Jebel Ali" />

      {/* ── AMENITIES ── */}
      <section className="bg-[#F0E6D2] py-20 sm:py-32">
        <div className="max-w-4xl mx-auto px-5 sm:px-8">
          <Reveal className="mb-12">
            <p className="text-[#A8814A] text-xs font-semibold uppercase tracking-[0.3em] mb-4">Island lifestyle</p>
            <h2 className="text-[#06232E] text-3xl sm:text-5xl font-bold leading-tight">Everything the island needs, nothing it doesn&apos;t.</h2>
          </Reveal>

          <div className="divide-y divide-[#06232E]/10">
            {AMENITIES.map(({ icon: Icon, label }) => (
              <Reveal key={label}>
                <div className="flex items-center gap-5 py-5 sm:py-6">
                  <Icon className="h-5 w-5 text-[#A8814A] flex-shrink-0" />
                  <span className="text-[#06232E] text-lg sm:text-2xl font-medium">{label}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── LOCATION ── */}
      <section id="location" className="bg-[#06232E] py-20 sm:py-32">
        <div className="max-w-4xl mx-auto px-5 sm:px-8">
          <Reveal className="mb-12 sm:mb-16">
            <p className="text-[#C9A26A] text-xs font-semibold uppercase tracking-[0.3em] mb-4">Location & connectivity</p>
            <h2 className="text-white text-3xl sm:text-5xl font-bold leading-tight max-w-xl">
              Minutes from the airport reshaping Dubai.
            </h2>
          </Reveal>

          <div className="space-y-0 border-l border-[#C9A26A]/30">
            {[
              ["15 min", "Al Maktoum International (DWC)"],
              ["25 min", "Dubai Marina"],
              ["Minutes", "Expo City Dubai"],
              ["Direct", "Sheikh Zayed Road (E11)"],
            ].map(([time, place]) => (
              <Reveal key={place}>
                <div className="relative pl-8 pb-10 sm:pb-12 last:pb-0">
                  <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#C9A26A]" />
                  <p className="text-[#C9A26A] text-2xl sm:text-3xl font-bold mb-1">{time}</p>
                  <p className="text-white/60 text-base sm:text-lg">{place}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── PAYMENT PLAN ── */}
      <section id="payment-plan" className="py-20 sm:py-32">
        <div className="max-w-3xl mx-auto px-5 sm:px-8">
          <Reveal className="mb-14 sm:mb-20 text-center">
            <p className="text-[#C9A26A] text-xs font-semibold uppercase tracking-[0.3em] mb-4">Payment plan</p>
            <h2 className="text-white text-3xl sm:text-5xl font-bold leading-tight">
              Structured for investors who don&apos;t want their capital locked up early.
            </h2>
          </Reveal>

          <Reveal>
            <div className="relative flex justify-between items-start">
              <div className="absolute top-4 left-0 right-0 h-px bg-white/15" />
              {[
                { pct: "20%", label: "On booking" },
                { pct: "60%", label: "During construction" },
                { pct: "20%", label: "On handover", emphasize: true },
              ].map((s) => (
                <div key={s.label} className="relative z-10 flex flex-col items-center gap-4 flex-1">
                  <div className="relative w-2.5 h-2.5">
                    {s.emphasize && (
                      <span className="absolute inset-0 rounded-full bg-[#C9A26A] opacity-50 animate-ping" />
                    )}
                    <div
                      className={`relative w-2.5 h-2.5 rounded-full ${s.emphasize ? "" : "bg-white/30"}`}
                      style={s.emphasize ? { background: "#C9A26A" } : undefined}
                    />
                  </div>
                  <p className={`text-2xl sm:text-4xl font-bold ${s.emphasize ? "text-[#C9A26A]" : "text-white"}`}>{s.pct}</p>
                  <p className="text-white/50 text-xs sm:text-sm text-center">{s.label}</p>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal>
            <p className="text-white/60 text-sm sm:text-base text-center mt-14 sm:mt-20 max-w-xl mx-auto leading-relaxed">
              An 80/20 plan spreads the bulk of your commitment across the build period rather than the day you sign, standard Nakheel structuring on launch-phase inventory, subject to unit and release.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── WHY BINAYAH ── */}
      <section className="bg-[#0E3B45] py-20 sm:py-32">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 text-center">
          <Reveal>
            <p className="text-[#C9A26A] text-xs font-semibold uppercase tracking-[0.3em] mb-4">Off-plan access, without the waitlist guesswork</p>
            <h2 className="text-white text-2xl sm:text-4xl font-bold leading-tight mb-6">
              Palm Jebel Ali&apos;s early releases move fast, and allocations are tightly controlled.
            </h2>
            <p className="text-white/70 text-base sm:text-lg leading-relaxed">
              Binayah tracks Nakheel&apos;s release phases directly and can position serious buyers ahead of general public launches, with full DLD-registered transaction support from reservation to handover.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="bg-[#F0E6D2] py-20 sm:py-32">
        <div className="max-w-3xl mx-auto px-5 sm:px-8">
          <Reveal className="mb-10 sm:mb-14">
            <p className="text-[#A8814A] text-xs font-semibold uppercase tracking-[0.3em] mb-4">Common questions</p>
            <h2 className="text-[#06232E] text-3xl sm:text-5xl font-bold leading-tight">Palm Jebel Ali, answered.</h2>
          </Reveal>
          <FaqAccordion faqs={FAQS} variant="card" emitJsonLd={false} />
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="relative min-h-[70vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element -- external S3 CDN */}
          <img src={POOL_IMG} alt="Resort pool at Palm Jebel Ali at dusk" className="w-full h-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-[#06232E]/70" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-5 sm:px-8 text-center">
          <Reveal>
            <h2 className="text-white text-3xl sm:text-6xl font-bold leading-tight mb-6">
              The second palm won&apos;t stay launch-priced for long.
            </h2>
            <p className="text-white/75 text-base sm:text-lg mb-10 max-w-xl mx-auto">
              Get the current release schedule, pricing by frond, and payment plan breakdowns, sent directly, no obligation.
            </p>
            <a
              href={waHref(WA_MESSAGE, PAGE_URL)}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative overflow-hidden inline-flex items-center gap-2 px-8 py-4 rounded-full text-sm font-bold uppercase tracking-wider text-[#06232E] transition-transform hover:scale-[1.03]"
              style={{ background: "linear-gradient(to right, #C9A26A, #A8814A)" }}
            >
              Request Palm Jebel Ali pricing <ArrowRight className="h-4 w-4" />
              <Shine />
            </a>
          </Reveal>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
