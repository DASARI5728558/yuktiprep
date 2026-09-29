import prisma from "../config/prisma.js";

export const createSyllabus = async (data) => {
  return prisma.syllabus.create({ data });
};

export const getSyllabusById = async (id) => {
  return prisma.syllabus.findUnique({ where: { id } });
};

export const updateSyllabus = async (id, data) => {
  return prisma.syllabus.update({ where: { id }, data });
};

export const deleteSyllabus = async (id) => {
  return prisma.syllabus.delete({ where: { id } });
};

export const getSyllabi = async (filters = {}) => {
  const { examId, subjectId, status, search, skip = 0, take = 20, sort = "createdAt", order = "desc" } = filters;

  const where = {};
  if (examId) where.examId = examId;
  if (subjectId) where.subjectId = subjectId;
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { content: { contains: search, mode: "insensitive" } },
    ];
  }

  const [syllabi, total] = await Promise.all([
    prisma.syllabus.findMany({ where, skip, take, orderBy: { [sort]: order }, include: { exam: true, subject: true } }),
    prisma.syllabus.count({ where }),
  ]);

  return { syllabi, total };
};
