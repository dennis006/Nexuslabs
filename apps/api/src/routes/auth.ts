import type { FastifyPluginAsync, FastifyReply } from "fastify";
import { z } from "zod";
import argon2 from "argon2";

const RegisterSchema = z.object({
  email: z.string().email(),
  username: z
    .string()
    .min(3)
    .max(20)
    .regex(/^[a-zA-Z0-9_-]+$/, "Nur Buchstaben, Zahlen, Unterstrich und Bindestrich erlaubt"),
  password: z.string().min(8).max(72)
});

const LoginSchema = z.object({
  emailOrUsername: z.string().min(3),
  password: z.string().min(8)
});

const authRoutes: FastifyPluginAsync = async (app) => {
  function setRefreshToken(reply: FastifyReply, token: string) {
    reply.setCookie("refresh_token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/auth",
      maxAge: 60 * 60 * 24 * 7
    });
  }

  app.post("/register", async (request, reply) => {
    const parsed = RegisterSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: "INVALID_BODY", issues: parsed.error.flatten() });
    }

    const { email, username, password } = parsed.data;
    const emailNormalized = email.trim().toLowerCase();
    const usernameNormalized = username.trim();

    const existing = await app.db.user.findFirst({
      where: {
        OR: [
          { email: { equals: emailNormalized, mode: "insensitive" } },
          { username: { equals: usernameNormalized, mode: "insensitive" } }
        ]
      }
    });

    if (existing) {
      return reply.code(409).send({ error: "USER_EXISTS" });
    }

    const hash = await argon2.hash(password);

    const user = await app.db.user.create({
      data: {
        email: emailNormalized,
        username: usernameNormalized,
        passwordHash: hash
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        createdAt: true
      }
    });

    const accessToken = app.accessJwt.sign({ sub: user.id, role: user.role });
    const refreshToken = app.refreshJwt.sign({ sub: user.id });
    setRefreshToken(reply, refreshToken);

    return reply.code(201).send({ user, accessToken });
  });

  app.post("/login", async (request, reply) => {
    const parsed = LoginSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: "INVALID_BODY", issues: parsed.error.flatten() });
    }

    const { emailOrUsername, password } = parsed.data;
    const identifier = emailOrUsername.trim();

    const user = await app.db.user.findFirst({
      where: {
        OR: [
          { email: { equals: identifier, mode: "insensitive" } },
          { username: { equals: identifier, mode: "insensitive" } }
        ]
      }
    });

    if (!user) {
      return reply.code(401).send({ error: "INVALID_CREDENTIALS" });
    }

    const valid = await argon2.verify(user.passwordHash, password);
    if (!valid) {
      return reply.code(401).send({ error: "INVALID_CREDENTIALS" });
    }

    const accessToken = app.accessJwt.sign({ sub: user.id, role: user.role });
    const refreshToken = app.refreshJwt.sign({ sub: user.id });
    setRefreshToken(reply, refreshToken);

    return reply.send({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        createdAt: user.createdAt
      },
      accessToken
    });
  });

  app.post("/refresh", async (request, reply) => {
    const token = request.cookies?.["refresh_token"];
    if (!token) {
      return reply.code(401).send({ error: "NO_REFRESH" });
    }

    try {
      const payload = app.refreshJwt.verify(token) as { sub: string };
      const user = await app.db.user.findUnique({ where: { id: payload.sub } });
      if (!user) {
        return reply.code(401).send({ error: "NO_USER" });
      }
      const accessToken = app.accessJwt.sign({ sub: user.id, role: user.role });
      return reply.send({ accessToken });
    } catch {
      return reply.code(401).send({ error: "INVALID_REFRESH" });
    }
  });

  app.post("/logout", async (_request, reply) => {
    reply.clearCookie("refresh_token", { path: "/auth" });
    return reply.send({ ok: true });
  });

  app.get("/debug/cookies", async (request, reply) => {
    return reply.send({ cookies: request.cookies });
  });

  app.get("/me", async (request, reply) => {
    const header = request.headers.authorization;
    const token = header?.startsWith("Bearer ") ? header.slice(7) : header;

    if (!token) {
      return reply.code(401).send({ error: "INVALID_TOKEN" });
    }

    try {
      const payload = app.accessJwt.verify(token) as { sub: string };
      const user = await app.db.user.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          createdAt: true
        }
      });

      if (!user) {
        return reply.code(401).send({ error: "NO_USER" });
      }

      return reply.send({ user });
    } catch {
      return reply.code(401).send({ error: "INVALID_TOKEN" });
    }
  });
};

export default authRoutes;
