import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

const ADMIN_EMAILS = new Set(
  (
    process.env.ADMIN_EMAILS ||
    "anna@prosper-fi.com,aakarshit@prosper-fi.com,mamr@binayah.com,pm@binayah.com,uk@prosper-fi.com"
  )
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
);

export async function isAdminSession(): Promise<boolean> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return false;
    return ADMIN_EMAILS.has(session.user.email.toLowerCase());
  } catch {
    return false;
  }
}
