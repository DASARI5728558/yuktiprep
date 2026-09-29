import * as examService from "../services/exam.service.js";
import { generateSlug } from "../utils/slugify.js";
import { successResponse, errorResponse } from "../src/utils/response.js";
import { getPagination, buildPaginationMeta } from "../src/utils/pagination.js";
import { examSchema } from "../src/validators/exam.validator.js";

export const getExams = async (req, res, next) => {
  try {
    const { page, limit, skip, sort, order } = getPagination(req.query);
    const { exams, total } = await examService.getExams({
      page,
      limit,
      skip,
      sort,
      order,
      search: req.query.search,
    });

    successResponse(res, "Exams fetched successfully", exams, buildPaginationMeta(total, page, limit));
  } catch (error) {
    next(error);
  }
};

export const getExamById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const exam = await examService.getExamById(id);

    if (!exam) {
      return errorResponse(res, "Exam not found", [], 404);
    }

    successResponse(res, "Exam fetched successfully", exam);
  } catch (error) {
    next(error);
  }
};

export const createExam = async (req, res, next) => {
  try {
    const validated = examSchema.parse(req.body);
    const { name, shortDescription, description, logoUrl, isActive, isPublished, sortOrder } = validated;

    const slug = generateSlug(name);
    const duplicate = await examService.findExamBySlug(slug);
    if (duplicate) {
      return errorResponse(res, "An exam with this name/slug already exists", [], 400);
    }

    const exam = await examService.createExam({
      name,
      slug,
      shortDescription,
      description,
      logoUrl,
      isActive: isActive ?? true,
      isPublished: isPublished ?? false,
      sortOrder: sortOrder ?? 0,
    });

    successResponse(res, "Exam created successfully", exam, {}, 201);
  } catch (error) {
    if (error.name === "ZodError") {
      return errorResponse(res, "Validation failed", error.errors, 400);
    }
    next(error);
  }
};

export const updateExam = async (req, res, next) => {
  try {
    const { id } = req.params;
    const validated = examSchema.partial().parse(req.body);
    const { name, shortDescription, description, logoUrl, isActive, isPublished, sortOrder } = validated;

    const existingExam = await examService.getExamById(id);
    if (!existingExam) {
      return errorResponse(res, "Exam not found", [], 404);
    }

    let slug = existingExam.slug;
    if (name && name !== existingExam.name) {
      slug = generateSlug(name);
      const duplicate = await examService.findExamBySlug(slug);
      if (duplicate && duplicate.id !== id) {
        return errorResponse(res, "An exam with this name/slug already exists", [], 400);
      }
    }

    const updatedExam = await examService.updateExam(id, {
      name: name !== undefined ? name : existingExam.name,
      slug,
      shortDescription: shortDescription !== undefined ? shortDescription : existingExam.shortDescription,
      description: description !== undefined ? description : existingExam.description,
      logoUrl: logoUrl !== undefined ? logoUrl : existingExam.logoUrl,
      isActive: isActive !== undefined ? isActive : existingExam.isActive,
      isPublished: isPublished !== undefined ? isPublished : existingExam.isPublished,
      sortOrder: sortOrder !== undefined ? sortOrder : existingExam.sortOrder,
    });

    successResponse(res, "Exam updated successfully", updatedExam);
  } catch (error) {
    if (error.name === "ZodError") {
      return errorResponse(res, "Validation failed", error.errors, 400);
    }
    next(error);
  }
};

export const deleteExam = async (req, res, next) => {
  try {
    const { id } = req.params;
    await examService.deleteExam(id);
    successResponse(res, "Exam deleted successfully");
  } catch (error) {
    if (error.code === "P2025") {
      return errorResponse(res, "Exam not found", [], 404);
    }
    next(error);
  }
};
