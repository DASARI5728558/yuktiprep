import prisma from "../config/prisma.js";
import { successResponse, errorResponse } from "../src/utils/response.js";
import { getPagination, buildPaginationMeta } from "../src/utils/pagination.js";
import { pyqSchema, bulkPyqSchema, pyqQuerySchema } from "../src/validators/pyq.validator.js";
import * as pyqService from "../services/pyq.service.js";

export const getPyqs = async (req, res, next) => {
  try {
    const { page, limit, skip, sort, order } = getPagination(req.query);
    const { pyqs, total } = await pyqService.getPyqs({
      examId: req.query.examId,
      subjectId: req.query.subjectId,
      topicId: req.query.topicId,
      year: req.query.year,
      difficulty: req.query.difficulty,
      search: req.query.search,
      skip,
      take: limit,
      sort,
      order,
    });

    successResponse(res, "PYQs fetched successfully", pyqs, buildPaginationMeta(total, page, limit));
  } catch (error) {
    next(error);
  }
};

export const getPyqById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pyq = await pyqService.getPyqById(id);

    if (!pyq) {
      return errorResponse(res, "PYQ not found", [], 404);
    }

    successResponse(res, "PYQ fetched successfully", pyq);
  } catch (error) {
    next(error);
  }
};

export const createPyq = async (req, res, next) => {
  try {
    const validated = pyqSchema.parse(req.body);
    const pyq = await pyqService.createPyq(validated);
    successResponse(res, "PYQ created successfully", pyq, {}, 201);
  } catch (error) {
    if (error.name === "ZodError") {
      return errorResponse(res, "Validation failed", error.errors, 400);
    }
    next(error);
  }
};

export const updatePyq = async (req, res, next) => {
  try {
    const { id } = req.params;
    const validated = pyqSchema.partial().parse(req.body);
    const pyq = await pyqService.updatePyq(id, validated);
    successResponse(res, "PYQ updated successfully", pyq);
  } catch (error) {
    if (error.name === "ZodError") {
      return errorResponse(res, "Validation failed", error.errors, 400);
    }
    if (error.code === "P2025") {
      return errorResponse(res, "PYQ not found", [], 404);
    }
    next(error);
  }
};

export const deletePyq = async (req, res, next) => {
  try {
    const { id } = req.params;
    await pyqService.deletePyq(id);
    successResponse(res, "PYQ deleted successfully");
  } catch (error) {
    if (error.code === "P2025") {
      return errorResponse(res, "PYQ not found", [], 404);
    }
    next(error);
  }
};

export const bulkCreatePyqs = async (req, res, next) => {
  try {
    const validated = bulkPyqSchema.parse(req.body);
    const result = await pyqService.bulkCreatePyqs(validated.pyqs);
    successResponse(res, `${result.count} PYQs created successfully`, { count: result.count }, {}, 201);
  } catch (error) {
    if (error.name === "ZodError") {
      return errorResponse(res, "Validation failed", error.errors, 400);
    }
    next(error);
  }
};

export const bulkDeletePyqs = async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return errorResponse(res, "IDs array is required", [], 400);
    }

    const result = await pyqService.bulkDeletePyqs(ids);
    successResponse(res, `${result.count} PYQs deleted successfully`, { count: result.count });
  } catch (error) {
    next(error);
  }
};
