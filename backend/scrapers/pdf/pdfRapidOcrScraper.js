import axios from "axios";
import https from "https";
import { execFile } from "child_process";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { BaseScraper } from "../baseScraper.js";
import { parseExamDate } from "../../utils/examDateParser.js";
import { ExamAiExtractor } from "./examAiExtractor.js";

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

const aiExtractor = new ExamAiExtractor();

/**
 * Universal PDF Scraper utilizing RapidOCR + AI Intelligence
 * Downloads official PDF files (tables, calendars, notifications), extracts
 * high-accuracy text via extract_pdf_rapidocr.py, and analyzes it with Gemini AI
 * with robust deterministic fallback.
 */
export class PdfRapidOcrScraper extends BaseScraper {
  /**
   * Helper to run RapidOCR via the existing Python worker
   */
  async runRapidOcr(pdfBuffer) {
    const tempDir = path.resolve(process.cwd(), "uploads", "temp");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const tempFile = path.join(
      tempDir,
      `exam_cal_${Date.now()}_${crypto.randomBytes(4).toString("hex")}.pdf`
    );
    fs.writeFileSync(tempFile, pdfBuffer);

    const scriptPath = path.resolve(process.cwd(), "scripts", "extract_pdf_rapidocr.py");

    return new Promise((resolve, reject) => {
      execFile(
        "python",
        [scriptPath, tempFile],
        { maxBuffer: 50 * 1024 * 1024, env: process.env },
        (error, stdout, stderr) => {
          try {
            if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
          } catch (e) {
            console.warn("[PdfRapidOcr] Error cleaning temp file:", e.message);
          }

          if (error) {
            console.error("[PdfRapidOcr] Python OCR execution error:", error, stderr);
            return reject(error);
          }

          try {
            const trimmed = stdout.trim();
            const jsonStart = trimmed.lastIndexOf('{"success":');
            if (jsonStart === -1) {
              return reject(new Error("No valid JSON payload returned from RapidOCR script"));
            }
            const parsed = JSON.parse(trimmed.slice(jsonStart));
            resolve(parsed.text || parsed.extractedText || parsed.markdown || "");
          } catch (jsonErr) {
            reject(jsonErr);
          }
        }
      );
    });
  }

