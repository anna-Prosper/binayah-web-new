export const dynamic = "force-dynamic";

export const metadata = {
  title: "My Profile | Binayah Properties",
  robots: { index: false, follow: false },
};

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
// Locale-aware redirect: the bare "/signin" this used to pass resolved to the
// DEFAULT locale, so a signed-out Russian visitor landed on the English sign-in.
import { redirect } from "@/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProfileClient from "./ProfileClient";

export default async function ProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await getServerSession(authOptions);
  // callbackUrl must carry the locale too, so the post-login bounce returns the
  // user to their own /<locale>/profile rather than the English one.
  if (!session) {
    const callbackUrl = locale === "en" ? "/profile" : `/${locale}/profile`;
    // `return` keeps TS narrowing `session` below; next-intl's redirect is typed
    // to return `never`, but only a direct call in tail position narrows here.
    return redirect({ href: `/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`, locale });
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ProfileClient user={session.user} />
      <Footer />
    </div>
  );
}
