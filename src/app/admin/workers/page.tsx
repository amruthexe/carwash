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
      <h1 className="text-2xl md:text-3xl font-bold text-[#011c33] tracking-tight">Worker Management</h1>

      <div className="bg-white p-6 rounded-xl shadow border border-slate-200">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Add New Worker</h2>
        <form action={addWorker} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-slate-700 mb-1">Worker Name</label>
            <input name="name" type="text" className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-slate-700 mb-1">Worker Email</label>
            <input name="email" type="email" className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>
          <button type="submit" className="w-full md:w-auto bg-[#011c33] hover:bg-slate-800 text-white px-6 py-3 rounded-lg font-medium transition-all">Add Worker</button>
        </form>
        <p className="text-sm text-slate-500 mt-2">New workers will use the default password <code className="bg-slate-100 px-1 rounded text-xs">admin123</code>.</p>
      </div>

      <div className="bg-white rounded-xl shadow border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200">
                <th className="p-4 font-semibold text-slate-700 text-sm">Name</th>
                <th className="p-4 font-semibold text-slate-700 text-sm">Email</th>
                <th className="p-4 font-semibold text-slate-700 text-sm">Status</th>
              </tr>
            </thead>
            <tbody>
              {workers.map((worker: any) => (
                 <tr key={worker._id.toString()} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-4 font-medium text-slate-900">{worker.name}</td>
                    <td className="p-4 text-slate-600">{worker.email}</td>
                    <td className="p-4">
                       <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold uppercase">{worker.status}</span>
                    </td>
                   </tr>
              ))}
            </tbody>
          </table>
        </div>

        {workers.length === 0 && (
           <div className="p-10 text-center text-slate-500">No workers found. Add one above.</div>
        )}
      </div>
    </div>
  );
}
