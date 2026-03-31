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

  const { Notification } = await import("@/models/Notification");

  // Step 1: Check for existing assignment to this request
  const existingAssignment = await WorkerAssignment.findOne({ 
    requestId, 
    status: { $in: ['assigned', 'accepted', 'in_progress'] } 
  });

  if (existingAssignment) {
    if (existingAssignment.workerId.toString() === workerId) {
      // Same worker, no change needed
      return;
    }

    // Step 2: Cancel the OLD assignment
    await WorkerAssignment.findByIdAndUpdate(existingAssignment._id, { status: 'rejected' });
    
    // Notify OLD worker of cancellation
    await Notification.create({
      userId: existingAssignment.workerId,
      title: "Task Cancelled / Reassigned",
      message: "An admin has reassigned a task that was previously on your list.",
      type: "service",
      status: "sent"
    });
  }

  // Step 3: Mark/Confirm request as assigned
  const updatedReq = await ServiceRequest.findByIdAndUpdate(requestId, { status: "assigned" })
    .populate({ path: 'vehicleId', model: 'Vehicle', populate: { path: 'userId', model: 'User' } });

  // Step 4: Create internal Assignment record
  await WorkerAssignment.create({
    requestId,
    workerId,
    assignedBy: session.user.id,
    status: 'assigned'
  });

  // Step 5: Notify NEW worker
  await Notification.create({
    userId: workerId,
    title: "New Job Assigned!",
    message: `You have been assigned a new wash for ${updatedReq.vehicleId.vehicleModel} (${updatedReq.vehicleId.vehicleNumber}).`,
    type: "service",
    status: "sent"
  });

  // Step 6: Notify Customer (Only if it's the FIRST assignment)
  if (!existingAssignment && updatedReq.vehicleId?.userId) {
    const customerId = updatedReq.vehicleId.userId._id;
    await Notification.create({
      userId: customerId,
      title: "Worker Assigned!",
      message: `A worker has been assigned to your ${updatedReq.vehicleId.vehicleModel} wash!`,
      type: "service",
      status: "sent"
    });
  }

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

  const requestIds = requests.map(r => r._id);
  const assignments = await WorkerAssignment.find({ 
    requestId: { $in: requestIds },
    status: { $ne: 'rejected' }
  }).populate('workerId').lean();

  const assignmentMap: Record<string, any> = {};
  assignments.forEach(a => {
    assignmentMap[a.requestId.toString()] = a;
  });
    
  // Fetch active workers
  const workers = await User.find({ role: 'worker', status: 'active' }).lean();

  return (
    <div className="space-y-10">
      <h1 className="text-4xl font-extrabold text-[#011c33] tracking-tight text-center md:text-left">
        Service Requests Dashboard
      </h1>

      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b-2 border-slate-200">
                <th className="p-6 font-bold text-slate-700 uppercase tracking-wider text-sm">Customer & Vehicle</th>
                <th className="p-6 font-bold text-slate-700 uppercase tracking-wider text-sm">Scheduled For</th>
                <th className="p-6 font-bold text-slate-700 uppercase tracking-wider text-sm">Status</th>
                <th className="p-6 font-bold text-slate-700 uppercase tracking-wider text-sm">Worker Assignment</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req: any) => {
                const vehicle = req.vehicleId;
                const customer = vehicle?.userId;
                const activeAssignment = assignmentMap[req._id.toString()];
                const currentWorker = activeAssignment?.workerId;

                return (
                  <tr key={req._id.toString()} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="p-6">
                      <div className="flex flex-col gap-2">
                         <div className="flex items-center gap-2">
                            <span className="font-extrabold text-[#011c33] text-lg">{customer?.name || "Unknown"}</span>
                            <span className="text-sm bg-slate-200 px-2 py-0.5 rounded text-slate-600 font-bold uppercase">{vehicle?.type}</span>
                         </div>
                         <p className="text-sm text-slate-500 font-medium">{customer?.email}</p>
                         <div className="mt-1 bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1 rounded-lg inline-flex items-center gap-2">
                           <span className="font-mono font-bold tracking-widest">{vehicle?.vehicleNumber}</span>
                           <span className="text-sm opacity-60">|</span>
                           <span className="font-medium text-xs uppercase">{vehicle?.vehicleModel}</span>
                         </div>
                      </div>
                    </td>
                    <td className="p-6">
                       <p className="text-lg font-bold text-slate-700">
                         {new Date(req.scheduledTime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                       </p>
                       <p className="text-xl font-extrabold text-blue-600 font-mono">
                         {new Date(req.scheduledTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                       </p>
                    </td>
                    <td className="p-6">
                       <span className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-sm ${
                          req.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                          req.status === 'completed' ? 'bg-green-100 text-green-800' :
                          req.status === 'in_progress' ? 'bg-blue-600 text-white animate-pulse' :
                          'bg-blue-100 text-blue-800'
                       }`}>
                          {req.status}
                       </span>
                    </td>
                    <td className="p-6">
                       {req.status === 'completed' ? (
                          <div className="flex flex-col gap-1">
                             <p className="text-sm text-green-600 font-bold flex items-center gap-1 italic">
                                ✓ Task Completed
                             </p>
                             <p className="text-sm text-slate-500 font-medium">By: {currentWorker?.name || "Unknown"}</p>
                          </div>
                       ) : (
                          <div className="space-y-3">
                             {currentWorker && (
                                <p className="text-sm font-bold text-[#011c33] mb-2 flex items-center gap-1">
                                   <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                   Assigned to: {currentWorker.name}
                                </p>
                             )}
                             
                             <form action={assignWorker} className="flex flex-col gap-2">
                                <input type="hidden" name="requestId" value={req._id.toString()} />
                                <div className="flex gap-2">
                                   <select 
                                      name="workerId" 
                                      className="p-3 border-2 rounded-xl border-slate-200 text-sm font-bold focus:outline-none focus:border-blue-500 bg-white" 
                                      defaultValue={currentWorker?._id?.toString() || ""}
                                      required
                                   >
                                      <option value="" disabled>Select Worker...</option>
                                      {workers.map((w: any) => (
                                         <option key={w._id.toString()} value={w._id.toString()}>
                                            {w.name} {w._id.toString() === currentWorker?._id?.toString() ? "(current)" : ""}
                                         </option>
                                      ))}
                                   </select>
                                   <button 
                                      type="submit" 
                                      className="bg-[#011c33] hover:bg-slate-800 text-white px-4 py-3 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95"
                                   >
                                      {currentWorker ? "Update" : "Assign"}
                                   </button>
                                </div>
                             </form>
                          </div>
                       )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {requests.length === 0 && (
           <div className="p-20 text-center text-slate-400">
              <p className="text-xl font-medium italic">No cleaning requests found yet.</p>
           </div>
        )}
      </div>
    </div>
  );
}

