"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { cn } from "@/lib/utils";
import {
  CircleDot,
  BookOpen,
  TrendingUp,
  BarChart3,
  BadgeCheck,
  Gem,
  SlidersHorizontal,
  Bell,
  Globe,
  Headphones,
  CircleHelp,
  Settings,
  LogOut,
  ChevronRight,
  Camera,
  UserRound,
} from "lucide-react";
import { toast as sonnerToast } from "sonner";
import { toast as hotToast } from "react-hot-toast";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

interface MenuItem {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  iconBackground: string;
  iconColor: string;
  titleColor?: string;
  action: "navigate" | "logout" | "placeholder";
  href?: string;
}

interface ProfileSectionProps {
  title: string;
  titleIcon: React.ElementType;
  accentColor: string;
  items: MenuItem[];
}

const MENU_SECTIONS: ProfileSectionProps[] = [
  {
    title: "myExam",
    titleIcon: CircleDot,
    accentColor: "#6B55D9",
    items: [
      {
        id: "my-exam",
        title: "myExam",
        description: "upscCivilServices",
        icon: BookOpen,
        iconBackground: "#F3F0FF",
        iconColor: "#6B55D9",
        action: "placeholder",
        href: "#",
      },
    ],
  },
  {
    title: "myProgress",
    titleIcon: TrendingUp,
    accentColor: "#0F7F8C",
    items: [
      {
        id: "my-progress",
        title: "myProgress",
        description: "checkPerformance",
        icon: BarChart3,
        iconBackground: "#E6F6F7",
        iconColor: "#0F7F8C",
        action: "placeholder",
        href: "#",
      },
    ],
  },
  {
    title: "accountPlan",
    titleIcon: BadgeCheck,
    accentColor: "#D97706",
    items: [
      {
        id: "subscription",
        title: "subscription",
        description: "managePlan",
        icon: Gem,
        iconBackground: "#FFF7ED",
        iconColor: "#D97706",
        action: "navigate",
        href: "/plans",
      },
    ],
  },
  {
    title: "preferences",
    titleIcon: SlidersHorizontal,
    accentColor: "#1F314D",
    items: [
      {
        id: "notifications",
        title: "notifications",
        description: "manageNotifications",
        icon: Bell,
        iconBackground: "#F1F0F7",
        iconColor: "#4B5563",
        action: "navigate",
        href: "/community/notifications",
      },
      {
        id: "language",
        title: "language",
        description: "changeAppLanguage",
        icon: Globe,
        iconBackground: "#F1F0F7",
        iconColor: "#4B5563",
        action: "navigate",
        href: "/profile/language",
      },
    ],
  },
  {
    title: "support",
    titleIcon: Headphones,
    accentColor: "#6B55D9",
    items: [
      {
        id: "help-support",
        title: "helpSupport",
        description: "getHelp",
        icon: CircleHelp,
        iconBackground: "#F3F0FF",
        iconColor: "#6B55D9",
        action: "navigate",
        href: "/support",
      },
    ],
  },
  {
    title: "general",
    titleIcon: Settings,
    accentColor: "#4B5563",
    items: [
      {
        id: "settings",
        title: "settings",
        description: "appSettings",
        icon: Settings,
        iconBackground: "#F3F4F6",
        iconColor: "#4B5563",
        action: "navigate",
        href: "/profile/edit",
      },
      {
        id: "logout",
        title: "logout",
        description: "signOut",
        icon: LogOut,
        iconBackground: "#FEF2F2",
        iconColor: "#DC2626",
        titleColor: "#DC2626",
        action: "logout",
      },
    ],
  },
];

const ProfileSection = ({ title, titleIcon: TitleIcon, accentColor, items }: ProfileSectionProps) => {
  const { t } = useLanguage();
  return (
    <section className="mt-6">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-2 w-2 items-center justify-center rounded-full" style={{ background: accentColor }} />
        <h3 className="text-sm font-semibold uppercase tracking-wide" style={{ color: accentColor }}>
          {t(title)}
        </h3>
        <TitleIcon className="h-4 w-4" style={{ color: accentColor }} />
      </div>
      <div className="rounded-[20px] border border-[#E2E6EE] bg-white shadow-sm overflow-hidden">
        {items.map((item, index) => (
          <ProfileMenuItem key={item.id} item={item} isLast={index === items.length - 1} />
        ))}
      </div>
    </section>
  );
};

