"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { authApi } from "@/lib/auth-api";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import PhoneInput from "@/components/auth/phone-input";
import OTPInput from "@/components/auth/otp-input";
import { AuthIllustrationPlaceholder, OTPIllustrationPlaceholder } from "@/components/auth/auth-illustration-placeholder";
import BackButton from "@/components/auth/back-button";

// OLD IMPLEMENTATION - COMMENTED OUT AND PRESERVED FOR REFERENCE
/*
export default function RegisterPage() {
  const router = useRouter();
  const { isAuthenticated, register } = useAuth();
  const { t } = useLanguage();

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [targetExamId, setTargetExamId] = useState("");
  const [attemptYear, setAttemptYear] = useState("");
  const [studyHoursPerDay, setStudyHoursPerDay] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState("en");
  const [step, setStep] = useState<"phone" | "details">("phone");
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  const { data: examsData } = useQuery({
    queryKey: ["publicExams"],
    queryFn: async () => {
      const response = await api.get("/api/v1/public/exams");
      return response.data as Exam[];
    },
  });

  const exams = examsData || [];

  const requestOtpMutation = useMutation({
    mutationFn: authApi.requestRegisterOTP,
    onSuccess: () => {
      setStep("details");
      setLocalError("");
    },
    onError: (error: Error) => {
      setLocalError(error.message);
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: authApi.verifyRegisterOTP,
    onSuccess: (response) => {
      const { token, user } = response.data || {};
      if (token && user) {
        register(token, user);
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
    verifyOtpMutation.mutate({
      phone,
      otp,
      email,
      name,
      targetExamId: targetExamId || undefined,
      attemptYear: attemptYear ? parseInt(attemptYear) : undefined,
      studyHoursPerDay: studyHoursPerDay ? parseFloat(studyHoursPerDay) : undefined,
      preferredLanguage,
    });
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
          <CardTitle className="text-2xl">{t("createAccount")}</CardTitle>
          <CardDescription>
            {step === "phone"
              ? t("enterPhoneToStart")
              : t("completeProfile")}
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
                <Label htmlFor="email">{t("email")}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t("enterEmail")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={verifyOtpMutation.isPending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">{t("fullNameField")}</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={verifyOtpMutation.isPending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetExam">{t("targetExamOptional")}</Label>
                <select
                  id="targetExam"
                  value={targetExamId}
                  onChange={(e) => setTargetExamId(e.target.value)}
                  disabled={verifyOtpMutation.isPending}
                  className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50"
                >
                  <option value="">{t("selectExam")}</option>
                  {exams.map((exam) => (
                    <option key={exam.id} value={exam.id}>
                      {exam.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="attemptYear">{t("attemptYearOptional")}</Label>
                <Input
                  id="attemptYear"
                  type="number"
                  placeholder="2026"
                  value={attemptYear}
                  onChange={(e) => setAttemptYear(e.target.value)}
                  disabled={verifyOtpMutation.isPending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="studyHoursPerDay">{t("studyHoursOptional")}</Label>
                <Input
                  id="studyHoursPerDay"
                  type="number"
                  step="0.5"
                  placeholder="4"
                  value={studyHoursPerDay}
                  onChange={(e) => setStudyHoursPerDay(e.target.value)}
                  disabled={verifyOtpMutation.isPending}
                />
              </div>
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
                  ? t("creatingAccount")
                  : t("verifyRegister")}
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
            {t("alreadyHaveAccount")}{" "}
            <a href="/login" className="text-primary underline">
              {t("login")}
            </a>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
*/

type Exam = {
  id: string;
  name: string;
  slug: string;
};

const OTP_VALIDITY_SECONDS = 10 * 60;

