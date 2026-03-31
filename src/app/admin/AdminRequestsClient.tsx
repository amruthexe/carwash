"use client";

import { useState, useMemo } from "react";
import { assignWorkerAction, updateRequestStatusAction } from "./actions";

interface RequestWithPopulated {
  _id: string;
  vehicleId: {
    _id: string;
    vehicleNumber: string;
    vehicleModel: string;
    type: string;
    userId: {
      _id: string;
      name: string;
      email: string;
      address?: {
        city: string;
        community: string;
        block: string;
        flatNumber: string;
      };
    };
  };
  scheduledTime: string;
  status: string;
  lastModifiedAt?: string;
  lastModifiedBy?: { _id: string; name: string };
  scheduledTime_formatted?: {
    date: string;
    time: string;
  };
  lastModifiedAt_formatted?: {
    date: string;
    time: string;
  };
}

interface AssignmentWithPopulated {
  requestId: string;
  workerId: { _id: string; name: string };
}

interface Worker {
  _id: string;
  name: string;
}

interface AdminRequestsClientProps {
  initialRequests: RequestWithPopulated[];
  initialAssignments: AssignmentWithPopulated[];
  workers: Worker[];
}

export default function AdminRequestsClient({
  initialRequests,
  initialAssignments,
  workers
}: AdminRequestsClientProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const assignmentMap = useMemo(() => {
    const map: Record<string, AssignmentWithPopulated> = {};
    initialAssignments.forEach(a => {
      map[a.requestId] = a;
    });
    return map;
  }, [initialAssignments]);

  const filteredRequests = useMemo(() => {
    return initialRequests.filter((req) => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      const vehicle = req.vehicleId;
      const customer = vehicle?.userId;
      const currentWorker = assignmentMap[req._id]?.workerId;

      return (
        customer?.name?.toLowerCase().includes(searchLower) ||
        customer?.email?.toLowerCase().includes(searchLower) ||
        vehicle?.vehicleNumber?.toLowerCase().includes(searchLower) ||
        vehicle?.vehicleModel?.toLowerCase().includes(searchLower) ||
        currentWorker?.name?.toLowerCase().includes(searchLower) ||
        req.status?.toLowerCase().includes(searchLower)
      );
    });
  }, [initialRequests, searchTerm, assignmentMap]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-[#011c33] tracking-tight">
          Service Requests Dashboard
        </h1>
        <div className="w-full md:w-auto">
          <input
            type="text"
            placeholder="Search by customer, vehicle, worker, or status..."
            className="w-full md:w-80 p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200">
                <th className="p-4 font-semibold text-slate-700 text-sm">Customer & Vehicle</th>
                <th className="p-4 font-semibold text-slate-700 text-sm">Address</th>
                <th className="p-4 font-semibold text-slate-700 text-sm">Scheduled For</th>
                <th className="p-4 font-semibold text-slate-700 text-sm">Status</th>
                <th className="p-4 font-semibold text-slate-700 text-sm">Last Modified</th>
                <th className="p-4 font-semibold text-slate-700 text-sm">Worker Assignment</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((req: RequestWithPopulated) => {
                const vehicle = req.vehicleId;
                const customer = vehicle?.userId;
                const activeAssignment = assignmentMap[req._id];
                const currentWorker = activeAssignment?.workerId;
                const isEditable = ['assigned', 'in_progress'].includes(req.status);

                return (
                  <tr key={req._id.toString()} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">{customer?.name || "Unknown"}</span>
                          <span className="text-xs bg-slate-200 px-2 py-0.5 rounded text-slate-600 font-medium uppercase">{vehicle?.type}</span>
                        </div>
                        <p className="text-sm text-slate-500">{customer?.email}</p>
                        <div className="mt-1 bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1 rounded-lg inline-flex items-center gap-2 w-fit">
                          <span className="font-mono font-bold text-sm">{vehicle?.vehicleNumber}</span>
                          <span className="text-xs opacity-60">|</span>
                          <span className="font-medium text-xs uppercase">{vehicle?.vehicleModel}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      {customer?.address ? (
                        <div className="text-sm text-slate-600">
                          <p>{customer.address.block}, {customer.address.flatNumber}</p>
                          <p>{customer.address.community}, {customer.address.city}</p>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400 italic">No address</span>
                      )}
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-semibold text-slate-700">
                        {req.scheduledTime_formatted?.date || new Date(req.scheduledTime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </p>
                      <p className="text-sm font-bold text-blue-600 font-mono">
                        {req.scheduledTime_formatted?.time || new Date(req.scheduledTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide ${
                        req.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                        req.status === 'completed' ? 'bg-green-100 text-green-800' :
                        req.status === 'in_progress' ? 'bg-blue-600 text-white' :
                        req.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                        'bg-slate-100 text-slate-800'
                      }`}>
                        {req.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-600">
                      {req.lastModifiedAt ? (
                        <div className="flex flex-col">
                          <span className="font-medium">{req.lastModifiedBy?.name || 'Admin'}</span>
                          <span className="text-xs text-slate-500">
                            {req.lastModifiedAt_formatted?.date && req.lastModifiedAt_formatted?.time
                              ? `${req.lastModifiedAt_formatted.date} ${req.lastModifiedAt_formatted.time}`
                              : `${new Date(req.lastModifiedAt).toLocaleDateString('en-US')} ${new Date(req.lastModifiedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
                            }
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">—</span>
                      )}
                    </td>
                    <td className="p-4">
                      {req.status === 'completed' ? (
                        <div className="flex flex-col gap-1">
                          <p className="text-sm text-green-600 font-medium flex items-center gap-1">
                            ✓ Completed
                          </p>
                          <p className="text-sm text-slate-500">by {currentWorker?.name || "Unknown"}</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {currentWorker && (
                            <p className="text-sm font-medium text-[#011c33] flex items-center gap-1">
                              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                              {currentWorker.name}
                            </p>
                          )}

                          <form action={assignWorkerAction} className="flex flex-col gap-2">
                            <input type="hidden" name="requestId" value={req._id} />
                            <div className="flex gap-2">
                              <select
                                name="workerId"
                                className="flex-1 p-2 border-2 border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 bg-white"
                                defaultValue={currentWorker?._id || ""}
                                required
                              >
                                <option value="" disabled>Select Worker...</option>
                                {workers.map((w: Worker) => (
                                  <option key={w._id} value={w._id}>
                                    {w.name}
                                  </option>
                                ))}
                              </select>
                              <button
                                type="submit"
                                className="bg-[#011c33] hover:bg-slate-800 text-white px-4 py-2 rounded-lg font-medium text-sm transition-all active:scale-95"
                              >
                                {currentWorker ? "Update" : "Assign"}
                              </button>
                            </div>
                          </form>

                          {isEditable && (
                            <form action={updateRequestStatusAction} className="mt-2">
                              <input type="hidden" name="requestId" value={req._id} />
                              <select
                                name="newStatus"
                                className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 bg-white mb-2"
                                defaultValue={req.status}
                                required
                              >
                                <option value="in_progress">In Progress</option>
                                <option value="completed">Completed</option>
                              </select>
                              <button
                                type="submit"
                                className="w-full bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all"
                              >
                                Update Status
                              </button>
                            </form>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredRequests.length === 0 && (
          <div className="p-10 text-center text-slate-500">
            <p className="text-lg font-medium">No requests found</p>
            <p className="text-sm">Try adjusting your search criteria</p>
          </div>
        )}
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {filteredRequests.map((req: RequestWithPopulated) => {
          const vehicle = req.vehicleId;
          const customer = vehicle?.userId;
          const activeAssignment = assignmentMap[req._id];
          const currentWorker = activeAssignment?.workerId;
          const isEditable = ['assigned', 'in_progress'].includes(req.status);

          return (
            <div key={req._id.toString()} className="bg-white rounded-xl shadow-md border border-slate-200 p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-slate-900">{customer?.name || "Unknown"}</h3>
                  <p className="text-xs text-slate-500">{customer?.email}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                  req.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                  req.status === 'completed' ? 'bg-green-100 text-green-800' :
                  req.status === 'in_progress' ? 'bg-blue-600 text-white' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {req.status.replace('_', ' ')}
                </span>
              </div>

              <div className="space-y-2 text-sm mb-3">
                <div className="flex items-center gap-2 text-slate-600">
                  <span className="font-mono font-bold text-slate-900">{vehicle?.vehicleNumber}</span>
                  <span className="text-slate-400">|</span>
                  <span>{vehicle?.vehicleModel}</span>
                  <span className="text-xs bg-slate-200 px-2 py-0.5 rounded uppercase">{vehicle?.type}</span>
                </div>
                {customer?.address && (
                  <div className="text-xs text-slate-500 bg-slate-50 p-2 rounded">
                    <p>{customer.address.block}, {customer.address.flatNumber}</p>
                    <p>{customer.address.community}, {customer.address.city}</p>
                  </div>
                )}
                <div>
                  <span className="font-medium text-slate-700">Scheduled:</span>
                  <p className="text-slate-600">
                    {req.scheduledTime_formatted
                      ? `${req.scheduledTime_formatted.date} at ${req.scheduledTime_formatted.time}`
                      : `${new Date(req.scheduledTime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at ${new Date(req.scheduledTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
                    }
                  </p>
                </div>
                {req.lastModifiedAt && (
                  <div className="text-xs text-slate-500">
                    <span className="font-medium">Modified:</span>{' '}
                    {req.lastModifiedAt_formatted
                      ? `${req.lastModifiedAt_formatted.date} ${req.lastModifiedAt_formatted.time}`
                      : `${new Date(req.lastModifiedAt).toLocaleDateString('en-US')} ${new Date(req.lastModifiedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
                    }
                    <br />
                    <span className="font-medium">By:</span> {req.lastModifiedBy?.name || 'Admin'}
                  </div>
                )}
              </div>

              <div className="border-t border-slate-100 pt-3 mt-3">
                {req.status === 'completed' ? (
                  <div className="text-sm text-green-600 font-medium">
                    ✓ Completed by {currentWorker?.name || "Unknown"}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {currentWorker && (
                      <p className="text-sm font-medium text-[#011c33]">
                        <span className="w-2 h-2 bg-green-500 rounded-full inline-block mr-1"></span>
                        Worker: {currentWorker.name}
                      </p>
                    )}

                    <form action={assignWorkerAction} className="flex flex-col gap-2">
                      <input type="hidden" name="requestId" value={req._id} />
                      <div className="flex gap-2">
                        <select
                          name="workerId"
                          className="flex-1 p-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                          defaultValue={currentWorker?._id || ""}
                          required
                        >
                          <option value="" disabled>Select Worker...</option>
                          {workers.map((w) => (
                            <option key={w._id} value={w._id}>
                              {w.name}
                            </option>
                          ))}
                        </select>
                        <button
                          type="submit"
                          className="bg-[#011c33] hover:bg-slate-800 text-white px-3 py-2 rounded-lg text-sm font-medium"
                        >
                          {currentWorker ? "Update" : "Assign"}
                        </button>
                      </div>
                    </form>

                    {isEditable && (
                      <form action={updateRequestStatusAction} className="mt-2">
                        <input type="hidden" name="requestId" value={req._id} />
                        <select
                          name="newStatus"
                          className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 mb-2"
                          defaultValue={req.status}
                          required
                        >
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                        <button
                          type="submit"
                          className="w-full bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium"
                        >
                          Update Status
                        </button>
                      </form>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {filteredRequests.length === 0 && (
          <div className="p-10 text-center text-slate-500 bg-white rounded-xl">
            <p className="text-lg font-medium">No requests found</p>
            <p className="text-sm">Try adjusting your search criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}
