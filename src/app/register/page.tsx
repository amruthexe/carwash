"use client";

import { registerUser } from "@/app/actions/auth";
import Image from "next/image";
import Link from "next/link";
import { UserPlus, Mail, Lock, User, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    const result = await registerUser(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      // Success - redirect to login
      router.push("/login?registered=true");
    }
  }

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl overflow-hidden border-2 border-[var(--border)]">

        {/* Header Section */}
        <div className="bg-[var(--foreground)] p-8 text-center text-white flex flex-col items-center relative">
          <Link href="/login" className="absolute left-6 top-8 text-white/70 hover:text-white transition-colors">
            <ArrowLeft size={28} />
          </Link>
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 overflow-hidden">
             <Image src="/logo.png" alt="PureWash Logo" width={60} height={60} className="object-cover grayscale brightness-200" priority />
          </div>
          <h1 className="text-3xl font-extrabold mb-1">Join PureWash</h1>
          <p className="text-lg text-[var(--border)]">Create your resident account today.</p>
        </div>

        {/* Form Section */}
        <div className="p-8 md:p-12">
          {error && (
             <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3">
               <span className="font-bold">Error:</span> {error}
             </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div>
              <label className="block text-xl font-bold text-[var(--foreground)] mb-2 flex items-center gap-2">
                <User size={20} className="text-[var(--primary)]" /> Full Name
              </label>
              <input 
                name="name" 
                type="text" 
                placeholder="John Doe" 
                className="w-full text-xl p-4 border-2 border-[var(--border)] rounded-xl focus:border-[var(--primary)] focus:outline-none focus:ring-4 ring-[var(--secondary)]"
                required
              />
            </div>

            <div>
              <label className="block text-xl font-bold text-[var(--foreground)] mb-2 flex items-center gap-2">
                <Mail size={20} className="text-[var(--primary)]" /> Email Address
              </label>
              <input 
                name="email" 
                type="email" 
                placeholder="john@example.com" 
                className="w-full text-xl p-4 border-2 border-[var(--border)] rounded-xl focus:border-[var(--primary)] focus:outline-none focus:ring-4 ring-[var(--secondary)]"
                required
              />
            </div>
            
            <div>
              <label className="block text-xl font-bold text-[var(--foreground)] mb-2 flex items-center gap-2">
                <Lock size={20} className="text-[var(--primary)]" /> Password
              </label>
              <input 
                name="password" 
                type="password" 
                placeholder="Min. 6 characters" 
                className="w-full text-xl p-4 border-2 border-[var(--border)] rounded-xl focus:border-[var(--primary)] focus:outline-none focus:ring-4 ring-[var(--secondary)]"
                required
                minLength={6}
              />
            </div>

            <div>
              <label className="block text-xl font-bold text-[var(--foreground)] mb-2 flex items-center gap-2">
                <Lock size={20} className="text-[var(--primary)]" /> Confirm Password
              </label>
              <input 
                name="confirmPassword" 
                type="password" 
                placeholder="Repeat password" 
                className="w-full text-xl p-4 border-2 border-[var(--border)] rounded-xl focus:border-[var(--primary)] focus:outline-none focus:ring-4 ring-[var(--secondary)]"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 rounded-2xl bg-[var(--primary)] hover:bg-[var(--secondary-foreground)] text-white text-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-lg mt-4 disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-1"
            >
              {loading ? (
                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <UserPlus className="w-8 h-8" />
                  Create My Account
                </>
              )}
            </button>

            <p className="text-center text-lg text-[var(--muted-foreground)] mt-4">
              Already have an account?{" "}
              <Link href="/login" className="text-[var(--primary)] font-bold hover:underline">
                Sign In
              </Link>
            </p>
          </form>

        </div>
      </div>
    </div>
  );
}
