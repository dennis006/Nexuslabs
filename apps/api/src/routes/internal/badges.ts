import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { createRequireAuth } from "../../middlewares/requireAuth";
import { BadgeAssignmentOrchestrator } from "../../badges/assignment";

const recomputeSchema = z.object({
  userId: z.string().cuid().optional(),
  userIds: z.array(z.string().cuid()).optional(),
  dryRun: z.boolean().optional(),
  all: z.boolean().optional(),
});

const internalBadgeRoutes: FastifyPluginAsync = async (app) => {
  const requireAuth = createRequireAuth(app);

  app.post(
    "/recompute",
    { preHandler: requireAuth },
    async (request, reply) => {
      const payload = recomputeSchema.parse(request.body ?? {});

      if (request.user?.role !== "ADMIN") {
        return reply.code(403).send({ error: "FORBIDDEN" });
      }

      const orchestrator = new BadgeAssignmentOrchestrator(app.db);
      const result = await orchestrator.recompute({
        userIds: payload.all
          ? undefined
          : payload.userIds ?? (payload.userId ? [payload.userId] : undefined),
        dryRun: payload.dryRun ?? false,
      });

      return reply.send(result);
    }
  );
};

export default internalBadgeRoutes;
