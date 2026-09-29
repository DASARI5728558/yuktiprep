import express from "express";
import {
  generateDaily,
  generateWeekly,
  generateMonthly,
  queryItems,
  monthRange,
  syncSources,
  healthReport,
  errorsReport,
} from "../src/current-affairs/pipeline.js";
import {
  DAILY_SCORE,
  WEEKLY_SCORE,
  MONTHLY_SCORE,
} from "../src/current-affairs/config.js";
import prisma from "../config/prisma.js";
import { adminAuth } from "../middleware/adminAuth.js";
import { userAuthMiddleware, optionalUserAuthMiddleware } from "../src/middleware/userAuth.middleware.js";
import { requiredUser } from "../src/middleware/role.middleware.js";
import { translateTexts } from "../services/azureTranslator.service.js";
import { cacheMiddleware } from "../config/redis.js";
import axios from "axios";
import { env } from "../src/config/env.js";
import { broadcastCurrentAffairsToWhatsApp } from "../src/services/whatsappBroadcast.service.js";

const router = express.Router();

const getLanguageCode = (req) => {
  const normalize = (code) => (code ? code.split("-")[0].toLowerCase() : code);
  if (req.headers["x-language"]) return normalize(req.headers["x-language"]);
  if (!req.user) return "en";
  return normalize(req.user.language) || "en";
};

const translateCurrentAffairItems = async (items, targetLanguageCode) => {
  const normalizedTarget = targetLanguageCode
    ? targetLanguageCode.split("-")[0].toLowerCase()
    : targetLanguageCode;

  if (!items || !normalizedTarget || normalizedTarget === "en") {
    return items;
  }

  try {
    const itemIds = items.map((item) => item.id);
    const translations = await prisma.itemTranslation.findMany({
      where: {
        itemId: { in: itemIds },
        language: normalizedTarget,
        status: "COMPLETED",
      },
    });

    const translationMap = new Map();
    translations.forEach((t) => translationMap.set(t.itemId, t));

    return items.map((item) => {
      const t = translationMap.get(item.id);
      return {
        ...item,
        title: t?.title || item.title,
        summary: t?.summary || item.summary,
        translationStatus: t ? "COMPLETED" : "ORIGINAL_FALLBACK",
        language: normalizedTarget,
      };
    });
  } catch (error) {
    console.error("Failed to fetch translations from DB:", error);
    return items;
  }
};

const translateQuestions = async (questions, targetLanguageCode) => {
  const normalizedTarget = targetLanguageCode
    ? targetLanguageCode.split("-")[0].toLowerCase()
    : targetLanguageCode;

  if (!questions || !normalizedTarget || normalizedTarget === "en") {
    return questions;
  }

  try {
    const questionTexts = questions.map((q) => q.question).filter(Boolean);
    const answerBases = questions.map((q) => q.answer_basis).filter(Boolean);
    const answers = questions.map((q) => q.answer).filter(Boolean);

    const allOptionTexts = [];
    const optionIndexMap = [];
    questions.forEach((q) => {
      if (Array.isArray(q.options)) {
        q.options.forEach((opt) => {
          allOptionTexts.push(opt);
          optionIndexMap.push(questions.indexOf(q));
        });
      }
    });

    // Run sequentially to prevent Azure Translator from receiving too many parallel requests
    const translatedQuestions = await translateTexts(
      questionTexts,
      targetLanguageCode,
    );
    const translatedAnswerBases = await translateTexts(
      answerBases,
      targetLanguageCode,
    );
    const translatedAnswers = await translateTexts(answers, targetLanguageCode);
    const translatedOptions = await translateTexts(
      allOptionTexts,
      targetLanguageCode,
    );

    let optionCounter = 0;
    return questions.map((q, index) => {
      const translatedOptions = Array.isArray(q.options)
        ? q.options.map((opt) => translatedOptions[optionCounter++] || opt)
        : q.options;

      return {
        ...q,
        question: translatedQuestions[index] || q.question,
        answer_basis: translatedAnswerBases[index] || q.answer_basis,
        answer: translatedAnswers[index] || q.answer,
        options: translatedOptions,
      };
    });
  } catch (error) {
    console.error("Failed to translate questions:", error);
    return questions;
  }
};

