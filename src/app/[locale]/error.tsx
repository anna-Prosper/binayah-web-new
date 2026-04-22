"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Home, RefreshCw, AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("common");

  useEffect(() => {
    console.error("[AppError]", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-center max-w-md">
        <div
          className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-8"
          style={{ background: "linear-gradient(135deg, #dc262620, #f59e0b20)" }}
        >
          <AlertTriangle className="h-10 w-10 text-orange-500" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
          {t("somethingWentWrong")}
        </h1>
        <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
          {t("errorMessage")}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white rounded-xl transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
          >
            <RefreshCw className="h-4 w-4" />
            {t("tryAgainButton")}
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-foreground border border-border rounded-xl hover:bg-muted transition-colors"
          >
            <Home className="h-4 w-4" />
            {t("backToHome")}
          </Link>
        </div>
        {error.digest && (
          <p className="mt-6 text-[10px] text-muted-foreground/50">
            {t("errorId")}: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
