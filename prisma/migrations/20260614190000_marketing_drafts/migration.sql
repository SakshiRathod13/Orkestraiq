-- CreateTable
CREATE TABLE "MarketingDraft" (
  "id" TEXT NOT NULL,
  "eventId" TEXT NOT NULL,
  "approvalStatus" "AgentApprovalStatus" NOT NULL DEFAULT 'PENDING',
  "emailCampaign" JSONB NOT NULL,
  "whatsappMessages" JSONB NOT NULL,
  "linkedInPost" JSONB NOT NULL,
  "instagramCaption" JSONB NOT NULL,
  "reminderSequence" JSONB NOT NULL,
  "posterPrompt" JSONB NOT NULL,
  "certificateTemplate" JSONB NOT NULL,
  "approvedAt" TIMESTAMP(3),
  "approvedBy" TEXT,
  "rejectedAt" TIMESTAMP(3),
  "rejectedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "MarketingDraft_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MarketingDraft_eventId_key" ON "MarketingDraft"("eventId");

-- CreateIndex
CREATE INDEX "MarketingDraft_approvalStatus_idx" ON "MarketingDraft"("approvalStatus");

-- AddForeignKey
ALTER TABLE "MarketingDraft" ADD CONSTRAINT "MarketingDraft_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
