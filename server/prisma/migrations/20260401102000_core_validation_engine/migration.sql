-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('SUBMITTED', 'VALIDATED', 'REJECTED');

-- AlterTable Submission
ALTER TABLE "Submission"
  ADD COLUMN "status" "SubmissionStatus" NOT NULL DEFAULT 'SUBMITTED',
  ADD COLUMN "clientRating" DOUBLE PRECISION;

-- CreateTable ValidationCriteria
CREATE TABLE "ValidationCriteria" (
  "id" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "milestoneId" TEXT,
  "type" "WorkType" NOT NULL,
  "rules" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ValidationCriteria_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "ValidationCriteria"
  ADD CONSTRAINT "ValidationCriteria_projectId_fkey"
  FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ValidationCriteria"
  ADD CONSTRAINT "ValidationCriteria_milestoneId_fkey"
  FOREIGN KEY ("milestoneId") REFERENCES "Milestone"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Prepare existing ValidationReport rows for structural change
DELETE FROM "ValidationReport";

-- Rename/alter ValidationReport columns
ALTER TABLE "ValidationReport" RENAME COLUMN "timelinessScore" TO "systemScore";
ALTER TABLE "ValidationReport" RENAME COLUMN "reportJson" TO "breakdown";
ALTER TABLE "ValidationReport" ADD COLUMN "submissionId" TEXT;

-- Replace ValidationDecision enum values
CREATE TYPE "ValidationDecision_new" AS ENUM ('APPROVED', 'DISPUTED');
ALTER TABLE "ValidationReport"
  ALTER COLUMN "decision" DROP DEFAULT,
  ALTER COLUMN "decision" TYPE "ValidationDecision_new"
  USING (CASE
    WHEN "decision" = 'DISPUTED' THEN 'DISPUTED'::"ValidationDecision_new"
    ELSE 'APPROVED'::"ValidationDecision_new"
  END);
DROP TYPE "ValidationDecision";
ALTER TYPE "ValidationDecision_new" RENAME TO "ValidationDecision";

-- Backfill submissionId from related milestone when possible
UPDATE "ValidationReport" vr
SET "submissionId" = s.id
FROM "Submission" s
WHERE vr."milestoneId" = s."milestoneId"
  AND vr."submissionId" IS NULL;

-- If any remain null (due to old detached rows), leave table empty and enforce required relation
DELETE FROM "ValidationReport" WHERE "submissionId" IS NULL;

ALTER TABLE "ValidationReport"
  ALTER COLUMN "submissionId" SET NOT NULL,
  ALTER COLUMN "decision" DROP DEFAULT;

ALTER TABLE "ValidationReport"
  ADD CONSTRAINT "ValidationReport_submissionId_fkey"
  FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE UNIQUE INDEX "ValidationReport_submissionId_key" ON "ValidationReport"("submissionId");
