export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdminSession } from "@/lib/admin-auth";
import clientPromise from "@/lib/mongodb";
import AdminHeader from "./AdminHeader";
import UserActionsStrip from "./UserActionsStrip";

export default async function AdminLandingPage() {
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

  // Fetch counts
  const client = await clientPromise;
  const db = client.db("binayah_web_new_dev");
  const [inquiryCount, submissionCount, subscriberCount, newsletterCount, trackStats] = await Promise.all([
    db.collection("inquiries").countDocuments(),
    db.collection("property_submissions").countDocuments(),
    db.collection("project_subscriptions").countDocuments(),
    // Confirmed, still-subscribed newsletter (market-report) sign-ups.
    db.collection("marketreportsubscriptions").countDocuments({
      confirmedAt: { $ne: null },
      unsubscribedAt: null,
    }),
    db.collection("userevents").aggregate([
      { $group: { _id: "$action", count: { $sum: 1 } } },
    ]).toArray().then((rows) =>
      Object.fromEntries(rows.map((r: any) => [r._id as string, r.count as number]))
    ).catch(() => ({} as Record<string, number>)),
  ]);

  const cards = [
    {
      href: "/admin/chats",
      label: "Chat Transcripts",
      description: "Full AI chat conversations from website visitors",
      count: null,
      accent: "#6366f1",
      bg: "bg-indigo-50",
      iconBg: "bg-indigo-100",
      icon: (
        <svg className="w-6 h-6 text-indigo-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
        </svg>
      ),
    },
    {
      href: "/admin/leads",
      label: "All Leads",
      description: "Unified view of every lead across all sources",
      count: inquiryCount + submissionCount + subscriberCount,
      accent: "#0B3D2E",
      bg: "bg-teal-50",
      iconBg: "bg-teal-100",
      icon: (
        <svg className="w-6 h-6 text-teal-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
      ),
    },
    {
      href: "/admin/inquiries",
      label: "Inquiries",
      description: "Contact & property inquiries from visitors",
      count: inquiryCount,
      accent: "#1A7A5A",
      bg: "bg-emerald-50",
      iconBg: "bg-emerald-100",
      icon: (
        <svg className="w-6 h-6 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
        </svg>
      ),
    },
    {
      href: "/admin/submissions",
      label: "Property Submissions",
      description: "List-your-property form submissions",
      count: submissionCount,
      accent: "#D4A847",
      bg: "bg-amber-50",
      iconBg: "bg-amber-100",
      icon: (
        <svg className="w-6 h-6 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
        </svg>
      ),
    },
    {
      href: "/admin/subscriptions",
      label: "Project Subscribers",
      description: "Users subscribed to project updates",
      count: subscriberCount,
      accent: "#6366f1",
      bg: "bg-indigo-50",
      iconBg: "bg-indigo-100",
      icon: (
        <svg className="w-6 h-6 text-indigo-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
      ),
    },
    {
      href: "/admin/newsletter",
      label: "Newsletter Subscribers",
      description: "Confirmed weekly market-report sign-ups",
      count: newsletterCount,
      accent: "#0ea5e9",
      bg: "bg-sky-50",
      iconBg: "bg-sky-100",
      icon: (
        <svg className="w-6 h-6 text-sky-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 9v.906a2.25 2.25 0 01-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 001.183 1.981l6.478 3.488m8.839 2.51l-4.66-2.51m0 0l-1.023-.55a2.25 2.25 0 00-2.134 0l-1.022.55m0 0l-4.661 2.51m16.5 1.615a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V8.844a2.25 2.25 0 011.183-1.98l7.5-4.04a2.25 2.25 0 012.134 0l7.5 4.04a2.25 2.25 0 011.183 1.98V19.5z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader
        title="Dashboard"
        name={name ?? "Admin"}
        email={email}
        avatar={avatar ?? null}
      />

      {/* Main */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
            Good to see you, {(name ?? "Admin").split(" ")[0]}.
          </h2>
          <p className="text-gray-500 text-sm mt-1">Here&apos;s an overview of your data.</p>
        </div>

        {/* 1 col on mobile, 2 on sm/md, 3 on lg */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {cards.map((card) => (
            <a
              key={card.href}
              href={card.href}
              className="group bg-white rounded-2xl border border-gray-200 p-5 md:p-6 hover:border-gray-300 hover:shadow-md transition-all duration-150 flex flex-col"
            >
              <div className={`w-12 h-12 rounded-xl ${card.iconBg} flex items-center justify-center mb-5`}>
                {card.icon}
              </div>
              {card.count != null && (
                <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1 tabular-nums">
                  {card.count.toLocaleString()}
                </div>
              )}
              <div className="font-semibold text-gray-800 text-sm mb-1">{card.label}</div>
              <div className="text-gray-400 text-xs flex-1">{card.description}</div>
              <div className="mt-5 flex items-center gap-1 text-sm font-medium" style={{ color: card.accent }}>
                View all
                <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </div>
            </a>
          ))}
        </div>

        {/* User Action Stats — all-time, matches the per-action event lists */}
        <div className="mt-10">
          <h3 className="text-base font-semibold text-gray-700 mb-4">User Actions</h3>
          <UserActionsStrip stats={[
            { key: "whatsapp", label: "WhatsApp Clicks", color: "#25D366", value: trackStats["whatsapp"] ?? 0 },
            { key: "phone", label: "Phone Clicks", color: "#D4A847", value: trackStats["phone"] ?? 0 },
            { key: "chat-open", label: "Chat Opens", color: "#6366f1", value: trackStats["chat-open"] ?? 0 },
            { key: "inquiry", label: "Inquiries", color: "#1A7A5A", value: trackStats["inquiry"] ?? 0 },
            { key: "view", label: "Property Views", color: "#64748b", value: trackStats["view"] ?? 0 },
          ]} />
        </div>
      </main>
    </div>
  );
}
