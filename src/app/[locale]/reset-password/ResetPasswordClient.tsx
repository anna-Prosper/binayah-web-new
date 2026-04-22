"use client";

import { useState } from "react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";

export default function ResetPasswordClient() {
  const t = useTranslations("resetPassword");
  const searchParams = useSearchParams();
  const router = useRouter();
  const params = useParams<{ locale?: string }>();
  const locale = params?.locale || "en";
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [badToken, setBadToken] = useState(false);

  const validatePassword = (pw: string) =>
    /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/.test(pw);

  if (!token || badToken) {
    const msg = !token ? t("errors.invalidToken") : t("errors.expiredToken");
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Link
          href="/"
          className="absolute top-6 left-6 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> {t("backLink")}
        </Link>
        <div className="bg-card border border-border/50 rounded-2xl shadow-xl p-8 sm:p-10 text-center space-y-4 max-w-md w-full">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto">
            <span className="text-red-500 text-xl">!</span>
          </div>
          <p className="text-foreground font-medium">{msg}</p>
          <Link href="/forgot-password" className="block text-sm text-primary hover:underline">
            {t("requestNewLink")}
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!validatePassword(password)) {
      setError(t("errors.passwordTooWeak"));
      return;
    }
    if (password !== confirm) {
      setError(t("errors.passwordMismatch"));
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg = (data as { error?: string }).error || t("errors.expiredToken");
        if (res.status === 400) {
          setBadToken(true);
          return;
        }
        setError(msg);
        setLoading(false);
        return;
      }
      router.push(`/${locale}/signin?reset=1`);
    } catch {
      setError(t("errors.networkError"));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
          backgroundSize: "48px 48px",
        }}
      />
      <Link
        href="/"
        className="absolute top-6 left-6 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> {t("backLink")}
      </Link>
      <div className="relative w-full max-w-md">
        <div className="bg-card border border-border/50 rounded-2xl shadow-xl p-8 sm:p-10 flex flex-col items-center gap-6">
          {/* Logo */}
          <div className="flex flex-col items-center gap-3">
            <Link href="/" aria-label="Binayah home">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center hover:opacity-90 transition-opacity"
                style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
              >
                <span className="text-white font-bold text-2xl">B</span>
              </div>
            </Link>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
              <p className="text-sm text-muted-foreground mt-1">{t("subtitle")}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="w-full space-y-4" noValidate>
            <div>
              <label htmlFor="rp-password" className="block text-sm font-medium text-foreground mb-1.5">
                {t("newPasswordLabel")}
              </label>
              <div className="relative">
                <input
                  id="rp-password"
                  type={showPw ? "text" : "password"}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-11 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#1A7A5A]/30 focus:border-[#1A7A5A] transition"
                  placeholder={t("passwordPlaceholder")}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPw ? t("hidePassword") : t("showPassword")}
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {password && !validatePassword(password) && (
                <p className="text-xs text-amber-500 mt-1">{t("errors.passwordHintInline")}</p>
              )}
            </div>
            <div>
              <label htmlFor="rp-confirm" className="block text-sm font-medium text-foreground mb-1.5">
                {t("confirmPasswordLabel")}
              </label>
              <input
                id="rp-confirm"
                type={showPw ? "text" : "password"}
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#1A7A5A]/30 focus:border-[#1A7A5A] transition"
                placeholder={t("confirmPlaceholder")}
                required
              />
              {confirm && password !== confirm && (
                <p className="text-xs text-red-500 mt-1">{t("errors.mismatchInline")}</p>
              )}
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
            >
              {loading ? t("submitting") : t("submit")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
