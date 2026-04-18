"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, ArrowLeft, CheckCircle2 } from "lucide-react";

type Tab = "signin" | "signup";

export default function SignInClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const resetSuccess = searchParams.get("reset") === "1";
  const [tab, setTab] = useState<Tab>("signin");
  const [googleLoading, setGoogleLoading] = useState(false);

  // Sign-in form
  const [siEmail, setSiEmail] = useState("");
  const [siPassword, setSiPassword] = useState("");
  const [siShowPw, setSiShowPw] = useState(false);
  const [siError, setSiError] = useState("");
  const [siLoading, setSiLoading] = useState(false);

  // Sign-up form
  const [suName, setSuName] = useState("");
  const [suEmail, setSuEmail] = useState("");
  const [suPassword, setSuPassword] = useState("");
  const [suShowPw, setSuShowPw] = useState(false);
  const [suError, setSuError] = useState("");
  const [suLoading, setSuLoading] = useState(false);

  const validatePassword = (pw: string) =>
    /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/.test(pw);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSiError("");
    if (!siEmail || !siPassword) {
      setSiError("Please enter your email and password.");
      return;
    }
    setSiLoading(true);
    const res = await signIn("credentials", {
      email: siEmail,
      password: siPassword,
      redirect: false,
      callbackUrl,
    });
    setSiLoading(false);
    if (res?.error) {
      setSiError("Invalid email or password.");
    } else {
      router.push(callbackUrl);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuError("");
    if (!suName.trim()) {
      setSuError("Please enter your name.");
      return;
    }
    if (!suEmail) {
      setSuError("Please enter your email.");
      return;
    }
    if (!validatePassword(suPassword)) {
      setSuError("Password must be at least 8 characters with a letter and a digit.");
      return;
    }
    setSuLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: suName.trim(), email: suEmail, password: suPassword }),
      });
      if (res.status === 409) {
        setSuLoading(false);
        setSuError("This email is already registered. Try signing in.");
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setSuLoading(false);
        setSuError((data as { error?: string }).error || "Something went wrong. Please try again.");
        return;
      }
      // Auto sign-in
      const signInRes = await signIn("credentials", {
        email: suEmail,
        password: suPassword,
        redirect: false,
        callbackUrl,
      });
      setSuLoading(false);
      if (signInRes?.error) {
        setSuError("Account created! Please sign in.");
        setTab("signin");
      } else {
        router.push(callbackUrl);
      }
    } catch {
      setSuLoading(false);
      setSuError("Network error. Please try again.");
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
        <ArrowLeft className="h-4 w-4" /> Back to Binayah
      </Link>
      <div className="relative w-full max-w-md">
        {resetSuccess && (
          <div className="mb-4 flex items-center gap-2 p-3.5 rounded-xl bg-primary/10 border border-primary/20 text-sm text-foreground">
            <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
            Password reset successfully. Please sign in with your new password.
          </div>
        )}
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
              <h1 className="text-2xl font-bold text-foreground">Welcome to Binayah</h1>
              <p className="text-sm text-muted-foreground mt-1">Sign in to save favorites &amp; more</p>
            </div>
          </div>

          {/* Google sign-in */}
          <button
            onClick={() => { setGoogleLoading(true); signIn("google", { callbackUrl }); }}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 px-6 py-3.5 border border-border rounded-xl bg-background hover:bg-muted/50 transition-colors font-medium text-foreground disabled:opacity-70"
            aria-label="Continue with Google"
          >
            {googleLoading ? (
              <div className="w-5 h-5 border-2 border-border border-t-primary rounded-full animate-spin" />
            ) : (
              <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            )}
            {googleLoading ? "Redirecting to Google…" : "Continue with Google"}
          </button>

          {/* Divider */}
          <div className="w-full flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Tabs */}
          <div className="w-full flex rounded-xl border border-border overflow-hidden">
            <button
              onClick={() => setTab("signin")}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                tab === "signin"
                  ? "bg-[#0B3D2E] text-white"
                  : "bg-background text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign in
            </button>
            <button
              onClick={() => setTab("signup")}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                tab === "signup"
                  ? "bg-[#0B3D2E] text-white"
                  : "bg-background text-muted-foreground hover:text-foreground"
              }`}
            >
              Create account
            </button>
          </div>

          {/* Sign-in form */}
          {tab === "signin" && (
            <form onSubmit={handleSignIn} className="w-full space-y-4" noValidate>
              <div>
                <label htmlFor="si-email" className="block text-sm font-medium text-foreground mb-1.5">
                  Email
                </label>
                <input
                  id="si-email"
                  type="email"
                  autoComplete="email"
                  value={siEmail}
                  onChange={(e) => setSiEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#1A7A5A]/30 focus:border-[#1A7A5A] transition"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="si-password" className="block text-sm font-medium text-foreground">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="si-password"
                    type={siShowPw ? "text" : "password"}
                    autoComplete="current-password"
                    value={siPassword}
                    onChange={(e) => setSiPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-11 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#1A7A5A]/30 focus:border-[#1A7A5A] transition"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setSiShowPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={siShowPw ? "Hide password" : "Show password"}
                  >
                    {siShowPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              {siError && (
                <p className="text-sm text-red-500">{siError}</p>
              )}
              <button
                type="submit"
                disabled={siLoading}
                className="w-full py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60"
                style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
              >
                {siLoading ? "Signing in…" : "Sign in"}
              </button>
            </form>
          )}

          {/* Sign-up form */}
          {tab === "signup" && (
            <form onSubmit={handleSignUp} className="w-full space-y-4" noValidate>
              <div>
                <label htmlFor="su-name" className="block text-sm font-medium text-foreground mb-1.5">
                  Full name
                </label>
                <input
                  id="su-name"
                  type="text"
                  autoComplete="name"
                  value={suName}
                  onChange={(e) => setSuName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#1A7A5A]/30 focus:border-[#1A7A5A] transition"
                  placeholder="Jane Smith"
                  required
                />
              </div>
              <div>
                <label htmlFor="su-email" className="block text-sm font-medium text-foreground mb-1.5">
                  Email
                </label>
                <input
                  id="su-email"
                  type="email"
                  autoComplete="email"
                  value={suEmail}
                  onChange={(e) => setSuEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#1A7A5A]/30 focus:border-[#1A7A5A] transition"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div>
                <label htmlFor="su-password" className="block text-sm font-medium text-foreground mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="su-password"
                    type={suShowPw ? "text" : "password"}
                    autoComplete="new-password"
                    value={suPassword}
                    onChange={(e) => setSuPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-11 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#1A7A5A]/30 focus:border-[#1A7A5A] transition"
                    placeholder="Min 8 chars, letter + digit"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setSuShowPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={suShowPw ? "Hide password" : "Show password"}
                  >
                    {suShowPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {suPassword && !validatePassword(suPassword) && (
                  <p className="text-xs text-amber-500 mt-1">
                    At least 8 characters with a letter and a digit.
                  </p>
                )}
              </div>
              {suError && (
                <p className="text-sm text-red-500">{suError}</p>
              )}
              <button
                type="submit"
                disabled={suLoading}
                className="w-full py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60"
                style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
              >
                {suLoading ? "Creating account…" : "Create account"}
              </button>
            </form>
          )}

          <p className="text-xs text-muted-foreground text-center">
            By signing in you agree to our{" "}
            <a href="/privacy" className="underline hover:text-foreground">Privacy Policy</a>
            {" "}and{" "}
            <a href="/terms" className="underline hover:text-foreground">Terms of Service</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
