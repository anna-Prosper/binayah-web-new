"use client";

import { useEffect } from "react";

/**
 * Recovers from deploy-skew chunk errors. When a new build ships while a tab is
 * open, lazily-loaded (next/dynamic) chunks from the old build 404 and throw a
 * ChunkLoadError, leaving the user on a broken component. We catch that and do a
 * single hard reload to pull the current build. A sessionStorage timestamp guards
 * against reload loops (e.g. a chunk that is genuinely, persistently missing).
 */
const RELOAD_KEY = "binayah_chunk_reload_at";
const RELOAD_COOLDOWN_MS = 15_000;

function isChunkError(...candidates: Array<unknown>): boolean {
  return candidates.some((c) => {
    const s = typeof c === "string" ? c : "";
    return (
      /Loading (?:CSS )?chunk [\w-]+ failed/i.test(s) ||
      /ChunkLoadError/i.test(s) ||
      /importing a module script failed/i.test(s) ||
      /error loading dynamically imported module/i.test(s)
    );
  });
}

export default function ChunkReloadGuard() {
  useEffect(() => {
    const reloadOnce = () => {
      try {
        const last = Number(sessionStorage.getItem(RELOAD_KEY) || 0);
        if (Date.now() - last < RELOAD_COOLDOWN_MS) return; // already reloaded — don't loop
        sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
      } catch {
        /* sessionStorage unavailable — fall through to a single reload */
      }
      window.location.reload();
    };

    const onError = (e: ErrorEvent) => {
      const err = e.error as { name?: string; message?: string } | undefined;
      if (isChunkError(e.message, err?.name, err?.message)) reloadOnce();
    };
    const onRejection = (e: PromiseRejectionEvent) => {
      const r = e.reason as { name?: string; message?: string } | undefined;
      if (isChunkError(r?.name, r?.message)) reloadOnce();
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  return null;
}
