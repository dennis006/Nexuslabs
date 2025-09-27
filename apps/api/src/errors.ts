import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";

interface MappedError {
  status: number;
  code: string;
  message: string;
}

function isFastifyError(err: unknown): err is FastifyError {
  return typeof err === "object" && err !== null && "statusCode" in err;
}

export function mapError(err: unknown): MappedError {
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
  } else if (isFastifyError(err)) {
    status = err.statusCode ?? status;
    code = err.code ?? code;
    message = err.message ?? message;
  }

  return { status, code, message };
}

export function errorHandler(err: FastifyError, req: FastifyRequest, reply: FastifyReply) {
  const { status, code, message } = mapError(err);

  req.log.error({ err, code }, message);

  reply.code(status).send({ error: code, message });
}
