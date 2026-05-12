import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Subscription, Plan } from '@/models/Plan';
import { auth } from '@/auth';

export const GET = async (request: Request) => {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: 'Unauthenticated' }, { status: 401 });
  }

  await connectToDatabase();
  // Fetch subscriptions, updating status if expired
  const now = new Date();
  const subs = await Subscription.find({ userId: session.user.id })
    .populate('planId')
    .lean();

  // Update expired ones
  await Promise.all(subs.map(async (sub: any) => {
    if (sub.status === 'active' && sub.endDate && new Date(sub.endDate) < now) {
      await Subscription.findByIdAndUpdate(sub._id, { status: 'expired' });
      sub.status = 'expired';
    }
  }));

  const activeSubs = subs.filter((s: any) => s.status === 'active');

  const data = activeSubs.map((sub: any) => ({
    _id: sub._id,
    plan: sub.planId,
    startDate: sub.startDate,
    endDate: sub.endDate,
    remainingServices: sub.remainingServices,
    status: sub.status,
  }));

  return NextResponse.json({ success: true, message: '', data });
};
