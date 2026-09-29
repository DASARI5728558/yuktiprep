import express from "express";
import { userAuthMiddleware } from "../src/middleware/userAuth.middleware.js";
import { getLanguages, getUserLanguage, updateUserLanguage, translateTextsController } from "../controllers/language.controller.js";

const router = express.Router();

router.get("/languages", getLanguages);
router.get("/profile/language", userAuthMiddleware, getUserLanguage);
router.put("/profile/language", userAuthMiddleware, updateUserLanguage);
router.post("/translate", userAuthMiddleware, translateTextsController);

export default router;
