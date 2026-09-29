import axios from "axios";
import https from "https";
import * as cheerio from "cheerio";
import { generateSourceExamId } from "../utils/sourceIdGenerator.js";
import { parseExamDate } from "../utils/examDateParser.js";

// Dedicated HTTPS agent for Indian government servers with incomplete intermediate SSL certificates
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

export class BaseScraper {
  constructor(sourceConfig) {
    this.source = sourceConfig;
    this.timeout = 25000;
    this.userAgent =
      process.env.SCRAPER_USER_AGENT ||
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 (Educational/YuktiPrepBot)";
  }

  /**
   * Helper to fetch page HTML with polite headers, strict timeouts, and SSL tolerance
   */
  async fetchHtml(url) {
    const targetUrl = url || this.source.calendarUrl || this.source.url;
    const response = await axios.get(targetUrl, {
      timeout: this.timeout,
      httpsAgent,
      headers: {
        "User-Agent": this.userAgent,
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        Connection: "keep-alive",
      },
    });
    return {
      html: response.data,
      finalUrl: response.request?.res?.responseUrl || targetUrl,
    };
  }

  /**
   * Loads Cheerio instance
   */
  loadCheerio(html) {
    return cheerio.load(html);
  }

  /**
   * Normalizes a standardized exam object
   */
  normalizeRecord({
    name,
    organization = this.source.organization,
    state = this.source.state,
    category = this.source.category,
    examType = "Competitive",
    notificationDate = null,
    applicationStart = null,
    applicationEnd = null,
    examDate = null,
    examDateText = "",
    admitCardDate = null,
    resultDate = null,
    status = "upcoming",
    officialUrl = this.source.url,
    sourceUrl = this.source.calendarUrl || this.source.url,
    year = 2026,
  }) {
    const sourceExamId = generateSourceExamId(organization, name, year);

    return {
      name: name.trim(),
      organization: organization.trim(),
      state: state.trim(),
      category: category.trim(),
      examType: examType?.trim() || null,
      notificationDate,
      applicationStart,
      applicationEnd,
      examDate,
      examDateText: examDateText?.trim() || null,
      admitCardDate,
      resultDate,
      status: status.toLowerCase(),
      officialUrl: officialUrl.trim(),
      sourceUrl: sourceUrl.trim(),
      sourceExamId,
      lastScrapedAt: new Date(),
    };
  }

  /**
   * Must be implemented by child scrapers
   * @returns {Promise<Array<NormalizedExam>>}
   */
  async scrape() {
    throw new Error(`Scrape method not implemented for ${this.source.organization}`);
  }
}