const ProfileMenuItem = ({ item, isLast }: { item: MenuItem; isLast: boolean }) => {
  const router = useRouter();
  const { logout } = useAuth();
  const { t } = useLanguage();
  const [isPressed, setIsPressed] = useState(false);

  const handleClick = () => {
    if (item.action === "logout") {
      logout();
      router.push("/login");
      return;
    }
    if (item.href && item.href !== "#") {
      router.push(item.href);
    } else {
      const msg = "We will integrate this feature soon!";
      sonnerToast.info(msg);
      hotToast(msg, { icon: "⚡" });
    }
  };

  const Icon = item.icon;

  return (
    <button
      type="button"
      onClick={handleClick}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      className={cn(
        "flex w-full items-center gap-4 px-5 py-4 text-left transition",
        !isLast && "border-b border-[#E2E6EE]",
        isPressed ? "bg-gray-50" : "bg-white hover:bg-gray-50"
      )}
    >
      <div
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[16px]"
        style={{ background: item.iconBackground }}
      >
        <Icon className="h-6 w-6" style={{ color: item.iconColor }} />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-base font-semibold truncate" style={{ color: item.titleColor || "#1F314D" }}>
          {t(item.title)}
        </h4>
        <p className="mt-0.5 text-sm text-[#647084] truncate">{t(item.description)}</p>
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 text-[#9CA3AF]" />
    </button>
  );
};

export const ProfilePage = () => {
  const { user, refreshUser } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const name = user?.name || "Ravishankar K S";
  const email = user?.email || "avswarm04@gmail.com";
  const initial = name.charAt(0).toUpperCase();

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    const handleFocus = () => {
      refreshUser();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [refreshUser]);

  return (
    <main
      className={`${poppins.variable} flex flex-1 flex-col min-w-0 h-full overflow-y-auto rounded-tl-2xl border border-neutral-200 bg-[#F4F6FA] p-5 shadow-sm md:p-8 lg:p-10 font-poppins`}
    >
      <div className="mx-auto w-full max-w-[600px]">
        <section className="mt-2">
          <div
            className="flex items-center gap-4 rounded-[24px] border border-[#E2E6EE] bg-white p-5 shadow-sm cursor-pointer transition hover:shadow-md"
            onClick={() => router.push("/profile/edit")}
          >
            <div className="relative">
              <div
                className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full bg-[#F3F0FF]"
              >
                {user?.profilePic ? (
                  <img
                    src={user.profilePic}
                    alt={name}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-xl font-bold text-[#6B55D9]">{initial}</span>
                )}
              </div>
              <button
                type="button"
                className="absolute -right-1 -bottom-1 flex h-7 w-7 items-center justify-center rounded-full bg-[#6B55D9] text-white shadow-sm"
                aria-label="Edit profile picture"
              >
                <Camera className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-[#1F314D] truncate">{name}</h2>
              <p className="mt-0.5 text-sm text-[#647084] truncate">{email}</p>
              {(() => {
                const plan = user?.subscriptions?.[0]?.plan;
                console.log(user)
                const planName = plan?.name || "Free Member";
                const isPremium = plan?.theme === "premium";
                const isStandard = plan?.theme === "standard";
                
                const badgeClasses = isPremium
                  ? "bg-sky-100 text-sky-700"
                  : isStandard
                    ? "bg-teal-100 text-teal-700"
                    : plan 
                      ? "bg-[#F3F0FF] text-[#6B55D9]" // Other paid plans
                      : "bg-gray-100 text-gray-600"; // Free member
                
                return (
                  <span className={`mt-2 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${badgeClasses}`}>
                    <UserRound className="h-3.5 w-3.5" />
                    {planName}
                  </span>
                );
              })()}
            </div>
            <ChevronRight className="h-5 w-5 shrink-0 text-[#9CA3AF]" />
          </div>
        </section>

        {MENU_SECTIONS.map((section) => (
          <ProfileSection key={section.title} {...section} />
        ))}

        <div className="h-6" />
      </div>
    </main>
  );
};

export default ProfilePage;