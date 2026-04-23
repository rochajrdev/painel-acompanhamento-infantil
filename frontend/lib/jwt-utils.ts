/**
 * Decodifica um JWT e retorna o payload
 */
export function decodeJWT(token: string): Record<string, unknown> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      throw new Error("Token inválido");
    }

    const payload = parts[1];
    // Usar atob() em vez de Buffer para compatibilidade com navegador
    const decoded = JSON.parse(
      atob(payload)
    ) as Record<string, unknown>;

    return decoded;
  } catch {
    return {};
  }
}

/**
 * Verifica se o JWT está expirado
 */
export function isJWTExpired(token: string): boolean {
  const payload = decodeJWT(token);
  const exp = payload.exp as number | undefined;

  if (!exp) {
    return false; // Se não houver exp, considerar válido
  }

  // Comparar com o tempo atual (em segundos)
  const now = Math.floor(Date.now() / 1000);
  // Considerar expirado 30 segundos antes do tempo real
  return now >= exp - 30;
}

/**
 * Retorna quanto tempo falta até o token expirar (em ms)
 */
export function getTokenTimeToExpiry(token: string): number {
  const payload = decodeJWT(token);
  const exp = payload.exp as number | undefined;

  if (!exp) {
    return Infinity;
  }

  const now = Math.floor(Date.now() / 1000);
  const secondsLeft = exp - now;

  return Math.max(0, secondsLeft * 1000);
}
