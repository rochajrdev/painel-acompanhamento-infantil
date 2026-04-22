export interface SaudeData {
  ultima_consulta: string | null;
  vacinas_em_dia: boolean | null;
  alertas: string[];
}

export interface EducacaoData {
  escola: string | null;
  frequencia_percent: number | null;
  alertas: string[];
}

export interface AssistenciaSocialData {
  cad_unico: boolean | null;
  beneficio_ativo: boolean | null;
  alertas: string[];
}

export interface ChildRecord {
  id: string;
  nome: string;
  data_nascimento: string;
  bairro: string;
  responsavel: string;
  saude: SaudeData | null;
  educacao: EducacaoData | null;
  assistencia_social: AssistenciaSocialData | null;
  revisado: boolean;
  revisado_por: string | null;
  revisado_em: string | null;
}