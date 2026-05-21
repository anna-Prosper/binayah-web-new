"use client";

import { useEffect, useState, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  /** Fallback timeout in ms if requestIdleCallback is unavailable or never fires. */
  fallbackTimeout?: number;
}

// Mounts children after the browser is idle — i.e. after LCP, hydration, and
// initial interactive work have settled. Use for non-critical floating widgets
// (chat bubble, cookie banner, scroll-to-top) that shouldn't compete with the
// initial paint for main-thread time.
export default function DeferUntilIdle({ children, fallbackTimeout = 2000 }: Props) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (show) return;
    const w = window as typeof window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
    };
    if (typeof w.requestIdleCallback === "function") {
      const id = w.requestIdleCallback(() => setShow(true), { timeout: fallbackTimeout });
      return () => {
        if ("cancelIdleCallback" in window) {
          (window as Window & { cancelIdleCallback: (id: number) => void }).cancelIdleCallback(id);
        }
      };
    }
    const t = setTimeout(() => setShow(true), fallbackTimeout);
    return () => clearTimeout(t);
  }, [show, fallbackTimeout]);

  return show ? <>{children}</> : null;
}
