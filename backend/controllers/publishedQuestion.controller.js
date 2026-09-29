import prisma from "../config/prisma.js";
import { successResponse, errorResponse } from "../src/utils/response.js";

/**
 * Get published questions for learners with rich faceted search.
 */
export const getPublishedQuestions = async (req, res, next) => {
  try {
    const {
      examId,
      subjectId,
      topicId,
      difficulty,
      bloomLevel,
      language = "en",
      year,
      search,
      page = 1,
      limit = 20,
    } = req.query;

    const where = {
      isPublished: true,
      isActive: true,
    };

    if (examId) where.examId = examId;
    if (subjectId) where.subjectId = subjectId;
    if (topicId) where.topicId = topicId;
    if (difficulty) where.difficulty = difficulty;
    if (bloomLevel) where.bloomLevel = bloomLevel;
    if (language) where.language = language;
    if (year) where.sourceYear = Number(year);
    if (search) {
      where.OR = [
        { questionText: { contains: search, mode: "insensitive" } },
        { explanation: { contains: search, mode: "insensitive" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const [total, questions] = await Promise.all([
      prisma.publishedQuestion.count({ where }),
      prisma.publishedQuestion.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: {
          exam: { select: { id: true, name: true, slug: true } },
          subject: { select: { id: true, name: true, slug: true } },
          topic: { select: { id: true, name: true, slug: true } },
        },
      }),
    ]);

    return successResponse(res, "Published questions retrieved successfully", questions, {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / take),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get question details by ID.
 */
export const getPublishedQuestionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const question = await prisma.publishedQuestion.findUnique({
      where: { id },
      include: {
        exam: true,
        subject: true,
        topic: true,
      },
    });

    if (!question || !question.isPublished) {
      return errorResponse(res, "Question not found", [], 404);
    }

    return successResponse(res, "Question retrieved successfully", question);
  } catch (error) {
    next(error);
  }
};
