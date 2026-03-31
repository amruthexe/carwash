"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

interface SignOutButtonProps {
  variant?: "dashboard" | "admin" | "worker";
  className?: string;
}

export default function SignOutButton({ variant = "dashboard", className }: SignOutButtonProps) {
  const handleSignOut = async () => {
    // Force a full refresh after sign out to clear all internal Next.js caches
    await signOut({ callbackUrl: "/", redirect: true });
  };

  const baseStyles = "flex items-center gap-3 w-full transition-colors";
  
  const variants = {
    dashboard: "p-4 text-xl font-bold bg-slate-800 text-white rounded-2xl shadow hover:bg-red-600",
    admin: "p-3 font-semibold bg-red-950 text-red-200 rounded-lg hover:bg-red-900",
    worker: "p-4 font-bold bg-slate-800 text-white rounded-2xl shadow hover:bg-red-600",
  };

  return (
    <button
      onClick={handleSignOut}
      className={className || `${baseStyles} ${variants[variant]}`}
    >
      <LogOut className={variant === "admin" ? "w-5 h-5" : "w-6 h-6"} />
      Sign Out
    </button>
  );
}
