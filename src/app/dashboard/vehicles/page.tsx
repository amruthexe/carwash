import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import Vehicle from "@/models/Vehicle";
import { revalidatePath } from "next/cache";
import VehiclesClient from "./VehiclesClient";

export default async function VehiclesPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  await connectToDatabase();
  const vehicles = await Vehicle.find({ userId: session.user.id }).lean();

  // Convert to plain JSON to avoid serialization issues
  const serializedVehicles = JSON.parse(JSON.stringify(vehicles));

  return <VehiclesClient initialVehicles={serializedVehicles} />;
}
