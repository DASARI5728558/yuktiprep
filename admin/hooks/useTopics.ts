import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

export interface Topic {
  id: string;
  subjectId: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  subject?: { id: string; name: string };
}

export const useTopics = (params?: { subjectId?: string; search?: string; page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ["topics", params],
    queryFn: async () => {
      const response = await api.get("/api/v1/admin/topics", { params });
      return response.data.data as Topic[];
    },
  });
};

export const useCreateTopic = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<Topic, "id" | "createdAt" | "updatedAt" | "slug">) => {
      const response = await api.post("/api/v1/admin/topics", data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["topics"] });
    },
  });
};

export const useUpdateTopic = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Topic> }) => {
      const response = await api.patch(`/api/v1/admin/topics/${id}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["topics"] });
    },
  });
};

export const useDeleteTopic = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/v1/admin/topics/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["topics"] });
    },
  });
};
