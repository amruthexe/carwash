'use client';
import React from 'react';
import { CreditCard, CheckCircle } from 'lucide-react';

interface Plan {
  _id: string;
  name: string;
  price: number;
  numberOfServices: number;
  validity: { period: string; days: number }[];
}

export const PlanCard: React.FC<{ plan: Plan }> = ({ plan }) => {
  const handleSubscribe = async () => {
    const res = await fetch('/api/plans/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId: plan._id }),
    });
    const data = await res.json();
    if (data.success) {
      alert('Subscribed successfully');
      // Simple reload to reflect changes
      location.reload();
    } else {
      alert(data.error || 'Subscription failed');
    }
  };

  return (
    <div className="bg-[var(--secondary)] p-8 rounded-3xl border border-[var(--border)] shadow flex flex-col justify-between mb-8">
      <div>
        <h3 className="text-3xl font-bold text-[var(--foreground)] mb-2">
          {plan.name.charAt(0).toUpperCase() + plan.name.slice(1)}
        </h3>
        <p className="text-[var(--primary)] text-4xl font-extrabold my-4">
          ₹{plan.price}
          <span className="text-xl text-[var(--muted-foreground)] font-normal"> /{plan.validity?.[0]?.period || 'mo'}</span>
        </p>
        <ul className="text-xl space-y-3 mb-8">
          <li className="flex items-center gap-3">
            <CheckCircle className="text-green-600 w-6 h-6" /> {plan.numberOfServices} Washes
          </li>
          {plan.validity?.map((v, i) => (
            <li key={i} className="flex items-center gap-3">
              <CheckCircle className="text-blue-600 w-5 h-5" /> {v.days} days ({v.period})
            </li>
          ))}
        </ul>
      </div>
      <button
        onClick={handleSubscribe}
        className="w-full py-5 rounded-2xl bg-[var(--foreground)] hover:bg-slate-800 text-white text-2xl font-bold flex items-center gap-3 justify-center"
      >
        <CreditCard className="w-6 h-6" /> Subscribe
      </button>
    </div>
  );
};
