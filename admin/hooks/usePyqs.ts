import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

export interface PYQ {
  id: string;
  examId: string;
  subjectId?: string;
  topicId?: string;
  question: string;
  questionType?: string;
  options?: unknown;
  correctAnswer?: string;
  explanation?: string;
  year?: number;
  paper?: string;
  difficulty?: string;
  source?: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export const usePyqs = (params?: { examId?: string; subjectId?: string; topicId?: string; year?: string; difficulty?: string; search?: string; page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ["pyqs", params],
    queryFn: async () => {
      const response = await api.get("/api/v1/admin/pyqs", { params });
      return response.data.data as PYQ[];
    },
  });
};

export const useCreatePyq = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<PYQ, "id" | "createdAt" | "updatedAt">) => {
      const response = await api.post("/api/v1/admin/pyqs", data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pyqs"] });
    },
  });
};

export const useUpdatePyq = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<PYQ> }) => {
      const response = await api.patch(`/api/v1/admin/pyqs/${id}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pyqs"] });
    },
  });
};

export const useDeletePyq = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/v1/admin/pyqs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pyqs"] });
    },
  });
};

export const useBulkCreatePyqs = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ examId, pyqs }: { examId: string; pyqs: Omit<PYQ, "id" | "createdAt" | "updatedAt">[] }) => {
      const response = await api.post("/api/v1/admin/pyqs/bulk", { examId, pyqs });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pyqs"] });
    },
  });
};

export const useBulkDeletePyqs = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ids: string[]) => {
      const response = await api.delete("/api/v1/admin/pyqs/bulk", { data: { ids } });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pyqs"] });
    },
  });
};