export default function RegisterPage() {
  const router = useRouter();
  const { isAuthenticated, register } = useAuth();
  const { t } = useLanguage();

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [targetExamId, setTargetExamId] = useState("");
  const [attemptYear, setAttemptYear] = useState("");
  const [studyHoursPerDay, setStudyHoursPerDay] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState("en");
  const [step, setStep] = useState<"phone" | "details">("phone");
  const [localError, setLocalError] = useState("");
  const [countdown, setCountdown] = useState(OTP_VALIDITY_SECONDS);
  const [emailError, setEmailError] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (step === "details" && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  const { data: examsData } = useQuery({
    queryKey: ["publicExams"],
    queryFn: async () => {
      const response = await api.get("/api/v1/public/target-exams");
      return response.data as Exam[];
    },
  });

  const exams = examsData || [];

  const requestOtpMutation = useMutation({
    mutationFn: authApi.requestRegisterOTP,
    onSuccess: () => {
      setStep("details");
      setLocalError("");
      setCountdown(OTP_VALIDITY_SECONDS);
      setEmailError("");
    },
    onError: (error: Error) => {
      setLocalError("");
      if (error.message.includes("Email is already registered")) {
        setEmailError(error.message);
      } else {
        setLocalError(error.message);
      }
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: authApi.verifyRegisterOTP,
    onSuccess: (response) => {
      const { token, user } = response.data || {};
      if (token && user) {
        register(token, user);
        router.push("/");
      } else {
        setLocalError("Invalid response from server");
      }
    },
    onError: (error: Error) => {
      setLocalError("");
      if (error.message.includes("Email is already registered")) {
        setEmailError(error.message);
        setStep("phone");
        setOtp("");
      } else {
        setLocalError(error.message);
      }
    },
  });

  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    requestOtpMutation.mutate({ phone, name, email });
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    verifyOtpMutation.mutate({
      phone,
      otp,
      email,
      name,
      targetExamId: targetExamId || undefined,
      attemptYear: attemptYear ? parseInt(attemptYear) : undefined,
      studyHoursPerDay: studyHoursPerDay ? parseFloat(studyHoursPerDay) : undefined,
      preferredLanguage,
    });
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
    <div className="flex min-h-screen flex-col items-center bg-white px-4 py-6 font-[family-name:var(--font-poppins)]">
      {step === "details" && (
        <div className="flex w-full max-w-md items-center justify-between">
          <BackButton onClick={() => setStep("phone")} />
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
                {t("createYourAccount")}
              </h1>
              <div className="mx-auto mt-2 h-1 w-16 rounded-full bg-orange-400" />
              <p className="mt-2 text-center text-sm text-gray-600">
                {t("startYourPrep")}
              </p>
            </div>

            <form onSubmit={handleRequestOtp} className="mt-8 w-full space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                  {t("fullNameField")}
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={requestOtpMutation.isPending}
                  className="h-12 rounded-xl border-gray-200 bg-gray-50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  {t("email")}
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t("enterEmail")}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError("");
                  }}
                  required
                  disabled={requestOtpMutation.isPending}
                  className={`h-12 rounded-xl ${emailError ? "border-red-500 bg-gray-50" : "border-gray-200 bg-gray-50"}`}
                />
                <p className="text-red-500 text-sm my-0">{emailError}</p>
              </div>
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

            <div className="mt-6 flex flex-col items-center gap-2">
              <p className="text-sm text-gray-600">
                {t("alreadyHaveAccount")}{" "}
                <a href="/login" className="text-teal-600 underline">
                  {t("login")}
                </a>
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="mt-6 w-full">
              <h1 className="text-center text-2xl font-bold text-[#1F314D]">
                {t("enterOtpTitle")}
              </h1>
              <p className="mt-2 text-center text-sm text-gray-600">
                {t("weSentADigitCodeTo")} +91 {phone.slice(0, 5)} {phone.length > 5 ? phone.slice(5) : ""}
              </p>
              <button
                type="button"
                className="mx-auto mt-1 block text-sm font-medium text-teal-600"
                onClick={() => {
                  setStep("phone");
                  setOtp("");
                  setLocalError("");
                  setEmailError("");
                }}
              >
                {t("edit")}
              </button>
            </div>

            <form onSubmit={handleVerifyOtp} className="mt-6 w-full space-y-4">
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
                {verifyOtpMutation.isPending ? t("creatingAccount") : t("verifyRegister")}
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
                {t("alreadyHaveAccount")}{" "}
                <a href="/login" className="text-teal-600 underline">
                  {t("login")}
                </a>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}