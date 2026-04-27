const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";

export async function apiFetch<T>(
  path: string,
  init?: RequestInit & { token?: string }
): Promise<T> {
  const { token, ...restInit } = init ?? {};

  const headers: Record<string, string> = {
    ...(restInit.headers as Record<string, string> ?? {})
  };

  if (restInit.body !== undefined && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

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

  const contentType = response.headers.get("content-type");
  if (contentType && (contentType.includes("application/pdf") || contentType.includes("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))) {
    return response.blob() as Promise<any>;
  }

  return response.json() as Promise<T>;
}