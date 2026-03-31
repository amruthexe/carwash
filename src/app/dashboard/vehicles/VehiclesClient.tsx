"use client";

import { useState } from "react";
import { addVehicle, removeVehicle } from "./actions";
import { Car, Bike, Trash2, PlusCircle, X } from "lucide-react";

interface Vehicle {
  _id: string;
  vehicleNumber: string;
  vehicleModel: string;
  type: string;
  status: string;
}

interface VehiclesClientProps {
  initialVehicles: Vehicle[];
}

export default function VehiclesClient({ initialVehicles }: VehiclesClientProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [vehicles, setVehicles] = useState(initialVehicles);

  const handleRemove = () => {
    // Refresh the list after removal (form action will trigger server update)
    // In a real app, you might want to use revalidation or optimistic updates
    window.location.reload();
  };

  return (
    <div className="max-w-4xl mx-auto pb-24 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">My Vehicles</h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow"
        >
          {showAddForm ? (
            <>
              <X className="w-4 h-4" /> Cancel
            </>
          ) : (
            <>
              <PlusCircle className="w-4 h-4" /> Add New
            </>
          )}
        </button>
      </div>

      {/* Vehicles List */}
      {vehicles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {vehicles.map((v) => (
            <div key={v._id.toString()} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-blue-50 p-3 rounded-full">
                  {v.type === 'car' ? <Car className="w-6 h-6 text-blue-600" /> : <Bike className="w-6 h-6 text-blue-600" />}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">{v.vehicleModel}</h3>
                  <p className="text-sm text-slate-500 uppercase tracking-wide bg-slate-100 px-2 py-0.5 rounded inline-block">
                    {v.vehicleNumber}
                  </p>
                </div>
              </div>

              <form action={removeVehicle} onSubmit={handleRemove}>
                <input type="hidden" name="vehicleId" value={v._id.toString()} />
                <button
                  type="submit"
                  className="w-full flex justify-center items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-lg text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-4 h-4" /> Remove
                </button>
              </form>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-slate-50 p-8 rounded-xl text-center border border-slate-200">
          <p className="text-xl font-semibold text-slate-600 mb-2">No vehicles added yet</p>
          <p className="text-sm text-slate-500 mb-4">Click "Add New" to add your first vehicle</p>
        </div>
      )}

      {/* Add Vehicle Form - Toggleable */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-blue-600" />
            Add New Vehicle
          </h2>

          <form action={addVehicle} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Vehicle Model</label>
              <input
                name="vehicleModel"
                type="text"
                placeholder="e.g. Honda Civic"
                required
                className="w-full p-3 border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-base"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">License Plate</label>
              <input
                name="vehicleNumber"
                type="text"
                placeholder="e.g. MH 12 AB 1234"
                required
                className="w-full p-3 border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-base uppercase font-mono"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">Type</label>
              <div className="flex gap-4">
                <label className="flex-1 flex flex-col items-center justify-center p-4 bg-slate-50 border border-slate-300 rounded-lg cursor-pointer hover:border-blue-500 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50 transition-all">
                  <input type="radio" name="type" value="car" defaultChecked className="hidden" />
                  <Car className="w-8 h-8 text-blue-600 mb-2" />
                  <span className="text-sm font-semibold">Car</span>
                </label>

                <label className="flex-1 flex flex-col items-center justify-center p-4 bg-slate-50 border border-slate-300 rounded-lg cursor-pointer hover:border-blue-500 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50 transition-all">
                  <input type="radio" name="type" value="bike" className="hidden" />
                  <Bike className="w-8 h-8 text-blue-600 mb-2" />
                  <span className="text-sm font-semibold">Bike</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-slate-800 hover:bg-slate-900 text-white font-semibold py-3 rounded-lg shadow transition-all"
            >
              Save Vehicle
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
