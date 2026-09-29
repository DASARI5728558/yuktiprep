"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import PlanCard from "./PlanCard";

interface Plan {
  id: string;
  key: string;
  name: string;
  subtitle?: string;
  price: number;
  currency: string;
  billingInterval: string;
  badgeText?: string;
  badgeType?: string;
  theme: string;
  features?: { text: string }[];
  isActive: boolean;
}

interface PlanListProps {
  onSelectPlan: (plan: Plan) => void;
  currentPlanId?: string;
}

export default function PlanList({ onSelectPlan, currentPlanId }: PlanListProps) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await api.get("/api/v1/plans");
        setPlans(response.data || []);
      } catch (err) {
        setError("Failed to load plans. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-teal-500" />
          <p className="mt-4 text-sm text-gray-600">Loading plans...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
        {error}
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-6 text-center">
        <p className="text-gray-600">No plans available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {plans.map((plan) => (
        <PlanCard
          key={plan.id}
          plan={plan}
          onSelect={onSelectPlan}
          currentPlanId={currentPlanId}
        />
      ))}
    </div>
  );
}
