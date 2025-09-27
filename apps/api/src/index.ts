import Fastify from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import jwt from "@fastify/jwt";

import { env } from "./env";
import dbPlugin from "./plugins/db";
import authRoutes from "./routes/auth";
import usersRoutes from "./routes/users";

type JwtInstance = {
  sign: (payload: Record<string, unknown>, options?: Record<string, unknown>) => string;
  verify: <T = unknown>(token: string, options?: Record<string, unknown>) => T;
};

declare module "fastify" {
  interface FastifyInstance {
    accessJwt: JwtInstance;
    refreshJwt: JwtInstance;
  }
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: Record<string, unknown>;
  }
}

const main = async () => {
  const app = Fastify({ logger: true });

  await app.register(cors, {
    origin: env.origin,
    credentials: true
  });

  await app.register(cookie, {
    hook: "onRequest"
  });

  await app.register(jwt, {
    secret: env.accessSecret,
    sign: { expiresIn: "10m" },
    namespace: "access"
  });

  await app.register(jwt, {
    secret: env.refreshSecret,
    sign: { expiresIn: "7d" },
    namespace: "refresh"
  });

  await app.register(dbPlugin);

  await app.register(authRoutes, { prefix: "/auth" });
  await app.register(usersRoutes, { prefix: "/users" });

  app.get("/health", async () => ({ ok: true }));

  try {
    await app.listen({ port: env.port, host: "0.0.0.0" });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

void main();
