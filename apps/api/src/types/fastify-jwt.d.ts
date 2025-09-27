import "@fastify/jwt";

declare module "fastify" {
  interface FastifyInstance {
    accessJwt: import("@fastify/jwt").JWT;
    refreshJwt: import("@fastify/jwt").JWT;
  }
}
