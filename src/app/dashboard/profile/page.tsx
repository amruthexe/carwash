import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import Vehicle from "@/models/Vehicle";
import { ServiceRequest } from "@/models/Service";
import { redirect } from "next/navigation";
import { User as UserIcon, Car, Mail, Phone, MapPin, Clock } from "lucide-react";
import Link from "next/link";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  await connectToDatabase();

  const user = await User.findById(session.user.id).lean();
  if (!user) {
    redirect('/login');
  }

  const vehicles = await Vehicle.find({ userId: session.user.id }).lean() as any[];

  const recentRequests = await ServiceRequest.find({ userId: session.user.id })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate({ path: 'vehicleId', model: 'Vehicle' })
    .lean() as any[];

  const address = user.address || null;

  return (
    <div className="max-w-4xl mx-auto pb-24 space-y-8">
      {/* Header with Edit Button */}
      <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-slate-200">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
              <UserIcon className="w-8 h-8 text-slate-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">{user.name}</h1>
              <p className="text-sm text-slate-500 capitalize">{user.role}</p>
              <p className="text-xs text-slate-400 mt-1">Member since {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</p>
            </div>
          </div>
          <Link
            href="/dashboard/complete-profile"
            className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow"
          >
            Edit Profile
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-blue-500" />
                <span className="text-slate-700">{user.email}</span>
              </div>
              {user.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-green-500" />
                  <span className="text-slate-700">{user.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Address Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800">Address</h3>
            {address ? (
              <div className="space-y-2 text-sm text-slate-600">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-red-500 mt-0.5" />
                  <span>{address.city}</span>
                </div>
                <div className="flex items-start gap-2 ml-6">
                  <span>{address.community}</span>
                </div>
                <div className="flex items-start gap-2 ml-6">
                  <span>Block {address.block}, Flat/Villa {address.flatNumber}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-400 italic">No address provided</p>
            )}
          </div>
        </div>
      </div>

      {/* Vehicles Section */}
      <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Car className="w-5 h-5 text-blue-600" />
            My Vehicles
          </h2>
          <Link
            href="/dashboard/vehicles"
            className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            Manage
          </Link>
        </div>

        {vehicles.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-4">
            {vehicles.map((vehicle: any) => (
              <div key={vehicle._id.toString()} className="bg-slate-50 p-4 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Car className="w-5 h-5 text-blue-600" />
                  <div>
                    <h3 className="text-base font-bold text-slate-800">{vehicle.vehicleModel}</h3>
                    <p className="text-sm text-slate-500 font-mono">{vehicle.vehicleNumber}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold uppercase ${vehicle.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {vehicle.status}
                  </span>
                  <span className="text-xs text-slate-500">{vehicle.type}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 bg-slate-50 rounded-lg">
            <p className="text-base text-slate-500 mb-3">No vehicles added</p>
            <Link
              href="/dashboard/vehicles"
              className="inline-block px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg"
            >
              Add Vehicle
            </Link>
          </div>
        )}
      </div>

      {/* Recent Service Requests */}
      <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          Recent Requests
        </h2>

        {recentRequests.length > 0 ? (
          <div className="space-y-4">
            {recentRequests.map((req: any) => (
              <div key={req._id.toString()} className="bg-slate-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <p className="text-base font-bold text-slate-800">
                      {req.vehicleId?.vehicleModel || "Unknown Vehicle"}
                    </p>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold uppercase ${getStatusBadgeClass(req.status)}`}>
                      {req.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-slate-600 mb-2">
                  {new Date(req.scheduledTime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at{' '}
                  {new Date(req.scheduledTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </p>
                {req.notes && (
                  <p className="text-xs text-slate-500 italic">{`"${req.notes}"`}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 bg-slate-50 rounded-lg">
            <p className="text-base text-slate-500">No service requests yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

function getStatusBadgeClass(status: string): string {
  switch (status) {
    case 'pending': return 'bg-orange-100 text-orange-800';
    case 'completed': return 'bg-green-100 text-green-800';
    case 'in_progress': return 'bg-blue-100 text-blue-800';
    case 'assigned': return 'bg-blue-100 text-blue-800';
    case 'cancelled': return 'bg-red-100 text-red-800';
    default: return 'bg-slate-100 text-slate-800';
  }
}
