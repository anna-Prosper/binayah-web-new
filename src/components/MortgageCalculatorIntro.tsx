import { getTranslations } from "next-intl/server";

// Server-rendered heading shell for the Mortgage Calculator section (crawlable
// HTML). The interactive calculator below stays client-deferred and is rendered
// with hideHeading to avoid a duplicate title. Shares the section background.
export default async function MortgageCalculatorIntro({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "mortgageCalculator" });
  return (
    <section className="pt-16 sm:pt-24 bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <div className="h-[2px] w-12 mx-auto mb-6" style={{ background: "linear-gradient(90deg, #D4A847, #B8922F)" }} />
          <p className="font-semibold tracking-[0.4em] uppercase text-xs mb-4" style={{ color: "#D4A847" }}>{t("label")}</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">{t("title")}</h2>
          <p className="text-muted-foreground mt-3 text-sm max-w-lg mx-auto">{t("subtitle")}</p>
        </div>
      </div>
    </section>
  );
}
