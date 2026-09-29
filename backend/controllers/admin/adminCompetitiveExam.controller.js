import prisma from "../../config/prisma.js";
import { successResponse, errorResponse } from "../../src/utils/response.js";
import {
  runScraperForSource,
  runAllEnabledScrapers,
} from "../../services/competitiveExamScraper.service.js";

/**
 * Admin Dashboard & Stats
 */
export const getAdminExamStats = async (req, res, next) => {
  try {
    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));

    const [
      totalExams,
      upcomingExams,
      activeSources,
      failedSources,
      changedToday,
      latestScrape,
    ] = await Promise.all([
      prisma.competitiveExam.count(),
      prisma.competitiveExam.count({
        where: {
          OR: [
            { examDate: { gte: new Date() } },
            { status: "upcoming" },
            { examDateText: { contains: "2026" } },
          ],
        },
      }),
      prisma.examSource.count({ where: { enabled: true } }),
      prisma.examSource.count({
        where: {
          enabled: true,
          lastFailureAt: { gte: prisma.examSource.fields.lastSuccessAt },
        },
      }),
      prisma.examChangeLog.count({
        where: { changedAt: { gte: startOfToday } },
      }),
      prisma.scrapeLog.findFirst({
        orderBy: { startedAt: "desc" },
      }),
    ]);

    return successResponse(res, "Admin exam stats retrieved", {
      totalExams,
      upcomingExams,
      activeSources,
      failedSources,
      changedToday,
      lastScrape: latestScrape?.startedAt || null,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Admin Exam Management (CRUD)
 */
export const getAdminCompetitiveExams = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 25,
      search,
      organization,
      state,
      category,
      status,
    } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 25;
    const skip = (pageNum - 1) * limitNum;

    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { organization: { contains: search, mode: "insensitive" } },
      ];
    }
    if (organization && organization !== "All") where.organization = organization;
    if (state && state !== "All") where.state = state;
    if (category && category !== "All") where.category = category;
    if (status && status !== "All") where.status = status;

    const [exams, total] = await Promise.all([
      prisma.competitiveExam.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: "desc" },
        include: {
          source: {
            select: { organization: true, scraperType: true },
          },
        },
      }),
      prisma.competitiveExam.count({ where }),
    ]);

    return res.status(200).json({
      success: true,
      page: pageNum,
      limit: limitNum,
      total,
      data: exams,
    });
  } catch (err) {
    next(err);
  }
};

export const updateAdminCompetitiveExam = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    delete updateData.id;

    if (updateData.examDate) updateData.examDate = new Date(updateData.examDate);
    if (updateData.notificationDate) updateData.notificationDate = new Date(updateData.notificationDate);
    if (updateData.applicationStart) updateData.applicationStart = new Date(updateData.applicationStart);
    if (updateData.applicationEnd) updateData.applicationEnd = new Date(updateData.applicationEnd);

    const updated = await prisma.competitiveExam.update({
      where: { id },
      data: updateData,
    });

    return successResponse(res, "Exam updated successfully", updated);
  } catch (err) {
    next(err);
  }
};

export const deleteAdminCompetitiveExam = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.competitiveExam.delete({ where: { id } });
    return successResponse(res, "Exam deleted successfully");
  } catch (err) {
    next(err);
  }
};

/**
 * Admin Source Management
 */
export const getAdminExamSources = async (req, res, next) => {
  try {
    const sources = await prisma.examSource.findMany({
      orderBy: [{ organization: "asc" }],
      include: {
        _count: {
          select: { competitiveExams: true },
        },
      },
    });

    return successResponse(res, "Exam sources retrieved", sources);
  } catch (err) {
    next(err);
  }
};

export const updateAdminExamSource = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { url, calendarUrl, scraperType, scraperAdapter, enabled } = req.body;

    const source = await prisma.examSource.findUnique({ where: { id } });
    if (!source) return errorResponse(res, "Source not found", [], 404);

    // Auto-detect if new URL ends in .pdf
    let finalScraperType = scraperType || source.scraperType;
    if (calendarUrl && (calendarUrl.toLowerCase().endsWith(".pdf") || calendarUrl.toLowerCase().includes(".pdf?"))) {
      finalScraperType = "pdf";
    }

    const updated = await prisma.examSource.update({
      where: { id },
      data: {
        url: url !== undefined ? url : source.url,
        calendarUrl: calendarUrl !== undefined ? calendarUrl : source.calendarUrl,
        scraperType: finalScraperType,
        scraperAdapter: scraperAdapter !== undefined ? scraperAdapter : source.scraperAdapter,
        enabled: enabled !== undefined ? enabled : source.enabled,
      },
    });

    return successResponse(res, "Source configuration updated successfully", updated);
  } catch (err) {
    next(err);
  }
};

export const toggleAdminExamSource = async (req, res, next) => {
  try {
    const { id } = req.params;
    const source = await prisma.examSource.findUnique({ where: { id } });
    if (!source) return errorResponse(res, "Source not found", [], 404);

    const updated = await prisma.examSource.update({
      where: { id },
      data: { enabled: !source.enabled },
    });

    return successResponse(res, `Source ${updated.enabled ? "enabled" : "disabled"} successfully`, updated);
  } catch (err) {
    next(err);
  }
};

export const triggerSourceScrape = async (req, res, next) => {
  try {
    const { id } = req.params;
    const source = await prisma.examSource.findUnique({ where: { id } });
    if (!source) return errorResponse(res, "Source not found", [], 404);

    const result = await runScraperForSource(source);
    return successResponse(res, `Scrape job finished for ${source.organization}`, result);
  } catch (err) {
    next(err);
  }
};

export const triggerAllScrapers = async (req, res, next) => {
  try {
    // Run async in background so HTTP response is immediate
    runAllEnabledScrapers().catch((err) => console.error("Admin triggered sync error:", err));

    return successResponse(res, "All enabled scrapers execution triggered in background");
  } catch (err) {
    next(err);
  }
};

/**
 * Scrape Logs & Change Logs
 */
export const getAdminScrapeLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 25 } = req.query;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 25;
    const skip = (pageNum - 1) * limitNum;

    const [logs, total] = await Promise.all([
      prisma.scrapeLog.findMany({
        skip,
        take: limitNum,
        orderBy: { startedAt: "desc" },
        include: {
          source: {
            select: { organization: true, scraperAdapter: true },
          },
        },
      }),
      prisma.scrapeLog.count(),
    ]);

    return res.status(200).json({
      success: true,
      page: pageNum,
      limit: limitNum,
      total,
      data: logs,
    });
  } catch (err) {
    next(err);
  }
};

export const getAdminChangeLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 25 } = req.query;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 25;
    const skip = (pageNum - 1) * limitNum;

    const [changes, total] = await Promise.all([
      prisma.examChangeLog.findMany({
        skip,
        take: limitNum,
        orderBy: { changedAt: "desc" },
      }),
      prisma.examChangeLog.count(),
    ]);

    return res.status(200).json({
      success: true,
      page: pageNum,
      limit: limitNum,
      total,
      data: changes,
    });
  } catch (err) {
    next(err);
  }
};
