"use client";
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Check, ArrowRight, Zap, Target, X, Sparkles } from "lucide-react";
import { useAuthStatus } from "@/lib/auth";

interface PlanFeature {
  id?: string;
  text: string;
  sortOrder?: number;
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
  theme?: string;
  sortOrder?: number;
  features?: PlanFeature[];
  isActive?: boolean;
}

const DEFAULT_PLANS: Plan[] = [
  {
    id: "starter",
    key: "starter",
    name: "Starter",
    subtitle: "Try premium at your pace",
    price: 50,
    currency: "INR",
    billingInterval: "month",
    features: [
      { text: "Limited Tests Access" },
      { text: "Basic Analytics" },
      { text: "Email Support" },
    ],
  },
  {
    id: "standard",
    key: "standard",
    name: "Standard",
    subtitle: "Great for consistent learners",
    price: 299,
    currency: "INR",
    billingInterval: "month",
    badgeText: "Save 40%",
    theme: "standard",
    features: [
      { text: "All Standard Tests" },
      { text: "Basic AI Tutor Access" },
      { text: "Performance Analytics" },
      { text: "Email Support" },
    ],
  },
  {
    id: "premium",
    key: "premium",
    name: "Premium",
    subtitle: "Best for serious aspirants",
    price: 499,
    currency: "INR",
    billingInterval: "month",
    badgeText: "★ Most Popular",
    theme: "premium",
    features: [
      { text: "Unlimited Tests" },
      { text: "Advanced AI Tutor" },
      { text: "Detailed Analytics" },
      { text: "Priority Support" },
    ],
  },
];

