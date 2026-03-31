import { z } from "zod";

export const draftApprovalSchema = z.object({
  approved: z.literal(true).default(true),
});

export const createSubmissionSchema = z.object({
  kind: z.enum(["DRAFT", "FINAL"]).default("FINAL"),
  fileUrl: z.string().trim().url().optional().or(z.literal("")),
  notes: z.string().trim().max(5000).optional().or(z.literal("")),
});

export type CreateSubmissionInput = z.infer<typeof createSubmissionSchema>;
