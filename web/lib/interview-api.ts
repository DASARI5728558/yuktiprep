import { api } from "./api";
import { StartSessionPayload, FeedbackResult, ExamTrack } from "./interview-types";

export const interviewApi = {
  createSession: (payload: StartSessionPayload) =>
    api.post("/api/v1/interview/sessions", payload),

  getSession: (id: string) =>
    api.get(`/api/v1/interview/sessions/${id}`),

  ingestEvent: (sessionId: string, payload: { type: string; occurredAt?: string; payload?: Record<string, unknown> }) =>
    api.post(`/api/v1/interview/sessions/${sessionId}/events`, payload),

  tutorReply: (sessionId: string, payload: { message: string; currentPhase?: string; turnNumber?: number; history: Array<{ role: "user" | "assistant"; content: string }> }) =>
    api.post(`/api/v1/interview/sessions/${sessionId}/tutor`, payload),

  completeSession: (sessionId: string, payload: { transcript: string; segments: Array<{ role: "user" | "assistant"; content: string }>; durationMinutes: number }) =>
    api.post(`/api/v1/interview/sessions/${sessionId}/complete`, payload),

  getAnalytics: () =>
    api.get("/api/v1/interview/analytics/me"),

  getExams: () =>
    api.get("/api/v1/interview/exams"),
};
