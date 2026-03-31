import { Response } from "express";
import { AuthenticatedRequest } from "../../middlewares/auth.middleware.js";
import { createSubmissionSchema, draftApprovalSchema } from "./submissions.schema.js";
import { approveProjectDraft, createSubmissionForMilestone } from "./submissions.service.js";

export async function approveDraftHandler(req: AuthenticatedRequest, res: Response) {
  if (!req.auth?.userId || req.auth.role !== "CLIENT") {
    return res.status(403).json({ message: "Only clients can approve draft state" });
  }

  const parsed = draftApprovalSchema.safeParse(req.body ?? { approved: true });
  if (!parsed.success) {
    return res.status(400).json({ message: "Validation failed", issues: parsed.error.flatten() });
  }

  try {
    const result = await approveProjectDraft(String(req.params.projectId), req.auth.userId);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(404).json({ message: (error as Error).message });
  }
}

export async function createSubmissionHandler(req: AuthenticatedRequest, res: Response) {
  if (!req.auth?.userId || req.auth.role !== "FREELANCER") {
    return res.status(403).json({ message: "Only assigned freelancers can submit work" });
  }

  const parsed = createSubmissionSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Validation failed", issues: parsed.error.flatten() });
  }

  try {
    const result = await createSubmissionForMilestone(
      String(req.params.projectId),
      String(req.params.milestoneId),
      req.auth.userId,
      parsed.data,
    );

    return res.status(201).json(result);
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
}
