import type { FastifyInstance } from "fastify";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { techniciansRepository } from "../repositories/technicians.repository.js";

const authSchema = z.object({
  username: z.string().trim().email(),
  password: z.string().min(1)
});

export async function authRoutes(app: FastifyInstance) {
  app.post("/auth/token", async (request, reply) => {
    const bodyResult = authSchema.safeParse(request.body);

    if (!bodyResult.success) {
      return reply.code(400).send({ message: "Payload inválido" });
    }

    const { username, password } = bodyResult.data;
    const technician = await techniciansRepository.findByEmail(username);

    if (!technician) {
      return reply.code(401).send({ message: "Credenciais inválidas" });
    }

    const isValidPassword = await bcrypt.compare(password, technician.password_hash);

    if (!isValidPassword) {
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