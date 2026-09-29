import express from "express";
import { authMiddleware as adminAuth } from "../../src/middleware/auth.middleware.js";
import { adminGetSubscriptions } from "../../controllers/admin-subscription.controller.js";
import { validateQuery } from "../../src/middleware/validation.middleware.js";
import { z } from "zod";

const router = express.Router();

router.use(adminAuth);

router.get("/", validateQuery(z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  sort: z.string().optional(),
  order: z.enum(["asc", "desc"]).optional(),
})), adminGetSubscriptions);

export default router;
