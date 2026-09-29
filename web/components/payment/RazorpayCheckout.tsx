"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayCheckoutProps {
  subscriptionId: string;
  amount: number;
  currency?: string;
  name: string;
  description: string;
  onSuccess: (response: any) => void;
  onFailure: (error: any) => void;
}

export default function RazorpayCheckout({
  subscriptionId,
  amount,
  currency = "INR",
  name,
  description,
  onSuccess,
  onFailure,
}: RazorpayCheckoutProps) {
  const razorpayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    const key = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    if (!key) {
      onFailure(new Error("Razorpay key is not configured"));
      return;
    }

    const options = {
      key,
      subscription_id: subscriptionId,
      name,
      description,
      currency,
      handler: function (response: any) {
        onSuccess(response);
      },
      prefill: {
        name: "",
        email: "",
        contact: "",
      },
      theme: {
        color: "#0f172a",
      },
      modal: {
        ondismiss: function () {
          onFailure({ description: "Payment cancelled by user" });
        },
      },
    };

    script.onload = () => {
      if (razorpayRef.current && window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    };

    return () => {
      document.body.removeChild(script);
      const rzpContainer = document.querySelector(".razorpay-container");
      if (rzpContainer) {
        rzpContainer.remove();
      }
    };
  }, [subscriptionId, amount, currency, name, description, onSuccess, onFailure]);

  return <div ref={razorpayRef} className="hidden" />;
}
