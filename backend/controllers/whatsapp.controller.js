import * as whatsappService from "../services/whatsapp.service.js";
import { successResponse, errorResponse } from "../src/utils/response.js";
import { getPagination, buildPaginationMeta } from "../src/utils/pagination.js";
import {
  whatsappTemplateSchema,
  whatsappCampaignSchema,
  whatsappBotRuleSchema,
  conversationSendSchema,
  campaignSendSchema,
} from "../src/validators/whatsapp.validator.js";
import axios from "axios";
import { env } from "../src/config/env.js";

export const getTemplates = async (req, res, next) => {
  try {
    const { page, limit, skip, sort, order } = getPagination(req.query);
    const { templates, total } = await whatsappService.getTemplates({
      page,
      limit,
      skip,
      sort,
      order,
      status: req.query.status,
      search: req.query.search,
    });
    successResponse(
      res,
      "Templates fetched successfully",
      templates,
      buildPaginationMeta(total, page, limit),
    );
  } catch (error) {
    next(error);
  }
};

export const getTemplate = async (req, res, next) => {
  try {
    const template = await whatsappService.getTemplateById(req.params.id);
    if (!template) return errorResponse(res, "Template not found", [], 404);
    successResponse(res, "Template fetched successfully", template);
  } catch (error) {
    next(error);
  }
};

export const createTemplate = async (req, res, next) => {
  try {
    const validated = whatsappTemplateSchema.parse(req.body);
    const template = await whatsappService.createTemplate(validated);
    successResponse(res, "Template created successfully", template, {}, 201);
  } catch (error) {
    if (error.name === "ZodError")
      return errorResponse(res, "Validation failed", error.errors, 400);
    next(error);
  }
};

export const updateTemplate = async (req, res, next) => {
  try {
    const validated = whatsappTemplateSchema.partial().parse(req.body);
    const template = await whatsappService.updateTemplate(
      req.params.id,
      validated,
    );
    successResponse(res, "Template updated successfully", template);
  } catch (error) {
    if (error.name === "ZodError")
      return errorResponse(res, "Validation failed", error.errors, 400);
    next(error);
  }
};

export const toggleTemplate = async (req, res, next) => {
  try {
    const { isActive } = req.body;
    const template = await whatsappService.toggleTemplate(
      req.params.id,
      isActive,
    );
    successResponse(res, "Template toggled successfully", template);
  } catch (error) {
    next(error);
  }
};

export const getCampaigns = async (req, res, next) => {
  try {
    const { page, limit, skip, sort, order } = getPagination(req.query);
    const { campaigns, total } = await whatsappService.getCampaigns({
      page,
      limit,
      skip,
      sort,
      order,
      status: req.query.status,
    });
    successResponse(
      res,
      "Campaigns fetched successfully",
      campaigns,
      buildPaginationMeta(total, page, limit),
    );
  } catch (error) {
    next(error);
  }
};

export const getCampaign = async (req, res, next) => {
  try {
    const campaign = await whatsappService.getCampaignById(req.params.id);
    if (!campaign) return errorResponse(res, "Campaign not found", [], 404);
    successResponse(res, "Campaign fetched successfully", campaign);
  } catch (error) {
    next(error);
  }
};

export const createCampaign = async (req, res, next) => {
  try {
    const validated = whatsappCampaignSchema.parse(req.body);
    const campaign = await whatsappService.createCampaign({
      ...validated,
      createdBy: req.admin.id,
    });
    successResponse(res, "Campaign created successfully", campaign, {}, 201);
  } catch (error) {
    if (error.name === "ZodError")
      return errorResponse(res, "Validation failed", error.errors, 400);
    next(error);
  }
};

export const updateCampaign = async (req, res, next) => {
  try {
    const validated = whatsappCampaignSchema.partial().parse(req.body);
    const campaign = await whatsappService.updateCampaign(
      req.params.id,
      validated,
    );
    successResponse(res, "Campaign updated successfully", campaign);
  } catch (error) {
    if (error.name === "ZodError")
      return errorResponse(res, "Validation failed", error.errors, 400);
    next(error);
  }
};

export const sendCampaign = async (req, res, next) => {
  try {
    const campaign = await whatsappService.getCampaignById(req.params.id);
    if (!campaign) return errorResponse(res, "Campaign not found", [], 404);
    if (!["DRAFT", "SCHEDULED"].includes(campaign.status)) {
      return errorResponse(
        res,
        "Campaign cannot be sent in its current status",
        [],
        400,
      );
    }
    const updated = await whatsappService.updateCampaign(req.params.id, {
      status: "SENDING",
    });

    // Trigger the background processor without awaiting
    whatsappService.processCampaignInBackground(campaign.id);

    successResponse(res, "Campaign send initiated", updated);
  } catch (error) {
    next(error);
  }
};

