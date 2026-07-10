import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GaLeadFire from "@/components/GaLeadFire";
import { getTranslations, setRequestLocale } from "next-intl/server";

// Dedicated thank-you page after a contact form submission. Lives at its
// own URL so analytics can register the conversion as a discrete page
// view (e.g. GA4 lead-capture goal, Clarity funnel, Vercel Analytics)
// instead of relying on an in-page toast that's invisible to tracking.
export const metadata = {
  title: "Thank You, We've Received Your Message | Binayah Properties",
  description: "Your enquiry has been received. A Binayah property consultant will be in touch within 24 hours.",
  robots: { index: false, follow: true },
};

export default async function ContactThankYouPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contact.thankYou");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <GaLeadFire source="contact-form" />
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-xl w-full text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 flex items-center justify-center mb-6">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </div>
          <p className="text-[10px] sm:text-xs font-semibold tracking-[0.3em] uppercase text-accent mb-2">
            {t("eyebrow")}
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
            {t("title")}
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed mb-8 max-w-md mx-auto">
            {t("subtitle")}
          </p>

          <div className="bg-card border border-border/60 rounded-2xl p-5 mb-8 text-left">
            <p className="text-sm font-semibold text-foreground mb-3">{t("nextStepsTitle")}</p>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li className="flex gap-3">
                <span className="text-primary font-bold flex-shrink-0">1.</span>
                <span>{t("step1")}</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold flex-shrink-0">2.</span>
                <span>{t("step2")}</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold flex-shrink-0">3.</span>
                <span>{t("step3")}</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/buy"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-white font-semibold text-sm shadow-lg"
              style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
            >
              {t("browseProperties")} <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-border text-foreground font-semibold text-sm hover:bg-muted transition-colors"
            >
              {t("backHome")}
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
