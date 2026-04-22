"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/services/api";
import { Toast } from "@/components/Toast";

interface Child {
  id: string;
  nome: string;
  idade: number;
  bairro: string;
  revisado_em: string | null;
  saude: { alerta: boolean } | null;
  educacao: { alerta: boolean } | null;
  assistencia: { alerta: boolean } | null;
}

interface ChildrenResponse {
  data: Child[];
  total: number;
  page: number;
  pageSize: number;
}

export default function ChildrenPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, token } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [filters, setFilters] = useState({ q: "", bairro: "", revisado: "", incompleto: "" });

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    const fetchChildren = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("page", page.toString());
        params.set("pageSize", pageSize.toString());
        if (filters.q) params.set("q", filters.q);
        if (filters.bairro) params.set("bairro", filters.bairro);
        if (filters.revisado === "true") params.set("revisado", "true");
        if (filters.revisado === "false") params.set("revisado", "false");
        if (filters.incompleto === "true") params.set("incompleto", "true");

        const data = await apiFetch<ChildrenResponse>(`/children?${params.toString()}`, {
          method: "GET",
          token: token || undefined
        });
        setChildren(data.data);
        setTotal(data.total);
      } catch (error) {
        console.error("Erro ao carregar crianças:", error);
        setToast({ message: "Erro ao carregar crianças", type: "error" });
      } finally {
        setLoading(false);
      }
    };

    fetchChildren();
  }, [authLoading, isAuthenticated, token, page, pageSize, filters, router]);

  const totalPages = Math.ceil(total / pageSize);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(1);
  };

  const hasAlerts = (child: Child) => {
    return (child.saude?.alerta || child.educacao?.alerta || child.assistencia?.alerta) ?? false;
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Crianças</h1>
        <Link
          href="/dashboard"
          className="rounded bg-slate-600 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          Dashboard
        </Link>
      </div>

      <div className="mb-6 grid gap-3 rounded-lg bg-white p-4 shadow-md md:grid-cols-4">
        <input
          type="text"
          name="q"
          placeholder="Buscar por nome"
          value={filters.q}
          onChange={handleFilterChange}
          className="rounded border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none"
        />
        <input
          type="text"
          name="bairro"
          placeholder="Filtrar por bairro"
          value={filters.bairro}
          onChange={handleFilterChange}
          className="rounded border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none"
        />
        <select
          name="revisado"
          value={filters.revisado}
          onChange={handleFilterChange}
          className="rounded border border-slate-300 px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none"
        >
          <option value="">Todos</option>
          <option value="true">Revisados</option>
          <option value="false">Não revisados</option>
        </select>
        <select
          name="incompleto"
          value={filters.incompleto}
          onChange={handleFilterChange}
          className="rounded border border-slate-300 px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none"
        >
          <option value="">Todos</option>
          <option value="true">Incompletos</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <p className="text-slate-500">Carregando...</p>
        </div>
      ) : children.length === 0 ? (
        <div className="rounded-lg bg-white p-8 text-center shadow-md">
          <p className="text-slate-500">Nenhuma criança encontrada</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {children.map(child => (
              <Link
                key={child.id}
                href={`/children/${child.id}`}
                className="rounded-lg bg-white p-4 shadow-md hover:shadow-lg transition"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900">{child.nome}</h3>
                    <p className="text-sm text-slate-500">{child.idade} anos • {child.bairro}</p>
                  </div>
                  {hasAlerts(child) && (
                    <span className="inline-block rounded bg-orange-100 px-2 py-1 text-xs font-semibold text-orange-700">
                      Alerta
                    </span>
                  )}
                </div>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className={child.revisado_em ? "text-green-600" : "text-slate-400"}>
                    {child.revisado_em ? "✓ Revisado" : "◦ Não revisado"}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-8 flex items-center justify-between">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="rounded bg-slate-600 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
            >
              Anterior
            </button>
            <span className="text-slate-600">
              Página {page} de {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="rounded bg-slate-600 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
            >
              Próxima
            </button>
          </div>
        </>
      )}

      {toast && <Toast message={toast.message} type={toast.type} />}
    </main>
  );
}