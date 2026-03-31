import { z } from "zod";

export const createProjectSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters"),
  description: z.string().trim().min(10, "Description must be at least 10 characters"),
  workType: z.enum(["STRUCTURED", "CREATIVE"]).optional().default("STRUCTURED"),
});

export const assignFreelancerSchema = z.object({
  freelancerId: z.string().min(1),
});

export const createProjectMessageSchema = z.object({
  content: z.string().trim().min(1).max(5000),
  fileUrl: z.string().trim().url().optional().or(z.literal("")),
});

export const applyToProjectSchema = z.object({
  message: z.string().trim().max(1000).optional().or(z.literal("")),
});

export const selectApplicantSchema = z.object({
  applicationId: z.string().min(1),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type AssignFreelancerInput = z.infer<typeof assignFreelancerSchema>;
export type CreateProjectMessageInput = z.infer<typeof createProjectMessageSchema>;
export type ApplyToProjectInput = z.infer<typeof applyToProjectSchema>;
export type SelectApplicantInput = z.infer<typeof selectApplicantSchema>;
