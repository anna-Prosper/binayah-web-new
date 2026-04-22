"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";

const FAV_KEY = "binayah_favorites";

interface FavoritesContextValue {
  ids: string[];
  toggle: (id: string) => Promise<void>;
  clear: () => Promise<void>;
  has: (id: string) => boolean;
  isPending: (id: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const [ids, setIds] = useState<string[]>([]);
  const [pending, setPending] = useState<Set<string>>(new Set());
  const synced = useRef<string | null>(null);

  // Load: DB when authed, localStorage when not
  useEffect(() => {
    if (status === "loading") return;

    if (session?.user?.id) {
      // Skip if we already fetched for this user — prevents re-fetch on tab focus
      if (synced.current === session.user.id) return;

      // Authenticated — fetch from DB, merge localStorage, clear localStorage
      const merge = async () => {
        try {
          const res = await fetch("/api/favorites");
          const data = res.ok ? await res.json() : { ids: [] };
          const dbIds: string[] = data.ids ?? [];

          const local = (() => {
            try { return JSON.parse(localStorage.getItem(FAV_KEY) || "[]") as string[]; }
            catch { return []; }
          })();

          const merged = Array.from(new Set([...dbIds, ...local]));

          // Push any localStorage-only ids to DB
          const toSync = local.filter((id) => !dbIds.includes(id));
          await Promise.all(toSync.map((id) => fetch("/api/favorites", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) })));

          if (local.length > 0) localStorage.removeItem(FAV_KEY);
          setIds(merged);
          synced.current = session.user.id;
        } catch {
          /* fall back to localStorage */
          try {
            const stored = localStorage.getItem(FAV_KEY);
            if (stored) setIds(JSON.parse(stored));
          } catch { /* ignore */ }
        }
      };
      merge();
    } else {
      // Unauthenticated — use localStorage; reset sync so next login re-fetches
      synced.current = null;
      try {
        const stored = localStorage.getItem(FAV_KEY);
        if (stored) setIds(JSON.parse(stored));
      } catch { /* ignore */ }
    }
  }, [session?.user?.id, status]);

  const toggle = useCallback(async (id: string) => {
    if (session?.user?.id) {
      // Capture prev BEFORE optimistic update
      const prev = ids;
      const removing = prev.includes(id);
      const next = removing ? prev.filter((x) => x !== id) : [...prev, id];
      setIds(next);
      setPending((s) => { const n = new Set(s); n.add(id); return n; });
      try {
        const res = await fetch("/api/favorites", {
          method: removing ? "DELETE" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      } catch {
        setIds(prev);
        toast({ title: "Couldn't save favorite", description: "Please try again.", variant: "destructive" });
      } finally {
        setPending((s) => { const n = new Set(s); n.delete(id); return n; });
      }
    } else {
      // Anon path — capture prev state and localStorage
      const prev = ids;
      const prevLocal = typeof window !== "undefined" ? localStorage.getItem(FAV_KEY) : null;
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      setIds(next);
      setPending((s) => { const n = new Set(s); n.add(id); return n; });
      try {
        localStorage.setItem(FAV_KEY, JSON.stringify(next));
      } catch {
        // localStorage quota exceeded or unavailable
        setIds(prev);
        if (prevLocal !== null) {
          try { localStorage.setItem(FAV_KEY, prevLocal); } catch { /* ignore */ }
        }
        toast({ title: "Couldn't save favorite", description: "Please try again.", variant: "destructive" });
      } finally {
        setPending((s) => { const n = new Set(s); n.delete(id); return n; });
      }
    }
  }, [session?.user?.id, ids, toast]);

  const clear = useCallback(async () => {
    if (session?.user?.id) {
      const prev = ids;
      setIds([]);
      try {
        await Promise.all(prev.map((id) =>
          fetch("/api/favorites", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) })
        ));
      } catch {
        setIds(prev);
        toast({ title: "Couldn't clear favorites", description: "Please try again.", variant: "destructive" });
      }
    } else {
      setIds([]);
      localStorage.removeItem(FAV_KEY);
    }
  }, [session?.user?.id, ids, toast]);

  const value: FavoritesContextValue = {
    ids,
    toggle,
    clear,
    has: (id: string) => ids.includes(id),
    isPending: (id: string) => pending.has(id),
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites(): FavoritesContextValue {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
}
