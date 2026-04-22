import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-semibold">Painel de Acompanhamento Infantil</h1>
      <Link
        href="/login"
        className="rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white"
      >
        Ir para login
      </Link>
    </main>
  );
}