import type { FastifyInstance } from "fastify";
import {
  getChildController,
  getSummaryController,
  listChildrenController,
  reviewChildController
} from "../controllers/children.controller.js";
import {
  childParamsSchema,
  childrenQuerySchema
} from "../schemas/children.schema.js";

export async function childrenRoutes(app: FastifyInstance) {
  app.get("/summary", async (request, reply) => {
    const summary = await getSummaryController();
    return reply.send(summary);
  });

  app.get("/children", async (request, reply) => {
    const queryResult = childrenQuerySchema.safeParse(request.query);

    if (!queryResult.success) {
      return reply.code(400).send({ message: "Query inválida" });
    }

    const { q, bairro, revisado, incompleto, page, pageSize } = queryResult.data;

    const result = await listChildrenController(
      { q, bairro, revisado, incompleto },
      { page, pageSize }
    );

    return reply.send(result);
  });

  app.get("/children/:id", async (request, reply) => {
    const paramsResult = childParamsSchema.safeParse(request.params);

    if (!paramsResult.success) {
      return reply.code(400).send({ message: "Parâmetros inválidos" });
    }

    const child = await getChildController(paramsResult.data);

    if (!child) {
      return reply.code(404).send({ message: "Criança não encontrada" });
    }

    return reply.send(child);
  });

  app.patch(
    "/children/:id/review",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const paramsResult = childParamsSchema.safeParse(request.params);

      if (!paramsResult.success) {
        return reply.code(400).send({ message: "Parâmetros inválidos" });
      }

      const reviewer = request.user.preferred_username;

      const updatedChild = await reviewChildController(paramsResult.data, reviewer);

      if (!updatedChild) {
        return reply.code(404).send({ message: "Criança não encontrada" });
      }

      return reply.send(updatedChild);
    }
  );
}