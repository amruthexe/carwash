"use server";

import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import { ServiceRequest, WorkerAssignment } from "@/models/Service";
import { revalidatePath } from "next/cache";

export async function updateServiceStatus(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const requestId = formData.get("requestId") as string;
  const newStatus = formData.get("newStatus") as string;
  const notes = formData.get("notes") as string;

  if (!requestId || !newStatus) {
    return { success: false, error: "Missing required fields" };
  }

  try {
    await connectToDatabase();

    // Get the request to verify it exists
    const request = await ServiceRequest.findById(requestId);
    if (!request) {
      return { success: false, error: "Service request not found" };
    }

    // Update status with tracking
    const updateData: any = {
      status: newStatus,
      lastModifiedBy: session.user.id,
      lastModifiedAt: new Date()
    };

    // Push to status history
    await ServiceRequest.findByIdAndUpdate(requestId, {
      ...updateData,
      $push: {
        statusHistory: {
          status: newStatus,
          changedBy: session.user.id,
          changedAt: new Date(),
          notes: notes || undefined
        }
      }
    });

    // If status is 'assigned', also create/update WorkerAssignment
    if (newStatus === 'assigned') {
      const workerId = formData.get("workerId") as string;
      if (workerId) {
        // Check for existing active assignment
        const existing = await WorkerAssignment.findOne({
          requestId,
          status: { $in: ['assigned', 'accepted', 'in_progress'] }
        });

        if (existing) {
          if (existing.workerId.toString() !== workerId) {
            // Reassign to different worker
            await WorkerAssignment.findByIdAndUpdate(existing._id, { status: 'rejected' });
            await WorkerAssignment.create({
              requestId,
              workerId,
              assignedBy: session.user.id,
              status: 'assigned'
            });
          }
        } else {
          // Create new assignment
          await WorkerAssignment.create({
            requestId,
            workerId,
            assignedBy: session.user.id,
            status: 'assigned'
          });
        }
      }
    }

    revalidatePath('/admin');
    revalidatePath('/worker');

    return { success: true };
  } catch (error) {
    console.error("Update service status error:", error);
    return { success: false, error: "Failed to update status" };
  }
}

export async function getWorkerOngoingCounts() {
  await connectToDatabase();

  // Count ongoing assignments per worker (status: assigned, accepted, in_progress)
  const counts = await WorkerAssignment.aggregate([
    {
      $match: {
        status: { $in: ['assigned', 'accepted', 'in_progress'] }
      }
    },
    {
      $group: {
        _id: "$workerId",
        count: { $sum: 1 }
      }
    }
  ]);

  // Convert to map for easy lookup
  const countMap: Record<string, number> = {};
  counts.forEach((item: any) => {
    countMap[item._id.toString()] = item.count;
  });

  return countMap;
}
