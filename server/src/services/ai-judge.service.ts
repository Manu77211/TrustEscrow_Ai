type JudgeInput = {
  rubric: Array<{ id: string; title: string; weight: number; prompt: string }>;
  evidences: Array<{ evidenceType: string; value: string }>;
  notes: string | null;
};

type JudgeResult = {
  score: number;
  confidence: number;
  citations: string[];
  rationale: string;
  model: string;
};

function fallbackJudge(model: string, input: JudgeInput): JudgeResult {
  const evidenceCount = input.evidences.length;
  const notesLength = (input.notes ?? "").trim().length;
  const score = Math.max(45, Math.min(92, 52 + evidenceCount * 6 + (notesLength > 40 ? 8 : 0)));
  const confidence = Math.max(55, Math.min(90, 60 + evidenceCount * 5));
  const citations = input.evidences.slice(0, 4).map((item) => `${item.evidenceType}:${item.value.slice(0, 80)}`);

  return {
    score,
    confidence,
    citations,
    rationale: "Fallback grounded judge based on evidence density and notes completeness.",
    model,
  };
}

async function runModelJudge(model: string, input: JudgeInput): Promise<JudgeResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return fallbackJudge(model, input);
  }

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        input: [
          {
            role: "system",
            content: "You are an evidence-grounded evaluator. Return strict JSON with keys score(0-100), confidence(0-100), citations(string[]), rationale(string). No markdown.",
          },
          {
            role: "user",
            content: JSON.stringify({ rubric: input.rubric, evidences: input.evidences, notes: input.notes }),
          },
        ],
      }),
    });

    if (!response.ok) {
      return fallbackJudge(model, input);
    }

    const payload = (await response.json()) as { output_text?: string };
    const text = payload.output_text ?? "";
    const first = text.indexOf("{");
    const last = text.lastIndexOf("}");
    if (first === -1 || last === -1 || first >= last) {
      return fallbackJudge(model, input);
    }

    const parsed = JSON.parse(text.slice(first, last + 1)) as {
      score?: number;
      confidence?: number;
      citations?: string[];
      rationale?: string;
    };

    const score = typeof parsed.score === "number" ? parsed.score : fallbackJudge(model, input).score;
    const confidence = typeof parsed.confidence === "number" ? parsed.confidence : fallbackJudge(model, input).confidence;

    return {
      score: Math.max(0, Math.min(100, score)),
      confidence: Math.max(0, Math.min(100, confidence)),
      citations: Array.isArray(parsed.citations) ? parsed.citations.slice(0, 8) : [],
      rationale: typeof parsed.rationale === "string" ? parsed.rationale : "Grounded rubric judgement generated.",
      model,
    };
  } catch {
    return fallbackJudge(model, input);
  }
}

export async function runDualModelJudge(input: JudgeInput) {
  const modelA = process.env.OPENAI_MODEL_A ?? process.env.OPENAI_MODEL ?? "gpt-4o-mini";
  const modelB = process.env.OPENAI_MODEL_B ?? "gpt-4o-mini";

  const [judgeA, judgeB] = await Promise.all([
    runModelJudge(modelA, input),
    runModelJudge(modelB, input),
  ]);

  const delta = Math.abs(judgeA.score - judgeB.score);
  const consistencyScore = Number(Math.max(0, 100 - delta * 2).toFixed(2));

  return {
    judgeA,
    judgeB,
    consistencyScore,
    averageAiScore: Number(((judgeA.score + judgeB.score) / 2).toFixed(2)),
  };
}
