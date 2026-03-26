import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import { revalidatePath } from "next/cache";

async function addWorker(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user?.id) return;

  const email = formData.get("email") as string;
  const name = formData.get("name") as string;
  if (!email || !name) return;

  await connectToDatabase();

  const exists = await User.findOne({ email });
  if (exists) return; // Basic check

  await User.create({
    name,
    email,
    role: 'worker',
    status: 'active'
    // Default pwd 'admin123' is checked natively in auth.ts
  });

  revalidatePath('/admin/workers');
}

export default async function AdminWorkersPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  await connectToDatabase();

  const workers = await User.find({ role: 'worker' }).lean();

  return (
    <div className="space-y-10">
      <h1 className="text-4xl font-extrabold text-[#011c33] tracking-tight">Worker Management</h1>

      <div className="bg-white p-6 rounded-xl shadow border border-slate-200">
         <h2 className="text-xl font-bold text-slate-800 mb-4">Add New Worker</h2>
         <form action={addWorker} className="flex gap-4 items-end">
            <div className="flex-1">
               <label className="block text-sm font-bold text-slate-700 mb-1">Worker Name</label>
               <input name="name" type="text" className="w-full p-3 border rounded-lg" required />
            </div>
            <div className="flex-1">
               <label className="block text-sm font-bold text-slate-700 mb-1">Worker Email</label>
               <input name="email" type="email" className="w-full p-3 border rounded-lg" required />
            </div>
            <button type="submit" className="bg-[#011c33] hover:bg-slate-800 text-white px-6 py-3 rounded-lg font-bold">Add Worker</button>
         </form>
         <p className="text-sm text-slate-500 mt-2">New workers will use the default password <code>admin123</code>.</p>
      </div>

      <div className="bg-white rounded-xl shadow border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-200">
              <th className="p-4 font-bold text-slate-600">Name</th>
              <th className="p-4 font-bold text-slate-600">Email</th>
              <th className="p-4 font-bold text-slate-600">Status</th>
            </tr>
          </thead>
          <tbody>
            {workers.map((worker: any) => (
               <tr key={worker._id.toString()} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-4 font-bold">{worker.name}</td>
                  <td className="p-4">{worker.email}</td>
                  <td className="p-4">
                     <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold uppercase">{worker.status}</span>
                  </td>
               </tr>
            ))}
          </tbody>
        </table>
        
        {workers.length === 0 && (
           <div className="p-10 text-center text-slate-500">No workers found. Add one above.</div>
        )}
      </div>
    </div>
  );
}
