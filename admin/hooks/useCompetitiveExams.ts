import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

export interface CompetitiveExam {
  id: string;
  name: string;
  organization: string;
  state: string;
  category: string;
  examType?: string;
  notificationDate?: string;
  applicationStart?: string;
  applicationEnd?: string;
  examDate?: string;
  examDateText?: string;
  admitCardDate?: string;
  resultDate?: string;
  status: string;
  officialUrl: string;
  sourceUrl: string;
  sourceExamId: string;
  isActive: boolean;
  lastScrapedAt?: string;
  source?: {
    organization: string;
    scraperType: string;
  };
}

export interface ExamSource {
  id: string;
  organization: string;
  state: string;
  category: string;
  url: string;
  calendarUrl?: string;
  scraperType: string;
  scraperAdapter: string;
  enabled: boolean;
  lastRunAt?: string;
  lastSuccessAt?: string;
  lastFailureAt?: string;
  lastErrorMessage?: string;
  _count?: {
    competitiveExams: number;
  };
}

export interface ScrapeLog {
  id: string;
  organization: string;
  sourceUrl: string;
  startedAt: string;
  completedAt?: string;
  durationMs?: number;
  status: "RUNNING" | "SUCCESS" | "FAILED";
  recordsFound: number;
  recordsInserted: number;
  recordsUpdated: number;
  errorMessage?: string;
  source?: {
    organization: string;
    scraperAdapter: string;
  };
}

export interface ExamChangeLog {
  id: string;
  organization: string;
  examName: string;
  fieldName: string;
  oldValue: string;
  newValue: string;
  changeSource: string;
  changedAt: string;
}

export function useCompetitiveExamStats() {
  return useQuery({
    queryKey: ["competitive-exams-stats"],
    queryFn: async () => {
      const res = await api.get("/api/v1/admin/competitive-exams/stats");
      return res.data.data;
    },
  });
}

export function useCompetitiveExams(params: {
  page?: number;
  limit?: number;
  search?: string;
  organization?: string;
  state?: string;
  category?: string;
  status?: string;
}) {
  return useQuery({
    queryKey: ["competitive-exams-list", params],
    queryFn: async () => {
      const res = await api.get("/api/v1/admin/competitive-exams/exams", { params });
      return res.data;
    },
  });
}

export function useUpdateCompetitiveExam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CompetitiveExam> }) => {
      const res = await api.put(`/api/v1/admin/competitive-exams/exams/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["competitive-exams-list"] });
      queryClient.invalidateQueries({ queryKey: ["competitive-exams-stats"] });
    },
  });
}

export function useDeleteCompetitiveExam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/api/v1/admin/competitive-exams/exams/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["competitive-exams-list"] });
      queryClient.invalidateQueries({ queryKey: ["competitive-exams-stats"] });
    },
  });
}

export function useExamSources() {
  return useQuery({
    queryKey: ["exam-sources-list"],
    queryFn: async () => {
      const res = await api.get("/api/v1/admin/competitive-exams/sources");
      return res.data.data as ExamSource[];
    },
  });
}

export function useUpdateExamSource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ExamSource> }) => {
      const res = await api.put(`/api/v1/admin/competitive-exams/sources/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exam-sources-list"] });
      queryClient.invalidateQueries({ queryKey: ["competitive-exams-stats"] });
    },
  });
}

export function useToggleExamSource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.patch(`/api/v1/admin/competitive-exams/sources/${id}/toggle`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exam-sources-list"] });
      queryClient.invalidateQueries({ queryKey: ["competitive-exams-stats"] });
    },
  });
}

export function useTriggerSourceScrape() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post(`/api/v1/admin/competitive-exams/sources/${id}/scrape`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exam-sources-list"] });
      queryClient.invalidateQueries({ queryKey: ["scrape-logs-list"] });
      queryClient.invalidateQueries({ queryKey: ["competitive-exams-list"] });
      queryClient.invalidateQueries({ queryKey: ["competitive-exams-stats"] });
      queryClient.invalidateQueries({ queryKey: ["change-logs-list"] });
    },
  });
}

export function useTriggerAllScrapers() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await api.post("/api/v1/admin/competitive-exams/scrape-all");
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exam-sources-list"] });
      queryClient.invalidateQueries({ queryKey: ["scrape-logs-list"] });
      queryClient.invalidateQueries({ queryKey: ["competitive-exams-list"] });
      queryClient.invalidateQueries({ queryKey: ["competitive-exams-stats"] });
    },
  });
}

export function useScrapeLogs(params: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["scrape-logs-list", params],
    queryFn: async () => {
      const res = await api.get("/api/v1/admin/competitive-exams/scrape-logs", { params });
      return res.data;
    },
  });
}

export function useChangeLogs(params: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["change-logs-list", params],
    queryFn: async () => {
      const res = await api.get("/api/v1/admin/competitive-exams/change-logs", { params });
      return res.data;
    },
  });
}
