import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import { ServiceRequest, WorkerAssignment } from "@/models/Service";
import User, { IUser } from "@/models/User";
import Vehicle from "@/models/Vehicle";
import { revalidatePath } from "next/cache";

async function assignWorker(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user?.id) return;

  const requestId = formData.get("requestId") as string;
  const workerId = formData.get("workerId") as string;
  if (!requestId || !workerId) return;

  await connectToDatabase();

  // Mark request as assigned
  await ServiceRequest.findByIdAndUpdate(requestId, { status: "assigned" });

  // Create Assignment record
  await WorkerAssignment.create({
    requestId,
    workerId,
    assignedBy: session.user.id,
    status: 'assigned'
  });

  revalidatePath('/admin');
}

export default async function AdminRequestsPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  await connectToDatabase();

  const requests = await ServiceRequest.find()
    .sort({ createdAt: -1 })
    .populate({ path: 'vehicleId', model: 'Vehicle', populate: { path: 'userId', model: 'User' } })
    .lean();
    
  // Fetch active workers
  const workers = await User.find({ role: 'worker', status: 'active' }).lean();

  return (
    <div className="space-y-10">
      <h1 className="text-4xl font-extrabold text-[#011c33] tracking-tight">Service Requests</h1>

      <div className="bg-white rounded-xl shadow border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-200">
              <th className="p-4 font-bold text-slate-600">Customer</th>
              <th className="p-4 font-bold text-slate-600">Vehicle</th>
              <th className="p-4 font-bold text-slate-600">Scheduled For</th>
              <th className="p-4 font-bold text-slate-600">Status</th>
              <th className="p-4 font-bold text-slate-600">Worker Assign</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req: any) => {
               const vehicle = req.vehicleId;
               const customer = vehicle?.userId;

               return (
                  <tr key={req._id.toString()} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                     <td className="p-4">
                        <p className="font-bold text-slate-800">{customer?.name || "Unknown"}</p>
                        <p className="text-sm text-slate-500">{customer?.email}</p>
                     </td>
                     <td className="p-4">
                        <p className="font-bold bg-slate-200 inline-block px-2 py-1 rounded text-slate-800">{vehicle?.vehicleNumber}</p>
                        <p className="text-sm text-slate-500 mt-1">{vehicle?.vehicleModel}</p>
                     </td>
                     <td className="p-4 font-mono text-sm text-slate-700">
                        {new Date(req.scheduledTime).toLocaleString()}
                     </td>
                     <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                           req.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                           req.status === 'completed' ? 'bg-green-100 text-green-800' :
                           'bg-blue-100 text-blue-800'
                        }`}>
                           {req.status}
                        </span>
                     </td>
                     <td className="p-4">
                        {req.status === 'pending' ? (
                           <form action={assignWorker} className="flex gap-2 items-center">
                              <input type="hidden" name="requestId" value={req._id.toString()} />
                              <select name="workerId" className="p-2 border rounded border-slate-300 text-sm focus:outline-none focus:border-blue-500" required>
                                 <option value="">Select Worker...</option>
                                 {workers.map((w: any) => (
                                    <option key={w._id.toString()} value={w._id.toString()}>{w.name}</option>
                                 ))}
                              </select>
                              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded font-bold text-sm">Assign</button>
                           </form>
                        ) : (
                           <span className="text-sm text-slate-500 italic">Locked ({req.status})</span>
                        )}
                     </td>
                  </tr>
               );
            })}
          </tbody>
        </table>
        
        {requests.length === 0 && (
           <div className="p-10 text-center text-slate-500">No requests found.</div>
        )}
      </div>
    </div>
  );
}
