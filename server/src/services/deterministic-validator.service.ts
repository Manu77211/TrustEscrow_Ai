type EvidenceRecord = {
  evidenceType: string;
  value: string;
  metadata?: Record<string, unknown> | null;
};

type ContractRecord = {
  requiredOutputs?: Record<string, unknown>;
  hardFailConditions?: Array<{ id?: string; description?: string }>;
};

export type DeterministicValidationResult = {
  score: number;
  hardFail: boolean;
  checks: Array<{ id: string; passed: boolean; reason: string }>;
};

function hasEvidence(evidences: EvidenceRecord[], type: string) {
  return evidences.some((item) => item.evidenceType === type && item.value.trim().length > 0);
}

export function runDeterministicValidation(input: {
  contract: ContractRecord | null;
  evidences: EvidenceRecord[];
  notes: string | null;
  submissionCreatedAt: Date;
  milestoneCreatedAt: Date;
}) : DeterministicValidationResult {
  const checks: Array<{ id: string; passed: boolean; reason: string }> = [];

  const artifactCheck = hasEvidence(input.evidences, "ARTIFACT_LINK");
  checks.push({
    id: "artifact-link",
    passed: artifactCheck,
    reason: artifactCheck ? "Artifact link evidence provided." : "Missing artifact link evidence.",
  });

  const requirementCheck = hasEvidence(input.evidences, "REQUIREMENT_MAPPING") || (input.notes ?? "").trim().length >= 20;
  checks.push({
    id: "requirement-mapping",
    passed: requirementCheck,
    reason: requirementCheck ? "Requirement mapping evidence found." : "Requirement mapping evidence missing.",
  });

  const validationEvidenceCheck = hasEvidence(input.evidences, "TEST_REPORT") || hasEvidence(input.evidences, "BUILD_LOG");
  checks.push({
    id: "validation-evidence",
    passed: validationEvidenceCheck,
    reason: validationEvidenceCheck ? "Build/test validation evidence found." : "No test/build evidence attached.",
  });

  const days = (input.submissionCreatedAt.getTime() - input.milestoneCreatedAt.getTime()) / (1000 * 60 * 60 * 24);
  const deadlineCheck = days <= 7;
  checks.push({
    id: "deadline-window",
    passed: deadlineCheck,
    reason: deadlineCheck ? "Submitted within default 7-day window." : "Submission appears late against default window.",
  });

  const passedChecks = checks.filter((item) => item.passed).length;
  const score = Number(((passedChecks / checks.length) * 100).toFixed(2));

  const hardFail = !artifactCheck;
  return { score, hardFail, checks };
}
