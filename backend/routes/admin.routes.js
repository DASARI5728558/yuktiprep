import express from "express";
import { authMiddleware as adminAuth } from "../src/middleware/auth.middleware.js";
import {
  getExams,
  getExamById,
  createExam,
  updateExam,
  deleteExam
} from "../controllers/exam.controller.js";
import {
  getSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject
} from "../controllers/subject.controller.js";
import {
  getTopics,
  getTopicById,
  createTopic,
  updateTopic,
  deleteTopic
} from "../controllers/topic.controller.js";
import {
  getSyllabi,
  getSyllabusById,
  createSyllabus,
  updateSyllabus,
  deleteSyllabus
} from "../controllers/syllabus.controller.js";
import {
  getPyqs,
  getPyqById,
  createPyq,
  updatePyq,
  deletePyq,
  bulkCreatePyqs,
  bulkDeletePyqs
} from "../controllers/pyq.controller.js";
import {
  getCurrentAffairs,
  getCurrentAffairById,
  createCurrentAffair,
  updateCurrentAffair,
  deleteCurrentAffair,
  verifyCurrentAffair,
  publishCurrentAffair,
  archiveCurrentAffair
} from "../controllers/currentAffair.controller.js";
import {
  getSeoPages,
  getSeoPageById,
  createSeoPage,
  updateSeoPage,
  deleteSeoPage
} from "../controllers/seoPage.controller.js";
import { uploadFile } from "../controllers/upload.controller.js";
import multer from "multer";
import { z } from "zod";
import { validateBody, validateParams, validateQuery } from "../src/middleware/validation.middleware.js";
import { examQuerySchema } from "../src/validators/exam.validator.js";
import { subjectQuerySchema } from "../src/validators/subject.validator.js";
import { topicQuerySchema } from "../src/validators/topic.validator.js";
import { syllabusQuerySchema } from "../src/validators/syllabus.validator.js";
import { pyqSchema, bulkPyqSchema, pyqQuerySchema } from "../src/validators/pyq.validator.js";
import { currentAffairSchema, currentAffairQuerySchema } from "../src/validators/currentAffair.validator.js";
import { seoPageSchema, seoPageQuerySchema } from "../src/validators/seoPage.validator.js";
import { examSchema } from "../src/validators/exam.validator.js";
import { subjectSchema } from "../src/validators/subject.validator.js";
import { topicSchema } from "../src/validators/topic.validator.js";
import { syllabusSchema } from "../src/validators/syllabus.validator.js";

const router = express.Router();

router.use(adminAuth);

// Configure multer (memory storage) for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
});

// Upload route
router.post("/upload", upload.single("file"), uploadFile);

// ----------------------
// EXAMS
// ----------------------
router.get("/exams", validateQuery(examQuerySchema), getExams);
router.get("/exams/:id", validateParams(z.object({ id: z.string().uuid() })), getExamById);
router.post("/exams", validateBody(examSchema), createExam);
router.patch("/exams/:id", validateParams(z.object({ id: z.string().uuid() })), validateBody(examSchema.partial()), updateExam);
router.delete("/exams/:id", validateParams(z.object({ id: z.string().uuid() })), deleteExam);

// ----------------------
// SUBJECTS
// ----------------------
router.get("/subjects", validateQuery(subjectQuerySchema), getSubjects);
router.get("/subjects/:id", validateParams(z.object({ id: z.string().uuid() })), getSubjectById);
router.post("/subjects", validateBody(subjectSchema), createSubject);
router.patch("/subjects/:id", validateParams(z.object({ id: z.string().uuid() })), validateBody(subjectSchema.partial()), updateSubject);
router.delete("/subjects/:id", validateParams(z.object({ id: z.string().uuid() })), deleteSubject);

// ----------------------
// TOPICS
// ----------------------
router.get("/topics", validateQuery(topicQuerySchema), getTopics);
router.get("/topics/:id", validateParams(z.object({ id: z.string().uuid() })), getTopicById);
router.post("/topics", validateBody(topicSchema), createTopic);
router.patch("/topics/:id", validateParams(z.object({ id: z.string().uuid() })), validateBody(topicSchema.partial()), updateTopic);
router.delete("/topics/:id", validateParams(z.object({ id: z.string().uuid() })), deleteTopic);

// ----------------------
// SYLLABUS
// ----------------------
router.get("/syllabus", validateQuery(syllabusQuerySchema), getSyllabi);
router.get("/syllabus/:id", validateParams(z.object({ id: z.string().uuid() })), getSyllabusById);
router.post("/syllabus", validateBody(syllabusSchema), createSyllabus);
router.patch("/syllabus/:id", validateParams(z.object({ id: z.string().uuid() })), validateBody(syllabusSchema.partial()), updateSyllabus);
router.delete("/syllabus/:id", validateParams(z.object({ id: z.string().uuid() })), deleteSyllabus);

// ----------------------
// PYQS
// ----------------------
router.get("/pyqs", validateQuery(pyqQuerySchema), getPyqs);
router.get("/pyqs/:id", validateParams(z.object({ id: z.string().uuid() })), getPyqById);
router.post("/pyqs", validateBody(pyqSchema), createPyq);
router.patch("/pyqs/:id", validateParams(z.object({ id: z.string().uuid() })), validateBody(pyqSchema.partial()), updatePyq);
router.delete("/pyqs/:id", validateParams(z.object({ id: z.string().uuid() })), deletePyq);
router.post("/pyqs/bulk", validateBody(bulkPyqSchema), bulkCreatePyqs);
router.delete("/pyqs/bulk", validateBody(z.object({ ids: z.array(z.string().uuid()) })), bulkDeletePyqs);

// ----------------------
// CURRENT AFFAIRS
// ----------------------
router.get("/current-affairs", validateQuery(currentAffairQuerySchema), getCurrentAffairs);
router.get("/current-affairs/:id", validateParams(z.object({ id: z.string().uuid() })), getCurrentAffairById);
router.post("/current-affairs", validateBody(currentAffairSchema), createCurrentAffair);
router.patch("/current-affairs/:id", validateParams(z.object({ id: z.string().uuid() })), validateBody(currentAffairSchema.partial()), updateCurrentAffair);
router.delete("/current-affairs/:id", validateParams(z.object({ id: z.string().uuid() })), deleteCurrentAffair);
router.post("/current-affairs/:id/verify", validateParams(z.object({ id: z.string().uuid() })), verifyCurrentAffair);
router.post("/current-affairs/:id/publish", validateParams(z.object({ id: z.string().uuid() })), publishCurrentAffair);
router.post("/current-affairs/:id/archive", validateParams(z.object({ id: z.string().uuid() })), archiveCurrentAffair);

// ----------------------
// SEO PAGES
// ----------------------
router.get("/seo-pages", validateQuery(seoPageQuerySchema), getSeoPages);
router.get("/seo-pages/:id", validateParams(z.object({ id: z.string().uuid() })), getSeoPageById);
router.post("/seo-pages", validateBody(seoPageSchema), createSeoPage);
router.patch("/seo-pages/:id", validateParams(z.object({ id: z.string().uuid() })), validateBody(seoPageSchema.partial()), updateSeoPage);
router.delete("/seo-pages/:id", validateParams(z.object({ id: z.string().uuid() })), deleteSeoPage);

// ----------------------
// LANGUAGES
// ----------------------
router.get("/languages", async (req, res) => {
  try {
    const prisma = (await import("../config/prisma.js")).default;
    const languages = await prisma.language.findMany();
    res.json({ status: "success", data: languages });
  } catch (error) {
    res.status(500).json({ status: "error", detail: String(error) });
  }
});

export default router;
