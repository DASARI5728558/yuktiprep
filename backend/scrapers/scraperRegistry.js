import { UpscScraper } from "./national/upscScraper.js";
import { SscScraper } from "./national/sscScraper.js";
import { TnpscScraper } from "./states/tnpscScraper.js";
import { AppscScraper } from "./states/appscScraper.js";
import { PdfRapidOcrScraper } from "./pdf/pdfRapidOcrScraper.js";
import { GenericHtmlScraper } from "./genericHtmlScraper.js";

/**
 * Registry of official scraper adapters.
 */
export const SCRAPER_REGISTRY = {
  upsc: UpscScraper,
  ssc: SscScraper,
  tnpsc: TnpscScraper,
  appsc: AppscScraper,
  pdf_rapidocr: PdfRapidOcrScraper,
  generic_html: GenericHtmlScraper,
};

/**
 * Dynamic resolution:
 * 1. If target URL ends with .pdf or scraperType === 'pdf', use RapidOCR.
 * 2. If a dedicated adapter exists in SCRAPER_REGISTRY, use it.
 * 3. Otherwise, use GenericHtmlScraper.
 */
export function getScraperForSource(source) {
  const targetUrl = (source.calendarUrl || source.url || "").toLowerCase();

  // Automatic PDF detection -> use RapidOCR
  if (source.scraperType === "pdf" || targetUrl.endsWith(".pdf") || targetUrl.includes(".pdf?")) {
    return new PdfRapidOcrScraper(source);
  }

  // Check specific adapter
  const ScraperClass = SCRAPER_REGISTRY[source.scraperAdapter];
  if (ScraperClass) {
    return new ScraperClass(source);
  }

  // Fallback: Generic HTML parser
  return new GenericHtmlScraper(source);
}
