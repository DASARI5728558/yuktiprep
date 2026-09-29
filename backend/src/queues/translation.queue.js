import { Queue } from "bullmq";
import { queueConnection } from "./queue.config.js";

export const TRANSLATION_QUEUE_NAME = "translation-queue";

export const translationQueue = new Queue(TRANSLATION_QUEUE_NAME, {
  connection: queueConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
    removeOnComplete: true,
    removeOnFail: false, // keep failed jobs for inspection
  },
});

/**
 * Enqueue a translation job
 * @param {string} itemId 
 * @param {string} targetLanguage 
 */
export async function enqueueTranslationJob(itemId, targetLanguage) {
  // Use a predictable jobId to avoid duplicate jobs if enqueued multiple times
  const cleanItemId = itemId.replace(/:/g, "_");
  const jobId = `translation_${cleanItemId}_${targetLanguage}`;
  
  await translationQueue.add(
    "translate-item",
    { itemId, targetLanguage },
    { jobId }
  );
}
