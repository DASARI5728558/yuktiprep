import express from "express";
import {
  getPublishedQuestions,
  getPublishedQuestionById,
} from "../controllers/publishedQuestion.controller.js";

const router = express.Router();

router.get("/", getPublishedQuestions);
router.get("/:id", getPublishedQuestionById);

export default router;
