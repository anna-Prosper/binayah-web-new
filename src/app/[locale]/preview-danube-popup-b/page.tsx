/* eslint-disable i18next/no-literal-string -- internal preview harness */
import type { Metadata } from "next";
import { Link } from "@/navigation";
import DanubeOfferPopup from "@/components/DanubeOfferPopup";

/**
 * Panel-image candidate B for the Danube 20:70 pop-up: the Shahrukhz dusk
 * render. Sits alongside -a so the two can be compared on the live site.
 * Delete both once an image is chosen.
 */
export const metadata: Metadata = {
  title: "Preview — Danube pop-up (B)",
  robots: { index: false, follow: false },
};

const PANEL_B =
  "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/danube-20-70-payment-plan-10-waiver/popup-panel-b.webp";

export default function PreviewDanubePopupB() {
  return (
    <main className="min-h-screen bg-[#eef5f4] p-10">
      <p className="text-sm font-semibold text-[#16211f]">Candidate B — Shahrukhz by Danube, dusk</p>
      <p className="mt-1 text-sm text-[#4c5654]">
        Pale dusk sky, tall slim tower centred in frame. Compare against{" "}
        <Link className="underline" href="/preview-danube-popup-a">
          candidate A
        </Link>
        .
      </p>
      <DanubeOfferPopup forceOpen panelImage={PANEL_B} />
    </main>
  );
}
