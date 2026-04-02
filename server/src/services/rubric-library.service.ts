export type RubricCategory = "WEB_BUILD" | "API_BACKEND" | "DATA_ML" | "CREATIVE_ASSET" | "MARKETING_CAMPAIGN";

export type RubricDefinition = {
  name: string;
  category: RubricCategory;
  criteria: Array<{ id: string; title: string; weight: number; prompt: string }>;
  hardFailRules: Array<{ id: string; description: string }>;
  weightConfig: {
    deterministic: number;
    aiJudge: number;
    clientRating: number;
    systemScore: number;
  };
};

const RUBRICS: Record<RubricCategory, RubricDefinition> = {
  WEB_BUILD: {
    name: "Web Build Rubric",
    category: "WEB_BUILD",
    criteria: [
      { id: "functional", title: "Functional completeness", weight: 0.35, prompt: "Verify all required pages and interactions are delivered." },
      { id: "quality", title: "Code quality", weight: 0.25, prompt: "Check maintainability, structure, and clarity of implementation." },
      { id: "tests", title: "Validation evidence", weight: 0.2, prompt: "Evaluate test/build evidence quality and reproducibility." },
      { id: "ux", title: "UX and accessibility", weight: 0.2, prompt: "Assess usability, responsiveness, and accessibility basics." },
    ],
    hardFailRules: [
      { id: "missing-artifact", description: "No deployable artifact or repository evidence." },
      { id: "security-critical", description: "Critical security/compliance violation detected." },
    ],
    weightConfig: { deterministic: 0.35, aiJudge: 0.35, clientRating: 0.2, systemScore: 0.1 },
  },
  API_BACKEND: {
    name: "API Backend Rubric",
    category: "API_BACKEND",
    criteria: [
      { id: "endpoints", title: "Endpoint completeness", weight: 0.35, prompt: "Check required endpoints, contracts, and responses." },
      { id: "tests", title: "Test evidence", weight: 0.3, prompt: "Evaluate integration/unit test evidence and result quality." },
      { id: "reliability", title: "Reliability", weight: 0.2, prompt: "Assess error handling and operational stability signals." },
      { id: "docs", title: "Documentation", weight: 0.15, prompt: "Assess API usage and deployment documentation clarity." },
    ],
    hardFailRules: [
      { id: "no-test-report", description: "Missing test report evidence for API delivery." },
      { id: "breaking-contract", description: "Contract mismatch against required API schema." },
    ],
    weightConfig: { deterministic: 0.4, aiJudge: 0.3, clientRating: 0.2, systemScore: 0.1 },
  },
  DATA_ML: {
    name: "Data/ML Rubric",
    category: "DATA_ML",
    criteria: [
      { id: "dataset", title: "Dataset and preprocessing", weight: 0.25, prompt: "Assess data quality and reproducible preprocessing." },
      { id: "model", title: "Model quality", weight: 0.35, prompt: "Evaluate model performance and methodological soundness." },
      { id: "evaluation", title: "Evaluation artifacts", weight: 0.25, prompt: "Assess metrics, experiment traceability, and reproducibility." },
      { id: "ops", title: "Operational readiness", weight: 0.15, prompt: "Check inference/deployment readiness where required." },
    ],
    hardFailRules: [
      { id: "no-metrics", description: "No model evaluation metrics provided." },
      { id: "data-policy", description: "Data policy or compliance violation detected." },
    ],
    weightConfig: { deterministic: 0.35, aiJudge: 0.35, clientRating: 0.2, systemScore: 0.1 },
  },
  CREATIVE_ASSET: {
    name: "Creative Asset Rubric",
    category: "CREATIVE_ASSET",
    criteria: [
      { id: "brief", title: "Brief alignment", weight: 0.35, prompt: "Measure alignment to brief and required narrative." },
      { id: "craft", title: "Craft quality", weight: 0.3, prompt: "Assess quality of creative execution and polish." },
      { id: "deliverables", title: "Deliverable completeness", weight: 0.2, prompt: "Verify all requested assets are present." },
      { id: "cta", title: "Communication effectiveness", weight: 0.15, prompt: "Assess clarity of message and call-to-action." },
    ],
    hardFailRules: [
      { id: "missing-core-assets", description: "Required core assets are missing." },
      { id: "brand-violation", description: "Material violation of provided brand/compliance guidance." },
    ],
    weightConfig: { deterministic: 0.3, aiJudge: 0.4, clientRating: 0.2, systemScore: 0.1 },
  },
  MARKETING_CAMPAIGN: {
    name: "Marketing Campaign Rubric",
    category: "MARKETING_CAMPAIGN",
    criteria: [
      { id: "strategy", title: "Strategic alignment", weight: 0.3, prompt: "Evaluate alignment with audience and campaign objectives." },
      { id: "assets", title: "Campaign assets", weight: 0.3, prompt: "Assess quality and coverage of campaign assets." },
      { id: "measurement", title: "Measurement plan", weight: 0.25, prompt: "Assess KPI definition, tracking, and experiment plan." },
      { id: "execution", title: "Execution readiness", weight: 0.15, prompt: "Assess deployment readiness and channel fit." },
    ],
    hardFailRules: [
      { id: "no-kpi-framework", description: "No KPI/measurement framework provided." },
      { id: "compliance-risk", description: "Regulatory or policy non-compliance risk identified." },
    ],
    weightConfig: { deterministic: 0.35, aiJudge: 0.35, clientRating: 0.2, systemScore: 0.1 },
  },
};

export function inferCategoryFromProject(title: string, description: string, workType: "STRUCTURED" | "CREATIVE"): RubricCategory {
  const text = `${title} ${description}`.toLowerCase();

  if (/(api|backend|endpoint|microservice|express|rest|graphql)/.test(text)) {
    return "API_BACKEND";
  }

  if (/(ml|model|dataset|training|inference|prediction)/.test(text)) {
    return "DATA_ML";
  }

  if (/(campaign|ads|conversion|marketing|kpi|funnel)/.test(text)) {
    return "MARKETING_CAMPAIGN";
  }

  if (workType === "CREATIVE" || /(design|video|creative|branding|poster|storyboard)/.test(text)) {
    return "CREATIVE_ASSET";
  }

  return "WEB_BUILD";
}

export function getRubricByCategory(category: RubricCategory): RubricDefinition {
  return RUBRICS[category];
}
