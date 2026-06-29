import express from "express";
import cors from "cors";
import { env } from "./env.js";
import { withContext } from "./middleware/context.js";
import { errorHandler } from "./middleware/errors.js";
import { pagesRouter } from "./routes/pages.routes.js";
import { chatRouter } from "./routes/chat.routes.js";
import { searchRouter } from "./routes/search.routes.js";
import { embedRouter } from "./routes/embed.routes.js";
import { summarizeRouter } from "./routes/summarize.routes.js";
import { tasksRouter } from "./routes/tasks.routes.js";

export function createApp() {
  const app = express();

  app.use(cors({ origin: env.CLIENT_ORIGIN, credentials: true }));
  app.use(express.json({ limit: "2mb" }));

  app.get("/health", (_req, res) =>
    res.json({ ok: true, llm: env.LLM_PROVIDER, embeddings: env.EMBEDDING_PROVIDER }),
  );

  // Every API route runs through withContext to resolve user + workspace.
  app.use("/pages", withContext, pagesRouter);
  app.use("/chat", withContext, chatRouter);
  app.use("/search", withContext, searchRouter);
  app.use("/embed", withContext, embedRouter);
  app.use("/summarize", withContext, summarizeRouter);
  app.use("/tasks", withContext, tasksRouter);

  app.use(errorHandler);
  return app;
}
