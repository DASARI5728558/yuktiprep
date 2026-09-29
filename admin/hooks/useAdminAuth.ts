import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../lib/api";

// Assuming response shapes based on backend
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  profilePic?: string;
  lastLoginAt?: string;
}

export const useAdminMe = () => {
  return useQuery({
    queryKey: ["adminMe"],
    queryFn: async () => {
      const response = await api.get("/api/v1/auth/admin/me");
      return response.data?.data?.admin || response.data?.admin || null;
    },
    retry: false, // Don't retry if unauthenticated
  });
};

export const useAdminLogin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await api.post("/api/v1/auth/admin/login", credentials);
      return response.data;
    },
    onSuccess: (data) => {
      const token = data?.data?.token || data?.token;
      if (token && typeof window !== "undefined") {
        localStorage.setItem("admin_token", token);
      }
      // Invalidate the adminMe query to refetch user data
      queryClient.invalidateQueries({ queryKey: ["adminMe"] });
    },
  });
};

export const useAdminLogout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const response = await api.post("/api/v1/auth/admin/logout");
      return response.data;
    },
    onSuccess: () => {
      if (typeof window !== "undefined") {
        localStorage.removeItem("admin_token");
      }
      // Clear the user data from cache
      queryClient.setQueryData(["adminMe"], null);
      queryClient.clear();
    },
  });
};

export const useUpdateAdminProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; email: string }) => {
      const response = await api.put("/api/v1/auth/admin/me", data);
      return response.data?.data?.admin || response.data?.admin || null;
    },
    onSuccess: (updatedAdmin) => {
      if (updatedAdmin) {
        queryClient.setQueryData(["adminMe"], updatedAdmin);
      }
    },
  });
};

export const useUploadAdminPhoto = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const response = await api.post("/api/v1/auth/admin/me/photo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data?.data?.admin || response.data?.admin || null;
    },
    onSuccess: (updatedAdmin) => {
      if (updatedAdmin) {
        queryClient.setQueryData(["adminMe"], updatedAdmin);
      }
    },
  });
};

