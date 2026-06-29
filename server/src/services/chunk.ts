// Splits a document into overlapping chunks before embedding.
// Overlap preserves context that would otherwise be cut mid-sentence at a
// chunk boundary, which measurably improves retrieval quality.

export interface Chunk {
  index: number;
  content: string;
}

export function chunkText(
  text: string,
  { chunkSize = 1000, overlap = 150 }: { chunkSize?: number; overlap?: number } = {},
): Chunk[] {
  const clean = text.replace(/\r\n/g, "\n").trim();
  if (!clean) return [];
  if (clean.length <= chunkSize) return [{ index: 0, content: clean }];

  const chunks: Chunk[] = [];
  let start = 0;
  let index = 0;

  while (start < clean.length) {
    let end = Math.min(start + chunkSize, clean.length);

    // Prefer to break on a paragraph or sentence boundary near the end of the
    // window, so chunks stay semantically coherent.
    if (end < clean.length) {
      const slice = clean.slice(start, end);
      const para = slice.lastIndexOf("\n\n");
      const sentence = slice.lastIndexOf(". ");
      const breakAt = para > chunkSize * 0.5 ? para : sentence > chunkSize * 0.5 ? sentence + 1 : -1;
      if (breakAt > 0) end = start + breakAt;
    }

    chunks.push({ index: index++, content: clean.slice(start, end).trim() });
    if (end >= clean.length) break;
    start = end - overlap;
  }

  return chunks;
}
