import { auth } from "@/auth";
import Sidebar from "@/components/layout/Sidebar";
import SignOutButton from "@/components/auth/SignOutButton";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-60 bg-slate-800 text-white flex flex-col md:min-h-screen sticky top-0 z-40">
        <div className="p-6">
          <h2 className="text-lg font-bold tracking-tight">PureWash</h2>
        </div>

        <div className="flex-1 px-4">
          <Sidebar />
        </div>

        <div className="p-4 border-t border-slate-700">
          <p className="text-xs font-semibold mb-3 uppercase tracking-wider opacity-60">
            {session?.user?.name?.split(' ')[0]}
          </p>
          <SignOutButton variant="dashboard" className="w-full justify-center text-sm" />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 w-full p-4 md:p-8">
        {children}
      </main>

      {/* Mobile Bottom Bar */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-slate-800 p-4 border-t border-slate-700 flex justify-between items-center z-50">
        <span className="text-white text-sm font-medium">
          Hi, {session?.user?.name?.split(' ')[0]}
        </span>
        <SignOutButton variant="dashboard" className="px-3 py-1.5 text-sm" />
      </div>
    </div>
  );
}