router.post("/sync", adminAuth, async (req, res) => {
  try {
    const stats = await syncSources();
    res.json({ status: "success", stats });
  } catch (e) {
    res.status(500).json({ status: "error", detail: String(e) });
  }
});

router.post("/send-whatsapp", adminAuth, async (req, res) => {
  try {
    const result = await broadcastCurrentAffairsToWhatsApp();
    if (result.status === "error") {
      return res.status(400).json(result);
    }
    res.json(result);
  } catch (e) {
    console.error("Error in /send-whatsapp:", e);
    res.status(500).json({ status: "error", detail: String(e) });
  }
});

router.get("/kpis", adminAuth, async (req, res) => {
  try {
    const totalItems =
      await prisma.$queryRaw`SELECT COUNT(*) AS count FROM items`;
    const avgScore =
      await prisma.$queryRaw`SELECT AVG(score) AS avg FROM items`;
    const runs =
      await prisma.$queryRaw`SELECT COUNT(*) AS total, SUM(CAST(success AS INT)) AS successful FROM source_runs`;

    const totalRuns = Number(runs[0]?.total || 0);
    const successfulRuns = Number(runs[0]?.successful || 0);
    const successRate =
      totalRuns > 0 ? Math.round((100.0 * successfulRuns) / totalRuns) : 100;

    const deadLettersCount =
      await prisma.$queryRaw`SELECT COUNT(*) AS count FROM dead_letters`;

    res.json({
      total_items: Number(totalItems[0]?.count || 0),
      avg_score: Math.round(Number(avgScore[0]?.avg || 0), 1),
      success_rate: successRate,
      dead_letters_count: Number(deadLettersCount[0]?.count || 0),
    });
  } catch (e) {
    res.status(500).json({ status: "error", detail: String(e) });
  }
});

router.get(
  "/daily",
  optionalUserAuthMiddleware,
  async (req, res) => {
    try {
      const now = new Date();
      const languageCode = getLanguageCode(req);
      const cacheKey = `current-affairs:daily:${languageCode}`;

      const data = await cacheMiddleware(cacheKey, 300, async () => {
        let rows = await queryItems(
          new Date(now.getTime() - 24 * 60 * 60 * 1000),
          new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
          DAILY_SCORE,
          15,
        );
        // If no daily items found for today, fallback to most recent top items
        if (!rows || rows.length === 0) {
          rows = await prisma.$queryRaw`
            SELECT * FROM items ORDER BY published_at DESC LIMIT 15
          `;
        }
        return rows.map((r) => ({
          ...r,
          score: Number(r.score),
          source_confidence: Number(r.source_confidence),
        }));
      });

      const translatedData = await translateCurrentAffairItems(
        data,
        languageCode,
      );
      res.json(translatedData);
    } catch (e) {
      res.status(500).json({ status: "error", detail: String(e) });
    }
  },
);

router.get(
  "/weekly",
  optionalUserAuthMiddleware,
  async (req, res) => {
    try {
      const now = new Date();
      const languageCode = getLanguageCode(req);
      const cacheKey = `current-affairs:weekly:${languageCode}`;

      const data = await cacheMiddleware(cacheKey, 600, async () => {
        let rows = await queryItems(
          new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
          new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
          WEEKLY_SCORE,
          80,
        );
        if (!rows || rows.length === 0) {
          rows = await prisma.$queryRaw`
            SELECT * FROM items ORDER BY published_at DESC LIMIT 30
          `;
        }
        return rows.map((r) => ({
          ...r,
          score: Number(r.score),
          source_confidence: Number(r.source_confidence),
        }));
      });

      const translatedData = await translateCurrentAffairItems(
        data,
        languageCode,
      );
      res.json(translatedData);
    } catch (e) {
      res.status(500).json({ status: "error", detail: String(e) });
    }
  },
);

