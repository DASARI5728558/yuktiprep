import { z } from "zod";

export const seoPageSchema = z.object({
  pageType: z.string().min(1, "Page type is required").max(100),
  title: z.string().min(1, "Title is required").max(500),
  content: z.string().optional(),
  seoTitle: z.string().max(255).optional(),
  seoDescription: z.string().optional(),
  canonicalUrl: z.string().url().optional().or(z.literal("")),
  ogTitle: z.string().max(255).optional(),
  ogDescription: z.string().optional(),
  ogImage: z.string().url().optional().or(z.literal("")),
  robotsIndex: z.boolean().optional(),
  robotsFollow: z.boolean().optional(),
  schemaType: z.string().max(100).optional(),
  status: z.enum(["DRAFT", "REVIEW", "PUBLISHED", "ARCHIVED"]).optional(),
});

export const seoPageQuerySchema = z.object({
  pageType: z.string().optional(),
  status: z.enum(["DRAFT", "REVIEW", "PUBLISHED", "ARCHIVED"]).optional(),
  search: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
  sort: z.string().optional(),
  order: z.enum(["asc", "desc"]).optional(),
});
