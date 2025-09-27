import type { FastifyPluginAsync } from "fastify";
import { createRequireAuth } from "../middlewares/requireAuth";

const usersRoutes: FastifyPluginAsync = async (app) => {
  const requireAuth = createRequireAuth(app);

  app.get(
    "/me/permissions",
    { preHandler: requireAuth },
    async (request, reply) => {
      if (!request.user) {
        return reply.code(401).send({ role: "GUEST" });
      }

      return reply.send({ role: request.user.role });
    }
  );
};

export default usersRoutes;
