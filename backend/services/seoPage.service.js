import prisma from "../config/prisma.js";

export const createSeoPage = async (data) => {
  return prisma.seoPage.create({ data });
};

export const getSeoPageById = async (id) => {
  return prisma.seoPage.findUnique({ where: { id } });
};

export const updateSeoPage = async (id, data) => {
  return prisma.seoPage.update({ where: { id }, data });
};

export const deleteSeoPage = async (id) => {
  return prisma.seoPage.delete({ where: { id } });
};

export const getSeoPages = async (filters = {}) => {
  const { pageType, status, search, skip = 0, take = 20, sort = "createdAt", order = "desc" } = filters;

  const where = {};
  if (pageType) where.pageType = pageType;
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { slug: { contains: search, mode: "insensitive" } },
    ];
  }

  const [pages, total] = await Promise.all([
    prisma.seoPage.findMany({ where, skip, take, orderBy: { [sort]: order } }),
    prisma.seoPage.count({ where }),
  ]);

  return { pages, total };
};

export const getSeoPageBySlug = async (slug) => {
  return prisma.seoPage.findUnique({ where: { slug } });
};
