import prisma from "../config/prisma.js";
import { getScraperForSource } from "../scrapers/scraperRegistry.js";

/**
 * Executes a single scraper for a given ExamSource,
 * handles upsertion, detects field changes, records logs, and updates source metrics.
 */
export async function runScraperForSource(source) {
  const startedAt = new Date();
  let logRecord = await prisma.scrapeLog.create({
    data: {
      sourceId: source.id,
      organization: source.organization,
      sourceUrl: source.calendarUrl || source.url,
      startedAt,
      status: "RUNNING",
    },
  });

  const scraper = getScraperForSource(source);
  if (!scraper) {
    const errorMsg = `No scraper adapter found for adapter key: "${source.scraperAdapter}"`;
    const completedAt = new Date();
    await prisma.scrapeLog.update({
      where: { id: logRecord.id },
      data: {
        completedAt,
        durationMs: completedAt - startedAt,
        status: "FAILED",
        errorMessage: errorMsg,
      },
    });
    await prisma.examSource.update({
      where: { id: source.id },
      data: {
        lastRunAt: completedAt,
        lastFailureAt: completedAt,
        lastErrorMessage: errorMsg,
      },
    });
    return { success: false, error: errorMsg, recordsFound: 0, inserted: 0, updated: 0 };
  }

  let recordsFound = 0;
  let inserted = 0;
  let updated = 0;

  try {
    const scrapedRecords = await scraper.scrape();
    recordsFound = scrapedRecords.length;

    for (const record of scrapedRecords) {
      // Find existing record by unique sourceExamId
      const existing = await prisma.competitiveExam.findUnique({
        where: { sourceExamId: record.sourceExamId },
      });

      if (!existing) {
        // Create new record
        await prisma.competitiveExam.create({
          data: {
            ...record,
            sourceId: source.id,
          },
        });
        inserted++;
      } else {
        // Check for date and status changes
        const fieldsToCheck = [
          "examDate",
          "examDateText",
          "applicationStart",
          "applicationEnd",
          "status",
          "officialUrl",
        ];

        for (const field of fieldsToCheck) {
          const oldVal = existing[field] instanceof Date ? existing[field].toISOString() : String(existing[field] || "");
          const newVal = record[field] instanceof Date ? record[field].toISOString() : String(record[field] || "");

          if (oldVal !== newVal && newVal !== "") {
            await prisma.examChangeLog.create({
              data: {
                examId: existing.id,
                organization: existing.organization,
                examName: existing.name,
                fieldName: field,
                oldValue: oldVal || "None",
                newValue: newVal,
                changeSource: `scraper:${source.scraperAdapter}`,
              },
            });
          }
        }

        // Update record
        await prisma.competitiveExam.update({
          where: { id: existing.id },
          data: {
            ...record,
            sourceId: source.id,
          },
        });
        updated++;
      }
    }

    const completedAt = new Date();
    await prisma.scrapeLog.update({
      where: { id: logRecord.id },
      data: {
        completedAt,
        durationMs: completedAt - startedAt,
        status: "SUCCESS",
        recordsFound,
        recordsInserted: inserted,
        recordsUpdated: updated,
      },
    });

    await prisma.examSource.update({
      where: { id: source.id },
      data: {
        lastRunAt: completedAt,
        lastSuccessAt: completedAt,
        lastErrorMessage: null,
      },
    });

    return {
      success: true,
      recordsFound,
      inserted,
      updated,
    };
  } catch (err) {
    const completedAt = new Date();
    const errorMsg = err.message || String(err);

    await prisma.scrapeLog.update({
      where: { id: logRecord.id },
      data: {
        completedAt,
        durationMs: completedAt - startedAt,
        status: "FAILED",
        recordsFound,
        recordsInserted: inserted,
        recordsUpdated: updated,
        errorMessage: errorMsg,
      },
    });

    await prisma.examSource.update({
      where: { id: source.id },
      data: {
        lastRunAt: completedAt,
        lastFailureAt: completedAt,
        lastErrorMessage: errorMsg,
      },
    });

    return {
      success: false,
      error: errorMsg,
      recordsFound,
      inserted,
      updated,
    };
  }
}

/**
 * Runs all enabled sources sequentially with polite delays.
 * Isolates individual scraper errors so one failure never halts others.
 */
export async function runAllEnabledScrapers() {
  console.log("=== Starting Scheduled Competitive Exam Aggregator Sync ===");
  const enabledSources = await prisma.examSource.findMany({
    where: { enabled: true },
  });

  console.log(`Found ${enabledSources.length} enabled sources to process.`);
  const summary = {
    total: enabledSources.length,
    successful: 0,
    failed: 0,
    totalRecordsFound: 0,
    totalInserted: 0,
    totalUpdated: 0,
    details: [],
  };

  for (const src of enabledSources) {
    console.log(`[Scraper] Processing ${src.organization} (${src.scraperAdapter})...`);
    try {
      const res = await runScraperForSource(src);
      if (res.success) {
        summary.successful++;
        summary.totalRecordsFound += res.recordsFound;
        summary.totalInserted += res.inserted;
        summary.totalUpdated += res.updated;
      } else {
        summary.failed++;
      }
      summary.details.push({ organization: src.organization, ...res });
    } catch (err) {
      summary.failed++;
      summary.details.push({
        organization: src.organization,
        success: false,
        error: err.message,
      });
    }

    // Polite delay between sources to respect government servers
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }

  console.log("=== Competitive Exam Aggregator Sync Completed ===", summary);
  return summary;
}
