import { getTranslations } from "next-intl/server";

// Server-rendered heading shell for the ROI Calculator section (crawlable HTML).
// The interactive calculator below stays client-deferred and is rendered with
// hideHeading to avoid a duplicate title. Shares the section background.
export default async function ROICalculatorIntro({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "roiCalculator" });
  return (
    <section className="pt-12 sm:pt-24 bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-14">
          <div className="h-[2px] mx-auto mb-4 sm:mb-6 w-12" style={{ background: "linear-gradient(90deg, #D4A847, #B8922F)" }} />
          <p className="font-semibold tracking-[0.4em] uppercase text-[10px] sm:text-xs mb-2 sm:mb-4" style={{ color: "#D4A847" }}>{t("label")}</p>
          <h2 className="text-xl sm:text-4xl lg:text-5xl font-bold text-foreground">{t("title")}</h2>
          <p className="hidden sm:block mt-4 text-muted-foreground max-w-md mx-auto">{t("subtitle")}</p>
        </div>
      </div>
    </section>
  );
}
