"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { useAuthenticatedFetch } from "@/hooks/useAuthenticatedFetch";
import { Toast } from "@/components/Toast";

export default function ReportsPage() {
  const fetchWithAuth = useAuthenticatedFetch();
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [loadingRiskMap, setLoadingRiskMap] = useState(false);
  const [loadingExcel, setLoadingExcel] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const handleGeneratePdf = async () => {
    setLoadingPdf(true);
    try {
      setToast({ message: "Gerando relatório executivo...", type: "success" });
      const blob = await fetchWithAuth<Blob>("/children/export/pdf");
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `relatorio_executivo_${new Date().toISOString().split("T")[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setToast({ message: "Download concluído!", type: "success" });
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      setToast({ message: "Erro ao gerar o relatório PDF.", type: "error" });
    } finally {
      setLoadingPdf(false);
    }
  };

  const handleGenerateRiskMap = async () => {
    setLoadingRiskMap(true);
    try {
      setToast({ message: "Gerando mapa de risco por bairro...", type: "success" });
      const blob = await fetchWithAuth<Blob>("/children/export/pdf-risk-map");
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `mapa_risco_bairro_${new Date().toISOString().split("T")[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setToast({ message: "Download concluído!", type: "success" });
    } catch (error) {
      console.error("Erro ao gerar Mapa de Risco:", error);
      setToast({ message: "Erro ao gerar o Mapa de Risco.", type: "error" });
    } finally {
      setLoadingRiskMap(false);
    }
  };

  const handleGenerateExcel = async () => {
    setLoadingExcel(true);
    try {
      setToast({ message: "Gerando planilha de vacinas...", type: "success" });
      const blob = await fetchWithAuth<Blob>("/children/export/excel");
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `acompanhamento_vacinal_${new Date().toISOString().split("T")[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setToast({ message: "Download concluído!", type: "success" });
    } catch (error) {
      console.error("Erro ao gerar Excel:", error);
      setToast({ message: "Erro ao gerar a planilha Excel.", type: "error" });
    } finally {
      setLoadingExcel(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <nav className="mb-4 flex text-sm text-[#525F6A]" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <Link href="/dashboard" className="inline-flex items-center hover:text-[#004A8D] dark:hover:text-blue-400 transition-colors">
              <Icon name="dashboard" className="mr-2 h-4 w-4" />
              Início
            </Link>
          </li>
          <li>
            <div className="flex items-center">
              <span className="mx-2 text-slate-400 dark:text-slate-600">/</span>
              <span className="font-semibold text-[#004A8D] dark:text-blue-400">Relatórios</span>
            </div>
          </li>
        </ol>
      </nav>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#00346f] dark:text-blue-400 sm:text-4xl">Central de Relatórios</h1>
        <p className="mt-2 max-w-2xl text-[#525F6A] dark:text-slate-400">
          Gere relatórios executivos consolidados e planilhas dinâmicas para acompanhamento estratégico.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Card PDF Original */}
        <div className="flex flex-col rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm transition-all hover:shadow-md">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
            <Icon name="document" className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Relatório Executivo (PDF)</h2>
          <p className="mt-2 flex-grow text-sm text-slate-600 dark:text-slate-400">
            Relatório detalhado. Contém o panorama geral de crianças cadastradas, distribuição geral de alertas por secretarias e a lista com o nome e bairro dos 15 casos mais urgentes.
          </p>
          <button
            onClick={handleGeneratePdf}
            disabled={loadingPdf}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#004A8D] dark:bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#00346f] dark:hover:bg-blue-700 disabled:opacity-50"
          >
            {loadingPdf ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                Processando...
              </>
            ) : (
              <>
                <Icon name="download" className="h-4 w-4" />
                Gerar Relatório
              </>
            )}
          </button>
        </div>

        {/* Card PDF Risk Map */}
        <div className="flex flex-col rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm transition-all hover:shadow-md">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">
            <Icon name="document" className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Mapa de Risco por Bairro (PDF)</h2>
          <p className="mt-2 flex-grow text-sm text-slate-600 dark:text-slate-400">
            Relatório focado em territorialidade. Apresenta um gráfico de barras com a densidade de alertas por região e ranqueia os bairros mais críticos da cidade.
          </p>
          <button
            onClick={handleGenerateRiskMap}
            disabled={loadingRiskMap}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-orange-700 disabled:opacity-50"
          >
            {loadingRiskMap ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                Processando...
              </>
            ) : (
              <>
                <Icon name="download" className="h-4 w-4" />
                Gerar Mapa
              </>
            )}
          </button>
        </div>

        {/* Card Excel */}
        <div className="flex flex-col rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm transition-all hover:shadow-md">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
            <Icon name="document" className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Acompanhamento de Vacinas (Excel)</h2>
          <p className="mt-2 flex-grow text-sm text-slate-600 dark:text-slate-400">
            Planilha dinâmica com todas as crianças cadastradas. Inclui formatação condicional que destaca automaticamente em vermelho os casos com "vacina atrasada" no campo de saúde.
          </p>
          <button
            onClick={handleGenerateExcel}
            disabled={loadingExcel}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
          >
            {loadingExcel ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                Processando Planilha...
              </>
            ) : (
              <>
                <Icon name="download" className="h-4 w-4" />
                Gerar Planilha Excel
              </>
            )}
          </button>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}
