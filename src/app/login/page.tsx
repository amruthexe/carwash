"use client";

import { motion, AnimatePresence } from "framer-motion";
import { signIn, getSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

import { FcGoogle } from "react-icons/fc";
import { Loader2, LockKeyhole, Mail } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import { Separator } from "@/components/ui/separator";
import Link from "next/link";

export default function LoginPage() {
  const params = useSearchParams();
  const urlError = params.get("error");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(urlError);

  // ✅ GOOGLE LOGIN
  const handleGoogle = async () => {
    setLoading(true);
    // Remove hardcoded dashboard redirect, let the middleware redirect based on role
    // Or it will default to '/' and middleware will catch '/login' or '/dashboard'
    await signIn("google");
  };

  // ✅ CREDENTIAL LOGIN (FIXED)
  const handleCredentials = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);

    const res = await signIn("credentials", {
      email: form.get("email"),
      password: form.get("password"),
      redirect: false, // 🔥 IMPORTANT
    });

    setLoading(false);

    if (res?.error) {
      setError("Invalid email or password ❌");
    } else {
      const session = await getSession();
      // @ts-ignore
      const role = session?.user?.role;
      if (role === 'admin') window.location.href = "/admin";
      else if (role === 'worker') window.location.href = "/worker";
      else window.location.href = "/dashboard";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50 via-slate-50 to-slate-100 px-4 py-12">
      
      <Card className="w-full max-w-[450px] border-none shadow-[0_20px_50px_rgba(8,_112,_184,_0.1)] rounded-[2rem] overflow-hidden bg-white/80 backdrop-blur-sm">
        
        {/* HEADER */}
        <CardHeader className="pt-10 pb-6 text-center">
          <div className="mx-auto w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-200">
            <span className="text-white font-bold text-xl">P</span>
          </div>

          <CardTitle className="text-3xl font-extrabold text-slate-900">
            Welcome Back
          </CardTitle>

          <CardDescription className="text-base text-slate-500">
            Log in to your account
          </CardDescription>
        </CardHeader>

        {/* BODY */}
        <CardContent className="px-8 pb-10">

          {/* ERROR MESSAGE */}
          {error && (
            <div className="mb-6 p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600 text-center">
              {error}
            </div>
          )}

          <Tabs defaultValue="customer" className="w-full">

            {/* TAB SWITCH */}
            <TabsList className="grid grid-cols-2 w-full p-1  rounded-2xl mb-8 h-12">
              <TabsTrigger value="customer">Customer</TabsTrigger>
              <TabsTrigger value="staff">Staff</TabsTrigger>
            </TabsList>

            {/* GOOGLE LOGIN */}
            <TabsContent value="customer" className="space-y-6">

 <form onSubmit={handleCredentials} className="space-y-5">

                {/* EMAIL */}
                <div className="space-y-2">
                  <Label>Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                    <Input
                      name="email"
                      type="email"
                      required
                      className="pl-10 h-12"
                      placeholder="admin@test.com"
                    />
                  </div>
                </div>

                {/* PASSWORD */}
                <div className="space-y-2">
                  <Label>Password</Label>
                  <div className="relative">
                    <LockKeyhole className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                    <Input
                      name="password"
                      type="password"
                      required
                      className="pl-10 h-12"
                    />
                  </div>
                </div>

                {/* BUTTON */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 text-base font-bold bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    "Login"
                  )}
                </Button>
              </form>

                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-4 text-slate-400">
                    Fastest way
                  </span>
                </div>


              <Button
                onClick={handleGoogle}
                disabled={loading}
                variant="outline"
                className="w-full h-12 text-base font-semibold flex gap-3"
              >
                {loading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <FcGoogle size={22} />
                )}
                Continue with Google
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator />
                </div>
              </div>
            </TabsContent>

            {/* CREDENTIAL LOGIN */}
            <TabsContent value="staff" className="space-y-4">

              <form onSubmit={handleCredentials} className="space-y-5">

                {/* EMAIL */}
                <div className="space-y-2">
                  <Label>Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                    <Input
                      name="email"
                      type="email"
                      required
                      className="pl-10 h-12"
                      placeholder="admin@test.com"
                    />
                  </div>
                </div>

                {/* PASSWORD */}
                <div className="space-y-2">
                  <Label>Password</Label>
                  <div className="relative">
                    <LockKeyhole className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                    <Input
                      name="password"
                      type="password"
                      required
                      className="pl-10 h-12"
                    />
                  </div>
                </div>

                {/* BUTTON */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 text-base font-bold bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    "Login"
                  )}
                </Button>
              </form>

            </TabsContent>
          </Tabs>

          {/* FOOTER */}
        <Link href="/register">
            <p className="mt-8 text-center text-sm text-slate-400">
            Don’t have an account?{" "}
            <span className="text-blue-600 font-semibold cursor-pointer hover:underline">
              Sign up
            </span>
          </p>
        </Link>

        </CardContent>
      </Card>
    </div>
  );
}