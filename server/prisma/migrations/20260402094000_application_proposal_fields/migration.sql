-- AlterTable
ALTER TABLE "ProjectApplication"
  ADD COLUMN "proposedAmount" DOUBLE PRECISION,
  ADD COLUMN "estimatedDays" INTEGER,
  ADD COLUMN "deliverables" TEXT;
