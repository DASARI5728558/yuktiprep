"use client";

import { useState, useEffect, useCallback } from "react";

export interface AuthUser {
  id: string;
  name?: string;
  email?: string;
  phoneNumber?: string;
  role?: string;
  subscriptions?: Array<{
    status: string;
    plan?: {
      name: string;
      price?: number;
    };
  }>;
}

// Canonical default for both SSR and initial client render to avoid hydration mismatch
export const DEFAULT_APP_URL = "http://ap.yuktiprep.com";

export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return (
      localStorage.getItem("token") ||
      localStorage.getItem("yuktiprep_token") ||
      localStorage.getItem("auth_token") ||
      getCookie("token")
    );
  } catch {
    return getCookie("token");
  }
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw =
      localStorage.getItem("yuktiprep_user") ||
      localStorage.getItem("user") ||
      localStorage.getItem("authUser");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getAppBaseUrl(): string {
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    // Local dev environment
    if (host === "localhost" || host === "127.0.0.1") {
      return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:5001";
    }
    // If accessing via app.yuktiprep.com or ap.yuktiprep.com
    if (host.includes("yuktiprep.com")) {
      return window.location.protocol + "//" + (host.startsWith("app.") ? "app.yuktiprep.com" : "ap.yuktiprep.com");
    }
    return process.env.NEXT_PUBLIC_APP_URL || DEFAULT_APP_URL;
  }
  return DEFAULT_APP_URL;
}

export function useAuthStatus() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [appUrl, setAppUrl] = useState<string>(DEFAULT_APP_URL);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
    setAppUrl(getAppBaseUrl());
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      const token = getStoredToken();
      const parsedStoredUser = getStoredUser();

      // If no token is found in localStorage or cookies, user is logged out
      if (!token) {
        setIsAuthenticated(false);
        setUser(null);
        setLoading(false);
        return;
      }

      if (parsedStoredUser) {
        setUser(parsedStoredUser);
      }

      // Verify and fetch fresh user profile
      const headers: Record<string, string> = {
        Authorization: `Bearer ${token}`,
      };

      const res = await fetch(`${backendUrl}/api/v1/profile/me`, {
        headers,
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        const userData = data?.user || data?.data?.user;
        if (userData) {
          setUser(userData);
          setIsAuthenticated(true);
          return;
        }
      }

      if (res.status === 401 || res.status === 403) {
        // Token is invalid or expired
        try {
          localStorage.removeItem("token");
          localStorage.removeItem("yuktiprep_token");
          localStorage.removeItem("auth_token");
          localStorage.removeItem("yuktiprep_user");
          localStorage.removeItem("user");
          document.cookie = "token=; path=/; max-age=0;";
          document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
          if (window.location.hostname.includes("yuktiprep.com")) {
            document.cookie = "token=; path=/; domain=.yuktiprep.com; max-age=0;";
            document.cookie = "token=; path=/; domain=.yuktiprep.com; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
          }
        } catch { }
        setIsAuthenticated(false);
        setUser(null);
        return;
      }

      setIsAuthenticated(true);
    } catch {
      // In case of any network or parsing error, fallback to token existence in localStorage or cookies
      const token = getStoredToken();
      setIsAuthenticated(!!token);
      if (!token) {
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, [backendUrl]);

  useEffect(() => {
    checkAuth();

    if (typeof window !== "undefined") {
      // Listen for local storage events across tabs or windows
      const handleStorageChange = (e: StorageEvent) => {
        if (!e.key || e.key === "token" || e.key === "yuktiprep_user" || e.key === "yuktiprep_token" || e.key === "auth_token" || e.key === "user") {
          checkAuth();
        }
      };

      // Re-verify auth when user returns to or focuses the marketing site tab
      const handleVisibilityOrFocus = () => {
        const currentToken = getStoredToken();
        if (!currentToken) {
          setIsAuthenticated(false);
          setUser(null);
        } else {
          checkAuth();
        }
      };

      window.addEventListener("storage", handleStorageChange);
      window.addEventListener("focus", handleVisibilityOrFocus);
      document.addEventListener("visibilitychange", handleVisibilityOrFocus);

      // Heartbeat check every 1 second to instantly catch cookie/token deletion
      const interval = setInterval(() => {
        const currentToken = getStoredToken();
        if (!currentToken && isAuthenticated) {
          setIsAuthenticated(false);
          setUser(null);
        }
      }, 1000);

      return () => {
        window.removeEventListener("storage", handleStorageChange);
        window.removeEventListener("focus", handleVisibilityOrFocus);
        document.removeEventListener("visibilitychange", handleVisibilityOrFocus);
        clearInterval(interval);
      };
    }
  }, [checkAuth, isAuthenticated]);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("yuktiprep_token");
      localStorage.removeItem("auth_token");
      localStorage.removeItem("yuktiprep_user");
      localStorage.removeItem("user");
      document.cookie = "token=; path=/; max-age=0;";
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
      const isProduction = typeof window !== "undefined" && window.location.hostname.includes("yuktiprep.com");
      if (isProduction) {
        document.cookie = "token=; path=/; domain=.yuktiprep.com; max-age=0;";
        document.cookie = "token=; path=/; domain=.yuktiprep.com; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
      }
    } catch { }
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  return {
    isAuthenticated: isMounted ? isAuthenticated : false,
    user: isMounted ? user : null,
    loading: isMounted ? loading : true,
    appUrl,
    isMounted,
    refresh: checkAuth,
    logout,
  };
}
