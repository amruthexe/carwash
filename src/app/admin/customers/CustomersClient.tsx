"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Mail, Phone, User as UserIcon, MapPin } from "lucide-react";

interface Customer {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  status: string;
  createdAt: string;
  address?: {
    city: string;
    community: string;
    block: string;
    flatNumber: string;
  };
}

interface CustomersClientProps {
  initialCustomers: Customer[];
  totalPages: number;
  currentPage: number;
}

export default function CustomersClient({
  initialCustomers,
  totalPages,
  currentPage,
}: CustomersClientProps) {
  const router = useRouter();

  const customers = useMemo(() => initialCustomers, [initialCustomers]);

  const getStatusBadge = (status: string) => {
    return status === 'active'
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800';
  };

  const formatAddress = (address?: Customer['address']) => {
    if (!address) return 'No address';
    // Handle partial address data
    const parts = [];
    if (address.block) parts.push(address.block);
    if (address.flatNumber) parts.push(address.flatNumber);
    const streetPart = parts.join(', ');
    const areaParts = [];
    if (address.community) areaParts.push(address.community);
    if (address.city) areaParts.push(address.city);
    const areaPart = areaParts.join(', ');
    if (streetPart && areaPart) return `${streetPart} - ${areaPart}`;
    if (streetPart) return streetPart;
    if (areaPart) return areaPart;
    return 'No address';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-[#011c33] tracking-tight">
          Customers Management
        </h1>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200">
                <th className="p-4 font-semibold text-slate-700 text-sm">Customer</th>
                <th className="p-4 font-semibold text-slate-700 text-sm">Contact</th>
                <th className="p-4 font-semibold text-slate-700 text-sm">Address</th>
                <th className="p-4 font-semibold text-slate-700 text-sm">Status</th>
                <th className="p-4 font-semibold text-slate-700 text-sm">Joined</th>
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-slate-500">
                    <p className="text-lg font-medium">No customers found</p>
                    <p className="text-sm">No customers registered yet</p>
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-50 p-2 rounded-full">
                          <UserIcon className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="font-semibold text-slate-900">{customer.name}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Mail className="w-4 h-4" />
                          {customer.email}
                        </div>
                        {customer.phone && (
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Phone className="w-4 h-4" />
                            {customer.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span>{formatAddress(customer.address)}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusBadge(customer.status)}`}>
                        {customer.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-600">
                      {new Date(customer.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50 flex-wrap gap-2">
            <p className="text-sm text-slate-600">
              Showing {(currentPage - 1) * 10 + 1} to {Math.min(currentPage * 10, customers.length)} of {totalPages * 10} customers
            </p>
            <div className="flex gap-1 items-center flex-wrap">
              <button
                onClick={() => {
                  if (currentPage > 1) {
                    router.push(`/admin/customers?page=${currentPage - 1}`);
                  }
                }}
                disabled={currentPage === 1}
                className="w-8 h-8 flex items-center justify-center text-sm rounded border border-slate-300 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed text-slate-600"
              >
                ←
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => {
                  return page === 1 ||
                         page === totalPages ||
                         Math.abs(page - currentPage) <= 1;
                })
                .map((page, idx, arr) => {
                  const prevPage = arr[idx - 1];
                  const showEllipsis = prevPage && page - prevPage > 1;
                  return (
                    <span key={page}>
                      {showEllipsis && (
                        <span className="px-2 text-slate-400">...</span>
                      )}
                      <button
                        onClick={() => {
                          router.push(`/admin/customers?page=${page}`);
                        }}
                        className={`w-8 h-8 text-sm rounded transition-colors ${
                          currentPage === page
                            ? 'bg-blue-600 text-white font-medium'
                            : 'border border-slate-300 hover:bg-slate-100 text-slate-600'
                        }`}
                      >
                        {page}
                      </button>
                    </span>
                  );
                })}
              <button
                onClick={() => {
                  if (currentPage < totalPages) {
                    router.push(`/admin/customers?page=${currentPage + 1}`);
                  }
                }}
                disabled={currentPage === totalPages}
                className="w-8 h-8 flex items-center justify-center text-sm rounded border border-slate-300 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed text-slate-600"
              >
                →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {customers.length === 0 ? (
          <div className="p-10 text-center text-slate-500 bg-white rounded-xl">
            <p className="text-lg font-medium">No customers found</p>
            <p className="text-sm">No customers registered yet</p>
          </div>
        ) : (
          customers.map((customer) => (
            <div key={customer._id} className="bg-white rounded-xl shadow-md border border-slate-200 p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-50 p-2 rounded-full">
                    <UserIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{customer.name}</h3>
                    <p className="text-xs text-slate-500">{customer.email}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${getStatusBadge(customer.status)}`}>
                  {customer.status}
                </span>
              </div>

              <div className="space-y-2">
                {customer.phone && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Phone className="w-4 h-4" />
                    <span>{customer.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <MapPin className="w-4 h-4" />
                  <span>{formatAddress(customer.address)}</span>
                </div>
                <div className="text-xs text-slate-500">
                  Joined: {new Date(customer.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
