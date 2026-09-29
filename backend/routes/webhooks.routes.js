import express from "express";
import { razorpayWebhook } from "../controllers/webhook.controller.js";

const router = express.Router();

router.post("/razorpay", express.json(), razorpayWebhook);

export default router;
