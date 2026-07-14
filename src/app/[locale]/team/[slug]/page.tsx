/* eslint-disable i18next/no-literal-string -- team pages render English agent data (names, bios) with English UI labels */
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Breadcrumbs from "@/components/Breadcrumbs";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Mail, Phone, MessageCircle, ShieldCheck, Globe, MapPin } from "lucide-react";
import type { Metadata } from "next";
import { canonical, altLangs, OG_LOCALE } from "@/lib/site";
import { PersonJsonLd } from "@/components/JsonLd";
import { getAgent, bioText, hasRealLicense, isPublishableAgent, type Agent } from "@/lib/agents";
import { waHref } from "@/lib/whatsapp";

export const revalidate = 3600;

// ISR-eligible; locale matrix handled by the layout's generateStaticParams.
export function generateStaticParams() {
  return [];
}

interface Props {
  params: Promise<{ slug: string; locale: string }>;
}

const SITE = "https://www.binayah.ae";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params;
  const agent = await getAgent(slug);
  if (!agent) return { title: "Agent Not Found | Binayah Properties" };
  const bio = bioText(agent.bio);
  const role = agent.position ? `${agent.position}, ` : "";
  const title = `${agent.name} | ${agent.position || "Real Estate Agent"} | Binayah Properties`;
  const description = bio
    ? bio.slice(0, 155)
    : `${agent.name}, ${role}Dubai real estate agent at Binayah Properties. Contact for buying, selling, renting and investing in Dubai property.`;
  return {
    title,
    description,
    // Thin profiles (no real bio + BRN) stay crawlable (follow) but noindex
    // until the real data lands, so we don't publish boilerplate pages.
    ...(isPublishableAgent(agent) ? {} : { robots: { index: false as const, follow: true } }),
    alternates: { canonical: canonical(locale, `/team/${slug}`), languages: altLangs(`/team/${slug}`) },
    openGraph: {
      title,
      description,
      url: canonical(locale, `/team/${slug}`),
      type: "profile",
      locale: OG_LOCALE[locale] ?? "en_AE",
      images: agent.photo ? [{ url: agent.photo }] : undefined,
    },
  };
}

function contactPhone(a: Agent): string | undefined {
  const m = (a.mobile || "").trim();
  return m || undefined;
}

export default async function AgentPage({ params }: Props) {
  const { slug, locale } = await params;
  const agent = await getAgent(slug);
  if (!agent) notFound();

  const lp = locale === "en" ? "" : `/${locale}`;
  const bio = bioText(agent.bio);
  const phone = contactPhone(agent);
  const sameAs = [agent.social?.linkedin, agent.social?.instagram, agent.social?.facebook, agent.social?.twitter].filter(
    (u): u is string => !!u && /^https?:\/\//.test(u)
  );
  const crumbs = [
    { label: "Our Team", href: `${lp}/team` },
    { label: agent.name, href: `${lp}/team/${slug}` },
  ];
  const waMsg = `Hi, I'd like to speak with ${agent.name} about Dubai property.`;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6">
          <Breadcrumbs items={crumbs} />
        </div>

        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
          <div className="grid md:grid-cols-[280px_1fr] gap-6 sm:gap-10 items-start">
            {/* Photo + contact */}
            <div className="space-y-4">
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden border border-border/60 bg-muted/30">
                {agent.photo ? (
                  <Image src={agent.photo} alt={agent.name} fill sizes="280px" className="object-cover" priority />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl font-semibold text-muted-foreground/40">
                    {agent.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <a
                  href={waHref(waMsg, undefined, agent.mobile)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  <MessageCircle className="h-4 w-4" /> WhatsApp
                </a>
                {agent.email && (
                  <a
                    href={`mailto:${agent.email}`}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted/40 transition-colors"
                  >
                    <Mail className="h-4 w-4" /> Email
                  </a>
                )}
                {phone && (
                  <a
                    href={`tel:${phone.replace(/\s/g, "")}`}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted/40 transition-colors"
                  >
                    <Phone className="h-4 w-4" /> {phone}
                  </a>
                )}
              </div>
            </div>

            {/* Details */}
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">{agent.name}</h1>
              {agent.position && <p className="mt-1 text-base text-primary font-medium">{agent.position}</p>}

              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                {hasRealLicense(agent) && (
                  <span className="inline-flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-primary" /> RERA BRN {agent.license}
                  </span>
                )}
                {agent.languages && agent.languages.length > 0 && (
                  <span className="inline-flex items-center gap-1.5">
                    <Globe className="h-4 w-4" /> {agent.languages.join(", ")}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" /> Dubai, UAE
                </span>
              </div>

              {bio && (
                <div className="mt-6">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground/80 mb-2">About</h2>
                  <p className="text-sm sm:text-base text-foreground/90 leading-relaxed whitespace-pre-line">{bio}</p>
                </div>
              )}

              {agent.specialties && (
                <div className="mt-6">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground/80 mb-2">Specialties</h2>
                  <p className="text-sm sm:text-base text-foreground/90 leading-relaxed">{agent.specialties}</p>
                </div>
              )}

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href={`${lp}/buy`}
                  className="inline-flex items-center rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/40 transition-colors"
                >
                  Browse properties for sale
                </Link>
                <Link
                  href={`${lp}/team`}
                  className="inline-flex items-center rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/40 transition-colors"
                >
                  ← All team members
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />

      <PersonJsonLd
        name={agent.name}
        url={`${SITE}${lp}/team/${slug}`}
        jobTitle={agent.position}
        image={agent.photo}
        email={agent.email}
        telephone={phone}
        description={bio || undefined}
        languages={agent.languages}
        brn={hasRealLicense(agent) ? agent.license : undefined}
        sameAs={sameAs.length ? sameAs : undefined}
      />
    </div>
  );
}