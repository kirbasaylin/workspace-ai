import { Router } from "express";
import { prisma } from "../db.js";
import { asyncRoute } from "../middleware/errors.js";
import { indexPage } from "../services/embedding.service.js";

export const embedRouter = Router();

// POST /embed/:pageId — manually (re)index a page. Useful for backfills.
embedRouter.post(
  "/:pageId",
  asyncRoute(async (req, res) => {
    const page = await prisma.page.findFirst({
      where: { id: req.params.pageId, workspaceId: req.workspaceId },
    });
    if (!page) return res.status(404).json({ error: "Page not found" });
    const count = await indexPage(page.id, page.content);
    res.json({ pageId: page.id, chunks: count });
  }),
);
