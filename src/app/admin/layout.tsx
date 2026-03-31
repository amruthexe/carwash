import { auth } from "@/auth";
import Link from "next/link";
import { Users, ClipboardList, Shield } from "lucide-react";
import SignOutButton from "@/components/auth/SignOutButton";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      <aside className="w-full md:w-64 bg-[#011c33] text-white flex flex-col md:min-h-screen sticky top-0 z-40 p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-12 opacity-90">
          <Shield className="w-8 h-8 text-[var(--accent)]" />
          <h2 className="text-xl font-semibold tracking-tight">Admin Console</h2>
        </div>

        <nav className="flex flex-col gap-2 flex-1">
          <Link href="/admin" className="flex items-center gap-3 w-full p-3 font-medium text-white rounded-lg hover:bg-slate-800 transition-colors">
            <ClipboardList className="w-5 h-5 text-gray-400" /> All Requests
          </Link>
          <Link href="/admin/workers" className="flex items-center gap-3 w-full p-3 font-medium text-white rounded-lg hover:bg-slate-800 transition-colors">
            <Users className="w-5 h-5 text-gray-400" /> Workers
          </Link>
        </nav>

        <div className="mt-8 border-t border-slate-700 pt-6">
          <p className="text-xs font-semibold mb-3 opacity-50 uppercase tracking-wider">Admin Account</p>
          <SignOutButton variant="admin" />
        </div>
      </aside>

      <main className="flex-1 w-full p-6 md:p-10">
        {children}
      </main>
    </div>
  );
}
