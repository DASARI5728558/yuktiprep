import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

export interface Subject {
  id: string;
  examId: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  exam?: { id: string; name: string; slug: string };
}

export const useSubjects = (params?: { examId?: string; search?: string; page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ["subjects", params],
    queryFn: async () => {
      const response = await api.get("/api/v1/admin/subjects", { params });
      return response.data.data as Subject[];
    },
  });
};

export const useCreateSubject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<Subject, "id" | "createdAt" | "updatedAt" | "slug">) => {
      const response = await api.post("/api/v1/admin/subjects", data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
    },
  });
};

export const useUpdateSubject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Subject> }) => {
      const response = await api.patch(`/api/v1/admin/subjects/${id}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
    },
  });
};

export const useDeleteSubject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/v1/admin/subjects/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
    },
  });
};
