import { z } from "zod";

export const pyqSchema = z.object({
  examId: z.string().uuid("Invalid exam ID"),
  subjectId: z.string().uuid().optional().nullable(),
  topicId: z.string().uuid().optional().nullable(),
  question: z.string().min(1, "Question is required"),
  questionType: z.string().max(50).optional(),
  options: z.any().optional(),
  correctAnswer: z.string().optional(),
  explanation: z.string().optional(),
  year: z.number().int().optional(),
  paper: z.string().max(255).optional(),
  difficulty: z.string().max(50).optional(),
  source: z.string().optional(),
  isPublished: z.boolean().optional(),
});

export const pyqQuerySchema = z.object({
  examId: z.string().uuid().optional(),
  subjectId: z.string().uuid().optional(),
  topicId: z.string().uuid().optional(),
  year: z.string().optional(),
  difficulty: z.string().optional(),
  search: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
  sort: z.string().optional(),
  order: z.enum(["asc", "desc"]).optional(),
});

export const bulkPyqSchema = z.object({
  examId: z.string().uuid("Invalid exam ID"),
  pyqs: z.array(pyqSchema).min(1, "At least one PYQ is required"),
});
