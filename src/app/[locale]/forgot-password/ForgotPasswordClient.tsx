"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";

export default function ForgotPasswordClient() {
  const t = useTranslations("forgotPassword");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email) {
      setError(t("errors.enterEmail"));
      return;
    }
    setLoading(true);
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } catch {
      // swallow — still show success
    }
    setLoading(false);
    setDone(true);
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

          {done ? (
            <div className="w-full text-center space-y-4">
              <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-foreground text-sm">
                {t("successMessage")}
              </div>
              <Link
                href="/signin"
                className="block text-sm text-primary hover:underline"
              >
                {t("backToSignIn")}
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="w-full space-y-4" noValidate>
              <div>
                <label htmlFor="fp-email" className="block text-sm font-medium text-foreground mb-1.5">
                  {t("emailLabel")}
                </label>
                <input
                  id="fp-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#1A7A5A]/30 focus:border-[#1A7A5A] transition"
                  placeholder={t("emailPlaceholder")}
                  required
                />
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
              <div className="text-center">
                <Link href="/signin" className="text-sm text-muted-foreground hover:text-foreground">
                  {t("backToSignIn")}
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
