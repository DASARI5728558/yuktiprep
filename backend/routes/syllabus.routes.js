import { z } from "zod";
import express from "express";
import { adminAuth } from "../../src/middleware/auth.middleware.js";
import { requireRole } from "../../src/middleware/role.middleware.js";
import { validateBody, validateParams, validateQuery } from "../../src/middleware/validation.middleware.js";
import {
  getSyllabi,
  getSyllabusById,
  createSyllabus,
  updateSyllabus,
  deleteSyllabus,
} from "../../controllers/syllabus.controller.js";
import { syllabusSchema, syllabusQuerySchema } from "../../src/validators/syllabus.validator.js";

const router = express.Router();

router.use(adminAuth);
router.use(requireRole("SUPER_ADMIN", "ADMIN", "EDITOR", "CONTENT_MANAGER"));

router.get("/", validateQuery(syllabusQuerySchema), getSyllabi);
router.get("/:id", validateParams(z.object({ id: z.string().uuid() })), getSyllabusById);
router.post("/", validateBody(syllabusSchema), createSyllabus);
router.patch("/:id", validateParams(z.object({ id: z.string().uuid() })), validateBody(syllabusSchema.partial()), updateSyllabus);
router.delete("/:id", validateParams(z.object({ id: z.string().uuid() })), deleteSyllabus);

export default router;
