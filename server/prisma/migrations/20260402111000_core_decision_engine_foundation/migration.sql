-- CreateEnum
CREATE TYPE "ContractCategory" AS ENUM ('WEB_BUILD', 'API_BACKEND', 'DATA_ML', 'CREATIVE_ASSET', 'MARKETING_CAMPAIGN');

-- CreateEnum
CREATE TYPE "EvidenceType" AS ENUM (
  'ARTIFACT_LINK',
  'COMMIT_HASH',
  'BUILD_LOG',
  'TEST_REPORT',
  'SCREENSHOT',
  'VIDEO',
  'REQUIREMENT_MAPPING',
  'METADATA'
);

-- AlterTable
ALTER TABLE "ValidationReport"
  ADD COLUMN "policyBand" TEXT,
  ADD COLUMN "requiresHumanReview" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "RubricTemplate" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "category" "ContractCategory" NOT NULL,
  "version" INTEGER NOT NULL DEFAULT 1,
  "criteria" JSONB NOT NULL,
  "hardFailRules" JSONB NOT NULL,
  "weightConfig" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "RubricTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvaluationContract" (
  "id" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "rubricTemplateId" TEXT,
  "category" "ContractCategory" NOT NULL,
  "requiredOutputs" JSONB NOT NULL,
  "acceptanceCriteria" JSONB NOT NULL,
  "scoringRubric" JSONB NOT NULL,
  "hardFailConditions" JSONB NOT NULL,
  "timeConstraints" JSONB NOT NULL,
  "complianceConstraints" JSONB NOT NULL,
  "version" INTEGER NOT NULL DEFAULT 1,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "EvaluationContract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubmissionEvidence" (
  "id" TEXT NOT NULL,
  "submissionId" TEXT NOT NULL,
  "evidenceType" "EvidenceType" NOT NULL,
  "value" TEXT NOT NULL,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SubmissionEvidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvaluationRunAudit" (
  "id" TEXT NOT NULL,
  "submissionId" TEXT NOT NULL,
  "contractId" TEXT,
  "deterministicScore" DOUBLE PRECISION NOT NULL,
  "aiScoreA" DOUBLE PRECISION NOT NULL,
  "aiScoreB" DOUBLE PRECISION NOT NULL,
  "consistencyScore" DOUBLE PRECISION NOT NULL,
  "fusionScore" DOUBLE PRECISION NOT NULL,
  "policyBand" TEXT NOT NULL,
  "requiresHumanReview" BOOLEAN NOT NULL DEFAULT false,
  "decisionTrace" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "EvaluationRunAudit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RubricTemplate_name_version_key" ON "RubricTemplate"("name", "version");

-- CreateIndex
CREATE UNIQUE INDEX "EvaluationContract_projectId_key" ON "EvaluationContract"("projectId");

-- AddForeignKey
ALTER TABLE "EvaluationContract"
  ADD CONSTRAINT "EvaluationContract_projectId_fkey"
  FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluationContract"
  ADD CONSTRAINT "EvaluationContract_rubricTemplateId_fkey"
  FOREIGN KEY ("rubricTemplateId") REFERENCES "RubricTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubmissionEvidence"
  ADD CONSTRAINT "SubmissionEvidence_submissionId_fkey"
  FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluationRunAudit"
  ADD CONSTRAINT "EvaluationRunAudit_submissionId_fkey"
  FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluationRunAudit"
  ADD CONSTRAINT "EvaluationRunAudit_contractId_fkey"
  FOREIGN KEY ("contractId") REFERENCES "EvaluationContract"("id") ON DELETE SET NULL ON UPDATE CASCADE;
