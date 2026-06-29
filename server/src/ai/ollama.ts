import type { ChatMessage, ChatProvider, EmbeddingProvider } from "./provider.js";
import { env } from "../env.js";

// Ollama runs locally — the privacy-friendly, zero-cost option. No API key.
export const ollamaChat: ChatProvider = {
  name: "ollama",
  async chat(messages: ChatMessage[], opts = {}) {
    const res = await fetch(`${env.OLLAMA_BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: env.OLLAMA_CHAT_MODEL,
        messages,
        stream: false,
        options: { temperature: opts.temperature ?? 0.2 },
      }),
    });
    if (!res.ok) throw new Error(`Ollama chat failed: ${res.status} ${await res.text()}`);
    const data = await res.json();
    return data.message?.content ?? "";
  },
};

export const ollamaEmbeddings: EmbeddingProvider = {
  name: "ollama",
  dimension: env.EMBEDDING_DIM,
  async embed(texts: string[]) {
    const results = await Promise.all(
      texts.map(async (text) => {
        const res = await fetch(`${env.OLLAMA_BASE_URL}/api/embeddings`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ model: env.OLLAMA_EMBEDDING_MODEL, prompt: text }),
        });
        if (!res.ok) throw new Error(`Ollama embed failed: ${res.status} ${await res.text()}`);
        const data = await res.json();
        return data.embedding as number[];
      }),
    );
    return results;
  },
};
