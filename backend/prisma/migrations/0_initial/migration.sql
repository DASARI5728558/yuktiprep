-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "TranslationStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" UUID NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" VARCHAR(50) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exam" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "shortDescription" TEXT,
    "description" TEXT,
    "logoUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Exam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subject" (
    "id" UUID NOT NULL,
    "examId" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Topic" (
    "id" UUID NOT NULL,
    "subjectId" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Syllabus" (
    "id" UUID NOT NULL,
    "examId" UUID NOT NULL,
    "subjectId" UUID,
    "title" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "content" TEXT NOT NULL,
    "seoTitle" VARCHAR(255),
    "seoDescription" TEXT,
    "canonicalUrl" TEXT,
    "status" VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Syllabus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PYQ" (
    "id" UUID NOT NULL,
    "examId" UUID NOT NULL,
    "subjectId" UUID,
    "topicId" UUID,
    "question" TEXT NOT NULL,
    "questionType" VARCHAR(50),
    "options" JSONB,
    "correctAnswer" TEXT,
    "explanation" TEXT,
    "year" INTEGER,
    "paper" VARCHAR(255),
    "difficulty" VARCHAR(50),
    "source" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PYQ_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CurrentAffair" (
    "id" UUID NOT NULL,
    "title" VARCHAR(500) NOT NULL,
    "slug" VARCHAR(500) NOT NULL,
    "summary" TEXT,
    "content" TEXT NOT NULL,
    "category" VARCHAR(255),
    "examId" UUID,
    "subjectId" UUID,
    "importance" VARCHAR(50),
    "publishedAt" TIMESTAMPTZ(6),
    "lastVerifiedAt" TIMESTAMPTZ(6),
    "sourceName" VARCHAR(500),
    "sourceUrl" TEXT,
    "reviewerName" VARCHAR(255),
    "aiAssistance" BOOLEAN NOT NULL DEFAULT false,
    "status" VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    "seoTitle" VARCHAR(255),
    "seoDescription" TEXT,
    "canonicalUrl" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CurrentAffair_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeoPage" (
    "id" UUID NOT NULL,
    "pageType" VARCHAR(100) NOT NULL,
    "title" VARCHAR(500) NOT NULL,
    "slug" VARCHAR(500) NOT NULL,
    "content" TEXT,
    "seoTitle" VARCHAR(255),
    "seoDescription" TEXT,
    "canonicalUrl" TEXT,
    "ogTitle" VARCHAR(255),
    "ogDescription" TEXT,
    "ogImage" TEXT,
    "robotsIndex" BOOLEAN NOT NULL DEFAULT true,
    "robotsFollow" BOOLEAN NOT NULL DEFAULT true,
    "schemaType" VARCHAR(100),
    "status" VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SeoPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Redirect" (
    "id" UUID NOT NULL,
    "oldPath" TEXT NOT NULL,
    "newPath" TEXT NOT NULL,
    "statusCode" INTEGER NOT NULL DEFAULT 301,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Redirect_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" UUID NOT NULL,
    "adminUserId" UUID,
    "action" VARCHAR(100) NOT NULL,
    "entityType" VARCHAR(100),
    "entityId" UUID,
    "oldData" JSONB,
    "newData" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "phoneNumber" VARCHAR(20),
    "email" VARCHAR(255),
    "name" VARCHAR(150),
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "passwordHash" VARCHAR(255),
    "role" VARCHAR(50) DEFAULT 'USER',
    "examTargets" JSONB DEFAULT '[]',
    "preferredTopics" JSONB DEFAULT '[]',
    "language" VARCHAR(12) DEFAULT 'en',
    "state" VARCHAR(80),
    "difficulty" VARCHAR(20) DEFAULT 'mixed',
    "timezone" VARCHAR(64) DEFAULT 'Asia/Kolkata',
    "deliveryHour" INTEGER DEFAULT 7,
    "channels" JSONB DEFAULT '["in_app"]',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "profilePic" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "languages" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "azureCode" TEXT,
    "englishName" VARCHAR(100) NOT NULL,
    "nativeName" VARCHAR(100) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "languages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_language_preferences" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "languageId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_language_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_jobs" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "jobId" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearnerProfile" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "targetExamId" UUID,
    "attemptYear" INTEGER,
    "studyHoursPerDay" DOUBLE PRECISION,
    "preferredLanguage" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LearnerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "otp_verifications" (
    "id" UUID NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "purpose" VARCHAR(20) NOT NULL DEFAULT 'LOGIN',
    "otpHash" VARCHAR(255) NOT NULL,
    "expiresAt" TIMESTAMPTZ(6) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otp_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "items" (
    "id" TEXT NOT NULL,
    "event_key" TEXT NOT NULL,
    "source_key" TEXT NOT NULL,
    "source_name" TEXT NOT NULL,
    "organisation" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "published_at" TIMESTAMPTZ(6) NOT NULL,
    "collected_at" TIMESTAMPTZ(6) NOT NULL,
    "theme" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "source_confidence" INTEGER NOT NULL,
    "prelims" INTEGER NOT NULL,
    "mains" INTEGER NOT NULL,
    "pcs" INTEGER NOT NULL,
    "ssc" INTEGER NOT NULL,
    "banking" INTEGER NOT NULL,
    "static_link" TEXT NOT NULL,

    CONSTRAINT "items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item_translations" (
    "id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "language" VARCHAR(12) NOT NULL,
    "title" TEXT,
    "summary" TEXT,
    "status" "TranslationStatus" NOT NULL DEFAULT 'PENDING',
    "provider" VARCHAR(50),
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "item_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dead_letters" (
    "id" SERIAL NOT NULL,
    "source_key" TEXT,
    "stage" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "payload" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dead_letters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "source_runs" (
    "id" SERIAL NOT NULL,
    "source_key" TEXT NOT NULL,
    "started_at" TIMESTAMPTZ(6) NOT NULL,
    "completed_at" TIMESTAMPTZ(6),
    "success" BOOLEAN NOT NULL DEFAULT false,
    "http_status" INTEGER,
    "found_count" INTEGER NOT NULL DEFAULT 0,
    "saved_count" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,

    CONSTRAINT "source_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questions" (
    "id" TEXT NOT NULL,
    "event_key" TEXT NOT NULL,
    "theme" TEXT NOT NULL,
    "exam" TEXT NOT NULL,
    "question_type" TEXT NOT NULL,
    "priority" INTEGER NOT NULL,
    "question" TEXT NOT NULL,
    "answer_basis" TEXT NOT NULL,
    "source_url" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "answer" TEXT,
    "options" JSONB,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jobs" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "organization" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "postDate" TEXT NOT NULL,
    "lastDate" TEXT NOT NULL,
    "applyByDate" TEXT,
    "qualification" JSONB NOT NULL,
    "totalPosts" TEXT NOT NULL,
    "salary" TEXT,
    "ageLimit" TEXT,
    "applicationFee" TEXT,
    "selectionProcess" TEXT,
    "officialPdfUrl" TEXT,
    "sourceUrl" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "publicationSource" TEXT,
    "employmentType" TEXT,
    "examProjectedDate" TEXT,
    "expectedResultsDate" TEXT,
    "uniqueCapabilities" TEXT,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plans" (
    "id" UUID NOT NULL,
    "key" VARCHAR(100) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "subtitle" VARCHAR(255),
    "price" INTEGER NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'INR',
    "billingInterval" VARCHAR(20) NOT NULL DEFAULT 'monthly',
    "razorpayPlanId" VARCHAR(255),
    "badgeText" VARCHAR(100),
    "badgeType" VARCHAR(50),
    "theme" VARCHAR(50),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_features" (
    "id" UUID NOT NULL,
    "planId" UUID NOT NULL,
    "text" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "plan_features_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "planId" UUID NOT NULL,
    "razorpaySubscriptionId" VARCHAR(255),
    "razorpayCustomerId" VARCHAR(255),
    "status" VARCHAR(50) NOT NULL DEFAULT 'pending',
    "currentStart" TIMESTAMPTZ(6),
    "currentEnd" TIMESTAMPTZ(6),
    "cancelAtCycleEnd" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "subscriptionId" UUID NOT NULL,
    "planId" UUID NOT NULL,
    "razorpayPaymentId" VARCHAR(255),
    "amount" INTEGER NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'INR',
    "status" VARCHAR(50) NOT NULL DEFAULT 'pending',
    "method" VARCHAR(50),
    "rawResponse" JSONB,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhook_events" (
    "id" UUID NOT NULL,
    "razorpayEventId" VARCHAR(255) NOT NULL,
    "eventType" VARCHAR(100) NOT NULL,
    "payload" JSONB NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "processedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "webhook_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consents" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "version" VARCHAR(50) NOT NULL,
    "audio" BOOLEAN NOT NULL,
    "video" BOOLEAN NOT NULL,
    "aiProcessing" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMPTZ(6),

    CONSTRAINT "consents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interview_sessions" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "examId" VARCHAR(255) NOT NULL,
    "topic" VARCHAR(500) NOT NULL,
    "mode" VARCHAR(50) NOT NULL,
    "level" VARCHAR(50) NOT NULL,
    "locale" VARCHAR(20) NOT NULL,
    "media" VARCHAR(20) NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'CREATED',
    "roomName" VARCHAR(255) NOT NULL,
    "startedAt" TIMESTAMPTZ(6),
    "endedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "candidateProfile" JSONB,

    CONSTRAINT "interview_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interview_events" (
    "id" UUID NOT NULL,
    "sessionId" UUID NOT NULL,
    "type" VARCHAR(100) NOT NULL,
    "occurredAt" TIMESTAMPTZ(6) NOT NULL,
    "payload" JSONB NOT NULL,

    CONSTRAINT "interview_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interview_recordings" (
    "id" UUID NOT NULL,
    "sessionId" UUID NOT NULL,
    "objectKey" TEXT NOT NULL,
    "kind" VARCHAR(50) NOT NULL,
    "durationSec" INTEGER,
    "checksum" VARCHAR(255),
    "expiresAt" TIMESTAMPTZ(6) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "interview_recordings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interview_feedback" (
    "id" UUID NOT NULL,
    "sessionId" UUID NOT NULL,
    "overall" DOUBLE PRECISION NOT NULL,
    "dimensions" JSONB NOT NULL,
    "strengths" VARCHAR(500)[],
    "improvements" VARCHAR(500)[],
    "nextActions" VARCHAR(500)[],
    "transcript" JSONB,
    "safetyFlags" JSONB,
    "modelVersion" VARCHAR(100) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "interview_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whatsapp_templates" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "language" VARCHAR(12) NOT NULL DEFAULT 'en_US',
    "category" VARCHAR(100) NOT NULL DEFAULT 'UTILITY',
    "status" VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    "bodyComponents" JSONB,
    "headerType" VARCHAR(50),
    "mediaUrl" TEXT,
    "metaTemplateId" VARCHAR(255),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "whatsapp_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whatsapp_campaigns" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "templateId" UUID NOT NULL,
    "audienceFilter" JSONB,
    "scheduledAt" TIMESTAMPTZ(6),
    "status" VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    "totalTargeted" INTEGER NOT NULL DEFAULT 0,
    "totalSent" INTEGER NOT NULL DEFAULT 0,
    "totalFailed" INTEGER NOT NULL DEFAULT 0,
    "createdBy" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "whatsapp_campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whatsapp_conversations" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "waId" VARCHAR(20) NOT NULL,
    "state" VARCHAR(100) NOT NULL DEFAULT 'NEW',
    "humanHandoff" BOOLEAN NOT NULL DEFAULT false,
    "context" JSONB,
    "lastInboundAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "whatsapp_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whatsapp_messages" (
    "id" UUID NOT NULL,
    "conversationId" UUID NOT NULL,
    "userId" UUID,
    "providerMessageId" VARCHAR(255),
    "direction" VARCHAR(20) NOT NULL,
    "type" VARCHAR(50) NOT NULL DEFAULT 'text',
    "body" TEXT,
    "status" VARCHAR(50) NOT NULL DEFAULT 'SENT',
    "payload" JSONB,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "whatsapp_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whatsapp_bot_rules" (
    "id" UUID NOT NULL,
    "trigger" VARCHAR(100) NOT NULL,
    "category" VARCHAR(100) NOT NULL DEFAULT 'COMMAND',
    "actionType" VARCHAR(50) NOT NULL,
    "actionPayload" JSONB,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "whatsapp_bot_rules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Exam_slug_key" ON "Exam"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_examId_slug_key" ON "Subject"("examId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Topic_subjectId_slug_key" ON "Topic"("subjectId", "slug");

-- CreateIndex
CREATE INDEX "PYQ_examId_idx" ON "PYQ"("examId");

-- CreateIndex
CREATE INDEX "PYQ_subjectId_idx" ON "PYQ"("subjectId");

-- CreateIndex
CREATE INDEX "PYQ_topicId_idx" ON "PYQ"("topicId");

-- CreateIndex
CREATE INDEX "PYQ_year_idx" ON "PYQ"("year");

-- CreateIndex
CREATE INDEX "PYQ_difficulty_idx" ON "PYQ"("difficulty");

-- CreateIndex
CREATE UNIQUE INDEX "CurrentAffair_slug_key" ON "CurrentAffair"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "SeoPage_slug_key" ON "SeoPage"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Redirect_oldPath_key" ON "Redirect"("oldPath");

-- CreateIndex
CREATE UNIQUE INDEX "users_phoneNumber_key" ON "users"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "languages_code_key" ON "languages"("code");

-- CreateIndex
CREATE UNIQUE INDEX "languages_azureCode_key" ON "languages"("azureCode");

-- CreateIndex
CREATE UNIQUE INDEX "user_language_preferences_userId_key" ON "user_language_preferences"("userId");

-- CreateIndex
CREATE INDEX "user_language_preferences_languageId_idx" ON "user_language_preferences"("languageId");

-- CreateIndex
CREATE UNIQUE INDEX "saved_jobs_userId_jobId_key" ON "saved_jobs"("userId", "jobId");

-- CreateIndex
CREATE UNIQUE INDEX "LearnerProfile_userId_key" ON "LearnerProfile"("userId");

-- CreateIndex
CREATE INDEX "otp_verifications_phone_idx" ON "otp_verifications"("phone");

-- CreateIndex
CREATE INDEX "ix_items_published" ON "items"("published_at");

-- CreateIndex
CREATE INDEX "ix_items_event_key" ON "items"("event_key");

-- CreateIndex
CREATE INDEX "ix_items_theme" ON "items"("theme");

-- CreateIndex
CREATE UNIQUE INDEX "uq_item_translation_item_language" ON "item_translations"("item_id", "language");

-- CreateIndex
CREATE UNIQUE INDEX "plans_key_key" ON "plans"("key");

-- CreateIndex
CREATE INDEX "plans_sortOrder_idx" ON "plans"("sortOrder");

-- CreateIndex
CREATE INDEX "plans_isActive_idx" ON "plans"("isActive");

-- CreateIndex
CREATE INDEX "plan_features_planId_idx" ON "plan_features"("planId");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_razorpaySubscriptionId_key" ON "subscriptions"("razorpaySubscriptionId");

-- CreateIndex
CREATE INDEX "subscriptions_userId_idx" ON "subscriptions"("userId");

-- CreateIndex
CREATE INDEX "subscriptions_planId_idx" ON "subscriptions"("planId");

-- CreateIndex
CREATE INDEX "subscriptions_status_idx" ON "subscriptions"("status");

-- CreateIndex
CREATE UNIQUE INDEX "payments_razorpayPaymentId_key" ON "payments"("razorpayPaymentId");

-- CreateIndex
CREATE INDEX "payments_userId_idx" ON "payments"("userId");

-- CreateIndex
CREATE INDEX "payments_subscriptionId_idx" ON "payments"("subscriptionId");

-- CreateIndex
CREATE INDEX "payments_planId_idx" ON "payments"("planId");

-- CreateIndex
CREATE UNIQUE INDEX "webhook_events_razorpayEventId_key" ON "webhook_events"("razorpayEventId");

-- CreateIndex
CREATE INDEX "webhook_events_razorpayEventId_idx" ON "webhook_events"("razorpayEventId");

-- CreateIndex
CREATE INDEX "webhook_events_processed_idx" ON "webhook_events"("processed");

-- CreateIndex
CREATE UNIQUE INDEX "interview_sessions_roomName_key" ON "interview_sessions"("roomName");

-- CreateIndex
CREATE INDEX "interview_sessions_userId_createdAt_idx" ON "interview_sessions"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "interview_events_sessionId_occurredAt_idx" ON "interview_events"("sessionId", "occurredAt");

-- CreateIndex
CREATE UNIQUE INDEX "interview_feedback_sessionId_key" ON "interview_feedback"("sessionId");

-- CreateIndex
CREATE INDEX "whatsapp_templates_status_idx" ON "whatsapp_templates"("status");

-- CreateIndex
CREATE INDEX "whatsapp_templates_isActive_idx" ON "whatsapp_templates"("isActive");

-- CreateIndex
CREATE INDEX "whatsapp_campaigns_status_idx" ON "whatsapp_campaigns"("status");

-- CreateIndex
CREATE INDEX "whatsapp_campaigns_createdBy_idx" ON "whatsapp_campaigns"("createdBy");

-- CreateIndex
CREATE UNIQUE INDEX "whatsapp_conversations_waId_key" ON "whatsapp_conversations"("waId");

-- CreateIndex
CREATE INDEX "whatsapp_conversations_userId_idx" ON "whatsapp_conversations"("userId");

-- CreateIndex
CREATE INDEX "whatsapp_conversations_state_idx" ON "whatsapp_conversations"("state");

-- CreateIndex
CREATE INDEX "whatsapp_conversations_humanHandoff_idx" ON "whatsapp_conversations"("humanHandoff");

-- CreateIndex
CREATE INDEX "whatsapp_messages_conversationId_idx" ON "whatsapp_messages"("conversationId");

-- CreateIndex
CREATE INDEX "whatsapp_messages_userId_idx" ON "whatsapp_messages"("userId");

-- CreateIndex
CREATE INDEX "whatsapp_messages_direction_idx" ON "whatsapp_messages"("direction");

-- CreateIndex
CREATE INDEX "whatsapp_messages_createdAt_idx" ON "whatsapp_messages"("createdAt");

-- CreateIndex
CREATE INDEX "whatsapp_bot_rules_category_idx" ON "whatsapp_bot_rules"("category");

-- CreateIndex
CREATE INDEX "whatsapp_bot_rules_isActive_idx" ON "whatsapp_bot_rules"("isActive");

-- AddForeignKey
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Syllabus" ADD CONSTRAINT "Syllabus_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Syllabus" ADD CONSTRAINT "Syllabus_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PYQ" ADD CONSTRAINT "PYQ_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PYQ" ADD CONSTRAINT "PYQ_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PYQ" ADD CONSTRAINT "PYQ_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CurrentAffair" ADD CONSTRAINT "CurrentAffair_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CurrentAffair" ADD CONSTRAINT "CurrentAffair_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_language_preferences" ADD CONSTRAINT "user_language_preferences_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "languages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_language_preferences" ADD CONSTRAINT "user_language_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_jobs" ADD CONSTRAINT "saved_jobs_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_jobs" ADD CONSTRAINT "saved_jobs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearnerProfile" ADD CONSTRAINT "LearnerProfile_targetExamId_fkey" FOREIGN KEY ("targetExamId") REFERENCES "Exam"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearnerProfile" ADD CONSTRAINT "LearnerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_translations" ADD CONSTRAINT "item_translations_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_features" ADD CONSTRAINT "plan_features_planId_fkey" FOREIGN KEY ("planId") REFERENCES "plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_planId_fkey" FOREIGN KEY ("planId") REFERENCES "plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_planId_fkey" FOREIGN KEY ("planId") REFERENCES "plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consents" ADD CONSTRAINT "consents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_sessions" ADD CONSTRAINT "interview_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_events" ADD CONSTRAINT "interview_events_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "interview_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_recordings" ADD CONSTRAINT "interview_recordings_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "interview_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_feedback" ADD CONSTRAINT "interview_feedback_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "interview_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "whatsapp_campaigns" ADD CONSTRAINT "whatsapp_campaigns_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "whatsapp_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "whatsapp_campaigns" ADD CONSTRAINT "whatsapp_campaigns_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "AdminUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "whatsapp_conversations" ADD CONSTRAINT "whatsapp_conversations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "whatsapp_messages" ADD CONSTRAINT "whatsapp_messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "whatsapp_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "whatsapp_messages" ADD CONSTRAINT "whatsapp_messages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
