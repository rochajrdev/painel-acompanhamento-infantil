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
      <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col items-center justify-center px-4">
        <p className="text-slate-500">Carregando...</p>
      </main>
    );
  }

  if (!child) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col items-center justify-center px-4">
        <p className="text-slate-500">Criança não encontrada</p>
        <Link href="/children" className="mt-4 text-blue-600 hover:underline">
          Voltar
        </Link>
      </main>
    );
  }

  const renderDetails = (data: Record<string, any> | null, title: string) => {
    if (!data) return null;

    return (
      <div className="rounded-lg bg-white p-4 shadow-md">
        <h3 className="font-semibold text-slate-900">{title}</h3>
        <div className="mt-2 space-y-2 text-sm">
          {Object.entries(data).map(([key, value]) => (
            <div key={key} className="flex justify-between text-slate-600">
              <span className="capitalize">{key.replace(/_/g, " ")}:</span>
              <span className="font-medium text-slate-900">
                {typeof value === "boolean" ? (value ? "Sim" : "Não") : String(value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">{child.nome}</h1>
        <Link
          href="/children"
          className="rounded bg-slate-600 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          Voltar
        </Link>
      </div>

      <div className="mb-6 rounded-lg bg-white p-6 shadow-md">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm text-slate-500">Idade</p>
            <p className="text-xl font-semibold text-slate-900">{getIdade(child.data_nascimento)} anos</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Bairro</p>
            <p className="text-xl font-semibold text-slate-900">{child.bairro}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Status</p>
            <p className={`text-xl font-semibold ${child.revisado_em ? "text-green-600" : "text-orange-600"}`}>
              {child.revisado_em ? "✓ Revisado" : "◦ Pendente de revisão"}
            </p>
          </div>
          {child.revisado_em && (
            <div>
              <p className="text-sm text-slate-500">Revisado em</p>
              <p className="text-xl font-semibold text-slate-900">
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
            className="w-full rounded bg-green-600 px-6 py-3 font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            {reviewing ? "Revisando..." : "Marcar como Revisado"}
          </button>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} />}
    </main>
  );
}