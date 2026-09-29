"use client";
import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import {
  IconArrowLeft,
  IconBrandTabler,
  IconSettings,
  IconUserBolt,
} from "@tabler/icons-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { useNotifications } from "@/lib/notification-context";
import { Bell } from "lucide-react";
import { Dashboard } from "./dashboard";
import { NavigationItem } from "./navigation-item";
import { SIDEBAR_ITEMS } from "./navigation-config";
import { BOTTOM_NAV_ITEMS } from "./navigation-config";
import { div } from "motion/react-client";

const MobileBottomNav = () => {
  const pathname = usePathname();
  const { t } = useLanguage();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#E8EDF2] bg-[#F4F6FA] shadow-[0_-4px_20px_rgba(0,0,0,0.04)] md:hidden">
      <div className="grid grid-cols-7 items-start">
        {BOTTOM_NAV_ITEMS.map((link) => {
          const isActive =
            link.href === "/"
              ? pathname === "/"
              : pathname.startsWith(link.href);
          const Icon = link.icon;
          return (
            <NavigationItem
              key={link.label}
              href={link.href}
              icon={Icon}
              label={t(link.label)}
              isActive={isActive}
              variant="bottom"
            />
          );
        })}
      </div>
    </nav>
  );
};

export default function SidebarDemo({
  children,
}: {
  children?: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { unreadCount } = useNotifications();
  const [open, setOpen] = useState(false);

  return (
    <div
      className={cn(
        "mx-auto flex h-screen w-full flex-col overflow-hidden bg-[#F4F6FA] md:flex-row",
      )}
    >
      <div className="hidden md:block">
        <Sidebar open={open} setOpen={setOpen}>
          <SidebarBody className="justify-between gap-10">
            <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto thin-scrollbar">
              {open ? <Logo /> : <LogoIcon />}
              <div className="mt-8 flex flex-col gap-1.5">
                {SIDEBAR_ITEMS.map((link) => {
                  const isActive =
                    link.href === "/"
                      ? pathname === "/"
                      : pathname.startsWith(link.href);

                  return (
                    <NavigationItem
                      key={link.id}
                      href={link.href}
                      icon={link.icon}
                      label={t(link.label)}
                      isActive={isActive}
                      variant="sidebar"
                      showLabel={open}
                    />
                  );
                })}
              </div>
            </div>
            <div className="flex w-full justify-center">
              <SidebarLink
                className={cn(
                  "rounded-xl transition-all duration-150",

                  open
                    ? "w-full justify-start gap-3 px-3 py-2"
                    : "mx-auto h-10 w-10 justify-center p-0"
                )}
                link={{
                  label: user?.name || "User Profile",
                  email: user?.email || "user@example.com",
                  href: "/profile",
                  icon: (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-100 font-bold text-teal-800">
                      {user?.profilePic ? (
                        <img
                          src={user.profilePic}
                          alt={user.name}
                          className="h-full w-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-xl font-bold text-[#6B55D9]">{user?.name?.[0]}</span>
                      )}

                    </div>

                  ),
                }}
              />
            </div>
          </SidebarBody>
        </Sidebar>
      </div>
      <div className="flex flex-1 flex-col overflow-hidden pb-24 md:pb-0 thin-scrollbar">
        {/* Top notification bell bar */}
        <div className="flex items-center justify-end px-4 pt-3 pb-0 md:px-6 mb-2">
          <button
            type="button"
            onClick={() => router.push("/community/notifications")}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-[#E2E6EE] shadow-sm hover:bg-gray-50 transition"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5 text-[#1F314D]" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#6B55D9] px-1 text-[10px] font-bold text-white shadow-sm">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>
        </div>
        {children || <Dashboard />}
      </div>
      <MobileBottomNav />
    </div>
  );
}

export const Logo = () => {
  return (
    <a
      href="#"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
    >
      <Image
        src="/yuktiprep.png"
        height={32}
        width={30}
        alt="yuktiprep"
        className="h-8 w-[30px] object-contain shrink-0"
      />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-xl font-bold whitespace-pre text-black dark:text-white"
      >
        <span className="text-[#122851]">Yukti</span>
        <span className="relative text-[#00A6C0]">
          Prep
          <span className="absolute -top-0 -right-3 text-[10px] font-semibold text-[#122851]">TM</span>
        </span>
      </motion.span>
    </a>
  );
};

export const LogoIcon = () => {
  return (
    <a
      href="#"
      className="relative z-20 flex w-full items-center justify-center py-1 text-sm font-normal text-black"
    >
      <Image
        src="/yuktiprep.png"
        height={28}
        width={28}
        alt="yuktiprep"
        className="h-7 w-7 object-contain"
      />
    </a>
  );
};