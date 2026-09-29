"use client";

import { useState, useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { authApi } from "@/lib/auth-api";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import PhoneInput from "@/components/auth/phone-input";
import OTPInput from "@/components/auth/otp-input";
import { AuthIllustrationPlaceholder, OTPIllustrationPlaceholder } from "@/components/auth/auth-illustration-placeholder";
import BackButton from "@/components/auth/back-button";
import { CardFooter } from "@/components/ui/card";
import { toast } from "sonner";

// OLD IMPLEMENTATION - COMMENTED OUT AND PRESERVED FOR REFERENCE
/*
export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, login } = useAuth();
  const { t } = useLanguage();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  const requestOtpMutation = useMutation({
    mutationFn: authApi.requestLoginOTP,
    onSuccess: () => {
      setStep("otp");
      setLocalError("");
    },
    onError: (error: Error) => {
      setLocalError(error.message);
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: authApi.verifyLoginOTP,
    onSuccess: (response) => {
      const { token, user } = response.data || {};
      if (token && user) {
        login(token, user);
        router.push("/");
      } else {
        setLocalError("Invalid response from server");
      }
    },
    onError: (error: Error) => {
      setLocalError(error.message);
    },
  });

  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    requestOtpMutation.mutate({ phone });
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    verifyOtpMutation.mutate({ phone, otp });
  };

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center">
            <Image
              src="/yuktiprep.png"
              height={48}
              width={48}
              alt="YuktiPrep"
              className="h-12 w-12"
              style={{ width: "auto", height: "auto" }}
            />
          </div>
          <CardTitle className="text-2xl">{t("welcomeBackLogin")}</CardTitle>
          <CardDescription>
            {step === "phone"
              ? t("enterPhoneOtp")
              : t("enterOtp")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "phone" ? (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">{t("phoneNumber")}</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  disabled={requestOtpMutation.isPending}
                />
              </div>
              {localError && (
                <p className="text-sm text-destructive">{localError}</p>
              )}
              <Button
                type="submit"
                className="w-full"
                disabled={requestOtpMutation.isPending}
              >
                {requestOtpMutation.isPending ? t("sendingOtp") : t("sendOtp")}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">{t("oneTimePassword")}</Label>
                <Input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  placeholder="123456"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  required
                  disabled={verifyOtpMutation.isPending}
                />
              </div>
              {localError && (
                <p className="text-sm text-destructive">{localError}</p>
              )}
              <Button
                type="submit"
                className="w-full"
                disabled={verifyOtpMutation.isPending}
              >
                {verifyOtpMutation.isPending
                  ? t("verifying")
                  : t("verifyLogin")}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setStep("phone");
                  setOtp("");
                  setLocalError("");
                }}
                disabled={verifyOtpMutation.isPending}
              >
                {t("back")}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-muted-foreground">
            {t("dontHaveAccount")}{" "}
            <a href="/register" className="text-primary underline">
              {t("register")}
            </a>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
*/

const OTP_VALIDITY_SECONDS = 10 * 60;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, login } = useAuth();
  const { t } = useLanguage();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [localError, setLocalError] = useState("");
  const [countdown, setCountdown] = useState(OTP_VALIDITY_SECONDS);
  const [isMounted, setIsMounted] = useState(false);
  const toastShownRef = useRef(false);

  const stepFromUrl = searchParams?.get("step");
  const step = stepFromUrl === "otp" ? "otp" : "phone";

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined") {
      const savedPhone = sessionStorage.getItem("login_phone");
      if (savedPhone) {
        setPhone(savedPhone);
      }
    }
  }, []);

  useEffect(() => {
    if (searchParams?.get("expired") === "true" && !toastShownRef.current) {
      toastShownRef.current = true;
      toast.error("Session expired. Please log in again.");
      router.replace("/login");
    }
  }, [searchParams, router]);

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (step === "otp" && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  const requestOtpMutation = useMutation({
    mutationFn: authApi.requestLoginOTP,
    onSuccess: () => {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("login_phone", phone);
      }
      router.replace("/login?step=otp");
      setLocalError("");
      setCountdown(OTP_VALIDITY_SECONDS);
    },
    onError: (error: Error) => {
      setLocalError(error.message);
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: authApi.verifyLoginOTP,
    onSuccess: (response) => {
      const { token, user } = response.data || {};
      if (token && user) {
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("login_phone");
        }
        login(token, user);
        router.push("/");
      } else {
        setLocalError("Invalid response from server");
      }
    },
    onError: (error: Error) => {
      setLocalError(error.message);
    },
  });

  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    requestOtpMutation.mutate({ phone });
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    const phoneToVerify = phone || (typeof window !== "undefined" ? sessionStorage.getItem("login_phone") || "" : "");
    verifyOtpMutation.mutate({ phone: phoneToVerify, otp });
  };

  const handleBackToPhone = () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("login_phone");
    }
    router.replace("/login");
    setPhone("");
    setOtp("");
    setLocalError("");
  };

  const formatCountdown = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-white px-4 py-3 font-[family-name:var(--font-poppins)]">
      {step === "otp" && (
        <div className="flex w-full max-w-md items-center justify-between">
          <BackButton onClick={handleBackToPhone} />
          <button
            type="button"
            className="text-sm font-medium text-teal-600"
            onClick={() => {
              router.push("/support?from=login-otp");
            }}
          >
            Need help?
          </button>
        </div>
      )}

      <div className="mt-6 flex w-full max-w-md flex-1 flex-col items-center">
        <div className="flex justify-center">
          <Image
            src="/yuktiprep.png"
            height={90}
            width={90}
            alt="YuktiPrep"
            className="h-20 w-auto object-contain"
            priority
          />
        </div>

        <p className="mt-3 text-center text-sm text-gray-600">
          {t("aiPoweredExamPreparation")}
        </p>
        <div className="mt-2 flex items-center gap-2">
          <div className="h-px w-8 bg-orange-400" />
          <div className="h-1.5 w-1.5 rounded-full bg-orange-400" />
          <div className="h-px w-8 bg-orange-400" />
        </div>

        {step === "phone" ? (
          <>
            <div className="mt-8 w-full">
              <h1 className="text-center text-2xl font-bold text-[#1F314D]">
                {t("letsStartYourExamJourney")}
              </h1>
              <div className="mx-auto mt-2 h-1 w-16 rounded-full bg-orange-400" />
              <p className="mt-2 text-center text-sm text-gray-600">
                {t("learnSmarterPracticeBetterScoreHigher")}
              </p>
            </div>

            <form onSubmit={handleRequestOtp} className="mt-8 w-full space-y-5">
              <PhoneInput
                value={phone}
                onChange={setPhone}
                disabled={requestOtpMutation.isPending}
                error={localError}
              />
              <Button
                type="submit"
                className="h-12 w-full rounded-xl bg-[#0f172a] text-base font-semibold text-white hover:bg-[#1e293b]"
                disabled={requestOtpMutation.isPending || phone.replace(/\D/g, "").length < 10}
              >
                {requestOtpMutation.isPending ? t("sendingOtp") : t("sendOtp")}
              </Button>

              <div className="mt-0 flex flex-col items-center gap-2">
                <p className="text-sm text-gray-600">
                  {t("dontHaveAccount")}{" "}
                  <a href="/register" className="text-teal-600 underline">
                    {t("register")}
                  </a>
                </p>
              </div>

            </form>


            <p className="mt-6 text-center text-xs text-gray-500">
              {t("weKeepYourDataSafeAndSecure")}
            </p>

            <div className="mt-auto pt-6">
              <AuthIllustrationPlaceholder type="login" />
            </div>

            <p className="mt-4 text-center text-xs text-gray-400">
              {t("termsOfUseAndPrivacyPolicy")}
            </p>


          </>
        ) : (
          <>
            <div className="mt-6 w-full">
              <h1 className="text-center text-2xl font-bold text-[#1F314D]">
                {t("enterOtpTitle")}
              </h1>
              <p className="mt-2 text-center text-sm text-gray-600" suppressHydrationWarning>
                {t("weSentADigitCodeTo")} {isMounted && phone ? `+91 ${phone.slice(0, 5)} ${phone.length > 5 ? phone.slice(5) : ""}` : "+91 ..."}
              </p>
              <button
                type="button"
                className="mx-auto mt-1 block text-sm font-medium text-teal-600"
                onClick={handleBackToPhone}
              >
                {t("edit")}
              </button>
            </div>

            <form onSubmit={handleVerifyOtp} className="mt-8 w-full space-y-5">
              <OTPInput
                value={otp}
                onChange={setOtp}
                disabled={verifyOtpMutation.isPending}
                error={localError}
                autoFocus
              />

              <Button
                type="submit"
                className="h-12 w-full rounded-xl bg-[#0f172a] text-base font-semibold text-white hover:bg-[#1e293b]"
                disabled={verifyOtpMutation.isPending || otp.length !== 6}
              >
                {verifyOtpMutation.isPending ? t("verifying") : t("verifyAndContinue")}
              </Button>

              {countdown > 0 ? (
                <p className="text-center text-sm text-gray-500">
                  {t("resendOtp")} in {formatCountdown(countdown)}
                </p>
              ) : (
                <button
                  type="button"
                  className="w-full text-center text-sm font-medium text-teal-600"
                  onClick={() => {
                    setCountdown(OTP_VALIDITY_SECONDS);
                    handleRequestOtp({ preventDefault: () => { } } as React.FormEvent);
                  }}
                  disabled={requestOtpMutation.isPending}
                >
                  {t("resendOtp")}
                </button>
              )}
            </form>

            <p className="mt-6 text-center text-xs text-gray-500">
              {t("weNeverShareYourNumberWithAnyone")}
            </p>

            <div className="mt-auto pt-6">
              <AuthIllustrationPlaceholder type="otp" />
            </div>

            <div className="mt-6 flex flex-col items-center gap-2">
              <p className="text-sm text-gray-600">
                {t("dontHaveAccount")}{" "}
                <a href="/register" className="text-teal-600 underline">
                  {t("register")}
                </a>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}