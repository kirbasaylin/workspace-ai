// Automatic task extraction from free text ("Need to email recruiter." -> task).
import { getChatProvider, type ChatMessage } from "../ai/index.js";
import type { ExtractedTask } from "@workspace-ai/shared";

const PROMPT = `Extract actionable to-do items from the text. Ignore non-actionable statements.
Respond with ONLY valid JSON, no markdown fences:
{"tasks": [{"text": string, "dueDate": string | null}]}
dueDate must be ISO 8601 (YYYY-MM-DD) if a date is stated or clearly implied, else null.`;

export async function extractTasks(content: string): Promise<ExtractedTask[]> {
  const messages: ChatMessage[] = [
    { role: "system", content: PROMPT },
    { role: "user", content: content.slice(0, 8000) },
  ];
  const raw = await getChatProvider().chat(messages, { temperature: 0 });
  try {
    const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
    return Array.isArray(parsed.tasks) ? parsed.tasks : [];
  } catch {
    return [];
  }
}
