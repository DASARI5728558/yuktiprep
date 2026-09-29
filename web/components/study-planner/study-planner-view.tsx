"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  Sparkles,
  ArrowLeft,
  Send,
  Loader2,
  ChevronRight,
  BadgeCheck,
  CheckCircle2,
  Clock,
  BookOpen,
  Calendar,
  Layers,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import {
  StudyPlanSummary,
  StudyPlanDetails,
  generateStudyPlanApi,
  getStudyPlansHistoryApi,
  getStudyPlanDetailsApi,
} from "@/lib/study-plan-api";
import { MarkdownRender } from "@/components/markdown-render";


const SUGGESTION_CHIPS = [
  "Create a 30-day UPSC Prelims study plan",
  "Weekly plan for Indian Polity revision",
  "60-day roadmap for SSC CGL Quantitative Aptitude",
  "15-day crash revision for Banking Reasoning",
];

export const StudyPlannerView = ({
  initialPlanId,
}: {
  initialPlanId?: string;
}) => {
  const router = useRouter();

  // Screen state
  const [activePlanId, setActivePlanId] = useState<string | null>(
    initialPlanId || null
  );
  const [promptInput, setPromptInput] = useState("");
  const [followUpInput, setFollowUpInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // History & active plan data
  const [historyList, setHistoryList] = useState<StudyPlanSummary[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [planDetails, setPlanDetails] = useState<StudyPlanDetails | null>(null);
  const [planDetailsLoading, setPlanDetailsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom of conversation
  useEffect(() => {
    if (activePlanId && planDetails?.messages?.length) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [activePlanId, planDetails?.messages?.length]);

  // Load history list on mount
  useEffect(() => {
    fetchHistory();
  }, []);

  // Load details if initialPlanId is set or activePlanId changes
  useEffect(() => {
    if (activePlanId) {
      fetchPlanDetails(activePlanId);
    } else {
      setPlanDetails(null);
    }
  }, [activePlanId]);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await getStudyPlansHistoryApi();
      if (res?.success && Array.isArray(res.data)) {
        setHistoryList(res.data);
      }
    } catch (err: any) {
      console.warn("Failed to load study plan history:", err?.message);
    } finally {
      setHistoryLoading(false);
    }
  };

  const fetchPlanDetails = async (id: string) => {
    setPlanDetailsLoading(true);
    setErrorMessage(null);
    try {
      const res = await getStudyPlanDetailsApi(id);
      if (res?.success && res.data) {
        setPlanDetails(res.data);
      } else {
        setErrorMessage(
          "Sorry, I couldn't generate a reply right now (AI service is temporarily unavailable). Please try again in a moment."
        );
      }
    } catch (err: any) {
      console.error("Failed to load plan details:", err);
      setErrorMessage(
        "Sorry, I couldn't generate a reply right now (AI service is temporarily unavailable). Please try again in a moment."
      );
    } finally {
      setPlanDetailsLoading(false);
    }
  };

  // Generate new study plan from Screen 1
  const handleGeneratePlan = async (promptToUse?: string) => {
    const text = (promptToUse || promptInput).trim();
    if (!text || isGenerating) return;

    setIsGenerating(true);
    setErrorMessage(null);

    try {
      const res = await generateStudyPlanApi(text, []);

      if (res?.success && res.studyPlanId) {
        setPromptInput("");
        setActivePlanId(res.studyPlanId);
        fetchHistory();
      } else {
        setErrorMessage(
          res?.message ||
            "Sorry, I couldn't generate a reply right now (AI service is temporarily unavailable). Please try again in a moment."
        );
      }
    } catch (err: any) {
      console.error("Error generating study plan:", err);
      setErrorMessage(
        "Sorry, I couldn't generate a reply right now (AI service is temporarily unavailable). Please try again in a moment."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Send follow-up question from Screen 2
  const handleSendFollowUp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = followUpInput.trim();
    if (!query || !activePlanId || isGenerating) return;

    const currentHistory = planDetails?.messages || [];

    // Optimistically update conversation
    const optimisticUserMsg = {
      role: "user" as const,
      content: query,
      createdAt: new Date().toISOString(),
    };

    setPlanDetails((prev) =>
      prev
        ? {
            ...prev,
            messages: [...prev.messages, optimisticUserMsg],
          }
        : null
    );

    setFollowUpInput("");
    setIsGenerating(true);
    setErrorMessage(null);

    try {
      const res = await generateStudyPlanApi(query, currentHistory, activePlanId);

      if (res?.success && res.message) {
        const assistantMsg = {
          role: "assistant" as const,
          content: res.message,
          createdAt: new Date().toISOString(),
        };

        setPlanDetails((prev) =>
          prev
            ? {
                ...prev,
                messages: [...prev.messages, assistantMsg],
              }
            : null
        );

        fetchHistory();
      } else {
        setErrorMessage(
          res?.message ||
            "Sorry, I couldn't generate a reply right now (AI service is temporarily unavailable). Please try again in a moment."
        );
      }
    } catch (err: any) {
      console.error("Error asking follow-up:", err);
      setErrorMessage(
        "Sorry, I couldn't generate a reply right now (AI service is temporarily unavailable). Please try again in a moment."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  /* ========================================================================
   * SCREEN 2: STUDY PLAN DETAILS & MULTI-TURN CONVERSATION
   * ======================================================================== */
  if (activePlanId) {
    const formattedDate = planDetails?.createdAt
      ? new Date(planDetails.createdAt).toLocaleDateString("en-IN", {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        })
      : "Today";

    return (
      <div className="flex flex-col w-full h-full min-h-[calc(100vh-80px)] pb-10">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#E1E5EA]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActivePlanId(null)}
              className="flex items-center justify-center h-9 w-9 rounded-full bg-white border border-[#E1E5EA] text-[#17898A] hover:bg-[#E9F7F7] transition"
              title="Back to Study Planner"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-[#1D2B45] md:text-xl truncate max-w-xl">
                  {planDetails?.title || "Study Plan Details"}
                </h1>
                <span className="hidden sm:inline-flex rounded-full bg-[#E9F7F7] border border-[#A8D7D8] px-2.5 py-0.5 text-xs font-semibold text-[#17898A]">
                  {planDetails?.exam || "Active"}
                </span>
              </div>
              <p className="text-xs text-[#68707C] mt-0.5">
                {formattedDate} • {planDetails?.messages?.length || 0} messages
              </p>
            </div>
          </div>

          <button
            onClick={() => setActivePlanId(null)}
            className="hidden sm:flex items-center gap-1 text-xs font-semibold text-[#17898A] hover:underline"
          >
            Create New Plan
          </button>
        </div>

        {/* Loading Spinner */}
        {planDetailsLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-8 w-8 text-[#17898A] animate-spin" />
            <p className="mt-3 text-sm text-[#68707C]">
              Loading study plan details...
            </p>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium">{errorMessage}</p>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-xs font-bold hover:opacity-75 ml-2"
            >
              ✕
            </button>
          </div>
        )}

        {/* Conversation Thread */}
        {!planDetailsLoading && (
          <div className="flex flex-col gap-6 flex-1 max-w-4xl w-full mx-auto">
            {planDetails?.messages?.map((msg, index) => {
              const isUser = msg.role === "user";

              if (isUser) {
                return (
                  <div key={msg.id || index} className="flex justify-end">
                    <div className="max-w-2xl rounded-2xl rounded-tr-xs bg-[#172E55] px-5 py-3.5 text-sm text-white shadow-sm leading-relaxed">
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                );
              }

              // AI Assistant Response Card
              return (
                <div
                  key={msg.id || index}
                  className="rounded-[24px] border border-[#A8D7D8] bg-white p-6 shadow-sm"
                >
                  {/* Assistant Header Tag */}
                  <div className="flex items-center justify-between border-b border-[#E9F7F7] pb-4 mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E9F7F7]">
                        <CalendarDays className="h-4 w-4 text-[#17898A]" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[#1D2B45]">
                          AI Study Planner
                        </h3>
                        <p className="text-[11px] text-[#68707C]">
                          Personalized & Exam Focused
                        </p>
                      </div>
                    </div>
                    <span className="flex items-center gap-1.5 rounded-full bg-[#E9F7F7] border border-[#A8D7D8] px-3 py-1 text-xs font-semibold text-[#17898A]">
                      <Sparkles className="h-3.5 w-3.5" />
                      AI Powered • Exam Focused
                    </span>
                  </div>

                  {/* Markdown Formatted Content */}
                  <MarkdownRender content={msg.content} />
                </div>
              );

            })}

            {/* In-Flight Follow-up Loading Bubble */}
            {isGenerating && (
              <div className="rounded-[24px] border border-[#A8D7D8] bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3 text-sm text-[#17898A] font-semibold">
                  <Loader2 className="h-5 w-5 animate-spin text-[#17898A]" />
                  <span>AI is tailoring your follow-up study plan...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Sticky Follow-up Input Bar */}
        <div className="sticky bottom-0 mt-6 pt-3 bg-[#F4F6FA]/90 backdrop-blur-xs max-w-4xl w-full mx-auto">
          <form
            onSubmit={handleSendFollowUp}
            className="flex w-full items-center gap-2 rounded-[28px] border-[1.5px] border-[#17898A] bg-white px-4 py-2.5 shadow-md"
          >
            <textarea
              value={followUpInput}
              onChange={(e) => setFollowUpInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendFollowUp();
                }
              }}
              placeholder="Ask a follow-up question... (e.g. Can you make this plan 2 hours per day?)"
              className="min-w-0 flex-1 resize-none bg-transparent text-sm text-[#1D2B45] outline-none placeholder:text-gray-400 py-1"
              rows={1}
              disabled={isGenerating}
            />

            <button
              type="submit"
              disabled={!followUpInput.trim() || isGenerating}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#138D94] text-white hover:bg-[#10767c] transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  /* ========================================================================
   * SCREEN 1: STUDY PLANNER MAIN / GENERATION & HISTORY
   * ======================================================================== */
  return (
    <div className="flex flex-col w-full h-full max-w-[1600px] mx-auto pb-12">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1D2B45] md:text-3xl flex items-center gap-3">
          <CalendarDays className="h-7 w-7 text-[#17898A]" />
          AI Study Planner
        </h1>
        <p className="mt-1 text-sm text-[#68707C]">
          Get a personalized study plan powered by AI for your target exam.
        </p>
      </div>

      {/* Hero Card */}
      <div
        className="flex items-center gap-4 rounded-[24px] border border-[#A8D7D8] bg-gradient-to-br from-[#E9F7F7] to-white p-5 shadow-sm md:p-6 mb-6"
        style={{ background: "linear-gradient(135deg, #E9F7F7 0%, #FFFFFF 100%)" }}
      >
        <div className="hidden sm:flex h-24 w-24 shrink-0 items-center justify-center">
          <img
            src="/aibot.png"
            alt="AI Study Planner"
            className="h-full w-full object-contain"
          />
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <div>
            <h2 className="text-xl font-bold text-[#1D2B45] md:text-2xl">
              Your AI Study Planner
            </h2>
            <p className="mt-1 text-sm text-[#68707C]">
              Smart, personalized plans tailored to your exam goals
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#17898A]">
            <BadgeCheck className="h-4 w-4" />
            <span>AI Powered • Exam Focused</span>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium">{errorMessage}</p>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-xs font-bold hover:opacity-75 ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Create Study Plan Card */}
      <div className="rounded-[24px] border border-[#E1E5EA] bg-white p-5 md:p-6 shadow-sm mb-8">
        <h3 className="text-lg font-bold text-[#1D2B45] mb-2 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-[#17898A]" />
          Create Study Plan
        </h3>
        <p className="text-xs text-[#68707C] mb-4">
          Describe your exam, available hours, and preparation target. AI will structure daily tasks, mock tests, and revisions.
        </p>

        <textarea
          value={promptInput}
          onChange={(e) => setPromptInput(e.target.value)}
          placeholder="Describe your goal, e.g. 30-day plan for Indian Polity, 2 hours per day..."
          rows={3}
          disabled={isGenerating}
          className="w-full rounded-2xl border border-[#D1D5DB] p-4 text-sm text-[#1D2B45] outline-none focus:border-[#17898A] focus:ring-1 focus:ring-[#17898A] transition resize-none placeholder:text-gray-400 mb-3"
        />

        {/* Suggestion Chips */}
        <div className="mb-5">
          <p className="text-xs font-medium text-[#68707C] mb-2">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTION_CHIPS.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                disabled={isGenerating}
                onClick={() => {
                  setPromptInput(chip);
                  handleGeneratePlan(chip);
                }}
                className="rounded-full border border-[#B9DCDC] bg-[#E9F7F7] px-3.5 py-1.5 text-xs font-medium text-[#17898A] hover:bg-[#daf0f0] transition text-left"
              >
                + {chip}
              </button>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => handleGeneratePlan()}
            disabled={!promptInput.trim() || isGenerating}
            className="flex items-center gap-2 rounded-xl bg-[#138D94] hover:bg-[#10767c] px-6 py-3 text-sm font-semibold text-white shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating Study Plan...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate Study Plan
              </>
            )}
          </button>
        </div>
      </div>

      {/* Study Planner History Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-[#1D2B45] flex items-center gap-2">
            <Clock className="h-5 w-5 text-[#17898A]" />
            Study Planner History
          </h3>
          {historyList.length > 0 && (
            <button
              onClick={fetchHistory}
              className="text-xs font-semibold text-[#17898A] hover:underline flex items-center gap-1"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </button>
          )}
        </div>

        {historyLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-6 w-6 text-[#17898A] animate-spin" />
          </div>
        ) : historyList.length === 0 ? (
          <div className="rounded-[20px] border border-dashed border-[#C5D0DC] bg-[#F8FAFC] p-8 text-center">
            <CalendarDays className="h-10 w-10 text-gray-300 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-gray-600">
              No study plans created yet
            </h4>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
              Enter your target above to generate your first AI-powered revision and practice schedule.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {historyList.map((plan) => {
              const formattedDate = new Date(plan.createdAt).toLocaleDateString(
                "en-IN",
                {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                }
              );

              return (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setActivePlanId(plan.id)}
                  className="flex flex-col justify-between items-start rounded-[20px] border border-[#E1E5EA] bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-[#A8D7D8] group"
                >
                  <div className="w-full">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E9F7F7]">
                        <CalendarDays className="h-4 w-4 text-[#17898A]" />
                      </div>
                      <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                        {plan.status || "Active"}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-[#1D2B45] line-clamp-2 leading-snug group-hover:text-[#17898A] transition">
                      {plan.title}
                    </h4>

                    <p className="text-xs text-[#68707C] mt-2 flex items-center gap-1">
                      <span className="font-medium text-[#17898A]">
                        {plan.exam}
                      </span>
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between w-full border-t border-gray-100 pt-3 text-xs text-gray-500">
                    <span>
                      {formattedDate} • {plan.messageCount} messages
                    </span>
                    <ChevronRight className="h-4 w-4 text-[#17898A] group-hover:translate-x-1 transition" />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default StudyPlannerView;
