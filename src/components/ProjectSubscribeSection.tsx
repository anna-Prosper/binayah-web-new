"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell, BellRing, Check, Loader2, TrendingUp, Building2, Sparkles, Mail, ShieldCheck } from "lucide-react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { useProjectSubscriptions } from "@/hooks/useProjectSubscriptions";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LOCAL_SUB_KEY = "binayah_project_subscriptions";
const LOCAL_NOTIF_KEY = "binayah_notifications";

function addLocalSub(slug: string) {
  if (typeof window === "undefined") return;
  try {
    const list = JSON.parse(localStorage.getItem(LOCAL_SUB_KEY) || "[]") as string[];
    if (!list.includes(slug)) localStorage.setItem(LOCAL_SUB_KEY, JSON.stringify([...list, slug]));
  } catch { /* */ }
}

function pushLocalNotification({ slug, projectName, projectImage }: { slug: string; projectName: string; projectImage?: string | null }) {
  if (typeof window === "undefined") return;
  try {
    const items = JSON.parse(localStorage.getItem(LOCAL_NOTIF_KEY) || "[]");
    const filtered = items.filter((n: { slug?: string; type?: string }) => !(n.slug === slug && n.type === "subscribed"));
    filtered.unshift({
      id: `local-${slug}-${Date.now()}`,
      slug, projectName, projectImage: projectImage ?? null,
      type: "subscribed",
      title: `Subscribed to ${projectName}`,
      body: "You'll be first to hear about price changes, new floor plans, construction milestones, and launch events.",
      read: false, createdAt: new Date().toISOString(),
    });
    localStorage.setItem(LOCAL_NOTIF_KEY, JSON.stringify(filtered));
  } catch { /* */ }
}

function dispatchSubUpdate() {
  queueMicrotask(() => window.dispatchEvent(new Event("subscriptions-update")));
}

export interface ProjectSubscribeSectionProps {
  slug: string;
  projectName: string;
  projectImage?: string | null;
  prefillEmail?: string;
}

const BENEFITS = [
  { Icon: TrendingUp, label: "Price & launch alerts", sub: "First when new phases open or pricing changes" },
  { Icon: Building2, label: "Construction updates", sub: "Monthly progress photos & handover timeline" },
  { Icon: Sparkles, label: "New floor plans & units", sub: "Availability and layout releases as they drop" },
];

