"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

type Tab =
    | "affairs"
    | "questions"
    | "themes"
    | "health"
    | "errors";

interface KPIData {
    total_items: number;
    avg_score: number;
    success_rate: number;
    dead_letters_count: number;
}

interface Article {
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



interface HealthRecord {
    source_key: string;
    runs: number;
    successful: number;
    last_run: string;
    success_rate: number;
}

interface DeadLetter {
    id: number;
    source_key: string;
    stage: string;
    reason: string;
    payload: string;
    created_at: string;
}

interface Theme {
    theme: string;
    item_count: number;
    avg_score: number;
    max_score: number;
}

interface Question {
    exam: string;
    question_type: string;
    priority: number;
    question: string;
    answer_basis: string;
    source_url: string;
}

interface KPICardProps {
    title: string;
    value: string | number;
}

function KPICard({
    title,
    value,
}: KPICardProps) {
    return (
        <div className="font-[family-name:var(--font-poppins)] group relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm p-6  transition duration-300 hover:-translate-y-1 hover:border-gray-300 hover:shadow-2xl">

            <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-teal-400 to-teal-600 opacity-0 transition group-hover:opacity-100" />

            <h3 className="mb-3 text-xs font-[family-name:var(--font-poppins)] font-medium uppercase tracking-widest text-muted-foreground">
                {title}
            </h3>

            <div className="text-4xl font-extrabold text-gray-900">
                {value}
            </div>

        </div>
    );
}

interface ArticleCardProps {
    item: Article;
    exams: string[];
}

function ArticleCard({
    item,
    exams,
}: ArticleCardProps) {
    const [activeArticleTab, setActiveArticleTab] =
        useState<
            "summary" | "syllabus" | "prep"
        >("summary");
    return (
        <article className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-violet-200 hover:shadow-xl">

            {/* HEADER */}

            <div className="flex flex-col justify-between gap-6 md:flex-row">

                <div>
                    <h2 className="font-[family-name:var(--font-poppins)] text-xl font-semibold leading-relaxed text-gray-900">
                        {item.title}
                    </h2>

                    <div className="mt-4 flex flex-wrap gap-2">

                        {/* Theme Badge */}

                        <span className="rounded-md border border-violet-200 bg-teal-50 px-3 py-1 text-xs font-bold uppercase text-teal-700">
                            {item.theme}
                        </span>

                        {/* Exam Badges */}

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

                {/* SCORES */}

                <div className="flex gap-4">
                    <ScoreCircle
                        label="PRI"
                        value={item.score}
                    />

                    <ScoreCircle
                        label="CONF"
                        value={item.source_confidence}
                    />
                </div>

            </div>

            {/* INNER TABS */}

            <div className="mt-6 flex gap-6 border-b border-gray-200">

                <button
                    onClick={() =>
                        setActiveArticleTab("summary")
                    }
                    className={`pb - 3 text - sm font - semibold transition - colors ${activeArticleTab === "summary"
                        ? "border-b-2 border-teal-600 text-teal-700"
                        : "text-gray-500 hover:text-violet-600"
                        } `}
                >
                    Analysis
                </button>

                <button
                    onClick={() =>
                        setActiveArticleTab("syllabus")
                    }
                    className={`pb - 3 text - sm font - semibold transition - colors ${activeArticleTab === "syllabus"
                        ? "border-b-2 border-teal-600 text-teal-700"
                        : "text-gray-500 hover:text-violet-600"
                        } `}
                >
                    Syllabus Match
                </button>

                <button
                    onClick={() =>
                        setActiveArticleTab("prep")
                    }
                    className={`pb - 3 text - sm font - semibold transition - colors ${activeArticleTab === "prep"
                        ? "border-b-2 border-teal-600 text-teal-700"
                        : "text-gray-500 hover:text-violet-600"
                        } `}
                >
                    Prep Guide
                </button>

            </div>

            {/* TAB CONTENT */}

            <div className="mt-6">

                {activeArticleTab === "summary" && (
                    <div className="rounded-xl border border-teal-100 border-l-4 border-l-teal-500 bg-teal-50 p-5 leading-7 text-gray-700">
                        {item.summary}
                    </div>
                )}

                {activeArticleTab === "syllabus" && (
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">

                        <p className="font-semibold text-gray-900">
                            Theme: {item.theme}
                        </p>

                        <p className="mt-2 break-words text-gray-600">
                            {item.static_link}
                        </p>

                    </div>
                )}

                {activeArticleTab === "prep" && (
                    <div className="grid gap-4 md:grid-cols-2">

                        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
                            <h4 className="font-semibold text-amber-700">
                                🎯 Prelims Focus
                            </h4>

                            <p className="mt-2 text-sm leading-6 text-gray-600">
                                Focus on institutions, legal framework,
                                mandates, statistics, reports and
                                statement-based questions.
                            </p>
                        </div>

                        <div className="rounded-xl border border-violet-200 bg-teal-50 p-5">
                            <h4 className="font-semibold text-teal-700">
                                ✍️ Mains Focus
                            </h4>

                            <p className="mt-2 text-sm leading-6 text-gray-600">
                                Analyze policy significance,
                                challenges, implications and
                                the way forward.
                            </p>
                        </div>

                    </div>
                )}

            </div>

            {/* FOOTER */}

            <div className="mt-6 flex flex-col justify-between gap-4 border-t border-gray-200 pt-5 text-sm text-gray-500 md:flex-row">

                <div className="flex flex-wrap gap-4">

                    <span>
                        Source:
                        <strong className="ml-1 text-gray-900">
                            {item.source_name}
                        </strong>
                    </span>

                    <span>
                        Published:
                        <strong className="ml-1 text-gray-900">
                            {new Date(
                                item.published_at
                            ).toLocaleDateString("en-IN")}
                        </strong>
                    </span>

                </div>

                <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-blue-700 transition hover:text-blue-900 hover:underline"
                >
                    Official Source Link →
                </a>

            </div>

        </article>
    );
}


interface ScoreCircleProps {
    value: number;
    label: string;
}

function ScoreCircle({
    value,
    label,
}: ScoreCircleProps) {
    const radius = 28;
    const circumference = 2 * Math.PI * radius;
    const clampedValue = Math.min(Math.max(value, 0), 100);
    const strokeDashoffset = circumference - (clampedValue / 100) * circumference;

    return (
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gray-50">
            {/* SVG Rings */}
            <svg className="absolute inset-0 h-full w-full -rotate-90 transform" viewBox="0 0 64 64">
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

            {/* Inner Content */}
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

function NoData() {
    return (
        <div className="flex h-64 flex-col items-center justify-center rounded-3xl border border-gray-200 bg-white shadow-sm p-6 text-center ">
            <div className="mb-4 text-4xl">📭</div>
            <h3 className="text-xl font-semibold font-[family-name:var(--font-poppins)] text-gray-900">No records found</h3>
            <p className="mt-2 text-muted-foreground">Try adjusting your filters or search terms.</p>
        </div>
    );
}

interface QuestionCardProps {
    question: Question & { options?: string[], answer?: string };
}

function QuestionCard({ question }: QuestionCardProps) {
    let mainQuestion = question.question;
    let optionsList: string[] = question.options || [];
    const correctAnswer = question.answer || "";

    // Fallback parser if options are bundled inside the main question string
    if (optionsList.length === 0 && /(?:\([a-eA-E]\)|\b[A-E]\.)/.test(mainQuestion)) {
        const splitMatch = mainQuestion.match(/^([\s\S]*?)(?=\([a-eA-E]\)|\b[A-E]\.)/);
        if (splitMatch) {
            mainQuestion = splitMatch[1].trim();
            const optsString = question.question.substring(splitMatch[1].length);
            optionsList = optsString.split(/(?=\([a-eA-E]\)|\b[A-E]\.)/).map(s => s.trim()).filter(Boolean);
        }
    }

    return (
        <div className="rounded-3xl border border-gray-200 bg-white shadow-sm p-6 transition hover:border-gray-200 hover:shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                    {question.exam}
                </span>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    Priority: {question.priority}/100
                </span>
            </div>

            <h3 className="text-lg font-[family-name:var(--font-poppins)] font-semibold leading-relaxed text-gray-900">
                {mainQuestion}
            </h3>

            {optionsList.length > 0 && (
                <div className="space-y-2">
                    <p className="font-semibold text-gray-700 mb-2">Options:</p>
                    {optionsList.map((opt, idx) => {
                        const isCorrect = correctAnswer && (opt.toLowerCase().includes(correctAnswer.toLowerCase()) || correctAnswer.toLowerCase().includes(opt.toLowerCase().replace(/^[a-z)]+\s*/i, '')));
                        return (
                            <div key={idx} className={`flex items-start gap-3 rounded-lg border p-3 text-sm transition-colors ${isCorrect ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                                <span className={isCorrect ? 'font-medium text-green-900' : 'text-gray-700'}>{opt}</span>
                                {isCorrect && <span className="ml-auto text-xs font-semibold text-green-700">← Correct Answer</span>}
                            </div>
                        );
                    })}
                </div>
            )}

            {correctAnswer && optionsList.length === 0 && (
                <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm">
                    <span className="font-semibold text-green-800">Correct Answer: </span>
                    <span className="text-green-700">{correctAnswer}</span>
                </div>
            )}

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-muted-foreground">
                <span className="font-semibold text-gray-600">Answer Basis: </span>
                {question.answer_basis}
            </div>
        </div>
    );
}

export default function CurrentAffairsPage() {
    const [activeTab, setActiveTab] = useState<Tab>("affairs");

    const [kpis, setKpis] = useState<KPIData | null>(null);

    const [articles, setArticles] = useState<Article[]>([]);

    const [questions, setQuestions] = useState<Question[]>([]);
    const [themes, setThemes] = useState<Theme[]>([]);
    const [healthData, setHealthData] = useState<HealthRecord[]>([]);
    const [deadLetters, setDeadLetters] = useState<DeadLetter[]>([]);

    const [loading, setLoading] = useState(false);

    const [syncing, setSyncing] = useState(false);
    const [broadcasting, setBroadcasting] = useState(false);

    const [error, setError] = useState("");

    const [search, setSearch] = useState("");

    const [examFilter, setExamFilter] = useState("all");

    const loadKPIs = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await api.get("/api/current-affairs/kpis", {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });

            setKpis(response.data);
        } catch (error) {
            console.error("Error loading KPIs:", error);
        }
    };

    const loadTabData = async (tab: Tab) => {
        try {
            setLoading(true);

            setError("");

            const token = localStorage.getItem("token");
            const response = await api.get(
                `/api/current-affairs/${tab}`,
                {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                }
            );

            const data = response.data;

            if (tab === "affairs") {
                setArticles(data || []);
            }

            if (tab === "questions") {
                setQuestions(data);
            }

            if (tab === "themes") {
                setThemes(data);
            }

            if (tab === "health") {
                setHealthData(data);
            }

            if (tab === "errors") {
                setDeadLetters(data);
            }


        } catch (error) {
            console.error(error);
            setError("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    // Load KPI data when page opens
    useEffect(() => {
        loadKPIs();
    }, []);

    // Load tab data whenever active tab changes
    useEffect(() => {
        loadTabData(activeTab);
    }, [activeTab]);

    const triggerSync = async () => {
        try {
            setSyncing(true);

            const token = localStorage.getItem("token");
            await api.post("/api/current-affairs/sync", {}, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });

            await loadKPIs();

            await loadTabData(activeTab);
        } catch (error) {
            console.error(error);

            alert("Sync failed");
        } finally {
            setSyncing(false);
        }
    };

    const triggerBroadcast = async () => {
        if (!confirm("Are you sure you want to broadcast the top 3 current affairs to all logged-in WhatsApp users?")) return;
        try {
            setBroadcasting(true);
            const token = localStorage.getItem("token");
            const response = await api.post("/api/current-affairs/send-whatsapp", {}, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            alert(`Broadcast successful! Sent to ${response.data.targetedCount} users.`);
        } catch (error: any) {
            console.error(error);
            alert("Broadcast failed: " + (error.response?.data?.detail || error.message));
        } finally {
            setBroadcasting(false);
        }
    };

    const filteredQuestions = questions.filter(
        (question) => {
            const matchesSearch =
                question.question
                    .toLowerCase()
                    .includes(search.toLowerCase()) ||
                question.answer_basis
                    .toLowerCase()
                    .includes(search.toLowerCase());

            let matchesExam = true;

            if (examFilter !== "all") {
                if (examFilter === "UPSC") {
                    matchesExam = question.exam.includes("UPSC");
                } else if (examFilter === "State PSC") {
                    matchesExam = question.exam.includes("PCS") || question.exam.includes("PSC");
                } else {
                    matchesExam = question.exam.toLowerCase().includes(examFilter.toLowerCase());
                }
            }

            return matchesSearch && matchesExam;
        }
    );

    const filteredArticles = articles.filter(
        (item) => {
            const matchesSearch =
                item.title
                    .toLowerCase()
                    .includes(search.toLowerCase()) ||
                item.theme
                    .toLowerCase()
                    .includes(search.toLowerCase());

            let matchesExam = true;

            if (examFilter !== "all") {
                if (examFilter === "UPSC") {
                    matchesExam = !!(item.prelims || item.mains);
                } else if (examFilter === "State PSC") {
                    matchesExam = !!item.pcs;
                } else if (examFilter === "Banking") {
                    matchesExam = !!item.banking;
                } else if (examFilter === "SSC") {
                    matchesExam = !!item.ssc;
                } else {
                    matchesExam = false; // We don't have boolean flags for others yet
                }
            }

            return matchesSearch && matchesExam;
        }
    );

    const getExams = (item: Article) => {
        const exams = [];

        if (item.prelims) exams.push("Prelims");
        if (item.mains) exams.push("Mains");
        if (item.pcs) exams.push("State PCS");
        if (item.ssc) exams.push("SSC");
        if (item.banking) exams.push("Banking");

        return exams;
    };

    return (
        <div className="flex flex-col p-4 md:p-8 font-[family-name:var(--font-poppins)]">
            <div className="w-full">

                {/* HEADER */}

                <header className="mb-10 flex flex-col gap-6 border-b border-gray-200 pb-6 md:flex-row md:items-center md:justify-between">

                    <div className="flex items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold font-[family-name:var(--font-poppins)] text-[var(--primarynavy)] md:text-3xl">
                                YuktiPrep Current Affairs
                            </h1>

                            <p className="mt-1 text-sm text-muted-foreground">
                                Official-Source-First Competitive Affairs Dashboard
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">

                        <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-600">
                            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400" />
                            Server Online
                        </div>

                        <button
                            onClick={() => window.print()}
                            className="rounded-xl border  border-gray-300 px-5 py-2.5 text-sm font-semibold transition hover:bg-gray-50"
                        >
                            Export PDF / Print
                        </button>

                        <button
                            onClick={triggerBroadcast}
                            disabled={broadcasting || syncing}
                            className="rounded-xl border border-teal-200 bg-teal-50 px-5 py-2.5 text-sm font-semibold text-teal-700 transition hover:bg-teal-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {broadcasting ? "Sending..." : "Broadcast to WhatsApp"}
                        </button>

                        <button
                            onClick={triggerSync}
                            disabled={syncing || broadcasting}
                            className="rounded-xl font-[family-name:var(--font-poppins)] bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-teal-500/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {syncing ? "Syncing..." : "Sync Sources"}
                        </button>

                    </div>
                </header>

                {/* KPI CARDS */}

                <section className="mb-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

                    <KPICard
                        title="Total Extracted Events"
                        value={kpis?.total_items ?? "-"}
                    />

                    <KPICard
                        title="Average Relevance Score"
                        value={
                            kpis
                                ? `${kpis.avg_score}/100`
                                : "-"
                        }
                    />

                    <KPICard
                        title="Monitor Success Rate"
                        value={
                            kpis
                                ? `${kpis.success_rate}%`
                                : "-"
                        }
                    />

                    <KPICard
                        title="Dead Letter Queue"
                        value={kpis?.dead_letters_count ?? "-"}
                    />

                </section>

                {/* TABS */}

                <div className="mb-8 flex gap-2 overflow-x-auto rounded-2xl border border-gray-200 bg-teal-50 p-2">

                    {[
                        "affairs",
                        "questions",
                        "themes",
                        "health",
                        "errors",
                    ].map((tab) => (
                        <button
                            key={tab}
                            onClick={() =>
                                setActiveTab(tab as Tab)
                            }
                            className={`font-[family-name:var(--font-poppins)] w-full whitespace-nowrap rounded-xl px-5 py-3 text-sm font-semibold capitalize transition ${activeTab === tab
                                ? "bg-teal-600 text-white shadow-sm"
                                : "text-muted-foreground hover:bg-teal-100 hover:text-gray-900"
                                }`}
                        >
                            {tab === "affairs"
                                ? "All Affairs"
                                : tab === "questions"
                                    ? "Expected Questions"
                                    : tab === "themes"
                                        ? "Theme Analytics"
                                        : tab === "health"
                                            ? "Source Health"
                                            : "Dead Letters"}
                        </button>
                    ))}

                </div>

                {/* LOADING */}

                {loading && (
                    <div className="flex min-h-[250px] items-center justify-center">
                        <div className="text-center">
                            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-violet-500" />

                            <p className="mt-4 text-muted-foreground">
                                Fetching content...
                            </p>
                        </div>
                    </div>
                )}

                {/* ERROR */}

                {error && !loading && (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
                        {error}
                    </div>
                )}

                {/* AFFAIRS */}
                {!loading && !error && activeTab === "affairs" && (
                    <section className="space-y-6">
                        {/* FILTER */}
                        <div className="mb-8 flex flex-col gap-4">
                            <div className="flex flex-col gap-4 md:flex-row">
                                <input
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    placeholder="Search affairs by keyword..."
                                    className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-5 py-3 text-gray-900 outline-none transition focus:border-teal-500"
                                />
                                <select
                                    value={examFilter}
                                    onChange={(event) => setExamFilter(event.target.value)}
                                    className="appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke-width%3D%221.5%22%20stroke%3D%22%236b7280%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22M8.25%2015L12%2018.75%2015.75%2015m-7.5-6L12%205.25%2015.75%209%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[position:right_1rem_center] bg-no-repeat rounded-xl border border-gray-200 bg-gray-50 pl-5 pr-12 py-3 text-gray-900 outline-none focus:border-teal-500 cursor-pointer"
                                >
                                    <option value="all">All Exams</option>
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
                                Showing {filteredArticles.length} {filteredArticles.length === 1 ? 'affair' : 'affairs'}
                            </div>
                        </div>

                        {filteredArticles.length === 0 ? (
                            <NoData />
                        ) : (
                            filteredArticles.map((item, index) => (
                                <ArticleCard
                                    key={index}
                                    item={item}
                                    exams={getExams(item)}
                                />
                            ))
                        )}
                    </section>
                )}

                {/* QUESTIONS */}

                {!loading &&
                    activeTab === "questions" && (
                        <section>

                            {/* FILTER */}

                            <div className="mb-8 flex flex-col gap-4">
                                <div className="flex flex-col gap-4 md:flex-row">
                                    <input
                                        value={search}
                                        onChange={(event) => setSearch(event.target.value)}
                                        placeholder="Search questions by keyword..."
                                        className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-5 py-3 text-gray-900 outline-none transition focus:border-teal-500"
                                    />

                                    <select
                                        value={examFilter}
                                        onChange={(event) => setExamFilter(event.target.value)}
                                        className="appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke-width%3D%221.5%22%20stroke%3D%22%236b7280%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22M8.25%2015L12%2018.75%2015.75%2015m-7.5-6L12%205.25%2015.75%209%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[position:right_1rem_center] bg-no-repeat rounded-xl border border-gray-200 bg-gray-50 pl-5 pr-12 py-3 text-gray-900 outline-none focus:border-teal-500 cursor-pointer"
                                    >
                                        <option value="all">All Exams</option>
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
                                    Showing {filteredQuestions.length} {filteredQuestions.length === 1 ? 'question' : 'questions'}
                                </div>
                            </div>

                            {/* QUESTIONS GRID */}

                            <div className="grid gap-6 lg:grid-cols-2">

                                {filteredQuestions.map(
                                    (question, index) => (
                                        <QuestionCard
                                            key={index}
                                            question={question}
                                        />
                                    )
                                )}

                            </div>

                        </section>
                    )}


                {activeTab === "themes" && !loading && !error && (
                    <section className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {themes.map((themeData, idx) => (
                                <div key={idx} className="rounded-3xl border border-gray-200 bg-white shadow-sm p-6 transition hover:shadow-lg">
                                    <h3 className="mb-2 text-lg font-[family-name:var(--font-poppins)] font-semibold text-[var(--primarynavy)]">{themeData.theme}</h3>
                                    <div className="mt-4 grid grid-cols-2 gap-4">
                                        <div className="rounded-xl bg-gray-50 p-3 text-center border border-gray-100">
                                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Items</p>
                                            <p className="text-2xl font-bold text-gray-900 mt-1">{themeData.item_count}</p>
                                        </div>
                                        <div className="rounded-xl bg-gray-50 p-3 text-center border border-gray-100">
                                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Avg Score</p>
                                            <p className="text-2xl font-bold text-[var(--primaryblue)] mt-1">{themeData.avg_score}</p>
                                        </div>
                                    </div>
                                    <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-600">
                                        <span className="font-medium">Max Score Reached</span>
                                        <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">{themeData.max_score}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {themes.length === 0 && <NoData />}
                    </section>
                )}



                {activeTab === "health" && !loading && !error && (
                    <section className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {[...healthData]
                                .sort((a, b) => b.success_rate - a.success_rate) // Sort by lowest success rate first
                                .map((record, idx) => (
                                    <div key={idx} className="rounded-3xl border border-gray-200 bg-white shadow-sm p-6 transition hover:shadow-lg flex flex-col">
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="font-bold text-[var(--primarynavy)] uppercase tracking-wider text-sm">{record.source_key}</h3>
                                            <span className={`text-xs font-bold px-2 py-1 rounded-md ${record.success_rate >= 90 ? 'bg-emerald-50 text-emerald-700' : record.success_rate >= 50 ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'}`}>
                                                {record.success_rate}%
                                            </span>
                                        </div>

                                        <div className="mb-4">
                                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div className={`h-full ${record.success_rate >= 90 ? 'bg-emerald-500' : record.success_rate >= 50 ? 'bg-amber-400' : 'bg-rose-500'}`} style={{ width: `${record.success_rate}%` }} />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mt-auto">
                                            <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 flex flex-col items-center">
                                                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Success</span>
                                                <span className="text-lg font-bold text-gray-900">{record.successful} <span className="text-xs text-gray-400 font-normal">/ {record.runs}</span></span>
                                            </div>
                                            <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 flex flex-col items-center justify-center text-center">
                                                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Last Sync</span>
                                                <span className="text-xs font-semibold text-gray-700">{new Date(record.last_run).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>
                        {healthData.length === 0 && <NoData />}
                    </section>
                )}

                {activeTab === "errors" && !loading && !error && (
                    <section className="space-y-6">
                        <div className="rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                                        <tr>
                                            <th className="px-6 py-4 font-semibold">Time</th>
                                            <th className="px-6 py-4 font-semibold">Source</th>
                                            <th className="px-6 py-4 font-semibold">Stage</th>
                                            <th className="px-6 py-4 font-semibold">Reason</th>
                                            <th className="px-6 py-4 font-semibold">Details</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {deadLetters.map((dl) => (
                                            <tr key={dl.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50">
                                                <td className="px-6 py-4 text-xs text-muted-foreground whitespace-nowrap">
                                                    {new Date(dl.created_at).toLocaleString('en-IN')}
                                                </td>
                                                <td className="px-6 py-4 font-bold text-gray-900 uppercase text-xs">{dl.source_key}</td>
                                                <td className="px-6 py-4">
                                                    <span className="bg-rose-50 text-rose-700 px-2 py-1 rounded-md text-xs font-semibold uppercase">{dl.stage}</span>
                                                </td>
                                                <td className="px-6 py-4 text-gray-700 font-medium">{dl.reason}</td>
                                                <td className="px-6 py-4">
                                                    <details className="text-xs text-gray-500 cursor-pointer">
                                                        <summary className="font-semibold text-blue-600 hover:underline">View Payload</summary>
                                                        <pre className="mt-2 p-3 bg-gray-50 border border-gray-100 rounded-lg overflow-x-auto max-w-xs md:max-w-md">
                                                            {dl.payload}
                                                        </pre>
                                                    </details>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {deadLetters.length === 0 && <NoData />}
                            </div>
                        </div>
                    </section>
                )}


                {/* DISCLAIMER */}

                <div className="mt-16 rounded-2xl border border-gray-200 border-l-blue-500 bg-gray-50 p-6 text-sm leading-6 text-muted-foreground">

                    <strong className="mb-2 block text-base text-gray-900">
                        Professional Disclaimer
                    </strong>

                    YuktiPrep's engine and generated material
                    are educational tools for
                    competitive-examination preparation.
                    Expected questions represent preparation
                    priorities, not guaranteed predictions.

                </div>

            </div>

            {/* SYNC OVERLAY */}

            {syncing && (<div className="fixed font-[family-name:var(--font-poppins)] inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md">
                <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-400 border-t-violet-500" />

                <h2 className="mt-6 text-2xl font-bold text-white">
                    Synchronizing Feeds
                </h2>

                <p className="mt-2 text-gray-300">
                    Querying official feeds and analyzing relevance...
                </p>

            </div>
            )}


        </div>
    );
}