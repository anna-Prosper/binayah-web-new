/* eslint-disable i18next/no-literal-string -- per-subpage SEO landing copy, intentionally in English */
import { FileText, MapPin, CreditCard, HelpCircle } from "lucide-react";

type SeoTab = "floor-plans" | "location" | "payment" | "faq";

/**
 * Small, unique, topic-focused SEO copy rendered only on a project SUB-page
 * (floor-plans / location / payment-plan / faq). Each sub-page shares the hub
 * chrome, so this block is what makes its main content distinct and indexable
 * rather than a near-duplicate of the hub.
 */
// Minimal shape of the community market stats we weave into the copy — kept
// local so this presentational block doesn't import the server-only market lib.
interface SeoStats {
  avgPricePerSqft?: number;
  rentalYield?: number;
  yieldSource?: string;
}

export function ProjectSeoBlock({
  project,
  tab,
  paymentPlanLabel,
  stats,
}: {
  project: any;
  tab: SeoTab;
  paymentPlanLabel?: string | null;
  stats?: SeoStats | null;
}) {
  const name = String(project?.name || "This project");
  const dev = project?.developerName ? ` by ${project.developerName}` : "";
  const community = project?.community || project?.city || "Dubai";
  const unitTypes =
    Array.isArray(project?.unitTypes) && project.unitTypes.length > 0
      ? project.unitTypes.join(", ")
      : "a range of layouts";
  const sizeMin = project?.unitSizeMin ? Number(project.unitSizeMin).toLocaleString() : null;
  const sizeMax = project?.unitSizeMax ? Number(project.unitSizeMax).toLocaleString() : null;
  const sizeRange = sizeMin && sizeMax ? `${sizeMin}-${sizeMax} sqft` : null;
  const handover = project?.completionDate ? String(project.completionDate) : null;
  // Editor-written copy from the DB takes precedence over the generated
  // template when present (plain text; tags stripped defensively).
  const stripTags = (s: unknown) => String(s ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const locationText = stripTags(project?.locationDescription);
  const masterPlanText = stripTags(project?.masterPlanDescription);
  const paymentText = stripTags(project?.paymentPlanDetails);

  // Real DLD/listing market data for the community — unique per area, so it
  // deepens the location copy beyond the shared template.
  const marketNote = stats?.avgPricePerSqft
    ? `As a pricing benchmark, homes in ${community} currently sell for around AED ${stats.avgPricePerSqft.toLocaleString("en-AE")} per sqft${stats.rentalYield ? ` at a gross rental yield of roughly ${stats.rentalYield}%` : ""}, based on the latest Dubai Land Department (DLD) and listing data — useful context for weighing ${name}'s price and rental potential.`
    : "";

  const CONTENT: Record<SeoTab, { icon: React.ElementType; title: string; paras: string[] }> = {
    "floor-plans": {
      icon: FileText,
      title: `${name} Floor Plans & Unit Sizes`,
      paras: [
        `${name}${dev} offers ${unitTypes}${sizeRange ? ` with built-up areas from ${sizeRange}` : ""} in ${community}, Dubai. The plans below show bedroom placement, living and dining areas, kitchen, bathrooms and balconies so you can compare layouts before construction completes.`,
        `When reviewing an off-plan floor plan, look past total area: the living-to-bedroom ratio, kitchen position and balcony size drive both daily livability and resale value. Built dimensions may vary up to 5% from approved plans under UAE regulations.`,
      ],
    },
    location: {
      icon: MapPin,
      title: `${name} Location & Connectivity`,
      paras: [
        locationText
          ? `${name} is located in ${community}, Dubai. ${locationText}`
          : `${name} is located in ${community}, Dubai, UAE. The community offers convenient access to major road links, retail, schools and leisure destinations across the city.`,
        ...(masterPlanText ? [masterPlanText] : []),
        ...(marketNote ? [marketNote] : []),
        `In Dubai's property market, location is the single biggest driver of rental yield and capital appreciation. Well-connected communities with nearby transport, retail and amenities consistently outperform on tenant demand and price-per-sqft growth.`,
      ],
    },
    payment: {
      icon: CreditCard,
      title: `${name} Payment Plan & Buyer Costs`,
      paras: [
        paymentText || `${name}${dev} is sold on a construction-linked payment plan${paymentPlanLabel ? ` (${paymentPlanLabel})` : ""}, a down payment on booking, staged instalments during construction, and the balance on handover${handover ? ` (targeted for ${handover})` : ""}. All payments are held in a RERA-regulated escrow account that protects your funds throughout the build.`,
        `Beyond the purchase price, budget for the one-time Dubai Land Department fee (4%), the Oqood off-plan registration (around AED 3,000) and standard agency fees. Dubai charges no annual property tax and no capital-gains tax, so investment returns are kept in full.`,
      ],
    },
    faq: {
      icon: HelpCircle,
      title: `${name}, Frequently Asked Questions`,
      paras: [
        `Answers to the most common questions about ${name}${dev} in ${community}, starting price, payment plan, available floor plans, handover timeline and eligibility for overseas buyers. Can't find what you need? Our Dubai property team is available 7 days a week.`,
      ],
    },
  };

  const block = CONTENT[tab];
  if (!block) return null;
  const Icon = block.icon;

  return (
    <section className="bg-card rounded-2xl border border-border/50 p-4 sm:p-6">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <h2 className="text-base sm:text-lg font-bold text-foreground leading-tight">{block.title}</h2>
      </div>
      <div className="space-y-2.5 text-xs sm:text-sm text-muted-foreground leading-relaxed">
        {block.paras.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </section>
  );
}
