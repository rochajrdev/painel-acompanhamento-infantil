import type { FastifyInstance } from "fastify";
import {
  getChildController,
  getSummaryController,
  listChildrenController,
  reviewChildController
} from "../controllers/children.controller.js";
import { AppError } from "../errors/appError.js";
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
      throw new AppError("Query inválida", 400);
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
      throw new AppError("Parâmetros inválidos", 400);
    }

    const child = await getChildController(paramsResult.data);

    return reply.send(child);
  });

  app.patch(
    "/children/:id/review",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const paramsResult = childParamsSchema.safeParse(request.params);

      if (!paramsResult.success) {
        throw new AppError("Parâmetros inválidos", 400);
      }

      const reviewer = request.user.preferred_username;

      const updatedChild = await reviewChildController(paramsResult.data, reviewer);

      return reply.send(updatedChild);
    }
  );
}