import prisma from "../config/prisma.js";
import { generateStudyPlan } from "../services/chatbotweb.service.js";

/**
 * Controller for AI Study Planner
 * Manages study plan generation, follow-up conversations, and retrieval.
 */

// Helper to deduce exam title from prompt
function extractExamFromPrompt(prompt) {
  const p = prompt.toLowerCase();
  if (p.includes("upsc")) return "UPSC Civil Services";
  if (p.includes("tnpsc")) return "TNPSC";
  if (p.includes("ssc")) return "SSC CGL / CHSL";
  if (p.includes("neet")) return "NEET";
  if (p.includes("jee")) return "JEE Main / Advanced";
  if (p.includes("bank") || p.includes("ibps") || p.includes("sbi")) return "Banking Exams";
  if (p.includes("cat")) return "CAT";
  if (p.includes("gate")) return "GATE";
  return "Competitive Exam";
}

/**
 * POST /api/v1/study-planner
 * Generates a new study plan or appends a follow-up query to an existing plan
 */
export async function createOrContinueStudyPlan(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required to use AI Study Planner.",
      });
    }

    const { prompt, studyPlanId, conversationHistory = [] } = req.body;

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please provide a study plan prompt or question.",
      });
    }

    let existingPlan = null;
    let fullHistory = [];

    if (studyPlanId) {
      existingPlan = await prisma.studyPlan.findFirst({
        where: { id: studyPlanId, userId },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
          },
        },
      });

      if (!existingPlan) {
        return res.status(404).json({
          success: false,
          message: "Study plan not found.",
        });
      }

      fullHistory = existingPlan.messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));
    } else if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
      fullHistory = conversationHistory;
    }

    // Call chatbotweb.service to generate reply via Gemini
    const aiResult = await generateStudyPlan(prompt.trim(), fullHistory);

    if (!aiResult.success) {
      return res.status(503).json({
        success: false,
        message: aiResult.message || "Sorry, I couldn't generate a reply right now (AI service is temporarily unavailable). Please try again in a moment.",
      });
    }

    let studyPlan = existingPlan;

    // If new study plan, persist container
    if (!studyPlan) {
      const examName = extractExamFromPrompt(prompt);
      const title = prompt.trim().length > 120 ? prompt.trim().substring(0, 117) + "..." : prompt.trim();

      studyPlan = await prisma.studyPlan.create({
        data: {
          userId,
          title,
          exam: examName,
          status: "Active",
        },
      });
    }

    // Persist user prompt
    await prisma.studyPlanMessage.create({
      data: {
        studyPlanId: studyPlan.id,
        role: "user",
        content: prompt.trim(),
      },
    });

    // Persist assistant response
    const assistantMsg = await prisma.studyPlanMessage.create({
      data: {
        studyPlanId: studyPlan.id,
        role: "assistant",
        content: aiResult.message,
      },
    });

    // Update study plan updated timestamp
    await prisma.studyPlan.update({
      where: { id: studyPlan.id },
      data: { updatedAt: new Date() },
    });

    return res.status(200).json({
      success: true,
      message: aiResult.message,
      studyPlanId: studyPlan.id,
      assistantMessageId: assistantMsg.id,
    });
  } catch (error) {
    console.error("Error in createOrContinueStudyPlan:", error);
    return res.status(500).json({
      success: false,
      message: "Sorry, I couldn't generate a reply right now (AI service is temporarily unavailable). Please try again in a moment.",
    });
  }
}

/**
 * GET /api/v1/study-planner
 * Retrieves all study plans for the logged-in user (History list)
 */
export async function getStudyPlansHistory(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const plans = await prisma.studyPlan.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      include: {
        _count: {
          select: { messages: true },
        },
      },
    });

    return res.status(200).json({
      success: true,
      data: plans.map((plan) => ({
        id: plan.id,
        title: plan.title,
        exam: plan.exam || "Competitive Exam",
        status: plan.status,
        messageCount: plan._count.messages,
        createdAt: plan.createdAt,
        updatedAt: plan.updatedAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching study plans history:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch study plans history.",
    });
  }
}

/**
 * GET /api/v1/study-planner/:id
 * Retrieves a single study plan and its messages
 */
export async function getStudyPlanDetails(req, res) {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const plan = await prisma.studyPlan.findFirst({
      where: { id, userId },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Study plan not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: plan.id,
        title: plan.title,
        exam: plan.exam || "Competitive Exam",
        status: plan.status,
        createdAt: plan.createdAt,
        updatedAt: plan.updatedAt,
        messages: plan.messages.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          createdAt: m.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching study plan details:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch study plan details.",
    });
  }
}

