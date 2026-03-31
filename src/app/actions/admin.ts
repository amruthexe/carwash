"use server";

import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import { ServiceRequest, WorkerAssignment } from "@/models/Service";
import { revalidatePath } from "next/cache";

export async function assignWorker(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) {
    return;
  }

  const requestId = formData.get("requestId") as string;
  const workerId = formData.get("workerId") as string;
  if (!requestId || !workerId) {
    return;
  }

  try {
    await connectToDatabase();

    // Check for existing assignment to this request
    const existingAssignment = await WorkerAssignment.findOne({
      requestId,
      status: { $in: ['assigned', 'accepted', 'in_progress'] }
    });

    if (existingAssignment) {
      if (existingAssignment.workerId.toString() === workerId) {
        // Same worker, no change needed
        return;
      }

      // Cancel the OLD assignment
      await WorkerAssignment.findByIdAndUpdate(existingAssignment._id, { status: 'rejected' });

      // Send notification to old worker (optional - if Notification model exists)
      try {
        const { Notification } = await import("@/models/Notification");
        await Notification.create({
          userId: existingAssignment.workerId,
          title: "Task Cancelled / Reassigned",
          message: "An admin has reassigned a task that was previously on your list.",
          type: "service",
          status: "sent"
        });
      } catch (e) {
        // Notification model may not exist yet, skip silently
        console.log("Notification system not available");
      }
    }

    // Update request status to 'assigned' with tracking
    const updateData: any = {
      status: "assigned",
      lastModifiedBy: session.user.id,
      lastModifiedAt: new Date()
    };

    await ServiceRequest.findByIdAndUpdate(requestId, {
      ...updateData,
      $push: {
        statusHistory: {
          status: "assigned",
          changedBy: session.user.id,
          changedAt: new Date()
        }
      }
    });

    // Get vehicle info for notifications
    const req = await ServiceRequest.findById(requestId).populate('vehicleId');

    // Create new assignment
    await WorkerAssignment.create({
      requestId,
      workerId,
      assignedBy: session.user.id,
      status: 'assigned'
    });

    // Notify new worker
    try {
      const { Notification } = await import("@/models/Notification");
      await Notification.create({
        userId: workerId,
        title: "New Job Assigned!",
        message: `You have been assigned a new wash for ${req.vehicleId?.vehicleModel || 'a vehicle'}.`,
        type: "service",
        status: "sent"
      });
    } catch (e) {
      console.log("Notification system not available");
    }

    // Notify customer (only if it's the first assignment)
    if (!existingAssignment && req.vehicleId?.userId) {
      try {
        const { Notification } = await import("@/models/Notification");
        await Notification.create({
          userId: req.vehicleId.userId,
          title: "Worker Assigned!",
          message: `A worker has been assigned to your ${req.vehicleId.vehicleModel} wash!`,
          type: "service",
          status: "sent"
        });
      } catch (e) {
        console.log("Notification system not available");
      }
    }

    revalidatePath('/admin');
    revalidatePath('/worker');

    return;
  } catch (error) {
    console.error("Assign worker error:", error);
    return;
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

    revalidatePath('/admin');
    revalidatePath('/worker');

    return { success: true };
  } catch (error) {
    console.error("Update service status error:", error);
    return { success: false, error: "Failed to update status" };
  }
}
