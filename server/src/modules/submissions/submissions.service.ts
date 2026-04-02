import { prisma } from "../../lib/prisma.js";
import { runDualModelJudge } from "../../services/ai-judge.service.js";
import { runDeterministicValidation } from "../../services/deterministic-validator.service.js";
import { runFusionAndPolicy } from "../../services/fusion-policy.service.js";
import { CreateSubmissionInput } from "./submissions.schema.js";

const validationQueue: string[] = [];
let processingQueue = false;

function inferTimelinessScore(submissionCreatedAt: Date, milestoneCreatedAt: Date) {
  const diffMs = submissionCreatedAt.getTime() - milestoneCreatedAt.getTime();
  const days = diffMs / (1000 * 60 * 60 * 24);
  return days <= 7 ? 100 : 60;
}

function structuredValidationBreakdown(notes: string | null, rules: Record<string, unknown>) {
  const text = (notes ?? "").toLowerCase();
  const keywords = ["test", "result", "output", "complete", "done"];
  const passed = keywords.filter((item) => text.includes(item)).length;
  const failed = Math.max(0, 10 - passed);
  const aiScore = Math.max(40, Math.min(95, 50 + passed * 5));

  return {
    aiScore,
    breakdown: {
      mode: "STRUCTURED",
      testsPassed: passed,
      testsFailed: failed,
      rules,
    },
  };
}

function creativeValidationBreakdown(notes: string | null, rules: Record<string, unknown>) {
  const text = (notes ?? "").toLowerCase();
  const mustInclude = Array.isArray(rules.mustInclude)
    ? (rules.mustInclude as unknown[]).filter((item): item is string => typeof item === "string")
    : [];

  const elementsPresent = mustInclude.filter((item) => text.includes(item.toLowerCase()));
  const missingElements = mustInclude.filter((item) => !elementsPresent.includes(item));
  const completenessScore = mustInclude.length === 0 ? 75 : Math.round((elementsPresent.length / mustInclude.length) * 100);
  const qualityScore = Math.max(55, Math.min(95, 65 + elementsPresent.length * 8 - missingElements.length * 5));
  const aiScore = Math.round((qualityScore * 0.6 + completenessScore * 0.4));

  return {
    aiScore,
    breakdown: {
      mode: "CREATIVE",
      durationMatch: true,
      elementsPresent,
      missingElements,
      qualityScore,
      completenessScore,
      rules,
    },
  };
}

export function calculateFinalScore(aiScore: number, clientRating: number, systemScore: number) {
  return Number((aiScore * 0.4 + clientRating * 0.4 + systemScore * 0.2).toFixed(2));
}

async function processValidationQueue() {
  if (processingQueue) {
    return;
  }

  processingQueue = true;
  while (validationQueue.length > 0) {
    const submissionId = validationQueue.shift();
    if (!submissionId) {
      continue;
    }

    try {
      await validateSubmission(submissionId);
    } catch {
      await prisma.submission.update({
        where: { id: submissionId },
        data: { status: "REJECTED" },
      });
    }
  }
  processingQueue = false;
}

function enqueueValidation(submissionId: string) {
  validationQueue.push(submissionId);
  setTimeout(() => {
    void processValidationQueue();
  }, 0);
}

export async function validateSubmission(submissionId: string) {
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: {
      milestone: {
        include: {
          project: {
            include: {
              validationCriteria: true,
            },
          },
        },
      },
    },
  });

  if (!submission) {
    throw new Error("Submission not found");
  }

  const project = submission.milestone.project;

  let criteria = project.validationCriteria.find((item: { milestoneId: string | null }) => item.milestoneId === submission.milestoneId)
    ?? project.validationCriteria.find((item: { milestoneId: string | null }) => item.milestoneId === null);

  if (!criteria) {
    criteria = await prisma.validationCriteria.create({
      data: {
        projectId: project.id,
        milestoneId: submission.milestoneId,
        type: project.workType,
        rules: {
          generatedFallback: true,
          checks: ["requirement alignment", "completeness", "quality"],
        },
      },
    });
  }

  const rules = (criteria.rules ?? {}) as Record<string, unknown>;
  const evaluated = criteria.type === "STRUCTURED"
    ? structuredValidationBreakdown(submission.notes, rules)
    : creativeValidationBreakdown(submission.notes, rules);

  await prisma.submission.update({
    where: { id: submissionId },
    data: {
      status: "VALIDATED",
    },
  });

  return evaluated;
}

