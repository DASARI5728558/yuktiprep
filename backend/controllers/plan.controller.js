import * as planService from "../services/plan.service.js";
import { successResponse, errorResponse } from "../src/utils/response.js";
import { getPagination, buildPaginationMeta } from "../src/utils/pagination.js";
import { planSchema, planQuerySchema } from "../src/validators/plan.validator.js";

export const getPlans = async (req, res, next) => {
  try {
    const { page, limit, skip, sort, order } = getPagination(req.query);
    const active = req.query.active;

    const where = {};
    if (active !== undefined) {
      where.isActive = active === "true";
    }

    const [plansResult, total] = await Promise.all([
      planService.getPlans({ page, limit, skip, sort, order, where }),
      planService.countPlans(where),
    ]);

    const [plans] = plansResult;

    successResponse(res, "Plans fetched successfully", plans, buildPaginationMeta(total, page, limit));
  } catch (error) {
    next(error);
  }
};

export const getPlanByKey = async (req, res, next) => {
  try {
    const { key } = req.params;
    const plan = await planService.getPlanByKey(key);

    if (!plan) {
      return errorResponse(res, "Plan not found", [], 404);
    }

    successResponse(res, "Plan fetched successfully", plan);
  } catch (error) {
    next(error);
  }
};

export const getPlanById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const plan = await planService.getPlanById(id);

    if (!plan) {
      return errorResponse(res, "Plan not found", [], 404);
    }

    successResponse(res, "Plan fetched successfully", plan);
  } catch (error) {
    next(error);
  }
};

export const createPlan = async (req, res, next) => {
  try {
    const validated = planSchema.parse(req.body);

    const existing = await planService.getPlanByKey(validated.key);
    if (existing) {
      return errorResponse(res, "A plan with this key already exists", [], 400);
    }

    const { features, ...planData } = validated;
    const plan = await planService.createPlan(planData);

    if (features && features.length > 0) {
      await planService.createFeatures(plan.id, features);
    }

    const createdPlan = await planService.getPlanById(plan.id);
    successResponse(res, "Plan created successfully", createdPlan, {}, 201);
  } catch (error) {
    if (error.name === "ZodError") {
      return errorResponse(res, "Validation failed", error.errors, 400);
    }
    next(error);
  }
};

export const updatePlan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const validated = planSchema.partial().parse(req.body);

    const existing = await planService.getPlanById(id);
    if (!existing) {
      return errorResponse(res, "Plan not found", [], 404);
    }

    if (validated.key && validated.key !== existing.key) {
      const keyExists = await planService.getPlanByKey(validated.key);
      if (keyExists) {
        return errorResponse(res, "A plan with this key already exists", [], 400);
      }
    }

    const { features, ...planData } = validated;
    const updatedPlan = await planService.updatePlan(id, planData);

    if (features !== undefined) {
      await planService.replaceFeatures(id, features);
    }

    const plan = await planService.getPlanById(id);
    successResponse(res, "Plan updated successfully", plan);
  } catch (error) {
    if (error.name === "ZodError") {
      return errorResponse(res, "Validation failed", error.errors, 400);
    }
    next(error);
  }
};

export const patchPlanStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return errorResponse(res, "isActive must be a boolean", [], 400);
    }

    const existing = await planService.getPlanById(id);
    if (!existing) {
      return errorResponse(res, "Plan not found", [], 404);
    }

    const plan = await planService.updatePlan(id, { isActive });
    successResponse(res, `Plan ${isActive ? "activated" : "deactivated"} successfully`, plan);
  } catch (error) {
    next(error);
  }
};

export const reorderPlans = async (req, res, next) => {
  try {
    const { plans } = req.body;

    if (!Array.isArray(plans)) {
      return errorResponse(res, "plans must be an array", [], 400);
    }

    await planService.reorderPlans(plans);
    const updatedPlans = await planService.getAllPlans();

    successResponse(res, "Plans reordered successfully", updatedPlans);
  } catch (error) {
    next(error);
  }
};
