import { auth, signOut } from "@/auth";
import Link from "next/link";
import Image from "next/image";
import { LogOut, Home, Car, CalendarDays, Receipt } from "lucide-react";

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

          <nav className="flex items-center md:flex-col gap-4 overflow-x-auto md:overflow-visible pb-4 md:pb-0">
            <Link 
              href="/dashboard" 
              className="flex items-center gap-4 w-full p-4 text-xl font-bold bg-[var(--primary)] text-white rounded-2xl shadow hover:bg-[var(--secondary-foreground)] transition-colors whitespace-nowrap"
            >
              <Home className="w-6 h-6" /> Home
            </Link>
            
            <Link 
              href="/dashboard/vehicles" 
              className="flex items-center gap-4 w-full p-4 text-xl font-bold hover:bg-slate-800 text-white rounded-2xl transition-colors whitespace-nowrap"
            >
              <Car className="w-6 h-6" /> My Vehicles
            </Link>

            <Link 
              href="/dashboard/subscription" 
              className="flex items-center gap-4 w-full p-4 text-xl font-bold hover:bg-slate-800 text-white rounded-2xl transition-colors whitespace-nowrap"
            >
              <CalendarDays className="w-6 h-6" /> Plans
            </Link>
            
            <Link 
              href="/dashboard/history" 
              className="flex items-center gap-4 w-full p-4 text-xl font-bold hover:bg-slate-800 text-white rounded-2xl transition-colors whitespace-nowrap"
            >
              <Receipt className="w-6 h-6" /> History
            </Link>
          </nav>
        </div>

        {/* User Info & Logout (Hidden on mobile scroll, always visible on desktop) */}
        <div className="mt-8 border-t border-slate-700 pt-6 hidden md:block">
          <p className="text-xl font-bold mb-2">Hello, {session?.user?.name?.split(' ')[0]}</p>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button type="submit" className="flex items-center gap-3 w-full p-4 text-xl font-bold bg-slate-800 text-white rounded-2xl shadow hover:bg-red-600 transition-colors">
              <LogOut className="w-6 h-6" />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 w-full p-6 md:p-12 mb-24 md:mb-0">
        {children}
      </main>

      {/* Mobile Logout (Sticky Bottom) */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-[var(--foreground)] p-4 border-t border-slate-700 flex justify-between items-center z-50">
         <span className="text-white text-lg font-bold">Hello, {session?.user?.name?.split(' ')[0]}</span>
         <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button type="submit" className="flex items-center gap-2 p-3 text-lg font-bold bg-slate-800 text-white rounded-xl shadow hover:bg-red-600 transition-colors">
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </form>
      </div>
    </div>
  );
}
