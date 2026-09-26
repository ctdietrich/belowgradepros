import { PrismaClient } from "@prisma/client";
import { serverlessDatabaseUrl } from "./database-url";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient() {
  const raw = process.env.DATABASE_URL;
  // Only the runtime client is rewritten. `prisma migrate deploy` reads the
  // schema (`url` / `directUrl`) and the original env vars, not this instance.
  if (process.env.VERCEL && raw) {
    return new PrismaClient({
      datasourceUrl: serverlessDatabaseUrl(raw, { vercel: true }),
    });
  }
  return new PrismaClient();
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// Next can evaluate this module more than once inside one isolate (dev HMR and
// some production bundles). Keep a single client in every environment. Each
// Vercel isolate still has its own globalThis, which is why the pool is capped
// at one connection above.
globalForPrisma.prisma = prisma;
