"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { api } from "@/lib/api";
import PlanList from "@/components/plans/PlanList";
import PaymentStatus from "@/components/payment/PaymentStatus";
import RazorpayCheckout from "@/components/payment/RazorpayCheckout";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

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

type PaymentState = "idle" | "creating" | "checkout" | "verifying" | "success" | "failure";

export default function PlansPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const [paymentState, setPaymentState] = useState<PaymentState>("idle");
  const [currentPlanId, setCurrentPlanId] = useState<string | undefined>();
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchCurrentSubscription = async () => {
      try {
        const response = await api.get("/api/v1/subscriptions/me");

        if (response?.data?.plan?.id) {
          setCurrentPlanId(response.data.plan.id);
        }
      } catch {
        // No active subscription
      }
    };

    if (user) {
      fetchCurrentSubscription();
    }
  }, [user]);
  console.log()
  const handleSelectPlan = async (plan: Plan) => {
    // try {
    //   setPaymentState("creating");
    //   setErrorMessage("");
    //   console.log(plan)
    //   const response = await api.post("/api/v1/subscriptions", { planId: plan.id });

    //   setSubscriptionId(response.data.razorpaySubscriptionId);
    //   setSelectedPlan(plan);
    //   setPaymentState("checkout");
    // } catch (error: any) {
    //   setErrorMessage(error.message || "Failed to initiate subscription. Please try again.");
    //   setPaymentState("failure");
    // }
    toast.info(`We will integrate the payment soon for the ${plan.name} plan!`);
  };

  const handlePaymentSuccess = async (response: any) => {
    try {
      setPaymentState("verifying");
      await api.post("/api/v1/subscriptions/verify", {
        razorpaySubscriptionId: response.razorpay_subscription_id,
        razorpayPaymentId: response.razorpay_payment_id,
        razorpaySignature: response.razorpay_signature,
      });
      setPaymentState("success");
      toast.success("Subscription activated successfully!");
      router.push("/subscription");
    } catch (error: any) {
      setErrorMessage(error.message || "Payment verification failed. Please contact support.");
      setPaymentState("failure");
      toast.error(error.message || "Payment verification failed.");
    }
  };

  const handlePaymentFailure = (error: any) => {
    setErrorMessage(error?.description || "Payment was cancelled or failed.");
    setPaymentState("failure");
    toast.error(error?.description || "Payment was cancelled or failed.");
  };

  const handleRetry = () => {
    if (selectedPlan) {
      handleSelectPlan(selectedPlan);
    }
  };

  if (paymentState === "verifying") {
    return (
      <div className="flex flex-col p-4 md:p-8 font-[family-name:var(--font-poppins)]">
        <div className="mx-auto mt-8 text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-teal-500" />
          <p className="mt-4 text-sm text-gray-600">Verifying payment...</p>
        </div>
      </div>
    );
  }

  if (paymentState === "success") {
    return (
      <div className="flex flex-col p-4 md:p-8 font-[family-name:var(--font-poppins)]">
        <PaymentStatus
          status="success"
          message="Your subscription has been activated successfully."
        />
      </div>
    );
  }

  if (paymentState === "failure") {
    return (
      <div className="flex flex-col p-4 md:p-8 font-[family-name:var(--font-poppins)]">
        <PaymentStatus
          status="failure"
          message={errorMessage}
          onRetry={handleRetry}
        />
      </div>
    );
  }

  if (paymentState === "checkout" && selectedPlan && subscriptionId) {
    return (
      <div className="flex flex-col p-4 md:p-8 font-[family-name:var(--font-poppins)]">
        <RazorpayCheckout
          subscriptionId={subscriptionId}
          amount={selectedPlan.price}
          name="YuktiPrep"
          description={`${selectedPlan.name} Plan`}
          onSuccess={handlePaymentSuccess}
          onFailure={handlePaymentFailure}
        />
        <div className="mx-auto mt-8 text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-teal-500" />
          <p className="mt-4 text-sm text-gray-600">Opening secure payment gateway...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col p-4 md:p-8 font-[family-name:var(--font-poppins)]">
      <div className="mx-auto w-full max-w-5xl">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-9 w-9 mb-5 items-center justify-center rounded-full text-[#1F314D] transition hover:bg-gray-100"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold font-[family-name:var(--font-poppins)] text-gray-900">
            Choose Your Plan
          </h1>
          <p className="mt-2 text-gray-600">
            Unlock the best exam preparation experience with YuktiPrep.
          </p>
        </div>

        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 text-center text-sm text-gray-600">
          <span className="font-semibold text-gray-900">🔒 Secure & Hassle-free</span> - Cancel anytime. No hidden charges.
        </div>

        <PlanList onSelectPlan={handleSelectPlan} currentPlanId={currentPlanId} />
      </div>
    </div>
  );
}
