"use client";

import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { api } from "@/lib/api";
import {
  Sparkles,
  UploadCloud,
  Globe,
  FileText,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Send,
  Eye,
  Layers,
  ChevronRight,
  Clock,
  BookOpen,
  Filter,
  Trash2,
  FileCode,
  Copy,
  Check,
  Terminal,
  X,
  Edit3,
  EyeOff,
  Power,
  MoreVertical,
} from "lucide-react";

interface Exam {
  id: string;
  name: string;
}

interface IngestionSource {
  id: string;
  name: string;
  sourceType: "FILE_UPLOAD" | "REMOTE_URL";
  sourceUrl?: string;
  authority: string;
  rights: string;
  checksum: string;
  extractedText?: string;
  markdownContent?: string;
  status: string;
  createdAt: string;
  exam?: { name: string };
  _count?: { drafts: number; jobs: number };
  publishedCount?: number;
  activeCount?: number;
  isLiveOnWeb?: boolean;
}

interface QuestionDraft {
  id: string;
  sourceId: string;
  itemKey: string;
  pageNumber?: number;
  questionText: string;
  questionType: string;
  options?: Array<{ id: string; key: string; text: string; isCorrect: boolean }>;
  correctAnswer?: string;
  answerBasis?: string;
  passage?: string;
  academicClassification?: any;
  confidenceScores?: any;
  duplicateStatus: string;
  reviewStatus: string;
  version: number;
}

