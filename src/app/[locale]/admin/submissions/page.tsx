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

type StatusKey = "listed" | "contacted" | "under_review";

const STATUS_CONFIG: Record<StatusKey, { label: string; className: string }> = {
  listed:       { label: "Listed",          className: "bg-emerald-50 text-emerald-700 border-emerald-100" },
  contacted:    { label: "Agent Contacted", className: "bg-blue-50 text-blue-700 border-blue-100" },
  under_review: { label: "Under Review",    className: "bg-amber-50 text-amber-700 border-amber-100" },
};

export default async function AdminSubmissionsPage() {
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
  const col = client.db("binayah_web_new_dev").collection("property_submissions");
  const submissions = await col.find({}).sort({ createdAt: -1 }).limit(200).toArray();

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
            <span className="text-white font-medium text-sm">Property Submissions</span>
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
          <h1 className="text-2xl font-semibold text-gray-900">Property Submissions</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {submissions.length} {submissions.length === 1 ? "submission" : "submissions"} · newest first
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3 whitespace-nowrap">Date (Dubai)</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Contact</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Type</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Community</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3 whitespace-nowrap">Asking Price</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {submissions.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-16 text-center text-gray-400 text-sm">
                      No submissions yet.
                    </td>
                  </tr>
                )}
                {submissions.map((s) => {
                  const raw = ((s.status as string) || "under_review").replace("new", "under_review") as StatusKey;
                  const status = STATUS_CONFIG[raw] ?? STATUS_CONFIG.under_review;

                  return (
                    <tr key={String(s._id)} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5 text-gray-500 whitespace-nowrap text-xs">{formatDate(s.createdAt)}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex flex-col gap-1">
                          {s.userEmail && (
                            <a href={`mailto:${s.userEmail}`} className="text-emerald-700 hover:underline text-xs">
                              {s.userEmail as string}
                            </a>
                          )}
                          {s.phone && (
                            <a href={`tel:${s.phone}`} className="text-gray-600 hover:underline text-xs">
                              {s.phone as string}
                            </a>
                          )}
                          {!s.userEmail && !s.phone && <span className="text-gray-300">—</span>}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        {s.propertyType ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            {s.propertyType as string}
                          </span>
                        ) : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-5 py-3.5 text-gray-700 whitespace-nowrap">
                        {(s.community as string) || <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-5 py-3.5 font-medium text-gray-900 whitespace-nowrap tabular-nums">
                        {s.askingPrice ? `AED ${Number(s.askingPrice).toLocaleString()}` : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${status.className}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-gray-600 max-w-xs">
                        <span className="line-clamp-2 break-words text-xs">
                          {(s.description as string) || <span className="text-gray-300">—</span>}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
