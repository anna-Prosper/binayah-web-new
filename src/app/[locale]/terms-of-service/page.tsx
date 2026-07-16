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

const DESCS: Record<string, string> = {
  en: "Review the terms and conditions governing your use of the Binayah Properties website and services.",
  fr: "Consultez les conditions générales régissant votre utilisation du site et des services de Binayah Properties.",
  ru: "Ознакомьтесь с условиями использования веб-сайта и услуг Binayah Properties.",
  ar: "اطّلع على الشروط والأحكام التي تحكم استخدامك لموقع وخدمات بناية للعقارات.",
  zh: "查看管辖您使用 Binayah Properties 网站及服务的条款和条件。",
  vi: "Xem lại các điều khoản và điều kiện điều chỉnh việc bạn sử dụng trang web và dịch vụ của Binayah Properties.",
  he: "עיינו בתנאים וההגבלות החלים על השימוש שלכם באתר ובשירותים של Binayah Properties.",
};

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
    description: DESCS[locale] ?? DESCS.en,
    alternates: { canonical: EN_CANONICAL },
  };
}

export default function TermsOfServicePage() {
  return <TermsOfServiceClient />;
}
