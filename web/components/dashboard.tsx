"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import Image from "next/image";
import { Poppins } from "next/font/google";
import {
  ClipboardCheck,
  CalendarDays,
  BrainCircuit,
  BookOpen,
  NotebookTabs,
  Files,
  History,
  ChevronRight,
  Award,
  Sparkles,
  ArrowUpRight,
  ArrowRight,
  Clock,
  Loader2,
} from "lucide-react";
import { api } from "@/lib/api";
import { toast as hotToast } from "react-hot-toast";
import { toast as sonnerToast } from "sonner";
import {
  getContinueLearningHistoryApi,
  ContinueLearningItem,
} from "@/lib/study-plan-api";


const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

/* ───────────────────────── Types ───────────────────────── */

interface QuickAction {
  title: string;
  description: string;
  icon: React.ElementType;
  iconColor: string;
  href: string;
}

interface ActivityItem {
  icon: React.ElementType;
  title: string;
  activity: string;
  time: string;
}

interface Article {
  id: string;
  title: string;
  theme: string;
  summary: string;
  score: number;
  source_confidence: number;
  source_name: string;
  published_at: string;
  url: string;
  static_link: string;
  prelims?: boolean;
  mains?: boolean;
  pcs?: boolean;
  ssc?: boolean;
  banking?: boolean;
}

/* ─────────────────────── Data ──────────────────────────── */

const quickActions: QuickAction[] = [
  {
    title: "eligibilityChecker",
    description: "checkEligibility",
    icon: ClipboardCheck,
    iconColor: "#258A70",
    href: "/eligibility-checker",
  },
  {
    title: "examCalendar",
    description: "neverMissExam",
    icon: CalendarDays,
    iconColor: "#E67E22",
    href: "/exams",
  },
  {
    title: "aiStudyPlanner",
    description: "smartPlan",
    icon: BrainCircuit,
    iconColor: "#456FAE",
    href: "/ai-tutor",
  },
  {
    title: "studyTracker",
    description: "trackSyllabus",
    icon: BookOpen,
    iconColor: "#6653A5",
    href: "/mock-interview/results",
  },
  {
    title: "currentAffairQuizzes",
    description: "practiceQuizzes",
    icon: NotebookTabs,
    iconColor: "#398A91",
    href: "#",
  },
  {
    title: "pyqAnalyzer",
    description: "analyzePrevious",
    icon: Files,
    iconColor: "#604AAB",
    href: "/pyq-analyzer",
  },
];

const recentActivities: ActivityItem[] = [
  {
    icon: History,
    title: "recentActivity",
    activity: "doubtGeography",
    time: "daysAgo",
  },
];

/* ─────────────────────── Helpers ───────────────────────── */

const getGreeting = (t: (key: string) => string) => {
  const hour = new Date().getHours();
  if (hour < 12) return t("goodMorning");
  if (hour < 17) return t("goodAfternoon");
  return t("goodEvening");
};

/* ───────────────────── Components ──────────────────────── */

