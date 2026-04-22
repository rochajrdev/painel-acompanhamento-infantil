"use client";

import { useCallback, useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";

export function useAuth() {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("token");
      setToken(stored);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(
    async (username: string, password: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_URL}/auth/token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
          throw new Error("Credenciais inválidas");
        }

        const data = await response.json() as { access_token: string };
        localStorage.setItem("token", data.access_token);
        setToken(data.access_token);
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erro ao fazer login";
        setError(message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setToken(null);
  }, []);

  return {
    token,
    isAuthenticated: Boolean(token),
    isLoading,
    error,
    login,
    logout
  };
}