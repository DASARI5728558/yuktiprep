import { Worker } from "bullmq";
import { queueConnection } from "../queues/queue.config.js";
import { TRANSLATION_QUEUE_NAME } from "../queues/translation.queue.js";
import { translationService } from "../translations/translation.service.js";
import prisma from "../../config/prisma.js";

/**
 * Worker to process asynchronous translation jobs.
 */
export const translationWorker = new Worker(
  TRANSLATION_QUEUE_NAME,
  async (job) => {
    const { itemId, targetLanguage } = job.data;
    
    if (!itemId || !targetLanguage) {
      throw new Error("Missing itemId or targetLanguage in job payload");
    }

    // 1. Fetch Item from PostgreSQL
    const item = await prisma.item.findUnique({
      where: { id: itemId }
    });

    if (!item) {
      throw new Error(`Item not found for ID: ${itemId}`);
    }

    // 2. Check translation status idempotently
    let translationRecord = await prisma.itemTranslation.findUnique({
      where: {
        itemId_language: {
          itemId,
          language: targetLanguage
        }
      }
    });

    if (translationRecord && translationRecord.status === "COMPLETED") {
      // Already completed, stop successfully.
      return { status: "already_completed" };
    }

    // 3. Mark as PROCESSING if not already
    translationRecord = await prisma.itemTranslation.upsert({
      where: {
        itemId_language: {
          itemId,
          language: targetLanguage
        }
      },
      update: {
        status: "PROCESSING",
        attempts: { increment: 1 }
      },
      create: {
        itemId,
        language: targetLanguage,
        status: "PROCESSING",
        attempts: 1
      }
    });

    // 4. Translate title and summary
    try {
      const translatedTitle = await translationService.translateText(item.title, "en", targetLanguage);
      const translatedSummary = await translationService.translateText(item.summary, "en", targetLanguage);

      // 5. Save translated content and mark as COMPLETED
      await prisma.itemTranslation.update({
        where: { id: translationRecord.id },
        update: {
          title: translatedTitle,
          summary: translatedSummary,
          status: "COMPLETED",
          provider: "auto" // Could specify exactly which provider succeeded if tracked
        }
      });

      return { status: "completed" };

    } catch (error) {
      // Update record to store the error, but don't mark as FAILED until max attempts are reached
      // BullMQ tracks attempts; if job fails, it retries. If it exhausts retries, it throws finally.
      await prisma.itemTranslation.update({
        where: { id: translationRecord.id },
        update: {
          error: error.message || "Unknown error"
        }
      });
      throw error; // Let BullMQ handle retry mechanism
    }
  },
  {
    connection: queueConnection,
    concurrency: 2, // Limit concurrency to avoid 429
  }
);

translationWorker.on("completed", (job) => {
  console.log(`Translation job ${job.id} completed successfully`);
});

translationWorker.on("failed", async (job, err) => {
  console.error(`Translation job ${job.id} failed with error: ${err.message}`);
  
  // If the job has reached its final attempt, mark the translation as FAILED in the DB
  if (job.attemptsMade >= job.opts.attempts) {
    try {
      const { itemId, targetLanguage } = job.data;
      await prisma.itemTranslation.update({
        where: {
          itemId_language: {
            itemId,
            language: targetLanguage
          }
        },
        update: {
          status: "FAILED"
        }
      });

      // Optionally, push to DeadLetter queue here if compatible with existing project
      await prisma.deadLetter.create({
        data: {
          sourceKey: itemId, // Or whatever maps to sourceKey
          stage: "translation_worker",
          reason: err.message,
          payload: JSON.stringify(job.data)
        }
      });
    } catch (updateErr) {
      console.error(`Failed to update ItemTranslation to FAILED status:`, updateErr);
    }
  }
});
