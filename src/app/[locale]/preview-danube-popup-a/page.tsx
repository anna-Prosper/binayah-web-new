/* eslint-disable i18next/no-literal-string -- internal preview harness */
import type { Metadata } from "next";
import { Link } from "@/navigation";
import DanubeOfferPopup from "@/components/DanubeOfferPopup";

/**
 * Panel-image candidate A for the Danube 20:70 pop-up: the Danube-branded
 * night render. Sits alongside -b so the two can be compared on the live
 * site. Delete both once an image is chosen.
 */
export const metadata: Metadata = {
  title: "Preview — Danube pop-up (A)",
  robots: { index: false, follow: false },
};

const PANEL_A =
  "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/danube-20-70-payment-plan-10-waiver/popup-panel-a.webp";

export default function PreviewDanubePopupA() {
  return (
    <main className="min-h-screen bg-[#eef5f4] p-10">
      <p className="text-sm font-semibold text-[#16211f]">Candidate A — Danube-branded night render</p>
      <p className="mt-1 text-sm text-[#4c5654]">
        Dark navy sky, gold-lit tower, &ldquo;Danube Properties&rdquo; signage visible in the image
        itself. Compare against{" "}
        <Link className="underline" href="/preview-danube-popup-b">
          candidate B
        </Link>
        .
      </p>
      <DanubeOfferPopup forceOpen panelImage={PANEL_A} />
    </main>
  );
}
