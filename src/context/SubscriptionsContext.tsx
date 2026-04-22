"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";

const LOCAL_SUB_KEY = "binayah_project_subscriptions";
const LOCAL_NOTIF_KEY = "binayah_notifications";

export interface UseProjectSubscriptionsResult {
  /** All slugs the user is subscribed to */
  subscribedSlugs: string[];
  /** True while the initial fetch is in progress */
  loading: boolean;
  /** Call after a subscribe/unsubscribe to force a refresh */
  refresh: () => void;
  /** Subscribe to a project (optimistic + rollback + toast on error) */
  subscribe: (slug: string, opts: { projectName: string; projectImage?: string | null; email?: string }) => Promise<void>;
  /** Unsubscribe from a project (optimistic + rollback + toast on error) */
  unsubscribe: (slug: string) => Promise<void>;
  /** True while a subscribe/unsubscribe is in-flight for that slug */
  isPending: (slug: string) => boolean;
}

const SubscriptionsContext = createContext<UseProjectSubscriptionsResult | null>(null);

function readLocalSubs(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(LOCAL_SUB_KEY) || "[]") as string[];
  } catch {
    return [];
  }
}

function writeLocalSubs(slugs: string[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_SUB_KEY, JSON.stringify(slugs));
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

export function SubscriptionsProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const isAuthed = status === "authenticated" && !!session?.user?.id;

  const [subscribedSlugs, setSubscribedSlugs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    if (status === "loading") return;

    if (isAuthed) {
      try {
        const r = await fetch("/api/project-subscriptions");
        const data: { slugs?: string[] } = r.ok ? await r.json() : {};
        setSubscribedSlugs(data.slugs ?? []);
      } catch {
        setSubscribedSlugs(readLocalSubs());
      }
    } else {
      setSubscribedSlugs(readLocalSubs());
    }

    setLoading(false);
  }, [isAuthed, status]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  const refresh = useCallback(() => {
    setLoading(true);
    load();
  }, [load]);

  const subscribe = useCallback(async (
    slug: string,
    opts: { projectName: string; projectImage?: string | null; email?: string }
  ) => {
    const { projectName, projectImage, email } = opts;
    const prevSlugs = subscribedSlugs;
    // Optimistic update
    if (!prevSlugs.includes(slug)) {
      setSubscribedSlugs([...prevSlugs, slug]);
    }
    setPending((s) => { const n = new Set(s); n.add(slug); return n; });

    try {
      const body: Record<string, unknown> = { slug, projectName, projectImage };
      if (email) body.email = email;

      const res = await fetch("/api/project-subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        // alreadySubscribed is not an error
        if (!(data as { ok?: boolean }).ok) {
          throw new Error(`HTTP ${res.status}`);
        }
      }

      // For anon subscriptions, persist in localStorage
      if (!isAuthed) {
        const localSubs = readLocalSubs();
        if (!localSubs.includes(slug)) {
          writeLocalSubs([...localSubs, slug]);
        }
        pushLocalNotification({ slug, projectName, projectImage });
      }
    } catch {
      setSubscribedSlugs(prevSlugs);
      toast({ title: "Couldn't subscribe", description: "Please try again.", variant: "destructive" });
    } finally {
      setPending((s) => { const n = new Set(s); n.delete(slug); return n; });
    }
  }, [subscribedSlugs, isAuthed, toast]);

  const unsubscribe = useCallback(async (slug: string) => {
    const prevSlugs = subscribedSlugs;
    // Optimistic update
    setSubscribedSlugs(prevSlugs.filter((s) => s !== slug));
    setPending((s) => { const n = new Set(s); n.add(slug); return n; });

    try {
      const res = await fetch("/api/project-subscriptions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      // For anon, also update localStorage
      if (!isAuthed) {
        const localSubs = readLocalSubs();
        writeLocalSubs(localSubs.filter((s) => s !== slug));
      }
    } catch {
      setSubscribedSlugs(prevSlugs);
      toast({ title: "Couldn't unsubscribe", description: "Please try again.", variant: "destructive" });
    } finally {
      setPending((s) => { const n = new Set(s); n.delete(slug); return n; });
    }
  }, [subscribedSlugs, isAuthed, toast]);

  const value: UseProjectSubscriptionsResult = {
    subscribedSlugs,
    loading,
    refresh,
    subscribe,
    unsubscribe,
    isPending: (slug: string) => pending.has(slug),
  };

  return (
    <SubscriptionsContext.Provider value={value}>
      {children}
    </SubscriptionsContext.Provider>
  );
}

export function useProjectSubscriptions(): UseProjectSubscriptionsResult {
  const ctx = useContext(SubscriptionsContext);
  if (!ctx) throw new Error("useProjectSubscriptions must be used within SubscriptionsProvider");
  return ctx;
}
