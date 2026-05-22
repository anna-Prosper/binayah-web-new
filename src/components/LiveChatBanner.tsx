/* eslint-disable i18next/no-literal-string -- internal admin/dev-facing labels in live-chat session banner */
"use client";

import { useEffect, useState } from "react";

type LiveChatApi = {
  call: (cmd: string, arg?: unknown) => void;
  on?: (event: string, handler: (payload?: unknown) => void) => void;
  off?: (event: string, handler: (payload?: unknown) => void) => void;
  get?: (key: string) => unknown;
};

function getLc(): LiveChatApi | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as Window & { LiveChatWidget?: LiveChatApi }).LiveChatWidget;
}

// Inactivity rules for live chat sessions.
const HUMAN_IDLE_MS = 30 * 60 * 1000;
const HUMAN_WARNING_MS = 25 * 60 * 1000;

/**
 * Renders a fixed top-of-viewport banner with a Back-to-AI button + status +
 * inactivity warning whenever LiveChat is visibly open (maximized or
 * minimized). Mounted in the root layout so it works on every page,
 * independent of AIChatWidget's state.
 */
export default function LiveChatBanner() {
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [warning, setWarning] = useState(false);

  // Track LiveChat's visibility via its SDK event. Falls back to polling
  // on first mount so we catch the case where LiveChat is already open
  // when this component mounts (e.g. after navigation).
  useEffect(() => {
    let pollInterval: ReturnType<typeof setInterval> | null = null;
    let mounted = true;

    const sync = () => {
      const lc = getLc();
      if (!lc) return;
      try {
        const visibility = (lc.get?.("state") as { visibility?: string } | undefined)?.visibility;
        if (mounted) setOpen(visibility === "maximized" || visibility === "minimized");
      } catch {
        /* state may not be ready yet */
      }
    };

    const onVisibility = (payload?: unknown) => {
      const v = (payload as { visibility?: string })?.visibility;
      if (mounted) setOpen(v === "maximized" || v === "minimized");
    };

    const wireUp = () => {
      const lc = getLc();
      if (!lc?.on) return false;
      lc.on("visibility_changed", onVisibility);
      sync();
      return true;
    };

    if (!wireUp()) {
      pollInterval = setInterval(() => {
        if (wireUp()) {
          if (pollInterval) clearInterval(pollInterval);
        }
      }, 500);
      const stopPolling = setTimeout(() => {
        if (pollInterval) clearInterval(pollInterval);
      }, 15_000);
      return () => {
        clearTimeout(stopPolling);
        if (pollInterval) clearInterval(pollInterval);
        mounted = false;
        getLc()?.off?.("visibility_changed", onVisibility);
      };
    }

    return () => {
      mounted = false;
      getLc()?.off?.("visibility_changed", onVisibility);
    };
  }, []);

  // Toggle body class so the rest of our CSS knows LiveChat is open.
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.classList.toggle("livechat-visible", open);
    return () => {
      document.body.classList.remove("livechat-visible");
    };
  }, [open]);

  // 30-min inactivity timer while LiveChat is open. Warn at 25 min, close at 30.
  useEffect(() => {
    if (!open) {
      setWarning(false);
      return;
    }
    let warnTimer: ReturnType<typeof setTimeout> | null = null;
    let endTimer: ReturnType<typeof setTimeout> | null = null;
    const schedule = () => {
      if (warnTimer) clearTimeout(warnTimer);
      if (endTimer) clearTimeout(endTimer);
      setWarning(false);
      warnTimer = setTimeout(() => setWarning(true), HUMAN_WARNING_MS);
      endTimer = setTimeout(() => endChat(), HUMAN_IDLE_MS);
    };
    const bump = () => schedule();
    schedule();
    window.addEventListener("mousemove", bump);
    window.addEventListener("keydown", bump);
    window.addEventListener("touchstart", bump);
    return () => {
      if (warnTimer) clearTimeout(warnTimer);
      if (endTimer) clearTimeout(endTimer);
      window.removeEventListener("mousemove", bump);
      window.removeEventListener("keydown", bump);
      window.removeEventListener("touchstart", bump);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function endChat() {
    getLc()?.call?.("hide");
    setOpen(false);
    setConfirmOpen(false);
    setWarning(false);
  }

  if (!open) return null;

  return (
    <>
      {/* Top banner — full width, max z-index, sits above LiveChat. */}
      <div
        className="fixed top-0 left-0 right-0 text-white"
        style={{
          background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)",
          zIndex: 2147483647,
          boxShadow: "0 4px 24px rgba(0,0,0,0.25)",
        }}
        role="region"
        aria-label="Live chat session controls"
      >
        <div className="max-w-5xl mx-auto px-3 sm:px-5 py-2.5 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 transition-colors text-xs font-bold"
            aria-label="End live chat and return to AI"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Back to AI
          </button>
          <div className="flex-1 flex items-center justify-center gap-2 text-[12px] sm:text-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="hidden sm:inline font-semibold">Live agent</span>
            <span className="text-white/70">· connected via LiveChat</span>
          </div>
          <span className="w-[88px] hidden sm:block" />
        </div>
        {warning && (
          <div className="bg-amber-500 text-amber-950 px-3 sm:px-5 py-2 text-xs sm:text-sm flex items-center justify-center gap-3 flex-wrap">
            <span>⚠ Live chat will end in <strong>5 minutes</strong> due to inactivity.</span>
            <button
              type="button"
              onClick={() => {
                setWarning(false);
                window.dispatchEvent(new Event("mousemove"));
              }}
              className="font-bold underline hover:text-amber-900 whitespace-nowrap"
            >
              Keep chatting
            </button>
          </div>
        )}
      </div>

      {/* Confirmation modal */}
      {confirmOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center px-4"
          style={{ zIndex: 2147483647, background: "rgba(0,0,0,0.55)" }}
          onClick={() => setConfirmOpen(false)}
        >
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-bold text-gray-900 mb-2">End live chat?</h3>
            <p className="text-sm text-gray-600 mb-5">
              You&apos;re currently chatting with a live agent. Closing this will end the session.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100"
              >
                Stay in chat
              </button>
              <button
                type="button"
                onClick={endChat}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
                style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
              >
                End live chat
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
