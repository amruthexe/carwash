import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import Vehicle from "@/models/Vehicle";
import User from "@/models/User";
import { ServiceRequest } from "@/models/Service";
import { redirect } from "next/navigation";
import { CheckCircle2, Clock, Info } from "lucide-react";

async function bookWash(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user?.id) return;

  const vehicleId = formData.get("vehicleId") as string;
  const pickedDateTime = formData.get("scheduledTime") as string;

  if (!vehicleId || !pickedDateTime) return;

  await connectToDatabase();

  const scheduledTime = new Date(pickedDateTime);
  const now = new Date();

  // Safety buffer: Must be at least 2 hours in the future
  const minimumTime = new Date(now.getTime() + 2 * 60 * 60 * 1000);

  if (scheduledTime < minimumTime) {
    redirect('/dashboard/book?error=too_soon');
  }

  // Find if user already has a request at the SAME EXACT MINUTE for this vehicle
  const docAtSameTime = await ServiceRequest.findOne({
    vehicleId,
    scheduledTime: scheduledTime,
    status: { $ne: 'cancelled' }
  });

  if (docAtSameTime) {
    redirect('/dashboard/book?error=time_taken');
  }

  // Create the service request
  await ServiceRequest.create({
    userId: session.user.id,
    vehicleId,
    requestedTime: now,
    scheduledTime: scheduledTime,
    status: 'pending'
  });

  redirect('/dashboard');
}

export default async function BookWashPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const resolvedParams = await searchParams;

  await connectToDatabase();
  const vehicles = await Vehicle.find({ userId: session.user.id, status: 'active' }).lean();

  if (vehicles.length === 0) {
    redirect('/dashboard/vehicles');
  }

  // Check if user has completed their profile address
  const userDoc = await User.findById(session.user.id).lean();
  const address = userDoc?.address;
  const isAddressComplete = address?.city && address?.community && address?.block && address?.flatNumber;
  if (!isAddressComplete) {
    redirect('/dashboard/complete-profile?redirectTo=/dashboard/book');
  }

  // Calculate default min time (+2 hours)
  const now = new Date();
  const minTime = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  const minTimeStr = minTime.toISOString().slice(0, 16);

  return (
    <div className="max-w-3xl mx-auto pb-24 space-y-8">
      <h1 className="text-4xl font-extrabold text-[var(--foreground)] tracking-tight text-center md:text-left">
        Schedule a Wash
      </h1>

      {resolvedParams.error === 'too_soon' && (
        <div className="bg-red-100 border-2 border-red-400 text-red-700 p-6 rounded-2xl flex items-center gap-4">
          <Info className="w-8 h-8 shrink-0" />
          <p className="text-xl font-bold">Please pick a time at least 2 hours from now.</p>
        </div>
      )}

      {resolvedParams.error === 'time_taken' && (
        <div className="bg-red-100 border-2 border-red-400 text-red-700 p-6 rounded-2xl flex items-center gap-4">
          <Info className="w-8 h-8 shrink-0" />
          <p className="text-xl font-bold">You already have a wash scheduled for this exact time.</p>
        </div>
      )}

      <div className="bg-blue-50 p-6 rounded-2xl flex items-start gap-4 border border-blue-200 shadow-sm">
        <Info className="w-8 h-8 text-blue-600 shrink-0" />
        <p className="text-xl text-blue-900 font-medium">
          Note: Pick any date and time! We just need at least <strong>2 hours</strong> notice to prepare.
        </p>
      </div>

      <form action={bookWash} className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border-t-8 border-[var(--primary)] space-y-12">
        
        {/* Step 1: Vehicle Selection */}
        <div>
          <h2 className="text-3xl font-bold text-[var(--foreground)] mb-6">1. Which car needs a wash?</h2>
          <div className="flex flex-col gap-4">
            {vehicles.map((v: any, index: number) => (
              <label 
                key={v._id.toString()} 
                className="flex items-center gap-6 p-6 border-4 border-[var(--border)] rounded-2xl cursor-pointer hover:border-[var(--primary)] has-[:checked]:border-[var(--primary)] has-[:checked]:bg-[var(--secondary)] transition-all"
              >
                <input 
                  type="radio" 
                  name="vehicleId" 
                  value={v._id.toString()} 
                  defaultChecked={index === 0}
                  required
                  className="w-8 h-8 text-[var(--primary)]"
                />
                <div>
                  <h3 className="text-2xl font-extrabold">{v.vehicleModel}</h3>
                  <p className="text-xl text-[var(--muted-foreground)] uppercase">{v.vehicleNumber}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        <hr className="border-[var(--border)] border-2" />

        {/* Step 2: Time Selection */}
        <div>
          <h2 className="text-3xl font-bold text-[var(--foreground)] mb-6">2. When should we come?</h2>
          <div className="space-y-4">
            <label className="block text-xl font-bold text-[var(--foreground)]">Select Date & Time</label>
            <input 
              type="datetime-local" 
              name="scheduledTime"
              min={minTimeStr}
              defaultValue={minTimeStr}
              required
              className="w-full p-6 text-3xl font-bold border-4 border-[var(--border)] rounded-2xl focus:border-[var(--primary)] focus:outline-none transition-all shadow-inner"
            />
            <p className="text-lg text-[var(--muted-foreground)]">Tap above to open the calendar.</p>
          </div>
        </div>

        <hr className="border-[var(--border)] border-2" />

        <button 
          type="submit"
          className="w-full py-8 text-3xl font-extrabold bg-[var(--foreground)] text-white hover:bg-slate-800 rounded-2xl shadow-xl flex items-center justify-center gap-4 transition-transform hover:-translate-y-1"
        >
          <CheckCircle2 className="w-10 h-10" /> Confirm Booking
        </button>

      </form>
    </div>
  );
}
