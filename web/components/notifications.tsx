"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useNotifications, Notification } from "@/lib/notification-context";
import { useLanguage } from "@/lib/language-context";
import {
  Bell,
  MessageSquare,
  CheckCheck,
  ArrowLeft,
  Loader2,
  BellOff,
} from "lucide-react";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

function getRelativeTime(dateStr: string) {
  const now = Date.now();
  const diff = now - new Date(dateStr).getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return "Just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

const NotificationCard = ({
  notification,
  onRead,
}: {
  notification: Notification;
  onRead: (id: string, postId: string) => void;
}) => {
  return (
    <button
      type="button"
      onClick={() => onRead(notification.id, notification.postId)}
      className={`flex w-full items-start gap-3.5 rounded-2xl border px-4 py-4 text-left transition-all hover:shadow-md ${
        notification.isRead
          ? "border-[#E8EDF2] bg-white"
          : "border-[#D4DEFF] bg-[#F0F4FF]"
      }`}
    >
      {/* Icon */}
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
          notification.isRead
            ? "bg-[#F3F4F6] text-[#9CA3AF]"
            : "bg-[#6B55D9]/10 text-[#6B55D9]"
        }`}
      >
        <MessageSquare className="h-4.5 w-4.5" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm leading-snug ${
            notification.isRead
              ? "text-[#647084] font-normal"
              : "text-[#1F314D] font-semibold"
          }`}
        >
          <span className="font-bold">{notification.actorName}</span>
          {" commented on your post "}
          <span className="font-semibold text-[#6B55D9]">
            &ldquo;{notification.postTitle.length > 50
              ? notification.postTitle.slice(0, 50) + "…"
              : notification.postTitle}&rdquo;
          </span>
        </p>
        <p className="mt-1 text-xs text-[#9CA3AF]">
          {getRelativeTime(notification.createdAt)}
        </p>
      </div>

      {/* Unread dot */}
      {!notification.isRead && (
        <div className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-[#6B55D9]" />
      )}
    </button>
  );
};

export const NotificationsPage = () => {
  const router = useRouter();
  const { t } = useLanguage();
  const {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleRead = async (id: string, postId: string) => {
    await markAsRead(id);
    router.push(`/community/discussion/${postId}`);
  };

  return (
    <main
      className={`${poppins.variable} flex flex-1 flex-col min-w-0 h-full overflow-y-auto rounded-tl-2xl border border-neutral-200 bg-[#F4F6FA] p-5 shadow-sm md:p-8 lg:p-10 font-poppins`}
    >
      <div className="mx-auto w-full max-w-[640px]">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-[#E2E6EE] shadow-sm hover:bg-gray-50 transition"
            >
              <ArrowLeft className="h-4 w-4 text-[#1F314D]" />
            </button>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-[#6B55D9]" />
              <h1 className="text-xl font-bold text-[#1F314D]">
                Notifications
              </h1>
            </div>
            {unreadCount > 0 && (
              <span className="rounded-full bg-[#6B55D9] px-2.5 py-0.5 text-xs font-bold text-white">
                {unreadCount}
              </span>
            )}
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-[#6B55D9] hover:bg-[#6B55D9]/10 transition"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </button>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center rounded-2xl bg-white p-12 shadow-sm">
            <Loader2 className="h-6 w-6 animate-spin text-[#6B55D9]" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl bg-white p-12 shadow-sm text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F3F0FF] mb-4">
              <BellOff className="h-7 w-7 text-[#6B55D9]/40" />
            </div>
            <p className="text-sm font-semibold text-[#1F314D]">
              No notifications yet
            </p>
            <p className="mt-1 text-xs text-[#647084]">
              You&apos;ll be notified when someone replies to your posts
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {notifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onRead={handleRead}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default NotificationsPage;
