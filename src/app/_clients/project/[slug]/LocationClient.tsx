/* eslint-disable i18next/no-literal-string -- SEO content intentionally in English */
"use client";

import { useTranslations } from "next-intl";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { DetailBreadcrumb } from "@/components/DetailBreadcrumb";
import { DetailTabs } from "@/components/DetailTabs";
import { LocationSection } from "@/components/LocationSection";
import Link from "next/link";
import {
  MapPin, MessageCircle, Waves, Globe, Landmark, Compass, ArrowRight, Home,
} from "lucide-react";
import type React from "react";

const MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || "";

function toMapEmbedSrc(rawUrl: string): string {
  if (!rawUrl) return "";
  const url = rawUrl.split(/\s+/)[0];
  if (url.includes("/maps/embed/v1/")) return url;
  try {
    const parsed = new URL(url);
    const q = parsed.searchParams.get("query") || parsed.searchParams.get("q");
    if (q) return `https://www.google.com/maps/embed/v1/place?key=${MAPS_KEY}&q=${encodeURIComponent(q)}&zoom=15`;
    const placeMatch = url.match(/\/place\/([^/@?]+)/);
    if (placeMatch)
      return `https://www.google.com/maps/embed/v1/place?key=${MAPS_KEY}&q=${encodeURIComponent(decodeURIComponent(placeMatch[1].replace(/\+/g, " ")))}&zoom=15`;
  } catch { /* invalid URL */ }
  return "";
}

function attractionIcon(type: string): React.ElementType {
  const t = type?.toLowerCase() || "";
  if (t.includes("beach") || t.includes("marina")) return Waves;
  if (t.includes("mall") || t.includes("retail"))  return Home;
  if (t.includes("airport"))                        return Globe;
  if (t.includes("landmark"))                       return Landmark;
  if (t.includes("park") || t.includes("garden"))  return Compass;
  if (t.includes("transport") || t.includes("metro")) return ArrowRight;
  return MapPin;
}

