/* eslint-disable i18next/no-literal-string -- SEO content intentionally in English */
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { DetailBreadcrumb } from "@/components/DetailBreadcrumb";
import { ProjectSubNav } from "@/components/ProjectSubNav";
import NextImage from "next/image";
import Link from "next/link";
import {
  FileText, Download, ExternalLink, Bed, Ruler,
  Building2, MessageCircle,
} from "lucide-react";

type FloorPlan = {
  title: string;
  type?: string;
  beds?: string;
  baths?: string;
  size?: string;
  image?: string;
  pdf?: string;
};

export default function FloorPlansClient({ serverProject }: { serverProject: any }) {
  const t = useTranslations("projectDetail");
  const project = serverProject;
  const fps: FloorPlan[] = Array.isArray(project.floorPlans) ? project.floorPlans : [];
  const [activeTab, setActiveTab] = useState(0);
  const activeFp = fps[activeTab] ?? fps[0];

  const status      = String(project.status || "").toLowerCase();
  const isRent      = /rent/i.test(status);
  const isReady     = /ready|complet/i.test(status);
  const parentLabel = isRent ? t("breadcrumbRent") : isReady ? t("breadcrumbBuy") : t("breadcrumbOffPlan");
  const parentHref  = isRent ? "/rent" : isReady ? "/buy" : "/off-plan";

  const unitTypes: string[] = Array.isArray(project.unitTypes) ? project.unitTypes : [];

  const whatsappNum = project.whatsappNumber || "971559994111";
  const whatsappMsg = encodeURIComponent(
    `Hi, I'm interested in floor plans for ${project.name}. Could you share more details?`
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <DetailBreadcrumb
        items={[
          { label: t("breadcrumbHome"), href: "/" },
          { label: parentLabel, href: parentHref },
          { label: project.name, href: `/project/${project.slug}` },
          { label: t("floorPlansLabel") },
        ]}
      />
      <ProjectSubNav slug={project.slug} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">

        {/* Page hero */}
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] font-semibold text-accent mb-1">
            {t("floorPlansLabel")}
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            {project.name} — {t("floorPlans")}
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
            {project.name}{project.developerName ? ` by ${project.developerName}` : ""} offers
            {unitTypes.length > 0
              ? ` ${unitTypes.length} unit configuration${unitTypes.length > 1 ? "s" : ""}`
              : " a range of unit types"}
            {project.community ? ` in ${project.community}` : ""}, Dubai.
            {project.unitSizeMin && project.unitSizeMax
              ? ` Unit sizes range from ${Number(project.unitSizeMin).toLocaleString()} to ${Number(project.unitSizeMax).toLocaleString()} sqft.`
              : ""}
            {unitTypes.length > 1
              ? ` Available configurations include ${unitTypes.slice(0, -1).join(", ")} and ${unitTypes[unitTypes.length - 1]}.`
              : unitTypes.length === 1
                ? ` The available configuration is ${unitTypes[0]}.`
                : ""}
          </p>
          <p>
            Browse the floor plans below. Each plan shows the full unit layout including bedroom
            placement, living and dining areas, kitchen, bathrooms and balcony. Where available,
            you can view a full-size image or download the PDF for offline reference.
          </p>
          {fps.length === 0 && (
            <p>
              Detailed floor plans for {project.name} are available on request. Our team can share
              the latest layouts, discuss preferred floors and views, and provide a full price list
              by unit type.
            </p>
          )}
        </div>

        {/* Floor plan gallery */}
        {fps.length > 0 && (
          <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-border/50 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                <FileText className="h-4 w-4 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase tracking-[0.25em] font-semibold text-accent">
                  {t("floorPlansLabel")}
                </p>
                <h2 className="text-base sm:text-lg font-bold text-foreground leading-tight">
                  {project.name} — {t("floorPlans")}
                </h2>
              </div>
              {project.floorPlanPdfUrl && (
                <a
                  href={project.floorPlanPdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-accent/30 text-accent text-xs font-semibold hover:bg-accent/10 transition-colors shrink-0"
                >
                  <Download className="h-3.5 w-3.5" />
                  PDF
                </a>
              )}
            </div>

            {/* Tab pills */}
            <div className="px-4 sm:px-6 pt-4 flex gap-2 flex-wrap">
              {fps.map((fp, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTab(i)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                    activeTab === i
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border text-muted-foreground hover:border-accent/40 hover:text-foreground"
                  }`}
                >
                  {fp.title}
                </button>
              ))}
            </div>

            {/* Active floor plan */}
            <div className="p-4 sm:p-6">
              {activeFp?.image ? (
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative w-full sm:w-2/3 aspect-[4/3] rounded-xl overflow-hidden bg-muted border border-border/50">
                    <NextImage
                      src={activeFp.image}
                      alt={activeFp.title}
                      fill
                      className="object-contain"
                      sizes="(max-width: 640px) 100vw, 50vw"
                    />
                  </div>
                  <div className="flex flex-col gap-3 sm:w-1/3 justify-center">
                    <h3 className="font-bold text-foreground text-base">{activeFp.title}</h3>
                    {activeFp.type && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Building2 className="h-3.5 w-3.5 text-accent shrink-0" />
                        {activeFp.type}
                      </div>
                    )}
                    {activeFp.beds && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Bed className="h-3.5 w-3.5 text-accent shrink-0" />
                        {activeFp.beds} {t("bedsLabel")}
                        {activeFp.baths ? ` · ${activeFp.baths} ${t("bathsLabel")}` : ""}
                      </div>
                    )}
                    {activeFp.size && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Ruler className="h-3.5 w-3.5 text-accent shrink-0" />
                        {activeFp.size}
                      </div>
                    )}
                    <a
                      href={activeFp.image}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      {t("viewFullSize")}
                    </a>
                    {activeFp.pdf && (
                      <a
                        href={activeFp.pdf}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline"
                      >
                        <Download className="h-3.5 w-3.5" />
                        Download PDF
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  {t("floorPlanOnRequest")}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Unit types grid */}
        {unitTypes.length > 0 && (
          <div className="bg-card rounded-2xl border border-border/50 p-4 sm:p-6">
            <h2 className="text-base font-bold text-foreground mb-4">Available Unit Types</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {unitTypes.map((ut, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl border border-border/50 bg-muted/30 text-center"
                >
                  <Bed className="h-4 w-4 text-accent mx-auto mb-1.5" />
                  <p className="text-sm font-semibold text-foreground">{ut}</p>
                  {project.unitSizeMin && project.unitSizeMax && (
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {Number(project.unitSizeMin).toLocaleString()}–{Number(project.unitSizeMax).toLocaleString()} sqft
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Informational SEO content */}
        <div className="bg-muted/30 rounded-2xl border border-border/50 p-4 sm:p-6 space-y-3 text-sm text-muted-foreground leading-relaxed">
          <h2 className="text-base font-bold text-foreground">
            What to Check in a Dubai Off-Plan Floor Plan
          </h2>
          <p>
            When evaluating an off-plan unit in Dubai, the floor plan is your primary reference
            before the physical space is built. Beyond total area, examine the ratio of living space
            to bedrooms, kitchen positioning relative to the living area, and the balcony or terrace
            area — which significantly affects lifestyle value and resale potential.
          </p>
          <p>
            For investment buyers, units with efficient layouts and lower wastage ratios tend to
            achieve stronger rental yields. A well-planned 1-bedroom with a functional kitchen and
            good natural light in{" "}
            {project.community || "a prime Dubai community"} can outperform a larger but
            poorly-designed 2-bedroom on both yield and capital appreciation.
          </p>
          <p>
            Floor plans shown for {project.name} are indicative. Final built dimensions may vary
            by up to 5% from approved plans, in accordance with UAE off-plan property regulations.
            Contact our team for the most current approved plans and unit availability by floor level.
          </p>
        </div>

        {/* CTA */}
        <div className="bg-card rounded-2xl border border-border/50 p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1">
            <h2 className="font-bold text-foreground text-base">
              Need a Personalised Unit Recommendation?
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Our team can match you to the right floor and unit based on your budget, preferred
              view, and size requirements. Available 7 days a week.
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
            href={`/project/${project.slug}/location`}
            className="hover:text-foreground transition-colors"
          >
            Location & Neighbourhood →
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
