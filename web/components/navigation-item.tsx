"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-poppins",
});

export interface NavigationItemProps {
  href: string;
  icon: LucideIcon;
  label: string;
  isActive: boolean;
  variant: "sidebar" | "bottom";
  showLabel?: boolean;
  onClick?: () => void;
}

export const NavigationItem = ({
  href,
  icon: Icon,
  label,
  isActive,
  variant,
  showLabel = true,
  onClick,
}: NavigationItemProps) => {
  const activeColor = "#087E8B";
  const inactiveIconColor = "#102B59";

  const iconBaseClass = cn("shrink-0", "filled-icon");

  if (variant === "sidebar") {
    return (
      <a
        href={href}
        onClick={onClick}
        className={cn(
          poppins.className,
          "flex items-center gap-3 rounded-[20px] transition-all duration-200",
          showLabel
            ? "w-full justify-start"
            : "mx-auto h-10 w-10 justify-center p-0",
          isActive 
            ? "bg-[#E9F7F7] text-[#087E8B] shadow-sm" 
            : "text-[#263A59] hover:bg-gray-100/60"
        )}
        aria-current={isActive ? "page" : undefined}
      >
        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center">
          <div className="relative flex items-center justify-center">
            <Icon
              className={cn(iconBaseClass, "h-5 w-5")}
              color={isActive ? activeColor : inactiveIconColor}
            />
          </div>
        </div>
        {showLabel ? (
          <span
            className={cn(
              "text-sm whitespace-nowrap ",
              isActive ? "font-semibold" : "font-medium"
            )}
          >
            {label}
          </span>
        ) : null}
      </a>
    );
  }

  return (
    <a
      href={href}
      onClick={onClick}
      className={cn(
        poppins.className,
        "flex flex-col items-center justify-center gap-1.5 pt-5 pb-2 transition-all duration-200",
        isActive ? "text-[#087E8B]" : "text-[#263A59]"
      )}
      aria-current={isActive ? "page" : undefined}
    >
      <div className="relative flex h-10 w-10 items-center justify-center">
        {isActive ? (
          <div className="absolute left-1/2 top-0 h-[55px] w-[55px] -translate-x-1/2 -translate-y-3 rounded-full bg-gradient-to-br from-[rgba(190,235,239,0.75)] to-[rgba(220,245,247,0.45)]">
            <div className="absolute inset-2 rounded-full bg-[#B8E0E5]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Icon
                className={cn(iconBaseClass, "h-6 w-6")}
                color={activeColor}
              />
            </div>
          </div>
        ) : (
          <Icon
            className={cn(iconBaseClass, "h-6 w-6")}
            color={inactiveIconColor}
          />
        )}
      </div>
      <span
        className={cn(
          "text-[15px] leading-none line-clamp-1 text-center",
          isActive ? "font-semibold" : "font-medium"
        )}
      >
        {label}
      </span>
    </a>
  );
};
