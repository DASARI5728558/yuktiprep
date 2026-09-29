import prisma from "../config/prisma.js";
import { AppscScraper } from "../scrapers/states/appscScraper.js";

async function testAppscScraper() {
  try {
    // 1. Update source in DB if exists
    const src = await prisma.examSource.findFirst({
      where: { organization: "APPSC" },
    });

    if (src) {
      await prisma.examSource.update({
        where: { id: src.id },
        data: {
          calendarUrl: "https://portal-psc.ap.gov.in/HomePages/ExaminationCalendar",
          scraperAdapter: "appsc",
        },
      });
      console.log("Updated APPSC source record in DB with calendarUrl.");
    }

    const scraper = new AppscScraper({
      organization: "APPSC",
      state: "Andhra Pradesh",
      category: "State Government",
      url: "https://psc.ap.gov.in",
      calendarUrl: "https://portal-psc.ap.gov.in/HomePages/ExaminationCalendar",
    });

    const records = await scraper.scrape();
    console.log("Scraped records count:", records.length);
    console.log("Scraped records:", JSON.stringify(records, null, 2));
  } catch (err) {
    console.error("Test error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

testAppscScraper();
