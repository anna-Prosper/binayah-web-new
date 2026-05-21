export const dynamic = "force-dynamic";

export const metadata = {
  title: "Forgot Password | Binayah Properties",
  robots: { index: false, follow: false },
};

import { Suspense } from "react";
import ForgotPasswordClient from "./ForgotPasswordClient";

export default function ForgotPasswordPage() {
  return (
    <Suspense>
      <ForgotPasswordClient />
    </Suspense>
  );
}
