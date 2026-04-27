"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useAuthenticatedFetch } from "@/hooks/useAuthenticatedFetch";
import { Toast } from "@/components/Toast";

interface ChildDetail {
  id: string;
  nome: string;
  data_nascimento: string;
  bairro: string;
  revisado_em: string | null;
  saude: Record<string, any> | null;
  educacao: Record<string, any> | null;
  assistencia_social: Record<string, any> | null;
}

export default function ChildDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated, isLoading: authLoading, isExpired } = useAuth();
  const fetchWithAuth = useAuthenticatedFetch();
  const [child, setChild] = useState<ChildDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const id = params.id as string;

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

    const fetchChild = async () => {
      try {
        const data = await fetchWithAuth<ChildDetail>(`/children/${id}`, {
          method: "GET"
        });
        setChild(data);
      } catch (error) {
        console.error("Erro ao carregar criança:", error);
        const message = error instanceof Error ? error.message : "Erro ao carregar criança";
        setToast({ message, type: "error" });
      } finally {
        setLoading(false);
      }
    };

    fetchChild();
  }, [authLoading, isAuthenticated, isExpired, id, fetchWithAuth, router]);

  const handleReview = async () => {
    if (!child) return;

    setReviewing(true);
    try {
      await fetchWithAuth(`/children/${child.id}/review`, {
        method: "PATCH"
      });
      setToast({ message: "Criança revisada com sucesso!", type: "success" });
      setChild(prev => prev ? { ...prev, revisado_em: new Date().toISOString() } : null);
    } catch (error) {
      console.error("Erro ao revisar criança:", error);
      const message = error instanceof Error ? error.message : "Erro ao revisar criança";
      setToast({ message, type: "error" });
    } finally {
      setReviewing(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-2xl flex-col items-center justify-center px-4">
        <p className="text-slate-500 dark:text-slate-400">Carregando...</p>
      </div>
    );
  }

  if (!child) {
    return (
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-2xl flex-col items-center justify-center px-4">
        <p className="text-slate-500 dark:text-slate-400">Criança não encontrada</p>
        <Link href="/children" className="mt-4 text-blue-600 dark:text-blue-400 hover:underline">
          Voltar
        </Link>
      </div>
    );
  }

  const renderDetails = (data: Record<string, any> | null, title: string) => {
    if (!data) {
      return (
        <div className="rounded-lg border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-6 text-center shadow-sm">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">{title}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Nenhum dado registrado para esta área.</p>
          <span className="mt-3 inline-block rounded bg-orange-100 dark:bg-orange-900/30 px-2.5 py-0.5 text-xs font-medium text-orange-800 dark:text-orange-400">
            Ação Requerida
          </span>
        </div>
      );
    }

    return (
      <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
        <div className="mt-2 space-y-2 text-sm">
          {Object.entries(data).map(([key, value]) => {
            if (key === 'alertas' && Array.isArray(value)) {
               return (
                 <div key={key} className="flex justify-between text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-2 mt-2">
                   <span className="capitalize">Alertas:</span>
                   <span className="font-medium text-amber-600 dark:text-amber-500 text-right">
                     {value.length > 0 ? value.map(v => String(v).replace(/_/g, " ")).join(", ") : "Nenhum"}
                   </span>
                 </div>
               );
            }
            return (
              <div key={key} className="flex justify-between text-slate-600 dark:text-slate-400">
                <span className="capitalize">{key.replace(/_/g, " ")}:</span>
                <span className="font-medium text-slate-900 dark:text-slate-200">
                  {typeof value === "boolean" ? (value ? "Sim" : "Não") : String(value)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="mx-auto w-full max-w-2xl py-8 animate-in fade-in duration-500">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[#00346f] dark:text-blue-400">{child.nome}</h1>
        <Link
          href="/children"
          className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 shadow-sm transition-colors hover:bg-slate-50 dark:hover:bg-slate-700"
        >
          Voltar
        </Link>
      </div>

      <div className="mb-6 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Idade</p>
            <p className="text-xl font-semibold text-slate-900 dark:text-slate-100">{getIdade(child.data_nascimento)} anos</p>
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Bairro</p>
            <p className="text-xl font-semibold text-slate-900 dark:text-slate-100">{child.bairro}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Status</p>
            <p className={`text-xl font-semibold ${child.revisado_em ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-500"}`}>
              {child.revisado_em ? "✓ Revisado" : "◦ Pendente de revisão"}
            </p>
          </div>
          {child.revisado_em && (
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Revisado em</p>
              <p className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                {new Date(child.revisado_em).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {renderDetails(child.saude, "Saúde")}
        {renderDetails(child.educacao, "Educação")}
        {renderDetails(child.assistencia_social, "Assistência")}
      </div>

      {!child.revisado_em && (
        <div className="mt-6">
          <button
            onClick={handleReview}
            disabled={reviewing}
            className="w-full rounded-lg bg-[#004A8D] dark:bg-blue-600 px-6 py-3 font-medium text-white shadow-sm transition-colors hover:bg-[#00346f] dark:hover:bg-blue-700 disabled:opacity-50"
          >
            {reviewing ? "Revisando..." : "Marcar como Revisado"}
          </button>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}