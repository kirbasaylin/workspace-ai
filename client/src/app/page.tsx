"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { ChatResponse, SearchResult } from "@workspace-ai/shared";

export default function Home() {
  const [pages, setPages] = useState<{ id: string; title: string }[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  const refresh = () => api.listPages().then(setPages).catch(() => {});
  useEffect(() => { refresh(); }, []);

  async function openPage(id: string) {
    const p = await api.getPage(id);
    setActiveId(p.id);
    setTitle(p.title);
    setContent(p.content);
  }

  async function save() {
    setSaving(true);
    try {
      if (activeId) {
        await api.updatePage(activeId, { title, content });
      } else {
        const p = await api.createPage({ title: title || "Untitled", content });
        setActiveId(p.id);
      }
      await refresh();
    } finally {
      setSaving(false);
    }
  }

  function newPage() {
    setActiveId(null);
    setTitle("");
    setContent("");
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", height: "100vh" }}>
      <aside style={{ borderRight: "1px solid var(--border)", padding: 16, background: "var(--panel)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <span style={{ fontSize: 18 }}>◆</span>
          <strong>Workspace AI</strong>
        </div>
        <button style={{ width: "100%", marginBottom: 12 }} onClick={newPage}>+ New page</button>
        <div style={{ color: "var(--muted)", fontSize: 12, textTransform: "uppercase", margin: "12px 0 6px" }}>Pages</div>
        {pages.map((p) => (
          <div
            key={p.id}
            onClick={() => openPage(p.id)}
            style={{
              padding: "6px 8px", borderRadius: 6, cursor: "pointer",
              background: p.id === activeId ? "var(--accent-soft)" : "transparent",
            }}
          >
            {p.title || "Untitled"}
          </div>
        ))}
      </aside>

      <main style={{ padding: 32, overflow: "auto" }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Untitled"
          style={{ fontSize: 28, fontWeight: 700, border: "none", background: "transparent", padding: 0, marginBottom: 16 }}
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start writing… (markdown supported). New pages are embedded automatically for semantic search."
          style={{ minHeight: 320, resize: "vertical", lineHeight: 1.7 }}
        />
        <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
          <button onClick={save} disabled={saving}>{saving ? "Saving…" : activeId ? "Save" : "Create & index"}</button>
          {activeId && <SummarizeButton pageId={activeId} />}
        </div>
        <SearchPanel />
      </main>

      <ChatWidget />
    </div>
  );
}

function SummarizeButton({ pageId }: { pageId: string }) {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  async function run() {
    setLoading(true);
    try {
      const s = await api.summarize(pageId);
      setSummary(`TLDR: ${s.tldr}\n\nKey ideas:\n- ${s.keyIdeas.join("\n- ")}`);
    } finally {
      setLoading(false);
    }
  }
  return (
    <>
      <button onClick={run} disabled={loading}>{loading ? "Summarizing…" : "✨ Summarize"}</button>
      {summary && (
        <pre style={{ position: "fixed", inset: "auto 24px 24px auto", maxWidth: 360, background: "var(--panel-2)", border: "1px solid var(--border)", borderRadius: 10, padding: 16, whiteSpace: "pre-wrap" }}>
          {summary}
        </pre>
      )}
    </>
  );
}

function SearchPanel() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  async function run() {
    if (!q.trim()) return;
    setResults(await api.search(q));
  }
  return (
    <section style={{ marginTop: 32 }}>
      <h3 style={{ color: "var(--muted)", fontSize: 13, textTransform: "uppercase" }}>Semantic search</h3>
      <div style={{ display: "flex", gap: 8 }}>
        <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && run()} placeholder='e.g. "GPU optimization"' />
        <button onClick={run}>Search</button>
      </div>
      {results.map((r, i) => (
        <div key={i} style={{ marginTop: 10, padding: 12, border: "1px solid var(--border)", borderRadius: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <strong>{r.pageTitle}</strong>
            <span style={{ color: "var(--accent)" }}>{Math.round(r.score * 100)}% match</span>
          </div>
          <div style={{ color: "var(--muted)" }}>{r.snippet}</div>
        </div>
      ))}
    </section>
  );
}

function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [resp, setResp] = useState<ChatResponse | null>(null);
  const [loading, setLoading] = useState(false);

  async function ask() {
    if (!q.trim()) return;
    setLoading(true);
    try {
      setResp(await api.chat(q));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ position: "fixed", right: 24, bottom: 24 }}>
      {open && (
        <div style={{ width: 360, background: "var(--panel)", border: "1px solid var(--border)", borderRadius: 12, padding: 16, marginBottom: 12, boxShadow: "0 12px 40px #0008" }}>
          <strong>Ask your workspace</strong>
          {resp && (
            <div style={{ marginTop: 12 }}>
              <div style={{ whiteSpace: "pre-wrap" }}>{resp.answer}</div>
              {resp.citations.length > 0 && (
                <div style={{ marginTop: 10, color: "var(--muted)", fontSize: 12 }}>
                  Sources: {resp.citations.map((c) => c.pageTitle).join(", ")}
                </div>
              )}
            </div>
          )}
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && ask()} placeholder="What projects mention CUDA?" />
            <button onClick={ask} disabled={loading}>{loading ? "…" : "Ask"}</button>
          </div>
        </div>
      )}
      <button onClick={() => setOpen(!open)} style={{ borderRadius: 999, padding: "12px 18px", background: "var(--accent)", borderColor: "var(--accent)", color: "white" }}>
        {open ? "Close" : "✦ AI"}
      </button>
    </div>
  );
}
