import express from "express";
import {
  registerSendOtp,
  registerVerifyOtp,
  loginSendOtp,
  loginVerifyOtp,
  adminLogin,
  adminLogout,
  getAdminMe,
  updateAdminMe,
  uploadAdminPhoto,
} from "../controllers/auth.controller.js";
import { validateBody } from "../src/middleware/validation.middleware.js";
import { email, z } from "zod";
import { adminAuth } from "../middleware/adminAuth.js";
import multer from "multer";

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

const router = express.Router();

// Phone OTP Registration
router.post(
  "/register/send-otp",
  validateBody(
    z.object({
      phone: z.string().min(10),
      email: z.string().email(),
      name: z.string().min(1),
    }),
  ),
  registerSendOtp,
);
router.post(
  "/register/verify-otp",
  validateBody(
    z.object({
      phone: z.string().min(10),
      otp: z.string().length(6),
      email: z.string().email(),
      name: z.string().min(1),
    }),
  ),
  registerVerifyOtp,
);

// Phone OTP Login
router.post(
  "/login/send-otp",
  validateBody(z.object({ phone: z.string().min(10) })),
  loginSendOtp,
);
router.post(
  "/login/verify-otp",
  validateBody(
    z.object({ phone: z.string().min(10), otp: z.string().length(6) }),
  ),
  loginVerifyOtp,
);

// Admin Auth
router.post("/admin/login", adminLogin);
router.post("/admin/logout", adminLogout);
router.get("/admin/me", adminAuth, getAdminMe);
router.put("/admin/me", adminAuth, updateAdminMe);
router.post("/admin/me/photo", adminAuth, upload.single("file"), uploadAdminPhoto);

export default router;
