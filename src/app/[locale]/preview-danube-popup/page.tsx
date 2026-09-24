/* eslint-disable i18next/no-literal-string -- internal preview harness */
import type { Metadata } from "next";
import DanubeOfferPopup from "@/components/DanubeOfferPopup";

/**
 * Internal preview for the Danube 20:70 campaign pop-up.
 * Renders it open, bypassing the dwell timer, the frequency cookie, the geo
 * gate and the offer-expiry check, so it can be reviewed on demand. Not
 * linked from anywhere and excluded from indexing. Safe to delete once the
 * design is signed off — nothing imports it.
 */
export const metadata: Metadata = {
  title: "Preview — Danube pop-up",
  robots: { index: false, follow: false },
};

export default function PreviewDanubePopup() {
  return (
    <main className="min-h-screen bg-[#eef5f4] p-10">
      <p className="text-sm text-[#4c5654]">
        Preview harness — the pop-up below is forced open. Live behaviour: shown only to visitors
        geo-tagged as India or Africa (BINAYAH_GEO cookie), 8s dwell or 35% scroll, once per 24h,
        48h back-off after dismissal, and it stops entirely after 27 September 2026.
      </p>
      <DanubeOfferPopup forceOpen />
    </main>
  );
}
