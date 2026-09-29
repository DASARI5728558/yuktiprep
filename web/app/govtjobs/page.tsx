"use client";
import SidebarDemo from "@/components/sidebar-demo";
import AuthGuard from "@/components/auth-guard";
import { useState, useEffect, useRef } from "react";
import { jobsApi } from "@/lib/jobs-api";
import { JobNotification, JobCategory, SearchFilters } from "@/types/jobs";
import ReactMarkdown from "react-markdown";

export default function GovtJobs() {
  const [jobs, setJobs] = useState<JobNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({ category: JobCategory.ALL });
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'model', parts: { text: string }[] }[]>([]);
  const [isChatting, setIsChatting] = useState(false);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  const fetchSavedJobs = async () => {
    try {
      const savedIds = await jobsApi.getSavedJobs();
      setSavedJobs(savedIds || []);
    } catch (e) {
      console.error("Failed to load saved jobs", e);
    }
  };

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const fetchJobsData = async (currentFilters: SearchFilters) => {
    setLoading(true);
    try {
      const res = await jobsApi.searchJobs(currentFilters);
      setJobs(res.jobs || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const hasFetched = useRef(false);

  useEffect(() => {
    if (!hasFetched.current) {
      fetchJobsData(filters);
      hasFetched.current = true;
    }
  }, []); // Initial load

  const handleSearch = () => {
    fetchJobsData(filters);
  };

  const toggleSaveJob = async (jobId: string) => {
    const isSaved = savedJobs.includes(jobId);
    
    // Optimistic UI update
    setSavedJobs(prev =>
      isSaved ? prev.filter(id => id !== jobId) : [...prev, jobId]
    );

    try {
      await jobsApi.toggleSavedJob(jobId, !isSaved);
    } catch (e) {
      // Revert on error
      console.error("Failed to toggle save job", e);
      setSavedJobs(prev =>
        !isSaved ? prev.filter(id => id !== jobId) : [...prev, jobId]
      );
    }
  };

  const handleChat = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setChatInput("");
    
    const newHistory = [...chatHistory, { role: 'user' as const, parts: [{ text: userMsg }] }];
    setChatHistory(newHistory);
    setIsChatting(true);

    try {
      const res = await jobsApi.chatWithAI(userMsg, chatHistory);
      setChatHistory([...newHistory, { role: 'model', parts: [{ text: res.response }] }]);
    } catch (e) {
      console.error(e);
      setChatHistory([...newHistory, { role: 'model', parts: [{ text: "Sorry, I am having trouble connecting to my knowledge base right now." }] }]);
    }
    setIsChatting(false);
  };

  const displayedJobs = showSavedOnly ? jobs.filter(j => savedJobs.includes(j.id)) : jobs;

  return (
    <AuthGuard>
      <div className="flex flex-col flex-1 font-poppins">
        <SidebarDemo>
          <main className="flex flex-1 flex-col min-w-0 h-full overflow-y-auto rounded-tl-2xl border border-neutral-200 bg-[#F4F6FA] p-5 shadow-sm md:p-8 lg:p-10">
            <div className="mx-auto w-full max-w-[1200px]">
              <h1 className="text-[28px] font-semibold text-[#1F314D] md:text-[32px]">Government Jobs Portal</h1>
              
              <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Left Column: Jobs List */}
                <div className="md:col-span-2 flex flex-col gap-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <input 
                      type="text" 
                      placeholder="Search jobs..." 
                      className="flex-1 min-w-[200px] rounded-xl border border-[#E2E6EE] bg-white px-4 py-2.5 text-sm font-medium text-[#1F314D] outline-none transition placeholder:text-[#647084] focus:border-[#0F7F8C]"
                      value={filters.query || ""}
                      onChange={(e) => setFilters({ ...filters, query: e.target.value })}
                    />
                    <div className="relative">
                      <select 
                        className="appearance-none rounded-xl border border-[#E2E6EE] bg-white px-4 py-2.5 pr-10 text-sm font-medium text-[#1F314D] outline-none transition focus:border-[#0F7F8C]"
                        value={filters.category || JobCategory.ALL}
                        onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                      >
                        {Object.values(JobCategory).map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#647084]">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </div>
                    <button 
                      onClick={handleSearch} 
                      className="rounded-xl bg-[#0F7F8C] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0a6b74]"
                    >
                      Search
                    </button>
                    <button 
                      onClick={() => setShowSavedOnly(!showSavedOnly)} 
                      className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                        showSavedOnly
                          ? "border-[#0F7F8C]/30 bg-[#E6F6F7] text-[#0F7F8C]"
                          : "border-[#E2E6EE] bg-white text-[#1F314D] hover:bg-gray-50"
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`h-4 w-4 ${showSavedOnly ? "text-[#0F7F8C]" : "text-[#647084]"}`}>
                        <path fillRule="evenodd" d="M6.32 2.577a49.255 49.255 0 0111.36 0c1.497.174 2.57 1.46 2.57 2.93V21l-8.25-5.25L3.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93z" clipRule="evenodd" />
                      </svg>
                      Saved ({savedJobs.length})
                    </button>
                  </div>

                  {loading ? (
                    <div className="rounded-[20px] border border-dashed border-[#E2E6EE] bg-white p-10 text-center text-sm text-[#647084]">
                      Loading active notifications...
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {displayedJobs.length === 0 && (
                        <div className="rounded-[20px] border border-dashed border-[#E2E6EE] bg-white p-10 text-center text-sm text-[#647084]">
                          No jobs found matching these criteria.
                        </div>
                      )}
                      {displayedJobs.map(job => (
                        <div key={job.id} className="rounded-[20px] border border-[#E2E6EE] bg-white p-5 shadow-sm transition hover:shadow-md">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h3 className="text-lg font-semibold text-[#1F314D]">{job.title}</h3>
                              <p className="mt-1 text-sm text-[#647084]">{job.organization} | {job.location}</p>
                            </div>
                            <button 
                              onClick={() => toggleSaveJob(job.id)} 
                              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition hover:bg-gray-50"
                              title={savedJobs.includes(job.id) ? "Remove from saved" : "Save Job"}
                            >
                              {savedJobs.includes(job.id) ? (
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-[#0F7F8C]">
                                  <path fillRule="evenodd" d="M6.32 2.577a49.255 49.255 0 0111.36 0c1.497.174 2.57 1.46 2.57 2.93V21l-8.25-5.25L3.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93z" clipRule="evenodd" />
                                </svg>
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 text-[#647084]">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                                </svg>
                              )}
                            </button>
                          </div>
                          <p className="mt-3 text-sm leading-relaxed text-[#354052]">{job.description}</p>
                          <div className="mt-3 flex flex-wrap gap-2 text-xs">
                            <span className="rounded-full bg-[#F3F4F6] px-3 py-1 font-medium text-[#1F314D]">Posts: {job.totalPosts}</span>
                            <span className="rounded-full bg-[#F3F4F6] px-3 py-1 font-medium text-[#1F314D]">Apply By: {job.applyByDate}</span>
                            <span className="rounded-full bg-[#F3F4F6] px-3 py-1 font-medium text-[#1F314D]">Category: {job.category}</span>
                          </div>
                          <div className="mt-4">
                            <a 
                              href={job.sourceUrl} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="text-sm font-semibold text-[#0F7F8C] transition hover:underline"
                            >
                              Official Portal →
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right Column: AI Assistant */}
                <div className="md:sticky md:top-4 flex flex-col max-h-[calc(100vh-14rem)] rounded-[20px] border border-[#E2E6EE] bg-white shadow-sm">
                  <div className="border-b border-[#E2E6EE] px-5 py-4">
                    <h2 className="text-lg font-semibold text-[#1F314D]">GovJobs Assistant</h2>
                    <p className="mt-1 text-xs text-[#647084]">Ask me anything about eligibility, exams, or active notifications.</p>
                  </div>

                  <div className="flex-1 overflow-y-auto px-5 py-4">
                    {chatHistory.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-10 text-center text-sm text-[#647084]">
                        No messages yet. Ask a question to get started.
                      </div>
                    )}
                    {chatHistory.map((msg, i) => (
                      <div
                        key={i}
                        className={`mb-3 rounded-[18px] px-4 py-3 text-sm ${
                          msg.role === "user"
                            ? "ml-auto max-w-[85%] bg-[#0F7F8C] text-white"
                            : "max-w-[90%] border border-[#E2E6EE] bg-white text-[#1F314D]"
                        }`}
                      >
                        <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-pre:p-0 [&>p]:mb-2 [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5 [&>h3]:font-bold [&>h3]:text-lg [&>h3]:mb-2">
                          <ReactMarkdown>{msg.parts[0].text}</ReactMarkdown>
                        </div>
                      </div>
                    ))}
                    {isChatting && (
                      <div className="mb-3 rounded-[18px] border border-[#E2E6EE] bg-white px-4 py-3 text-sm text-[#647084] animate-pulse">
                        Thinking...
                      </div>
                    )}
                  </div>

                  <div className="border-t border-[#E2E6EE] px-5 py-4">
                    <div className="flex items-center gap-2">
                      <input 
                        type="text" 
                        className="flex-1 rounded-xl border border-[#E2E6EE] bg-[#F4F6FA] px-4 py-3 text-sm font-medium text-[#1F314D] outline-none transition placeholder:text-[#647084] focus:border-[#0F7F8C]" 
                        placeholder="Ask a question..."
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleChat()}
                      />
                      <button 
                        onClick={handleChat} 
                        disabled={isChatting} 
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0F7F8C] text-white transition hover:bg-[#0a6b74] disabled:opacity-50"
                        aria-label="Send message"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </SidebarDemo>
      </div>
    </AuthGuard>
  );
}

