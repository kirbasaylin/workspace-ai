// Types shared between the Express API and the Next.js client.
// Keeping them here means the contract is enforced at compile time on both ends.

export type Role = "USER" | "ASSISTANT" | "SYSTEM";
export type TaskStatus = "OPEN" | "DONE";

export interface Page {
  id: string;
  title: string;
  content: string;
  icon?: string | null;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  text: string;
  status: TaskStatus;
  dueDate?: string | null;
  sourcePageId?: string | null;
  createdAt: string;
}

/** A single retrieved chunk used to ground an answer. */
export interface Citation {
  pageId: string;
  pageTitle: string;
  chunkIndex: number;
  snippet: string;
  /** Cosine similarity in [0,1]; 1 == identical. */
  score: number;
}

export interface ChatRequest {
  question: string;
  /** Optional prior turns for multi-turn conversations. */
  history?: { role: Role; content: string }[];
}

export interface ChatResponse {
  answer: string;
  citations: Citation[];
}

export interface SearchResult {
  pageId: string;
  pageTitle: string;
  snippet: string;
  score: number;
}

export interface SummaryResponse {
  tldr: string;
  keyIdeas: string[];
  risks: string[];
  nextSteps: string[];
}

export interface ExtractedTask {
  text: string;
  dueDate?: string | null;
}

export const EMBEDDING_PROVIDERS = ["openai", "gemini", "ollama"] as const;
export const LLM_PROVIDERS = ["openai", "claude", "gemini", "ollama"] as const;
export type EmbeddingProvider = (typeof EMBEDDING_PROVIDERS)[number];
export type LLMProvider = (typeof LLM_PROVIDERS)[number];
