import express from "express";
import { authMiddleware } from "../../src/middleware/auth.middleware.js";
import { requireRole } from "../../src/middleware/role.middleware.js";
import prisma from "../../config/prisma.js";
import { reloadCronJobs } from "../../src/cron.js";

const router = express.Router();

router.use(authMiddleware);
router.use(requireRole("SUPER_ADMIN", "ADMIN"));

// GET all settings
router.get("/", async (req, res) => {
  try {
    const settings = await prisma.systemSetting.findMany();
    const settingsMap = {};
    settings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });
    res.json({ status: "success", data: settingsMap });
  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).json({ status: "error", detail: String(error) });
  }
});

// PUT update a specific setting
router.put("/", async (req, res) => {
  try {
    const { key, value } = req.body;
    if (!key || typeof value !== "string") {
      return res.status(400).json({ status: "error", detail: "Key and value are required." });
    }

    const updatedSetting = await prisma.systemSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });

    // If a CRON setting was updated, we reload the jobs
    if (key.endsWith("_CRON")) {
      await reloadCronJobs();
    }

    res.json({ status: "success", data: updatedSetting });
  } catch (error) {
    console.error("Error updating setting:", error);
    res.status(500).json({ status: "error", detail: String(error) });
  }
});

export default router;
