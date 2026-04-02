import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import {
  createSubmissionGlobalHandler,
  requestChangesHandler,
  rateSubmissionHandler,
} from "./submissions.controller.js";

export const submissionsRouter = Router();

submissionsRouter.post("/", requireAuth, createSubmissionGlobalHandler);
submissionsRouter.post("/:id/rate", requireAuth, rateSubmissionHandler);
submissionsRouter.post("/:id/request-changes", requireAuth, requestChangesHandler);
