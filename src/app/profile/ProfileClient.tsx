"use client";

import { signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { LogOut, Heart, Bell, User, Home } from "lucide-react";

interface Props {
  user: { id: string; name?: string | null; email?: string | null; image?: string | null };
}

export default function ProfileClient({ user }: Props) {
  return (
    <>
      {/* Hero */}
      <section
        className="relative pt-32 pb-20 text-white overflow-hidden"
        style={{ background: "linear-gradient(160deg, #0B3D2E 0%, #145C3F 40%, #1A7A5A 100%)" }}
      >
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)", backgroundSize: "48px 48px" }}
        />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative flex items-center gap-6">
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name || "User"}
              width={80}
              height={80}
              className="rounded-full border-4 border-white/20 flex-shrink-0"
            />
          ) : (
            <div className="w-20 h-20 rounded-full border-4 border-white/20 bg-white/10 flex items-center justify-center flex-shrink-0">
              <User className="h-8 w-8 text-white/70" />
            </div>
          )}
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold">{user.name || "My Profile"}</h1>
            <p className="text-primary-foreground/70 mt-1">{user.email}</p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">

          {/* Quick actions */}
          <div className="grid sm:grid-cols-3 gap-4">
            <Link
              href="/#offplan"
              className="bg-card border border-border/50 rounded-2xl p-6 flex flex-col gap-3 hover:border-primary/20 hover:shadow-md transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Heart className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground group-hover:text-primary transition-colors">My Favorites</p>
                <p className="text-sm text-muted-foreground">View saved properties</p>
              </div>
            </Link>

            <Link
              href="/list-your-property"
              className="bg-card border border-border/50 rounded-2xl p-6 flex flex-col gap-3 hover:border-primary/20 hover:shadow-md transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <Home className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="font-semibold text-foreground group-hover:text-primary transition-colors">List a Property</p>
                <p className="text-sm text-muted-foreground">Sell or rent your property</p>
              </div>
            </Link>

            <div className="bg-card border border-border/50 rounded-2xl p-6 flex flex-col gap-3 opacity-60">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <Bell className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Price Alerts</p>
                <p className="text-sm text-muted-foreground">Coming soon</p>
              </div>
            </div>
          </div>

          {/* Sign out */}
          <div className="bg-card border border-border/50 rounded-2xl p-6">
            <h2 className="font-semibold text-foreground mb-4">Account</h2>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600 font-medium transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
