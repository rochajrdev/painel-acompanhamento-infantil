"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useAuthenticatedFetch } from "@/hooks/useAuthenticatedFetch";
import { useDebounce } from "@/hooks/useDebounce";
import { Toast } from "@/components/Toast";
import { Icon } from "@/components/Icon";

interface Child {
  id: string;
  nome: string;
  data_nascimento: string;
  bairro: string;
  revisado_em: string | null;
  saude: { alertas?: string[] } | null;
  educacao: { alertas?: string[] } | null;
  assistencia_social: { alertas?: string[] } | null;
}

interface ChildrenResponse {
  items: Child[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export default function ChildrenPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, isExpired } = useAuth();
  const fetchWithAuth = useAuthenticatedFetch();
  const [children, setChildren] = useState<Child[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [filters, setFilters] = useState({ q: "", bairro: "", revisado: "", incompleto: "" });
  const debouncedFilters = useDebounce(filters, 500);

  useEffect(() => {
    if (authLoading || isExpired || !isAuthenticated) return;

    const fetchChildren = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("page", page.toString());
        params.set("pageSize", pageSize.toString());
        if (debouncedFilters.q) params.set("q", debouncedFilters.q);
        if (debouncedFilters.bairro) params.set("bairro", debouncedFilters.bairro);
        if (debouncedFilters.revisado === "true") params.set("revisado", "true");
        if (debouncedFilters.revisado === "false") params.set("revisado", "false");
        if (debouncedFilters.incompleto === "true") params.set("incompleto", "true");

        const data = await fetchWithAuth<ChildrenResponse>(`/children?${params.toString()}`, {
          method: "GET"
        });
        setChildren(data.items ?? []);
        setTotal(data.total);
      } catch (error) {
        console.error("Erro ao carregar crianças:", error);
        const message = error instanceof Error ? error.message : "Erro ao carregar crianças";
        setToast({ message, type: "error" });
      } finally {
        setLoading(false);
      }
    };

    fetchChildren();
  }, [authLoading, isAuthenticated, isExpired, page, pageSize, debouncedFilters, fetchWithAuth]);

  const totalPages = Math.ceil(total / pageSize);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(1); // Resetar a página ao filtrar
  };

  const handleClearFilters = () => {
    setFilters({ q: "", bairro: "", revisado: "", incompleto: "" });
    setPage(1);
  };

  const hasAlerts = (child: Child) => {
    return Boolean(
      (child.saude?.alertas?.length ?? 0) > 0 ||
      (child.educacao?.alertas?.length ?? 0) > 0 ||
      (child.assistencia_social?.alertas?.length ?? 0) > 0
    );
  };

  const getIdade = (dataNascimento: string) => {
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();

    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
      idade -= 1;
    }

    return idade;
  };

  const isComplete = (child: Child) => {
    return child.saude !== null && child.educacao !== null && child.assistencia_social !== null;
  };

  return (
    <div className="animate-in fade-in duration-500">
      <nav className="mb-4 flex text-sm text-[#525F6A]" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <Link href="/dashboard" className="inline-flex items-center hover:text-[#004A8D]">
              <Icon name="dashboard" className="mr-2 h-4 w-4" />
              Início
            </Link>
          </li>
          <li>
            <div className="flex items-center">
              <span className="mx-2 text-slate-400">/</span>
              <span className="font-semibold text-[#004A8D]">Listagem de Crianças</span>
            </div>
          </li>
        </ol>
      </nav>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#00346f] sm:text-4xl">Crianças</h1>
        <p className="mt-2 max-w-2xl text-[#525F6A]">
          Gestão e acompanhamento das metas de saúde, educação e assistência social.
        </p>
      </div>

      <div className="mb-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end">
          <div className="flex-1 space-y-1">
            <label htmlFor="q" className="text-xs font-semibold uppercase text-slate-500">Nome ou ID</label>
            <input
              type="text"
              id="q"
              name="q"
              placeholder="Buscar criança..."
              value={filters.q}
              onChange={handleFilterChange}
              className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#004A8D] focus:outline-none focus:ring-1 focus:ring-[#004A8D]"
            />
          </div>
          <div className="flex-1 space-y-1">
            <label htmlFor="bairro" className="text-xs font-semibold uppercase text-slate-500">Bairro</label>
            <input
              type="text"
              id="bairro"
              name="bairro"
              placeholder="Filtrar por bairro"
              value={filters.bairro}
              onChange={handleFilterChange}
              className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#004A8D] focus:outline-none focus:ring-1 focus:ring-[#004A8D]"
            />
          </div>
          <div className="flex-1 space-y-1">
            <label htmlFor="revisado" className="text-xs font-semibold uppercase text-slate-500">Revisão</label>
            <select
              id="revisado"
              name="revisado"
              value={filters.revisado}
              onChange={handleFilterChange}
              className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#004A8D] focus:outline-none focus:ring-1 focus:ring-[#004A8D]"
            >
              <option value="">Todos</option>
              <option value="true">Revisados</option>
              <option value="false">Pendentes</option>
            </select>
          </div>
          <div className="flex-1 space-y-1">
            <label htmlFor="incompleto" className="text-xs font-semibold uppercase text-slate-500">Completude</label>
            <select
              id="incompleto"
              name="incompleto"
              value={filters.incompleto}
              onChange={handleFilterChange}
              className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#004A8D] focus:outline-none focus:ring-1 focus:ring-[#004A8D]"
            >
              <option value="">Todos</option>
              <option value="true">Cadastros Incompletos</option>
            </select>
          </div>
          <div>
            <button
              onClick={handleClearFilters}
              className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200"
            >
              Limpar
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th scope="col" className="px-6 py-4 font-semibold">Criança</th>
                <th scope="col" className="px-6 py-4 font-semibold">Bairro</th>
                <th scope="col" className="px-6 py-4 font-semibold">Status de Alerta</th>
                <th scope="col" className="px-6 py-4 font-semibold">Informações</th>
                <th scope="col" className="px-6 py-4 font-semibold">Revisão</th>
                <th scope="col" className="px-6 py-4 text-right font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse bg-white">
                    <td className="px-6 py-4"><div className="h-4 w-48 rounded bg-slate-200"></div><div className="mt-2 h-3 w-24 rounded bg-slate-100"></div></td>
                    <td className="px-6 py-4"><div className="h-4 w-32 rounded bg-slate-200"></div></td>
                    <td className="px-6 py-4"><div className="h-6 w-20 rounded-full bg-slate-200"></div></td>
                    <td className="px-6 py-4"><div className="h-4 w-20 rounded bg-slate-200"></div></td>
                    <td className="px-6 py-4"><div className="h-4 w-24 rounded bg-slate-200"></div></td>
                    <td className="px-6 py-4 text-right"><div className="ml-auto h-8 w-24 rounded bg-slate-200"></div></td>
                  </tr>
                ))
              ) : children.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    Nenhuma criança encontrada com os filtros atuais.
                  </td>
                </tr>
              ) : (
                children.map(child => (
                  <tr key={child.id} className="bg-white transition-colors hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-[#004A8D]">{child.nome}</div>
                      <div className="text-xs text-[#525F6A]">{getIdade(child.data_nascimento)} anos</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-[#525F6A] ring-1 ring-inset ring-slate-500/10">
                        {child.bairro}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {hasAlerts(child) ? (
                        <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800">
                          Alerta
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                          Ok
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {isComplete(child) ? (
                        <span className="text-xs font-semibold text-slate-600">Completas</span>
                      ) : (
                        <span className="text-xs font-semibold text-amber-600">Incompletas</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`h-2.5 w-2.5 rounded-full ${child.revisado_em ? "bg-emerald-500" : "bg-slate-300"}`}></div>
                        <span className={`text-xs font-medium ${child.revisado_em ? "text-emerald-700" : "text-slate-500"}`}>
                          {child.revisado_em ? "Revisado" : "Pendente"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/children/${child.id}`}
                        className="inline-flex items-center justify-center rounded-md bg-[#004A8D] px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#00346f]"
                      >
                        Ver Detalhes
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        {!loading && children.length > 0 && (
          <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-3">
            <div className="hidden sm:block">
              <p className="text-sm text-slate-700">
                Mostrando <span className="font-semibold">{Math.min((page - 1) * pageSize + 1, total)}</span> até{" "}
                <span className="font-semibold">{Math.min(page * pageSize, total)}</span> de{" "}
                <span className="font-semibold">{total}</span> resultados
              </p>
            </div>
            <div className="flex flex-1 justify-between sm:justify-end gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="relative inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages || totalPages === 0}
                className="relative inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Próxima
              </button>
            </div>
          </div>
        )}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}