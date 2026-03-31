import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import Vehicle from "@/models/Vehicle";
import { ServiceRequest } from "@/models/Service";
import { redirect } from "next/navigation";
import { User as UserIcon, Car, Mail, Phone, MapPin } from "lucide-react";
import Link from "next/link";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  await connectToDatabase();

  // Fetch user data
  const user = await User.findById(session.user.id).lean();
  if (!user) {
    redirect('/login');
  }

  // Fetch user's vehicles
  const vehicles = await Vehicle.find({ userId: session.user.id }).lean() as any[];

  // Fetch recent service requests
  const recentRequests = await ServiceRequest.find({ userId: session.user.id })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate({ path: 'vehicleId', model: 'Vehicle' })
    .lean() as any[];

  const address = user.address || null;

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-24">
      {/* Header */}
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border-t-8 border-[var(--primary)]">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-24 h-24 bg-[var(--secondary)] rounded-full flex items-center justify-center">
            <UserIcon className="w-12 h-12 text-[var(--primary)]" />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold text-[var(--foreground)]">{user.name}</h1>
            <p className="text-xl text-[var(--muted-foreground)] capitalize">{user.role}</p>
            <p className="text-sm text-slate-500 mt-1">Member since {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-[var(--foreground)]">Contact Information</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-blue-500" />
                <span>{user.email}</span>
              </div>
              {user.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-green-500" />
                  <span>{user.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Address Info */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-[var(--foreground)]">Address</h3>
            {address ? (
              <div className="space-y-2 text-slate-700">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-red-500" />
                  <span>{address.city}</span>
                </div>
                <div className="flex items-center gap-2 ml-7">
                  <span>{address.community}</span>
                </div>
                <div className="flex items-center gap-2 ml-7">
                  <span>Block {address.block}, Flat/Villa {address.flatNumber}</span>
                </div>
              </div>
            ) : (
              <p className="text-slate-400 italic">No address provided</p>
            )}
          </div>
        </div>
      </div>

      {/* Vehicles Section */}
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-[var(--border)]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-extrabold text-[var(--foreground)] flex items-center gap-3">
            <Car className="w-8 h-8 text-[var(--primary)]" />
            My Vehicles
          </h2>
          <Link
            href="/dashboard/vehicles"
            className="px-6 py-3 bg-[var(--primary)] text-white rounded-xl font-bold hover:bg-[var(--secondary-foreground)] transition-colors"
          >
            Manage
          </Link>
        </div>

        {vehicles.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {vehicles.map((vehicle: any) => (
              <div key={vehicle._id.toString()} className="bg-[var(--secondary)] p-6 rounded-2xl">
                <div className="flex items-center gap-4 mb-3">
                  <Car className="w-8 h-8 text-[var(--primary)]" />
                  <div>
                    <h3 className="text-2xl font-bold text-[var(--foreground)]">{vehicle.vehicleModel}</h3>
                    <p className="text-lg text-[var(--muted-foreground)] font-mono">{vehicle.vehicleNumber}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${vehicle.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {vehicle.status}
                  </span>
                  <span className="text-sm text-slate-500">{vehicle.type}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-slate-50 rounded-2xl">
            <p className="text-xl text-slate-500 mb-4">No vehicles added yet</p>
            <Link
              href="/dashboard/vehicles"
              className="inline-block px-6 py-3 bg-[var(--primary)] text-white rounded-xl font-bold hover:bg-[var(--secondary-foreground)]"
            >
              Add Vehicle
            </Link>
          </div>
        )}
      </div>

      {/* Recent Service Requests */}
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-[var(--border)]">
        <h2 className="text-3xl font-extrabold text-[var(--foreground)] mb-6 flex items-center gap-3">
          Recent Service Requests
        </h2>

        {recentRequests.length > 0 ? (
          <div className="space-y-4">
            {recentRequests.map((req: any) => (
              <div key={req._id.toString()} className="bg-[var(--secondary)] p-6 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <p className="text-lg font-bold text-[var(--foreground)]">{req.vehicleId?.vehicleModel || "Unknown Vehicle"}</p>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusBadgeClass(req.status)}`}>
                      {req.status}
                    </span>
                  </div>
                  <p className="text-slate-600">
                    {new Date(req.scheduledTime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at{' '}
                    {new Date(req.scheduledTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  {req.notes && (
                    <p className="text-sm text-slate-500 mt-2 italic">{`"${req.notes}"`}</p>
                  )}
                </div>
                <Link
                  href={`/dashboard/history`}
                  className="text-[var(--primary)] font-bold hover:underline"
                >
                  View
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-slate-50 rounded-2xl">
            <p className="text-xl text-slate-500">No service requests yet</p>
          </div>
        )}
      </div>

      {/* Edit Profile Link */}
      <div className="flex justify-center">
        <Link
          href="/dashboard/complete-profile"
          className="px-8 py-4 bg-[var(--primary)] text-white text-xl font-bold rounded-2xl hover:bg-[var(--secondary-foreground)] transition-colors shadow-lg"
        >
          Edit Profile
        </Link>
      </div>
    </div>
  );
}

function getStatusBadgeClass(status: string): string {
  switch (status) {
    case 'pending': return 'bg-orange-100 text-orange-800';
    case 'completed': return 'bg-green-100 text-green-800';
    case 'in_progress': return 'bg-blue-600 text-white';
    case 'assigned': return 'bg-blue-100 text-blue-800';
    case 'cancelled': return 'bg-red-100 text-red-800';
    default: return 'bg-slate-100 text-slate-800';
  }
}
