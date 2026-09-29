import prisma from "../config/prisma.js";

export const createPyq = async (data) => {
  return prisma.pYQ.create({ data });
};

export const getPyqById = async (id) => {
  return prisma.pYQ.findUnique({ where: { id } });
};

export const updatePyq = async (id, data) => {
  return prisma.pYQ.update({ where: { id }, data });
};

export const deletePyq = async (id) => {
  return prisma.pYQ.delete({ where: { id } });
};

export const getPyqs = async (filters = {}) => {
  const { examId, subjectId, topicId, year, difficulty, search, skip = 0, take = 20, sort = "createdAt", order = "desc" } = filters;

  const where = {};
  if (examId) where.examId = examId;
  if (subjectId) where.subjectId = subjectId;
  if (topicId) where.topicId = topicId;
  if (year) where.year = year;
  if (difficulty) where.difficulty = difficulty;
  if (search) {
    where.OR = [
      { question: { contains: search, mode: "insensitive" } },
      { explanation: { contains: search, mode: "insensitive" } },
    ];
  }

  const [pyqs, total] = await Promise.all([
    prisma.pYQ.findMany({ where, skip, take, orderBy: { [sort]: order }, include: { exam: true, subject: true, topic: true } }),
    prisma.pYQ.count({ where }),
  ]);

  return { pyqs, total };
};

export const bulkCreatePyqs = async (pyqs) => {
  return prisma.pYQ.createMany({ data: pyqs });
};

export const bulkDeletePyqs = async (ids) => {
  return prisma.pYQ.deleteMany({ where: { id: { in: ids } } });
};
