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
  // Glassy on the dark hero, inked on light sections. The gold hairline at the
  // top of each cell ties the timer to the offer badge without shouting.
  const boxBg = isLight
    ? "linear-gradient(180deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.07) 100%)"
    : "linear-gradient(180deg, rgba(11,61,46,0.07) 0%, rgba(11,61,46,0.03) 100%)";
  const boxBorder = isLight ? "rgba(255,255,255,0.20)" : "rgba(11,61,46,0.12)";
  const numColor = isLight ? "#FFFFFF" : "#0B3D2E";
  const labelColor = isLight ? "rgba(255,255,255,0.66)" : "rgba(11,61,46,0.58)";

  // Pre-hydration and invalid dates render a stable skeleton of the same size,
  // so the surrounding layout doesn't shift when the timer starts.
  const cell = (v: string, l: string, key: string) => (
    <div
      key={key}
      className="relative flex min-w-[74px] flex-col items-center overflow-hidden rounded-xl px-3 py-3 backdrop-blur-sm"
      style={{ background: boxBg, border: `1px solid ${boxBorder}` }}
    >
      <span
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(212,168,71,0.85), transparent)" }}
      />
      <span
        className="text-[28px] font-extrabold tabular-nums leading-none tracking-tight"
        style={{ color: numColor }}
      >
        {v}
      </span>
      <span className="mt-1.5 text-[9px] font-bold uppercase tracking-[0.16em]" style={{ color: labelColor }}>
        {l}
      </span>
    </div>
  );

  if (left === null) {
    return (
      <div className="flex gap-2.5" aria-hidden="true">
        {["Days", "Hours", "Mins", "Secs"].map((l) => cell("--", l, l))}
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
      {cells.map(([v, l]) => cell(v, l, l))}
    </div>
  );
}
