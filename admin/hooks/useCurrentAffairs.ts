import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

export interface CurrentAffair {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  content: string;
  category?: string;
  examId?: string;
  subjectId?: string;
  importance?: string;
  publishedAt?: string;
  lastVerifiedAt?: string;
  sourceName?: string;
  sourceUrl?: string;
  reviewerName?: string;
  aiAssistance: boolean;
  status: string;
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export const useCurrentAffairs = (params?: { examId?: string; subjectId?: string; category?: string; status?: string; search?: string; page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ["currentAffairs", params],
    queryFn: async () => {
      const response = await api.get("/api/v1/admin/current-affairs", { params });
      return response.data.data as CurrentAffair[];
    },
  });
};

export const useCreateCurrentAffair = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<CurrentAffair, "id" | "createdAt" | "updatedAt" | "slug">) => {
      const response = await api.post("/api/v1/admin/current-affairs", data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentAffairs"] });
    },
  });
};

export const useUpdateCurrentAffair = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CurrentAffair> }) => {
      const response = await api.patch(`/api/v1/admin/current-affairs/${id}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentAffairs"] });
    },
  });
};

export const useDeleteCurrentAffair = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/v1/admin/current-affairs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentAffairs"] });
    },
  });
};

export const useVerifyCurrentAffair = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reviewerName }: { id: string; reviewerName?: string }) => {
      const response = await api.post(`/api/v1/admin/current-affairs/${id}/verify`, { reviewerName });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentAffairs"] });
    },
  });
};

export const usePublishCurrentAffair = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post(`/api/v1/admin/current-affairs/${id}/publish`);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentAffairs"] });
    },
  });
};

export const useArchiveCurrentAffair = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post(`/api/v1/admin/current-affairs/${id}/archive`);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentAffairs"] });
    },
  });
};
