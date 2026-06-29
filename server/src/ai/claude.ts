import type { ChatMessage, ChatProvider } from "./provider.js";
import { env } from "../env.js";

// Anthropic separates the system prompt from the message list, so we split it out.
export const claudeChat: ChatProvider = {
  name: "claude",
  async chat(messages: ChatMessage[], opts = {}) {
    if (!env.ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY is not set");
    const system = messages
      .filter((m) => m.role === "system")
      .map((m) => m.content)
      .join("\n\n");
    const turns = messages
      .filter((m) => m.role !== "system")
      .map((m) => ({ role: m.role, content: m.content }));

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: env.ANTHROPIC_CHAT_MODEL,
        max_tokens: 1024,
        temperature: opts.temperature ?? 0.2,
        system: system || undefined,
        messages: turns,
      }),
    });
    if (!res.ok) throw new Error(`Claude chat failed: ${res.status} ${await res.text()}`);
    const data = await res.json();
    return data.content?.map((b: { text?: string }) => b.text ?? "").join("") ?? "";
  },
};

// Anthropic does not currently offer an embeddings endpoint, so Claude is a
// chat-only provider here. Pair it with openai/gemini/ollama for embeddings.
