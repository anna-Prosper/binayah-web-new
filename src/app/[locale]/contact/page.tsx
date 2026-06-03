import ContactPageClient from "./ContactPageClient";

export const revalidate = 86400;

export const metadata = {
  title: "Contact Binayah Properties | Dubai Real Estate Experts",
  description: "Get in touch with Binayah Properties for buying, selling, renting or investing in Dubai real estate. Call, WhatsApp or email our team.",
  alternates: {
    canonical: 'https://www.binayah.ae/en/',
    languages: { en: 'https://www.binayah.ae/en/', ru: 'https://www.binayah.ae/ru/', ar: 'https://www.binayah.ae/ar/', zh: 'https://www.binayah.ae/zh/', 'x-default': 'https://www.binayah.ae/en/' },
  },
};

export default function Page() {
  return <ContactPageClient />;
}
