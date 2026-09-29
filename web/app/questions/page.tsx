"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  HelpCircle,
  Search,
  CheckCircle2,
  XCircle,
  BookOpen,
  Sparkles,
  ArrowLeft,
  Calendar,
  Layers,
  ChevronRight,
  FileText
} from "lucide-react";

interface Option {
  id: string;
  key: string;
  text: string;
  isCorrect?: boolean;
}

interface PublishedQuestion {
  id: string;
  questionText: string;
  questionType: string;
  options: Option[];
  correctAnswer: string;
  explanation: string;
  passage?: string;
  bloomLevel?: string;
  difficulty?: string;
  sourceName?: string;
  sourceYear?: number;
  exam?: { name: string };
  subject?: { name: string };
  topic?: { name: string };
}

interface PaperGroup {
  sourceName: string;
  sourceYear?: number;
  examName: string;
  questionCount: number;
  questions: PublishedQuestion[];
}

export default function QuestionBankPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<PublishedQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [selectedBloom, setSelectedBloom] = useState("");
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [revealedExplanations, setRevealedExplanations] = useState<Record<string, boolean>>({});

  // Active Paper View: null = Exam Cards List; string = viewing specific exam questions
  const [activePaperKey, setActivePaperKey] = useState<string | null>(null);

  useEffect(() => {
    fetchQuestions();
  }, [selectedDifficulty, selectedBloom]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const params = new URLSearchParams();
      if (selectedDifficulty) params.append("difficulty", selectedDifficulty);
      if (selectedBloom) params.append("bloomLevel", selectedBloom);
      if (search.trim()) params.append("search", search.trim());
      params.append("limit", "100");

      const res = await fetch(`${baseUrl}/api/v1/questions?${params.toString()}`);
      const data = await res.json();
      if (data.success && data.data) {
        setQuestions(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Group questions by Exam / Paper Title (sourceName + sourceYear)
  const paperGroups: PaperGroup[] = useMemo(() => {
    const map = new Map<string, PaperGroup>();

    for (const q of questions) {
      const title = q.sourceName || q.exam?.name || "Exam Question Paper";
      const year = q.sourceYear || 2026;
      const key = `${title}-${year}`;

      if (!map.has(key)) {
        map.set(key, {
          sourceName: title,
          sourceYear: year,
          examName: q.exam?.name || "General Exam",
          questionCount: 0,
          questions: [],
        });
      }

      const group = map.get(key)!;
      group.questionCount++;
      group.questions.push(q);
    }

    return Array.from(map.values());
  }, [questions]);

  const activeGroup = useMemo(() => {
    if (!activePaperKey) return null;
    return paperGroups.find((g) => `${g.sourceName}-${g.sourceYear}` === activePaperKey) || null;
  }, [activePaperKey, paperGroups]);

  const handleSelectOption = (questionId: string, optionKey: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionKey }));
    setRevealedExplanations((prev) => ({ ...prev, [questionId]: true }));
  };

  const handleToggleExplanation = (questionId: string) => {
    setRevealedExplanations((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  return (
    <div className="min-h-screen min-w-[100vw] bg-[#F4F6FA] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      {/* Top Navigation & Dynamic Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            if (activePaperKey) {
              setActivePaperKey(null);
            } else {
              router.push("/");
            }
          }}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 shadow-xs transition"
        >
          <ArrowLeft className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
          <span>{activePaperKey ? "Back to Exam Papers" : "Back to Dashboard"}</span>
        </button>

        <span className="text-xs font-medium text-zinc-500 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-1 rounded-full shadow-2xs">
          {activeGroup
            ? `Paper Questions: ${activeGroup.questions.length}`
            : `Total Papers: ${paperGroups.length} (${questions.length} Questions)`}
        </span>
      </div>

      {/* Hero Banner (YuktiPrep Brand Identity) */}
      <div className="bg-gradient-to-r from-[#19315D] to-[#254A8A] text-white rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-sm">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-teal-200 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            YuktiPrep Question Intelligence Bank
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            {activeGroup ? activeGroup.sourceName : "Academic Question Bank"}
          </h1>
          <p className="text-sm text-zinc-200">
            {activeGroup
              ? `Practicing official questions for ${activeGroup.sourceName} (${activeGroup.sourceYear}). Click any option to verify answers.`
              : "Select an official exam card below to practice verified questions with sub-statements, derivations, and Bloom cognitive classifications."}
          </p>
        </div>
      </div>

      {/* VIEW 1: EXAM TITLE CARDS GRID (When no exam paper is clicked) */}
      {!activePaperKey && (
        <div className="space-y-4 ">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#1D2B45] dark:text-white">
              Available Exam Papers
            </h2>
            <span className="text-xs text-zinc-500">
              Click an exam title card to view and practice its questions
            </span>
          </div>

          <div className="max-w-[50vw] grid grid-cols-1 md:grid-cols-2 gap-4">
            {paperGroups.map((paper, idx) => {
              const paperKey = `${paper.sourceName}-${paper.sourceYear}`;
              return (
                <div
                  key={idx}
                  onClick={() => setActivePaperKey(paperKey)}
                  className="group bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-xs hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between gap-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 font-bold">
                        {paper.examName}
                      </span>
                      {paper.sourceYear && (
                        <span className="flex items-center gap-1 text-zinc-500 font-mono text-xs">
                          <Calendar className="w-3.5 h-3.5" />
                          {paper.sourceYear}
                        </span>
                      )}
                    </div>

                    {/* Card Title */}
                    <div>
                      <h3 className="text-base font-bold text-[#1D2B45] dark:text-white group-hover:text-amber-600 transition flex items-center justify-between">
                        <span>{paper.sourceName}</span>
                        <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-amber-600 group-hover:translate-x-1 transition" />
                      </h3>
                      <p className="text-xs text-zinc-500 mt-1">
                        Click card to view questions • {paper.questionCount} Questions Available
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                    <span className="text-zinc-500 flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-zinc-400" />
                      Full Exam Paper Set
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActivePaperKey(paperKey);
                      }}
                      className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-semibold rounded-lg text-xs transition shadow-xs"
                    >
                      Open Questions ({paper.questionCount})
                    </button>
                  </div>
                </div>
              );
            })}

            {paperGroups.length === 0 && !loading && (
              <div className="col-span-2 text-center py-16 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-zinc-400 space-y-2">
                <FileText className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="font-semibold text-sm">No exam question papers found.</p>
                <p className="text-xs">Publish draft questions from the Admin Question Intelligence pipeline to view them here.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: QUESTIONS LIST (When an exam card is clicked) */}
      {activeGroup && (
        <div className="space-y-6">
          {/* Filter & Search Bar */}
          <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search within this exam paper..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchQuestions()}
                className="w-full pl-9 pr-4 py-2 text-sm bg-zinc-50 dark:bg-zinc-800/60 rounded-lg border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 outline-none focus:ring-2 focus:ring-amber-500 font-medium"
              >
                <option value="">All Difficulties</option>
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>

              <select
                value={selectedBloom}
                onChange={(e) => setSelectedBloom(e.target.value)}
                className="px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 outline-none focus:ring-2 focus:ring-amber-500 font-medium"
              >
                <option value="">All Bloom Levels</option>
                <option value="REMEMBER">Remember</option>
                <option value="UNDERSTAND">Understand</option>
                <option value="APPLY">Apply</option>
                <option value="ANALYZE">Analyze</option>
                <option value="EVALUATE">Evaluate</option>
              </select>

              <button
                onClick={() => fetchQuestions()}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-semibold text-xs rounded-lg shadow-xs transition"
              >
                Filter
              </button>
            </div>
          </div>

          {/* Render Active Group Questions */}
          <div className="space-y-6">
            {activeGroup.questions.map((q, idx) => {
              const userChoice = selectedAnswers[q.id];
              const isAnswered = Boolean(userChoice);
              const isExplanationOpen = revealedExplanations[q.id];

              return (
                <div
                  key={q.id}
                  className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-xs space-y-4 transition hover:border-zinc-300 dark:hover:border-zinc-700"
                >
                  {/* Question Metadata Pill Tagline */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-amber-600 dark:text-amber-400">
                        Question {idx + 1}
                      </span>
                      {q.sourceName && (
                        <span className="bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-[11px] font-medium text-zinc-700 dark:text-zinc-300">
                          {q.sourceName} {q.sourceYear ? `(${q.sourceYear})` : ""}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {q.bloomLevel && (
                        <span className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                          {q.bloomLevel}
                        </span>
                      )}
                      {q.difficulty && (
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${q.difficulty === "HARD"
                            ? "bg-red-50 dark:bg-red-950/40 text-red-600 border border-red-200 dark:border-red-800"
                            : q.difficulty === "MEDIUM"
                              ? "bg-amber-50 dark:bg-amber-950/40 text-amber-600 border border-amber-200 dark:border-amber-800"
                              : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-200 dark:border-emerald-800"
                            }`}
                        >
                          {q.difficulty}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Passage if present */}
                  {q.passage && (
                    <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl text-xs italic text-zinc-600 dark:text-zinc-400 border-l-4 border-amber-500">
                      {q.passage}
                    </div>
                  )}

                  {/* Question Text with Sub-statements */}
                  <div className="text-sm md:text-base font-medium leading-relaxed whitespace-pre-wrap text-zinc-800 dark:text-zinc-100">
                    {q.questionText}
                  </div>

                  {/* Options */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    {(q.options || []).map((opt) => {
                      const isSelected = userChoice === opt.key;
                      const isCorrect = opt.key === q.correctAnswer;

                      let styleClass =
                        "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/30";

                      if (isAnswered) {
                        if (isCorrect) {
                          styleClass =
                            "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold";
                        } else if (isSelected && !isCorrect) {
                          styleClass =
                            "border-red-500 bg-red-500/10 text-red-700 dark:text-red-300";
                        }
                      }

                      return (
                        <button
                          key={opt.id || opt.key}
                          onClick={() => handleSelectOption(q.id, opt.key)}
                          className={`p-3 rounded-lg border text-left text-sm transition flex items-center justify-between ${styleClass}`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-white dark:bg-zinc-900 border border-inherit flex items-center justify-center text-xs font-bold shadow-xs">
                              {opt.key}
                            </span>
                            <span>{opt.text}</span>
                          </div>
                          {isAnswered && isCorrect && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          )}
                          {isAnswered && isSelected && !isCorrect && (
                            <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Bottom Actions: Explanation Toggle */}
                  <div className="pt-2 flex items-center justify-between">
                    <button
                      onClick={() => handleToggleExplanation(q.id)}
                      className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      {isExplanationOpen ? "Hide Explanation" : "View Explanation & Derivation"}
                    </button>

                    {isAnswered && (
                      <span className="text-xs text-zinc-500">
                        Correct Answer: <strong className="text-emerald-600 font-bold">{q.correctAnswer}</strong>
                      </span>
                    )}
                  </div>

                  {/* Explanation Box */}
                  {isExplanationOpen && (
                    <div className="p-4 bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs space-y-1">
                      <span className="font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block text-[10px]">
                        Academic Derivation & Basis
                      </span>
                      <p className="leading-relaxed text-zinc-700 dark:text-zinc-300">
                        {q.explanation || "No explanation provided."}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
