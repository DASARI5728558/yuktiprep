"use client";

import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { IconBrandTabler, IconSettings } from "@tabler/icons-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import {
  Home,
  LogOut,
  BookOpen,
  ListChecks,
  FileText,
  Newspaper,
  Globe,
  CreditCard,
  MessageCircle,
  MessageSquareQuote,
  User,
  Settings,
  Sparkles,
  Calendar
} from "lucide-react";
import Image from "next/image";
import { useAdminLogout, useAdminMe } from "@/hooks/useAdminAuth";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

/* =========================
   Logo Component
========================= */

export const Logo = () => {
  return (
    <Link
      href="/"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
    >
      <Image
        src="/yuktiprep.png"
        height={40}
        width={40}
        alt="YuktiPrep"
        className="h-10 w-[38px] object-contain"
      />

      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="whitespace-pre font-bold text-black dark:text-white"
      >
        YuktiPrep
      </motion.span>
    </Link>
  );
};

/* =========================
   Collapsed Logo
========================= */

export const LogoIcon = () => {
  return (
    <Link
      href="/"
      className="relative z-20 flex w-full items-center justify-center py-1 text-sm font-normal text-black"
    >
      <Image
        src="/yuktiprep.png"
        height={36}
        width={36}
        alt="YuktiPrep"
        className="h-9 w-9 object-contain"
      />
    </Link>
  );
};

/* =========================
   Main Sidebar Component
========================= */

export default function SidebarDemo({
  children,
}: {
  children?: React.ReactNode;
}) {
  // Sidebar state
  const [open, setOpen] = useState(false);

  // API hooks
  const { mutate: logout } = useAdminLogout();
  const { data: admin } = useAdminMe();

  // Next.js hooks
  const router = useRouter();
  const pathname = usePathname();

  /* =========================
     Navigation Links
  ========================= */

  const links = [
    {
      label: "Dashboard",
      href: "/",
      icon: <Home />,
    },
    {
      label: "Question Intelligence",
      href: "/intelligence",
      icon: <Sparkles className="text-amber-500" />,
    },
    {
      label: "Competitive Exams",
      href: "/competitive-exams",
      icon: <Calendar className="text-blue-500" />,
    },
    {
      label: "Exams",
      href: "/exams",
      icon: <BookOpen />,
    },
    {
      label: "Subjects",
      href: "/subjects",
      icon: <ListChecks />,
    },
    {
      label: "Topics",
      href: "/topics",
      icon: <IconBrandTabler />,
    },
    {
      label: "Syllabus",
      href: "/syllabus",
      icon: <FileText />,
    },
    {
      label: "PYQs",
      href: "/pyqs",
      icon: <IconSettings />,
    },
    {
      label: "Mock Tests",
      href: "/tests",
      icon: <Sparkles className="text-purple-500" />,
    },
    {
      label: "Current Affairs",
      href: "/current-affairs",
      icon: <Newspaper />,
    },
    {
      label: "SEO Pages",
      href: "/seo-pages",
      icon: <Globe />,
    },
    {
      label: "Pricing",
      href: "/plans",
      icon: <CreditCard />,
    },
    {
      label: "WhatsApp Bot",
      href: "/whatsapp-bot",
      icon: <MessageCircle />,
    },
    {
      label: "YuktiPrep WA",
      href: "/yuktiprep-wa",
      icon: <MessageSquareQuote className="text-emerald-500" />,
    },
    {
      label: "Settings",
      href: "/settings",
      icon: <Settings />,
    },
    {
      label: "Profile",
      href: "/profile",
      icon: <User />,
    },
    {
      label: "Logout",
      href: "#",
      onClick: () => logout(),
      icon: <LogOut />,
    },
  ];

  /* =========================
     Handle Navigation
  ========================= */

  const handleNavigate = (
    href: string,
    onClick?: () => void
  ) => {
    if (onClick) {
      onClick();
      return;
    }

    if (href && href !== "#") {
      router.push(href);
    }
  };

  return (
    <div
      className={cn(
        "mx-auto flex h-screen w-full flex-col overflow-hidden bg-gray-50 md:flex-row",
      )}
    >
      {/* =========================
           Sidebar
      ========================= */}

      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          {/* Top Section */}

          <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
            {open ? <Logo /> : <LogoIcon />}

            {/* Navigation Links */}

            <div className="mt-8 flex flex-col gap-1.5">
              {links.map((link, idx) => {
                /* =========================
                   Check Active Route
                ========================= */

                const isActive =
                  link.href !== "#" &&
                  (link.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(link.href));

                /* =========================
                   Add Dynamic Icon Color
                ========================= */

                const iconWithColor = React.isValidElement(
                  link.icon
                )
                  ? React.cloneElement(
                      link.icon as React.ReactElement<{
                        className?: string;
                      }>,
                      {
                        className: cn(
                          "h-5 w-5 shrink-0 transition-colors",
                          isActive
                            ? "!text-white"
                            : "text-neutral-700 dark:text-neutral-200"
                        ),
                      }
                    )
                  : link.icon;

                return (
                  <div
                    key={link.label || idx}
                    className="flex w-full justify-center"
                    onClick={() =>
                      handleNavigate(
                        link.href,
                        link.onClick
                      )
                    }
                  >
                    <SidebarLink
                      className={cn(
                        "flex cursor-pointer items-center",
                        "rounded-xl transition-all duration-150",

                        open
                          ? "w-full justify-start gap-3 px-3 py-2.5"
                          : "mx-auto h-10 w-10 justify-center p-0",

                        isActive
                          ? "bg-teal-600 font-medium text-white shadow-sm"
                          : "text-neutral-700 hover:bg-neutral-200/60"
                      )}
                      link={{
                        label: link.label,
                        href: link.href,
                        icon: iconWithColor,
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* =========================
              Admin Section
          ========================= */}

          <div className="flex w-full justify-center">
            <SidebarLink
              className={cn(
                "rounded-xl transition-all duration-150",

                open
                  ? "w-full justify-start gap-3 px-3 py-2"
                  : "mx-auto h-10 w-10 justify-center p-0"
              )}
              link={{
                label: admin?.name || "Admin User",
                href: "/profile",
                icon: admin?.profilePic ? (
                  <img
                    src={admin.profilePic}
                    alt={admin.name}
                    className="h-7 w-7 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-800">
                    {admin?.name?.charAt(0).toUpperCase() || "A"}
                  </div>
                ),
              }}
            />
          </div>
        </SidebarBody>
      </Sidebar>

      {/* =========================
          Main Content
      ========================= */}

      <main className="flex flex-1 flex-col min-w-0 h-full overflow-y-auto rounded-tl-2xl border border-neutral-200 bg-white p-4 shadow-sm md:p-10">
        {children || (
          <div className="text-gray-500">
            Welcome to Admin Dashboard
          </div>
        )}
      </main>
    </div>
  );
}