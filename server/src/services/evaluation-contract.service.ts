import { prisma } from "../lib/prisma.js";
import { getRubricByCategory, inferCategoryFromProject } from "./rubric-library.service.js";

export async function ensureProjectEvaluationContract(params: {
  projectId: string;
  title: string;
  description: string;
  workType: "STRUCTURED" | "CREATIVE";
}) {
  const existing = await prisma.evaluationContract.findUnique({ where: { projectId: params.projectId } });
  if (existing) {
    return existing;
  }

  const category = inferCategoryFromProject(params.title, params.description, params.workType);
  const rubric = getRubricByCategory(category);

  const rubricTemplate = await prisma.rubricTemplate.upsert({
    where: {
      name_version: {
        name: rubric.name,
        version: 1,
      },
    },
    update: {
      category: rubric.category,
      criteria: rubric.criteria as any,
      hardFailRules: rubric.hardFailRules as any,
      weightConfig: rubric.weightConfig as any,
    },
    create: {
      name: rubric.name,
      version: 1,
      category: rubric.category,
      criteria: rubric.criteria as any,
      hardFailRules: rubric.hardFailRules as any,
      weightConfig: rubric.weightConfig as any,
    },
  });

  return prisma.evaluationContract.create({
    data: {
      projectId: params.projectId,
      rubricTemplateId: rubricTemplate.id,
      category,
      requiredOutputs: {
        artifactLinks: true,
        requirementMapping: true,
        testOrValidationEvidence: true,
      } as any,
      acceptanceCriteria: rubric.criteria as any,
      scoringRubric: rubric.criteria as any,
      hardFailConditions: rubric.hardFailRules as any,
      timeConstraints: {
        defaultTargetDays: 7,
        latePenaltyEnabled: true,
      } as any,
      complianceConstraints: {
        noSensitiveDataLeak: true,
        adherenceToClientPolicy: true,
      } as any,
      version: 1,
    },
  });
}
