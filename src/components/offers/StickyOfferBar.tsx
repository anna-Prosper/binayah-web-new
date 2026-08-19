"use client";

/* eslint-disable i18next/no-literal-string -- English-only offer pages */

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import OfferCountdown from "./OfferCountdown";

interface Props {
  title: string;
  deadline: string;
  expired?: boolean;
}

/**
 * Slim bar that drops in once the hero CTA has scrolled away, so the deadline
 * and the primary action stay reachable through the long-form middle of the
 * page. Hidden on small screens, where the site already renders floating
 * call/chat buttons and a second bar would crowd them out.
 */
export default function StickyOfferBar({ title, deadline, expired = false }: Props) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Show past roughly the hero, hide again over the footer CTA so the two
    // don't stack the same action twice on screen.
    const onScroll = () => {
      const y = window.scrollY;
      const nearEnd = y + window.innerHeight > document.body.scrollHeight - 900;
      setShow(y > window.innerHeight * 0.9 && !nearEnd);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!show) return null;

  return (
    <div
      className="ofr-bar-in fixed inset-x-0 top-0 z-[60] hidden lg:block"
      style={{
        background: "rgba(10,53,41,0.94)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(212,168,71,0.28)",
      }}
    >
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-3">
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: "#D4A847" }}>
            {expired ? "Enquire now" : "Limited-time offer"}
          </div>
          <div className="truncate text-sm font-semibold text-white">{title}</div>
        </div>

        {!expired && (
          <div className="shrink-0 scale-90">
            <OfferCountdown deadline={deadline} tone="light" />
          </div>
        )}

        <a
          href="#enquire"
          className="inline-flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition-transform hover:scale-[1.03]"
          style={{ background: "linear-gradient(135deg, #D4A847, #B8922F)", color: "#0B3D2E" }}
        >
          {expired ? "Join waitlist" : "Check eligibility"} <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}
