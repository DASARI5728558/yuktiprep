import express from "express";
import prisma from "../config/prisma.js";
import { successResponse, errorResponse } from "../src/utils/response.js";
import { tutorReply, scoreTranscript } from "../src/services/interview-ai.service.js";
import { roomToken } from "../src/services/livekit.service.js";
import { inspect } from "../src/services/guardrails.service.js";
import { userAuthMiddleware } from "../src/middleware/userAuth.middleware.js";

const router = express.Router();

const EXAM_CATALOG = [
  {
    id: "UPSC_CSE",
    stream: "CIVIL_SERVICES",
    name: "UPSC Civil Services Personality Test",
    description: "High-stakes interview assessing intellectual caliber, moral integrity, and administrative acumen.",
    panelPersona: "UPSC Board Chairperson & Senior Bureaucrats (IAS/IPS/IFS retirees)",
    defaultTopic: "Balancing welfare redistribution with fiscal consolidation in developing economies",
    sampleTopics: [
      "Balancing welfare redistribution with fiscal consolidation in developing economies",
      "Ethical dilemmas in maintaining public order vs civil liberties during protests",
      "India's multilateral diplomatic stance amid changing geopolitical alliances",
      "Disaster management response strategy for extreme urban climate events",
    ],
    keyFocusAreas: ["Constitutional values", "Balanced judgment", "Policy feasibility", "Integrity under pressure"],
  },
  {
    id: "STATE_PSC",
    stream: "CIVIL_SERVICES",
    name: "State Public Service Commission (UPPSC/BPSC/MPSC/TNPSC/KPSC)",
    description: "State administrative and police service selection interviews.",
    panelPersona: "State PSC Board Members & Senior Administrative Officers",
    defaultTopic: "Rural agrarian revitalization and state infrastructure bottleneck resolution",
    sampleTopics: [
      "Rural agrarian revitalization and state infrastructure bottleneck resolution",
      "Local governance empowerment (Panchayati Raj) and digital public services delivery",
      "Addressing regional developmental disparities and industrial promotion",
    ],
    keyFocusAreas: ["State policy mastery", "Grassroots administration", "Socio-economic awareness"],
  },
  {
    id: "SSB_INTERVIEW",
    stream: "DEFENSE_ARMED_FORCES",
    name: "SSB (Army / Navy / Air Force / NDA / CDS / AFCAT)",
    description: "Officer Like Qualities (OLQ) evaluation through in-depth Personal Interview.",
    panelPersona: "Services Selection Board Interviewing Officer (Brigadier / Colonel rank)",
    defaultTopic: "Officer Like Qualities: Leadership in crisis, self-discipline, and tactical decision-making",
    sampleTopics: [
      "Leadership in high-pressure tactical scenarios and crisis decision-making",
      "Handling ethical dilemmas and moral courage in military command",
      "Self-awareness, personal motivation, and overcoming adversity",
    ],
    keyFocusAreas: ["Effective intelligence", "Courage & initiative", "Social adaptability", "Integrity"],
  },
  {
    id: "IIM_CAT_PI",
    stream: "MANAGEMENT_MBA",
    name: "IIM / Top B-School Personal Interview (WAT-PI)",
    description: "Rigorous case analysis, business intuition, and candidate profile defense.",
    panelPersona: "IIM Professors of Strategy & Executive Industry Alumni",
    defaultTopic: "Disruption of traditional banking by FinTech platforms and credit risk management",
    sampleTopics: [
      "Disruption of traditional banking by FinTech platforms and credit risk management",
      "Sustainability vs profitability: Strategy for decarbonizing supply chains",
      "AI disruption in employment and strategic workforce transformation",
      "Valuation metrics and unit economics in consumer internet startups",
    ],
    keyFocusAreas: ["Business logic", "MECE framework", "Structured reasoning", "Self-awareness"],
  },
  {
    id: "RBI_GRADE_B",
    stream: "BANKING_REGULATORY",
    name: "Reserve Bank of India (RBI) Grade B",
    description: "Central banking, macroeconomic policy, monetary transmission, and financial stability.",
    panelPersona: "RBI Executive Directors & Financial Economists",
    defaultTopic: "Monetary policy transmission mechanisms and inflation targeting in India",
    sampleTopics: [
      "Monetary policy transmission mechanisms and inflation targeting in India",
      "Central Bank Digital Currencies (e-Rupee) and cross-border settlement architecture",
      "Non-performing asset (NPA) management and resolution frameworks (IBC)",
    ],
    keyFocusAreas: ["Macroeconomic depth", "Financial sector regulation", "Analytical precision"],
  },
  {
    id: "JUDICIAL_SERVICES",
    stream: "JUDICIARY_LAW",
    name: "Judicial Services / Civil Judge Examination (PCS-J)",
    description: "Judicial temperament, statutory interpretation, constitutional law, and courtroom ethics.",
    panelPersona: "High Court Judges & Senior Advocates",
    defaultTopic: "Principles of natural justice and balancing procedural law with substantive justice",
    sampleTopics: [
      "Principles of natural justice and balancing procedural law with substantive justice",
      "Admissibility of electronic and digital evidence under the Indian Evidence Act",
      "Sentencing discretion, victim compensation, and restorative justice models",
    ],
    keyFocusAreas: ["Judicial temperament", "Statutory interpretation", "Constitutional morality"],
  },
  {
    id: "MEDICAL_VIVA",
    stream: "MEDICAL_HEALTHCARE",
    name: "AIIMS / NEET-SS Medical Specialist Residency Viva",
    description: "Clinical case management, emergency triage, medical ethics, and pharmacology.",
    panelPersona: "Professor & Head of Department of Medicine/Surgery",
    defaultTopic: "Differential diagnosis and protocol for acute septic shock with multi-organ dysfunction",
    sampleTopics: [
      "Differential diagnosis and protocol for acute septic shock with multi-organ dysfunction",
      "Ethical decision-making in end-of-life care and informed consent in critical emergencies",
      "Antibiotic stewardship and infection control in intensive care units",
    ],
    keyFocusAreas: ["Diagnostic accuracy", "Clinical decision tree", "Medical ethics", "Patient empathy"],
  },
  {
    id: "TECH_LEAD_FAANG",
    stream: "TECH_CONSULTING",
    name: "Big Tech / FAANG (System Design & Behavioral Bar Raiser)",
    description: "Distributed systems, architectural trade-offs, and Amazon-style Leadership Principles.",
    panelPersona: "Staff Software Engineer & Principal Bar Raiser",
    defaultTopic: "Designing a globally distributed, low-latency event streaming and payment reconciliation platform",
    sampleTopics: [
      "Designing a globally distributed, low-latency event streaming and payment reconciliation platform",
      "Leadership Principle: Customer obsession vs engineering perfection under tight delivery timelines",
      "Incident post-mortem: Root cause analysis of a critical multi-region outage",
    ],
    keyFocusAreas: ["Scalability trade-offs", "Ownership", "Conflict resolution", "Technical depth"],
  },
];

