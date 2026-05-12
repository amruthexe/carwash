import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Plan, Subscription } from '@/models/Plan';
import { auth } from '@/auth';

export const POST = async (request: Request) => {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: 'Unauthenticated' }, { status: 401 });
  }

  const { planId } = await request.json();
  if (!planId) {
    return NextResponse.json({ success: false, error: 'planId required' }, { status: 400 });
  }

  await connectToDatabase();

  const plan = await Plan.findById(planId);
  if (!plan) {
    return NextResponse.json({ success: false, error: 'Plan not found' }, { status: 404 });
  }

  // Calculate expiry based on first validity entry (if multiple, pick first)
  const validity = plan.validity && plan.validity[0];
  const days = validity?.days ?? 30; // default 30 days
  const start = new Date();
  const end = new Date(start.getTime() + days * 24 * 60 * 60 * 1000);

  const subscription = new Subscription({
    userId: session.user.id,
    planId: plan._id,
    startDate: start,
    endDate: end,
    remainingServices: plan.numberOfServices,
    status: 'active',
  });

  await subscription.save();

  return NextResponse.json({ success: true, data: subscription });
};
