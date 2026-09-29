import { z } from "zod";

export const currentAffairSchema = z.object({
  title: z.string().min(1, "Title is required").max(500),
  summary: z.string().optional(),
  content: z.string().min(1, "Content is required"),
  category: z.string().max(255).optional(),
  examId: z.string().uuid().optional().nullable(),
  subjectId: z.string().uuid().optional().nullable(),
  importance: z.string().max(50).optional(),
  publishedAt: z.string().datetime().optional().nullable(),
  sourceName: z.string().max(500).optional(),
  sourceUrl: z.string().url().optional().or(z.literal("")),
  reviewerName: z.string().max(255).optional(),
  aiAssistance: z.boolean().optional(),
  status: z.enum(["DRAFT", "REVIEW", "VERIFIED", "PUBLISHED", "ARCHIVED"]).optional(),
  seoTitle: z.string().max(255).optional(),
  seoDescription: z.string().optional(),
  canonicalUrl: z.string().url().optional().or(z.literal("")),
});

export const currentAffairQuerySchema = z.object({
  examId: z.string().uuid().optional(),
  subjectId: z.string().uuid().optional(),
  category: z.string().optional(),
  status: z.enum(["DRAFT", "REVIEW", "VERIFIED", "PUBLISHED", "ARCHIVED"]).optional(),
  search: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
  sort: z.string().optional(),
  order: z.enum(["asc", "desc"]).optional(),
});
