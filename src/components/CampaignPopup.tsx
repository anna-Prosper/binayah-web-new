"use client";

import { useEffect, useState } from "react";
import GuideDownloadPopup from "@/components/GuideDownloadPopup";
import SobhaOfferPopup, { OFFER_ENDS } from "@/components/SobhaOfferPopup";

/**
 * Chooses which site-wide pop-up runs: the Sobha 20/80 campaign while the offer
 * is open, the evergreen guide download once it closes. Reverting is automatic —
 * no deploy needed on the deadline.
 *
 * The decision is deliberately made on the client. This layout is statically
 * cacheable (see the analytics comment in [locale]/layout.tsx), so evaluating
 * the deadline on the server would bake the answer into the cached HTML and the
 * pop-up would never switch. Date.now() also differs between server and client,
 * which would trip hydration — so nothing renders until after mount. Both
 * pop-ups arm on a timer anyway, so a tick's delay costs nothing.
 *
 * Each pop-up keeps its own frequency cookie, so dismissing the campaign does
 * not suppress the guide once it takes over.
 */
export default function CampaignPopup() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;
  return Date.now() > OFFER_ENDS.getTime() ? <GuideDownloadPopup /> : <SobhaOfferPopup />;
}
