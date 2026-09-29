const BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

function getAuthHeaders() {
  const headers: Record<string, string> = {};

  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token") || getCookie("token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const lang = localStorage.getItem("yuktiprep_language");
    if (lang) {
      try {
        const langObj = JSON.parse(lang);
        if (langObj && langObj.code) {
          headers["x-language"] = langObj.code;
        }
      } catch (e) { }
    }
  }

  return headers;
}

async function request(endpoint: string, options: RequestInit = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = getAuthHeaders();

  const response = await fetch(url, {
    credentials: "include",
    ...options,
    headers: {
      ...headers,
      ...(options.headers as Record<string, string> || {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("yuktiprep_user");
      if (!window.location.pathname.startsWith("/login") && !window.location.pathname.startsWith("/register")) {
        window.location.href = "/login?expired=true";
      }
    }
    const message = data?.message || "Something went wrong";
    throw new Error(message);
  }

  return data;
}

export const api = {
  get: (endpoint: string) => request(endpoint),
  post: (endpoint: string, body?: unknown) =>
    request(endpoint, {
      method: "POST",
      headers: {
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    }),
  put: (endpoint: string, body: unknown) =>
    request(endpoint, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  patch: (endpoint: string, body: unknown) =>
    request(endpoint, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  upload: async (endpoint: string, formData: FormData) => {
    const url = `${BASE_URL}${endpoint}`;
    const headers = getAuthHeaders();

    const response = await fetch(url, {
      method: "POST",
      credentials: "include",
      headers: {
        ...headers,
      },
      body: formData,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const message = data?.message || "Upload failed";
      throw new Error(message);
    }

    return data;
  },
};
