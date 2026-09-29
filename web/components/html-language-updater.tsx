"use client";

import { useEffect } from "react";
import { useLanguage } from "@/lib/language-context";

export function HtmlLanguageUpdater() {
  const { language, isLoading } = useLanguage();

  useEffect(() => {
    if (typeof window === "undefined" || isLoading) return;
    const code = language?.code || "en";
    document.documentElement.lang = code;
  }, [language, isLoading]);

  return null;
}