export const scheduleCampaign = async (req, res, next) => {
  try {
    const { scheduledAt } = req.body;
    const updated = await whatsappService.updateCampaign(req.params.id, {
      scheduledAt,
      status: "SCHEDULED",
    });
    successResponse(res, "Campaign scheduled successfully", updated);
  } catch (error) {
    next(error);
  }
};

export const cancelCampaign = async (req, res, next) => {
  try {
    const updated = await whatsappService.updateCampaign(req.params.id, {
      status: "FAILED",
    });
    successResponse(res, "Campaign cancelled", updated);
  } catch (error) {
    next(error);
  }
};

export const getConversations = async (req, res, next) => {
  try {
    const { page, limit, skip, sort, order } = getPagination(req.query);
    const { conversations, total } = await whatsappService.getConversations({
      page,
      limit,
      skip,
      sort,
      order,
      state: req.query.state,
      humanHandoff:
        req.query.humanHandoff === "true"
          ? true
          : req.query.humanHandoff === "false"
            ? false
            : undefined,
      search: req.query.search,
    });
    successResponse(
      res,
      "Conversations fetched successfully",
      conversations,
      buildPaginationMeta(total, page, limit),
    );
  } catch (error) {
    next(error);
  }
};

export const getConversation = async (req, res, next) => {
  try {
    const conversation = await whatsappService.getConversationById(
      req.params.id,
    );
    if (!conversation)
      return errorResponse(res, "Conversation not found", [], 404);
    successResponse(res, "Conversation fetched successfully", conversation);
  } catch (error) {
    next(error);
  }
};

export const getConversationMessages = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { messages, total } = await whatsappService.getConversationMessages(
      req.params.id,
      { page, limit, skip },
    );
    successResponse(
      res,
      "Messages fetched successfully",
      messages,
      buildPaginationMeta(total, page, limit),
    );
  } catch (error) {
    next(error);
  }
};

