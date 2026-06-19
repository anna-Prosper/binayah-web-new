/* eslint-disable i18next/no-literal-string -- OG image label text */
import { renderLandingOg, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/landingOg";

export const runtime = "edge";
export const alt = "Off-Plan Properties in Dubai — Binayah";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderLandingOg({ eyebrow: "Off-Plan", title: "Off-Plan Properties in Dubai" });
}
