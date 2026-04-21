"use client";

/**
 * useProjectSubscriptions
 *
 * Fetches the list of project slugs that the current authenticated user has
 * subscribed to. Uses a module-level promise cache so multiple component
 * instances on the same page share a single in-flight request.
 *
 * For anonymous users the hook reads from the "binayah_project_subscriptions"
 * localStorage key instead.
 */

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

const LOCAL_SUB_KEY = "binayah_project_subscriptions";

// Module-level dedup cache: one pending promise per session-state
let cachedPromise: Promise<string[]> | null = null;
let cachedForAuthed: boolean | null = null;

function invalidateCache() {
  cachedPromise = null;
  cachedForAuthed = null;
}

function readLocalSubs(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(LOCAL_SUB_KEY) || "[]") as string[];
  } catch {
    return [];
  }
}

export interface UseProjectSubscriptionsResult {
  /** All slugs the user is subscribed to */
  subscribedSlugs: string[];
  /** True while the initial fetch is in progress */
  loading: boolean;
  /** Call after a subscribe/unsubscribe to force a refresh */
  refresh: () => void;
}

export function useProjectSubscriptions(): UseProjectSubscriptionsResult {
  const { data: session, status } = useSession();
  const isAuthed = status === "authenticated" && !!session?.user?.id;

  const [subscribedSlugs, setSubscribedSlugs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (status === "loading") return;

    if (isAuthed) {
      // Reuse the in-flight promise if the session state hasn't changed
      if (cachedForAuthed !== isAuthed || cachedPromise === null) {
        invalidateCache();
        cachedForAuthed = isAuthed;
        cachedPromise = fetch("/api/project-subscriptions")
          .then((r) => r.json())
          .then((data: { slugs?: string[] }) => data.slugs ?? [])
          .catch((): string[] => readLocalSubs());
      }
      const slugs = await cachedPromise;
      setSubscribedSlugs(slugs);
    } else {
      setSubscribedSlugs(readLocalSubs());
    }

    setLoading(false);
  }, [isAuthed, status]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  // Listen for subscribe/unsubscribe events dispatched by SubscribeButton
  useEffect(() => {
    const handler = () => {
      invalidateCache();
      setLoading(true);
      load();
    };
    window.addEventListener("subscriptions-update", handler);
    return () => window.removeEventListener("subscriptions-update", handler);
  }, [load]);

  const refresh = useCallback(() => {
    invalidateCache();
    setLoading(true);
    load();
  }, [load]);

  return { subscribedSlugs, loading, refresh };
}
