-- CreateEnum
CREATE TYPE "EventBriefStatus" AS ENUM ('DRAFT', 'APPROVED');

-- CreateTable
CREATE TABLE "EventBrief" (
  "id" TEXT NOT NULL,
  "eventId" TEXT NOT NULL,
  "originalPrompt" TEXT NOT NULL,
  "status" "EventBriefStatus" NOT NULL DEFAULT 'DRAFT',
  "eventType" "EventType",
  "topic" TEXT,
  "targetAudience" TEXT,
  "mode" TEXT,
  "location" TEXT,
  "dateTimeText" TEXT,
  "durationMinutes" INTEGER,
  "priceCents" INTEGER,
  "currency" TEXT NOT NULL DEFAULT 'INR',
  "targetAttendees" INTEGER,
  "language" TEXT,
  "tone" TEXT,
  "goal" TEXT,
  "missingFields" JSONB NOT NULL DEFAULT '[]',
  "missingQuestions" JSONB NOT NULL DEFAULT '[]',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "EventBrief_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EventBrief_eventId_key" ON "EventBrief"("eventId");

-- CreateIndex
CREATE INDEX "EventBrief_status_idx" ON "EventBrief"("status");

-- AddForeignKey
ALTER TABLE "EventBrief" ADD CONSTRAINT "EventBrief_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
