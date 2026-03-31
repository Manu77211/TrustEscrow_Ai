import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import {
  approveDraftHandler,
  createSubmissionHandler,
} from "../submissions/submissions.controller.js";
import {
  applyToProjectHandler,
  assignFreelancerHandler,
  createProjectMessageHandler,
  createProjectHandler,
  deleteProjectHandler,
  discoverOpenProjectsHandler,
  getProjectByIdHandler,
  listProjectApplicantsHandler,
  listProjectMessagesHandler,
  listProjectsHandler,
  selectProjectApplicantHandler,
} from "./projects.controller.js";

export const projectsRouter = Router();

projectsRouter.get("/", requireAuth, listProjectsHandler);
projectsRouter.get("/discover", requireAuth, discoverOpenProjectsHandler);
projectsRouter.post("/", requireAuth, createProjectHandler);
projectsRouter.get("/:projectId", requireAuth, getProjectByIdHandler);
projectsRouter.post("/:projectId/assign", requireAuth, assignFreelancerHandler);
projectsRouter.post("/:projectId/apply", requireAuth, applyToProjectHandler);
projectsRouter.get("/:projectId/applicants", requireAuth, listProjectApplicantsHandler);
projectsRouter.post("/:projectId/select-applicant", requireAuth, selectProjectApplicantHandler);
projectsRouter.delete("/:projectId", requireAuth, deleteProjectHandler);
projectsRouter.get("/:projectId/messages", requireAuth, listProjectMessagesHandler);
projectsRouter.post("/:projectId/messages", requireAuth, createProjectMessageHandler);
projectsRouter.post("/:projectId/draft-approve", requireAuth, approveDraftHandler);
projectsRouter.post(
  "/:projectId/milestones/:milestoneId/submissions",
  requireAuth,
  createSubmissionHandler,
);
