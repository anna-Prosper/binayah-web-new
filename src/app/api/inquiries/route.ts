export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  console.log("New inquiry:", body);
  return NextResponse.json({ success: true, message: "Inquiry received" });
}
