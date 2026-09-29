"use client";

import React, { createContext, useContext, useState, useMemo, useCallback } from "react";

export interface Test {
  id: string;
  title: string;
  duration: string;
  questions: string;
  users: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  exam: string;
  type: "mock" | "previous-year";
}

export interface Attempt {
  id: string;
  title: string;
  exam: string;
  score: string;
  correct: string;
  status: string;
  badge: string;
  date: string;
}

interface TestsContextValue {
  tests: Test[];
  attempts: Attempt[];
  filters: {
    exam: string;
    difficulty: string;
    category: "all" | "mock" | "previous-year";
  };
  setExamFilter: (exam: string) => void;
  setDifficultyFilter: (difficulty: string) => void;
  setCategoryFilter: (category: "all" | "mock" | "previous-year") => void;
  addAttempt: (attempt: Omit<Attempt, "id">) => void;
}

const TestsContext = createContext<TestsContextValue | undefined>(undefined);

const sampleTests: Test[] = [
  {
    id: "upsc-csat-full-length-1",
    title: "UPSC Prelims CSAT - Full Length 1",
    duration: "120 mins",
    questions: "80 Qs",
    users: "12.4k users",
    difficulty: "HARD",
    exam: "UPSC Civil Services",
    type: "mock",
  },
  {
    id: "ssc-cgl-english",
    title: "SSC CGL Tier 1 - English Language",
    duration: "15 mins",
    questions: "25 Qs",
    users: "45.1k users",
    difficulty: "MEDIUM",
    exam: "SSC (CGL, CHSL, MTS)",
    type: "mock",
  },
  {
    id: "ibps-po-quant",
    title: "IBPS PO Prelims - Quantitative Aptitude",
    duration: "20 mins",
    questions: "35 Qs",
    users: "32k users",
    difficulty: "HARD",
    exam: "Banking (IBPS, SBI PO/Clerk)",
    type: "mock",
  },
  {
    id: "rrb-general-awareness",
    title: "RRB NTPC CBT 1 - General Awareness",
    duration: "15 mins",
    questions: "40 Qs",
    users: "56k users",
    difficulty: "EASY",
    exam: "Railways (RRB NTPC, Group D)",
    type: "mock",
  },
  {
    id: "upsc-history",
    title: "UPSC GS Paper 1 - Sectional (History)",
    duration: "60 mins",
    questions: "50 Qs",
    users: "8.2k users",
    difficulty: "MEDIUM",
    exam: "UPSC Civil Services",
    type: "previous-year",
  },
  {
    id: "nda-general-ability",
    title: "NDA General Ability Test - Mock 1",
    duration: "150 mins",
    questions: "150 Qs",
    users: "15k users",
    difficulty: "MEDIUM",
    exam: "Defence (NDA, CDS, AFCAT)",
    type: "mock",
  },
  {
    id: "upsc-prelims-2023",
    title: "UPSC Prelims Paper 1 (2023)",
    duration: "120 mins",
    questions: "100 Qs",
    users: "150k users",
    difficulty: "HARD",
    exam: "UPSC Civil Services",
    type: "previous-year",
  },
  {
    id: "ssc-cgl-2022",
    title: "SSC CGL Tier 1 (2022)",
    duration: "60 mins",
    questions: "100 Qs",
    users: "260k users",
    difficulty: "MEDIUM",
    exam: "SSC (CGL, CHSL, MTS)",
    type: "previous-year",
  },
  {
    id: "ssc-cgl-2021",
    title: "SSC CGL Tier 1 (2021)",
    duration: "60 mins",
    questions: "100 Qs",
    users: "280k users",
    difficulty: "EASY",
    exam: "SSC (CGL, CHSL, MTS)",
    type: "previous-year",
  },
  {
    id: "ibps-po-2023",
    title: "IBPS PO Prelims (2023)",
    duration: "60 mins",
    questions: "50 Qs",
    users: "140k users",
    difficulty: "MEDIUM",
    exam: "Banking (IBPS, SBI PO/Clerk)",
    type: "previous-year",
  },
];

const sampleAttempts: Attempt[] = [
];

export const TestsProvider = ({ children }: { children: React.ReactNode }) => {
  const [testsState, setTestsState] = useState<Test[]>(sampleTests);
  const [attempts, setAttempts] = useState<Attempt[]>(sampleAttempts);
  const [filters, setFilters] = useState({
    exam: "All Exams",
    difficulty: "All Difficulties",
    category: "all" as "all" | "mock" | "previous-year",
  });

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";

  React.useEffect(() => {
    // Fetch tests from backend
    fetch(`${backendUrl}/api/v1/tests`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setTestsState(data.data);
        }
      })
      .catch((err) => {
        console.warn("Backend tests API offline, using local sampleTests", err);
      });

    // Fetch attempts from backend
    fetch(`${backendUrl}/api/v1/tests/attempts`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setAttempts(data.data);
        }
      })
      .catch((err) => {
        console.warn("Backend attempts API offline, using local sampleAttempts", err);
      });
  }, [backendUrl]);

  const setExamFilter = useCallback((exam: string) => {
    setFilters((prev) => ({ ...prev, exam }));
  }, []);

  const setDifficultyFilter = useCallback((difficulty: string) => {
    setFilters((prev) => ({ ...prev, difficulty }));
  }, []);

  const setCategoryFilter = useCallback((category: "all" | "mock" | "previous-year") => {
    setFilters((prev) => ({ ...prev, category }));
  }, []);

  const addAttempt = useCallback((attempt: Omit<Attempt, "id">) => {
    const newAttempt: Attempt = {
      ...attempt,
      id: `attempt-${Date.now()}`,
    };
    setAttempts((prev) => [newAttempt, ...prev]);
  }, []);

  const value = useMemo(
    () => ({
      tests: testsState,
      attempts,
      filters,
      setExamFilter,
      setDifficultyFilter,
      setCategoryFilter,
      addAttempt,
    }),
    [testsState, attempts, filters, setExamFilter, setDifficultyFilter, setCategoryFilter, addAttempt]
  );

  return <TestsContext.Provider value={value}>{children}</TestsContext.Provider>;
};

export const useTests = () => {
  const context = useContext(TestsContext);
  if (!context) {
    throw new Error("useTests must be used within a TestsProvider");
  }
  return context;
};
