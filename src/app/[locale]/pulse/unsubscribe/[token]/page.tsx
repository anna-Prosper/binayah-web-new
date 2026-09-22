import { getTranslations } from "next-intl/server";
import { Link } from "@/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FeedbackChips from "./FeedbackChips";
import { unsubscribeAction } from "./actions";

interface Props {
  params: Promise<{ token: string; locale: string }>;
  searchParams: Promise<{ state?: string }>;
}

export const dynamic = "force-dynamic";

export default async function PulseUnsubscribePage({ params, searchParams }: Props) {
  const { token, locale } = await params;
  const { state } = await searchParams;
  const t = await getTranslations("weeklyReport");

  // Rendering this page does NOT unsubscribe anyone. It used to, which meant
  // every link scanner that fetched the URL unsubscribed the reader before
  // they opened the email. The state is now driven by the result of an actual
  // form submission (see actions.ts).
  const isSuccess = state === "done";
  const isNotFound = state === "notfound" || state === "error";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="min-h-[80vh] flex items-center justify-center px-4 py-24">
        <div className="w-full max-w-md">
          {isSuccess ? (
            /* ── Unsubscribed state — no "are you sure", just warm confirmation ── */
            <div className="bg-card border border-border/50 rounded-2xl shadow-xl p-8 space-y-6">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] font-semibold text-accent mb-3">
                  {t("unsub.eyebrow")}
                </p>
                <h1 className="text-2xl font-bold text-foreground mb-3">
                  {t("unsub.heading")}
                </h1>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t("unsub.body")}
                </p>
              </div>

              {/* Optional feedback — non-blocking, interactive chips */}
              <div className="border border-border/50 rounded-xl p-4 space-y-3">
                <p className="text-[10px] uppercase tracking-[0.25em] font-semibold text-muted-foreground">
                  {t("unsub.feedbackLabel")}
                </p>
                <FeedbackChips
                  options={[
                    { key: "tooFrequent", label: t("unsub.feedbackOptions.tooFrequent") },
                    { key: "notRelevant", label: t("unsub.feedbackOptions.notRelevant") },
                    { key: "foundWhatNeeded", label: t("unsub.feedbackOptions.foundWhatNeeded") },
                    { key: "other", label: t("unsub.feedbackOptions.other") },
                  ]}
                />
                <p className="text-xs text-muted-foreground">
                  {t("unsub.feedbackNote")}
                </p>
              </div>

              <Link
                href="/pulse"
                className="flex items-center justify-center w-full py-3 rounded-xl text-sm font-semibold text-primary border border-primary hover:bg-primary/5 transition-colors"
              >
                {t("unsub.resubscribeCta")}
              </Link>
            </div>
          ) : !isNotFound ? (
            /* ── Confirm state — the default. Nothing has happened yet. ── */
            <div className="bg-card border border-border/50 rounded-2xl shadow-xl p-8 space-y-6">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] font-semibold text-muted-foreground mb-3">
                  {t("unsub.confirmEyebrow")}
                </p>
                <h1 className="text-2xl font-bold text-foreground mb-3">
                  {t("unsub.confirmHeading")}
                </h1>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t("unsub.confirmBody")}
                </p>
              </div>

              {/* A real POST, so a link prefetch or security scan cannot trigger it. */}
              <form action={unsubscribeAction} className="space-y-3">
                <input type="hidden" name="token" value={token} />
                <input type="hidden" name="locale" value={locale} />
                <button
                  type="submit"
                  className="flex items-center justify-center w-full py-3 rounded-xl text-sm font-semibold text-white transition-all hover:-translate-y-0.5"
                  style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
                >
                  {t("unsub.confirmCta")}
                </button>
              </form>

              <Link
                href="/pulse"
                className="flex items-center justify-center w-full py-3 rounded-xl text-sm font-semibold text-primary border border-primary hover:bg-primary/5 transition-colors"
              >
                {t("unsub.keepCta")}
              </Link>
            </div>
          ) : (
            /* ── Not found state ── */
            <div className="bg-card border border-border/50 rounded-2xl shadow-xl p-8 space-y-6">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] font-semibold text-muted-foreground mb-3">
                  {t("unsub.notFoundEyebrow")}
                </p>
                <h1 className="text-2xl font-bold text-foreground mb-3">
                  {t("unsub.notFoundHeading")}
                </h1>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t("unsub.notFoundBody")}
                </p>
              </div>
              <Link
                href="/pulse"
                className="flex items-center justify-center w-full py-3 rounded-xl text-sm font-semibold text-white transition-all hover:-translate-y-0.5"
                style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
              >
                {t("unsub.backToPulse")}
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
