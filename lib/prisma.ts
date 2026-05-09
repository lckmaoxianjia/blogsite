import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const rawUrl = process.env.DATABASE_URL;
  if (!rawUrl) throw new Error("DATABASE_URL is not set");

  const url = new URL(rawUrl);
  url.searchParams.set("connection_limit", "10");
  url.searchParams.set("pool_timeout", "10");
  url.searchParams.set("socket_timeout", "30");

  return new PrismaClient({
    log: ["error"],
    datasources: {
      db: {
        url: url.toString(),
      },
    },
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();
globalForPrisma.prisma = prisma;

if (process.env.NODE_ENV === "production") {
  process.on("beforeExit", () => {
    prisma.$disconnect();
  });
}
