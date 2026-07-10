import "server-only";
import { cache } from "react";
import clientPromise from "@/lib/mongodb";

export interface Agent {
  slug: string;
  name: string;
  position?: string;
  bio?: string; // stored as WordPress HTML — use bioText() to render
  photo?: string;
  email?: string;
  mobile?: string;
  officePhone?: string;
  license?: string; // RERA BRN
  specialties?: string;
  languages?: string[];
  social?: { facebook?: string; twitter?: string; linkedin?: string; instagram?: string };
}

/** Plain-text bio (WordPress markup stripped). */
export function bioText(bio?: string): string {
  return (bio || "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** A real RERA Broker Registration Number (not the "00000" import placeholder). */
export function hasRealLicense(a: Agent): boolean {
  const lic = (a.license || "").trim();
  return lic.length > 0 && !/^0+$/.test(lic);
}

/**
 * An agent profile is "substantive" (safe to index) when it has a real bio —
 * that's the actual content that makes the page non-thin. A real BRN is a bonus
 * trust/credential signal (rendered when present) but isn't required to index.
 * Profiles with neither stay crawlable (follow) but noindex until enriched, so
 * we never publish a name-and-photo boilerplate page.
 */
export function isPublishableAgent(a: Agent): boolean {
  return bioText(a.bio).length >= 40;
}

function mapAgent(d: Record<string, unknown>): Agent {
  const s = (d.social || {}) as Record<string, string>;
  return {
    slug: String(d.slug || ""),
    name: String(d.name || ""),
    position: d.position ? String(d.position) : undefined,
    bio: d.bio ? String(d.bio) : undefined,
    photo: d.photo ? String(d.photo) : undefined,
    email: d.email ? String(d.email) : undefined,
    mobile: d.mobile ? String(d.mobile) : undefined,
    officePhone: d.officePhone ? String(d.officePhone) : undefined,
    license: d.license ? String(d.license) : undefined,
    specialties: d.specialties ? String(d.specialties) : undefined,
    languages: Array.isArray(d.languages) ? (d.languages as string[]) : undefined,
    social: {
      facebook: s.facebook || undefined,
      twitter: s.twitter || undefined,
      linkedin: s.linkedin || undefined,
      instagram: s.instagram || undefined,
    },
  };
}

export const getAgents = cache(async (): Promise<Agent[]> => {
  try {
    const client = await clientPromise;
    const docs = await client
      .db()
      .collection("agents")
      .find({ publishStatus: "published", slug: { $exists: true, $ne: "" } })
      .toArray();
    return docs.map(mapAgent).filter((a) => a.slug && a.name);
  } catch {
    return [];
  }
});

export const getAgent = cache(async (slug: string): Promise<Agent | null> => {
  try {
    const client = await clientPromise;
    const doc = await client.db().collection("agents").findOne({ slug, publishStatus: "published" });
    return doc ? mapAgent(doc as Record<string, unknown>) : null;
  } catch {
    return null;
  }
});
