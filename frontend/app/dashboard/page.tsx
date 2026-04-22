"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/services/api";

interface Summary {
  total_criancas: number;
  total_revisadas: number;
  alertas_totais: number;
  alertas_por_area: Record<string, number>;
}

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, token, logout } = useAuth();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    const fetchSummary = async () => {
      try {
        const data = await apiFetch<Summary>("/summary", {
          method: "GET",
          token: token || undefined
        });
        setSummary(data);
      } catch (error) {
        console.error("Erro ao carregar summary:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [authLoading, isAuthenticated, token, router]);

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  if (authLoading || loading) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center justify-center px-4">
        <p className="text-slate-500">Carregando...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <button
          onClick={handleLogout}
          className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          Sair
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="text-sm font-medium text-slate-500">Total de Crianças</h2>
          <p className="mt-2 text-3xl font-bold text-slate-900">{summary?.total_criancas || 0}</p>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="text-sm font-medium text-slate-500">Revisadas</h2>
          <p className="mt-2 text-3xl font-bold text-green-600">{summary?.total_revisadas || 0}</p>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="text-sm font-medium text-slate-500">Alertas Totais</h2>
          <p className="mt-2 text-3xl font-bold text-orange-600">{summary?.alertas_totais || 0}</p>
        </div>
      </div>

      {summary?.alertas_por_area && Object.keys(summary.alertas_por_area).length > 0 && (
        <div className="mt-8 rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Alertas por Área</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {Object.entries(summary.alertas_por_area).map(([area, count]) => (
              <div key={area} className="rounded border border-slate-200 p-4">
                <p className="text-sm font-medium capitalize text-slate-700">{area}</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{count}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8">
        <Link
          href="/children"
          className="inline-block rounded bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
        >
          Ver Crianças
        </Link>
      </div>
    </main>
  );
}