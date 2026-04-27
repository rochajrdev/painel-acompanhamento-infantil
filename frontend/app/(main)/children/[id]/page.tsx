"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useAuthenticatedFetch } from "@/hooks/useAuthenticatedFetch";
import { Toast } from "@/components/Toast";
import { RegisterInteractionModal } from "@/components/RegisterInteractionModal";

interface ChildInteraction {
  id: string;
  child_id: string;
  technician_name: string;
  content: string;
  interaction_date: string;
  created_at: string;
}

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
  const [interactions, setInteractions] = useState<ChildInteraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
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

        // Fetch interactions history
        const interactionsData = await fetchWithAuth<ChildInteraction[]>(`/children/${id}/interactions`, {
          method: "GET"
        });
        setInteractions(interactionsData);
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

  const handleAddInteraction = async (content: string, interactionDate: string) => {
    if (!child) return;

    setReviewing(true);
    try {
      const newInteraction = await fetchWithAuth<ChildInteraction>(`/children/${child.id}/interactions`, {
        method: "POST",
        body: JSON.stringify({
          content,
          interaction_date: interactionDate
        })
      });

      setToast({ message: "Acompanhamento registrado com sucesso!", type: "success" });
      
      // Update local state
      setInteractions(prev => [newInteraction, ...prev]);
      setChild(prev => prev ? { ...prev, revisado_em: new Date().toISOString() } : null);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Erro ao registrar acompanhamento:", error);
      const message = error instanceof Error ? error.message : "Erro ao registrar acompanhamento";
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
            Ação Necessária
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

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        {renderDetails(child.saude, "Saúde")}
        {renderDetails(child.educacao, "Educação")}
        {renderDetails(child.assistencia_social, "Assistência")}
      </div>

      {!child.revisado_em && (
        <div className="mt-6 mb-8">
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full rounded-lg bg-[#004A8D] dark:bg-blue-600 px-6 py-3 font-medium text-white shadow-sm transition-colors hover:bg-[#00346f] dark:hover:bg-blue-700"
          >
            Marcar como Revisado
          </button>
        </div>
      )}

      <div className="mt-8 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-6 py-4 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Prontuário Social</h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="rounded-lg bg-[#004A8D] dark:bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#00346f] dark:hover:bg-blue-700"
          >
            Registrar Acompanhamento
          </button>
        </div>
        
        <div className="p-6">
          {interactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-slate-500 dark:text-slate-400">Nenhum acompanhamento registrado para esta criança.</p>
            </div>
          ) : (
            <div className="relative border-l-2 border-slate-200 dark:border-slate-700 ml-3 space-y-8">
              {interactions.map((interaction) => (
                <div key={interaction.id} className="relative pl-6">
                  <div className="absolute -left-[9px] top-1.5 h-4 w-4 rounded-full border-2 border-white bg-blue-500 dark:border-slate-900 dark:bg-blue-400" />
                  <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3 mb-1">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      Técnico {interaction.technician_name}
                    </span>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      {new Date(interaction.interaction_date + 'T12:00:00Z').toLocaleDateString()}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700 whitespace-pre-wrap">
                    {interaction.content}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <RegisterInteractionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddInteraction}
        isSubmitting={reviewing}
      />

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}