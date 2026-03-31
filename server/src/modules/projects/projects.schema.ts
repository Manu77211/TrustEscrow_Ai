import { z } from "zod";

export const createProjectSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  workType: z.enum(["STRUCTURED", "CREATIVE"]).optional().default("STRUCTURED"),
});

export const assignFreelancerSchema = z.object({
  freelancerId: z.string().min(1),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type AssignFreelancerInput = z.infer<typeof assignFreelancerSchema>;
