import prisma from "../config/prisma.js";

export const createCurrentAffair = async (data) => {
  return prisma.currentAffair.create({ data });
};

export const getCurrentAffairById = async (id) => {
  return prisma.currentAffair.findUnique({ where: { id } });
};

export const updateCurrentAffair = async (id, data) => {
  return prisma.currentAffair.update({ where: { id }, data });
};

export const deleteCurrentAffair = async (id) => {
  return prisma.currentAffair.delete({ where: { id } });
};

export const getCurrentAffairs = async (filters = {}) => {
  const { examId, subjectId, category, status, search, skip = 0, take = 20, sort = "publishedAt", order = "desc" } = filters;

  const where = {};
  if (examId) where.examId = examId;
  if (subjectId) where.subjectId = subjectId;
  if (category) where.category = category;
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { content: { contains: search, mode: "insensitive" } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.currentAffair.findMany({ where, skip, take, orderBy: { [sort]: order }, include: { exam: true, subject: true } }),
    prisma.currentAffair.count({ where }),
  ]);

  return { items, total };
};

export const verifyCurrentAffair = async (id, reviewerName) => {
  return prisma.currentAffair.update({
    where: { id },
    data: { status: "VERIFIED", reviewerName, lastVerifiedAt: new Date() },
  });
};

export const publishCurrentAffair = async (id) => {
  return prisma.currentAffair.update({
    where: { id },
    data: { status: "PUBLISHED", publishedAt: new Date() },
  });
};

export const archiveCurrentAffair = async (id) => {
  return prisma.currentAffair.update({
    where: { id },
    data: { status: "ARCHIVED" },
  });
};
