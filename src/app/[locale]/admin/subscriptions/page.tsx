export const dynamic = "force-dynamic";

import clientPromise from "@/lib/mongodb";
import { isAdminSession } from "@/lib/admin-auth";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AdminHeader from "../AdminHeader";
import SubscriptionsMobileList from "./SubscriptionsMobileList";

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

  // Serialize for client components
  const serializedProjects = projects.map(([slug, list]) => ({
    slug,
    subscribers: list.map((item) => ({
      email: item.email,
      date: formatDate(item.createdAt),
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
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Project Subscribers</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {subs.length} {subs.length === 1 ? "subscriber" : "subscribers"} across {projects.length} {projects.length === 1 ? "project" : "projects"}
          </p>
        </div>

        {projects.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-16 text-center text-gray-400 text-sm">
            No subscribers yet.
          </div>
        )}

        {/* Mobile card list — visible below md */}
        {projects.length > 0 && (
          <div className="md:hidden">
            <SubscriptionsMobileList projects={serializedProjects} />
          </div>
        )}

        {/* Desktop table view — hidden below md */}
        <div className="hidden md:flex flex-col gap-6">
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
