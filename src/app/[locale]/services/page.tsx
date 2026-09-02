import ServicesPageClient from "./ServicesPageClient";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { canonical, altLangs, OG_LOCALE, DEFAULT_OG_IMAGE } from "@/lib/site";
import { FAQJsonLd } from "@/components/JsonLd";
import { getAgents, isPublishableAgent } from "@/lib/agents";

export const revalidate = 86400;

interface Props { params: Promise<{ locale: string }> }

/**
 * /services is the parent hub for the company keyword cluster ("real estate
 * company in Dubai", "property company in Dubai", "property companies in
 * Dubai", and the Dubai-first word orders). One page covers every variant —
 * near-duplicate routes for word-order permutations would cannibalise it.
 *
 * Title/description and the FAQ copy all live in the "services" namespace of
 * messages/*.json, so the seven locales stay in one place and the visible FAQ
 * and the FAQPage JSON-LD are guaranteed to be the same text.
 */

/** FAQ entries rendered by the client and mirrored into FAQPage JSON-LD. */
const FAQ_INDEXES = [1, 2, 3, 4, 5, 6] as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "services" });
  const title = t("metaTitle");
  const description = t("metaDesc");
  return {
    title,
    description,
    alternates: {
      canonical: canonical(locale, "/services"),
      languages: altLangs("/services"),
    },
    openGraph: {
      title,
      description,
      url: canonical(locale, "/services"),
      type: "website",
      locale: OG_LOCALE[locale] ?? "en_AE",
      images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630 }],
    },
  };
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "services" });

  // Live published-agent count — the same filter the /team page indexes on.
  // getAgents() returns [] if the DB read fails, in which case the client drops
  // the tile rather than showing a zero or a hardcoded placeholder.
  const agentCount = (await getAgents()).filter(isPublishableAgent).length;

  const faqs = FAQ_INDEXES.map((i) => ({
    question: t(`faq${i}Q`),
    answer: t(`faq${i}A`),
  }));

  // Note: the visible <Breadcrumbs> inside ServicesPageClient already emits the
  // BreadcrumbList JSON-LD, so we don't add another here (avoids a duplicate).
  return (
    <>
      <FAQJsonLd faqs={faqs} />
      <ServicesPageClient agentCount={agentCount} />
    </>
  );
}
