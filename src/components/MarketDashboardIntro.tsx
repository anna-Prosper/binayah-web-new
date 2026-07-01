import { getTranslations } from "next-intl/server";

// Server-rendered heading shell for the Market Dashboard section. Puts the
// section's heading + subtitle in the crawlable HTML while the data-fetching
// widget below stays client-deferred (rendered with hideHeading to avoid a
// duplicate title). Shares the section background so the two read as one block.
export default async function MarketDashboardIntro({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "marketDashboard" });
  return (
    <section className="pt-10 sm:pt-24 bg-muted/40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-6 sm:mb-10">
          <div className="h-[2px] mx-auto mb-4 sm:mb-6 w-12" style={{ background: "linear-gradient(90deg, #D4A847, #B8922F)" }} />
          <p className="font-semibold tracking-[0.4em] uppercase text-[10px] sm:text-xs mb-2 sm:mb-4" style={{ color: "#D4A847" }}>{t("label")}</p>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-foreground">{t("dubaiMarket")} <span className="font-light">{t("title")}</span></h2>
          <p className="hidden sm:block mt-4 text-muted-foreground max-w-md mx-auto text-base">{t("dashboardSubtitle")}</p>
        </div>
      </div>
    </section>
  );
}
