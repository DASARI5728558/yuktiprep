"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import PaymentStatus from "@/components/payment/PaymentStatus";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

interface Subscription {
  id: string;
  status: string;
  currentEnd: string;
  cancelAtCycleEnd: boolean;
  plan: {
    name: string;
    price: number;
    currency: string;
    billingInterval: string;
  };
}

export default function SubscriptionPage() {
  const router = useRouter();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const response = await api.get("/api/v1/subscriptions/me");
        setSubscription(response.data);
      } catch {
        setSubscription(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, []);

  const handleCancel = async () => {
    if (!subscription) return;
    setCancelling(true);
    const token = localStorage.getItem("token")
    try {
      const response = await api.post(`/api/v1/subscriptions/${subscription.id}/cancel`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setSubscription(response.data);
      toast.success("Subscription cancelled successfully");
    } catch (err: any) {
      setError(err.message || "Failed to cancel subscription");
      toast.error(err.message || "Failed to cancel subscription");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-teal-500" />
          <p className="mt-4 text-sm text-gray-600">Loading subscription...</p>
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="flex flex-col items-center justify-center h-screen rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <h3 className="text-xl font-semibold text-gray-900">No Active Subscription</h3>
        <p className="mt-2 text-center text-sm text-gray-600">
          You don&apos;t have an active subscription. Choose a plan to get started.
        </p>
        <button
          onClick={() => router.push("/plans")}
          className="mt-6 rounded-xl bg-[#0f172a] px-6 py-3 text-sm font-semibold text-white hover:bg-[#1e293b]"
        >
          View Plans
        </button>
      </div>
    );
  }

  const isCancelling = cancelling;
  const isCancelled = subscription.status === "cancelled" || subscription.cancelAtCycleEnd;

  const formatDate = (dateStr: string) => {
    if (!dateStr || new Date(dateStr).getFullYear() === 1970) return "Pending activation";
    const d = new Date(dateStr);
    const month = d.toLocaleDateString("en-US", { month: "long" });
    const day = d.getDate();
    const year = d.getFullYear();

    const suffix = ["th", "st", "nd", "rd"];
    const v = day % 100;
    const dayWithSuffix = day + (suffix[(v - 20) % 10] || suffix[v] || suffix[0]);

    return `${month} ${dayWithSuffix} ${year}`;
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 md:p-8">
      <div className="mx-auto w-full max-w-2xl">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-9 w-9 mb-5 items-center justify-center rounded-full text-[#1F314D] transition hover:bg-gray-100"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <h1 className="mb-6 text-2xl font-bold font-[family-name:var(--font-poppins)] text-gray-900">
          My Subscription
        </h1>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{subscription.plan.name} Plan</h2>
              <p className="mt-1 text-sm text-gray-600">
                ₹{subscription.plan.price}/{subscription.plan.billingInterval}
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${isCancelled
                ? "bg-amber-100 text-amber-700"
                : "bg-teal-100 text-teal-700"
                }`}
            >
              {isCancelled ? "Cancelling" : subscription.status}
            </span>
          </div>

          <div className="mt-6 border-t border-gray-200 pt-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Current period ends</span>
              <span className="font-medium text-gray-900">
                {formatDate(subscription.currentEnd)}
              </span>
            </div>
          </div>

          {!isCancelled && (
            <div className="mt-6">
              <button
                onClick={handleCancel}
                disabled={isCancelling}
                className="w-full rounded-xl border border-rose-300 px-4 py-3 text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-50"
              >
                {isCancelling ? "Cancelling..." : "Cancel Subscription"}
              </button>
            </div>
          )}

          {error && (
            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
