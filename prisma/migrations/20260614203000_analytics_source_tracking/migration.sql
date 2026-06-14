-- AlterTable
ALTER TABLE "Attendee" ADD COLUMN "source" TEXT NOT NULL DEFAULT 'direct';

-- CreateIndex
CREATE INDEX "Attendee_source_idx" ON "Attendee"("source");
