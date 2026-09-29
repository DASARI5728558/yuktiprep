import express from "express";
import { whatsAppEventsWebhook } from "../../controllers/webhook/whatsapp-events.controller.js";

const router = express.Router();

router.post("/whatsapp-events", express.raw({ type: "application/json" }), whatsAppEventsWebhook);

export default router;
