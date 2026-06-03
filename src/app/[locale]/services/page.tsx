import ServicesPageClient from "./ServicesPageClient";

export const revalidate = 86400;

export const metadata = {
  title: "Real Estate Services in Dubai | Binayah Properties",
  description: "Full-service Dubai real estate: buying, selling, renting, off-plan investment, property management and valuations. 15+ years of expertise.",
  alternates: {
    canonical: 'https://www.binayah.ae/en/',
    languages: { en: 'https://www.binayah.ae/en/', ru: 'https://www.binayah.ae/ru/', ar: 'https://www.binayah.ae/ar/', zh: 'https://www.binayah.ae/zh/', 'x-default': 'https://www.binayah.ae/en/' },
  },
};

export default function Page() {
  return <ServicesPageClient />;
}
