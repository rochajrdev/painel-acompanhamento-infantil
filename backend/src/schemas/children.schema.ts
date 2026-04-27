import { z } from "zod";

const parseBoolean = (value: unknown): boolean | undefined => {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();

    if (normalized === "true") {
      return true;
    }

    if (normalized === "false") {
      return false;
    }
  }

  return undefined;
};

export const childParamsSchema = z.object({
  id: z.string().trim().min(1)
});

export const childrenQuerySchema = z.object({
  q: z.string().trim().min(1).optional(),
  bairro: z.string().trim().min(1).optional(),
  revisado: z.preprocess(parseBoolean, z.boolean().optional()),
  incompleto: z.preprocess(parseBoolean, z.boolean().optional()),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100000).default(10)
});

export type ChildParamsInput = z.infer<typeof childParamsSchema>;
export type ChildrenQueryInput = z.infer<typeof childrenQuerySchema>;

export const childInteractionBodySchema = z.object({
  content: z.string().trim().min(1, "O relato não pode ser vazio"),
  interaction_date: z.string().trim().min(1, "A data da interação é obrigatória")
});

export type ChildInteractionBodyInput = z.infer<typeof childInteractionBodySchema>;

export const updateChildBodySchema = z.object({
  nome: z.string().trim().min(1).optional(),
  data_nascimento: z.string().trim().min(1).optional(),
  bairro: z.string().trim().min(1).optional(),
  responsavel: z.string().trim().min(1).optional(),
  saude: z.record(z.any()).nullable().optional(),
  educacao: z.record(z.any()).nullable().optional(),
  assistencia_social: z.record(z.any()).nullable().optional()
});

export type UpdateChildBodyInput = z.infer<typeof updateChildBodySchema>;