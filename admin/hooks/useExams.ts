import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

export interface Exam {
  id: string;
  name: string;
  slug: string;
  shortDescription?: string;
  description?: string;
  logoUrl?: string;
  isActive: boolean;
  isPublished: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export const useExams = (params?: { search?: string; page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ["exams", params],
    queryFn: async () => {
      const response = await api.get("/api/v1/admin/exams", { params });
      return response.data.data as Exam[];
    },
  });
};

export const useCreateExam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<Exam, "id" | "slug" | "createdAt" | "updatedAt">) => {
      const response = await api.post("/api/v1/admin/exams", data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exams"] });
    },
  });
};

export const useUpdateExam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Exam> }) => {
      const response = await api.patch(`/api/v1/admin/exams/${id}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exams"] });
    },
  });
};

export const useDeleteExam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/v1/admin/exams/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exams"] });
    },
  });
};
