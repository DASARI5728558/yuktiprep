import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { parseExamDate } from "../../utils/examDateParser.js";

dotenv.config();

/**
 * AI-powered Exam Information Extractor using Google Gemini.
 * Takes raw OCR or raw document text and extracts clean, normalized, verified
 * competitive exam schedules for 2026 onwards.
 */
export class ExamAiExtractor {
  constructor() {
    dotenv.config();
    const key = process.env.GEMINI_API_KEY || process.env.API_KEY;
    this.ai = key ? new GoogleGenAI({ apiKey: key }) : null;
    this.modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  }

  get isAvailable() {
    if (!this.ai) {
      dotenv.config();
      const key = process.env.GEMINI_API_KEY || process.env.API_KEY;
      if (key) {
        this.ai = new GoogleGenAI({ apiKey: key });
      }
    }
    return !!this.ai;
  }

  /**
   * Analyzes raw OCR text from a PDF document using Gemini AI.
   * Extracts clean, structured exam names, actual dates, and statuses.
   *
   * @param {string} rawText - OCR or extracted text from PDF
   * @param {object} context - Source metadata { organization, state, category }
   * @returns {Promise<Array<object>|null>} Array of extracted exam objects or null if unavailable
   */
  async extractExamsFromOcr(rawText, context = {}) {
    if (!this.ai || !rawText || rawText.trim().length < 50) {
      return null;
    }

    try {
      // Chunk text if extraordinarily large, or take up to 25,000 characters
      const truncatedText = rawText.length > 30000 ? rawText.slice(0, 30000) : rawText;

      const prompt = `
You are an expert Indian Government Competitive Examination Data Analyst.
Analyze the following raw OCR text extracted from an official examination calendar, timetable, or notification document.
Your task is to accurately extract all scheduled competitive exams or departmental recruitment tests for year 2026 or later.

Organization Context: ${context.organization || "Government Exam Agency"}
State: ${context.state || "All India"}
Category: ${context.category || "Competitive Exam"}

CRITICAL RULES:
1. ONLY return exams that have dates/schedules in year 2026 or later (e.g., 2026, 2027...). Skip older dates.
2. Clean exam names:
   - Extract the real exam name (e.g. "Subordinate Accounts Service Examination, Paper-I", "Technical Assistant (Geo-Physics)").
   - Strip out noise like paper codes ("08-", "149."), "(WITH BOOKS)", "(WITHOUT BOOKS)", timings ("10.00 AM to 12.00 Noon"), or signature names.
3. Dates:
   - "examDate": Return in "YYYY-MM-DD" format if exact day, month, year are provided (e.g. "2026-07-06"). If only month/year or tentative period is known, set examDate to null.
   - "examDateText": Provide clean text like "06/07/2026" or "July 2026".
   - "notificationDate", "applicationStart", "applicationEnd": "YYYY-MM-DD" or null.
4. Do NOT hallucinate or invent exams. If no exams meet the 2026+ criteria, return an empty array.
5. Return JSON format strictly matching this schema:
{
  "exams": [
    {
      "name": "Full Clean Exam Name",
      "examDate": "YYYY-MM-DD or null",
      "examDateText": "e.g. 06/07/2026 or July 2026",
      "notificationDate": "YYYY-MM-DD or null",
      "applicationStart": "YYYY-MM-DD or null",
      "applicationEnd": "YYYY-MM-DD or null",
      "examType": "Competitive or Departmental",
      "status": "upcoming"
    }
  ]
}

RAW OCR TEXT:
${truncatedText}
`;

      console.log(`[ExamAiExtractor] Analyzing OCR text with Gemini (${this.modelName})...`);

      const response = await this.ai.models.generateContent({
        model: this.modelName,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.1,
        },
      });

      const rawJson = response.text?.trim();
      if (!rawJson) return null;

      const parsed = JSON.parse(rawJson);
      const examsList = Array.isArray(parsed?.exams) ? parsed.exams : [];

      const validExams = [];
      const seen = new Set();

      for (const item of examsList) {
        if (!item.name || typeof item.name !== "string" || item.name.trim().length < 4) {
          continue;
        }

        const cleanName = item.name.replace(/^\d+[\.\)\-\s]+/, "").trim();
        const lowerName = cleanName.toLowerCase();
        if (seen.has(lowerName)) continue;
        seen.add(lowerName);

        // Verify date meets 2026+ rule
        let finalExamDate = null;
        let finalExamDateText = item.examDateText || null;
        let is2026 = false;

        if (item.examDate && /^\d{4}-\d{2}-\d{2}$/.test(item.examDate)) {
          const year = parseInt(item.examDate.slice(0, 4), 10);
          if (year >= 2026) {
            finalExamDate = new Date(`${item.examDate}T00:00:00.000Z`);
            is2026 = true;
          }
        }

        if (!finalExamDate && finalExamDateText) {
          const parsed = parseExamDate(finalExamDateText);
          if (parsed.is2026OrLater) {
            finalExamDate = parsed.date;
            finalExamDateText = parsed.text || finalExamDateText;
            is2026 = true;
          }
        }

        if (is2026) {
          validExams.push({
            name: cleanName,
            examDate: finalExamDate,
            examDateText: finalExamDate ? null : finalExamDateText,
            notificationDate: item.notificationDate ? new Date(`${item.notificationDate}T00:00:00.000Z`) : null,
            applicationStart: item.applicationStart ? new Date(`${item.applicationStart}T00:00:00.000Z`) : null,
            applicationEnd: item.applicationEnd ? new Date(`${item.applicationEnd}T00:00:00.000Z`) : null,
            examType: item.examType || "Competitive",
            status: finalExamDate && finalExamDate > new Date() ? "upcoming" : "announced",
          });
        }
      }

      console.log(`[ExamAiExtractor] Gemini successfully extracted and verified ${validExams.length} clean exams from PDF.`);
      return validExams;
    } catch (err) {
      console.warn("[ExamAiExtractor] Gemini extraction encountered an error, falling back to deterministic parser:", err.message);
      return null;
    }
  }
}
