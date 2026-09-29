import prisma from "../config/prisma.js";
import { generateSlug } from "../utils/slugify.js";

export const getExams = async (filters = {}) => {
  const { page = 1, limit = 20, skip = 0, sort = "createdAt", order = "desc", search } = filters;

  const where = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const [exams, total] = await Promise.all([
    prisma.exam.findMany({ where, skip, take: limit, orderBy: { [sort]: order } }),
    prisma.exam.count({ where }),
  ]);

  return { exams, total };
};

export const getExamById = async (id) => {
  return prisma.exam.findUnique({ where: { id } });
};

export const createExam = async (data) => {
  return prisma.exam.create({ data });
};

export const updateExam = async (id, data) => {
  return prisma.exam.update({ where: { id }, data });
};

export const deleteExam = async (id) => {
  return prisma.exam.delete({ where: { id } });
};

export const findExamBySlug = async (slug) => {
  return prisma.exam.findUnique({ where: { slug } });
};
