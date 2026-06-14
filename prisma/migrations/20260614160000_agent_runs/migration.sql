-- CreateEnum
CREATE TYPE "AgentName" AS ENUM ('COO', 'EVENT_PLANNER', 'FORM', 'LANDING_PAGE', 'MARKETING', 'DESIGN', 'MEETING', 'ANALYTICS', 'DOCUMENTATION');

-- CreateEnum
CREATE TYPE "AgentRunStatus" AS ENUM ('QUEUED', 'RUNNING', 'SUCCEEDED', 'FAILED');

-- CreateEnum
CREATE TYPE "AgentApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'NOT_REQUIRED');

-- CreateTable
CREATE TABLE "AgentRun" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "eventId" TEXT,
  "agentName" "AgentName" NOT NULL,
  "status" "AgentRunStatus" NOT NULL DEFAULT 'QUEUED',
  "approvalStatus" "AgentApprovalStatus" NOT NULL DEFAULT 'PENDING',
  "input" JSONB NOT NULL,
  "output" JSONB,
  "error" TEXT,
  "attempt" INTEGER NOT NULL DEFAULT 1,
  "retryOfId" TEXT,
  "requiresApproval" BOOLEAN NOT NULL DEFAULT true,
  "approvedAt" TIMESTAMP(3),
  "approvedBy" TEXT,
  "rejectedAt" TIMESTAMP(3),
  "rejectedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "startedAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "AgentRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AgentRun_organizationId_idx" ON "AgentRun"("organizationId");

-- CreateIndex
CREATE INDEX "AgentRun_eventId_idx" ON "AgentRun"("eventId");

-- CreateIndex
CREATE INDEX "AgentRun_agentName_idx" ON "AgentRun"("agentName");

-- CreateIndex
CREATE INDEX "AgentRun_status_idx" ON "AgentRun"("status");

-- CreateIndex
CREATE INDEX "AgentRun_approvalStatus_idx" ON "AgentRun"("approvalStatus");

-- AddForeignKey
ALTER TABLE "AgentRun" ADD CONSTRAINT "AgentRun_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentRun" ADD CONSTRAINT "AgentRun_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentRun" ADD CONSTRAINT "AgentRun_retryOfId_fkey" FOREIGN KEY ("retryOfId") REFERENCES "AgentRun"("id") ON DELETE SET NULL ON UPDATE CASCADE;
