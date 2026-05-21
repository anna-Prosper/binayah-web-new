"use client";

import Link from "next/link";
import { useState } from "react";
import { Building2, Search, Filter, MapPin, Calendar, TrendingUp } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { useTranslations } from "next-intl";

interface ConstructionUpdate {
  _id: string;
  title: string;
  slug: string;
  mainTitle: string;
  developerName: string;
  projectLocation: string;
  progress: number | null;
  launchDate: string;
  completionDate: string;
  thumbnail: string;
  videos: { title: string; url: string }[];
}

const progressColor = (p: number | null) => {
  if (p === null) return "bg-gray-300";
  if (p >= 100) return "bg-emerald-500";
  if (p >= 75) return "bg-blue-500";
  if (p >= 50) return "bg-amber-500";
  if (p >= 25) return "bg-orange-500";
  return "bg-red-400";
};

const progressLabel = (p: number | null) => {
  if (p === null) return "N/A";
  if (p >= 100) return "Completed";
  return `${Math.round(p)}%`;
};

type FilterType = "all" | "in-progress" | "completed";

export default function ConstructionUpdatesClient({ updates }: { updates: ConstructionUpdate[] }) {
  const t = useTranslations("constructionUpdates");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");

  const filtered = updates.filter((u) => {
    const matchesSearch =
      !search ||
      u.title.toLowerCase().includes(search.toLowerCase()) ||
      u.developerName.toLowerCase().includes(search.toLowerCase()) ||
      u.projectLocation.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === "all" ||
      (filter === "completed" && u.progress !== null && u.progress >= 100) ||
      (filter === "in-progress" && (u.progress === null || u.progress < 100));

    return matchesSearch && matchesFilter;
  });

  const totalCompleted = updates.filter((u) => u.progress !== null && u.progress >= 100).length;
  const totalInProgress = updates.filter((u) => u.progress === null || u.progress < 100).length;
  const avgProgress = updates.reduce((sum, u) => sum + (u.progress || 0), 0) / updates.length;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        {/* Hero */}
        <section className="bg-gradient-to-br from-primary via-primary/95 to-primary/85 py-12 sm:py-16">
          <div className="container mx-auto px-4 sm:px-6">
            <p className="text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase text-amber-300 mb-3">
              {t("heroLabel")}
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
              {t("heroTitle")} <em className="font-serif font-normal text-white/90">{t("heroTitleItalic")}</em>
            </h1>
            <p className="mt-3 text-sm sm:text-base text-white/70 max-w-xl">
              {t("heroSubtitle")}
            </p>

            {/* Stats */}
            <div className="flex flex-wrap gap-4 sm:gap-6 mt-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 text-center min-w-[100px]">
                <p className="text-xl sm:text-2xl font-bold text-white">{updates.length}</p>
                <p className="text-[10px] sm:text-xs text-white/60">{t("totalProjects")}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 text-center min-w-[100px]">
                <p className="text-xl sm:text-2xl font-bold text-emerald-300">{totalCompleted}</p>
                <p className="text-[10px] sm:text-xs text-white/60">{t("filterCompleted")}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 text-center min-w-[100px]">
                <p className="text-xl sm:text-2xl font-bold text-amber-300">{totalInProgress}</p>
                <p className="text-[10px] sm:text-xs text-white/60">{t("filterInProgress")}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 text-center min-w-[100px]">
                <p className="text-xl sm:text-2xl font-bold text-white">{Math.round(avgProgress)}%</p>
                <p className="text-[10px] sm:text-xs text-white/60">{t("completionProgress")}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={t("searchPlaceholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="flex gap-2">
              {(["all", "in-progress", "completed"] as FilterType[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors ${
                    filter === f
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border border-border text-muted-foreground hover:bg-accent"
                  }`}
                >
                  {f === "all" ? t("filterAll") : f === "in-progress" ? t("filterInProgress") : t("filterCompleted")}
                </button>
              ))}
            </div>
          </div>

          <p className="text-xs text-muted-foreground mt-3">
            {t("showing", { filtered: filtered.length, total: updates.length })}
          </p>
        </section>

        {/* Grid */}
        <section className="container mx-auto px-4 sm:px-6 pb-12 sm:pb-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filtered.map((update) => (
              <Link
                key={update._id}
                href={`/construction-updates/${update.slug}`}
                className="group bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg hover:border-primary/20 transition-all duration-300"
              >
                {/* Thumbnail */}
                <div className="relative aspect-[16/10] bg-muted overflow-hidden">
                  {update.thumbnail ? (
                    <img
                      src={update.thumbnail}
                      alt={update.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Building2 className="w-10 h-10 text-muted-foreground/30" />
                    </div>
                  )}

                  {/* Progress badge */}
                  <div className="absolute top-3 right-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold text-white shadow-lg ${progressColor(update.progress)}`}
                    >
                      <TrendingUp className="w-3 h-3" />
                      {progressLabel(update.progress)}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-sm sm:text-base text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                    {update.title}
                  </h3>

                  <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
                    <Building2 className="w-3.5 h-3.5" />
                    <span className="truncate">{update.developerName || "—"}</span>
                  </div>

                  {update.projectLocation && (
                    <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{update.projectLocation}</span>
                    </div>
                  )}

                  {/* Progress bar */}
                  {update.progress !== null && (
                    <div className="mt-3">
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${progressColor(update.progress)}`}
                          style={{ width: `${Math.min(update.progress, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Dates */}
                  <div className="flex items-center justify-between mt-3 text-[10px] sm:text-xs text-muted-foreground">
                    {update.launchDate && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{t("launchLabel")}: {update.launchDate}</span>
                      </div>
                    )}
                    {update.completionDate && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{t("handoverLabel")}: {update.completionDate}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <Building2 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">{t("noMatch")}</p>
            </div>
          )}
        </section>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
