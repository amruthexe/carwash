"use server";

import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import { Plan } from "@/models/Plan";

// Create a new plan
export async function createPlan(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return;

  const name = formData.get("name") as string;
  const price = Number(formData.get("price"));
  const numberOfServices = Number(formData.get("numberOfServices"));
  const period = formData.get("period") as string; // e.g., "month"
  const days = Number(formData.get("days"));

  if (!name || isNaN(price) || isNaN(numberOfServices) || !period || isNaN(days)) return;

  await connectToDatabase();

  await Plan.create({
    name,
    price,
    numberOfServices,
    validity: [{ period, days }],
  });
}

// Update an existing plan – expects planId and same fields
export async function updatePlan(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return;

  const planId = formData.get("planId") as string;
  const name = formData.get("name") as string;
  const price = Number(formData.get("price"));
  const numberOfServices = Number(formData.get("numberOfServices"));
  const period = formData.get("period") as string;
  // Days are derived from period; ignore any client‑provided value
  const daysMap: Record<string, number> = { month: 30, quarterly: 90, halfyear: 180, yearly: 365 };
  const days = period ? daysMap[period] : undefined;

  if (!planId) return;

  await connectToDatabase();

  const update: any = {};
  if (name) update.name = name;
  if (!isNaN(price)) update.price = price;
  if (!isNaN(numberOfServices)) update.numberOfServices = numberOfServices;
  if (period && days !== undefined) update.validity = [{ period, days }];

  await Plan.findByIdAndUpdate(planId, update);
}

// Delete a plan
export async function deletePlan(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return;

  const planId = formData.get("planId") as string;
  if (!planId) return;

  await connectToDatabase();
  await Plan.findByIdAndDelete(planId);
}
