import prisma from "../config/prisma.js";
import { EXAM_SOURCES } from "../config/examSources.config.js";

export async function seedExamSources() {
  console.log(`Seeding ${EXAM_SOURCES.length} official exam sources...`);
  let created = 0;
  let updated = 0;

  for (const src of EXAM_SOURCES) {
    const existing = await prisma.examSource.findUnique({
      where: {
        organization_scraperAdapter: {
          organization: src.organization,
          scraperAdapter: src.scraperAdapter,
        },
      },
    });

    if (existing) {
      await prisma.examSource.update({
        where: { id: existing.id },
        data: {
          state: src.state,
          category: src.category,
          url: src.url,
          calendarUrl: src.calendarUrl,
          scraperType: src.scraperType,
          enabled: src.enabled,
        },
      });
      updated++;
    } else {
      await prisma.examSource.create({
        data: {
          organization: src.organization,
          state: src.state,
          category: src.category,
          url: src.url,
          calendarUrl: src.calendarUrl,
          scraperType: src.scraperType,
          scraperAdapter: src.scraperAdapter,
          enabled: src.enabled,
        },
      });
      created++;
    }
  }

  console.log(`Seeding complete. Created: ${created}, Updated: ${updated}`);
}

// Run directly if called from CLI
if (process.argv[1]?.includes("seedExamSources.js")) {
  seedExamSources()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
