"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Poppins } from "next/font/google";
import SidebarDemo from "@/components/sidebar-demo";
import AuthGuard from "@/components/auth-guard";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import {
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
  GraduationCap,
  Users,
  Building2,
  ArrowUpRight,
  ExternalLink,
  RotateCcw,
  Sparkles,
  Filter,
  Check,
  Info,
  ShieldAlert,
  Search,
} from "lucide-react";
import {
  COMPETITIVE_EXAM_RULES,
  UserCriteria,
  CategoryType,
  GenderType,
  EducationLevel,
  evaluateExamEligibility,
  calculateAgeFromDob,
  EligibilityEvaluation,
} from "@/lib/eligibility-rules";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

export default function EligibilityCheckerPage() {
  const { user } = useAuth();
  const { t } = useLanguage();

  // Form criteria state
  const [dob, setDob] = useState<string>("2002-06-15");
  const [category, setCategory] = useState<CategoryType>("UR");
  const [gender, setGender] = useState<GenderType>("ALL");
  const [education, setEducation] = useState<EducationLevel>("GRAD_ANY");
  const [percentage, setPercentage] = useState<number>(65);
  const [attemptsUsed, setAttemptsUsed] = useState<number>(0);
  const [stateName, setStateName] = useState<string>("All India");

  // Filter state for results
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ELIGIBLE" | "NOT_ELIGIBLE">("ALL");

  // Sync user profile state if present
  useEffect(() => {
    if (user?.state) {
      setStateName(user.state);
    }
  }, [user]);

  const currentAge = useMemo(() => calculateAgeFromDob(dob), [dob]);

  const evaluations: EligibilityEvaluation[] = useMemo(() => {
    const criteria: UserCriteria = {
      dob,
      age: currentAge,
      category,
      gender,
      education,
      percentage,
      attemptsUsed,
      state: stateName,
    };

    return COMPETITIVE_EXAM_RULES.map((rule) =>
      evaluateExamEligibility(rule, criteria)
    );
  }, [dob, currentAge, category, gender, education, percentage, attemptsUsed, stateName]);

  const stats = useMemo(() => {
    const eligibleCount = evaluations.filter(
      (e) => e.status === "ELIGIBLE" || e.status === "CONDITIONALLY_ELIGIBLE"
    ).length;
    const ineligibleCount = evaluations.filter(
      (e) => e.status === "NOT_ELIGIBLE"
    ).length;
    return {
      total: evaluations.length,
      eligible: eligibleCount,
      ineligible: ineligibleCount,
    };
  }, [evaluations]);

  const filteredEvaluations = useMemo(() => {
    return evaluations.filter((item) => {
      // 1. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          item.exam.name.toLowerCase().includes(q) ||
          item.exam.shortName.toLowerCase().includes(q) ||
          item.exam.conductingBody.toLowerCase().includes(q);
        if (!match) return false;
      }

      // 2. Exam category
      if (selectedCategoryTab !== "All" && item.exam.category !== selectedCategoryTab) {
        return false;
      }

      // 3. Status filter
      if (statusFilter === "ELIGIBLE") {
        return item.status === "ELIGIBLE" || item.status === "CONDITIONALLY_ELIGIBLE";
      }
      if (statusFilter === "NOT_ELIGIBLE") {
        return item.status === "NOT_ELIGIBLE";
      }

      return true;
    });
  }, [evaluations, searchQuery, selectedCategoryTab, statusFilter]);

  const handleReset = () => {
    setDob("2002-06-15");
    setCategory("UR");
    setGender("ALL");
    setEducation("GRAD_ANY");
    setPercentage(65);
    setAttemptsUsed(0);
    setSearchQuery("");
    setSelectedCategoryTab("All");
    setStatusFilter("ALL");
  };

  const examCategories = [
    "All",
    "Civil Services",
    "Staff Selection",
    "Banking & Finance",
    "Railways",
    "Defence",
  ];

  return (
    <AuthGuard>
      <SidebarDemo>
        <main
          className={`${poppins.variable} font-poppins flex flex-col w-full h-full overflow-y-auto rounded-tl-2xl border border-neutral-200 bg-[#F4F6FA] p-4 shadow-sm md:p-6 lg:pt-8`}
        >
          <div className="mx-auto w-full max-w-[1600px]">
            {/* Header / Hero Banner matching Yuktiprep Design */}
            <div className="relative w-full overflow-hidden rounded-2xl bg-[#19315D] px-6 py-8 md:rounded-b-none md:px-10 md:py-10">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-1 flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#E0F7FA]">
                      <ClipboardCheck className="h-6 w-6 text-[#258A70]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-teal-200">
                        Official Exam Qualification Engine
                      </p>
                      <h2 className="text-xl font-semibold text-white md:text-2xl">
                        Competitive Exams Eligibility Checker
                      </h2>
                    </div>
                  </div>

                  <div>
                    <h1 className="text-2xl font-bold text-white md:text-3xl">
                      Find Every Exam You Qualify For 🎯
                    </h1>
                    <p className="mt-2 max-w-xl text-sm text-neutral-200 md:text-base font-light leading-relaxed">
                      Instant, multi-criteria verification across UPSC, SSC, Banking, Railways, and Defence with official reservation relaxations and attempt tracking.
                    </p>
                  </div>
                </div>

                {/* Aspirant Hero Visual */}
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

              {/* Bottom Wave SVG Divider */}
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

            {/* Main Content: 2-Column Grid */}
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Criteria Form & Controls (5 Cols) */}
              <div className="lg:col-span-4 flex flex-col gap-5">
                {/* Score / Match Summary Banner */}
                <div className="rounded-[18px] border border-[#E3E7EE] bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
                        Your Match Status
                      </span>
                      <h3 className="text-2xl font-bold text-[#1D2B45] mt-0.5">
                        {stats.eligible} of {stats.total} Exams
                      </h3>
                      <p className="text-xs text-[#258A70] font-medium mt-0.5">
                        Qualified with current profile
                      </p>
                    </div>

                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E6F6F2] text-[#258A70] font-bold text-lg">
                      {Math.round((stats.eligible / stats.total) * 100)}%
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2 pt-4 border-t border-[#F4F6FA] text-center">
                    <div className="rounded-xl bg-[#F4F6FA] p-2">
                      <div className="text-[11px] text-[#6B7280]">Age</div>
                      <div className="text-sm font-bold text-[#1D2B45] mt-0.5">
                        {currentAge} yrs
                      </div>
                    </div>
                    <div className="rounded-xl bg-[#F4F6FA] p-2">
                      <div className="text-[11px] text-[#6B7280]">Category</div>
                      <div className="text-sm font-bold text-[#1D2B45] mt-0.5">
                        {category}
                      </div>
                    </div>
                    <div className="rounded-xl bg-[#F4F6FA] p-2">
                      <div className="text-[11px] text-[#6B7280]">Attempts</div>
                      <div className="text-sm font-bold text-[#1D2B45] mt-0.5">
                        {attemptsUsed} used
                      </div>
                    </div>
                  </div>
                </div>

                {/* Eligibility Criteria Form */}
                <div className="rounded-[18px] border border-[#E3E7EE] bg-white p-5 shadow-sm space-y-5">
                  <div className="flex items-center justify-between border-b border-[#F4F6FA] pb-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-[#258A70]" />
                      <h3 className="text-base font-semibold text-[#1D2B45]">
                        Your Eligibility Profile
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={handleReset}
                      className="flex items-center gap-1 text-xs font-medium text-[#6B7280] hover:text-[#258A70] transition-colors"
                      title="Reset criteria to default"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Reset
                    </button>
                  </div>

                  {/* Date of Birth & Age */}
                  <div>
                    <label className="block text-xs font-semibold text-[#1D2B45] mb-1.5">
                      Date of Birth
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="date"
                        value={dob}
                        max={new Date().toISOString().split("T")[0]}
                        onChange={(e) => setDob(e.target.value)}
                        className="flex-1 px-3 py-2 text-sm border border-[#E3E7EE] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#258A70] bg-[#F4F6FA] text-[#1D2B45]"
                      />
                      <span className="shrink-0 text-xs font-semibold px-3 py-2 bg-[#E0F7FA] text-[#0F7F8C] rounded-xl">
                        {currentAge} Years Old
                      </span>
                    </div>
                  </div>

                  {/* Category & Reservation */}
                  <div>
                    <label className="block text-xs font-semibold text-[#1D2B45] mb-1.5">
                      Social Category / Reservation
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as CategoryType)}
                      className="w-full px-3 py-2 text-sm border border-[#E3E7EE] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#258A70] bg-[#F4F6FA] text-[#1D2B45] font-medium"
                    >
                      <option value="UR">Unreserved / General (UR)</option>
                      <option value="OBC">Other Backward Classes (OBC-NCL) (+3 Yrs)</option>
                      <option value="SC">Scheduled Castes (SC) (+5 Yrs)</option>
                      <option value="ST">Scheduled Tribes (ST) (+5 Yrs)</option>
                      <option value="EWS">Economically Weaker Section (EWS)</option>
                      <option value="PwBD">Persons with Benchmark Disabilities (PwBD) (+10 Yrs)</option>
                    </select>
                  </div>

                  {/* Educational Qualification */}
                  <div>
                    <label className="block text-xs font-semibold text-[#1D2B45] mb-1.5">
                      Highest Completed / Appearing Education
                    </label>
                    <select
                      value={education}
                      onChange={(e) => setEducation(e.target.value as EducationLevel)}
                      className="w-full px-3 py-2 text-sm border border-[#E3E7EE] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#258A70] bg-[#F4F6FA] text-[#1D2B45] font-medium"
                    >
                      <option value="GRAD_ANY">Graduate / Bachelor's Degree (Any Stream - BA, BSc, BCom, BTech)</option>
                      <option value="GRAD_ENGG">B.E. / B.Tech / Engineering Degree</option>
                      <option value="GRAD_COMMERCE">B.Com / Finance / Economics Graduate</option>
                      <option value="GRAD_LAW">LL.B. / Integrated Law Degree</option>
                      <option value="POST_GRAD">Post Graduate / Master's Degree</option>
                      <option value="DIPLOMA">Polytechnic / 3-Year Technical Diploma</option>
                      <option value="12TH_SCIENCE">12th Standard (PCM / Science)</option>
                      <option value="12TH_ANY">12th Standard (Commerce / Arts / Any)</option>
                      <option value="10TH">10th Standard / Matriculation</option>
                    </select>
                  </div>

                  {/* Percentage in Qualification */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-[#1D2B45]">
                        Graduation / Board Percentage
                      </label>
                      <span className="text-xs font-bold text-[#258A70]">
                        {percentage}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="35"
                      max="100"
                      value={percentage}
                      onChange={(e) => setPercentage(Number(e.target.value))}
                      className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#258A70]"
                    />
                    <div className="flex justify-between text-[10px] text-[#9CA3AF] mt-1">
                      <span>Pass (35%)</span>
                      <span>50%</span>
                      <span>60% (RBI/First Div)</span>
                      <span>100%</span>
                    </div>
                  </div>

                  {/* Gender & Attempts */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#1D2B45] mb-1.5">
                        Gender
                      </label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value as GenderType)}
                        className="w-full px-3 py-2 text-sm border border-[#E3E7EE] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#258A70] bg-[#F4F6FA] text-[#1D2B45]"
                      >
                        <option value="ALL">All / Not Specified</option>
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#1D2B45] mb-1.5">
                        UPSC / SBI Attempts
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        value={attemptsUsed}
                        onChange={(e) => setAttemptsUsed(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full px-3 py-2 text-sm border border-[#E3E7EE] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#258A70] bg-[#F4F6FA] text-[#1D2B45]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Matched Exams & Breakdown (8 Cols) */}
              <div className="lg:col-span-8 flex flex-col gap-5">
                {/* Search & Filter Strip */}
                <div className="rounded-[18px] border border-[#E3E7EE] bg-white p-4 shadow-sm space-y-3">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    {/* Search Bar */}
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search exam (e.g. UPSC CSE, SSC CGL, IBPS, RRB)..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 text-sm border border-[#E3E7EE] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#258A70] bg-[#F4F6FA] text-[#1D2B45] placeholder-[#9CA3AF]"
                      />
                    </div>

                    {/* Status Toggle Buttons */}
                    <div className="flex items-center gap-1 bg-[#F4F6FA] border border-[#E3E7EE] p-1 rounded-xl shrink-0">
                      <button
                        type="button"
                        onClick={() => setStatusFilter("ALL")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                          statusFilter === "ALL"
                            ? "bg-white text-[#1D2B45] shadow-xs"
                            : "text-[#6B7280] hover:text-[#1D2B45]"
                        }`}
                      >
                        All ({stats.total})
                      </button>
                      <button
                        type="button"
                        onClick={() => setStatusFilter("ELIGIBLE")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                          statusFilter === "ELIGIBLE"
                            ? "bg-[#258A70] text-white shadow-xs"
                            : "text-[#258A70] hover:text-[#1D2B45]"
                        }`}
                      >
                        Eligible ({stats.eligible})
                      </button>
                      <button
                        type="button"
                        onClick={() => setStatusFilter("NOT_ELIGIBLE")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                          statusFilter === "NOT_ELIGIBLE"
                            ? "bg-[#D9534F] text-white shadow-xs"
                            : "text-[#D9534F] hover:text-[#1D2B45]"
                        }`}
                      >
                        Ineligible ({stats.ineligible})
                      </button>
                    </div>
                  </div>

                  {/* Category Pills */}
                  <div className="flex items-center gap-2 overflow-x-auto pt-2 scrollbar-none border-t border-[#F4F6FA]">
                    {examCategories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedCategoryTab(cat)}
                        className={`px-3.5 py-1 rounded-full text-xs shrink-0 transition ${
                          selectedCategoryTab === cat
                            ? "bg-[#19315D] text-white font-semibold shadow-xs"
                            : "bg-[#F4F6FA] text-[#6B7280] hover:text-[#1D2B45] font-medium"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Exam Cards Grid */}
                <div className="flex flex-col gap-4">
                  {filteredEvaluations.length === 0 ? (
                    <div className="rounded-[18px] border border-[#E3E7EE] bg-white p-10 text-center shadow-sm">
                      <ShieldAlert className="w-12 h-12 text-[#9CA3AF] mx-auto mb-3 opacity-50" />
                      <h4 className="text-base font-semibold text-[#1D2B45]">
                        No Examinations Found
                      </h4>
                      <p className="text-xs text-[#6B7280] mt-1 max-w-sm mx-auto">
                        Try clearing your search keyword or switching between All / Eligible filters.
                      </p>
                    </div>
                  ) : (
                    filteredEvaluations.map((item) => {
                      const isEligible = item.status === "ELIGIBLE";
                      const isConditional = item.status === "CONDITIONALLY_ELIGIBLE";
                      const isNotEligible = item.status === "NOT_ELIGIBLE";

                      return (
                        <div
                          key={item.exam.id}
                          className={`rounded-[18px] border bg-white p-5 shadow-sm transition hover:shadow-md ${
                            isEligible
                              ? "border-l-4 border-l-[#258A70] border-[#E3E7EE]"
                              : isConditional
                              ? "border-l-4 border-l-[#E67E22] border-[#E3E7EE]"
                              : "border-l-4 border-l-gray-300 border-[#E3E7EE] opacity-90"
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-full bg-[#E0F7FA] px-2.5 py-0.5 text-[11px] font-semibold text-[#238A8D] uppercase">
                                  {item.exam.category}
                                </span>
                                <span className="text-xs text-[#6B7280]">
                                  • {item.exam.conductingBody}
                                </span>
                              </div>

                              <h3 className="text-base font-bold text-[#1D2B45] mt-1">
                                {item.exam.name} ({item.exam.shortName})
                              </h3>
                              <p className="text-xs text-[#6B7280] mt-1 leading-relaxed">
                                {item.exam.description}
                              </p>
                            </div>

                            {/* Eligibility Badge */}
                            <div className="shrink-0">
                              {isEligible && (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E6F6F2] px-3.5 py-1 text-xs font-bold text-[#258A70]">
                                  <CheckCircle2 className="w-4 h-4" />
                                  Eligible
                                </span>
                              )}
                              {isConditional && (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FEF3E6] px-3.5 py-1 text-xs font-bold text-[#E67E22]">
                                  <AlertCircle className="w-4 h-4" />
                                  Relaxation Match
                                </span>
                              )}
                              {isNotEligible && (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FEECEC] px-3.5 py-1 text-xs font-bold text-[#D9534F]">
                                  <XCircle className="w-4 h-4" />
                                  Not Eligible
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Rule Criteria Badges */}
                          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-[#F4F6FA] text-xs">
                            <div className="flex items-center gap-1.5">
                              {item.matchedCriteria.ageOk ? (
                                <Check className="w-3.5 h-3.5 text-[#258A70]" />
                              ) : (
                                <XCircle className="w-3.5 h-3.5 text-[#D9534F]" />
                              )}
                              <span className="text-[#6B7280]">
                                Age: <b className="text-[#1D2B45]">{item.exam.minAge} - {item.effectiveMaxAge} yrs</b>
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              {item.matchedCriteria.educationOk ? (
                                <Check className="w-3.5 h-3.5 text-[#258A70]" />
                              ) : (
                                <XCircle className="w-3.5 h-3.5 text-[#D9534F]" />
                              )}
                              <span className="text-[#6B7280]">
                                Qualification: <b className="text-[#1D2B45]">{item.exam.allowedEducations.includes("10TH") ? "10th+" : item.exam.allowedEducations.includes("12TH_ANY") ? "12th+" : "Degree"}</b>
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              {item.matchedCriteria.percentageOk ? (
                                <Check className="w-3.5 h-3.5 text-[#258A70]" />
                              ) : (
                                <XCircle className="w-3.5 h-3.5 text-[#D9534F]" />
                              )}
                              <span className="text-[#6B7280]">
                                Min Marks: <b className="text-[#1D2B45]">{item.exam.minPercentage ? `${item.exam.minPercentage}%` : "Passing"}</b>
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              {item.matchedCriteria.attemptsOk ? (
                                <Check className="w-3.5 h-3.5 text-[#258A70]" />
                              ) : (
                                <XCircle className="w-3.5 h-3.5 text-[#D9534F]" />
                              )}
                              <span className="text-[#6B7280]">
                                Max Attempts: <b className="text-[#1D2B45]">{item.effectiveAttempts}</b>
                              </span>
                            </div>
                          </div>

                          {/* Reasons or Relaxations */}
                          {item.reasons.length > 0 && (
                            <div className="mt-3 rounded-xl bg-[#F4F6FA] p-3 text-xs space-y-1">
                              {item.reasons.map((r, i) => (
                                <p
                                  key={i}
                                  className={`flex items-start gap-1.5 ${
                                    isNotEligible
                                      ? "text-[#B91C1C]"
                                      : "text-[#258A70] font-medium"
                                  }`}
                                >
                                  <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                                  <span>{r}</span>
                                </p>
                              ))}
                            </div>
                          )}

                          {/* Key Highlights */}
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {item.exam.keyHighlights.map((hl, i) => (
                              <span
                                key={i}
                                className="rounded-md bg-[#F4F6FA] px-2 py-0.5 text-[11px] text-[#4B5563]"
                              >
                                ✓ {hl}
                              </span>
                            ))}
                          </div>

                          {/* Action Links */}
                          <div className="mt-4 flex items-center justify-between pt-3 border-t border-[#F4F6FA] text-xs">
                            <Link
                              href={item.exam.calendarPath || "/exams"}
                              className="inline-flex items-center gap-1 font-semibold text-[#0F7F8C] hover:text-[#19315D] transition-colors"
                            >
                              <Calendar className="w-3.5 h-3.5" />
                              View 2026 Exam Dates & Deadlines
                            </Link>

                            <a
                              href={item.exam.officialUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 font-semibold text-[#6B7280] hover:text-[#1D2B45] transition-colors"
                            >
                              Official Portal
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            <div className="h-10" />
          </div>
        </main>
      </SidebarDemo>
    </AuthGuard>
  );
}
