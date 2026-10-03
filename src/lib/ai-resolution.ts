export type AIResolution = { outcomeId: string; rationale: string; confidence: number };
export type ResolutionOutcome = { id: string; label: string };

/** Asks the server to resolve a market with Gemini. Requires GEMINI_API_KEY on the server. */
export async function resolveMarketWithAI(
  question: string,
  sources: string[],
  outcomes: ResolutionOutcome[],
): Promise<AIResolution> {
  const res = await fetch("/api/public/resolve-market", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, sources, outcomes }),
  });
  if (!res.ok) throw new Error((await res.text()) || `Resolution failed (${res.status})`);
  return res.json() as Promise<AIResolution>;
}
