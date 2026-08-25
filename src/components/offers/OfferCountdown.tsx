"use client";

import { useTranslations } from "next-intl";
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

export default function OfferCountdown({ deadline, expiredLabel, tone = "light" }: Props) {
  const t = useTranslations("offerPage");
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
  // Solid, higher-contrast panel — a gold-tinted glass on the dark hero
  // instead of the near-transparent white that read as barely-there against a
  // busy photo. The gold hairline at the top of each cell still ties the
  // timer to the offer badge.
  const boxBg = isLight
    ? "linear-gradient(180deg, rgba(11,61,46,0.62) 0%, rgba(7,42,32,0.78) 100%)"
    : "linear-gradient(180deg, rgba(11,61,46,0.07) 0%, rgba(11,61,46,0.03) 100%)";
  const boxBorder = isLight ? "rgba(212,168,71,0.5)" : "rgba(11,61,46,0.12)";
  const boxShadow = isLight ? "0 10px 30px rgba(0,0,0,0.35)" : undefined;
  const numColor = isLight ? "#FFFFFF" : "#0B3D2E";
  const labelColor = isLight ? "rgba(255,255,255,0.82)" : "rgba(11,61,46,0.58)";

  // Pre-hydration and invalid dates render a stable skeleton of the same size,
  // so the surrounding layout doesn't shift when the timer starts.
  const cell = (v: string, l: string, key: string) => (
    <div
      key={key}
      className="relative flex min-w-[74px] flex-col items-center overflow-hidden rounded-2xl px-3.5 py-3.5 backdrop-blur-sm sm:min-w-[92px] sm:px-5 sm:py-5"
      style={{ background: boxBg, border: `1.5px solid ${boxBorder}`, boxShadow }}
    >
      <span
        className="absolute inset-x-0 top-0 h-[2px]"
        style={{ background: "linear-gradient(90deg, transparent, rgba(212,168,71,0.9), transparent)" }}
      />
      <span
        className="text-[32px] font-extrabold tabular-nums leading-none tracking-tight sm:text-[44px]"
        style={{ color: numColor }}
      >
        {v}
      </span>
      <span className="mt-2 text-[10px] font-bold uppercase tracking-[0.16em] sm:text-[11px]" style={{ color: labelColor }}>
        {l}
      </span>
    </div>
  );

  if (left === null) {
    return (
      <div className="flex gap-2.5 sm:gap-3.5" aria-hidden="true">
        {(["countdownDays", "countdownHours", "countdownMins", "countdownSecs"] as const).map((k) => cell("--", t(k), k))}
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
        {expiredLabel ?? t("countdownExpired")}
      </div>
    );
  }

  const { days, hours, minutes, seconds } = parts(left);
  const cells: [string, string][] = [
    [String(days), t("countdownDays")],
    [pad(hours), t("countdownHours")],
    [pad(minutes), t("countdownMins")],
    [pad(seconds), t("countdownSecs")],
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