export default function IntelligencePage() {
  const [activeTab, setActiveTab] = useState<"sources" | "review" | "markdown">("sources");
  const [sources, setSources] = useState<IngestionSource[]>([]);
  const [drafts, setDrafts] = useState<QuestionDraft[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Ingestion Form State
  const [ingestionMode, setIngestionMode] = useState<"file" | "url">("file");
  const [sourceName, setSourceName] = useState("");
  const [authority, setAuthority] = useState("UPSC");
  const [rights, setRights] = useState("Public Domain");
  const [selectedExamId, setSelectedExamId] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Draft Review & Provenance Workspace State
  const [selectedDraft, setSelectedDraft] = useState<QuestionDraft | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  // Markdown Document Preview State
  const [selectedSourceForMarkdown, setSelectedSourceForMarkdown] = useState<IngestionSource | null>(null);
  const [isSourceMdLoading, setIsSourceMdLoading] = useState(false);
  const [copiedMd, setCopiedMd] = useState(false);
  const [reprocessingIds, setReprocessingIds] = useState<Record<string, boolean>>({});
  const [isAiCorrecting, setIsAiCorrecting] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [isSavingDrafts, setIsSavingDrafts] = useState(false);
  const [isApprovingSource, setIsApprovingSource] = useState(false);
  const [isTogglingLive, setIsTogglingLive] = useState<Record<string, boolean>>({});
  const [mdViewMode, setMdViewMode] = useState<"preview" | "edit">("preview");
  const [openMenuSourceId, setOpenMenuSourceId] = useState<string | null>(null);
  const [isMdMoreOpen, setIsMdMoreOpen] = useState(false);

  // Function to load / reload source data and markdown on demand
  const loadSourceMarkdown = async (sourceId: string) => {
    setIsSourceMdLoading(true);
    try {
      const res: any = await api.get(`/api/v1/admin/intelligence/sources/${sourceId}`);
      if (res.data?.data) {
        setSelectedSourceForMarkdown(res.data.data);
        // Also update the source in the sources list
        setSources((prev) =>
          prev.map((s) => (s.id === sourceId ? { ...s, ...res.data.data } : s))
        );
      }
    } catch (e: any) {
      console.error("Failed to load source markdown:", e);
      setError(e?.response?.data?.message || "Failed to load document markdown");
    } finally {
      setIsSourceMdLoading(false);
    }
  };

  // Close 3-dots dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = () => {
      setOpenMenuSourceId(null);
      setIsMdMoreOpen(false);
    };
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  // Live Extraction Logs Modal State
  const [logsModalSource, setLogsModalSource] = useState<IngestionSource | null>(null);
  const [logsModalJobs, setLogsModalJobs] = useState<any[]>([]);
  const [isLogsLoading, setIsLogsLoading] = useState(false);

  const openLogsModal = async (source: IngestionSource) => {
    setLogsModalSource(source);
    setIsLogsLoading(true);
    try {
      const res: any = await api.get(`/api/v1/admin/intelligence/sources/${source.id}`);
      if (res.data?.data?.jobs) {
        setLogsModalJobs(res.data.data.jobs);
      }
    } catch (e) {
      console.error("Failed to load logs:", e);
    } finally {
      setIsLogsLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
    fetchSources();
    fetchDrafts();
  }, []);

  const fetchExams = async () => {
    try {
      const res: any = await api.get("/api/v1/admin/exams");
      if (res.data?.data) {
        setExams(res.data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSources = async () => {
    try {
      setLoading(true);
      const res: any = await api.get("/api/v1/admin/intelligence/sources");
      if (res.data?.data) {
        setSources(res.data.data);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load sources");
    } finally {
      setLoading(false);
    }
  };

  const fetchDrafts = async (sourceId?: string) => {
    try {
      const endpoint = sourceId
        ? `/api/v1/admin/intelligence/drafts?sourceId=${sourceId}`
        : "/api/v1/admin/intelligence/drafts";
      const res: any = await api.get(endpoint);
      if (res.data?.data) {
        setDrafts(res.data.data);
        if (res.data.data.length > 0 && !selectedDraft) {
          setSelectedDraft(res.data.data[0]);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const [layoutType, setLayoutType] = useState<string>("ENGLISH_ONLY");

  const handleRegisterSource = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    try {
      if (ingestionMode === "file") {
        if (!selectedFile) {
          setError("Please select a PDF document file to upload.");
          setIsSubmitting(false);
          return;
        }

        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("name", sourceName);
        formData.append("authority", authority);
        formData.append("rights", rights);
        formData.append("layoutType", layoutType);
        if (selectedExamId) formData.append("examId", selectedExamId);

        await api.post("/api/v1/admin/intelligence/sources/register-file", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        if (!sourceUrl.trim()) {
          setError("Please provide a valid remote PDF URL.");
          setIsSubmitting(false);
          return;
        }

        await api.post("/api/v1/admin/intelligence/sources/register-url", {
          name: sourceName,
          sourceUrl: sourceUrl.trim(),
          authority,
          rights,
          layoutType,
          examId: selectedExamId || undefined,
        });
      }

      setSuccessMsg("Document source registered! Processing & extraction pipeline started.");
      setSourceName("");
      setSourceUrl("");
      setSelectedFile(null);
      fetchSources();
      fetchDrafts();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to register document source.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublishDraft = async (draftId: string) => {
    try {
      setIsPublishing(true);
      await api.post(`/api/v1/admin/intelligence/drafts/${draftId}/publish`);
      setSuccessMsg("Question published directly into YuktiPrep Question Bank projection!");
      fetchDrafts();
      if (selectedDraft?.id === draftId) {
        setSelectedDraft((prev) => (prev ? { ...prev, reviewStatus: "ACCEPTED" } : null));
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to publish question draft.");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleReprocessSource = async (sourceId: string) => {
    try {
      setReprocessingIds((prev) => ({ ...prev, [sourceId]: true }));
      setSuccessMsg("Extraction & Markdown generation started...");

      await api.post(`/api/v1/admin/intelligence/sources/${sourceId}/reprocess`);

      // Poll source status to auto-refresh UI once extraction completes
      let attempts = 0;
      const pollInterval = setInterval(async () => {
        attempts++;
        try {
          const res: any = await api.get(`/api/v1/admin/intelligence/sources/${sourceId}`);
          const updated = res.data?.data;

          if (updated && (updated.status === "EXTRACTED" || updated.status === "FAILED" || attempts > 15)) {
            clearInterval(pollInterval);
            setReprocessingIds((prev) => ({ ...prev, [sourceId]: false }));
            setSuccessMsg(
              updated.status === "EXTRACTED"
                ? "Document extracted & Markdown generated successfully!"
                : "Extraction finished with warnings."
            );
            fetchSources();
            fetchDrafts();

            // Refresh markdown viewer if currently viewing this source
            setSelectedSourceForMarkdown((current) => {
              if (current && current.id === sourceId) {
                return updated;
              }
              return current;
            });
          }
        } catch (e) {
          if (attempts > 15) {
            clearInterval(pollInterval);
            setReprocessingIds((prev) => ({ ...prev, [sourceId]: false }));
          }
        }
      }, 2000);
    } catch (err: any) {
      setReprocessingIds((prev) => ({ ...prev, [sourceId]: false }));
      setError(err?.response?.data?.message || "Reprocessing failed.");
    }
  };

  const handleAiCorrectMarkdown = async () => {
    if (!selectedSourceForMarkdown) return;
    try {
      setIsAiCorrecting(true);
      setError(null);
      setSuccessMsg("AI is analyzing and correcting questions, statements, and options...");

      // If user highlighted/dragged specific text, send that. Otherwise send full markdown/extracted content.
      const textToCorrect = selectedText.trim() || selectedSourceForMarkdown.markdownContent || selectedSourceForMarkdown.extractedText || "";

      if (!textToCorrect) {
        setError("No text available to correct.");
        setIsAiCorrecting(false);
        return;
      }

      const res: any = await api.post("/api/v1/admin/intelligence/markdown/ai-correct", {
        text: textToCorrect,
        sourceId: selectedSourceForMarkdown.id,
      });

      const corrected = res.data?.data?.correctedText;
      if (corrected) {
        setSelectedSourceForMarkdown((prev) => (prev ? { ...prev, markdownContent: corrected } : null));
        setSuccessMsg("Question text & options successfully corrected and formatted by AI!");
        fetchSources();
      }
    } catch (err: any) {
      console.error("AI correction failed:", err);
      setError(err?.response?.data?.message || "Failed to correct question text with AI.");
    } finally {
      setIsAiCorrecting(false);
      setSelectedText("");
    }
  };

  const handleSaveMarkdownToDrafts = async () => {
    if (!selectedSourceForMarkdown) return;
    try {
      setIsSavingDrafts(true);
      setError(null);
      const res: any = await api.post("/api/v1/admin/intelligence/markdown/save-drafts", {
        sourceId: selectedSourceForMarkdown.id,
        markdownContent: selectedSourceForMarkdown.markdownContent,
      });
      const count = res.data?.data?.draftsCount || 0;
      setSuccessMsg(`Successfully saved ${count} questions to Candidate Drafts!`);
      fetchSources();
      fetchDrafts(selectedSourceForMarkdown.id);
    } catch (err: any) {
      console.error("Failed to save to drafts:", err);
      setError(err?.response?.data?.message || "Failed to save markdown to drafts.");
    } finally {
      setIsSavingDrafts(false);
    }
  };

  const handleApproveAndPublishAllSource = async () => {
    if (!selectedSourceForMarkdown) return;
    const confirmMsg = `Are you sure you want to approve all extracted questions for "${selectedSourceForMarkdown.name}" and publish them to the Learner PYQ Analyzer?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      setIsApprovingSource(true);
      setError(null);

      // 1. First ensure latest markdown is synchronized to drafts
      if (selectedSourceForMarkdown.markdownContent) {
        await api.post("/api/v1/admin/intelligence/markdown/save-drafts", {
          sourceId: selectedSourceForMarkdown.id,
          markdownContent: selectedSourceForMarkdown.markdownContent,
        });
      }

      // 2. Approve and publish all drafts into PublishedQuestions & Learner PYQ Analyzer
      const res: any = await api.post(`/api/v1/admin/intelligence/sources/${selectedSourceForMarkdown.id}/approve-all`);
      const publishedCount = res.data?.data?.publishedCount || 0;
      setSuccessMsg(`Approved and published ${publishedCount} questions to PYQ Analyzer & Question Bank! (Live on /web)`);

      // Update local state immediately
      setSelectedSourceForMarkdown((prev) =>
        prev
          ? {
            ...prev,
            publishedCount,
            activeCount: publishedCount,
            isLiveOnWeb: true,
          }
          : null
      );
      fetchSources();
      fetchDrafts(selectedSourceForMarkdown.id);
    } catch (err: any) {
      console.error("Failed to approve and publish source:", err);
      setError(err?.response?.data?.message || "Failed to approve and publish questions.");
    } finally {
      setIsApprovingSource(false);
    }
  };

  const handleToggleSourceLiveStatus = async (sourceId: string, currentIsActive: boolean) => {
    try {
      setIsTogglingLive((prev) => ({ ...prev, [sourceId]: true }));
      setError(null);
      const nextState = !currentIsActive;
      const res: any = await api.patch(`/api/v1/admin/intelligence/sources/${sourceId}/toggle-live`, {
        active: nextState,
      });

      const msg = res.data?.message || `Source ${nextState ? "activated" : "deactivated"} on /web`;
      setSuccessMsg(msg);

      // Update selected source if open
      setSelectedSourceForMarkdown((prev) => {
        if (prev && prev.id === sourceId) {
          return {
            ...prev,
            isLiveOnWeb: nextState,
            activeCount: nextState ? (prev.publishedCount || prev._count?.drafts || 1) : 0,
          };
        }
        return prev;
      });

      fetchSources();
    } catch (err: any) {
      console.error("Failed to toggle source live status:", err);
      setError(err?.response?.data?.message || "Failed to toggle active/deactive status.");
    } finally {
      setIsTogglingLive((prev) => ({ ...prev, [sourceId]: false }));
    }
  };

  const handleDeleteSource = async (sourceId: string, sourceName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${sourceName}"? All extracted candidate drafts will also be removed.`)) {
      return;
    }

    try {
      await api.delete(`/api/v1/admin/intelligence/sources/${sourceId}`);
      setSuccessMsg(`Source "${sourceName}" deleted successfully.`);
      fetchSources();
      fetchDrafts();
      if (selectedDraft?.sourceId === sourceId) {
        setSelectedDraft(null);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to delete source.");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-500/10 text-amber-600 rounded-lg">
              <Sparkles className="h-5 w-5" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Question Intelligence Pipeline
            </h1>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Automated PDF extraction, layout reconstruction, Bloom taxonomy classification, deduplication & transactional publishing.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-zinc-100 dark:bg-zinc-800/60 p-1 rounded-lg border border-zinc-200 dark:border-zinc-700">
          <button
            onClick={() => setActiveTab("sources")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === "sources"
              ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
              }`}
          >
            <Layers className="h-4 w-4" />
            Sources & Ingestion
          </button>
          {/* <button
            onClick={() => setActiveTab("review")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === "review"
                ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
            }`}
          >
            <Eye className="h-4 w-4" />
            Provenance & Review ({drafts.length})
          </button> */}
          <button
            onClick={async () => {
              setActiveTab("markdown");
              // Refresh sources list from server
              try {
                setLoading(true);
                const res: any = await api.get("/api/v1/admin/intelligence/sources");
                if (res.data?.data) {
                  setSources(res.data.data);
                  // Load the full markdown data for current or first source
                  const targetSource = selectedSourceForMarkdown
                    ? res.data.data.find((s: IngestionSource) => s.id === selectedSourceForMarkdown.id) || res.data.data[0]
                    : res.data.data[0];
                  if (targetSource) {
                    await loadSourceMarkdown(targetSource.id);
                  }
                }
              } catch (err: any) {
                console.error("Failed to reload sources for markdown:", err);
              } finally {
                setLoading(false);
              }
            }}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === "markdown"
              ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
              }`}
          >
            <FileCode className="h-4 w-4" />
            <span>Document Markdown</span>
            {isSourceMdLoading && <RotateCw className="h-3.5 w-3.5 animate-spin text-amber-500" />}
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-600 rounded-lg text-sm flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto font-bold">&times;</button>
        </div>
      )}
      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-lg text-sm flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg(null)} className="ml-auto font-bold">&times;</button>
        </div>
      )}

      {/* TAB 1: SOURCES & INGESTION */}
      {activeTab === "sources" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Registration Form */}
          <div className="lg:col-span-1 bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
              Register Document Source
            </h2>
            <p className="text-xs text-zinc-500">
              Ingest exam question papers via binary PDF file upload or direct remote PDF URL.
            </p>

            {/* Ingestion Mode Picker */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
              <button
                type="button"
                onClick={() => setIngestionMode("file")}
                className={`py-1.5 text-xs font-semibold rounded-md flex items-center justify-center gap-2 ${ingestionMode === "file"
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm"
                  : "text-zinc-500 hover:text-zinc-900"
                  }`}
              >
                <UploadCloud className="h-3.5 w-3.5" />
                Upload PDF File
              </button>
              <button
                type="button"
                onClick={() => setIngestionMode("url")}
                className={`py-1.5 text-xs font-semibold rounded-md flex items-center justify-center gap-2 ${ingestionMode === "url"
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm"
                  : "text-zinc-500 hover:text-zinc-900"
                  }`}
              >
                <Globe className="h-3.5 w-3.5" />
                Remote PDF URL
              </button>
            </div>

            {/* Layout Parser Mode Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Extraction Layout Mode
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "ENGLISH_ONLY", label: "English Only", desc: "Standard 1/2 Column" },
                  { id: "BILINGUAL_COLUMNS", label: "Left & Right", desc: "Left English / Right Hindi" },
                  { id: "BILINGUAL_STACKED", label: "Upside & Downside", desc: "Top English / Bottom Hindi" },
                  { id: "BILINGUAL_PAGES", label: "Front & Back Page", desc: "Odd English / Even Hindi" }
                ].map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setLayoutType(mode.id)}
                    className={`p-2 text-left rounded-lg border text-xs transition-all ${
                      layoutType === mode.id
                        ? "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold"
                        : "border-zinc-200 dark:border-zinc-800 text-zinc-600 hover:border-zinc-400 dark:text-zinc-400"
                    }`}
                  >
                    <div className="font-medium text-[11px]">{mode.label}</div>
                    <div className="text-[9px] opacity-75 text-zinc-500">{mode.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleRegisterSource} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Source Title / Paper Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., UPSC Prelims 2024 - GS Paper 1"
                  value={sourceName}
                  onChange={(e) => setSourceName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              {ingestionMode === "file" ? (
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Select PDF Document
                  </label>
                  <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg p-4 text-center hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition">
                    <input
                      type="file"
                      accept=".pdf,.docx,application/pdf"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      className="hidden"
                      id="pdf-upload-input"
                    />
                    <label htmlFor="pdf-upload-input" className="cursor-pointer flex flex-col items-center">
                      <UploadCloud className="h-8 w-8 text-zinc-400 mb-2" />
                      <span className="text-xs text-zinc-600 dark:text-zinc-300 font-medium">
                        {selectedFile ? selectedFile.name : "Click to browse or drop PDF"}
                      </span>
                      <span className="text-[10px] text-zinc-400 mt-1">PDF up to 50MB</span>
                    </label>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Remote PDF URL (.pdf)
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://upsc.gov.in/sites/default/files/CSP-2024-GS-I.pdf"
                    value={sourceUrl}
                    onChange={(e) => setSourceUrl(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                  <p className="text-[11px] text-zinc-400 mt-1">
                    Server streams the PDF, computes SHA-256 for idempotency, and validates headers.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Authority / Board
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="UPSC, SSC, NTA"
                    value={authority}
                    onChange={(e) => setAuthority(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Rights / License
                  </label>
                  <input
                    type="text"
                    value={rights}
                    onChange={(e) => setRights(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Target Exam (Optional)
                </label>
                <select
                  value={selectedExamId}
                  onChange={(e) => setSelectedExamId(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-amber-500 outline-none"
                >
                  <option value="">Select an exam...</option>
                  {exams.map((ex) => (
                    <option key={ex.id} value={ex.id}>
                      {ex.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-semibold text-sm rounded-lg shadow-sm flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RotateCw className="h-4 w-4 animate-spin" />
                    Processing Document...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Ingest & Run Pipeline
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Sources List & Pipeline Tracking */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                Registered Ingestion Sources
              </h2>
              <button
                onClick={() => fetchSources()}
                className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-white rounded-md border border-zinc-200 dark:border-zinc-800"
              >
                <RotateCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>

            <div className="space-y-3">
              {sources.map((src) => (
                <div
                  key={src.id}
                  className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-zinc-900 dark:text-white text-sm sm:text-base truncate max-w-full sm:max-w-md">
                        {src.name}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 font-mono text-zinc-600 dark:text-zinc-400 shrink-0">
                        {src.sourceType === "REMOTE_URL" ? "URL.PDF" : "PDF UPLOAD"}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${src.status === "EXTRACTED"
                          ? "bg-emerald-500/10 text-emerald-600"
                          : src.status === "FAILED"
                            ? "bg-red-500/10 text-red-600"
                            : "bg-amber-500/10 text-amber-600"
                          }`}
                      >
                        {src.status}
                      </span>
                      {(src.publishedCount ?? 0) > 0 ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleSourceLiveStatus(src.id, Boolean(src.isLiveOnWeb));
                          }}
                          disabled={Boolean(isTogglingLive[src.id])}
                          title={
                            src.isLiveOnWeb
                              ? "Click to Deactivate and hide from /web PYQ Analyzer"
                              : "Click to Activate and show on /web PYQ Analyzer"
                          }
                          className={`inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] px-2.5 py-0.5 rounded-full font-bold transition-all shadow-2xs hover:scale-105 active:scale-95 shrink-0 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
                            src.isLiveOnWeb
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-200"
                              : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-200"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              isTogglingLive[src.id]
                                ? "bg-amber-500 animate-spin"
                                : src.isLiveOnWeb
                                ? "bg-emerald-500 animate-pulse"
                                : "bg-zinc-400"
                            }`}
                          />
                          <span className="truncate">
                            {isTogglingLive[src.id]
                              ? "Updating..."
                              : src.isLiveOnWeb
                              ? "Live on /web"
                              : "Deactivated"}
                          </span>
                          <span className="opacity-75 font-mono text-[9px] sm:text-[10px]">
                            ({src.activeCount || src.publishedCount} Qs)
                          </span>
                        </button>
                      ) : null}
                    </div>

                    <div className="text-xs text-zinc-500 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span>Authority: <strong className="text-zinc-700 dark:text-zinc-300 font-medium">{src.authority}</strong></span>
                      <span className="hidden sm:inline text-zinc-300 dark:text-zinc-700">•</span>
                      <span>Exam: <strong className="text-zinc-700 dark:text-zinc-300 font-medium">{src.exam?.name || "General"}</strong></span>
                      <span className="hidden sm:inline text-zinc-300 dark:text-zinc-700">•</span>
                      <span className="font-mono text-[11px] text-zinc-400">
                        SHA-256: {src.checksum.slice(0, 8)}...
                      </span>
                    </div>
                  </div>

                  {/* Responsive Action Buttons Toolbar & Vertical Three Dots Menu */}
                  <div className="flex items-center gap-2 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-100 dark:border-zinc-800/60 justify-between sm:justify-end shrink-0">
                    <button
                      onClick={() => {
                        setActiveTab("markdown");
                        loadSourceMarkdown(src.id);
                      }}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center gap-1.5 transition flex-1 sm:flex-initial"
                    >
                      <FileCode className="h-3.5 w-3.5 shrink-0" />
                      <span>View Markdown</span>
                    </button>

                    {/* Vertical Three Dots Dropdown Menu */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuSourceId(openMenuSourceId === src.id ? null : src.id);
                        }}
                        title="More Actions"
                        className={`p-1.5 rounded-lg border transition ${
                          openMenuSourceId === src.id
                            ? "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                            : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                        }`}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>

                      {openMenuSourceId === src.id && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="absolute right-0 top-full mt-1.5 w-56 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100 text-xs"
                        >
                          {/* 1. View Drafts */}
                          <button
                            type="button"
                            onClick={() => {
                              fetchDrafts(src.id);
                              setActiveTab("review");
                              setOpenMenuSourceId(null);
                            }}
                            className="w-full px-3.5 py-2 text-left hover:bg-zinc-100 dark:hover:bg-zinc-800/80 flex items-center gap-2.5 text-zinc-700 dark:text-zinc-200"
                          >
                            <Eye className="h-3.5 w-3.5 text-zinc-500" />
                            <span>View Candidate Drafts ({src._count?.drafts || 0})</span>
                          </button>

                          {/* 2. Toggle Active / Deactive on /web */}
                          {(src.publishedCount ?? 0) > 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                handleToggleSourceLiveStatus(src.id, Boolean(src.isLiveOnWeb));
                                setOpenMenuSourceId(null);
                              }}
                              className="w-full px-3.5 py-2 text-left hover:bg-zinc-100 dark:hover:bg-zinc-800/80 flex items-center gap-2.5 text-zinc-700 dark:text-zinc-200"
                            >
                              <Power
                                className={`h-3.5 w-3.5 ${
                                  src.isLiveOnWeb ? "text-emerald-500" : "text-zinc-400"
                                }`}
                              />
                              <span>
                                {src.isLiveOnWeb
                                  ? "Deactivate (Hide on /web)"
                                  : "Activate (Show on /web)"}
                              </span>
                            </button>
                          )}

                          {/* 3. Extraction Logs */}
                          <button
                            type="button"
                            onClick={() => {
                              openLogsModal(src);
                              setOpenMenuSourceId(null);
                            }}
                            className="w-full px-3.5 py-2 text-left hover:bg-zinc-100 dark:hover:bg-zinc-800/80 flex items-center gap-2.5 text-zinc-700 dark:text-zinc-200"
                          >
                            <Terminal className="h-3.5 w-3.5 text-zinc-500" />
                            <span>View Extraction Logs</span>
                          </button>

                          {/* 4. Reprocess & Extract */}
                          <button
                            type="button"
                            onClick={() => {
                              handleReprocessSource(src.id);
                              setOpenMenuSourceId(null);
                            }}
                            disabled={Boolean(reprocessingIds[src.id])}
                            className="w-full px-3.5 py-2 text-left hover:bg-zinc-100 dark:hover:bg-zinc-800/80 flex items-center gap-2.5 text-zinc-700 dark:text-zinc-200 disabled:opacity-50"
                          >
                            <RotateCw
                              className={`h-3.5 w-3.5 ${
                                reprocessingIds[src.id]
                                  ? "animate-spin text-amber-500"
                                  : "text-zinc-500"
                              }`}
                            />
                            <span>
                              {reprocessingIds[src.id]
                                ? "Reprocessing..."
                                : "Re-Extract & Format"}
                            </span>
                          </button>

                          <div className="my-1 border-t border-zinc-100 dark:border-zinc-800" />

                          {/* 5. Delete Source */}
                          <button
                            type="button"
                            onClick={() => {
                              handleDeleteSource(src.id, src.name);
                              setOpenMenuSourceId(null);
                            }}
                            className="w-full px-3.5 py-2 text-left hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 flex items-center gap-2.5"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Delete Document</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {sources.length === 0 && !loading && (
                <div className="text-center py-12 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-400">
                  <FileText className="h-10 w-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No ingestion sources registered yet.</p>
                  <p className="text-xs mt-1">Upload a PDF or enter a PDF URL on the left.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PROVENANCE & DRAFT REVIEW WORKSPACE */}

      {/* {activeTab === "review" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <span className="text-sm font-bold text-zinc-900 dark:text-white">
                Candidate Drafts ({drafts.length})
              </span>
              <button
                onClick={() => fetchDrafts()}
                className="text-xs text-amber-600 hover:underline flex items-center gap-1"
              >
                <RotateCw className="h-3 w-3" /> Refresh
              </button>
            </div>

            <div className="space-y-2 max-h-[700px] overflow-y-auto pr-1">
              {drafts.map((d) => (
                <div
                  key={d.id}
                  onClick={() => setSelectedDraft(d)}
                  className={`p-3 rounded-lg border text-left cursor-pointer transition ${
                    selectedDraft?.id === d.id
                      ? "border-amber-500 bg-amber-500/5 dark:bg-amber-500/10"
                      : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-mono text-zinc-500">{d.itemKey}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded font-semibold ${
                        d.reviewStatus === "ACCEPTED"
                          ? "bg-emerald-500/10 text-emerald-600"
                          : "bg-amber-500/10 text-amber-600"
                      }`}
                    >
                      {d.reviewStatus}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-zinc-900 dark:text-zinc-100 line-clamp-2">
                    {d.questionText}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-zinc-400 mt-2">
                    <span>Page {d.pageNumber || 1}</span>
                    <span>Version v{d.version}</span>
                  </div>
                </div>
              ))}

              {drafts.length === 0 && (
                <div className="text-center py-10 text-zinc-400 text-xs">
                  No draft questions available. Run extraction from Sources tab.
                </div>
              )}
            </div>
          </div>
          <div className="lg:col-span-8 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-6">
            {selectedDraft ? (
              <>
                <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
                  <div>
                    <span className="text-xs font-mono text-amber-600 font-semibold uppercase">
                      {selectedDraft.itemKey} • Provenance Page {selectedDraft.pageNumber || 1}
                    </span>
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                      Review & Academic Curation
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePublishDraft(selectedDraft.id)}
                      disabled={isPublishing || selectedDraft.reviewStatus === "ACCEPTED"}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg shadow-sm flex items-center gap-2 transition disabled:opacity-50"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      {selectedDraft.reviewStatus === "ACCEPTED" ? "Published" : "Approve & Publish Projection"}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg text-xs border border-zinc-200 dark:border-zinc-800">
                  <div>
                    <span className="text-zinc-400 block text-[10px]">OCR Confidence</span>
                    <span className="font-semibold text-emerald-600">
                      {Math.round((selectedDraft.confidenceScores?.ocr || 0.95) * 100)}% High
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[10px]">Bloom Taxonomy</span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                      {selectedDraft.academicClassification?.bloomLevel || "APPLY"}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[10px]">Deduplication</span>
                    <span className="font-semibold text-emerald-600">
                      {selectedDraft.duplicateStatus}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Question Text (LaTeX formulas supported)
                  </label>
                  <textarea
                    rows={3}
                    value={selectedDraft.questionText}
                    onChange={(e) =>
                      setSelectedDraft({ ...selectedDraft, questionText: e.target.value })
                    }
                    className="w-full p-3 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent font-serif outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Answer Options
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(selectedDraft.options || []).map((opt) => (
                      <div
                        key={opt.id}
                        className={`p-3 rounded-lg border flex items-center justify-between text-xs ${
                          opt.isCorrect || selectedDraft.correctAnswer === opt.key
                            ? "border-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10 font-semibold"
                            : "border-zinc-200 dark:border-zinc-800"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-bold">
                            {opt.key}
                          </span>
                          <span>{opt.text}</span>
                        </div>
                        {opt.isCorrect && (
                          <span className="text-emerald-600 text-[10px] font-bold uppercase">
                            Correct
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Academic Derivation / Answer Basis
                  </label>
                  <textarea
                    rows={2}
                    value={selectedDraft.answerBasis || ""}
                    onChange={(e) =>
                      setSelectedDraft({ ...selectedDraft, answerBasis: e.target.value })
                    }
                    className="w-full p-3 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </>
            ) : (
              <div className="text-center py-20 text-zinc-400 text-sm">
                Select a draft question on the left to inspect bounding-box provenance and curate metadata.
              </div>
            )}
          </div>
        </div>
      )}  */}

      {/* TAB 3: DOCUMENT MARKDOWN VIEWER & RENDERER */}
      {activeTab === "markdown" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Source Selector Column */}
          <div className="lg:col-span-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 space-y-3">
            <span className="text-sm font-bold text-zinc-900 dark:text-white block pb-2 border-b border-zinc-100 dark:border-zinc-800">
              Select Document ({sources.length})
            </span>
            <div className="space-y-2 max-h-[650px] overflow-y-auto pr-1">
              {sources.map((s) => (
                <div
                  key={s.id}
                  onClick={() => loadSourceMarkdown(s.id)}
                  className={`p-3 rounded-lg border text-left cursor-pointer transition ${selectedSourceForMarkdown?.id === s.id
                    ? "border-amber-500 bg-amber-500/5 dark:bg-amber-500/10"
                    : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
                    }`}
                >
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-semibold text-zinc-900 dark:text-white truncate max-w-[200px]">
                      {s.name}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-mono">
                      {s.sourceType === "REMOTE_URL" ? "URL" : "PDF"}
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-500 flex items-center justify-between">
                    <span>{s.authority}</span>
                    <div className="flex items-center gap-1.5">
                      {(s.publishedCount ?? 0) > 0 ? (
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${s.isLiveOnWeb
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                              : "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
                            }`}
                        >
                          {s.isLiveOnWeb ? "Active /web" : "Deactive /web"}
                        </span>
                      ) : null}
                      {s.markdownContent ? (
                        <span className="font-bold text-emerald-600">Markdown Ready</span>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openLogsModal(s);
                          }}
                          className="inline-flex items-center gap-1 font-bold text-amber-500 hover:text-amber-600 bg-amber-500/10 hover:bg-amber-500/20 px-2 py-0.5 rounded transition"
                        >
                          <Terminal className="h-3 w-3" />
                          Pending Extract
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rendered Markdown Preview Workspace */}
          <div className="lg:col-span-8 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-4 relative">
            {isSourceMdLoading && (
              <div className="absolute inset-0 z-20 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-2xs rounded-xl flex flex-col items-center justify-center gap-3">
                <RotateCw className="h-7 w-7 text-amber-500 animate-spin" />
                <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Loading document markdown...
                </span>
              </div>
            )}

            {selectedSourceForMarkdown ? (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                        {selectedSourceForMarkdown.name}
                      </h3>
                      {(selectedSourceForMarkdown.publishedCount ?? 0) > 0 ? (
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold ${selectedSourceForMarkdown.isLiveOnWeb
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                              : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border border-zinc-300 dark:border-zinc-700"
                            }`}
                        >
                          <span
                            className={`h-2 w-2 rounded-full ${selectedSourceForMarkdown.isLiveOnWeb
                                ? "bg-emerald-500 animate-pulse"
                                : "bg-zinc-400"
                              }`}
                          />
                          {selectedSourceForMarkdown.isLiveOnWeb
                            ? `Live on /web (${selectedSourceForMarkdown.activeCount || selectedSourceForMarkdown.publishedCount} Qs)`
                            : `Deactivated on /web (${selectedSourceForMarkdown.publishedCount} Qs hidden)`}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                          Draft (Not Published to /web)
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Authority: {selectedSourceForMarkdown.authority} • Checksum: {selectedSourceForMarkdown.checksum.slice(0, 10)}...
                    </p>
                  </div>

                  {/* Header Actions Toolbar & Vertical Three Dots Menu */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Reload Latest Markdown */}
                    <button
                      type="button"
                      onClick={() => loadSourceMarkdown(selectedSourceForMarkdown.id)}
                      disabled={isSourceMdLoading}
                      className="p-1.5 text-xs font-semibold rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 flex items-center gap-1 transition"
                      title="Reload document markdown from server"
                    >
                      <RotateCw className={`h-3.5 w-3.5 ${isSourceMdLoading ? "animate-spin text-amber-500" : ""}`} />
                      <span className="hidden sm:inline">Reload</span>
                    </button>

                    {/* Primary Action: AI Correct */}
                    <button
                      type="button"
                      onClick={handleAiCorrectMarkdown}
                      disabled={isAiCorrecting}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 transition shadow-xs disabled:opacity-60"
                      title="Select/drag text or click to fix questions, statements, and options formatting with AI"
                    >
                      <Sparkles className={`h-3.5 w-3.5 ${isAiCorrecting ? "animate-spin" : ""}`} />
                      {isAiCorrecting
                        ? "AI Correcting..."
                        : selectedText
                          ? `AI Correct Selected (${selectedText.length} chars)`
                          : "AI Correct"}
                    </button>

                    {/* Primary Action: Submit & Approve */}
                    <button
                      type="button"
                      onClick={handleApproveAndPublishAllSource}
                      disabled={isApprovingSource}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 transition shadow-xs disabled:opacity-60"
                      title="Approve all questions from this document and publish directly to PYQ Analyzer"
                    >
                      <CheckCircle2 className={`h-3.5 w-3.5 ${isApprovingSource ? "animate-spin" : ""}`} />
                      {isApprovingSource ? "Publishing..." : "Submit & Approve"}
                    </button>

                    {/* Toggle View Mode: Preview vs Edit */}
                    <button
                      type="button"
                      onClick={() => setMdViewMode((prev) => (prev === "preview" ? "edit" : "preview"))}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5 transition"
                      title="Toggle between rendered Markdown preview and editable raw text"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      {mdViewMode === "preview" ? "Edit" : "Preview"}
                    </button>

                    {/* Vertical Three Dots Menu (More Actions) */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsMdMoreOpen(!isMdMoreOpen);
                        }}
                        title="More Actions"
                        className={`p-1.5 rounded-lg border transition ${
                          isMdMoreOpen
                            ? "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                            : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                        }`}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>

                      {isMdMoreOpen && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="absolute right-0 top-full mt-1.5 w-60 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100 text-xs"
                        >
                          {/* 1. Save to Drafts */}
                          <button
                            type="button"
                            onClick={() => {
                              handleSaveMarkdownToDrafts();
                              setIsMdMoreOpen(false);
                            }}
                            disabled={isSavingDrafts}
                            className="w-full px-3.5 py-2 text-left hover:bg-zinc-100 dark:hover:bg-zinc-800/80 flex items-center gap-2.5 text-zinc-700 dark:text-zinc-200 disabled:opacity-50"
                          >
                            <Layers className={`h-3.5 w-3.5 ${isSavingDrafts ? "animate-spin" : "text-zinc-500"}`} />
                            <span>{isSavingDrafts ? "Saving Drafts..." : "Save to Drafts"}</span>
                          </button>

                          {/* 2. Toggle Active / Deactive on /web */}
                          {((selectedSourceForMarkdown.publishedCount ?? 0) > 0 || selectedSourceForMarkdown.isLiveOnWeb) && (
                            <button
                              type="button"
                              onClick={() => {
                                handleToggleSourceLiveStatus(
                                  selectedSourceForMarkdown.id,
                                  Boolean(selectedSourceForMarkdown.isLiveOnWeb)
                                );
                                setIsMdMoreOpen(false);
                              }}
                              disabled={Boolean(isTogglingLive[selectedSourceForMarkdown.id])}
                              className="w-full px-3.5 py-2 text-left hover:bg-zinc-100 dark:hover:bg-zinc-800/80 flex items-center gap-2.5 text-zinc-700 dark:text-zinc-200 disabled:opacity-50"
                            >
                              <Power
                                className={`h-3.5 w-3.5 ${
                                  isTogglingLive[selectedSourceForMarkdown.id]
                                    ? "animate-spin"
                                    : selectedSourceForMarkdown.isLiveOnWeb
                                    ? "text-emerald-500"
                                    : "text-zinc-400"
                                }`}
                              />
                              <span>
                                {isTogglingLive[selectedSourceForMarkdown.id]
                                  ? "Updating..."
                                  : selectedSourceForMarkdown.isLiveOnWeb
                                  ? "Deactivate (Hide on /web)"
                                  : "Activate (Show on /web)"}
                              </span>
                            </button>
                          )}

                          {/* 3. Copy Markdown */}
                          <button
                            type="button"
                            onClick={() => {
                              const content = selectedSourceForMarkdown.markdownContent || selectedSourceForMarkdown.extractedText || "";
                              navigator.clipboard.writeText(content);
                              setCopiedMd(true);
                              setTimeout(() => setCopiedMd(false), 2000);
                              setIsMdMoreOpen(false);
                            }}
                            className="w-full px-3.5 py-2 text-left hover:bg-zinc-100 dark:hover:bg-zinc-800/80 flex items-center gap-2.5 text-zinc-700 dark:text-zinc-200"
                          >
                            {copiedMd ? (
                              <Check className="h-3.5 w-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="h-3.5 w-3.5 text-zinc-500" />
                            )}
                            <span>{copiedMd ? "Copied to Clipboard!" : "Copy Full Markdown"}</span>
                          </button>

                          {/* 4. Re-Extract & Format */}
                          <button
                            type="button"
                            onClick={() => {
                              handleReprocessSource(selectedSourceForMarkdown.id);
                              setIsMdMoreOpen(false);
                            }}
                            disabled={Boolean(reprocessingIds[selectedSourceForMarkdown.id])}
                            className="w-full px-3.5 py-2 text-left hover:bg-zinc-100 dark:hover:bg-zinc-800/80 flex items-center gap-2.5 text-zinc-700 dark:text-zinc-200 disabled:opacity-50"
                          >
                            <RotateCw
                              className={`h-3.5 w-3.5 ${
                                reprocessingIds[selectedSourceForMarkdown.id]
                                  ? "animate-spin text-amber-500"
                                  : "text-zinc-500"
                              }`}
                            />
                            <span>
                              {reprocessingIds[selectedSourceForMarkdown.id]
                                ? "Extracting..."
                                : "Re-Extract & Format"}
                            </span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Markdown Rendered Content or Raw Editor */}
                {mdViewMode === "edit" ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-zinc-500">
                      <span>Live Markdown Editor (Select text to correct with AI, or edit directly)</span>
                      <span>{(selectedSourceForMarkdown.markdownContent || "").length} characters</span>
                    </div>
                    <textarea
                      rows={22}
                      value={selectedSourceForMarkdown.markdownContent || selectedSourceForMarkdown.extractedText || ""}
                      onChange={(e) =>
                        setSelectedSourceForMarkdown({
                          ...selectedSourceForMarkdown,
                          markdownContent: e.target.value,
                        })
                      }
                      onSelect={(e: any) => {
                        const sel = e.target.value.substring(e.target.selectionStart, e.target.selectionEnd);
                        if (sel && sel.trim().length > 0) {
                          setSelectedText(sel.trim());
                        }
                      }}
                      className="w-full p-4 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-900 text-zinc-100 font-mono text-xs leading-relaxed outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                ) : (
                  <div
                    onMouseUp={() => {
                      const sel = window.getSelection()?.toString() || "";
                      if (sel.trim().length > 0) {
                        setSelectedText(sel.trim());
                      }
                    }}
                    className="bg-zinc-50 dark:bg-zinc-950/60 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 max-h-[650px] overflow-y-auto text-sm leading-relaxed text-zinc-800 dark:text-zinc-200 markdown-preview select-text"
                  >
                    {selectedSourceForMarkdown.markdownContent ? (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        /* Styling commented out for time being
                        components={{
                          ol: ({ node, ...props }) => (
                            <ol className="list-decimal list-outside pl-6 my-3 space-y-1.5 font-sans" {...props} />
                          ),
                          ul: ({ node, ...props }) => (
                            <ul className="list-disc list-outside pl-6 my-3 space-y-1 font-sans" {...props} />
                          ),
                          li: ({ node, ...props }) => (
                            <li className="text-sm leading-relaxed pl-1" {...props} />
                          ),
                          h3: ({ node, ...props }) => (
                            <h3 className="text-base font-bold text-indigo-600 dark:text-indigo-400 mt-6 mb-2 bg-indigo-50/50 dark:bg-indigo-950/20 px-3 py-1.5 rounded-lg border-l-4 border-indigo-500" {...props} />
                          ),
                          p: ({ node, ...props }) => (
                            <p className="my-2 leading-relaxed" {...props} />
                          ),
                        }}
                        */
                      >
                        {selectedSourceForMarkdown.markdownContent}
                      </ReactMarkdown>
                    ) : selectedSourceForMarkdown.extractedText ? (
                      <pre className="whitespace-pre-wrap font-mono text-xs text-zinc-700 dark:text-zinc-300">
                        {selectedSourceForMarkdown.extractedText}
                      </pre>
                    ) : (
                      <div className="text-center py-16 text-zinc-400">
                        <FileCode className="h-10 w-10 mx-auto mb-2 opacity-30" />
                        <p className="font-semibold">Markdown content not yet generated for this source.</p>
                        <p className="text-xs mt-1">Click "Re-Extract & Format" to run the extraction pipeline.</p>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20 text-zinc-400 text-sm">
                Select a document source from the left to view rendered Markdown.
              </div>
            )}
          </div>
        </div>
      )}

      {/* LIVE EXTRACTION LOGS MODAL */}
      {logsModalSource && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/40">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-amber-500/10 text-amber-600 rounded-lg">
                  <Terminal className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                    Extraction Pipeline Logs
                  </h3>
                  <p className="text-xs text-zinc-500">
                    {logsModalSource.name} • {logsModalSource.authority}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openLogsModal(logsModalSource)}
                  className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-xs flex items-center gap-1"
                >
                  <RotateCw className={`h-3.5 w-3.5 ${isLogsLoading ? "animate-spin" : ""}`} />
                  Refresh
                </button>
                <button
                  onClick={() => setLogsModalSource(null)}
                  className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Modal Terminal Body */}
            <div className="p-4 space-y-4 max-h-[500px] overflow-y-auto">
              {logsModalJobs.length > 0 ? (
                logsModalJobs.map((job, idx) => (
                  <div key={job.id || idx} className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-zinc-500 pb-1 border-b border-zinc-100 dark:border-zinc-800">
                      <span className="font-mono">
                        Job: {job.id?.slice(0, 8)}... ({job.parserVersion || "YuktiExtractor"})
                      </span>
                      <span className="font-bold text-amber-500">
                        {job.stage} • {job.progress}%
                      </span>
                    </div>

                    {/* Terminal Window Box */}
                    <div className="bg-zinc-950 text-zinc-200 p-4 rounded-xl font-mono text-xs space-y-1.5 shadow-inner border border-zinc-800">
                      {Array.isArray(job.logs) && job.logs.length > 0 ? (
                        job.logs.map((logItem: any, lIdx: number) => (
                          <div key={lIdx} className="flex items-start gap-2 leading-relaxed">
                            <span className="text-zinc-500 shrink-0 select-none">
                              {logItem.timestamp ? new Date(logItem.timestamp).toLocaleTimeString() : ">"}
                            </span>
                            <span className="text-amber-400 shrink-0 select-none font-bold">
                              [{logItem.stage}]
                            </span>
                            <span className="text-zinc-300">
                              {logItem.message}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="text-zinc-500 italic">No logs recorded for this stage yet.</div>
                      )}
                      {job.error && (
                        <div className="text-red-400 font-bold pt-2 border-t border-zinc-800">
                          Error: {job.error}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-zinc-400 text-xs">
                  {isLogsLoading ? "Fetching pipeline logs..." : "No job logs found for this source."}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center text-xs">
              <span className="text-zinc-500">
                Pipeline execution logs are also streamed directly to the terminal stdout.
              </span>
              <button
                onClick={() => setLogsModalSource(null)}
                className="px-4 py-1.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-semibold rounded-lg hover:opacity-90 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
