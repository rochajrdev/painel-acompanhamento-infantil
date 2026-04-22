interface ChildDetailPageProps {
  params: {
    id: string;
  };
}

export default function ChildDetailPage({ params }: ChildDetailPageProps) {
  return (
    <main className="mx-auto w-full max-w-6xl p-4">
      <h1 className="text-xl font-semibold">Detalhe da criança {params.id}</h1>
    </main>
  );
}