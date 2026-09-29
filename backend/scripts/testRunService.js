import prisma from "../config/prisma.js";
import { runScraperForSource } from "../services/competitiveExamScraper.service.js";

async function testAllActive() {
  const sources = await prisma.examSource.findMany({ where: { enabled: true } });
  console.log(`Found ${sources.length} enabled sources.`);

  for (const src of sources) {
    if (src.organization === "APPSC") {
      console.log(`Testing scraper for ${src.organization}...`);
      const res = await runScraperForSource(src);
      console.log(`${src.organization} result:`, res);
    }
  }

  await prisma.$disconnect();
}

testAllActive();
