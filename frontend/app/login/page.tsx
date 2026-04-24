"use client";

import Image from "next/image";
import { Public_Sans } from "next/font/google";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Toast } from "@/components/Toast";
import prefeituraIcon from "@/assets/prefeitura-icon.png";

const publicSans = Public_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"]
});

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading: authLoading, error, isAuthenticated } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const success = await login(username, password);

    if (success) {
      setToast({ message: "Login realizado!", type: "success" });
      router.replace("/dashboard");
    } else {
      setToast({ message: error || "Erro ao fazer login", type: "error" });
    }

    setSubmitting(false);
  };

  return (
    <main className={`${publicSans.className} relative min-h-[max(884px,100dvh)] overflow-hidden bg-[#00346f] p-4 text-[#0b1c30]`}>

      <div className="mx-auto flex min-h-[calc(max(884px,100dvh)-32px)] w-full max-w-[420px] items-center justify-center">
        <main className="w-full">
          <div className="mb-8 flex flex-col items-center text-center text-white">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/70">
              Plataforma de campo
            </p>
            <h1 className="mt-4 text-center text-3xl font-bold leading-[1.05] tracking-[-0.03em] text-white sm:text-4xl">
              Painel de Acompanhamento Infantil
            </h1>
          </div>

          <div className="rounded-[24px] border border-white/15 bg-white p-8 shadow-xl">
            <div className="mb-6">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#3e5f92]">
                Login Técnico
              </p>
              <p className="mt-2 text-sm leading-6 text-[#424751]">
                Use as credenciais institucionais para acessar as tarefas do dia.
              </p>
            </div>

            {error && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1">
                <label htmlFor="username" className="text-[14px] font-semibold leading-5 tracking-[0.02em] text-[#0b1c30]">
                  Email Corporativo
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#737783]" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                      <path d="M4 6h16v12H4z" />
                      <path d="m4 8 8 6 8-6" />
                    </svg>
                  </span>
                  <input
                    id="username"
                    name="email"
                    type="email"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="nome.sobrenome@rio.rj.gov.br"
                    className="h-12 w-full rounded-[4px] border border-[#c2c6d3] bg-transparent pl-11 pr-4 text-[16px] leading-6 text-[#0b1c30] outline-none transition-all placeholder:text-[#737783] focus:border-[#00346f] focus:ring-2 focus:ring-[#00346f]"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-[14px] font-semibold leading-5 tracking-[0.02em] text-[#0b1c30]">
                    Senha
                  </label>
                  <a href="#" className="text-[14px] font-semibold leading-5 tracking-[0.02em] text-[#00346f] hover:underline">
                    Esqueci a senha
                  </a>
                </div>
                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#737783]" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                      <rect x="5" y="11" width="14" height="10" rx="2" />
                      <path d="M8 11V8a4 4 0 1 1 8 0v3" />
                    </svg>
                  </span>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-12 w-full rounded-[4px] border border-[#c2c6d3] bg-transparent pl-11 pr-4 text-[16px] leading-6 text-[#0b1c30] outline-none transition-all placeholder:text-[#737783] focus:border-[#00346f] focus:ring-2 focus:ring-[#00346f]"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading || submitting}
                className="group flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#00346f] px-4 text-[14px] font-semibold uppercase tracking-[0.08em] text-white shadow-[0_12px_30px_-18px_rgba(0,52,111,0.9)] transition duration-200 ease-out hover:bg-[#094a99] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span>{authLoading ? "Carregando..." : submitting ? "Entrando..." : "Entrar"}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-[18px] w-[18px] transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true">
                  <path d="M10 17 15 12 10 7" />
                  <path d="M15 12H3" />
                </svg>
              </button>
            </form>

            <div className="mt-8 border-t border-[#e5eeff] pt-6 text-center">
              <p className="text-[14px] leading-6 text-[#424751]">
                Problemas técnicos? Entre em contato com a equipe de TI para suporte.
              </p>
            </div>
          </div>

          <footer className="mt-8 text-center">
            <div className="mb-2 flex items-center justify-center">
              <Image src={prefeituraIcon} alt="Logo Prefeitura" className="h-8 w-auto" />
            </div>
          </footer>
        </main>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </main>
  );
}