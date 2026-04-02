export type FusionInput = {
  deterministicScore: number;
  aiScore: number;
  clientRating: number;
  systemScore: number;
  consistencyScore: number;
  hardFail: boolean;
  weightConfig?: {
    deterministic?: number;
    aiJudge?: number;
    clientRating?: number;
    systemScore?: number;
  };
};

export type PolicyResult = {
  fusionScore: number;
  policyBand: "AUTO_APPROVE" | "HUMAN_REVIEW" | "AUTO_DISPUTE";
  requiresHumanReview: boolean;
};

export function runFusionAndPolicy(input: FusionInput): PolicyResult {
  const deterministicWeight = input.weightConfig?.deterministic ?? 0.35;
  const aiWeight = input.weightConfig?.aiJudge ?? 0.35;
  const clientWeight = input.weightConfig?.clientRating ?? 0.2;
  const systemWeight = input.weightConfig?.systemScore ?? 0.1;

  const fusionScore = Number((
    input.deterministicScore * deterministicWeight +
    input.aiScore * aiWeight +
    input.clientRating * clientWeight +
    input.systemScore * systemWeight
  ).toFixed(2));

  if (input.hardFail) {
    return {
      fusionScore,
      policyBand: "AUTO_DISPUTE",
      requiresHumanReview: false,
    };
  }

  if (fusionScore >= 75 && input.consistencyScore >= 60) {
    return {
      fusionScore,
      policyBand: "AUTO_APPROVE",
      requiresHumanReview: false,
    };
  }

  if (fusionScore >= 60 || input.consistencyScore < 60) {
    return {
      fusionScore,
      policyBand: "HUMAN_REVIEW",
      requiresHumanReview: true,
    };
  }

  return {
    fusionScore,
    policyBand: "AUTO_DISPUTE",
    requiresHumanReview: false,
  };
}
