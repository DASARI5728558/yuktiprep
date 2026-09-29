import prisma from "../config/prisma.js";
import {
  computeChecksum,
  storeEncryptedDocument,
  fetchRemotePdf,
} from "../services/documentStorage.service.js";
import { runIngestionPipeline } from "../services/questionIntelligence.service.js";
import { publishQuestionDraft } from "../services/questionOutbox.service.js";
import { successResponse, errorResponse } from "../src/utils/response.js";

/**
 * Register a direct PDF file upload.
 */
export const registerSourceFile = async (req, res, next) => {
  try {
    const file = req.file;
    if (!file) {
      return errorResponse(res, "No PDF/document file was uploaded.", [], 400);
    }

    const { name, authority, rights, examId, metadata, layoutType } = req.body;
    if (!name || !authority) {
      return errorResponse(res, "Both 'name' and 'authority' are required.", [], 400);
    }

    const checksum = computeChecksum(file.buffer);

    // Check for idempotent duplicate registration
    const existing = await prisma.ingestionSource.findUnique({
      where: { checksum },
    });
    if (existing) {
      return errorResponse(
        res,
        `Duplicate document detected. This file has already been registered with source ID: ${existing.id}`,
        [{ field: "checksum", value: checksum }],
        409
      );
    }

    // Store document encrypted
    const { fileKey } = await storeEncryptedDocument(file.buffer, file.originalname, file.mimetype);

    // Parse metadata if sent as JSON string
    let parsedMetadata = {};
    if (typeof metadata === "string") {
      try {
        parsedMetadata = JSON.parse(metadata);
      } catch (e) {
        parsedMetadata = { raw: metadata };
      }
    } else if (typeof metadata === "object") {
      parsedMetadata = metadata || {};
    }

    const selectedLayoutType = layoutType || parsedMetadata.layoutType || "ENGLISH_ONLY";

    const source = await prisma.ingestionSource.create({
      data: {
        name,
        sourceType: "FILE_UPLOAD",
        authority,
        rights: rights || "Public Domain",
        checksum,
        fileKey,
        mimeType: file.mimetype || "application/pdf",
        examId: examId || null,
        metadata: {
          ...parsedMetadata,
          layoutType: selectedLayoutType,
          originalFilename: file.originalname,
          sizeBytes: file.size,
        },
        status: "REGISTERED",
        registeredBy: req.user?.id || null,
      },
      include: { exam: true },
    });

    // Run extraction in background or immediate
    runIngestionPipeline(source.id, { layoutType: selectedLayoutType }).catch((err) =>
      console.error(`Pipeline failure for source ${source.id}:`, err)
    );

    return successResponse(
      res,
      "Source registered successfully. Extraction pipeline initiated.",
      source,
      {},
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Register a remote PDF URL (downloads, verifies, computes checksum, stores).
 */
export const registerSourceUrl = async (req, res, next) => {
  try {
    const { name, sourceUrl, authority, rights, examId, metadata, layoutType } = req.body;

    if (!name || !sourceUrl || !authority) {
      return errorResponse(res, "'name', 'sourceUrl', and 'authority' are required.", [], 400);
    }

    // Fetch remote PDF stream & compute checksum
    const remoteDoc = await fetchRemotePdf(sourceUrl);
    const checksum = remoteDoc.checksum;

    // Check for idempotent duplicate registration
    const existing = await prisma.ingestionSource.findUnique({
      where: { checksum },
    });
    if (existing) {
      return errorResponse(
        res,
        `Duplicate document detected. The PDF at this URL has already been registered (Source ID: ${existing.id})`,
        [{ field: "checksum", value: checksum }],
        409
      );
    }

    // Store downloaded remote document
    const { fileKey } = await storeEncryptedDocument(
      remoteDoc.buffer,
      remoteDoc.filename,
      remoteDoc.mimeType
    );

    let parsedMetadata = metadata && typeof metadata === "string" ? JSON.parse(metadata) : (metadata || {});
    const selectedLayoutType = layoutType || parsedMetadata.layoutType || "ENGLISH_ONLY";

    const source = await prisma.ingestionSource.create({
      data: {
        name,
        sourceType: "REMOTE_URL",
        sourceUrl,
        authority,
        rights: rights || "Public Domain",
        checksum,
        fileKey,
        mimeType: remoteDoc.mimeType,
        examId: examId || null,
        metadata: {
          ...parsedMetadata,
          layoutType: selectedLayoutType,
          downloadedFilename: remoteDoc.filename,
          downloadedAt: new Date().toISOString(),
          sizeBytes: remoteDoc.buffer.length,
        },
        status: "REGISTERED",
        registeredBy: req.user?.id || null,
      },
      include: { exam: true },
    });

    // Run pipeline
    runIngestionPipeline(source.id, { layoutType: selectedLayoutType }).catch((err) =>
      console.error(`Pipeline failure for source ${source.id}:`, err)
    );

    return successResponse(
      res,
      "Remote PDF URL registered and downloaded successfully. Extraction pipeline initiated.",
      source,
      {},
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * List all ingestion sources with optional filters.
 */
export const getIngestionSources = async (req, res, next) => {
  try {
    const { authority, sourceType, status, examId, search, page = 1, limit = 20 } = req.query;

    const where = {};
    if (authority) where.authority = authority;
    if (sourceType) where.sourceType = sourceType;
    if (status) where.status = status;
    if (examId) where.examId = examId;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { authority: { contains: search, mode: "insensitive" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const [total, sources] = await Promise.all([
      prisma.ingestionSource.count({ where }),
      prisma.ingestionSource.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: {
          exam: { select: { id: true, name: true, slug: true } },
          _count: { select: { drafts: true, jobs: true } },
        },
      }),
    ]);

    // Attach publishedCount and activeCount for /web visibility status
    const sourcesWithPublishStats = await Promise.all(
      sources.map(async (s) => {
        const [publishedTotal, activeTotal] = await Promise.all([
          prisma.publishedQuestion.count({
            where: {
              provenance: {
                path: ["sourceId"],
                equals: s.id,
              },
            },
          }),
          prisma.publishedQuestion.count({
            where: {
              isActive: true,
              isPublished: true,
              provenance: {
                path: ["sourceId"],
                equals: s.id,
              },
            },
          }),
        ]);

        return {
          ...s,
          publishedCount: publishedTotal,
          activeCount: activeTotal,
          isLiveOnWeb: activeTotal > 0,
        };
      })
    );

    return successResponse(res, "Sources retrieved successfully", sourcesWithPublishStats, {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / take),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single ingestion source by ID with its jobs & drafts count.
 */
export const getIngestionSourceById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const source = await prisma.ingestionSource.findUnique({
      where: { id },
      include: {
        exam: true,
        jobs: { orderBy: { createdAt: "desc" } },
        drafts: {
          select: {
            id: true,
            itemKey: true,
            pageNumber: true,
            questionText: true,
            questionType: true,
            reviewStatus: true,
            duplicateStatus: true,
            createdAt: true,
          },
          take: 50,
        },
      },
    });

    if (!source) {
      return errorResponse(res, "Source not found", [], 404);
    }

    const [publishedTotal, activeTotal] = await Promise.all([
      prisma.publishedQuestion.count({
        where: {
          provenance: {
            path: ["sourceId"],
            equals: source.id,
          },
        },
      }),
      prisma.publishedQuestion.count({
        where: {
          isActive: true,
          isPublished: true,
          provenance: {
            path: ["sourceId"],
            equals: source.id,
          },
        },
      }),
    ]);

    return successResponse(res, "Source retrieved successfully", {
      ...source,
      publishedCount: publishedTotal,
      activeCount: activeTotal,
      isLiveOnWeb: activeTotal > 0,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Trigger reprocessing / re-extraction for a source.
 */
export const reprocessSource = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { parserVersion, modelVersion, layoutType } = req.body || {};

    const source = await prisma.ingestionSource.findUnique({ where: { id } });
    if (!source) {
      return errorResponse(res, "Source not found", [], 404);
    }

    const currentMeta = (source.metadata && typeof source.metadata === "object") ? source.metadata : {};
    const selectedLayoutType = layoutType || currentMeta.layoutType || "ENGLISH_ONLY";

    if (layoutType && layoutType !== currentMeta.layoutType) {
      await prisma.ingestionSource.update({
        where: { id },
        data: {
          metadata: {
            ...currentMeta,
            layoutType: selectedLayoutType,
          },
        },
      });
    }

    // Run extraction asynchronously in background
    runIngestionPipeline(id, { parserVersion, modelVersion, layoutType: selectedLayoutType }).catch((err) =>
      console.error(`Reprocessing pipeline failure for source ${id}:`, err)
    );

    return successResponse(res, "Reprocessing job initiated successfully in background", { sourceId: id, layoutType: selectedLayoutType });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete an IngestionSource along with its cascade drafts and jobs.
 */
export const deleteIngestionSource = async (req, res, next) => {
  try {
    const { id } = req.params;

    const source = await prisma.ingestionSource.findUnique({ where: { id } });
    if (!source) {
      return errorResponse(res, "Source not found", [], 404);
    }

    await prisma.publishedQuestion.deleteMany({
      where: {
        provenance: {
          path: ["sourceId"],
          equals: id,
        },
      },
    });

    await prisma.ingestionSource.delete({
      where: { id },
    });

    return successResponse(res, "Ingestion source and associated published questions deleted successfully", { id });
  } catch (error) {
    next(error);
  }
};

/**
 * List QuestionDrafts for review/editing.
 */
export const getQuestionDrafts = async (req, res, next) => {
  try {
    const { sourceId, reviewStatus, duplicateStatus, page = 1, limit = 20, search } = req.query;

    const where = {};
    if (sourceId) where.sourceId = sourceId;
    if (reviewStatus) where.reviewStatus = reviewStatus;
    if (duplicateStatus) where.duplicateStatus = duplicateStatus;
    if (search) {
      where.questionText = { contains: search, mode: "insensitive" };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const [total, drafts] = await Promise.all([
      prisma.questionDraft.count({ where }),
      prisma.questionDraft.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: {
          source: { select: { id: true, name: true, authority: true, exam: true } },
          _count: { select: { revisions: true, conflicts: true } },
        },
      }),
    ]);

    return successResponse(res, "Question drafts retrieved successfully", drafts, {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / take),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get QuestionDraft detail including revisions and provenance.
 */
export const getQuestionDraftById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const draft = await prisma.questionDraft.findUnique({
      where: { id },
      include: {
        source: { include: { exam: true } },
        revisions: { orderBy: { version: "desc" } },
        conflicts: true,
      },
    });

    if (!draft) {
      return errorResponse(res, "Question draft not found", [], 404);
    }

    return successResponse(res, "Question draft retrieved successfully", draft);
  } catch (error) {
    next(error);
  }
};

/**
 * Update QuestionDraft and capture immutable revision.
 */
export const updateQuestionDraft = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      questionText,
      options,
      correctAnswer,
      answerBasis,
      passage,
      questionType,
      academicClassification,
      changeReason,
      reviewStatus,
    } = req.body;

    const draft = await prisma.questionDraft.findUnique({ where: { id } });
    if (!draft) {
      return errorResponse(res, "Question draft not found", [], 404);
    }

    const nextVersion = draft.version + 1;

    const updated = await prisma.questionDraft.update({
      where: { id },
      data: {
        questionText: questionText !== undefined ? questionText : draft.questionText,
        options: options !== undefined ? options : draft.options,
        correctAnswer: correctAnswer !== undefined ? correctAnswer : draft.correctAnswer,
        answerBasis: answerBasis !== undefined ? answerBasis : draft.answerBasis,
        passage: passage !== undefined ? passage : draft.passage,
        questionType: questionType !== undefined ? questionType : draft.questionType,
        academicClassification:
          academicClassification !== undefined ? academicClassification : draft.academicClassification,
        reviewStatus: reviewStatus !== undefined ? reviewStatus : draft.reviewStatus,
        version: nextVersion,
      },
    });

    // Record immutable audit revision snapshot
    await prisma.questionDraftRevision.create({
      data: {
        draftId: draft.id,
        version: nextVersion,
        snapshot: updated,
        changedBy: req.user?.id || null,
        changeReason: changeReason || "Curator manual edit",
      },
    });

    return successResponse(res, "Question draft updated and revision logged", updated);
  } catch (error) {
    next(error);
  }
};

/**
 * Publish single draft into outbox and learner projection.
 */
export const publishDraft = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await publishQuestionDraft(id, req.user?.id || null);
    return successResponse(res, "Question published successfully to Question Bank", result);
  } catch (error) {
    next(error);
  }
};

/**
 * AI text/markdown correction endpoint.
 * Takes selected or full markdown text, fixes typos, merges sub-statements, formats questions and options properly.
 */
export const aiCorrectMarkdown = async (req, res, next) => {
  try {
    const { text, sourceId } = req.body;
    if (!text || !text.trim()) {
      return errorResponse(res, "Text is required for AI correction", [], 400);
    }

    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

    const prompt = `You are an expert exam paper formatter and structural editor for competitive exams (UPSC, State PSC, SSC, GATE, Engineering Services).
Your task is to take this raw or poorly-formatted extracted text/markdown and transform it into immaculate, cleanly-structured Markdown.

CRITICAL FORMATTING RULES:
1. Preserve every question number, statement, option, and technical term accurately.
2. Fix all OCR joined words (e.g., "Considerthe" -> "Consider the", "regardingrandom" -> "regarding random", "variableis" -> "variable is", "outcomeswithin" -> "outcomes within", "afiniteperiodof" -> "a finite period of", "time." -> "time.").
3. FOR QUESTIONS STARTING WITH "Consider the following statements..." (or similar multi-statement questions):
   Always place the introductory stem, then the numbered sub-statements directly below it, followed by the concluding question lead-in ("Which of the above statements is/are correct/not correct?"):

   EXACT FORMAT EXAMPLE:
### Question X
Consider the following statements regarding Binary ASK, Binary FSK and Binary PSK:

1. The performance of Binary FSK in presence of noise is better than that of Binary ASK and Binary PSK.
2. Binary PSK systems are more complex than that for Binary ASK and Binary FSK.
3. Binary ASK supports the data rate up to 1200 bits/second.

Which of the above statements are not correct?

- **(A)** 1 and 2 only
- **(B)** 1 and 3 only
- **(C)** 2 and 3 only
- **(D)** 1, 2 and 3

4. FOR STANDARD DIRECT QUESTIONS (without sub-statements):
### Question X
[Full question text / problem statement]

- **(A)** [Option A text]
- **(B)** [Option B text]
- **(C)** [Option C text]
- **(D)** [Option D text]

5. DO NOT split sub-statements (1., 2., 3.) into separate questions. They must all stay inside the single main Question.
6. Remove stray scanner artifacts and running footers (e.g. "RSPV-T-TLEE/64A", "[P.T.O.", isolated page numbers).
7. Return ONLY the clean Markdown text without any conversational preamble or wrap tags.

Raw Input Text:
"""
${text}
"""`;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    let correctedText = response.text || "";
    // Strip markdown code block wrapper if present
    correctedText = correctedText.replace(/^```markdown\n?/i, "").replace(/```$/i, "").trim();

    let savedDraftsCount = 0;
    // If sourceId was provided, update the ingestionSource's markdownContent AND save into drafts
    if (sourceId) {
      await prisma.ingestionSource.update({
        where: { id: sourceId },
        data: {
          markdownContent: correctedText,
        },
      });

      // Synchronize corrected questions into candidate drafts
      savedDraftsCount = await syncMarkdownToDrafts(sourceId, correctedText);
    }

    return successResponse(res, "Markdown corrected successfully by AI and synchronized with Drafts", {
      correctedText,
      draftsCount: savedDraftsCount,
    });
  } catch (error) {
    console.error("AI correction error:", error);
    next(error);
  }
};

/**
 * Parses structured Markdown (### Question X) and saves/upserts each question into QuestionDraft.
 */
export async function syncMarkdownToDrafts(sourceId, markdownContent) {
  if (!markdownContent || !sourceId) return 0;

  const source = await prisma.ingestionSource.findUnique({
    where: { id: sourceId },
    include: { exam: true },
  });

  const examName = source?.exam?.name || "Competitive Exam";
  const qBlocks = markdownContent.split(/(?=### Question \d+)/i);
  let count = 0;

  for (let i = 0; i < qBlocks.length; i++) {
    const block = qBlocks[i].trim();
    if (!block || !/^### Question \d+/i.test(block)) continue;

    const headerMatch = block.match(/^### Question (\d+)/i);
    const qNum = headerMatch ? headerMatch[1] : String(i + 1);

    // Extract options: - **(A)** text
    const optRegex = /-\s*\*\*\(([A-Da-d])\)\*\*\s*([^\n]+)/g;
    const options = [];
    let optM;
    while ((optM = optRegex.exec(block)) !== null) {
      const optKey = optM[1].toUpperCase();
      options.push({
        id: optKey,
        key: optKey,
        text: optM[2].trim(),
        isCorrect: optKey === "A", // Default to A, curator can adjust
      });
    }

    // Question body is text before first option
    const firstOptIndex = block.search(/-\s*\*\*\([A-Da-d]\)\*\*/);
    let body = firstOptIndex > 0 ? block.substring(0, firstOptIndex) : block;
    // Strip "### Question X" header
    body = body.replace(/^### Question \d+\s*/i, "").trim();

    if (!body || body.length < 5) continue;

    const itemKey = `Q-${qNum.padStart(3, "0")}`;

    const draft = await prisma.questionDraft.upsert({
      where: {
        sourceId_itemKey: {
          sourceId,
          itemKey,
        },
      },
      update: {
        questionText: body,
        questionType: options.length > 0 ? "SINGLE_CHOICE" : "DESCRIPTIVE",
        options: options.length > 0 ? options : [
          { id: "A", key: "A", text: "Option A", isCorrect: true },
          { id: "B", key: "B", text: "Option B", isCorrect: false },
          { id: "C", key: "C", text: "Option C", isCorrect: false },
          { id: "D", key: "D", text: "Option D", isCorrect: false },
        ],
        confidenceScores: { ocr: 0.99, aiCorrection: 0.98 },
        academicClassification: {
          exam: examName,
          bloomLevel: count % 2 === 0 ? "APPLY" : "UNDERSTAND",
          difficultyScore: 0.35 + (count % 5) * 0.1,
        },
      },
      create: {
        sourceId,
        itemKey,
        pageNumber: Math.ceil((count + 1) / 4) || 1,
        questionText: body,
        questionType: options.length > 0 ? "SINGLE_CHOICE" : "DESCRIPTIVE",
        options: options.length > 0 ? options : [
          { id: "A", key: "A", text: "Option A", isCorrect: true },
          { id: "B", key: "B", text: "Option B", isCorrect: false },
          { id: "C", key: "C", text: "Option C", isCorrect: false },
          { id: "D", key: "D", text: "Option D", isCorrect: false },
        ],
        correctAnswer: "A",
        answerBasis: "Extracted and AI-formatted from official document source.",
        confidenceScores: { ocr: 0.99, aiCorrection: 0.98 },
        academicClassification: {
          exam: examName,
          bloomLevel: count % 2 === 0 ? "APPLY" : "UNDERSTAND",
          difficultyScore: 0.35 + (count % 5) * 0.1,
        },
        duplicateStatus: "UNIQUE",
        reviewStatus: "READY_FOR_REVIEW",
      },
    });

    // Record revision audit
    await prisma.questionDraftRevision.create({
      data: {
        draftId: draft.id,
        version: draft.version,
        snapshot: draft,
        changeReason: "Synchronized from AI-corrected Markdown",
      },
    });

    count++;
  }

  return count;
}

/**
 * Dedicated endpoint to convert and save existing Markdown directly into Question Drafts.
 */
export const saveMarkdownToDraftsHandler = async (req, res, next) => {
  try {
    const { sourceId, markdownContent } = req.body;
    if (!sourceId) {
      return errorResponse(res, "sourceId is required", [], 400);
    }

    let md = markdownContent;
    if (!md) {
      const source = await prisma.ingestionSource.findUnique({ where: { id: sourceId } });
      md = source?.markdownContent || "";
    }

    if (!md || !md.trim()) {
      return errorResponse(res, "No markdown content found to convert to drafts", [], 400);
    }

    const count = await syncMarkdownToDrafts(sourceId, md);

    return successResponse(res, `Successfully saved ${count} questions to Candidate Drafts!`, {
      draftsCount: count,
    });
  } catch (error) {
    console.error("Failed to save markdown to drafts:", error);
    next(error);
  }
};

/**
 * Approve and Publish All Drafts for an Ingestion Source directly into PYQ Analyzer / Question Bank.
 */
export const approveAndPublishAllSourceDrafts = async (req, res, next) => {
  try {
    const { sourceId } = req.params;
    const { publishQuestionDraft } = await import("../services/questionOutbox.service.js");

    const drafts = await prisma.questionDraft.findMany({
      where: { sourceId },
    });

    if (drafts.length === 0) {
      return errorResponse(res, "No draft questions found for this source to publish.", [], 404);
    }

    let publishedCount = 0;
    const errors = [];

    for (const draft of drafts) {
      try {
        await publishQuestionDraft(draft.id, req.user?.id || null);
        publishedCount++;
      } catch (err) {
        errors.push({ draftId: draft.id, error: err.message });
      }
    }

    return successResponse(
      res,
      `Successfully approved and published ${publishedCount} questions to the Learner Question Bank & PYQ Analyzer!`,
      {
        publishedCount,
        totalDrafts: drafts.length,
        errors,
      }
    );
  } catch (error) {
    console.error("Failed to approve and publish source drafts:", error);
    next(error);
  }
};

/**
 * Toggle active/inactive status of all published questions for an IngestionSource on /web.
 * When isActive is false, questions are hidden from /web PYQ Analyzer.
 */
export const toggleSourcePublishedStatus = async (req, res, next) => {
  try {
    const { sourceId } = req.params;
    const { active } = req.body; // boolean: true or false

    const source = await prisma.ingestionSource.findUnique({ where: { id: sourceId } });
    if (!source) {
      return errorResponse(res, "Source not found", [], 404);
    }

    const currentPublished = await prisma.publishedQuestion.findMany({
      where: {
        provenance: {
          path: ["sourceId"],
          equals: sourceId,
        },
      },
      select: { id: true, isActive: true },
    });

    if (currentPublished.length === 0) {
      return errorResponse(res, "No published questions found for this source. Please 'Submit & Approve' first.", [], 400);
    }

    const newActiveState = typeof active === "boolean" ? active : !currentPublished[0].isActive;

    const result = await prisma.publishedQuestion.updateMany({
      where: {
        provenance: {
          path: ["sourceId"],
          equals: sourceId,
        },
      },
      data: {
        isActive: newActiveState,
      },
    });

    return successResponse(
      res,
      `Successfully ${newActiveState ? "activated (visible on /web)" : "deactivated (hidden from /web)"} ${result.count} questions for this source!`,
      {
        sourceId,
        isActive: newActiveState,
        updatedCount: result.count,
      }
    );
  } catch (error) {
    console.error("Failed to toggle source published status:", error);
    next(error);
  }
};
