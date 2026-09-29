"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

type Language = {
  id: string;
  code: string;
  englishName: string;
  nativeName: string;
};

type LanguageContextType = {
  language: Language | null;
  setLanguage: (language: Language | null) => void;
  translations: Record<string, string>;
  t: (key: string) => string;
  isLoading: boolean;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = "yuktiprep_language";

function getStoredLanguage(): Language | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function getBrowserLanguage(): string {
  if (typeof window === "undefined") return "en";

  const browserLang = navigator.language || navigator.languages?.[0] || "en";
  const langCode = browserLang.split("-")[0].toLowerCase();

  const supportedLanguages = [
    "as", "bn", "gu", "hi", "kn", "ml", "mr", "ne", "or", "pa", "ta", "te", "ur", "en"
  ];

  if (supportedLanguages.includes(langCode)) {
    return langCode;
  }

  return "en";
}

async function loadTranslations(languageCode: string): Promise<Record<string, string>> {
  if (typeof window === "undefined") return {};

  try {
    const en = (await import("../locales/en.json")).default;

    if (languageCode === "en") {
      return en;
    }

    if (languageCode === "hi") {
      const hi = (await import("../locales/hi.json")).default;
      return { ...en, ...hi };
    }
    if (languageCode === "ta") {
      const ta = (await import("../locales/ta.json")).default;
      return { ...en, ...ta };
    }
    if (languageCode === "kn") {
      const kn = (await import("../locales/kn.json")).default;
      return { ...en, ...kn };
    }

    const token = localStorage.getItem("token");
    if (!token) {
      return en;
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/languages/translate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        texts: Object.values(en),
        targetLanguageCode: languageCode,
      }),
    });

    if (!response.ok) {
      return en;
    }

    const data = await response.json();
    const translatedTexts = data?.data?.translatedTexts || [];

    const translatedMap: Record<string, string> = {};
    const enRecord = en as Record<string, string>;
    Object.keys(en).forEach((key, index) => {
      if (translatedTexts[index]) {
        translatedMap[key] = translatedTexts[index];
      } else {
        translatedMap[key] = enRecord[key];
      }
    });

    return translatedMap;
  } catch {
    return {};
  }
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language | null>(null);
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const currentCodeRef = React.useRef<string | null>(null);

  useEffect(() => {
    const initLanguage = async () => {
      const stored = getStoredLanguage();
      const initialCode = stored?.code || getBrowserLanguage();
      currentCodeRef.current = initialCode;

      if (stored) {
        setLanguageState(stored);
      }

      const t = await loadTranslations(initialCode);
      setTranslations(t);
      setIsLoading(false);
    };

    initLanguage();
  }, []);

  const setLanguage = useCallback((newLanguage: Language | null) => {
    const newCode = newLanguage?.code || null;
    if (newCode === currentCodeRef.current) {
      if (newLanguage) {
        setLanguageState(newLanguage);
      }
      return;
    }

    currentCodeRef.current = newCode;
    setLanguageState(newLanguage);

    if (newLanguage) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newLanguage));
      loadTranslations(newLanguage.code).then(setTranslations);
    } else {
      localStorage.removeItem(STORAGE_KEY);
      loadTranslations("en").then(setTranslations);
    }
  }, []);

  const t = useCallback(
    (key: string): string => {
      return translations[key] || key;
    },
    [translations]
  );

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        translations,
        t,
        isLoading,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}