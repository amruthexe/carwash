import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import { ServiceRequest, WorkerAssignment } from "@/models/Service";
import User from "@/models/User";
import AdminRequestsClient from "./AdminRequestsClient";

export default async function AdminRequestsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  await connectToDatabase();

  const requests = await ServiceRequest.find()
    .sort({ createdAt: -1 })
    .populate({
      path: 'vehicleId',
      model: 'Vehicle',
      populate: {
        path: 'userId',
        model: 'User',
        select: 'name email address'
      }
    })
    .populate('lastModifiedBy', 'name')
    .lean();

  const requestIds = requests.map(r => r._id);
  const assignments = await WorkerAssignment.find({
    requestId: { $in: requestIds },
    status: { $ne: 'rejected' }
  }).populate('workerId', 'name').lean();

  const workers = await User.find({ role: 'worker', status: 'active' }).select('_id name').lean();

  // Convert to plain JSON objects and format dates consistently
  const serializedRequests = JSON.parse(JSON.stringify(requests)).map((req: any) => {
    // Format dates on server to avoid hydration mismatch
    if (req.scheduledTime) {
      const date = new Date(req.scheduledTime);
      req.scheduledTime_formatted = {
        date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      };
    }
    if (req.lastModifiedAt) {
      const date = new Date(req.lastModifiedAt);
      req.lastModifiedAt_formatted = {
        date: date.toLocaleDateString('en-US'),
        time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      };
    }
    return req;
  });
  const serializedAssignments = JSON.parse(JSON.stringify(assignments));
  const serializedWorkers = JSON.parse(JSON.stringify(workers));

  return <AdminRequestsClient
    initialRequests={serializedRequests}
    initialAssignments={serializedAssignments}
    workers={serializedWorkers}
  />;
}
