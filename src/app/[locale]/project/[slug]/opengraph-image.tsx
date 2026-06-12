/* eslint-disable i18next/no-literal-string */
/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from "next/og";
import { getProject } from "@/lib/api";
import { applyTranslation } from "@/lib/applyTranslation";

export const runtime = "edge";
export const alt = "Off-plan project";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const project = applyTranslation(await getProject(slug), locale);
  if (!project) {
    return new ImageResponse(
      <div style={{ width: 1200, height: 630, background: "#0B3D2E", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#D4A847", fontSize: 48, fontFamily: "Arial" }}>Binayah Properties</div>
      </div>,
      { width: 1200, height: 630 }
    );
  }

  const priceStr = project.startingPrice
    ? `From ${project.currency || "AED"} ${(project.startingPrice < 1_000 ? project.startingPrice * 1_000_000 : project.startingPrice).toLocaleString("en-AE")}`
    : null;
  const bgUrl = project.featuredImage || project.imageGallery?.[0] || null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          position: "relative",
          fontFamily: "Arial, sans-serif",
          overflow: "hidden",
        }}
      >
        {/* Background */}
        {bgUrl ? (
          <img
            src={bgUrl}
            alt=""
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }} />
        )}

        {/* Dark gradient overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 55%, rgba(0,0,0,0.15) 100%)",
            display: "flex",
          }}
        />

        {/* Gold bottom bar */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: "linear-gradient(to right, #D4A847, #B8922F)",
          }}
        />

        {/* Content */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "48px 64px",
          }}
        >
          {/* Top: brand + label */}
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ fontSize: "13px", color: "#D4A847", letterSpacing: "0.3em", textTransform: "uppercase", fontWeight: 700 }}>
              BINAYAH PROPERTIES
            </div>
            <div style={{ width: "1px", height: "14px", background: "rgba(255,255,255,0.3)", margin: "0 16px" }} />
            <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", letterSpacing: "0.2em", textTransform: "uppercase" }}>
              OFF-PLAN PROJECT
            </div>
          </div>

          {/* Bottom: project info */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {(project.developerName || project.community) && (
              <div style={{ fontSize: "15px", color: "rgba(255,255,255,0.7)", letterSpacing: "0.15em", textTransform: "uppercase" }}>
                {[project.developerName, project.community].filter(Boolean).join(" · ")}
              </div>
            )}
            <div
              style={{
                fontSize: project.name.length > 40 ? "40px" : "52px",
                fontWeight: 700,
                color: "#ffffff",
                lineHeight: 1.1,
                letterSpacing: "-0.01em",
              }}
            >
              {project.name.length > 70 ? project.name.slice(0, 67) + "..." : project.name}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "20px", marginTop: "8px" }}>
              {priceStr && (
                <div style={{ fontSize: "26px", fontWeight: 700, color: "#D4A847" }}>
                  {priceStr}
                </div>
              )}
              {project.completionDate && (
                <div style={{ fontSize: "15px", color: "rgba(255,255,255,0.7)", background: "rgba(255,255,255,0.1)", padding: "6px 16px", borderRadius: "4px" }}>
                  {`Completion ${project.completionDate}`}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: { "Cache-Control": "public, max-age=86400, s-maxage=86400" },
    }
  );
}
