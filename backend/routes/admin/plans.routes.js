import express from "express";
import { authMiddleware as adminAuth } from "../../src/middleware/auth.middleware.js";
import {
  adminGetPlans,
  adminGetPlanById,
  adminCreatePlan,
  adminUpdatePlan,
  adminPatchPlanStatus,
  adminReorderPlans,
} from "../../controllers/admin-plan.controller.js";
import { validateBody, validateParams, validateQuery } from "../../src/middleware/validation.middleware.js";
import { z } from "zod";
import { planSchema, planQuerySchema, reorderPlansSchema } from "../../src/validators/plan.validator.js";

const router = express.Router();

router.use(adminAuth);

router.get("/", validateQuery(planQuerySchema), adminGetPlans);
router.get("/:id", validateParams(z.object({ id: z.string().uuid() })), adminGetPlanById);
router.post("/", validateBody(planSchema), adminCreatePlan);
router.put("/:id", validateParams(z.object({ id: z.string().uuid() })), validateBody(planSchema.partial()), adminUpdatePlan);
router.patch("/:id", validateParams(z.object({ id: z.string().uuid() })), validateBody(planSchema.partial()), adminUpdatePlan);
router.patch("/:id/status", validateParams(z.object({ id: z.string().uuid() })), validateBody(z.object({ isActive: z.boolean() })), adminPatchPlanStatus);
router.patch("/reorder", validateBody(reorderPlansSchema), adminReorderPlans);

export default router;
