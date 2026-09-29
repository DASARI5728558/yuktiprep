"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTests, Test } from "@/lib/tests-context";
import { cn } from "@/lib/utils";
import {
  ClipboardCheck,
  Clock,
  CircleHelp,
  Users,
  ChevronDown,
} from "lucide-react";
import { Poppins } from "next/font/google";
import { Button } from "@/components/ui/button";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

type TopTab = "available" | "attempts";
type CategoryTab = "all" | "mock" | "previous-year";

const EXAM_OPTIONS = [
  "All Exams",
  "UPSC Civil Services",
  "SSC (CGL, CHSL, MTS)",
  "Banking (IBPS, SBI PO/Clerk)",
  "Railways (RRB NTPC, Group D)",
  "Defence (NDA, CDS, AFCAT)",
];

const DIFFICULTY_OPTIONS = [
  "All Difficulties",
  "EASY",
  "MEDIUM",
  "HARD",
];

const CATEGORY_TABS: { label: string; value: CategoryTab }[] = [
  { label: "All Tests", value: "all" },
  { label: "Mock Tests", value: "mock" },
  { label: "Previous Year", value: "previous-year" },
];

const DIFFICULTY_STYLES: Record<string, { background: string; text: string }> = {
  EASY: { background: "#E4F6EE", text: "#27805F" },
  MEDIUM: { background: "#FFF4D7", text: "#C68A17" },
  HARD: { background: "#FDEBEC", text: "#C64E56" },
};

const DifficultyBadge = ({ difficulty }: { difficulty: string }) => {
  const style = DIFFICULTY_STYLES[difficulty] || { background: "#F3F4F6", text: "#374151" };
  return (
    <span
      className="rounded-full w-fit px-2 py-1 text-xs font-semibold"
      style={{ background: style.background, color: style.text }}
    >
      {difficulty}
    </span>
  );
};

const TestMetadata = ({
  icon: Icon,
  value,
}: {
  icon: React.ElementType;
  value: string;
}) => (
  <div className="flex items-center gap-1.5 text-xs text-[#647084]">
    <Icon className="h-4 w-4" />
    <span>{value}</span>
  </div>
);

interface TestCardProps {
  test: Test;
  onStart: (test: Test) => void;
}

