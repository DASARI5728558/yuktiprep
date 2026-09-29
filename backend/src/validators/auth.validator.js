import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const adminLoginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const examSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  shortDescription: z.string().max(500).optional(),
  description: z.string().optional(),
  logoUrl: z.string().url().optional().or(z.literal("")),
  isActive: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
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
