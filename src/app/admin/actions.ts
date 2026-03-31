"use server";

import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import { ServiceRequest, WorkerAssignment } from "@/models/Service";
import { revalidatePath } from "next/cache";

export async function assignWorkerAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return;

  const requestId = formData.get("requestId") as string;
  const workerId = formData.get("workerId") as string;
  if (!requestId || !workerId) return;

  await connectToDatabase();

  const { Notification } = await import("@/models/Notification");

  const existingAssignment = await WorkerAssignment.findOne({
    requestId,
    status: { $in: ['assigned', 'accepted', 'in_progress'] }
  });

  if (existingAssignment) {
    if (existingAssignment.workerId.toString() === workerId) {
      return;
    }

    await WorkerAssignment.findByIdAndUpdate(existingAssignment._id, { status: 'rejected' });

    await Notification.create({
      userId: existingAssignment.workerId,
      title: "Task Cancelled / Reassigned",
      message: "An admin has reassigned a task that was previously on your list.",
      type: "service",
      status: "sent"
    });
  }

  const updatedReq = await ServiceRequest.findByIdAndUpdate(requestId, {
    status: "assigned",
    lastModifiedBy: session.user.id,
    lastModifiedAt: new Date()
  })
    .populate({ path: 'vehicleId', model: 'Vehicle', populate: { path: 'userId', model: 'User' } })
    .populate('lastModifiedBy', 'name');

  await WorkerAssignment.create({
    requestId,
    workerId,
    assignedBy: session.user.id,
    status: 'assigned'
  });

  await Notification.create({
    userId: workerId,
    title: "New Job Assigned!",
    message: `You have been assigned a new wash for ${updatedReq.vehicleId.vehicleModel} (${updatedReq.vehicleId.vehicleNumber}).`,
    type: "service",
    status: "sent"
  });

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

export async function updateRequestStatusAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return;

  const requestId = formData.get("requestId") as string;
  const newStatus = formData.get("newStatus") as string;
  if (!requestId || !newStatus) return;

  await connectToDatabase();

  const request = await ServiceRequest.findById(requestId);
  if (!request) return;

  if (!['assigned', 'in_progress'].includes(request.status)) {
    return;
  }

  const updateData: any = {
    status: newStatus,
    lastModifiedBy: session.user.id,
    lastModifiedAt: new Date()
  };

  await ServiceRequest.findByIdAndUpdate(requestId, updateData);

  // Update WorkerAssignment status if it exists and is not rejected
  const activeAssignment = await WorkerAssignment.findOne({
    requestId,
    status: { $in: ['assigned', 'accepted', 'in_progress'] }
  });

  if (activeAssignment) {
    const assignmentStatus = newStatus === 'completed' ? 'completed' : 'in_progress';
    await WorkerAssignment.findByIdAndUpdate(activeAssignment._id, { status: assignmentStatus });

    // Notify worker if completed
    if (newStatus === 'completed') {
      const { Notification } = await import("@/models/Notification");
      await Notification.create({
        userId: activeAssignment.workerId,
        title: "Service Completed!",
        message: "Your assigned wash service has been marked as completed by admin.",
        type: "service",
        status: "sent"
      });
    }
  }

  // Notify customer if completed
  if (newStatus === 'completed' && request.vehicleId?.userId) {
    const { Notification } = await import("@/models/Notification");
    await Notification.create({
      userId: request.vehicleId.userId,
      title: "Service Completed",
      message: "Your car wash service has been completed. Thank you!",
      type: "service",
      status: "sent"
    });
  }

  revalidatePath('/admin');
}
