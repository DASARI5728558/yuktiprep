import prisma from "../config/prisma.js";

/**
 * Publishes an approved QuestionDraft into the transactional outbox
 * and projects it onto PublishedQuestion for learner consumption.
 */
export const publishQuestionDraft = async (draftId, adminUserId = null) => {
  return await prisma.$transaction(async (tx) => {
    const draft = await tx.questionDraft.findUnique({
      where: { id: draftId },
      include: {
        source: {
          include: { exam: true },
        },
      },
    });

    if (!draft) {
      throw new Error(`QuestionDraft ${draftId} not found`);
    }

    // Must be accepted or ready
    const updatedDraft = await tx.questionDraft.update({
      where: { id: draftId },
      data: {
        reviewStatus: "ACCEPTED",
        updatedAt: new Date(),
      },
    });

    // Create immutable audit revision
    await tx.questionDraftRevision.create({
      data: {
        draftId: draft.id,
        version: draft.version + 1,
        snapshot: updatedDraft,
        changedBy: adminUserId,
        changeReason: "Draft approved and published to Question Bank",
      },
    });

    // Determine examId (fallback to first active exam if not linked)
    let examId = draft.source.examId;
    if (!examId) {
      const defaultExam = await tx.exam.findFirst({ where: { isActive: true } });
      examId = defaultExam ? defaultExam.id : null;
    }

    if (!examId) {
      throw new Error("No associated Exam found to publish question projection.");
    }

    const examYear = draft.source.metadata?.year ? Number(draft.source.metadata.year) : new Date().getFullYear();

    // Upsert PublishedQuestion projection
    const published = await tx.publishedQuestion.upsert({
      where: { intelligenceDraftId: draft.id },
      update: {
        questionText: draft.questionText,
        questionType: draft.questionType,
        options: draft.options,
        correctAnswer: draft.correctAnswer,
        explanation: draft.answerBasis,
        passage: draft.passage,
        bloomLevel: draft.academicClassification?.bloomLevel || null,
        difficulty: draft.academicClassification?.difficultyScore ? (draft.academicClassification.difficultyScore > 0.6 ? "HARD" : draft.academicClassification.difficultyScore > 0.3 ? "MEDIUM" : "EASY") : "MEDIUM",
        sourceName: draft.source.name,
        sourceYear: examYear,
        provenance: {
          sourceId: draft.sourceId,
          pageNumber: draft.pageNumber,
          boundingBox: draft.boundingBox,
          checksum: draft.source.checksum,
        },
        publishedVersion: { increment: 1 },
        isActive: true,
        isPublished: true,
      },
      create: {
        intelligenceDraftId: draft.id,
        examId,
        questionText: draft.questionText,
        questionType: draft.questionType,
        options: draft.options,
        correctAnswer: draft.correctAnswer,
        explanation: draft.answerBasis,
        passage: draft.passage,
        bloomLevel: draft.academicClassification?.bloomLevel || null,
        difficulty: draft.academicClassification?.difficultyScore ? (draft.academicClassification.difficultyScore > 0.6 ? "HARD" : draft.academicClassification.difficultyScore > 0.3 ? "MEDIUM" : "EASY") : "MEDIUM",
        sourceName: draft.source.name,
        sourceYear: examYear,
        provenance: {
          sourceId: draft.sourceId,
          pageNumber: draft.pageNumber,
          boundingBox: draft.boundingBox,
          checksum: draft.source.checksum,
        },
        publishedVersion: 1,
        isActive: true,
        isPublished: true,
      },
    });

    // Create Outbox Event
    const outboxEvent = await tx.questionOutboxEvent.create({
      data: {
        aggregateType: "QUESTION_INTELLIGENCE",
        aggregateId: draft.id,
        eventType: "QUESTION_PUBLISHED",
        payload: {
          draftId: draft.id,
          publishedQuestionId: published.id,
          examId,
          version: published.publishedVersion,
          timestamp: new Date().toISOString(),
        },
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
    });

    return { draft: updatedDraft, published, outboxEvent };
  });
};
