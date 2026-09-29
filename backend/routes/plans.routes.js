import express from "express";
import { getPlans, getPlanByKey } from "../controllers/plan.controller.js";

const router = express.Router();

router.get("/", getPlans);
router.get("/:key", getPlanByKey);

export default router;
