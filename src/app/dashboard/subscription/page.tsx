'use client';
import React, { useEffect, useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import { PlanCard } from '@/components/PlanCard';

interface Plan {
  _id: string;
  name: string;
  price: number;
  numberOfServices: number;
  validity: { period: string; days: number }[];
}

interface SubscriptionDetail {
  _id: string;
  plan: Plan;
  startDate: string;
  endDate: string;
  remainingServices: number;
  status: string;
}

export default function SubscriptionPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'current'>('all');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentSubs, setCurrentSubs] = useState<SubscriptionDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (activeTab === 'all') {
          const res = await fetch('/api/plans');
          const json = await res.json();
          if (json.success) setPlans(json.data);
        } else {
          const res = await fetch('/api/plans/current');
          const json = await res.json();
          if (json.success) setCurrentSubs(json.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeTab]);

  return (
    <div className="max-w-4xl mx-auto pb-24 space-y-12">
      <h1 className="text-4xl md:text-5xl font-extrabold text-[var(--foreground)] tracking-tight">
        Service Plans
      </h1>

      <div className="flex gap-4 mb-6">
        <button
          className={`px-4 py-2 rounded ${activeTab === 'all' ? 'bg-[var(--primary)] text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('all')}
        >All Plans</button>
        <button
          className={`px-4 py-2 rounded ${activeTab === 'current' ? 'bg-[var(--primary)] text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('current')}
        >Current Plans</button>
      </div>

      {loading && <p>Loading...</p>}

      {!loading && activeTab === 'all' && (
        <div className="grid md:grid-cols-2 gap-8">
          {plans.map(plan => (
            <PlanCard key={plan._id} plan={plan} />
          ))}
        </div>
      )}

      {!loading && activeTab === 'current' && (
        <div className="space-y-6">
          {currentSubs.length === 0 ? (
            <div className="bg-white p-8 md:p-12 rounded-3xl shadow-lg border-2 border-[var(--border)]">
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <ShieldAlert className="w-8 h-8 text-[var(--primary)]" />
                No Active Subscription
              </h2>
              <p className="text-xl text-[var(--muted-foreground)] mb-8">
                You currently don't have an active plan. Browse All Plans to subscribe.
              </p>
            </div>
          ) : (
            currentSubs.map(sub => (
              <div key={sub._id} className="bg-white p-6 rounded-xl border border-[var(--border)] shadow">
                <h3 className="text-2xl font-bold mb-2">{sub.plan.name}</h3>
                <p>Subscribed on: {new Date(sub.startDate).toLocaleDateString()}</p>
                <p>Expires on: {new Date(sub.endDate).toLocaleDateString()}</p>
                <p>Status: {sub.status}</p>
                <p>Remaining services: {sub.remainingServices}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
