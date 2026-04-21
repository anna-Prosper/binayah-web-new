"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell, BellRing, Check, Loader2, Sparkles, TrendingUp, Building2, Mail, ShieldCheck } from "lucide-react";
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
    if (!list.includes(slug)) {
      list.push(slug);
      localStorage.setItem(LOCAL_SUB_KEY, JSON.stringify(list));
    }
  } catch {
    // ignore
  }
}

function pushLocalNotification({ slug, projectName, projectImage }: { slug: string; projectName: string; projectImage?: string | null }) {
  if (typeof window === "undefined") return;
  try {
    const items = JSON.parse(localStorage.getItem(LOCAL_NOTIF_KEY) || "[]");
    const filtered = items.filter(
      (n: { slug?: string; type?: string }) => !(n.slug === slug && n.type === "subscribed")
    );
    filtered.unshift({
      id: `local-${slug}-${Date.now()}`,
      slug,
      projectName,
      projectImage: projectImage ?? null,
      type: "subscribed",
      title: `Subscribed to ${projectName}`,
      body: "You'll be first to hear about price changes, new floor plans, construction milestones, and launch events.",
      read: false,
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem(LOCAL_NOTIF_KEY, JSON.stringify(filtered));
  } catch {
    // ignore
  }
}

function dispatchSubUpdate() {
  queueMicrotask(() => window.dispatchEvent(new Event("subscriptions-update")));
}

export interface ProjectSubscribeSectionProps {
  slug: string;
  projectName: string;
  projectImage?: string | null;
  /** Optional pre-filled email (e.g. from the enquiry form) */
  prefillEmail?: string;
}

const BENEFITS = [
  {
    Icon: TrendingUp,
    title: "Price & launch alerts",
    body: "First to know when new phases launch or pricing changes.",
  },
  {
    Icon: Building2,
    title: "Construction milestones",
    body: "Monthly progress photos and handover updates.",
  },
  {
    Icon: Sparkles,
    title: "New floor plans",
    body: "Unit availability and new layout releases as they drop.",
  },
];

export function ProjectSubscribeSection({
  slug,
  projectName,
  projectImage,
  prefillEmail = "",
}: ProjectSubscribeSectionProps) {
  const { data: session, status } = useSession();
  const isAuthed = status === "authenticated" && !!session?.user?.email;
  const authEmail = session?.user?.email || "";

  const { subscribedSlugs } = useProjectSubscriptions();
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState(prefillEmail || authEmail || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSubscribed(subscribedSlugs.includes(slug));
  }, [slug, subscribedSlugs]);

  useEffect(() => {
    if (prefillEmail && !email) setEmail(prefillEmail);
  }, [prefillEmail, email]);

  useEffect(() => {
    if (authEmail && !email) setEmail(authEmail);
  }, [authEmail, email]);

  const submit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      if (loading || subscribed) return;

      const trimmed = email.trim();
      if (!isAuthed && !EMAIL_RE.test(trimmed)) {
        setError("Please enter a valid email address.");
        return;
      }

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
          if (res.status === 429) setError("Too many requests — please try again later.");
          else setError("Could not subscribe. Please try again.");
          return;
        }

        setSubscribed(true);
        if (!isAuthed) {
          addLocalSub(slug);
          if (!data.alreadySubscribed) {
            pushLocalNotification({ slug, projectName, projectImage });
          }
        }
        dispatchSubUpdate();
      } catch {
        setError("Network error — please try again.");
      } finally {
        setLoading(false);
      }
    },
    [loading, subscribed, email, isAuthed, slug, projectName, projectImage]
  );

  return (
    <section
      aria-labelledby={`subscribe-${slug}-heading`}
      className="relative rounded-2xl p-[1.5px] overflow-hidden"
      style={{
        background: "linear-gradient(135deg, rgba(11,61,46,0.9) 0%, rgba(26,122,90,0.7) 40%, rgba(212,168,71,0.85) 100%)",
      }}
    >
      <div className="relative rounded-[15px] overflow-hidden bg-card">
        {/* Decorative background layers */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(120% 90% at 0% 0%, rgba(11,61,46,0.08) 0%, transparent 55%), radial-gradient(100% 80% at 100% 100%, rgba(212,168,71,0.08) 0%, transparent 60%)",
          }}
        />
        <div
          className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-40 pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(212,168,71,0.25), transparent 70%)" }}
        />
        <div
          className="absolute -bottom-14 -left-12 w-48 h-48 rounded-full blur-3xl opacity-40 pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(11,61,46,0.25), transparent 70%)" }}
        />

        <div className="relative p-5 sm:p-8">
          {/* Header */}
          <div className="flex items-start gap-4 sm:gap-5">
            <div
              className="relative flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shadow-lg"
              style={{
                background: "linear-gradient(135deg, #0B3D2E 0%, #1A7A5A 100%)",
                boxShadow: "0 8px 24px rgba(11,61,46,0.25)",
              }}
            >
              {subscribed ? (
                <BellRing className="h-5.5 w-5.5 sm:h-6 sm:w-6 text-white" />
              ) : (
                <Bell className="h-5.5 w-5.5 sm:h-6 sm:w-6 text-white" />
              )}
              <span
                className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-card"
                style={{ background: "linear-gradient(135deg, #D4A847, #B8922F)" }}
              />
            </div>

            <div className="flex-1 min-w-0">
              <p
                className="text-[10px] sm:text-[11px] uppercase tracking-[0.22em] font-bold mb-1.5"
                style={{ color: "#B8922F" }}
              >
                Stay Updated
              </p>
              <h3
                id={`subscribe-${slug}-heading`}
                className="text-lg sm:text-2xl font-bold text-foreground leading-tight"
              >
                Get first-look updates on{" "}
                <span className="text-primary">{projectName}</span>
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 leading-relaxed">
                Price changes, new launches, construction milestones — delivered to your inbox and notifications.
              </p>
            </div>
          </div>

          {/* Benefits grid */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
            {BENEFITS.map(({ Icon, title, body }) => (
              <div
                key={title}
                className="flex sm:flex-col items-start gap-3 sm:gap-2.5 p-3 sm:p-4 rounded-xl bg-muted/30 border border-border/40"
              >
                <div
                  className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: "rgba(212,168,71,0.12)" }}
                >
                  <Icon className="h-4 w-4" style={{ color: "#B8922F" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-[13px] font-bold text-foreground leading-tight">
                    {title}
                  </p>
                  <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 leading-snug">
                    {body}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Action area */}
          <div className="mt-6">
            <AnimatePresence mode="wait" initial={false}>
              {subscribed ? (
                <motion.div
                  key="subscribed"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="flex items-center gap-3 p-4 rounded-xl border border-emerald-500/25 bg-emerald-500/5"
                >
                  <div className="w-9 h-9 rounded-full bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                    <Check className="h-4.5 w-4.5 text-emerald-600" strokeWidth={3} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground">You&apos;re subscribed.</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      We&apos;ll email{" "}
                      <span className="font-semibold text-foreground">{email || authEmail || "you"}</span>{" "}
                      whenever there&apos;s news on {projectName}.
                    </p>
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
                  className="space-y-3"
                >
                  <div className="flex flex-col sm:flex-row gap-2.5">
                    {!isAuthed && (
                      <div className="relative flex-1">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 pointer-events-none" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (error) setError(null);
                          }}
                          placeholder="your@email.com"
                          aria-label="Email address"
                          className="w-full h-12 pl-10 pr-4 rounded-xl bg-background border border-border/60 text-sm text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/25 focus:border-primary/60 outline-none transition-all"
                        />
                      </div>
                    )}
                    <button
                      type="submit"
                      disabled={loading || (!isAuthed && !EMAIL_RE.test(email.trim()))}
                      className={`${isAuthed ? "w-full" : "sm:w-auto"} h-12 px-6 rounded-xl text-white font-bold text-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 whitespace-nowrap`}
                      style={{
                        background: "linear-gradient(to right, #D4A847, #B8922F)",
                        boxShadow: "0 8px 24px rgba(212,168,71,0.28)",
                      }}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" /> Subscribing…
                        </>
                      ) : (
                        <>
                          <Bell className="h-4 w-4" /> Subscribe for Updates
                        </>
                      )}
                    </button>
                  </div>

                  {error && (
                    <p className="text-xs font-semibold text-red-600 flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-red-600" /> {error}
                    </p>
                  )}

                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>
                      We only email you about {projectName}. Unsubscribe anytime with one click.
                    </span>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
