import type { Request, Response, NextFunction } from "express";
import { prisma } from "../db.js";

// ── Auth boundary ────────────────────────────────────────────────────────────
// In production, Clerk / Auth.js verifies the session at the edge and passes a
// trusted user id (e.g. via a header or JWT). This middleware is where you'd
// validate that and look up the user. For local dev we bootstrap a single demo
// user + workspace so the API is runnable end-to-end without wiring auth first.
//
// To plug in real auth: replace `resolveDevUser` with token verification.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId: string;
      workspaceId: string;
    }
  }
}

async function resolveDevUser() {
  const externalId = "dev-user";
  let user = await prisma.user.findUnique({ where: { externalId } });
  if (!user) {
    const workspace = await prisma.workspace.create({ data: { name: "My Workspace" } });
    user = await prisma.user.create({
      data: { externalId, email: "dev@example.com", name: "Dev", workspaceId: workspace.id },
    });
  }
  return user;
}

export async function withContext(req: Request, _res: Response, next: NextFunction) {
  try {
    const user = await resolveDevUser();
    req.userId = user.id;
    req.workspaceId = user.workspaceId;
    next();
  } catch (err) {
    next(err);
  }
}
