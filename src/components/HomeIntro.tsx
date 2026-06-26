import { getTranslations } from "next-intl/server";

// Short server-rendered intro: gives users and (non-JS) crawlers immediate
// context in the initial HTML. Pure server component — no client JS.
export default async function HomeIntro({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "home.seoIntro" });
  return (
    <section className="bg-background border-b border-border/40">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-12 text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">{t("heading")}</h2>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{t("body")}</p>
      </div>
    </section>
  );
}
