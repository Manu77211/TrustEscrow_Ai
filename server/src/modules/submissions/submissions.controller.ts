import { Response } from "express";
import { AuthenticatedRequest } from "../../middlewares/auth.middleware.js";
import {
  createMilestoneSubmissionSchema,
  createSubmissionSchema,
  draftApprovalSchema,
  rateSubmissionSchema,
} from "./submissions.schema.js";
import {
  approveProjectDraft,
  createSubmission,
  createSubmissionForMilestone,
  rateSubmission,
} from "./submissions.service.js";

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

  const parsed = createMilestoneSubmissionSchema.safeParse(req.body);
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

export async function createSubmissionGlobalHandler(req: AuthenticatedRequest, res: Response) {
  if (!req.auth?.userId || req.auth.role !== "FREELANCER") {
    return res.status(403).json({ message: "Only assigned freelancers can submit work" });
  }

  const parsed = createSubmissionSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Validation failed", issues: parsed.error.flatten() });
  }

  try {
    const submission = await createSubmission(req.auth.userId, parsed.data);
    return res.status(201).json(submission);
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
}

export async function rateSubmissionHandler(req: AuthenticatedRequest, res: Response) {
  if (!req.auth?.userId || req.auth.role !== "CLIENT") {
    return res.status(403).json({ message: "Only clients can rate submissions" });
  }

  const parsed = rateSubmissionSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Validation failed", issues: parsed.error.flatten() });
  }

  try {
    const report = await rateSubmission(String(req.params.id), req.auth.userId, parsed.data.rating);
    return res.status(200).json(report);
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
}
