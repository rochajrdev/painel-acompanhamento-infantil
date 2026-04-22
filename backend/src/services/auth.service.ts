import bcrypt from "bcryptjs";
import { AppError } from "../errors/appError.js";
import { techniciansRepository } from "../repositories/technicians.repository.js";

export class AuthService {
  async authenticate(username: string, password: string): Promise<{ email: string }> {
    const technician = await techniciansRepository.findByEmail(username);

    if (!technician) {
      throw new AppError("Credenciais inválidas", 401);
    }

    const isValidPassword = await bcrypt.compare(password, technician.password_hash);

    if (!isValidPassword) {
      throw new AppError("Credenciais inválidas", 401);
    }

    return { email: technician.email };
  }
}

export const authService = new AuthService();