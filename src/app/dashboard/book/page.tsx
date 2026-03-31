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
  const minimumTime = new Date(now.getTime() + 2 * 60 * 60 * 1000);

  if (scheduledTime < minimumTime) {
    redirect('/dashboard/book?error=too_soon');
  }

  const docAtSameTime = await ServiceRequest.findOne({
    vehicleId,
    scheduledTime: scheduledTime,
    status: { $ne: 'cancelled' }
  });

  if (docAtSameTime) {
    redirect('/dashboard/book?error=time_taken');
  }

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

  const userDoc = await User.findById(session.user.id).lean();
  const address = userDoc?.address;
  const isAddressComplete = address?.city && address?.community && address?.block && address?.flatNumber;
  if (!isAddressComplete) {
    redirect('/dashboard/complete-profile?redirectTo=/dashboard/book');
  }

  const now = new Date();
  const minTime = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  const minTimeStr = minTime.toISOString().slice(0, 16);

  return (
    <div className="max-w-3xl mx-auto pb-24 space-y-8">
      <h1 className="text-2xl font-bold text-slate-800 text-center md:text-left">
        Schedule a Wash
      </h1>

      {resolvedParams.error === 'too_soon' && (
        <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded-xl flex items-center gap-3">
          <Info className="w-5 h-5 shrink-0" />
          <p className="font-medium text-sm">Please pick a time at least 2 hours from now.</p>
        </div>
      )}

      {resolvedParams.error === 'time_taken' && (
        <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded-xl flex items-center gap-3">
          <Info className="w-5 h-5 shrink-0" />
          <p className="font-medium text-sm">You already have a wash scheduled for this exact time.</p>
        </div>
      )}

      <div className="bg-blue-50 p-4 rounded-xl flex items-start gap-3 border border-blue-200">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <p className="text-sm text-blue-900">
          Note: Pick any date and time! We just need at least <strong>2 hours</strong> notice to prepare.
        </p>
      </div>

      <form action={bookWash} className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-slate-200 space-y-8">

        {/* Step 1: Vehicle Selection */}
        <div>
          <h2 className="text-lg font-bold text-slate-800 mb-4">1. Which car needs a wash?</h2>
          <div className="flex flex-col gap-3">
            {vehicles.map((v: any, index: number) => (
              <label
                key={v._id.toString()}
                className="flex items-center gap-4 p-4 border border-slate-300 rounded-lg cursor-pointer hover:border-blue-500 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50 transition-all"
              >
                <input
                  type="radio"
                  name="vehicleId"
                  value={v._id.toString()}
                  defaultChecked={index === 0}
                  required
                  className="w-4 h-4 text-blue-600"
                />
                <div>
                  <h3 className="text-base font-bold text-slate-800">{v.vehicleModel}</h3>
                  <p className="text-sm text-slate-500 uppercase">{v.vehicleNumber}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        <hr className="border-slate-200" />

        {/* Step 2: Time Selection */}
        <div>
          <h2 className="text-lg font-bold text-slate-800 mb-4">2. When should we come?</h2>
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-700">Select Date & Time</label>
            <input
              type="datetime-local"
              name="scheduledTime"
              min={minTimeStr}
              defaultValue={minTimeStr}
              required
              className="w-full p-4 border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-base"
            />
            <p className="text-sm text-slate-500">Tap above to open the calendar</p>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-4 text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow hover:shadow-md transition-all flex items-center justify-center gap-3"
        >
          <CheckCircle2 className="w-5 h-5" /> Confirm Booking
        </button>

      </form>
    </div>
  );
}
