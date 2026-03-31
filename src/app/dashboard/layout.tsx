import { auth } from "@/auth";
import Link from "next/link";
import Image from "next/image";
import Sidebar from "@/components/layout/Sidebar";
import SignOutButton from "@/components/auth/SignOutButton";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-80 bg-[var(--foreground)] text-white flex flex-col justify-between shadow-2xl p-6 md:min-h-screen sticky top-0 z-40">
        <div>
          <div className="flex items-center gap-4 mb-10">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center overflow-hidden">
               <Image src="/logo.png" alt="PureWash Logo" width={50} height={50} className="object-cover grayscale brightness-200" priority />
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight">PureWash</h2>
          </div>

          <Sidebar />
        </div>

        {/* User Info & Logout (Hidden on mobile scroll, always visible on desktop) */}
        <div className="mt-8 border-t border-slate-700 pt-6 hidden md:block">
          <p className="text-xl font-bold mb-2">Hello, {session?.user?.name?.split(' ')[0]}</p>
          <SignOutButton variant="dashboard" />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 w-full p-6 md:p-12 mb-24 md:mb-0">
        {children}
      </main>

      {/* Mobile Logout (Sticky Bottom) */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-[var(--foreground)] p-4 border-t border-slate-700 flex justify-between items-center z-50">
         <span className="text-white text-lg font-bold">Hello, {session?.user?.name?.split(' ')[0]}</span>
         <SignOutButton variant="dashboard" className="flex items-center gap-2 p-3 text-lg font-bold bg-slate-800 text-white rounded-xl shadow hover:bg-red-600 transition-colors" />
      </div>
    </div>
  );
}
