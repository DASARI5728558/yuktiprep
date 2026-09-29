"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Sparkles,
  ArrowLeft,
  Send,
  Loader2,
  Mic,
  Bot,
  User,
  BadgeCheck,
  RefreshCw,
} from "lucide-react";
import {

  askAiTutorApi,
  getAiTutorSessionDetailsApi,
} from "@/lib/study-plan-api";
import { Poppins } from "next/font/google";
import { MarkdownRender } from "@/components/markdown-render";



const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

interface TutorMessage {
  role: "user" | "assistant";
  content: string;
}

function ChatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPrompt = searchParams.get("prompt") || "";
  const initialSessionId = searchParams.get("sessionId") || null;

  const [currentSessionId, setCurrentSessionId] = useState<string | null>(initialSessionId);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<TutorMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionTitle, setSessionTitle] = useState<string>("Yuktiprep AI Tutor");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const conversationEndRef = useRef<HTMLDivElement>(null);
  const hasTriggeredRef = useRef(false);

  // Auto-scroll when messages update
  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Focus the input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Load existing session history if sessionId is in URL
  useEffect(() => {
    if (initialSessionId) {
      setIsLoading(true);
      getAiTutorSessionDetailsApi(initialSessionId)
        .then((res) => {
          if (res?.success && res.data) {
            setSessionTitle(res.data.title || "Yuktiprep AI Tutor");
            setMessages(
              res.data.messages.map((m) => ({
                role: m.role as "user" | "assistant",
                content: m.content,
              }))
            );
          }
        })
        .catch((err) => {
          console.warn("Failed to load session details:", err);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [initialSessionId]);

  const handleSend = async (overrideText?: string) => {
    const text = (overrideText ?? inputValue).trim();
    if (!text || isLoading) return;

    const newMessages: TutorMessage[] = [
      ...messages,
      { role: "user", content: text },
    ];
    setMessages(newMessages);
    setInputValue("");
    setIsLoading(true);

    try {
      const historyPayload = newMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await askAiTutorApi(text, historyPayload, currentSessionId);
      if (res && res.success && res.message) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: res.message },
        ]);
        if (res.sessionId && res.sessionId !== currentSessionId) {
          setCurrentSessionId(res.sessionId);
        }
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              res?.message ||
              "Sorry, I could not generate a response right now. Please try again.",
          },
        ]);
      }
    } catch (err: any) {
      console.error("AI Tutor Chat Error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "An error occurred while communicating with the AI Tutor. Please check your connection and try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // If initialPrompt exists and user clicked submit from the previous page, trigger it immediately
  useEffect(() => {
    if (initialPrompt && !hasTriggeredRef.current && !initialSessionId) {
      hasTriggeredRef.current = true;
      handleSend(initialPrompt);
    }
  }, [initialPrompt, initialSessionId]);


  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };


  return (
    <div
      className={`${poppins.variable} flex flex-col flex-1 h-[calc(100vh-2rem)] w-full overflow-hidden rounded-tl-2xl border border-neutral-200 bg-[#F4F6FA] font-poppins`}
    >
      {/* Top Navigation Header */}
      <header className="flex shrink-0 items-center justify-between border-b border-neutral-200 bg-white px-4 py-3 md:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/ai-tutor")}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-neutral-50 text-neutral-600 transition-colors hover:bg-neutral-100 cursor-pointer"
            title="Back to AI Tutor"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[#1D2B45] md:text-lg truncate max-w-xs sm:max-w-md">
                {sessionTitle}
              </h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#E9F7F7] px-2 py-0.5 text-[11px] font-semibold text-[#17898A]">
                <BadgeCheck className="h-3 w-3" />
                Exam Focused
              </span>
            </div>
            <p className="text-xs text-[#68707C]">
              Step-by-step explanations, tests, shortcuts, and concept revisions
            </p>
          </div>


        </div>

        {messages.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setMessages([]);
              setInputValue("");
            }}
            className="flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-50 transition-colors cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">New Query</span>
          </button>
        )}
      </header>

      {/* Main Conversation Stream */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center p-6 max-w-lg mx-auto">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#E9F7F7] to-[#C9ECEE] text-[#17898A] shadow-sm mb-4">
              <Sparkles className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-[#1D2B45]">
              Ready to help you prepare
            </h3>
            <p className="mt-1 text-sm text-[#68707C]">
              Your prompt has been placed into the input below. Review or edit it,
              then click the Submit button to ask AI Tutor.
            </p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3.5 rounded-[22px] p-4 md:p-5 shadow-xs transition-all ${msg.role === "user"
                    ? "ml-auto max-w-[85%] border border-[#A8D7D8] bg-[#E9F7F7]"
                    : "max-w-full border border-[#E1E5EA] bg-white"
                  }`}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white shadow-xs">
                  {msg.role === "user" ? (
                    <User className="h-4.5 w-4.5 text-[#17898A]" />
                  ) : (
                    <Bot className="h-4.5 w-4.5 text-[#17898A]" />
                  )}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-xs font-semibold text-[#17898A] mb-1">
                    {msg.role === "user" ? "You" : "Yuktiprep AI"}
                  </p>
                  {msg.role === "user" ? (

                    <p className="text-sm font-medium text-[#1D2B45] whitespace-pre-wrap leading-relaxed">
                      {msg.content}
                    </p>
                  ) : (
                    <MarkdownRender content={msg.content} />
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-3 rounded-[20px] border border-[#E1E5EA] bg-white p-4 text-[#68707C] max-w-4xl mx-auto">
                <Loader2 className="h-5 w-5 animate-spin text-[#17898A]" />
                <span className="text-sm">
                  Yuktiprep AI is thinking and crafting your answer...
                </span>
              </div>
            )}


            <div ref={conversationEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <footer className="shrink-0 border-t border-neutral-200 bg-white p-4">
        <div className="max-w-4xl mx-auto">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex w-full items-center gap-2 rounded-[28px] border-[1.5px] border-[#17898A] bg-white px-3 py-2.5 md:px-4 shadow-sm focus-within:ring-2 focus-within:ring-[#17898A]/30 transition-all"
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
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about questions, concepts, shortcuts, strategies..."
              className="overflow-hidden min-w-0 flex-1 resize-none bg-transparent text-sm text-[#1D2B45] outline-none"
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
              disabled={isLoading || !inputValue.trim()}
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
        </div>
      </footer>
    </div>
  );
}

export const AITutorChatView = () => {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#17898A]" />
        </div>
      }
    >
      <ChatContent />
    </Suspense>
  );
};
