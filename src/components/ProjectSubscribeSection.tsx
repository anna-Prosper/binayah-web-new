"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell, BellRing, BellOff, Check, Loader2, TrendingUp, Building2, Sparkles } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useProjectSubscriptions } from "@/hooks/useProjectSubscriptions";

const LOCAL_SUB_KEY = "binayah_project_subscriptions";
const LOCAL_NOTIF_KEY = "binayah_notifications";

function addLocalSub(slug: string) {
  if (typeof window === "undefined") return;
  try {
    const list = JSON.parse(localStorage.getItem(LOCAL_SUB_KEY) || "[]") as string[];
    if (!list.includes(slug)) localStorage.setItem(LOCAL_SUB_KEY, JSON.stringify([...list, slug]));
  } catch { /* */ }
}

function removeLocalSub(slug: string) {
  if (typeof window === "undefined") return;
  try {
    const list = JSON.parse(localStorage.getItem(LOCAL_SUB_KEY) || "[]") as string[];
    localStorage.setItem(LOCAL_SUB_KEY, JSON.stringify(list.filter((s) => s !== slug)));
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
      body: "You'll be first to hear about price changes, new floor plans, and construction milestones.",
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
  { Icon: TrendingUp, label: "Price alerts" },
  { Icon: Building2, label: "Construction" },
  { Icon: Sparkles, label: "New units" },
];

export function ProjectSubscribeSection({ slug, projectName, projectImage }: ProjectSubscribeSectionProps) {
  const { data: session, status } = useSession();
  const isAuthed = status === "authenticated" && !!session?.user?.email;
  const router = useRouter();
  const { subscribedSlugs } = useProjectSubscriptions();

  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { setSubscribed(subscribedSlugs.includes(slug)); }, [slug, subscribedSlugs]);

  const handleClick = useCallback(async () => {
    if (loading) return;

    if (!isAuthed) {
      router.push(`/signin?callbackUrl=/project/${slug}`);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      if (subscribed) {
        const res = await fetch("/api/project-subscriptions", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug }),
        });
        if (!res.ok) { setError("Could not unsubscribe."); return; }
        setSubscribed(false);
        removeLocalSub(slug);
        dispatchSubUpdate();
      } else {
        const res = await fetch("/api/project-subscriptions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug, projectName, projectImage }),
        });
        const data = await res.json();
        if (!res.ok && !data.ok) {
          setError(res.status === 429 ? "Too many requests." : "Could not subscribe.");
          return;
        }
        setSubscribed(true);
        addLocalSub(slug);
        if (!data.alreadySubscribed) pushLocalNotification({ slug, projectName, projectImage });
        dispatchSubUpdate();
      }
    } catch { setError("Network error."); }
    finally { setLoading(false); }
  }, [subscribed, loading, isAuthed, slug, projectName, projectImage, router]);

  return (
    <div
      className="rounded-2xl p-[1px]"
      style={{ background: "linear-gradient(135deg, rgba(212,168,71,0.55) 0%, rgba(212,168,71,0.1) 50%, rgba(26,122,90,0.4) 100%)" }}
    >
      <section
        aria-labelledby={`subscribe-${slug}-heading`}
        className="relative rounded-[15px] overflow-hidden px-5 py-5"
        style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
      >
        {/* Texture */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "repeating-linear-gradient(45deg, rgba(0,0,0,0.06) 0px, rgba(0,0,0,0.06) 1px, transparent 1px, transparent 44px)" }}
        />
        {/* Gold glow */}
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full pointer-events-none blur-2xl" style={{ background: "radial-gradient(circle, rgba(212,168,71,0.2), transparent 65%)" }} />

        <div className="relative flex items-center gap-4">
          {/* Bell icon */}
          <div
            className="relative flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
            style={{ background: "rgba(212,168,71,0.18)", border: "1px solid rgba(212,168,71,0.4)", boxShadow: "0 4px 16px rgba(212,168,71,0.15)" }}
          >
            {subscribed
              ? <BellRing className="h-5 w-5" style={{ color: "#D4A847" }} />
              : <Bell className="h-5 w-5" style={{ color: "#D4A847" }} />
            }
            {!subscribed && (
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-[#0B3D2E] animate-pulse" style={{ background: "#D4A847" }} />
            )}
          </div>

          {/* Text block */}
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] mb-1" style={{ color: "#D4A847" }}>Stay Updated</p>
            <p id={`subscribe-${slug}-heading`} className="text-sm font-bold text-white leading-snug truncate">
              {projectName}
            </p>
            {/* Benefit chips */}
            <div className="flex items-center gap-2 mt-2.5 flex-wrap">
              {BENEFITS.map(({ Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium"
                  style={{ background: "rgba(212,168,71,0.12)", border: "1px solid rgba(212,168,71,0.2)", color: "rgba(255,255,255,0.65)" }}
                >
                  <Icon className="h-3 w-3 flex-shrink-0" style={{ color: "#D4A847" }} />
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* CTA */}
          <AnimatePresence mode="wait" initial={false}>
            {subscribed ? (
              <motion.button
                key="done"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={handleClick}
                disabled={loading}
                title="Click to unsubscribe"
                className="group flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200 disabled:opacity-50"
                style={{ background: "rgba(212,168,71,0.12)", border: "1px solid rgba(212,168,71,0.3)" }}
              >
                {loading
                  ? <Loader2 className="h-4 w-4 animate-spin" style={{ color: "#D4A847" }} />
                  : <>
                      <span className="group-hover:hidden flex items-center gap-2">
                        <Check className="h-4 w-4" style={{ color: "#D4A847" }} strokeWidth={3} />
                        <span className="text-sm font-bold" style={{ color: "#D4A847" }}>Subscribed</span>
                      </span>
                      <span className="hidden group-hover:flex items-center gap-2">
                        <BellOff className="h-4 w-4 text-red-400" />
                        <span className="text-sm font-bold text-red-400">Unsubscribe</span>
                      </span>
                    </>
                }
              </motion.button>
            ) : (
              <motion.button
                key="cta"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={handleClick}
                disabled={loading}
                className="flex-shrink-0 flex items-center gap-2 h-11 px-5 rounded-xl font-bold text-sm text-white transition-all duration-200 hover:scale-[1.03] hover:opacity-95 active:scale-[0.97] disabled:opacity-50 whitespace-nowrap"
                style={{ background: "linear-gradient(to right, #D4A847, #B8922F)", boxShadow: "0 4px 20px rgba(212,168,71,0.45)" }}
              >
                {loading
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <><Bell className="h-4 w-4" />Subscribe</>
                }
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {error && <p className="relative mt-2 text-[11px] font-semibold text-red-400 text-right">{error}</p>}
      </section>
    </div>
  );
}
