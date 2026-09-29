"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import {
  Sparkles,
  FileQuestion,
  CalendarDays,
  Lightbulb,
  Target,
  BookOpen,
  Mic,
  Send,
  ChevronRight,
  BadgeCheck,
  Calculator,
  Clock,
  BrainIcon,
  Loader2,
  ArrowUpRight,
} from "lucide-react";
import { Poppins } from "next/font/google";
import {
  getContinueLearningHistoryApi,
  ContinueLearningItem,
} from "@/lib/study-plan-api";

/* ───────────────────────── Types ───────────────────────── */


interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  iconColor: string;
  href?: string;
  prompt?: string;
}

interface Suggestion {
  title: string;
  icon: React.ElementType;
}

interface TutorMessage {
  role: "user" | "assistant";
  content: string;
}

/* ─────────────────────── Data ──────────────────────────── */

const quickActions: QuickAction[] = [
  {
    id: "explain-question",
    title: "Explain this question",
    description: "Get step-by-step",
    icon: FileQuestion,
    iconColor: "#17898A",
    prompt:
      "Please explain this question step by step with clear reasoning and shortcuts where possible.",
  },
  {
    id: "create-study-plan",
    title: "Create study plan",
    description: "Personalized plan just for you",
    icon: CalendarDays,
    iconColor: "#17898A",
    href: "/ai-tutor/study-planner",
  },
  {
    id: "test-topic",
    title: "Test me on this topic",
    description: "AI will create a test for you",
    icon: FileQuestion,
    iconColor: "#17898A",
    prompt:
      "Create a short practice test on this topic with questions and answers.",
  },
  {
    id: "shortcut-trick",
    title: "Give shortcut trick",
    description: "Smart tricks to solve faster",
    icon: Lightbulb,
    iconColor: "#17898A",
    prompt:
      "Share smart shortcut tricks to solve this type of problem faster in CSAT.",
  },
  {
    id: "analyze-mistakes",
    title: "Analyze my mistakes",
    description: "Detailed analysis & improvement",
    icon: Target,
    iconColor: "#17898A",
    prompt:
      "Analyze common mistakes in this topic and suggest practical improvement tips.",
  },
  {
    id: "concept-revision",
    title: "Concept Revision",
    description: "Revise important concepts",
    icon: BookOpen,
    iconColor: "#17898A",
    prompt:
      "Help me revise the key concepts for this topic with a concise summary.",
  },
];

const suggestions: Suggestion[] = [
  {
    title: "How to solve percentage problems?",
    icon: Calculator,
  },
  {
    title: "Trick to find LCM quickly?",
    icon: Calculator,
  },
  {
    title: "How to improve time & accuracy in CSAT",
    icon: Clock,
  },
  {
    title: "Best strategy for CSAT prelims?",
    icon: BrainIcon,
  },
];

/* ─────────────────────── Helpers ───────────────────────── */

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning!";
  if (hour < 17) return "Good Afternoon!";
  return "Good Evening!";
};

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

/* ───────────────────── Components ──────────────────────── */

const RobotIllustration = () => (
  <img
    src="/aibot.png"
    alt="AI Tutor"
    className="h-full w-full object-contain"
  />
);

const ProgressChart = () => (
  <img
    src="/bowandarrow.png"
    alt="AI Tutor"
    className="h-full w-full object-cover"
  />
);

