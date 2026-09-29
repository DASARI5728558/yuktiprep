import express from "express";
import {
  getTests,
  getTestDetails,
  generateTestWithAI,
  triggerSeed,
  submitTestAttempt,
  getAttempts,
  getAttemptDetails,
  deleteTest,
} from "../controllers/test.controller.js";

const router = express.Router();

// Mock tests list & single test retrieval
router.get("/", getTests);
router.get("/attempts", getAttempts);
router.get("/attempts/:id", getAttemptDetails);
router.get("/:id", getTestDetails);

// Test submission
router.post("/:id/submit", submitTestAttempt);

// Admin & AI generation
router.post("/generate-ai", generateTestWithAI);
router.post("/seed", triggerSeed);
router.delete("/:id", deleteTest);

export default router;
