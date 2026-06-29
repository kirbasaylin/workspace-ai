import { PrismaClient } from "@prisma/client";

// Single shared Prisma instance. In dev, Next/tsx hot-reload can spawn many
// clients; caching on globalThis avoids exhausting DB connections.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"] });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
