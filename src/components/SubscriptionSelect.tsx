'use client';
import { useEffect, useState } from 'react';

interface PlanInfo {
  _id: string;
  plan: { name: string };
  remainingServices: number;
  endDate: string;
}

interface Props {
  setHasSubs?: (has: boolean) => void;
}

export default function SubscriptionSelect({ setHasSubs }: Props) {
  const [subs, setSubs] = useState<PlanInfo[]>([]);
  const [selected, setSelected] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubs = async () => {
      try {
        const res = await fetch('/api/plans/current');
        const json = await res.json();
        if (json.success && json.data && json.data.length) {
          setSubs(json.data);
          setSelected(json.data[0]._id);
          setHasSubs?.(true);
        } else {
          setHasSubs?.(false);
        }
      } catch (e) {
        console.error(e);
        setHasSubs(false);
      } finally {
        setLoading(false);
      }
    };
    fetchSubs();
  }, []);

  if (loading) return <p>Loading plans...</p>;
  if (subs.length === 0) return <p>No active subscription plans available.</p>;

  return (
    <div className="mb-6">
      <label className="block text-sm font-semibold mb-2">Choose Plan</label>
      <select
        name="subscriptionId"
        value={selected}
        onChange={e => setSelected(e.target.value)}
        className="w-full p-3 border rounded"
      >
        {subs.map((sub) => (
          <option key={sub._id} value={sub._id}>
            {sub.plan.name} - {sub.remainingServices} services left (expires{' '}
            {new Date(sub.endDate).toLocaleDateString()})
          </option>
        ))}
      </select>
    </div>
  );
};