  async scrape() {
    const targetUrl = this.source.calendarUrl || this.source.url;
    console.log(`[PdfRapidOcr] Downloading and analyzing official PDF from: ${targetUrl}`);

    const response = await axios.get(targetUrl, {
      responseType: "arraybuffer",
      timeout: 45000,
      httpsAgent,
      headers: {
        "User-Agent": this.userAgent,
        Accept: "application/pdf,*/*",
      },
    });

    const ocrContent = await this.runRapidOcr(Buffer.from(response.data));

    // 1. AI Analysis: If AI is available, use Gemini to extract and structure verified details
    if (aiExtractor.isAvailable) {
      console.log(`[PdfRapidOcr] Sending OCR text to AI for intelligent exam extraction...`);
      const aiResults = await aiExtractor.extractExamsFromOcr(ocrContent, {
        organization: this.source.organization,
        state: this.source.state,
        category: this.source.category,
      });

      if (aiResults && aiResults.length > 0) {
        console.log(`[PdfRapidOcr] AI successfully extracted ${aiResults.length} structured exams!`);
        return aiResults.map((exam) =>
          this.normalizeRecord({
            name: exam.name,
            organization: this.source.organization,
            state: this.source.state,
            category: this.source.category,
            examType: exam.examType || "Competitive",
            notificationDate: exam.notificationDate,
            applicationStart: exam.applicationStart,
            applicationEnd: exam.applicationEnd,
            examDate: exam.examDate,
            examDateText: exam.examDateText,
            status: exam.status || "upcoming",
            officialUrl: this.source.url,
            sourceUrl: targetUrl,
            year: exam.examDate ? exam.examDate.getFullYear() : 2026,
          })
        );
      }
      console.log(`[PdfRapidOcr] AI returned empty or fell back, proceeding with deterministic parser.`);
    }

    // 2. Deterministic Fallback Parser
    const lines = ocrContent.split("\n").map((l) => l.trim()).filter(Boolean);

    const results = [];
    const seenNames = new Set();

    let currentDate = null;
    let currentDateText = null;
    let currentYear = 2026;

    // Helper to check if a line is just noise / header / signature / time
    const isJunkLine = (t) => {
      const lower = t.toLowerCase();
      return (
        lower.startsWith("--- page") ||
        lower.includes("papercode") ||
        lower.includes("name of the paper") ||
        lower.includes("date of examination") ||
        lower.includes("hall tickets") ||
        lower.includes("sd/-") ||
        lower.includes("secretary") ||
        lower.includes("place: vijayawada") ||
        lower.includes("andhra pradesh public service commission") ||
        lower.includes("written examinations (off-line mode") ||
        lower.includes("schedule of written examinations") ||
        lower.includes("to be conducted in two spells") ||
        lower.includes("the detailed time table is as") ||
        /^(fore noon|after noon|fn|an|\(\s*\d{1,2}\.\d{2}\s*(am|pm)\s*to\s*\d{1,2}\.\d{2}\s*(am|pm)\s*\))/i.test(t) ||
        /^(si\.\s*no|paper\s*[\-–]\s*[ivx0-9]+)$/i.test(t) ||
        t.replace(/[-_–—=+*#|]/g, "").trim().length < 4
      );
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const parsedDate = parseExamDate(line);

      // Check if line establishes a 2026+ date context (like "06/07/2026 (FORE NOON) ...")
      if (parsedDate.is2026OrLater) {
        currentDate = parsedDate.date;
        currentDateText = parsedDate.date ? null : parsedDate.text;
        currentYear = parsedDate.year || 2026;

        // Check if there is an exam name on the same line
        let lineExamName = line
          .replace(/\b(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})\b/g, "")
          .replace(/\b(202[6-9]|20[3-9]\d)\b/g, "")
          .replace(/[|•–—:;\t]+/g, " ")
          .trim();

        lineExamName = lineExamName.replace(/^\d+[\.\)\-\s]+/, "").trim();

        if (lineExamName.length >= 6 && !isJunkLine(lineExamName) && !seenNames.has(lineExamName.toLowerCase())) {
          seenNames.add(lineExamName.toLowerCase());
          results.push(
            this.normalizeRecord({
              name: lineExamName,
              organization: this.source.organization,
              state: this.source.state,
              category: this.source.category,
              examDate: currentDate,
              examDateText: currentDateText,
              status: currentDate && currentDate > new Date() ? "upcoming" : "announced",
              officialUrl: this.source.url,
              sourceUrl: targetUrl,
              year: currentYear,
            })
          );
        }
        continue;
      }

      // If we currently have a 2026+ active date context and see exam test lines (e.g. "08- The Accounts Test...")
      if (currentDate || currentDateText) {
        if (!isJunkLine(line)) {
          // Clean item numbers: "1. Subordinate Accounts..." -> "Subordinate Accounts..."
          let examName = line.replace(/^\d+[\.\)\-\s]+/, "").trim();
          examName = examName.replace(/\(with\s*books\)|\(without\s*books\)/gi, "").trim();

          if (
            examName.length >= 6 &&
            !isJunkLine(examName) &&
            !seenNames.has(examName.toLowerCase())
          ) {
            seenNames.add(examName.toLowerCase());
            results.push(
              this.normalizeRecord({
                name: examName,
                organization: this.source.organization,
                state: this.source.state,
                category: this.source.category,
                examDate: currentDate,
                examDateText: currentDateText,
                status: currentDate && currentDate > new Date() ? "upcoming" : "announced",
                officialUrl: this.source.url,
                sourceUrl: targetUrl,
                year: currentYear,
              })
            );
          }
        }
      }
    }

    console.log(`[PdfRapidOcr] Successfully extracted ${results.length} exams from PDF for ${this.source.organization}`);
    return results;
  }
}
