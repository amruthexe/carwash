"use client";

import { useState, useEffect } from "react";
import { createPlan, updatePlan, deletePlan } from "@/app/admin/plans/actions";

export default function PlansClient() {
  const [plans, setPlans] = useState<any[]>([]);

  useEffect(() => {
    async function fetchPlans() {
      const res = await fetch("/api/admin/plans/list");
      if (res.ok) {
        const data = await res.json();
        setPlans(data.plans);
      }
    }
    fetchPlans();
  }, []);

  const daysMap: Record<string, number> = { month: 30, quarterly: 90, halfyear: 180, yearly: 365 };
  const [newPlan, setNewPlan] = useState({ name: "", price: "", numberOfServices: "", period: "month", days: 30 });
  const [editingPlanId, setEditingPlanId] = useState<string>("");

  // sync days when period changes
  useEffect(() => {
    setNewPlan(prev => ({ ...prev, days: daysMap[prev.period] }));
  }, [newPlan.period]);

  const fetchPlans = async () => {
    const res = await fetch("/api/admin/plans/list");
    if (res.ok) {
      const data = await res.json();
      setPlans(data.plans);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = new FormData();
    form.append("name", newPlan.name);
    form.append("price", newPlan.price);
    form.append("numberOfServices", newPlan.numberOfServices);
    form.append("period", newPlan.period);
    form.append("days", String(newPlan.days));
    await createPlan(form);
    // Refresh list without full page reload
    await fetchPlans();
    // Reset form
    setNewPlan({ name: "", price: "", numberOfServices: "", period: "month", days: 30 });
  };

  const handleUpdate = async (planId: string, updates: any) => {
    const form = new FormData();
    form.append("planId", planId);
    Object.entries(updates).forEach(([key, value]) => form.append(key, value as any));
    await updatePlan(form);
    await fetchPlans();
  };

  const handleDelete = async (planId: string) => {
    const form = new FormData();
    form.append("planId", planId);
    await deletePlan(form);
    await fetchPlans();
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Manage Service Plans</h1>
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Add New Plan</h2>
        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input placeholder="Plan name" className="p-2 border rounded" required value={newPlan.name} onChange={e => setNewPlan({ ...newPlan, name: e.target.value })} />
          <input placeholder="Price" type="number" className="p-2 border rounded" required value={newPlan.price} onChange={e => setNewPlan({ ...newPlan, price: e.target.value })} />
          <input placeholder="Number of services" type="number" className="p-2 border rounded" required value={newPlan.numberOfServices} onChange={e => setNewPlan({ ...newPlan, numberOfServices: e.target.value })} />
          <select className="p-2 border rounded" value={newPlan.period} onChange={e => setNewPlan({ ...newPlan, period: e.target.value })}>
            <option value="month">Month</option>
            <option value="quarterly">Quarterly</option>
            <option value="halfyear">Half Year</option>
            <option value="yearly">Yearly</option>
          </select>
          <input placeholder="Days" type="number" className="p-2 border rounded" required value={newPlan.days} readOnly />
          <button type="submit" className="bg-blue-600 text-white py-2 rounded">Add Plan</button>
        </form>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Existing Plans</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {plans.map(plan => (
            <div key={plan._id} className="bg-white p-4 rounded-xl shadow border">
              <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
              <p className="text-lg font-semibold mb-2">Price: ₹{plan.price}</p>
              <p className="mb-2">Services: {plan.numberOfServices}</p>
              <p className="mb-2">Validity: {plan.validity?.[0]?.period} ({plan.validity?.[0]?.days} days)</p>
              <form className="mt-3" onSubmit={e => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const updates: any = {
                  name: formData.get("name") as string,
                  price: formData.get("price") as string,
                  numberOfServices: formData.get("numberOfServices") as string,
                  period: formData.get("period") as string,
                };
                handleUpdate(plan._id, updates);
              }}>
                <input name="name" defaultValue={plan.name} className="p-1 border rounded w-full mb-1" placeholder="Name" />
                <input name="price" defaultValue={plan.price} type="number" className="p-1 border rounded w-full mb-1" placeholder="Price" />
                <input name="numberOfServices" defaultValue={plan.numberOfServices} type="number" className="p-1 border rounded w-full mb-1" placeholder="Services" />
                <select name="period" defaultValue={plan.validity?.[0]?.period} className="p-1 border rounded w-full mb-1">
                  <option value="month">Month</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="halfyear">Half Year</option>
                  <option value="yearly">Yearly</option>
                </select>
                                <button type="submit" className="bg-green-600 text-white py-1 px-3 rounded mr-2">Update</button>
                <button type="button" onClick={() => handleDelete(plan._id)} className="bg-red-600 text-white py-1 px-3 rounded">Delete</button>
              </form>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
