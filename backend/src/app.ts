import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import { env } from "./config/env.js";
import { authenticate } from "./middlewares/authenticate.js";
import { authRoutes } from "./routes/auth.routes.js";
import { childrenRoutes } from "./routes/children.routes.js";

export const app = Fastify({
  logger: true
});

app.register(cors, {
  origin: true
});

app.register(jwt, {
  secret: env.JWT_SECRET
});

app.decorate("authenticate", authenticate);

app.register(authRoutes);
app.register(childrenRoutes);

app.get("/", async () => {
  return { message: "API rodando", status: "ok" };
});