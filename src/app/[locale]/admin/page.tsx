export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdminSession } from "@/lib/admin-auth";
import clientPromise from "@/lib/mongodb";

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
  const [inquiryCount, submissionCount, subscriberCount] = await Promise.all([
    db.collection("inquiries").countDocuments(),
    db.collection("property_submissions").countDocuments(),
    db.collection("project_subscriptions").countDocuments(),
  ]);

  const cards = [
    {
      href: "/en/admin/inquiries",
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
      href: "/en/admin/submissions",
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
      href: "/en/admin/subscriptions",
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
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Nav */}
      <header className="bg-[#0B3D2E] text-white px-6 py-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#D4A847] flex items-center justify-center font-bold text-[#0B3D2E] text-sm">B</div>
            <div>
              <div className="font-semibold text-base leading-tight">Binayah Admin</div>
              <div className="text-white/50 text-xs">Dashboard</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatar} alt={name} className="w-8 h-8 rounded-full object-cover border-2 border-white/20" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-semibold">
                {name[0]?.toUpperCase()}
              </div>
            )}
            <div className="hidden sm:block">
              <div className="text-sm font-medium leading-tight">{name}</div>
              <div className="text-white/50 text-xs">{email}</div>
            </div>
            <a
              href="/api/auth/signout?callbackUrl=/en/admin"
              className="ml-2 text-xs bg-white/10 hover:bg-white/20 border border-white/10 px-3 py-1.5 rounded-lg transition-colors"
            >
              Sign out
            </a>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900">Good to see you, {name.split(" ")[0]}.</h2>
          <p className="text-gray-500 text-sm mt-1">Here&apos;s an overview of your data.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {cards.map((card) => (
            <a
              key={card.href}
              href={card.href}
              className="group bg-white rounded-2xl border border-gray-200 p-6 hover:border-gray-300 hover:shadow-md transition-all duration-150 flex flex-col"
            >
              <div className={`w-12 h-12 rounded-xl ${card.iconBg} flex items-center justify-center mb-5`}>
                {card.icon}
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1 tabular-nums">
                {card.count.toLocaleString()}
              </div>
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
      </main>
    </div>
  );
}
