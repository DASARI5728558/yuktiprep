import express from "express";
import { userAuthMiddleware } from "../src/middleware/userAuth.middleware.js";
import { getMyProfile, updateMyProfile, uploadProfilePhoto } from "../controllers/profile.controller.js";
import multer from "multer";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG, PNG, WEBP, and GIF are allowed."));
    }
  },
});

router.get("/me", userAuthMiddleware, getMyProfile);
router.put("/", userAuthMiddleware, updateMyProfile);
router.post("/photo", userAuthMiddleware, upload.single("file"), uploadProfilePhoto);

export default router;
