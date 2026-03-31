import { Response } from "express";
import { AuthenticatedRequest } from "../../middlewares/auth.middleware.js";
import {
  applyToProjectSchema,
  assignFreelancerSchema,
  createProjectMessageSchema,
  createProjectSchema,
  selectApplicantSchema,
} from "./projects.schema.js";
import {
  applyToProject,
  assignFreelancer,
  createProjectMessage,
  createProject,
  deleteProject,
  discoverOpenProjects,
  getProjectByIdForUser,
  listProjectApplicants,
  listProjectMessages,
  listProjects,
  selectProjectApplicant,
} from "./projects.service.js";

export async function createProjectHandler(req: AuthenticatedRequest, res: Response) {
  if (!req.auth?.userId || req.auth.role !== "CLIENT") {
    return res.status(403).json({ message: "Only clients can create projects" });
  }

  const parsed = createProjectSchema.safeParse(req.body);
  if (!parsed.success) {
    const details = parsed.error.issues.map((issue) => issue.message).join(" | ");
    return res.status(400).json({
      message: details ? `Validation failed: ${details}` : "Validation failed",
      issues: parsed.error.flatten(),
    });
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

export async function discoverOpenProjectsHandler(req: AuthenticatedRequest, res: Response) {
  if (!req.auth?.userId || req.auth.role !== "FREELANCER") {
    return res.status(403).json({ message: "Only freelancers can discover open projects" });
  }

  const projects = await discoverOpenProjects(req.auth.userId);
  return res.status(200).json(projects);
}

export async function getProjectByIdHandler(req: AuthenticatedRequest, res: Response) {
  if (!req.auth?.userId || !req.auth.role) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const project = await getProjectByIdForUser(
    String(req.params.projectId),
    req.auth.userId,
    req.auth.role,
  );

  if (!project) {
    return res.status(404).json({ message: "Project not found or inaccessible" });
  }

  return res.status(200).json(project);
}

export async function listProjectMessagesHandler(req: AuthenticatedRequest, res: Response) {
  if (!req.auth?.userId || !req.auth.role) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const messages = await listProjectMessages(
      String(req.params.projectId),
      req.auth.userId,
      req.auth.role,
    );
    return res.status(200).json(messages);
  } catch (error) {
    return res.status(404).json({ message: (error as Error).message });
  }
}

export async function createProjectMessageHandler(req: AuthenticatedRequest, res: Response) {
  if (!req.auth?.userId || !req.auth.role) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const parsed = createProjectMessageSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Validation failed", issues: parsed.error.flatten() });
  }

  try {
    const message = await createProjectMessage(
      String(req.params.projectId),
      req.auth.userId,
      req.auth.role,
      parsed.data,
    );
    return res.status(201).json(message);
  } catch (error) {
    return res.status(404).json({ message: (error as Error).message });
  }
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

export async function applyToProjectHandler(req: AuthenticatedRequest, res: Response) {
  if (!req.auth?.userId || req.auth.role !== "FREELANCER") {
    return res.status(403).json({ message: "Only freelancers can apply to projects" });
  }

  const parsed = applyToProjectSchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    return res.status(400).json({ message: "Validation failed", issues: parsed.error.flatten() });
  }

  try {
    const application = await applyToProject(String(req.params.projectId), req.auth.userId, parsed.data);
    return res.status(201).json(application);
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
}

export async function listProjectApplicantsHandler(req: AuthenticatedRequest, res: Response) {
  if (!req.auth?.userId || req.auth.role !== "CLIENT") {
    return res.status(403).json({ message: "Only clients can view applicants" });
  }

  try {
    const applicants = await listProjectApplicants(String(req.params.projectId), req.auth.userId);
    return res.status(200).json(applicants);
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
}

export async function selectProjectApplicantHandler(req: AuthenticatedRequest, res: Response) {
  if (!req.auth?.userId || req.auth.role !== "CLIENT") {
    return res.status(403).json({ message: "Only clients can select applicants" });
  }

  const parsed = selectApplicantSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Validation failed", issues: parsed.error.flatten() });
  }

  try {
    const project = await selectProjectApplicant(String(req.params.projectId), req.auth.userId, parsed.data);
    return res.status(200).json(project);
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
}

export async function deleteProjectHandler(req: AuthenticatedRequest, res: Response) {
  if (!req.auth?.userId || req.auth.role !== "CLIENT") {
    return res.status(403).json({ message: "Only clients can delete projects" });
  }

  try {
    await deleteProject(String(req.params.projectId), req.auth.userId);
    return res.status(204).send();
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
}
