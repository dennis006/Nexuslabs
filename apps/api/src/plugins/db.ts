import fp from "fastify-plugin";
import { PrismaClient } from "@prisma/client";

const dbPlugin = fp(async (app) => {
  const prisma = new PrismaClient();
  await prisma.$connect();

  app.decorate("db", prisma);

  app.addHook("onClose", async () => {
    await prisma.$disconnect();
  });
});

declare module "fastify" {
  interface FastifyInstance {
    db: PrismaClient;
  }
}

export default dbPlugin;
