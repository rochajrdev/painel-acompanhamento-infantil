const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";

export async function apiFetch<T>(
  path: string,
  init?: RequestInit & { token?: string }
): Promise<T> {
  const { token, ...restInit } = init ?? {};

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(restInit.headers as Record<string, string> ?? {})
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...restInit,
    headers
  });

  if (!response.ok) {
    const errorMessage = `Erro na API: ${response.status}`;
    throw new Error(errorMessage);
  }

  return response.json() as Promise<T>;
}