"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { updateAddress, getUserAddress } from "@/app/actions/profile";
import { MapPin, Loader2 } from "lucide-react";

export default function CompleteProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/dashboard";

  const [initialValues, setInitialValues] = useState({
    city: "",
    community: "",
    block: "",
    flatNumber: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchAddress() {
      const data = await getUserAddress();
      if (data) {
        setInitialValues(data);
      }
    }
    fetchAddress();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await updateAddress(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push(redirectTo);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-3 mb-6">
          <MapPin className="w-6 h-6 text-blue-600" />
          <div>
            <h1 className="text-xl font-bold text-slate-800">
              Complete Your Profile
            </h1>
            <p className="text-sm text-slate-500">
              Provide your address details to enable booking.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2 text-sm">
            <span className="font-semibold">Error:</span> {error}
          </div>
        )}

        <p className="text-sm text-slate-600 mb-6">
          Please fill in the following fields. All are required to book a wash.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="city" className="block text-sm font-semibold text-slate-700 mb-2">
                City
              </label>
              <input
                id="city"
                name="city"
                type="text"
                required
                defaultValue={initialValues.city}
                placeholder="e.g. Hyderabad"
                className="w-full p-3 border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-base"
              />
            </div>

            <div>
              <label htmlFor="community" className="block text-sm font-semibold text-slate-700 mb-2">
                Community
              </label>
              <input
                id="community"
                name="community"
                type="text"
                required
                defaultValue={initialValues.community}
                placeholder="e.g. Raheja"
                className="w-full p-3 border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-base"
              />
            </div>

            <div>
              <label htmlFor="block" className="block text-sm font-semibold text-slate-700 mb-2">
                Block
              </label>
              <input
                id="block"
                name="block"
                type="text"
                required
                defaultValue={initialValues.block}
                placeholder="e.g. B"
                className="w-full p-3 border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-base"
              />
            </div>

            <div>
              <label htmlFor="flatNumber" className="block text-sm font-semibold text-slate-700 mb-2">
                Flat Number
              </label>
              <input
                id="flatNumber"
                name="flatNumber"
                type="text"
                required
                defaultValue={initialValues.flatNumber}
                placeholder="e.g. 1201"
                className="w-full p-3 border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-base"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow transition-all flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Save & Continue"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
