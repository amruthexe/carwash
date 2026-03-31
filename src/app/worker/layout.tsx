import { auth } from "@/auth";
import Image from "next/image";
import { Wrench } from "lucide-react";
import SignOutButton from "@/components/auth/SignOutButton";

export default async function WorkerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      {/* Worker Header */}
      <header className="bg-[var(--foreground)] text-white py-6 px-6 md:px-12 flex justify-between items-center shadow-lg border-b-4 border-[var(--accent)] sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Wrench className="w-10 h-10 text-[var(--primary)]" />
          <div>
            <h1 className="text-2xl font-bold">Worker Portal</h1>
            <p className="text-[var(--muted-foreground)] hidden sm:block">Hello, {session?.user?.name}</p>
          </div>
        </div>

        <SignOutButton 
          variant="worker" 
          className="flex items-center gap-2 px-6 py-3 text-lg font-bold bg-slate-800 text-white hover:bg-red-600 transition-colors rounded-xl shadow border border-slate-700" 
        />
      </header>

      {/* Main Area */}
      <main className="flex-1 w-full max-w-5xl mx-auto p-6 md:p-12 mb-20">
        {children}
      </main>
    </div>
  );
}
