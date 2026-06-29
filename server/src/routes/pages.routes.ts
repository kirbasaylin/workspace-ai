import { Router } from "express";
import { prisma } from "../db.js";
import { asyncRoute } from "../middleware/errors.js";
import { indexPage, relatedPages } from "../services/embedding.service.js";

export const pagesRouter = Router();

// Create a page, then index it for vector search (the AI pipeline entry point).
pagesRouter.post(
  "/",
  asyncRoute(async (req, res) => {
    const { title = "Untitled", content = "", icon } = req.body ?? {};
    const page = await prisma.page.create({
      data: { title, content, icon, workspaceId: req.workspaceId, authorId: req.userId },
    });
    await indexPage(page.id, content);
    res.status(201).json(page);
  }),
);

pagesRouter.get(
  "/",
  asyncRoute(async (req, res) => {
    const pages = await prisma.page.findMany({
      where: { workspaceId: req.workspaceId, archived: false },
      orderBy: { updatedAt: "desc" },
      select: { id: true, title: true, icon: true, updatedAt: true },
    });
    res.json(pages);
  }),
);

pagesRouter.get(
  "/:id",
  asyncRoute(async (req, res) => {
    const page = await prisma.page.findFirst({
      where: { id: req.params.id, workspaceId: req.workspaceId },
    });
    if (!page) return res.status(404).json({ error: "Page not found" });
    res.json(page);
  }),
);

// Update content and re-index. Re-embedding on every save is simple and correct;
// a production system would debounce or diff to avoid redundant embedding calls.
pagesRouter.patch(
  "/:id",
  asyncRoute(async (req, res) => {
    const { title, content, icon, archived } = req.body ?? {};
    const page = await prisma.page.update({
      where: { id: req.params.id },
      data: { title, content, icon, archived },
    });
    if (content !== undefined) await indexPage(page.id, content);
    res.json(page);
  }),
);

pagesRouter.delete(
  "/:id",
  asyncRoute(async (req, res) => {
    await prisma.page.delete({ where: { id: req.params.id } });
    res.status(204).end();
  }),
);

// Related-pages widget ("85% similar") powered by vector similarity.
pagesRouter.get(
  "/:id/related",
  asyncRoute(async (req, res) => {
    res.json(await relatedPages(req.workspaceId, req.params.id));
  }),
);
