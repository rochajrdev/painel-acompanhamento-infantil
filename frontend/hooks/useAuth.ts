import { useMemo } from "react";

export function useAuth() {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  return useMemo(
    () => ({
      token,
      isAuthenticated: Boolean(token)
    }),
    [token]
  );
}