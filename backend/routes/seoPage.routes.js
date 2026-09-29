import { z } from "zod";
import express from "express";
import { adminAuth } from "../../src/middleware/auth.middleware.js";
import { requireRole } from "../../src/middleware/role.middleware.js";
import { validateBody, validateParams, validateQuery } from "../../src/middleware/validation.middleware.js";
import {
  getSeoPages,
  getSeoPageById,
  createSeoPage,
  updateSeoPage,
  deleteSeoPage,
} from "../../controllers/seoPage.controller.js";
import { seoPageSchema, seoPageQuerySchema } from "../../src/validators/seoPage.validator.js";

const router = express.Router();

router.use(adminAuth);
router.use(requireRole("SUPER_ADMIN", "ADMIN", "EDITOR"));

router.get("/", validateQuery(seoPageQuerySchema), getSeoPages);
router.get("/:id", validateParams(z.object({ id: z.string().uuid() })), getSeoPageById);
router.post("/", validateBody(seoPageSchema), createSeoPage);
router.patch("/:id", validateParams(z.object({ id: z.string().uuid() })), validateBody(seoPageSchema.partial()), updateSeoPage);
router.delete("/:id", validateParams(z.object({ id: z.string().uuid() })), deleteSeoPage);

export default router;
