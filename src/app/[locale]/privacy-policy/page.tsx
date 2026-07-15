import type { Metadata } from "next";
import PrivacyPolicyClient from "./PrivacyPolicyClient";

export const revalidate = 86400;

const TITLES: Record<string, string> = {
  en: "Privacy Policy | Binayah Properties",
  fr: "Politique de confidentialité | Binayah Properties",
  ru: "Политика конфиденциальности | Binayah Properties",
  ar: "سياسة الخصوصية | بناية للعقارات",
  zh: "隐私政策 | Binayah Properties",
  vi: "Chính sách bảo mật | Binayah Properties",
  he: "מדיניות הפרטיות | Binayah Properties",
};

const DESC = "Learn how Binayah Properties collects, uses, and protects your personal information.";

// The policy document is published in English only. All locale variants set
// canonical to the English URL so Google consolidates them rather than
// flagging them as "Duplicate without user-selected canonical".
const EN_CANONICAL = "https://www.binayah.ae/privacy-policy";

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

export default function PrivacyPolicyPage() {
  return <PrivacyPolicyClient />;
}
