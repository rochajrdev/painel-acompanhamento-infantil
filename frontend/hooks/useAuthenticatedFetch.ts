"use client";

import { useCallback } from "react";
import { useAuth } from "./useAuth";
import { apiFetch } from "@/services/api";

/**
 * Hook para fazer requisições autenticadas
 * Trata 401 automaticamente fazendo logout
 */
export function useAuthenticatedFetch() {
  const { token, logout } = useAuth();

  const fetchWithAuth = useCallback(
    async function <T,>(
      path: string,
      init?: RequestInit
    ): Promise<T> {
      try {
        return await apiFetch<T>(path, { ...init, token: token ?? undefined });
      } catch (error) {
        // Se for erro de não autorizado, fazer logout
        if (error instanceof Error && error.message.includes("401")) {
          logout();
          throw new Error("Sua sessão expirou. Por favor, faça login novamente.");
        }
        throw error;
      }
    },
    [token, logout]
  );

  return fetchWithAuth;
}
