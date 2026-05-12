import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Subscription, Plan } from '@/models/Plan';
import { auth } from '@/auth';

export const GET = async (request: Request) => {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: 'Unauthenticated' }, { status: 401 });
  }

  await connectToDatabase();
  const subs = await Subscription.find({ userId: session.user.id, status: 'active' })
    .populate('planId')
    .lean();

  // Map to include plan details
  const data = subs.map((sub: any) => ({
    _id: sub._id,
    plan: sub.planId,
    startDate: sub.startDate,
    endDate: sub.endDate,
    remainingServices: sub.remainingServices,
    status: sub.status,
  }));

  return NextResponse.json({ success: true, data });
};
