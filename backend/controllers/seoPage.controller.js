import prisma from "../config/prisma.js";
import { successResponse, errorResponse } from "../src/utils/response.js";
import { getPagination, buildPaginationMeta } from "../src/utils/pagination.js";
import { seoPageSchema, seoPageQuerySchema } from "../src/validators/seoPage.validator.js";
import * as seoPageService from "../services/seoPage.service.js";

export const getSeoPages = async (req, res, next) => {
  try {
    const { page, limit, skip, sort, order } = getPagination(req.query);
    const { pages, total } = await seoPageService.getSeoPages({
      pageType: req.query.pageType,
      status: req.query.status,
      search: req.query.search,
      skip,
      take: limit,
      sort,
      order,
    });

    successResponse(res, "SEO pages fetched successfully", pages, buildPaginationMeta(total, page, limit));
  } catch (error) {
    next(error);
  }
};

export const getSeoPageById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const page = await seoPageService.getSeoPageById(id);

    if (!page) {
      return errorResponse(res, "SEO page not found", [], 404);
    }

    successResponse(res, "SEO page fetched successfully", page);
  } catch (error) {
    next(error);
  }
};

export const createSeoPage = async (req, res, next) => {
  try {
    const validated = seoPageSchema.parse(req.body);
    const page = await seoPageService.createSeoPage(validated);
    successResponse(res, "SEO page created successfully", page, {}, 201);
  } catch (error) {
    if (error.name === "ZodError") {
      return errorResponse(res, "Validation failed", error.errors, 400);
    }
    next(error);
  }
};

export const updateSeoPage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const validated = seoPageSchema.partial().parse(req.body);
    const page = await seoPageService.updateSeoPage(id, validated);
    successResponse(res, "SEO page updated successfully", page);
  } catch (error) {
    if (error.name === "ZodError") {
      return errorResponse(res, "Validation failed", error.errors, 400);
    }
    if (error.code === "P2025") {
      return errorResponse(res, "SEO page not found", [], 404);
    }
    next(error);
  }
};

export const deleteSeoPage = async (req, res, next) => {
  try {
    const { id } = req.params;
    await seoPageService.deleteSeoPage(id);
    successResponse(res, "SEO page deleted successfully");
  } catch (error) {
    if (error.code === "P2025") {
      return errorResponse(res, "SEO page not found", [], 404);
    }
    next(error);
  }
};
