"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { useAuth } from "./auth-context";
import { getSocket } from "./socket";

export interface Notification {
  id: string;
  postId: string;
  commentId: string;
  actorName: string;
  postTitle: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationContextValue {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(
  undefined
);

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

function getAuthToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    const token = getAuthToken();
    if (!token) return;

    try {
      const res = await fetch(
        `${BACKEND_URL}/api/v1/community/notifications/unread-count`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const json = await res.json();
      if (json.success) {
        setUnreadCount(json.data.count);
      }
    } catch (err) {
      // silent
    }
  }, []);

  // Fetch all notifications
  const fetchNotifications = useCallback(async () => {
    const token = getAuthToken();
    if (!token) return;

    setLoading(true);
    try {
      const res = await fetch(
        `${BACKEND_URL}/api/v1/community/notifications?limit=50`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const json = await res.json();
      if (json.success) {
        setNotifications(json.data);
      }
    } catch (err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  // Mark single as read
  const markAsRead = useCallback(
    async (id: string) => {
      const token = getAuthToken();
      if (!token) return;

      try {
        await fetch(
          `${BACKEND_URL}/api/v1/community/notifications/${id}/read`,
          {
            method: "PATCH",
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        // silent
      }
    },
    []
  );

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    const token = getAuthToken();
    if (!token) return;

    try {
      await fetch(
        `${BACKEND_URL}/api/v1/community/notifications/read-all`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      // silent
    }
  }, []);

  // Join user's personal socket room & listen for real-time notifications
  useEffect(() => {
    if (!user?.id) return;

    const socket = getSocket();

    // Join personal room
    socket.emit("user:join", user.id);

    const handleNotification = (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    };

    socket.on("notification:created", handleNotification);

    return () => {
      socket.off("notification:created", handleNotification);
    };
  }, [user?.id]);

  // Fetch unread count on mount / user change
  useEffect(() => {
    if (user?.id) {
      fetchUnreadCount();
    }
  }, [user?.id, fetchUnreadCount]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return ctx;
}
