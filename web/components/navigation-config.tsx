import { Home, Bot, Users, ClipboardList, Briefcase, UserRound, CreditCard, Mic, HelpCircle, Calendar } from "lucide-react";

export const SIDEBAR_ITEMS = [
  {
    id: "dashboard",
    label: "dashboard",
    href: "/",
    icon: Home,
  },
  {
    id: "exams",
    label: "examCalendar",
    href: "/exams",
    icon: Calendar,
  },
  {
    id: "questions",
    label: "questionBank",
    href: "/questions",
    icon: HelpCircle,
  },
  {
    id: "ai-tutor",
    label: "aiTutor",
    href: "/ai-tutor",
    icon: Bot,
  },
  {
    id: "community",
    label: "community",
    href: "/community",
    icon: Users,
  },
  {
    id: "tests",
    label: "tests",
    href: "/tests",
    icon: ClipboardList,
  },
  {
    id: "mock-interview",
    label: "mockInterview",
    href: "/mock-interview",
    icon: Mic,
  },
  {
    id: "govt-jobs",
    label: "govtJobs",
    href: "/govtjobs",
    icon: Briefcase,
  },
  {
    id: "profile",
    label: "profile",
    href: "/profile",
    icon: UserRound,
  },
] as const;

export const BOTTOM_NAV_ITEMS = [
{
    id: "dashboard",
    label: "dashboard",
    href: "/",
    icon: Home,
  },
  {
    id: "ai-tutor",
    label: "aiTutor",
    href: "/ai-tutor",
    icon: Bot,
  },
  {
    id: "community",
    label: "community",
    href: "/community",
    icon: Users,
  },
  {
    id: "tests",
    label: "tests",
    href: "/tests",
    icon: ClipboardList,
  },
  {
    id: "mock-interview",
    label: "mockInterview",
    href: "/mock-interview",
    icon: Mic,
  },
  {
    id: "govt-jobs",
    label: "govtJobs",
    href: "/govtjobs",
    icon: Briefcase,
  },
  {
    id: "profile",
    label: "profile",
    href: "/profile",
    icon: UserRound,
  },
] as const;
