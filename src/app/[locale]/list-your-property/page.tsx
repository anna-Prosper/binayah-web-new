export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import ListPropertyForm from "@/components/ListPropertyForm";

export default async function ListYourPropertyPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/signin?callbackUrl=/list-your-property");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section
        className="relative pt-32 pb-20 text-white overflow-hidden"
        style={{ background: "linear-gradient(160deg, #0B3D2E 0%, #145C3F 40%, #1A7A5A 100%)" }}
      >
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)", backgroundSize: "48px 48px" }}
        />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 relative">
          <p className="text-accent font-semibold tracking-[0.4em] uppercase text-xs mb-4">Sell or Rent</p>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">List Your <span className="italic font-light">Property</span></h1>
          <p className="text-primary-foreground/70 text-lg">
            Reach thousands of qualified buyers and tenants. Submit your property and our team will handle the rest.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="bg-card border border-border/50 rounded-2xl shadow-sm p-8">
            <ListPropertyForm />
          </div>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
