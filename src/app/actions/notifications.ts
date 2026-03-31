"use server";

import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import { Notification } from "@/models/Notification";
import { revalidatePath } from "next/cache";

export async function getUnreadNotifications() {
  const session = await auth();
  if (!session?.user?.id) return [];

  await connectToDatabase();
  
  const notifications = await Notification.find({
    userId: session.user.id,
    status: 'sent'
  })
  .sort({ createdAt: -1 })
  .lean();

  return notifications.map(n => ({
    _id: n._id.toString(),
    title: n.title,
    message: n.message,
    type: n.type
  }));
}

export async function markAsRead(notificationId: string) {
  const session = await auth();
  if (!session?.user?.id) return;

  await connectToDatabase();
  
  await Notification.findByIdAndUpdate(notificationId, {
    status: 'read'
  });

  revalidatePath('/');
}
