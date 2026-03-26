import { signIn } from "@/auth";
import Image from "next/image";
import { Car, Building, Shield } from "lucide-react";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

async function loginGoogle() {
  "use server";
  await signIn("google", { redirectTo: "/dashboard" });
}

async function loginStaff(formData: FormData) {
  "use server";
  try {
    await signIn("credentials", formData, { redirectTo: "/dashboard" });
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.type === 'CredentialsSignin') {
         redirect('/login?error=InvalidCredentials');
      }
    }
    // Rethrow standard Next redirects
    throw error;
  }
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const resolvedParams = await searchParams;
  
  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl overflow-hidden border-2 border-[var(--border)]">
        
        {/* Header Section */}
        <div className="bg-[var(--foreground)] p-8 text-center text-white flex flex-col items-center">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 overflow-hidden">
             <Image src="/logo.png" alt="PureWash Logo" width={80} height={80} className="object-cover grayscale brightness-200" priority />
          </div>
          <h1 className="text-4xl font-extrabold mb-2">Welcome to PureWash</h1>
          <p className="text-xl text-[var(--border)]">Your community car cleaning service.</p>
        </div>

        {/* Login Options Section */}
        <div className="p-8 md:p-12 text-center">
          {resolvedParams?.error && (
             <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
               <strong className="font-bold">Login Failed!</strong>
               <span className="block sm:inline"> Please check your email and password.</span>
             </div>
          )}

          <h2 className="text-2xl font-bold text-[var(--foreground)] mb-8">Choose how to sign in:</h2>

          {/* Customer Login (Giant Button) */}
          <form action={loginGoogle} className="mb-8">
            <button
              type="submit"
              className="w-full py-6 px-6 rounded-2xl bg-[var(--primary)] hover:bg-[var(--secondary-foreground)] text-white text-2xl font-bold flex items-center justify-center gap-4 transition-transform hover:scale-105 shadow-lg flex-col sm:flex-row"
            >
              <div className="bg-white p-2 rounded-full">
                <Car className="text-[var(--primary)] w-8 h-8" />
              </div>
              Sign in as Customer (Google)
            </button>
            <p className="mt-4 text-lg text-[var(--muted-foreground)]">For residents booking a car wash.</p>
          </form>

          <hr className="border-[var(--border)] my-10 border-2" />

          {/* Worker / Admin / Test Customer Details */}
          <h3 className="text-xl font-bold text-[var(--foreground)] mb-2">Staff & Test Login</h3>
          <p className="text-sm text-[var(--muted-foreground)] mb-6 text-left bg-blue-50 p-4 border border-blue-100 rounded-lg space-y-2">
             <span><strong>Testing the app?</strong> Use these mock accounts:</span>
             <br />
             <span>🧑‍🦳 Customer: <strong>customer@test.com</strong> | Pass: <strong>customer123</strong></span>
             <br />
             <span>🛡️ Admin: <strong>admin@test.com</strong> | Pass: <strong>admin123</strong></span>
             <br />
             <span>🛠️ Worker: <strong>worker@test.com</strong> | Pass: <strong>worker123</strong></span>
          </p>
          <form action={loginStaff} className="flex flex-col gap-6 text-left">
            <div>
              <label className="block text-xl font-bold text-[var(--foreground)] mb-2">Email Address</label>
              <input 
                name="email" 
                type="email" 
                placeholder="customer@test.com" 
                className="w-full text-xl p-4 border-2 border-[var(--border)] rounded-xl focus:border-[var(--primary)] focus:outline-none focus:ring-4 ring-[var(--secondary)]"
                required
              />
            </div>
            
            <div>
              <label className="block text-xl font-bold text-[var(--foreground)] mb-2">Password</label>
              <input 
                name="password" 
                type="password" 
                placeholder="customer123" 
                className="w-full text-xl p-4 border-2 border-[var(--border)] rounded-xl focus:border-[var(--primary)] focus:outline-none focus:ring-4 ring-[var(--secondary)]"
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full py-5 rounded-2xl bg-[var(--foreground)] hover:bg-slate-800 text-white text-xl font-bold flex items-center justify-center gap-3 transition-colors shadow-md mt-4"
            >
              <Building className="w-6 h-6" />
              Sign in Manually
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
