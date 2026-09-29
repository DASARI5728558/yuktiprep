import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("admin_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== "undefined") {
        // Prevent infinite reload loop if already on the login page
        if (!window.location.pathname.startsWith("/login")) {
          window.location.href = "/login?expired=true";
        }
      }
    }
    return Promise.reject(error);
  }
);

(api as unknown as { patch: (endpoint: string, data?: unknown) => Promise<unknown> }).patch = async (endpoint: string, data?: unknown) => api.request({ method: "PATCH", url: endpoint, data });

export default api;
