import { prisma } from "../../lib/prisma.js";
import { parseRequirements } from "../../services/requirement-parser.service.js";
import { ensureProjectEvaluationContract } from "../../services/evaluation-contract.service.js";
import { generateValidationCriteria } from "../../services/validation-criteria.service.js";
import {
  ApplyToProjectInput,
  AssignFreelancerInput,
  CreateProjectInput,
  CreateProjectMessageInput,
  SelectApplicantInput,
} from "./projects.schema.js";

function projectAccessWhere(userId: string, role: string, projectId?: string) {
  if (role === "CLIENT") {
    return {
      ...(projectId ? { id: projectId } : {}),
      clientId: userId,
    };
  }

  if (role === "FREELANCER") {
    return {
      ...(projectId ? { id: projectId } : {}),
      freelancerId: userId,
    };
  }

  return {
    id: "",
  };
}

export async function createProject(clientId: string, input: CreateProjectInput) {
  const parsed = await parseRequirements(input.description);
  const parsedRequirements = JSON.parse(JSON.stringify(parsed));

  const project = await prisma.project.create({
    data: {
      title: input.title,
      description: input.description,
      clientId,
      workType: input.workType,
      parsedRequirements,
      milestones: {
        create: parsed.milestones.map((milestone) => ({
          title: milestone.title,
          description: milestone.description,
          amount: milestone.amount,
        })),
      },
    },
    include: {
      milestones: true,
    },
  });

  const generated = await generateValidationCriteria(input.description);
  await prisma.validationCriteria.create({
    data: {
      projectId: project.id,
      type: generated.type,
      rules: generated.rules as any,
    },
  });

  await ensureProjectEvaluationContract({
    projectId: project.id,
    title: project.title,
    description: project.description,
    workType: project.workType,
  });

  return project;
}

