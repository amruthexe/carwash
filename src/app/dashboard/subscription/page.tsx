import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import { Subscription, Plan } from "@/models/Plan";
import { CreditCard, CheckCircle, ShieldAlert } from "lucide-react";
import Link from "next/link";

export default async function SubscriptionPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  await connectToDatabase();

  const mockPlans = [
    { name: "monthly", price: 1499, totalServices: 4, validityDays: 30, _id: "661234567890abcd12345678" }
  ];

  return (
    <div className="max-w-4xl mx-auto pb-24 space-y-12">
      <h1 className="text-4xl md:text-5xl font-extrabold text-[var(--foreground)] tracking-tight">
        Service Plans
      </h1>

      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-lg border-2 border-[var(--border)]">
        <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
          <ShieldAlert className="w-8 h-8 text-[var(--primary)]" />
          No Active Subscription
        </h2>
        <p className="text-xl text-[var(--muted-foreground)] mb-8">
          You currently don't have an active unlimited wash plan. You can still pay per wash, or upgrade below!
        </p>

        <div className="grid md:grid-cols-2 gap-8 mt-6">
          
          <div className="bg-[var(--secondary)] p-8 rounded-3xl border border-[var(--border)] shadow flex flex-col justify-between">
            <div>
               <h3 className="text-3xl font-bold text-[var(--foreground)] mb-2">Monthly Clean</h3>
               <p className="text-[var(--primary)] text-4xl font-extrabold my-4">₹1,499<span className="text-xl text-[var(--muted-foreground)] font-normal"> /mo</span></p>
               <ul className="text-xl space-y-3 mb-8">
                 <li className="flex items-center gap-3"><CheckCircle className="text-green-600 w-6 h-6"/> 4 Washes (1 per week)</li>
                 <li className="flex items-center gap-3"><CheckCircle className="text-green-600 w-6 h-6"/> Interior Vacuuming</li>
                 <li className="flex items-center gap-3"><CheckCircle className="text-green-600 w-6 h-6"/> Exterior Polish</li>
               </ul>
            </div>
            
            <button className="w-full py-5 rounded-2xl bg-[var(--foreground)] hover:bg-slate-800 text-white text-2xl font-bold flex items-center gap-3 justify-center">
               <CreditCard className="w-6 h-6" /> Mock Pay Now
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
