"use client";

import { useEffect, useState } from "react";
import GuideDownloadPopup from "@/components/GuideDownloadPopup";
import SobhaOfferPopup, { OFFER_ENDS as SOBHA_OFFER_ENDS } from "@/components/SobhaOfferPopup";
import DanubeOfferPopup, { OFFER_ENDS as DANUBE_OFFER_ENDS, isTargetGeo as isDanubeGeo } from "@/components/DanubeOfferPopup";
import { readGeoCountryCookie } from "@/lib/country-codes";

/**
 * Chooses which site-wide pop-up runs, evaluated newest-campaign-first:
 *   1. Danube 20:70 — while its window is open. It self-suppresses outside
 *      its India/Africa geo target (see DanubeOfferPopup), so falling
 *      through to it here for every visitor is safe.
 *   2. Sobha 20/80 — while its window is open. Kept as a fallback in case
 *      its dates are ever extended; its own OFFER_ENDS already passed, so in
 *      practice this branch is currently dead.
 *   3. The evergreen guide download.
 * Reverting off each campaign is automatic — no deploy needed on either
 * deadline.
 *
 * The decision is deliberately made on the client. This layout is statically
 * cacheable (see the analytics comment in [locale]/layout.tsx), so evaluating
 * the deadline on the server would bake the answer into the cached HTML and the
 * pop-up would never switch. Date.now() also differs between server and client,
 * which would trip hydration — so nothing renders until after mount. All
 * pop-ups arm on a timer anyway, so a tick's delay costs nothing.
 *
 * Each pop-up keeps its own frequency cookie, so dismissing one campaign does
 * not suppress the next once it takes over.
 */
export default function CampaignPopup() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  if (Date.now() <= DANUBE_OFFER_ENDS.getTime() && isDanubeGeo(readGeoCountryCookie())) {
    return <DanubeOfferPopup />;
  }
  return Date.now() > SOBHA_OFFER_ENDS.getTime() ? <GuideDownloadPopup /> : <SobhaOfferPopup />;
}
