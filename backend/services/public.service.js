import prisma from "../config/prisma.js";

export const getPublicExams = async () => {
  return prisma.exam.findMany({
    where: { isActive: true, isPublished: true },
    orderBy: { sortOrder: "asc" },
  });
};

export const getPublicTargetExams = async () => {
  return prisma.targetExamTitle.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
};

export const getPublicExamBySlug = async (slug) => {
  return prisma.exam.findFirst({
    where: { slug, isActive: true, isPublished: true },
  });
};

export const getPublicSubjects = async (examSlug) => {
  const exam = await prisma.exam.findFirst({ where: { slug: examSlug, isActive: true, isPublished: true } });
  if (!exam) return [];
  return prisma.subject.findMany({ where: { examId: exam.id, isActive: true } });
};

export const getPublicSubject = async (examSlug, subjectSlug) => {
  const exam = await prisma.exam.findFirst({ where: { slug: examSlug, isActive: true, isPublished: true } });
  if (!exam) return null;
  return prisma.subject.findFirst({ where: { examId: exam.id, slug: subjectSlug, isActive: true } });
};

export const getPublicTopics = async (examSlug, subjectSlug) => {
  const subject = await getPublicSubject(examSlug, subjectSlug);
  if (!subject) return [];
  return prisma.topic.findMany({ where: { subjectId: subject.id, isActive: true } });
};

export const getPublicTopic = async (examSlug, subjectSlug, topicSlug) => {
  const subject = await getPublicSubject(examSlug, subjectSlug);
  if (!subject) return null;
  return prisma.topic.findFirst({ where: { subjectId: subject.id, slug: topicSlug, isActive: true } });
};

export const getPublicSyllabus = async (examSlug) => {
  const exam = await prisma.exam.findFirst({ where: { slug: examSlug, isActive: true, isPublished: true } });
  if (!exam) return [];
  return prisma.syllabus.findMany({ where: { examId: exam.id, status: "PUBLISHED" }, include: { subject: true } });
};

export const getPublicPyqs = async (examSlug) => {
  const exam = await prisma.exam.findFirst({ where: { slug: examSlug, isActive: true, isPublished: true } });
  if (!exam) return [];
  return prisma.pYQ.findMany({ where: { examId: exam.id, isPublished: true }, include: { subject: true, topic: true } });
};

export const getPublicPyq = async (examSlug, id) => {
  const exam = await prisma.exam.findFirst({ where: { slug: examSlug, isActive: true, isPublished: true } });
  if (!exam) return null;
  return prisma.pYQ.findFirst({ where: { id, examId: exam.id, isPublished: true } });
};

export const getPublicCurrentAffairs = async (filters = {}) => {
  const { examSlug, search, page = 1, limit = 20 } = filters;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where = { status: "PUBLISHED" };
  if (examSlug) {
    const exam = await prisma.exam.findFirst({ where: { slug: examSlug, isActive: true, isPublished: true } });
    if (!exam) return { items: [], total: 0 };
    where.examId = exam.id;
  }
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { content: { contains: search, mode: "insensitive" } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.currentAffair.findMany({ where, skip, take: parseInt(limit), orderBy: { publishedAt: "desc" }, include: { exam: true, subject: true } }),
    prisma.currentAffair.count({ where }),
  ]);

  return { items, total };
};

export const getPublicCurrentAffairBySlug = async (slug) => {
  return prisma.currentAffair.findFirst({ where: { slug, status: "PUBLISHED" } });
};

export const getPublicSeoPageBySlug = async (slug) => {
  return prisma.seoPage.findFirst({ where: { slug, status: "PUBLISHED" } });
};

export const getSitemapData = async () => {
  const [exams, syllabus, currentAffairs, seoPages] = await Promise.all([
    prisma.exam.findMany({ where: { isActive: true, isPublished: true }, select: { slug: true, updatedAt: true } }),
    prisma.syllabus.findMany({ where: { status: "PUBLISHED" }, select: { examId: true, slug: true, updatedAt: true } }),
    prisma.currentAffair.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } }),
    prisma.seoPage.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } }),
  ]);

  const examSlugs = exams.map((e) => ({ slug: `exams/${e.slug}`, updatedAt: e.updatedAt }));
  const syllabusSlugs = syllabus.map((s) => ({ slug: `exams/${s.slug}/syllabus`, updatedAt: s.updatedAt }));
  const caSlugs = currentAffairs.map((c) => ({ slug: `current-affairs/${c.slug}`, updatedAt: c.updatedAt }));
  const pageSlugs = seoPages.map((p) => ({ slug: `pages/${p.slug}`, updatedAt: p.updatedAt }));

  return [...examSlugs, ...syllabusSlugs, ...caSlugs, ...pageSlugs];
};
