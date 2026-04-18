import nodemailer from "nodemailer";

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_SECURE,
  SMTP_USER,
  SMTP_PASS,
} = process.env;

if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
  // Warn at module load time (not throw) so build still succeeds when env is partial
  console.warn("[mailer] SMTP env vars missing — emails will fail at runtime");
}

const transporter = nodemailer.createTransport({
  host: SMTP_HOST || "smtp.gmail.com",
  port: SMTP_PORT ? Number(SMTP_PORT) : 465,
  secure: SMTP_SECURE ? SMTP_SECURE !== "false" : true,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

export interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendMail({ to, subject, html, text }: SendMailOptions) {
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    throw new Error("[mailer] SMTP env vars not configured");
  }
  await transporter.sendMail({
    from: `Binayah Properties <${SMTP_USER}>`,
    to,
    subject,
    html,
    text: text ?? html.replace(/<[^>]+>/g, ""),
  });
}
