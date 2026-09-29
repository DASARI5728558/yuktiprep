import prisma from "../config/prisma.js";
import { generateSlug } from "../utils/slugify.js";

export const getTopics = async (filters = {}) => {
  const { page = 1, limit = 20, skip = 0, sort = "createdAt", order = "desc", subjectId, search } = filters;

  const where = {};
  if (subjectId) where.subjectId = subjectId;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const [topics, total] = await Promise.all([
    prisma.topic.findMany({ where, skip, take: limit, orderBy: { [sort]: order }, include: { subject: true } }),
    prisma.topic.count({ where }),
  ]);

  return { topics, total };
};

export const getTopicById = async (id) => {
  return prisma.topic.findUnique({ where: { id }, include: { subject: true } });
};

export const createTopic = async (data) => {
  return prisma.topic.create({ data });
};

export const updateTopic = async (id, data) => {
  return prisma.topic.update({ where: { id }, data });
};

export const deleteTopic = async (id) => {
  return prisma.topic.delete({ where: { id } });
};

export const findTopicBySubjectAndSlug = async (subjectId, slug) => {
  return prisma.topic.findUnique({ where: { subjectId_slug: { subjectId, slug } } });
};