function getExamTrack(examId) {
  return EXAM_CATALOG.find(
    (e) => e.id.toLowerCase() === examId.toLowerCase() || e.name.toLowerCase() === examId.toLowerCase()
  );
}

// POST /api/v1/interview/sessions - Create new session
router.post("/sessions", userAuthMiddleware, async (req, res) => {
  try {
    const { mode, level, locale, examId, topic, media, candidateProfile, consent } = req.body;

    if (!mode || !level || !locale || !examId || !topic || !media) {
      return errorResponse(res, "Missing required fields", { mode, level, locale, examId, topic, media }, 400);
    }

    const safety = inspect(topic);
    if (!safety.allowed) {
      return errorResponse(res, "The requested topic violates content safety guidelines.", [safety.category], 400);
    }

    const user = req.user;
    const resolvedLocale = locale || "en-IN";

    const id = crypto.randomUUID();
    const roomName = `yp-${id}`;

    const session = await prisma.session.create({
      data: {
        id,
        userId: user.id,
        examId,
        topic: safety.redacted,
        mode,
        level,
        locale: resolvedLocale,
        media,
        roomName,
        candidateProfile: candidateProfile || null,
      },
    });

    let live = null;
    try {
      const token = await roomToken(roomName, user.id);
      live = {
        url: process.env.LIVEKIT_WS_URL || "ws://localhost:7880",
        token,
      };
    } catch (livekitError) {
      console.warn("LiveKit token generation failed, continuing without live integration:", livekitError.message);
    }

    return successResponse(res, "Session created successfully", { ...session, live }, {}, 201);
  } catch (error) {
    console.error("Error creating interview session:", error);
    return errorResponse(res, "Failed to create session", [], 500);
  }
});

