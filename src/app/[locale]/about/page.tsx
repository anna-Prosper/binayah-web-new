import AboutPageClient from "./AboutPageClient";

export const revalidate = 86400;

export const metadata = {
  title: "About Binayah Properties | Dubai's Trusted Real Estate Agency",
  description: "Learn about Binayah Properties — Dubai's trusted real estate agency since 2007. RERA-certified team, AI-powered search, 2,500+ listings.",
  alternates: {
    canonical: 'https://www.binayah.ae/en/',
    languages: { en: 'https://www.binayah.ae/en/', ru: 'https://www.binayah.ae/ru/', ar: 'https://www.binayah.ae/ar/', zh: 'https://www.binayah.ae/zh/', 'x-default': 'https://www.binayah.ae/en/' },
  },
};

export default function Page() {
  return <AboutPageClient />;
}
