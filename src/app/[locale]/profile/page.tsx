export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import ProfileClient from "./ProfileClient";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/signin?callbackUrl=/profile");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ProfileClient user={session.user} />
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
