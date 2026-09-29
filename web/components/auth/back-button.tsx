"use client";

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BackButtonProps {
  onClick?: () => void;
  className?: string;
}

export default function BackButton({ onClick, className }: BackButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-gray-100 ${className || ""}`}
      aria-label="Back"
    >
      <ArrowLeft className="h-5 w-5 text-gray-700" />
    </button>
  );
}