export const AITutorHero = () => {
  const { user } = useAuth();
  const firstName = user?.name?.split(" ")[0] || "Student";

  return (
    <section className="mt-2">
      <div
        className="flex items-center gap-4 rounded-[24px] border border-[#A8D7D8] bg-gradient-to-br from-[#E9F7F7] to-white p-5 shadow-sm md:p-6"
        style={{
          background: "linear-gradient(135deg, #E9F7F7 0%, #FFFFFF 100%)",
        }}
      >
        <div className="hidden sm:flex h-28 w-28 shrink-0 items-center justify-center md:h-32 md:w-32">
          <RobotIllustration />
        </div>
        <div className="flex flex-1 flex-col gap-3">
          <div>
            <h2 className="text-lg font-semibold text-[#172E55] md:text-xl">
              {getGreeting()}, {firstName}
            </h2>
            <h1 className="mt-1 text-xl font-bold text-[#1D2B45] md:text-2xl">
              Your AI Study Companion
            </h1>
            <p className="mt-1 text-sm text-[#68707C]">
              Personalized help to crack UPSC, CSAT & Aptitude
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-[#17898A]">
            <BadgeCheck className="h-4 w-4" />
            <span>Exam Focused · Always Here to Help</span>
          </div>
        </div>
        <div className="hidden md:flex h-28 w-32 shrink-0 items-center justify-center">
          <ProgressChart />
        </div>
      </div>
    </section>
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
          {items.slice(0, 6).map((item) => (
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


export const QuickActionsGrid = ({
  onSelectAction,
}: {
  onSelectAction: (action: QuickAction) => void;
}) => {
  return (
    <section className="mt-6">
      <h3 className="mb-3 text-lg font-semibold text-[#1D2B45]">
        Quick Actions
      </h3>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              type="button"
              onClick={() => onSelectAction(action)}
              className="flex flex-col items-start justify-between gap-3 rounded-[20px] border border-[#E1E5EA] bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
              style={{ minHeight: "170px" }}
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full"
                style={{ backgroundColor: "#E9F7F7" }}
              >
                <Icon className="h-5 w-5" style={{ color: action.iconColor }} />
              </div>
              <div className="flex flex-1 w-full flex-col justify-between">
                <div>
                  <h4 className="text-[15px] font-semibold text-[#1D2B45]">
                    {action.title}
                  </h4>
                  <p className="mt-1 text-xs text-[#68707C]">
                    {action.description}
                  </p>
                </div>
                <ChevronRight
                  className="mt-3 h-4 w-4 self-end text-[#17898A]"
                  aria-hidden="true"
                />
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export const AskAnythingInput = ({
  value,
  onChange,
  onSubmit,
  isLoading,
  inputRef,
}: {
  value: string;
  onChange: (val: string) => void;
  onSubmit: (prompt?: string) => void;
  isLoading: boolean;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim() || isLoading) return;
    onSubmit(value.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <section className="mt-6">
      <h3 className="mb-3 text-lg font-semibold text-[#1D2B45]">
        Ask Anything (Exam Focused)
      </h3>
      <form
        onSubmit={handleSubmit}
        className="ask-form flex w-full items-center gap-2 rounded-[28px] border-[1.5px] border-[#17898A] bg-white px-3 py-3 md:px-4 shadow-sm focus-within:ring-2 focus-within:ring-[#17898A]/30 transition-all"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E9F7F7]">
          {isLoading ? (
            <Loader2 className="h-4 w-4 text-[#17898A] animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4 text-[#17898A]" />
          )}
        </div>

        <textarea
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything about questions, concepts, shortcuts, strategies..."
          className="question-input overflow-hidden min-w-0 flex-1 resize-none bg-transparent text-sm text-[#1D2B45] outline-none"
          rows={1}
          disabled={isLoading}
        />

        <button
          type="button"
          aria-label="Voice input"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#68707C] hover:text-[#17898A] transition-colors"
        >
          <Mic className="h-5 w-5" />
        </button>

        <button
          type="submit"
          disabled={isLoading || !value.trim()}
          aria-label="Send query"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#138D94] text-white transition-opacity disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed shadow-sm hover:bg-[#0f7278]"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
      </form>
    </section>
  );
};

export const TryAskingSuggestions = ({
  onSelectSuggestion,
}: {
  onSelectSuggestion: (title: string) => void;
}) => {
  return (
    <section className="mt-6">
      <h3 className="mb-3 text-lg font-semibold text-[#1D2B45]">
        Try asking
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {suggestions.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectSuggestion(item.title)}
              className="flex items-center gap-3 rounded-[18px] border border-[#B9DCDC] bg-[#E9F7F7] p-4 text-left transition hover:border-[#17898A] cursor-pointer"
              style={{ minHeight: "80px" }}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white shadow-xs">
                <Icon className="h-4 w-4 text-[#17898A]" aria-hidden="true" />
              </div>
              <p className="text-sm font-medium text-[#1D2B45]">
                {item.title}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export const MotivationCard = () => (
  <section className="mt-6">
    <div
      className="flex items-center gap-4 rounded-[20px] border border-[#B9DCDC] p-5"
      style={{
        background: "linear-gradient(135deg, #E9F7F7 0%, #FFFFFF 100%)",
      }}
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white shadow-xs">
        <Target className="h-6 w-6 text-[#17898A]" aria-hidden="true" />
      </div>
      <div>
        <h4 className="text-base font-semibold text-[#24737A]">
          Focus. Practice. Improve. Succeed.
        </h4>
        <p className="mt-1 text-sm text-[#68707C]">
          Let AI guide you to your goal!
        </p>
      </div>
    </div>
  </section>
);

export const AIDisclaimer = () => (
  <p className="mt-6 text-center text-sm text-[#6B7280]">
    AI Tutor may occasionally generate incorrect information, please cross-check
    vital facts.
  </p>
);

/* ───────────────────── Page ────────────────────────────── */

export const AITutorPage = () => {
  const router = useRouter();
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (promptToSend?: string) => {
    const text = (promptToSend ?? inputValue).trim();
    if (!text) return;
    router.push(`/ai-tutor/chat?prompt=${encodeURIComponent(text)}`);
  };

  const handleQuickAction = (action: QuickAction) => {
    if (action.href && action.href !== "#") {
      router.push(action.href);
      return;
    }

    if (action.prompt) {
      setInputValue(action.prompt);
      // Auto-focus input and place cursor at the end, waiting for user to click submit
      if (inputRef.current) {
        inputRef.current.focus();
        setTimeout(() => {
          if (inputRef.current) {
            const len = inputRef.current.value.length;
            inputRef.current.setSelectionRange(len, len);
          }
        }, 50);
      }
    }
  };

  const handleSelectSuggestion = (suggestionText: string) => {
    setInputValue(suggestionText);
    if (inputRef.current) {
      inputRef.current.focus();
      setTimeout(() => {
        if (inputRef.current) {
          const len = inputRef.current.value.length;
          inputRef.current.setSelectionRange(len, len);
        }
      }, 50);
    }
  };

  return (
    <main
      className={`${poppins.variable} flex flex-col w-full h-full overflow-y-auto rounded-tl-2xl border border-neutral-200 bg-[#F4F6FA] p-4 shadow-sm md:p-6 lg:pt-8 font-poppins`}
    >
      <div className="mx-auto w-full max-w-[1600px] space-y-2">
        <AITutorHero />
        <ContinueLearning />

        <QuickActionsGrid onSelectAction={handleQuickAction} />

        <AskAnythingInput
          value={inputValue}
          onChange={setInputValue}
          onSubmit={(p) => handleSubmit(p)}
          isLoading={false}
          inputRef={inputRef}
        />

        <TryAskingSuggestions onSelectSuggestion={handleSelectSuggestion} />
        <MotivationCard />
        <AIDisclaimer />
        <div className="h-6" />
      </div>
    </main>
  );
};

export default AITutorPage;



