export const dynamic = "force-dynamic";

export const metadata = {
  title: "Sign In | Binayah Properties",
  description: "Sign in to your Binayah Properties account to save favourites and manage your listings.",
};

import SignInClient from "./SignInClient";

export default function SignInPage() {
  return <SignInClient />;
}
