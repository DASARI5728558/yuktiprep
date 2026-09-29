"use client";

import React, { useState } from "react";
import {
  useCompetitiveExamStats,
  useCompetitiveExams,
  useExamSources,
  useScrapeLogs,
  useChangeLogs,
  useToggleExamSource,
  useUpdateExamSource,
  useTriggerSourceScrape,
  useTriggerAllScrapers,
  useDeleteCompetitiveExam,
  CompetitiveExam,
  ExamSource,
  ScrapeLog,
  ExamChangeLog,
} from "@/hooks/useCompetitiveExams";
import {
  Calendar,
  Layers,
  Database,
  History,
  GitCommit,
  RefreshCw,
  Search,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Clock,
  Play,
  Trash2,
  SlidersHorizontal,
  Edit3,
  FileText,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function CompetitiveExamsPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "exams" | "sources" | "scrape-logs" | "change-logs">("overview");
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // Edit Source State
  const [editingSource, setEditingSource] = useState<ExamSource | null>(null);
  const [runningSourceId, setRunningSourceId] = useState<string | null>(null);
  const [sourceForm, setSourceForm] = useState({
    calendarUrl: "",
    url: "",
    scraperType: "html",
  });

  const showNotification = (message: string, type: "success" | "error" | "info" = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // Stats
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useCompetitiveExamStats();

  // Exams list state
  const [examSearch, setExamSearch] = useState("");
  const [examOrgFilter, setExamOrgFilter] = useState("All");
  const [examStateFilter, setExamStateFilter] = useState("All");
  const [examPage, setExamPage] = useState(1);
  const examLimit = 25;

  const { data: examsData, isLoading: examsLoading, refetch: refetchExams } = useCompetitiveExams({
    page: examPage,
    limit: examLimit,
    search: examSearch,
    organization: examOrgFilter,
    state: examStateFilter,
  });

  // Sources
  const { data: sources, isLoading: sourcesLoading, refetch: refetchSources } = useExamSources();

  // Dynamic filter options derived from sources
  const availableOrgs = React.useMemo(() => {
    if (!sources) return [];
    return Array.from(new Set(sources.map((s) => s.organization))).sort();
  }, [sources]);

  const availableStates = React.useMemo(() => {
    if (!sources) return [];
    return Array.from(new Set(sources.map((s) => s.state))).sort();
  }, [sources]);
  const toggleSource = useToggleExamSource();
  const updateSource = useUpdateExamSource();
  const triggerScrape = useTriggerSourceScrape();
  const triggerAll = useTriggerAllScrapers();
  const deleteExam = useDeleteCompetitiveExam();

  // Logs
  const { data: scrapeLogsData, isLoading: logsLoading, refetch: refetchLogs } = useScrapeLogs({ limit: 50 });
  const { data: changeLogsData, isLoading: changesLoading, refetch: refetchChanges } = useChangeLogs({ limit: 50 });

  const handleRunAll = async () => {
    try {
      await triggerAll.mutateAsync();
      showNotification("Scraper run initiated across all active sources!", "success");
      refetchStats();
    } catch (err: unknown) {
      const error = err as Error;
      showNotification(error.message || "Failed to start scrapers", "error");
    }
  };

  const handleRunSingle = async (source: ExamSource) => {
    setRunningSourceId(source.id);
    try {
      showNotification(`Running official scraper for ${source.organization}...`, "info");
      const res = await triggerScrape.mutateAsync(source.id);

      const resultData = res?.data || res;
      if (resultData?.success) {
        showNotification(
          `${source.organization}: Successfully scraped! Found: ${resultData.recordsFound}, Inserted: ${resultData.inserted}, Updated: ${resultData.updated}`,
          "success"
        );
      } else {
        showNotification(
          `${source.organization}: ${resultData?.error || "Finished with warnings or no records found"}`,
          "error"
        );
      }

      refetchSources();
      refetchStats();
      refetchExams();
      refetchLogs();
      refetchChanges();
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || err?.message || "Scrape failed";
      showNotification(`${source.organization}: ${errMsg}`, "error");
    } finally {
      setRunningSourceId(null);
    }
  };

  return (
    <div className="flex flex-col p-4 md:p-8 font-[family-name:var(--font-poppins)] w-full">
      {/* Toast Notification Banner */}
      {notification && (
        <div
          className={`mb-6 p-4 rounded-xl text-sm font-semibold flex items-center justify-between shadow-sm transition-all ${notification.type === "success"
            ? "bg-teal-50 text-teal-800 border border-teal-200"
            : notification.type === "error"
              ? "bg-red-50 text-red-800 border border-red-200"
              : "bg-blue-50 text-blue-800 border border-blue-200"
            }`}
        >
          <span>{notification.message}</span>
          <button
            onClick={() => setNotification(null)}
            className="text-xs font-bold hover:opacity-75 ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* HEADER */}
      <header className="mb-8 flex flex-col gap-6 border-b border-gray-200 pb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold font-[family-name:var(--font-poppins)] text-[var(--primarynavy)] md:text-3xl flex items-center gap-3">
            <Calendar className="w-7 h-7 text-teal-600" />
            Competitive Exam Aggregator
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Automated official-source calendar collection (2026 onwards)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-600">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400" />
            Active 2026
          </div>

          <button
            onClick={() => {
              refetchStats();
              refetchExams();
            }}
            className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>

          <button
            onClick={handleRunAll}
            disabled={triggerAll.isPending}
            className="rounded-xl font-[family-name:var(--font-poppins)] bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-teal-500/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            {triggerAll.isPending ? "Running..." : "Run All Scrapers"}
          </button>
        </div>
      </header>

      {/* KPI STATS CARDS */}
      <section className="mb-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
        <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-gray-300 hover:shadow-xl">
          <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-teal-400 to-teal-600 opacity-0 transition group-hover:opacity-100" />
          <h3 className="mb-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Total Exams
          </h3>
          <div className="text-3xl font-extrabold text-gray-900">
            {statsLoading ? "-" : stats?.totalExams ?? 0}
          </div>
          <span className="mt-2 inline-block text-xs font-medium text-emerald-600">Official records</span>
        </div>

        <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-gray-300 hover:shadow-xl">
          <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-teal-400 to-teal-600 opacity-0 transition group-hover:opacity-100" />
          <h3 className="mb-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Upcoming 2026+
          </h3>
          <div className="text-3xl font-extrabold text-teal-600">
            {statsLoading ? "-" : stats?.upcomingExams ?? 0}
          </div>
          <span className="mt-2 inline-block text-xs font-medium text-gray-500">Active dates</span>
        </div>

        <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-gray-300 hover:shadow-xl">
          <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-teal-400 to-teal-600 opacity-0 transition group-hover:opacity-100" />
          <h3 className="mb-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Active Sources
          </h3>
          <div className="text-3xl font-extrabold text-indigo-600">
            {statsLoading ? "-" : stats?.activeSources ?? 0}
          </div>
          <span className="mt-2 inline-block text-xs font-medium text-gray-500">Official portals</span>
        </div>

        <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-gray-300 hover:shadow-xl">
          <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-teal-400 to-teal-600 opacity-0 transition group-hover:opacity-100" />
          <h3 className="mb-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Changes Today
          </h3>
          <div className="text-3xl font-extrabold text-amber-600">
            {statsLoading ? "-" : stats?.changedToday ?? 0}
          </div>
          <span className="mt-2 inline-block text-xs font-medium text-gray-500">Date revisions</span>
        </div>

        <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-gray-300 hover:shadow-xl">
          <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-teal-400 to-teal-600 opacity-0 transition group-hover:opacity-100" />
          <h3 className="mb-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Last Scheduled Sync
          </h3>
          <div className="text-base font-bold text-gray-800 truncate mt-1">
            {stats?.lastScrape
              ? new Date(stats.lastScrape).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })
              : "Never"}
          </div>
          <span className="mt-2 inline-block text-xs font-medium text-gray-400">Daily 06:00 AM</span>
        </div>
      </section>

      {/* PILL TABS */}
      <div className="mb-8 flex  gap-2 rounded-2xl border border-gray-200 bg-teal-50 p-2">
        {[
          { id: "overview", label: "Overview", icon: Layers },
          {
            id: "exams",
            label: `Exams Directory (${stats?.totalExams ?? "..."})`,
            icon: Calendar,
          },
          { id: "sources", label: `Official Sources (${sources?.length ?? 37})`, icon: Database },
          { id: "scrape-logs", label: "Scrape Logs", icon: History },
          { id: "change-logs", label: "Change Logs", icon: GitCommit },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`w-full whitespace-nowrap rounded-xl px-5 py-3 text-sm font-semibold transition flex items-center justify-center gap-2 ${isActive
                ? "bg-teal-600 text-white shadow-sm"
                : "text-muted-foreground hover:bg-teal-100 hover:text-gray-900"
                }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between pb-5 border-b border-gray-100 mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Recent Verified Upcoming Exams (2026+)
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Extracted directly from official government calendars
              </p>
            </div>
            <button
              onClick={() => setActiveTab("exams")}
              className="rounded-xl border border-gray-300 px-4 py-2 text-xs font-semibold hover:bg-gray-50 transition"
            >
              View Full Directory
            </button>
          </div>

          <div className="w-full">
            <table className="w-full text-left text-sm table-fixed border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500 text-xs uppercase bg-gray-50/70">
                  <th className="py-3 px-3 md:px-4 font-semibold w-[35%]">Exam Name</th>
                  <th className="py-3 px-3 md:px-4 font-semibold w-[15%]">Organization</th>
                  <th className="py-3 px-3 md:px-4 font-semibold w-[12%]">State / Scope</th>
                  <th className="py-3 px-3 md:px-4 font-semibold w-[18%]">Exam Date / Window</th>
                  <th className="py-3 px-3 md:px-4 font-semibold w-[10%]">Status</th>
                  <th className="py-3 px-3 md:px-4 text-right font-semibold w-[10%]">Official Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {examsData?.data?.slice(0, 8).map((exam: CompetitiveExam) => (
                  <tr key={exam.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3.5 px-3 md:px-4 font-semibold text-gray-900 break-words leading-snug align-top">{exam.name}</td>
                    <td className="py-3.5 px-3 md:px-4 align-top">
                      <span className="inline-block rounded-md border border-violet-200 bg-teal-50 px-2 py-0.5 text-xs font-bold uppercase text-teal-700 break-words max-w-full">
                        {exam.organization}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 md:px-4 text-gray-600 text-xs break-words align-top">{exam.state}</td>
                    <td className="py-3.5 px-3 md:px-4 font-mono text-xs text-gray-800 font-semibold break-all align-top">
                      {exam.examDate
                        ? new Date(exam.examDate).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                        : exam.examDateText || "Tentative 2026"}
                    </td>
                    <td className="py-3.5 px-3 md:px-4 align-top">
                      <span className="inline-block rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 capitalize">
                        {exam.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 md:px-4 text-right align-top">
                      <a
                        href={exam.officialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-teal-600 hover:text-teal-800 inline-flex items-center gap-1 text-xs font-semibold break-all"
                      >
                        Portal <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: EXAMS DIRECTORY */}
      {activeTab === "exams" && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-4 border border-gray-200 rounded-2xl shadow-sm">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search exam name or org..."
                value={examSearch}
                onChange={(e) => setExamSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-gray-50/50"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <SlidersHorizontal className="w-4 h-4 text-gray-500" />
              <select
                value={examOrgFilter}
                onChange={(e) => {
                  setExamOrgFilter(e.target.value);
                  setExamPage(1);
                }}
                className="text-xs border border-gray-300 rounded-xl py-2 px-3 bg-white text-gray-700 font-medium"
              >
                <option value="All">All Organizations ({availableOrgs.length})</option>
                {availableOrgs.map((org) => (
                  <option key={org} value={org}>
                    {org}
                  </option>
                ))}
              </select>

              <select
                value={examStateFilter}
                onChange={(e) => {
                  setExamStateFilter(e.target.value);
                  setExamPage(1);
                }}
                className="text-xs border border-gray-300 rounded-xl py-2 px-3 bg-white text-gray-700 font-medium"
              >
                <option value="All">All States ({availableStates.length})</option>
                {availableStates.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table Container */}
          <div className="rounded-3xl border border-gray-200 bg-white p-4 md:p-6 shadow-sm overflow-hidden">
            <div className="w-full">
              <table className="w-full text-left text-sm table-fixed border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-500 text-xs uppercase bg-gray-50/70">
                    <th className="py-3 px-3 md:px-4 font-semibold w-[28%]">Exam Name</th>
                    <th className="py-3 px-3 md:px-4 font-semibold w-[12%]">Organization</th>
                    <th className="py-3 px-3 md:px-4 font-semibold w-[10%]">State</th>
                    <th className="py-3 px-3 md:px-4 font-semibold w-[11%]">Application End</th>
                    <th className="py-3 px-3 md:px-4 font-semibold w-[16%]">Exam Date</th>
                    <th className="py-3 px-3 md:px-4 font-semibold w-[9%]">Status</th>
                    <th className="py-3 px-3 md:px-4 font-semibold w-[9%]">Official Notice</th>
                    <th className="py-3 px-3 md:px-4 text-right font-semibold w-[5%]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {examsLoading ? (
                    <tr>
                      <td colSpan={8} className="py-10 text-center text-gray-500 font-medium">
                        Loading official exams...
                      </td>
                    </tr>
                  ) : examsData?.data?.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-10 text-center text-gray-500 font-medium">
                        No exams match the selected criteria.
                      </td>
                    </tr>
                  ) : (
                    examsData?.data?.map((exam: CompetitiveExam) => (
                      <tr key={exam.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-3.5 px-3 md:px-4 font-semibold text-gray-900 break-words leading-snug align-top">
                          {exam.name}
                        </td>
                        <td className="py-3.5 px-3 md:px-4 align-top">
                          <span className="inline-block rounded-md border border-violet-200 bg-teal-50 px-2 py-0.5 text-xs font-bold uppercase text-teal-700 break-words max-w-full">
                            {exam.organization}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 md:px-4 text-gray-600 text-xs break-words align-top">{exam.state}</td>
                        <td className="py-3.5 px-3 md:px-4 text-xs font-mono text-gray-600 break-words align-top">
                          {exam.applicationEnd
                            ? new Date(exam.applicationEnd).toLocaleDateString("en-IN")
                            : "-"}
                        </td>
                        <td className="py-3.5 px-3 md:px-4 text-xs font-mono text-gray-900 font-bold break-all align-top">
                          {exam.examDate
                            ? new Date(exam.examDate).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                            : exam.examDateText || "Tentative 2026"}
                        </td>
                        <td className="py-3.5 px-3 md:px-4 align-top">
                          <span className="inline-block rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 capitalize">
                            {exam.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 md:px-4 align-top">
                          <a
                            href={exam.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-teal-600 hover:underline inline-flex items-center gap-1 text-xs font-semibold break-all"
                          >
                            View Notice <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                          </a>
                        </td>
                        <td className="py-3.5 px-3 md:px-4 text-right align-top">
                          <button
                            onClick={async () => {
                              if (confirm(`Delete ${exam.name}?`)) {
                                await deleteExam.mutateAsync(exam.id);
                                showNotification("Exam deleted", "info");
                              }
                            }}
                            className="text-gray-400 hover:text-red-600 transition-colors p-1"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {examsData?.total ? (
              <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-100 pt-4 text-xs text-gray-500">
                <div>
                  Showing{" "}
                  <span className="font-semibold text-gray-900">
                    {Math.min((examPage - 1) * examLimit + 1, examsData.total)}
                  </span>{" "}
                  to{" "}
                  <span className="font-semibold text-gray-900">
                    {Math.min(examPage * examLimit, examsData.total)}
                  </span>{" "}
                  of <span className="font-semibold text-gray-900">{examsData.total}</span> exams
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setExamPage((p) => Math.max(1, p - 1))}
                    disabled={examPage <= 1}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" /> Previous
                  </button>

                  <div className="px-2 font-medium">
                    Page {examPage} of {Math.ceil(examsData.total / examLimit) || 1}
                  </div>

                  <button
                    onClick={() => setExamPage((p) => p + 1)}
                    disabled={examPage >= Math.ceil(examsData.total / examLimit)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition"
                  >
                    Next <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* TAB 3: SOURCES MANAGEMENT */}
      {activeTab === "sources" && (
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm overflow-hidden">
          <div className="pb-5 border-b border-gray-100 mb-4">
            <h2 className="text-lg font-bold text-gray-900">
              Official Exam Portals & Scrapers (37 Sources)
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Central organizations (UPSC, SSC, NTA, IBPS, Railways, Defence) and State PSCs
            </p>
          </div>

          <div className="w-full">
            <table className="w-full text-left text-sm table-auto border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500 text-xs uppercase bg-gray-50/70">
                  <th className="py-3 px-3 md:px-4 font-semibold">Organization</th>
                  <th className="py-3 px-3 md:px-4 font-semibold">State / Jurisdiction</th>
                  <th className="py-3 px-3 md:px-4 font-semibold">Portal Type</th>
                  <th className="py-3 px-3 md:px-4 font-semibold">Exams Stored</th>
                  <th className="py-3 px-3 md:px-4 font-semibold">Last Success</th>
                  <th className="py-3 px-3 md:px-4 font-semibold">Status</th>
                  <th className="py-3 px-3 md:px-4 text-right font-semibold">Scraper Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sourcesLoading ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-gray-500 font-medium">
                      Loading official sources...
                    </td>
                  </tr>
                ) : (
                  sources?.map((src) => (
                    <tr key={src.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3.5 px-3 md:px-4 font-semibold text-gray-900 break-words">
                        <div>{src.organization}</div>
                        <a
                          href={src.calendarUrl || src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-teal-600 hover:underline font-normal inline-flex items-center gap-1 mt-0.5 break-words"
                        >
                          {src.calendarUrl ? "Calendar Link" : "Official Website"} <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      </td>
                      <td className="py-3.5 px-3 md:px-4 text-gray-600 text-xs break-words">{src.state}</td>
                      <td className="py-3.5 px-3 md:px-4 text-xs font-mono text-gray-500 uppercase break-words">{src.scraperType}</td>
                      <td className="py-3.5 px-3 md:px-4 text-xs font-bold text-gray-800">
                        {src._count?.competitiveExams ?? 0}
                      </td>
                      <td className="py-3.5 px-3 md:px-4 text-xs text-gray-500 break-words">
                        {src.lastSuccessAt
                          ? new Date(src.lastSuccessAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                          : "Pending run"}
                      </td>
                      <td className="py-3.5 px-3 md:px-4">
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-semibold inline-block ${src.enabled
                            ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                            : "bg-gray-100 text-gray-600"
                            }`}
                        >
                          {src.enabled ? "Active" : "Disabled"}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 md:px-4 text-right">
                        <div className="flex flex-wrap items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setEditingSource(src);
                              setSourceForm({
                                calendarUrl: src.calendarUrl || "",
                                url: src.url || "",
                                scraperType: src.scraperType || "html",
                              });
                            }}
                            className="rounded-xl border border-gray-300 px-2.5 py-1.5 text-xs font-semibold hover:bg-gray-50 transition inline-flex items-center gap-1 text-gray-700"
                            title="Change URL or configure PDF RapidOCR"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-gray-500" />
                            Edit URL
                          </button>
                          <button
                            onClick={() => toggleSource.mutate(src.id)}
                            className="rounded-xl border border-gray-300 px-2.5 py-1.5 text-xs font-semibold hover:bg-gray-50 transition"
                          >
                            {src.enabled ? "Disable" : "Enable"}
                          </button>
                          <button
                            onClick={() => handleRunSingle(src)}
                            disabled={runningSourceId === src.id || triggerScrape.isPending}
                            className="rounded-xl bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-teal-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {runningSourceId === src.id ? "Running..." : "Run Now"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Edit Source URL Modal */}
          {editingSource && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
              <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-gray-200 animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <Edit3 className="w-5 h-5 text-teal-600" />
                      Configure Source URL ({editingSource.organization})
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Paste any official webpage URL or direct PDF calendar URL
                    </p>
                  </div>
                  <button
                    onClick={() => setEditingSource(null)}
                    className="text-gray-400 hover:text-gray-600 font-bold p-1 text-sm"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4 text-left text-sm">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                      Calendar / Notices URL (Webpage or .PDF)
                    </label>
                    <input
                      type="url"
                      value={sourceForm.calendarUrl}
                      onChange={(e) => {
                        const val = e.target.value;
                        const isPdf = val.toLowerCase().endsWith(".pdf") || val.toLowerCase().includes(".pdf?");
                        setSourceForm((prev) => ({
                          ...prev,
                          calendarUrl: val,
                          scraperType: isPdf ? "pdf" : prev.scraperType,
                        }));
                      }}
                      placeholder="e.g. https://upsc.gov.in/... or https://tnpsc.gov.in/calendar_2026.pdf"
                      className="w-full px-3.5 py-2.5 text-xs border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                    />
                    {sourceForm.calendarUrl.toLowerCase().includes(".pdf") && (
                      <div className="mt-2 p-2.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs flex items-center gap-2 font-medium">
                        <FileText className="w-4 h-4 text-teal-600 shrink-0" />
                        <span>PDF link detected: <strong>RapidOCR Engine</strong> will automatically extract dates & text.</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                      Official Organization Homepage URL
                    </label>
                    <input
                      type="url"
                      value={sourceForm.url}
                      onChange={(e) => setSourceForm((prev) => ({ ...prev, url: e.target.value }))}
                      placeholder="e.g. https://upsc.gov.in"
                      className="w-full px-3.5 py-2.5 text-xs border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                      Parser Engine / Scraper Type
                    </label>
                    <select
                      value={sourceForm.scraperType}
                      onChange={(e) => setSourceForm((prev) => ({ ...prev, scraperType: e.target.value }))}
                      className="w-full px-3.5 py-2.5 text-xs border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                    >
                      <option value="html">HTML Webpage (Axios + Cheerio Parser)</option>
                      <option value="pdf">PDF Document (Python RapidOCR High-Accuracy)</option>
                      <option value="javascript">Dynamic JavaScript (Playwright Rendering)</option>
                    </select>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                  <button
                    onClick={() => setEditingSource(null)}
                    className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        await updateSource.mutateAsync({
                          id: editingSource.id,
                          data: sourceForm,
                        });
                        showNotification(`Updated ${editingSource.organization} source URL!`, "success");
                        setEditingSource(null);
                      } catch (err: unknown) {
                        const error = err as Error;
                        showNotification(error.message || "Failed to update source", "error");
                      }
                    }}
                    disabled={updateSource.isPending}
                    className="px-5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition shadow-sm"
                  >
                    {updateSource.isPending ? "Saving..." : "Save Configuration"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: SCRAPE LOGS */}
      {activeTab === "scrape-logs" && (
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm overflow-hidden">
          <div className="pb-5 border-b border-gray-100 mb-4">
            <h2 className="text-lg font-bold text-gray-900">
              Scraper Execution Logs
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Audit trail of all automated and manual scraping runs
            </p>
          </div>

          <div className="w-full">
            <table className="w-full text-left text-sm table-auto border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500 text-xs uppercase bg-gray-50/70">
                  <th className="py-3 px-3 md:px-4 font-semibold">Organization</th>
                  <th className="py-3 px-3 md:px-4 font-semibold">Started At</th>
                  <th className="py-3 px-3 md:px-4 font-semibold">Duration</th>
                  <th className="py-3 px-3 md:px-4 font-semibold">Status</th>
                  <th className="py-3 px-3 md:px-4 font-semibold">Found</th>
                  <th className="py-3 px-3 md:px-4 font-semibold">Inserted</th>
                  <th className="py-3 px-3 md:px-4 font-semibold">Updated</th>
                  <th className="py-3 px-3 md:px-4 font-semibold">Message / Error</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logsLoading ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-gray-500 font-medium">
                      Loading scrape logs...
                    </td>
                  </tr>
                ) : (
                  scrapeLogsData?.data?.map((log: ScrapeLog) => (
                    <tr key={log.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3.5 px-3 md:px-4 font-semibold text-gray-900 break-words">{log.organization}</td>
                      <td className="py-3.5 px-3 md:px-4 text-xs font-mono text-gray-600 break-words">
                        {new Date(log.startedAt).toLocaleString("en-IN")}
                      </td>
                      <td className="py-3.5 px-3 md:px-4 text-xs font-mono text-gray-500 break-words">
                        {log.durationMs ? `${log.durationMs}ms` : "-"}
                      </td>
                      <td className="py-3.5 px-3 md:px-4">
                        {log.status === "SUCCESS" ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> SUCCESS
                          </span>
                        ) : log.status === "FAILED" ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full">
                            <XCircle className="w-3.5 h-3.5 shrink-0" /> FAILED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                            <Clock className="w-3.5 h-3.5 shrink-0" /> RUNNING
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 md:px-4 text-xs font-bold text-gray-800">{log.recordsFound}</td>
                      <td className="py-3.5 px-3 md:px-4 text-xs font-bold text-emerald-600">{log.recordsInserted}</td>
                      <td className="py-3.5 px-3 md:px-4 text-xs font-bold text-blue-600">{log.recordsUpdated}</td>
                      <td className="py-3.5 px-3 md:px-4 text-xs text-gray-500 break-words" title={log.errorMessage || ""}>
                        {log.errorMessage || "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: CHANGE LOGS */}
      {activeTab === "change-logs" && (
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm overflow-hidden">
          <div className="pb-5 border-b border-gray-100 mb-4">
            <h2 className="text-lg font-bold text-gray-900">
              Exam Revision & Change Logs
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Tracks date postponements, application deadline extensions, and notification revisions
            </p>
          </div>

          <div className="w-full">
            <table className="w-full text-left text-sm table-auto border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500 text-xs uppercase bg-gray-50/70">
                  <th className="py-3 px-3 md:px-4 font-semibold">Changed At</th>
                  <th className="py-3 px-3 md:px-4 font-semibold">Organization</th>
                  <th className="py-3 px-3 md:px-4 font-semibold">Exam Name</th>
                  <th className="py-3 px-3 md:px-4 font-semibold">Field</th>
                  <th className="py-3 px-3 md:px-4 font-semibold">Old Value</th>
                  <th className="py-3 px-3 md:px-4 font-semibold">New Value</th>
                  <th className="py-3 px-3 md:px-4 font-semibold">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {changesLoading ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-gray-500 font-medium">
                      Loading change history...
                    </td>
                  </tr>
                ) : changeLogsData?.data?.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-gray-500 font-medium">
                      No date or status changes detected yet.
                    </td>
                  </tr>
                ) : (
                  changeLogsData?.data?.map((change: ExamChangeLog) => (
                    <tr key={change.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3.5 px-3 md:px-4 text-xs font-mono text-gray-500 break-words">
                        {new Date(change.changedAt).toLocaleString("en-IN")}
                      </td>
                      <td className="py-3.5 px-3 md:px-4 font-semibold text-gray-800 text-xs break-words">{change.organization}</td>
                      <td className="py-3.5 px-3 md:px-4 font-medium text-gray-900 text-xs break-words">{change.examName}</td>
                      <td className="py-3.5 px-3 md:px-4 text-xs font-mono text-indigo-700 font-medium break-words">
                        {change.fieldName}
                      </td>
                      <td className="py-3.5 px-3 md:px-4 text-xs font-mono text-red-600 line-through break-words">
                        {change.oldValue}
                      </td>
                      <td className="py-3.5 px-3 md:px-4 text-xs font-mono text-emerald-600 font-semibold break-words">
                        {change.newValue}
                      </td>
                      <td className="py-3.5 px-3 md:px-4 text-xs text-gray-400 break-words">{change.changeSource}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
