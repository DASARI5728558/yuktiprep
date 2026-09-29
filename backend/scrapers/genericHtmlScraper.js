import { BaseScraper } from "./baseScraper.js";
import { parseExamDate } from "../utils/examDateParser.js";
import { PdfRapidOcrScraper } from "./pdf/pdfRapidOcrScraper.js";

/**
 * Universal HTML Calendar & Document Crawler
 * 1. Checks table rows and announcement lists directly on the page.
 * 2. Detects if sublinks point to PDF files (e.g. APPSC examination schedule PDFs).
 * 3. Automatically uses RapidOCR on any found PDF sublinks.
 */
export class GenericHtmlScraper extends BaseScraper {
  async scrape() {
    const targetUrl = this.source.calendarUrl || this.source.url;
    const { html, finalUrl } = await this.fetchHtml(targetUrl);
    const $ = this.loadCheerio(html);

    const results = [];
    const seen = new Set();
    const pdfSublinks = [];

    // Collect all PDF links and sublinks from anchors
    $("a").each((i, el) => {
      const href = $(el).attr("href");
      const text = $(el).text().replace(/\s+/g, " ").trim();
      if (!href) return;

      const fullHref = href.startsWith("http") ? href : new URL(href, targetUrl).href;
      if (
        fullHref.toLowerCase().includes(".pdf") &&
        (text.toLowerCase().includes("calendar") ||
          text.toLowerCase().includes("schedule") ||
          text.toLowerCase().includes("examination") ||
          text.toLowerCase().includes("time table") ||
          text.toLowerCase().includes("web note") ||
          text.toLowerCase().includes("notification"))
      ) {
        pdfSublinks.push({
          url: fullHref,
          nameHint: text,
        });
      }
    });

    // 1. Check all table rows across the page
    $("table tr").each((index, el) => {
      const rowText = $(el).text().replace(/\s+/g, " ").trim();
      const parsedDate = parseExamDate(rowText);

      if (parsedDate.is2026OrLater) {
        const tds = $(el).find("td, th");
        let name = "";

        if (tds.length >= 2) {
          for (let i = 0; i < tds.length; i++) {
            const text = $(tds[i]).text().trim();
            if (text.length > 5 && !parseExamDate(text).date) {
              name = text;
              break;
            }
          }
        }

        if (!name) {
          name = rowText.replace(/\b(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})\b/g, "").trim();
        }

        name = name.replace(/^\d+[\.\)\-\s]+/, "").trim();

        if (name.length >= 4 && !seen.has(name.toLowerCase())) {
          seen.add(name.toLowerCase());
          const link = $(el).find("a").attr("href");
          const officialUrl = link
            ? (link.startsWith("http") ? link : new URL(link, targetUrl).href)
            : this.source.url;

          results.push(
            this.normalizeRecord({
              name,
              organization: this.source.organization,
              state: this.source.state,
              category: this.source.category,
              examDate: parsedDate.date,
              examDateText: parsedDate.date ? null : (parsedDate.text || "2026"),
              status: "upcoming",
              officialUrl,
              sourceUrl: finalUrl,
              year: parsedDate.year || 2026,
            })
          );
        }
      }
    });

    // 2. If sublinks point to PDF files, create records directly using their title and link (without deep OCR parsing)
    if (pdfSublinks.length > 0) {
      console.log(`[GenericHtmlScraper] Found ${pdfSublinks.length} PDF sublinks. Recording titles with direct PDF links...`);
      for (const item of pdfSublinks) {
        let title = item.nameHint || "";
        // Clean title
        title = title.replace(/\.pdf\b/gi, "").replace(/^\d+[\.\)\-\s]+/, "").trim();

        // Extract filename fallback if title is too generic or short
        if (title.length < 5) {
          try {
            const pathname = new URL(item.url).pathname;
            const filename = pathname.split("/").pop() || "";
            title = decodeURIComponent(filename).replace(/\.pdf$/i, "").replace(/[_-]+/g, " ").trim();
          } catch {
            title = "Examination Notification";
          }
        }

        const parsedDate = parseExamDate(item.nameHint + " " + item.url);
        const lowerTitle = title.toLowerCase();
        const combined = (item.nameHint + " " + item.url).toLowerCase();
        const is2026OrLater =
          parsedDate.is2026OrLater ||
          combined.includes("2026") ||
          combined.includes("2027") ||
          combined.includes("2028");

        if (!is2026OrLater) {
          continue;
        }

        if (title.length >= 5 && !seen.has(lowerTitle)) {
          seen.add(lowerTitle);
          results.push(
            this.normalizeRecord({
              name: title,
              organization: this.source.organization,
              state: this.source.state,
              category: this.source.category,
              examType: "Notification / Schedule",
              examDate: parsedDate.is2026OrLater ? parsedDate.date : null,
              examDateText: parsedDate.is2026OrLater ? (parsedDate.date ? null : parsedDate.text) : (parsedDate.text || "2026"),
              status: "announced",
              officialUrl: item.url,
              sourceUrl: item.url,
              year: parsedDate.year || 2026,
            })
          );
        }
      }
    }

    // 3. Check notice list items if still empty
    if (results.length === 0) {
      $("li, article, .notice, .announcement").each((index, el) => {
        const text = $(el).text().replace(/\s+/g, " ").trim();
        const parsedDate = parseExamDate(text);

        if (parsedDate.is2026OrLater && text.length > 10) {
          const name = text.substring(0, 150).replace(/^\d+[\.\)\-\s]+/, "").trim();
          if (!seen.has(name.toLowerCase())) {
            seen.add(name.toLowerCase());
            const link = $(el).find("a").attr("href");
            const officialUrl = link
              ? (link.startsWith("http") ? link : new URL(link, targetUrl).href)
              : this.source.url;

            results.push(
              this.normalizeRecord({
                name,
                organization: this.source.organization,
                state: this.source.state,
                category: this.source.category,
                examDate: parsedDate.date,
                examDateText: parsedDate.date ? null : parsedDate.text,
                status: "upcoming",
                officialUrl,
                sourceUrl: finalUrl,
                year: parsedDate.year || 2026,
              })
            );
          }
        }
      });
    }

    return results;
  }
}
