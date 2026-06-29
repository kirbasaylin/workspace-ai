// Embedding + vector-search service. This is where pgvector lives.
// Prisma can't express the vector type or the `<=>` distance operator, so every
// vector op goes through $executeRaw / $queryRaw with parameterized SQL.
import { prisma } from "../db.js";
import { getEmbeddingProvider } from "../ai/index.js";
import { chunkText } from "./chunk.js";
import type { Citation } from "@workspace-ai/shared";

/** Serialize a JS number[] into the pgvector text literal: "[1,2,3]". */
function toVectorLiteral(vec: number[]): string {
  return `[${vec.join(",")}]`;
}

/**
 * Re-embed a page from scratch: delete old chunks, chunk, embed, insert.
 * Called whenever a page is created or its content changes.
 */
export async function indexPage(pageId: string, content: string): Promise<number> {
  const provider = getEmbeddingProvider();
  const chunks = chunkText(content);

  await prisma.embedding.deleteMany({ where: { pageId } });
  if (chunks.length === 0) return 0;

  const vectors = await provider.embed(chunks.map((c) => c.content));

  // Raw insert because of the vector column. Build one multi-row INSERT.
  for (let i = 0; i < chunks.length; i++) {
    await prisma.$executeRaw`
      INSERT INTO "Embedding" (id, "pageId", "chunkIndex", content, embedding, "createdAt")
      VALUES (
        gen_random_uuid(),
        ${pageId},
        ${chunks[i].index},
        ${chunks[i].content},
        ${toVectorLiteral(vectors[i])}::vector,
        now()
      )`;
  }
  return chunks.length;
}

/**
 * Semantic search across a workspace. Returns the top-k most similar chunks
 * using cosine distance (`<=>`). Similarity score = 1 - distance.
 */
export async function searchChunks(workspaceId: string, query: string, k = 6): Promise<Citation[]> {
  const provider = getEmbeddingProvider();
  const [queryVec] = await provider.embed([query]);

  const rows = await prisma.$queryRaw<
    { pageId: string; pageTitle: string; chunkIndex: number; content: string; distance: number }[]
  >`
    SELECT e."pageId"      AS "pageId",
           p.title         AS "pageTitle",
           e."chunkIndex"  AS "chunkIndex",
           e.content       AS content,
           (e.embedding <=> ${toVectorLiteral(queryVec)}::vector) AS distance
    FROM "Embedding" e
    JOIN "Page" p ON p.id = e."pageId"
    WHERE p."workspaceId" = ${workspaceId}
      AND p.archived = false
    ORDER BY distance ASC
    LIMIT ${k}`;

  return rows.map((r) => ({
    pageId: r.pageId,
    pageTitle: r.pageTitle,
    chunkIndex: r.chunkIndex,
    snippet: r.content.slice(0, 280),
    score: Number((1 - r.distance).toFixed(4)),
  }));
}

/** "Related pages" feature: most similar OTHER pages to a given page. */
export async function relatedPages(workspaceId: string, pageId: string, k = 5) {
  const rows = await prisma.$queryRaw<{ pageId: string; pageTitle: string; score: number }[]>`
    WITH centroid AS (
      SELECT AVG(embedding) AS v FROM "Embedding" WHERE "pageId" = ${pageId}
    )
    SELECT p.id AS "pageId",
           p.title AS "pageTitle",
           (1 - MIN(e.embedding <=> (SELECT v FROM centroid)))::float AS score
    FROM "Embedding" e
    JOIN "Page" p ON p.id = e."pageId"
    WHERE p."workspaceId" = ${workspaceId}
      AND p.id <> ${pageId}
      AND p.archived = false
    GROUP BY p.id, p.title
    ORDER BY score DESC
    LIMIT ${k}`;
  return rows.map((r) => ({ ...r, score: Number(r.score.toFixed(4)) }));
}
