import { NextResponse } from "next/server";
import { serverApiUrl } from "@/lib/api";

export const revalidate = 86400;

export async function GET() {
  try {
    const url = serverApiUrl("/api/market-data/rates");
    if (url.startsWith("/")) return NextResponse.json({});
    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) return NextResponse.json({});
    const data = await res.json();
    return NextResponse.json(data.rates ?? {});
  } catch {
    return NextResponse.json({});
  }
}
