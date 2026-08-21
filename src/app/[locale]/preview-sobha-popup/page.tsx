/* eslint-disable i18next/no-literal-string -- internal preview harness */
import type { Metadata } from "next";
import SobhaOfferPopup from "@/components/SobhaOfferPopup";

/**
 * Internal preview for the Sobha 20/80 campaign pop-up.
 * Renders it open, bypassing the dwell timer, the frequency cookie and the
 * offer-expiry check, so it can be reviewed on demand. Not linked from
 * anywhere and excluded from indexing. Safe to delete once the design is signed
 * off — nothing imports it.
 */
export const metadata: Metadata = {
  title: "Preview — Sobha pop-up",
  robots: { index: false, follow: false },
};

export default function PreviewSobhaPopup() {
  return (
    <main className="min-h-screen bg-[#eae5d8] p-10">
      <p className="text-sm text-[#5c5a52]">
        Preview harness — the pop-up below is forced open. Live behaviour: 8s dwell or 35% scroll,
        once per 24h, 48h back-off after dismissal, and it stops entirely after the offer deadline.
      </p>
      <SobhaOfferPopup forceOpen />
    </main>
  );
}