export function ProjectSubscribeSection({ slug, projectName, projectImage, prefillEmail = "" }: ProjectSubscribeSectionProps) {
  const { data: session, status } = useSession();
  const isAuthed = status === "authenticated" && !!session?.user?.email;
  const authEmail = session?.user?.email || "";
  const { subscribedSlugs } = useProjectSubscriptions();

  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState(prefillEmail || authEmail || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { setSubscribed(subscribedSlugs.includes(slug)); }, [slug, subscribedSlugs]);
  useEffect(() => { if (prefillEmail && !email) setEmail(prefillEmail); }, [prefillEmail, email]);
  useEffect(() => { if (authEmail && !email) setEmail(authEmail); }, [authEmail, email]);

  const submit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (loading || subscribed) return;
    const trimmed = email.trim();
    if (!isAuthed && !EMAIL_RE.test(trimmed)) { setError("Please enter a valid email address."); return; }
    setLoading(true); setError(null);
    try {
      const body: Record<string, unknown> = { slug, projectName, projectImage };
      if (!isAuthed) body.email = trimmed;
      const res = await fetch("/api/project-subscriptions", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok && !data.ok) {
        setError(res.status === 429 ? "Too many requests — try again later." : "Could not subscribe. Please try again.");
        return;
      }
      setSubscribed(true);
      if (!isAuthed) {
        addLocalSub(slug);
        if (!data.alreadySubscribed) pushLocalNotification({ slug, projectName, projectImage });
      }
      dispatchSubUpdate();
    } catch { setError("Network error — please try again."); }
    finally { setLoading(false); }
  }, [loading, subscribed, email, isAuthed, slug, projectName, projectImage]);

  return (
    /* Gold gradient border wrapper */
    <div
      className="rounded-2xl p-[1px]"
      style={{ background: "linear-gradient(135deg, rgba(212,168,71,0.6) 0%, rgba(212,168,71,0.15) 50%, rgba(26,122,90,0.4) 100%)" }}
    >
      <section
        aria-labelledby={`subscribe-${slug}-heading`}
        className="relative rounded-[15px] overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
      >
        {/* Diagonal texture */}
        <div
          className="absolute inset-0 pointer-events-none opacity-60"
          style={{ backgroundImage: "repeating-linear-gradient(45deg, rgba(0,0,0,0.08) 0px, rgba(0,0,0,0.08) 1px, transparent 1px, transparent 44px)" }}
        />
        {/* Subtle dark vignette so text stays readable against the lighter #1A7A5A end */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 100% 100%, transparent 40%, rgba(0,0,0,0.18) 100%)" }} />
        {/* Gold glow top-right */}
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full pointer-events-none blur-2xl" style={{ background: "radial-gradient(circle, rgba(212,168,71,0.25), transparent 65%)" }} />

        <div className="relative p-5">
          {/* ── Header ── */}
          <div className="flex items-center gap-3 mb-5">
            <div
              className="relative flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(212,168,71,0.18)", border: "1px solid rgba(212,168,71,0.35)" }}
            >
              {subscribed
                ? <BellRing className="h-[18px] w-[18px]" style={{ color: "#D4A847" }} />
                : <Bell className="h-[18px] w-[18px]" style={{ color: "#D4A847" }} />
              }
              {!subscribed && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-[2px] border-[#0B3D2E] animate-pulse" style={{ background: "#D4A847" }} />
              )}
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] leading-none mb-1" style={{ color: "#D4A847" }}>Stay Updated</p>
              <h3 id={`subscribe-${slug}-heading`} className="text-sm font-bold text-white leading-snug">
                First-look on <span style={{ color: "#D4A847" }}>{projectName}</span>
              </h3>
            </div>
          </div>

          {/* ── Benefits ── */}
          <div className="rounded-xl overflow-hidden mb-5" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
            {BENEFITS.map(({ Icon, label, sub }, i) => (
              <div
                key={label}
                className={`flex items-start gap-3 px-3.5 py-3 ${i < BENEFITS.length - 1 ? "border-b" : ""}`}
                style={i < BENEFITS.length - 1 ? { borderColor: "rgba(255,255,255,0.07)" } : undefined}
              >
                <Icon className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" style={{ color: "#D4A847" }} />
                <div>
                  <p className="text-xs font-semibold text-white/90 leading-none mb-0.5">{label}</p>
                  <p className="text-[11px] leading-snug" style={{ color: "rgba(255,255,255,0.38)" }}>{sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── Action ── */}
          <AnimatePresence mode="wait" initial={false}>
            {subscribed ? (
              <motion.div
                key="subscribed"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-3 rounded-xl px-4 py-3.5"
                style={{ background: "rgba(212,168,71,0.1)", border: "1px solid rgba(212,168,71,0.2)" }}
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(212,168,71,0.15)" }}>
                  <Check className="h-4 w-4" style={{ color: "#D4A847" }} strokeWidth={3} />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">You&apos;re subscribed</p>
                  <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                    We&apos;ll notify <span className="text-white/60 font-medium">{email || authEmail || "you"}</span> when there&apos;s news.
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onSubmit={submit}
                className="space-y-2.5"
              >
                {!isAuthed && (
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none" style={{ color: "rgba(255,255,255,0.3)" }} />
                    <input
                      type="email" required value={email}
                      onChange={(e) => { setEmail(e.target.value); if (error) setError(null); }}
                      placeholder="your@email.com"
                      aria-label="Email address"
                      className="w-full h-10 pl-9 pr-3 rounded-xl text-sm text-white placeholder:text-white/25 outline-none transition-colors"
                      style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.12)" }}
                      onFocus={e => (e.currentTarget.style.borderColor = "rgba(212,168,71,0.5)")}
                      onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)")}
                    />
                  </div>
                )}

                {error && <p className="text-[11px] font-semibold text-red-400">{error}</p>}

                <button
                  type="submit"
                  disabled={loading || (!isAuthed && !EMAIL_RE.test(email.trim()))}
                  className="w-full h-10 rounded-xl font-bold text-sm text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{ background: "linear-gradient(to right, #D4A847, #B8922F)", boxShadow: "0 4px 16px rgba(212,168,71,0.35)" }}
                >
                  {loading
                    ? <><Loader2 className="h-4 w-4 animate-spin" />Subscribing…</>
                    : <><Bell className="h-4 w-4" />Subscribe for Updates</>
                  }
                </button>

                <p className="flex items-center gap-1.5 text-[10px]" style={{ color: "rgba(255,255,255,0.25)" }}>
                  <ShieldCheck className="h-3 w-3 flex-shrink-0" />
                  Only news about {projectName}. Unsubscribe anytime.
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}