export async function approveProjectDraft(projectId: string, clientId: string) {
  const project = await prisma.project.findFirst({
    where: { id: projectId, clientId },
    select: { id: true },
  });

  if (!project) {
    throw new Error("Project not found or inaccessible");
  }

  return prisma.project.update({
    where: { id: projectId },
    data: { draftApproved: true },
    select: {
      id: true,
      draftApproved: true,
      updatedAt: true,
    },
  });
}

export async function createSubmissionForMilestone(
  projectId: string,
  milestoneId: string,
  freelancerId: string,
  input: { fileUrl?: string; notes?: string; evidenceItems?: Array<{ evidenceType: string; value: string; metadata?: Record<string, unknown> }> },
) {
  const project = await prisma.project.findFirst({
    where: { id: projectId, freelancerId },
    select: { id: true, draftApproved: true },
  });

  if (!project) {
    throw new Error("Project not found or inaccessible");
  }

  const milestone = await prisma.milestone.findFirst({
    where: { id: milestoneId, projectId },
    select: { id: true },
  });

  if (!milestone) {
    throw new Error("Milestone not found for this project");
  }

  const submission = await prisma.submission.create({
    data: {
      milestoneId,
      freelancerId,
      fileUrl: input.fileUrl && input.fileUrl.trim() ? input.fileUrl.trim() : null,
      notes: input.notes && input.notes.trim() ? input.notes.trim() : null,
      kind: "FINAL",
      status: "SUBMITTED",
      evidences: {
        create: [
          ...(input.fileUrl && input.fileUrl.trim()
            ? [{ evidenceType: "ARTIFACT_LINK" as const, value: input.fileUrl.trim() }]
            : []),
          ...((input.evidenceItems ?? []).map((item) => ({
            evidenceType: item.evidenceType as any,
            value: item.value,
            metadata: (item.metadata ?? null) as any,
          }))),
        ],
      },
    },
  });

  await prisma.milestone.update({
    where: { id: milestoneId },
    data: {
      status: "SUBMITTED",
    },
  });

  enqueueValidation(submission.id);

  return { submission, validationReport: null };
}

export async function createSubmission(freelancerId: string, input: CreateSubmissionInput) {
  const milestone = await prisma.milestone.findUnique({
    where: { id: input.milestoneId },
    include: {
      project: {
        select: { id: true, freelancerId: true },
      },
    },
  });

  if (!milestone) {
    throw new Error("Milestone not found");
  }

  if (milestone.project.freelancerId !== freelancerId) {
    throw new Error("Only assigned freelancer can submit this milestone");
  }

  const submission = await prisma.submission.create({
    data: {
      milestoneId: input.milestoneId,
      freelancerId,
      fileUrl: input.fileUrl && input.fileUrl.trim() ? input.fileUrl.trim() : null,
      notes: input.notes && input.notes.trim() ? input.notes.trim() : null,
      kind: "FINAL",
      status: "SUBMITTED",
      evidences: {
        create: [
          ...(input.fileUrl && input.fileUrl.trim()
            ? [{ evidenceType: "ARTIFACT_LINK" as const, value: input.fileUrl.trim() }]
            : []),
          ...((input.evidenceItems ?? []).map((item) => ({
            evidenceType: item.evidenceType as any,
            value: item.value,
            metadata: (item.metadata ?? null) as any,
          }))),
        ],
      },
    },
  });

  await prisma.milestone.update({
    where: { id: input.milestoneId },
    data: { status: "SUBMITTED" },
  });

  enqueueValidation(submission.id);

  return submission;
}

