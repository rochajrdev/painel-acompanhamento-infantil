import bcrypt from "bcryptjs";
import { techniciansRepository } from "../repositories/technicians.repository.js";
import type { LoginInput } from "../schemas/auth.schema.js";

export async function loginController(input: LoginInput) {
  const technician = await techniciansRepository.findByEmail(input.username);

  if (!technician) {
    return null;
  }

  const isValidPassword = await bcrypt.compare(input.password, technician.password_hash);

  if (!isValidPassword) {
    return null;
  }

  return { email: technician.email };
}