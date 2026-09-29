import prisma from "../config/prisma.js";
import { successResponse, errorResponse } from "../src/utils/response.js";

/**
 * Public APIs for Competitive Exams
 */

export const getPublicCompetitiveExams = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      state,
      organization,
      category,
      status,
      month, // e.g., "2026-06"
      year = "2026",
      sort = "examDate",
      order = "asc",
    } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const where = {
      isActive: true,
    };

    // Collect AND conditions to avoid OR conflicts
    const andConditions = [];

    if (search) {
      andConditions.push({
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { organization: { contains: search, mode: "insensitive" } },
          { state: { contains: search, mode: "insensitive" } },
        ],
      });
    }

    if (state && state !== "All") {
      where.state = { equals: state, mode: "insensitive" };
    }

    if (organization && organization !== "All") {
      where.organization = { equals: organization, mode: "insensitive" };
    }

    if (category && category !== "All") {
      where.category = { equals: category, mode: "insensitive" };
    }

    if (status && status !== "All") {
      where.status = { equals: status, mode: "insensitive" };
    }

    if (month) {
      // month format: YYYY-MM
      const [y, m] = month.split("-").map(Number);
      if (y && m) {
        const startOfMonth = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0));
        const endOfMonth = new Date(Date.UTC(y, m, 0, 23, 59, 59));
        where.examDate = {
          gte: startOfMonth,
          lte: endOfMonth,
        };
      }
    } else if (year) {
      const y = parseInt(year, 10);
      if (y >= 2026) {
        const startOfYear = new Date(Date.UTC(y, 0, 1, 0, 0, 0));
        andConditions.push({
          OR: [
            { examDate: { gte: startOfYear } },
            { examDateText: { contains: String(y) } },
          ],
        });
      }
    }

    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    const [exams, total] = await Promise.all([
      prisma.competitiveExam.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: {
          [sort === "examDate" ? "examDate" : "createdAt"]: order === "desc" ? "desc" : "asc",
        },
        include: {
          source: {
            select: {
              organization: true,
              url: true,
              calendarUrl: true,
            },
          },
        },
      }),
      prisma.competitiveExam.count({ where }),
    ]);

    return res.status(200).json({
      success: true,
      page: pageNum,
      limit: limitNum,
      total,
      data: exams,
    });
  } catch (err) {
    next(err);
  }
};

export const getUpcomingCompetitiveExams = async (req, res, next) => {
  try {
    const today = new Date();
    const exams = await prisma.competitiveExam.findMany({
      where: {
        isActive: true,
        OR: [
          { examDate: { gte: today } },
          { status: "upcoming" },
          { examDateText: { contains: "2026" } },
          { examDateText: { contains: "2027" } },
        ],
      },
      take: 10,
      orderBy: [
        { examDate: "asc" },
        { createdAt: "desc" },
      ],
    });

    return successResponse(res, "Upcoming exams fetched successfully", exams);
  } catch (err) {
    next(err);
  }
};

export const getCompetitiveExamById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const exam = await prisma.competitiveExam.findUnique({
      where: { id },
      include: {
        source: true,
        changeLogs: {
          orderBy: { changedAt: "desc" },
          take: 10,
        },
      },
    });

    if (!exam) {
      return errorResponse(res, "Exam not found", [], 404);
    }

    return successResponse(res, "Exam details fetched successfully", exam);
  } catch (err) {
    next(err);
  }
};
