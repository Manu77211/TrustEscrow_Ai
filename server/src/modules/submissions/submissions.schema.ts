import { z } from "zod";

const evidenceItemSchema = z.object({
  evidenceType: z.enum([
    "ARTIFACT_LINK",
    "COMMIT_HASH",
    "BUILD_LOG",
    "TEST_REPORT",
    "SCREENSHOT",
    "VIDEO",
    "REQUIREMENT_MAPPING",
    "METADATA",
  ]),
  value: z.string().trim().min(1).max(4000),
  metadata: z.record(z.any()).optional(),
});

export const draftApprovalSchema = z.object({
  approved: z.literal(true).default(true),
});

export const createSubmissionSchema = z.object({
  milestoneId: z.string().min(1),
  fileUrl: z.string().trim().url().optional().or(z.literal("")),
  notes: z.string().trim().max(5000).optional().or(z.literal("")),
  evidenceItems: z.array(evidenceItemSchema).max(25).optional(),
});

export const createMilestoneSubmissionSchema = z.object({
  fileUrl: z.string().trim().url().optional().or(z.literal("")),
  notes: z.string().trim().max(5000).optional().or(z.literal("")),
  evidenceItems: z.array(evidenceItemSchema).max(25).optional(),
});

export const rateSubmissionSchema = z.object({
  rating: z.number().min(0).max(100),
});

export const requestChangesSchema = z.object({
  feedback: z.string().trim().min(5).max(5000),
});

export type CreateSubmissionInput = z.infer<typeof createSubmissionSchema>;
export type RateSubmissionInput = z.infer<typeof rateSubmissionSchema>;
export type RequestChangesInput = z.infer<typeof requestChangesSchema>;
