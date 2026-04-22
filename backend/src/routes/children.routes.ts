import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { childrenRepository } from "../repositories/children.repository.js";

const paramsSchema = z.object({
  id: z.string().trim().min(1)
});

const parseBoolean = (value: unknown): boolean | undefined => {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();

    if (normalized === "true") {
      return true;
    }

    if (normalized === "false") {
      return false;
    }
  }

  return undefined;
};

const querySchema = z.object({
  q: z.string().trim().min(1).optional(),
  bairro: z.string().trim().min(1).optional(),
  revisado: z.preprocess(parseBoolean, z.boolean().optional()),
  incompleto: z.preprocess(parseBoolean, z.boolean().optional()),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10)
});

export async function childrenRoutes(app: FastifyInstance) {
  app.get("/summary", async (request, reply) => {
    const summary = await childrenRepository.getSummary();
    return reply.send(summary);
  });

  app.get("/children", async (request, reply) => {
    const queryResult = querySchema.safeParse(request.query);

    if (!queryResult.success) {
      return reply.code(400).send({ message: "Query inválida" });
    }

    const { q, bairro, revisado, incompleto, page, pageSize } = queryResult.data;

    const result = await childrenRepository.findAllPaginated(
      { q, bairro, revisado, incompleto },
      { page, pageSize }
    );

    return reply.send(result);
  });

  app.get("/children/:id", async (request, reply) => {
    const paramsResult = paramsSchema.safeParse(request.params);

    if (!paramsResult.success) {
      return reply.code(400).send({ message: "Parâmetros inválidos" });
    }

    const child = await childrenRepository.findById(paramsResult.data.id);

    if (!child) {
      return reply.code(404).send({ message: "Criança não encontrada" });
    }

    return reply.send(child);
  });

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