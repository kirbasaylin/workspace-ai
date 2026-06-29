// Provider-agnostic interfaces. Every concrete provider (OpenAI, Claude, Gemini,
// Ollama) implements one or both of these. The rest of the app only ever talks
// to these interfaces, so adding a provider never touches business logic.

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatProvider {
  readonly name: string;
  /** Returns the assistant's text completion for a message list. */
  chat(messages: ChatMessage[], opts?: { temperature?: number }): Promise<string>;
}

export interface EmbeddingProvider {
  readonly name: string;
  /** Output dimensionality — must match the vector(N) column. */
  readonly dimension: number;
  /** Batch-embeds texts, preserving order. */
  embed(texts: string[]): Promise<number[][]>;
}
