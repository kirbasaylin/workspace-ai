import { Router } from "express";
import { asyncRoute } from "../middleware/errors.js";
import { searchChunks } from "../services/embedding.service.js";

export const searchRouter = Router();

// GET /search?q=... — semantic (embedding) search, not keyword search.
searchRouter.get(
  "/",
  asyncRoute(async (req, res) => {
    const q = String(req.query.q ?? "").trim();
    if (!q) return res.status(400).json({ error: "q is required" });
    const hits = await searchChunks(req.workspaceId, q, 10);
    res.json(
      hits.map((h) => ({ pageId: h.pageId, pageTitle: h.pageTitle, snippet: h.snippet, score: h.score })),
    );
  }),
);
