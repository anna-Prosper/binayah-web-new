export const dynamic = "force-dynamic";

import clientPromise from "@/lib/mongodb";
import { isAdminSession } from "@/lib/admin-auth";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AdminHeader from "../AdminHeader";
import InquiriesMobileList from "./InquiriesMobileList";

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

export default async function AdminInquiriesPage() {
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
  const col = client.db("binayah_web_new_dev").collection("inquiries");
  const inquiries = await col.find({}).sort({ createdAt: -1 }).limit(200).toArray();

  // Serialize for client component (remove ObjectId, convert dates)
  const serialized = inquiries.map((row) => ({
    id: String(row._id),
    name: (row.name as string) || "",
    email: (row.email as string) || "",
    phone: (row.phone as string) || "",
    source: (row.source as string) || "",
    type: (row.type as string) || "",
    message: (row.message as string) || "",
    date: formatDate(row.createdAt),
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader
        title="Inquiries"
        backHref="/en/admin"
        name={name ?? "Admin"}
        email={email}
        avatar={avatar ?? null}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Inquiries</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {inquiries.length} {inquiries.length === 1 ? "inquiry" : "inquiries"} · newest first
            </p>
          </div>
        </div>

        {/* Mobile card list — visible below md */}
        <div className="md:hidden">
          <InquiriesMobileList inquiries={serialized} />
        </div>

        {/* Desktop table — hidden below md */}
        <div className="hidden md:block bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3 whitespace-nowrap">Date (Dubai)</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Name</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Contact</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Source</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Type</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Message</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {inquiries.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center text-gray-400 text-sm">
                      No inquiries yet.
                    </td>
                  </tr>
                )}
                {inquiries.map((row) => (
                  <tr key={String(row._id)} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5 text-gray-500 whitespace-nowrap text-xs">{formatDate(row.createdAt)}</td>
                    <td className="px-5 py-3.5 font-medium text-gray-900 whitespace-nowrap">
                      {(row.name as string) || <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-col gap-1">
                        {row.email && (
                          <a href={`mailto:${row.email}`} className="text-emerald-700 hover:text-emerald-900 hover:underline">
                            {row.email as string}
                          </a>
                        )}
                        {row.phone && (
                          <a href={`tel:${String(row.phone).replace(/\s/g, "")}`} className="text-gray-600 hover:text-gray-900 hover:underline">
                            {row.phone as string}
                          </a>
                        )}
                        {!row.email && !row.phone && <span className="text-gray-300">—</span>}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      {row.source ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                          {row.source as string}
                        </span>
                      ) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-5 py-3.5">
                      {row.type ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          {row.type as string}
                        </span>
                      ) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-5 py-3.5 text-gray-600 max-w-xs">
                      <span className="line-clamp-2 break-words">
                        {(row.message as string) || <span className="text-gray-300">—</span>}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
