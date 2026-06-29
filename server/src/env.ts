// Centralized, validated environment access. Importing `env` anywhere guarantees
// required vars exist and are typed — no `process.env.FOO!` scattered around.
import "dotenv/config";

function str(key: string, fallback?: string): string {
  const v = process.env[key] ?? fallback;
  if (v === undefined) throw new Error(`Missing required env var: ${key}`);
  return v;
}

function int(key: string, fallback: number): number {
  const v = process.env[key];
  return v ? Number.parseInt(v, 10) : fallback;
}

export const env = {
  NODE_ENV: str("NODE_ENV", "development"),
  PORT: int("PORT", 4000),
  CLIENT_ORIGIN: str("CLIENT_ORIGIN", "http://localhost:3000"),
  DATABASE_URL: str("DATABASE_URL"),

  LLM_PROVIDER: str("LLM_PROVIDER", "openai"),
  EMBEDDING_PROVIDER: str("EMBEDDING_PROVIDER", "openai"),
  EMBEDDING_DIM: int("EMBEDDING_DIM", 1536),

  OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? "",
  OPENAI_CHAT_MODEL: str("OPENAI_CHAT_MODEL", "gpt-4o-mini"),
  OPENAI_EMBEDDING_MODEL: str("OPENAI_EMBEDDING_MODEL", "text-embedding-3-small"),

  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY ?? "",
  ANTHROPIC_CHAT_MODEL: str("ANTHROPIC_CHAT_MODEL", "claude-3-5-sonnet-latest"),

  GEMINI_API_KEY: process.env.GEMINI_API_KEY ?? "",
  GEMINI_CHAT_MODEL: str("GEMINI_CHAT_MODEL", "gemini-1.5-flash"),
  GEMINI_EMBEDDING_MODEL: str("GEMINI_EMBEDDING_MODEL", "text-embedding-004"),

  OLLAMA_BASE_URL: str("OLLAMA_BASE_URL", "http://localhost:11434"),
  OLLAMA_CHAT_MODEL: str("OLLAMA_CHAT_MODEL", "llama3.1"),
  OLLAMA_EMBEDDING_MODEL: str("OLLAMA_EMBEDDING_MODEL", "nomic-embed-text"),
} as const;
