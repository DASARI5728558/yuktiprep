"use client";

import React, { useMemo, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTests } from "@/lib/tests-context";
import { ArrowLeft, Home, Trophy, CheckCircle, CheckCircle2, XCircle, RotateCcw } from "lucide-react";
import { Poppins } from "next/font/google";
import { Button } from "@/components/ui/button";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

interface QuestionReview {
  id: string;
  orderIndex: number;
  question: string;
  options: { id: string; text: string }[];
  correctAnswer: string;
  explanation?: string;
}

interface AttemptDetails {
  id: string;
  testId: string;
  title: string;
  exam: string;
  score: string;
  correct: string;
  status: string;
  badge: string;
  date: string;
  timeTakenSec: number;
  userAnswers: Record<string, string>;
  questions: QuestionReview[];
}

export const TestResultPage = () => {
  const router = useRouter();
  const params = useParams();
  const { tests, attempts } = useTests();

  const resultId = useMemo(
    () => (Array.isArray(params?.resultId) ? params.resultId[0] : (params?.resultId as string | undefined)),
    [params]
  );

  const [attemptDetails, setAttemptDetails] = useState<AttemptDetails | null>(null);
  const [loading, setLoading] = useState(false);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";

  // Fetch full attempt details including question answers & explanations if available
  useEffect(() => {
    if (!resultId) return;

    setLoading(true);
    fetch(`${backendUrl}/api/v1/tests/attempts/${resultId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setAttemptDetails(data.data);
        }
      })
      .catch((err) => {
        console.warn("Could not load backend attempt details", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [resultId, backendUrl]);

  // Context fallback
  const test = useMemo(() => tests.find((t) => t.id === resultId), [tests, resultId]);
  const attemptFromCtx = useMemo(() => attempts.find((a) => a.id === resultId), [attempts, resultId]);

  const displayTitle = attemptDetails?.title || test?.title || attemptFromCtx?.title || "Test Result";
  const displayExam = attemptDetails?.exam || test?.exam || attemptFromCtx?.exam || "";
  const displayScore = attemptDetails?.score || attemptFromCtx?.score || "0%";
  const displayCorrect = attemptDetails?.correct || attemptFromCtx?.correct || "0/0";
  const displayDate = attemptDetails?.date || attemptFromCtx?.date || "";
  const displayStatus = attemptDetails?.status || attemptFromCtx?.status || "Completed";

  const scoreValue = parseInt(displayScore);
  const correctParts = displayCorrect.split("/");
  const correctCount = parseInt(correctParts[0] || "0");
  const totalCount = parseInt(correctParts[1] || "0");
  const incorrectCount = Math.max(0, totalCount - correctCount);

  const circumference = 2 * Math.PI * 54;
  const progress = isNaN(scoreValue) ? 0 : scoreValue / 100;
  const strokeDashoffset = circumference - progress * circumference;

  const formatTime = (secs: number) => {
    if (!secs) return "2 min 23 sec";
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m > 0 ? `${m} min ` : ""}${s} sec`;
  };

  if (!test && !attemptFromCtx && !attemptDetails && !loading) {
    return (
      <main
        className={`${poppins.variable} flex flex-1 flex-col min-w-0 h-full overflow-y-auto rounded-tl-2xl border border-neutral-200 bg-[#F4F6FA] p-5 shadow-sm md:p-8 lg:p-10 font-poppins`}
      >
        <div className="mx-auto w-full max-w-[900px]">
          <button
            type="button"
            onClick={() => router.back()}
            className="mb-4 flex items-center gap-2 text-sm font-medium text-[#1F314D] transition hover:text-[#0F7F8C]"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>
          <div className="flex flex-col items-center justify-center rounded-[20px] border border-dashed border-[#E2E6EE] bg-white p-10 text-center">
            <p className="text-sm text-[#647084]">Result not found.</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      className={`${poppins.variable} flex flex-1 flex-col min-w-0 h-full overflow-y-auto rounded-tl-2xl border border-neutral-200 bg-[#F4F6FA] p-5 shadow-sm md:p-8 lg:p-10 font-poppins`}
    >
      <div className="mx-auto w-full max-w-[900px]">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.push("/tests")}
            className="flex items-center gap-2 text-sm font-medium text-[#1F314D] transition hover:text-[#0F7F8C]"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-base font-semibold">Discussion</span>
          </button>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="flex h-9 w-9 items-center justify-center rounded-full text-[#1F314D] transition hover:bg-gray-100"
            aria-label="Home"
          >
            <Home className="h-5 w-5" />
          </button>
        </div>

        {/* Test Title Summary Card */}
        <section className="mt-5 rounded-[20px] border border-[#E2E6EE] bg-white p-5 shadow-[0_4px_18px_rgba(20,35,60,0.04)]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#1F314D]">{displayTitle}</h2>
              <p className="text-sm text-[#647084]">{displayExam}</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-medium text-[#647084]">{displayStatus}</span>
              <p className="text-xs text-[#647084]">{displayDate}</p>
            </div>
          </div>
        </section>

        {/* Circular Score Gauge */}
        <section className="mt-5 flex flex-col items-center">
          <div className="relative flex h-48 w-48 items-center justify-center">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="54" stroke="#E2E6EE" strokeWidth="12" fill="none" />
              <circle
                cx="60"
                cy="60"
                r="54"
                stroke="#0F7F8C"
                strokeWidth="12"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Trophy className="h-8 w-8 text-[#E5A326]" />
              <span className="mt-1 text-2xl font-bold text-[#1F314D]">{displayScore}</span>
            </div>
          </div>
        </section>

        {/* Stat Cards */}
        <section className="mt-6 grid grid-cols-2 gap-4">
          <div className="rounded-[20px] border border-[#E2E6EE] bg-white p-5 shadow-sm">
            <h3 className="text-sm font-medium text-[#647084]">Accuracy</h3>
            <p className="mt-1 text-2xl font-bold text-[#1F314D]">{displayScore}</p>
            <p className="text-xs text-[#647084]">
              {correctCount} Correct · {incorrectCount} Incorrect
            </p>
          </div>
          <div className="rounded-[20px] border border-[#E2E6EE] bg-white p-5 shadow-sm">
            <h3 className="text-sm font-medium text-[#647084]">Time Taken</h3>
            <p className="mt-1 text-2xl font-bold text-[#1F314D]">
              {formatTime(attemptDetails?.timeTakenSec || 143)}
            </p>
            <p className="text-xs text-[#647084]">
              Avg. Time / Q{" "}
              {totalCount > 0
                ? ((attemptDetails?.timeTakenSec || 143) / totalCount).toFixed(1)
                : "2.9"}{" "}
              sec
            </p>
          </div>
        </section>

        {/* Motivation Banner */}
        <section className="mt-6">
          <div className="rounded-[20px] border border-[#E2E6EE] bg-[#DDF3F5] p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-[#0F7F8C] shrink-0" />
                <div>
                  <h3 className="text-base font-semibold text-[#1F314D]">Keep Practicing!</h3>
                  <p className="mt-1 text-sm text-[#647084]">
                    You answered {correctCount} out of {totalCount} correctly.
                  </p>
                </div>
              </div>

              {attemptDetails?.testId && (
                <Button
                  onClick={() => router.push(`/tests/${attemptDetails.testId}`)}
                  className="bg-[#0F7F8C] hover:bg-[#0c6670] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Retake Test
                </Button>
              )}
            </div>
          </div>
        </section>

        {/* Detailed Question Review Breakdown (Green Correct / Red Wrong Highlight) */}
        {attemptDetails && attemptDetails.questions && attemptDetails.questions.length > 0 && (
          <section className="mt-8 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#1F314D]">Question-by-Question Review</h3>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 font-semibold text-emerald-700">
                  <span className="h-3 w-3 rounded-full bg-emerald-500 inline-block" />
                  Correct Answer
                </span>
                <span className="flex items-center gap-1.5 font-semibold text-red-700">
                  <span className="h-3 w-3 rounded-full bg-red-500 inline-block" />
                  Your Wrong Selection
                </span>
              </div>
            </div>

            {attemptDetails.questions.map((q, idx) => {
              const selectedOpt = attemptDetails.userAnswers[q.id];
              const isCorrect = selectedOpt && selectedOpt.toUpperCase() === q.correctAnswer.toUpperCase();

              return (
                <div
                  key={q.id || idx}
                  className="rounded-2xl border border-[#E2E6EE] bg-white p-5 shadow-xs transition hover:shadow-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#0F7F8C] bg-[#DDF3F5] px-2.5 py-0.5 rounded-md">
                      Q{idx + 1}
                    </span>
                    {selectedOpt ? (
                      isCorrect ? (
                        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Correct
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-red-600 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200 flex items-center gap-1">
                          <XCircle className="h-3.5 w-3.5" /> Wrong
                        </span>
                      )
                    ) : (
                      <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full">
                        Not Answered
                      </span>
                    )}
                  </div>

                  <p className="text-sm md:text-base font-semibold text-[#1F314D] mt-2 whitespace-pre-line">
                    {q.question}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
                    {q.options.map((opt) => {
                      const isCorrectOption = opt.id.toUpperCase() === q.correctAnswer.toUpperCase();
                      const isUserSelected = selectedOpt && selectedOpt.toUpperCase() === opt.id.toUpperCase();

                      let optClass = "border-gray-200 bg-gray-50/60 text-gray-700";
                      let letterClass = "bg-gray-100 text-gray-600 border-gray-200";

                      if (isCorrectOption) {
                        // ALWAYS GREEN FOR CORRECT ANSWER
                        optClass = "border-[#10B981] bg-[#E4F6EE] text-[#065F46] font-medium";
                        letterClass = "bg-[#10B981] text-white border-[#10B981]";
                      } else if (isUserSelected && !isCorrectOption) {
                        // RED FOR USER'S WRONG SELECTION
                        optClass = "border-[#EF4444] bg-[#FDEBEC] text-[#991B1B] font-medium";
                        letterClass = "bg-[#EF4444] text-white border-[#EF4444]";
                      }

                      return (
                        <div
                          key={opt.id}
                          className={`p-3 rounded-xl border-2 text-xs flex items-center justify-between gap-2 ${optClass}`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span
                              className={`h-6 w-6 rounded-md flex items-center justify-center font-bold text-xs border ${letterClass} shrink-0`}
                            >
                              {opt.id}
                            </span>
                            <span>{opt.text}</span>
                          </div>

                          {isCorrectOption && <CheckCircle2 className="h-4 w-4 text-[#10B981] shrink-0" />}
                          {isUserSelected && !isCorrectOption && (
                            <XCircle className="h-4 w-4 text-[#EF4444] shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {q.explanation && (
                    <div className="mt-3.5 pt-3 border-t border-dashed border-gray-200 text-xs text-[#647084] leading-relaxed">
                      <strong className="text-[#0F7F8C]">Explanation: </strong>
                      {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </section>
        )}

        <div className="h-6" />
      </div>
    </main>
  );
};

export default TestResultPage;
