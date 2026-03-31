import { prisma } from "../../lib/prisma.js";
import { parseRequirements } from "../../services/requirement-parser.service.js";
import { AssignFreelancerInput, CreateProjectInput } from "./projects.schema.js";

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

  return project;
}

export async function listProjects(userId: string, role: string) {
  const projects = await prisma.project.findMany({
    where: role === "CLIENT" ? { clientId: userId } : { freelancerId: userId },
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
      milestones: true,
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
