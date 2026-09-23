export const dynamic = "force-dynamic";

export const metadata = {
  title: "Forgot Password | Binayah Properties",
  robots: { index: false, follow: false },
};

import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { pickRouteMessages } from "@/i18n/client-namespaces";
import { Suspense } from "react";
import ForgotPasswordClient from "./ForgotPasswordClient";

export default async function ForgotPasswordPage() {
  return (
    <NextIntlClientProvider messages={pickRouteMessages(await getMessages(), ["forgotPassword"])}>
      <Suspense>
        <ForgotPasswordClient />
      </Suspense>
    </NextIntlClientProvider>
  );
}
