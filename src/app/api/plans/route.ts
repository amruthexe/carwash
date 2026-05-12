import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Plan } from '@/models/Plan';
import { auth } from '@/auth';

export const GET = async (request: Request) => {
  // Ensure user is authenticated (optional for public plans)
  const session = await auth();
  if (!session?.user?.id) {
    // allow public access but you could restrict
  }
  await connectToDatabase();
  const plans = await Plan.find({}).lean();
  return NextResponse.json({ success: true, data: plans });
};
