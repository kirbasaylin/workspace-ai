import { Router } from "express";
import { prisma } from "../db.js";
import { asyncRoute } from "../middleware/errors.js";
import { summarizePage } from "../services/summarize.service.js";

export const summarizeRouter = Router();

// POST /summarize — summarize raw text, or a saved page by id.
summarizeRouter.post(
  "/",
  asyncRoute(async (req, res) => {
    let content = req.body?.content;
    const pageId = req.body?.pageId;
    if (!content && pageId) {
      const page = await prisma.page.findFirst({
        where: { id: pageId, workspaceId: req.workspaceId },
      });
      content = page?.content;
    }
    if (!content) return res.status(400).json({ error: "content or pageId is required" });
    res.json(await summarizePage(content));
  }),
);
