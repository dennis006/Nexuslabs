import type { FastifyPluginAsync, FastifyReply } from "fastify";
import { z } from "zod";
import argon2 from "argon2";

type BcryptModule = typeof import("bcryptjs");

const RegisterSchema = z.object({
  email: z.string().email(),
  username: z
    .string()
    .min(3)
    .max(20)
    .regex(/^[a-zA-Z0-9_\-]+$/, "Nur Buchstaben, Zahlen, Unterstrich und Bindestrich erlaubt"),
  password: z.string().min(8).max(72)
});

const LoginSchema = z.object({
  emailOrUsername: z.string().min(3),
  password: z.string().min(8)
});

const authRoutes: FastifyPluginAsync = async (app) => {
  const BCRYPT_PREFIXES = ["$2a$", "$2b$", "$2y$"];
  const ARGON_PREFIX = "$argon2";
  const BCRYPT_ROUNDS = 12;

  let cachedBcrypt: BcryptModule | null = null;
  let attemptedBcryptLoad = false;

  const loadBcrypt = async (): Promise<BcryptModule | null> => {
    if (cachedBcrypt) {
      return cachedBcrypt;
    }

    if (attemptedBcryptLoad) {
      return null;
    }

    attemptedBcryptLoad = true;

    try {
      const mod = await import("bcryptjs");
      const resolved = (mod as BcryptModule & { default?: BcryptModule }).default ?? (mod as BcryptModule);
      cachedBcrypt = resolved;
      return cachedBcrypt;
    } catch (error) {
      app.log.warn({ err: error }, "bcryptjs module not available; falling back to argon2 only");
      return null;
    }
  };

  const hashPassword = async (password: string): Promise<string> => {
    const bcrypt = await loadBcrypt();
    if (bcrypt) {
      return bcrypt.hash(password, BCRYPT_ROUNDS);
    }

    return argon2.hash(password, { type: argon2.argon2id });
  };

  const verifyPassword = async (hash: string, password: string) => {
    try {
      if (BCRYPT_PREFIXES.some((prefix) => hash.startsWith(prefix))) {
        const bcrypt = await loadBcrypt();
        if (!bcrypt) {
          app.log.error(
            { hashPreview: hash.slice(0, 10) },
            "Cannot verify bcrypt hash because bcryptjs module is not installed"
          );
          return false;
        }

        return await bcrypt.compare(password, hash);
      }

      if (hash.startsWith(ARGON_PREFIX)) {
        return await argon2.verify(hash, password);
      }

      app.log.warn({ hashPreview: hash.slice(0, 10) }, "Unsupported password hash format");
      return false;
    } catch (error) {
      app.log.error({ err: error }, "Failed to verify password hash");
      return false;
    }
  };

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

    const hash = await hashPassword(password);

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

    const valid = await verifyPassword(user.passwordHash, password);
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
