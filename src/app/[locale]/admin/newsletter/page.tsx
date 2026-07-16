export const dynamic = "force-dynamic";

import clientPromise from "@/lib/mongodb";
import { isAdminSession } from "@/lib/admin-auth";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { tryDecrypt } from "@/lib/encryption";
import AdminHeader from "../AdminHeader";
import CopyEmailsButton from "../subscriptions/CopyEmailsButton";

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

type Status = "confirmed" | "pending" | "unsubscribed";

const STATUS_STYLE: Record<Status, string> = {
  confirmed: "bg-emerald-50 text-emerald-700 border-emerald-100",
  pending: "bg-amber-50 text-amber-700 border-amber-100",
  unsubscribed: "bg-gray-100 text-gray-500 border-gray-200",
};

export default async function AdminNewsletterPage() {
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
  const rows = await db
    .collection("marketreportsubscriptions")
    .find({})
    .sort({ createdAt: -1 })
    .limit(1000)
    .toArray();

  const subs = rows.map((r) => {
    const decrypted = tryDecrypt(r.email as string);
    const status: Status = r.unsubscribedAt ? "unsubscribed" : r.confirmedAt ? "confirmed" : "pending";
    return {
      email: decrypted ?? "",
      readable: decrypted !== null,
      name: tryDecrypt(r.name as string) ?? "",
      source: (r.source as string) || "",
      status,
      createdAt: r.createdAt,
    };
  });

  const counts = {
    total: subs.length,
    confirmed: subs.filter((s) => s.status === "confirmed").length,
    pending: subs.filter((s) => s.status === "pending").length,
    unsubscribed: subs.filter((s) => s.status === "unsubscribed").length,
    unreadable: subs.filter((s) => !s.readable).length,
  };

  // Mailable list: confirmed, still-subscribed, and readable.
  const mailable = subs.filter((s) => s.status === "confirmed" && s.readable && s.email).map((s) => s.email);

  // Where sign-ups come from — one row per capture surface (source tag).
  const bySource = Object.entries(
    subs.reduce<Record<string, number>>((acc, s) => {
      const key = s.source || "unknown";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1]);

  const stat = (label: string, value: number, tone = "text-gray-900") => (
    <div className="bg-white rounded-xl border border-gray-200 px-4 py-3">
      <div className={`text-2xl font-bold tabular-nums ${tone}`}>{value.toLocaleString()}</div>
      <div className="text-xs text-gray-400 mt-0.5">{label}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader
        title="Newsletter"
        backHref="/admin"
        name={name ?? "Admin"}
        email={email}
        avatar={avatar ?? null}
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="mb-6 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Newsletter Subscribers</h1>
            <p className="text-gray-500 text-sm mt-0.5">Weekly market-report sign-ups (double opt-in).</p>
          </div>
          {mailable.length > 0 && <CopyEmailsButton emails={mailable} />}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {stat("Confirmed", counts.confirmed, "text-emerald-700")}
          {stat("Pending", counts.pending, "text-amber-600")}
          {stat("Unsubscribed", counts.unsubscribed, "text-gray-500")}
          {stat("Total", counts.total)}
        </div>

        {bySource.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Sign-ups by source</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {bySource.map(([src, n]) => (
                <div key={src} className="bg-white rounded-xl border border-gray-200 px-4 py-3">
                  <div className="text-xl font-bold tabular-nums text-sky-700">{n.toLocaleString()}</div>
                  <div className="text-xs text-gray-500 mt-0.5 truncate" title={src}>{src}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {counts.unreadable > 0 && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <strong>{counts.unreadable}</strong> record{counts.unreadable !== 1 ? "s" : ""} can&apos;t be decrypted —
            their email was encrypted under a key that&apos;s no longer in the keyring. They&apos;re shown as{" "}
            <span className="font-mono text-xs">unrecoverable</span> and can&apos;t be emailed.
          </div>
        )}

        {subs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-16 text-center text-gray-400 text-sm">
            No subscribers yet.
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-5 py-2.5">Status</th>
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-5 py-2.5">Email</th>
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-5 py-2.5">Name</th>
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-5 py-2.5">Source</th>
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-5 py-2.5 whitespace-nowrap">Signed up</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {subs.map((s, i) => (
                  <tr key={i} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${STATUS_STYLE[s.status]}`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {s.readable ? (
                        <a href={`mailto:${s.email}`} className="text-emerald-700 hover:underline">
                          {s.email || <span className="text-gray-300">anonymous</span>}
                        </a>
                      ) : (
                        <span className="font-mono text-xs text-amber-600">unrecoverable</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-gray-600">{s.name || <span className="text-gray-300">—</span>}</td>
                    <td className="px-5 py-3 text-gray-400 text-xs">{s.source || "—"}</td>
                    <td className="px-5 py-3 text-gray-400 text-xs whitespace-nowrap">{formatDate(s.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
