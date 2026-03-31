"use server";

import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import { ServiceRequest, WorkerAssignment } from "@/models/Service";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updateTaskStatusAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/api/auth/signin");
    return;
  }

  const assignmentId = formData.get("assignmentId") as string;
  const requestId = formData.get("requestId") as string;
  const newStatus = formData.get("newStatus") as string;

  if (!assignmentId || !requestId || !newStatus) {
    redirect("/worker");
    return;
  }

  try {
    await connectToDatabase();

    // Verify assignment belongs to this worker
    const assignment = await WorkerAssignment.findOne({
      _id: assignmentId,
      workerId: session.user.id
    });

    if (!assignment) {
      redirect("/worker");
      return;
    }

    // Update Assignment - status matches the newStatus directly
    await WorkerAssignment.findByIdAndUpdate(assignmentId, {
      status: newStatus as 'assigned' | 'accepted' | 'in_progress' | 'completed' | 'rejected'
    });

    // Update Main Request
    const reqStatusMap: Record<string, string> = {
      'accepted': 'assigned',
      'in_progress': 'in_progress',
      'completed': 'completed',
      'rejected': 'pending'
    };

    await ServiceRequest.findByIdAndUpdate(requestId, {
      status: reqStatusMap[newStatus] || newStatus
    });
  } catch (error) {
    console.error("Error updating task status:", error);
  }

  revalidatePath('/worker');
  redirect("/worker");
}
