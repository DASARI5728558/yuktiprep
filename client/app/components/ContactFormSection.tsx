"use client";

import React, { useState, useRef } from "react";
import { Mail, Phone, MapPin, AlertCircle, CheckCircle2, Upload, AlertTriangle, ShieldCheck } from "lucide-react";
import Link from "next/link";

const PERSONAS = [
  "Competitive Exam Aspirant",
  "Working Professional / Aspirant",
  "Student",
  "Parent / Guardian",
  "Teacher / Mentor",
  "Coaching Institute",
  "College / University",
  "Government Institution",
  "Corporate / Organization",
  "Content Partner",
  "Technology Partner",
  "Investor",
  "Media / Press",
  "Other",
];

const EXAM_CATEGORIES = [
  "UPSC Civil Services Examination",
  "State PSC",
  "SSC",
  "Banking",
  "Railways",
  "Defence",
  "Teaching / TET / DSC",
  "Police / Uniformed Services",
  "Engineering Entrance",
  "Medical Entrance",
  "Government Recruitment",
  "Other Competitive Examination",
  "Not Applicable",
];

const HELP_CATEGORIES = [
  "General Enquiry",
  "YuktiPrep Features",
  "Subscription / Pricing",
  "Free Trial / Demo",
  "Exam Preparation Guidance",
  "Mock Tests",
  "Mains Answer Writing",
  "Mock Interviews",
  "Previous Year Questions",
  "Study Materials",
  "Current Affairs",
  "AI Tutor / Learning Assistance",
  "Performance Analytics",
  "Eligibility Calculator",
  "Syllabus / Exam Pattern",
  "Multilingual Support",
  "Account / Login",
  "OTP / Verification Issue",
  "Payment / Billing",
  "Refund / Cancellation",
  "Technical Issue",
  "Report Incorrect Content",
  "Report Question / Answer Error",
  "Accessibility Support",
  "Institutional Partnership",
  "Coaching / University Partnership",
  "Content Partnership",
  "Technology / API Integration",
  "Corporate / Government Partnership",
  "Investor Enquiry",
  "Media / Press",
  "Privacy / Data Protection",
  "Grievance / Complaint",
  "Feedback / Suggestions",
  "Other",
];

const LANGUAGES = [
  "English",
  "Hindi",
  "Telugu",
  "Tamil",
  "Kannada",
  "Malayalam",
  "Marathi",
  "Bengali",
  "Gujarati",
  "Other",
];

interface ContactFormSectionProps {
  showSidebarCards?: boolean;
}

