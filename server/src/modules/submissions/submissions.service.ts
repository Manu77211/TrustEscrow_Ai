import { prisma } from "../../lib/prisma.js";
import { CreateSubmissionInput } from "./submissions.schema.js";

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
  input: CreateSubmissionInput,
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

  if (input.kind === "FINAL" && !project.draftApproved) {
    throw new Error("Final submission locked until client approves draft");
  }

  const submission = await prisma.submission.create({
    data: {
      milestoneId,
      freelancerId,
      fileUrl: input.fileUrl && input.fileUrl.trim() ? input.fileUrl.trim() : null,
      notes: input.notes && input.notes.trim() ? input.notes.trim() : null,
      kind: input.kind,
    },
  });

  await prisma.milestone.update({
    where: { id: milestoneId },
    data: {
      status: input.kind === "FINAL" ? "APPROVED" : "SUBMITTED",
    },
  });

  let validationReport = null;

  if (input.kind === "FINAL") {
    const aiScore = submission.fileUrl ? 78 : 58;
    const clientRating = 60;
    const timelinessScore = 70;
    const finalScore = Number((0.4 * aiScore + 0.4 * clientRating + 0.2 * timelinessScore).toFixed(2));
    const decision = finalScore >= 70 ? "RELEASED" : "DISPUTED";

    validationReport = await prisma.validationReport.create({
      data: {
        projectId,
        milestoneId,
        aiScore,
        clientRating,
        timelinessScore,
        finalScore,
        decision,
        explanation:
          decision === "RELEASED"
            ? "Basic validation passed threshold. Escrow release can proceed."
            : "Basic validation did not meet threshold. Dispute review recommended.",
        reportJson: {
          mode: "basic-phase6-starter",
          signalWeights: {
            aiScore: 0.4,
            clientRating: 0.4,
            timelinessScore: 0.2,
          },
        },
      },
    });
  }

  return { submission, validationReport };
}
