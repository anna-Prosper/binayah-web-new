"use client";

/* eslint-disable i18next/no-literal-string -- English-only offer pages */

import { useEffect, useState } from "react";

interface Props {
  /** ISO 8601 deadline with an explicit offset (see lib/offers.ts). */
  deadline: string;
  /** Rendered once the deadline has passed. */
  expiredLabel?: string;
  /** "light" sits on the dark hero; "dark" sits on a light section. */
  tone?: "light" | "dark";
}

function parts(msLeft: number) {
  const s = Math.max(0, Math.floor(msLeft / 1000));
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

export default function OfferCountdown({ deadline, expiredLabel = "This offer has closed", tone = "light" }: Props) {
  const target = new Date(deadline).getTime();

  // Starts null so server and first client render agree — computing the
  // remaining time during render would produce a hydration mismatch, since the
  // server's "now" is always older than the browser's.
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!Number.isFinite(target)) return;
    const tick = () => setLeft(target - Date.now());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  const isLight = tone === "light";
  const boxBg = isLight ? "rgba(255,255,255,0.12)" : "rgba(11,61,46,0.06)";
  const boxBorder = isLight ? "rgba(255,255,255,0.22)" : "rgba(11,61,46,0.14)";
  const numColor = isLight ? "#FFFFFF" : "#0B3D2E";
  const labelColor = isLight ? "rgba(255,255,255,0.72)" : "rgba(11,61,46,0.62)";

  // Pre-hydration and invalid dates render a stable skeleton of the same size,
  // so the surrounding layout doesn't shift when the timer starts.
  if (left === null) {
    return (
      <div className="flex gap-2.5" aria-hidden="true">
        {["Days", "Hours", "Mins", "Secs"].map((l) => (
          <div
            key={l}
            className="flex min-w-[68px] flex-col items-center rounded-xl px-3 py-2.5"
            style={{ background: boxBg, border: `1px solid ${boxBorder}` }}
          >
            <span className="text-2xl font-extrabold tabular-nums leading-none" style={{ color: numColor }}>
              --
            </span>
            <span className="mt-1 text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: labelColor }}>
              {l}
            </span>
          </div>
        ))}
      </div>
    );
  }

  if (left <= 0) {
    return (
      <div
        className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold"
        style={{
          background: isLight ? "rgba(255,255,255,0.14)" : "rgba(11,61,46,0.08)",
          color: isLight ? "#FFFFFF" : "#0B3D2E",
        }}
      >
        {expiredLabel}
      </div>
    );
  }

  const { days, hours, minutes, seconds } = parts(left);
  const cells: [string, string][] = [
    [String(days), "Days"],
    [pad(hours), "Hours"],
    [pad(minutes), "Mins"],
    [pad(seconds), "Secs"],
  ];

  return (
    <div
      className="flex gap-2.5"
      role="timer"
      aria-live="off"
      aria-label={`Offer closes in ${days} days, ${hours} hours, ${minutes} minutes`}
    >
      {cells.map(([v, l]) => (
        <div
          key={l}
          className="flex min-w-[68px] flex-col items-center rounded-xl px-3 py-2.5"
          style={{ background: boxBg, border: `1px solid ${boxBorder}` }}
        >
          <span className="text-2xl font-extrabold tabular-nums leading-none" style={{ color: numColor }}>
            {v}
          </span>
          <span className="mt-1 text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: labelColor }}>
            {l}
          </span>
        </div>
      ))}
    </div>
  );
}
