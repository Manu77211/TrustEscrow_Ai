-- AlterEnum
ALTER TYPE "SubmissionStatus" ADD VALUE IF NOT EXISTS 'CHANGES_REQUESTED';

-- AlterTable
ALTER TABLE "Submission"
  ADD COLUMN "clientFeedback" TEXT;
