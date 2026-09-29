import prisma from "../config/prisma.js";
import { generateSlug } from "../utils/slugify.js";

export const getSubjects = async (filters = {}) => {
  const { page = 1, limit = 20, skip = 0, sort = "createdAt", order = "desc", examId, search } = filters;

  const where = {};
  if (examId) where.examId = examId;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const [subjects, total] = await Promise.all([
    prisma.subject.findMany({ where, skip, take: limit, orderBy: { [sort]: order }, include: { exam: true } }),
    prisma.subject.count({ where }),
  ]);

  return { subjects, total };
};

export const getSubjectById = async (id) => {
  return prisma.subject.findUnique({ where: { id }, include: { exam: true } });
};

export const createSubject = async (data) => {
  return prisma.subject.create({ data });
};

export const updateSubject = async (id, data) => {
  return prisma.subject.update({ where: { id }, data });
};

export const deleteSubject = async (id) => {
  return prisma.subject.delete({ where: { id } });
};

export const findSubjectByExamAndSlug = async (examId, slug) => {
  return prisma.subject.findUnique({ where: { examId_slug: { examId, slug } } });
};
