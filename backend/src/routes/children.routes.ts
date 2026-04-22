import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { childrenRepository } from "../repositories/children.repository.js";

const paramsSchema = z.object({
  id: z.string().trim().min(1)
});

export async function childrenRoutes(app: FastifyInstance) {
  app.patch(
    "/children/:id/review",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const paramsResult = paramsSchema.safeParse(request.params);

      if (!paramsResult.success) {
        return reply.code(400).send({ message: "Parâmetros inválidos" });
      }

      const { id } = paramsResult.data;
      const reviewer = request.user.preferred_username;

      const updatedChild = await childrenRepository.markAsReviewed(id, reviewer);

      if (!updatedChild) {
        return reply.code(404).send({ message: "Criança não encontrada" });
      }

      return reply.send(updatedChild);
    }
  );
}