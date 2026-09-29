import { api } from "./api";
import { SearchFilters, JobNotification } from "../types/jobs";

export const jobsApi = {
  searchJobs: async (filters: SearchFilters, locationContext: string = ""): Promise<{ jobs: JobNotification[], sources: any[], isLiveAIBased?: boolean }> => {
    const queryParams = new URLSearchParams();
    if (filters.query) queryParams.append("query", filters.query);
    if (filters.state) queryParams.append("state", filters.state);
    if (filters.category) queryParams.append("category", filters.category);
    if (filters.qualification) queryParams.append("qualification", filters.qualification);
    if (filters.jobType) queryParams.append("jobType", filters.jobType);
    if (locationContext) queryParams.append("locationContext", locationContext);

    const data = await api.get(`/api/v1/jobs/search?${queryParams.toString()}`);
    return data.data; // data from backend is wrapped in { success: true, data: ... }
  },

  chatWithAI: async (message: string, history: { role: 'user' | 'model', parts: { text: string }[] }[] = []): Promise<{ response: string }> => {
    const data = await api.post("/api/v1/jobs/chat", { message, history });
    return data.data;
  },

  syncSources: async () => {
    const data = await api.post("/api/v1/jobs/sync", {});
    return data.data;
  },

  getSavedJobs: async (): Promise<string[]> => {
    const data = await api.get("/api/v1/jobs/saved");
    return data.data; // array of strings
  },

  toggleSavedJob: async (jobId: string, isSaved: boolean): Promise<void> => {
    await api.post(`/api/v1/jobs/saved/${jobId}`, { isSaved });
  }
};

