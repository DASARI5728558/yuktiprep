"use client";

import Image from "next/image";

interface AuthIllustrationPlaceholderProps {
  type?: "login" | "otp";
  className?: string;
}

export function AuthIllustrationPlaceholder({ type = "login", className }: AuthIllustrationPlaceholderProps) {
  return (
    <div className={`flex w-full items-center justify-center ${className || ""}`}>
      <div className="relative h-40 w-full max-w-sm md:h-48">
        <Image
          src="/signin-logo.png"
          alt="Sign in illustration"
          fill
          sizes="(max-width: 768px) 100vw, 384px"
          priority
          className="object-contain relative!"
        />
      </div>
    </div>
  );
}
export function OTPIllustrationPlaceholder({ type = "otp", className }: AuthIllustrationPlaceholderProps) {
  return (
    <div className={`flex w-full items-center justify-center ${className || ""}`}>
      <div className="relative h-40 w-full max-w-sm md:h-48">
        <Image
          src="/otp-logo.png"
          alt="OTP illustration"
          fill
          sizes="(max-width: 768px) 100vw, 384px"
          priority
          className="object-contain relative!"
        />
      </div>
    </div>
  );
}
