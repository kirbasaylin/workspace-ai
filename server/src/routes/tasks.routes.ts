import { Router } from "express";
import { prisma } from "../db.js";
import { asyncRoute } from "../middleware/errors.js";
import { extractTasks } from "../services/tasks.service.js";

export const tasksRouter = Router();

// POST /tasks — extract tasks from text and persist them.
tasksRouter.post(
  "/",
  asyncRoute(async (req, res) => {
    const { content, sourcePageId } = req.body ?? {};
    if (!content) return res.status(400).json({ error: "content is required" });
    const extracted = await extractTasks(content);
    const created = await prisma.$transaction(
      extracted.map((t) =>
        prisma.task.create({
          data: {
            text: t.text,
            dueDate: t.dueDate ? new Date(t.dueDate) : null,
            sourcePageId: sourcePageId ?? null,
            userId: req.userId,
          },
        }),
      ),
    );
    res.status(201).json(created);
  }),
);

tasksRouter.get(
  "/",
  asyncRoute(async (req, res) => {
    res.json(
      await prisma.task.findMany({ where: { userId: req.userId }, orderBy: { createdAt: "desc" } }),
    );
  }),
);

tasksRouter.patch(
  "/:id",
  asyncRoute(async (req, res) => {
    const { status } = req.body ?? {};
    res.json(await prisma.task.update({ where: { id: req.params.id }, data: { status } }));
  }),
);
