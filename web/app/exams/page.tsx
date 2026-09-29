"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Poppins } from "next/font/google";
import SidebarDemo from "@/components/sidebar-demo";
import AuthGuard from "@/components/auth-guard";
import { api } from "@/lib/api";
import { useLanguage } from "@/lib/language-context";
import {
  CalendarDays,
  Search,
  Building2,
  MapPin,
  Clock,
  Layers,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ArrowUpRight,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

interface CompetitiveExam {
  id: string;
  name: string;
  organization: string;
  state: string;
  category: string;
  examType?: string;
  notificationDate?: string;
  applicationStart?: string;
  applicationEnd?: string;
  examDate?: string;
  examDateText?: string;
  status: string;
  officialUrl: string;
  sourceUrl: string;
}

export default function ExamCalendarPage() {
  const { t } = useLanguage();
  const [exams, setExams] = useState<CompetitiveExam[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [orgFilter, setOrgFilter] = useState("All");
  const [yearFilter, setYearFilter] = useState("2026");
  const [viewMode, setViewMode] = useState<"cards" | "timeline">("cards");
  const [page, setPage] = useState(1);
  const limit = 18;

  const categories = [
    "All",
    "Central Government",
    "State Government",
    "Banking",
    "Railway",
    "Defence",
    "Entrance & Eligibility",
  ];

  const fetchExams = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", String(page));
      params.append("limit", String(limit));
      if (search.trim()) params.append("search", search.trim());
      if (categoryFilter !== "All") params.append("category", categoryFilter);
      if (orgFilter !== "All") params.append("organization", orgFilter);
      if (yearFilter) params.append("year", yearFilter);

      const res = await api.get(`/api/v1/competitive-exams?${params.toString()}`);
      if (res?.data && Array.isArray(res.data)) {
        setExams(res.data);
        setTotalCount(res.total || res.data.length);
      } else if (Array.isArray(res)) {
        setExams(res);
        setTotalCount(res.length);
      } else {
        setExams([]);
        setTotalCount(0);
      }
    } catch (err) {
      console.error("Failed to load competitive exams", err);
      setExams([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, [search, categoryFilter, orgFilter, yearFilter, page]);

  const totalPages = Math.ceil(totalCount / limit) || 1;

  return (
    <AuthGuard>
      <SidebarDemo>
        <main
          className={`${poppins.variable} font-poppins flex flex-col w-full h-full overflow-y-auto rounded-tl-2xl border border-neutral-200 bg-[#F4F6FA] p-4 shadow-sm md:p-6 lg:pt-8`}
        >
          <div className="mx-auto w-full max-w-[1600px]">
            {/* Hero Header matching Home Page Dashboard */}
            <div className="relative w-full overflow-hidden rounded-2xl bg-[#19315D] px-6 py-8 md:rounded-b-none md:px-10 md:py-10">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-1 flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#E0F7FA]">
                      <CalendarDays className="h-5 w-5 text-[#238A8D]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-teal-200">
                        Official Exam Calendar
                      </p>
                      <h2 className="text-xl font-semibold text-white md:text-2xl">
                        Exam Schedules & Deadlines (2026+)
                      </h2>
                    </div>
                  </div>

                  <div>
                    <h1 className="text-2xl font-bold text-white md:text-3xl">
                      Plan Your Next Milestone 🎯
                    </h1>
                    <p className="mt-2 max-w-xl text-sm text-neutral-200 md:text-base font-light leading-relaxed">
                      Verified examination dates, application windows, and official portals aggregated deterministically from UPSC, SSC, RRB, and State PSCs.
                    </p>
                  </div>
                </div>

                {/* Aspirant Hero Visual (Exact Home Page Graphic) */}
                <div className="flex justify-center md:w-64 md:flex-shrink-0">
                  <div className="h-32 w-40 md:h-40 md:w-48">
                    <Image
                      src="/aspirants.png"
                      alt="Aspirants"
                      width={192}
                      height={160}
                      priority
                      className="h-full w-full object-cover scale-125"
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Wave SVG Divider matching Home Dashboard */}
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

            {/* Filter & Search Bar Section */}
            <section className="mt-6">
              <div className="mb-4 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#238A8D]" />
                  <h3 className="text-lg font-semibold text-[#1D2B45]">
                    Filter & Search Examinations
                  </h3>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center gap-1 rounded-xl border border-[#E3E7EE] bg-white p-1 shadow-xs">
                  <button
                    type="button"
                    onClick={() => setViewMode("cards")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${viewMode === "cards"
                        ? "bg-[#238A8D] text-white shadow-xs font-semibold"
                        : "text-[#6B7280] hover:text-[#1D2B45]"
                      }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    Card View
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("timeline")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${viewMode === "timeline"
                        ? "bg-[#238A8D] text-white shadow-xs font-semibold"
                        : "text-[#6B7280] hover:text-[#1D2B45]"
                      }`}
                  >
                    <CalendarDays className="w-3.5 h-3.5" />
                    Timeline View
                  </button>
                </div>
              </div>

              {/* Filter Card Container */}
              <div className="rounded-[18px] border border-[#E3E7EE] bg-white p-5 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                  {/* Search Bar */}
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search by exam name, organization, or state..."
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                      }}
                      className="w-full pl-10 pr-4 py-2.5 text-sm border border-[#E3E7EE] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#238A8D] bg-[#F4F6FA] text-[#1D2B45] placeholder-[#9CA3AF]"
                    />
                  </div>

                  {/* Year & Portal Dropdowns */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    <div className="flex items-center gap-1.5 bg-[#F4F6FA] border border-[#E3E7EE] rounded-xl px-3 py-2 text-xs text-[#1D2B45]">
                      <span className="text-[#6B7280] font-medium">Year:</span>
                      <select
                        value={yearFilter}
                        onChange={(e) => {
                          setYearFilter(e.target.value);
                          setPage(1);
                        }}
                        className="bg-transparent font-semibold text-[#1D2B45] focus:outline-none cursor-pointer"
                      >
                        <option value="2026">2026</option>
                        <option value="2027">2027</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-1.5 bg-[#F4F6FA] border border-[#E3E7EE] rounded-xl px-3 py-2 text-xs text-[#1D2B45]">
                      <Building2 className="w-3.5 h-3.5 text-[#238A8D]" />
                      <select
                        value={orgFilter}
                        onChange={(e) => {
                          setOrgFilter(e.target.value);
                          setPage(1);
                        }}
                        className="bg-transparent font-semibold text-[#1D2B45] focus:outline-none cursor-pointer"
                      >
                        <option value="All">All Portals</option>
                        <option value="UPSC">UPSC</option>
                        <option value="SSC">SSC</option>
                        <option value="RRB">Railway (RRB)</option>
                        <option value="APPSC">APPSC</option>
                        <option value="TNPSC">TNPSC</option>
                        <option value="UPPSC">UPPSC</option>
                        <option value="JPSC">JPSC</option>
                        <option value="UKPSC">UKPSC</option>
                        <option value="HPSC">HPSC</option>
                        <option value="RPSC">RPSC</option>
                        <option value="IBPS">IBPS</option>
                        <option value="SBI">SBI</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Category Pills */}
                <div className="flex items-center gap-2 overflow-x-auto pt-2 scrollbar-none border-t border-[#F4F6FA]">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setCategoryFilter(cat);
                        setPage(1);
                      }}
                      className={`px-3.5 py-1.5 rounded-full text-xs transition-all ${categoryFilter === cat
                          ? "bg-[#238A8D] text-white shadow-xs font-semibold"
                          : "bg-[#F4F6FA] text-[#6B7280] font-medium hover:text-[#1D2B45] hover:bg-neutral-200/60"
                        }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Results Section */}
            <section className="mt-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#238A8D]" />
                  <h3 className="text-lg font-semibold text-[#1D2B45]">
                    Scheduled Exams
                  </h3>
                  <span className="text-xs text-[#6B7280] font-normal">
                    ({totalCount} verified records)
                  </span>
                </div>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 rounded-[18px] bg-white border border-[#E3E7EE] p-8 text-center shadow-sm">
                  <div className="w-9 h-9 border-3 border-[#238A8D] border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-sm text-[#6B7280] mt-4 font-medium">
                    Fetching verified exam schedules...
                  </p>
                </div>
              ) : exams.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 rounded-[18px] bg-white border border-[#E3E7EE] p-8 text-center shadow-sm">
                  <CalendarDays className="w-12 h-12 text-[#9CA3AF] mb-3 opacity-50" />
                  <h4 className="text-base font-semibold text-[#1D2B45]">
                    No Scheduled Exams Found
                  </h4>
                  <p className="text-xs text-[#6B7280] mt-1 max-w-sm">
                    Try broadening your search query or choosing All Portals.
                  </p>
                </div>
              ) : viewMode === "cards" ? (
                /* Card View matching Home UI */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {exams.map((exam) => {
                    const formattedExamDate = exam.examDate
                      ? new Date(exam.examDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                      : exam.examDateText || "Tentative 2026";

                    return (
                      <div
                        key={exam.id}
                        className="group flex flex-col justify-between rounded-[18px] border border-[#E3E7EE] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                      >
                        <div>
                          {/* Badges Bar */}
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <span className="rounded-full bg-[#E0F7FA] px-2.5 py-1 text-[10px] font-semibold text-[#238A8D] uppercase tracking-wide flex items-center gap-1">
                              <Building2 className="w-3 h-3" />
                              {exam.organization}
                            </span>

                            <span className="inline-flex items-center gap-1 text-[11px] text-[#6B7280]">
                              <MapPin className="w-3 h-3 text-[#9CA3AF]" />
                              {exam.state}
                            </span>
                          </div>

                          {/* Exam Title */}
                          <h4 className="text-sm font-semibold text-[#1D2B45] leading-snug line-clamp-2 group-hover:text-[#238A8D] transition-colors">
                            {exam.name}
                          </h4>

                          {/* Details Box */}
                          <div className="mt-4 rounded-[14px] bg-[#F4F6FA] p-3.5 space-y-2 border border-[#E3E7EE]/80 text-xs">
                            <div className="flex items-center justify-between text-[#6B7280]">
                              <span className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-[#E67E22]" />
                                Application End:
                              </span>
                              <span className="font-medium text-[#1D2B45]">
                                {exam.applicationEnd
                                  ? new Date(exam.applicationEnd).toLocaleDateString("en-IN", {
                                    day: "numeric",
                                    month: "short",
                                  })
                                  : "See Notification"}
                              </span>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-[#E3E7EE]">
                              <span className="flex items-center gap-1.5 text-[#6B7280]">
                                <CalendarDays className="w-3.5 h-3.5 text-[#238A8D]" />
                                Exam Date:
                              </span>
                              <span className="font-bold text-[#19315D] font-mono">
                                {formattedExamDate}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="mt-4 pt-3 border-t border-[#E3E7EE] flex items-center justify-between">
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#258A70] bg-[#E8F5E9] px-2.5 py-0.5 rounded-full capitalize">
                            <CheckCircle2 className="w-3 h-3" />
                            {exam.status}
                          </span>

                          <a
                            href={exam.officialUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-[#238A8D] hover:text-[#19315D] transition-colors"
                          >
                            Official Portal
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Timeline View matching Home UI */
                <div className="rounded-[18px] border border-[#E3E7EE] bg-white p-5 shadow-sm divide-y divide-[#E3E7EE]/80">
                  {exams.map((exam, idx) => {
                    const formattedExamDate = exam.examDate
                      ? new Date(exam.examDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                      : exam.examDateText || "Tentative 2026";

                    return (
                      <div
                        key={exam.id}
                        className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                      >
                        <div className="flex items-start gap-3.5">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E0F7FA] font-bold text-xs text-[#238A8D]">
                            {(page - 1) * limit + idx + 1}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="rounded-full bg-[#E0F7FA] px-2.5 py-0.5 text-[10px] font-semibold text-[#238A8D] uppercase">
                                {exam.organization}
                              </span>
                              <span className="text-xs text-[#6B7280]">
                                • {exam.state}
                              </span>
                            </div>
                            <h4 className="text-sm font-semibold text-[#1D2B45] mt-1 group-hover:text-[#238A8D] transition-colors">
                              {exam.name}
                            </h4>
                          </div>
                        </div>

                        <div className="flex items-center justify-between md:justify-end gap-6 shrink-0 pl-13 md:pl-0">
                          <div className="text-right">
                            <div className="text-[11px] text-[#6B7280]">Scheduled Date</div>
                            <div className="text-xs font-bold text-[#19315D] font-mono mt-0.5">
                              {formattedExamDate}
                            </div>
                          </div>

                          <a
                            href={exam.officialUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 rounded-xl border border-[#E3E7EE] bg-[#F4F6FA] px-3 py-1.5 text-xs font-semibold text-[#1D2B45] hover:bg-[#238A8D] hover:text-white transition-colors"
                          >
                            Portal
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 rounded-[16px] border border-[#E3E7EE] bg-white px-5 py-3 text-xs text-[#6B7280] shadow-sm">
                  <div>
                    Showing{" "}
                    <span className="font-semibold text-[#1D2B45]">
                      {(page - 1) * limit + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-semibold text-[#1D2B45]">
                      {Math.min(page * limit, totalCount)}
                    </span>{" "}
                    of <span className="font-semibold text-[#1D2B45]">{totalCount}</span> exams
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                      className="flex items-center gap-1 rounded-lg border border-[#E3E7EE] px-3 py-1.5 font-medium text-[#1D2B45] hover:bg-[#F4F6FA] disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" /> Previous
                    </button>

                    <span className="px-2 font-medium">
                      Page {page} of {totalPages}
                    </span>

                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                      className="flex items-center gap-1 rounded-lg border border-[#E3E7EE] px-3 py-1.5 font-medium text-[#1D2B45] hover:bg-[#F4F6FA] disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                      Next <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </section>
            <div className="h-8" />
          </div>
        </main>
      </SidebarDemo>
    </AuthGuard>
  );
}

