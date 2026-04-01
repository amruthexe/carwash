"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Mail, Phone, Shield, User as UserIcon } from "lucide-react";

interface Customer {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  status: string;
  createdAt: string;
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
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search") || "";

  const [searchTerm, setSearchTerm] = useState(searchQuery);
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Update URL when search changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    params.set("page", "1");
    router.push(`/admin/customers?${params.toString()}`);
  }, [debouncedSearch, router]);

  const customers = useMemo(() => initialCustomers, [initialCustomers]);

  const getStatusBadge = (status: string) => {
    return status === 'active'
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800';
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'worker':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-[#011c33] tracking-tight">
          Customers Management
        </h1>
        <div className="w-full md:w-auto">
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            className="w-full md:w-80 p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200">
                <th className="p-4 font-semibold text-slate-700 text-sm">Customer</th>
                <th className="p-4 font-semibold text-slate-700 text-sm">Contact</th>
                <th className="p-4 font-semibold text-slate-700 text-sm">Role</th>
                <th className="p-4 font-semibold text-slate-700 text-sm">Status</th>
                <th className="p-4 font-semibold text-slate-700 text-sm">Joined</th>
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-slate-500">
                    <p className="text-lg font-medium">No customers found</p>
                    <p className="text-sm">Try adjusting your search criteria</p>
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
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getRoleBadge(customer.role)}`}>
                        {customer.role}
                      </span>
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
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50">
            <p className="text-sm text-slate-600">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex gap-2">
              <a
                href={`?${searchQuery ? `search=${searchQuery}&` : ''}page=${currentPage - 1}`}
                className={`px-3 py-1 text-sm border border-slate-300 rounded hover:bg-slate-100 ${currentPage === 1 ? 'opacity-50 pointer-events-none' : ''}`}
              >
                Previous
              </a>
              <a
                href={`?${searchQuery ? `search=${searchQuery}&` : ''}page=${currentPage + 1}`}
                className={`px-3 py-1 text-sm border border-slate-300 rounded hover:bg-slate-100 ${currentPage === totalPages ? 'opacity-50 pointer-events-none' : ''}`}
              >
                Next
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {customers.length === 0 ? (
          <div className="p-10 text-center text-slate-500 bg-white rounded-xl">
            <p className="text-lg font-medium">No customers found</p>
            <p className="text-sm">Try adjusting your search criteria</p>
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
                <div className="flex flex-col gap-1">
                  <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${getRoleBadge(customer.role)}`}>
                    {customer.role}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${getStatusBadge(customer.status)}`}>
                    {customer.status}
                  </span>
                </div>
              </div>

              {customer.phone && (
                <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                  <Phone className="w-4 h-4" />
                  {customer.phone}
                </div>
                )}
              <div className="text-xs text-slate-500">
                Joined: {new Date(customer.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
