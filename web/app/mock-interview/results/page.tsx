"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { interviewApi } from "@/lib/interview-api";
import { InterviewAnalytics, RecentInterviewSession } from "@/lib/interview-types";
import { ArrowLeft, Trophy, TrendingUp, Calendar, Clock, Mic, BookOpen } from "lucide-react";
import { Poppins } from "next/font/google";
import { toast } from "react-hot-toast";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

export default function MockInterviewResults() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [analytics, setAnalytics] = useState<InterviewAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const fetchAnalytics = async () => {
      try {
        const res = await interviewApi.getAnalytics();
        setAnalytics(res.data as InterviewAnalytics);
      } catch (err: any) {
        toast.error(err?.message || "Failed to load mock interview results");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [isAuthenticated, router]);

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
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl bg-white" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  const recent = analytics?.recent || [];

  return (
    <main className={`${poppins.variable} flex flex-1 flex-col min-w-0 h-full overflow-y-auto rounded-tl-2xl border border-neutral-200 bg-[#F4F6FA] p-5 shadow-sm md:p-8 lg:p-10 font-poppins`}>
      <div className="mx-auto w-full max-w-[900px]">
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-sm font-medium text-[#1F314D] transition hover:text-[#0F7F8C]"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>

          <Link
            href="/mock-interview"
            className="flex items-center gap-2 rounded-xl bg-[#0f172a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1e293b]"
          >
            <Mic className="h-4 w-4" />
            <span>New Mock Interview</span>
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#1F314D]">Study Tracker</h1>
          <p className="mt-1 text-sm text-[#6B7280]">Review your past mock interviews, scores, and feedback.</p>
        </div>

        {analytics && (
          <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-2xl border border-[#E3E7EE] bg-white p-4 shadow-sm">
              <p className="text-xs text-[#6B7280]">Completed</p>
              <p className="text-xl font-bold text-[#1F314D]">{analytics.completed}</p>
            </div>
            <div className="rounded-2xl border border-[#E3E7EE] bg-white p-4 shadow-sm">
              <p className="text-xs text-[#6B7280]">Average Score</p>
              <p className="text-xl font-bold text-[#1F314D]">{analytics.averageScore ?? "—"}</p>
            </div>
            <div className="rounded-2xl border border-[#E3E7EE] bg-white p-4 shadow-sm">
              <p className="text-xs text-[#6B7280]">Best Dimension</p>
              <p className="text-xl font-bold text-[#1F314D]">
                {recent.length > 0 && recent[0].dimensions
                  ? Object.entries(recent[0].dimensions).sort((a, b) => b[1] - a[1])[0]?.[0] || "—"
                  : "—"}
              </p>
            </div>
            <div className="rounded-2xl border border-[#E3E7EE] bg-white p-4 shadow-sm">
              <p className="text-xs text-[#6B7280]">Latest</p>
              <p className="text-xl font-bold text-[#1F314D]">
                {recent.length > 0 ? new Date(recent[0].at).toLocaleDateString("en-IN") : "—"}
              </p>
            </div>
          </div>
        )}

        {recent.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#E3E7EE] bg-white p-10 text-center">
            <BookOpen className="mx-auto mb-3 h-10 w-10 text-[#9CA3AF]" />
            <p className="text-sm font-medium text-[#1F314D]">No mock interviews yet</p>
            <p className="mt-1 text-xs text-[#6B7280]">Complete a mock interview to see your results here.</p>
            <Link
              href="/mock-interview"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#0f172a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1e293b]"
            >
              Start Interview
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {recent.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function SessionCard({ session }: { session: RecentInterviewSession }) {
  const router = useRouter();
  const score = session.score ?? 0;
  const passed = score >= 60;
  const duration = session.durationMinutes ? `${session.durationMinutes} min` : null;

  return (
    <div
      onClick={() => router.push(`/mock-interview/results/${session.id}`)}
      className="cursor-pointer rounded-2xl border border-[#E3E7EE] bg-white p-5 shadow-sm transition hover:shadow-md"
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Mic className="h-4 w-4 text-[#238A8D]" />
            <h3 className="text-sm font-semibold text-[#1F314D]">{session.topic || "Mock Interview"}</h3>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-[#6B7280]">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(session.at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {new Date(session.at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
            </span>
            {duration && (
              <span className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                {duration}
              </span>
            )}
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase">{session.level}</span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase">{session.mode.replace(/_/g, " ")}</span>
            <span className="text-[10px] font-mono text-[#9CA3AF]">{session.examId}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-2xl font-bold text-[#1F314D]">{score}</p>
            <p className={`text-xs font-semibold ${passed ? "text-green-600" : "text-red-600"}`}>
              {passed ? "PASSED" : "DEVELOPMENT NEEDED"}
            </p>
          </div>
          <div className={`flex h-10 w-10 items-center justify-center rounded-full ${passed ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
            <Trophy className="h-5 w-5" />
          </div>
        </div>
      </div>

      {session.dimensions && (
        <div className="mt-4 grid grid-cols-3 gap-2 md:grid-cols-6">
          {Object.entries(session.dimensions).map(([key, value]) => (
            <div key={key} className="text-center">
              <p className="text-xs font-semibold text-[#1F314D]">{value}</p>
              <p className="text-[10px] text-[#6B7280] capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
