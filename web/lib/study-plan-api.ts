import { api } from "./api";

export interface StudyPlanMessage {
  id?: string;
  role: "user" | "assistant";
  content: string;
  createdAt?: string;
}

export interface StudyPlanSummary {
  id: string;
  title: string;
  exam: string;
  status: string;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface StudyPlanDetails {
  id: string;
  title: string;
  exam: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  messages: StudyPlanMessage[];
}

export interface GenerateStudyPlanResponse {
  success: boolean;
  message: string;
  studyPlanId?: string;
  assistantMessageId?: string;
}

export async function generateStudyPlanApi(
  prompt: string,
  conversationHistory: StudyPlanMessage[] = [],
  studyPlanId?: string
): Promise<GenerateStudyPlanResponse> {
  return (await api.post("/api/v1/study-planner", {
    prompt,
    conversationHistory,
    studyPlanId,
  })) as GenerateStudyPlanResponse;
}

export async function getStudyPlansHistoryApi(): Promise<{
  success: boolean;
  data: StudyPlanSummary[];
}> {
  return (await api.get("/api/v1/study-planner")) as {
    success: boolean;
    data: StudyPlanSummary[];
  };
}

export async function getStudyPlanDetailsApi(
  id: string
): Promise<{ success: boolean; data: StudyPlanDetails }> {
  return (await api.get(`/api/v1/study-planner/${id}`)) as {
    success: boolean;
    data: StudyPlanDetails;
  };
}

export interface ContinueLearningItem {
  id: string;
  type: "ai-tutor" | "study-plan";
  title: string;
  subtitle: string;
  topic: string;
  updatedAt: string;
  href: string;
}

export interface AiTutorSessionDetails {
  id: string;
  title: string;
  topic: string;
  createdAt: string;
  updatedAt: string;
  messages: {
    id: string;
    role: "user" | "assistant";
    content: string;
    createdAt: string;
  }[];
}

export async function askAiTutorApi(
  prompt: string,
  conversationHistory: { role: string; content: string }[] = [],
  sessionId?: string | null
): Promise<{ success: boolean; message: string; sessionId?: string }> {
  return (await api.post("/api/v1/study-planner/ask", {
    prompt,
    conversationHistory,
    sessionId,
  })) as { success: boolean; message: string; sessionId?: string };
}

export async function getContinueLearningHistoryApi(): Promise<{
  success: boolean;
  data: ContinueLearningItem[];
}> {
  return (await api.get("/api/v1/study-planner/history")) as {
    success: boolean;
    data: ContinueLearningItem[];
  };
}

export async function getAiTutorSessionDetailsApi(
  id: string
): Promise<{ success: boolean; data: AiTutorSessionDetails }> {
  return (await api.get(`/api/v1/study-planner/sessions/${id}`)) as {
    success: boolean;
    data: AiTutorSessionDetails;
  };
}