// GET /api/v1/interview/sessions/:id - Retrieve session with events & feedback
router.get("/sessions/:id", userAuthMiddleware, async (req, res) => {
  try {
    const sessionId = req.params.id;
    const session = await prisma.session.findFirst({
      where: { id: sessionId, userId: req.user.id },
      include: {
        events: { orderBy: { occurredAt: "asc" } },
        feedback: true,
      },
    });

    if (!session) {
      return errorResponse(res, "Session not found or access denied", [], 404);
    }

    return successResponse(res, "Session fetched successfully", session);
  } catch (error) {
    console.error("Error fetching session:", error);
    return errorResponse(res, "Failed to fetch session", [], 500);
  }
});

// POST /api/v1/interview/sessions/:id/events - Ingest learning event
router.post("/sessions/:id/events", userAuthMiddleware, async (req, res) => {
  try {
    const sessionId = req.params.id;
    const { type, occurredAt, payload } = req.body;

    const session = await prisma.session.findFirst({
      where: { id: sessionId, userId: req.user.id },
    });

    if (!session) {
      return errorResponse(res, "Session not found or access denied", [], 404);
    }

    const event = await prisma.learningEvent.create({
      data: {
        sessionId,
        type: type || "UTTERANCE",
        occurredAt: occurredAt ? new Date(occurredAt) : new Date(),
        payload: payload || {},
      },
    });

    return successResponse(res, "Event ingested successfully", event, {}, 202);
  } catch (error) {
    console.error("Error ingesting event:", error);
    return errorResponse(res, "Failed to ingest event", [], 500);
  }
});

// POST /api/v1/interview/sessions/:id/tutor - AI tutor turn
router.post("/sessions/:id/tutor", userAuthMiddleware, async (req, res) => {
  try {
    const sessionId = req.params.id;
    const { message, currentPhase, turnNumber, history } = req.body;

    const session = await prisma.session.findFirst({
      where: { id: sessionId, userId: req.user.id },
    });

    if (!session) {
      return errorResponse(res, "Session not found or access denied", [], 404);
    }

    const rawMessage = message || "";
    const safe = inspect(rawMessage);
    if (!safe.allowed) {
      return errorResponse(res, "The submitted message violates content safety guidelines.", [safe.category], 400);
    }

    const replyData = await tutorReply({
      locale: session.locale,
      level: session.level,
      mode: session.mode,
      examId: session.examId,
      topic: session.topic,
      candidateProfile: session.candidateProfile,
      currentPhase: currentPhase || session.mode,
      turnNumber: turnNumber || 1,
      history: history || [],
    });

    return successResponse(res, "Tutor reply generated", replyData);
  } catch (error) {
    console.error("Error generating tutor reply:", error);
    return errorResponse(res, "Failed to generate tutor reply", [], 500);
  }
});

