import { z } from "zod";

export const whatsappTemplateSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  language: z.string().max(12).optional(),
  category: z.string().max(100).optional(),
  bodyComponents: z.any().optional(),
  headerType: z.string().max(50).optional().or(z.literal("")),
  mediaUrl: z.string().optional().or(z.literal("")),
  metaTemplateId: z.string().max(255).optional().or(z.literal("")),
  isActive: z.boolean().optional(),
});

export const whatsappCampaignSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  templateId: z.string().uuid("Invalid template ID"),
  audienceFilter: z.any().optional(),
  scheduledAt: z.string().datetime().optional().or(z.literal("")).transform(v => v === "" ? null : v),
});

export const whatsappBotRuleSchema = z.object({
  trigger: z.string().min(1, "Trigger is required").max(100),
  category: z.string().max(100).optional(),
  actionType: z.string().min(1, "Action type is required").max(50),
  actionPayload: z.any().optional(),
  priority: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export const conversationSendSchema = z.object({
  body: z.string().min(1, "Message body is required"),
  type: z.string().max(50).optional(),
});

export const campaignSendSchema = z.object({
  audienceFilter: z.any().optional(),
});
