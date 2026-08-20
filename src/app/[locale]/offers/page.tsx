/* eslint-disable i18next/no-literal-string -- English-only promotional landing pages */
/* eslint-disable @next/next/no-img-element -- verified real-estate CDN images */
import type { Metadata } from "next";
import { Link } from "@/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BreadcrumbJsonLd, CollectionPageJsonLd } from "@/components/JsonLd";
import Reveal from "@/components/offers/Reveal";
import { isExpired } from "@/lib/offers";
import { loadOffers } from "@/lib/offers-data";
import { applyTranslation } from "@/lib/applyTranslation";
import { canonical as makeCanonical, altLangs, OG_LOCALE } from "@/lib/site";
import { getTranslations } from "next-intl/server";
import { getNonce } from "@/lib/nonce";
import { ArrowRight, Clock, Tag } from "lucide-react";

export const revalidate = 3600;

type Props = { params: Promise<{ locale: string }> };

const GOLD = "#D4A847";
const GOLD_DEEP = "#B8922F";
const GREEN = "#0B3D2E";

const TITLE = "Dubai Property Offers & Payment Plans | Binayah Properties";
const DESC =
  "Current developer promotions on Dubai property: deferred payment plans, DLD fee waivers and limited-release incentives, with the terms explained in plain English.";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  // OG image comes from whichever offer the hub is actually leading with, so a
  // DB-managed offer doesn't share a stale card image from the bundled array.
  const [lead] = (await loadOffers()).map((o) => applyTranslation(o, locale)!);
  return {
    title: TITLE,
    description: DESC,
    alternates: { canonical: makeCanonical(locale, "/offers"), languages: altLangs("/offers") },
    openGraph: {
      title: TITLE,
      description: DESC,
      type: "website",
      url: makeCanonical(locale, "/offers"),
      locale: OG_LOCALE[locale] ?? "en_AE",
      ...(lead ? { images: [{ url: lead.heroImage, width: 1200, height: 630 }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: TITLE,
      description: DESC,
      ...(lead ? { images: [lead.heroImage] } : {}),
    },
  };
}

export default async function OffersIndexPage({ params }: Props) {
  const { locale } = await params;
  const nonce = await getNonce();
  const lp = locale === "en" ? "" : `/${locale}`;

  // Once an offer's window passes it drops off the hub entirely — no "closed"
  // badges, no past-promotions rail. The sitemap already excludes them.
  const [tCrumb, tNav] = await Promise.all([
    getTranslations({ locale, namespace: "breadcrumbs" }),
    getTranslations({ locale, namespace: "nav" }),
  ]);
  const live = (await loadOffers())
    .map((o) => applyTranslation(o, locale)!)
    .filter((o) => !isExpired(o));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <BreadcrumbJsonLd
        items={[
          { name: tCrumb("home"), href: `${lp}/` },
          { name: tNav("offers"), href: `${lp}/offers` },
        ]}
        nonce={nonce}
      />
      {/* ItemList over the live offers — gives the hub a crawlable inventory
          instead of a page Google has to infer from anchor text alone. */}
      <CollectionPageJsonLd
        name={TITLE}
        description={DESC}
        url="/offers"
        items={live.map((o) => ({ url: `/offers/${o.slug}`, name: o.h1 }))}
        nonce={nonce}
      />

      <section
        className="relative overflow-hidden pb-20 pt-32"
        style={{ background: `linear-gradient(150deg, #072A20 0%, ${GREEN} 52%, #0F4A36 100%)` }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(85% 75% at 12% 100%, rgba(212,168,71,0.18) 0%, transparent 58%)" }}
        />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <div className="hero-fade-up flex items-center gap-3">
            <span className="h-px w-8" style={{ background: `linear-gradient(90deg, ${GOLD}, transparent)` }} />
            <span className="text-[11px] font-bold uppercase tracking-[0.22em]" style={{ color: GOLD }}>
              Current promotions
            </span>
          </div>
          <h1 className="hero-rise mt-5 max-w-3xl text-[2.6rem] font-extrabold leading-[1.06] tracking-[-0.02em] text-white sm:text-[3.4rem]">
            Dubai property offers,{" "}
            <span
              style={{
                background: `linear-gradient(135deg, #EAC873, ${GOLD_DEEP})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              explained properly
            </span>
          </h1>
          <p className="hero-rise mt-6 max-w-2xl text-lg leading-relaxed text-white/70">
            Developer promotions move fast and the terms are rarely spelled out. Here is what each one actually
            changes for a buyer: the payment structure, the waivers and the small print.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
        {live.length === 0 ? (
          <p className="text-muted-foreground">No promotions are running right now. Check back shortly.</p>
        ) : (
          <>
            {live.length > 0 && (
              // A lone promotion runs full-width with the image beside the copy —
              // a single card in a 2-up grid leaves half the row empty.
              <div className={live.length === 1 ? "" : "grid gap-6 md:grid-cols-2"}>
                {live.map((o, i) => {
                  const solo = live.length === 1;
                  return (
                    <Reveal key={o.slug} delay={i * 90}>
                      <Link
                        href={`/offers/${o.slug}`}
                        className={`group block h-full overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/25 hover:shadow-2xl ${
                          solo ? "md:grid md:grid-cols-2 md:items-stretch" : ""
                        }`}
                      >
                        <div
                          className={`relative overflow-hidden bg-muted ${solo ? "aspect-[16/10] md:aspect-auto md:h-full md:min-h-[340px]" : "aspect-[16/9]"}`}
                        >
                          <img
                            src={o.heroImage}
                            alt={o.shortName}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                          <span
                            className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em]"
                            style={{ background: `linear-gradient(135deg, #EAC873, ${GOLD_DEEP})`, color: GREEN }}
                          >
                            <Clock className="h-3 w-3" /> {o.eyebrow}
                          </span>
                        </div>

                        <div className={solo ? "flex flex-col justify-center p-8 lg:p-10" : "p-6"}>
                          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                            <Tag className="h-3.5 w-3.5" /> {o.developer}
                          </div>
                          <h2
                            className={`mt-2.5 font-extrabold leading-snug tracking-[-0.01em] text-foreground transition-colors group-hover:text-primary ${
                              solo ? "text-2xl lg:text-[1.75rem]" : "text-xl"
                            }`}
                          >
                            {o.h1}
                          </h2>
                          <p
                            className={`mt-3 text-sm leading-relaxed text-muted-foreground ${solo ? "" : "line-clamp-2"}`}
                          >
                            {o.subtitle}
                          </p>

                          <div className="mt-6 flex items-center gap-6">
                            {o.highlights.slice(0, 3).map((h) => (
                              <div key={h.label}>
                                <div
                                  className={`font-extrabold leading-none ${solo ? "text-2xl" : "text-lg"}`}
                                  style={{
                                    background: `linear-gradient(135deg, ${GOLD}, ${GOLD_DEEP})`,
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                    backgroundClip: "text",
                                  }}
                                >
                                  {h.value}
                                </div>
                                <div className="mt-1.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                                  {h.label}
                                </div>
                              </div>
                            ))}
                          </div>

                          <span
                            className="mt-7 inline-flex items-center gap-1.5 text-sm font-bold"
                            style={{ color: GOLD_DEEP }}
                          >
                            See the terms
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </span>
                        </div>
                      </Link>
                    </Reveal>
                  );
                })}
              </div>
            )}

          </>
        )}
      </section>

      <Footer />
    </div>
  );
}
