"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell, BellRing, Check, Loader2, Mail, ShieldCheck, TrendingUp, Building2, Sparkles } from "lucide-react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { useProjectSubscriptions } from "@/hooks/useProjectSubscriptions";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LOCAL_SUB_KEY = "binayah_project_subscriptions";

function addLocalSub(slug: string) {
  if (typeof window === "undefined") return;
  try {
    const list = JSON.parse(localStorage.getItem(LOCAL_SUB_KEY) || "[]") as string[];
    if (!list.includes(slug)) localStorage.setItem(LOCAL_SUB_KEY, JSON.stringify([...list, slug]));
  } catch { /* */ }
}

function dispatchSubUpdate() {
  queueMicrotask(() => window.dispatchEvent(new Event("subscriptions-update")));
}

interface Props {
  slug: string;
  projectName: string;
  projectImage?: string | null;
  prefillEmail?: string;
}

const BULLETS = [
  { Icon: TrendingUp, text: "Price changes & new launch phases" },
  { Icon: Building2, text: "Monthly construction progress photos" },
  { Icon: Sparkles, text: "New floor plans & unit availability" },
];

export function ProjectSubscribeBanner({ slug, projectName, projectImage, prefillEmail = "" }: Props) {
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
    setLoading(true);
    setError(null);
    try {
      const body: Record<string, unknown> = { slug, projectName, projectImage };
      if (!isAuthed) body.email = trimmed;
      const res = await fetch("/api/project-subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok && !data.ok) {
        setError(res.status === 429 ? "Too many requests — try again later." : "Could not subscribe. Please try again.");
        return;
      }
      setSubscribed(true);
      if (!isAuthed) addLocalSub(slug);
      dispatchSubUpdate();
    } catch { setError("Network error — please try again."); }
    finally { setLoading(false); }
  }, [loading, subscribed, email, isAuthed, slug, projectName, projectImage]);

  return (
    <section
      className="relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #061a11 0%, #0B3D2E 40%, #0e4f37 70%, #145C3F 100%)" }}
    >
      {/* Diagonal texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: "repeating-linear-gradient(45deg, rgba(255,255,255,0.018) 0px, rgba(255,255,255,0.018) 1px, transparent 1px, transparent 60px)" }}
      />
      {/* Gold glow top-right */}
      <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full pointer-events-none blur-3xl" style={{ background: "radial-gradient(circle, rgba(212,168,71,0.15), transparent 65%)" }} />
      {/* Green glow bottom-left */}
      <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full pointer-events-none blur-3xl" style={{ background: "radial-gradient(circle, rgba(26,122,90,0.25), transparent 65%)" }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">

          {/* Left — headline + bullets */}
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 mb-5">
              <Bell className="h-3.5 w-3.5" style={{ color: "#D4A847" }} />
              <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "#D4A847" }}>Stay Updated</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
              Never miss a move{" "}
              <br className="hidden sm:block" />
              <span style={{ color: "#D4A847" }}>on {projectName}</span>
            </h2>

            <p className="text-base text-white/50 leading-relaxed mb-8 max-w-lg mx-auto lg:mx-0">
              Get first-look access to price changes, launch phases, and construction milestones — before anyone else.
            </p>

            <ul className="space-y-3 max-w-sm mx-auto lg:mx-0">
              {BULLETS.map(({ Icon, text }) => (
                <li key={text} className="flex items-center gap-3 text-sm text-white/70">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(212,168,71,0.15)" }}>
                    <Icon className="h-3.5 w-3.5" style={{ color: "#D4A847" }} />
                  </div>
                  {text}
                </li>
              ))}
            </ul>
          </div>

          {/* Right — subscribe card */}
          <div className="w-full lg:w-[420px] flex-shrink-0">
            <div className="rounded-2xl p-[1.5px]" style={{ background: "linear-gradient(135deg, rgba(212,168,71,0.7) 0%, rgba(26,122,90,0.5) 50%, rgba(212,168,71,0.4) 100%)" }}>
              <div className="rounded-[14px] bg-[#061f12]/90 backdrop-blur-xl p-6 sm:p-8">
                <AnimatePresence mode="wait" initial={false}>
                  {subscribed ? (
                    <motion.div
                      key="done"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25 }}
                      className="py-6 text-center"
                    >
                      <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center mx-auto mb-4">
                        <BellRing className="h-7 w-7 text-emerald-400" />
                      </div>
                      <p className="text-lg font-bold text-white mb-1.5">You&apos;re in!</p>
                      <p className="text-sm text-white/50 leading-relaxed">
                        We&apos;ll notify {email || authEmail || "you"} whenever there&apos;s news on{" "}
                        <span className="font-semibold text-white/70">{projectName}</span>.
                      </p>
                      <div className="flex items-center justify-center gap-1.5 mt-4">
                        <Check className="h-4 w-4 text-emerald-400" strokeWidth={3} />
                        <span className="text-xs font-semibold text-emerald-400">Subscribed</span>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="form"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25 }}
                      onSubmit={submit}
                      className="space-y-4"
                    >
                      <div>
                        <p className="text-lg font-bold text-white mb-1">Get project updates</p>
                        <p className="text-sm text-white/45">Price alerts, launch news and more — directly to your inbox.</p>
                      </div>

                      {!isAuthed && (
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 pointer-events-none" />
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => { setEmail(e.target.value); if (error) setError(null); }}
                            placeholder="your@email.com"
                            className="w-full h-12 pl-10 pr-4 rounded-xl bg-white/8 border border-white/15 text-sm text-white placeholder:text-white/30 focus:ring-2 focus:ring-[#D4A847]/40 focus:border-[#D4A847]/50 outline-none transition-all"
                          />
                        </div>
                      )}

                      {error && <p className="text-xs font-semibold text-red-400">{error}</p>}

                      <button
                        type="submit"
                        disabled={loading || (!isAuthed && !EMAIL_RE.test(email.trim()))}
                        className="w-full h-12 rounded-xl text-white font-bold text-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                        style={{ background: "linear-gradient(to right, #D4A847, #B8922F)", boxShadow: "0 6px 20px rgba(212,168,71,0.3)" }}
                      >
                        {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Subscribing…</> : <><Bell className="h-4 w-4" /> Subscribe for Updates</>}
                      </button>

                      <div className="flex items-center gap-1.5 text-[11px] text-white/30">
                        <ShieldCheck className="h-3.5 w-3.5 flex-shrink-0" />
                        <span>Only emails about {projectName}. Unsubscribe anytime.</span>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
