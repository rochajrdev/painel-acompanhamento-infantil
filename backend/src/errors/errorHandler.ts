import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "./appError.js";

export function errorHandler(
  error: FastifyError | AppError,
  request: FastifyRequest,
  reply: FastifyReply
) {
  if (error instanceof AppError) {
    return reply.code(error.statusCode).send({ message: error.message });
  }

  if (typeof error.statusCode === "number" && error.statusCode >= 400 && error.statusCode < 600) {
    return reply.code(error.statusCode).send({ message: error.message });
  }

  request.log.error(error);
  return reply.code(500).send({ message: "Erro interno do servidor" });
}