import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

export interface SeoPage {
  id: string;
  pageType: string;
  title: string;
  slug: string;
  content?: string;
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  robotsIndex: boolean;
  robotsFollow: boolean;
  schemaType?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export const useSeoPages = (params?: { pageType?: string; status?: string; search?: string; page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ["seoPages", params],
    queryFn: async () => {
      const response = await api.get("/api/v1/admin/seo-pages", { params });
      return response.data.data as SeoPage[];
    },
  });
};

export const useCreateSeoPage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<SeoPage, "id" | "createdAt" | "updatedAt" | "slug">) => {
      const response = await api.post("/api/v1/admin/seo-pages", data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seoPages"] });
    },
  });
};

export const useUpdateSeoPage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<SeoPage> }) => {
      const response = await api.patch(`/api/v1/admin/seo-pages/${id}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seoPages"] });
    },
  });
};

export const useDeleteSeoPage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/v1/admin/seo-pages/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seoPages"] });
    },
  });
};
