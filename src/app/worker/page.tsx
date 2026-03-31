"use client";

import { useState, useEffect, useMemo } from "react";
import { MapPin, CheckCircle, Home, Building, Clock, Wrench } from "lucide-react";
import { updateTaskStatusAction } from "./actions";

interface User {
  _id: string;
  name: string;
  email: string;
  address?: {
    city: string;
    community: string;
    block: string;
    flatNumber: string;
  };
}

interface Vehicle {
  _id: string;
  vehicleNumber: string;
  vehicleModel: string;
  type: string;
  userId: User;
}

interface ServiceRequest {
  _id: string;
  scheduledTime: string;
  vehicleId: Vehicle;
}

interface WorkerAssignment {
  _id: string;
  requestId: ServiceRequest;
  status: 'assigned' | 'accepted' | 'in_progress' | 'completed' | 'rejected';
}

export default function WorkerDashboard() {
  const [activeTab, setActiveTab] = useState<"live" | "past">("live");
  const [assignments, setAssignments] = useState<WorkerAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/worker/assignments");
        if (res.ok) {
          const data = await res.json();
          const all = [...(data.live || []), ...(data.past || [])];
          setAssignments(all);
        }
      } catch (error) {
        console.error("Failed to fetch assignments:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const liveTasks = useMemo(() =>
    assignments.filter(a => ['assigned', 'accepted', 'in_progress'].includes(a.status)),
    [assignments]
  );

  const pastTasks = useMemo(() =>
    assignments.filter(a => ['completed', 'rejected'].includes(a.status)),
    [assignments]
  );

  const currentTasks = activeTab === "live" ? liveTasks : pastTasks;

  const getButtonConfig = (status: string) => {
    switch (status) {
      case 'assigned':
        return {
          primary: {
            label: "Accept",
            color: "bg-emerald-500 hover:bg-emerald-600"
          },
          secondary: {
            label: "Decline",
            color: "bg-white border-2 border-red-500 text-red-600 hover:bg-red-50"
          }
        };
      case 'accepted':
        return {
          primary: {
            label: "Start Job",
            color: "bg-blue-500 hover:bg-blue-600"
          },
          secondary: {
            label: "Cancel",
            color: "bg-white border-2 border-red-500 text-red-600 hover:bg-red-50"
          }
        };
      case 'in_progress':
        return {
          primary: {
            label: "Complete",
            color: "bg-purple-600 hover:bg-purple-700"
          },
          secondary: null
        };
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-lg text-slate-500">Loading your tasks...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight mb-1">
          My Tasks
        </h2>
        <p className="text-sm text-slate-500">View and manage your jobs</p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center gap-4 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("live")}
          className={`px-6 py-3 rounded-t-lg font-semibold transition-all ${
            activeTab === "live"
              ? "bg-blue-600 text-white shadow-md"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          Live Jobs ({liveTasks.length})
        </button>
        <button
          onClick={() => setActiveTab("past")}
          className={`px-6 py-3 rounded-t-lg font-semibold transition-all ${
            activeTab === "past"
              ? "bg-blue-600 text-white shadow-md"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          Past Jobs ({pastTasks.length})
        </button>
      </div>

      {/* Task Cards */}
      {currentTasks.length > 0 ? (
        <div className="grid gap-6 md:gap-8">
          {currentTasks.map((assignment) => {
            const req = assignment.requestId as any;
            const vehicle = req?.vehicleId;
            const customer = vehicle?.userId;
            const address = customer?.address;
            const buttonConfig = assignment.status !== 'completed' ? getButtonConfig(assignment.status) : null;

            return (
              <div
                key={assignment._id}
                className={`bg-white rounded-xl shadow-md border-l-4 ${
                  assignment.status === 'completed'
                    ? 'border-l-green-500 bg-slate-50'
                    : assignment.status === 'assigned'
                    ? 'border-l-amber-500'
                    : assignment.status === 'accepted'
                    ? 'border-l-blue-500'
                    : 'border-l-purple-500'
                } p-5 transition-all hover:shadow-lg`}
              >
                {/* Header */}
                <div className="flex flex-col items-start gap-3 mb-4">
                  <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 w-full">
                    <span className="flex items-center gap-1 font-medium">
                      <Clock className="w-3 h-3" />
                      {new Date(req.scheduledTime).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                    <span className="font-mono">
                      {new Date(req.scheduledTime).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  <div className="w-full flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">
                        {vehicle?.vehicleModel || "Unknown Vehicle"}
                      </h3>
                      <p className="text-sm text-slate-500">#{vehicle?.vehicleNumber || "NO PLATE"}</p>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                        assignment.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : assignment.status === 'assigned'
                          ? 'bg-amber-100 text-amber-800'
                          : assignment.status === 'accepted'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {assignment.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Customer Address */}
                {address && (
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-4">
                    <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Address
                    </h4>
                    <div className="space-y-1 text-sm text-slate-600">
                      <p>{address.city}</p>
                      <p>{address.community}, Block {address.block}</p>
                      <p>Flat/Villa: {address.flatNumber}</p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                {buttonConfig && (
                  <div className="flex flex-col sm:flex-row gap-3 mt-4">
                    <form action={updateTaskStatusAction} className="flex-1">
                      <input type="hidden" name="assignmentId" value={assignment._id} />
                      <input type="hidden" name="requestId" value={req._id} />
                      <input
                        type="hidden"
                        name="newStatus"
                        value={
                          assignment.status === 'assigned' ? 'accepted' :
                          assignment.status === 'accepted' ? 'in_progress' :
                          'completed'
                        }
                      />
                      <button
                        type="submit"
                        className={`w-full py-2.5 text-sm font-medium text-white rounded-lg transition-all flex items-center justify-center ${
                          assignment.status === 'assigned'
                            ? 'bg-emerald-500 hover:bg-emerald-600'
                            : assignment.status === 'accepted'
                            ? 'bg-blue-500 hover:bg-blue-600'
                            : 'bg-purple-600 hover:bg-purple-700'
                        }`}
                      >
                        {buttonConfig.primary.label}
                      </button>
                    </form>

                    {buttonConfig.secondary && (
                      <form action={updateTaskStatusAction} className="flex-1">
                        <input type="hidden" name="assignmentId" value={assignment._id} />
                        <input type="hidden" name="requestId" value={req._id} />
                        <input type="hidden" name="newStatus" value="rejected" />
                        <button
                          type="submit"
                          className="w-full py-2.5 text-sm font-medium bg-white border-2 border-red-400 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          {buttonConfig.secondary.label}
                        </button>
                      </form>
                    )}
                  </div>
                )}

                {assignment.status === 'completed' && (
                  <div className="text-center mt-4 pt-4 border-t border-slate-100">
                    <p className="text-green-600 font-semibold flex items-center justify-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4" />
                      Completed
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white p-12 text-center rounded-2xl shadow-md border border-slate-200">
          <Wrench className="w-20 h-20 text-slate-300 mx-auto mb-6" />
          <p className="text-2xl font-semibold text-slate-600">
            {activeTab === "live" ? "No active jobs assigned" : "No past jobs found"}
          </p>
          <p className="text-slate-500 mt-3">
            {activeTab === "live"
              ? "Take a break or check back later!"
              : "You haven't completed any jobs yet."}
          </p>
        </div>
      )}
    </div>
  );
}