const TestCard = ({ test, onStart }: TestCardProps) => {
  return (
    <article
      className="rounded-[20px] border border-[#E2E6EE] bg-white p-[18px] shadow-sm"
      style={{ marginBottom: "16px" }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-[#FFF6D9]">
            <ClipboardCheck className="h-6 w-6 text-[#E5A326]" />
          </div>
          <div className="flex flex-col gap-2">
            <DifficultyBadge difficulty={test.difficulty} />
            <span className="text-xs text-[#647084]">{test.exam}</span>
          </div>
        </div>
      </div>

      <h3 className="mt-3 text-base font-semibold text-[#1F314D]">{test.title}</h3>

      <div className="mt-3 flex flex-wrap items-center gap-4">
        <TestMetadata icon={Clock} value={test.duration} />
        <TestMetadata icon={CircleHelp} value={test.questions} />
        {/* <TestMetadata icon={Users} value={test.users} /> */}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-[#647084]">
          Ready to Start
        </span>
        <Button
          onClick={() => onStart(test)}
          className="h-10 rounded-xl bg-[#6650D8] px-5 text-sm font-semibold text-white transition hover:bg-[#5843C4]"
        >
          Start Test
        </Button>
      </div>
    </article>
  );
};

export const TestsPage = () => {
  const router = useRouter();
  const {
    tests,
    attempts,
    filters,
    setExamFilter,
    setDifficultyFilter,
  } = useTests();
  const [topTab, setTopTab] = useState<TopTab>("available");
  const [categoryTab, setCategoryTab] = useState<CategoryTab>("all");

  const filteredTests = useMemo(() => {
    return tests.filter((test) => {
      const matchesExam = filters.exam === "All Exams" || test.exam === filters.exam;
      const matchesDifficulty = filters.difficulty === "All Difficulties" || test.difficulty === filters.difficulty;
      const matchesCategory = categoryTab === "all" || test.type === categoryTab;
      return matchesExam && matchesDifficulty && matchesCategory;
    });
  }, [tests, filters, categoryTab]);

  const handleStartTest = (test: Test) => {
    router.push(`/tests/${test.id}`);
  };

  const handleAttemptClick = (attemptId: string) => {
    router.push(`/tests/result/${attemptId}`);
  };

  return (
    <main
      className={`${poppins.variable} flex flex-1 flex-col min-w-0 h-full overflow-y-auto rounded-tl-2xl border border-neutral-200 bg-[#F4F6FA] p-5 shadow-sm md:p-8 lg:p-10 font-poppins`}
    >
      <div className="mx-auto w-full max-w-[1200px]">
        <section className="mt-2 flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#DDF3F5]">
            <ClipboardCheck className="h-6 w-6 text-[#0F7F8C]" />
          </div>
          <h1 className="text-[28px] font-semibold text-[#1F314D] md:text-[32px]">Tests</h1>
        </section>

        <section className="mt-5">
          <div className="flex rounded-[26px] border border-[#E2E6EE] bg-white p-1">
            {[
              { label: "Available Tests", value: "available" },
              { label: "Recent Attempts", value: "attempts" },
            ].map((tab) => {
              const isActive = topTab === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setTopTab(tab.value as TopTab)}
                  className={cn(
                    "flex-1 rounded-[20px] py-2.5 text-sm font-medium transition",
                    isActive
                      ? "bg-[#233249] text-white"
                      : "text-[#1F314D] hover:bg-gray-50"
                  )}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </section>

        {topTab === "available" && (
          <>
            <section className="mt-5">
              <h2 className="text-lg font-semibold text-[#1F314D]">Mock Tests & Practice</h2>
              <p className="mt-1 text-sm text-[#647084]">Test your readiness with exam-simulated environments.</p>
            </section>

            <section className="mt-4 flex flex-wrap items-center gap-3">
              <div className="relative">
                <select
                  value={filters.exam}
                  onChange={(e) => setExamFilter(e.target.value)}
                  className="appearance-none rounded-xl border border-[#E2E6EE] bg-white px-4 py-2.5 pr-10 text-sm font-medium text-[#1F314D] outline-none transition focus:border-[#0F7F8C]"
                >
                  {EXAM_OPTIONS.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#647084]" />
              </div>

              <div className="relative">
                <select
                  value={filters.difficulty}
                  onChange={(e) => setDifficultyFilter(e.target.value)}
                  className="appearance-none rounded-xl border border-[#E2E6EE] bg-white px-4 py-2.5 pr-10 text-sm font-medium text-[#1F314D] outline-none transition focus:border-[#0F7F8C]"
                >
                  {DIFFICULTY_OPTIONS.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#647084]" />
              </div>
            </section>

            <section className="mt-4">
              <div className="flex rounded-[26px] border border-[#E2E6EE] bg-white p-1">
                {CATEGORY_TABS.map((tab) => {
                  const isActive = categoryTab === tab.value;
                  return (
                    <button
                      key={tab.value}
                      type="button"
                      onClick={() => setCategoryTab(tab.value)}
                      className={cn(
                        "flex-1 rounded-[20px] py-2 text-sm font-medium transition",
                        isActive
                          ? "bg-[#233249] text-white"
                          : "text-[#1F314D] hover:bg-gray-50"
                      )}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="mt-5">
              {filteredTests.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-[20px] border border-dashed border-[#E2E6EE] bg-white p-10 text-center">
                  <p className="text-sm text-[#647084]">No tests found matching your filters.</p>
                </div>
              ) : (
                filteredTests.map((test) => (
                  <TestCard key={test.id} test={test} onStart={handleStartTest} />
                ))
              )}
            </section>
          </>
        )}

        {topTab === "attempts" && (
          <section className="mt-5">
            {attempts.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-[20px] border border-dashed border-[#E2E6EE] bg-white p-10 text-center">
                <p className="text-sm text-[#647084]">No attempts yet. Start a test to see your results here.</p>
              </div>
            ) : (
              attempts.map((attempt) => (
                <article
                  key={attempt.id}
                  onClick={() => handleAttemptClick(attempt.id)}
                  className="cursor-pointer rounded-[20px] border border-[#E2E6EE] bg-white p-5 shadow-sm transition hover:shadow-md"
                  style={{ marginBottom: "16px" }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-[#FFF6D9]">
                        <ClipboardCheck className="h-6 w-6 text-[#E5A326]" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-[#1F314D]">{attempt.title}</h3>
                        <p className="text-xs text-[#647084]">{attempt.exam}</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-[#233249] px-3 py-1 text-xs font-semibold text-white">
                      {attempt.badge}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-[#0F7F8C]">{attempt.score}</span>
                      <span className="text-xs text-[#647084]">{attempt.correct}</span>
                    </div>
                    <span className="text-xs text-[#647084]">{attempt.status}</span>
                    <span className="text-xs text-[#647084]">{attempt.date}</span>
                  </div>
                </article>
              ))
            )}
          </section>
        )}

        <div className="h-6" />
      </div>
    </main>
  );
};

export default TestsPage;
