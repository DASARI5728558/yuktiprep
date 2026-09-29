import { z } from "zod";

export const syllabusSchema = z.object({
  examId: z.string().uuid("Invalid exam ID"),
  subjectId: z.string().uuid().optional().nullable(),
  title: z.string().min(1, "Title is required").max(255),
  content: z.string().min(1, "Content is required"),
  seoTitle: z.string().max(255).optional(),
  seoDescription: z.string().optional(),
  canonicalUrl: z.string().url().optional().or(z.literal("")),
  status: z.enum(["DRAFT", "REVIEW", "PUBLISHED", "ARCHIVED"]).optional(),
});

export const syllabusQuerySchema = z.object({
  examId: z.string().uuid().optional(),
  subjectId: z.string().uuid().optional(),
  status: z.enum(["DRAFT", "REVIEW", "PUBLISHED", "ARCHIVED"]).optional(),
  search: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
  sort: z.string().optional(),
  order: z.enum(["asc", "desc"]).optional(),
});
