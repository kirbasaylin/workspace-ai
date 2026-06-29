// Thin typed fetch wrapper around the Express API.
import type {
  ChatResponse,
  SearchResult,
  SummaryResponse,
  Page,
} from "@workspace-ai/shared";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? res.statusText);
  return res.status === 204 ? (undefined as T) : res.json();
}

export const api = {
  listPages: () => req<Pick<Page, "id" | "title">[]>("/pages"),
  getPage: (id: string) => req<Page>(`/pages/${id}`),
  createPage: (body: { title: string; content: string }) =>
    req<Page>("/pages", { method: "POST", body: JSON.stringify(body) }),
  updatePage: (id: string, body: Partial<Page>) =>
    req<Page>(`/pages/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  chat: (question: string) =>
    req<ChatResponse>("/chat", { method: "POST", body: JSON.stringify({ question }) }),
  search: (q: string) => req<SearchResult[]>(`/search?q=${encodeURIComponent(q)}`),
  summarize: (pageId: string) =>
    req<SummaryResponse>("/summarize", { method: "POST", body: JSON.stringify({ pageId }) }),
};
