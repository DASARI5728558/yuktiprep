import express from "express";
import multer from "multer";
import { authMiddleware as adminAuth } from "../../src/middleware/auth.middleware.js";
import {
  registerSourceFile,
  registerSourceUrl,
  getIngestionSources,
  getIngestionSourceById,
  reprocessSource,
  deleteIngestionSource,
  getQuestionDrafts,
  getQuestionDraftById,
  updateQuestionDraft,
  publishDraft,
  aiCorrectMarkdown,
  saveMarkdownToDraftsHandler,
  approveAndPublishAllSourceDrafts,
  toggleSourcePublishedStatus,
} from "../../controllers/questionIntelligence.controller.js";

const router = express.Router();

router.use(adminAuth);

// File upload configuration for PDF/DOCX (memory buffer)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // up to 50MB
});

// Source Ingestion Endpoints (Direct file or remote URL)
router.post("/sources/register-file", upload.single("file"), registerSourceFile);
router.post("/sources/register-url", registerSourceUrl);
router.get("/sources", getIngestionSources);
router.get("/sources/:id", getIngestionSourceById);
router.post("/sources/:id/reprocess", reprocessSource);
router.delete("/sources/:id", deleteIngestionSource);
router.post("/sources/:sourceId/approve-all", approveAndPublishAllSourceDrafts);
router.patch("/sources/:sourceId/toggle-live", toggleSourcePublishedStatus);

// AI Markdown Correction & Synchronization Endpoints
router.post("/markdown/ai-correct", aiCorrectMarkdown);
router.post("/markdown/save-drafts", saveMarkdownToDraftsHandler);

// Question Drafts & Review Endpoints
router.get("/drafts", getQuestionDrafts);
router.get("/drafts/:id", getQuestionDraftById);
router.patch("/drafts/:id", updateQuestionDraft);
router.post("/drafts/:id/publish", publishDraft);

export default router;
