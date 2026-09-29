import express from "express";
import { adminAuth } from "../../middleware/adminAuth.js";
import {
  getAdminExamStats,
  getAdminCompetitiveExams,
  updateAdminCompetitiveExam,
  deleteAdminCompetitiveExam,
  getAdminExamSources,
  updateAdminExamSource,
  toggleAdminExamSource,
  triggerSourceScrape,
  triggerAllScrapers,
  getAdminScrapeLogs,
  getAdminChangeLogs,
} from "../../controllers/admin/adminCompetitiveExam.controller.js";

const router = express.Router();

router.use(adminAuth);

router.get("/stats", getAdminExamStats);
router.get("/exams", getAdminCompetitiveExams);
router.put("/exams/:id", updateAdminCompetitiveExam);
router.delete("/exams/:id", deleteAdminCompetitiveExam);

router.get("/sources", getAdminExamSources);
router.put("/sources/:id", updateAdminExamSource);
router.patch("/sources/:id/toggle", toggleAdminExamSource);
router.post("/sources/:id/scrape", triggerSourceScrape);
router.post("/scrape-all", triggerAllScrapers);

router.get("/scrape-logs", getAdminScrapeLogs);
router.get("/change-logs", getAdminChangeLogs);

export default router;