// POST /api/v1/interview/sessions/:id/complete - End session and score
router.post("/sessions/:id/complete", userAuthMiddleware, async (req, res) => {
  try {
    const sessionId = req.params.id;
    const { transcript, segments, durationMinutes } = req.body;

    const session = await prisma.session.findFirst({
      where: { id: sessionId, userId: req.user.id },
    });

    if (!session) {
      return errorResponse(res, "Session not found or access denied", [], 404);
    }

    const transcriptText = transcript || "";
    const duration = durationMinutes || 5;

    const score = await scoreTranscript(
      transcriptText,
      session.level,
      session.mode,
      session.examId,
      duration,
      session.candidateProfile
    );

    const feedback = await prisma.feedback.upsert({
      where: { sessionId: session.id },
      update: {
        overall: score.overall,
        dimensions: score.dimensions,
        strengths: score.strengths,
        improvements: score.improvements,
        nextActions: score.nextActions,
        transcript: segments || [],
        safetyFlags: score.dimensionFeedback || {},
        modelVersion: score.modelVersion,
      },
      create: {
        sessionId: session.id,
        overall: score.overall,
        dimensions: score.dimensions,
        strengths: score.strengths,
        improvements: score.improvements,
        nextActions: score.nextActions,
        transcript: segments || [],
        safetyFlags: score.dimensionFeedback || {},
        modelVersion: score.modelVersion,
      },
    });

    await prisma.session.update({
      where: { id: session.id },
      data: { status: "COMPLETED", endedAt: new Date() },
    });

    return successResponse(res, "Session completed and scored successfully", {
      ...feedback,
      dimensionFeedback: score.dimensionFeedback,
      analytics: score.analytics,
    });
  } catch (error) {
    console.error("Error completing session:", error);
    return errorResponse(res, "Failed to complete session", [], 500);
  }
});

// GET /api/v1/interview/analytics/me - Learner analytics
router.get("/analytics/me", userAuthMiddleware, async (req, res) => {
  try {
    const sessions = await prisma.session.findMany({
      where: { userId: req.user.id, status: "COMPLETED" },
      include: { feedback: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const scored = sessions.filter((x) => x.feedback);
    const averageScore = scored.length
      ? Math.round(scored.reduce((n, x) => n + (x.feedback?.overall || 0), 0) / scored.length)
      : null;

    const levels = ["BASIC", "MEDIUM", "HIGH", "PROFESSIONAL"];
    const byLevel = {};
    for (const level of levels) {
      byLevel[level] = scored.filter((x) => x.level === level).length;
    }

    const recent = sessions.slice(0, 10).map((x) => {
      const startedAt = x.startedAt ? new Date(x.startedAt) : new Date(x.createdAt);
      const endedAt = x.endedAt ? new Date(x.endedAt) : startedAt;
      const durationMinutes = Math.max(1, Math.round((endedAt.getTime() - startedAt.getTime()) / 60000));

      return {
        id: x.id,
        examId: x.examId,
        topic: x.topic,
        level: x.level,
        mode: x.mode,
        score: x.feedback?.overall,
        dimensions: x.feedback?.dimensions,
        dimensionFeedback: x.feedback?.safetyFlags,
        at: x.createdAt,
        durationMinutes,
        startedAt: x.startedAt,
        endedAt: x.endedAt,
      };
    });

    return successResponse(res, "Analytics fetched successfully", {
      completed: sessions.length,
      averageScore,
      byLevel,
      recent,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return errorResponse(res, "Failed to fetch analytics", [], 500);
  }
});

// GET /api/v1/interview/exams - List available exams
router.get("/exams", userAuthMiddleware, async (req, res) => {
  try {
    return successResponse(res, "Exams fetched successfully", EXAM_CATALOG);
  } catch (error) {
    console.error("Error fetching exams:", error);
    return errorResponse(res, "Failed to fetch exams", [], 500);
  }
});

export default router;
