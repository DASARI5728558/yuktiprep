"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { interviewApi } from "@/lib/interview-api";
import { FeedbackResult } from "@/lib/interview-types";
import { ArrowLeft, Trophy, Mic, Calendar, Clock } from "lucide-react";
import { Poppins } from "next/font/google";
import { toast } from "react-hot-toast";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

export default function MockInterviewSessionResult() {
  const router = useRouter();
  const routeParams = useParams();
  const sessionId = routeParams?.sessionId as string;
  const { isAuthenticated } = useAuth();
  const [data, setData] = useState<{ session: any; feedback?: FeedbackResult } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const fetchSession = async () => {
      try {
        const res = await interviewApi.getSession(sessionId);
        const sessionData = res.data;
        const startedAt = sessionData.startedAt ? new Date(sessionData.startedAt) : new Date(sessionData.createdAt || Date.now());
        const endedAt = sessionData.endedAt ? new Date(sessionData.endedAt) : startedAt;
        const durationMinutes = Math.max(1, Math.round((endedAt.getTime() - startedAt.getTime()) / 60000));

        const createdAt = sessionData.createdAt ? new Date(sessionData.createdAt) : null;
        const score = sessionData.feedback?.overall ?? null;
        const passed = score !== null ? score >= 60 : false;

        setData({
          session: {
            id: sessionData.id,
            examId: sessionData.examId,
            topic: sessionData.topic,
            level: sessionData.level,
            mode: sessionData.mode,
            score,
            dimensions: sessionData.feedback?.dimensions,
            dimensionFeedback: sessionData.feedback?.safetyFlags,
            at: createdAt ? createdAt.toISOString() : new Date().toISOString(),
            durationMinutes,
            createdAt,
          },
          feedback: sessionData.feedback as FeedbackResult | undefined,
        });
      } catch (err: any) {
        toast.error(err?.message || "Failed to load interview result");
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [isAuthenticated, router, sessionId]);

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <main className={`${poppins.variable} flex flex-1 flex-col min-w-0 h-full overflow-y-auto rounded-tl-2xl border border-neutral-200 bg-[#F4F6FA] p-5 shadow-sm md:p-8 lg:p-10 font-poppins`}>
        <div className="mx-auto w-full max-w-[900px]">
          <div className="mb-6 flex items-center gap-2 text-sm font-medium text-[#1F314D]">
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </div>
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#238A8D] border-t-transparent" />
          </div>
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className={`${poppins.variable} flex flex-1 flex-col min-w-0 h-full overflow-y-auto rounded-tl-2xl border border-neutral-200 bg-[#F4F6FA] p-5 shadow-sm md:p-8 lg:p-10 font-poppins`}>
        <div className="mx-auto w-full max-w-[900px]">
          <div className="mb-6 flex items-center gap-2 text-sm font-medium text-[#1F314D]">
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </div>
          <div className="rounded-2xl border border-dashed border-[#E3E7EE] bg-white p-10 text-center">
            <p className="text-sm font-medium text-[#1F314D]">Result not found</p>
            <p className="mt-1 text-xs text-[#6B7280]">The requested interview result could not be loaded.</p>
          </div>
        </div>
      </main>
    );
  }

  const { session, feedback } = data;
  const score = session.score ?? 0;
  const passed = score >= 60;
  const displayScore = session.score ?? "—";

  return (
    <main className={`${poppins.variable} flex flex-1 flex-col min-w-0 h-full overflow-y-auto rounded-tl-2xl border border-neutral-200 bg-[#F4F6FA] p-5 shadow-sm md:p-8 lg:p-10 font-poppins`}>
      <div className="mx-auto w-full max-w-[900px]">
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.push("/mock-interview/results")}
            className="flex items-center gap-2 text-sm font-medium text-[#1F314D] transition hover:text-[#0F7F8C]"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Results</span>
          </button>

          <Link
            href="/mock-interview"
            className="flex items-center gap-2 rounded-xl bg-[#0f172a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1e293b]"
          >
            <Mic className="h-4 w-4" />
            <span>New Mock Interview</span>
          </Link>
        </div>

        <div className="mb-8 rounded-2xl border border-[#E3E7EE] bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-medium uppercase text-[#6B7280]">Interview Session</p>
              <h1 className="mt-1 text-xl font-bold text-[#1F314D]">{session.topic || "Mock Interview"}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[#6B7280]">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {session.createdAt && !isNaN(session.createdAt.getTime())
                    ? session.createdAt.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
                    : "—"}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {session.createdAt && !isNaN(session.createdAt.getTime())
                    ? session.createdAt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
                    : "—"}
                </span>
                {session.durationMinutes ? (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {session.durationMinutes} min
                  </span>
                ) : null}
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase">{session.level}</span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase">{session.mode.replace(/_/g, " ")}</span>
                <span className="text-[10px] font-mono text-[#9CA3AF]">{session.examId}</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-3xl font-bold text-[#1F314D]">{displayScore}</p>
                <p className={`text-xs font-semibold ${passed ? "text-green-600" : "text-red-600"}`}>
                  {session.score !== null && session.score !== undefined ? (passed ? "PASSED" : "DEVELOPMENT NEEDED") : "PENDING"}
                </p>
              </div>
              <div className={`flex h-14 w-14 items-center justify-center rounded-full ${passed ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
                <Trophy className="h-7 w-7" />
              </div>
            </div>
          </div>
        </div>

        {feedback && (
          <>
            <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
              {Object.entries(feedback.dimensions).map(([key, value]) => (
                <div key={key} className="rounded-2xl border border-[#E3E7EE] bg-white p-4 shadow-sm">
                  <p className="text-xs text-[#6B7280] capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</p>
                  <p className="text-xl font-bold text-[#1F314D]">{value}%</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="md:col-span-2 space-y-6">
                <div className="rounded-2xl border border-[#E3E7EE] bg-white p-6 shadow-sm">
                  <h3 className="text-sm font-semibold text-[#1F314D]">Strengths</h3>
                  <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[#4B5563]">
                    {feedback.strengths.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-2xl border border-[#E3E7EE] bg-white p-6 shadow-sm">
                  <h3 className="text-sm font-semibold text-[#1F314D]">Improvements</h3>
                  <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[#4B5563]">
                    {feedback.improvements.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-2xl border border-[#E3E7EE] bg-white p-6 shadow-sm">
                  <h3 className="text-sm font-semibold text-[#1F314D]">Next Actions</h3>
                  <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[#4B5563]">
                    {feedback.nextActions.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="space-y-6">
                {session.dimensionFeedback && (
                  <div className="rounded-2xl border border-[#E3E7EE] bg-white p-6 shadow-sm">
                    <h3 className="text-sm font-semibold text-[#1F314D]">Dimension Feedback</h3>
                    <div className="mt-3 space-y-3">
                      {Object.entries(session.dimensionFeedback).map(([key, value]) => (
                        <div key={key}>
                          <p className="text-xs font-semibold uppercase text-[#6B7280]">{key.replace(/([A-Z])/g, " $1").trim()}</p>
                          <p className="mt-1 text-xs text-[#4B5563]">{value as string}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {feedback.analytics && (
                  <div className="rounded-2xl border border-[#E3E7EE] bg-white p-6 shadow-sm">
                    <h3 className="text-sm font-semibold text-[#1F314D]">Analytics</h3>
                    <div className="mt-3 space-y-2 text-xs text-[#4B5563]">
                      <p>Duration: {session.durationMinutes ? `${session.durationMinutes} min` : "—"}</p>
                      <p>WPM: {feedback.analytics.estimatedWpm}</p>
                      <p>Total Words: {feedback.analytics.totalWords}</p>
                      <p>Turns: {feedback.analytics.turnsCount}</p>
                      <p>Passed: {feedback.analytics.passedThreshold ? "Yes" : "No"}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
