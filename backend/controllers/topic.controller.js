import * as topicService from "../services/topic.service.js";
import { generateSlug } from "../utils/slugify.js";
import { successResponse, errorResponse } from "../src/utils/response.js";
import { getPagination, buildPaginationMeta } from "../src/utils/pagination.js";
import { topicSchema } from "../src/validators/topic.validator.js";

export const getTopics = async (req, res, next) => {
  try {
    const { page, limit, skip, sort, order } = getPagination(req.query);
    const { topics, total } = await topicService.getTopics({
      page,
      limit,
      skip,
      sort,
      order,
      subjectId: req.query.subjectId,
      search: req.query.search,
    });

    successResponse(res, "Topics fetched successfully", topics, buildPaginationMeta(total, page, limit));
  } catch (error) {
    next(error);
  }
};

export const getTopicById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const topic = await topicService.getTopicById(id);

    if (!topic) {
      return errorResponse(res, "Topic not found", [], 404);
    }

    successResponse(res, "Topic fetched successfully", topic);
  } catch (error) {
    next(error);
  }
};

export const createTopic = async (req, res, next) => {
  try {
    const validated = topicSchema.parse(req.body);
    const { subjectId, name, description, isActive } = validated;

    const slug = generateSlug(name);
    const duplicate = await topicService.findTopicBySubjectAndSlug(subjectId, slug);
    if (duplicate) {
      return errorResponse(res, "A topic with this name already exists for this subject", [], 400);
    }

    const topic = await topicService.createTopic({
      subjectId,
      name,
      slug,
      description,
      isActive: isActive ?? true,
    });

    successResponse(res, "Topic created successfully", topic, {}, 201);
  } catch (error) {
    if (error.name === "ZodError") {
      return errorResponse(res, "Validation failed", error.errors, 400);
    }
    if (error.code === "P2003") {
      return errorResponse(res, "Invalid Subject ID", [], 400);
    }
    next(error);
  }
};

export const updateTopic = async (req, res, next) => {
  try {
    const { id } = req.params;
    const validated = topicSchema.partial().parse(req.body);
    const { subjectId, name, description, isActive } = validated;

    const existingTopic = await topicService.getTopicById(id);
    if (!existingTopic) {
      return errorResponse(res, "Topic not found", [], 404);
    }

    const currentSubjectId = subjectId || existingTopic.subjectId;
    let slug = existingTopic.slug;
    if (name && name !== existingTopic.name) {
      slug = generateSlug(name);
    }

    if ((name && name !== existingTopic.name) || (subjectId && subjectId !== existingTopic.subjectId)) {
      const duplicate = await topicService.findTopicBySubjectAndSlug(currentSubjectId, slug);
      if (duplicate && duplicate.id !== id) {
        return errorResponse(res, "A topic with this name already exists for this subject", [], 400);
      }
    }

    const updatedTopic = await topicService.updateTopic(id, {
      subjectId: currentSubjectId,
      name: name !== undefined ? name : existingTopic.name,
      slug,
      description: description !== undefined ? description : existingTopic.description,
      isActive: isActive !== undefined ? isActive : existingTopic.isActive,
    });

    successResponse(res, "Topic updated successfully", updatedTopic);
  } catch (error) {
    if (error.name === "ZodError") {
      return errorResponse(res, "Validation failed", error.errors, 400);
    }
    if (error.code === "P2003") {
      return errorResponse(res, "Invalid Subject ID", [], 400);
    }
    next(error);
  }
};

export const deleteTopic = async (req, res, next) => {
  try {
    const { id } = req.params;
    await topicService.deleteTopic(id);
    successResponse(res, "Topic deleted successfully");
  } catch (error) {
    if (error.code === "P2025") {
      return errorResponse(res, "Topic not found", [], 404);
    }
    next(error);
  }
};