export const sendConversationMessage = async (req, res, next) => {
  try {
    const validated = conversationSendSchema.parse(req.body);

    const conversation = await whatsappService.getConversationById(
      req.params.id,
    );
    if (!conversation)
      return errorResponse(res, "Conversation not found", [], 404);

    try {
      const url = `https://graph.facebook.com/v17.0/${env.META_PHONE_NUMBER_ID}/messages`;
      await axios.post(
        url,
        {
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: conversation.waId,
          type: "text",
          text: { preview_url: false, body: validated.body },
        },
        {
          headers: {
            Authorization: `Bearer ${env.META_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
          },
        },
      );
    } catch (apiError) {
      console.error(
        "Failed to send WA message via Admin:",
        apiError?.response?.data || apiError.message,
      );
      return errorResponse(
        res,
        "Failed to send message via Meta API",
        apiError?.response?.data,
        500,
      );
    }

    const message = await whatsappService.createMessage({
      conversationId: req.params.id,
      direction: "OUTBOUND",
      type: validated.type || "text",
      body: validated.body,
      status: "SENT",
    });
    successResponse(res, "Message sent successfully", message, {}, 201);
  } catch (error) {
    if (error.name === "ZodError")
      return errorResponse(res, "Validation failed", error.errors, 400);
    next(error);
  }
};

export const handoffConversation = async (req, res, next) => {
  try {
    const conversation = await whatsappService.updateConversationHandoff(
      req.params.id,
      true,
    );
    const contactId = conversation.context?.contactId;
    if (contactId && env.WHATSAPP_API_URL && env.WHATSAPP_INTERNAL_API_KEY) {
      try {
        await axios.post(
          `${env.WHATSAPP_API_URL}/v1/conversations/${encodeURIComponent(contactId)}/handoff`,
          {},
          {
            headers: {
              Authorization: `Bearer ${env.WHATSAPP_INTERNAL_API_KEY}`,
            },
            timeout: 5000,
          },
        );
      } catch (runtimeError) {
        console.error("Runtime handoff call failed:", runtimeError);
      }
    }

    const bodyText =
      "I'm connecting you with a YuktiPrep counsellor.\nExpected response: within 30 minutes.\n\nThe bot is now paused while the agent handles your conversation.";

    // Send to Meta API
    try {
      const url = `https://graph.facebook.com/v17.0/${env.META_PHONE_NUMBER_ID}/messages`;
      await axios.post(
        url,
        {
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: conversation.waId,
          type: "text",
          text: { preview_url: false, body: bodyText },
        },
        {
          headers: {
            Authorization: `Bearer ${env.META_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
          },
        },
      );
    } catch (apiError) {
      console.error(
        "Failed to send handoff message via Meta API:",
        apiError?.response?.data || apiError.message,
      );
    }

    // Log the message in DB so it shows in the admin panel
    await whatsappService.createMessage({
      conversationId: req.params.id,
      direction: "OUTBOUND",
      type: "text",
      body: bodyText,
      status: "SENT",
    });

    successResponse(res, "Human handoff enabled", conversation);
  } catch (error) {
    next(error);
  }
};

export const releaseConversation = async (req, res, next) => {
  try {
    const conversation = await whatsappService.updateConversationHandoff(
      req.params.id,
      false,
    );
    const contactId = conversation.context?.contactId;
    if (contactId && env.WHATSAPP_API_URL && env.WHATSAPP_INTERNAL_API_KEY) {
      try {
        await axios.post(
          `${env.WHATSAPP_API_URL}/v1/conversations/${encodeURIComponent(contactId)}/release`,
          {},
          {
            headers: {
              Authorization: `Bearer ${env.WHATSAPP_INTERNAL_API_KEY}`,
            },
            timeout: 5000,
          },
        );
      } catch (runtimeError) {
        console.error("Runtime release call failed:", runtimeError);
      }
    }

    const bodyText =
      "The human agent has closed this chat.\n\nThe bot is now active again.";

    // Send to Meta API
    try {
      const url = `https://graph.facebook.com/v17.0/${env.META_PHONE_NUMBER_ID}/messages`;
      await axios.post(
        url,
        {
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: conversation.waId,
          type: "text",
          text: { preview_url: false, body: bodyText },
        },
        {
          headers: {
            Authorization: `Bearer ${env.META_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
          },
        },
      );
    } catch (apiError) {
      console.error(
        "Failed to send release message via Meta API:",
        apiError?.response?.data || apiError.message,
      );
    }

    // Log the message in DB so it shows in the admin panel
    await whatsappService.createMessage({
      conversationId: req.params.id,
      direction: "OUTBOUND",
      type: "text",
      body: bodyText,
      status: "SENT",
    });

    successResponse(res, "Returned to bot automation", conversation);
  } catch (error) {
    next(error);
  }
};

export const getBotRules = async (req, res, next) => {
  try {
    const rules = await whatsappService.getBotRules({
      category: req.query.category,
      isActive:
        req.query.isActive !== undefined
          ? req.query.isActive === "true"
          : undefined,
    });
    successResponse(res, "Bot rules fetched successfully", rules);
  } catch (error) {
    next(error);
  }
};

export const getBotRule = async (req, res, next) => {
  try {
    const rule = await whatsappService.getBotRuleById(req.params.id);
    if (!rule) return errorResponse(res, "Rule not found", [], 404);
    successResponse(res, "Bot rule fetched successfully", rule);
  } catch (error) {
    next(error);
  }
};

export const createBotRule = async (req, res, next) => {
  try {
    const validated = whatsappBotRuleSchema.parse(req.body);
    const rule = await whatsappService.createBotRule(validated);
    successResponse(res, "Bot rule created successfully", rule, {}, 201);
  } catch (error) {
    if (error.name === "ZodError")
      return errorResponse(res, "Validation failed", error.errors, 400);
    next(error);
  }
};

export const updateBotRule = async (req, res, next) => {
  try {
    const validated = whatsappBotRuleSchema.partial().parse(req.body);
    const rule = await whatsappService.updateBotRule(req.params.id, validated);
    successResponse(res, "Bot rule updated successfully", rule);
  } catch (error) {
    if (error.name === "ZodError")
      return errorResponse(res, "Validation failed", error.errors, 400);
    next(error);
  }
};

export const deleteBotRule = async (req, res, next) => {
  try {
    await whatsappService.deleteBotRule(req.params.id);
    successResponse(res, "Bot rule deleted successfully");
  } catch (error) {
    if (error.code === "P2025")
      return errorResponse(res, "Rule not found", [], 404);
    next(error);
  }
};

export const toggleBotRule = async (req, res, next) => {
  try {
    const { isActive } = req.body;
    const rule = await whatsappService.toggleBotRule(req.params.id, isActive);
    successResponse(res, "Bot rule toggled successfully", rule);
  } catch (error) {
    next(error);
  }
};

export const getAnalyticsSummary = async (req, res, next) => {
  try {
    const summary = await whatsappService.getAnalyticsSummary();
    successResponse(res, "Analytics summary fetched successfully", summary);
  } catch (error) {
    next(error);
  }
};

export const getAnalyticsDaily = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const daily = await whatsappService.getAnalyticsDaily(days);
    successResponse(res, "Daily analytics fetched successfully", daily);
  } catch (error) {
    next(error);
  }
};

export const getAnalyticsTopIntents = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const intents = await whatsappService.getAnalyticsTopIntents(limit);
    successResponse(res, "Top intents fetched successfully", intents);
  } catch (error) {
    next(error);
  }
};
