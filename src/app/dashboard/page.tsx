import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import { ServiceRequest } from "@/models/Service";
import Vehicle from "@/models/Vehicle";
import User from "@/models/User";
import Link from "next/link";
import { CalendarCheck, Car, Clock, ShieldCheck, AlertCircle } from "lucide-react";

export default async function DashboardHome() {
  const session = await auth();
  if (!session?.user?.id) return null;

  await connectToDatabase();

  // Fetch user's address for completeness check
  const user = await User.findById(session.user.id).lean();
  const address = user?.address;
  const isAddressComplete = address?.city && address?.community && address?.block && address?.flatNumber;

  // Fetch user's vehicles to see if they can book a wash
  const vehicles = await Vehicle.find({ userId: session.user.id, status: 'active' }).lean();;
  
  // Fetch active or pending service requests
  const activeRequests = await ServiceRequest.find({
    userId: session.user.id,
    status: { $in: ['pending', 'assigned', 'in_progress'] }
  }).sort({ scheduledTime: 1 }).populate('vehicleId').lean();

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-24">
      {/* Welcome Banner */}
      <div className="bg-white rounded-3xl p-8 md:p-12 shadow-lg border-2 border-[var(--border)] text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Car className="w-48 h-48 text-[var(--primary)]" />
        </div>
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-[var(--foreground)] mb-4">
            Welcome back!
          </h1>
          <p className="text-2xl text-[var(--muted-foreground)]">
            Ready for a sparkling clean car today?
          </p>
        </div>
      </div>

      {/* Address Completion Banner (show if incomplete) */}
      {!isAddressComplete && (
        <div className="bg-yellow-50 p-6 rounded-2xl flex items-start gap-4 border-2 border-yellow-300 shadow-sm">
          <AlertCircle className="w-8 h-8 text-yellow-600 shrink-0" />
          <div>
            <p className="text-xl font-bold text-yellow-900">Complete your profile</p>
            <p className="text-lg text-yellow-800">
              Please provide your address details to enable booking.{" "}
              <Link href="/dashboard/complete-profile" className="underline font-bold">
                Complete now
              </Link>
            </p>
          </div>
        </div>
      )}

      {/* Main Action - HUGE BUTTON */}
      {vehicles.length > 0 ? (
        <div className="flex justify-center mt-10">
          <Link
            href={isAddressComplete ? "/dashboard/book" : "/dashboard/complete-profile?redirectTo=/dashboard/book"}
            className="w-full max-w-xl py-8 px-6 bg-[var(--primary)] hover:bg-[var(--secondary-foreground)] text-white text-3xl md:text-4xl font-extrabold rounded-3xl shadow-2xl hover:shadow-3xl hover:-translate-y-2 transition-all flex flex-col items-center justify-center gap-4 border-4 border-[var(--border)]"
          >
            <CalendarCheck className="w-16 h-16" />
            {isAddressComplete ? "Book a Wash Now" : "Complete Profile to Book"}
          </Link>
        </div>
      ) : (
        <div className="bg-[var(--secondary)] p-8 rounded-3xl text-center shadow-inner border border-[var(--border)] mt-10">
          <h2 className="text-3xl font-bold text-[var(--secondary-foreground)] mb-6">You need to add a vehicle first!</h2>
          <Link 
            href="/dashboard/vehicles"
            className="inline-block px-10 py-5 bg-[var(--foreground)] text-white text-2xl font-bold rounded-full hover:bg-slate-800 transition-colors shadow-lg"
          >
            Add My Car
          </Link>
        </div>
      )}

      {/* Upcoming / Active Wash Status */}
      <div>
        <h2 className="text-3xl font-bold text-[var(--foreground)] mb-6 flex items-center gap-3">
          <Clock className="w-8 h-8 text-[var(--primary)]" />
          Your Upcoming Cleans
        </h2>

        {activeRequests.length > 0 ? (
          <div className="grid gap-6">
            {activeRequests.map((req: any) => (
              <div key={req._id.toString()} className="bg-white p-6 md:p-8 rounded-3xl shadow-md border-l-8 border-[var(--accent)] flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                   <p className="text-xl text-[var(--muted-foreground)] mb-1">Scheduled for</p>
                   <p className="text-3xl font-extrabold text-[var(--foreground)]">
                     {new Date(req.scheduledTime).toLocaleString('en-US', { 
                       weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' 
                     })}
                   </p>
                   {req.vehicleId && (
                     <p className="text-2xl font-bold text-[var(--secondary-foreground)] mt-2">
                       {req.vehicleId.vehicleModel} - {req.vehicleId.vehicleNumber}
                     </p>
                   )}
                </div>
                
                <div className="bg-[var(--secondary)] px-8 py-4 rounded-2xl text-center min-w-[200px]">
                   <p className="text-lg text-[var(--muted-foreground)]">Status</p>
                   <p className="text-2xl font-bold text-[var(--primary)] capitalize">
                     {req.status === 'in_progress' ? 'Cleaning Now!' : req.status}
                   </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-10 rounded-3xl shadow border-2 border-[var(--border)] text-center">
            <ShieldCheck className="w-16 h-16 text-[var(--muted-foreground)] mx-auto mb-4 opacity-50" />
            <p className="text-2xl text-[var(--muted-foreground)]">No active cleaning requests.</p>
          </div>
        )}
      </div>
      
    </div>
  );
}
