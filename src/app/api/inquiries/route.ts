export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Inquiry from "@/models/Inquiry";
import nodemailer from "nodemailer";

async function sendEmailNotification(data: any) {
  // Only send if SMTP credentials are configured
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const to = process.env.INQUIRY_EMAIL || "info@binayah.com";

  if (!user || !pass) {
    console.log("SMTP not configured, skipping email notification");
    return;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });

  const propertyInfo = data.propertyTitle
    ? `\nProperty: ${data.propertyTitle}\nLink: https://binayah.com/property/${data.propertySlug || ""}`
    : "";

  await transporter.sendMail({
    from: `"Binayah Website" <${user}>`,
    to,
    subject: `New Inquiry from ${data.name}${data.propertyTitle ? ` — ${data.propertyTitle}` : ""}`,
    text: `New inquiry received:\n\nName: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone || "Not provided"}\nType: ${data.inquiryType || data.type || "General"}${propertyInfo}\n\nMessage:\n${data.message || "No message"}\n\n---\nSent from binayah.com`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <div style="background: #0d3d2d; padding: 20px; border-radius: 12px 12px 0 0;">
          <h2 style="color: white; margin: 0;">New Inquiry</h2>
        </div>
        <div style="padding: 24px; border: 1px solid #e5e5e5; border-top: none; border-radius: 0 0 12px 12px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #888; width: 100px;">Name</td><td style="padding: 8px 0; font-weight: bold;">${data.name}</td></tr>
            <tr><td style="padding: 8px 0; color: #888;">Email</td><td style="padding: 8px 0;"><a href="mailto:${data.email}">${data.email}</a></td></tr>
            <tr><td style="padding: 8px 0; color: #888;">Phone</td><td style="padding: 8px 0;"><a href="tel:${data.phone || ""}">${data.phone || "Not provided"}</a></td></tr>
            <tr><td style="padding: 8px 0; color: #888;">Type</td><td style="padding: 8px 0;">${data.inquiryType || data.type || "General"}</td></tr>
            ${data.propertyTitle ? `<tr><td style="padding: 8px 0; color: #888;">Property</td><td style="padding: 8px 0; font-weight: bold;">${data.propertyTitle}</td></tr>` : ""}
          </table>
          ${data.message ? `<div style="margin-top: 16px; padding: 16px; background: #f9f9f6; border-radius: 8px;"><p style="margin: 0; color: #333;">${data.message}</p></div>` : ""}
          <p style="margin-top: 20px; font-size: 12px; color: #aaa;">Sent from binayah.com</p>
        </div>
      </div>
    `,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.name || !body.email) {
      return NextResponse.json(
        { success: false, message: "Name and email are required" },
        { status: 400 }
      );
    }

    // Save to database
    await connectDB();
    await Inquiry.create({
      name: body.name,
      email: body.email,
      phone: body.phone,
      inquiryType: body.inquiryType || body.type,
      message: body.message,
      propertySlug: body.propertySlug,
      propertyTitle: body.propertyTitle,
      source: body.source || "website",
    });

    // Send email notification (non-blocking)
    sendEmailNotification(body).catch((err) =>
      console.error("Email send failed:", err)
    );

    return NextResponse.json({ success: true, message: "Inquiry received" });
  } catch (error) {
    console.error("Inquiry error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    );
  }
}