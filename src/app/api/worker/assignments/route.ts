import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import { WorkerAssignment, ServiceRequest } from "@/models/Service";
import User from "@/models/User";

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectToDatabase();

    // Fetch both live and past assignments
    const [liveAssignments, pastAssignments] = await Promise.all([
      // Live tasks: assigned, accepted, in_progress
      WorkerAssignment.find({
        workerId: session.user.id,
        status: { $in: ['assigned', 'accepted', 'in_progress'] }
      })
        .populate({
          path: 'requestId',
          populate: [{
            path: 'vehicleId',
            model: 'Vehicle',
            populate: { path: 'userId', model: 'User' }
          }]
        })
        .lean(),

      // Past tasks: completed (or rejected if you want to show)
      WorkerAssignment.find({
        workerId: session.user.id,
        status: { $in: ['completed', 'rejected'] }
      })
        .populate({
          path: 'requestId',
          populate: [{
            path: 'vehicleId',
            model: 'Vehicle',
            populate: { path: 'userId', model: 'User' }
          }]
        })
        .lean()
    ]);

    return NextResponse.json({
      live: liveAssignments,
      past: pastAssignments
    });
  } catch (error) {
    console.error("Error fetching assignments:", error);
    return NextResponse.json(
      { error: "Failed to fetch assignments" },
      { status: 500 }
    );
  }
}
