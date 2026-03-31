"use server";

import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import Vehicle from "@/models/Vehicle";
import { revalidatePath } from "next/cache";

export async function addVehicle(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return;

  const vehicleNumber = formData.get("vehicleNumber") as string;
  const vehicleModel = formData.get("vehicleModel") as string;
  const type = formData.get("type") as string;

  if (!vehicleNumber || !vehicleModel || !type) return;

  await connectToDatabase();
  await Vehicle.create({
    userId: session.user.id,
    vehicleNumber,
    vehicleModel,
    type,
    status: 'active'
  });

  revalidatePath('/dashboard/vehicles');
  revalidatePath('/dashboard');
}

export async function removeVehicle(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return;

  const vehicleId = formData.get("vehicleId") as string;
  if (!vehicleId) return;

  await connectToDatabase();
  await Vehicle.findByIdAndDelete(vehicleId);

  revalidatePath('/dashboard/vehicles');
  revalidatePath('/dashboard');
}