export async function rateSubmission(submissionId: string, clientId: string, rating: number) {
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: {
      evidences: true,
      milestone: {
        include: {
          project: {
            include: {
              freelancer: {
                select: { id: true },
              },
              validationCriteria: true,
              evaluationContract: {
                include: {
                  rubricTemplate: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!submission) {
    throw new Error("Submission not found");
  }

  const project = submission.milestone.project;
  if (project.clientId !== clientId) {
    throw new Error("Only project owner can rate submission");
  }

  if (submission.status !== "VALIDATED") {
    throw new Error("Submission is still being validated");
  }

  const criteria = project.validationCriteria.find((item: { milestoneId: string | null }) => item.milestoneId === submission.milestoneId)
    ?? project.validationCriteria.find((item: { milestoneId: string | null }) => item.milestoneId === null);

  const rules = (criteria?.rules ?? {}) as Record<string, unknown>;
  const evaluated = criteria?.type === "STRUCTURED"
    ? structuredValidationBreakdown(submission.notes, rules)
    : creativeValidationBreakdown(submission.notes, rules);

  const systemScore = inferTimelinessScore(submission.createdAt, submission.milestone.createdAt);
  const deterministic = runDeterministicValidation({
    contract: submission.milestone.project.evaluationContract as any,
    evidences: submission.evidences.map((item) => ({
      evidenceType: item.evidenceType,
      value: item.value,
      metadata: (item.metadata ?? null) as any,
    })),
    notes: submission.notes,
    submissionCreatedAt: submission.createdAt,
    milestoneCreatedAt: submission.milestone.createdAt,
  });

  const rubric = Array.isArray((submission.milestone.project.evaluationContract as any)?.scoringRubric)
    ? ((submission.milestone.project.evaluationContract as any).scoringRubric as Array<{ id: string; title: string; weight: number; prompt: string }>)
    : [
      { id: "quality", title: "Quality", weight: 0.5, prompt: "Assess quality against evidence." },
      { id: "completeness", title: "Completeness", weight: 0.5, prompt: "Assess completeness against required outputs." },
    ];

  const dualJudge = await runDualModelJudge({
    rubric,
    evidences: submission.evidences.map((item) => ({ evidenceType: item.evidenceType, value: item.value })),
    notes: submission.notes,
  });

  const weightConfig = (submission.milestone.project.evaluationContract as any)?.rubricTemplate?.weightConfig as
    | { deterministic?: number; aiJudge?: number; clientRating?: number; systemScore?: number }
    | undefined;

  const policy = runFusionAndPolicy({
    deterministicScore: deterministic.score,
    aiScore: dualJudge.averageAiScore,
    clientRating: rating,
    systemScore,
    consistencyScore: dualJudge.consistencyScore,
    hardFail: deterministic.hardFail,
    weightConfig,
  });

  const finalScore = policy.fusionScore;
  const decision = policy.policyBand === "AUTO_APPROVE" ? "APPROVED" : "DISPUTED";

  const report = await prisma.validationReport.upsert({
    where: { submissionId },
    create: {
      submissionId,
      projectId: project.id,
      milestoneId: submission.milestoneId,
      aiScore: dualJudge.averageAiScore,
      clientRating: rating,
      systemScore,
      finalScore,
      decision,
      policyBand: policy.policyBand,
      requiresHumanReview: policy.requiresHumanReview,
      breakdown: {
        legacyHeuristic: evaluated.breakdown,
        deterministicChecks: deterministic.checks,
        deterministicScore: deterministic.score,
        modelA: dualJudge.judgeA,
        modelB: dualJudge.judgeB,
        consistencyScore: dualJudge.consistencyScore,
      } as any,
      explanation:
        policy.requiresHumanReview
          ? "Evaluation entered human-review band. Manual adjudication required before payout."
          : decision === "APPROVED"
          ? "Submission meets hybrid threshold. Escrow release approved."
          : "Submission below hybrid threshold. Escrow remains locked and dispute path is recommended.",
    },
    update: {
      aiScore: dualJudge.averageAiScore,
      clientRating: rating,
      systemScore,
      finalScore,
      decision,
      policyBand: policy.policyBand,
      requiresHumanReview: policy.requiresHumanReview,
      breakdown: {
        legacyHeuristic: evaluated.breakdown,
        deterministicChecks: deterministic.checks,
        deterministicScore: deterministic.score,
        modelA: dualJudge.judgeA,
        modelB: dualJudge.judgeB,
        consistencyScore: dualJudge.consistencyScore,
      } as any,
      explanation:
        policy.requiresHumanReview
          ? "Evaluation entered human-review band. Manual adjudication required before payout."
          : decision === "APPROVED"
          ? "Submission meets hybrid threshold. Escrow release approved."
          : "Submission below hybrid threshold. Escrow remains locked and dispute path is recommended.",
    },
  });

  await prisma.evaluationRunAudit.create({
    data: {
      submissionId,
      contractId: submission.milestone.project.evaluationContract?.id ?? null,
      deterministicScore: deterministic.score,
      aiScoreA: dualJudge.judgeA.score,
      aiScoreB: dualJudge.judgeB.score,
      consistencyScore: dualJudge.consistencyScore,
      fusionScore: policy.fusionScore,
      policyBand: policy.policyBand,
      requiresHumanReview: policy.requiresHumanReview,
      decisionTrace: {
        hardFail: deterministic.hardFail,
        deterministicChecks: deterministic.checks,
        judgeA: dualJudge.judgeA,
        judgeB: dualJudge.judgeB,
        weights: weightConfig ?? null,
      } as any,
    },
  });

  await prisma.submission.update({
    where: { id: submissionId },
    data: { clientRating: rating },
  });

  if (decision === "APPROVED" && !policy.requiresHumanReview && project.freelancerId) {
    await prisma.$transaction([
      prisma.milestone.update({
        where: { id: submission.milestoneId },
        data: { status: "APPROVED" },
      }),
      prisma.user.update({
        where: { id: project.freelancerId },
        data: {
          walletBalance: {
            increment: submission.milestone.amount,
          },
        },
      }),
      prisma.transaction.create({
        data: {
          userId: project.freelancerId,
          milestoneId: submission.milestoneId,
          amount: submission.milestone.amount,
          type: "RELEASED",
        },
      }),
    ]);

    const remainingUnapproved = await prisma.milestone.count({
      where: {
        projectId: project.id,
        status: {
          not: "APPROVED",
        },
      },
    });

    if (remainingUnapproved === 0) {
      await prisma.project.update({
        where: { id: project.id },
        data: { status: "COMPLETED" },
      });
    }
  }

  if (decision === "DISPUTED" && !policy.requiresHumanReview) {
    await prisma.project.update({
      where: { id: project.id },
      data: { status: "DISPUTED" },
    });
  }

  return report;
}

export async function requestSubmissionChanges(submissionId: string, clientId: string, feedback: string) {
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: {
      milestone: {
        include: {
          project: {
            select: { id: true, clientId: true },
          },
        },
      },
    },
  });

  if (!submission) {
    throw new Error("Submission not found");
  }

  if (submission.milestone.project.clientId !== clientId) {
    throw new Error("Only project owner can request changes");
  }

  if (submission.status === "REJECTED") {
    throw new Error("Cannot request changes for rejected submission");
  }

  const updated = await prisma.submission.update({
    where: { id: submissionId },
    data: {
      status: "CHANGES_REQUESTED",
      clientFeedback: feedback.trim(),
    },
  });

  await prisma.milestone.update({
    where: { id: submission.milestoneId },
    data: { status: "PENDING" },
  });

  return updated;
}
