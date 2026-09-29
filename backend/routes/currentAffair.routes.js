import express from "express";
import { adminAuth } from "../../src/middleware/auth.middleware.js";
import { requireRole } from "../../src/middleware/role.middleware.js";
import { validateBody, validateParams, validateQuery } from "../../src/middleware/validation.middleware.js";
import {
  getCurrentAffairs,
  getCurrentAffairById,
  createCurrentAffair,
  updateCurrentAffair,
  deleteCurrentAffair,
  verifyCurrentAffair,
  publishCurrentAffair,
  archiveCurrentAffair,
} from "../../controllers/currentAffair.controller.js";
import { currentAffairSchema, currentAffairQuerySchema } from "../../src/validators/currentAffair.validator.js";
import { z } from "zod";

const router = express.Router();

router.use(adminAuth);
router.use(requireRole("SUPER_ADMIN", "ADMIN", "EDITOR", "CONTENT_MANAGER"));

router.get("/", validateQuery(currentAffairQuerySchema), getCurrentAffairs);
router.get("/:id", validateParams(z.object({ id: z.string().uuid() })), getCurrentAffairById);
router.post("/", validateBody(currentAffairSchema), createCurrentAffair);
router.patch("/:id", validateParams(z.object({ id: z.string().uuid() })), validateBody(currentAffairSchema.partial()), updateCurrentAffair);
router.delete("/:id", validateParams(z.object({ id: z.string().uuid() })), deleteCurrentAffair);
router.post("/:id/verify", validateParams(z.object({ id: z.string().uuid() })), validateBody(z.object({ reviewerName: z.string().optional() })), verifyCurrentAffair);
router.post("/:id/publish", validateParams(z.object({ id: z.string().uuid() })), publishCurrentAffair);
router.post("/:id/archive", validateParams(z.object({ id: z.string().uuid() })), archiveCurrentAffair);

export default router;
