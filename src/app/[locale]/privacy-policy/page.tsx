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

const DESCS: Record<string, string> = {
  en: "Learn how Binayah Properties collects, uses, and protects your personal information.",
  fr: "Découvrez comment Binayah Properties collecte, utilise et protège vos informations personnelles.",
  ru: "Узнайте, как Binayah Properties собирает, использует и защищает вашу личную информацию.",
  ar: "تعرّف على كيفية جمع بناية للعقارات لمعلوماتك الشخصية واستخدامها وحمايتها.",
  zh: "了解 Binayah Properties 如何收集、使用和保护您的个人信息。",
  vi: "Tìm hiểu cách Binayah Properties thu thập, sử dụng và bảo vệ thông tin cá nhân của bạn.",
  he: "למדו כיצד Binayah Properties אוספת, משתמשת ומגנה על המידע האישי שלכם.",
};

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
    description: DESCS[locale] ?? DESCS.en,
    alternates: { canonical: EN_CANONICAL },
  };
}

export default function PrivacyPolicyPage() {
  return <PrivacyPolicyClient />;
}
