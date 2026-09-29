"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { api } from "./api";

type User = {
  id: string;
  phoneNumber: string;
  email: string;
  name?: string;
  isVerified: boolean;
  role?: string;
  language?: string;
  state?: string;
  difficulty?: string;
  timezone?: string;
  deliveryHour?: number;
  channels?: string[];
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
  profilePic?: string;
  learnerProfile?: {
    id: string;
    userId: string;
    targetExamId?: string;
    attemptYear?: number;
    studyHoursPerDay?: number;
    preferredLanguage?: string;
    createdAt?: string;
    updatedAt?: string;
  };
  subscriptions?: Array<{
    status: string;
    plan: {
      name: string;
      theme?: string;
      price?: number;
      billingInterval?: string;
    };
  }>;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  register: (token: string, user: User) => void;
  updateUser: (user: User) => void;
  refreshUser: () => Promise<void>;
  isInitialized: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "token";
const USER_KEY = "yuktiprep_user";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY) || getCookie("token");
}

function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  React.useEffect(() => {
    const existingUser = getStoredUser();
    const existingToken = getStoredToken();
    setUser(existingUser);
    setToken(existingToken);
    setIsInitialized(true);

    // If token is found in cookies or localStorage but user profile isn't cached, fetch profile
    if (existingToken && !existingUser) {
      api.get("/api/v1/profile/me")
        .then((res) => {
          if (res?.data?.user) {
            localStorage.setItem(USER_KEY, JSON.stringify(res.data.user));
            setUser(res.data.user);
          }
        })
        .catch(() => {
          // ignore error
        });
    }
  }, []);

  const setTokenCookie = (tokenValue: string) => {
    if (typeof document === "undefined") return;
    const isProduction = window.location.hostname.includes("yuktiprep.com");
    const domainPart = isProduction ? "; domain=.yuktiprep.com" : "";
    document.cookie = `token=${encodeURIComponent(tokenValue)}; path=/${domainPart}; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
  };

  const removeTokenCookie = () => {
    if (typeof document === "undefined") return;
    const hostname = window.location.hostname;
    document.cookie = "token=; path=/; max-age=0; SameSite=Lax";
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";

    if (hostname.includes("yuktiprep.com")) {
      document.cookie = "token=; path=/; domain=.yuktiprep.com; max-age=0; SameSite=Lax";
      document.cookie = "token=; path=/; domain=.yuktiprep.com; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
      document.cookie = `token=; path=/; domain=${hostname}; max-age=0; SameSite=Lax`;
    }
  };

  const login = useCallback((newToken: string, newUser: User) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    setTokenCookie(newToken);
    setToken(newToken);
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem("auth_token");
    localStorage.removeItem("yuktiprep_token");
    localStorage.removeItem("yuktiprep_user");
    removeTokenCookie();
    setToken(null);
    setUser(null);
  }, []);

  const register = useCallback((newToken: string, newUser: User) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    setTokenCookie(newToken);
    setToken(newToken);
    setUser(newUser);
  }, []);

  const updateUser = useCallback((updatedUser: User) => {
    localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
    setUser(updatedUser);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const res = await api.get("/api/v1/profile/me");

      if (res?.data?.user) {
        localStorage.setItem(USER_KEY, JSON.stringify(res.data.user));
        setUser(res.data.user);
      }
    } catch (err) {
      // Silently handle refresh errors so they don't clutter the frontend console
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isInitialized,
        login,
        logout,
        register,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
