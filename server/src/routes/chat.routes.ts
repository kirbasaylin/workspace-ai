import { Router } from "express";
import { asyncRoute } from "../middleware/errors.js";
import { answerQuestion } from "../services/rag.service.js";

export const chatRouter = Router();

// POST /chat — ask a question across the whole workspace (RAG).
chatRouter.post(
  "/",
  asyncRoute(async (req, res) => {
    const { question, history = [] } = req.body ?? {};
    if (!question) return res.status(400).json({ error: "question is required" });
    res.json(await answerQuestion(req.workspaceId, question, history));
  }),
);
