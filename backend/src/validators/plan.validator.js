import { z } from "zod";

export const planSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  key: z.string().min(1, "Key is required").max(100),
  subtitle: z.string().max(255).optional(),
  price: z.number().int().positive("Price must be positive"),
  currency: z.string().max(3).optional(),
  billingInterval: z.string().max(20).optional(),
  razorpayPlanId: z.string().max(255).optional().or(z.literal("")),
  badgeText: z.string().max(100).optional().or(z.literal("")),
  badgeType: z.string().max(50).optional().or(z.literal("")),
  theme: z.string().max(50).optional().or(z.literal("")),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
  features: z.array(z.object({
    text: z.string().min(1, "Feature text is required"),
    sortOrder: z.number().int().optional(),
  })).optional(),
});

export const planQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  sort: z.string().optional(),
  order: z.enum(["asc", "desc"]).optional(),
  active: z.string().optional(),
});

export const reorderPlansSchema = z.object({
  plans: z.array(z.object({
    id: z.string().uuid(),
    sortOrder: z.number().int(),
  })),
});

export const subscriptionCreateSchema = z.object({
  planId: z.string().uuid("Invalid plan ID"),
});

export const subscriptionVerifySchema = z.object({
  razorpaySubscriptionId: z.string().min(1, "Subscription ID is required"),
  razorpayPaymentId: z.string().min(1, "Payment ID is required"),
  razorpaySignature: z.string().min(1, "Signature is required"),
});

export const subscriptionCancelSchema = z.object({
  subscriptionId: z.string().uuid("Invalid subscription ID"),
});
