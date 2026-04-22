import type { FastifyInstance } from "fastify";
import { loginController } from "../controllers/auth.controller.js";
import { loginSchema } from "../schemas/auth.schema.js";

export async function authRoutes(app: FastifyInstance) {
  app.post("/auth/token", async (request, reply) => {
    const bodyResult = loginSchema.safeParse(request.body);

    if (!bodyResult.success) {
      return reply.code(400).send({ message: "Payload inválido" });
    }

    const technician = await loginController(bodyResult.data);

    if (!technician) {
      return reply.code(401).send({ message: "Credenciais inválidas" });
    }

    const token = await reply.jwtSign(
      { preferred_username: technician.email },
      { expiresIn: "8h" }
    );

    return reply.send({
      access_token: token,
      token_type: "Bearer",
      expires_in: 28800
    });
  });
}