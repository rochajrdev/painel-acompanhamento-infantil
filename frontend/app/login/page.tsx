"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Toast } from "@/components/Toast";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error, isAuthenticated } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(username, password);

    if (success) {
      setToast({ message: "Login realizado!", type: "success" });
      router.replace("/dashboard");
    } else {
      setToast({ message: error || "Erro ao fazer login", type: "error" });
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center px-4 py-8">
      <div className="w-full rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-center text-2xl font-semibold text-slate-900">
          Painel Infantil
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-slate-700">
              E-mail
            </label>
            <input
              id="username"
              type="email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="tecnico@prefeitura.rio"
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="painel@2024"
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </main>
  );
}