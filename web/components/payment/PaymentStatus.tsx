"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type StatusType = "success" | "failure" | "loading";

interface PaymentStatusProps {
  status: StatusType;
  message?: string;
  onRetry?: () => void;
}

export default function PaymentStatus({ status, message, onRetry }: PaymentStatusProps) {
  const router = useRouter();

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-teal-500" />
        <p className="mt-4 text-sm text-gray-600">Processing your payment...</p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-teal-200 bg-teal-50 p-8 shadow-sm">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-100">
          <svg className="h-8 w-8 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="mt-4 text-xl font-semibold text-gray-900">Payment Successful</h3>
        <p className="mt-2 text-center text-sm text-gray-600">
          {message || "Your subscription has been activated successfully."}
        </p>
        <Button
          onClick={() => router.push("/subscription")}
          className="mt-6 bg-[#0f172a] text-white hover:bg-[#1e293b]"
        >
          View Subscription
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 p-8 shadow-sm">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-100">
        <svg className="h-8 w-8 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
      <h3 className="mt-4 text-xl font-semibold text-gray-900">Payment Failed</h3>
      <p className="mt-2 text-center text-sm text-gray-600">
        {message || "Something went wrong. Please try again."}
      </p>
      <div className="mt-6 flex gap-3">
        {onRetry && (
          <Button
            onClick={onRetry}
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Try Again
          </Button>
        )}
        <Button
          onClick={() => router.back()}
          className="bg-[#0f172a] text-white hover:bg-[#1e293b]"
        >
          Go Back
        </Button>
      </div>
    </div>
  );
}
