import Fastify from "fastify";
import cors from "@fastify/cors";

export const app = Fastify({
  logger: true
});

app.register(cors, {
  origin: true
});

app.get("/", async () => {
  return { message: "API rodando", status: "ok" };
});