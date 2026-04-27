import type { FastifyInstance } from "fastify";
import {
  getAlertsHeatmapController,
  getChildController,
  getSummaryController,
  listChildrenController,
  listBairrosController,
  reviewChildController,
  createInteractionController,
  getInteractionsController,
  exportPdfController,
  exportRiskMapPdfController,
  exportExcelController
} from "../controllers/children.controller.js";
import { emitHeatmapUpdate } from "../realtime/socket.js";
import { AppError } from "../errors/appError.js";
import {
  childParamsSchema,
  childrenQuerySchema,
  childInteractionBodySchema
} from "../schemas/children.schema.js";

export async function childrenRoutes(app: FastifyInstance) {
  app.get("/summary", async (request, reply) => {
    const summary = await getSummaryController();
    return reply.send(summary);
  });

  app.get("/heatmap/alerts", async (request, reply) => {
    const heatmap = await getAlertsHeatmapController();
    return reply.send(heatmap);
  });

  app.get("/children/bairros", async (request, reply) => {
    const bairros = await listBairrosController();
    return reply.send(bairros);
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

  app.get("/children/export/pdf", async (request, reply) => {
    const pdfBuffer = await exportPdfController();
    reply.header('Content-Type', 'application/pdf');
    reply.header('Content-Disposition', 'attachment; filename="relatorio_executivo.pdf"');
    return reply.send(pdfBuffer);
  });

  app.get("/children/export/pdf-risk-map", async (request, reply) => {
    const pdfBuffer = await exportRiskMapPdfController();
    reply.header('Content-Type', 'application/pdf');
    reply.header('Content-Disposition', 'attachment; filename="mapa_risco_bairro.pdf"');
    return reply.send(pdfBuffer);
  });

  app.get("/children/export/excel", async (request, reply) => {
    const excelBuffer = await exportExcelController();
    reply.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    reply.header('Content-Disposition', 'attachment; filename="relatorio_vacinas.xlsx"');
    return reply.send(excelBuffer);
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
      const heatmap = await getAlertsHeatmapController();

      emitHeatmapUpdate(heatmap);

      return reply.send(updatedChild);
    }
  );

  app.get("/children/:id/interactions", async (request, reply) => {
    const paramsResult = childParamsSchema.safeParse(request.params);

    if (!paramsResult.success) {
      throw new AppError("Parâmetros inválidos", 400);
    }

    const interactions = await getInteractionsController(paramsResult.data);

    return reply.send(interactions);
  });

  app.post(
    "/children/:id/interactions",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const paramsResult = childParamsSchema.safeParse(request.params);
      const bodyResult = childInteractionBodySchema.safeParse(request.body);

      if (!paramsResult.success || !bodyResult.success) {
        throw new AppError("Parâmetros ou corpo da requisição inválidos", 400);
      }

      const reviewer = request.user.preferred_username;

      const interaction = await createInteractionController(
        paramsResult.data,
        bodyResult.data,
        reviewer
      );

      const heatmap = await getAlertsHeatmapController();
      emitHeatmapUpdate(heatmap);

      return reply.status(201).send(interaction);
    }
  );
}