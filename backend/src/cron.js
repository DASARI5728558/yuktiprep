import cron from "node-cron";
import { syncSources } from "./current-affairs/pipeline.js";
import { broadcastCurrentAffairsToWhatsApp } from "./services/whatsappBroadcast.service.js";
import { sendEmail } from "./services/email.service.js";
import { env } from "./config/env.js";
import prisma from "../config/prisma.js";

// Store running tasks so we can destroy them on reload
let runningTasks = [];

async function getSettingValue(key, defaultValue) {
  try {
    const setting = await prisma.systemSetting.findUnique({ where: { key } });
    return setting ? setting.value : defaultValue;
  } catch (err) {
    console.error(`Failed to get setting ${key}, using default.`);
    return defaultValue;
  }
}

export async function initializeCronJobs() {
  console.log("Initializing cron jobs...");

  // Destroy any existing running tasks before initializing
  for (const task of runningTasks) {
    task.stop();
  }
  runningTasks = [];

  const syncCron = await getSettingValue(
    "SYNC_SOURCES_CRON",
    "0 4 * * *",
  );
  const broadcastCron = await getSettingValue(
    "WHATSAPP_BROADCAST_CRON",
    "0 6 * * *",
  );
  const adminEmail = env.EMAIL_USER;

  // 1. Sync Sources Job
  if (cron.validate(syncCron)) {
    const task = cron.schedule(syncCron, async () => {
      console.log("CRON RUNNING: Sync Sources");
      try {
        const stats = await syncSources();
        console.log("CRON SUCCESS: Sync Sources completed", stats);

        await sendEmail({
          to: adminEmail,
          subject: "✅ YuktiPrep Cron: Sync Sources Completed",
          html: `<p>The scheduled sync sources cron job has completed successfully.</p>
                 <pre>${JSON.stringify(stats, null, 2)}</pre>`,
        });
      } catch (err) {
        console.error("CRON ERROR: Failed to sync sources", err);

        await sendEmail({
          to: adminEmail,
          subject: "❌ YuktiPrep Cron: Sync Sources Failed",
          html: `<p>The scheduled sync sources cron job failed.</p>
                 <pre>${err.message || String(err)}</pre>`,
        });
      }
    });
    runningTasks.push(task);
    console.log(`Cron registered: Sync Sources -> ${syncCron}`);
  } else {
    console.warn(`Invalid cron expression for SYNC_SOURCES_CRON: ${syncCron}`);
  }

  // 2. WhatsApp Broadcast Job
  if (cron.validate(broadcastCron)) {
    const task = cron.schedule(broadcastCron, async () => {
      console.log("CRON RUNNING: WhatsApp Broadcast");
      try {
        const result = await broadcastCurrentAffairsToWhatsApp();
        console.log("CRON SUCCESS: WhatsApp Broadcast completed", result);

        await sendEmail({
          to: adminEmail,
          subject: "✅ YuktiPrep Cron: WhatsApp Broadcast Completed",
          html: `<p>The scheduled WhatsApp broadcast cron job has finished executing.</p>
                 <pre>${JSON.stringify(result, null, 2)}</pre>`,
        });
      } catch (err) {
        console.error("CRON ERROR: Failed to broadcast to WhatsApp", err);

        await sendEmail({
          to: adminEmail,
          subject: "❌ YuktiPrep Cron: WhatsApp Broadcast Failed",
          html: `<p>The scheduled WhatsApp broadcast cron job failed.</p>
                 <pre>${err.message || String(err)}</pre>`,
        });
      }
    });
    runningTasks.push(task);
    console.log(`Cron registered: WhatsApp Broadcast -> ${broadcastCron}`);
  } else {
    console.warn(
      `Invalid cron expression for WHATSAPP_BROADCAST_CRON: ${broadcastCron}`,
    );
  }

  // 3. Competitive Exam Calendar Aggregator (Daily at 06:00 AM)
  const examSyncCron = "0 6 * * *";
  if (cron.validate(examSyncCron)) {
    const task = cron.schedule(examSyncCron, async () => {
      console.log("CRON RUNNING: Competitive Exam Aggregator Sync");
      try {
        const { runAllEnabledScrapers } = await import(
          "../services/competitiveExamScraper.service.js"
        );
        const stats = await runAllEnabledScrapers();
        console.log("CRON SUCCESS: Competitive Exam Sync Completed", stats);
      } catch (err) {
        console.error("CRON ERROR: Competitive Exam Sync Failed", err);
      }
    });
    runningTasks.push(task);
    console.log(`Cron registered: Competitive Exam Aggregator -> ${examSyncCron}`);
  }
}

// Function to call when admin updates settings
export async function reloadCronJobs() {
  console.log("Reloading cron jobs from updated settings...");
  await initializeCronJobs();
}
