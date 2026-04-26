"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { useAuth } from "@/hooks/useAuth";
import { useAuthenticatedFetch } from "@/hooks/useAuthenticatedFetch";
import type { HeatmapPoint } from "@/components/AlertHeatmapCard";
import { Icon, type IconName } from "@/components/Icon";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";

interface AlertHeatmapCardProps {
  points: HeatmapPoint[];
  updatedAt: string | null;
  sidebarOpen: boolean;
}

const AlertHeatmapCard = dynamic<AlertHeatmapCardProps>(
  () => import("@/components/AlertHeatmapCard").then((mod) => mod.AlertHeatmapCard),
  { ssr: false }
);

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

interface HeatmapResponse {
  updated_at: string;
  points: HeatmapPoint[];
}

const areaMeta: Record<string, { label: string; accent: string; badge: string; icon: IconName }> = {
  saude: {
    label: "Saúde",
    accent: "border-l-[#C53030]",
    badge: "bg-red-50 text-[#C53030]",
    icon: "health"
  },
  educacao: {
    label: "Educação",
    accent: "border-l-[#276749]",
    badge: "bg-green-50 text-[#276749]",
    icon: "education"
  },
  assistencia_social: {
    label: "Assistência Social",
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
  const { isAuthenticated, isLoading: authLoading, isExpired } = useAuth();
  const fetchWithAuth = useAuthenticatedFetch();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [children, setChildren] = useState<ChildItem[]>([]);
  const [heatmap, setHeatmap] = useState<HeatmapResponse>({
    updated_at: "",
    points: []
  });
  const [loading, setLoading] = useState(true);
  const [animateBars, setAnimateBars] = useState(false);

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
    if (authLoading || isExpired || !isAuthenticated) return;

    const fetchDashboardData = async () => {
      try {
        const [summaryData, firstChildrenPage, heatmapData] = await Promise.all([
          fetchWithAuth<Summary>("/summary", { method: "GET" }),
          fetchWithAuth<ChildrenResponse>("/children?page=1&pageSize=100", { method: "GET" }),
          fetchWithAuth<HeatmapResponse>("/heatmap/alerts", { method: "GET" })
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
        setHeatmap(heatmapData);
      } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [authLoading, isAuthenticated, isExpired, fetchWithAuth]);

  useEffect(() => {
    if (!loading && children.length > 0) {
      const timer = setTimeout(() => setAnimateBars(true), 100);
      return () => clearTimeout(timer);
    }
  }, [loading, children]);

  useEffect(() => {
    if (authLoading || isExpired || !isAuthenticated) {
      return;
    }

    const socket: Socket = io(API_URL, {
      transports: ["websocket", "polling"]
    });

    socket.on("heatmap:update", (payload: HeatmapResponse) => {
      setHeatmap(payload);
    });

    return () => {
      socket.disconnect();
    };
  }, [authLoading, isAuthenticated, isExpired]);

  if (authLoading || loading) {
    return (
      <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="h-36 animate-pulse rounded-lg bg-slate-200" />
        <div className="h-36 animate-pulse rounded-lg bg-slate-200" />
        <div className="h-36 animate-pulse rounded-lg bg-slate-200" />
        <div className="h-36 animate-pulse rounded-lg bg-slate-200" />
      </div>
    );
  }

  const totalChildren = summary?.total_criancas ?? 0;
  const totalReviewed = summary?.total_revisadas ?? 0;
  const childrenWithAlerts = summary?.criancas_com_alertas ?? 0;
  const totalAlerts = summary?.total_alertas ?? summary?.alertas_totais ?? 0;
  const areaEntries = Object.entries(summary?.alertas_por_area ?? {});

  return (
    <>
      <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-[#00346f] sm:text-4xl">Visão Geral</h1>
          <p className="max-w-2xl text-[#525F6A]">
            Monitoramento em tempo real das metas de saúde, educação e assistência social para a primeira infância.
          </p>
        </div>
        <Link
          href="/children"
          className="inline-flex items-center rounded-lg bg-[#004A8D] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
        >
          Ver crianças
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
          <div className="mt-1 text-sm text-[#525F6A]">Crianças cadastradas</div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-[#F8F9FA] p-6 shadow-sm ring-1 ring-rose-100">
          <div className="mb-4 flex items-start justify-between">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50 text-[#C53030]">
              <Icon name="warning" className="h-4 w-4" />
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#C53030]">Atenção</span>
          </div>
          <div className="text-4xl font-bold text-[#C53030]">{childrenWithAlerts}</div>
          <div className="mt-1 text-sm text-[#525F6A]">Crianças com alertas ({alertRate}%)</div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-[#F8F9FA] p-6 shadow-sm">
          <div className="mb-4 flex items-start justify-between">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-[#00346f]">
              <Icon name="review" className="h-4 w-4" />
            </span>
          </div>
          <div className="text-4xl font-bold text-[#004A8D]">{reviewRate}%</div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#E2E8F0]">
            <div 
              className="h-full rounded-full bg-[#004A8D] transition-all duration-1000 ease-out" 
              style={{ width: animateBars ? `${Math.min(reviewRate, 100)}%` : "0%" }} 
            />
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
          Alertas por Área Finalística
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
                    <span className="text-sm text-[#525F6A]">Crianças</span>
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
                    <p className="text-xs text-[#525F6A]">Ocorrências registradas</p>
                  </div>
                </div>
                <span className="font-bold text-[#C53030]">{item.count} casos</span>
              </div>
            ))}
          </div>
          <div className="bg-slate-50 p-4 text-center">
            <Link href="/children" className="text-sm font-bold text-[#004A8D] hover:underline">
              Ver lista de crianças
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
                    <div 
                      className="h-full rounded bg-[#004A8D] transition-all duration-1000 ease-out" 
                      style={{ width: animateBars ? `${width}%` : "0%" }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <div className="mb-10">
        <AlertHeatmapCard
          points={heatmap.points}
          updatedAt={heatmap.updated_at || null}
          sidebarOpen={true}
        />
      </div>
    </>
  );
}
