"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordClient() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email) {
      setError("Please enter your email address.");
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
      <div className="relative w-full max-w-md">
        <div className="bg-card border border-border/50 rounded-2xl shadow-xl p-8 sm:p-10 flex flex-col items-center gap-6">
          {/* Logo */}
          <div className="flex flex-col items-center gap-3">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
            >
              <span className="text-white font-bold text-2xl">B</span>
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-foreground">Forgot password?</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Enter your email and we&apos;ll send a reset link.
              </p>
            </div>
          </div>

          {done ? (
            <div className="w-full text-center space-y-4">
              <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm">
                If that email is registered, a reset link has been sent. Check your inbox (and spam folder).
              </div>
              <Link
                href="/signin"
                className="block text-sm text-[#1A7A5A] hover:underline"
              >
                Back to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="w-full space-y-4" noValidate>
              <div>
                <label htmlFor="fp-email" className="block text-sm font-medium text-foreground mb-1.5">
                  Email address
                </label>
                <input
                  id="fp-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#1A7A5A]/30 focus:border-[#1A7A5A] transition"
                  placeholder="you@example.com"
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
                {loading ? "Sending…" : "Send reset link"}
              </button>
              <div className="text-center">
                <Link href="/signin" className="text-sm text-muted-foreground hover:text-foreground">
                  Back to sign in
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
