"use client";

import React, { useState, useEffect } from "react";
import api from "@/lib/api";
import {
  Sparkles,
  RefreshCw,
  Trash2,
  BookOpen,
  Clock,
  HelpCircle,
  Users,
  CheckCircle,
  Eye,
  X,
  Bot,
  Database,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface MockTest {
  id: string;
  realId: string;
  title: string;
  duration: string;
  questions: string;
  users: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  exam: string;
  type: string;
  description?: string;
  questionCount?: number;
}

interface Question {
  id: string;
  orderIndex: number;
  question: string;
  options: { id: string; text: string }[];
  correctAnswer: string;
  explanation?: string;
}

export default function AdminMockTestsPage() {
  const [tests, setTests] = useState<MockTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [isSeedModalOpen, setIsSeedModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [previewTest, setPreviewTest] = useState<{ test: MockTest; questions: Question[] } | null>(null);

  // Form for Seed options (Can use Ollama, Gemini, or OpenAI)
  const [seedConfig, setSeedConfig] = useState({
    useAI: true,
    provider: "ollama", // "ollama" | "gemini" | "openai"
    count: 5,
  });

  // Form for AI Generation
  const [aiForm, setAiForm] = useState({
    exam: "UPSC Civil Services",
    topic: "Indian Polity & Governance",
    difficulty: "MEDIUM",
    count: 15, // 5, 10, 15, 25, 50
    type: "mock",
    duration: "25 mins",
    provider: "gemini", // "gemini" | "ollama" | "openai"
  });

  const fetchTests = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/v1/tests");
      if (res.data?.success) {
        setTests(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load tests", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, []);

  const handleSeed = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      setSeeding(true);
      const res = await api.post("/api/v1/tests/seed", seedConfig);
      if (res.data?.success) {
        alert(res.data.message || "Tests seeded successfully!");
        setIsSeedModalOpen(false);
        await fetchTests();
      }
    } catch (err) {
      console.error("Seed error", err);
      alert("Failed to seed tests.");
    } finally {
      setSeeding(false);
    }
  };

  const handleGenerateAI = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setGenerating(true);
      const res = await api.post("/api/v1/tests/generate-ai", aiForm);
      if (res.data?.success) {
        const actual = res.data.provider || aiForm.provider.toUpperCase();
        const fallbackFrom = res.data.fallbackFrom;
        const qCount = res.data.data?.questions?.length || aiForm.count;

        let alertMsg = `Mock Test with ${qCount} MCQs generated successfully using ${actual}!`;
        if (fallbackFrom) {
          alertMsg += `\n\n⚠️ Notice: Requested '${fallbackFrom.toUpperCase()}' was unavailable (${res.data.fallbackReason || "Error 404/Connection"}), so it automatically fell back to ${actual}.`;
        }

        alert(alertMsg);
        setIsAiModalOpen(false);
        await fetchTests();
      }
    } catch (err: unknown) {
      console.error("AI Generation error", err);
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      alert(message || "Failed to generate test with AI.");
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this test?")) return;
    try {
      await api.delete(`/api/v1/tests/${id}`);
      setTests((prev) => prev.filter((t) => t.id !== id && t.realId !== id));
    } catch (err) {
      console.error("Delete error", err);
      alert("Failed to delete test.");
    }
  };

  const handlePreview = async (testId: string) => {
    try {
      const res = await api.get(`/api/v1/tests/${testId}`);
      if (res.data?.success) {
        setPreviewTest({
          test: res.data.data,
          questions: res.data.data.questionList || [],
        });
      }
    } catch (err) {
      console.error("Failed to fetch test questions", err);
      alert("Failed to load test details.");
    }
  };

  return (
    <div className="flex-1 p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-purple-600" />
            Mock Tests & Question Generator
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage mock test suite, seed default curriculum (using Ollama / Gemini), and generate up to 50 questions per test using Ollama, Gemini, or OpenAI.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setIsSeedModalOpen(true)}
            disabled={seeding}
            className="flex items-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <Database className="h-4 w-4 text-emerald-600" />
            <span>Seed Tests (Ollama / AI)</span>
          </Button>

          <Button
            onClick={() => setIsAiModalOpen(true)}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white shadow-sm"
          >
            <Bot className="h-4 w-4" />
            Generate with AI
          </Button>
        </div>
      </div>

      {/* Tests Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <RefreshCw className="h-8 w-8 text-purple-600 animate-spin" />
        </div>
      ) : tests.length === 0 ? (
        <div className="text-center py-16 bg-white border border-dashed rounded-xl">
          <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-gray-800">No mock tests found</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
            Click &quot;Seed Tests&quot; to populate tests with default or Ollama-generated MCQs, or generate a fresh test with AI.
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <Button onClick={() => setIsSeedModalOpen(true)} variant="outline">
              Seed Tests
            </Button>
            <Button onClick={() => setIsAiModalOpen(true)} className="bg-purple-600 hover:bg-purple-700 text-white">
              Generate AI Test
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {tests.map((test) => (
            <div
              key={test.id}
              className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      test.difficulty === "EASY"
                        ? "bg-green-100 text-green-700"
                        : test.difficulty === "HARD"
                        ? "bg-red-100 text-red-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {test.difficulty}
                  </span>
                  <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full uppercase">
                    {test.type}
                  </span>
                </div>

                <h3 className="font-semibold text-gray-900 mt-3 text-base line-clamp-2">
                  {test.title}
                </h3>
                <p className="text-xs text-gray-500 mt-1 font-medium">{test.exam}</p>

                <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t text-xs text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-gray-400" />
                    <span>{test.duration}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
                    <span>{test.questions}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-gray-400" />
                    <span>{test.users}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t flex items-center justify-between">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handlePreview(test.id)}
                  className="text-xs flex items-center gap-1.5 h-8 text-gray-700"
                >
                  <Eye className="h-3.5 w-3.5" />
                  View MCQs ({test.questions})
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(test.id)}
                  className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 h-8"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Seed Options Modal */}
      {isSeedModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setIsSeedModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                <Database className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Seed Mock Tests</h2>
                <p className="text-xs text-gray-500">Seed the 10 core tests with optional AI enrichment.</p>
              </div>
            </div>

            <form onSubmit={handleSeed} className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-xl border flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-gray-900 block">Use AI Generation</span>
                  <span className="text-[11px] text-gray-500 block">Generate fresh MCQs during seeding</span>
                </div>
                <input
                  type="checkbox"
                  checked={seedConfig.useAI}
                  onChange={(e) => setSeedConfig({ ...seedConfig, useAI: e.target.checked })}
                  className="h-4 w-4 rounded text-purple-600 cursor-pointer"
                />
              </div>

              {seedConfig.useAI && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Seed AI Provider</label>
                    <select
                      value={seedConfig.provider}
                      onChange={(e) => setSeedConfig({ ...seedConfig, provider: e.target.value })}
                      className="w-full text-sm border rounded-lg px-3 py-2 outline-none focus:border-purple-600"
                    >
                      <option value="ollama">Ollama (qwen2.5:7b / llama3)</option>
                      <option value="gemini">Google Gemini</option>
                      <option value="openai">OpenAI</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Questions per Seeded Test</label>
                    <select
                      value={seedConfig.count}
                      onChange={(e) => setSeedConfig({ ...seedConfig, count: Number(e.target.value) })}
                      className="w-full text-sm border rounded-lg px-3 py-2 outline-none focus:border-purple-600"
                    >
                      <option value={5}>5 Questions</option>
                      <option value={10}>10 Questions</option>
                      <option value={15}>15 Questions</option>
                      <option value={25}>25 Questions</option>
                      <option value={50}>50 Questions</option>
                    </select>
                  </div>
                </>
              )}

              <div className="pt-3 flex justify-end gap-2 border-t">
                <Button type="button" variant="outline" onClick={() => setIsSeedModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={seeding}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2"
                >
                  {seeding ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Seeding...
                    </>
                  ) : (
                    <>
                      <Database className="h-4 w-4" />
                      Start Seeding
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Generator Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setIsAiModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="h-10 w-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Generate Mock Test with AI</h2>
                <p className="text-xs text-gray-500">Generate 5, 10, 15, 25, or 50 questions using Gemini, Ollama, or OpenAI.</p>
              </div>
            </div>

            <form onSubmit={handleGenerateAI} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Target Exam</label>
                <select
                  value={aiForm.exam}
                  onChange={(e) => setAiForm({ ...aiForm, exam: e.target.value })}
                  className="w-full text-sm border rounded-lg px-3 py-2 bg-gray-50 focus:bg-white outline-none focus:border-purple-600"
                >
                  <option value="UPSC Civil Services">UPSC Civil Services</option>
                  <option value="SSC (CGL, CHSL, MTS)">SSC (CGL, CHSL, MTS)</option>
                  <option value="Banking (IBPS, SBI PO/Clerk)">Banking (IBPS, SBI PO/Clerk)</option>
                  <option value="Railways (RRB NTPC, Group D)">Railways (RRB NTPC, Group D)</option>
                  <option value="Defence (NDA, CDS, AFCAT)">Defence (NDA, CDS, AFCAT)</option>
                  <option value="State PSC">State PSC</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Subject / Specific Topic</label>
                <input
                  type="text"
                  required
                  value={aiForm.topic}
                  onChange={(e) => setAiForm({ ...aiForm, topic: e.target.value })}
                  placeholder="e.g. Modern Indian History or Quantitative Aptitude"
                  className="w-full text-sm border rounded-lg px-3 py-2 outline-none focus:border-purple-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Difficulty</label>
                  <select
                    value={aiForm.difficulty}
                    onChange={(e) => setAiForm({ ...aiForm, difficulty: e.target.value as "EASY" | "MEDIUM" | "HARD" })}
                    className="w-full text-sm border rounded-lg px-3 py-2 outline-none focus:border-purple-600"
                  >
                    <option value="EASY">EASY</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HARD">HARD</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Number of MCQs</label>
                  <select
                    value={aiForm.count}
                    onChange={(e) => setAiForm({ ...aiForm, count: Number(e.target.value) })}
                    className="w-full text-sm font-medium border rounded-lg px-3 py-2 outline-none focus:border-purple-600"
                  >
                    <option value={5}>5 Questions</option>
                    <option value={10}>10 Questions</option>
                    <option value={15}>15 Questions</option>
                    <option value={25}>25 Questions (Full Sectional)</option>
                    <option value={50}>50 Questions (Comprehensive)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">AI Model Engine</label>
                  <select
                    value={aiForm.provider}
                    onChange={(e) => setAiForm({ ...aiForm, provider: e.target.value })}
                    className="w-full text-sm border rounded-lg px-3 py-2 outline-none focus:border-purple-600"
                  >
                    <option value="gemini">Google Gemini (Recommended)</option>
                    <option value="ollama">Ollama (Local qwen2.5:7b / llama3)</option>
                    <option value="openai">OpenAI (ChatGPT)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Allocated Duration</label>
                  <input
                    type="text"
                    value={aiForm.duration}
                    onChange={(e) => setAiForm({ ...aiForm, duration: e.target.value })}
                    className="w-full text-sm border rounded-lg px-3 py-2 outline-none focus:border-purple-600"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t">
                <Button type="button" variant="outline" onClick={() => setIsAiModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={generating}
                  className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
                >
                  {generating ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Generating {aiForm.count} MCQs with {aiForm.provider.toUpperCase()}...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Generate Test ({aiForm.count} Qs)
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MCQ Preview Modal */}
      {previewTest && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col p-6 shadow-xl relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setPreviewTest(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="border-b pb-4">
              <h2 className="text-lg font-bold text-gray-900">{previewTest.test.title}</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {previewTest.test.exam} • {previewTest.questions.length} Questions • {previewTest.test.difficulty}
              </p>
            </div>

            <div className="overflow-y-auto py-4 space-y-5 flex-1 pr-2">
              {previewTest.questions.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-6">No questions found in this test.</p>
              ) : (
                previewTest.questions.map((q, idx) => (
                  <div key={q.id || idx} className="p-4 rounded-xl border bg-gray-50/60">
                    <p className="text-sm font-semibold text-gray-800">
                      Q{idx + 1}. {q.question}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                      {q.options?.map((opt) => {
                        const isCorrect = opt.id === q.correctAnswer;
                        return (
                          <div
                            key={opt.id}
                            className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
                              isCorrect
                                ? "bg-emerald-50 border-emerald-300 text-emerald-900 font-medium"
                                : "bg-white border-gray-200 text-gray-700"
                            }`}
                          >
                            <span>
                              <strong>{opt.id}.</strong> {opt.text}
                            </span>
                            {isCorrect && <CheckCircle className="h-3.5 w-3.5 text-emerald-600 shrink-0" />}
                          </div>
                        );
                      })}
                    </div>

                    {q.explanation && (
                      <div className="mt-3 pt-2.5 border-t border-dashed border-gray-200 text-xs text-gray-600">
                        <strong className="text-purple-700">Explanation: </strong>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t flex justify-end">
              <Button onClick={() => setPreviewTest(null)} variant="outline">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
