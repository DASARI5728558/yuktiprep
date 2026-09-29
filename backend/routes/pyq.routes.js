import express from "express";
import { adminAuth } from "../../src/middleware/auth.middleware.js";
import { requireRole } from "../../src/middleware/role.middleware.js";
import { validateBody, validateParams, validateQuery } from "../../src/middleware/validation.middleware.js";
import {
  getPyqs,
  getPyqById,
  createPyq,
  updatePyq,
  deletePyq,
  bulkCreatePyqs,
  bulkDeletePyqs,
} from "../../controllers/pyq.controller.js";
import { pyqSchema, bulkPyqSchema, pyqQuerySchema } from "../../src/validators/pyq.validator.js";
import { z } from "zod";

const router = express.Router();

router.use(adminAuth);
router.use(requireRole("SUPER_ADMIN", "ADMIN", "EDITOR", "CONTENT_MANAGER"));

router.get("/", validateQuery(pyqQuerySchema), getPyqs);
router.get("/:id", validateParams(z.object({ id: z.string().uuid() })), getPyqById);
router.post("/", validateBody(pyqSchema), createPyq);
router.patch("/:id", validateParams(z.object({ id: z.string().uuid() })), validateBody(pyqSchema.partial()), updatePyq);
router.delete("/:id", validateParams(z.object({ id: z.string().uuid() })), deletePyq);
router.post("/bulk", validateBody(bulkPyqSchema), bulkCreatePyqs);
router.delete("/bulk", validateBody(z.object({ ids: z.array(z.string().uuid()) })), bulkDeletePyqs);

export default router;
