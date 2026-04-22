import type { LoginInput } from "../schemas/auth.schema.js";
import { authService } from "../services/auth.service.js";

export async function loginController(input: LoginInput) {
  return authService.authenticate(input.username, input.password);
}