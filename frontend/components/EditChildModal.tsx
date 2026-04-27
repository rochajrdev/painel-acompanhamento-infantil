import React, { useState, useEffect } from 'react';
import { Icon } from './Icon';

interface ChildDetail {
  id: string;
  nome: string;
  data_nascimento: string;
  bairro: string;
  responsavel: string;
  saude: any;
  educacao: any;
  assistencia_social: any;
}

interface EditChildModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<ChildDetail>) => void;
  isSubmitting: boolean;
  initialData: ChildDetail;
  initialTab?: 'geral' | 'saude' | 'educacao' | 'assistencia';
}

export function EditChildModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  initialData,
  initialTab = 'geral'
}: EditChildModalProps) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [formData, setFormData] = useState<Partial<ChildDetail>>({});

  useEffect(() => {
    if (isOpen) {
      setFormData(initialData);
      setActiveTab(initialTab);
    }
  }, [isOpen, initialData, initialTab]);

  if (!isOpen) return null;

  const handleChange = (path: string, value: any) => {
    const parts = path.split('.');
    if (parts.length === 1) {
      setFormData(prev => ({ ...prev, [parts[0]]: value }));
    } else {
      const area = parts[0] as keyof ChildDetail;
      const field = parts[1];
      setFormData(prev => ({
        ...prev,
        [area]: {
          ...(prev[area] || {}),
          [field]: value
        }
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const tabs = [
    { id: 'geral', label: 'Geral', icon: 'users' },
    { id: 'saude', label: 'Saúde', icon: 'health' },
    { id: 'educacao', label: 'Educação', icon: 'education' },
    { id: 'assistencia', label: 'Assistência', icon: 'social' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-lg bg-white shadow-xl dark:bg-slate-900 animate-in fade-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Editar Cadastro
            </h2>
            <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
              <Icon name="dashboard" className="h-5 w-5 rotate-45" /> {/* Close icon using rotate dashboard as X */}
            </button>
          </div>
        </div>

        <div className="flex border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 bg-white dark:bg-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <Icon name={tab.icon as any} className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'geral' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Nome Completo</label>
                <input
                  type="text"
                  value={formData.nome || ''}
                  onChange={(e) => handleChange('nome', e.target.value)}
                  className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Data de Nascimento</label>
                <input
                  type="date"
                  value={formData.data_nascimento || ''}
                  onChange={(e) => handleChange('data_nascimento', e.target.value)}
                  className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Bairro</label>
                <input
                  type="text"
                  value={formData.bairro || ''}
                  onChange={(e) => handleChange('bairro', e.target.value)}
                  className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Responsável</label>
                <input
                  type="text"
                  value={formData.responsavel || ''}
                  onChange={(e) => handleChange('responsavel', e.target.value)}
                  className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                />
              </div>
            </div>
          )}

          {activeTab === 'saude' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Última Consulta</label>
                <input
                  type="date"
                  value={formData.saude?.ultima_consulta || ''}
                  onChange={(e) => handleChange('saude.ultima_consulta', e.target.value)}
                  className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="vacinas"
                  checked={formData.saude?.vacinas_em_dia || false}
                  onChange={(e) => handleChange('saude.vacinas_em_dia', e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="vacinas" className="text-sm font-medium text-slate-700 dark:text-slate-300">Vacinas em dia</label>
              </div>
            </div>
          )}

          {activeTab === 'educacao' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Escola / Creche</label>
                <input
                  type="text"
                  value={formData.educacao?.escola || ''}
                  onChange={(e) => handleChange('educacao.escola', e.target.value)}
                  className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Frequência Escolar (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.educacao?.frequencia_percent || ''}
                  onChange={(e) => handleChange('educacao.frequencia_percent', Number(e.target.value))}
                  className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                />
              </div>
            </div>
          )}

          {activeTab === 'assistencia' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Número CadÚnico</label>
                <input
                  type="text"
                  value={formData.assistencia_social?.cad_unico || ''}
                  onChange={(e) => handleChange('assistencia_social.cad_unico', e.target.value)}
                  className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="beneficio"
                  checked={formData.assistencia_social?.beneficio_ativo || false}
                  onChange={(e) => handleChange('assistencia_social.beneficio_ativo', e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="beneficio" className="text-sm font-medium text-slate-700 dark:text-slate-300">Benefício Ativo (Bolsa Família, etc)</label>
              </div>
            </div>
          )}
        </form>

        <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 shadow-sm disabled:opacity-50"
          >
            {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </div>
    </div>
  );
}