/**
 * POST /api/v1/study-planner/ask
 * Handles Guru AI Tutor questions, persisting the session and message history
 */
export async function askAiTutorQuestion(req, res) {
  try {
    const userId = req.user?.id;
    const { prompt, sessionId, conversationHistory = [] } = req.body;

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please provide a question or topic prompt.",
      });
    }

    let currentSession = null;
    let fullHistory = [];

    if (userId && sessionId) {
      currentSession = await prisma.aiTutorSession.findFirst({
        where: { id: sessionId, userId },
        include: {
          messages: { orderBy: { createdAt: "asc" } },
        },
      });

      if (currentSession) {
        fullHistory = currentSession.messages.map((m) => ({
          role: m.role,
          content: m.content,
        }));
      }
    }

    if (fullHistory.length === 0 && Array.isArray(conversationHistory)) {
      fullHistory = conversationHistory;
    }

    const { askAiTutor } = await import("../services/chatbotweb.service.js");
    const result = await askAiTutor(prompt, fullHistory);

    if (!result.success) {
      return res.status(503).json(result);
    }

    // Save session and messages for authenticated users
    let savedSessionId = sessionId;
    if (userId) {
      if (!currentSession) {
        // Derive clean title from first prompt (max 60 chars)
        const cleanTitle =
          prompt.trim().length > 60
            ? prompt.trim().substring(0, 57) + "..."
            : prompt.trim();

        currentSession = await prisma.aiTutorSession.create({
          data: {
            userId,
            title: cleanTitle,
            topic: "Guru AI",
          },
        });
        savedSessionId = currentSession.id;
      }

      // Save user question
      await prisma.aiTutorMessage.create({
        data: {
          sessionId: currentSession.id,
          role: "user",
          content: prompt.trim(),
        },
      });

      // Save assistant answer
      await prisma.aiTutorMessage.create({
        data: {
          sessionId: currentSession.id,
          role: "assistant",
          content: result.message,
        },
      });

      // Touch session updated timestamp
      await prisma.aiTutorSession.update({
        where: { id: currentSession.id },
        data: { updatedAt: new Date() },
      });
    }

    return res.status(200).json({
      success: true,
      message: result.message,
      sessionId: savedSessionId || null,
    });
  } catch (error) {
    console.error("Error in askAiTutorQuestion:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while communicating with Guru AI.",
    });
  }
}

/**
 * GET /api/v1/study-planner/history
 * Retrieves learning history (both Guru AI sessions and study plans) for Continue Learning
 */
export async function getContinueLearningHistory(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    // 1. Fetch recent Guru AI sessions
    const sessions = await prisma.aiTutorSession.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      take: 10,
      include: {
        _count: { select: { messages: true } },
        messages: {
          take: 1,
          orderBy: { createdAt: "desc" },
        },
      },
    });

    // 2. Fetch recent Study Plans
    const plans = await prisma.studyPlan.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      take: 10,
      include: {
        _count: { select: { messages: true } },
      },
    });

    // Combined Continue Learning items
    const items = [];

    for (const s of sessions) {
      items.push({
        id: s.id,
        type: "ai-tutor",
        title: s.title,
        subtitle: `${s._count.messages} messages with Guru AI`,
        topic: s.topic || "Guru AI",
        updatedAt: s.updatedAt,
        href: `/ai-tutor/chat?sessionId=${s.id}`,
      });
    }

    for (const p of plans) {
      items.push({
        id: p.id,
        type: "study-plan",
        title: p.title,
        subtitle: `${p._count.messages} plan tasks • ${p.exam || "Exam Plan"}`,
        topic: p.exam || "Study Plan",
        updatedAt: p.updatedAt,
        href: `/ai-tutor/study-planner?planId=${p.id}`,
      });
    }

    // Sort combined by most recent
    items.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    return res.status(200).json({
      success: true,
      data: items,
    });
  } catch (error) {
    console.error("Error in getContinueLearningHistory:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch continue learning history.",
    });
  }
}

/**
 * GET /api/v1/study-planner/sessions/:id
 * Retrieves details and full message history of an AI Tutor session
 */
export async function getAiTutorSessionDetails(req, res) {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const session = await prisma.aiTutorSession.findFirst({
      where: { id, userId },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: session.id,
        title: session.title,
        topic: session.topic,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
        messages: session.messages.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          createdAt: m.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error("Error in getAiTutorSessionDetails:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch session details.",
    });
  }
}