export const WelcomeHero = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [welcomeData, setWelcomeData] = useState<{
    greeting?: string;
    firstName?: string;
    name?: string;
    email?: string;
    profilePic?: string;
    targetExam?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWelcomeData = async () => {
      try {
        const res = await api.get("/api/v1/dashboard/welcome");

        if (res?.success && res.data) {
          setWelcomeData(res.data);
        }
      } catch (err) {
        // Silently handle errors to prevent 401 stack traces in the frontend console
      } finally {
        setLoading(false);
      }
    };

    fetchWelcomeData();
  }, []);

  const initial = welcomeData?.name?.charAt(0)?.toUpperCase() || user?.name?.charAt(0)?.toUpperCase() || "R";
  const firstName = welcomeData?.firstName || user?.name?.split(" ")[0] || "Ravishankar";
  const greeting = welcomeData?.greeting || getGreeting(t);

  if (loading) {
    return (
      <div className="relative w-full overflow-hidden rounded-2xl bg-[#19315D] px-6 py-8 md:rounded-b-none md:px-10 md:py-10">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 animate-pulse rounded-full bg-teal-700/40" />
            <div className="h-6 w-40 animate-pulse rounded bg-teal-700/40" />
          </div>
          <div className="h-8 w-56 animate-pulse rounded bg-teal-700/40" />
          <div className="h-4 w-full max-w-md animate-pulse rounded bg-teal-700/30" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-[#19315D] px-6 py-8 md:rounded-b-none md:px-10 md:py-10">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 flex-col gap-4">
          <div className="flex items-center gap-3">
            <div
              className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full bg-[#F3F0FF]"
            >
              {user?.profilePic ? (
                <img
                  src={user.profilePic}
                  alt={user.name}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <span className="text-xl font-bold text-[#6B55D9]">{initial}</span>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-teal-200">Welcome back!</p>
              <h2 className="text-xl font-semibold text-white md:text-2xl">
                Hi, {firstName} 👋
              </h2>
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white md:text-3xl">
              {greeting}
            </h1>
            <p className="mt-2 max-w-md text-sm text-neutral-200 md:text-base">
              Continue your prep journey: courses, live session, and mocks in one
              place.
            </p>
          </div>
        </div>

        <div className="flex justify-center md:w-64 md:flex-shrink-0">
          <div className="h-32 w-40 md:h-40 md:w-48">
            <Image
              src="/aspirants.png"
              alt="Aspirant"
              width={192}
              height={160}
              priority
              className="h-full w-full object-cover scale-125"
            />
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute -bottom-1 left-0 w-full overflow-hidden leading-none md:-bottom-2 lg:-bottom-3">
        <svg
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          className="block h-8 w-full md:h-10 lg:h-12"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,64 C240,100 480,20 720,60 C960,100 1200,20 1440,60 L1440,120 L0,120 Z"
            fill="#F4F6FA"
            stroke="none"
            strokeWidth="0"
          />
        </svg>
      </div>
    </div>
  );
};

export const ContinueLearning = () => {
  const { t } = useLanguage();
  const router = useRouter();
  const [items, setItems] = useState<ContinueLearningItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadHistory() {
      try {
        const res = await getContinueLearningHistoryApi();
        if (isMounted && res?.success && Array.isArray(res.data)) {
          setItems(res.data);
        }
      } catch (err: any) {
        console.warn("Continue Learning fetch error:", err?.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadHistory();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="mt-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-[#238A8D]" />
          <h3 className="text-lg font-semibold text-[#1D2B45]">
            {t("continueLearning")}
          </h3>
        </div>
        {items.length > 0 && (
          <button
            onClick={() => router.push("/ai-tutor")}
            className="text-xs font-semibold text-[#17898A] hover:underline cursor-pointer"
          >
            Go to AI Tutor
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center rounded-[18px] bg-white p-6 shadow-sm">
          <Loader2 className="h-5 w-5 animate-spin text-[#17898A]" />
        </div>
      ) : items.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center rounded-[18px] bg-white p-8 text-center shadow-sm"
          style={{ minHeight: "120px" }}
        >
          <p className="text-sm text-[#6B7280]">{t("noCourses")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.slice(0, 3).map((item) => (
            <div
              key={item.id}
              onClick={() => router.push(item.href)}
              className="group flex flex-col justify-between rounded-[18px] border border-[#E1E5EA] bg-white p-4 shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E9F7F7] text-[#17898A]">
                    {item.type === "ai-tutor" ? (
                      <Sparkles className="h-4 w-4" />
                    ) : (
                      <CalendarDays className="h-4 w-4" />
                    )}
                  </div>
                  <span className="rounded-md bg-[#E9F7F7] px-2 py-0.5 text-[11px] font-semibold text-[#17898A]">
                    {item.type === "ai-tutor" ? "Yuktiprep AI" : "Study Plan"}
                  </span>
                </div>
                <ArrowUpRight className="h-4 w-4 text-neutral-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#17898A]" />
              </div>

              <div className="mt-3">
                <h4 className="line-clamp-2 text-sm font-semibold text-[#1D2B45] group-hover:text-[#17898A] transition-colors">
                  {item.title}
                </h4>
                <p className="mt-1 text-xs text-[#68707C]">{item.subtitle}</p>
              </div>

              <div className="mt-3 flex items-center gap-1.5 border-t border-neutral-100 pt-2 text-[11px] text-neutral-400">
                <Clock className="h-3 w-3" />
                <span>
                  {new Date(item.updatedAt).toLocaleDateString("en-IN", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};


export const QuickActions = () => {
  const router = useRouter();
  const { t } = useLanguage();

  const handleClick = (action: QuickAction) => {
    if (action.href && action.href !== "#") {
      router.push(action.href);
    } else {
      const msg = "We will integrate this feature soon!";
      sonnerToast.info(msg);
      hotToast(msg, { icon: "⚡" });
    }
  };

  return (
    <section className="mt-6">
      <h3 className="mb-4 text-lg font-semibold text-[#1D2B45]">
        {t("quickActions")}
      </h3>
      <div className="grid grid-cols-3 gap-3 md:grid-cols-3 lg:grid-cols-3">
        {quickActions.map((action, idx) => {
          const Icon = action.icon;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleClick(action)}
              className="flex flex-col items-center justify-center gap-3 rounded-[16px] border border-[#E3E7EE] bg-white p-4 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
              style={{ minHeight: "180px" }}
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full"
                style={{ backgroundColor: `${action.iconColor}18` }}
              >
                <Icon className="h-5 w-5" style={{ color: action.iconColor }} />
              </div>
              <div>
                <h4 className="text-sm font-medium text-[#1D2B45]">
                  {t(action.title)}
                </h4>
                <p className="mt-1 text-xs text-[#6B7280]">
                  {t(action.description)}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export const CurrentAffairs = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await api.get("/api/current-affairs/affairs");
        const items = Array.isArray(res) ? res : Array.isArray(res.data) ? res.data : [];
        setArticles(items.slice(0, 5));
      } catch (err: any) {
        sonnerToast.error(err.message || "Failed to fetch current affairs");
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  if (loading) {
    return (
      <section className="mt-6">
        <h3 className="mb-4 text-lg font-semibold text-[#1D2B45]">
          {t("currentAffairs")}
        </h3>
        <div className="rounded-[18px] bg-white p-8 shadow-sm text-center">
          <p className="text-sm text-[#6B7280]">{t("loadingCurrentAffairs")}</p>
        </div>
      </section>
    );
  }

  if (articles.length === 0) {
    return (
      <section className="mt-6">
        <h3 className="mb-4 text-lg font-semibold text-[#1D2B45]">
          {t("currentAffairs")}
        </h3>
        <div className="rounded-[18px] bg-white p-8 shadow-sm text-center">
          <p className="text-sm text-[#6B7280]">
            {t("noCurrentAffairs")}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#1D2B45]">
          {t("currentAffairs")}
        </h3>
        <Link
          href="/current-affairs"
          className="text-sm font-medium text-[#238A8D] hover:text-[#1D2B45] transition-colors"
        >
          {t("viewAll")}
        </Link>
      </div>
      <div className="space-y-4">
        {articles.map((article, idx) => (
          <Link
            key={idx}
            href={`/current-affairs#${encodeURIComponent(article.id || article.title)}`}
            className="block rounded-[18px] border border-[#E3E7EE] bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <h4 className="text-sm font-semibold text-[#1D2B45]">
              {article.title}
            </h4>
            <p className="mt-2 text-xs text-[#6B7280] line-clamp-2">
              {article.summary}
            </p>
            <div className="mt-3 flex items-center gap-2">
              <span className="rounded-full bg-[#E0F7FA] px-2 py-1 text-[10px] font-semibold text-[#238A8D] uppercase">
                {article.theme}
              </span>
              <span className="text-[10px] text-[#9CA3AF]">
                {new Date(article.published_at).toLocaleDateString("en-IN")}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export const RecentActivity = () => {
  const { t } = useLanguage();
  return (
    <section className="mt-6">
      {recentActivities.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div
            key={idx}
            className="flex items-center gap-4 rounded-[18px] bg-white p-5 shadow-sm"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#E0F7FA]">
              <Icon className="h-6 w-6 text-[#238A8D]" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-[#1D2B45]">
                {t(item.title)}
              </h4>
              <p className="text-sm text-[#6B7280]">{t(item.activity)}</p>
              <p className="text-xs text-[#9CA3AF]">{item.time}</p>
            </div>
            <ChevronRight className="h-5 w-5 text-[#9CA3AF]" />
          </div>
        );
      })}
    </section>
  );
};

export const ExamReadiness = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [readinessData, setReadinessData] = useState({
    exam: "UPSC Prelims 2025",
    score: 0,
    topicsCompleted: 0,
    totalTopics: 0,
    hoursStudied: 0,
    mockTests: 0,
  });

  useEffect(() => {
    let isMounted = true;

    const fetchReadiness = async () => {
      try {
        // Fetch attempts and welcome data in parallel
        const [attemptsRes, welcomeRes] = await Promise.allSettled([
          api.get("/api/v1/tests/attempts"),
          api.get("/api/v1/dashboard/welcome"),
        ]);

        const welcomeTarget =
          welcomeRes.status === "fulfilled" && welcomeRes.value?.data?.targetExam;

        const profileTarget =
          (user?.learnerProfile as any)?.targetExam?.name ||
          (user?.learnerProfile as any)?.targetExamTitle?.name;

        // Ensure we never display a raw UUID
        const isUUID = (val?: string) =>
          val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

        let examName = "UPSC Prelims 2025";
        if (welcomeTarget && !isUUID(welcomeTarget)) {
          examName = welcomeTarget;
        } else if (profileTarget && !isUUID(profileTarget)) {
          examName = profileTarget;
        } else if (user?.learnerProfile?.targetExamId && !isUUID(user.learnerProfile.targetExamId)) {
          examName = user.learnerProfile.targetExamId;
        }

        let attemptsList: any[] = [];
        if (attemptsRes.status === "fulfilled") {
          const resData = attemptsRes.value;
          attemptsList = Array.isArray(resData?.data)
            ? resData.data
            : Array.isArray(resData)
              ? resData
              : [];
        }

        const totalAttempts = attemptsList.length;

        // Calculate average score percentage from attempts
        let totalScorePct = 0;
        let validScoresCount = 0;
        let totalTimeTakenSec = 0;
        const attemptedTopics = new Set<string>();

        attemptsList.forEach((att: any) => {
          if (att.timeTakenSec) {
            totalTimeTakenSec += Number(att.timeTakenSec) || 0;
          }

          if (att.title) {
            attemptedTopics.add(att.title);
          }

          if (att.score) {
            const numericScore = parseFloat(String(att.score).replace("%", ""));
            if (!isNaN(numericScore)) {
              totalScorePct += numericScore;
            }
            validScoresCount++;
          } else if (att.correct) {
            // e.g. "29/40"
            const parts = String(att.correct).split("/");
            if (parts.length === 2) {
              const c = parseFloat(parts[0]);
              const tot = parseFloat(parts[1]);
              if (!isNaN(c) && !isNaN(tot) && tot > 0) {
                totalScorePct += (c / tot) * 100;
                validScoresCount++;
              }
            }
          }
        });

        const avgScore = validScoresCount > 0 ? Math.round(totalScorePct / validScoresCount) : 0;
        const hoursCalculated = (totalTimeTakenSec / 3600).toFixed(1);
        const hoursDisplay = parseFloat(hoursCalculated) > 0 ? parseFloat(hoursCalculated) : totalAttempts > 0 ? (totalAttempts * 0.5).toFixed(1) : 0;

        if (isMounted) {
          setReadinessData({
            exam: examName,
            score: avgScore,
            topicsCompleted: attemptedTopics.size,
            totalTopics: totalAttempts === 0 ? 0 : Math.max(attemptedTopics.size + 15, attemptedTopics.size),
            hoursStudied: Number(hoursDisplay),
            mockTests: totalAttempts,
          });
        }
      } catch (err) {
        console.warn("Error fetching exam readiness data:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchReadiness();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const hasData = readinessData.mockTests > 0 || readinessData.topicsCompleted > 0 || readinessData.hoursStudied > 0;

  return (
    <section className="mt-6">
      <h3 className="mb-4 text-lg font-semibold text-[#1D2B45]">
        {t("examReadiness")}
      </h3>
      <div className="rounded-[18px] bg-white p-5 shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-[#238A8D]" />
          </div>
        ) : !hasData ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-sm font-medium text-[#6B7280]">No data available</p>
            <button
              type="button"
              onClick={() => {
                window.location.href = "/tests";
              }}
              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#238A8D] hover:underline cursor-pointer"
            >
              Start a Mock Test <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h4 className="text-base font-semibold text-[#1D2B45]">
                  {readinessData.exam}
                </h4>
                <p className="text-xs text-[#6B7280]">{t("preparationProgress")}</p>
              </div>
              <div className="flex items-center gap-1">
                <Award className="h-5 w-5 text-[#E67E22]" />
                <span className="text-lg font-bold text-[#1D2B45]">
                  {readinessData.score}%
                </span>
              </div>
            </div>

            <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-[#238A8D] transition-all duration-500"
                style={{ width: `${Math.min(Math.max(readinessData.score, 0), 100)}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <p className="text-lg font-bold text-[#1D2B45]">
                  {readinessData.topicsCompleted}/{readinessData.totalTopics}
                </p>
                <p className="text-xs text-[#6B7280]">{t("topicsDone")}</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-[#1D2B45]">
                  {readinessData.hoursStudied}h
                </p>
                <p className="text-xs text-[#6B7280]">{t("hoursStudied")}</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-[#1D2B45]">
                  {readinessData.mockTests}
                </p>
                <p className="text-xs text-[#6B7280]">{t("mockTests")}</p>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

/* ───────────────────── Dashboard ───────────────────────── */

export const Dashboard = () => {
  return (
    <main className={`${poppins.variable} flex flex-col w-full h-full overflow-y-auto rounded-tl-2xl border border-neutral-200 bg-[#F4F6FA] p-4 shadow-sm md:p-6 lg:pt-8 font-poppins`}>
      <div className="mx-auto w-full max-w-[1600]">
        <WelcomeHero />
        <ContinueLearning />
        <QuickActions />
        <CurrentAffairs />
        {/* <RecentActivity /> */}
        <ExamReadiness />
        <div className="h-6" />
      </div>
    </main>
  );
};

export default Dashboard;
