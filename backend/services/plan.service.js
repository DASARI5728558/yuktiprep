import prisma from "../config/prisma.js";

export const getPlans = async (filters = {}) => {
  const { page = 1, limit = 20, skip = 0, sort = "sortOrder", order = "asc", where = {} } = filters;

  const [plans, total] = await Promise.all([
    prisma.plan.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sort]: order },
      include: {
        features: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
        },
      },
    }),
    prisma.plan.count({ where }),
  ]);

  return [plans, total];
};

export const countPlans = async (where = {}) => {
  return prisma.plan.count({ where });
};

export const getAllPlans = async () => {
  return prisma.plan.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      features: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      },
    },
  });
};

export const getPlanByKey = async (key) => {
  return prisma.plan.findUnique({
    where: { key },
    include: {
      features: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      },
    },
  });
};

export const getPlanById = async (id) => {
  return prisma.plan.findUnique({
    where: { id },
    include: {
      features: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      },
    },
  });
};

export const createPlan = async (data) => {
  return prisma.plan.create({ data });
};

export const updatePlan = async (id, data) => {
  return prisma.plan.update({ where: { id }, data });
};

export const createFeatures = async (planId, features) => {
  const data = features.map((f) => ({
    planId,
    text: f.text,
    sortOrder: f.sortOrder ?? 0,
  }));
  return prisma.planFeature.createMany({ data });
};

export const replaceFeatures = async (planId, features) => {
  await prisma.planFeature.deleteMany({ where: { planId } });
  if (features && features.length > 0) {
    const data = features.map((f) => ({
      planId,
      text: f.text,
      sortOrder: f.sortOrder ?? 0,
    }));
    return prisma.planFeature.createMany({ data });
  }
};

export const reorderPlans = async (plans) => {
  await prisma.$transaction(
    plans.map((plan) =>
      prisma.plan.update({
        where: { id: plan.id },
        data: { sortOrder: plan.sortOrder },
      })
    )
  );
};
