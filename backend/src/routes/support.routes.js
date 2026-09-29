import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { handleContactSubmission, handleProblemReportSubmission } from '../controllers/support.controller.js';

const router = express.Router();

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), 'uploads', 'support');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Memory Storage & Validation (5MB max, PDF only)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf'];
  const isPdf = allowedTypes.includes(file.mimetype) || file.originalname.toLowerCase().endsWith('.pdf');
  if (isPdf) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file format. Only PDF files under 5MB are allowed.'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: fileFilter,
});

// POST /api/v1/support/tickets
router.post('/tickets', upload.single('attachment'), handleContactSubmission);

// POST /api/v1/support/problem-reports
router.post('/problem-reports', upload.single('evidence'), handleProblemReportSubmission);

export default router;
