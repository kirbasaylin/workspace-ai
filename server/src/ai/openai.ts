import type { ChatMessage, ChatProvider, EmbeddingProvider } from "./provider.js";
import { env } from "../env.js";

const BASE = "https://api.openai.com/v1";

function authHeaders() {
  if (!env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not set");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${env.OPENAI_API_KEY}`,
  };
}

export const openaiChat: ChatProvider = {
  name: "openai",
  async chat(messages: ChatMessage[], opts = {}) {
    const res = await fetch(`${BASE}/chat/completions`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        model: env.OPENAI_CHAT_MODEL,
        messages,
        temperature: opts.temperature ?? 0.2,
      }),
    });
    if (!res.ok) throw new Error(`OpenAI chat failed: ${res.status} ${await res.text()}`);
    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? "";
  },
};

export const openaiEmbeddings: EmbeddingProvider = {
  name: "openai",
  dimension: env.EMBEDDING_DIM,
  async embed(texts: string[]) {
    const res = await fetch(`${BASE}/embeddings`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ model: env.OPENAI_EMBEDDING_MODEL, input: texts }),
    });
    if (!res.ok) throw new Error(`OpenAI embeddings failed: ${res.status} ${await res.text()}`);
    const data = await res.json();
    return data.data.map((d: { embedding: number[] }) => d.embedding);
  },
};
