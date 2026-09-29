import prisma from "../config/prisma.js";
import { generateMCQQuestions } from "../services/testGenerator.service.js";
import { seedMockTestsDatabase } from "../scripts/seedMockTests.js";

/**
 * List all mock tests with filter support
 */
export async function getTests(req, res, next) {
  try {
    const { exam, difficulty, type, search } = req.query;

    const where = { isActive: true };

    if (exam && exam !== "All Exams") {
      where.exam = exam;
    }
    if (difficulty && difficulty !== "All Difficulties") {
      where.difficulty = difficulty;
    }
    if (type && type !== "all") {
      where.type = type;
    }
    if (search) {
      where.title = { contains: search, mode: "insensitive" };
    }

    const tests = await prisma.mockTest.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { questions: true, attempts: true },
        },
      },
    });

    const formatted = tests.map((t) => ({
      id: t.slug || t.id,
      realId: t.id,
      title: t.title,
      duration: t.duration,
      questions: `${t._count.questions || 5} Qs`,
      users: t.usersCount,
      difficulty: t.difficulty,
      exam: t.exam,
      type: t.type,
      description: t.description,
      questionCount: t._count.questions,
    }));

    return res.status(200).json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get single test details with questions
 */
export async function getTestDetails(req, res, next) {
  try {
    const { id } = req.params;

    // Find by slug or uuid
    const test = await prisma.mockTest.findFirst({
      where: {
        OR: [{ slug: id }, { id: id.includes("-") && id.length === 36 ? id : undefined }].filter(Boolean),
      },
      include: {
        questions: {
          orderBy: { orderIndex: "asc" },
        },
      },
    });

    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Test not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: test.slug,
        realId: test.id,
        title: test.title,
        duration: test.duration,
        questions: `${test.questions.length} Qs`,
        users: test.usersCount,
        difficulty: test.difficulty,
        exam: test.exam,
        type: test.type,
        description: test.description,
        questionList: test.questions.map((q) => ({
          id: q.id,
          orderIndex: q.orderIndex,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Generate a new mock test using AI (Gemini / OpenAI / Ollama)
 */
export async function generateTestWithAI(req, res, next) {
  try {
    const {
      title,
      exam = "UPSC Civil Services",
      topic = "Indian Polity",
      difficulty = "MEDIUM",
      count = 5,
      type = "mock",
      duration = "15 mins",
      provider = "gemini",
    } = req.body;

    const finalTitle = title || `${exam} - ${topic} Practice`;
    const slugBase = finalTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const slug = `${slugBase}-${Date.now().toString().slice(-4)}`;

    // Generate questions using testGenerator service
    const generatedQuestions = await generateMCQQuestions({
      exam,
      topic,
      difficulty,
      count: Number(count) || 5,
      provider,
    });

    // Save test in DB
    const newTest = await prisma.mockTest.create({
      data: {
        slug,
        title: finalTitle,
        duration,
        questionsCount: `${generatedQuestions.length} Qs`,
        usersCount: "100+ users",
        difficulty,
        exam,
        type,
        description: `AI-generated mock practice test for ${exam} on ${topic}.`,
        questions: {
          create: generatedQuestions.map((q, idx) => ({
            orderIndex: idx + 1,
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
          })),
        },
      },
      include: {
        questions: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Mock test created successfully via AI",
      provider: generatedQuestions._meta?.actualProvider || provider,
      fallbackFrom: generatedQuestions._meta?.fallbackFrom || null,
      fallbackReason: generatedQuestions._meta?.fallbackReason || null,
      requestedProvider: generatedQuestions._meta?.requestedProvider || provider,
      data: newTest,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Trigger mock test seed
 */
export async function triggerSeed(req, res, next) {
  try {
    const { useAI = false, provider = "ollama", count = 5 } = req.body || {};
    await seedMockTestsDatabase({ useAI, provider, count });
    return res.status(200).json({
      success: true,
      message: useAI
        ? `Sample mock tests seeded and enriched with ${provider.toUpperCase()} AI successfully`
        : "Default sample mock tests seeded successfully",
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Submit test attempt & evaluate score
 */
export async function submitTestAttempt(req, res, next) {
  try {
    const { id } = req.params;
    const { userAnswers = {}, timeTakenSec = 0 } = req.body;

    // Retrieve test with its questions
    const test = await prisma.mockTest.findFirst({
      where: {
        OR: [{ slug: id }, { id: id.includes("-") && id.length === 36 ? id : undefined }].filter(Boolean),
      },
      include: {
        questions: {
          orderBy: { orderIndex: "asc" },
        },
      },
    });

    if (!test) {
      return res.status(404).json({ success: false, message: "Test not found" });
    }

    let correctCount = 0;
    const totalCount = test.questions.length;

    test.questions.forEach((q) => {
      const selected = userAnswers[q.id];
      if (selected && selected.toUpperCase() === q.correctAnswer.toUpperCase()) {
        correctCount++;
      }
    });

    const scorePercentage = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
    const scoreStr = `${scorePercentage}%`;
    const correctStr = `${correctCount}/${totalCount}`;

    const attempt = await prisma.mockTestAttempt.create({
      data: {
        testId: test.id,
        userId: req.user?.id || null,
        title: test.title,
        exam: test.exam,
        score: scoreStr,
        correct: correctStr,
        status: "Submitted",
        badge: "AI",
        timeTakenSec: Number(timeTakenSec) || 0,
        userAnswers,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Test submitted successfully",
      data: {
        attemptId: attempt.id,
        testId: test.slug,
        score: scoreStr,
        correct: correctStr,
        correctCount,
        totalCount,
        incorrectCount: totalCount - correctCount,
        timeTakenSec,
        userAnswers,
        questions: test.questions,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get all attempts (recent attempts)
 */
export async function getAttempts(req, res, next) {
  try {
    const where = {};
    if (req.user?.id) {
      where.userId = req.user.id;
    }

    const attempts = await prisma.mockTestAttempt.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        test: {
          select: { slug: true, title: true, exam: true },
        },
      },
    });

    const formatted = attempts.map((a) => {
      const dateFormatted = new Date(a.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      });

      return {
        id: a.id,
        testSlug: a.test?.slug || a.testId,
        title: a.title,
        exam: a.exam,
        score: a.score,
        correct: a.correct,
        status: a.status,
        badge: a.badge,
        date: dateFormatted,
        timeTakenSec: a.timeTakenSec,
      };
    });

    return res.status(200).json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get detailed attempt result by attempt ID
 */
export async function getAttemptDetails(req, res, next) {
  try {
    const { id } = req.params;

    const attempt = await prisma.mockTestAttempt.findUnique({
      where: { id },
      include: {
        test: {
          include: {
            questions: {
              orderBy: { orderIndex: "asc" },
            },
          },
        },
      },
    });

    if (!attempt) {
      return res.status(404).json({ success: false, message: "Attempt not found" });
    }

    const dateFormatted = new Date(attempt.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });

    return res.status(200).json({
      success: true,
      data: {
        id: attempt.id,
        testId: attempt.test?.slug || attempt.testId,
        title: attempt.title,
        exam: attempt.exam,
        score: attempt.score,
        correct: attempt.correct,
        status: attempt.status,
        badge: attempt.badge,
        date: dateFormatted,
        timeTakenSec: attempt.timeTakenSec,
        userAnswers: attempt.userAnswers,
        questions: attempt.test?.questions || [],
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete a mock test (admin)
 */
export async function deleteTest(req, res, next) {
  try {
    const { id } = req.params;
    await prisma.mockTest.deleteMany({
      where: {
        OR: [{ slug: id }, { id: id.includes("-") && id.length === 36 ? id : undefined }].filter(Boolean),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Test deleted successfully",
    });
  } catch (error) {
    next(error);
  }
}
