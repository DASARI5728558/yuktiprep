import prisma from "../config/prisma.js";
import { successResponse, errorResponse } from "../src/utils/response.js";
import { getPagination, buildPaginationMeta } from "../src/utils/pagination.js";
import { currentAffairSchema, currentAffairQuerySchema } from "../src/validators/currentAffair.validator.js";
import * as currentAffairService from "../services/currentAffair.service.js";

export const getCurrentAffairs = async (req, res, next) => {
  try {
    const { page, limit, skip, sort, order } = getPagination(req.query);
    const { items, total } = await currentAffairService.getCurrentAffairs({
      examId: req.query.examId,
      subjectId: req.query.subjectId,
      category: req.query.category,
      status: req.query.status,
      search: req.query.search,
      skip,
      take: limit,
      sort,
      order,
    });

    successResponse(res, "Current affairs fetched successfully", items, buildPaginationMeta(total, page, limit));
  } catch (error) {
    next(error);
  }
};

export const getCurrentAffairById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await currentAffairService.getCurrentAffairById(id);

    if (!item) {
      return errorResponse(res, "Current affair not found", [], 404);
    }

    successResponse(res, "Current affair fetched successfully", item);
  } catch (error) {
    next(error);
  }
};

export const createCurrentAffair = async (req, res, next) => {
  try {
    const validated = currentAffairSchema.parse(req.body);
    const item = await currentAffairService.createCurrentAffair(validated);
    successResponse(res, "Current affair created successfully", item, {}, 201);
  } catch (error) {
    if (error.name === "ZodError") {
      return errorResponse(res, "Validation failed", error.errors, 400);
    }
    next(error);
  }
};

export const updateCurrentAffair = async (req, res, next) => {
  try {
    const { id } = req.params;
    const validated = currentAffairSchema.partial().parse(req.body);
    const item = await currentAffairService.updateCurrentAffair(id, validated);
    successResponse(res, "Current affair updated successfully", item);
  } catch (error) {
    if (error.name === "ZodError") {
      return errorResponse(res, "Validation failed", error.errors, 400);
    }
    if (error.code === "P2025") {
      return errorResponse(res, "Current affair not found", [], 404);
    }
    next(error);
  }
};

export const deleteCurrentAffair = async (req, res, next) => {
  try {
    const { id } = req.params;
    await currentAffairService.deleteCurrentAffair(id);
    successResponse(res, "Current affair deleted successfully");
  } catch (error) {
    if (error.code === "P2025") {
      return errorResponse(res, "Current affair not found", [], 404);
    }
    next(error);
  }
};

export const verifyCurrentAffair = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reviewerName } = req.body;
    const item = await currentAffairService.verifyCurrentAffair(id, reviewerName);
    successResponse(res, "Current affair verified successfully", item);
  } catch (error) {
    if (error.code === "P2025") {
      return errorResponse(res, "Current affair not found", [], 404);
    }
    next(error);
  }
};

export const publishCurrentAffair = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await currentAffairService.publishCurrentAffair(id);
    successResponse(res, "Current affair published successfully", item);
  } catch (error) {
    if (error.code === "P2025") {
      return errorResponse(res, "Current affair not found", [], 404);
    }
    next(error);
  }
};

export const archiveCurrentAffair = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await currentAffairService.archiveCurrentAffair(id);
    successResponse(res, "Current affair archived successfully", item);
  } catch (error) {
    if (error.code === "P2025") {
      return errorResponse(res, "Current affair not found", [], 404);
    }
    next(error);
  }
};
