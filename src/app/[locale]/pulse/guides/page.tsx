import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import PulseEmirateNav from "@/components/PulseEmirateNav";
import GuidesClient from "./GuidesClient";

export const revalidate = 86400; // guides are static content

export const metadata = {
  title: "Property Investment Guides | Dubai Pulse | Binayah Properties",
  description: "In-depth guides on Dubai real estate investing — best areas, yields, off-plan vs secondary, and more.",
};

export default function GuidesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <PulseEmirateNav />
      <GuidesClient />
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
