export const dynamic = "force-dynamic";

export const metadata = {
  title: "Reset Password | Binayah Properties",
  robots: { index: false, follow: false },
};

import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { pickRouteMessages } from "@/i18n/client-namespaces";
import { Suspense } from "react";
import ResetPasswordClient from "./ResetPasswordClient";

export default async function ResetPasswordPage() {
  return (
    <NextIntlClientProvider messages={pickRouteMessages(await getMessages(), ["resetPassword"])}>
      <Suspense>
        <ResetPasswordClient />
      </Suspense>
    </NextIntlClientProvider>
  );
}
