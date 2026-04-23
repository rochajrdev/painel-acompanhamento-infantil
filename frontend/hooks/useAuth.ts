"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { isJWTExpired, getTokenTimeToExpiry } from "@/lib/jwt-utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";

export function useAuth() {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const expiryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const stored = localStorage.getItem("token");

    if (stored && isJWTExpired(stored)) {
      localStorage.removeItem("token");
      setToken(null);
    } else {
      setToken(stored);

      if (stored) {
        const timeToExpiry = getTokenTimeToExpiry(stored);

        if (timeToExpiry !== Infinity && timeToExpiry > 0) {
          expiryTimeoutRef.current = setTimeout(() => {
            localStorage.removeItem("token");
            setToken(null);
          }, timeToExpiry);
        }
      }
    }

    setIsLoading(false);

    return () => {
      if (expiryTimeoutRef.current) {
        clearTimeout(expiryTimeoutRef.current);
      }
    };
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
    if (expiryTimeoutRef.current) {
      clearTimeout(expiryTimeoutRef.current);
      expiryTimeoutRef.current = null;
    }
    localStorage.removeItem("token");
    setToken(null);
  }, []);

  return {
    token,
    isAuthenticated: Boolean(token),
    isLoading,
    error,
    isExpired: token ? isJWTExpired(token) : false,
    login,
    logout
  };
}