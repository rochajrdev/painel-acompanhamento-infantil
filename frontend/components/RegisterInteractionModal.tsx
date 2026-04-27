import React, { useState } from 'react';

interface RegisterInteractionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (content: string, interactionDate: string) => void;
  isSubmitting: boolean;
}

export function RegisterInteractionModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting
}: RegisterInteractionModalProps) {
  const [content, setContent] = useState('');
  const [interactionDate, setInteractionDate] = useState(new Date().toISOString().split('T')[0]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    onSubmit(content, interactionDate);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl dark:bg-slate-900 animate-in fade-in zoom-in-95 duration-200">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Registrar Acompanhamento
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Descreva o que ocorreu na interação (Prontuário Social).
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Data da Interação
            </label>
            <input
              type="date"
              required
              value={interactionDate}
              onChange={(e) => setInteractionDate(e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Relato do Acompanhamento
            </label>
            <textarea
              required
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Ex: Visita domiciliar realizada..."
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 resize-none"
            />
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !content.trim()}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Salvando...' : 'Confirmar e Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