export default function LocationClient({ serverProject }: { serverProject: any }) {
  const t = useTranslations("projectDetail");
  const project = serverProject;

  const status      = String(project.status || "").toLowerCase();
  const isRent      = /rent/i.test(status);
  const isReady     = /ready|complet/i.test(status);
  const parentLabel = isRent ? t("breadcrumbRent") : isReady ? t("breadcrumbBuy") : t("breadcrumbOffPlan");
  const parentHref  = isRent ? "/rent" : isReady ? "/buy" : "/off-plan";

  const nearby: { name: string; type: string; distance: string }[] =
    Array.isArray(project.nearbyAttractions) ? project.nearbyAttractions : [];

  let mapSrc = toMapEmbedSrc(project.mapUrl || "");
  if (!mapSrc && project.latitude && project.longitude) {
    mapSrc = `https://www.google.com/maps/embed/v1/place?key=${MAPS_KEY}&q=${project.latitude},${project.longitude}&zoom=15`;
  }
  if (!mapSrc) {
    mapSrc = `https://www.google.com/maps/embed/v1/place?key=${MAPS_KEY}&q=${encodeURIComponent(`${project.name} ${project.community || ""} Dubai`)}&zoom=15`;
  }
  const externalMapUrl = project.mapUrl
    ? (project.googleMapsUrl || project.mapUrl.split(/\s+/)[0])
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${project.name} ${project.community || ""} Dubai`)}`;

  const whatsappNum = project.whatsappNumber || "971559994111";
  const whatsappMsg = encodeURIComponent(
    `Hi, I'd like to know more about the location of ${project.name}. Could you share details?`
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <DetailBreadcrumb
        items={[
          { label: t("breadcrumbHome"), href: "/" },
          { label: parentLabel, href: parentHref },
          { label: project.name, href: `/project/${project.slug}` },
          { label: "Location" },
        ]}
      />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-4">
        <DetailTabs<string>
          active="location"
          tabs={[
            { id: "overview", label: t("tabOverview"), href: `/project/${project.slug}` },
            { id: "location", label: t("tabLocation"), href: `/project/${project.slug}/location` },
            { id: "payment", label: t("tabPayment"), href: `/project/${project.slug}/payment-plan` },
            { id: "faq", label: t("tabFaq"), href: `/project/${project.slug}` },
          ]}
        />
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">

        {/* Page hero */}
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] font-semibold text-accent mb-1">
            Location & Neighbourhood
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            {project.name} — Location
          </h1>
          {project.community && (
            <p className="text-muted-foreground mt-1">
              {project.community}, {project.city || "Dubai"}
            </p>
          )}
        </div>

        {/* Intro SEO text */}
        <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
          <p>
            {project.name}{project.developerName ? ` by ${project.developerName}` : ""} is situated
            in {project.community ? `${project.community}, ` : ""}{project.city || "Dubai"}, UAE.
            {project.locationDescription
              ? ` ${project.locationDescription.slice(0, 250)}${project.locationDescription.length > 250 ? "…" : ""}`
              : ` The project sits within one of ${project.city || "Dubai"}'s well-connected communities, offering residents easy access to major roads, retail, and leisure destinations.`}
          </p>
          {nearby.length > 0 && (
            <p>
              Key landmarks and amenities near {project.name} include{" "}
              {nearby.slice(0, 3).map((n, i) => (
                <span key={i}>
                  {i > 0 && i === nearby.slice(0, 3).length - 1 ? " and " : i > 0 ? ", " : ""}
                  {n.name}{n.distance ? ` (${n.distance})` : ""}
                </span>
              ))}.
            </p>
          )}
        </div>

        {/* Location section (map + nearby) */}
        <LocationSection
          community={project.community}
          city={project.city}
          country={project.country || "UAE"}
          mapEmbedSrc={mapSrc}
          description={project.locationDescription}
          externalMapUrl={externalMapUrl}
          nearby={nearby}
          iconForType={attractionIcon}
        />

        {/* Area investment context */}
        <div className="bg-muted/30 rounded-2xl border border-border/50 p-4 sm:p-6 space-y-3 text-sm text-muted-foreground leading-relaxed">
          <h2 className="text-base font-bold text-foreground">
            Why Location Matters for Dubai Property Investment
          </h2>
          <p>
            In Dubai&apos;s property market, location is the single largest driver of both rental
            yield and capital appreciation. Communities with strong transport connectivity, proximity
            to employment hubs, and established lifestyle amenities consistently outperform in
            rental demand and price per sqft growth.
          </p>
          <p>
            {project.community || project.city || "This area"} benefits from{" "}
            {nearby.some(n => /metro|transport/i.test(n.type))
              ? "metro and road connectivity, "
              : "road connectivity, "}
            {nearby.some(n => /mall|retail/i.test(n.type))
              ? "proximity to major retail destinations, "
              : ""}
            and a growing residential population. Properties in well-located communities within
            Dubai have seen consistent capital appreciation, particularly since 2021 when the
            market entered a sustained growth phase.
          </p>
          <p>
            For investors considering {project.name}, the surrounding catchment area supports
            strong tenant demand from{" "}
            {project.community?.toLowerCase().includes("marina") ||
             project.community?.toLowerCase().includes("downtown") ||
             project.community?.toLowerCase().includes("palm")
              ? "professionals and high-net-worth individuals"
              : "families, professionals and working expatriates"}.
          </p>
        </div>

        {/* CTA */}
        <div className="bg-card rounded-2xl border border-border/50 p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1">
            <h2 className="font-bold text-foreground text-base">
              Want to Schedule a Site Visit?
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Our team can arrange a viewing of {project.name} and a neighbourhood tour to help
              you understand the location in person.
            </p>
          </div>
          <a
            href={`https://wa.me/${whatsappNum}?text=${whatsappMsg}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#25D366] text-white text-sm font-semibold hover:bg-[#1ebe5d] transition-colors shrink-0"
          >
            <MessageCircle className="h-4 w-4" />
            Chat on WhatsApp
          </a>
        </div>

        {/* Internal links */}
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <Link href={`/project/${project.slug}`} className="hover:text-foreground transition-colors">
            ← Back to {project.name}
          </Link>
          <span className="opacity-30">·</span>
          <Link
            href={`/project/${project.slug}/floor-plans`}
            className="hover:text-foreground transition-colors"
          >
            Floor Plans →
          </Link>
          <span className="opacity-30">·</span>
          <Link
            href={`/project/${project.slug}/payment-plan`}
            className="hover:text-foreground transition-colors"
          >
            Payment Plan →
          </Link>
        </div>
      </main>

      <WhatsAppButton />
      <Footer />
    </div>
  );
}
