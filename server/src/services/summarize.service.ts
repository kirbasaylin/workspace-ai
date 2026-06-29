// AI summaries: TLDR / key ideas / risks / next steps as structured JSON.
import { getChatProvider, type ChatMessage } from "../ai/index.js";
import type { SummaryResponse } from "@workspace-ai/shared";

const PROMPT = `Summarize the document below. Respond with ONLY valid JSON, no markdown fences, in this exact shape:
{"tldr": string, "keyIdeas": string[], "risks": string[], "nextSteps": string[]}`;

export async function summarizePage(content: string): Promise<SummaryResponse> {
  const messages: ChatMessage[] = [
    { role: "system", content: PROMPT },
    { role: "user", content: content.slice(0, 12000) },
  ];
  const raw = await getChatProvider().chat(messages, { temperature: 0 });
  return safeParse(raw);
}

function safeParse(raw: string): SummaryResponse {
  // Models occasionally wrap JSON in ```json fences despite instructions.
  const cleaned = raw.replace(/```json|```/g, "").trim();
  try {
    const parsed = JSON.parse(cleaned);
    return {
      tldr: parsed.tldr ?? "",
      keyIdeas: parsed.keyIdeas ?? [],
      risks: parsed.risks ?? [],
      nextSteps: parsed.nextSteps ?? [],
    };
  } catch {
    // Fallback so the endpoint never 500s on a malformed model response.
    return { tldr: raw.slice(0, 500), keyIdeas: [], risks: [], nextSteps: [] };
  }
}
