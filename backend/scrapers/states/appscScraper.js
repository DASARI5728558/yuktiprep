import { BaseScraper } from "../baseScraper.js";
import { parseExamDate } from "../../utils/examDateParser.js";

/**
 * APPSC Scraper (Andhra Pradesh Public Service Commission)
 * Scrapes https://portal-psc.ap.gov.in/HomePages/ExaminationCalendar
 * Crawls and records sublinks filtered strictly to 2026 and beyond.
 */
export class AppscScraper extends BaseScraper {
  async scrape() {
    const targetUrl =
      this.source.calendarUrl || "https://portal-psc.ap.gov.in/HomePages/ExaminationCalendar";
    console.log(`[AppscScraper] Fetching Examination Calendar from: ${targetUrl}`);

    const { html, finalUrl } = await this.fetchHtml(targetUrl);
    const $ = this.loadCheerio(html);

    const results = [];
    const seen = new Set();

    $("a").each((i, el) => {
      const href = $(el).attr("href");
      let text = $(el).text().replace(/\s+/g, " ").trim();
      if (!href) return;

      const fullHref = href.startsWith("http") ? href : new URL(href, targetUrl).href;
      const combined = (text + " " + fullHref).toLowerCase();

      // Filter: only sublinks based on 2026 onwards
      const isYear2026OrLater =
        combined.includes("2026") ||
        combined.includes("2027") ||
        combined.includes("2028") ||
        parseExamDate(text).is2026OrLater;

      if (!isYear2026OrLater) {
        return;
      }

      // Clean title
      text = text.replace(/\.pdf\b/gi, "").replace(/^\d+[\.\)\-\s]+/, "").trim();
      if (text.length < 5) {
        try {
          const pathname = new URL(fullHref).pathname;
          const filename = pathname.split("/").pop() || "";
          text = decodeURIComponent(filename)
            .replace(/\.pdf$/i, "")
            .replace(/[_-]+/g, " ")
            .trim();
        } catch {
          text = "APPSC Examination Schedule 2026";
        }
      }

      const lowerTitle = text.toLowerCase();
      if (!seen.has(lowerTitle)) {
        seen.add(lowerTitle);

        const parsedDate = parseExamDate(text);

        results.push(
          this.normalizeRecord({
            name: text,
            organization: "APPSC",
            state: "Andhra Pradesh",
            category: "State Government",
            examType: "Notification / Time Table",
            examDate: parsedDate.date,
            examDateText: parsedDate.date
              ? null
              : parsedDate.text && parsedDate.is2026OrLater
              ? parsedDate.text
              : "2026 Session",
            status: "announced",
            officialUrl: fullHref,
            sourceUrl: finalUrl,
            year: parsedDate.year || 2026,
          })
        );
      }
    });

    console.log(`[AppscScraper] Found ${results.length} sublinks for 2026 onwards.`);
    return results;
  }
}
