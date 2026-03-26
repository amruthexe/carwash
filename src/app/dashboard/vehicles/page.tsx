import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import Vehicle from "@/models/Vehicle";
import { revalidatePath } from "next/cache";
import { Car, Bike, Trash2, PlusCircle } from "lucide-react";

async function addVehicle(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user?.id) return;

  const vehicleNumber = formData.get("vehicleNumber") as string;
  const vehicleModel = formData.get("vehicleModel") as string;
  const type = formData.get("type") as string;

  if (!vehicleNumber || !vehicleModel || !type) return;

  await connectToDatabase();
  await Vehicle.create({
    userId: session.user.id,
    vehicleNumber,
    vehicleModel,
    type,
    status: 'active'
  });

  revalidatePath('/dashboard/vehicles');
  revalidatePath('/dashboard');
}

async function removeVehicle(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user?.id) return;

  const vehicleId = formData.get("vehicleId") as string;
  if (!vehicleId) return;

  await connectToDatabase();
  // Safe delete (mark inactive or delete)
  await Vehicle.findByIdAndDelete(vehicleId);

  revalidatePath('/dashboard/vehicles');
  revalidatePath('/dashboard');
}

export default async function VehiclesPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  await connectToDatabase();
  const vehicles = await Vehicle.find({ userId: session.user.id }).lean();

  return (
    <div className="max-w-4xl mx-auto pb-24 space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <h1 className="text-4xl md:text-5xl font-extrabold text-[var(--foreground)] tracking-tight">
          My Vehicles
        </h1>
      </div>

      {vehicles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {vehicles.map((v: any) => (
            <div key={v._id.toString()} className="bg-white p-8 rounded-3xl shadow-xl border-t-8 border-[var(--primary)] flex flex-col justify-between hover:shadow-2xl transition-all">
              <div className="flex items-center gap-6 mb-6">
                <div className="bg-[var(--secondary)] p-4 rounded-full">
                  {v.type === 'car' ? <Car className="w-12 h-12 text-[var(--primary)]" /> : <Bike className="w-12 h-12 text-[var(--primary)]" />}
                </div>
                <div>
                  <h3 className="text-3xl font-extrabold text-[var(--foreground)]">{v.vehicleModel}</h3>
                  <p className="text-xl font-bold text-[var(--muted-foreground)] mt-2 uppercase tracking-wide bg-slate-100 px-3 py-1 rounded inline-block">
                    {v.vehicleNumber}
                  </p>
                </div>
              </div>
              
              <form action={removeVehicle} className="mt-4">
                <input type="hidden" name="vehicleId" value={v._id.toString()} />
                <button 
                  type="submit" 
                  className="w-full flex justify-center items-center gap-2 text-xl font-bold px-6 py-4 rounded-xl text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-6 h-6" /> Remove Vehicle
                </button>
              </form>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 text-center rounded-3xl shadow-lg border-[var(--border)] border">
          <p className="text-3xl text-[var(--muted-foreground)] font-bold mb-4">No vehicles found.</p>
          <p className="text-xl text-[var(--muted-foreground)]">Please add a vehicle below to start booking washes.</p>
        </div>
      )}

      {/* Add Vehicle Form - Huge and Accessible */}
      <div className="bg-[var(--secondary)] p-8 md:p-12 rounded-3xl shadow-inner border-2 border-[var(--border)]">
        <h2 className="text-3xl font-bold text-[var(--foreground)] mb-8 flex items-center gap-4">
          <PlusCircle className="w-10 h-10 text-[var(--primary)]" />
          Add a New Vehicle
        </h2>

        <form action={addVehicle} className="space-y-8">
          <div>
            <label className="block text-2xl font-bold text-[var(--foreground)] mb-3">Vehicle Model</label>
            <input 
              name="vehicleModel" 
              type="text" 
              placeholder="e.g. Honda Civic, Toyota Corolla" 
              required
              className="w-full p-5 text-2xl border-4 border-[var(--border)] rounded-2xl focus:border-[var(--primary)] focus:ring focus:ring-[var(--primary)] outline-none"
            />
          </div>

          <div>
            <label className="block text-2xl font-bold text-[var(--foreground)] mb-3">License Plate Number</label>
            <input 
              name="vehicleNumber" 
              type="text" 
              placeholder="e.g. MH 12 AB 1234" 
              required
              className="w-full p-5 text-2xl border-4 border-[var(--border)] rounded-2xl focus:border-[var(--primary)] focus:ring focus:ring-[var(--primary)] outline-none uppercase font-mono"
            />
          </div>

          <div>
            <label className="block text-2xl font-bold text-[var(--foreground)] mb-4">Vehicle Type</label>
            <div className="flex gap-6">
              <label className="flex-1 flex flex-col items-center justify-center p-6 bg-white border-4 border-[var(--border)] rounded-2xl cursor-pointer hover:border-[var(--primary)] has-[:checked]:border-[var(--primary)] has-[:checked]:bg-[var(--secondary)] transition-all">
                <input type="radio" name="type" value="car" defaultChecked className="hidden" />
                <Car className="w-16 h-16 text-[var(--primary)] mb-4" />
                <span className="text-2xl font-bold">Car</span>
              </label>
              
              <label className="flex-1 flex flex-col items-center justify-center p-6 bg-white border-4 border-[var(--border)] rounded-2xl cursor-pointer hover:border-[var(--primary)] has-[:checked]:border-[var(--primary)] has-[:checked]:bg-[var(--secondary)] transition-all">
                <input type="radio" name="type" value="bike" className="hidden" />
                <Bike className="w-16 h-16 text-[var(--primary)] mb-4" />
                <span className="text-2xl font-bold">Bike</span>
              </label>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-[var(--foreground)] hover:bg-slate-800 text-white text-3xl font-extrabold py-6 rounded-2xl shadow-xl hover:-translate-y-1 transition-all mt-6"
          >
            Save Vehicle
          </button>
        </form>
      </div>

    </div>
  );
}
