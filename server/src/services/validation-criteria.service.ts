type WorkType = "STRUCTURED" | "CREATIVE";

export type GeneratedCriteria = {
  type: WorkType;
  rules: Record<string, unknown>;
};

function fallbackCriteria(projectDescription: string): GeneratedCriteria {
  const normalized = projectDescription.toLowerCase();
  const creativeHints = ["video", "design", "creative", "brand", "ad", "poster", "script"];
  const isCreative = creativeHints.some((hint) => normalized.includes(hint));

  if (isCreative) {
    return {
      type: "CREATIVE",
      rules: {
        mustInclude: ["core message", "call-to-action"],
        style: "clear and engaging",
        completeness: "deliver all requested assets",
      },
    };
  }

  return {
    type: "STRUCTURED",
    rules: {
      checks: ["functional completeness", "requirement keyword match", "basic output verification"],
      minimumCoverage: 0.7,
      qualitySignals: ["clarity", "consistency", "deliverable correctness"],
    },
  };
}

function extractJsonObject(text: string): Record<string, unknown> | null {
  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");
  if (first === -1 || last === -1 || first >= last) {
    return null;
  }

  try {
    return JSON.parse(text.slice(first, last + 1)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function generateValidationCriteria(projectDescription: string): Promise<GeneratedCriteria> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return fallbackCriteria(projectDescription);
  }

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
        input: [
          {
            role: "system",
            content:
              "You convert project descriptions into strict JSON criteria. Output only JSON with keys: type (STRUCTURED|CREATIVE), rules (object).",
          },
          {
            role: "user",
            content: `Project description:\n${projectDescription}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      return fallbackCriteria(projectDescription);
    }

    const payload = (await response.json()) as {
      output_text?: string;
    };

    const parsed = payload.output_text ? extractJsonObject(payload.output_text) : null;
    if (!parsed) {
      return fallbackCriteria(projectDescription);
    }

    const type = parsed.type === "CREATIVE" ? "CREATIVE" : "STRUCTURED";
    const rules = typeof parsed.rules === "object" && parsed.rules !== null ? parsed.rules as Record<string, unknown> : fallbackCriteria(projectDescription).rules;

    return {
      type,
      rules,
    };
  } catch {
    return fallbackCriteria(projectDescription);
  }
}
