// Back-office / operations staff shown on /team as a support section. These are
// role-labelled (not individual profile pages) and carry no crawlable URLs of
// their own — the section is presentational so it adds nothing to the index.
// Photos live at s3://binayah-media/team-support/{slug}.jpg.

export interface SupportMember {
  role: string;
  slug: string;
  photo: string;
}

const S3 = "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/team-support";

export const SUPPORT_TEAM: SupportMember[] = [
  { role: "Head of Sales", slug: "general-manager", photo: `${S3}/general-manager.jpg?v=1787145756` },
  { role: "Property Manager", slug: "property-manager", photo: `${S3}/property-manager.jpg?v=1787145756` },
  { role: "Admin Coordinator", slug: "admin-coordinator", photo: `${S3}/admin-coordinator.jpg?v=1787145756` },
  { role: "Admin Coordinator", slug: "admin-coordinator-2", photo: `${S3}/admin-coordinator-2.jpg?v=1787145756` },
  { role: "Accounts Manager", slug: "accountant", photo: `${S3}/accountant.jpg?v=1787145756` },
  { role: "Social Media Manager", slug: "social-media-manager", photo: `${S3}/social-media-manager.jpg?v=1787145756` },
  { role: "AI Specialist", slug: "ai-specialist", photo: `${S3}/ai-specialist.jpg?v=1787145756` },
  { role: "IT Coordinator", slug: "it-support", photo: `${S3}/it-support.jpg?v=1787145756` },
  { role: "Photographer", slug: "photographer", photo: `${S3}/photographer.jpg?v=1787145756` },
  { role: "Driver", slug: "driver", photo: `${S3}/driver.jpg?v=1787145756` },
  { role: "Driver", slug: "driver-2", photo: `${S3}/driver-2.jpg?v=1787145756` },
];
