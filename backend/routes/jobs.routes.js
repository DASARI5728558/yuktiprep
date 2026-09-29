import express from "express";
import { getJobs, chat, sync, getSavedJobs, toggleSavedJob } from "../controllers/jobs.controller.js";
import { userAuthMiddleware } from "../src/middleware/userAuth.middleware.js";

const router = express.Router();

router.get("/search", getJobs);
router.post("/chat", chat);
router.post("/sync", sync);

router.get("/saved", userAuthMiddleware, getSavedJobs);
router.post("/saved/:jobId", userAuthMiddleware, toggleSavedJob);

export default router;

