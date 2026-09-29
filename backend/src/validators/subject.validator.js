import { z } from "zod";

export const subjectSchema = z.object({
  examId: z.string().uuid("Invalid exam ID"),
  name: z.string().min(1, "Name is required").max(255),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const subjectQuerySchema = z.object({
  examId: z.string().uuid().optional(),
  search: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
  sort: z.string().optional(),
  order: z.enum(["asc", "desc"]).optional(),
});
