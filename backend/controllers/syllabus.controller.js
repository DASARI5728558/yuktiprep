import prisma from "../config/prisma.js";
import { generateSlug } from "../utils/slugify.js";
import { successResponse, errorResponse } from "../src/utils/response.js";
import { getPagination, buildPaginationMeta } from "../src/utils/pagination.js";
import { syllabusSchema } from "../src/validators/syllabus.validator.js";
import * as syllabusService from "../services/syllabus.service.js";

export const getSyllabi = async (req, res, next) => {
  try {
    const { page, limit, skip, sort, order } = getPagination(req.query);
    const { syllabi, total } = await syllabusService.getSyllabi({
      examId: req.query.examId,
      subjectId: req.query.subjectId,
      status: req.query.status,
      search: req.query.search,
      skip,
      take: limit,
      sort,
      order,
    });

    successResponse(res, "Syllabus fetched successfully", syllabi, buildPaginationMeta(total, page, limit));
  } catch (error) {
    next(error);
  }
};

export const getSyllabusById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const syllabus = await syllabusService.getSyllabusById(id);

    if (!syllabus) {
      return errorResponse(res, "Syllabus not found", [], 404);
    }

    successResponse(res, "Syllabus fetched successfully", syllabus);
  } catch (error) {
    next(error);
  }
};

export const createSyllabus = async (req, res, next) => {
  try {
    const validated = syllabusSchema.parse(req.body);
    const syllabus = await syllabusService.createSyllabus(validated);
    successResponse(res, "Syllabus created successfully", syllabus, {}, 201);
  } catch (error) {
    if (error.name === "ZodError") {
      return errorResponse(res, "Validation failed", error.errors, 400);
    }
    next(error);
  }
};

export const updateSyllabus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const validated = syllabusSchema.partial().parse(req.body);
    const syllabus = await syllabusService.updateSyllabus(id, validated);
    successResponse(res, "Syllabus updated successfully", syllabus);
  } catch (error) {
    if (error.name === "ZodError") {
      return errorResponse(res, "Validation failed", error.errors, 400);
    }
    if (error.code === "P2025") {
      return errorResponse(res, "Syllabus not found", [], 404);
    }
    next(error);
  }
};

export const deleteSyllabus = async (req, res, next) => {
  try {
    const { id } = req.params;
    await syllabusService.deleteSyllabus(id);
    successResponse(res, "Syllabus deleted successfully");
  } catch (error) {
    if (error.code === "P2025") {
      return errorResponse(res, "Syllabus not found", [], 404);
    }
    next(error);
  }
};
