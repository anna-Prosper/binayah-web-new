import Image from "next/image";
import { Link } from "@/navigation";
import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { getGoogleReviews } from "@/lib/googleReviews";

// Server Component: real crawlable HTML, zero client JS. Former framer-motion
// entrance animations were decorative and are dropped. Rendered server-side via
// a slot in page.tsx (not gated by LazyMount).
export default async function StatsSection({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "home.sections.team" });
  const ts = await getTranslations({ locale, namespace: "home.sections.stats" });

  // Business figures (properties sold, industry awards) are confirmed by the
  // owner as real company data. "11,200+" is deliberately NOT restored: it was
  // rendered simultaneously as Happy Clients, Properties Sold and Properties
  // Managed, so whichever metric it belongs to, two of those labels were wrong.
  // It goes back once the owner says which one it is.
  //
  // The Google rating is fetched live rather than hardcoded — the old hardcoded
  // "4.9" on /services contradicted the real 4.4 on the Google profile.
  const reviews = await getGoogleReviews();
  const stats = [
    { value: "3,000+", label: ts("propertiesListed") },
    { value: "AED 2.1B+", label: ts("sold") },
    { value: "15+", label: ts("industryAwards") },
    { value: "19+", label: ts("yearsExperience") },
    ...(reviews && reviews.total > 0
      ? [{ value: `${reviews.rating.toFixed(1)}★`, label: ts("googleRating", { count: reviews.total }) }]
      : []),
  ];


  return (
    <section className="py-14 sm:py-24 bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* Top: content left, photo right */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-8 lg:gap-16 items-center">

          {/* LEFT — label + heading + copy + CTAs */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="h-[2px] w-8 flex-shrink-0" style={{ background: "linear-gradient(90deg, #D4A847, #B8922F)" }} />
              <p className="text-[11px] font-bold tracking-[0.4em] uppercase" style={{ color: "#D4A847" }}>{t("label")}</p>
            </div>

            <h2 className="text-[1.7rem] sm:text-4xl lg:text-[2.6rem] font-bold text-foreground leading-[1.15] mb-5 sm:mb-6">
              {t("heading")} <span style={{ color: "#1A7A5A" }}>{t("headingAccent")}</span> {t("headingEnd")}
            </h2>

            <div className="space-y-3.5 sm:space-y-4 text-muted-foreground text-[15px] sm:text-base leading-relaxed mb-7 sm:mb-8">
              <p>{t("p1")}</p>
              <p>{t("p2")}</p>
              <p>{t("p3")}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/about"
                className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3.5 sm:py-3 rounded-full text-white font-semibold text-sm transition-all hover:shadow-lg hover:brightness-110"
                style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
              >
                {t("cta1")} <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/buy"
                className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3.5 sm:py-3 rounded-full font-semibold text-sm border-2 transition-all hover:bg-accent/5"
                style={{ borderColor: "#D4A847", color: "#B8922F" }}
              >
                {t("cta2")} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* RIGHT — team photo */}
          <div className="relative">
            {/* offset gold accent for depth */}
            <div className="absolute -bottom-3 -right-3 w-24 h-24 rounded-2xl -z-0 hidden sm:block" style={{ background: "linear-gradient(135deg, #D4A847, #B8922F)", opacity: 0.18 }} />
            <div className="relative rounded-2xl overflow-hidden shadow-xl aspect-[4/3] z-10">
              <Image
                src="/assets/team.webp"
                alt="Binayah Properties team"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 560px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
              <p className="absolute bottom-5 left-5 right-5 text-white text-sm font-medium leading-snug">
                {t("photoCaption")}
              </p>
            </div>
          </div>
        </div>

        {/* Stats strip — full-width band, 5 across */}
        <div className="mt-10 sm:mt-14 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-px rounded-2xl overflow-hidden border border-border/50 bg-border/40 [&>*:last-child]:col-span-2 sm:[&>*:last-child]:col-span-1">
          {stats.map((s) => (
            <div key={s.label} className="bg-background px-3 sm:px-4 py-5 sm:py-6 text-center">
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">{s.value}</p>
              <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-1.5 tracking-[0.12em] uppercase leading-tight">{s.label}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