export default function Pricing() {
  const [plans, setPlans] = useState<Plan[]>(DEFAULT_PLANS);
  const [loadingPlans, setLoadingPlans] = useState<boolean>(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("We will implement this feature soon!");
  const { isAuthenticated, user, loading } = useAuthStatus();

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:3000";

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await fetch(`${backendUrl}/api/v1/plans`);
        if (res.ok) {
          const json = await res.json();
          const plansData = Array.isArray(json?.data)
            ? json.data
            : Array.isArray(json?.data?.data)
              ? json.data.data
              : Array.isArray(json)
                ? json
                : [];
          if (plansData.length > 0) {
            setPlans(plansData);
          }
        }
      } catch (err) {
        console.error("Error fetching plans from API:", err);
      } finally {
        setLoadingPlans(false);
      }
    };

    fetchPlans();
  }, [backendUrl]);

  const handlePlanClick = (planName: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setToastMsg(`We will integrate the payment soon for the ${planName} plan!`);
    setShowToast(true);
  };

  // Auto-dismiss toast after 4 seconds
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  return (
    <main className="min-h-screen">
      <Navbar />

      {showToast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[var(--primarynavy)] text-white px-6 py-3.5 rounded-full shadow-2xl z-50 flex items-center gap-3 animate-bounce">
          <Zap size={18} className="text-[var(--gold)] shrink-0" fill="currentColor" />
          <span className="font-medium text-[15px]">{toastMsg}</span>
          <button onClick={() => setShowToast(false)} className="ml-2 hover:bg-white/10 p-1.5 rounded-full transition-colors flex items-center justify-center text-white/70 hover:text-white" aria-label="Close">
            <X size={16} />
          </button>
        </div>
      )}

      <section className="py-24 px-6 max-w-[1200px] mx-auto">
        <div className="text-center mb-16">
          <span className="text-[11px] font-extrabold tracking-[0.19em] text-[var(--primaryblue)] uppercase">Simple & Transparent</span>
          <h1 className="text-4xl md:text-[56px]  my-6 text-[var(--primarynavy)] tracking-tight">
            Plans for every <br className="hidden md:block" />stage of your journey
          </h1>
          <p className="text-[18px] leading-[1.75] text-[#49605c] max-w-[600px] mx-auto">
            Choose the level of guidance that matches your ambition. Upgrade or downgrade at any time.
          </p>

          {!loading && isAuthenticated && (
            <div className="inline-flex items-center gap-2 mt-6 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full text-xs font-bold text-emerald-800">
              <Sparkles size={14} className="text-emerald-600" />
              Logged in as {user?.name || user?.email || user?.phoneNumber || "Aspirant"} · Access your student portal anytime
            </div>
          )}
        </div>

        {loadingPlans ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[var(--teal)]" />
              <p className="mt-4 text-sm text-[#49605c]">Loading plans...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-[1100px] mx-auto">
            {plans.map((plan) => {
              const keyLower = plan.key?.toLowerCase() || "";
              const themeLower = plan.theme?.toLowerCase() || "";
              const isPremium = themeLower === "premium" || keyLower.includes("premium");
              const isStandard = themeLower === "standard" || keyLower.includes("standard");

              let cardClasses = "bg-white rounded-[24px] p-8 border border-[rgba(18,47,43,0.08)] flex flex-col transition-transform hover:-translate-y-1 hover:shadow-xl";
              let titleColor = "text-[var(--primarynavy)]";
              let priceColor = "text-[var(--primarynavy)]";
              let checkColor = "text-[var(--primarynavy)]";
              let checkTextColor = "text-[#49605c]";
              let buttonClasses = "w-full inline-flex items-center justify-center gap-2 bg-transparent border-2 border-[var(--primarynavy)] text-[var(--primarynavy)] font-bold py-3.5 rounded-xl transition-colors hover:bg-[#e6f2f7] hover:border-transparent mb-8 cursor-pointer";

              if (isPremium) {
                cardClasses = "bg-[#e6f2f7] rounded-[24px] p-8 border border-[#c5e1f0] flex flex-col relative shadow-[0_20px_50px_rgba(18,41,81,0.08)] transform md:-translate-y-4 hover:shadow-2xl transition-transform";
                titleColor = "text-[var(--primarynavy)]";
                priceColor = "text-[var(--primarynavy)]";
                checkColor = "text-[var(--primarynavy)]";
                checkTextColor = "text-[var(--primarynavy)] font-medium";
                buttonClasses = "w-full inline-flex items-center justify-center gap-2 bg-[var(--primarynavy)] text-white! font-bold py-3.5 rounded-xl transition-transform hover:-translate-y-0.5 mb-8 shadow-lg cursor-pointer";
              } else if (isStandard) {
                cardClasses = "bg-white rounded-[24px] p-8 border border-[var(--teal)] flex flex-col relative transition-transform hover:-translate-y-1 hover:shadow-xl shadow-[0_10px_30px_rgba(25,148,123,0.1)]";
                titleColor = "text-[var(--teal)]";
                priceColor = "text-[var(--teal)]";
                checkColor = "text-[var(--teal)]";
                checkTextColor = "text-[#49605c]";
                buttonClasses = "w-full inline-flex items-center justify-center gap-2 bg-transparent border-2 border-[var(--teal)] text-[var(--teal)] font-bold py-3.5 rounded-xl transition-colors hover:bg-[var(--teal)] hover:text-white mb-8 cursor-pointer";
              }

              const badge = plan.badgeText || (isPremium ? "★ Most Popular" : isStandard ? "Save 40%" : null);

              return (
                <div key={plan.id} className={cardClasses}>
                  {badge && (
                    <div
                      className={`absolute top-0 right-6 -translate-y-1/2 text-[11px] font-extrabold uppercase tracking-[0.05em] px-3 py-1 rounded-full ${isPremium
                          ? "bg-[var(--primarynavy)] text-white flex items-center gap-1.5"
                          : "bg-white border border-[var(--teal)] text-[var(--teal)]"
                        }`}
                    >
                      {badge}
                    </div>
                  )}

                  <div className="mb-8">
                    <h3 className={`text-2xl font-bold ${titleColor} mb-2 flex items-center gap-2`}>
                      {plan.name}
                    </h3>
                    <p className="text-[#49605c] text-sm">
                      {plan.subtitle || (isPremium ? "Best for serious aspirants" : isStandard ? "Great for consistent learners" : "Try premium at your pace")}
                    </p>
                    <div className="mt-6 flex items-baseline gap-1">
                      <span className={`text-4xl font-bold ${priceColor}`}>₹{plan.price}</span>
                      <span className="text-[#8b9b96] text-sm">/ {plan.billingInterval || "month"}</span>
                    </div>
                  </div>

                  <button
                    onClick={handlePlanClick(plan.name)}
                    className={buttonClasses}
                  >
                    Choose Plan
                  </button>

                  <div className="flex flex-col gap-4 flex-1">
                    {(plan.features && plan.features.length > 0) ? (
                      plan.features.map((feature, idx) => (
                        <div key={feature.id || idx} className={`flex items-start gap-3 text-sm ${checkTextColor}`}>
                          <Check size={18} className={`${checkColor} shrink-0 mt-0.5`} />
                          <span>{feature.text}</span>
                        </div>
                      ))
                    ) : (
                      <div className={`flex items-start gap-3 text-sm ${checkTextColor}`}>
                        <Check size={18} className={`${checkColor} shrink-0 mt-0.5`} />
                        <span>All Standard Features Included</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Secure Banner */}
        <div className="max-w-[800px] mx-auto mt-12 bg-[#e6f2f7] rounded-2xl p-6 flex items-center justify-center gap-4 text-left border border-[#c5e1f0]">
          <div className="w-12 h-12 rounded-full bg-white text-[var(--teal)] flex items-center justify-center shrink-0 shadow-sm">
            <Check size={24} />
          </div>
          <div>
            <h4 className="font-bold text-[var(--primarynavy)] text-lg">Secure & Hassle-free</h4>
            <p className="text-[#49605c] text-sm">Cancel anytime. No hidden charges.</p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

