"use client";

import { Public_Sans } from "next/font/google";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { decodeJWT } from "@/lib/jwt-utils";
import { Icon } from "@/components/Icon";
import { ThemeToggle } from "@/components/ThemeToggle";

const publicSans = Public_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"]
});

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { token, isAuthenticated, isLoading: authLoading, isExpired, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const preferredUsername = useMemo(() => {
    if (!token) return "tecnico@prefeitura.rio";
    const payload = decodeJWT(token);
    return typeof payload.preferred_username === "string"
      ? payload.preferred_username
      : "tecnico@prefeitura.rio";
  }, [token]);

  useEffect(() => {
    if (authLoading) return;
    if (isExpired || !isAuthenticated) {
      router.replace("/login");
    }
  }, [authLoading, isAuthenticated, isExpired, router]);

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  const toggleSidebar = () => {
    setIsSidebarOpen((current) => !current);
  };

  if (authLoading || isExpired || !isAuthenticated) {
    return (
      <div className={`${publicSans.className} min-h-screen bg-[#f9f9ff]`}></div>
    );
  }

  const isDashboardActive = pathname === "/dashboard";
  const isChildrenActive = pathname?.startsWith("/children");

  return (
    <div className={`${publicSans.className} min-h-screen bg-[#f9f9ff] dark:bg-slate-900 text-[#191c21] dark:text-slate-100 antialiased transition-colors duration-300`}>
      <header className="fixed top-0 z-50 flex h-16 w-full items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 sm:px-6 transition-colors duration-300">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label={isSidebarOpen ? "Recolher menu lateral" : "Expandir menu lateral"}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Icon name={isSidebarOpen ? "close" : "menu"} className="h-5 w-5" />
          </button>
          <span className="truncate text-base font-extrabold tracking-tight text-[#004A8D] dark:text-blue-400 sm:text-xl">
            Prefeitura do Rio de Janeiro
          </span>
          <span className="hidden h-6 w-px bg-slate-200 dark:bg-slate-700 sm:block" />
          <span className="hidden truncate text-sm font-medium text-slate-500 dark:text-slate-400 md:block">
            Painel de Acompanhamento Infantil
          </span>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <ThemeToggle />
          <div className="hidden items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-slate-600 dark:text-slate-300 sm:flex">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <Icon name="user" className="h-3.5 w-3.5" />
            </span>
            <span>{preferredUsername}</span>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-lg px-3 py-2 text-sm font-semibold text-[#004A8D] dark:text-blue-400 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 sm:px-4"
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
        className={`fixed left-0 top-16 z-40 h-[calc(100vh-64px)] w-64 border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 py-8 transition-all duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <nav className="mt-8 space-y-1">
          <Link
            href="/dashboard"
            className={`flex items-center gap-3 px-6 py-4 font-semibold transition-colors ${
              isDashboardActive
                ? "border-r-4 border-[#004A8D] dark:border-blue-500 bg-white dark:bg-slate-800 text-[#004A8D] dark:text-blue-400"
                : "text-[#525F6A] dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#004A8D] dark:hover:text-blue-300"
            }`}
          >
            <span className={`inline-flex h-6 w-6 items-center justify-center rounded text-xs ${
              isDashboardActive ? "bg-blue-100 dark:bg-blue-900/50" : "bg-slate-200 dark:bg-slate-800"
            }`}>
              <Icon name="dashboard" className="h-3.5 w-3.5" />
            </span>
            Painel de Monitoramento
          </Link>
          <Link
            href="/children"
            className={`flex items-center gap-3 px-6 py-4 font-semibold transition-colors ${
              isChildrenActive
                ? "border-r-4 border-[#004A8D] dark:border-blue-500 bg-white dark:bg-slate-800 text-[#004A8D] dark:text-blue-400"
                : "text-[#525F6A] dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#004A8D] dark:hover:text-blue-300"
            }`}
          >
            <span className={`inline-flex h-6 w-6 items-center justify-center rounded text-xs ${
              isChildrenActive ? "bg-blue-100 dark:bg-blue-900/50" : "bg-slate-200 dark:bg-slate-800"
            }`}>
              <Icon name="children" className="h-3.5 w-3.5" />
            </span>
            Crianças
          </Link>
        </nav>
      </aside>

      <main className={`px-4 pb-12 pt-24 transition-all duration-300 sm:px-6 lg:px-8 ${isSidebarOpen ? "lg:ml-64" : "lg:ml-0"}`}>
        <div className="mx-auto max-w-[1280px]">
          {children}

          <footer className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-slate-200 dark:border-slate-800 py-8 text-xs text-slate-400 dark:text-slate-500 md:flex-row md:items-center">
            <div className="flex flex-wrap items-center gap-4">
              <p>© Prefeitura do Rio | 2026 | v1.0</p>
              <div className="flex gap-4">
                <span>Termos de Uso</span>
                <span>Privacidade</span>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="font-medium text-slate-600 dark:text-slate-300">Sistema operacional</span>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
