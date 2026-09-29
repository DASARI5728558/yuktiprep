"use client";
import { useState, useEffect, useMemo } from "react";
import {
  Zap,
  X,
  BookOpen,
  Clock,
  Target,
  ArrowRight,
  ExternalLink,
  Search,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  Bookmark,
  Share2,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

interface CurrentAffairItem {
  id: string;
  title: string;
  summary: string;
  theme: string;
  score: number;
  source_name: string;
  url: string;
  published_at: string;
  prelims: number;
  mains: number;
  pcs: number;
  ssc: number;
  banking: number;
  static_link?: string;
  translationStatus?: string;
}

interface QuestionItem {
  question: string;
  options: string[];
  answer: string;
  answer_basis: string;
  exam: string;
  priority: number;
  question_type: string;
  source_url: string;
  created_at: string;
}

// Fallback initial briefs if backend is unreachable
const fallbackBriefs: CurrentAffairItem[] = [
  {
    id: "fallback-1",
    theme: "Governance & Polity",
    title:
      "Digital public infrastructure and the next phase of inclusive service delivery",
    summary:
      "India's DPI stack, built upon Aadhaar, UPI, and DigiLocker, is evolving into open-network architecture for credit enablement, healthcare records, and grievance redressal.",
    score: 88,
    source_name: "PIB Delhi",
    url: "https://pib.gov.in",
    published_at: new Date().toISOString(),
    prelims: 1,
    mains: 1,
    pcs: 1,
    ssc: 0,
    banking: 1,
    static_link: "GS II - Governance, Constitution and Citizen Centric Delivery",
  },
  {
    id: "fallback-2",
    theme: "International Relations",
    title: "India’s evolving role in the Indo-Pacific economic framework",
    summary:
      "Strategic partnerships and multilateral cooperation under IPEF focus on resilient supply chains, clean economy pillars, and digital trade governance.",
    score: 82,
    source_name: "Ministry of External Affairs",
    url: "https://mea.gov.in",
    published_at: new Date(Date.now() - 86400000).toISOString(),
    prelims: 1,
    mains: 1,
    pcs: 1,
    ssc: 0,
    banking: 0,
    static_link: "GS II - Bilateral, regional and global groupings involving India",
  },
  {
    id: "fallback-3",
    theme: "Environment & Ecology",
    title:
      "Urban heat action plans: policy design, finance and local governance capacity",
    summary:
      "Municipal corporations integrate early heatwave warning systems, cool roof policies, and dedicated climate-resilience budgetary allocations.",
    score: 75,
    source_name: "Down To Earth / MoEFCC",
    url: "https://moef.gov.in",
    published_at: new Date(Date.now() - 172800000).toISOString(),
    prelims: 1,
    mains: 1,
    pcs: 1,
    ssc: 1,
    banking: 0,
    static_link: "GS III - Conservation, environmental pollution and degradation",
  },
  {
    id: "fallback-4",
    theme: "Economy & Banking",
    title: "Monetary transmission, household credit and financial stability",
    summary:
      "The Reserve Bank reviews repo rate passthrough across retail banking credit, lending benchmarks, and systemic liquidity buffers.",
    score: 79,
    source_name: "Reserve Bank of India",
    url: "https://rbi.org.in",
    published_at: new Date(Date.now() - 259200000).toISOString(),
    prelims: 1,
    mains: 1,
    pcs: 0,
    ssc: 1,
    banking: 1,
    static_link: "GS III - Indian Economy and issues relating to planning and resource mobilisation",
  },
];

export default function CurrentAffairs() {
  const [activeTab, setActiveTab] = useState<"today" | "weekly" | "monthly" | "alerts">("today");
  const [items, setItems] = useState<CurrentAffairItem[]>([]);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTheme, setSelectedTheme] = useState("ALL");
  const [monthLabel, setMonthLabel] = useState<string>("");
  const [selectedItem, setSelectedItem] = useState<CurrentAffairItem | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("We will implement this feature soon!");
  const [visibleCount, setVisibleCount] = useState<number>(15);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [revealedAnswers, setRevealedAnswers] = useState<Record<number, boolean>>({});

  const notify = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  const fetchAffairsData = async (tab: "today" | "weekly" | "monthly" | "alerts") => {
    setLoading(true);
    setError(null);
    const backendBase = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://ba.yuktiprep.com").replace(/\/$/, "");
    try {
      if (tab === "alerts") {
        // Fetch syllabus-linked practice questions
        const res = await fetch(`${backendBase}/api/current-affairs/questions`);
        if (!res.ok) throw new Error("Failed to fetch exam questions");
        const qData: QuestionItem[] = await res.json();
        setQuestions(qData || []);
      } else {
        const endpoint =
          tab === "today"
            ? `${backendBase}/api/current-affairs/daily`
            : tab === "weekly"
              ? `${backendBase}/api/current-affairs/weekly`
              : `${backendBase}/api/current-affairs/monthly`;

        const res = await fetch(endpoint);
        if (!res.ok) throw new Error(`Failed to load ${tab} current affairs`);
        const json = await res.json();

        let list: CurrentAffairItem[] = [];
        if (tab === "monthly") {
          list = json.items || [];
          if (json.month_label) setMonthLabel(json.month_label);
        } else {
          list = Array.isArray(json) ? json : [];
        }

        // If backend returned empty list, fallback to /api/current-affairs/affairs
        if (list.length === 0) {
          try {
            const fallbackRes = await fetch(`${backendBase}/api/current-affairs/affairs`);
            if (fallbackRes.ok) {
              const allAffairs = await fallbackRes.json();
              if (Array.isArray(allAffairs) && allAffairs.length > 0) {
                list = allAffairs.slice(0, 15);
              }
            }
          } catch {
            // ignore
          }
        }

        setItems(list.length > 0 ? list : fallbackBriefs);
      }
    } catch (err: any) {
      console.error("Error fetching current affairs:", err);
      setError("Unable to load latest feed from backend. Showing verified archive.");
      setItems(fallbackBriefs);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAffairsData(activeTab);
  }, [activeTab]);

  // Distinct themes
  const availableThemes = useMemo(() => {
    const s = new Set<string>();
    items.forEach((item) => {
      if (item.theme) s.add(item.theme);
    });
    return ["ALL", ...Array.from(s)];
  }, [items]);

  // Filtered items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchTheme = selectedTheme === "ALL" || item.theme === selectedTheme;
      const matchSearch =
        searchQuery === "" ||
        item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.source_name?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchTheme && matchSearch;
    });
  }, [items, selectedTheme, searchQuery]);

  // Filtered questions
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      if (!searchQuery) return true;
      const qLower = searchQuery.toLowerCase();
      return (
        q.question?.toLowerCase().includes(qLower) ||
        q.exam?.toLowerCase().includes(qLower) ||
        q.answer_basis?.toLowerCase().includes(qLower) ||
        (Array.isArray(q.options) && q.options.some((opt) => opt.toLowerCase().includes(qLower)))
      );
    });
  }, [questions, searchQuery]);

  // Exam labels helper
  const getExamBadges = (item: CurrentAffairItem) => {
    const list: string[] = [];
    if (item.prelims) list.push("Prelims");
    if (item.mains) list.push("Mains (GS)");
    if (item.pcs || item.ssc) list.push("Personal Interview");
    if (item.banking) list.push("Banking");
    return list.length > 0 ? list : ["General Studies"];
  };

  const getPriorityBadge = (score: number) => {
    if (score >= 75) return { label: "High", color: "text-[var(--gold)]" };
    if (score >= 50) return { label: "Medium", color: "text-[var(--teal)]" };
    return { label: "Standard", color: "text-gray-400" };
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      <Navbar />

      {/* Interactive Floating Toast */}
      {showToast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-[var(--primarynavy)] text-white pl-6 pr-4 py-3 rounded-full shadow-2xl z-50 flex items-center gap-3 animate-[pulse_0.3s_ease-in-out]">
          <Zap size={18} className="text-[var(--gold)]" fill="currentColor" />
          <span className="font-medium text-[15px]">{toastMessage}</span>
          <button
            onClick={() => setShowToast(false)}
            className="ml-2 hover:bg-white/10 p-1.5 rounded-full transition-colors flex items-center justify-center text-white/70 hover:text-white"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Article Detail Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-y-auto"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full p-5 sm:p-8 shadow-2xl border border-[rgba(18,47,43,0.1)] relative my-auto max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-[var(--primarynavy)] transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>

            <span className="text-[11px] font-extrabold tracking-widest text-[var(--primaryblue)] uppercase mb-2 block pr-8">
              {selectedItem.theme}
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--primarynavy)] mb-4 leading-snug pr-8">
              {selectedItem.title}
            </h2>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-semibold text-[#8b9b96] pb-4 mb-5 border-b border-gray-100">
              <span className="bg-[#eef6f9] text-[var(--primarynavy)] px-2.5 py-1 rounded-md">
                Source: {selectedItem.source_name || "Official Bureau"}
              </span>
              <span className="bg-[#eef6f9] text-[var(--primarynavy)] px-2.5 py-1 rounded-md">
                Priority: {selectedItem.score}/100
              </span>
              {selectedItem.published_at && (
                <span className="text-gray-500">
                  {new Date(selectedItem.published_at).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              )}
            </div>

            <div className="text-sm text-[#49605c] leading-relaxed mb-6 space-y-3">
              <p className="font-medium text-[#1c2c28]">{selectedItem.summary}</p>
              {selectedItem.static_link && (
                <div className="bg-[#f0f8f8] border-l-4 border-[var(--teal)] p-3.5 rounded-r-xl">
                  <span className="text-xs font-bold text-[var(--primarynavy)] block uppercase tracking-wide mb-1">
                    Syllabus Connection
                  </span>
                  <p className="text-xs text-[#2c4742]">{selectedItem.static_link}</p>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {getExamBadges(selectedItem).map((badge) => (
                <span
                  key={badge}
                  className="bg-[#f4f9fb] text-[var(--primarynavy)] font-bold text-[11px] px-3 py-1.5 rounded-md flex items-center gap-1.5"
                >
                  <Target size={13} /> {badge}
                </span>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100">
              {selectedItem.url ? (
                <a
                  href={selectedItem.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-bold text-[var(--primarynavy)]! hover:underline w-full sm:w-auto justify-center sm:justify-start"
                >
                  View Primary Source <ExternalLink size={15} />
                </a>
              ) : (
                <span className="text-xs text-gray-400">Official gazette brief</span>
              )}

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setSelectedItem(null)}
                  className="w-full sm:w-auto px-5 py-2.5 hover:bg-[var(--primarynavy)]! cursor-pointer text-white font-bold text-sm rounded-xl bg-[var(--primaryblue)]! transition-colors text-center"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Header */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-[1200px] mx-auto w-full flex flex-col items-center">
        <div className="text-center mb-10 w-full max-w-3xl mx-auto flex flex-col items-center">
          <span className="inline-flex items-center gap-2 mt-12 sm:mt-15 bg-[#e6f4f8] text-[var(--primarynavy)] px-4 py-1.5 rounded-full text-[11px] font-extrabold tracking-[0.18em] uppercase mb-4 shadow-2xs">
            <Sparkles size={14} className="text-[var(--gold)]" />
            {new Date().toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}{" "}
            · LIVE VERIFIED CURATION
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-[54px] my-4 text-[var(--primarynavy)] tracking-tight leading-tight text-center">
            Current affairs, <br className="hidden sm:block" />
            <em className="text-[var(--primaryblue)] font-normal not-italic">
              connected to your syllabus.
            </em>
          </h1>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-2.5 mb-8 w-full">
            <button
              onClick={() => setActiveTab("today")}
              className={`px-5 sm:px-6 py-2 sm:py-2.5 rounded-full font-bold text-xs sm:text-sm transition-all shadow-xs cursor-pointer ${activeTab === "today"
                ? "bg-[var(--primarynavy)] text-white shadow-md"
                : "bg-white border border-[rgba(18,47,43,0.12)] text-[var(--primarynavy)] hover:bg-[#e6f2f7]"
                }`}
            >
              Today&apos;s Briefs
            </button>
            <button
              onClick={() => setActiveTab("weekly")}
              className={`px-5 sm:px-6 py-2 sm:py-2.5 rounded-full font-bold text-xs sm:text-sm transition-all shadow-xs cursor-pointer ${activeTab === "weekly"
                ? "bg-[var(--primarynavy)] text-white shadow-md"
                : "bg-white border border-[rgba(18,47,43,0.12)] text-[var(--primarynavy)] hover:bg-[#e6f2f7]"
                }`}
            >
              This Week
            </button>
            <button
              onClick={() => setActiveTab("monthly")}
              className={`px-5 sm:px-6 py-2 sm:py-2.5 rounded-full font-bold text-xs sm:text-sm transition-all shadow-xs cursor-pointer ${activeTab === "monthly"
                ? "bg-[var(--primarynavy)] text-white shadow-md"
                : "bg-white border border-[rgba(18,47,43,0.12)] text-[var(--primarynavy)] hover:bg-[#e6f2f7]"
                }`}
            >
              {monthLabel ? `Monthly (${monthLabel})` : "Monthly Compilation"}
            </button>
            <button
              onClick={() => setActiveTab("alerts")}
              className={`px-5 sm:px-6 py-2 sm:py-2.5 rounded-full font-bold text-xs sm:text-sm transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer ${activeTab === "alerts"
                ? "bg-[var(--primarynavy)] text-white shadow-md"
                : "bg-white border border-[rgba(18,47,43,0.12)] text-[var(--primarynavy)] hover:bg-[#e6f2f7]"
                }`}
            >
              <HelpCircle size={15} /> Expected MCQs &amp; Alerts
            </button>
          </div>

          {/* Search & Filter Bar (Only for non-alerts tab) */}
          {activeTab !== "alerts" && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-2xl mx-auto">
              <div className="relative w-full sm:flex-1">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search current affairs, themes or organizations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-white rounded-full border border-[rgba(18,47,43,0.12)] text-sm text-[var(--primarynavy)] placeholder:text-gray-400 focus:outline-hidden focus:ring-2 focus:ring-[var(--primaryblue)] shadow-xs"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              {availableThemes.length > 2 && (
                <select
                  value={selectedTheme}
                  onChange={(e) => setSelectedTheme(e.target.value)}
                  className="w-full sm:w-auto px-4 py-2.5 bg-white rounded-full border border-[rgba(18,47,43,0.12)] text-xs font-bold text-[var(--primarynavy)] focus:outline-hidden focus:ring-2 focus:ring-[var(--primaryblue)] shadow-xs cursor-pointer"
                >
                  {availableThemes.map((theme) => (
                    <option key={theme} value={theme}>
                      {theme === "ALL" ? "All Themes" : theme}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}
        </div>

        {/* Content Layout */}
        <div className="w-full max-w-4xl mx-auto">
          {/* Main Feed Column */}
          <div className="w-full flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[rgba(18,47,43,0.1)] pb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[var(--primarynavy)] capitalize">
                  {activeTab === "alerts"
                    ? "Syllabus Expected Questions"
                    : activeTab === "monthly"
                      ? `Monthly Digest ${monthLabel ? `· ${monthLabel}` : ""}`
                      : activeTab === "weekly"
                        ? "Weekly Comprehensive Briefs"
                        : "Today's Priority Briefs"}
                </h2>
                {error && <span className="text-xs text-amber-700 font-medium block mt-1">{error}</span>}
              </div>
              <span className="text-xs sm:text-sm font-bold text-[var(--primarynavy)] whitespace-nowrap self-start sm:self-auto">
                {activeTab === "alerts"
                  ? `${filteredQuestions.length} questions available`
                  : `${filteredItems.length} stories verified`}
              </span>
            </div>

            {/* Loading Indicator */}
            {loading && (
              <div className="bg-white rounded-[20px] p-12 text-center border border-[rgba(18,47,43,0.06)] shadow-xs flex flex-col items-center justify-center gap-3">
                <RefreshCw size={28} className="animate-spin text-[var(--primaryblue)]" />
                <p className="text-sm font-medium text-gray-500">
                  Fetching verified updates from official sources...
                </p>
              </div>
            )}

            {/* Tab: Alerts & Expected Questions */}
            {!loading && activeTab === "alerts" && (
              <div className="flex flex-col gap-5">
                {/* Search in questions */}
                <div className="relative w-full">
                  <Search
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Search MCQs by question text, topic or exam..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setVisibleCount(15);
                    }}
                    className="w-full pl-11 pr-4 py-2.5 bg-white rounded-full border border-[rgba(18,47,43,0.12)] text-sm text-[var(--primarynavy)] placeholder:text-gray-400 focus:outline-hidden focus:ring-2 focus:ring-[var(--primaryblue)] shadow-xs"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>

                {filteredQuestions.length === 0 ? (
                  <div className="bg-white rounded-[20px] p-8 text-center text-gray-500 border border-[rgba(18,47,43,0.06)]">
                    No questions matched your search. Try another keyword.
                  </div>
                ) : (
                  <>
                    {filteredQuestions.slice(0, visibleCount).map((q, i) => (
                      <article
                        key={i}
                        className="bg-white rounded-[20px] p-5 sm:p-6 lg:p-7 shadow-xs border border-[rgba(18,47,43,0.06)] flex flex-col gap-4 transition-all hover:shadow-md min-w-0 overflow-hidden"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="bg-[#eef7fa] text-[var(--primarynavy)] font-bold text-[11px] px-3 py-1 rounded-md">
                            {q.question_type || "Prelims MCQ"} · {q.exam || "UPSC / State PCS"}
                          </span>
                          <span className="text-xs font-extrabold text-[var(--gold)]">
                            Priority: {q.priority}/100
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-[var(--primarynavy)] leading-snug break-words">
                          Q{i + 1}. {q.question}
                        </h3>

                        {Array.isArray(q.options) && q.options.length > 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-1">
                            {q.options.map((opt, idx) => {
                              const optLetter = String.fromCharCode(65 + idx);
                              const isSelected = selectedAnswers[i] === optLetter;
                              const isRevealed = revealedAnswers[i];
                              const isCorrect = q.answer && q.answer.trim().toUpperCase().includes(optLetter);

                              let btnStyle = "bg-[#f8fbfa] border-gray-100 text-[#2c3d39] hover:border-gray-300";
                              if (isRevealed) {
                                if (isCorrect) {
                                  btnStyle = "bg-emerald-50 border-emerald-400 text-emerald-900 font-semibold";
                                } else if (isSelected) {
                                  btnStyle = "bg-rose-50 border-rose-300 text-rose-900";
                                }
                              } else if (isSelected) {
                                btnStyle = "bg-[#e8f1f5] border-[var(--primaryblue)] text-[var(--primarynavy)] font-semibold";
                              }

                              return (
                                <button
                                  type="button"
                                  key={idx}
                                  onClick={() => {
                                    setSelectedAnswers((prev) => ({ ...prev, [i]: optLetter }));
                                  }}
                                  className={`text-left text-xs p-3 rounded-xl border transition-colors flex items-start gap-2 min-w-0 break-words ${btnStyle}`}
                                >
                                  <strong className="text-[var(--primarynavy)] shrink-0">
                                    {optLetter}.
                                  </strong>
                                  <span className="flex-1 min-w-0 break-words">{opt}</span>
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {/* Answer Reveal Toggle */}
                        {revealedAnswers[i] && q.answer_basis && (
                          <div className="text-xs bg-[#f4f9fb] p-3.5 rounded-xl border-l-4 border-[var(--teal)] text-[#3f5753] leading-relaxed break-words min-w-0 overflow-hidden">
                            {q.answer && (
                              <div className="font-bold text-[var(--primarynavy)] mb-1.5 flex items-center gap-1.5 break-words">
                                <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                                <span>Correct Answer: {q.answer}</span>
                              </div>
                            )}
                            <strong className="text-[var(--primarynavy)] block mb-1">
                              Answer Rationale &amp; Context:
                            </strong>
                            <p className="break-words">{q.answer_basis}</p>
                          </div>
                        )}

                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100">
                          <div className="flex flex-wrap items-center gap-2">
                            {q.answer_basis && (
                              <button
                                type="button"
                                onClick={() => {
                                  setRevealedAnswers((prev) => ({
                                    ...prev,
                                    [i]: !prev[i],
                                  }));
                                }}
                                className="px-3.5 py-1.5 bg-[#f0f4f8] text-[var(--primarynavy)] font-bold rounded-lg text-xs hover:bg-[#e2eaf0] transition-colors cursor-pointer"
                              >
                                {revealedAnswers[i] ? "Hide Solution" : "Check Answer"}
                              </button>
                            )}

                            {q.source_url && (
                              <a
                                href={q.source_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-[var(--primaryblue)] font-bold flex items-center gap-1 hover:underline ml-1 break-all max-w-[250px] sm:max-w-md truncate"
                              >
                                Official Context <ExternalLink size={12} className="shrink-0" />
                              </a>
                            )}
                          </div>
                        </div>
                      </article>
                    ))}

                    {/* Infinite Scroll / Load More */}
                    {visibleCount < filteredQuestions.length && (
                      <div className="text-center pt-4 pb-2">
                        <button
                          type="button"
                          onClick={() => setVisibleCount((prev) => prev + 15)}
                          className="px-8 py-3 bg-[var(--primarynavy)] text-white font-bold text-sm rounded-full shadow-sm hover:bg-black transition-all flex items-center gap-2 mx-auto cursor-pointer"
                        >
                          Load More Questions ({filteredQuestions.length - visibleCount} remaining)
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Tab: Standard Current Affairs Feed */}
            {!loading && activeTab !== "alerts" && filteredItems.length === 0 && (
              <div className="bg-white rounded-[20px] p-12 text-center border border-[rgba(18,47,43,0.06)] shadow-xs">
                <p className="text-base text-gray-500 mb-4">No stories matched your filter criteria.</p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedTheme("ALL");
                  }}
                  className="px-5 py-2 bg-[var(--primarynavy)] text-white text-xs font-bold rounded-full cursor-pointer"
                >
                  Reset filters
                </button>
              </div>
            )}

            {!loading &&
              activeTab !== "alerts" &&
              filteredItems.map((b, i) => {
                const priority = getPriorityBadge(b.score);
                return (
                  <article
                    key={b.id || i}
                    className="bg-white rounded-[20px] p-5 sm:p-6 lg:p-8 shadow-xs border border-[rgba(18,47,43,0.06)] flex flex-col sm:flex-row gap-4 sm:gap-6 items-start transition-all hover:-translate-y-0.5 hover:shadow-md min-w-0 overflow-hidden"
                  >
                    <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#8daec0] shrink-0 leading-none mt-1 select-none">
                      {i + 1 < 10 ? `0${i + 1}` : i + 1}
                    </div>

                    <div className="flex-1 min-w-0 w-full">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="text-[10px] font-extrabold tracking-widest text-[var(--primaryblue)] uppercase truncate">
                          {b.theme || "GENERAL"}
                        </span>
                        {b.source_name && (
                          <>
                            <span className="text-gray-300 text-xs">•</span>
                            <span className="text-[10px] font-bold text-gray-400 truncate max-w-[200px]">
                              {b.source_name}
                            </span>
                          </>
                        )}
                      </div>

                      <h3
                        onClick={() => setSelectedItem(b)}
                        className="text-lg sm:text-xl font-bold text-[var(--primarynavy)] mb-3 leading-snug cursor-pointer hover:text-[var(--primaryblue)] transition-colors break-words"
                      >
                        {b.title}
                      </h3>

                      <p className="text-[#49605c] text-xs sm:text-sm mb-5 leading-relaxed line-clamp-3 break-words">
                        {b.summary ||
                          "Concise context, verified facts, syllabus connections, key terms and exam-ready analysis."}
                      </p>

                      <div className="flex flex-wrap gap-2 text-[11px] font-bold text-[#8b9b96]">
                        {getExamBadges(b).map((examName) => (
                          <span
                            key={examName}
                            className="bg-[#f4f9fb] px-3 py-1.5 rounded-md flex items-center gap-1.5 text-[var(--primarynavy)] shrink-0"
                          >
                            <Target size={13} /> {examName}
                          </span>
                        ))}
                        <span className="bg-[#f4f9fb] px-3 py-1.5 rounded-md flex items-center gap-1.5 text-[var(--primarynavy)] shrink-0">
                          <Zap size={13} className={priority.color} fill="currentColor" /> Priority:{" "}
                          {priority.label}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedItem(b)}
                      className="sm:self-center shrink-0 w-full sm:w-auto mt-2 sm:mt-0 px-6 py-3 bg-[#e6f2f7] text-[var(--primaryblue)] font-bold rounded-xl hover:bg-[var(--primarynavy)] hover:text-white transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      Read <ArrowRight size={16} />
                    </button>
                  </article>
                );
              })}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

