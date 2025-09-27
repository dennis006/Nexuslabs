import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import type { Role } from "@prisma/client";

export interface AuthUser {
  id: string;
  role: Role;
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    user: AuthUser;
  }
}

export const createRequireAuth = (app: FastifyInstance) => {
  return async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
    const header = request.headers.authorization;
    const token = header?.startsWith("Bearer ") ? header.slice(7) : header;

    if (!token) {
      reply.code(401).send({ error: "UNAUTHORIZED" });
      return reply;
    }

    try {
      const payload = app.accessJwt.verify(token) as { sub: string; role?: Role };
      request.user = {
        id: payload.sub,
        role: payload.role ?? "MEMBER"
      };
    } catch {
      reply.code(401).send({ error: "INVALID_TOKEN" });
      return reply;
    }
  };
};
