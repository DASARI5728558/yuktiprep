"use client";

import React, { useState, useRef } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { AlertTriangle, CheckCircle2, AlertCircle, Upload, ShieldAlert, ArrowLeft } from "lucide-react";
import Link from "next/link";

const PROBLEM_TYPES = [
  "Report Incorrect Question or Answer",
  "Report Out-of-Syllabus Content",
  "Report Outdated Information",
  "Report Technical Issue",
  "Report Payment Issue",
  "Report Accessibility Issue",
  "Report Abuse or Inappropriate Content",
];

const EXAMINATIONS = [
  "UPSC Civil Services Examination",
  "SSC CGL",
  "SSC CHSL",
  "Banking - IBPS PO",
  "Banking - SBI PO",
  "Railways - RRB NTPC",
  "Defence - CDS",
  "Defence - NDA",
  "State PSC (General)",
  "Other Examination",
];

export default function ReportProblem() {
  const sectionRef = useRef<HTMLElement>(null);
  const [formData, setFormData] = useState({
    problemType: "Report Incorrect Question or Answer",
    examination: "UPSC Civil Services Examination",
    subject: "",
    chapter: "",
    topic: "",
    questionId: "",
    explanation: "",
    fullName: "",
    email: "",
    mobileNumber: "",
  });

  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successData, setSuccessData] = useState<{ referenceId: string; assignedTeam: string } | null>(null);

  const isEducationalContent = [
    "Report Incorrect Question or Answer",
    "Report Out-of-Syllabus Content",
    "Report Outdated Information",
  ].includes(formData.problemType);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError("");
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      const validTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
      if (!validTypes.includes(selected.type)) {
        setFileError("Invalid format. Allowed formats: PDF, JPG, JPEG, PNG.");
        return;
      }
      if (selected.size > 5 * 1024 * 1024) {
        setFileError("File exceeds 5 MB limit.");
        return;
      }
      setEvidenceFile(selected);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!formData.fullName.trim() || !formData.email.trim() || !formData.mobileNumber.trim()) {
      setErrorMsg("Please fill in your Full Name, Email Address, and Mobile Number.");
      return;
    }

    if (!formData.explanation.trim()) {
      setErrorMsg("Please provide an explanation or description of the issue.");
      return;
    }

    try {
      setLoading(true);
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, String(value));
      });
      if (evidenceFile) {
        data.append("evidence", evidenceFile);
      }

      const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000").replace(/\/$/, "");
      const res = await fetch(`${backendUrl}/api/v1/support/problem-reports`, {
        method: "POST",
        body: data,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to submit report.");
      }

      setSuccessData({
        referenceId: json.data.referenceId,
        assignedTeam: json.data.assignedTeam,
      });

      setTimeout(() => {
        sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <Navbar />

      <section ref={sectionRef} className="pt-28 pb-20 px-6 max-w-[900px] mx-auto scroll-mt-24">
        <div className="mb-6">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-[var(--primaryblue)] transition-colors"
          >
            <ArrowLeft size={16} />
            Back to General Contact
          </Link>
        </div>

        <div className="text-center mb-10">
          <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={24} />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--primarynavy)] tracking-tight">
            Report a Problem
          </h1>
          <p className="text-[16px] leading-[1.6] text-slate-600 max-w-[600px] mx-auto mt-2">
            Notice a question error, out-of-syllabus topic, technical glitch, or payment issue? Submit it here for prioritized review by our Academic Quality and Technical Teams.
          </p>
        </div>

        {/* Success Modal / Confirmation */}
        {successData ? (
          <div className="bg-white p-8 md:p-12 rounded-[24px] min-h-[550px] flex flex-col justify-center shadow-xl border border-teal-100 text-center animate-fade-in my-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={36} />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-[var(--primarynavy)] mb-3">
              Report Submitted Successfully
            </h2>
            <p className="text-slate-600 mb-6">
              A content-quality / problem ticket has been generated and routed to the corresponding team.
            </p>

            <div className="bg-[#f0f9f8] border border-[var(--teal)]/20 p-6 rounded-2xl mb-6">
              <span className="text-xs uppercase tracking-wider font-extrabold text-[var(--teal)] block mb-1">
                Reference Ticket ID
              </span>
              <span className="text-3xl font-extrabold tracking-wide text-[var(--primarynavy)] block select-all">
                {successData.referenceId}
              </span>
              <span className="text-xs text-slate-500 mt-2 block">
                Assigned Team: <strong>{successData.assignedTeam}</strong>
              </span>
            </div>

            <p className="text-sm text-slate-600 mb-8 leading-relaxed">
              Our academic validation and engineering teams inspect every report to maintain the highest standard of syllabus accuracy and platform reliability.
            </p>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  setSuccessData(null);
                  setFormData({
                    problemType: "Report Incorrect Question or Answer",
                    examination: "UPSC Civil Services Examination",
                    subject: "",
                    chapter: "",
                    topic: "",
                    questionId: "",
                    explanation: "",
                    fullName: "",
                    email: "",
                    mobileNumber: "",
                  });
                  setEvidenceFile(null);
                  setTimeout(() => {
                    sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }, 50);
                }}
                className="bg-[var(--primaryblue)] text-white px-6 py-3 rounded-full font-bold hover:bg-[var(--primarynavy)] transition-colors shadow-md text-sm"
              >
                Report Another Issue
              </button>
              <Link
                href="/"
                className="bg-slate-100 text-slate-700 px-6 py-3 rounded-full font-bold hover:bg-slate-200 transition-colors text-sm"
              >
                Return Home
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white p-7 sm:p-10 md:p-12 rounded-[24px] shadow-sm border border-slate-200">
            {errorMsg && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-3 text-sm">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {/* Problem Type Dropdown */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-bold text-[var(--primarynavy)] uppercase tracking-wider">
                  Problem Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="problemType"
                  value={formData.problemType}
                  onChange={handleInputChange}
                  required
                  className="border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[var(--primaryblue)] focus:ring-1 focus:ring-[var(--primaryblue)] bg-[#f8fafc] text-slate-800"
                >
                  {PROBLEM_TYPES.map((pt) => (
                    <option key={pt} value={pt}>
                      {pt}
                    </option>
                  ))}
                </select>
              </div>

              {/* Conditional Educational Content Fields */}
              {isEducationalContent && (
                <div className="bg-amber-50/60 border border-amber-200/80 p-5 sm:p-6 rounded-2xl flex flex-col gap-4">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                    <ShieldAlert size={18} className="text-amber-700" />
                    <span>Educational Content Details (Auto-routed to Academic Quality Team)</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Examination
                      </label>
                      <select
                        name="examination"
                        value={formData.examination}
                        onChange={handleInputChange}
                        className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-[var(--primaryblue)]"
                      >
                        {EXAMINATIONS.map((exam) => (
                          <option key={exam} value={exam}>
                            {exam}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Subject
                      </label>
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        placeholder="e.g. Modern History, Polity, Quantitative Aptitude"
                        className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-[var(--primaryblue)]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Chapter
                      </label>
                      <input
                        type="text"
                        name="chapter"
                        value={formData.chapter}
                        onChange={handleInputChange}
                        placeholder="e.g. Freedom Struggle 1857"
                        className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-[var(--primaryblue)]"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Topic
                      </label>
                      <input
                        type="text"
                        name="topic"
                        value={formData.topic}
                        onChange={handleInputChange}
                        placeholder="e.g. Non-Cooperation Movement"
                        className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-[var(--primaryblue)]"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Question ID / Content ID
                      </label>
                      <input
                        type="text"
                        name="questionId"
                        value={formData.questionId}
                        onChange={handleInputChange}
                        placeholder="e.g. Q-48291"
                        className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-[var(--primaryblue)]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* User Explanation */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-bold text-[var(--primarynavy)] uppercase tracking-wider">
                  User&apos;s Explanation <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="explanation"
                  rows={5}
                  value={formData.explanation}
                  onChange={handleInputChange}
                  required
                  placeholder="Explain the problem in detail. If reporting an incorrect answer, explain why you think the official or current answer is incorrect."
                  className="border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[var(--primaryblue)] focus:ring-1 focus:ring-[var(--primaryblue)] resize-none bg-[#f8fafc]"
                ></textarea>
              </div>

              {/* Screenshot / Evidence File */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-bold text-[var(--primarynavy)] uppercase tracking-wider">
                  Screenshot / Evidence (Optional, Max 5 MB)
                </label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer inline-flex items-center gap-2 border border-slate-300 bg-[#f8fafc] hover:bg-slate-100 px-4 py-2 rounded-lg text-sm font-medium text-slate-700 transition-colors">
                    <Upload size={16} />
                    <span>{evidenceFile ? evidenceFile.name : "Upload Screenshot or PDF (Max 5MB)"}</span>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  {evidenceFile && (
                    <button
                      type="button"
                      onClick={() => setEvidenceFile(null)}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>
                {fileError && <p className="text-xs text-red-500 mt-1">{fileError}</p>}
              </div>

              {/* Contact Details (Required) */}
              <div className="border-t border-slate-200 pt-5 flex flex-col gap-3">
                <span className="text-xs font-bold text-[var(--primarynavy)] uppercase tracking-wider block">
                  Your Contact Information <span className="text-red-500">*</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">Full Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      placeholder="Your Name"
                      className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-[#f8fafc] focus:outline-none focus:border-[var(--primaryblue)]"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">Email Address <span className="text-red-500">*</span></label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="Your Email"
                      className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-[#f8fafc] focus:outline-none focus:border-[var(--primaryblue)]"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">Mobile Number <span className="text-red-500">*</span></label>
                    <input
                      type="tel"
                      name="mobileNumber"
                      value={formData.mobileNumber}
                      onChange={handleInputChange}
                      required
                      placeholder="+91 XXXXX XXXXX"
                      className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-[#f8fafc] focus:outline-none focus:border-[var(--primaryblue)]"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[var(--primaryblue)] text-white font-bold py-3.5 px-6 rounded-xl hover:bg-[var(--primarynavy)] transition-all shadow-md disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
              >
                {loading ? <span>Submitting Report...</span> : <span>Submit Problem Report</span>}
              </button>
            </form>
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
