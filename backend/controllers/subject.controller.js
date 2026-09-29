import * as subjectService from "../services/subject.service.js";
import { generateSlug } from "../utils/slugify.js";
import { successResponse, errorResponse } from "../src/utils/response.js";
import { getPagination, buildPaginationMeta } from "../src/utils/pagination.js";
import { subjectSchema } from "../src/validators/subject.validator.js";

export const getSubjects = async (req, res, next) => {
  try {
    const { page, limit, skip, sort, order } = getPagination(req.query);
    const { subjects, total } = await subjectService.getSubjects({
      page,
      limit,
      skip,
      sort,
      order,
      examId: req.query.examId,
      search: req.query.search,
    });

    successResponse(res, "Subjects fetched successfully", subjects, buildPaginationMeta(total, page, limit));
  } catch (error) {
    next(error);
  }
};

export const getSubjectById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const subject = await subjectService.getSubjectById(id);

    if (!subject) {
      return errorResponse(res, "Subject not found", [], 404);
    }

    successResponse(res, "Subject fetched successfully", subject);
  } catch (error) {
    next(error);
  }
};

export const createSubject = async (req, res, next) => {
  try {
    const validated = subjectSchema.parse(req.body);
    const { examId, name, description, isActive } = validated;

    const slug = generateSlug(name);
    const duplicate = await subjectService.findSubjectByExamAndSlug(examId, slug);
    if (duplicate) {
      return errorResponse(res, "A subject with this name already exists for this exam", [], 400);
    }

    const subject = await subjectService.createSubject({
      examId,
      name,
      slug,
      description,
      isActive: isActive ?? true,
    });

    successResponse(res, "Subject created successfully", subject, {}, 201);
  } catch (error) {
    if (error.name === "ZodError") {
      return errorResponse(res, "Validation failed", error.errors, 400);
    }
    if (error.code === "P2003") {
      return errorResponse(res, "Invalid Exam ID", [], 400);
    }
    next(error);
  }
};

export const updateSubject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const validated = subjectSchema.partial().parse(req.body);
    const { examId, name, description, isActive } = validated;

    const existingSubject = await subjectService.getSubjectById(id);
    if (!existingSubject) {
      return errorResponse(res, "Subject not found", [], 404);
    }

    const currentExamId = examId || existingSubject.examId;
    let slug = existingSubject.slug;
    if (name && name !== existingSubject.name) {
      slug = generateSlug(name);
    }

    if ((name && name !== existingSubject.name) || (examId && examId !== existingSubject.examId)) {
      const duplicate = await subjectService.findSubjectByExamAndSlug(currentExamId, slug);
      if (duplicate && duplicate.id !== id) {
        return errorResponse(res, "A subject with this name already exists for this exam", [], 400);
      }
    }

    const updatedSubject = await subjectService.updateSubject(id, {
      examId: currentExamId,
      name: name !== undefined ? name : existingSubject.name,
      slug,
      description: description !== undefined ? description : existingSubject.description,
      isActive: isActive !== undefined ? isActive : existingSubject.isActive,
    });

    successResponse(res, "Subject updated successfully", updatedSubject);
  } catch (error) {
    if (error.name === "ZodError") {
      return errorResponse(res, "Validation failed", error.errors, 400);
    }
    if (error.code === "P2003") {
      return errorResponse(res, "Invalid Exam ID", [], 400);
    }
    next(error);
  }
};

export const deleteSubject = async (req, res, next) => {
  try {
    const { id } = req.params;
    await subjectService.deleteSubject(id);
    successResponse(res, "Subject deleted successfully");
  } catch (error) {
    if (error.code === "P2025") {
      return errorResponse(res, "Subject not found", [], 404);
    }
    next(error);
  }
};
