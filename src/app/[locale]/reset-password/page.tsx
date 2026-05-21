export const dynamic = "force-dynamic";

export const metadata = {
  title: "Reset Password | Binayah Properties",
  robots: { index: false, follow: false },
};

import { Suspense } from "react";
import ResetPasswordClient from "./ResetPasswordClient";

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordClient />
    </Suspense>
  );
}
