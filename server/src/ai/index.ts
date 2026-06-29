// Factory: reads env and hands back the configured providers.
// This is the ONLY place that knows which concrete provider is active.
import type { ChatProvider, EmbeddingProvider } from "./provider.js";
import { env } from "../env.js";
import { openaiChat, openaiEmbeddings } from "./openai.js";
import { claudeChat } from "./claude.js";
import { geminiChat, geminiEmbeddings } from "./gemini.js";
import { ollamaChat, ollamaEmbeddings } from "./ollama.js";

const chatProviders: Record<string, ChatProvider> = {
  openai: openaiChat,
  claude: claudeChat,
  gemini: geminiChat,
  ollama: ollamaChat,
};

const embeddingProviders: Record<string, EmbeddingProvider> = {
  openai: openaiEmbeddings,
  gemini: geminiEmbeddings,
  ollama: ollamaEmbeddings,
};

export function getChatProvider(): ChatProvider {
  const p = chatProviders[env.LLM_PROVIDER];
  if (!p) throw new Error(`Unknown LLM_PROVIDER: ${env.LLM_PROVIDER}`);
  return p;
}

export function getEmbeddingProvider(): EmbeddingProvider {
  const p = embeddingProviders[env.EMBEDDING_PROVIDER];
  if (!p) throw new Error(`Unknown EMBEDDING_PROVIDER: ${env.EMBEDDING_PROVIDER}`);
  return p;
}

export type { ChatProvider, EmbeddingProvider, ChatMessage } from "./provider.js";
