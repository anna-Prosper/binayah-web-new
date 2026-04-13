"use client";

import Link from "next/link";
import { ArrowLeft, Building2, MapPin, Calendar, TrendingUp, Play, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

interface Video {
  title: string;
  url: string;
}

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
  videos: Video[];
}

const progressColor = (p: number | null) => {
  if (p === null) return "bg-gray-300";
  if (p >= 100) return "bg-emerald-500";
  if (p >= 75) return "bg-blue-500";
  if (p >= 50) return "bg-amber-500";
  if (p >= 25) return "bg-orange-500";
  return "bg-red-400";
};

function getYouTubeEmbedUrl(url: string) {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^?&]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

export default function ConstructionUpdateDetailClient({
  update,
  related,
}: {
  update: ConstructionUpdate;
  related: ConstructionUpdate[];
}) {
  const progress = update.progress ?? 0;
  const isCompleted = progress >= 100;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        {/* Hero */}
        <section className="relative">
          <div className="aspect-[21/9] sm:aspect-[3/1] bg-muted overflow-hidden">
            {update.thumbnail ? (
              <img
                src={update.thumbnail}
                alt={update.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <Building2 className="w-16 h-16 text-muted-foreground/20" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-8">
            <div className="container mx-auto">
              <Link
                href="/construction-updates"
                className="inline-flex items-center gap-1.5 text-xs text-white/60 hover:text-white mb-3 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Construction Updates
              </Link>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white max-w-3xl">
                {update.mainTitle || update.title}
              </h1>

              <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-3">
                {update.developerName && (
                  <div className="flex items-center gap-1.5 text-sm text-white/80">
                    <Building2 className="w-4 h-4" />
                    <span>{update.developerName}</span>
                  </div>
                )}
                {update.projectLocation && (
                  <div className="flex items-center gap-1.5 text-sm text-white/80">
                    <MapPin className="w-4 h-4" />
                    <span>{update.projectLocation}</span>
                  </div>
                )}
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-white ${progressColor(update.progress)}`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  {isCompleted ? "Completed" : `${Math.round(progress)}% Complete`}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main */}
            <div className="lg:col-span-2 space-y-8">
              {/* Progress */}
              <div className="bg-card rounded-2xl border border-border p-5 sm:p-6">
                <h2 className="text-lg font-bold text-foreground mb-4">Construction Progress</h2>
                <div className="relative">
                  <div className="h-4 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${progressColor(update.progress)}`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                  <p className="text-center mt-2 text-2xl font-bold text-foreground">
                    {isCompleted ? "100% — Completed" : `${Math.round(progress)}%`}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6">
                  {update.launchDate && (
                    <div className="bg-muted/50 rounded-xl p-3 sm:p-4">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Launch Date
                      </div>
                      <p className="text-sm font-semibold text-foreground">{update.launchDate}</p>
                    </div>
                  )}
                  {update.completionDate && (
                    <div className="bg-muted/50 rounded-xl p-3 sm:p-4">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {isCompleted ? "Completed" : "Expected Handover"}
                      </div>
                      <p className="text-sm font-semibold text-foreground">{update.completionDate}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Videos */}
              {update.videos.length > 0 && (
                <div className="bg-card rounded-2xl border border-border p-5 sm:p-6">
                  <h2 className="text-lg font-bold text-foreground mb-4">Construction Videos</h2>
                  <div className="space-y-4">
                    {update.videos.map((video, i) => {
                      const embedUrl = getYouTubeEmbedUrl(video.url);
                      return (
                        <div key={i}>
                          {video.title && (
                            <p className="text-sm font-medium text-foreground mb-2">{video.title}</p>
                          )}
                          {embedUrl ? (
                            <div className="aspect-video rounded-xl overflow-hidden">
                              <iframe
                                src={embedUrl}
                                title={video.title || `Construction video ${i + 1}`}
                                className="w-full h-full"
                                allowFullScreen
                                loading="lazy"
                              />
                            </div>
                          ) : (
                            <a
                              href={video.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-4 py-3 bg-muted/50 rounded-xl text-sm text-primary hover:underline"
                            >
                              <Play className="w-4 h-4" />
                              Watch Video
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Project Info */}
              <div className="bg-card rounded-2xl border border-border p-5">
                <h3 className="text-sm font-bold text-foreground mb-3">Project Details</h3>
                <dl className="space-y-3 text-sm">
                  <div>
                    <dt className="text-muted-foreground text-xs">Project</dt>
                    <dd className="font-medium text-foreground">{update.title}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground text-xs">Developer</dt>
                    <dd className="font-medium text-foreground">{update.developerName || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground text-xs">Location</dt>
                    <dd className="font-medium text-foreground">{update.projectLocation || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground text-xs">Status</dt>
                    <dd className="font-medium text-foreground">{isCompleted ? "Completed" : "Under Construction"}</dd>
                  </div>
                </dl>
              </div>

              {/* CTA */}
              <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-5 text-center">
                <p className="text-sm font-bold text-primary-foreground mb-1">Interested in this project?</p>
                <p className="text-xs text-primary-foreground/70 mb-4">Get exclusive pricing and availability</p>
                <a
                  href={`https://wa.me/971543048?text=I'm interested in ${update.title}. Please share updates.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-primary rounded-xl text-sm font-semibold hover:bg-white/90 transition-colors"
                >
                  Get in Touch
                </a>
              </div>

              {/* Related */}
              {related.length > 0 && (
                <div className="bg-card rounded-2xl border border-border p-5">
                  <h3 className="text-sm font-bold text-foreground mb-3">
                    More from {update.developerName}
                  </h3>
                  <div className="space-y-2.5">
                    {related.map((r) => (
                      <Link
                        key={r._id}
                        href={`/construction-updates/${r.slug}`}
                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors group"
                      >
                        {r.thumbnail ? (
                          <img
                            src={r.thumbnail}
                            alt={r.title}
                            className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                            <Building2 className="w-5 h-5 text-muted-foreground/30" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground truncate group-hover:text-primary transition-colors">
                            {r.title}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {r.progress !== null ? `${Math.round(r.progress)}%` : "N/A"}
                          </p>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
