import express from "express";
import { successResponse, errorResponse } from "../src/utils/response.js";
import * as publicService from "../services/public.service.js";

const router = express.Router();

router.get("/exams", async (req, res, next) => {
  try {
    const exams = await publicService.getPublicExams();
    successResponse(res, "Exams fetched successfully", exams);
  } catch (error) {
    next(error);
  }
});

router.get("/target-exams", async (req, res, next) => {
  try {
    const exams = await publicService.getPublicTargetExams();
    successResponse(res, "Target exams fetched successfully", exams);
  } catch (error) {
    next(error);
  }
});

router.get("/exams/:slug", async (req, res, next) => {
  try {
    const { slug } = req.params;
    const exam = await publicService.getPublicExamBySlug(slug);
    if (!exam) {
      return errorResponse(res, "Exam not found", [], 404);
    }
    successResponse(res, "Exam fetched successfully", exam);
  } catch (error) {
    next(error);
  }
});

router.get("/exams/:examSlug/subjects", async (req, res, next) => {
  try {
    const { examSlug } = req.params;
    const subjects = await publicService.getPublicSubjects(examSlug);
    successResponse(res, "Subjects fetched successfully", subjects);
  } catch (error) {
    next(error);
  }
});

router.get("/exams/:examSlug/subjects/:subjectSlug", async (req, res, next) => {
  try {
    const { examSlug, subjectSlug } = req.params;
    const subject = await publicService.getPublicSubject(examSlug, subjectSlug);
    if (!subject) {
      return errorResponse(res, "Subject not found", [], 404);
    }
    successResponse(res, "Subject fetched successfully", subject);
  } catch (error) {
    next(error);
  }
});

router.get("/exams/:examSlug/subjects/:subjectSlug/topics", async (req, res, next) => {
  try {
    const { examSlug, subjectSlug } = req.params;
    const topics = await publicService.getPublicTopics(examSlug, subjectSlug);
    successResponse(res, "Topics fetched successfully", topics);
  } catch (error) {
    next(error);
  }
});

router.get("/exams/:examSlug/subjects/:subjectSlug/topics/:topicSlug", async (req, res, next) => {
  try {
    const { examSlug, subjectSlug, topicSlug } = req.params;
    const topic = await publicService.getPublicTopic(examSlug, subjectSlug, topicSlug);
    if (!topic) {
      return errorResponse(res, "Topic not found", [], 404);
    }
    successResponse(res, "Topic fetched successfully", topic);
  } catch (error) {
    next(error);
  }
});

router.get("/exams/:examSlug/syllabus", async (req, res, next) => {
  try {
    const { examSlug } = req.params;
    const syllabi = await publicService.getPublicSyllabus(examSlug);
    successResponse(res, "Syllabus fetched successfully", syllabi);
  } catch (error) {
    next(error);
  }
});

router.get("/exams/:examSlug/pyqs", async (req, res, next) => {
  try {
    const { examSlug } = req.params;
    const pyqs = await publicService.getPublicPyqs(examSlug);
    successResponse(res, "PYQs fetched successfully", pyqs);
  } catch (error) {
    next(error);
  }
});

router.get("/exams/:examSlug/pyqs/:id", async (req, res, next) => {
  try {
    const { examSlug, id } = req.params;
    const pyq = await publicService.getPublicPyq(examSlug, id);
    if (!pyq) {
      return errorResponse(res, "PYQ not found", [], 404);
    }
    successResponse(res, "PYQ fetched successfully", pyq);
  } catch (error) {
    next(error);
  }
});

router.get("/current-affairs", async (req, res, next) => {
  try {
    const { examSlug, search, page, limit } = req.query;
    const result = await publicService.getPublicCurrentAffairs({ examSlug, search, page, limit });
    successResponse(res, "Current affairs fetched successfully", result.items, {
      total: result.total,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      totalPages: Math.ceil(result.total / (parseInt(limit) || 20)),
    });
  } catch (error) {
    next(error);
  }
});

router.get("/current-affairs/:slug", async (req, res, next) => {
  try {
    const { slug } = req.params;
    const item = await publicService.getPublicCurrentAffairBySlug(slug);
    if (!item) {
      return errorResponse(res, "Current affair not found", [], 404);
    }
    successResponse(res, "Current affair fetched successfully", item);
  } catch (error) {
    next(error);
  }
});

router.get("/exams/:examSlug/current-affairs", async (req, res, next) => {
  try {
    const { examSlug } = req.params;
    const result = await publicService.getPublicCurrentAffairs({ examSlug });
    successResponse(res, "Current affairs fetched successfully", result.items, {
      total: result.total,
      page: 1,
      limit: result.items.length,
      totalPages: 1,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/pages/:slug", async (req, res, next) => {
  try {
    const { slug } = req.params;
    const page = await publicService.getPublicSeoPageBySlug(slug);
    if (!page) {
      return errorResponse(res, "Page not found", [], 404);
    }
    successResponse(res, "Page fetched successfully", page);
  } catch (error) {
    next(error);
  }
});

router.get("/sitemap", async (req, res, next) => {
  try {
    const urls = await publicService.getSitemapData();
    successResponse(res, "Sitemap fetched successfully", urls);
  } catch (error) {
    next(error);
  }
});

export default router;
