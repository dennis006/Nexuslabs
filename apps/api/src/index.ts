import Fastify from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import jwt from "@fastify/jwt";

import { env } from "./env";
import dbPlugin from "./plugins/db";
import authRoutes from "./routes/auth";
import usersRoutes from "./routes/users";
import { errorHandler } from "./errors";
import internalBadgeRoutes from "./routes/internal/badges";

const main = async () => {
  const app = Fastify({ logger: true });

  await app.register(cors, {
    origin: env.origin,
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  });

  await app.register(cookie, {
    hook: "onRequest",
  });

  await app.register(jwt, {
    secret: env.accessSecret,
  });

  await app.register(dbPlugin);

  await app.register(authRoutes, { prefix: "/auth" });
  await app.register(usersRoutes, { prefix: "/users" });
  await app.register(internalBadgeRoutes, { prefix: "/internal/badges" });

  app.setErrorHandler(errorHandler);

  app.get("/health", async () => ({ ok: true }));

  try {
    await app.listen({ port: env.port, host: "0.0.0.0" });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

void main();
