import type { FastifyInstance } from "fastify";
import { loginController } from "../controllers/auth.controller.js";
import { AppError } from "../errors/appError.js";
import { loginSchema } from "../schemas/auth.schema.js";

export async function authRoutes(app: FastifyInstance) {
  app.post("/auth/token", async (request, reply) => {
    const bodyResult = loginSchema.safeParse(request.body);

    if (!bodyResult.success) {
      throw new AppError("Payload inválido", 400);
    }

    const technician = await loginController(bodyResult.data);

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