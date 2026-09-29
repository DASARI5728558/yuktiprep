"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "@/lib/language-context";
import { api } from "@/lib/api";
import { ArrowLeft } from "lucide-react";

type Tab = "affairs" | "questions";

type Period = "all1" | "daily" | "weekly" | "monthly";

interface Article {
    id?: string;
    title: string;
    theme: string;
    summary: string;
    score: number;
    source_confidence: number;
    source_name: string;
    published_at: string;
    url: string;
    static_link: string;
    prelims?: boolean;
    mains?: boolean;
    pcs?: boolean;
    ssc?: boolean;
    banking?: boolean;
}

interface Question {
    question: string;
    options: string[];
    answer: string;
    answer_basis: string;
    exam: string;
    priority: number;
    question_type: string;
    source_url: string;
}

interface ArticleCardProps {
    item: Article;
    exams: string[];
    t: (key: string) => string;
}

function ArticleCard({ item, exams, t }: ArticleCardProps) {
    const [activeArticleTab, setActiveArticleTab] = useState<
        "summary" | "syllabus" | "prep"
    >("summary");

    return (
        <article className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-violet-200 hover:shadow-xl">
            <div className="flex flex-col justify-between gap-6 md:flex-row">
                <div>
                    <h2 className="font-[family-name:var(--font-poppins)] text-xl font-semibold leading-relaxed text-gray-900">
                        {item.title}
                    </h2>
                    <div className="mt-4 flex flex-wrap gap-2">
                        <span className="rounded-md border border-violet-200 bg-teal-50 px-3 py-1 text-xs font-bold uppercase text-teal-700">
                            {item.theme}
                        </span>
                        {exams.map((exam) => (
                            <span
                                key={exam}
                                className="rounded-md border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold uppercase text-amber-700"
                            >
                                {exam}
                            </span>
                        ))}
                    </div>
                </div>
                <div className="flex gap-4">
                    <ScoreCircle label="PRI" value={item.score} />
                    <ScoreCircle label="CONF" value={item.source_confidence} />
                </div>
            </div>

            <div className="mt-6 flex gap-6 border-b border-gray-200">
                <button
                    onClick={() => setActiveArticleTab("summary")}
                    className={`pb-3 text-sm font-semibold transition-colors ${activeArticleTab === "summary" ? "border-b-2 border-teal-600 text-teal-700" : "text-gray-500 hover:text-violet-600"}`}
                >
                    {t("analysis")}
                </button>
                <button
                    onClick={() => setActiveArticleTab("syllabus")}
                    className={`pb-3 text-sm font-semibold transition-colors ${activeArticleTab === "syllabus" ? "border-b-2 border-teal-600 text-teal-700" : "text-gray-500 hover:text-violet-600"}`}
                >
                    {t("syllabusMatch")}
                </button>
                <button
                    onClick={() => setActiveArticleTab("prep")}
                    className={`pb-3 text-sm font-semibold transition-colors ${activeArticleTab === "prep" ? "border-b-2 border-teal-600 text-teal-700" : "text-gray-500 hover:text-violet-600"}`}
                >
                    {t("prepGuide")}
                </button>
            </div>

            <div className="mt-6">
                {activeArticleTab === "summary" && (
                    <div className="rounded-xl border border-teal-100 border-l-4 border-l-teal-500 bg-teal-50 p-5 leading-7 text-gray-700">
                        {item.summary}
                    </div>
                )}
                {activeArticleTab === "syllabus" && (
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                        <p className="font-semibold text-gray-900">{t("theme")} {item.theme}</p>
                        <p className="mt-2 break-words text-gray-600">{item.static_link}</p>
                    </div>
                )}
                {activeArticleTab === "prep" && (
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
                            <h4 className="font-semibold text-amber-700">🎯 Prelims Focus</h4>
                            <p className="mt-2 text-sm leading-6 text-gray-600">
                                Focus on institutions, legal framework, mandates, statistics,
                                reports and statement-based questions.
                            </p>
                        </div>
                        <div className="rounded-xl border border-violet-200 bg-teal-50 p-5">
                            <h4 className="font-semibold text-teal-700">✍️ Mains Focus</h4>
                            <p className="mt-2 text-sm leading-6 text-gray-600">
                                Analyze policy significance, challenges, implications and the
                                way forward.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-6 flex flex-col justify-between gap-4 border-t border-gray-200 pt-5 text-sm text-gray-500 md:flex-row">
                <div className="flex flex-wrap gap-4">
                    <span>
                        {t("source")}:{" "}
                        <strong className="ml-1 text-gray-900">{item.source_name}</strong>
                    </span>
                    <span>
                        {t("published")}:{" "}
                        <strong className="ml-1 text-gray-900">
                            {new Date(item.published_at).toLocaleDateString("en-IN")}
                        </strong>
                    </span>
                </div>
                <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-blue-700 transition hover:text-blue-900 hover:underline"
                >
                    {t("officialSourceLink")} →
                </a>
            </div>
        </article>
    );
}

interface ScoreCircleProps {
    value: number;
    label: string;
}

function ScoreCircle({ value, label }: ScoreCircleProps) {
    const radius = 28;
    const circumference = 2 * Math.PI * radius;
    const clampedValue = Math.min(Math.max(value, 0), 100);
    const strokeDashoffset = circumference - (clampedValue / 100) * circumference;

    return (
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gray-50">
            <svg
                className="absolute inset-0 h-full w-full -rotate-90 transform"
                viewBox="0 0 64 64"
            >
                <circle
                    className="text-gray-200"
                    strokeWidth="4"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="32"
                    cy="32"
                />
                <circle
                    className="text-teal-500 transition-all duration-1000 ease-in-out"
                    strokeWidth="4"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="32"
                    cy="32"
                />
            </svg>
            <div className="relative flex flex-col items-center justify-center">
                <span className="text-sm font-extrabold text-gray-900 leading-none">
                    {value}
                </span>
                <span className="mt-0.5 text-[9px] font-medium text-muted-foreground leading-none">
                    {label}
                </span>
            </div>
        </div>
    );
}

function NoData({ t }: { t: (key: string) => string }) {
    return (
        <div className="flex h-64 flex-col items-center justify-center rounded-3xl border border-gray-200 bg-white shadow-sm p-6 text-center">
            <div className="mb-4 text-4xl">📭</div>
            <h3 className="text-xl font-semibold font-[family-name:var(--font-poppins)] text-gray-900">
                {t("noRecordsFound")}
            </h3>
            <p className="mt-2 text-muted-foreground">
                {t("tryAdjustingFilters")}
            </p>
        </div>
    );
}

interface QuestionCardProps {
    question: Question & { options?: string[]; answer?: string };
    t: (key: string) => string;
}

function QuestionCard({ question, t }: QuestionCardProps) {
    let mainQuestion = question.question;
    let optionsList: string[] = question.options || [];
    const correctAnswer = question.answer || "";
    function getOptionKey(value: string): string | null {
        if (!value) return null;

        const normalized = value.trim().toLowerCase();

        const bracketMatch = normalized.match(/\(([a-e])\)/i);
        if (bracketMatch) {
            return bracketMatch[1].toLowerCase();
        }

        const dotMatch = normalized.match(/^([a-e])\./i);
        if (dotMatch) {
            return dotMatch[1].toLowerCase();
        }

        const wordMatch = normalized.match(
            /\b(?:option|answer|correct answer)\s*:?\s*\(?([a-e])\)?/i,
        );

        if (wordMatch) {
            return wordMatch[1].toLowerCase();
        }

        if (/^[a-e]$/i.test(normalized)) {
            return normalized.toLowerCase();
        }

        return null;
    }

    function getCleanOptionText(value: string): string {
        return value
            .replace(/^\(([a-e])\)\s*/i, "")
            .replace(/^([a-e])\.\s*/i, "")
            .trim();
    }
    const correctOptionKey = getOptionKey(correctAnswer);
    if (
        optionsList.length === 0 &&
        /(?:\([a-eA-E]\)|\b[A-E]\.)/.test(mainQuestion)
    ) {
        const splitMatch = mainQuestion.match(
            /^([\s\S]*?)(?=\([a-eA-E]\)|\b[A-E]\.)/,
        );
        if (splitMatch) {
            mainQuestion = splitMatch[1].trim();
            const optsString = question.question.substring(splitMatch[1].length);
            optionsList = optsString
                .split(/(?=\([a-eA-E]\)|\b[A-E]\.)/)
                .map((s) => s.trim())
                .filter(Boolean);
        }
    }

    return (
        <div className="rounded-[18px] border border-[#E3E7EE] bg-white p-5 shadow-sm transition hover:shadow-md flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-[#1D2B45] leading-relaxed">
                {mainQuestion}
            </h3>
            {optionsList.length > 0 && (
                <div className="space-y-2">
                    {optionsList.map((opt, idx) => {
                        const optionKey =
                            getOptionKey(opt) || String.fromCharCode(97 + idx);

                        const letter = `${optionKey.toUpperCase()}.`;

                        const optText = getCleanOptionText(opt);

                        const isCorrect =
                            correctOptionKey !== null &&
                            optionKey.toLowerCase() === correctOptionKey.toLowerCase();

                        return (
                            <div
                                key={idx}
                                className={`flex items-start gap-3 rounded-lg border p-3 text-sm transition-colors ${isCorrect
                                    ? "border-emerald-300 bg-emerald-50"
                                    : "border-[#E3E7EE] bg-gray-50"
                                    }`}
                            >
                                <span className="mt-0.5 text-[#238A8D]">
                                    {isCorrect ? "✓" : "○"}
                                </span>

                                <span
                                    className={
                                        isCorrect
                                            ? "font-medium text-emerald-900"
                                            : "text-[#1D2B45]"
                                    }
                                >
                                    <span className="font-semibold">{letter}</span> {optText}
                                </span>

                                {isCorrect && (
                                    <span className="ml-auto text-xs font-semibold text-emerald-700">
                                        {t("correctAnswerLabel")}
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {correctAnswer && optionsList.length === 0 && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm">
                    <span className="font-semibold text-emerald-800">
                        {t("correctAnswer")}{" "}
                    </span>
                    <span className="text-emerald-700">{correctAnswer}</span>
                </div>
            )}

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-xs text-[#6B7280]">
                <span className="font-semibold text-gray-600">{t("answerBasis")} </span>
                {question.answer_basis}
            </div>
        </div>
    );
}

export default function CurrentAffairsPage() {
    const searchParams = useSearchParams();
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState<Tab>("affairs");
    const [period, setPeriod] = useState<Period>("all1");
    const [articles, setArticles] = useState<Article[]>([]);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [examFilter, setExamFilter] = useState("all");
    const router = useRouter();
    const loadTabData = async (tab: Tab, selectedPeriod: Period = period) => {
        try {
            setLoading(true);
            setError("");

            let data;
            if (tab === "affairs") {
                if (selectedPeriod === "all1") {
                    const response = await api.get("/api/current-affairs/affairs");
                    data = response;
                } else {
                    const response = await api.get(
                        `/api/current-affairs/${selectedPeriod}`,
                    );
                    data = selectedPeriod === "monthly" ? response.items : response;
                }
                setArticles(data || []);
            }

            if (tab === "questions") {
                const response = await api.get("/api/current-affairs/questions");
                data = response;
                setQuestions(data);
            }
        } catch (error) {
            console.error(error);
            setError(t("loadError"));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTabData(activeTab, period);
    }, [activeTab, period]);

    const filteredQuestions = questions.filter((question) => {
        const matchesSearch =
            question.question.toLowerCase().includes(search.toLowerCase()) ||
            question.answer_basis.toLowerCase().includes(search.toLowerCase());

        let matchesExam = true;

        if (examFilter !== "all") {
            if (examFilter === "UPSC") {
                matchesExam = question.exam.includes("UPSC");
            } else if (examFilter === "State PSC") {
                matchesExam =
                    question.exam.includes("PCS") || question.exam.includes("PSC");
            } else {
                matchesExam = question.exam
                    .toLowerCase()
                    .includes(examFilter.toLowerCase());
            }
        }

        return matchesSearch && matchesExam;
    });

    const filteredArticles = articles.filter((item) => {
        const matchesSearch =
            item.title.toLowerCase().includes(search.toLowerCase()) ||
            item.theme.toLowerCase().includes(search.toLowerCase());
        let matchesExam = true;
        if (examFilter !== "all") {
            if (examFilter === "UPSC") matchesExam = !!(item.prelims || item.mains);
            else if (examFilter === "State PSC") matchesExam = !!item.pcs;
            else if (examFilter === "Banking") matchesExam = !!item.banking;
            else if (examFilter === "SSC") matchesExam = !!item.ssc;
            else matchesExam = false;
        }
        return matchesSearch && matchesExam;
    });

    const getExams = (item: Article) => {
        const exams = [];
        if (item.prelims) exams.push("Prelims");
        if (item.mains) exams.push("Mains");
        if (item.pcs) exams.push("State PCS");
        if (item.ssc) exams.push("SSC");
        if (item.banking) exams.push("Banking");
        return exams;
    };

    const highlightId = searchParams.get("article");

    return (
        <div className="flex flex-col p-4 md:p-8 font-[family-name:var(--font-poppins)]">
            <button
                type="button"
                onClick={() => router.back()}
                className="flex h-9 w-9 mb-5 items-center justify-center rounded-full text-[#1F314D] transition hover:bg-gray-100"
                aria-label={t("back")}
            >
                <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="w-full">
                <header className="mb-10 flex flex-col gap-6 border-b border-gray-200 pb-6 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold font-[family-name:var(--font-poppins)] text-[var(--primarynavy)] md:text-3xl">
                            {t("currentAffairs")}
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {t("officialSourceFirst")}
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            onClick={() => window.print()}
                            className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-semibold transition hover:bg-gray-50"
                        >
                            {t("exportPdf")}
                        </button>
                    </div>
                </header>

                <div className="mb-8 flex gap-2 overflow-x-auto rounded-2xl border border-gray-200 bg-teal-50 p-1">
                    {["affairs", "questions"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as Tab)}
                            className={`font-[family-name:var(--font-poppins)] w-full whitespace-nowrap rounded-xl px-5 py-3 text-sm font-semibold capitalize transition ${activeTab === tab ? "bg-teal-600 text-white shadow-sm" : "text-muted-foreground hover:bg-teal-100 hover:text-gray-900"}`}
                        >
                            {tab === "affairs" ? t("allAffairs") : t("expectedQuestions")}
                        </button>
                    ))}
                </div>

                {activeTab === "affairs" && (
                    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-3">
                            <label className="text-sm font-medium text-gray-700">
                                {t("period")}
                            </label>
                            <select
                                value={period}
                                onChange={(e) => setPeriod(e.target.value as Period)}
                                className="appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke-width%3D%221.5%22%20stroke%3D%226b7280%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22M8.25%2015L12%2018.75%2015.75%2015m-7.5-6L12%205.25%2015.75%209%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[position:right_1rem_center] bg-no-repeat rounded-xl border border-gray-200 bg-gray-50 pl-4 pr-10 py-2.5 text-sm text-gray-900 outline-none focus:border-teal-500 cursor-pointer"
                            >
                                <option value="all">{t("allTime")}</option>
                                <option value="daily">{t("daily")}</option>
                                <option value="weekly">{t("weekly")}</option>
                                <option value="monthly">{t("monthly")}</option>
                            </select>
                        </div>
                        <div className="text-sm font-medium text-muted-foreground px-1">
                            {t("showing")} {filteredArticles.length}{" "}
                            {filteredArticles.length === 1 ? t("affair") : t("affairs")}
                        </div>
                    </div>
                )}

                {loading && (
                    <div className="flex min-h-[250px] items-center justify-center">
                        <div className="text-center">
                            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-violet-500" />
                            <p className="mt-4 text-muted-foreground">{t("fetchingContent")}</p>
                        </div>
                    </div>
                )}

                {error && !loading && (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
                        {error}
                    </div>
                )}

                {activeTab === "affairs" && !loading && !error && (
                    <section className="space-y-6">
                        <div className="mb-8 flex flex-col gap-4">
                            <div className="flex flex-col gap-4 md:flex-row">
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder={t("searchAffairs")}
                                    className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-5 py-3 text-gray-900 outline-none transition focus:border-teal-500"
                                />
                                <select
                                    value={examFilter}
                                    onChange={(e) => setExamFilter(e.target.value)}
                                    className="appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke-width%3D%221.5%22%20stroke%3D%226b7280%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22M8.25%2015L12%2018.75%2015.75%2015m-7.5-6L12%205.25%2015.75%209%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[position:right_1rem_center] bg-no-repeat rounded-xl border border-gray-200 bg-gray-50 pl-5 pr-12 py-3 text-gray-900 outline-none focus:border-teal-500 cursor-pointer"
                                >
                                    <option value="all">{t("allExams")}</option>
                                    <option value="UPSC">UPSC</option>
                                    <option value="SSC">SSC</option>
                                    <option value="Banking">Banking</option>
                                    <option value="Railways">Railways</option>
                                    <option value="Defence">Defence</option>
                                    <option value="Teaching">Teaching</option>
                                    <option value="State PSC">State PSC</option>
                                    <option value="Police">Police</option>
                                    <option value="Engineering">Engineering</option>
                                    <option value="Management">Management</option>
                                    <option value="Law">Law</option>
                                    <option value="Medical">Medical</option>
                                    <option value="CUET">CUET</option>
                                    <option value="State-specific">State-specific</option>
                                </select>
                            </div>
                        </div>
                        {filteredArticles.length === 0 ? (
                            <NoData t={t} />
                        ) : (
                            filteredArticles.map((item, index) => (
                                <ArticleCard
                                    key={item.id || index}
                                    item={item}
                                    exams={getExams(item)}
                                    t={t}
                                />
                            ))
                        )}
                    </section>
                )}

                {activeTab === "questions" && !loading && !error && (
                    <section>
                        <div className="mb-8 flex flex-col gap-4">
                            <div className="flex flex-col gap-4 md:flex-row">
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder={t("searchQuestions")}
                                    className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-5 py-3 text-gray-900 outline-none transition focus:border-teal-500"
                                />
                                <select
                                    value={examFilter}
                                    onChange={(e) => setExamFilter(e.target.value)}
                                    className="appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke-width%3D%221.5%22%20stroke%3D%226b7280%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22M8.25%2015L12%2018.75%2015.75%2015m-7.5-6L12%205.25%2015.75%209%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[position:right_1rem_center] bg-no-repeat rounded-xl border border-gray-200 bg-gray-50 pl-5 pr-12 py-3 text-gray-900 outline-none focus:border-teal-500 cursor-pointer"
                                >
                                    <option value="all">{t("allExams")}</option>
                                    <option value="UPSC">UPSC</option>
                                    <option value="SSC">SSC</option>
                                    <option value="Banking">Banking</option>
                                    <option value="Railways">Railways</option>
                                    <option value="Defence">Defence</option>
                                    <option value="Teaching">Teaching</option>
                                    <option value="State PSC">State PSC</option>
                                    <option value="Police">Police</option>
                                    <option value="Engineering">Engineering</option>
                                    <option value="Management">Management</option>
                                    <option value="Law">Law</option>
                                    <option value="Medical">Medical</option>
                                    <option value="CUET">CUET</option>
                                    <option value="State-specific">State-specific</option>
                                </select>
                            </div>
                            <div className="text-sm font-medium text-muted-foreground px-1">
                                {t("showing")} {filteredQuestions.length}{" "}
                                {filteredQuestions.length === 1 ? t("question") : t("questions")}
                            </div>
                        </div>
                        <div className="grid gap-4 lg:grid-cols-2">
                            {filteredQuestions.map((question, index) => (
                                <QuestionCard key={index} question={question} t={t} />
                            ))}
                        </div>
                    </section>
                )}

                <div className="mt-16 rounded-2xl border border-gray-200 border-l-blue-500 bg-gray-50 p-6 text-sm leading-6 text-muted-foreground">
                    <strong className="mb-2 block text-base text-gray-900">
                        {t("professionalDisclaimer")}
                    </strong>
                    {t("disclaimerText")}
                </div>
            </div>
        </div>
    );
}