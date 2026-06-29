// The RAG loop: retrieve relevant chunks -> build a grounded prompt -> answer.
import { getChatProvider, type ChatMessage } from "../ai/index.js";
import { searchChunks } from "./embedding.service.js";
import type { ChatResponse, Role } from "@workspace-ai/shared";

const SYSTEM_PROMPT = `You are a workspace assistant. Answer using ONLY the provided context from the user's notes.
- If the context doesn't contain the answer, say so plainly — do not invent facts.
- Be concise. Cite which note(s) you used by title.`;

export async function answerQuestion(
  workspaceId: string,
  question: string,
  history: { role: Role; content: string }[] = [],
): Promise<ChatResponse> {
  const citations = await searchChunks(workspaceId, question, 6);

  const context = citations
    .map((c, i) => `[${i + 1}] (${c.pageTitle})\n${c.snippet}`)
    .join("\n\n---\n\n");

  const messages: ChatMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history.map((h) => ({
      role: h.role.toLowerCase() as "user" | "assistant",
      content: h.content,
    })),
    {
      role: "user",
      content: `Context from my workspace:\n\n${context || "(no relevant notes found)"}\n\nQuestion: ${question}`,
    },
  ];

  const answer = await getChatProvider().chat(messages);
  return { answer, citations };
}
