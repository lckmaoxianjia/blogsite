import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const url = new URL(process.env.DATABASE_URL!);
  // Limit connections to stay well under the 30-connection ceiling
  url.searchParams.set("connection_limit", "20");
  url.searchParams.set("pool_timeout", "10");

  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    datasources: {
      db: {
        url: url.toString(),
      },
    },
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Release connections on shutdown
const cleanup = async () => {
  await prisma.$disconnect();
};

if (process.env.NODE_ENV === "production") {
  process.on("beforeExit", cleanup);
  process.on("SIGTERM", cleanup);
  process.on("SIGINT", cleanup);
}
