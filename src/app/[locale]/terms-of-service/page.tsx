import type { Metadata } from "next";
import TermsOfServiceClient from "./TermsOfServiceClient";

export const revalidate = 86400;

const TITLES: Record<string, string> = {
  en: "Terms of Service | Binayah Properties",
  fr: "Conditions d'utilisation | Binayah Properties",
  ru: "Условия использования | Binayah Properties",
  ar: "شروط الخدمة | بناية للعقارات",
  zh: "服务条款 | Binayah Properties",
  vi: "Điều khoản dịch vụ | Binayah Properties",
  he: "תנאי השירות | Binayah Properties",
};

const DESC = "Review the terms and conditions governing your use of the Binayah Properties website and services.";

// The terms document is published in English only. All locale variants set
// canonical to the English URL so Google consolidates them rather than
// flagging them as "Duplicate without user-selected canonical".
const EN_CANONICAL = "https://www.binayah.ae/terms-of-service";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: TITLES[locale] ?? TITLES.en,
    description: DESC,
    alternates: { canonical: EN_CANONICAL },
  };
}

export default function TermsOfServicePage() {
  return <TermsOfServiceClient />;
}
