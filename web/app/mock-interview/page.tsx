"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { interviewApi } from "@/lib/interview-api";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  levels,
  modes,
  locales,
  EXAM_CATALOG,
  EXAM_STREAMS,
  examStreamKeys,
  ExamStreamKey,
  CandidateProfile,
  MODE_CONFIGS,
  LEVEL_POLICY,
  Mode,
  Level,
  Locale,
} from "@/lib/interview-types";
import { toast } from "sonner";
import BackButton from "@/components/auth/back-button";

export default function MockInterview() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const [selectedStream, setSelectedStream] = useState<ExamStreamKey>("CIVIL_SERVICES");
  const filteredExams = EXAM_CATALOG.filter((e) => e.stream === selectedStream);
  const [selectedExamId, setSelectedExamId] = useState<string>(filteredExams[0]?.id || "UPSC_CSE");
  const currentExam = EXAM_CATALOG.find((e) => e.id === selectedExamId) || EXAM_CATALOG[0];

  const [topic, setTopic] = useState<string>(currentExam.defaultTopic);
  const [selectedMode, setSelectedMode] = useState<Mode>("MOCK_INTERVIEW");
  const [selectedLevel, setSelectedLevel] = useState<Level>("HIGH");
  const [selectedLocale, setSelectedLocale] = useState<Locale>("en-IN");
  const [selectedMedia, setSelectedMedia] = useState<"VIDEO" | "AUDIO" | "TEXT">("VIDEO");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [candidateProfile, setCandidateProfile] = useState<CandidateProfile>({
    fullName: user?.name || "",
    education: "",
    currentRole: "",
    experienceYears: 2,
    specialization: "",
    homeState: "",
    targetRole: "",
    keyAccomplishments: "",
  });

  // Sync user name if auth profile loads after initial render
  useEffect(() => {
    if (user?.name && !candidateProfile.fullName) {
      setCandidateProfile((prev) => ({ ...prev, fullName: user.name || "" }));
    }
  }, [user?.name]);

  const [showDafEditor, setShowDafEditor] = useState(true);

  const handleStreamChange = (stream: ExamStreamKey) => {
    setSelectedStream(stream);
    const exams = EXAM_CATALOG.filter((e) => e.stream === stream);
    if (exams.length > 0) {
      setSelectedExamId(exams[0].id);
      setTopic(exams[0].defaultTopic);
    }
  };

  const handleExamChange = (examId: string) => {
    setSelectedExamId(examId);
    const ex = EXAM_CATALOG.find((e) => e.id === examId);
    if (ex) {
      setTopic(ex.defaultTopic);
    }
  };

  const createSessionMutation = useMutation({
    mutationFn: interviewApi.createSession,
    onSuccess: (response) => {
      router.push(`/mock-interview/session/${response.data.id}`);
    },
    onError: (err: any) => {
      const message = err?.message || "Failed to start interview session";
      setError(message);
      toast.error(message);
      setBusy(false);
    },
  });

  const handleStartSession = () => {
    if (busy) return;
    setBusy(true);
    setError(null);

    createSessionMutation.mutate({
      mode: selectedMode,
      level: selectedLevel,
      locale: selectedLocale,
      examId: selectedExamId,
      topic,
      media: selectedMedia,
      candidateProfile: candidateProfile.fullName ? candidateProfile : undefined,
    });
  };

  const currentModeConfig = MODE_CONFIGS[selectedMode] || MODE_CONFIGS.MOCK_INTERVIEW;
  const policy = LEVEL_POLICY[selectedLevel];

  return (
    <div className="flex flex-col items-center px-4 py-6 font-[family-name:var(--font-poppins)]">
      <div className="w-full max-w-2xl">
        <BackButton onClick={() => router.push("/")} />
        <div className="mb-4 flex items-center justify-center">
          <h1 className="text-2xl font-bold text-[#1F314D] text-center">Mock Interview Studio</h1>
        </div>
        <p className="mb-6 text-center text-sm text-gray-600">
          Configure your interview simulation and start practicing with an AI panel.
        </p>

        <Card className="rounded-[20px] border-[#E2E6EE]">
          <CardHeader>
            <CardTitle className="text-lg">Configure Interview Simulation</CardTitle>
            <CardDescription>
              Select your exam stream, mode, and difficulty level. The AI panel will adapt to your profile.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
                <button
                  type="button"
                  onClick={() => setError(null)}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            )}

            <div className="space-y-2">
              <Label>Select Discipline / Career Stream</Label>
              <div className="flex flex-wrap gap-2">
                {examStreamKeys.map((key) => {
                  const active = selectedStream === key;
                  return (
                    <Button
                      key={key}
                      type="button"
                      variant={active ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleStreamChange(key)}
                      className="rounded-full"
                    >
                      {EXAM_STREAMS[key].name}
                    </Button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="exam">Target Examination / Board</Label>
              <select
                id="exam"
                value={selectedExamId}
                onChange={(e) => handleExamChange(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-teal-500"
              >
                {filteredExams.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.name}
                  </option>
                ))}
              </select>
            </div>

            {currentExam && (
              <div className="rounded-lg bg-slate-50 p-3 text-sm">
                <div className="font-semibold text-slate-700">Panel: {currentExam.panelPersona}</div>
                <div className="mt-1 text-slate-500">
                  <b>Assessed On:</b> {currentExam.keyFocusAreas.join(" • ")}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="topic">Interview Topic / Case</Label>
              <Input
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                required
                className="h-12 rounded-xl"
              />
              <div className="flex flex-wrap gap-2">
                {currentExam.sampleTopics.map((st, i) => (
                  <Button
                    key={i}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setTopic(st)}
                    className="rounded-full text-xs"
                  >
                    {st.length > 40 ? st.substring(0, 37) + "..." : st}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="mode">Simulation Mode</Label>
                <select
                  id="mode"
                  value={selectedMode}
                  onChange={(e) => setSelectedMode(e.target.value as Mode)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-teal-500"
                >
                  {modes.map((m) => (
                    <option key={m} value={m}>
                      {MODE_CONFIGS[m]?.title || m}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="level">Evaluation Tier</Label>
                <select
                  id="level"
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value as Level)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-teal-500"
                >
                  {levels.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="locale">Interview Language</Label>
                <select
                  id="locale"
                  value={selectedLocale}
                  onChange={(e) => setSelectedLocale(e.target.value as Locale)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-teal-500"
                >
                  {locales.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="media">Media Format</Label>
                <select
                  id="media"
                  value={selectedMedia}
                  onChange={(e) => setSelectedMedia(e.target.value as "VIDEO" | "AUDIO" | "TEXT")}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-teal-500"
                >
                  <option value="VIDEO">Video + Audio Room</option>
                  <option value="AUDIO">Audio Only Room</option>
                  <option value="TEXT">Text Dialogue Only</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Candidate Profile (DAF / Resume)</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDafEditor(!showDafEditor)}
                >
                  {showDafEditor ? "Hide" : "Edit"}
                </Button>
              </div>
              {showDafEditor && (
                <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">
                    The interview board will cross-examine you on your specific academic background, previous career accomplishments, and home region.
                  </p>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div className="space-y-1">
                      <Label htmlFor="fullName" className="text-xs">Full Name</Label>
                      <Input
                        id="fullName"
                        name="fullName"
                        autoComplete="name"
                        value={candidateProfile.fullName}
                        onChange={(e) => setCandidateProfile((prev) => ({ ...prev, fullName: e.target.value }))}
                        onInput={(e: React.FormEvent<HTMLInputElement>) => {
                          const val = (e.target as HTMLInputElement).value;
                          setCandidateProfile((prev) => ({ ...prev, fullName: val }));
                        }}
                        className="h-10 rounded-lg"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="education" className="text-xs">Academic Degree & Institute</Label>
                      <Input
                        id="education"
                        name="education"
                        autoComplete="off"
                        value={candidateProfile.education}
                        onChange={(e) => setCandidateProfile((prev) => ({ ...prev, education: e.target.value }))}
                        onInput={(e: React.FormEvent<HTMLInputElement>) => {
                          const val = (e.target as HTMLInputElement).value;
                          setCandidateProfile((prev) => ({ ...prev, education: val }));
                        }}
                        className="h-10 rounded-lg"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div className="space-y-1">
                      <Label htmlFor="currentRole" className="text-xs">Current Role & Experience</Label>
                      <Input
                        id="currentRole"
                        name="currentRole"
                        autoComplete="organization-title"
                        value={candidateProfile.currentRole}
                        onChange={(e) => setCandidateProfile((prev) => ({ ...prev, currentRole: e.target.value }))}
                        onInput={(e: React.FormEvent<HTMLInputElement>) => {
                          const val = (e.target as HTMLInputElement).value;
                          setCandidateProfile((prev) => ({ ...prev, currentRole: val }));
                        }}
                        className="h-10 rounded-lg"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="specialization" className="text-xs">Specialization / Optional Subject</Label>
                      <Input
                        id="specialization"
                        name="specialization"
                        autoComplete="off"
                        value={candidateProfile.specialization}
                        onChange={(e) => setCandidateProfile((prev) => ({ ...prev, specialization: e.target.value }))}
                        onInput={(e: React.FormEvent<HTMLInputElement>) => {
                          const val = (e.target as HTMLInputElement).value;
                          setCandidateProfile((prev) => ({ ...prev, specialization: val }));
                        }}
                        className="h-10 rounded-lg"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div className="space-y-1">
                      <Label htmlFor="homeState" className="text-xs">Home State / Region</Label>
                      <Input
                        id="homeState"
                        name="homeState"
                        autoComplete="address-level1"
                        value={candidateProfile.homeState}
                        onChange={(e) => setCandidateProfile((prev) => ({ ...prev, homeState: e.target.value }))}
                        onInput={(e: React.FormEvent<HTMLInputElement>) => {
                          const val = (e.target as HTMLInputElement).value;
                          setCandidateProfile((prev) => ({ ...prev, homeState: val }));
                        }}
                        className="h-10 rounded-lg"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="targetRole" className="text-xs">Target Service Cadre / Position</Label>
                      <Input
                        id="targetRole"
                        name="targetRole"
                        autoComplete="off"
                        value={candidateProfile.targetRole}
                        onChange={(e) => setCandidateProfile((prev) => ({ ...prev, targetRole: e.target.value }))}
                        onInput={(e: React.FormEvent<HTMLInputElement>) => {
                          const val = (e.target as HTMLInputElement).value;
                          setCandidateProfile((prev) => ({ ...prev, targetRole: val }));
                        }}
                        className="h-10 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
              By starting, you consent to automated evaluation. In accordance with ethical AI standards, evaluation is derived strictly from verbal transcripts, logical structure, and objective criteria without biometric profiling.
            </div>

            <Button
              onClick={handleStartSession}
              disabled={busy || createSessionMutation.isPending}
              className="h-12 w-full rounded-xl bg-[#0f172a] text-base font-semibold text-white hover:bg-[#1e293b]"
            >
              {busy || createSessionMutation.isPending
                ? "Connecting to Panel Room..."
                : `Enter ${currentExam.name}`}
            </Button>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-xs text-gray-400">
          Interview sessions are evaluated by AI. Results are indicative and not guaranteed outcomes.
        </div>
      </div>
    </div>
  );
}
