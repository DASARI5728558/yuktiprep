import express from "express";
import {
  getPublicCompetitiveExams,
  getUpcomingCompetitiveExams,
  getCompetitiveExamById,
} from "../controllers/competitiveExam.controller.js";

const router = express.Router();

router.get("/upcoming", getUpcomingCompetitiveExams);
router.get("/:id", getCompetitiveExamById);
router.get("/", getPublicCompetitiveExams);

export default router;
