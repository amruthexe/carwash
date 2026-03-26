import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import Vehicle from "@/models/Vehicle";
import { ServiceRequest, WorkerAvailability } from "@/models/Service";
import { redirect } from "next/navigation";
import { CheckCircle2, Clock, CalendarCheck, Info } from "lucide-react";

async function bookWash(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user?.id) return;

  const vehicleId = formData.get("vehicleId") as string;
  const timeOption = formData.get("timeOption") as string;
  if (!vehicleId) return;

  await connectToDatabase();
  
  // Date logic - minimum +2 hours
  const now = new Date();
  let scheduledTime = new Date(now.getTime() + 2 * 60 * 60 * 1000); // exactly 2 hours from now

  if (timeOption === 'tomorrow') {
    scheduledTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    scheduledTime.setHours(9, 0, 0, 0); // 9 AM tomorrow
  }

  // Find if user already has an active request for this vehicle
  const existingReq = await ServiceRequest.findOne({
    vehicleId,
    status: { $in: ['pending', 'assigned', 'in_progress'] }
  });

  if (existingReq) {
    // Prevent double booking
    redirect('/dashboard?error=already_booked');
  }

  // Create the service request
  await ServiceRequest.create({
    userId: session.user.id,
    vehicleId,
    requestedTime: now,
    scheduledTime: scheduledTime,
    status: 'pending'
  });

  // Simple auto-assignment logic
  // Admin assigns via dashboard, or we could automatically assign an available worker here.
  // We'll leave it pending for admin/system assignment queue.

  redirect('/dashboard');
}

export default async function BookWashPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  await connectToDatabase();
  const vehicles = await Vehicle.find({ userId: session.user.id, status: 'active' }).lean();

  if (vehicles.length === 0) {
    redirect('/dashboard/vehicles');
  }

  return (
    <div className="max-w-3xl mx-auto pb-24 space-y-8">
      <h1 className="text-4xl font-extrabold text-[var(--foreground)] tracking-tight text-center md:text-left">
        Schedule a Wash
      </h1>

      <div className="bg-blue-50 p-6 rounded-2xl flex items-start gap-4 border border-blue-200 shadow-sm">
        <Info className="w-8 h-8 text-blue-600 shrink-0" />
        <p className="text-xl text-blue-900 font-medium">
          Note: Your wash is scheduled for the next available slot at least <strong>2 hours</strong> from now.
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
          <div className="flex flex-col md:flex-row gap-6">
            <label className="flex-1 flex flex-col items-center justify-center p-8 border-4 border-[var(--border)] rounded-2xl cursor-pointer hover:border-[var(--primary)] has-[:checked]:border-[var(--primary)] has-[:checked]:bg-[var(--secondary)] transition-all text-center">
              <input type="radio" name="timeOption" value="asap" defaultChecked className="hidden" />
              <Clock className="w-16 h-16 text-[var(--primary)] mb-4" />
              <span className="text-2xl font-bold">Today (ASAP)</span>
              <span className="text-lg text-[var(--muted-foreground)] block mt-2">In 2 Hours</span>
            </label>
            
            <label className="flex-1 flex flex-col items-center justify-center p-8 border-4 border-[var(--border)] rounded-2xl cursor-pointer hover:border-[var(--primary)] has-[:checked]:border-[var(--primary)] has-[:checked]:bg-[var(--secondary)] transition-all text-center">
              <input type="radio" name="timeOption" value="tomorrow" className="hidden" />
              <CalendarCheck className="w-16 h-16 text-[var(--primary)] mb-4" />
              <span className="text-2xl font-bold">Tomorrow</span>
              <span className="text-lg text-[var(--muted-foreground)] block mt-2">Morning (9 AM)</span>
            </label>
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
