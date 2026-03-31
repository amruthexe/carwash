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
    // Fetch current address to pre-fill
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
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border-t-8 border-[var(--primary)]">
        <div className="flex items-center gap-4 mb-8">
          <MapPin className="w-12 h-12 text-[var(--primary)]" />
          <div>
            <h1 className="text-4xl font-extrabold text-[var(--foreground)]">
              Complete Your Profile
            </h1>
            <p className="text-xl text-[var(--muted-foreground)]">
              Provide your address details to enable booking.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3">
            <span className="font-bold">Error:</span> {error}
          </div>
        )}

        <p className="text-lg text-[var(--muted-foreground)] mb-6">
          Please fill in the following fields. All are required to book a wash.
        </p>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="city"
                className="block text-2xl font-bold text-[var(--foreground)] mb-2"
              >
                City
              </label>
              <input
                id="city"
                name="city"
                type="text"
                required
                defaultValue={initialValues.city}
                placeholder="e.g. Abu Dhabi"
                className="w-full p-5 text-2xl border-4 border-[var(--border)] rounded-2xl focus:border-[var(--primary)] focus:ring focus:ring-[var(--primary)] outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="community"
                className="block text-2xl font-bold text-[var(--foreground)] mb-2"
              >
                Community
              </label>
              <input
                id="community"
                name="community"
                type="text"
                required
                defaultValue={initialValues.community}
                placeholder="e.g. Al Reem Island"
                className="w-full p-5 text-2xl border-4 border-[var(--border)] rounded-2xl focus:border-[var(--primary)] focus:ring focus:ring-[var(--primary)] outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="block"
                className="block text-2xl font-bold text-[var(--foreground)] mb-2"
              >
                Block
              </label>
              <input
                id="block"
                name="block"
                type="text"
                required
                defaultValue={initialValues.block}
                placeholder="e.g. B"
                className="w-full p-5 text-2xl border-4 border-[var(--border)] rounded-2xl focus:border-[var(--primary)] focus:ring focus:ring-[var(--primary)] outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="flatNumber"
                className="block text-2xl font-bold text-[var(--foreground)] mb-2"
              >
                Flat Number / Villa Number
              </label>
              <input
                id="flatNumber"
                name="flatNumber"
                type="text"
                required
                defaultValue={initialValues.flatNumber}
                placeholder="e.g. 1201"
                className="w-full p-5 text-2xl border-4 border-[var(--border)] rounded-2xl focus:border-[var(--primary)] focus:ring focus:ring-[var(--primary)] outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--primary)] hover:bg-[var(--secondary-foreground)] text-white text-2xl font-bold py-6 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 disabled:opacity-70"
          >
            {loading ? (
              <Loader2 className="w-8 h-8 animate-spin" />
            ) : (
              "Save & Continue"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
