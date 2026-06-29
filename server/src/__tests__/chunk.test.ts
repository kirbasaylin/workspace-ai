import { describe, it, expect } from "vitest";
import { chunkText } from "../services/chunk.js";

describe("chunkText", () => {
  it("returns empty array for empty input", () => {
    expect(chunkText("")).toEqual([]);
    expect(chunkText("   \n  ")).toEqual([]);
  });

  it("keeps short text as a single chunk", () => {
    const chunks = chunkText("hello world");
    expect(chunks).toHaveLength(1);
    expect(chunks[0]).toEqual({ index: 0, content: "hello world" });
  });

  it("splits long text into multiple ordered chunks", () => {
    const text = "a. ".repeat(2000); // ~6000 chars
    const chunks = chunkText(text, { chunkSize: 1000, overlap: 100 });
    expect(chunks.length).toBeGreaterThan(1);
    chunks.forEach((c, i) => expect(c.index).toBe(i));
  });

  it("creates overlap between consecutive chunks", () => {
    const text = Array.from({ length: 50 }, (_, i) => `Sentence number ${i}.`).join(" ");
    const chunks = chunkText(text, { chunkSize: 200, overlap: 50 });
    // The tail of chunk N should share content with the head of chunk N+1.
    const tail = chunks[0].content.slice(-30);
    expect(chunks[1].content.includes(tail.trim().split(" ").pop()!)).toBe(true);
  });
});
