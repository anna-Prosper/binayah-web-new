import { getTranslations } from "next-intl/server";
import { Link } from "@/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { serverApiUrl, serverFetch } from "@/lib/api";
import { Calendar, Mail } from "lucide-react";

interface Props {
  params: Promise<{ token: string; locale: string }>;
}

export const dynamic = "force-dynamic";

async function confirmToken(token: string): Promise<{
  ok: boolean;
  status?: string;
  email?: string;
  error?: string;
}> {
  try {
    const res = await serverFetch(serverApiUrl(`/api/market-report/confirm/${token}`), 8000);
    if (!res.ok) return { ok: false, error: "expired" };
    return res.json();
  } catch {
    return { ok: false, error: "network" };
  }
}

export default async function PulseConfirmPage({ params }: Props) {
  const { token, locale } = await params;
  const t = await getTranslations("weeklyReport");

  const result = await confirmToken(token);
  const isSuccess = result.ok || result.status === "already-confirmed";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <WhatsAppButton />

      <main className="min-h-[80vh] flex items-center justify-center px-4 py-24">
        <div className="w-full max-w-md">
          {isSuccess ? (
            /* ── Success state ── */
            <div>
              {/* Gold edge bar */}
              <div
                className="h-[3px] rounded-t-2xl"
                style={{ background: "linear-gradient(to right, #D4A847, #B8922F)" }}
              />
              <div className="bg-card border border-border/50 border-t-0 rounded-b-2xl shadow-xl p-8 space-y-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] font-semibold text-accent mb-3">
                    {t("confirm.eyebrow")}
                  </p>
                  <h1 className="text-2xl font-bold text-foreground mb-3">
                    {t("confirm.heading")}
                  </h1>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t("confirm.body")}
                  </p>
                </div>

                {/* What Monday looks like — stat tiles */}
                <div>
                  <p className="text-[10px] uppercase tracking-[0.3em] font-semibold text-muted-foreground mb-3">
                    {t("confirm.previewLabel")}
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { area: "Dubai Marina", ppsf: "1,580", change: "+2.4%", up: true },
                      { area: "Downtown", ppsf: "2,140", change: "+1.8%", up: true },
                      { area: "JVC", ppsf: "940", change: "–0.3%", up: false },
                    ].map((tile) => (
                      <div
                        key={tile.area}
                        className="rounded-xl p-3 bg-muted/60 border border-border/60"
                      >
                        <p className="text-[9px] uppercase tracking-[0.15em] font-semibold text-accent mb-1 truncate">
                          {tile.area}
                        </p>
                        <p className="text-sm font-bold text-foreground leading-tight">
                          AED {tile.ppsf}
                          <span className="text-[10px] font-normal text-muted-foreground">
                            {t("perSqft")}
                          </span>
                        </p>
                        <p
                          className={`text-xs font-semibold mt-0.5 ${
                            tile.up ? "text-green-600" : "text-destructive"
                          }`}
                        >
                          {tile.change}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer note */}
                <p className="text-xs text-muted-foreground text-center border-t border-border/50 pt-4">
                  {t("confirm.footer")}
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/pulse"
                    className="flex items-center justify-center gap-2 flex-1 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg"
                    style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
                  >
                    <Calendar className="h-4 w-4" />
                    {t("confirm.cta")}
                  </Link>
                  <Link
                    href="/account/market-reports"
                    className="flex items-center justify-center gap-2 flex-1 py-3 rounded-xl text-sm font-semibold border border-[#D4A847] text-[#D4A847] hover:bg-[#D4A847]/10 transition-colors"
                  >
                    {t("confirm.managePrefs")}
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            /* ── Expired / invalid state ── */
            <div className="bg-card border border-border/50 rounded-2xl shadow-xl p-8 space-y-6">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] font-semibold text-destructive/80 mb-3">
                  {t("confirm.expiredEyebrow")}
                </p>
                <h1 className="text-2xl font-bold text-foreground mb-3">
                  {t("confirm.expiredHeading")}
                </h1>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t("confirm.expiredBody")}
                </p>
              </div>

              <Link
                href="/pulse"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg"
                style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
              >
                <Mail className="h-4 w-4" />
                {t("confirm.expiredCta")}
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
