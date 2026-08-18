/* eslint-disable i18next/no-literal-string -- English-only promotional landing pages */
/* eslint-disable @next/next/no-img-element -- verified real-estate CDN images */
import type { Metadata } from "next";
import { Link } from "@/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BreadcrumbJsonLd } from "@/components/JsonLd";
import { OFFERS, isExpired } from "@/lib/offers";
import { canonical as makeCanonical, altLangs, OG_LOCALE } from "@/lib/site";
import { getNonce } from "@/lib/nonce";
import { ArrowRight, Clock, Tag } from "lucide-react";

export const revalidate = 3600;

type Props = { params: Promise<{ locale: string }> };

const GOLD = "#D4A847";
const GOLD_DEEP = "#B8922F";
const GREEN = "#0B3D2E";

const TITLE = "Dubai Property Offers & Payment Plans | Binayah Properties";
const DESC =
  "Current developer promotions on Dubai property — deferred payment plans, DLD fee waivers and limited-release incentives, with the terms explained in plain English.";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
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
    },
  };
}

export default async function OffersIndexPage({ params }: Props) {
  const { locale } = await params;
  const nonce = await getNonce();
  const lp = locale === "en" ? "" : `/${locale}`;

  // Live offers first, expired ones kept below for reference and SEO.
  const live = OFFERS.filter((o) => !isExpired(o));
  const past = OFFERS.filter((o) => isExpired(o));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: `${lp}/` },
          { name: "Offers", href: `${lp}/offers` },
        ]}
        nonce={nonce}
      />

      <section className="pt-28 pb-14" style={{ background: `linear-gradient(145deg, #0A3529 0%, ${GREEN} 55%, #0F4A36 100%)` }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: GOLD }}>
            Current promotions
          </div>
          <h1 className="mt-3 max-w-3xl text-4xl sm:text-5xl font-extrabold leading-[1.1] tracking-tight text-white">
            Dubai property offers, explained properly
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-white/75">
            Developer promotions move fast and the terms are rarely spelled out. Here is what each one actually
            changes for a buyer — the payment structure, the waivers and the small print.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
        {live.length === 0 && past.length === 0 ? (
          <p className="text-muted-foreground">No promotions are running right now. Check back shortly.</p>
        ) : (
          <>
            {live.length > 0 && (
              <div className="grid gap-5 md:grid-cols-2">
                {live.map((o) => (
                  <Link
                    key={o.slug}
                    href={`/offers/${o.slug}`}
                    className="group overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-xl"
                  >
                    <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                      <img
                        src={o.heroImage}
                        alt={o.shortName}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <span
                        className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em]"
                        style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_DEEP})`, color: GREEN }}
                      >
                        <Clock className="h-3 w-3" /> {o.eyebrow}
                      </span>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                        <Tag className="h-3.5 w-3.5" /> {o.developer}
                      </div>
                      <h2 className="mt-2 text-xl font-bold leading-snug text-foreground group-hover:text-primary transition-colors">
                        {o.h1}
                      </h2>
                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{o.subtitle}</p>
                      <div className="mt-4 flex items-center gap-3">
                        {o.highlights.slice(0, 3).map((h) => (
                          <div key={h.label} className="text-center">
                            <div className="text-lg font-extrabold" style={{ color: GOLD_DEEP }}>
                              {h.value}
                            </div>
                            <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                              {h.label}
                            </div>
                          </div>
                        ))}
                      </div>
                      <span
                        className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold"
                        style={{ color: GOLD_DEEP }}
                      >
                        See the terms <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {past.length > 0 && (
              <div className="mt-14">
                <h2 className="text-lg font-bold text-foreground">Past promotions</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Kept for reference. Register on any of these to hear about the next release.
                </p>
                <div className="mt-5 space-y-2.5">
                  {past.map((o) => (
                    <Link
                      key={o.slug}
                      href={`/offers/${o.slug}`}
                      className="group flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-card px-5 py-4 transition-colors hover:border-primary/30"
                    >
                      <div className="min-w-0">
                        <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                          {o.developer}
                        </div>
                        <div className="mt-0.5 truncate font-semibold text-foreground group-hover:text-primary transition-colors">
                          {o.h1}
                        </div>
                      </div>
                      <span className="shrink-0 rounded-full bg-muted px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                        Closed
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </section>

      <Footer />
    </div>
  );
}
