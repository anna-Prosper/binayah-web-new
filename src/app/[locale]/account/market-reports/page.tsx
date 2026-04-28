import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getTranslations } from "next-intl/server";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import MarketReportsClient, { type SubscriptionData } from "./MarketReportsClient";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata() {
  const t = await getTranslations("weeklyReport");
  return {
    title: `${t("account.pageTitle")} | Binayah Properties`,
  };
}

export default async function MarketReportsPage({ params }: Props) {
  const { locale } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect(`/signin?callbackUrl=/${locale}/account/market-reports`);
  }

  const t = await getTranslations("weeklyReport");

  // Server-fetch current subscription via our proxy (keeps admin-secret server-side)
  let subscription: SubscriptionData | null = null;
  try {
    const adminSecret = process.env.ADMIN_SECRET;
    const { serverApiUrl } = await import("@/lib/api");
    if (adminSecret && session.user.email) {
      const res = await fetch(
        serverApiUrl(`/api/market-report/by-email?email=${encodeURIComponent(session.user.email)}`),
        {
          headers: { "x-admin-secret": adminSecret },
          signal: AbortSignal.timeout(6000),
        }
      );
      if (res.ok) {
        const data = await res.json();
        subscription = (data.subscription || null) as SubscriptionData | null;
      }
    }
  } catch {
    // Atlas DNS unreachable in sandbox — graceful degradation
    subscription = null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <WhatsAppButton />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-24 pt-32">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.3em] font-semibold text-accent mb-3">
            {t("account.eyebrow")}
          </p>
          <h1 className="text-3xl font-bold text-foreground mb-2">{t("account.heading")}</h1>
          <p className="text-base text-muted-foreground leading-relaxed">{t("account.lede")}</p>
        </div>

        <MarketReportsClient
          initialSubscription={subscription}
          userEmail={session.user.email ?? ""}
        />
      </main>

      <Footer />
    </div>
  );
}
