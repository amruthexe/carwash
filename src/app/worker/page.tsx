import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import { ServiceRequest, WorkerAssignment } from "@/models/Service";
import Vehicle from "@/models/Vehicle";
import { revalidatePath } from "next/cache";
import { MapPin, Clock, CheckCircle } from "lucide-react";

async function updateTaskStatus(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user?.id) return;

  const assignmentId = formData.get("assignmentId") as string;
  const requestId = formData.get("requestId") as string;
  const newStatus = formData.get("newStatus") as string; // 'accepted', 'in_progress', 'completed'

  if (!assignmentId || !requestId || !newStatus) return;

  await connectToDatabase();
  
  // Update Assignment
  await WorkerAssignment.findByIdAndUpdate(assignmentId, { status: newStatus === 'in_progress' ? 'accepted' : newStatus });

  // Update Main Request
  const reqStatusMap: Record<string, string> = {
    'accepted': 'assigned',
    'in_progress': 'in_progress',
    'completed': 'completed',
    'rejected': 'pending' // Revert to pending so admin can re-assign
  };

  await ServiceRequest.findByIdAndUpdate(requestId, { status: reqStatusMap[newStatus] || newStatus });

  revalidatePath('/worker');
}

export default async function WorkerDashboard() {
  const session = await auth();
  if (!session?.user?.id) return null;

  await connectToDatabase();

  // Find all assignments for this worker that are not completed or rejected
  const assignments = await WorkerAssignment.find({
    workerId: session.user.id,
    status: { $in: ['assigned', 'accepted', 'in_progress'] }
  })
  .populate({
    path: 'requestId',
    populate: { path: 'vehicleId', model: 'Vehicle' }
  })
  .lean();

  return (
    <div className="space-y-10">
      <h2 className="text-4xl md:text-5xl font-extrabold text-[var(--foreground)] tracking-tight">Today's Jobs</h2>

      {assignments.length > 0 ? (
        <div className="grid gap-8">
          {assignments.map((assignment: any) => {
            const req = assignment.requestId;
            const vehicle = req?.vehicleId;

            return (
              <div key={assignment._id.toString()} className="bg-white p-8 md:p-10 rounded-3xl shadow-xl border-t-8 border-[var(--primary)] text-center flex flex-col gap-6">
                 
                 <div className="flex flex-col items-center gap-2">
                   <p className="text-2xl font-bold bg-blue-100 text-blue-800 px-6 py-2 rounded-full mb-4 inline-block shadow-sm">
                     {new Date(req.scheduledTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                   </p>
                   <h3 className="text-4xl font-extrabold text-[var(--foreground)]">{vehicle?.vehicleModel || "Unknown Vehicle"}</h3>
                   <p className="text-3xl font-mono bg-slate-100 px-4 py-2 mt-2 rounded border border-slate-300">
                     {vehicle?.vehicleNumber || "NO PLATE"}
                   </p>
                 </div>

                 <hr className="my-4 border-[var(--border)] border-2 w-full max-w-lg mx-auto" />

                 {/* Action Buttons based on current status */}
                 <div className="mt-4 flex flex-col gap-4 max-w-md mx-auto w-full">
                    {assignment.status === 'assigned' && (
                      <div className="flex flex-col gap-4">
                        <form action={updateTaskStatus}>
                           <input type="hidden" name="assignmentId" value={assignment._id.toString()} />
                           <input type="hidden" name="requestId" value={req._id.toString()} />
                           <input type="hidden" name="newStatus" value="accepted" />
                           <button type="submit" className="w-full py-8 text-3xl font-extrabold bg-green-600 hover:bg-green-700 text-white rounded-2xl shadow-xl">
                              Accept Job
                           </button>
                        </form>
                        <form action={updateTaskStatus}>
                           <input type="hidden" name="assignmentId" value={assignment._id.toString()} />
                           <input type="hidden" name="requestId" value={req._id.toString()} />
                           <input type="hidden" name="newStatus" value="rejected" />
                           <button type="submit" className="w-full py-6 text-2xl font-bold bg-white border-4 border-red-500 text-red-600 hover:bg-red-50 rounded-2xl shadow">
                              Reject Job
                           </button>
                        </form>
                      </div>
                    )}

                    {assignment.status === 'accepted' && (
                      <div className="flex flex-col gap-4">
                        <form action={updateTaskStatus}>
                           <input type="hidden" name="assignmentId" value={assignment._id.toString()} />
                           <input type="hidden" name="requestId" value={req._id.toString()} />
                           <input type="hidden" name="newStatus" value="in_progress" />
                           <button type="submit" className="w-full py-8 text-3xl font-extrabold bg-blue-500 hover:bg-blue-600 text-white rounded-2xl shadow-xl">
                              Start Cleaning (I'm Here)
                           </button>
                        </form>
                        <form action={updateTaskStatus}>
                           <input type="hidden" name="assignmentId" value={assignment._id.toString()} />
                           <input type="hidden" name="requestId" value={req._id.toString()} />
                           <input type="hidden" name="newStatus" value="rejected" />
                           <button type="submit" className="w-full py-6 text-2xl font-bold bg-white border-4 border-red-500 text-red-600 hover:bg-red-50 rounded-2xl shadow">
                              Cancel / Reject Job
                           </button>
                        </form>
                      </div>
                    )}

                    {assignment.status === 'in_progress' && (
                      <form action={updateTaskStatus}>
                         <input type="hidden" name="assignmentId" value={assignment._id.toString()} />
                         <input type="hidden" name="requestId" value={req._id.toString()} />
                         <input type="hidden" name="newStatus" value="completed" />
                         <button type="submit" className="w-full py-8 text-3xl font-extrabold bg-purple-600 hover:bg-purple-700 text-white rounded-2xl shadow-xl flex items-center justify-center gap-4">
                            <CheckCircle className="w-10 h-10" /> Finish Job
                         </button>
                      </form>
                    )}
                 </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white p-12 text-center rounded-3xl shadow border-2 border-[var(--border)]">
           <MapPin className="w-24 h-24 text-[var(--muted-foreground)] opacity-50 mx-auto mb-6" />
           <p className="text-3xl text-[var(--muted-foreground)] font-bold">No active jobs assigned.</p>
           <p className="text-xl text-slate-500 mt-4">Take a break or check back later!</p>
        </div>
      )}
    </div>
  );
}
