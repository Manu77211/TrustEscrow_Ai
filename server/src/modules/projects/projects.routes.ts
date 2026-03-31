import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import {
  assignFreelancerHandler,
  createProjectHandler,
  getProjectByIdHandler,
  listProjectsHandler,
} from "./projects.controller.js";

export const projectsRouter = Router();

projectsRouter.get("/", requireAuth, listProjectsHandler);
projectsRouter.post("/", requireAuth, createProjectHandler);
projectsRouter.get("/:projectId", requireAuth, getProjectByIdHandler);
projectsRouter.post("/:projectId/assign", requireAuth, assignFreelancerHandler);
