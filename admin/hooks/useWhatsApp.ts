import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

export interface WhatsAppTemplate {
  id: string;
  name: string;
  language: string;
  category: string;
  status: string;
  bodyComponents?: Record<string, unknown>;
  headerType?: string;
  mediaUrl?: string;
  metaTemplateId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WhatsAppCampaign {
  id: string;
  name: string;
  templateId: string;
  template?: WhatsAppTemplate;
  audienceFilter?: Record<string, unknown>;
  scheduledAt?: string;
  status: string;
  totalTargeted: number;
  totalSent: number;
  totalFailed: number;
  createdBy: string;
  adminUser?: { id: string; name: string; email: string };
  createdAt: string;
  updatedAt: string;
}

export interface WhatsAppConversation {
  contactName: string;
  id: string;
  userId: string;
  waId: string;
  state: string;
  humanHandoff: boolean;
  context?: Record<string, unknown>;
  lastInboundAt?: string;
  createdAt: string;
  updatedAt: string;
  user?: { id: string; name: string; phoneNumber: string };
}

export interface WhatsAppMessage {
  id: string;
  conversationId: string;
  userId?: string;
  providerMessageId?: string;
  direction: string;
  type: string;
  body?: string;
  status: string;
  payload?: Record<string, unknown>;
  createdAt: string;
}

export interface WhatsAppBotRule {
  id: string;
  trigger: string;
  category: string;
  actionType: string;
  actionPayload?: Record<string, unknown>;
  priority: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AnalyticsSummary {
  totalMessages: number;
  inboundMessages: number;
  outboundMessages: number;
  deliveredMessages: number;
  readMessages: number;
  failedMessages: number;
  totalConversations: number;
  handoffConversations: number;
  deliveryRate: number;
  handoffRate: number;
}

export const useWhatsAppTemplates = (params?: { status?: string; search?: string; page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ["whatsappTemplates", params],
    queryFn: async () => {
      const response = await api.get("/api/v1/admin/whatsapp/templates", { params });
      return response.data.data as WhatsAppTemplate[];
    },
  });
};

export const useWhatsAppCampaigns = (params?: { status?: string; page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ["whatsappCampaigns", params],
    queryFn: async () => {
      const response = await api.get("/api/v1/admin/whatsapp/campaigns", { params });
      return response.data.data as WhatsAppCampaign[];
    },
  });
};

export const useWhatsAppConversations = (params?: { state?: string; humanHandoff?: boolean; search?: string; page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ["whatsappConversations", params],
    queryFn: async () => {
      const response = await api.get("/api/v1/admin/whatsapp/conversations", { params });
      return response.data.data as WhatsAppConversation[];
    },
    refetchInterval: 3000,
  });
};

export const useWhatsAppMessages = (conversationId: string, params?: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ["whatsappMessages", conversationId, params],
    queryFn: async () => {
      const response = await api.get(`/api/v1/admin/whatsapp/conversations/${conversationId}/messages`, { params });
      return response.data.data as WhatsAppMessage[];
    },
    enabled: !!conversationId,
    refetchInterval: 3000,
  });
};

export const useWhatsAppBotRules = (params?: { category?: string; isActive?: boolean }) => {
  return useQuery({
    queryKey: ["whatsappBotRules", params],
    queryFn: async () => {
      const response = await api.get("/api/v1/admin/whatsapp/rules", { params });
      return response.data.data as WhatsAppBotRule[];
    },
  });
};

export const useAnalyticsSummary = () => {
  return useQuery({
    queryKey: ["whatsappAnalyticsSummary"],
    queryFn: async () => {
      const response = await api.get("/api/v1/admin/whatsapp/analytics/summary");
      return response.data.data as AnalyticsSummary;
    },
  });
};

export const useAnalyticsDaily = (days = 30) => {
  return useQuery({
    queryKey: ["whatsappAnalyticsDaily", days],
    queryFn: async () => {
      const response = await api.get("/api/v1/admin/whatsapp/analytics/daily", { params: { days } });
      return response.data.data as { date: string; count: number }[];
    },
  });
};

export const useCreateTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<WhatsAppTemplate>) => {
      const response = await api.post("/api/v1/admin/whatsapp/templates", data);
      return response.data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["whatsappTemplates"] }),
  });
};

export const useUpdateTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<WhatsAppTemplate> }) => {
      const response = await api.patch(`/api/v1/admin/whatsapp/templates/${id}`, data);
      return response.data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["whatsappTemplates"] }),
  });
};

export const useToggleTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const response = await api.patch(`/api/v1/admin/whatsapp/templates/${id}/toggle`, { isActive });
      return response.data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["whatsappTemplates"] }),
  });
};

export const useCreateCampaign = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<WhatsAppCampaign>) => {
      const response = await api.post("/api/v1/admin/whatsapp/campaigns", data);
      return response.data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["whatsappCampaigns"] }),
  });
};

export const useSendCampaign = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post(`/api/v1/admin/whatsapp/campaigns/${id}/send`);
      return response.data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["whatsappCampaigns"] }),
  });
};

export const useCreateBotRule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<WhatsAppBotRule>) => {
      const response = await api.post("/api/v1/admin/whatsapp/rules", data);
      return response.data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["whatsappBotRules"] }),
  });
};

export const useUpdateBotRule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<WhatsAppBotRule> }) => {
      const response = await api.patch(`/api/v1/admin/whatsapp/rules/${id}`, data);
      return response.data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["whatsappBotRules"] }),
  });
};

export const useDeleteBotRule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/v1/admin/whatsapp/rules/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["whatsappBotRules"] }),
  });
};

export const useToggleBotRule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const response = await api.patch(`/api/v1/admin/whatsapp/rules/${id}/toggle`, { isActive });
      return response.data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["whatsappBotRules"] }),
  });
};

export const useSendConversationMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ conversationId, body, type }: { conversationId: string; body: string; type?: string }) => {
      const response = await api.post(`/api/v1/admin/whatsapp/conversations/${conversationId}/send`, { body, type });
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["whatsappMessages", variables.conversationId] });
    },
  });
};

export const useHandoffConversation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post(`/api/v1/admin/whatsapp/conversations/${id}/handoff`);
      return response.data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["whatsappConversations"] }),
  });
};

export const useReleaseConversation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post(`/api/v1/admin/whatsapp/conversations/${id}/release`);
      return response.data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["whatsappConversations"] }),
  });
};
