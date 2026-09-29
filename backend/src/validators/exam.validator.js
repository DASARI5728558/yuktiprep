import { z } from "zod";

export const examSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  shortDescription: z.string().max(500).optional(),
  description: z.string().optional(),
  logoUrl: z.string().url().optional().or(z.literal("")),
  isActive: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export const examQuerySchema = z.object({
  search: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
  sort: z.string().optional(),
  order: z.enum(["asc", "desc"]).optional(),
});

export const subjectSchema = z.object({
  examId: z.string().uuid("Invalid exam ID"),
  name: z.string().min(1, "Name is required").max(255),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const topicSchema = z.object({
  subjectId: z.string().uuid("Invalid subject ID"),
  name: z.string().min(1, "Name is required").max(255),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});
