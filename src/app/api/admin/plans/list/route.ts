import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Plan } from '@/models/Plan';

export async function GET() {
  await connectToDatabase();
  const plans = await Plan.find().lean();
  return NextResponse.json({ plans });
}
