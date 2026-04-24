export const dynamic = "force-dynamic";

export const metadata = {
  title: "List Your Property in Dubai | Binayah Properties",
  description: "Sell or rent your Dubai property with Binayah. RERA-certified agents, wide buyer network, full service from valuation to close.",
};

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import ListPropertyForm from "@/components/ListPropertyForm";
import { getTranslations } from "next-intl/server";

export default async function ListYourPropertyPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/signin?callbackUrl=/list-your-property");
  const t = await getTranslations("listProperty");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section
        className="relative pt-32 pb-20 text-white overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
      >
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)", backgroundSize: "48px 48px" }}
        />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 relative">
          <p className="text-accent font-semibold tracking-[0.4em] uppercase text-xs mb-4">{t("heroLabel")}</p>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">{t("heroTitle")} <span className="italic font-light">{t("heroTitleItalic")}</span></h1>
          <p className="text-primary-foreground/70 text-lg">
            {t("heroSubtitle")}
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="bg-card border border-border/50 rounded-2xl shadow-sm p-8">
            <ListPropertyForm />
          </div>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
