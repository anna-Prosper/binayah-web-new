import { ValuationPage } from "@/components/valuation";

export const revalidate = 86400;

export const metadata = {
  title: "Property Valuation | Binayah",
  description: "Get an instant AI-powered valuation for UAE properties.",
};

export default function Page() {
  return <ValuationPage />;
}
