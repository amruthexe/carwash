"use server";

import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import { revalidatePath } from "next/cache";

export async function updateAddress(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const city = formData.get("city") as string;
  const community = formData.get("community") as string;
  const block = formData.get("block") as string;
  const flatNumber = formData.get("flatNumber") as string;

  if (!city || !community || !block || !flatNumber) {
    return { success: false, error: "All address fields are required" };
  }

  try {
    await connectToDatabase();

    await User.findByIdAndUpdate(session.user.id, {
      address: {
        city,
        community,
        block,
        flatNumber,
      },
    });

    // Revalidate cache to reflect changes
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/complete-profile");

    return { success: true };
  } catch (error) {
    console.error("Update address error:", error);
    return { success: false, error: "Failed to update address" };
  }
}

export async function getUserAddress() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  await connectToDatabase();
  const user = await User.findById(session.user.id).lean();
  if (!user) return null;

  const address = user.address || {};
  return {
    city: address.city || "",
    community: address.community || "",
    block: address.block || "",
    flatNumber: address.flatNumber || "",
  };
}
