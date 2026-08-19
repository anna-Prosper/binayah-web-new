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
  { role: "General Manager", slug: "general-manager", photo: `${S3}/general-manager.jpg` },
  { role: "Property Manager", slug: "property-manager", photo: `${S3}/property-manager.jpg` },
  { role: "Admin Coordinator", slug: "admin-coordinator", photo: `${S3}/admin-coordinator.jpg` },
  { role: "Accountant", slug: "accountant", photo: `${S3}/accountant.jpg` },
  { role: "Social Media Manager", slug: "social-media-manager", photo: `${S3}/social-media-manager.jpg` },
  { role: "AI Specialist", slug: "ai-specialist", photo: `${S3}/ai-specialist.jpg` },
  { role: "IT Support", slug: "it-support", photo: `${S3}/it-support.jpg` },
  { role: "Photographer", slug: "photographer", photo: `${S3}/photographer.jpg` },
  { role: "Receptionist", slug: "receptionist", photo: `${S3}/receptionist.jpg` },
  { role: "Driver", slug: "driver", photo: `${S3}/driver.jpg` },
  { role: "Driver", slug: "driver-2", photo: `${S3}/driver-2.jpg` },
];
