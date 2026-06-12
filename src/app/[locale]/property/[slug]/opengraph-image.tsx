/* eslint-disable i18next/no-literal-string */
/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from "next/og";
import { getListing } from "@/lib/api";

export const runtime = "edge";
export const alt = "Property listing";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getListing(slug);
  if (!data) {
    return new ImageResponse(
      <div style={{ width: 1200, height: 630, background: "#0B3D2E", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#D4A847", fontSize: 48, fontFamily: "Arial" }}>Binayah Properties</div>
      </div>,
      { width: 1200, height: 630 }
    );
  }

  const { listing } = data;
  const priceStr = listing.price
    ? `${listing.currency || "AED"} ${Math.round(listing.price).toLocaleString("en-AE")}`
    : null;
  const bedsStr = listing.bedrooms != null
    ? listing.bedrooms === 0 ? "Studio" : `${listing.bedrooms} Bedroom${listing.bedrooms > 1 ? "s" : ""}`
    : null;
  const sizeStr = listing.size ? `${listing.size.toLocaleString()} ${listing.sizeUnit || "sqft"}` : null;
  const title = listing.name || listing.title || "Property";
  const bgUrl = listing.featuredImage || null;

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

        {/* Dark overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.15) 100%)",
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
          {/* Top: brand */}
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ fontSize: "13px", color: "#D4A847", letterSpacing: "0.3em", textTransform: "uppercase", fontWeight: 700 }}>
              BINAYAH PROPERTIES
            </div>
            {listing.listingType && (
              <>
                <div style={{ width: "1px", height: "14px", background: "rgba(255,255,255,0.3)", margin: "0 16px" }} />
                <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", letterSpacing: "0.2em", textTransform: "uppercase" }}>
                  FOR {listing.listingType.toUpperCase()}
                </div>
              </>
            )}
          </div>

          {/* Bottom: property info */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {listing.community && (
              <div style={{ fontSize: "15px", color: "rgba(255,255,255,0.7)", letterSpacing: "0.15em", textTransform: "uppercase" }}>
                {listing.community}
              </div>
            )}
            <div
              style={{
                fontSize: title.length > 50 ? "36px" : "44px",
                fontWeight: 700,
                color: "#ffffff",
                lineHeight: 1.15,
                letterSpacing: "-0.01em",
              }}
            >
              {title.length > 80 ? title.slice(0, 77) + "..." : title}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "20px", marginTop: "8px" }}>
              {priceStr && (
                <div style={{ fontSize: "28px", fontWeight: 700, color: "#D4A847", letterSpacing: "-0.01em" }}>
                  {priceStr}
                </div>
              )}
              {bedsStr && (
                <div style={{ fontSize: "15px", color: "rgba(255,255,255,0.75)", background: "rgba(255,255,255,0.1)", padding: "6px 16px", borderRadius: "4px" }}>
                  {bedsStr}
                </div>
              )}
              {sizeStr && (
                <div style={{ fontSize: "15px", color: "rgba(255,255,255,0.75)", background: "rgba(255,255,255,0.1)", padding: "6px 16px", borderRadius: "4px" }}>
                  {sizeStr}
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
