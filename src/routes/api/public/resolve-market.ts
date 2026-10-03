import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const Body = z.object({
  question: z.string().min(5).max(500),
  sources: z.array(z.string().url()).max(5),
  outcomes: z.array(z.object({ id: z.string().max(64), label: z.string().max(120) })).min(2).max(20),
});

export const Route = createFileRoute("/api/public/resolve-market")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env["GEMINI_API_KEY"];
        if (!key) return new Response("GEMINI_API_KEY is not configured", { status: 503 });
        const parsed = Body.safeParse(await request.json().catch(() => null));
        if (!parsed.success) return new Response("Invalid request", { status: 400 });
        const { question, sources, outcomes } = parsed.data;
        const prompt = `You resolve prediction markets. Question: "${question}". Outcomes: ${outcomes
          .map((o) => `${o.id}=${o.label}`)
          .join(", ")}. Sources: ${sources.join(", ") || "none"}. Use search to verify. Reply ONLY JSON: {"outcomeId": string, "rationale": string, "confidence": number between 0 and 1}.`;
        const r = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], tools: [{ google_search: {} }] }),
          },
        );
        if (!r.ok) return new Response("AI provider error", { status: 502 });
        const data = (await r.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
        const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
        const match = text.match(/\{[\s\S]*\}/);
        try {
          const out = z
            .object({ outcomeId: z.string(), rationale: z.string(), confidence: z.number().min(0).max(1) })
            .parse(JSON.parse(match?.[0] ?? ""));
          if (!outcomes.some((o) => o.id === out.outcomeId)) throw new Error("bad outcome");
          return Response.json(out);
        } catch {
          return new Response("Could not parse AI verdict", { status: 502 });
        }
      },
    },
  },
});
