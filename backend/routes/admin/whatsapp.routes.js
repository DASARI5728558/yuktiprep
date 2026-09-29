import express from "express";
import { authMiddleware as adminAuth } from "../../src/middleware/auth.middleware.js";
import {
  getTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  toggleTemplate,
  getCampaigns,
  getCampaign,
  createCampaign,
  updateCampaign,
  sendCampaign,
  scheduleCampaign,
  cancelCampaign,
  getConversations,
  getConversation,
  getConversationMessages,
  sendConversationMessage,
  handoffConversation,
  releaseConversation,
  getBotRules,
  getBotRule,
  createBotRule,
  updateBotRule,
  deleteBotRule,
  toggleBotRule,
  getAnalyticsSummary,
  getAnalyticsDaily,
  getAnalyticsTopIntents,
} from "../../controllers/whatsapp.controller.js";
import { validateBody, validateParams, validateQuery } from "../../src/middleware/validation.middleware.js";
import { z } from "zod";

const router = express.Router();

router.use(adminAuth);

const uuidParam = z.object({ id: z.string().uuid() });

router.get("/templates", validateQuery(z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  status: z.string().optional(),
  search: z.string().optional(),
})), getTemplates);
router.get("/templates/:id", validateParams(uuidParam), getTemplate);
router.post("/templates", validateBody(z.object({
  name: z.string().min(1).max(255),
  language: z.string().max(12).optional(),
  category: z.string().max(100).optional(),
  bodyComponents: z.any().optional(),
  headerType: z.string().max(50).optional().or(z.literal("")),
  mediaUrl: z.string().optional().or(z.literal("")),
  metaTemplateId: z.string().max(255).optional().or(z.literal("")),
  isActive: z.boolean().optional(),
})), createTemplate);
router.patch("/templates/:id", validateParams(uuidParam), validateBody(z.object({
  name: z.string().min(1).max(255).optional(),
  language: z.string().max(12).optional().or(z.literal("")),
  category: z.string().max(100).optional().or(z.literal("")),
  bodyComponents: z.any().optional(),
  headerType: z.string().max(50).optional().or(z.literal("")),
  mediaUrl: z.string().optional().or(z.literal("")),
  metaTemplateId: z.string().max(255).optional().or(z.literal("")),
  isActive: z.boolean().optional(),
})), updateTemplate);
router.post("/templates/:id/sync", validateParams(uuidParam), (req, res) => {
  successResponse(res, "Template sync triggered", { templateId: req.params.id });
});
router.patch("/templates/:id/toggle", validateParams(uuidParam), validateBody(z.object({ isActive: z.boolean() })), toggleTemplate);

router.get("/campaigns", validateQuery(z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  status: z.string().optional(),
})), getCampaigns);
router.get("/campaigns/:id", validateParams(uuidParam), getCampaign);
router.post("/campaigns", validateBody(z.object({
  name: z.string().min(1).max(255),
  templateId: z.string().uuid(),
  audienceFilter: z.any().optional(),
  scheduledAt: z.string().datetime().optional().or(z.literal("")),
})), createCampaign);
router.patch("/campaigns/:id", validateParams(uuidParam), validateBody(z.object({
  name: z.string().min(1).max(255).optional(),
  templateId: z.string().uuid().optional(),
  audienceFilter: z.any().optional(),
  scheduledAt: z.string().datetime().optional().or(z.literal("")),
})), updateCampaign);
router.post("/campaigns/:id/send", validateParams(uuidParam), sendCampaign);
router.post("/campaigns/:id/schedule", validateParams(uuidParam), validateBody(z.object({ scheduledAt: z.string().datetime() })), scheduleCampaign);
router.post("/campaigns/:id/cancel", validateParams(uuidParam), cancelCampaign);

router.get("/conversations", validateQuery(z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  state: z.string().optional(),
  humanHandoff: z.string().optional(),
  search: z.string().optional(),
})), getConversations);
router.get("/conversations/:id", validateParams(uuidParam), getConversation);
router.get("/conversations/:id/messages", validateParams(uuidParam), validateQuery(z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
})), getConversationMessages);
router.post("/conversations/:id/send", validateParams(uuidParam), validateBody(z.object({
  body: z.string().min(1),
  type: z.string().max(50).optional(),
})), sendConversationMessage);
router.post("/conversations/:id/handoff", validateParams(uuidParam), handoffConversation);
router.post("/conversations/:id/release", validateParams(uuidParam), releaseConversation);

router.get("/rules", getBotRules);
router.get("/rules/:id", validateParams(uuidParam), getBotRule);
router.post("/rules", validateBody(z.object({
  trigger: z.string().min(1).max(100),
  category: z.string().max(100).optional(),
  actionType: z.string().min(1).max(50),
  actionPayload: z.any().optional(),
  priority: z.number().int().optional(),
  isActive: z.boolean().optional(),
})), createBotRule);
router.patch("/rules/:id", validateParams(uuidParam), validateBody(z.object({
  trigger: z.string().min(1).max(100).optional(),
  category: z.string().max(100).optional().or(z.literal("")),
  actionType: z.string().min(1).max(50).optional(),
  actionPayload: z.any().optional(),
  priority: z.number().int().optional(),
  isActive: z.boolean().optional(),
})), updateBotRule);
router.delete("/rules/:id", validateParams(uuidParam), deleteBotRule);
router.patch("/rules/:id/toggle", validateParams(uuidParam), validateBody(z.object({ isActive: z.boolean() })), toggleBotRule);

router.get("/analytics/summary", getAnalyticsSummary);
router.get("/analytics/daily", validateQuery(z.object({ days: z.string().optional() })), getAnalyticsDaily);
router.get("/analytics/top-intents", validateQuery(z.object({ limit: z.string().optional() })), getAnalyticsTopIntents);

export default router;