export default function ContactFormSection({ showSidebarCards = true }: ContactFormSectionProps) {
  const [isVisible] = useState(showSidebarCards);
  const sectionRef = useRef<HTMLElement>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobileNumber: "",
    persona: "Competitive Exam Aspirant",
    examCategory: "UPSC Civil Services Examination",
    state: "",
    specificExam: "",
    helpCategory: "General Enquiry",
    subject: "",
    description: "",
    preferredLanguage: "English",
    preferredContactMethod: "Email",
    bestTimeToContact: "No preference",
    consent: false,
    marketingConsent: false,
  });

  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successData, setSuccessData] = useState<{ referenceId: string; assignedTeam: string } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError("");
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      const isPdf = selected.type === "application/pdf" || selected.name.toLowerCase().endsWith(".pdf");
      if (!isPdf) {
        setFileError("Invalid format. Only PDF files under 5 MB are supported.");
        return;
      }
      if (selected.size > 5 * 1024 * 1024) {
        setFileError("File exceeds 5 MB limit.");
        return;
      }
      setFile(selected);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!formData.fullName.trim() || !formData.email.trim() || !formData.mobileNumber.trim()) {
      setErrorMsg("Please fill in your Full Name, Email Address, and Mobile Number.");
      return;
    }

    if (!formData.subject.trim() || !formData.description.trim()) {
      setErrorMsg("Subject and Description are required.");
      return;
    }

    if (!formData.consent) {
      setErrorMsg("You must agree to the YuktiPrep Privacy Policy and Terms of Use.");
      return;
    }

    try {
      setLoading(true);
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, String(value));
      });
      if (file) {
        data.append("attachment", file);
      }

      const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000").replace(/\/$/, "");
      const res = await fetch(`${backendUrl}/api/v1/support/tickets`, {
        method: "POST",
        body: data,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to submit request.");
      }

      setSuccessData({
        referenceId: json.data.referenceId,
        assignedTeam: json.data.assignedTeam,
      });

      // Keep viewport anchored to the contact section so it doesn't jump
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
    <section ref={sectionRef} className="py-20 px-6 max-w-[1240px] mx-auto scroll-mt-24" id="contact">
      <div className="text-center mb-12">
        <span className="text-[12px] font-extrabold tracking-[0.2em] text-[var(--primaryblue)] uppercase">
          Official Support & Enquiries
        </span>
        <h2 className="text-4xl md:text-5xl font-bold my-4 text-[var(--primarynavy)] tracking-tight">
          Contact YuktiPrep
        </h2>
        <p className="text-[17px] leading-[1.7] text-[#49605c] max-w-[650px] mx-auto">
          Questions about your preparation, account, subscription, technology, or partnership? Tell us how we can help.
        </p>
        <div className="mt-4">
          {isVisible && <Link
            href="/contact/report-problem"
            className="inline-flex items-center gap-2 text-sm font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-4 py-2 rounded-full transition-all"
          >
            <AlertTriangle size={15} />
            Need to report an error or technical bug? Go to Quick Report Problem →
          </Link>}
        </div>
      </div>

      {successData ? (
        <div className="max-w-[700px] mx-auto min-h-[600px] flex flex-col justify-center bg-white p-8 md:p-12 rounded-[24px] shadow-xl border border-teal-100 text-center animate-fade-in my-6">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={36} />
          </div>
          <h3 className="text-2xl md:text-3xl font-bold text-[var(--primarynavy)] mb-3">
            Thank You — We&apos;ve Received Your Request
          </h3>
          <p className="text-slate-600 mb-6">
            Your enquiry has been successfully submitted and routed to our team.
          </p>

          <div className="bg-[#f0f9f8] border border-[var(--teal)]/20 p-6 rounded-2xl mb-6">
            <span className="text-xs uppercase tracking-wider font-extrabold text-[var(--teal)] block mb-1">
              Reference ID
            </span>
            <span className="text-3xl font-extrabold tracking-wide text-[var(--primarynavy)] block select-all">
              {successData.referenceId}
            </span>
            <span className="text-xs text-slate-500 mt-2 block">
              Assigned Team: <strong>{successData.assignedTeam}</strong>
            </span>
          </div>

          <p className="text-sm text-slate-600 mb-8 leading-relaxed">
            Please keep your reference ID for future communication regarding this request. Our team will review the information and route it to the appropriate YuktiPrep team.
          </p>

          <div>
            <button
              onClick={() => {
                setSuccessData(null);
                setFormData({
                  fullName: "",
                  email: "",
                  mobileNumber: "",
                  persona: "Competitive Exam Aspirant",
                  examCategory: "UPSC Civil Services Examination",
                  state: "",
                  specificExam: "",
                  helpCategory: "General Enquiry",
                  subject: "",
                  description: "",
                  preferredLanguage: "English",
                  preferredContactMethod: "Email",
                  bestTimeToContact: "No preference",
                  consent: false,
                  marketingConsent: false,
                });
                setFile(null);
                setTimeout(() => {
                  sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                }, 50);
              }}
              className="bg-[var(--primaryblue)] text-white px-8 py-3.5 rounded-full font-bold hover:bg-[var(--primarynavy)] transition-colors shadow-md"
            >
              Submit Another Request
            </button>
          </div>
        </div>
      ) : (
        <div className={`grid grid-cols-1 ${isVisible ? "lg:grid-cols-12" : "max-w-[800px] mx-auto"} gap-10 items-start text-left`}>
          {/* Main Form */}
          <div className={`${isVisible ? "lg:col-span-8" : "w-full"} bg-white p-7 sm:p-10 md:p-12 rounded-[24px] shadow-sm border border-slate-200`}>
            <h3 className="text-2xl font-bold text-[var(--primarynavy)] mb-6">
              Send Enquiry
            </h3>

            {errorMsg && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-3 text-sm">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-bold text-[var(--primarynavy)] uppercase tracking-wider">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your full name"
                    className="border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[var(--primaryblue)] focus:ring-1 focus:ring-[var(--primaryblue)] bg-[#f8fafc]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-bold text-[var(--primarynavy)] uppercase tracking-wider">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your email address"
                    className="border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[var(--primaryblue)] focus:ring-1 focus:ring-[var(--primaryblue)] bg-[#f8fafc]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-bold text-[var(--primarynavy)] uppercase tracking-wider">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleInputChange}
                    required
                    placeholder="+91 XXXXX XXXXX"
                    className="border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[var(--primaryblue)] focus:ring-1 focus:ring-[var(--primaryblue)] bg-[#f8fafc]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-bold text-[var(--primarynavy)] uppercase tracking-wider">
                    I Am a... <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="persona"
                    value={formData.persona}
                    onChange={handleInputChange}
                    required
                    className="border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[var(--primaryblue)] focus:ring-1 focus:ring-[var(--primaryblue)] bg-[#f8fafc]"
                  >
                    {PERSONAS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-bold text-[var(--primarynavy)] uppercase tracking-wider">
                    Exam Category
                  </label>
                  <select
                    name="examCategory"
                    value={formData.examCategory}
                    onChange={handleInputChange}
                    className="border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[var(--primaryblue)] focus:ring-1 focus:ring-[var(--primaryblue)] bg-[#f8fafc]"
                  >
                    {EXAM_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {formData.examCategory === "State PSC" || formData.examCategory === "Police / Uniformed Services" ? (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-bold text-[var(--primarynavy)] uppercase tracking-wider">
                      State
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      placeholder="e.g. Karnataka, Tamil Nadu"
                      className="border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[var(--primaryblue)] focus:ring-1 focus:ring-[var(--primaryblue)] bg-[#f8fafc]"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-bold text-[var(--primarynavy)] uppercase tracking-wider">
                      Specific Exam
                    </label>
                    <input
                      type="text"
                      name="specificExam"
                      value={formData.specificExam}
                      onChange={handleInputChange}
                      placeholder="e.g. SSC CGL, RRB NTPC"
                      className="border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[var(--primaryblue)] focus:ring-1 focus:ring-[var(--primaryblue)] bg-[#f8fafc]"
                    />
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-bold text-[var(--primarynavy)] uppercase tracking-wider">
                  What Can We Help You With? <span className="text-red-500">*</span>
                </label>
                <select
                  name="helpCategory"
                  value={formData.helpCategory}
                  onChange={handleInputChange}
                  required
                  className="border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[var(--primaryblue)] focus:ring-1 focus:ring-[var(--primaryblue)] bg-[#f8fafc]"
                >
                  {HELP_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-bold text-[var(--primarynavy)] uppercase tracking-wider">
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  placeholder="Briefly describe your enquiry"
                  className="border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[var(--primaryblue)] focus:ring-1 focus:ring-[var(--primaryblue)] bg-[#f8fafc]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[13px] font-bold text-[var(--primarynavy)] uppercase tracking-wider">
                    Tell Us More <span className="text-red-500">*</span>
                  </label>
                  <span className="text-xs text-slate-500">
                    {formData.description.length}/2000
                  </span>
                </div>
                <textarea
                  name="description"
                  rows={5}
                  maxLength={2000}
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  placeholder="Please describe your question, issue, feedback, or requirement. Include relevant details so our team can assist you effectively."
                  className="border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[var(--primaryblue)] focus:ring-1 focus:ring-[var(--primaryblue)] resize-none bg-[#f8fafc]"
                ></textarea>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-bold text-[var(--primarynavy)] uppercase tracking-wider">
                  Attachment (Optional, Max 5 MB)
                </label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer inline-flex items-center gap-2 border border-slate-300 bg-[#f8fafc] hover:bg-slate-100 px-4 py-2 rounded-lg text-sm font-medium text-slate-700 transition-colors">
                    <Upload size={16} />
                    <span>{file ? file.name : "Choose File (PDF only, max 5 MB)"}</span>
                    <input
                      type="file"
                      accept="application/pdf,.pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  {file && (
                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>
                {fileError && <p className="text-xs text-red-500 mt-1">{fileError}</p>}
                <p className="text-[11px] text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-100 mt-1 leading-relaxed">
                  ⚠️ <strong>Security note:</strong> Do not upload passwords, OTPs, complete payment card details, government identity documents, or other unnecessary sensitive information.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-bold text-[var(--primarynavy)] uppercase tracking-wider">
                    Preferred Language
                  </label>
                  <select
                    name="preferredLanguage"
                    value={formData.preferredLanguage}
                    onChange={handleInputChange}
                    className="border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[var(--primaryblue)] focus:ring-1 focus:ring-[var(--primaryblue)] bg-[#f8fafc]"
                  >
                    {LANGUAGES.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-bold text-[var(--primarynavy)] uppercase tracking-wider">
                    Best Time to Contact
                  </label>
                  <select
                    name="bestTimeToContact"
                    value={formData.bestTimeToContact}
                    onChange={handleInputChange}
                    className="border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[var(--primaryblue)] focus:ring-1 focus:ring-[var(--primaryblue)] bg-[#f8fafc]"
                  >
                    <option>No preference</option>
                    <option>Morning (9 AM - 12 PM)</option>
                    <option>Afternoon (12 PM - 4 PM)</option>
                    <option>Evening (4 PM - 8 PM)</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-bold text-[var(--primarynavy)] uppercase tracking-wider">
                  Preferred Contact Method
                </label>
                <div className="flex flex-wrap gap-4 text-sm text-slate-700">
                  {["Email", "Phone", "WhatsApp", "In-app communication"].map((method) => (
                    <label key={method} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="preferredContactMethod"
                        value={method}
                        checked={formData.preferredContactMethod === method}
                        onChange={handleInputChange}
                        className="accent-[var(--primaryblue)]"
                      />
                      <span>{method}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-200 pt-5 flex flex-col gap-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="consent"
                    checked={formData.consent}
                    onChange={handleInputChange}
                    required
                    className="mt-1 accent-[var(--primaryblue)]"
                  />
                  <span className="text-xs text-slate-600 leading-relaxed">
                    I agree to the YuktiPrep{" "}
                    <Link href="/privacy-policy" className="text-[var(--primaryblue)] font-semibold underline">
                      Privacy Policy
                    </Link>{" "}
                    and{" "}
                    <Link href="/terms-of-use" className="text-[var(--primaryblue)] font-semibold underline">
                      Terms of Use
                    </Link>{" "}
                    and consent to YuktiPrep processing the information submitted through this form for handling my enquiry. <span className="text-red-500">*</span>
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="marketingConsent"
                    checked={formData.marketingConsent}
                    onChange={handleInputChange}
                    className="mt-1 accent-[var(--primaryblue)]"
                  />
                  <span className="text-xs text-slate-600 leading-relaxed">
                    I would like to receive YuktiPrep educational updates, product announcements, exam alerts, offers, and relevant communications. (Optional)
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[var(--primaryblue)] text-white font-bold py-3.5 px-6 rounded-xl hover:bg-[var(--primarynavy)] transition-all shadow-md disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span>Submitting Request...</span>
                ) : (
                  <span>Send Enquiry</span>
                )}
              </button>
            </form>
          </div>

          {/* Sidebar Contact Cards */}
          {isVisible && (
            <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="bg-white p-7 rounded-[24px] shadow-sm border border-slate-200">
                <h4 className="text-lg font-bold text-[var(--primarynavy)] mb-4 flex items-center gap-3">
                  <span className="w-9 h-9 rounded-full bg-blue-50 text-[var(--primaryblue)] flex items-center justify-center">
                    <Mail size={18} />
                  </span>
                  Email Support
                </h4>
                <p className="text-sm text-[#49605c] mb-3 leading-relaxed">
                  For general support inquiries, email our team directly.
                </p>
                <a href="mailto:support@yuktiprep.com" className="text-sm font-bold text-[var(--primaryblue)] hover:underline">
                  support@yuktiprep.com
                </a>
              </div>

              <div className="bg-white p-7 rounded-[24px] shadow-sm border border-slate-200">
                <h4 className="text-lg font-bold text-[var(--primarynavy)] mb-4 flex items-center gap-3">
                  <span className="w-9 h-9 rounded-full bg-teal-50 text-[var(--teal)] flex items-center justify-center">
                    <Phone size={18} />
                  </span>
                  Phone Assistance
                </h4>
                <p className="text-sm text-[#49605c] mb-3 leading-relaxed">
                  Support line open Monday to Saturday, 9 AM – 7 PM IST.
                </p>
                <a href="tel:+919535062244" className="text-sm font-bold text-[var(--primaryblue)] hover:underline">
                  +919535062244
                </a>
              </div>

              <div className="bg-white p-7 rounded-[24px] shadow-sm border border-slate-200">
                <h4 className="text-lg font-bold text-[var(--primarynavy)] mb-4 flex items-center gap-3">
                  <span className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <MapPin size={18} />
                  </span>
                  Headquarters
                </h4>
                <address className="text-sm text-[#49605c] not-italic leading-relaxed">
                  Flat No.304, 3rd Floor, Type4, Lakshith Properties<br />
                  Horamavu, Bangalore North<br />
                  Bangalore- 560043, Karnataka
                </address>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl flex items-start gap-3">
                <ShieldCheck className="text-emerald-600 shrink-0 mt-0.5" size={20} />
                <p className="text-xs text-emerald-800 leading-relaxed">
                  YuktiPrep support requests are strictly monitored with automated SLA routing and enterprise security standards.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
