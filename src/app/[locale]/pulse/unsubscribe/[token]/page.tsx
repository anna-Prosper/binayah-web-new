import { getTranslations } from "next-intl/server";
import { Link } from "@/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { serverApiUrl, serverFetch } from "@/lib/api";
import FeedbackChips from "./FeedbackChips";

interface Props {
  params: Promise<{ token: string; locale: string }>;
}

export const dynamic = "force-dynamic";

async function unsubscribeToken(token: string): Promise<{
  ok: boolean;
  status?: string;
  email?: string;
  error?: string;
}> {
  try {
    const res = await serverFetch(serverApiUrl(`/api/market-report/unsubscribe/${token}`), 8000);
    if (!res.ok) return { ok: false, error: "not-found" };
    return res.json();
  } catch {
    return { ok: false, error: "network" };
  }
}

export default async function PulseUnsubscribePage({ params }: Props) {
  const { token } = await params;
  const t = await getTranslations("weeklyReport");

  const result = await unsubscribeToken(token);
  const isSuccess = result.ok || result.status === "already-unsubscribed";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <WhatsAppButton />

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
