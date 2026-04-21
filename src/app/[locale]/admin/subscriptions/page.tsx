export const dynamic = "force-dynamic";

import clientPromise from "@/lib/mongodb";
import { isAdminSession } from "@/lib/admin-auth";

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

  const client = await clientPromise;
  const col = client.db("binayah_web_new_dev").collection("project_subscriptions");
  const subs = await col.find({}).sort({ createdAt: -1 }).limit(500).toArray();

  // Group by project slug
  const byProject: Record<string, { email: string; createdAt: unknown }[]> = {};
  for (const s of subs) {
    const slug = (s.projectSlug as string) || "unknown";
    if (!byProject[slug]) byProject[slug] = [];
    byProject[slug].push({ email: (s.email as string) || "", createdAt: s.createdAt });
  }
  const projects = Object.entries(byProject).sort((a, b) => b[1].length - a[1].length);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Nav */}
      <header className="bg-[#0B3D2E] text-white px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/en/admin" className="flex items-center gap-2 text-white/60 hover:text-white text-sm transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              Dashboard
            </a>
            <span className="text-white/20">/</span>
            <span className="text-white font-medium text-sm">Subscribers</span>
          </div>
          <a
            href="/api/auth/signout?callbackUrl=/en/admin"
            className="text-xs bg-white/10 hover:bg-white/20 border border-white/10 px-3 py-1.5 rounded-lg transition-colors"
          >
            Sign out
          </a>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Project Subscribers</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {subs.length} {subs.length === 1 ? "subscriber" : "subscribers"} across {projects.length} {projects.length === 1 ? "project" : "projects"}
          </p>
        </div>

        {projects.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-16 text-center text-gray-400 text-sm">
            No subscribers yet.
          </div>
        )}

        <div className="flex flex-col gap-6">
          {projects.map(([slug, list]) => (
            <div key={slug} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                <div>
                  <span className="font-semibold text-gray-900 text-sm">{slug}</span>
                  <span className="ml-2 text-xs text-gray-400">/{slug}</span>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {list.length} {list.length === 1 ? "subscriber" : "subscribers"}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-2.5">Email</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-2.5 whitespace-nowrap">Subscribed (Dubai)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {list.map((item, i) => (
                      <tr key={i} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3">
                          <a href={`mailto:${item.email}`} className="text-emerald-700 hover:underline">
                            {item.email || <span className="text-gray-300">anonymous</span>}
                          </a>
                        </td>
                        <td className="px-5 py-3 text-gray-500 text-xs whitespace-nowrap">
                          {formatDate(item.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