router.get(
  "/monthly",
  optionalUserAuthMiddleware,
  async (req, res) => {
    try {
      const [start] = monthRange();
      const languageCode = getLanguageCode(req);
      const cacheKey = `current-affairs:monthly:${languageCode}`;

      const data = await cacheMiddleware(cacheKey, 1800, async () => {
        let rows = await queryItems(
          start,
          new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000),
          MONTHLY_SCORE,
          400,
        );
        if (!rows || rows.length === 0) {
          rows = await prisma.$queryRaw`
            SELECT * FROM items ORDER BY published_at DESC LIMIT 50
          `;
        }
        return rows.map((r) => ({
          ...r,
          score: Number(r.score),
          source_confidence: Number(r.source_confidence),
        }));
      });

      const translatedItems = await translateCurrentAffairItems(
        data,
        languageCode,
      );
      res.json({
        month_label: start.toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        }),
        items: translatedItems,
      });
    } catch (e) {
      res.status(500).json({ status: "error", detail: String(e) });
    }
  },
);

router.get(
  "/affairs",
  optionalUserAuthMiddleware,
  async (req, res) => {
    try {
      const languageCode = getLanguageCode(req);
      const cacheKey = `current-affairs:all:${languageCode}`;

      const rows = await prisma.$queryRaw`
        SELECT * FROM items ORDER BY published_at DESC LIMIT 1000
      `;
      const data = rows.map((r) => ({
        ...r,
        score: Number(r.score),
        source_confidence: Number(r.source_confidence),
      }));

      const translatedData = await translateCurrentAffairItems(
        data,
        languageCode,
      );
      res.json(translatedData);
    } catch (e) {
      res.status(500).json({ status: "error", detail: String(e) });
    }
  },
);

router.get("/themes", adminAuth, async (req, res) => {
  try {
    const rows = await prisma.$queryRaw`
      SELECT theme, COUNT(*) AS item_count, ROUND(AVG(score), 1) AS avg_score, MAX(score) AS max_score
      FROM items
      GROUP BY theme
      ORDER BY max_score DESC, item_count DESC
    `;
    res.json(
      rows.map((r) => ({
        theme: r.theme,
        item_count: Number(r.item_count),
        avg_score: Math.round(Number(r.avg_score), 1),
        max_score: Number(r.max_score),
      })),
    );
  } catch (e) {
    res.status(500).json({ status: "error", detail: String(e) });
  }
});

router.get("/questions", optionalUserAuthMiddleware, async (req, res) => {
  try {
    const languageCode = getLanguageCode(req);
    const cacheKey = `current-affairs:questions:${languageCode}`;

    const normalized = await cacheMiddleware(cacheKey, 600, async () => {
      const rows = await prisma.$queryRaw`
        SELECT 
          question,
          options,
          answer,
          answer_basis,
          exam,
          priority,
          question_type,
          source_url,
          created_at
        FROM questions 
        ORDER BY priority DESC, created_at DESC
      `;
      return rows.map((r) => {
        let options = r.options;
        if (typeof options === "string") {
          try {
            options = JSON.parse(options);
          } catch {
            options = [];
          }
        }
        if (!Array.isArray(options)) options = [];
        return {
          question: r.question,
          options: options
            .map((opt) => (typeof opt === "string" ? opt : JSON.stringify(opt)))
            .filter(Boolean),
          answer: r.answer || "",
          answer_basis: r.answer_basis,
          exam: r.exam,
          priority: r.priority,
          question_type: r.question_type,
          source_url: r.source_url,
          created_at: r.created_at,
        };
      });
    });

    const translatedQuestions = await translateQuestions(
      normalized,
      languageCode,
    );
    res.json(translatedQuestions);
  } catch (e) {
    res.status(500).json({ status: "error", detail: String(e) });
  }
});

router.get("/health", adminAuth, async (req, res) => {
  try {
    const rows = await healthReport();
    res.json(rows);
  } catch (e) {
    res.status(500).json({ status: "error", detail: String(e) });
  }
});

router.get("/errors", adminAuth, async (req, res) => {
  try {
    const rows = await errorsReport(100);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ status: "error", detail: String(e) });
  }
});

export default router;
