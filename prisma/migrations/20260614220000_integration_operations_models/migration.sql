-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('DRAFT', 'APPROVAL_REQUIRED', 'APPROVED', 'SCHEDULED', 'SENT', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MessageChannel" AS ENUM ('EMAIL', 'WHATSAPP', 'LINKEDIN', 'INSTAGRAM', 'SMS');

-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('DRAFT', 'APPROVAL_REQUIRED', 'APPROVED', 'QUEUED', 'SENT', 'FAILED');

-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('RAZORPAY', 'STRIPE');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "MeetingProvider" AS ENUM ('GOOGLE_MEET', 'ZOOM', 'OFFLINE', 'OTHER');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'BLOCKED', 'DONE');

-- CreateEnum
CREATE TYPE "IntegrationProvider" AS ENUM ('GMAIL', 'GOOGLE_CALENDAR', 'GOOGLE_MEET', 'ZOOM', 'RAZORPAY', 'STRIPE', 'WHATSAPP_BUSINESS');

-- CreateEnum
CREATE TYPE "IntegrationStatus" AS ENUM ('NOT_CONFIGURED', 'CONFIGURED', 'NEEDS_REAUTH', 'DISABLED');

-- CreateTable
CREATE TABLE "Campaign" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "eventId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "status" "CampaignStatus" NOT NULL DEFAULT 'DRAFT',
  "channel" "MessageChannel" NOT NULL,
  "draftContent" JSONB NOT NULL,
  "approvedAt" TIMESTAMP(3),
  "approvedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageLog" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "eventId" TEXT NOT NULL,
  "campaignId" TEXT,
  "channel" "MessageChannel" NOT NULL,
  "status" "MessageStatus" NOT NULL DEFAULT 'DRAFT',
  "recipient" TEXT,
  "subject" TEXT,
  "body" TEXT NOT NULL,
  "provider" "IntegrationProvider",
  "providerMessageId" TEXT,
  "error" TEXT,
  "sentAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MessageLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "eventId" TEXT NOT NULL,
  "attendeeId" TEXT,
  "provider" "PaymentProvider" NOT NULL,
  "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
  "amountCents" INTEGER NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'INR',
  "providerPaymentId" TEXT,
  "metadata" JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Meeting" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "eventId" TEXT NOT NULL,
  "provider" "MeetingProvider" NOT NULL,
  "title" TEXT NOT NULL,
  "joinUrl" TEXT,
  "calendarEventId" TEXT,
  "startAt" TIMESTAMP(3),
  "endAt" TIMESTAMP(3),
  "metadata" JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Meeting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "eventId" TEXT,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "owner" TEXT,
  "status" "TaskStatus" NOT NULL DEFAULT 'TODO',
  "dueAt" TIMESTAMP(3),
  "sourceAgentRunId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalyticsSnapshot" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "eventId" TEXT NOT NULL,
  "metrics" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AnalyticsSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Integration" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "provider" "IntegrationProvider" NOT NULL,
  "status" "IntegrationStatus" NOT NULL DEFAULT 'NOT_CONFIGURED',
  "config" JSONB NOT NULL DEFAULT '{}',
  "credentialRef" TEXT,
  "lastCheckedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Integration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "eventId" TEXT,
  "actorId" TEXT,
  "action" TEXT NOT NULL,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT,
  "metadata" JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE INDEX "Campaign_organizationId_idx" ON "Campaign"("organizationId");
CREATE INDEX "Campaign_eventId_idx" ON "Campaign"("eventId");
CREATE INDEX "Campaign_status_idx" ON "Campaign"("status");
CREATE INDEX "Campaign_channel_idx" ON "Campaign"("channel");
CREATE INDEX "MessageLog_organizationId_idx" ON "MessageLog"("organizationId");
CREATE INDEX "MessageLog_eventId_idx" ON "MessageLog"("eventId");
CREATE INDEX "MessageLog_campaignId_idx" ON "MessageLog"("campaignId");
CREATE INDEX "MessageLog_status_idx" ON "MessageLog"("status");
CREATE INDEX "MessageLog_channel_idx" ON "MessageLog"("channel");
CREATE INDEX "Payment_organizationId_idx" ON "Payment"("organizationId");
CREATE INDEX "Payment_eventId_idx" ON "Payment"("eventId");
CREATE INDEX "Payment_attendeeId_idx" ON "Payment"("attendeeId");
CREATE INDEX "Payment_provider_idx" ON "Payment"("provider");
CREATE INDEX "Payment_status_idx" ON "Payment"("status");
CREATE UNIQUE INDEX "Meeting_eventId_key" ON "Meeting"("eventId");
CREATE INDEX "Meeting_organizationId_idx" ON "Meeting"("organizationId");
CREATE INDEX "Meeting_provider_idx" ON "Meeting"("provider");
CREATE INDEX "Task_organizationId_idx" ON "Task"("organizationId");
CREATE INDEX "Task_eventId_idx" ON "Task"("eventId");
CREATE INDEX "Task_status_idx" ON "Task"("status");
CREATE INDEX "AnalyticsSnapshot_organizationId_idx" ON "AnalyticsSnapshot"("organizationId");
CREATE INDEX "AnalyticsSnapshot_eventId_idx" ON "AnalyticsSnapshot"("eventId");
CREATE INDEX "AnalyticsSnapshot_createdAt_idx" ON "AnalyticsSnapshot"("createdAt");
CREATE UNIQUE INDEX "Integration_organizationId_provider_key" ON "Integration"("organizationId", "provider");
CREATE INDEX "Integration_status_idx" ON "Integration"("status");
CREATE INDEX "AuditLog_organizationId_idx" ON "AuditLog"("organizationId");
CREATE INDEX "AuditLog_eventId_idx" ON "AuditLog"("eventId");
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- Foreign keys
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MessageLog" ADD CONSTRAINT "MessageLog_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MessageLog" ADD CONSTRAINT "MessageLog_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Task" ADD CONSTRAINT "Task_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AnalyticsSnapshot" ADD CONSTRAINT "AnalyticsSnapshot_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Integration" ADD CONSTRAINT "Integration_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;
