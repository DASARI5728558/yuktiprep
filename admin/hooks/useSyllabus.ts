import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

export interface Syllabus {
  id: string;
  examId: string;
  subjectId?: string;
  title: string;
  slug: string;
  content: string;
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  exam?: { id: string; name: string; slug: string };
  subject?: { id: string; name: string; slug: string };
}

export const useSyllabus = (params?: { examId?: string; subjectId?: string; status?: string; page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ["syllabus", params],
    queryFn: async () => {
      const response = await api.get("/api/v1/admin/syllabus", { params });
      return response.data.data as Syllabus[];
    },
  });
};

export const useCreateSyllabus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<Syllabus, "id" | "createdAt" | "updatedAt" | "slug">) => {
      const response = await api.post("/api/v1/admin/syllabus", data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["syllabus"] });
    },
  });
};

export const useUpdateSyllabus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Syllabus> }) => {
      const response = await api.patch(`/api/v1/admin/syllabus/${id}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["syllabus"] });
    },
  });
};

export const useDeleteSyllabus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/v1/admin/syllabus/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["syllabus"] });
    },
  });
};
