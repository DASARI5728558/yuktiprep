"use client";

import { useState } from "react";

interface PlanFeature {
  text: string;
}

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
  features?: PlanFeature[];
  isActive: boolean;
}

interface PlanCardProps {
  plan: Plan;
  onSelect: (plan: Plan) => void;
  currentPlanId?: string;
}

export default function PlanCard({ plan, onSelect, currentPlanId }: PlanCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const isCurrent = currentPlanId === plan.id;
  const isPremium = plan.theme === "premium";
  const isStandard = plan.theme === "standard";

  const themeClasses = isPremium
    ? "bg-sky-50 border-sky-200"
    : isStandard
      ? "bg-teal-50 border-teal-200"
      : "bg-white border-gray-200";

  const buttonClasses = isPremium
    ? "bg-[#0f172a] text-white hover:bg-[#1e293b]"
    : isStandard
      ? "bg-teal-600 text-white hover:bg-teal-700"
      : "bg-white text-gray-900 border border-gray-300 hover:bg-gray-50";

  const handleSelect = async () => {
    if (isCurrent || !plan.isActive) return;
    setIsLoading(true);
    try {
      await onSelect(plan);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`relative flex flex-col rounded-2xl border p-6 shadow-sm transition hover:shadow-md ${themeClasses} ${
        !plan.isActive ? "opacity-60" : ""
      }`}
    >
      {plan.badgeText && (
        <span
          className={`absolute -top-3 left-4 rounded-full px-3 py-1 text-xs font-bold ${
            plan.badgeType === "popular"
              ? "bg-blue-100 text-blue-700"
              : "bg-amber-100 text-amber-700"
          }`}
        >
          {plan.badgeText}
        </span>
      )}

      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
        {plan.subtitle && (
          <p className="mt-1 text-sm text-gray-600">{plan.subtitle}</p>
        )}
      </div>

      <div className="mb-6">
        <span className="text-3xl font-bold text-gray-900">
          ₹{plan.price}
        </span>
        <span className="text-sm text-gray-600">/ {plan.billingInterval}</span>
      </div>

      <ul className="mb-6 flex-1 space-y-3">
        {(plan.features || []).map((feature, index) => (
          <li key={feature.text || `feature-${index}`} className="flex items-start gap-2 text-sm text-gray-700">
            <svg
              className="mt-0.5 h-5 w-5 flex-shrink-0 text-teal-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span>{feature.text}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={handleSelect}
        disabled={!plan.isActive || isCurrent || isLoading}
        className={`w-full rounded-xl px-4 py-3 text-sm font-semibold transition ${buttonClasses} ${
          !plan.isActive || isCurrent || isLoading ? "cursor-not-allowed opacity-50" : ""
        }`}
      >
        {isLoading
          ? "Processing..."
          : isCurrent
            ? "Current Plan"
            : !plan.isActive
              ? "Unavailable"
              : "Choose Plan"}
      </button>
    </div>
  );
}
