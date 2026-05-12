import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Plan, Subscription } from '@/models/Plan';
import { auth } from '@/auth';

export const POST = async (request: Request) => {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: 'Unauthenticated' }, { status: 401 });
  }

  const { planId, validityPeriod } = await request.json();
  if (!planId) {
    return NextResponse.json({ success: false, message: 'planId required' }, { status: 400 });
  }

  await connectToDatabase();

  const plan = await Plan.findById(planId);
  if (!plan) {
    return NextResponse.json({ success: false, message: 'Plan not found' }, { status: 404 });
  }

  // Prevent duplicate active subscriptions for same plan
  const existing = await Subscription.findOne({ userId: session.user.id, planId: plan._id, status: 'active' });
  if (existing) {
    return NextResponse.json({ success: false, message: 'Active subscription for this plan already exists' }, { status: 400 });
  }

  // Determine validity based on request (fallback to first)
  let selectedValidity = plan.validity && plan.validity[0];
  if (validityPeriod) {
    const match = plan.validity?.find(v => v.period === validityPeriod);
    if (match) selectedValidity = match;
  }
  const days = selectedValidity?.days ?? 30; // default 30 days
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

  return NextResponse.json({ success: true, message: 'Subscription created', data: subscription });
};
