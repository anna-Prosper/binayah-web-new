export const dynamic = "force-dynamic";

import clientPromise from "@/lib/mongodb";
import { isAdminSession } from "@/lib/admin-auth";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AdminHeader from "../AdminHeader";
import SubscriptionsMobileList from "./SubscriptionsMobileList";
import CopyEmailsButton from "./CopyEmailsButton";

function formatDate(d: unknown): string {
  if (!d) return "";
  try {
    return new Date(d as string).toLocaleString("en-GB", {
      timeZone: "Asia/Dubai",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return String(d);
  }
}

export default async function AdminSubscriptionsPage() {
  if (!(await isAdminSession())) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-4xl mb-4">🔒</div>
          <h1 className="text-xl font-semibold text-gray-800 mb-2">Unauthorized</h1>
          <p className="text-gray-500 text-sm">You don&apos;t have access to this page.</p>
        </div>
      </div>
    );
  }

  const session = await getServerSession(authOptions);
  const email = session?.user?.email ?? "";
  const name = session?.user?.name ?? email.split("@")[0];
  const avatar = session?.user?.image;

  const client = await clientPromise;
  const db = client.db("binayah_web_new_dev");
  const subs = await db.collection("project_subscriptions").find({}).sort({ createdAt: -1 }).limit(500).toArray();

  // Group by project slug, deduplicate emails (keep latest per email per project)
  // The subscription document stores `slug` and `projectName` directly.
  const byProject: Record<string, { name: string; map: Map<string, { email: string; createdAt: unknown; dupeCount: number }> }> = {};
  for (const s of subs) {
    const slug = (s.slug as string) || "unknown";
    const projectName = (s.projectName as string) || slug;
    if (!byProject[slug]) byProject[slug] = { name: projectName, map: new Map() };
    const emailKey = ((s.email as string) || "").toLowerCase();
    if (!byProject[slug].map.has(emailKey)) {
      byProject[slug].map.set(emailKey, { email: (s.email as string) || "", createdAt: s.createdAt, dupeCount: 1 });
    } else {
      byProject[slug].map.get(emailKey)!.dupeCount++;
    }
  }

  const projects = Object.entries(byProject)
    .map(([slug, { name, map: emailMap }]) => ({
      slug,
      name,
      list: [...emailMap.values()],
    }))
    .sort((a, b) => b.list.length - a.list.length);

  const totalRaw = subs.length;
  const totalUnique = projects.reduce((acc, p) => acc + p.list.length, 0);

  // Serialize for mobile client component
  const serializedProjects = projects.map((p) => ({
    slug: p.slug,
    name: p.name,
    subscribers: p.list.map((item) => ({
      email: item.email,
      date: formatDate(item.createdAt),
      dupeCount: item.dupeCount,
    })),
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader
        title="Subscribers"
        backHref="/en/admin"
        name={name ?? "Admin"}
        email={email}
        avatar={avatar ?? null}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Project Subscribers</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {totalUnique} unique subscriber{totalUnique !== 1 ? "s" : ""}
              {totalRaw > totalUnique && (
                <span className="text-gray-400"> ({totalRaw} total sign-ups)</span>
              )}
              {" "}across {projects.length} project{projects.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {projects.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-16 text-center text-gray-400 text-sm">
            No subscribers yet.
          </div>
        )}

        {/* Mobile card list */}
        {projects.length > 0 && (
          <div className="md:hidden">
            <SubscriptionsMobileList projects={serializedProjects} />
          </div>
        )}

        {/* Desktop table view */}
        <div className="hidden md:flex flex-col gap-6">
          {projects.map((project) => {
            const uniqueEmails = project.list.map((i) => i.email).filter(Boolean);
            const hasDupes = project.list.some((i) => i.dupeCount > 1);
            return (
              <div key={project.slug} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-4 bg-gray-50/60">
                  <div className="min-w-0">
                    <span className="font-semibold text-gray-900 text-sm">
                      {project.name === project.slug ? project.slug : project.name}
                    </span>
                    {project.name !== project.slug && (
                      <span className="ml-2 text-xs text-gray-400">/{project.slug}</span>
                    )}
                    {hasDupes && (
                      <span className="ml-2 text-[10px] font-medium text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">
                        has duplicates
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <CopyEmailsButton emails={uniqueEmails} />
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {project.list.length} {project.list.length === 1 ? "subscriber" : "subscribers"}
                    </span>
                  </div>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-5 py-2.5">Email</th>
                      <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-5 py-2.5 whitespace-nowrap">Subscribed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {project.list.map((item, i) => (
                      <tr key={i} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-5 py-3 flex items-center gap-2">
                          <a href={`mailto:${item.email}`} className="text-emerald-700 hover:underline">
                            {item.email || <span className="text-gray-300 italic">anonymous</span>}
                          </a>
                          {item.dupeCount > 1 && (
                            <span className="text-[10px] font-medium text-amber-500 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded-full">
                              ×{item.dupeCount}
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-gray-400 text-xs whitespace-nowrap">
                          {formatDate(item.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
