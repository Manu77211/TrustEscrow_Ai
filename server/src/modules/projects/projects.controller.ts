import { Response } from "express";
import { AuthenticatedRequest } from "../../middlewares/auth.middleware.js";
import { assignFreelancerSchema, createProjectSchema } from "./projects.schema.js";
import {
  assignFreelancer,
  createProject,
  getProjectById,
  listProjects,
} from "./projects.service.js";

export async function createProjectHandler(req: AuthenticatedRequest, res: Response) {
  if (!req.auth?.userId || req.auth.role !== "CLIENT") {
    return res.status(403).json({ message: "Only clients can create projects" });
  }

  const parsed = createProjectSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Validation failed", issues: parsed.error.flatten() });
  }

  const project = await createProject(req.auth.userId, parsed.data);
  return res.status(201).json(project);
}

export async function listProjectsHandler(req: AuthenticatedRequest, res: Response) {
  if (!req.auth?.userId || !req.auth.role) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const projects = await listProjects(req.auth.userId, req.auth.role);
  return res.status(200).json(projects);
}

export async function getProjectByIdHandler(req: AuthenticatedRequest, res: Response) {
  const project = await getProjectById(String(req.params.projectId));
  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  return res.status(200).json(project);
}

export async function assignFreelancerHandler(req: AuthenticatedRequest, res: Response) {
  if (!req.auth?.userId || req.auth.role !== "CLIENT") {
    return res.status(403).json({ message: "Only clients can assign freelancers" });
  }

  const parsed = assignFreelancerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Validation failed", issues: parsed.error.flatten() });
  }

  try {
    const project = await assignFreelancer(String(req.params.projectId), req.auth.userId, parsed.data);
    return res.status(200).json(project);
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
}
