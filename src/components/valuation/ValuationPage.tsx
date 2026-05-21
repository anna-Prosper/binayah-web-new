"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import SharedValuationPage from "./shared/SharedValuationPage.jsx";

// Valuation API calls always go through the same-origin Next.js routes under
// /api/valuation/* — those routes proxy to VALUATION_API_BASE_URL (the
// property-search backend), independent of NEXT_PUBLIC_API_URL (which points
// at the general Fastify API for projects/news/communities). Using apiUrl()
// here would route the browser straight to NEXT_PUBLIC_API_URL and 404,
// because that backend doesn't expose the valuation endpoints.
const sameOriginApiUrl = (path: string) => path;

export default function ValuationPage() {
  return <SharedValuationPage Header={Navbar} Footer={Footer} resolveApiUrl={sameOriginApiUrl} />;
}
