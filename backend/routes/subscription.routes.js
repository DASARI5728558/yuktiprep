import express from "express";
import { userAuthMiddleware } from "../src/middleware/userAuth.middleware.js";
import { createSubscription, verifySubscription, getMySubscription, cancelMySubscription } from "../controllers/subscription.controller.js";
import { validateBody, validateParams } from "../src/middleware/validation.middleware.js";
import { z } from "zod";
import { subscriptionCreateSchema, subscriptionVerifySchema, subscriptionCancelSchema } from "../src/validators/plan.validator.js";

const router = express.Router();

router.use(userAuthMiddleware);

router.post("/", validateBody(subscriptionCreateSchema), createSubscription);
router.post("/verify", validateBody(subscriptionVerifySchema), verifySubscription);
router.get("/me", getMySubscription);
router.post("/:id/cancel", validateParams(z.object({ id: z.string().uuid() })), cancelMySubscription);

export default router;
