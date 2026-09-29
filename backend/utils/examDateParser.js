/**
 * Deterministic Competitive Exam Date Parser
 *
 * Rules:
 * 1. Only parse real dates, NEVER invent dates or fill missing day as "01".
 * 2. If month and year only (e.g. "June 2026"), store `examDate: null` and `examDateText: "June 2026"`.
 * 3. Enforce 2026+ rule: Only exams active from 2026 onwards are accepted.
 */

const MONTH_MAP = {
  january: "01",
  jan: "01",
  february: "02",
  feb: "02",
  march: "03",
  mar: "03",
  april: "04",
  apr: "04",
  may: "05",
  june: "06",
  jun: "06",
  july: "07",
  jul: "07",
  august: "08",
  aug: "08",
  september: "09",
  sep: "09",
  sept: "09",
  october: "10",
  oct: "10",
  november: "11",
  nov: "11",
  december: "12",
  dec: "12",
};

/**
 * Normalizes an Indian government date string.
 * Returns: { date: Date | null, text: string, year: number | null, is2026OrLater: boolean }
 */
export function parseExamDate(rawDateStr) {
  if (!rawDateStr || typeof rawDateStr !== "string") {
    return { date: null, text: "", year: null, is2026OrLater: false };
  }

  const clean = rawDateStr.trim().replace(/\s+/g, " ");
  if (!clean) {
    return { date: null, text: "", year: null, is2026OrLater: false };
  }

  // Check for day-month-year numeric formats: DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY
  const dmyMatch = clean.match(/\b(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})\b/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10);
    const year = parseInt(dmyMatch[3], 10);

    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      const isoDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
      return {
        date: isoDate,
        text: clean,
        year,
        is2026OrLater: year >= 2026,
      };
    }
  }

  // Check for format: 15 June 2026, 15th June 2026, 15-June-2026
  const wordMatch = clean.match(/\b(\d{1,2})(?:st|nd|rd|th)?[\s\-\.]*([A-Za-z]+)[\s\-\.]*,?[\s]*(\d{4})\b/i);
  if (wordMatch) {
    const day = parseInt(wordMatch[1], 10);
    const monthWord = wordMatch[2].toLowerCase();
    const year = parseInt(wordMatch[3], 10);

    if (MONTH_MAP[monthWord] && day >= 1 && day <= 31) {
      const month = parseInt(MONTH_MAP[monthWord], 10);
      const isoDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
      return {
        date: isoDate,
        text: clean,
        year,
        is2026OrLater: year >= 2026,
      };
    }
  }

  // Check for format: June 15, 2026 or June 15 2026
  const monthFirstMatch = clean.match(/\b([A-Za-z]+)[\s]+(\d{1,2})(?:st|nd|rd|th)?,?[\s]+(\d{4})\b/i);
  if (monthFirstMatch) {
    const monthWord = monthFirstMatch[1].toLowerCase();
    const day = parseInt(monthFirstMatch[2], 10);
    const year = parseInt(monthFirstMatch[3], 10);

    if (MONTH_MAP[monthWord] && day >= 1 && day <= 31) {
      const month = parseInt(MONTH_MAP[monthWord], 10);
      const isoDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
      return {
        date: isoDate,
        text: clean,
        year,
        is2026OrLater: year >= 2026,
      };
    }
  }

  // Check for Month + Year only (e.g. "June 2026", "Oct-Nov 2026")
  // Do NOT invent a day!
  const monthYearMatch = clean.match(/\b([A-Za-z]+)[\s\-\/]*(\d{4})\b/i);
  if (monthYearMatch) {
    const monthWord = monthYearMatch[1].toLowerCase();
    const year = parseInt(monthYearMatch[2], 10);

    if (MONTH_MAP[monthWord]) {
      return {
        date: null,
        text: clean,
        year,
        is2026OrLater: year >= 2026,
      };
    }
  }

  // Check if general year 2026+ is present (e.g. "Tentative 2026")
  const yearMatch = clean.match(/\b(202[6-9]|20[3-9]\d)\b/);
  if (yearMatch) {
    const year = parseInt(yearMatch[1], 10);
    return {
      date: null,
      text: clean,
      year,
      is2026OrLater: true,
    };
  }

  // Any other past year
  const pastYearMatch = clean.match(/\b(19\d{2}|20[0-1]\d|202[0-5])\b/);
  const year = pastYearMatch ? parseInt(pastYearMatch[1], 10) : null;

  return {
    date: null,
    text: clean,
    year,
    is2026OrLater: false,
  };
}
