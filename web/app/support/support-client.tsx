"use client";

import { useRouter, useSearchParams } from "next/navigation";
import BackButton from "@/components/auth/back-button";
import { Mail } from "lucide-react";

export default function SupportPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const from = searchParams.get("from");

    const handleBack = () => {
        if (from === "login-otp") {
            router.push("/login?step=otp");
        } else {
            router.back();
        }
    };

    return (
        <div className="flex flex-col items-center px-4 py-6 font-[family-name:var(--font-poppins)]">
            <div className="w-full max-w-2xl">
                <BackButton onClick={handleBack} />

                <div className="mt-6 rounded-[20px] border border-[#E2E6EE] bg-white p-6 text-center shadow-sm">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#F3F0FF]">
                        <Mail className="h-7 w-7 text-[#6B55D9]" />
                    </div>

                    <h1 className="text-2xl font-bold text-[#1F314D]">Support</h1>

                    <p className="mt-2 text-sm text-gray-600">
                        Need help? Our support team is here for you.
                    </p>

                    <a
                        href="mailto:support@yuktiprep.com"
                        className="mt-4 inline-block rounded-xl bg-[#0f172a] px-6 py-3 text-sm font-semibold text-white hover:bg-[#1e293b]"
                    >
                        support@yuktiprep.com
                    </a>

                    <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4 text-left text-xs text-slate-600">
                        <p className="font-semibold text-slate-700">What to include in your email:</p>
                        <ul className="mt-2 list-disc space-y-1 pl-4">
                            <li>Your registered phone number or email</li>
                            <li>Issue category: Payment, Interview Session, Account, or Technical</li>
                            <li>Short description of the problem</li>
                            <li>Screenshots or screen recording if available</li>
                        </ul>
                    </div>

                    <p className="mt-4 text-xs text-gray-400">
                        We usually respond within 24 hours on working days.
                    </p>
                </div>
            </div>
        </div>
    );
}
