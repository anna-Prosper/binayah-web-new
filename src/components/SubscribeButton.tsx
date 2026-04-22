"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Bell, BellRing, X, Check, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useProjectSubscriptions } from "@/hooks/useProjectSubscriptions";
import { useTranslations } from "next-intl";

const SUB_KEY = "binayah_project_subscriptions";
const LOCAL_NOTIF_KEY = "binayah_notifications";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Read/write the anon localStorage subscription set. */
function readLocalSubs(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    return new Set(JSON.parse(localStorage.getItem(SUB_KEY) || "[]") as string[]);
  } catch {
    return new Set();
  }
}

function writeLocalSubs(set: Set<string>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(SUB_KEY, JSON.stringify(Array.from(set)));
}

/** Push a notification into the anon localStorage list used by NotificationsBell. */
function pushLocalNotification({
  slug,
  projectName,
  projectImage,
}: {
  slug: string;
  projectName: string;
  projectImage?: string | null;
}) {
  if (typeof window === "undefined") return;
  try {
    const items = JSON.parse(localStorage.getItem(LOCAL_NOTIF_KEY) || "[]");
    // De-duplicate by slug + type so re-subscribing doesn't stack entries
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


export interface SubscribeButtonProps {
  slug: string;
  projectName: string;
  projectImage?: string;
  /** hero — glass style on dark bg; cta — gold gradient; inline — light/card bg */
  variant?: "hero" | "cta" | "inline";
  /** If provided, pre-fills the email capture for anon users */
  prefillEmail?: string;
}

export function SubscribeButton({
  slug,
  projectName,
  projectImage,
  variant = "hero",
  prefillEmail,
}: SubscribeButtonProps) {
  const { data: session, status } = useSession();
  const isAuthed = status === "authenticated" && !!session?.user?.email;
  const t = useTranslations("subscribe");

  // Shared subscription state — module-level dedup ensures this runs once
  // even when multiple SubscribeButton instances exist on the same page.
  const { subscribedSlugs, refresh: refreshSubs, isPending } = useProjectSubscriptions();

  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPopover, setShowPopover] = useState(false);
  const [popoverEmail, setPopoverEmail] = useState(prefillEmail || "");
  const [toast, setToast] = useState<string | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // ── Initialise subscribed state from shared hook ────────────────────────
  useEffect(() => {
    setSubscribed(subscribedSlugs.includes(slug));
  }, [slug, subscribedSlugs]);

  // Update popoverEmail when prefill changes (e.g., form just submitted)
  useEffect(() => {
    if (prefillEmail) setPopoverEmail(prefillEmail);
  }, [prefillEmail]);

  // Close popover on outside click
  useEffect(() => {
    if (!showPopover) return;
    const handler = (e: MouseEvent | TouchEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setShowPopover(false);
      }
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [showPopover]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  }, []);

  // ── Subscribe (authed) ──────────────────────────────────────────────────
  const subscribeAuthed = useCallback(async () => {
    setLoading(true);
    setSubscribed(true); // optimistic
    try {
      const res = await fetch("/api/project-subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, projectName, projectImage }),
      });
      const data = await res.json();
      if (!res.ok && !data.ok) {
        setSubscribed(false);
        showToast("Could not subscribe — please try again.");
      } else {
        if (data.alreadySubscribed) {
          showToast(t("toasts.alreadySubscribed"));
        } else {
          showToast(t("toasts.subscribedSuccess"));
        }
        refreshSubs();
      }
    } catch {
      setSubscribed(false);
      showToast(t("toasts.networkError"));
    } finally {
      setLoading(false);
    }
  }, [slug, projectName, projectImage, showToast, t]);

  // ── Unsubscribe (authed) ────────────────────────────────────────────────
  const unsubscribeAuthed = useCallback(async () => {
    setLoading(true);
    setSubscribed(false); // optimistic
    try {
      await fetch("/api/project-subscriptions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      refreshSubs();
    } catch {
      setSubscribed(true); // revert
      showToast(t("toasts.networkError"));
    } finally {
      setLoading(false);
    }
  }, [slug, showToast, refreshSubs, t]);

  // ── Subscribe (anon with email) ─────────────────────────────────────────
  const subscribeAnon = useCallback(
    async (email: string) => {
      setLoading(true);
      try {
        const res = await fetch("/api/project-subscriptions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug, projectName, projectImage, email }),
        });
        const data = await res.json();
        if (!res.ok && !data.ok) {
          if (res.status === 429) {
            showToast(t("toasts.tooManyRequests"));
          } else {
            showToast(t("toasts.subscribeError"));
          }
        } else {
          // Persist in localStorage so button stays gold on revisit
          const subs = readLocalSubs();
          subs.add(slug);
          writeLocalSubs(subs);
          setSubscribed(true);
          if (data.alreadySubscribed) {
            showToast(t("toasts.alreadySubscribedAnon"));
          } else {
            showToast(t("toasts.subscribedSuccess"));
            // Write a notification into localStorage so the anon bell lights up
            pushLocalNotification({ slug, projectName, projectImage });
          }
          setShowPopover(false);
          refreshSubs();
        }
      } catch {
        showToast(t("toasts.networkError"));
      } finally {
        setLoading(false);
      }
    },
    [slug, projectName, projectImage, showToast, t]
  );

  const handleClick = () => {
    if (loading) return;

    if (subscribed && isAuthed) {
      unsubscribeAuthed();
      return;
    }
    if (subscribed && !isAuthed) {
      // Anon: already subscribed (localStorage) — just show message
      showToast(t("toasts.alreadySubscribedAnon"));
      return;
    }
    if (isAuthed) {
      subscribeAuthed();
      return;
    }
    // Anon: show email capture popover
    setShowPopover(true);
  };

  // ── Style variants ──────────────────────────────────────────────────────
  const base =
    "flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-xl border transition-all";

  const heroClasses = subscribed
    ? "bg-accent/90 text-white border-accent/60 backdrop-blur-sm shadow-lg"
    : "bg-white/10 text-white border-white/25 backdrop-blur-sm hover:bg-white/20 hover:border-white/40";

  const inlineClasses = subscribed
    ? "bg-accent/10 text-accent border-accent/30"
    : "bg-card text-foreground border-border hover:border-accent/30 hover:text-accent";

  const buttonClass =
    variant === "hero"
      ? `${base} ${heroClasses}`
      : variant === "inline"
      ? `${base} ${inlineClasses}`
      : ""; // "cta" uses inline style

  const ctaStyle =
    variant === "cta"
      ? {
          background: subscribed
            ? "linear-gradient(to right, #1A7A5A, #0B3D2E)"
            : "linear-gradient(to right, #D4A847, #B8922F)",
          boxShadow: "0 4px 15px rgba(212,168,71,0.3)",
        }
      : undefined;

  const ctaBaseClass =
    variant === "cta"
      ? "flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:shadow-lg hover:-translate-y-0.5 whitespace-nowrap"
      : "";

  const Icon = subscribed ? BellRing : Bell;

  return (
    <div className="relative">
      {/* Toast */}
      {toast && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-foreground text-background text-xs font-medium px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap z-50 animate-in fade-in zoom-in-95 duration-150">
          {toast}
        </div>
      )}

      {/* Main button */}
      <button
        onClick={handleClick}
        aria-label={subscribed ? t("unsubscribeAria") : t("subscribeAria")}
        disabled={loading || isPending(slug)}
        className={variant === "cta" ? ctaBaseClass : buttonClass}
        style={ctaStyle}
      >
        {loading || isPending(slug) ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Icon className={`h-3.5 w-3.5 ${subscribed ? "fill-current" : ""}`} />
        )}
        {subscribed ? t("subscribedLabel") : t("subscribe")}
      </button>

      {/* Anon email-capture popover */}
      {showPopover && !isAuthed && (
        <div
          ref={popoverRef}
          className="absolute left-0 top-full mt-2 z-50 bg-card border border-border rounded-xl shadow-2xl p-4 w-72 animate-in fade-in zoom-in-95 duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-foreground">{t("popoverTitle")}</p>
            <button
              onClick={() => setShowPopover(false)}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label={t("close")}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="text-[11px] text-muted-foreground mb-3 leading-relaxed">
            {t("popoverBody")}{" "}
            <span className="font-semibold text-foreground">{projectName}</span>.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (EMAIL_RE.test(popoverEmail)) subscribeAnon(popoverEmail);
            }}
            className="space-y-2"
          >
            <input
              type="email"
              required
              value={popoverEmail}
              onChange={(e) => setPopoverEmail(e.target.value)}
              placeholder={t("emailPlaceholder")}
              className="w-full px-3 py-2.5 border border-border rounded-xl bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
              autoFocus
            />
            <button
              type="submit"
              disabled={loading || !EMAIL_RE.test(popoverEmail)}
              className="w-full py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(to right, #D4A847, #B8922F)" }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Confirming…
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Check className="h-4 w-4" /> {t("confirm")}
                </span>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
