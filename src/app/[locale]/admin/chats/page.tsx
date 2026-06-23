export const dynamic = "force-dynamic";

export const metadata = {
  title: "Chat Transcripts | Binayah Admin",
  robots: { index: false, follow: false },
};

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdminSession } from "@/lib/admin-auth";
import AdminHeader from "../AdminHeader";
import ChatsClient from "./ChatsClient";

export default async function AdminChatsPage() {
  if (!(await isAdminSession())) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Unauthorized</h1>
          <p className="text-gray-600">You don&apos;t have access to this page.</p>
        </div>
      </div>
    );
  }
  const session = await getServerSession(authOptions);
  const email = session?.user?.email ?? "";
  const name = session?.user?.name ?? email.split("@")[0];
  const avatar = session?.user?.image;

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader title="Chat Transcripts" backHref="/admin" name={name} email={email} avatar={avatar} />
      <ChatsClient />
    </div>
  );
}
