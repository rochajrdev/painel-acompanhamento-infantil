"use client";

import { Public_Sans } from "next/font/google";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useAuthenticatedFetch } from "@/hooks/useAuthenticatedFetch";
import { decodeJWT } from "@/lib/jwt-utils";

const publicSans = Public_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"]
});

interface Summary {
  total_criancas: number;
  total_revisadas: number;
  criancas_com_alertas: number;
  alertas_totais: number;
  total_alertas: number;
  alertas_por_area: Record<string, { alertas: number; criancas: number }>;
}

interface ChildItem {
  id: string;
  bairro: string;
  saude: { alertas?: string[] } | null;
  educacao: { alertas?: string[] } | null;
  assistencia_social: { alertas?: string[] } | null;
}

interface ChildrenResponse {
  items: ChildItem[];
  totalPages: number;
}

type IconName =
  | "menu"
  | "close"
  | "dashboard"
  | "children"
  | "users"
  | "warning"
  | "review"
  | "bell"
  | "health"
  | "education"
  | "social"
  | "user"
  | "logout";

function Icon({ name, className = "h-4 w-4" }: { name: IconName; className?: string }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className
  };

  if (name === "menu") {
    return (
      <svg {...common}>
        <path d="M3 6h18" />
        <path d="M3 12h18" />
        <path d="M3 18h18" />
      </svg>
    );
  }

  if (name === "close") {
    return (
      <svg {...common}>
        <path d="M18 6 6 18" />
        <path d="m6 6 12 12" />
      </svg>
    );
  }

  if (name === "dashboard") {
    return (
      <svg {...common}>
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="4" />
        <rect x="14" y="10" width="7" height="11" />
        <rect x="3" y="13" width="7" height="8" />
      </svg>
    );
  }

  if (name === "children") {
    return (
      <svg {...common}>
        <circle cx="9" cy="7" r="3" />
        <circle cx="17" cy="8" r="2" />
        <path d="M3 20a6 6 0 0 1 12 0" />
        <path d="M14 20a4 4 0 0 1 8 0" />
      </svg>
    );
  }

  if (name === "users") {
    return (
      <svg {...common}>
        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="8.5" cy="7" r="4" />
        <path d="M20 8v6" />
        <path d="M23 11h-6" />
      </svg>
    );
  }

  if (name === "warning") {
    return (
      <svg {...common}>
        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
      </svg>
    );
  }

  if (name === "review") {
    return (
      <svg {...common}>
        <path d="m9 11 3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    );
  }

  if (name === "bell") {
    return (
      <svg {...common}>
        <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5" />
        <path d="M10 17a2 2 0 0 0 4 0" />
      </svg>
    );
  }

  if (name === "health") {
    return (
      <svg {...common}>
        <path d="M12 21s-7-4.35-7-10a4 4 0 0 1 7-2.65A4 4 0 0 1 19 11c0 5.65-7 10-7 10Z" />
      </svg>
    );
  }

  if (name === "education") {
    return (
      <svg {...common}>
        <path d="m2 8 10-5 10 5-10 5-10-5Z" />
        <path d="M6 10.5v5.5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5.5" />
      </svg>
    );
  }

  if (name === "social") {
    return (
      <svg {...common}>
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21l8.84-8.61a5.5 5.5 0 0 0 0-7.78Z" />
      </svg>
    );
  }

  if (name === "logout") {
    return (
      <svg {...common}>
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <path d="M16 17l5-5-5-5" />
        <path d="M21 12H9" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20a8 8 0 0 1 16 0" />
    </svg>
  );
}

const areaMeta: Record<string, { label: string; accent: string; badge: string; icon: IconName }> = {
  saude: {
    label: "Saude",
    accent: "border-l-[#C53030]",
    badge: "bg-red-50 text-[#C53030]",
    icon: "health"
  },
  educacao: {
    label: "Educacao",
    accent: "border-l-[#276749]",
    badge: "bg-green-50 text-[#276749]",
    icon: "education"
  },
  assistencia_social: {
    label: "Assistencia Social",
    accent: "border-l-[#004A8D]",
    badge: "bg-blue-50 text-[#004A8D]",
    icon: "social"
  }
};

function collectAlerts(child: ChildItem): string[] {
  return [
    ...(child.saude?.alertas ?? []),
    ...(child.educacao?.alertas ?? []),
    ...(child.assistencia_social?.alertas ?? [])
  ];
}

function formatAlertName(alert: string): string {
  return alert.replaceAll("_", " ");
}

export default function DashboardPage() {
  const router = useRouter();
  const { token, isAuthenticated, isLoading: authLoading, isExpired, logout } = useAuth();
  const fetchWithAuth = useAuthenticatedFetch();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [children, setChildren] = useState<ChildItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const preferredUsername = useMemo(() => {
    if (!token) return "tecnico@prefeitura.rio";
    const payload = decodeJWT(token);
    return typeof payload.preferred_username === "string"
      ? payload.preferred_username
      : "tecnico@prefeitura.rio";
  }, [token]);

  const insights = useMemo(() => {
    const alertTypeMap = new Map<string, number>();
    const neighborhoodMap = new Map<string, number>();

    for (const child of children) {
      const allAlerts = collectAlerts(child);

      for (const alert of allAlerts) {
        alertTypeMap.set(alert, (alertTypeMap.get(alert) ?? 0) + 1);
      }

      if (allAlerts.length > 0) {
        neighborhoodMap.set(child.bairro, (neighborhoodMap.get(child.bairro) ?? 0) + allAlerts.length);
      }
    }

    const topAlertTypes = Array.from(alertTypeMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([name, count]) => ({ name, count }));

    const topNeighborhoods = Array.from(neighborhoodMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([name, count]) => ({ name, count }));

    const maxNeighborhoodCount = topNeighborhoods[0]?.count ?? 1;

    return {
      topAlertTypes,
      topNeighborhoods,
      maxNeighborhoodCount
    };
  }, [children]);

  const reviewRate = useMemo(() => {
    if (!summary?.total_criancas) return 0;
    return Math.round((summary.total_revisadas / summary.total_criancas) * 100);
  }, [summary]);

  const alertRate = useMemo(() => {
    if (!summary?.total_criancas) return 0;
    return Math.round((summary.criancas_com_alertas / summary.total_criancas) * 100);
  }, [summary]);

  useEffect(() => {
    if (authLoading) return;

    if (isExpired) {
      router.replace("/login");
      return;
    }

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    const fetchDashboardData = async () => {
      try {
        const [summaryData, firstChildrenPage] = await Promise.all([
          fetchWithAuth<Summary>("/summary", { method: "GET" }),
          fetchWithAuth<ChildrenResponse>("/children?page=1&pageSize=100", { method: "GET" })
        ]);

        const pages: Promise<ChildrenResponse>[] = [];

        for (let page = 2; page <= firstChildrenPage.totalPages; page += 1) {
          pages.push(
            fetchWithAuth<ChildrenResponse>(`/children?page=${page}&pageSize=100`, {
              method: "GET"
            })
          );
        }

        const remainingPages = await Promise.all(pages);
        const allChildren = [
          ...firstChildrenPage.items,
          ...remainingPages.flatMap((response) => response.items)
        ];

        setSummary(summaryData);
        setChildren(allChildren);
      } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [authLoading, isAuthenticated, isExpired, fetchWithAuth, router]);

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  const toggleSidebar = () => {
    setIsSidebarOpen((current) => !current);
  };

  if (authLoading || loading) {
    return (
      <main className={`${publicSans.className} min-h-screen bg-[#f9f9ff] px-4 py-24 sm:px-6 lg:px-8`}>
        <div className="mx-auto grid w-full max-w-[1280px] grid-cols-1 gap-6 lg:grid-cols-4">
          <div className="h-36 animate-pulse rounded-lg bg-slate-200" />
          <div className="h-36 animate-pulse rounded-lg bg-slate-200" />
          <div className="h-36 animate-pulse rounded-lg bg-slate-200" />
          <div className="h-36 animate-pulse rounded-lg bg-slate-200" />
        </div>
      </main>
    );
  }

  const totalChildren = summary?.total_criancas ?? 0;
  const totalReviewed = summary?.total_revisadas ?? 0;
  const childrenWithAlerts = summary?.criancas_com_alertas ?? 0;
  const totalAlerts = summary?.total_alertas ?? summary?.alertas_totais ?? 0;
  const areaEntries = Object.entries(summary?.alertas_por_area ?? {});

  return (
    <div className={`${publicSans.className} min-h-screen bg-[#f9f9ff] text-[#191c21] antialiased`}>
      <header className="fixed top-0 z-50 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label={isSidebarOpen ? "Recolher menu lateral" : "Expandir menu lateral"}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 transition-colors hover:bg-slate-100"
          >
            <Icon name={isSidebarOpen ? "close" : "menu"} className="h-5 w-5" />
          </button>
          <span className="truncate text-base font-extrabold tracking-tight text-[#004A8D] sm:text-xl">
            Prefeitura do Rio de Janeiro
          </span>
          <span className="hidden h-6 w-px bg-slate-200 sm:block" />
          <span className="hidden truncate text-sm font-medium text-slate-500 md:block">
            Painel de Acompanhamento Infantil
          </span>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-slate-600 sm:flex">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-700">
              <Icon name="user" className="h-3.5 w-3.5" />
            </span>
            <span>{preferredUsername}</span>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-lg px-3 py-2 text-sm font-semibold text-[#004A8D] transition-colors hover:bg-slate-100 sm:px-4"
          >
            <span className="inline-flex items-center gap-1.5">
              <Icon name="logout" className="h-4 w-4" />
              Sair
            </span>
          </button>
        </div>
      </header>

      {isSidebarOpen && (
        <button
          type="button"
          aria-label="Fechar menu lateral"
          onClick={toggleSidebar}
          className="fixed inset-0 top-16 z-30 bg-slate-900/25 lg:hidden"
        />
      )}

      <aside
        className={`fixed left-0 top-16 z-40 h-[calc(100vh-64px)] w-64 border-r border-slate-200 bg-slate-50 py-8 transition-transform duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <nav className="mt-8 space-y-1">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 border-r-4 border-[#004A8D] bg-white px-6 py-4 font-semibold text-[#004A8D]"
          >
            <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-blue-100 text-xs">
              <Icon name="dashboard" className="h-3.5 w-3.5" />
            </span>
            Painel de Monitoramento
          </Link>
          <Link
            href="/children"
            className="flex items-center gap-3 px-6 py-4 font-medium text-[#525F6A] transition-colors hover:bg-slate-100 hover:text-[#004A8D]"
          >
            <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-slate-200 text-xs">
              <Icon name="children" className="h-3.5 w-3.5" />
            </span>
            Crianças
          </Link>
        </nav>
      </aside>

      <main className={`px-4 pb-12 pt-24 transition-all duration-300 sm:px-6 lg:px-8 ${isSidebarOpen ? "lg:ml-64" : "lg:ml-0"}`}>
        <div className="mx-auto max-w-[1280px]">
          <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-bold text-[#00346f] sm:text-4xl">Visao Geral</h1>
              <p className="max-w-2xl text-[#525F6A]">
                Monitoramento em tempo real das metas de saude, educacao e assistencia social para a primeira infancia.
              </p>
            </div>
            <Link
              href="/children"
              className="inline-flex items-center rounded-lg bg-[#004A8D] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
            >
              Ver criancas
            </Link>
          </div>

          <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-lg border border-slate-200 bg-[#F8F9FA] p-6 shadow-sm">
              <div className="mb-4 flex items-start justify-between">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-[#00346f]">
                  <Icon name="users" className="h-4 w-4" />
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#525F6A]">Total</span>
              </div>
              <div className="text-4xl font-bold text-[#004A8D]">{totalChildren}</div>
              <div className="mt-1 text-sm text-[#525F6A]">Criancas cadastradas</div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-[#F8F9FA] p-6 shadow-sm ring-1 ring-rose-100">
              <div className="mb-4 flex items-start justify-between">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50 text-[#C53030]">
                  <Icon name="warning" className="h-4 w-4" />
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#C53030]">Atencao</span>
              </div>
              <div className="text-4xl font-bold text-[#C53030]">{childrenWithAlerts}</div>
              <div className="mt-1 text-sm text-[#525F6A]">Criancas com alertas ({alertRate}%)</div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-[#F8F9FA] p-6 shadow-sm">
              <div className="mb-4 flex items-start justify-between">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-[#00346f]">
                  <Icon name="review" className="h-4 w-4" />
                </span>
              </div>
              <div className="text-4xl font-bold text-[#004A8D]">{reviewRate}%</div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#E2E8F0]">
                <div className="h-full rounded-full bg-[#004A8D]" style={{ width: `${Math.min(reviewRate, 100)}%` }} />
              </div>
              <div className="mt-1 text-xs font-semibold text-[#2D3748]">{totalReviewed} revisadas pelo técnico </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-[#F8F9FA] p-6 shadow-sm">
              <div className="mb-4 flex items-start justify-between">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-[#C53030]">
                  <Icon name="bell" className="h-4 w-4" />
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#525F6A]">Total</span>
              </div>
              <div className="text-4xl font-bold text-[#C53030]">{totalAlerts}</div>
              <div className="mt-1 text-sm text-[#525F6A]">Alertas ativos</div>
            </div>
          </div>

          <section className="mb-10">
            <h3 className="mb-6 flex items-center gap-2 text-2xl font-semibold text-[#2D3748]">
              <span className="h-8 w-2 rounded-full bg-[#004A8D]" />
              Alertas por Area Finalistica
            </h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {areaEntries.map(([area, data]) => {
                const meta = areaMeta[area] ?? {
                  label: area,
                  accent: "border-l-slate-400",
                  badge: "bg-slate-100 text-slate-700",
                  icon: "dashboard" as IconName
                };

                return (
                  <div key={area} className={`rounded-lg border border-slate-200 border-l-4 ${meta.accent} bg-[#F8F9FA] p-6 shadow-sm`}>
                    <div className="mb-4 flex items-center gap-3">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                        <Icon name={meta.icon} className="h-4 w-4" />
                      </span>
                      <h4 className="font-bold text-[#2D3748]">{meta.label}</h4>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[#525F6A]">Criancas</span>
                        <span className="font-bold text-[#2D3748]">{data.criancas}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[#525F6A]">Alertas ativos</span>
                        <span className={`rounded px-2 py-0.5 text-xs font-bold ${meta.badge}`}>{data.alertas}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <div className="mb-10 grid grid-cols-1 gap-8 lg:grid-cols-2">
            <section className="overflow-hidden rounded-lg border border-slate-200 bg-[#F8F9FA] shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                <h3 className="font-bold text-[#2D3748]">Tipos de Alerta Recorrentes</h3>
                <span className="text-xs font-medium uppercase tracking-widest text-[#525F6A]">Atualizado</span>
              </div>
              <div className="divide-y divide-slate-50">
                {insights.topAlertTypes.length === 0 && (
                  <div className="px-6 py-5 text-sm text-[#525F6A]">Sem alertas detectados no momento.</div>
                )}
                {insights.topAlertTypes.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-slate-50">
                    <div className="flex items-center gap-4">
                      <span className={`h-2 w-2 rounded-full ${index === 0 ? "bg-rose-500" : index === 1 ? "bg-amber-500" : index === 2 ? "bg-orange-500" : "bg-blue-500"}`} />
                      <div>
                        <p className="text-sm font-semibold text-[#2D3748]">{formatAlertName(item.name)}</p>
                        <p className="text-xs text-[#525F6A]">Ocorrencias registradas</p>
                      </div>
                    </div>
                    <span className="font-bold text-[#C53030]">{item.count} casos</span>
                  </div>
                ))}
              </div>
              <div className="bg-slate-50 p-4 text-center">
                <Link href="/children" className="text-sm font-bold text-[#004A8D] hover:underline">
                  Ver lista de criancas
                </Link>
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-[#F8F9FA] p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="font-bold text-[#2D3748]">Alertas por Bairro</h3>
                <div className="flex gap-1">
                  <span className="h-2 w-2 rounded-full bg-[#004A8D]/20" />
                  <span className="h-2 w-2 rounded-full bg-[#004A8D]/40" />
                  <span className="h-2 w-2 rounded-full bg-[#004A8D]" />
                </div>
              </div>
              <div className="space-y-6">
                {insights.topNeighborhoods.length === 0 && (
                  <p className="text-sm text-[#525F6A]">Sem bairros com alertas ativos.</p>
                )}
                {insights.topNeighborhoods.map((item) => {
                  const width = Math.max(8, Math.round((item.count / insights.maxNeighborhoodCount) * 100));
                  return (
                    <div key={item.name} className="pt-1">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-semibold text-[#2D3748]">{item.name}</span>
                        <span className="text-xs font-semibold text-[#004A8D]">{item.count}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded bg-slate-100">
                        <div className="h-full rounded bg-[#004A8D]" style={{ width: `${width}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          <footer className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-slate-200 py-8 text-xs text-slate-400 md:flex-row md:items-center">
            <div className="flex flex-wrap items-center gap-4">
              <p>© Prefeitura do Rio | 2026 | v1.0</p>
              <div className="flex gap-4">
                <span>Termos de Uso</span>
                <span>Privacidade</span>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="font-medium text-slate-600">Sistema operacional</span>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
