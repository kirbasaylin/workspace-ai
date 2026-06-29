import type { ChatMessage, ChatProvider, EmbeddingProvider } from "./provider.js";
import { env } from "../env.js";

const BASE = "https://generativelanguage.googleapis.com/v1beta";

export const geminiChat: ChatProvider = {
  name: "gemini",
  async chat(messages: ChatMessage[], opts = {}) {
    if (!env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not set");
    const system = messages.filter((m) => m.role === "system").map((m) => m.content).join("\n\n");
    const contents = messages
      .filter((m) => m.role !== "system")
      .map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] }));

    const res = await fetch(
      `${BASE}/models/${env.GEMINI_CHAT_MODEL}:generateContent?key=${env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents,
          systemInstruction: system ? { parts: [{ text: system }] } : undefined,
          generationConfig: { temperature: opts.temperature ?? 0.2 },
        }),
      },
    );
    if (!res.ok) throw new Error(`Gemini chat failed: ${res.status} ${await res.text()}`);
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("") ?? "";
  },
};

export const geminiEmbeddings: EmbeddingProvider = {
  name: "gemini",
  dimension: env.EMBEDDING_DIM,
  async embed(texts: string[]) {
    if (!env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not set");
    // Gemini embeds one text per request; batch with Promise.all.
    const results = await Promise.all(
      texts.map(async (text) => {
        const res = await fetch(
          `${BASE}/models/${env.GEMINI_EMBEDDING_MODEL}:embedContent?key=${env.GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: { parts: [{ text }] } }),
          },
        );
        if (!res.ok) throw new Error(`Gemini embed failed: ${res.status} ${await res.text()}`);
        const data = await res.json();
        return data.embedding.values as number[];
      }),
    );
    return results;
  },
};
