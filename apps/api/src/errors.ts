import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";

export function mapError(err: unknown) {
  let status = 500;
  let code = "INTERNAL_ERROR";
  let message = "Internal Server Error";

  if (err instanceof ZodError) {
    status = 400;
    code = "VALIDATION_ERROR";
    message = err.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ");
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      status = 409;
      code = "UNIQUE_CONSTRAINT";
      message = "Email oder Benutzername bereits vergeben";
    }
  } else if (typeof err === "object" && err && "statusCode" in err) {
    const fastifyErr = err as FastifyError;
    status = fastifyErr.statusCode ?? status;
    code = (fastifyErr as { code?: string }).code ?? code;
    message = fastifyErr.message ?? message;
  } else if (typeof err === "object" && err && "message" in err) {
    message = (err as { message?: string }).message ?? message;
  }

  return { status, code, message };
}

export function errorHandler(err: FastifyError, req: FastifyRequest, reply: FastifyReply) {
  const { status, code, message } = mapError(err);
  const dbg = process.env.DEBUG_ERRORS === "1";

  req.log.error({ code, err: dbg ? err : undefined }, message);

  reply.code(status).send({ error: code, message });
}
