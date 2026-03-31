export interface ParsedRequirements {
  milestones: Array<{
    title: string;
    description: string;
    amount: number;
  }>;
  deliverables: string[];
  validationCriteria: string[];
}

export async function parseRequirements(description: string): Promise<ParsedRequirements> {
  const cleaned = description.trim();

  // Deterministic fallback parser for MVP. Can be replaced with OpenAI call later.
  const milestones = [
    {
      title: "Milestone 1: Draft",
      description: `Initial direction and first draft based on: ${cleaned.slice(0, 120)}`,
      amount: 40,
    },
    {
      title: "Milestone 2: Final Delivery",
      description: "Final polished delivery with requested revisions and assets.",
      amount: 60,
    },
  ];

  const deliverables = [
    "Primary output files",
    "Source/editable files",
    "Final delivery summary notes",
  ];

  const validationCriteria = [
    "Requirement coverage",
    "Completeness of deliverables",
    "Timely submission",
  ];

  return {
    milestones,
    deliverables,
    validationCriteria,
  };
}
