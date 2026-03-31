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
      <header className="bg-slate-800 text-white py-4 px-6 md:px-8 flex justify-between items-center shadow-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Wrench className="w-8 h-8 text-blue-400" />
          <div>
            <h1 className="text-lg font-semibold">Worker Portal</h1>
            <p className="text-sm text-slate-300 hidden sm:block">{session?.user?.name}</p>
          </div>
        </div>

        <SignOutButton
          variant="worker"
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-slate-700 text-white hover:bg-red-600 transition-colors rounded-lg"
        />
      </header>

      {/* Main Area */}
      <main className="flex-1 w-full max-w-4xl mx-auto p-4 md:p-8 mb-20">
        {children}
      </main>
    </div>
  );
}
