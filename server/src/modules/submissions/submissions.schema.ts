import { z } from "zod";

export const draftApprovalSchema = z.object({
  approved: z.literal(true).default(true),
});

export const createSubmissionSchema = z.object({
  milestoneId: z.string().min(1),
  fileUrl: z.string().trim().url().optional().or(z.literal("")),
  notes: z.string().trim().max(5000).optional().or(z.literal("")),
});

export const createMilestoneSubmissionSchema = z.object({
  fileUrl: z.string().trim().url().optional().or(z.literal("")),
  notes: z.string().trim().max(5000).optional().or(z.literal("")),
});

export const rateSubmissionSchema = z.object({
  rating: z.number().min(0).max(100),
});

export type CreateSubmissionInput = z.infer<typeof createSubmissionSchema>;
export type RateSubmissionInput = z.infer<typeof rateSubmissionSchema>;