export async function listProjects(userId: string, role: string) {
  const projects = await prisma.project.findMany({
    where: projectAccessWhere(userId, role),
    include: {
      client: {
        select: { id: true, name: true, email: true },
      },
      freelancer: {
        select: { id: true, name: true, email: true },
      },
      milestones: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return projects;
}

export async function getProjectById(projectId: string) {
  return prisma.project.findUnique({
    where: { id: projectId },
    include: {
      client: {
        select: { id: true, name: true, email: true },
      },
      freelancer: {
        select: { id: true, name: true, email: true },
      },
      milestones: {
        include: {
          submissions: {
            include: {
              validationReport: true,
            },
            orderBy: { createdAt: "desc" },
          },
        },
      },
      validationCriteria: true,
      evaluationContract: true,
      validationReports: {
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function getProjectByIdForUser(projectId: string, userId: string, role: string) {
  return prisma.project.findFirst({
    where: projectAccessWhere(userId, role, projectId),
    include: {
      client: {
        select: { id: true, name: true, email: true },
      },
      freelancer: {
        select: { id: true, name: true, email: true },
      },
      milestones: {
        include: {
          submissions: {
            include: {
              validationReport: true,
            },
            orderBy: { createdAt: "desc" },
          },
        },
      },
      validationCriteria: true,
      evaluationContract: true,
      validationReports: {
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function canAccessProject(projectId: string, userId: string, role: string) {
  const project = await prisma.project.findFirst({
    where: projectAccessWhere(userId, role, projectId),
    select: { id: true },
  });

  return Boolean(project);
}

export async function listProjectMessages(projectId: string, userId: string, role: string) {
  const hasAccess = await canAccessProject(projectId, userId, role);
  if (!hasAccess) {
    throw new Error("Project not found or inaccessible");
  }

  return prisma.message.findMany({
    where: { projectId },
    include: {
      sender: {
        select: { id: true, name: true, role: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function createProjectMessage(
  projectId: string,
  userId: string,
  role: string,
  payload: CreateProjectMessageInput,
) {
  const hasAccess = await canAccessProject(projectId, userId, role);
  if (!hasAccess) {
    throw new Error("Project not found or inaccessible");
  }

  return prisma.message.create({
    data: {
      projectId,
      senderId: userId,
      content: payload.content.trim(),
      fileUrl: payload.fileUrl && payload.fileUrl.trim() ? payload.fileUrl.trim() : null,
    },
    include: {
      sender: {
        select: { id: true, name: true, role: true },
      },
    },
  });
}

export async function assignFreelancer(
  projectId: string,
  clientId: string,
  input: AssignFreelancerInput,
) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) {
    throw new Error("Project not found");
  }

  if (project.clientId !== clientId) {
    throw new Error("Only project owner can assign freelancer");
  }

  const freelancer = await prisma.user.findFirst({
    where: { id: input.freelancerId, role: "FREELANCER" },
  });

  if (!freelancer) {
    throw new Error("Freelancer not found");
  }

  return prisma.project.update({
    where: { id: projectId },
    data: {
      freelancerId: input.freelancerId,
      status: "IN_PROGRESS",
      assignedAt: new Date(),
    },
    include: {
      milestones: true,
      client: {
        select: { id: true, name: true, email: true },
      },
      freelancer: {
        select: { id: true, name: true, email: true },
      },
    },
  });
}

export async function discoverOpenProjects(freelancerId: string) {
  return prisma.project.findMany({
    where: {
      status: "OPEN",
      freelancerId: null,
    },
    include: {
      client: {
        select: { id: true, name: true, email: true },
      },
      milestones: true,
      applications: {
        where: { freelancerId },
        select: { id: true, status: true, createdAt: true },
      },
      _count: {
        select: { applications: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function applyToProject(
  projectId: string,
  freelancerId: string,
  input: ApplyToProjectInput,
) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, status: true, freelancerId: true },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  if (project.status !== "OPEN" || project.freelancerId) {
    throw new Error("Project is no longer accepting applications");
  }

  const existing = await prisma.projectApplication.findUnique({
    where: {
      projectId_freelancerId: {
        projectId,
        freelancerId,
      },
    },
  });

  if (existing) {
    throw new Error("You already applied to this project");
  }

  return prisma.projectApplication.create({
    data: {
      projectId,
      freelancerId,
      message: input.message && input.message.trim() ? input.message.trim() : null,
      proposedAmount: typeof input.proposedAmount === "number" ? input.proposedAmount : null,
      estimatedDays: typeof input.estimatedDays === "number" ? input.estimatedDays : null,
      deliverables: input.deliverables && input.deliverables.trim() ? input.deliverables.trim() : null,
    },
    include: {
      freelancer: {
        select: { id: true, name: true, email: true, skills: true, rating: true, trustScore: true },
      },
    },
  });
}

export async function listProjectApplicants(projectId: string, clientId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, clientId: true },
  });

  if (!project || project.clientId !== clientId) {
    throw new Error("Project not found or inaccessible");
  }

  return prisma.projectApplication.findMany({
    where: { projectId },
    include: {
      freelancer: {
        select: { id: true, name: true, email: true, skills: true, rating: true, trustScore: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function selectProjectApplicant(
  projectId: string,
  clientId: string,
  input: SelectApplicantInput,
) {
  const application = await prisma.projectApplication.findUnique({
    where: { id: input.applicationId },
    include: {
      project: {
        select: { id: true, clientId: true, status: true, freelancerId: true },
      },
    },
  });

  if (!application || application.projectId !== projectId) {
    throw new Error("Application not found");
  }

  if (application.project.clientId !== clientId) {
    throw new Error("Only project owner can select an applicant");
  }

  if (application.project.freelancerId || application.project.status !== "OPEN") {
    throw new Error("Project is no longer open for selection");
  }

  await prisma.$transaction([
    prisma.project.update({
      where: { id: projectId },
      data: {
        freelancerId: application.freelancerId,
        status: "IN_PROGRESS",
        assignedAt: new Date(),
      },
    }),
    prisma.projectApplication.update({
      where: { id: input.applicationId },
      data: { status: "ACCEPTED" },
    }),
    prisma.projectApplication.updateMany({
      where: {
        projectId,
        id: { not: input.applicationId },
      },
      data: { status: "REJECTED" },
    }),
  ]);

  return getProjectById(projectId);
}

export async function deleteProject(projectId: string, clientId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, clientId: true },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  if (project.clientId !== clientId) {
    throw new Error("Only project owner can delete project");
  }

  await prisma.project.delete({ where: { id: projectId } });
}
