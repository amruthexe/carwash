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
    <div className="max-w-4xl mx-auto space-y-8 pb-24">
      {/* Welcome Banner */}
      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-md border border-slate-200 text-center relative">
        <div className="relative z-10">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">
            Welcome back!
          </h1>
          <p className="text-lg text-slate-500">
            Ready for a clean car?
          </p>
        </div>
      </div>

      {/* Address Completion Banner (show if incomplete) */}
      {!isAddressComplete && (
        <div className="bg-amber-50 p-4 rounded-xl flex items-start gap-3 border border-amber-200">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-900">Complete your profile</p>
            <p className="text-sm text-amber-800">
              Please provide your address to enable booking.{" "}
              <Link href="/dashboard/complete-profile" className="underline font-medium">
                Complete now
              </Link>
            </p>
          </div>
        </div>
      )}

      {/* Main Action Button */}
      {vehicles.length > 0 ? (
        <div className="flex justify-center">
          <Link
            href={isAddressComplete ? "/dashboard/book" : "/dashboard/complete-profile?redirectTo=/dashboard/book"}
            className="w-full max-w-md py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white text-xl font-semibold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-3"
          >
            <CalendarCheck className="w-6 h-6" />
            {isAddressComplete ? "Book a Wash" : "Complete Profile to Book"}
          </Link>
        </div>
      ) : (
        <div className="bg-slate-100 p-6 rounded-xl text-center border border-slate-200">
          <h2 className="text-xl font-bold text-slate-700 mb-4">Add a vehicle to get started</h2>
          <Link
            href="/dashboard/vehicles"
            className="inline-block px-6 py-3 bg-slate-800 text-white font-semibold rounded-lg hover:bg-slate-900 transition-colors shadow"
          >
            Add Vehicle
          </Link>
        </div>
      )}

      {/* Upcoming / Active Wash Status */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          Upcoming Cleans
        </h2>

        {activeRequests.length > 0 ? (
          <div className="space-y-4">
            {activeRequests.map((req: any) => (
              <div key={req._id.toString()} className="bg-white p-4 md:p-6 rounded-xl shadow-sm border-l-4 border-blue-500 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                   <p className="text-sm text-slate-500 mb-1">Scheduled</p>
                   <p className="text-lg font-bold text-slate-800">
                     {new Date(req.scheduledTime).toLocaleDateString('en-US', {
                       weekday: 'short', month: 'short', day: 'numeric'
                     })}{' '}
                     at{' '}
                     {new Date(req.scheduledTime).toLocaleTimeString('en-US', {
                       hour: '2-digit', minute: '2-digit'
                     })}
                   </p>
                   {req.vehicleId && (
                     <p className="text-base font-medium text-slate-600 mt-1">
                       {req.vehicleId.vehicleModel} • {req.vehicleId.vehicleNumber}
                     </p>
                   )}
                </div>

                <div className="bg-blue-50 px-4 py-2 rounded-lg text-center">
                   <p className="text-xs text-blue-600 uppercase font-semibold">Status</p>
                   <p className="text-base font-bold text-blue-700 capitalize">
                     {req.status === 'in_progress' ? 'Cleaning Now' : req.status}
                   </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-center">
            <ShieldCheck className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <p className="text-lg font-medium text-slate-600">No active requests</p>
            <p className="text-sm text-slate-500">Book a wash to get started!</p>
          </div>
        )}
      </div>
      
    </div>
  );
}
