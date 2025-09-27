import type { FastifyBaseLogger, FastifyPluginAsync } from "fastify";
import { z } from "zod";
import argon2 from "argon2";

type BcryptCompare = (data: string, encrypted: string) => Promise<boolean> | boolean;

let cachedBcryptCompare: ((data: string, encrypted: string) => Promise<boolean>) | null = null;

async function loadBcryptCompare(logger: FastifyBaseLogger) {
  if (cachedBcryptCompare) {
    return cachedBcryptCompare;
  }

  let compare: BcryptCompare | undefined;
  try {
    const mod: { default?: { compare?: BcryptCompare }; compare?: BcryptCompare } = await import(
      "bcryptjs"
    );
    const candidate: { compare?: BcryptCompare } | undefined = mod.default ?? mod;
    compare = candidate?.compare ?? mod.compare;
  } catch (error) {
    logger.error({ error }, "bcryptjs module not available");
    throw new Error("bcryptjs_not_available");
  }

  if (typeof compare !== "function") {
    logger.error("bcryptjs compare function missing");
    throw new Error("bcryptjs_compare_missing");
  }

  cachedBcryptCompare = async (data: string, encrypted: string) => {
    const result = compare!(data, encrypted);
    return typeof result === "boolean" ? result : await result;
  };

  return cachedBcryptCompare;
}

async function verifyPassword(
  passwordHash: string,
  password: string,
  logger: FastifyBaseLogger,
): Promise<boolean> {
  if (passwordHash.startsWith("$argon2")) {
    return argon2.verify(passwordHash, password);
  }

  if (/^\$2[aby]\$/.test(passwordHash)) {
    const compare = await loadBcryptCompare(logger);
    return compare(password, passwordHash);
  }

  logger.error({ passwordHash }, "unsupported password hash algorithm");
  throw new Error("unsupported_hash_algorithm");
}

const Register = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(20).regex(/^[A-Za-z0-9_-]+$/),
  password: z.string().min(8).max(72),
});

const Login = z.object({
  emailOrUsername: z.string().min(3),
  password: z.string().min(8),
});

const authRoutes: FastifyPluginAsync = async (app) => {
  const dbg = process.env.DEBUG_ERRORS === "1";

  function setRefresh(res: { setCookie: (...args: any[]) => void }, token: string) {
    res.setCookie("refresh_token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false, // production: true & SameSite=None
      path: "/auth",
      maxAge: 60 * 60 * 24 * 7,
    });
  }

  app.post("/register", async (req, reply) => {
    const body = Register.parse(req.body);
    const email = body.email.toLowerCase();
    const username = body.username.trim();

    const exists = await app.db.user.findFirst({
      where: {
        OR: [
          { email },
          { username: { equals: username, mode: "insensitive" } },
        ],
      },
      select: { id: true },
    });

    if (exists) {
      return reply
        .code(409)
        .send({ error: "USER_EXISTS", message: "Email oder Benutzername bereits vergeben" });
    }

    const hash = await argon2.hash(body.password);
    const user = await app.db.user.create({
      data: { email, username, passwordHash: hash },
      select: { id: true, email: true, username: true, role: true, createdAt: true },
    });

    const access = app.accessJwt.sign({ sub: user.id, role: user.role });
    const refresh = app.refreshJwt.sign({ sub: user.id });
    setRefresh(reply, refresh);

    return reply.send({ user, accessToken: access });
  });

  app.post("/login", async (req, reply) => {
    const parsed = Login.safeParse(req.body);
    if (!parsed.success) {
      if (dbg) {
        req.log.warn({ body: req.body }, "login invalid body");
      }
      const message = parsed.error.issues.map((issue) => issue.message).join("; ");
      return reply.code(400).send({ error: "VALIDATION_ERROR", message });
    }

    const { emailOrUsername, password } = parsed.data;
    const trimmed = emailOrUsername.trim();
    const key = trimmed.toLowerCase();

    const user = await app.db.user.findFirst({
      where: {
        OR: [
          { email: key },
          { username: { equals: trimmed, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        passwordHash: true,
        createdAt: true,
      },
    });

    if (!user) {
      if (dbg) {
        req.log.warn({ key }, "login no user");
      }
      return reply
        .code(401)
        .send({ error: "INVALID_CREDENTIALS", message: "Ungültige Zugangsdaten" });
    }

    if (!user.passwordHash) {
      if (dbg) {
        req.log.error({ userId: user.id }, "login missing passwordHash");
      }
      return reply
        .code(500)
        .send({ error: "INTERNAL_ERROR", message: "Account fehlerhaft konfiguriert" });
    }

    let ok = false;
    try {
      ok = await verifyPassword(user.passwordHash, password, req.log);
    } catch (error) {
      req.log.error({ userId: user.id, error }, "login password verify failed");
      return reply
        .code(500)
        .send({ error: "INTERNAL_ERROR", message: "Account fehlerhaft konfiguriert" });
    }

    if (!ok) {
      if (dbg) {
        req.log.warn({ userId: user.id }, "login wrong password");
      }
      return reply
        .code(401)
        .send({ error: "INVALID_CREDENTIALS", message: "Ungültige Zugangsdaten" });
    }

    const access = app.accessJwt.sign({ sub: user.id, role: user.role });
    const refresh = app.refreshJwt.sign({ sub: user.id });
    setRefresh(reply, refresh);

    const { passwordHash, ...safeUser } = user;
    return reply.send({ user: safeUser, accessToken: access });
  });

  app.post("/refresh", async (req, reply) => {
    const token = req.cookies["refresh_token"];
    if (!token) {
      return reply.code(401).send({ error: "NO_REFRESH" });
    }

    try {
      const payload = app.refreshJwt.verify(token) as { sub: string };
      const user = await app.db.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, email: true, username: true, role: true, createdAt: true },
      });

      if (!user) {
        return reply.code(401).send({ error: "NO_USER" });
      }

      const access = app.accessJwt.sign({ sub: user.id, role: user.role });
      return reply.send({ accessToken: access, user });
    } catch (error) {
      if (dbg) {
        req.log.warn({ error }, "refresh invalid");
      }
      return reply.code(401).send({ error: "INVALID_REFRESH" });
    }
  });

  app.post("/logout", async (_req, reply) => {
    reply.clearCookie("refresh_token", { path: "/auth" });
    return reply.send({ ok: true });
  });

  app.get("/me", async (req, reply) => {
    const header = req.headers.authorization;
    const token = header?.startsWith("Bearer ") ? header.slice(7) : header;

    if (!token) {
      return reply.code(401).send({ error: "INVALID_TOKEN" });
    }

    try {
      const payload = app.accessJwt.verify(token) as { sub: string };
      const user = await app.db.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, email: true, username: true, role: true, createdAt: true },
      });

      if (!user) {
        return reply.code(401).send({ error: "NO_USER" });
      }

      return reply.send({ user });
    } catch (error) {
      if (dbg) {
        req.log.warn({ error }, "me invalid token");
      }
      return reply.code(401).send({ error: "INVALID_TOKEN" });
    }
  });

  if (dbg) {
    app.get("/debug/cookies", async (req) => ({ cookies: req.cookies }));
  }
};

export default authRoutes;
