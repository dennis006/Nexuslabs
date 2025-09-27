import type { FastifyPluginAsync, FastifyReply } from "fastify";
import { z } from "zod";
import argon2 from "argon2";

const RegisterSchema = z.object({
  email: z.string().email(),
  username: z
    .string()
    .min(3)
    .max(20)
    .regex(/^[A-Za-z0-9_-]+$/, "Nur Buchstaben, Zahlen, Unterstrich und Bindestrich erlaubt"),
  password: z.string().min(8).max(72)
});

const LoginSchema = z.object({
  emailOrUsername: z.string().min(3),
  password: z.string().min(8)
});

const authRoutes: FastifyPluginAsync = async (app) => {
  function setRefreshCookie(reply: FastifyReply, token: string) {
    reply.setCookie("refresh_token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/auth",
      maxAge: 60 * 60 * 24 * 7
    });
  }

  app.post("/register", async (request, reply) => {
    const body = RegisterSchema.parse(request.body);
    const email = body.email.trim().toLowerCase();
    const username = body.username.trim();

    const exists = await app.db.user.findFirst({
      where: {
        OR: [
          { email },
          { username: { equals: username, mode: "insensitive" } }
        ]
      },
      select: { id: true }
    });

    if (exists) {
      return reply.code(409).send({ error: "USER_EXISTS", message: "Email oder Benutzername bereits vergeben" });
    }

    const passwordHash = await argon2.hash(body.password);

    const user = await app.db.user.create({
      data: {
        email,
        username,
        passwordHash
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
    setRefreshCookie(reply, refreshToken);

    return reply.code(201).send({ user, accessToken });
  });

  app.post("/login", async (request, reply) => {
    const { emailOrUsername, password } = LoginSchema.parse(request.body);
    const identifier = emailOrUsername.trim();
    const emailKey = identifier.toLowerCase();

    const user = await app.db.user.findFirst({
      where: {
        OR: [
          { email: emailKey },
          { username: { equals: identifier, mode: "insensitive" } }
        ]
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        passwordHash: true,
        createdAt: true
      }
    });

    if (!user) {
      return reply.code(401).send({ error: "INVALID_CREDENTIALS", message: "Ungültige Zugangsdaten" });
    }

    const valid = await argon2.verify(user.passwordHash, password);
    if (!valid) {
      return reply.code(401).send({ error: "INVALID_CREDENTIALS", message: "Ungültige Zugangsdaten" });
    }

    const accessToken = app.accessJwt.sign({ sub: user.id, role: user.role });
    const refreshToken = app.refreshJwt.sign({ sub: user.id });
    setRefreshCookie(reply, refreshToken);

    const { passwordHash, ...safeUser } = user;
    return reply.send({ user: safeUser, accessToken });
  });

  app.post("/refresh", async (request, reply) => {
    const token = request.cookies["refresh_token"];
    if (!token) {
      return reply.code(401).send({ error: "NO_REFRESH" });
    }

    try {
      const payload = app.refreshJwt.verify(token) as { sub: string };
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

      const accessToken = app.accessJwt.sign({ sub: user.id, role: user.role });
      return reply.send({ accessToken, user });
    } catch {
      return reply.code(401).send({ error: "INVALID_REFRESH" });
    }
  });

  app.post("/logout", async (_request, reply) => {
    reply.clearCookie("refresh_token", { path: "/auth" });
    return reply.send({ ok: true });
  });

  if (app.log.level !== "silent") {
    app.get("/debug/cookies", async (request, reply) => reply.send({ cookies: request.cookies }));
  }

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
