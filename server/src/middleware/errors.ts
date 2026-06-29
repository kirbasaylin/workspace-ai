import type { Request, Response, NextFunction } from "express";

// Centralized error handler so routes can just `throw` and get a clean JSON 500.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  const message = err instanceof Error ? err.message : "Internal Server Error";
  // eslint-disable-next-line no-console
  console.error("[error]", message);
  res.status(500).json({ error: message });
}

export function asyncRoute<T extends (req: Request, res: Response) => Promise<unknown>>(fn: T) {
  return (req: Request, res: Response, next: NextFunction) => fn(req, res).catch(next);
}
